import json
import unittest
from decimal import Decimal

from commerce_engine.categories import candidate_matches, detect_category, normalize_product
from commerce_engine.coupons import parse_coupon
from commerce_engine.merchants import PROFILES
from commerce_engine.models import ProductSnapshot, RegionContext
from commerce_engine.normalization import money, parse_money_text, valid_gtin, valid_isbn
from commerce_engine.parser import parse_product_html
from tests.helpers import URL, product_html


def embedded(obj):
    return '<html><script id="__NEXT_DATA__" type="application/json">' + json.dumps({"props": {"pageProps": obj}}) + '</script></html>'


class ExtractionTests(unittest.TestCase):
    def test_live_jsonld_product(self):
        snapshot = parse_product_html(product_html(), URL, is_live=True)
        self.assertTrue(snapshot.publishable)
        self.assertTrue(snapshot.price_verified)
        self.assertEqual(snapshot.sale_price, Decimal("1499.00"))
        self.assertEqual(snapshot.to_dict()["sale_price"], "1499.00")

    def test_offline_input_is_not_live_verified(self):
        snapshot = parse_product_html(product_html(), URL)
        self.assertTrue(snapshot.price_supported)
        self.assertFalse(snapshot.price_verified)
        self.assertFalse(snapshot.publishable)

    def test_out_of_stock_is_not_success(self):
        snapshot = parse_product_html(product_html(stock="OutOfStock"), URL, is_live=True)
        self.assertFalse(snapshot.publishable)
        self.assertFalse(snapshot.in_stock)
        self.assertTrue(snapshot.price_verified)

    def test_unknown_stock_is_not_default_true(self):
        snapshot = parse_product_html(product_html(stock=None), URL, is_live=True)
        self.assertIsNone(snapshot.in_stock)
        self.assertFalse(snapshot.publishable)

    def test_high_confidence_price_conflict(self):
        dom = '<span class="priceToPay"><span class="a-offscreen">₹999</span></span>'
        snapshot = parse_product_html(product_html(dom=dom), URL, is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("PRICE_CONFLICT", [i.code for i in snapshot.issues])

    def test_currency_conflict(self):
        dom = '<span class="priceToPay"><span class="a-offscreen">₹1,499</span></span>'
        snapshot = parse_product_html(product_html(currency="USD", dom=dom), URL, is_live=True)
        self.assertIn("CURRENCY_CONFLICT", [i.code for i in snapshot.issues])
        self.assertFalse(snapshot.publishable)

    def test_recommendation_price_and_stock_are_excluded(self):
        dom = '<div id="recommendations"><span class="priceToPay"><span class="a-offscreen">₹49</span></span><div id="availability">Out of stock</div></div>'
        snapshot = parse_product_html(product_html(dom=dom), URL, is_live=True)
        self.assertTrue(snapshot.publishable)
        self.assertNotIn("PRICE_CONFLICT", [i.code for i in snapshot.issues])

    def test_hidden_price_excluded(self):
        dom = '<div style="display:none"><span class="priceToPay"><span class="a-offscreen">₹49</span></span></div>'
        self.assertTrue(parse_product_html(product_html(dom=dom), URL, is_live=True).publishable)

    def test_captcha_rejected_even_with_product_markup(self):
        markup = product_html().replace('<html>', '<html><title>Robot Check</title>')
        snapshot = parse_product_html(markup, URL, is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertEqual(snapshot.page_kind, "captcha")

    def test_search_page_is_not_a_product(self):
        snapshot = parse_product_html(product_html(), "https://www.amazon.in/s?k=phone", is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertEqual(snapshot.page_kind, "search_or_non_product")

    def test_wrong_sku_structured_data_does_not_verify(self):
        snapshot = parse_product_html(product_html(url="https://www.amazon.in/dp/B999999999"), URL, is_live=True)
        self.assertFalse(snapshot.price_verified)

    def test_nested_graph_and_offer_reference(self):
        graph = {"@graph": [{"@id": "#product", "@type": ["Thing", "Product"], "name": "Phone 128GB", "url": URL, "offers": {"@id": "#offer"}},
                            {"@id": "#offer", "@type": "Offer", "price": "999", "priceCurrency": "INR", "availability": "InStock"}]}
        markup = '<html><script type="application/ld+json">' + json.dumps(graph) + '</script></html>'
        snapshot = parse_product_html(markup, URL, is_live=True)
        self.assertTrue(snapshot.publishable)
        self.assertEqual(snapshot.sale_price, Decimal("999.00"))

    def test_multiple_unmatched_products_are_ambiguous(self):
        obj = [{"@type": "Product", "name": "Phone A", "offers": {"price": "999", "priceCurrency": "INR", "availability": "InStock"}},
               {"@type": "Product", "name": "Phone B", "offers": {"price": "1999", "priceCurrency": "INR", "availability": "InStock"}}]
        markup = '<html><script type="application/ld+json">' + json.dumps(obj) + '</script></html>'
        snapshot = parse_product_html(markup, URL, is_live=True)
        self.assertFalse(snapshot.publishable)
        self.assertIn("AMBIGUOUS_PRODUCT", [i.code for i in snapshot.issues])

    def test_multiple_seller_offers_are_not_collapsed(self):
        offers = [{"price": "999", "priceCurrency": "INR", "availability": "InStock", "seller": {"name": "A"}},
                  {"price": "899", "priceCurrency": "INR", "availability": "InStock", "seller": {"name": "B"}}]
        snapshot = parse_product_html(product_html(extra={"offers": offers}), URL, is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("AMBIGUOUS_OFFER", [i.code for i in snapshot.issues])

    def test_aggregate_price_is_not_checkout_price(self):
        offer = {"@type": "AggregateOffer", "lowPrice": "99", "highPrice": "1999", "priceCurrency": "INR"}
        snapshot = parse_product_html(product_html(extra={"offers": offer}), URL, is_live=True)
        self.assertFalse(snapshot.publishable)

    def test_generic_global_fee_is_not_product_price(self):
        markup = '<html><h1>A lovely product</h1><span>Delivery fee ₹49</span></html>'
        snapshot = parse_product_html(markup, "https://example.com/item", is_live=True)
        self.assertIsNone(snapshot.sale_price)
        self.assertFalse(snapshot.publishable)

    def test_dom_amazon_with_mrp_coupon_dynamic_image(self):
        markup = '''<html><span id="productTitle">Phone 128GB Black</span>
        <span class="priceToPay"><span class="a-offscreen">₹1,499.50</span></span>
        <span data-a-strike="true"><span class="a-offscreen">₹2,000</span></span>
        <div id="availability">In stock</div><span id="couponText1">Apply ₹200 coupon</span>
        <img id="landingImage" src="https://images.example.com/thumb.jpg"
        data-a-dynamic-image='{"https://images.example.com/large.jpg":[1200,1200],"https://images.example.com/small.jpg":[200,200]}'>
        </html>'''
        snapshot = parse_product_html(markup, URL, is_live=True)
        self.assertTrue(snapshot.publishable)
        self.assertEqual(snapshot.mrp, Decimal("2000.00"))
        self.assertEqual(snapshot.discount_pct, 25)
        self.assertEqual(snapshot.image_urls[0], "https://images.example.com/large.jpg")
        self.assertEqual(snapshot.coupons[0].conditional_price, Decimal("1299.50"))
        self.assertEqual(snapshot.effective_price, snapshot.sale_price)

    def test_schema_metadata_extraction_for_every_registered_merchant(self):
        for profile in PROFILES:
            with self.subTest(merchant=profile.name):
                url = "https://www." + profile.domains[0] + "/product-test"
                markup = product_html(name="Generic Product", url=url)
                if profile.location_required:
                    markup = markup.replace("<head>", '<head><meta name="delivery-postal-code" content="700001">')
                context = RegionContext(postal_code="700001") if profile.location_required else RegionContext()
                snapshot = parse_product_html(markup, url, is_live=True, context=context)
                self.assertEqual(snapshot.merchant, profile.name)
                self.assertTrue(snapshot.publishable)

    def test_generic_microdata_scoped_product(self):
        markup = '''<html><section itemscope itemtype="https://schema.org/Product"><h1 itemprop="name">Coffee 500g</h1>
        <meta itemprop="priceCurrency" content="INR"><span itemprop="price" content="299"></span>
        <link itemprop="availability" href="https://schema.org/InStock"></section></html>'''
        snapshot = parse_product_html(markup, "https://example.com/coffee", is_live=True)
        self.assertTrue(snapshot.publishable)
        self.assertEqual(snapshot.unit_price["price"], Decimal("59.80"))


class EmbeddedAndRegionTests(unittest.TestCase):
    URL = "https://www.zeptonow.com/pn/milk/pvid/test-variant"
    CONTEXT = RegionContext(postal_code="700001")

    def test_price_unit_declared_major_is_not_divided(self):
        markup = embedded({"product": {"name": "Grocery pack", "id": "test-variant", "price": 2000, "priceUnit": "rupees", "isAvailable": True},
                           "location": {"postalCode": "700001"}})
        snapshot = parse_product_html(markup, self.URL, is_live=True, context=self.CONTEXT)
        self.assertEqual(snapshot.sale_price, Decimal("2000.00"))
        self.assertTrue(snapshot.publishable)

    def test_price_unit_declared_minor(self):
        markup = embedded({"product": {"name": "Milk 1l", "id": "test-variant", "priceInPaise": 6200, "outOfStock": False},
                           "location": {"postalCode": "700001"}})
        snapshot = parse_product_html(markup, self.URL, is_live=True, context=self.CONTEXT)
        self.assertEqual(snapshot.sale_price, Decimal("62.00"))
        self.assertTrue(snapshot.in_stock)

    def test_price_unit_unknown_is_not_guessed(self):
        markup = embedded({"product": {"name": "Milk 1l", "id": "test-variant", "price": 6200, "isAvailable": True},
                           "location": {"postalCode": "700001"}})
        snapshot = parse_product_html(markup, self.URL, is_live=True, context=self.CONTEXT)
        self.assertFalse(snapshot.price_verified)
        self.assertIsNone(snapshot.sale_price)

    def test_location_not_confirmed_by_request_alone(self):
        snapshot = parse_product_html(product_html(name="Milk 1l", url=self.URL), self.URL, is_live=True, context=self.CONTEXT)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("REGION_REQUIRED", [i.code for i in snapshot.issues])

    def test_location_mismatch_rejected(self):
        markup = product_html(name="Milk 1l", url=self.URL, dom='<meta name="delivery-postal-code" content="110001">')
        snapshot = parse_product_html(markup, self.URL, is_live=True, context=self.CONTEXT)
        self.assertFalse(snapshot.publishable)

    def test_warehouse_is_selected_by_context_not_first_slot(self):
        data = {"product": {"name": "Milk 1l", "id": "test-variant", "priceUnit": "rupees", "isAvailable": True,
                 "storeSpecificData": [{"warehouseId": "wrong", "price": 20}, {"warehouseId": "right", "price": 60}]},
                "location": {"postalCode": "700001", "warehouseId": "right"}}
        snapshot = parse_product_html(embedded(data), self.URL, is_live=True, context=self.CONTEXT)
        self.assertEqual(snapshot.sale_price, Decimal("60.00"))
        self.assertTrue(snapshot.publishable)

    def test_ambiguous_warehouse_blocks_verification(self):
        data = {"product": {"name": "Milk 1l", "id": "test-variant", "priceUnit": "rupees", "isAvailable": True,
                 "storeSpecificData": [{"price": 20}, {"price": 60}]}, "location": {"postalCode": "700001"}}
        snapshot = parse_product_html(embedded(data), self.URL, is_live=True, context=self.CONTEXT)
        self.assertFalse(snapshot.publishable)
        self.assertIn("WAREHOUSE_REQUIRED", [i.code for i in snapshot.issues])

    def test_multiple_variants_require_exact_selection(self):
        markup = embedded({"product": {"name": "Shirt", "variants": [{"id": 1, "price": 500}, {"id": 2, "price": 600}]}})
        snapshot = parse_product_html(markup, "https://www.myntra.com/shirt/123/buy", is_live=True)
        self.assertFalse(snapshot.price_verified)
        self.assertIn("VARIANT_REQUIRED", [i.code for i in snapshot.issues])


class CategoryAndCouponTests(unittest.TestCase):
    def test_unit_pricing_uses_full_multipack(self):
        snapshot = ProductSnapshot("Example", "https://example.com/", title="Tata Salt 3 x 1kg", sale_price=Decimal("90"), currency="INR")
        normalize_product(snapshot, {})
        self.assertEqual(snapshot.category, "grocery")
        self.assertEqual(snapshot.attributes["total_quantity"], Decimal("3000"))
        self.assertEqual(snapshot.unit_price["price"], Decimal("3.00"))

    def test_shampoo_is_not_pan(self):
        self.assertEqual(detect_category("Gentle Shampoo 500ml"), "beauty")

    def test_tablet_device_is_not_medicine(self):
        self.assertEqual(detect_category("Samsung Galaxy Tablet 128GB"), "electronics")
        self.assertEqual(detect_category("Paracetamol 500mg 10 tablets"), "healthcare")

    def test_variant_mismatch_storage_pack_and_shoe_size(self):
        for title, discovery in [("iPhone 16 128GB Black", "iPhone 16 256GB Black"),
                                 ("Milk 1l", "Milk 500ml"), ("Running Shoes UK 8", "Running Shoes UK 10")]:
            snapshot = ProductSnapshot("Example", "https://example.com/", title=title)
            normalize_product(snapshot, {})
            self.assertFalse(candidate_matches(discovery, snapshot)[0])

    def test_medical_strength_mismatch(self):
        snapshot = ProductSnapshot("Example", "https://example.com/", title="Paracetamol 500mg 10 tablets")
        normalize_product(snapshot, {})
        self.assertFalse(candidate_matches("Paracetamol 650mg 10 tablets", snapshot)[0])

    def test_minor_units_only_explicit(self):
        self.assertEqual(money(2000), Decimal("2000.00"))
        self.assertEqual(money(2000, unit="minor"), Decimal("20.00"))
        self.assertIsNone(money(True))
        self.assertIsNone(money("NaN"))

    def test_coupon_quantity_is_not_discount(self):
        self.assertIsNone(parse_coupon("Bottle 2000ML coupon available", "test", Decimal("500"), "INR"))

    def test_coupon_bank_offer_is_not_unconditional(self):
        coupon = parse_coupon("Save ₹200 coupon with credit card", "test", Decimal("500"), "INR")
        self.assertIsNone(coupon.conditional_price)
        self.assertIn("payment_method", coupon.restrictions)

    def test_coupon_percentage_cap(self):
        coupon = parse_coupon("Save 20% coupon up to ₹100", "test", Decimal("1000"), "INR")
        self.assertEqual(coupon.conditional_price, Decimal("900.00"))

    def test_isbn_gtin_checksums(self):
        self.assertEqual(valid_isbn("978-0-306-40615-7"), "9780306406157")
        self.assertEqual(valid_isbn("0-306-40615-2"), "0306406152")
        self.assertIsNone(valid_isbn("9780306406158"))
        self.assertIsNone(valid_gtin("1234567890123"))

    def test_price_text_rejects_multiple_values(self):
        self.assertIsNone(parse_money_text("₹999 ₹1999")[0])
        self.assertEqual(parse_money_text("₹1,299.95")[0], Decimal("1299.95"))
