import asyncio
import re
from test_new_scraper_logic import fetch_amazon_smart

async def check_oos():
    html = await fetch_amazon_smart("B0FLYGLKYQ")
    oos_patterns = [
        r'\bcurrently\s+unavailable\b',
        r'\bout\s+of\s+stock\b',
        r'\btemporarily\s+out\s+of\s+stock\b',
        r'\bitem\s+unavailable\b',
        r'"availability"\s*:\s*"https?://schema\.org/OutOfStock"',
        r'id=["\']outOfStock["\']',
    ]
    for p in oos_patterns:
        m = re.findall(rf'.{{0,40}}{p}.{{0,40}}', html, re.I)
        if m:
            print(f"Pattern {p} found {len(m)} times. First: {repr(m[0].strip())}")

    # Check the real availability container in Amazon
    avail_div = re.findall(r'<div[^>]*id=["\']availability["\'][^>]*>(.*?)</div>', html, re.I | re.DOTALL)
    print("\nAvailability DIV:", [a.strip()[:100] for a in avail_div])
    
    # Check InStock schema
    in_stock = re.findall(r'"availability"\s*:\s*"https?://schema\.org/InStock"', html)
    print("InStock schema matches:", len(in_stock))

if __name__ == '__main__':
    asyncio.run(check_oos())
