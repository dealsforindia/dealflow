import asyncio
import re
import json
from stealth_fetcher import stealth_get_async

async def check_fk_json():
    url = "https://www.flipkart.com/dove-nourishing-body-wash-sensitive-skin-24hrs-moisture-lock/p/itm377f3a3844e03"
    html_resp = await stealth_get_async(url, mobile=False)
    html = html_resp.text
    
    # 1. JSON-LD scripts
    scripts = re.findall(r'<script\s+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
    print(f"Found {len(scripts)} ld+json scripts")
    for i, s in enumerate(scripts):
        try:
            data = json.loads(s.strip())
            print(f"\n--- Script {i} ---")
            print(json.dumps(data, indent=2)[:500])
        except Exception as e:
            print(f"Script {i} parse error: {e}")

    # 2. Look for price and mrp in any script tags
    print("\n--- Searching for 'price' and 'mrp' in HTML ---")
    price_ctx = re.findall(r'.{0,40}(?:maximumRetailPrice|listPrice|strikePrice|originalPrice|mrp).{0,60}', html, re.I)
    print(f"Found {len(price_ctx)} occurrences of MRP keywords:")
    for c in price_ctx[:10]:
        print("  *", repr(c.strip()))

if __name__ == '__main__':
    asyncio.run(check_fk_json())
