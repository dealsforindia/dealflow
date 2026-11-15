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
    
    # 1. Deals with desidime links in aff_text / message / url
    dd_links = await col.find({
        '$or': [
            {'aff_text': {'$regex': r'(desidime|ddime)', '$options': 'i'}},
            {'message': {'$regex': r'(desidime|ddime)', '$options': 'i'}},
            {'ai_formatted_text': {'$regex': r'(desidime|ddime)', '$options': 'i'}},
            {'original_msg_link': {'$regex': r'(desidime|ddime)', '$options': 'i'}},
            {'deal_badges': {'$regex': r'desidime', '$options': 'i'}}
        ]
    }).to_list(15)
    
    print(f"Deals with DesiDime/ddime in text/links: {len(dd_links)}")
    for d in dd_links[:5]:
        print(f"FP: {d.get('fp_hash')} | store: {d.get('store')} | title: {d.get('prod_name')[:40]}")
        # Check where desidime occurs
        for field in ['aff_text', 'message', 'ai_formatted_text', 'deal_badges']:
            val = str(d.get(field, ''))
            matches = re.findall(r'.{0,25}(?:desidime|ddime).{0,25}', val, re.I)
            if matches:
                print(f"   {field}: {matches}")

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
