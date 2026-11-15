import asyncio
import json
import tempfile
import unittest
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from commerce_engine.cache import TTLCache
from commerce_engine.discovery import StaticProvider, parse_discovery_html
from commerce_engine.engine import CommerceEngine
from commerce_engine.history import HistoryStore, observation_key
from commerce_engine.models import RegionContext, ShoppingCandidate, utcnow
from commerce_engine.network import FetchError
from commerce_engine.parser import parse_product_html
from google_shopping import search_google_shopping
from store_scraper import scrape_product_live
from tests.helpers import FakeFetcher, URL, product_html


class DiscoveryTests(unittest.TestCase):
    def test_dom_card_does_not_pick_delivery_fee(self):
        markup = '''<html><div class="sh-dgr__content"><h3>Phone 128GB Black</h3>
        <a href="/url?q=https%3A%2F%2Fwww.amazon.in%2Fdp%2FB012345678">Visit</a>
        <span>Delivery ₹49</span><span class="a8Pemb">₹1,499.00</span></div></html>'''
        candidates = parse_discovery_html(markup)
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0].discovered_price, Decimal("1499.00"))

    def test_bing_seller_badge_does_not_fabricate_product_url(self):
        markup = '<html><div class="br-item"><h3>Phone 128GB</h3><span class="br-price">₹999</span><span class="br-sellerName">Amazon</span></div></html>'
        self.assertEqual(parse_discovery_html(markup, source="bing_shopping", base_url="https://www.bing.com/shop"), [])

    def test_unsupported_merchant_and_search_links_rejected(self):
        markup = '<html><div class="sh-dgr__content"><h3>Phone 128GB</h3><a href="https://www.amazon.in/s?k=phone">search</a><a href="https://evil.com/product">visit</a></div></html>'
        self.assertEqual(parse_discovery_html(markup), [])


class PipelineTests(unittest.IsolatedAsyncioTestCase):
    async def test_live_verification_replaces_listing_price(self):
        candidate = ShoppingCandidate("Test Phone 128GB Black", URL, "Amazon", Decimal("4"))
        fetcher = FakeFetcher({URL: product_html(price="1499")})
        async with CommerceEngine(fetcher=fetcher, providers=[StaticProvider([candidate])]) as engine:
            result = await engine.search("phone")
        product = result["results"][0]
        self.assertEqual(product["price"], "1499.00")
        self.assertEqual(product["discovered_price"], "4")
        self.assertTrue(product["price_verified"])
        self.assertEqual(result["verified_total"], 1)

    async def test_discovery_cache_still_refetches_merchant(self):
        candidate = ShoppingCandidate("Test Phone 128GB Black", URL, "Amazon", Decimal("999"))
        fetcher = FakeFetcher({URL: product_html(price="1499")})
        engine = CommerceEngine(fetcher=fetcher, providers=[StaticProvider([candidate])])
        first = await engine.search("phone")
        fetcher.pages[URL] = product_html(price="1399")
        second = await engine.search("phone")
        self.assertFalse(first["cached"])
        self.assertTrue(second["cached"])
        self.assertEqual(second["results"][0]["price"], "1399.00")
        self.assertEqual(len(fetcher.calls), 2)

    async def test_failed_verification_does_not_fall_back_to_listing_price(self):
        candidate = ShoppingCandidate("Test Phone 128GB Black", URL, "Amazon", Decimal("999"))
        engine = CommerceEngine(fetcher=FakeFetcher({URL: FetchError("BLOCKED_HTTP", "blocked")}), providers=[StaticProvider([candidate])])
        result = await engine.search("phone")
        product = result["results"][0]
        self.assertIsNone(product["price"])
        self.assertFalse(product["price_verified"])
        self.assertEqual(product["discovered_price"], "999")

    async def test_mismatched_variant_not_written_to_history(self):
        with tempfile.TemporaryDirectory() as directory:
            candidate = ShoppingCandidate("Test Phone 256GB Black", URL, "Amazon", Decimal("999"))
            history = HistoryStore(Path(directory) / "history.sqlite")
            engine = CommerceEngine(fetcher=FakeFetcher({URL: product_html()}), providers=[StaticProvider([candidate])], history=history)
            result = await engine.search("phone")
            self.assertFalse(result["results"][0]["price_verified"])
            self.assertIn("PRODUCT_MISMATCH", [i["code"] for i in result["results"][0]["issues"]])
            with history._connect() as db:
                self.assertEqual(db.execute("SELECT COUNT(*) FROM observations").fetchone()[0], 0)

    async def test_affiliate_conversion_does_not_change_identity(self):
        async def converter(url):
            return "https://affiliate.example.com/go?id=123"
        engine = CommerceEngine(fetcher=FakeFetcher({URL: product_html()}), affiliate_converter=converter)
        snapshot = await engine.lookup(URL)
        self.assertEqual(snapshot.canonical_url, URL)
        self.assertEqual(snapshot.affiliate_url, "https://affiliate.example.com/go?id=123")
        self.assertIn("B012345678", snapshot.offer_key)

    async def test_unsafe_affiliate_url_is_not_returned(self):
        async def converter(url):
            return "http://127.0.0.1/admin"
        engine = CommerceEngine(fetcher=FakeFetcher({URL: product_html()}), affiliate_converter=converter)
        snapshot = await engine.lookup(URL)
        self.assertIsNone(snapshot.affiliate_url)
        self.assertTrue(snapshot.publishable)

    async def test_search_cancellation_returns_partial_unverified_entries(self):
        candidate = ShoppingCandidate("Test Phone 128GB Black", URL, "Amazon")
        done = asyncio.Event()
        class SlowFetcher:
            async def fetch(self, url, **kwargs):
                try:
                    await asyncio.sleep(10)
                finally:
                    done.set()
        engine = CommerceEngine(fetcher=SlowFetcher(), providers=[StaticProvider([candidate])], search_timeout=0.01)
        result = await engine.search("phone")
        self.assertTrue(result["timed_out"])
        self.assertTrue(done.is_set())
        self.assertFalse(result["results"][0]["price_verified"])

    async def test_compatibility_entry_points(self):
        candidate = ShoppingCandidate("Test Phone 128GB Black", URL, "Amazon")
        engine = CommerceEngine(fetcher=FakeFetcher({URL: product_html()}), providers=[StaticProvider([candidate])])
        product = await scrape_product_live(URL, "bogus ₹4", engine=engine)
        self.assertTrue(product["success"])
        self.assertEqual(product["store"], "Amazon")
        result = await search_google_shopping("phone", engine=engine)
        self.assertEqual(result["verified_total"], 1)

    async def test_canonical_redirect_is_deduplicated(self):
        alias = "https://www.amazon.in/some-slug/dp/B012345678"
        candidates = [ShoppingCandidate("Test Phone 128GB Black", URL, "Amazon"), ShoppingCandidate("Test Phone 128GB Black", alias, "Amazon")]
        engine = CommerceEngine(fetcher=FakeFetcher({URL: product_html(), alias: (URL, product_html())}), providers=[StaticProvider(candidates)])
        result = await engine.search("phone")
        self.assertEqual(result["total"], 1)


