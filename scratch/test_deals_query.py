import os, re, time
from dotenv import load_dotenv
import pymongo

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
mongo_db = os.getenv("MONGODB_DB", "dealbot")

client = pymongo.MongoClient(mongo_uri)
db = client[mongo_db]

# First, fix is_over on the Asian Paints deal and ensure live_on_web: True
db['UniqueDeals'].update_one(
    {"fp_hash": "031b4af5197ec30a"},
    {"$set": {"is_over": False, "live_on_web": True}}
)

# Also ensure Myntra and Double Bedsheet have live_on_web: True, is_over: False
db['UniqueDeals'].update_one(
    {"fp_hash": "fc4b3992e444b7f5"}, # Myntra
    {"$set": {"is_over": False, "live_on_web": True, "discount_pct": 85, "prices.discount_pct": 85}}
)
db['UniqueDeals'].update_one(
    {"fp_hash": "063ffc5af79841fa"}, # Double Bedsheet
    {"$set": {"is_over": False, "live_on_web": True}}
)

# Now check all 7 deals
deals = list(db['UniqueDeals'].find({
    "status": {"$in": ["posted", "auto_posted", "approved", "published", "broadcasted"]},
    "is_over": {"$ne": True}
}).sort("processed_ts", -1))

print(f"Total active deals matching query: {len(deals)}")
for d in deals:
    print(f"- {d.get('fp_hash')}: {d.get('prod_name')} | price={d.get('prices')} | img={bool(d.get('img_url'))} | is_over={d.get('is_over')}")
