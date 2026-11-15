import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
import time

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

total = db.PriceHistory.count_documents({})
print(f"Total PriceHistory: {total}")

# Latest 5 records
latest = list(db.PriceHistory.find().sort("ts", -1).limit(5))
print("Latest 5 PriceHistory:")
for doc in latest:
    print("  ", doc)

# Oldest 5 records
oldest = list(db.PriceHistory.find().sort("ts", 1).limit(5))
print("Oldest 5 PriceHistory:")
for doc in oldest:
    print("  ", doc)

# Let's count canonical_ids that have > 1 records
pipeline = [
    {"$group": {"_id": "$canonical_id", "count": {"$sum": 1}}},
    {"$match": {"count": {"$gt": 1}}},
    {"$sort": {"count": -1}},
    {"$limit": 10}
]
multi = list(db.PriceHistory.aggregate(pipeline))
print("Top canonical_ids by count in PriceHistory:")
for m in multi:
    print("  ", m)
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
