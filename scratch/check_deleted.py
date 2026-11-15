import subprocess, sys

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
    deleted_deals = await col.find({"status": "deleted"}).to_list(20)
    print(f"Total deleted deals: {len(deleted_deals)}")
    for d in deleted_deals:
        print(f"FP: {d.get('fp_hash')} | tg_id: {d.get('tg_message_id')} | reason: {d.get('deleted_reason')} | title: {str(d.get('prod_name'))[:40]}")
asyncio.run(main())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
