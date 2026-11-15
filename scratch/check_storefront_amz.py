import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

query = {
    "status": {"$in": ["posted", "auto_posted", "approved", "published", "broadcasted", "archived"]},
    "$or": [
        {"store": "Amazon"},
        {"platforms": "Amazon"},
        {"url": {"$regex": "amazon\\\\.in", "$options": "i"}}
    ],
    "img_url": {"$not": {"$regex": "media-amazon\\\\.com|ssl-images-amazon"}}
}

count = db.UniqueDeals.count_documents(query)
print(f"Total Amazon deals on storefront needing CDN images: {count}")

deals = list(db.UniqueDeals.find(query).limit(10))
for d in deals:
    print(f"  [{d.get('fp_hash')}] {d.get('prod_name', '')[:40]} | img: {d.get('img_url')} | url: {d.get('url')}")
"""
print(run_vm_py(code))
