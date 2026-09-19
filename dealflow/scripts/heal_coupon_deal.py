import os, sys, re, pymongo
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
load_dotenv()

mongo_uri = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(mongo_uri)
db = client[os.getenv("MONGODB_DB", "dealbot")]

# 1. Specifically heal the B0HB5LQY8L deal
target_asin = "B0HB5LQY8L"
deal = db.UniqueDeals.find_one({"$or": [
    {"asin": target_asin},
    {"aff_text": {"$regex": target_asin}},
    {"original_text": {"$regex": target_asin}},
    {"fp_hash": "c090796a989915acb3afc154c639eead"}
]})

if deal:
    fp = deal.get("fp_hash")
    pname = "Waterproof Silicone Sealant Adhesive for Leakage Repair, Fast Drying Roof Sealant for Concrete, Water Tank, Metal, Steel, Aluminum, Iron & B"
    clean_title = "Waterproof Silicone Sealant Adhesive"
    new_aff_text = (
        f"{clean_title} @ ₹269 (Apply 40% coupon)\n\n"
        f"https://www.amazon.in/dp/{target_asin}?tag=dealshare0b7-21\n\n"
        f"MRP: ₹999 (73% off)"
    )
    import time
    new_prices = {
        "sale": 449.0,
        "mrp": 999.0,
        "discount_pct": 73,
        "effective_price": 269.4
    }
    update = {
        "prod_name": pname,
        "coupon": "Apply 40% coupon",
        "coupon_discount": 179.6,
        "effective_price": 269.4,
        "prices": new_prices,
        "aff_text": new_aff_text,
        "ai_formatted_text": new_aff_text,
        "message": new_aff_text,
        "category": "🏠 Home",
        "canonical_url": f"https://www.amazon.in/dp/{target_asin}",
        "ts": time.time()
    }
    db.UniqueDeals.update_one({"_id": deal["_id"]}, {"$set": update})
    print(f"✅ Successfully healed deal {fp} ({target_asin})!")
else:
    print(f"❌ Deal for {target_asin} not found in MongoDB.")

# 2. General scan across pending deals for missed coupons
print("\nScanning recent pending deals for missed coupons...")
pending_deals = list(db.UniqueDeals.find({"status": "pending_approval"}).sort("ts", -1).limit(50))
sys.path.insert(0, "/home/rudranil777/dealbot")
from coupon_extractor import extract_coupon_from_text

count = 0
for d in pending_deals:
    txt = d.get("original_text", "") or d.get("aff_text", "")
    if not d.get("coupon"):
        c_info = extract_coupon_from_text(txt)
        if c_info:
            sale = (d.get("prices") or {}).get("sale")
            up = {"coupon": c_info["coupon"]}
            if sale and c_info.get("value"):
                if c_info["type"] == "percent":
                    disc = round(sale * (c_info["value"] / 100.0), 2)
                    eff = round(sale - disc, 2)
                else:
                    disc = float(c_info["value"])
                    eff = max(0.0, round(sale - disc, 2))
                up["coupon_discount"] = disc
                up["effective_price"] = eff
                curr_prices = d.get("prices") or {}
                curr_prices["effective_price"] = eff
                if curr_prices.get("mrp") and curr_prices["mrp"] > eff:
                    curr_prices["discount_pct"] = round((1 - eff / curr_prices["mrp"]) * 100)
                up["prices"] = curr_prices
            db.UniqueDeals.update_one({"_id": d["_id"]}, {"$set": up})
            print(f"  ✨ Backfilled coupon '{c_info['coupon']}' on: {d.get('prod_name')[:50]}")
            count += 1

print(f"Scan complete. Backfilled {count} pending deals with missed coupons.")
