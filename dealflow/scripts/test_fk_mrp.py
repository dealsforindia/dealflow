import asyncio
import re
from stealth_fetcher import stealth_get_async
from store_scraper import _parse_flipkart

async def check():
    url = "https://www.flipkart.com/dove-nourishing-body-wash-sensitive-skin-24hrs-moisture-lock/p/itm377f3a3844e03"
    html = await stealth_get_async(url, mobile=False)
    print(f"Status: {html.status_code}, len={len(html.text)}")
    res = _parse_flipkart(html.text, url)
    print("Parsed result:", res)
    
    # Search for all rupee amounts or price classes in html
    matches = re.findall(r'₹\s*[\d,]+', html.text)
    print("All ₹ amounts in HTML:", matches[:15])
    
    classes = re.findall(r'class="[^"]*(?:price|mrp|strike|discount|Nx9bqj|yRaY8j)[^"]*"[^>]*>[^<]+<', html.text, re.I)
    print("Price-related elements in HTML:", classes[:10])

if __name__ == '__main__':
    asyncio.run(check())
