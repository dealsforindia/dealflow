import asyncio
from store_scraper import scrape_product_live

async def test():
    res = await scrape_product_live("https://www.amazon.in/dp/B0F2245Z9Y")
    print("IN_STOCK:", res.get("in_stock"), "PRICE:", res.get("sale_price"), "RES:", res)

asyncio.run(test())
