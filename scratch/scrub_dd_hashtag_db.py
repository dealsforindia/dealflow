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
    
    # Clean #DesiDime and #desidime from text fields
    cursor = col.find({
        '$or': [
            {'aff_text': {'$regex': r'#desidime', '$options': 'i'}},
            {'message': {'$regex': r'#desidime', '$options': 'i'}},
            {'ai_formatted_text': {'$regex': r'#desidime', '$options': 'i'}},
            {'original_text': {'$regex': r'#desidime', '$options': 'i'}},
        ]
    })
    
    modified = 0
    async for d in cursor:
        updates = {}
        for f in ['aff_text', 'message', 'ai_formatted_text', 'original_text']:
            val = d.get(f)
            if val and re.search(r'#desidime\b', val, re.I):
                cleaned = re.sub(r'\s*#desidime\b', '', val, flags=re.I).strip()
                updates[f] = cleaned
        if updates:
            await col.update_one({'_id': d['_id']}, {'$set': updates})
            modified += 1
            
    print(f"Scrubbed #DesiDime from {modified} deals in MongoDB!")

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
