import asyncio
import re
from stealth_fetcher import stealth_get_async
from store_scraper import _parse_amazon

async def check_amz():
    url = "https://www.amazon.in/dp/B0FLYGLKYQ"
    # Test desktop vs mobile
    for mobile in [False, True]:
        print(f"\n--- Testing mobile={mobile} ---")
        resp = await stealth_get_async(url, mobile=mobile)
        print(f"Status: {resp.status_code}, len={len(resp.text)}, final_url={resp.url}")
        res = _parse_amazon(resp.text, url)
        print("Parsed:", res)
        if "captcha" in resp.text.lower() or "robot" in resp.text.lower():
            print("Detected CAPTCHA!")
        title_m = re.search(r'<title>(.*?)</title>', resp.text, re.I | re.DOTALL)
        if title_m:
            print("Title tag:", repr(title_m.group(1).strip()[:100]))

if __name__ == '__main__':
    asyncio.run(check_amz())
