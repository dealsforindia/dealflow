import os
from dotenv import load_dotenv
import pymongo

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
mongo_db = os.getenv("MONGODB_DB", "dealbot")

client = pymongo.MongoClient(mongo_uri)
db = client[mongo_db]

pending = list(db['UniqueDeals'].find({'status': {'$in': ['pending', 'pending_approval']}}).sort('timestamp', -1).limit(5))
print(f"PENDING COUNT: {len(pending)}")
for p in pending:
    print("---")
    print("ID:", p.get('fp_hash'))
    print("NAME:", p.get('prod_name'))
    print("PRICE:", p.get('prices'))
    print("STATUS:", p.get('status'))
    print("CHANNEL:", p.get('source_channel'))
    print("URL:", p.get('url'))
    print("AFF_TEXT:", (p.get('aff_text') or '')[:80])
