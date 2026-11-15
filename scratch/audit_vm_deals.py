import os
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')
from pymongo import MongoClient

c = MongoClient(os.getenv('MONGODB_URI'))
db = c['dealbot']

print("=== DEALS STATUS BREAKDOWN ===")
for d in db.UniqueDeals.aggregate([{'$group': {'_id': '$status', 'count': {'$sum': 1}}}]):
    print(f"  {d['_id']}: {d['count']}")

print("\n=== POSTED DEALS SAMPLE ===")
for d in db.UniqueDeals.find({'status': {'$in': ['posted', 'auto_posted', 'approved']}}).limit(5):
    print(f"  [{d.get('status')}] {d.get('prod_name') or d.get('title')} | Price: {d.get('price')} / {d.get('prices')} | Store: {d.get('store')} | Channel: {d.get('channel')}")

print("\n=== PENDING DEALS SAMPLE ===")
for d in db.UniqueDeals.find({'status': 'pending_approval'}).sort('ts', -1).limit(5):
    print(f"  [{d.get('status')}] {d.get('prod_name') or d.get('title')} | Store: {d.get('store')} | Img: {bool(d.get('img_url') or d.get('img_path'))} | Over: {d.get('is_over')}")
