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
    res = await col.update_one(
        {"fp_hash": "031b4af5197ec30a"},
        {"$set": {
            "status": "posted",
            "is_over": False,
            "is_oos": False,
            "in_stock": True,
            "live_on_web": True,
            "stock_status": "In Stock",
            "deleted_at": None,
            "deleted_reason": None,
        }}
    )
    print("Updated Asian Paints:", res.modified_count)
asyncio.run(main())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode("utf-8"), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
