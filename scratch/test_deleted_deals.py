import subprocess, sys

script = """
import os, asyncio, sys
sys.path.append('/home/rudranil777/dealbot')
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio
from store_scraper import scrape_product_live

async def main():
    uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB', 'dealbot')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    col = db['UniqueDeals']
    hashes = ['031b4af5197ec30a', '7cd82d90c4729382', 'c0409df4fabffa1d', 'a452e0554a89c239', 'c3c41d75036608201d447bfe028c9ef8']
    deals = await col.find({"fp_hash": {"$in": hashes}}).to_list(10)
    for d in deals:
        url = d.get('canonical_url') or d.get('url')
        if not url:
            exp = d.get('expanded_urls') or {}
            if exp:
                url = list(exp.values())[0] if isinstance(exp, dict) else exp[0]
        if not url:
            import re
            m = re.findall(r'https?://[^\s<>"]+', d.get('aff_text') or '')
            if m: url = m[0]
        print(f"Checking {d.get('fp_hash')} ({d.get('prod_name')[:30]}): url={url}")
        if url:
            res = await scrape_product_live(url)
            print(f"  Result: in_stock={res.get('in_stock')}, sale_price={res.get('sale_price')}, store={res.get('store')}")
asyncio.run(main())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
