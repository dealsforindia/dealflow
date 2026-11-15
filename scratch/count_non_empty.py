import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

non_empty = db.UniqueDeals.count_documents({"canonical_key": {"$exists": True, "$ne": "", "$nin": [None, ""]}})
print("Deals with non-empty canonical_key:", non_empty)
sample_non_empty = list(db.UniqueDeals.find({"canonical_key": {"$exists": True, "$ne": "", "$nin": [None, ""]}}, {"canonical_key": 1}).limit(5))
print("Sample non-empty:", sample_non_empty)
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
