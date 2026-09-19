import pymongo, json, os
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(mongo_uri)
db = client[os.getenv("MONGODB_DB", "dealbot")]

query = {"$or": [
    {"aff_text": {"$regex": "B0HB5LQY8L"}},
    {"original_text": {"$regex": "B0HB5LQY8L"}},
    {"prod_name": {"$regex": "Silicone Sealant", "$options": "i"}},
]}

deal = db.UniqueDeals.find_one(query)
if deal:
    out = {
        "fp_hash": deal.get("fp_hash"),
        "prod_name": deal.get("prod_name"),
        "channel": deal.get("channel"),
        "channel_raw": deal.get("channel_raw"),
        "prices": deal.get("prices"),
        "coupon": deal.get("coupon"),
        "coupon_discount": deal.get("coupon_discount"),
        "effective_price": deal.get("effective_price"),
        "status": deal.get("status"),
        "aff_text": deal.get("aff_text"),
        "original_text": deal.get("original_text"),
        "canonical_url": deal.get("canonical_url"),
        "expanded_urls": deal.get("expanded_urls")
    }
    print(json.dumps(out, indent=2))
else:
    print("NO DEAL FOUND FOR B0HB5LQY8L")
