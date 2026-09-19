import urllib.request
from urllib.parse import urlparse, parse_qs, unquote, urljoin
import re

def expand(url: str, depth=0) -> str:
    if depth > 6 or not url:
        return url
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9'
    }
    
    p = urlparse(url)
    domain = p.netloc.lower().lstrip('www.')
    
    # Check query params first
    qs = parse_qs(p.query)
    for qk in ['url', 'target', 'targetUrl', 'destination', 'dl', 'link', 'dest', 'redirect_url', 'ru']:
        if qk in qs and qs[qk]:
            cand = unquote(qs[qk][0])
            if cand.startswith('http') and cand != url:
                return expand(cand, depth + 1)
                
    # Lehlah / amazn.ltd optimization: append ?tg=1 if missing
    req_url = url
    if domain in ('amazn.ltd', 'app.lehlah.club', 'lehlah.club'):
        if 'tg=' not in p.query:
            sep = '&' if '?' in url else '?'
            req_url = f'{url}{sep}tg=1'
            
    try:
        req = urllib.request.Request(req_url, headers=headers)
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
        with opener.open(req, timeout=10) as resp:
            final_url = resp.url
            if final_url != req_url and final_url != url:
                # Followed HTTP redirect
                p_fin = urlparse(final_url)
                if any(store in p_fin.netloc.lower() for store in ['amazon.', 'flipkart.com', 'shopsy.in', 'myntra.com', 'ajio.com']):
                    return final_url
                return expand(final_url, depth + 1)
                
            html = resp.read().decode('utf-8', errors='ignore')
            
            # 1. Amazon direct or ASIN in HTML
            amz = re.search(r'https?://(?:www\.)?amazon\.in/(?:[^/\s"\'<>]+/)?(?:dp|gp/product|gp/aw/d|d)/([A-Za-z0-9]{10})[^\s"\'<>]*', html)
            if amz:
                asin = amz.group(1).upper()
                return f'https://www.amazon.in/dp/{asin}'
                
            asins = re.findall(r'B0[A-Z0-9]{8}', html)
            if asins and ('amazn' in domain or 'lehlah' in domain or 'amazon' in domain):
                return f'https://www.amazon.in/dp/{asins[0]}'
                
            # 2. Flipkart / Shopsy / Myntra in HTML
            flip = re.search(r'https?://(?:www\.)?flipkart\.com/[^\s"\'<>]+/p/itm[a-zA-Z0-9]+[^\s"\'<>]*', html)
            if flip: return flip.group(0)
            
            shopsy = re.search(r'https?://(?:www\.)?shopsy\.in/[^\s"\'<>]+/p/itm[a-zA-Z0-9]+[^\s"\'<>]*', html)
            if shopsy: return shopsy.group(0)
            
            # 3. Encoded ru= in html
            ru_m = re.search(r'[\?&](?:ru|target|url|destination)=(https%3A%2F%2F[^\s"\'&<>]+)', html)
            if ru_m:
                cand = unquote(ru_m.group(1))
                if cand.startswith('http'):
                    return expand(cand, depth + 1)
                    
            # 4. JS redirect (supports relative paths!)
            js_m = re.search(r'(?:window\.location\.replace|location\.href\s*=|location\s*=)\s*\(?["\']([^"\'\s>]+)["\']', html)
            if js_m:
                cand = js_m.group(1).replace('\\/', '/').strip()
                if cand:
                    cand = urljoin(final_url, cand)
                    if cand != url and cand != req_url:
                        return expand(cand, depth + 1)
                        
            # 5. Meta refresh
            meta_m = re.search(r'<meta[^>]+http-equiv=["\']refresh["\'][^>]+content=["\'][^;]+;\s*url=([^"\'\s>]+)', html, re.I)
            if meta_m:
                cand = meta_m.group(1).strip()
                if cand:
                    cand = urljoin(final_url, cand)
                    if cand != url and cand != req_url:
                        return expand(cand, depth + 1)
    except Exception as e:
        print('Error:', e)
    return url

print('Test 1 (amazn.ltd):', expand('https://amazn.ltd/share/kp5yolj'))
print('Test 2 (app.lehlah.club):', expand('https://app.lehlah.club/share/kp5yolj'))
print('Test 3 (amazn.ltd with tg=0):', expand('https://amazn.ltd/share/kp5yolj?tg=0'))
