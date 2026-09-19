import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
print(f"Connecting to MongoDB Atlas: {mongo_uri[:30]}...")

mc = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = mc[db_name]

deal = db['UniqueDeals'].find_one({'fp_hash': 'a52970222f0348b7'}, {'_id': 0})
print("\nDEAL a52970222f0348b7:")
print(json.dumps(deal, indent=2, default=str))

# Also check top 5 posted deals
print("\n--- TOP 5 POSTED DEALS IN MONGODB ---")
posted = list(db['UniqueDeals'].find({'status': {'$in': ['posted', 'auto_posted']}}, {'_id': 0, 'fp_hash': 1, 'prod_name': 1, 'prices': 1, 'platforms': 1, 'source_channel': 1, 'aff_text': 1, 'url': 1}).sort('processed_ts', -1).limit(5))
for p in posted:
    print(f"FP: {p.get('fp_hash')}, Title: {p.get('prod_name')[:40]}, Price: {p.get('prices')}, Platforms: {p.get('platforms')}")
