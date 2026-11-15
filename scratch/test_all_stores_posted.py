import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
import urllib.request, json

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

stores = ["myntra", "ajio", "flipkart", "amazon", "swiggy", "blinkit", "shopsy"]

for st in stores:
    deals = list(db.UniqueDeals.find({
        "status": {"$in": ["posted", "auto_posted"]},
        "$or": [
            {"store": {"$regex": st, "$options": "i"}},
            {"platforms": {"$regex": st, "$options": "i"}},
            {"aff_text": {"$regex": st, "$options": "i"}}
        ]
    }).limit(2))
    
    print(f"\n=== Store: {st.upper()} ({len(deals)} found) ===")
    for d in deals:
        fp = d.get("fp_hash")
        pname = (d.get("prod_name") or d.get("title") or "")[:35]
        sale = (d.get("prices") or {}).get("sale") or d.get("sale_price") or d.get("price")
        
        try:
            req = urllib.request.Request(f"http://127.0.0.1:8000/api/v1/deals/{fp}/price-history")
            with urllib.request.urlopen(req, timeout=5) as r:
                data = json.loads(r.read().decode())
                hist = data.get("history", [])
                ck = data.get("canonical_key")
                print(f"  [{fp}] {pname} | Sale: Rs.{sale} | Key: {ck} | Points: {len(hist)}")
                if hist:
                    print(f"    History: {hist}")
        except Exception as ex:
            print(f"  [{fp}] Error: {ex}")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
