import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
import os, asyncio
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio
from datetime import datetime

async def main():
    uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB', 'dealbot')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    col = db['UniqueDeals']
    deals = await col.find({'source': 'desidime'}).sort('_id', -1).to_list(20)
    print(f"Total DesiDime deals found: {len(deals)}")
    for d in deals:
        fp = str(d.get('fp_hash', ''))[:8]
        title = str(d.get('prod_name', ''))[:50]
        status = d.get('status')
        temp = d.get('desidime_temperature') or d.get('desidimeTemperature')
        price = d.get('prices', {}).get('sale') or d.get('price')
        store = d.get('store')
        is_multi = d.get('is_multi_deal', False)
        print(f"FP:{fp} | {status} | Temp:{temp} | St:{store} | Price:₹{price} | Multi:{is_multi} | {title}")
asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
