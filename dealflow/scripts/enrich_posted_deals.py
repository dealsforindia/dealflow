import asyncio
import os
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from store_scraper import scrape_product_live

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB", "dealbot")
mc = MongoClient(mongo_uri)
db = mc[db_name]

async def enrich():
    # Find posted deals with missing mrp or missing discount
    deals = list(db['UniqueDeals'].find({
        'status': {'$in': ['posted', 'auto_posted']},
        '$or': [
            {'prices.mrp': None},
            {'prices.mrp': 0},
            {'prices.discount_pct': None}
        ]
    }))
    print(f"Found {len(deals)} posted deals with missing MRP/discount to enrich:")
    
    enriched_count = 0
    for d in deals:
        fp = d.get('fp_hash')
        title = d.get('prod_name') or d.get('title')
        aff_text = d.get('aff_text') or d.get('original_text') or ""
        urls = re.findall(r'https?://[^\s<>"]+', aff_text)
        if not urls:
            continue
        url = urls[0]
        print(f"\nEnriching: {title[:45]} | URL: {url}")
        
        try:
            scraped = await scrape_product_live(url)
            if scraped.get('success') or scraped.get('sale_price'):
                updates = {}
                prices = d.get('prices') or {}
                
                # Update price if scraped has valid sale_price
                if scraped.get('sale_price') and not prices.get('sale'):
                    prices['sale'] = scraped['sale_price']
                
                if scraped.get('mrp') and scraped['mrp'] > (prices.get('sale') or 0):
                    prices['mrp'] = scraped['mrp']
                    if prices.get('sale'):
                        prices['discount_pct'] = round((1 - prices['sale'] / prices['mrp']) * 100)
                
                updates['prices'] = prices
                
                # If clean title available from merchant
                if scraped.get('title') and (not title or len(title) < 15 or "Buy " in title or ":" in title[-10:]):
                    updates['prod_name'] = scraped['title']
                    updates['title'] = scraped['title']
                
                # If high-res image available
                if scraped.get('image_url') and not d.get('img_url'):
                    updates['img_url'] = scraped['image_url']
                    updates['store_img_url'] = scraped['image_url']
                
                if scraped.get('category') and d.get('category') in [None, 'General', 'Special Deal']:
                    updates['category'] = scraped['category']

                if updates:
                    db['UniqueDeals'].update_one({'fp_hash': fp}, {'$set': updates})
                    enriched_count += 1
                    print(f"  -> Enriched successfully! MRP: {prices.get('mrp')}, Discount: {prices.get('discount_pct')}%")
            else:
                print(f"  -> Scrape returned no data: {scraped.get('store')}")
        except Exception as e:
            print(f"  -> Error enriching {fp}: {e}")

    print(f"\n=== FINISHED ENRICHMENT: {enriched_count} deals updated ===")

if __name__ == '__main__':
    asyncio.run(enrich())
