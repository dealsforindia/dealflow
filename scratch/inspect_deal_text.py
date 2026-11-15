import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

hashes = ["4f43e0df44d6", "a9ad92987c5a", "3f8b57b985c5", "e8bf9ea64dc8", "47804644f234"]
for h in hashes:
    d = db.UniqueDeals.find_one({"fp_hash": h})
    if d:
        print(f"\n--- Deal {h} ---")
        print("price_history in doc:", d.get("price_history"))
        print("aff_text:", (d.get("aff_text") or "")[:200])
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
