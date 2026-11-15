import urllib.request
import urllib.parse
import json
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

TEST_AMAZON = "https://www.amazon.in/dp/B0CX21C8S1"
TEST_ASIN = "B0CX21C8S1"

def probe_url(url, post_data=None, headers=None):
    h = dict(HEADERS)
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h, data=post_data)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read()
            content_type = resp.headers.get("content-type", "")
            return resp.status, content_type, content[:500]
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read()[:300]
        except Exception:
            err_body = b""
        return e.code, e.headers.get("content-type", ""), err_body
    except Exception as ex:
        return 0, str(type(ex)), str(ex).encode()

# Test candidate endpoints for Buyhatke / PriceHistory / PriceBefore
probes = [
    ("PriceHistory Search API", "https://pricehistory.app/api/search?url=" + urllib.parse.quote(TEST_AMAZON)),
    ("PriceHistory Check API", "https://pricehistory.app/api/v1/search?url=" + urllib.parse.quote(TEST_AMAZON)),
    ("PriceHistory Direct", "https://pricehistory.app/product/" + TEST_ASIN),
    ("Buyhatke Graph API", "https://compare.buyhatke.com/products/pricegraph.php?url=" + urllib.parse.quote(TEST_AMAZON)),
    ("Buyhatke Extension API", "https://compare.buyhatke.com/extension/getPriceTrend.php?asin=" + TEST_ASIN),
    ("Buyhatke API v1", "https://api.buyhatke.com/priceHistory?asin=" + TEST_ASIN),
    ("PriceBefore Search", "https://pricebefore.com/api/get_price_history/?url=" + urllib.parse.quote(TEST_AMAZON)),
    ("PriceBefore Page", "https://pricebefore.com/search/?q=" + urllib.parse.quote(TEST_AMAZON)),
]

print("=== PROBING PRICE HISTORY APIS ===")
for label, url in probes:
    status, ctype, body = probe_url(url)
    print(f"\n[{status}] {label}")
    print(f"  URL: {url}")
    print(f"  Type: {ctype}")
    print(f"  Snippet: {body[:150]}")
