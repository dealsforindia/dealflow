import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI", "")
print("MONGODB_URI starts with:", mongo_uri[:20] if mongo_uri else "EMPTY")

from pymongo import MongoClient
if mongo_uri:
    client = MongoClient(mongo_uri)
    db = client[os.getenv("MONGODB_DB", "dealbot")]
    print("Connected successfully! Collections:", db.list_collection_names())
    if "PriceHistory" in db.list_collection_names():
        print("PriceHistory count:", db.PriceHistory.count_documents({}))
        sample = list(db.PriceHistory.find().limit(3))
        for s in sample:
            print("PriceHistory sample:", s)
    if "UniqueDeals" in db.list_collection_names():
        print("UniqueDeals count:", db.UniqueDeals.count_documents({}))
        sample_deal = db.UniqueDeals.find_one({"canonical_key": {"$exists": True}})
        print("Sample deal with canonical_key:", bool(sample_deal), sample_deal.get("canonical_key") if sample_deal else None)
        deals_with_ck = db.UniqueDeals.count_documents({"canonical_key": {"$exists": True, "$ne": None}})
        print(f"Deals with canonical_key: {deals_with_ck}")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
print("STDERR:")
print(res.stderr)
