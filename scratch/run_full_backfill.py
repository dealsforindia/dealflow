import subprocess

remote_code = r'''
import os, sys, time
sys.path.insert(0, "/home/rudranil777/dealbot")
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
from price_history_tracker import extract_canonical_id

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

print("Starting full database canonical_key & PriceHistory backfill...")
cursor = db.UniqueDeals.find(
    {"$or": [{"canonical_key": {"$exists": False}}, {"canonical_key": None}, {"canonical_key": ""}]},
    {"fp_hash": 1, "asin": 1, "aff_text": 1, "original_text": 1, "url": 1, "expanded_urls": 1, "prod_name": 1, "title": 1, "prices": 1, "ts": 1, "store": 1, "platform": 1}
)

updated = 0
inserted_ph = 0
batch_updates = []

for d in cursor:
    cid = extract_canonical_id(d)
    if cid:
        db.UniqueDeals.update_one({"_id": d["_id"]}, {"$set": {"canonical_key": cid}})
        updated += 1
        
        sale = (d.get("prices") or {}).get("sale") or d.get("sale_price") or d.get("price")
        mrp = (d.get("prices") or {}).get("mrp") or d.get("mrp")
        ts = d.get("ts") or time.time()
        if sale and float(sale) > 0:
            exists = db.PriceHistory.find_one({"canonical_id": cid, "ts": ts})
            if not exists:
                db.PriceHistory.insert_one({
                    "canonical_id": cid,
                    "sale_price": float(sale),
                    "price": float(sale),
                    "mrp": float(mrp) if mrp and float(mrp) > 0 else None,
                    "store": d.get("platform") or d.get("store") or "Direct",
                    "title": (d.get("prod_name") or d.get("title") or "")[:120],
                    "ts": ts
                })
                inserted_ph += 1
        
        if updated % 500 == 0:
            print(f"Progress: Updated {updated} deals, Inserted {inserted_ph} price points...")

print(f"Full backfill finished! Updated {updated} deals with canonical_key, Inserted {inserted_ph} price points in PriceHistory.")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:", res.stdout.encode('ascii', errors='replace').decode('ascii'))
print("STDERR:", res.stderr.encode('ascii', errors='replace').decode('ascii'))
