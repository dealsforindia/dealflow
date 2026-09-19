import asyncio
from curl_cffi.requests import AsyncSession
import re

async def test_asin(asin):
    url_dp = f"https://www.amazon.in/dp/{asin}"
    url_aw = f"https://www.amazon.in/gp/aw/d/{asin}"
    
    uas = [
        ("Android Chrome", "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36", "chrome120"),
        ("Desktop Chrome 124", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", "chrome124"),
        ("Safari iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "safari17_0"),
    ]

    for label, ua, imp in uas:
        for u in [url_aw, url_dp]:
            hdrs = {
                "User-Agent": ua,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-IN,en-GB;q=0.9,en;q=0.8",
            }
            try:
                async with AsyncSession(impersonate=imp) as s:
                    r = await s.get(u, headers=hdrs, timeout=10)
                    text = r.text
                    is_captcha = "captcha" in text.lower() or "robot" in text.lower()
                    title_m = re.search(r'<title>(.*?)</title>', text, re.I | re.DOTALL)
                    t = title_m.group(1).strip() if title_m else ""
                    print(f"[{label}] {u.split('.in')[-1]} -> Status: {r.status_code}, len={len(text)}, captcha={is_captcha}, title={t[:45]}")
            except Exception as e:
                print(f"[{label}] Error: {e}")

async def run():
    print("Testing B0FLYGLKYQ (Safari Bag):")
    await test_asin("B0FLYGLKYQ")
    print("\nTesting B0CX8ZTM7H (Teakwood Bag):")
    await test_asin("B0CX8ZTM7H")

if __name__ == '__main__':
    asyncio.run(run())
