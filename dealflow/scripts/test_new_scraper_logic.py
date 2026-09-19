import asyncio
import re
import json
from curl_cffi.requests import AsyncSession
from store_scraper import _parse_amazon, _parse_flipkart

def is_amazon_captcha(html: str) -> bool:
    if not html or len(html) < 15000:
        return True
    lower = html.lower()
    if "enter the characters you see below" in lower or "type the characters you see in this image" in lower:
        return True
    return False

async def fetch_amazon_smart(asin: str):
    urls_and_uas = [
        (f"https://www.amazon.in/gp/aw/d/{asin}", "chrome120", True),
        (f"https://www.amazon.in/dp/{asin}", "chrome124", False),
        (f"https://www.amazon.in/gp/aw/d/{asin}", "chrome124", False),
    ]
    for url, imp, mobile in urls_and_uas:
        ua = "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36" if mobile else "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
        hdrs = {
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-IN,en-GB;q=0.9,en;q=0.8",
        }
        try:
            async with AsyncSession(impersonate=imp) as s:
                r = await s.get(url, headers=hdrs, timeout=12)
                if r.status_code == 200 and not is_amazon_captcha(r.text):
                    print(f"Amazon fetch success on {url} ({imp}, mobile={mobile}) len={len(r.text)}")
                    return r.text
        except Exception as e:
            print(f"Fetch err: {e}")
    return ""

def parse_flipkart_enhanced(html: str, url: str) -> dict:
    res = _parse_flipkart(html, url)
    # 1. Enhanced clean title from JSON-LD
    for jm in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.DOTALL):
        try:
            jdata = json.loads(jm.group(1).strip())
            if isinstance(jdata, list) and jdata:
                jdata = jdata[0]
            if isinstance(jdata, dict) and jdata.get("name"):
                n = str(jdata["name"]).strip()
                if len(n) > 5 and ":" not in n[-10:]:
                    res["title"] = n
                if not res.get("image_url") and jdata.get("image"):
                    im = jdata["image"]
                    res["image_url"] = im[0] if isinstance(im, list) else im
                break
        except Exception:
            pass

    # 2. Enhanced MRP from embedded JSON
    if not res.get("mrp"):
        for pat in [
            r'["\']mrp["\']\s*:\s*([\d.]+)',
            r'\\"[Mm][Rr][Pp]\\"\s*:\s*([\d.]+)',
            r'["\']maximumRetailPrice["\']\s*:\s*([\d.]+)',
        ]:
            m_json = re.search(pat, html)
            if m_json:
                try:
                    v = float(m_json.group(1))
                    if v > (res.get("sale_price") or 0):
                        res["mrp"] = v
                        break
                except Exception:
                    pass

    if res.get("mrp") and res.get("sale_price") and res["mrp"] > res["sale_price"]:
        res["discount_pct"] = round((1 - res["sale_price"] / res["mrp"]) * 100)
    return res

async def test_all():
    print("=== TEST 1: Amazon Safari Trolley (B0FLYGLKYQ) ===")
    html1 = await fetch_amazon_smart("B0FLYGLKYQ")
    res1 = _parse_amazon(html1, "https://www.amazon.in/dp/B0FLYGLKYQ")
    print("Result B0FLYGLKYQ:", json.dumps(res1, indent=2))

    print("\n=== TEST 2: Amazon Teakwood Trolley (B0CX8ZTM7H) ===")
    html2 = await fetch_amazon_smart("B0CX8ZTM7H")
    res2 = _parse_amazon(html2, "https://www.amazon.in/dp/B0CX8ZTM7H")
    print("Result B0CX8ZTM7H:", json.dumps(res2, indent=2))

    print("\n=== TEST 3: Flipkart DOVE Body Wash ===")
    from stealth_fetcher import stealth_get_async
    fk_url = "https://www.flipkart.com/dove-nourishing-body-wash-sensitive-skin-24hrs-moisture-lock/p/itm377f3a3844e03"
    fk_resp = await stealth_get_async(fk_url, mobile=False)
    res3 = parse_flipkart_enhanced(fk_resp.text, fk_url)
    print("Result Flipkart DOVE:", json.dumps(res3, indent=2))

if __name__ == '__main__':
    asyncio.run(test_all())
