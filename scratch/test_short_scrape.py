import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import sys
sys.path.insert(0, '/home/rudranil777/dealbot')
import asyncio
from store_scraper import scrape_product_live

async def test():
    # Pass short URL directly, exactly as desidime_bot did
    details = await scrape_product_live("https://fkrt.cc/zHiSaXb")
    print("Store:", details.get("store"))
    print("Title:", repr(details.get("title")))
    print("Sale Price:", details.get("sale_price"))
    print("MRP:", details.get("mrp"))
    print("Image:", details.get("image_url"))

asyncio.run(test())
"""
print(run_vm_py(code))
