import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import sys
sys.path.insert(0, '/home/rudranil777/dealbot')
import asyncio
from store_scraper import scrape_product_live

target_scrape_url = "https://fkrt.cc/zHiSaXb"
try:
    loop = asyncio.new_event_loop()
    store_details = loop.run_until_complete(scrape_product_live(target_scrape_url))
    loop.close()
    print("SUCCESS!")
    print("store_details:", store_details)
except Exception as e:
    import traceback
    print("EXCEPTION:", e)
    traceback.print_exc()
"""
print(run_vm_py(code))
