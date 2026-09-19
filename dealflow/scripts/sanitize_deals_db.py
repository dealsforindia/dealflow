#!/usr/bin/env python3
import os
import re
import time
from pymongo import MongoClient
from dotenv import load_dotenv

import dns.resolver
dns.resolver.default_resolver = dns.resolver.Resolver()
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']

MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb+srv://dealbot:Rudra2025x@dealbot-cluster.m9o3kr8.mongodb.net/dealbot?appName=dealbot-cluster"
DB_NAME = os.getenv("MONGODB_DB") or os.getenv("MONGO_DB", "dealbot")
AMAZON_TAG = os.getenv("AMAZON_AFFILIATE_TAG", os.getenv("AMAZON_TAG", "dealshare0b7-21"))

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db["UniqueDeals"]

def scrub_legacy_format(text: str) -> str:
    if not text: return ''
    t = text
    t = re.sub(r'^[🔴🟡✅🔥☠️]\s*\*\d+/\d+\*.*?\n', '', t, flags=re.M)
    t = re.sub(r'^🏪[^\n]*\n', '', t, flags=re.M)
    t = re.sub(r'^💵[^\n]*\n', '', t, flags=re.M)
    t = re.sub(r'^📢\s*#[a-zA-Z0-9_]+[^\n]*\n', '', t, flags=re.M)
    t = re.sub(r'\n*💸\s*_\(Profit links added\)_', '', t)
    t = re.sub(r'\n*🤖\s*.*?(?=\n🔗|\n#|\Z)', '', t, flags=re.DOTALL)
    t = re.sub(r'\n*🔗\s*\[Source\]\([^\)]+\)', '', t)
    t = re.sub(r'\n*#[a-zA-Z0-9_]+(?:\s+#[a-zA-Z0-9_]+)*\s*$', '', t)
    return t.strip()

def sanitize_deals():
    cursor = col.find({"status": "pending_approval"})
    updated = 0

    for d in cursor:
        fp = d.get("fp_hash")
        aff = d.get("aff_text", "") or ""
        ai_txt = d.get("ai_formatted_text", "") or ""
        msg = d.get("message", "") or ""
        prod_name = d.get("prod_name", "") or ""
        prices = d.get("prices") or {}
        p_sale = prices.get("sale")
        p_str = f" @ ₹{p_sale:,.0f}" if p_sale else ""
        platforms = d.get("platforms") or ["Amazon India"]
        store = platforms[0] if platforms else "Store"

        needs_update = False
        updates = {}

        # 1. Check for legacy format_rated junk
        for f, val in [("aff_text", aff), ("ai_formatted_text", ai_txt), ("message", msg)]:
            if any(j in str(val) for j in ['Profit links added', '[Source](', '🤖', '/10*', 'AVERAGE*', 'GOOD DEAL*']):
                cleaned = scrub_legacy_format(val)
                # If cleaned is still empty or too short, synthesize clean post
                urls = re.findall(r'https?://\S+', cleaned) or re.findall(r'https?://\S+', aff) or re.findall(r'https?://\S+', d.get("original_text", ""))
                link = urls[0] if urls else ""
                clean_post = f"{prod_name}{p_str}\n\n{link}\n\nAvailable on: {store}".strip()
                updates[f] = clean_post
                needs_update = True

        # 2. Fix Borosil water bottle deal if matching
        if "borosil" in prod_name.lower() or "kp5yolj" in str(d):
            clean_amz_link = f"https://www.amazon.in/dp/B0FB3SZJN9?tag={AMAZON_TAG}"
            post = f"Larah by Borosil 700 ml Stainless Steel Water Bottle @ ₹271 (Final Price)\n\n{clean_amz_link}\n\nAvailable on: Amazon India"
            updates["asin"] = "B0FB3SZJN9"
            updates["affiliate_applied"] = True
            updates["platforms"] = ["Amazon India"]
            updates["aff_text"] = post
            updates["ai_formatted_text"] = post
            updates["message"] = post
            needs_update = True

        # 3. Check for any unshortened amazn.ltd link
        if "amazn.ltd" in str(updates.get("aff_text", aff)) or "amazn.ltd" in str(updates.get("ai_formatted_text", ai_txt)):
            for f in ["aff_text", "ai_formatted_text", "message"]:
                cur_v = updates.get(f, d.get(f, ""))
                if "amazn.ltd" in cur_v and "B0FB3SZJN9" in str(d.get("asin", "")):
                    updates[f] = cur_v.replace("https://amazn.ltd/share/kp5yolj", f"https://www.amazon.in/dp/B0FB3SZJN9?tag={AMAZON_TAG}")
                    updates["affiliate_applied"] = True
                    needs_update = True

        if needs_update:
            col.update_one({"_id": d["_id"]}, {"$set": updates})
            updated += 1
            print(f"Sanitized deal: {fp} | {prod_name[:40]}")

    print(f"Total deals sanitized in MongoDB: {updated}")

if __name__ == "__main__":
    sanitize_deals()
