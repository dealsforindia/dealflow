import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import sys
sys.path.insert(0, '/home/rudranil777/dealbot')
import asyncio
from store_scraper import scrape_product_live

async def test():
    res = await scrape_product_live("https://www.amazon.in/dp/B0H1MSLL73")
    print("Store:", res.get("store"))
    print("Title:", res.get("title"))
    print("Price:", res.get("sale_price"))
    print("MRP:", res.get("mrp"))
    print("Image:", res.get("image_url"))

asyncio.run(test())
"""
print(run_vm_py(code))
