import os
import sys
import re
import json
import urllib.request

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def fetch_via_api():
    url = "https://api.rudranil.me/api/v1/deals/pending?limit=100"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        return data.get("deals", [])

def run():
    print("Fetching pending loot drops from DealFlow API...")
    try:
        deals = fetch_via_api()
    except Exception as e:
        print(f"API fetch failed ({e}), trying direct MongoDB...")
        try:
            import pymongo
            client = pymongo.MongoClient(
                "mongodb+srv://dealbot:Rudra2025x@dealbot-cluster.m9o3kr8.mongodb.net/dealbot?appName=dealbot-cluster",
                serverSelectionTimeoutMS=5000
            )
            db = client['dealbot']
            deals = list(db['UniqueDeals'].find({'status': 'pending_approval'}).sort('processed_ts', -1).limit(100))
        except Exception as me:
            print(f"MongoDB connection failed: {me}")
            return

    # Calculate discount_pct if missing
    for d in deals:
        p = d.get("prices") or {}
        sale = p.get("sale")
        mrp = p.get("mrp")
        if sale and mrp and mrp > sale and not p.get("discount_pct"):
            p["discount_pct"] = round((1 - sale / mrp) * 100)

    # Sort by discount percentage descending
    deals.sort(
        key=lambda x: (
            (x.get("prices") or {}).get("discount_pct") or 0,
            -((x.get("prices") or {}).get("sale") or 999999)
        ),
        reverse=True
    )

    print("\n🔥 TOP 10 VERIFIED LOOT DEALS READY TO POST FOR MAXIMUM COMMISSIONS 🔥")
    print("=" * 75)

    count = 0
    for deal in deals:
        prices = deal.get("prices") or {}
        sale = prices.get("sale")
        mrp = prices.get("mrp")
        discount = prices.get("discount_pct") or 0

        if not sale or sale <= 0:
            continue

        title = deal.get("prod_name") or deal.get("title") or "Product"
        title = re.sub(r'[*_~`#]', '', title).strip()

        aff_text = deal.get("aff_text") or deal.get("original_text") or ""
        urls = re.findall(r'https?://[^\s<>"]+', aff_text)
        buy_url = urls[0] if urls else deal.get("url", "N/A")

        store = (deal.get("platforms") or ["Deal"])[0] if deal.get("platforms") else "Online"
        if "amazon." in buy_url or "amzn" in buy_url: store = "Amazon"
        elif "flipkart." in buy_url or "fkrt" in buy_url: store = "Flipkart"
        elif "myntra." in buy_url: store = "Myntra"
        elif "ajio." in buy_url: store = "AJIO"

        count += 1
        mrp_str = f"~~₹{mrp:,.0f}~~" if mrp else "N/A"
        savings = (mrp - sale) if mrp and mrp > sale else 0
        sav_str = f" | 💰 Save: ₹{savings:,.0f}" if savings else ""

        print(f"#{count} [{store}] ⭐ {title[:65]}")
        print(f"   💵 Loot Price: ₹{sale:,.0f} | MRP: {mrp_str} | 🔥 {discount}% OFF{sav_str}")
        if deal.get("coupon"):
            print(f"   🎟️ Coupon Code: {deal['coupon']}")
        print(f"   🔗 Affiliate Link: {buy_url}")
        print(f"   🆔 Deal ID: {deal.get('fp_hash') or deal.get('id')}")
        print("-" * 75)

        if count >= 10:
            break

if __name__ == "__main__":
    run()
