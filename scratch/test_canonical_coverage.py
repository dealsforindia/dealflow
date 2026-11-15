import subprocess

remote_code = r'''
import os, sys
sys.path.insert(0, "/home/rudranil777/dealbot")
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
import re

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

from price_history_tracker import extract_canonical_id

sample_deals = list(db.UniqueDeals.find({}, {"_id": 0, "canonical_key": 1, "asin": 1, "aff_text": 1, "original_text": 1, "url": 1, "expanded_urls": 1, "prod_name": 1, "title": 1}).limit(500))

resolved = 0
already_had = 0
for d in sample_deals:
    had = bool(d.get("canonical_key"))
    if had:
        already_had += 1
    cid = extract_canonical_id(d)
    if cid:
        resolved += 1

print(f"Sample 500 deals: Already had canonical_key: {already_had}, Resolved via extract_canonical_id: {resolved}")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
print("STDERR:")
print(res.stderr.encode('ascii', errors='replace').decode('ascii'))
