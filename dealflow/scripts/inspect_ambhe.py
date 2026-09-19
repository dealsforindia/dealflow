from pymongo import MongoClient
import requests
import re
import urllib.parse

db = MongoClient()["dealbot"]
deal = db.UniqueDeals.find_one({"original_text": {"$regex": "ambhedeal"}})
if not deal:
    deal = db.UniqueDeals.find_one({"aff_text": {"$regex": "ambhedeal"}})

if deal:
    print("=== DEAL FOUND ===")
    print("ID:", deal.get("_id"))
    print("FP:", deal.get("fp_hash"))
    print("Title:", deal.get("prod_name"))
    print("Category:", deal.get("category"))
    print("Prices:", deal.get("prices"))
    print("Aff Text:", deal.get("aff_text"))
    print("Original Text:", deal.get("original_text"))

    urls = re.findall(r'https?://[^\s]+', deal.get("original_text") or deal.get("aff_text") or "")
    print("URLs:", urls)
    for u in urls:
        if "ambhedeal" in u:
            print("Fetching ambhedeal URL:", u)
            try:
                r = requests.get(u, headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, timeout=10)
                print("Final URL:", r.url)
                print("Status:", r.status_code)
                print("HTML preview:", r.text[:300])
            except Exception as e:
                print("Error fetching:", e)
else:
    print("No deal with ambhedeal found.")
