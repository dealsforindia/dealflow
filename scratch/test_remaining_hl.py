import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import sys
sys.path.insert(0, '/home/rudranil777/dealbot')
import asyncio
from store_scraper import resolve_canonical_url, scrape_product_live

async def test():
    for short_u in ["https://fkrt.cc/zVS4eib", "https://fkrt.cc/z5NVQIH"]:
        canon = await resolve_canonical_url(short_u)
        print("Short:", short_u)
        print("Canonical:", canon)
        details = await scrape_product_live(canon or short_u)
        print("Scraped Store:", details.get("store"))
        print("Scraped Title:", details.get("title"))
        print("Scraped Image:", details.get("image_url"))
        print("-" * 50)

asyncio.run(test())
"""
print(run_vm_py(code))
