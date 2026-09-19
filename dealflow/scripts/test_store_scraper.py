import asyncio
import sys
import unittest

if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

from store_scraper import (
    _parse_amazon,
    _parse_flipkart,
    _parse_myntra,
    _parse_ajio,
    _parse_swiggy,
    _parse_blinkit,
    _parse_generic,
    clean_extracted_title,
    extract_slug_fallback,
    detect_category,
    extract_asin,
    is_short_url
)

class TestUnifiedStoreScraper(unittest.TestCase):

    def test_amazon_parsing(self):
        sample_html = """
        <html>
        <head><title>boAt Rockerz 450 Bluetooth On Ear Headphones with Mic (Luscious Black) : Amazon.in: Electronics</title></head>
        <body>
            <span id="productTitle">   boAt Rockerz 450 Bluetooth On Ear Headphones with Mic (Luscious Black)   </span>
            <div id="couponBadge">Apply <span class="a-color-success">₹150</span> coupon on checkout</div>
            <div class="priceToPay">
                <span class="a-price-whole">1,299<span class="a-price-decimal">.</span></span>
            </div>
            <span class="a-price a-text-price"><span class="a-offscreen">₹3,990</span></span>
            <img id="landingImage" data-old-hires="https://m.media-amazon.com/images/I/61u1VALn6JL._SL1500_.jpg" src="thumb.jpg" />
        </body>
        </html>
        """
        data = _parse_amazon(sample_html, "https://www.amazon.in/dp/B07PR1CL3S")
        self.assertEqual(data["store"], "Amazon")
        self.assertIn("boAt Rockerz 450", data["title"])
        self.assertEqual(data["sale_price"], 1299.0)
        self.assertEqual(data["mrp"], 3990.0)
        self.assertEqual(data["discount_pct"], 67)
        self.assertTrue(data["in_stock"])
        self.assertEqual(data["on_page_coupon"], "Apply ₹150 coupon on page")
        self.assertEqual(data["image_url"], "https://m.media-amazon.com/images/I/61u1VALn6JL._SL1500_.jpg")

    def test_amazon_out_of_stock(self):
        sample_html = """
        <html>
        <body>
            <span id="productTitle">Sony WH-1000XM5 Wireless Headphones</span>
            <div id="availability"><span class="a-color-price">Currently unavailable.</span></div>
            <span class="a-price-whole">29,990</span>
        </body>
        </html>
        """
        data = _parse_amazon(sample_html, "https://www.amazon.in/dp/B09XS7JWHH")
        self.assertFalse(data["in_stock"])

    def test_flipkart_parsing(self):
        sample_html = """
        <html>
        <head>
            <meta property="og:title" content="realme P1 5G (Phoenix Red, 128 GB) (6 GB RAM) - Flipkart.com" />
            <meta property="og:image" content="https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/y/v/b/-original-imahywh5wzhguzeg.jpeg" />
        </head>
        <body>
            <h1 class="VU-ZEz">realme P1 5G (Phoenix Red, 128 GB)</h1>
            <div class="Nx9bqj CxhGGd">₹14,999</div>
            <div class="yRaY8j A68rqD">₹20,999</div>
            <div class="kF5yHw"><span>Special Price</span> Get extra ₹1000 off</div>
        </body>
        </html>
        """
        data = _parse_flipkart(sample_html, "https://www.flipkart.com/realme-p1-5g/p/itm123")
        self.assertEqual(data["store"], "Flipkart")
        self.assertEqual(data["title"], "realme P1 5G (Phoenix Red, 128 GB)")
        self.assertEqual(data["sale_price"], 14999.0)
        self.assertEqual(data["mrp"], 20999.0)
        self.assertEqual(data["discount_pct"], 29)
        self.assertTrue(data["in_stock"])
        self.assertEqual(data["image_url"], "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/y/v/b/-original-imahywh5wzhguzeg.jpeg")

    def test_myntra_parsing(self):
        sample_html = """
        <html>
        <head>
            <meta property="og:image" content="https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/123/img.jpg" />
        </head>
        <body>
            <h1 class="pdp-title">Roadster</h1>
            <h1 class="pdp-name">Men Solid Casual Denim Shirt</h1>
            <span class="pdp-price"><strong>₹699</strong></span>
            <span class="pdp-mrp"><s>₹1,999</s></span>
            <div>Coupon Code: FLAT100</div>
        </body>
        </html>
        """
        data = _parse_myntra(sample_html, "https://www.myntra.com/shirts/roadster/shirt/123/buy")
        self.assertEqual(data["store"], "Myntra")
        self.assertEqual(data["title"], "Roadster Men Solid Casual Denim Shirt")
        self.assertEqual(data["sale_price"], 699.0)
        self.assertEqual(data["mrp"], 1999.0)
        self.assertEqual(data["discount_pct"], 65)
        self.assertEqual(data["on_page_coupon"], "Use code FLAT100 on page")
        self.assertTrue(data["in_stock"])

    def test_ajio_parsing(self):
        sample_html = """
        <html>
        <head>
            <meta property="og:image" content="https://assets.ajio.com/medias/sys_master/root/ajio/shirt.jpg" />
        </head>
        <body>
            <span class="brand-name">Dennislingo Premium Attire</span>
            <h1 class="prod-title">Slim Fit Cotton Shirt</h1>
            <div class="prod-sp">₹489</div>
            <span class="prod-cp">₹1,849</span>
            <div>Use Code: TRENDS50</div>
        </body>
        </html>
        """
        data = _parse_ajio(sample_html, "https://www.ajio.com/dennislingo-shirt/p/461234")
        self.assertEqual(data["store"], "AJIO")
        self.assertEqual(data["title"], "Dennislingo Premium Attire Slim Fit Cotton Shirt")
        self.assertEqual(data["sale_price"], 489.0)
        self.assertEqual(data["mrp"], 1849.0)
        self.assertEqual(data["discount_pct"], 74)
        self.assertEqual(data["on_page_coupon"], "Use code TRENDS50 on page")
        self.assertTrue(data["in_stock"])

    def test_swiggy_parsing(self):
        sample_html = """
        <html>
        <head>
            <meta property="og:image" content="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/milk.jpg" />
        </head>
        <body>
            <h1 data-testid="item-name">Amul Taaza Toned Fresh Milk 1 L</h1>
            <span data-testid="item-offer-price">₹54</span>
            <span data-testid="item-mrp">₹56</span>
            <div data-testid="item-discount">4% OFF</div>
        </body>
        </html>
        """
        data = _parse_swiggy(sample_html, "https://www.swiggy.com/stores/instamart/item/YXISWD6FV6")
        self.assertEqual(data["store"], "Swiggy")
        self.assertEqual(data["title"], "Amul Taaza Toned Fresh Milk 1 L")
        self.assertEqual(data["sale_price"], 54.0)
        self.assertEqual(data["mrp"], 56.0)
        self.assertEqual(data["discount_pct"], 4)
        self.assertEqual(data["on_page_coupon"], "4% OFF")
        self.assertTrue(data["in_stock"])

    def test_blinkit_next_data_parsing(self):
        sample_html = """
        <html>
        <body>
            <script id="__NEXT_DATA__" type="application/json">
            {
                "props": {
                    "pageProps": {
                        "product": {
                            "name": "Fortune Sunlite Refined Sunflower Oil 1 L",
                            "price": 135,
                            "mrp": 165,
                            "inventory": 15,
                            "out_of_stock": false,
                            "is_available": true,
                            "images": ["https://cdn.grofers.com/app/images/products/full_screen/pro_1.jpg"],
                            "discount_label": "₹30 OFF"
                        }
                    }
                }
            }
            </script>
        </body>
        </html>
        """
        data = _parse_blinkit(sample_html, "https://blinkit.com/prn/fortune-oil/prid/123")
        self.assertEqual(data["store"], "Blinkit")
        self.assertEqual(data["title"], "Fortune Sunlite Refined Sunflower Oil 1 L")
        self.assertEqual(data["sale_price"], 135.0)
        self.assertEqual(data["mrp"], 165.0)
        self.assertEqual(data["discount_pct"], 18)
        self.assertEqual(data["on_page_coupon"], "₹30 OFF")
        self.assertTrue(data["in_stock"])
        self.assertEqual(data["image_url"], "https://cdn.grofers.com/app/images/products/full_screen/pro_1.jpg")

    def test_universal_json_ld_parsing(self):
        sample_html = """
        <html>
        <head>
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "Croma 55 Inch 4K Ultra HD Smart LED Google TV",
                "image": "https://media.croma.com/image/upload/v1/tv.jpg",
                "offers": {
                    "@type": "Offer",
                    "price": 28990,
                    "highPrice": 50000,
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock"
                }
            }
            </script>
        </head>
        </html>
        """
        data = _parse_generic(sample_html, "https://www.croma.com/croma-55-inch-tv/p/260000")
        self.assertEqual(data["store"], "Croma")
        self.assertEqual(data["title"], "Croma 55 Inch 4K Ultra HD Smart LED Google TV")
        self.assertEqual(data["sale_price"], 28990.0)
        self.assertEqual(data["mrp"], 50000.0)
        self.assertEqual(data["discount_pct"], 42)
        self.assertTrue(data["in_stock"])

    def test_slug_fallbacks(self):
        amz_slug = extract_slug_fallback("https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH")
        self.assertEqual(amz_slug, "Sony Wh 1000Xm5 Wireless Cancelling Headphones")

        fk_slug = extract_slug_fallback("https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4")
        self.assertEqual(fk_slug, "Apple Iphone 15 Black 128 Gb")

        my_slug = extract_slug_fallback("https://www.myntra.com/casual-shoes/nike/nike-men-air-max-sneakers/2501234/buy")
        self.assertEqual(my_slug, "Nike Men Air Max Sneakers")

    def test_category_detection(self):
        self.assertEqual(detect_category("Sony Bravia 55 inch 4K TV"), "📱 Electronics")
        self.assertEqual(detect_category("Puma Men Running Shoes"), "👗 Fashion")
        self.assertEqual(detect_category("Prestige Non Stick Kadhai with Lid"), "🏠 Home")
        self.assertEqual(detect_category("Aashirvaad Shudh Chakki Atta 10 kg"), "🍎 Grocery")
        self.assertEqual(detect_category("Maybelline New York Matte Lipstick"), "💄 Beauty")
        self.assertEqual(detect_category("Casio Vintage Digital Watch"), "⌚ Watches")

if __name__ == "__main__":
    unittest.main()
