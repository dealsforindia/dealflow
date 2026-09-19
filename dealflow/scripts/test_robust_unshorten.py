import urllib.request
from urllib.parse import urlparse, parse_qs, unquote, urljoin
import re

def robust_unshorten(url: str, max_depth=6) -> str:
    current = url
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9'
    }

    for depth in range(max_depth):
        p = urlparse(current)
        domain = p.netloc.lower().lstrip("www.")

        # Special Lehlah shortcut
        if domain in ('amazn.ltd', 'app.lehlah.club', 'lehlah.club'):
            if '?tg=' not in current and '&tg=' not in current:
                sep = '&' if '?' in current else '?'
                current = f"{current}{sep}tg=1"
                p = urlparse(current)
                domain = p.netloc.lower().lstrip("www.")

        # Check query parameters for embedded destination URLs
        qs = parse_qs(p.query)
        unpacked = False
        for param in ['url', 'target', 'targetUrl', 'destination', 'dl', 'link', 'dest', 'redirect_url', 'ru']:
            if param in qs and qs[param]:
                cand = unquote(qs[param][0])
                if cand.startswith('http') and cand != current:
                    current = cand
                    unpacked = True
                    break
        if unpacked:
            continue

        # If it's already a full Amazon / Flipkart / Myntra / Ajio / Swiggy link, stop
        if any(store in domain for store in ['amazon.', 'flipkart.com', 'shopsy.in', 'myntra.com', 'ajio.com', 'swiggy.com', 'blinkit.com']):
            break

        try:
            req = urllib.request.Request(current, headers=headers)
            opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
            with opener.open(req, timeout=10) as resp:
                final_url = resp.url
                if final_url != current:
                    current = final_url
                    continue

                html = resp.read().decode('utf-8', errors='ignore')

                # 1. Search for Amazon/Flipkart/Shopsy in HTML
                amz = re.search(r'https?://(?:www\.)?amazon\.in/dp/([A-Z0-9]{10})[^\s"\'<>]*', html)
                if amz:
                    return amz.group(0)

                flip = re.search(r'https?://(?:www\.)?flipkart\.com/[^\s"\'<>]+/p/itm[a-zA-Z0-9]+[^\s"\'<>]*', html)
                if flip:
                    return flip.group(0)

                shopsy = re.search(r'https?://(?:www\.)?shopsy\.in/[^\s"\'<>]+/p/itm[a-zA-Z0-9]+[^\s"\'<>]*', html)
                if shopsy:
                    return shopsy.group(0)

                # 2. Check for JS redirect (including relative paths!)
                js_m = re.search(r'(?:window\.location\.replace|location\.href\s*=|location\s*=)\s*\(?["\']([^"\'\s>]+)["\']', html)
                if js_m:
                    cand = js_m.group(1).replace('\\/', '/').strip()
                    if cand:
                        cand = urljoin(current, cand)
                        if cand != current:
                            current = cand
                            continue

                # 3. Check for meta refresh
                meta_m = re.search(r'<meta[^>]+http-equiv=["\']refresh["\'][^>]+content=["\'][^;]+;\s*url=([^"\'\s>]+)', html, re.I)
                if meta_m:
                    cand = meta_m.group(1).strip()
                    if cand:
                        cand = urljoin(current, cand)
                        if cand != current:
                            current = cand
                            continue

                # 4. Check for ASIN in html
                asin_m = re.search(r'/dp/([A-Z0-9]{10})', html) or re.search(r'B0[A-Z0-9]{8}', html)
                if asin_m and ('amazon' in domain or 'amazn' in domain or 'lehlah' in domain):
                    return f"https://www.amazon.in/dp/{asin_m.group(0) if not asin_m.group(0).startswith('/dp/') else asin_m.group(1)}"

                break
        except Exception as e:
            print("Fetch error:", e)
            break

    return current

test_url = 'https://amazn.ltd/share/kp5yolj'
res = robust_unshorten(test_url)
print("Result for", test_url, "=>", res)
