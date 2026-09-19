import asyncio
import os
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from store_scraper import scrape_product_live

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db = MongoClient(mongo_uri)[os.getenv("MONGODB_DB", "dealbot")]

async def enrich_recent():
    deals = list(db['UniqueDeals'].find(
        {'status': {'$in': ['posted', 'auto_posted']}}
    ).sort('processed_ts', -1).limit(20))
    
    print(f"Checking top {len(deals)} recent deals:")
    for d in deals:
        fp = d.get('fp_hash')
        title = d.get('prod_name') or d.get('title')
        prices = d.get('prices') or {}
        aff_text = d.get('aff_text') or d.get('original_text') or ""
        urls = re.findall(r'https?://[^\s<>"]+', aff_text)
        if not urls:
            continue
        url = urls[0]
        
        # If missing MRP or discount, enrich immediately
        if not prices.get('mrp') or not prices.get('discount_pct'):
            print(f"\n[ENRICHING] {title[:40]} | {url}")
            try:
                sc = await scrape_product_live(url)
                if sc.get('sale_price') or sc.get('mrp'):
                    updates = {}
                    if sc.get('sale_price') and not prices.get('sale'):
                        prices['sale'] = sc['sale_price']
                    if sc.get('mrp') and sc['mrp'] > (prices.get('sale') or 0):
                        prices['mrp'] = sc['mrp']
                    if prices.get('mrp') and prices.get('sale') and prices['mrp'] > prices['sale']:
                        prices['discount_pct'] = round((1 - prices['sale'] / prices['mrp']) * 100)
                    
                    updates['prices'] = prices
                    if sc.get('title') and (not title or len(title) < 15 or "Buy " in title or ":" in title[-10:]):
                        updates['prod_name'] = sc['title']
                        updates['title'] = sc['title']
                    if sc.get('image_url') and not d.get('img_url'):
                        updates['img_url'] = sc['image_url']
                        
                    db['UniqueDeals'].update_one({'fp_hash': fp}, {'$set': updates})
                    print(f"  -> SUCCESS! Price: {prices.get('sale')}, MRP: {prices.get('mrp')}, Disc: {prices.get('discount_pct')}%")
                else:
                    print("  -> Scraper returned no price data")
            except Exception as e:
                print(f"  -> Error: {e}")
        else:
            print(f"[OK] {title[:35]} | Price={prices.get('sale')}, MRP={prices.get('mrp')}, Disc={prices.get('discount_pct')}%")

if __name__ == '__main__':
    asyncio.run(enrich_recent())
