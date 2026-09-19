import asyncio
from stealth_fetcher import stealth_unshorten_deep
from store_scraper import scrape_product_live

async def main():
    url = "https://fkrt.cc/hIS88BK"
    print("Resolving URL:", url)
    canonical = stealth_unshorten_deep(url)
    print("Canonical:", canonical)
    
    data = await scrape_product_live(url)
    print("\nScraped Data:")
    for k, v in data.items():
        print(f"  {k}: {v}")

if __name__ == "__main__":
    asyncio.run(main())
