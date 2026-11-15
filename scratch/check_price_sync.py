import pymongo
import os
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")

client = pymongo.MongoClient(mongo_uri)
db = client[db_name]
col = db['UniqueDeals']

samples = list(col.find({
    'status': 'pending_approval',
    '$or': [{'prices.sale': {'$in': [None, 0, '0', '']}}, {'prices.sale': {'$exists': False}}],
    '$or': [{'price': {'$in': [None, 0, '0', '']}}, {'price': {'$exists': False}}]
}, {'title': 1, 'store': 1, 'channel': 1, 'deal_type': 1, 'aff_link': 1, 'url': 1, 'original_text': 1}).limit(6))

print("=== SAMPLES OF 121 TRULY ZERO/NULL PRICE DEALS ===")
for s in samples:
    print(f"Store: {s.get('store')} | DealType: {s.get('deal_type')} | Title: {(s.get('title') or '')[:40]}")
    print(f"  Orig: {repr((s.get('original_text') or '')[:80])}")
