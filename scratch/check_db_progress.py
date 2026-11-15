import os, sys
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

non_empty = db.UniqueDeals.count_documents({"canonical_key": {"$exists": True, "$ne": "", "$nin": [None, ""]}})
total_deals = db.UniqueDeals.count_documents({})
ph_count = db.PriceHistory.count_documents({})
print(f"UniqueDeals with canonical_key: {non_empty} / {total_deals}")
print(f"PriceHistory total records: {ph_count}")
