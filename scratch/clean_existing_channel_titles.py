import sys
sys.stdout.reconfigure(encoding='utf-8')

# Script to run on VM to clean up existing MongoDB deals that have channel names as titles
script = '''
import asyncio, os, re
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('/home/rudranil777/dealbot/.env')
uri = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DB', 'dealbot')

CHANNELS = [
    'fet', 'fetdeals', 'offerzone', 'crazy deals', 'dealztrendz',
    'genie', 'free earning', 'technical sheikh', 'loot deals',
    'glam haul', 'trending loot', 'earnkaro', 'extrape', 'desidime'
]

async def main():
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    # Find deals where title or prod_name contains channel name
    reg = '|'.join(CHANNELS)
    cursor = db.UniqueDeals.find({
        '$or': [
            {'title': {'$regex': reg, '$options': 'i'}},
            {'prod_name': {'$regex': reg, '$options': 'i'}}
        ]
    })
    
    deals = await cursor.to_list(100)
    print(f"Found {len(deals)} deals with channel names in title/prod_name")
    
    for d in deals:
        t = d.get('title', '')
        p = d.get('prod_name', '')
        print(f"Sanitizing ID: {d.get('_id')} | Title: {t}")
        
        # Check if we can extract slug from url
        orig = d.get('original_text', '') or d.get('aff_text', '')
        urls = re.findall(r'https?://[^\s<>"\\']+', orig)
        new_title = "Verified Store Offer"
        for u in urls:
            m = re.search(r'/(?:flipkart\.com|shopsy\.in)(?:/dl)?/([^/?#]+)/p/itm', u, re.I)
            if m:
                new_title = m.group(1).replace('-', ' ').title()
                break
            m_amz = re.search(r'amazon\.in/([^/?#]+)/dp/[A-Z0-9]{10}', u, re.I)
            if m_amz:
                new_title = m_amz.group(1).replace('-', ' ').title()
                break
                
        await db.UniqueDeals.update_one(
            {'_id': d['_id']},
            {'$set': {'title': new_title, 'prod_name': new_title}}
        )
        print(f"  -> Replaced with: {new_title}")
        
    client.close()

asyncio.run(main())
'''

import time, subprocess
time.sleep(3)
res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=script,
    capture_output=True,
    text=True
)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)

