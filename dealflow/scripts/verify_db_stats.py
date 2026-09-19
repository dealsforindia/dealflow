import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
db = MongoClient(os.getenv("MONGODB_URI"))[os.getenv("MONGODB_DB", "dealbot")]

total = db.UniqueDeals.count_documents({"status": {"$in": ["posted", "auto_posted"]}})
with_mrp = db.UniqueDeals.count_documents({
    "status": {"$in": ["posted", "auto_posted"]},
    "prices.mrp": {"$nin": [None, 0]}
})
with_disc = db.UniqueDeals.count_documents({
    "status": {"$in": ["posted", "auto_posted"]},
    "prices.discount_pct": {"$nin": [None, 0]}
})

print(f"Total posted deals: {total}")
print(f"Deals with verified MRP: {with_mrp} ({with_mrp / total * 100:.1f}%)")
print(f"Deals with verified Discount %: {with_disc} ({with_disc / total * 100:.1f}%)")
