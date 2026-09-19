import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests, re, json
from bs4 import BeautifulSoup

def extract_amazon_details(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    
    # 1. Product Title
    title = ""
    for sel in ['#title', '#productTitle', 'span.pqv-product-title', 'h1.a-size-medium']:
        el = soup.select_one(sel)
        if el:
            cand = re.sub(r'\s+', ' ', el.get_text(strip=True))
            if len(cand) > 8:
                title = cand
                break
    if not title:
        t_el = soup.find('title')
        if t_el:
            cand = t_el.get_text().split(':')[0].split('|')[0].strip()
            if cand and "Amazon.in" not in cand:
                title = cand

    # 2. Sale Price
    sale_price = None
    
    # Priority A: Check accessibility label (e.g. "₹8,876.34 with 53 percent savings")
    acc_el = soup.find(id=re.compile(r'apex-pricetopay-accessibility-label|priceblock_ourprice|priceblock_dealprice', re.I))
    if acc_el:
        txt = acc_el.get_text(strip=True)
        m = re.search(r'₹?\s*([\d,]+(?:\.\d+)?)', txt)
        if m:
            try:
                v = float(m.group(1).replace(',', ''))
                if 5 <= v <= 500000: sale_price = v
            except: pass

    # Priority B: Twister price JSON
    if not sale_price:
        for script in soup.find_all(['div', 'script']):
            stxt = script.get_text()
            if 'priceAmount' in stxt and 'mobile_buybox' in stxt:
                pm = re.search(r'"priceAmount"\s*:\s*([\d,.]+)', stxt)
                if pm:
                    try:
                        v = float(pm.group(1).replace(',', ''))
                        if 5 <= v <= 500000: sale_price = v; break
                    except: pass

    # Priority C: HTML Price to Pay (ignoring per-unit prices)
    if not sale_price:
        for el in soup.select('.priceToPay, #tp_price_block_total_price_in, .apexPriceToPay'):
            # check parent or container doesn't say per g / per kg
            txt = el.get_text(' ', strip=True)
            if any(u in txt.lower() for u in ['/ 100', '/100', '/ g', '/kg', '/ count']):
                continue
            wm = re.search(r'([\d,]+)\s*\.?\s*(\d{2})?', txt)
            if wm:
                whole = wm.group(1).replace(',', '')
                dec = wm.group(2) or "00"
                try:
                    v = float(f"{whole}.{dec}")
                    if 5 <= v <= 500000: sale_price = v; break
                except: pass

    # 3. MRP (List Price / Basis Price)
    mrp = None
    
    # Priority A: Basis price offscreen label (e.g. "M.R.P.: ₹18,990.00")
    basis_lbl = soup.find(class_=re.compile(r'apex-basisprice-offscreen-label|basisPrice', re.I))
    if basis_lbl:
        txt = basis_lbl.get_text(strip=True)
        m = re.search(r'₹?\s*([\d,]+(?:\.\d+)?)', txt)
        if m:
            try:
                v = float(m.group(1).replace(',', ''))
                if v > (sale_price or 0): mrp = v
            except: pass

    # Priority B: List price text (pqv-price-list-price)
    if not mrp:
        lp_el = soup.find(id='pqv-price-list-price')
        if lp_el:
            m = re.search(r'₹?\s*([\d,]+(?:\.\d+)?)', lp_el.get_text())
            if m:
                try:
                    v = float(m.group(1).replace(',', ''))
                    if v > (sale_price or 0): mrp = v
                except: pass

    # Priority C: Basis price value selector
    if not mrp:
        for el in soup.select('.apex-basisprice-value, span.a-price.a-text-price[data-a-strike="true"]'):
            txt = el.get_text(strip=True)
            m = re.search(r'₹?\s*([\d,]+(?:\.\d+)?)', txt)
            if m:
                try:
                    v = float(m.group(1).replace(',', ''))
                    if v > (sale_price or 0): mrp = v; break
                except: pass

    # Priority D: Search for "M.R.P.: ₹..." text in whole page
    if not mrp:
        for el in soup.find_all(string=re.compile(r'M\.?R\.?P\.?', re.I)):
            parent_txt = el.parent.get_text(' ', strip=True) if el.parent else ""
            # Strip unit pricing in parenthesis like (₹8,87,634 / 100 g)
            clean_txt = re.sub(r'\(.*?\)', '', parent_txt)
            m = re.search(r'M\.?R\.?P\.?\s*[:\s]*₹?\s*([\d,]+(?:\.\d+)?)', clean_txt, re.I)
            if m:
                try:
                    v = float(m.group(1).replace(',', ''))
                    # Protect against unit price
                    if v > (sale_price or 0) and v < 1000000:
                        mrp = v; break
                except: pass

    # 4. Coupon
    coupon_text = None
    coupon_amount = 0.0
    
    pqv = soup.find(id=re.compile(r'pqv-price-coupon-message', re.I))
    if pqv:
        raw = pqv.get_text(' ', strip=True)
        clean = re.sub(r'\b(terms|details)\b', '', raw, flags=re.I).strip()
        if clean: coupon_text = clean

    if not coupon_text:
        sub_heading = soup.find(id=re.compile(r'coupons-card-sub-heading-before-apply', re.I))
        if sub_heading: coupon_text = sub_heading.get_text(' ', strip=True)

    if not coupon_text:
        for el in soup.select('[id*="couponBadge"], .cardification-combo-header-type-COUPON'):
            t = el.get_text(' ', strip=True)
            if any(w in t.lower() for w in ['coupon', 'save', 'apply']):
                coupon_text = t
                break

    # Coupon discount amount
    after_apply = soup.find(id=re.compile(r'coupons-card-sub-heading-after-apply', re.I))
    if after_apply:
        aft_m = re.search(r'₹?\s*([\d,]+(?:\.\d+)?)\s*discount', after_apply.get_text(), re.I)
        if aft_m:
            coupon_amount = float(aft_m.group(1).replace(',', ''))

    if coupon_text and not coupon_amount and sale_price:
        pct_m = re.search(r'(\d+(?:\.\d+)?)\s*%', coupon_text)
        fix_m = re.search(r'(?:₹|rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)', coupon_text, re.I)
        if pct_m:
            pct = float(pct_m.group(1))
            coupon_amount = round(sale_price * (pct / 100.0), 2)
        elif fix_m:
            coupon_amount = float(fix_m.group(1).replace(',', ''))

    # Calculations:
    effective_price = round(sale_price - coupon_amount, 2) if (sale_price and coupon_amount) else sale_price
    discount_pct = round(((mrp - sale_price) / mrp) * 100) if (mrp and sale_price and mrp > sale_price) else 0
    total_savings_pct = round(((mrp - effective_price) / mrp) * 100) if (mrp and effective_price and mrp > effective_price) else discount_pct

    return {
        "title": title,
        "sale_price": sale_price,
        "mrp": mrp,
        "discount_pct": discount_pct,
        "coupon": coupon_text,
        "coupon_discount": coupon_amount,
        "effective_price": effective_price,
        "total_savings_pct": total_savings_pct,
    }

url = 'https://www.amazon.in/dp/B0DM1JBDQP'
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'en-IN,en-GB;q=0.9,en;q=0.8',
}
r = requests.get(url, headers=headers, timeout=15)
res = extract_amazon_details(r.text)
print(json.dumps(res, indent=2, ensure_ascii=False))
