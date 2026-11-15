import subprocess

script = """
import os, asyncio
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio

async def main():
    uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB', 'dealbot')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    col = db['UniqueDeals']
    deals = await col.find({"prod_name": {"$regex": "Asian Paints", "$options": "i"}}).to_list(10)
    for d in deals:
        print(f"FP: {d.get('fp_hash')} | status: {d.get('status')} | tg_id: {d.get('tg_message_id')} | oos: {d.get('is_oos')} | over: {d.get('is_over')} | title: {d.get('prod_name')}")
asyncio.run(main())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode(), capture_output=True)
import sys
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
