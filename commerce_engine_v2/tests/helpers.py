import json
from collections import Counter

from commerce_engine.models import utcnow
from commerce_engine.network import FetchError, FetchResponse

URL = "https://www.amazon.in/dp/B012345678"


def product_html(name="Test Phone 128GB Black", price="1499", stock="InStock", *, url=URL,
                 currency="INR", extra=None, dom=""):
    product = {"@type": "Product", "name": name, "url": url,
               "offers": {"@type": "Offer", "price": price, "priceCurrency": currency},
               "image": "https://images.example.com/product.jpg"}
    if stock is not None:
        product["offers"]["availability"] = "https://schema.org/" + stock
    if extra:
        product.update(extra)
    return '<html><head><script type="application/ld+json">' + json.dumps(product) + '</script></head><body>' + dom + '</body></html>'


class FakeFetcher:
    def __init__(self, pages):
        self.pages = pages
        self.calls = []
        self.metrics = Counter()

    async def fetch(self, url, **kwargs):
        self.calls.append(url)
        page = self.pages.get(url)
        if isinstance(page, Exception):
            raise page
        if page is None:
            raise FetchError("HTTP_ERROR", "Missing test page")
        if isinstance(page, tuple):
            final_url, markup = page
        else:
            final_url, markup = url, page
        return FetchResponse(final_url, 200, {"content-type": "text/html"}, markup, utcnow())
