import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import pymongo, os, re
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
db_name = os.getenv("MONGODB_DB") or "dealbot"
uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
db = client[db_name]

query = {
    "$or": [
        {"store": "Amazon"},
        {"platforms": "Amazon"},
        {"url": {"$regex": "amazon\\\\.in", "$options": "i"}}
    ]
}

total = db.UniqueDeals.count_documents(query)
print(f"Total Amazon deals in DB: {total}")

recent = list(db.UniqueDeals.find(query).sort("ts", -1).limit(20))
cdn_count = 0
logo_count = 0

for d in recent:
    img = d.get("img_url") or ""
    is_cdn = "media-amazon.com" in img or "ssl-images-amazon" in img
    if is_cdn:
        cdn_count += 1
    else:
        logo_count += 1
        print(f"PLACEHOLDER: [{d.get('fp_hash')}] {d.get('prod_name', '')[:40]} | img: {img[:60]} | url: {d.get('url', '')[:60]}")

print(f"In latest 20: CDN={cdn_count}, Placeholders={logo_count}")
"""

print(run_vm_py(code))
