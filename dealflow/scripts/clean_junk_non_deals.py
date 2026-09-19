#!/usr/bin/env python3
"""
clean_junk_non_deals.py
Scans MongoDB `UniqueDeals` pending deals, detects non-deal financial leads,
bank accounts, credit cards, loans, refer-and-earn schemes, and purges them.
"""

import os
import re
import time
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB  = os.getenv("MONGODB_DB", "dealbot")

from deal_intelligence import classify_deal_intent

def main():
    if not MONGODB_URI:
        print("Error: MONGODB_URI not set")
        return

    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DB]

    print("🔍 Scanning pending deals for non-deals (financial leads, bank signups, loans, etc.)...")
    cursor = db.UniqueDeals.find(
        {"status": "pending_approval"},
        {"fp_hash": 1, "prod_name": 1, "title": 1, "original_text": 1, "aff_text": 1, "expanded_urls": 1, "prices": 1}
    )

    pending_deals = list(cursor)
    print(f"Total pending deals to scan: {len(pending_deals)}")

    dummy_titles = {
        "curated special deal", "amazon prime special", "flipkart super deal",
        "myntra curated fashion deal", "ajio trends offer", "desidime handpicked deal",
        "deal of the day", "smart banking, bigger savings!", "unverified deal"
    }

    purged = []
    for d in pending_deals:
        text = d.get("original_text") or d.get("aff_text") or ""
        urls_val = d.get("expanded_urls")
        urls = []
        if isinstance(urls_val, dict):
            urls = list(urls_val.values())
        elif isinstance(urls_val, list):
            urls = list(urls_val)
        if not urls:
            urls = re.findall(r'https?://\S+', text)

        # Also check title specifically for banking/lead terms
        title = (d.get("prod_name") or d.get("title") or "").strip()
        prices = d.get("prices") or {}
        sale_p = prices.get("sale") or 0

        # Purge fake dummy mockup deals
        if title.lower() in dummy_titles or (sale_p <= 0 and not urls):
            purged.append((d["fp_hash"], title or "Dummy Mockup", "DUMMY_MOCKUP", "Synthetic fake title or invalid price"))
            continue

        intent_res = classify_deal_intent(f"{title}\n{text}", urls)
        if not intent_res["is_deal"]:
            purged.append((d["fp_hash"], title, intent_res["intent"], intent_res["reason"]))

    print(f"\nFound {len(purged)} non-deals to purge:")
    for fp, t, intent, reason in purged[:25]:
        print(f"  ❌ [{intent}] {t[:50]} (Reason: {reason})")

    if purged:
        hashes = [p[0] for p in purged]
        res = db.UniqueDeals.update_many(
            {"fp_hash": {"$in": hashes}},
            {"$set": {
                "status": "rejected",
                "rejected_ts": time.time(),
                "rejection_reason": "non_deal_financial_lead",
                "deal_intent": "FINANCIAL_LEAD"
            }}
        )
        print(f"\n✅ Successfully rejected {res.modified_count} non-deal financial leads from pending queue!")
    else:
        print("\n✅ Queue is already clean of non-deals.")

if __name__ == "__main__":
    main()
