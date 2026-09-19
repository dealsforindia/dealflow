import os
import sys
import re
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
print(f"Connecting to MongoDB Atlas: {db_name}...", flush=True)

client = MongoClient(mongo_uri)
db = client[db_name]
TAG = os.getenv("AMAZON_AFFILIATE_TAG", "dealshare0b7-21")

deals = list(db.UniqueDeals.find({
    "$or": [
        {"aff_text": {"$regex": "ambhedeal", "$options": "i"}},
        {"ai_formatted_text": {"$regex": "ambhedeal", "$options": "i"}},
        {"message": {"$regex": "ambhedeal", "$options": "i"}},
        {"original_text": {"$regex": "ambhedeal", "$options": "i"}}
    ]
}))

print(f"Total deals with ambhedeal: {len(deals)}", flush=True)

cleaned_count = 0
for d in deals:
    fp = d.get("fp_hash")
    aff = d.get("aff_text") or ""
    ai_text = d.get("ai_formatted_text") or ""
    orig = d.get("original_text") or ""
    asin = d.get("asin")
    exp_urls = d.get("expanded_urls") or {}
    
    real_amz_url = None
    if asin:
        real_amz_url = f"https://www.amazon.in/dp/{asin}?tag={TAG}"
    else:
        for orig_u, exp_u in exp_urls.items():
            if "amazon" in exp_u or "amzn" in exp_u:
                clean_exp = re.sub(r'tag=[^&]+', f'tag={TAG}', exp_u)
                if f"tag={TAG}" not in clean_exp:
                    clean_exp += f"&tag={TAG}" if "?" in clean_exp else f"?tag={TAG}"
                real_amz_url = clean_exp
                break
                
    # Remove ambhedeal markdown links [ ](https://ambhedeal...)
    new_aff = re.sub(r'\[\s*\]\(https?://ambhedeal\.in\.net[^\)]+\)', '', aff).strip()
    new_aff = re.sub(r'https?://ambhedeal\.in\.net/\S+', '', new_aff).strip()
    new_aff = re.sub(r'-?\s*Affiliate preview:\s*', '', new_aff, flags=re.I).strip()
    new_aff = re.sub(r'-?\s*Preview:\s*', '', new_aff, flags=re.I).strip()
    new_aff = re.sub(r'\n{3,}', '\n\n', new_aff)
    
    if real_amz_url and ("amazon" not in new_aff):
        new_aff += f"\n\n{real_amz_url}"
        
    new_ai = re.sub(r'\[\s*\]\(https?://ambhedeal\.in\.net[^\)]+\)', '', ai_text).strip()
    new_ai = re.sub(r'https?://ambhedeal\.in\.net/\S+', '', new_ai).strip()
    new_ai = re.sub(r'-?\s*Affiliate preview:\s*', '', new_ai, flags=re.I).strip()
    new_ai = re.sub(r'-?\s*Preview:\s*', '', new_ai, flags=re.I).strip()
    new_ai = re.sub(r'\n{3,}', '\n\n', new_ai)
    if real_amz_url and ("amazon" not in new_ai):
        new_ai += f"\n\n{real_amz_url}"
        
    cat = d.get("category", "")
    prod = (d.get("prod_name") or "").lower()
    if any(k in prod for k in ["cookware", "kadai", "frypan", "pan", "pot", "dinner set", "lunch box", "tiffin", "stove", "burner", "fan", "borosil", "knife", "bottle"]):
        cat = "🏠 Home"
        
    updates = {
        "aff_text": new_aff,
        "ai_formatted_text": new_ai,
        "message": new_ai,
        "category": cat
    }
    if real_amz_url:
        updates["affiliate_applied"] = True
    else:
        updates["affiliate_applied"] = False
        
    db.UniqueDeals.update_one({"fp_hash": fp}, {"$set": updates})
    cleaned_count += 1
    print(f"[{cleaned_count}] Cleaned deal {fp}: {d.get('prod_name')[:35]} -> {cat}", flush=True)

print(f"DONE: Successfully cleaned {cleaned_count} ambhedeal deals.", flush=True)
