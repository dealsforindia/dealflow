import asyncio
import gzip
import json
import time
import unittest
from decimal import Decimal
from unittest.mock import AsyncMock

from commerce_engine.categories import candidate_matches, normalize_product
from commerce_engine.engine import CommerceEngine
from commerce_engine.models import Availability, ProductSnapshot, RegionContext
from commerce_engine.network import FetchConfig, FetchError, SafeFetcher
from commerce_engine.parser import parse_product_html
from commerce_engine.query import query_matches, understand_query
from commerce_engine.structured import availability
from tests.helpers import FakeFetcher, URL, product_html
from tests.test_parser import embedded
from tests.test_urls_network import Response, Session


class ExtractionRegressions(unittest.TestCase):
    def test_rupee_symbol_survives_html_without_charset_meta(self):
        markup = '<html><h1 id="productTitle">Phone</h1><span class="priceToPay"><span class="a-offscreen">₹999</span></span><div id="availability">In stock</div></html>'
        snapshot = parse_product_html(markup, URL, is_live=True)
        self.assertEqual(snapshot.sale_price, Decimal("999.00"))
        self.assertTrue(snapshot.publishable)

    def test_not_available_is_not_available(self):
        self.assertEqual(availability("Not available"), Availability.OUT_OF_STOCK)
        self.assertEqual(availability("Available from next month"), Availability.UNKNOWN)
        self.assertEqual(availability("PreOrder"), Availability.UNKNOWN)

    def test_title_conflict_invalidates_verification(self):
        markup = product_html(name="iPhone 16 128GB Black", dom='<h1 id="productTitle">iPhone 16 256GB Black</h1>')
        snapshot = parse_product_html(markup, URL, is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("TITLE_CONFLICT", [i.code for i in snapshot.issues])

    def test_explicit_variant_query_selects_exact_embedded_variant(self):
        data = {"product": {"name": "Cotton Shirt", "isAvailable": True,
                "variants": [{"id": "one", "price": 500, "size": "S"}, {"id": "two", "price": 600, "size": "M"}]}}
        snapshot = parse_product_html(embedded(data), "https://www.myntra.com/shirt/123/buy?variant=two", is_live=True)
        self.assertTrue(snapshot.publishable)
        self.assertEqual(snapshot.sale_price, Decimal("600.00"))
        self.assertEqual(snapshot.attributes["size"], "M")

    def test_requested_size_not_present_in_product_data(self):
        url = URL + "?size=M"
        snapshot = parse_product_html(product_html(url=url), url, is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("VARIANT_UNCONFIRMED", [i.code for i in snapshot.issues])

    def test_postcode_request_needs_response_confirmation_for_all_merchants(self):
        snapshot = parse_product_html(product_html(), URL, is_live=True, context=RegionContext(postal_code="700001"))
        self.assertFalse(snapshot.publishable)
        self.assertIn("REGION_REQUIRED", [i.code for i in snapshot.issues])

    def test_equal_quantity_different_units_are_compatible(self):
        snapshot = ProductSnapshot("Example", "https://example.com/", title="Milk 1l")
        normalize_product(snapshot, {})
        self.assertTrue(candidate_matches("Milk 1000ml", snapshot)[0])

    def test_declared_total_multipack_quantity_is_not_multiplied_again(self):
        snapshot = ProductSnapshot("Example", "https://example.com/", title="Salt 1kg pack of 3", sale_price=Decimal("90"), currency="INR")
        normalize_product(snapshot, {"additionalProperty": [{"name": "Net quantity", "value": "3kg"}]})
        self.assertEqual(snapshot.attributes["total_quantity"], Decimal("3000"))
        self.assertEqual(snapshot.attributes["pack_count"], 3)
        self.assertEqual(snapshot.unit_price["price"], Decimal("3.00"))

    def test_non_five_star_rating_not_misrepresented(self):
        snapshot = parse_product_html(product_html(extra={"aggregateRating": {"ratingValue": 4, "bestRating": 10}}), URL)
        self.assertIsNone(snapshot.rating)
        self.assertIn("UNSUPPORTED_RATING_SCALE", [i.code for i in snapshot.issues])

    def test_malformed_script_does_not_crash_dom_parser(self):
        markup = '<html><script id="__NEXT_DATA__">{"props": invalid}</script><h1 id="productTitle">Phone</h1><span class="priceToPay"><span class="a-offscreen">₹999</span></span><div id="availability">In stock</div></html>'
        self.assertTrue(parse_product_html(markup, URL, is_live=True).publishable)

    def test_expired_price_is_not_verified(self):
        offer = {"price": "999", "priceCurrency": "INR", "availability": "InStock", "priceValidUntil": "2001-01-01"}
        snapshot = parse_product_html(product_html(extra={"offers": offer}), URL, is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("EXPIRED_PRICE", [i.code for i in snapshot.issues])

    def test_conditional_member_offer_is_not_regular_price(self):
        offer = {"price": "999", "priceCurrency": "INR", "availability": "InStock", "membershipRequired": True}
        self.assertFalse(parse_product_html(product_html(extra={"offers": offer}), URL, is_live=True).price_verified)


class QueryTests(unittest.TestCase):
    def test_budget_understanding(self):
        intent = understand_query("iphone 16 128GB black under ₹60,000", RegionContext())
        self.assertEqual(intent.max_price, Decimal("60000.00"))
        self.assertEqual(intent.model_generation, "16")
        self.assertEqual(intent.attributes["storage"], "128GB")
        self.assertEqual(intent.currency, "INR")

    def test_model_or_variant_mismatch_rejected(self):
        intent = understand_query("iphone 16 128GB black", RegionContext())
        product = parse_product_html(product_html(name="iPhone 16 256GB Black"), URL, is_live=True)
        self.assertFalse(query_matches(intent, product)[0])

    def test_unconfirmed_requested_attribute_rejected(self):
        intent = understand_query("phone 128GB", RegionContext())
        product = parse_product_html(product_html(name="Phone"), URL, is_live=True)
        self.assertFalse(query_matches(intent, product)[0])

    def test_price_budget_uses_live_not_listing_price(self):
        intent = understand_query("phone under ₹1000", RegionContext())
        product = parse_product_html(product_html(), URL, is_live=True)
        self.assertFalse(query_matches(intent, product)[0])

    def test_foreign_currency_budget_is_not_converted_implicitly(self):
        intent = understand_query("phone under USD 100", RegionContext())
        product = parse_product_html(product_html(), URL, is_live=True)
        self.assertFalse(query_matches(intent, product)[0])


class NetworkRegressions(unittest.IsolatedAsyncioTestCase):
    async def test_gzip_expansion_is_bounded(self):
        response = Response([gzip.compress(b"x" * 100000)])
        response.headers["content-encoding"] = "gzip"
        fetcher = SafeFetcher(FetchConfig(max_bytes=1024, min_interval=0))
        fetcher._session = Session(response)
        with self.assertRaises(FetchError) as caught:
            await fetcher.fetch("https://example.com/")
        self.assertEqual(caught.exception.code, "RESPONSE_TOO_LARGE")

    async def test_valid_gzip_is_decoded(self):
        response = Response([gzip.compress(b"<html>hello</html>")])
        response.headers["content-encoding"] = "gzip"
        fetcher = SafeFetcher(FetchConfig(min_interval=0))
        fetcher._session = Session(response)
        result = await fetcher.fetch("https://example.com/")
        self.assertEqual(result.body, "<html>hello</html>")

    async def test_circuit_open_rejections_do_not_extend_cooldown(self):
        fetcher = SafeFetcher()
        state = fetcher._states["example.com"]
        state.open_until = time.monotonic() + 30
        original = state.open_until
        fetcher._session = Session(Response([b"hello"]))
        with self.assertRaises(FetchError) as caught:
            await fetcher.fetch("https://example.com/")
        self.assertEqual(caught.exception.code, "CIRCUIT_OPEN")
        self.assertEqual(state.open_until, original)

    async def test_bad_url_returns_failure_instead_of_crashing_failure_formatter(self):
        engine = CommerceEngine(fetcher=FakeFetcher({}))
        snapshot = await engine.lookup("http://[")
        self.assertFalse(snapshot.publishable)
        self.assertEqual(snapshot.issues[0].code, "UNSAFE_URL")
