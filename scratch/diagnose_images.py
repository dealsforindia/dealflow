import pymongo
import os
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")

client = pymongo.MongoClient(mongo_uri)
db = client[db_name]
col = db['UniqueDeals']

missing_img_deals = list(col.find(
    {'status': 'pending_approval', '$or': [{'img_url': {'$in': [None, '']}}, {'img_url': {'$exists': False}}]},
    {'title': 1, 'store': 1, 'channel': 1, 'aff_link': 1, 'url': 1, 'original_text': 1, 'img_path': 1, 'asin': 1}
).limit(10))

print("=== 10 SAMPLE DEALS MISSING IMG_URL ===")
for d in missing_img_deals:
    link = d.get('aff_link') or d.get('url') or ''
    print(f"Store: {d.get('store')} | ASIN: {d.get('asin')} | Title: {(d.get('title') or '')[:40]}")
    print(f"  Link: {link[:80]}")
    print(f"  img_path: {d.get('img_path')}")

