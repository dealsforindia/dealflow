import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
import os, asyncio
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio

async def main():
    uri = os.getenv('MONGODB_URI')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    col = client['dealbot']['UniqueDeals']
    deals = await col.find({'source': 'desidime'}).sort('_id', -1).to_list(10)
    for d in deals:
        print(f"FP: {d.get('fp_hash')[:8]} | Status: '{d.get('status')}' | Channel: '{d.get('channel')}' | Title: {d.get('prod_name')[:45]}")

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
