import asyncio
import re
from test_new_scraper_logic import fetch_amazon_smart

async def check_img():
    html = await fetch_amazon_smart("B0FLYGLKYQ")
    jpgs = re.findall(r'https://m\.media-amazon\.com/images/I/[A-Za-z0-9+_%-]+\.jpg', html)
    unique_jpgs = list(dict.fromkeys(jpgs))
    print(f"Found {len(unique_jpgs)} unique JPGs:")
    for im in unique_jpgs[:10]:
        print("  *", im)
        
    # Check for landingImage or main-image in html
    m = re.findall(r'(?:landingImage|main-image|largeImage|hiresImage|main-image-container)[^>]{0,150}', html, re.I)
    print("\nDOM image matches:")
    for x in m[:5]:
        print("  -", x)

if __name__ == '__main__':
    asyncio.run(check_img())
