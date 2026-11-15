import subprocess

script = """
import os, asyncio, json
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio

async def main():
    uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('MONGODB_DB', 'dealbot')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    col = db['UniqueDeals']
    deal = await col.find_one({"fp_hash": "fc4b3992e444b7f5"})
    if deal:
        for k, v in deal.items():
            if k not in ['_id']:
                print(f"{k}: {v}")
asyncio.run(main())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode(), capture_output=True)
import sys
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
