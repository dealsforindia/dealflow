import sys

path = r'dealbot_backend/dealbot/store_scraper.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Scoped Amazon Highlights (E46)
old_amz_highlights = """    # Highlights / Feature Bullets
    highlights = []
    for bm in re.finditer(r'<span[^>]*class=["\']a-list-item["\'][^>]*>(.*?)</span>', html, re.I | re.DOTALL):
        txt = re.sub(r'<[^>]+>', ' ', bm.group(1))
        txt = re.sub(r'\\s+', ' ', txt).strip()
        if 15 <= len(txt) <= 220 and not any(bad in txt.lower() for bad in ['cookie', 'customer review', 'sign in', 'warranty', 'return policy', 'delivery', 'to report an issue']):
            highlights.append(txt)
            if len(highlights) >= 4:
                break
    res["highlights"] = highlights"""

new_amz_highlights = """    # Highlights / Feature Bullets - strictly scoped to semantic product feature container (E46)
    highlights = []
    fb_match = re.search(r'<(?:div|ul)[^>]*(?:id=["\'](?:feature-bullets|featurebullets_feature_div|detailBullets_feature_div)["\'])[^>]*>(.*?)</(?:div|ul)>', html, re.I | re.DOTALL)
    search_scope = fb_match.group(1) if fb_match else ""
    if search_scope:
        for bm in re.finditer(r'<span[^>]*class=["\']a-list-item["\'][^>]*>(.*?)</span>', search_scope, re.I | re.DOTALL):
            txt = re.sub(r'<[^>]+>', ' ', bm.group(1))
            txt = re.sub(r'\\s+', ' ', txt).strip()
            bad_phrases = [
                'cookie', 'customer review', 'sign in', 'warranty', 'return policy', 
                'delivery', 'to report an issue', 'protection plan', 'extended warranty',
                'dimension option', 'featured offer', 'sponsored', 'frequently bought',
                'see more', 'terms and conditions', 'prime savings'
            ]
            if 15 <= len(txt) <= 220 and not any(bad in txt.lower() for bad in bad_phrases):
                highlights.append(txt)
                if len(highlights) >= 4:
                    break
    res["highlights"] = highlights"""

# 2. Add is_collection_url helper and tag offer_kind/price_kind (E44)
helper_def = """def is_collection_url(url: str) -> bool:
    \"\"\"Detect if URL is a search or catalog collection rather than a single PDP (E44).\"\"\"
    u = (url or '').lower()
    if 'amazon.' in u:
        if '/s?' in u or '/s/' in u or '/b?' in u or '/b/' in u or 'node=' in u or 'k=' in u:
            if not ('/dp/' in u or '/gp/product/' in u or '/gp/aw/d/' in u):
                return True
    if 'flipkart.' in u or 'shopsy.' in u:
        if '/search?' in u or 'q=' in u:
            if not ('/p/itm' in u or 'pid=' in u):
                return True
    if 'myntra.' in u:
        if '/search' in u or '?' in u:
            if not ('/buy' in u or re.search(r'/\\d{5,}(?:/|$|\\?)', u)):
                return True
    return False

"""

# Insert helper before scrape_product_live
if "def is_collection_url" not in text:
    text = text.replace("# MASTER ENTRY POINT\n# ─────────────────────────────────────────────────────────────────────────────\nasync def scrape_product_live",
                        f"# MASTER ENTRY POINT\n# ─────────────────────────────────────────────────────────────────────────────\n{helper_def}async def scrape_product_live")

# Tag offer_kind and price_kind in scrape_product_live before return details
old_return = """    details["success"] = bool(details.get("title") and details.get("sale_price"))
    return details"""

new_return = """    # Tag offer model: collection vs exact product (E44)
    if is_collection_url(final_url):
        details["offer_kind"] = "collection"
        details["price_kind"] = "from"
    else:
        details["offer_kind"] = "product"
        details["price_kind"] = "exact"

    details["success"] = bool(details.get("title") and details.get("sale_price"))
    return details"""

norm_text = text.replace('\r\n', '\n')
norm_text = norm_text.replace(old_amz_highlights.replace('\r\n', '\n'), new_amz_highlights.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_return.replace('\r\n', '\n'), new_return.replace('\r\n', '\n'))

with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(norm_text.replace('\n', '\r\n'))

print("store_scraper.py patched successfully!")

