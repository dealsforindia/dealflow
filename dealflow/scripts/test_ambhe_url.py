from pymongo import MongoClient
import json

db = MongoClient()["dealbot"]
deal = db.UniqueDeals.find_one({"prod_name": {"$regex": "Bergner", "$options": "i"}})
if not deal:
    deal = db.UniqueDeals.find_one({"original_text": {"$regex": "ambhedeal", "$options": "i"}})

if deal:
    deal.pop("_id", None)
    print("Found Deal:")
    print("Title:", deal.get("prod_name"))
    print("Category:", deal.get("category"))
    print("Platforms:", deal.get("platforms"))
    print("Prices:", deal.get("prices"))
    print("Affiliate Applied:", deal.get("affiliate_applied"))
    print("Aff Text:\n", deal.get("aff_text"))
    print("Original Text:\n", deal.get("original_text"))
    print("Expanded URLs:\n", deal.get("expanded_urls"))
else:
    print("No deal found")
