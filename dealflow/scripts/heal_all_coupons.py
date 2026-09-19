#!/usr/bin/env python3
"""
Audit and heal coupons across pending deals in MongoDB:
1. Validates existing coupons against the upgraded coupon_extractor.
2. If coupon is invalid (e.g. model number like 1BDF), purges it.
3. For Amazon / Store deals without coupons, checks if an on-page coupon exists via store_scraper.
4. Updates effective_price, prices.effective_price, and ai_formatted_text.
"""
import sys, os, time, re, asyncio
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/home/rudranil777/dealbot/.env")
load_dotenv()

mongo_uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
db_name = os.getenv("MONGODB_DB") or os.getenv("MONGO_DB") or "dealbot"
client = MongoClient(mongo_uri)
db = client[db_name]

from coupon_extractor import extract_coupon, extract_coupon_from_text
from store_scraper import scrape_product_live

deals = list(db.UniqueDeals.find({"status": "pending_approval"}))
print(f"Auditing coupons for {len(deals)} pending deals...")

healed_count = 0
purged_count = 0

for d in deals:
    fp = d.get("fp_hash")
    prod = (d.get("prod_name") or "")[:40]
    existing_coupon = d.get("coupon")
    prices = d.get("prices") or {}
    sale_p = prices.get("sale") or d.get("price")
    mrp_p = prices.get("mrp") or d.get("mrp")
    
    # 1. Check if existing coupon is valid
    if existing_coupon:
        full_prod = d.get("prod_name") or d.get("title") or ""
        valid = extract_coupon(existing_coupon, prod_name=full_prod)
        if not valid:
            print(f"[-] Purging false coupon '{existing_coupon}' from {fp} ({prod})")
            
            # Clean post text
            clean_text = d.get("aff_text", "") or d.get("ai_formatted_text", "")
            clean_text = re.sub(r'\n*Apply Coupon:\s*' + re.escape(existing_coupon) + r'[^\n]*', '', clean_text, flags=re.I)
            clean_text = re.sub(r'\(Final Price[^\)]*\)', '', clean_text)
            clean_text = re.sub(r'\s{2,}', '\n\n', clean_text).strip()
            
            up_purge = {
                "coupon": None,
                "coupon_discount": None,
                "effective_price": None,
                "aff_text": clean_text,
                "ai_formatted_text": clean_text,
                "message": clean_text
            }
            db.UniqueDeals.update_one(
                {"fp_hash": fp},
                {"$set": up_purge, "$unset": {"prices.effective_price": ""}}
            )
            purged_count += 1
            existing_coupon = None

    # 2. If it's an Amazon deal without coupon, run live store check
    raw_text = d.get("original_text") or d.get("aff_text") or ""
    urls = re.findall(r'https?://[^\s"\'<>]+', raw_text)
    amz_urls = [u for u in urls if 'amazon' in u.lower() or 'amzn' in u.lower()]
    
    if amz_urls and not existing_coupon:
        try:
            target_url = amz_urls[0]
            loop = asyncio.new_event_loop()
            res = loop.run_until_complete(scrape_product_live(target_url, raw_text=raw_text))
            loop.close()
            
            c = res.get("coupon") or res.get("on_page_coupon")
            eff = res.get("effective_price")
            c_disc = res.get("coupon_discount")
            
            if c and eff:
                print(f"[+] Found on-page coupon '{c}' for {fp} ({prod}): Sale ₹{sale_p} -> Eff ₹{eff}")
                up = {
                    "coupon": c,
                    "coupon_discount": c_disc,
                    "effective_price": eff,
                    "prices.effective_price": eff,
                }
                if res.get("mrp") and res["mrp"] > eff:
                    up["prices.mrp"] = res["mrp"]
                    up["prices.discount_pct"] = round((1 - eff / res["mrp"]) * 100)
                
                # Regenerate post text
                from ai_formatter import generate_clean_post
                loop2 = asyncio.new_event_loop()
                new_post = loop2.run_until_complete(generate_clean_post(
                    aff_text=raw_text,
                    prices={**prices, "sale": sale_p, "effective_price": eff},
                    prod_name=d.get("prod_name") or res.get("title") or "Deal",
                    category=d.get("category", "General"),
                    platforms=d.get("platforms", ["Amazon"]),
                    coupon=c
                ))
                loop2.close()
                if new_post:
                    up["ai_formatted_text"] = new_post
                    up["aff_text"] = new_post
                    up["message"] = new_post
                
                db.UniqueDeals.update_one({"fp_hash": fp}, {"$set": up})
                healed_count += 1
        except Exception as ex:
            pass

print(f"Done! Purged false coupons: {purged_count}, Healed new coupons: {healed_count}")
