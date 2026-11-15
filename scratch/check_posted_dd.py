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
    
    cnt_posted = await col.count_documents({
        'status': {'$in': ['posted', 'auto_posted']},
        '$or': [
            {'aff_text': {'$regex': r'(desidime|ddime)', '$options': 'i'}},
            {'ai_formatted_text': {'$regex': r'(desidime|ddime)', '$options': 'i'}}
        ]
    })
    print(f"Posted/auto_posted deals with DesiDime/ddime in aff_text: {cnt_posted}")
    
    # Let's inspect a few
    samples = await col.find({
        'status': {'$in': ['posted', 'auto_posted']},
        '$or': [
            {'aff_text': {'$regex': r'(desidime|ddime)', '$options': 'i'}},
            {'ai_formatted_text': {'$regex': r'(desidime|ddime)', '$options': 'i'}}
        ]
    }).to_list(5)
    for s in samples:
        print(f"FP: {s.get('fp_hash')} | Title: {s.get('prod_name')[:40]}")
        print("   aff_text:", s.get('aff_text')[:120])

asyncio.run(main())
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
