import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_py

code = """
import sys
sys.path.insert(0, '/home/rudranil777/dealbot')
import os, re, asyncio
import pymongo
from dotenv import load_dotenv
from store_scraper import scrape_product_live

load_dotenv("/home/rudranil777/dealbot/.env")
client = pymongo.MongoClient(os.getenv("MONGODB_URI") or os.getenv("MONGO_URI"))
db = client[os.getenv("MONGODB_DB") or "dealbot"]

# Find all storefront deals with Amazon URLs where img_url is not already a real CDN image
query = {
    "status": {"$in": ["posted", "auto_posted", "approved", "published", "broadcasted", "archived"]},
    "$or": [
        {"store": "Amazon"},
        {"platforms": "Amazon"},
        {"url": {"$regex": "amazon\\\\.in", "$options": "i"}}
    ],
    "img_url": {"$not": {"$regex": "media-amazon\\\\.com|ssl-images-amazon"}}
}

deals = list(db.UniqueDeals.find(query).sort("ts", -1).limit(50))
print(f"Healing {len(deals)} storefront Amazon deals...")

async def heal_storefront():
    healed = 0
    for d in deals:
        fp = d.get("fp_hash")
        url = d.get("url") or d.get("canonical_url")
        m_asin = re.search(r'/(?:dp|gp/product|gp/aw/d)/([A-Z0-9]{10})', url or "", re.I)
        asin = m_asin.group(1).upper() if m_asin else d.get("asin")
        
        target_url = f"https://www.amazon.in/gp/aw/d/{asin}" if asin else url
        if not target_url:
            continue
            
        try:
            details = await scrape_product_live(target_url)
            real_img = details.get("image_url")
            if real_img and ("media-amazon.com" in real_img or "ssl-images-amazon" in real_img):
                db.UniqueDeals.update_one(
                    {"fp_hash": fp},
                    {"$set": {
                        "img_url": real_img,
                        "store_img_url": real_img,
                        "image_source": "amazon_cdn_direct",
                        "asin": asin
                    }}
                )
                healed += 1
                print(f"  [HEALED] {fp} | {d.get('prod_name', '')[:35]} -> {real_img[:60]}")
            else:
                print(f"  [FAILED] {fp} | No CDN image found (got: {real_img})")
        except Exception as e:
            print(f"  [ERROR] {fp}: {e}")
            
    print(f"Total storefront deals healed: {healed}/{len(deals)}")

asyncio.run(heal_storefront())
"""
print(run_vm_py(code))
