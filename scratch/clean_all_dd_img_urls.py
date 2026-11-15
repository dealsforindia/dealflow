import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
import os, asyncio
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
import motor.motor_asyncio
import re

async def main():
    uri = os.getenv('MONGODB_URI')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    col = client['dealbot']['UniqueDeals']
    
    cursor = col.find({
        '$or': [
            {'img_url': {'$regex': 'desidime', '$options': 'i'}},
            {'img_path': {'$regex': 'desidime', '$options': 'i'}},
        ]
    })
    
    cnt = 0
    async for d in cursor:
        updates = {}
        for f in ['img_url', 'img_path']:
            val = d.get(f)
            if val and re.search('desidime', val, re.I):
                cleaned = re.sub('www_desidime_com', 'curated_drop', val, flags=re.I)
                cleaned = re.sub('desidime', 'curated_drop', cleaned, flags=re.I)
                updates[f] = cleaned
        if updates:
            await col.update_one({'_id': d['_id']}, {'$set': updates})
            cnt += 1
            
    print(f"Sanitized image URLs in {cnt} MongoDB deals!")

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
