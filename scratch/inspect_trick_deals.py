import os
from dotenv import load_dotenv
import pymongo

load_dotenv("/home/rudranil777/dealbot/.env")
uri = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(uri)
db = client["dealbot"]

# Search for recent deals from channels with 'trick' in name or text with 'trick'
trick_deals = list(db.UniqueDeals.find({
    '$or': [
        {'channel': {'$regex': 'trick', '$options': 'i'}},
        {'original_text': {'$regex': r'\btrick\b', '$options': 'i'}}
    ]
}).sort('_id', -1).limit(6))

print(f"Found {len(trick_deals)} trick deals:")
for d in trick_deals:
    print("=" * 60)
    print("Channel:", d.get("channel"))
    print("Title:", repr(d.get("title") or d.get("prod_name")))
    print("Store:", d.get("store"))
    print("Price:", d.get("prices") or d.get("price"))
    print("Status:", d.get("status"))
    print("Deal Type:", d.get("deal_type"))
    print("Original Text:\n" + (d.get("original_text", "")[:250]))
