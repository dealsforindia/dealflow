import pymongo
import os
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")

client = pymongo.MongoClient(mongo_uri)
db = client[db_name]
col = db['UniqueDeals']

sample = col.find_one({'status': 'pending_approval', 'price': None})
print("=== SAMPLE DEAL WITH PRICE: NONE ===")
for k, v in (sample or {}).items():
    if k not in ['raw_message', 'chat_history']:
        print(f"  {k}: {repr(v)[:120]}")
