import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
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
    
    res = await col.update_many(
        {'source': 'desidime', '$or': [{'channel': None}, {'channel': 'None'}, {'channel': {'$exists': False}}]},
        {'$set': {'channel': 'DesiDime - Handpicked Deals', 'channelRaw': '@DesidimeHot'}}
    )
    print(f"Updated {res.modified_count} DesiDime deals with proper channel and channelRaw tags!")

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
