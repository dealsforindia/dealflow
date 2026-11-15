import sys

path = r'dealbot_backend/dealbot/api.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace all occurrences of dealshare0b7-21 with rudranil0a-21
text = text.replace('dealshare0b7-21', 'rudranil0a-21')

# Upgrade convert_to_affiliate_link
old_func = '''async def convert_to_affiliate_link(url: str) -> str:
    """
    Converts product URL to affiliate link:
    1. If Amazon: appends/replaces tag with AMAZON_AFFILIATE_TAG (rudranil0a-21).
    2. If not Amazon (Flipkart, Myntra, AJIO, etc.): calls EarnKaro API.
    3. If EarnKaro unsupported/failed: falls back cleanly to destination product URL.
    """
    if not url: return url
    AMAZON_TAG = os.getenv("AMAZON_AFFILIATE_TAG", "rudranil0a-21")
    
    if "amazon." in url.lower():
        import re as _re
        if "tag=" in url:
            return _re.sub(r'tag=[^&]+', f'tag={AMAZON_TAG}', url)
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}tag={AMAZON_TAG}"'''

new_func = '''async def convert_to_affiliate_link(url: str) -> str:
    """
    Converts product URL to affiliate link:
    1. If Amazon: appends/replaces tag with AMAZON_AFFILIATE_TAG (rudranil0a-21) and extracts ASIN.
    2. If not Amazon (Flipkart, Myntra, AJIO, etc.): calls EarnKaro API.
    3. If EarnKaro unsupported/failed: falls back cleanly to destination product URL.
    """
    if not url: return url
    AMAZON_TAG = os.getenv("AMAZON_AFFILIATE_TAG", os.getenv("AMAZON_TAG", "rudranil0a-21"))
    
    # 1. Amazon Affiliate Guarantee
    u_low = url.lower()
    if any(k in u_low for k in ["amazon.", "amzn.to", "amzn.in", "amazn.ltd"]):
        import re as _re
        asin_m = _re.search(r'/(?:dp|gp/product|gp/aw/d)/([A-Za-z0-9]{10})', url, _re.I)
        if asin_m:
            return f"https://www.amazon.in/dp/{asin_m.group(1).upper()}?tag={AMAZON_TAG}"
        if "tag=" in url:
            return _re.sub(r'tag=[^&]+', f'tag={AMAZON_TAG}', url)
        sep = "&" if "?" in url else "?"
        return f"{url}{sep}tag={AMAZON_TAG}"'''

old_func_crlf = old_func.replace('\n', '\r\n')
new_func_crlf = new_func.replace('\n', '\r\n')

if old_func in text:
    text = text.replace(old_func, new_func)
    print("Replaced LF convert_to_affiliate_link")
elif old_func_crlf in text:
    text = text.replace(old_func_crlf, new_func_crlf)
    print("Replaced CRLF convert_to_affiliate_link")
else:
    print("convert_to_affiliate_link signature not matched, check text")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("api.py updated successfully!")
