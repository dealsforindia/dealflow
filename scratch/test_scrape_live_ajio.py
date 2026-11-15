import asyncio
import sys
from pathlib import Path

sys.path.insert(0, "/home/rudranil777/dealbot")
from store_scraper import scrape_product_live, resolve_canonical_url

async def main():
    url = "https://ajiio.in/ebbK5d6"
    print("Testing resolve_canonical_url:")
    canon = await resolve_canonical_url(url)
    print("Canonical URL:", canon)
    
    print("\nTesting scrape_product_live:")
    data = await scrape_product_live(url, raw_text="Svaara Women's Clothing @ ₹128 (Steal Deal)")
    print("Store:", data.get("store"))
    print("Title:", data.get("title"))
    print("Sale Price:", data.get("sale_price"))
    print("MRP:", data.get("mrp"))
    print("Image URL:", data.get("image_url"))

if __name__ == "__main__":
    asyncio.run(main())
