import os, sys
sys.path.insert(0, "/home/rudranil777/dealbot")
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient
import urllib.request, json

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

stores = ["Myntra", "Ajio", "Swiggy", "Zomato", "Nykaa"]

for st in stores:
    deal = db.UniqueDeals.find_one({
        "$or": [{"store": {"$regex": st, "$options": "i"}}, {"platforms": {"$regex": st, "$options": "i"}}, {"aff_text": {"$regex": st, "$options": "i"}}]
    })
    if deal:
        fp = deal.get("fp_hash")
        title = (deal.get("prod_name") or deal.get("title") or "")[:40]
        try:
            req = urllib.request.Request(f"http://127.0.0.1:8000/api/v1/deals/{fp}/price-history")
            with urllib.request.urlopen(req, timeout=5) as r:
                data = json.loads(r.read().decode())
                hist = data.get("history", [])
                ck = data.get("canonical_key")
                print(f"Store: {st} | Deal: {title} ({fp})")
                print(f"  Key: {ck} | Points: {len(hist)} | Low: {data.get('price_intelligence', {}).get('lowest')} | High: {data.get('price_intelligence', {}).get('highest')}")
        except Exception as ex:
            print(f"Store: {st} | Error: {ex}")
    else:
        print(f"Store: {st} | No deals found in DB")