class HistoryTests(unittest.IsolatedAsyncioTestCase):
    async def test_offline_and_unknown_stock_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            history = HistoryStore(Path(directory) / "history.sqlite")
            offline = parse_product_html(product_html(), URL)
            unknown = parse_product_html(product_html(stock=None), URL, is_live=True)
            self.assertFalse((await history.assess_and_record(offline))[0])
            self.assertFalse((await history.assess_and_record(unknown))[0])

    async def test_price_anomaly_quarantined(self):
        with tempfile.TemporaryDirectory() as directory:
            history = HistoryStore(Path(directory) / "history.sqlite")
            for index, price in enumerate(("999", "1000", "1001")):
                snapshot = parse_product_html(product_html(price=price), URL, is_live=True,
                                              checked_at=utcnow() - timedelta(seconds=30-index))
                self.assertTrue((await history.assess_and_record(snapshot))[0])
            engine = CommerceEngine(fetcher=FakeFetcher({URL: product_html(price="9")}), history=history)
            snapshot = await engine.lookup(URL)
            self.assertTrue(snapshot.price_verified)
            self.assertFalse(snapshot.publishable)
            self.assertIn("PRICE_ANOMALY", [i.code for i in snapshot.issues])
            self.assertEqual(snapshot.history["count"], 3)

    async def test_idempotent_recording_and_exact_decimal_history(self):
        with tempfile.TemporaryDirectory() as directory:
            history = HistoryStore(Path(directory) / "history.sqlite")
            snapshot = parse_product_html(product_html(price="999.95"), URL, is_live=True)
            await history.assess_and_record(snapshot)
            accepted, summary = await history.assess_and_record(snapshot)
            self.assertTrue(accepted)
            self.assertEqual(summary["count"], 1)
            self.assertEqual(summary["median"], Decimal("999.95"))

    async def test_history_separates_location_currency_and_variants(self):
        snapshot = parse_product_html(product_html(), URL, is_live=True)
        key = observation_key(snapshot)
        snapshot.observed_context = RegionContext(postal_code="700001", warehouse_id="a")
        self.assertNotEqual(key, observation_key(snapshot))
        key2 = observation_key(snapshot)
        snapshot.currency = "USD"
        self.assertNotEqual(key2, observation_key(snapshot))
        key3 = observation_key(snapshot)
        snapshot.attributes["storage"] = "256GB"
        self.assertNotEqual(key3, observation_key(snapshot))

    async def test_stale_snapshot_not_recorded(self):
        with tempfile.TemporaryDirectory() as directory:
            history = HistoryStore(Path(directory) / "history.sqlite")
            snapshot = parse_product_html(product_html(), URL, is_live=True, checked_at=utcnow() - timedelta(hours=1))
            accepted, summary = await history.assess_and_record(snapshot)
            self.assertFalse(accepted)
            self.assertEqual(summary["reason"], "STALE_OBSERVATION")


class CacheTests(unittest.TestCase):
    def test_cache_is_bounded(self):
        cache = TTLCache(max_entries=1)
        cache.put("a", [1])
        cache.put("b", [2])
        self.assertIsNone(cache.get("a"))

    def test_cache_deep_copies(self):
        cache = TTLCache()
        cache.put("a", [{"price": 1}])
        read = cache.get("a")
        read[0]["price"] = 2
        self.assertEqual(cache.get("a")[0]["price"], 1)

    def test_expired_cache(self):
        cache = TTLCache(ttl=0)
        cache.put("a", [1])
        self.assertIsNone(cache.get("a"))
