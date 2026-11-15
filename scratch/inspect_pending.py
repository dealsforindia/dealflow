import subprocess, sys

script = """
import os, asyncio
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio
from bson import ObjectId

async def main():
    uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB', 'dealbot')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    col = db['UniqueDeals']
    deals = await col.find({"status": "pending_approval"}).sort("created_at", -1).limit(3).to_list(3)
    for d in deals:
        print(f"ID: {d.get('_id')} | fp_hash: {d.get('fp_hash')} | title: {d.get('prod_name')}")
asyncio.run(main())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
