import asyncio
import json
from store_scraper import scrape_product_live

async def test():
    urls = [
        "https://www.amazon.in/dp/B0CX8ZTM7H",
        "https://www.amazon.in/dp/B0FLYGLKYQ",
        "https://fkrt.cc/heS79aK"
    ]
    for u in urls:
        print("\n--- SCRAPING:", u)
        res = await scrape_product_live(u)
        print("RESULT:", json.dumps(res, indent=2))

if __name__ == '__main__':
    asyncio.run(test())
