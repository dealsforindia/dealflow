import asyncio
import aiohttp
from urllib.parse import urlparse, parse_qs, unquote
from stealth_fetcher import stealth_get, stealth_get_async, stealth_unshorten_deep
from store_scraper import scrape_product_live, resolve_canonical_url

async def main():
    print("=== 1. TESTING ASIN B0FLYGLKYQ & B0CX8ZTM7H ===")
    for asin in ["B0FLYGLKYQ", "B0CX8ZTM7H"]:
        url = f"https://www.amazon.in/dp/{asin}"
        res = await scrape_product_live(url)
        print(f"ASIN {asin}: title={res.get('title')}, price={res.get('sale_price')}, mrp={res.get('mrp')}, img={res.get('image_url')}")

    print("\n=== 2. TESTING FLIPKART SHORTLINK https://fkrt.cc/heS79aK ===")
    can_fk = await resolve_canonical_url("https://fkrt.cc/heS79aK")
    print(f"Resolved Flipkart URL: {can_fk}")
    res_fk = await scrape_product_live("https://fkrt.cc/heS79aK")
    print(f"Flipkart result: title={res_fk.get('title')}, price={res_fk.get('sale_price')}, mrp={res_fk.get('mrp')}, img={res_fk.get('image_url')}")

    print("\n=== 3. TESTING BITLI LINK https://bitli.in/0dYuD7L ===")
    can_bit = await resolve_canonical_url("https://bitli.in/0dYuD7L")
    print(f"Resolved Bitli URL: {can_bit}")
    
    # Trace where bitli.in/0dYuD7L actually goes
    import requests
    try:
        r = requests.get("https://bitli.in/0dYuD7L", headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, timeout=10)
        print(f"Direct requests trace URL: {r.url}")
        parsed = urlparse(r.url)
        qs = parse_qs(parsed.query)
        print(f"Query params: {qs}")
        if 'dl' in qs:
            print(f"Extracted DL param: {unquote(qs['dl'][0])}")
    except Exception as e:
        print(f"Trace error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
