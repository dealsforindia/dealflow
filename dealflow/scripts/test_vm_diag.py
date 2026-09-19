import sys
import os
import aiohttp
import asyncio

print("Python version:", sys.version)
try:
    import stealth_fetcher
    print("stealth_fetcher: FOUND", stealth_fetcher)
except Exception as e:
    print("stealth_fetcher: NOT FOUND", e)

try:
    import curl_cffi
    print("curl_cffi: FOUND", curl_cffi.__file__)
except Exception as e:
    print("curl_cffi: NOT FOUND", e)

async def test_urls():
    urls = {
        "Amazon": ("https://www.amazon.in/dp/B0CX249CZX", True),
        "Flipkart": ("https://www.flipkart.com/boat-10000-mah-22-5-w-slim-pocket-size-power-bank/p/itm1c8172901c22d", False),
        "AJIO": ("https://www.ajio.com/s/70-to-100-percent-off-4891-62871", False)
    }
    
    headers_desktop = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
    }
    headers_mobile = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
    }

    async with aiohttp.ClientSession() as session:
        for name, (url, is_mobile) in urls.items():
            hdrs = headers_mobile if is_mobile else headers_desktop
            try:
                async with session.get(url, headers=hdrs, timeout=aiohttp.ClientTimeout(total=10), allow_redirects=True) as resp:
                    text = await resp.text()
                    print(f"\n--- {name} ---")
                    print(f"Status: {resp.status}, Length: {len(text)}, Final URL: {resp.url}")
                    # Print first 300 chars or title
                    import re
                    title_m = re.search(r'<title>(.*?)</title>', text, re.I | re.DOTALL)
                    print(f"Title tag: {title_m.group(1).strip() if title_m else 'NO TITLE'}")
                    if "captcha" in text.lower() or "robot" in text.lower():
                        print("WARNING: Captcha / Robot check detected in HTML!")
                    if "access denied" in text.lower():
                        print("WARNING: Access Denied in HTML!")
            except Exception as e:
                print(f"Error fetching {name}: {e}")

asyncio.run(test_urls())
