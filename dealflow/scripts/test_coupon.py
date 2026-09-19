import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
import re
from bs4 import BeautifulSoup

url = 'https://www.amazon.in/dp/B0DM1JBDQP'
headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'en-IN,en-GB,en-US;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}
r = requests.get(url, headers=headers, timeout=15)
soup = BeautifulSoup(r.text, 'html.parser')

print("--- Searching coupon elements ---")
seen = set()
for el in soup.find_all(attrs={"class": re.compile(r'coupon', re.I)}):
    text = el.get_text(' ', strip=True)
    if text and text not in seen and len(text) < 200:
        seen.add(text)
        print(f"CLASS match [{el.get('class')}]: {text}")

for el in soup.find_all(attrs={"id": re.compile(r'coupon', re.I)}):
    text = el.get_text(' ', strip=True)
    if text and text not in seen and len(text) < 200:
        seen.add(text)
        print(f"ID match [{el.get('id')}]: {text}")

def extract_amazon_coupon(soup, price_val=None):
    coupon_text = None
    coupon_discount_val = None
    coupon_type = None # 'percent' or 'fixed'
    
    # Check pqv-price-coupon-message or similar
    pqv = soup.find(id=re.compile(r'pqv-price-coupon-message', re.I))
    if pqv:
        raw = pqv.get_text(' ', strip=True)
        # remove "Terms", "Details"
        clean = re.sub(r'\b(terms|details)\b', '', raw, flags=re.I).strip()
        if clean:
            coupon_text = clean

    # Check coupon before apply subheading
    if not coupon_text:
        sub_heading = soup.find(id=re.compile(r'coupons-card-sub-heading-before-apply', re.I))
        if sub_heading:
            coupon_text = sub_heading.get_text(' ', strip=True)

    # Check coupon label or checkbox
    if not coupon_text:
        for selector in ['label[for*="coupon" i]', 'span[id*="coupon" i]', 'div[id*="coupon" i]']:
            for el in soup.select(selector):
                txt = el.get_text(' ', strip=True)
                if 'coupon' in txt.lower() and ('apply' in txt.lower() or 'save' in txt.lower() or '%' in txt or '₹' in txt):
                    clean = re.sub(r'\b(terms|details)\b', '', txt, flags=re.I).strip()
                    if clean and len(clean) < 60:
                        coupon_text = clean
                        break
            if coupon_text:
                break

    # Also check after-apply discount if available (e.g. ₹976.40 discount)
    after_apply = soup.find(id=re.compile(r'coupons-card-sub-heading-after-apply', re.I))
    after_val_text = after_apply.get_text(' ', strip=True) if after_apply else None

    # Parse percentage or fixed value
    if coupon_text:
        pct_match = re.search(r'(\d+(?:\.\d+)?)\s*%', coupon_text)
        fixed_match = re.search(r'[₹Rs\.]*\s*(\d+(?:,\d+)*(?:\.\d+)?)', coupon_text)
        if pct_match:
            coupon_type = 'percent'
            coupon_discount_val = float(pct_match.group(1))
        elif '₹' in coupon_text or 'rs' in coupon_text.lower():
            if fixed_match:
                coupon_type = 'fixed'
                coupon_discount_val = float(fixed_match.group(1).replace(',', ''))
    
    return {
        'coupon_text': coupon_text,
        'coupon_type': coupon_type,
        'coupon_discount_val': coupon_discount_val,
        'after_discount_text': after_val_text
    }

print("Extracted Coupon:", extract_amazon_coupon(soup))

