from pymongo import MongoClient
import json

db = MongoClient()['dealbot']
deal = db.UniqueDeals.find_one({"title": {"$regex": "Marks.*Spencer", "$options": "i"}})
if not deal:
    deal = db.UniqueDeals.find_one({"title": {"$regex": "Pyjama", "$options": "i"}})

if deal:
    print("=== FOUND DEAL ===")
    print("Title:", deal.get("title"))
    print("fp_hash:", deal.get("fp_hash"))
    print("Price:", deal.get("price"))
    print("MRP:", deal.get("mrp"))
    print("Discount:", deal.get("discount"))
    print("Original Text:\n", deal.get("original_text"))
    print("\nAff Text:\n", deal.get("aff_text"))
    print("\nItems:\n", json.dumps(deal.get("items"), indent=2))
    print("\nis_multi_deal:", deal.get("is_multi_deal"))
    print("multi_items:\n", json.dumps(deal.get("multi_items"), indent=2))
else:
    print("Not found in UniqueDeals")
