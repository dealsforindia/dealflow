import re, sys
from typing import Optional
sys.stdout.reconfigure(encoding='utf-8')

AMAZON_AFFILIATE_TAG = 'rudranil0a-21'

def parse_universal_multi_deal_items(text: str, overall_discount: Optional[int] = None) -> list:
    if not text:
        return []
    items = []
    lines = text.strip().split('\n')
    url_pattern = re.compile(r'(https?://[^\s<>"]+)')

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        urls = url_pattern.findall(line_clean)
        if not urls:
            continue
        url = urls[0]
        if any(skip in line_clean.lower() for skip in [
            't.me/dealsforindia', 'join telegram', 'telegram channel', 'whatsapp',
            'follow on', 'join here', 'dealsforindiachannel'
        ]):
            continue

        prefix = line_clean[:line_clean.find(url)].strip()
        cleaned = re.sub(r'^[👉⚡🔹🔸🔥🛍️🏷️📦✨💥🛒•\*\-\s]+', '', prefix).strip()
        cleaned = re.sub(r'^\d+[\.\)\:\-]\s*', '', cleaned).strip()
        cleaned = re.sub(r'[:\-–—\s]+$', '', cleaned).strip()
        if not cleaned:
            suffix = line_clean[line_clean.find(url) + len(url):].strip()
            if suffix:
                cleaned = re.sub(r'^[👉⚡🔹🔸\*\-\:\s]+', '', suffix).strip()

        disc_m = re.search(r'(?:Flat\s*)?(\d{1,2})%\s*(?:off|OFF|Off)', cleaned)
        discount = int(disc_m.group(1)) if disc_m else overall_discount

        price_m = re.search(r'(?:@|\bfor\b|\bat\b|starts?\s*at|₹|rs\.?\s*)\s*₹?\s*([\d,]+)(?!\s*%)', cleaned, re.I)
        price = int(price_m.group(1).replace(',', '')) if price_m else None

        label = re.sub(r'[*_~`]', '', cleaned).strip()
        if not label:
            label = f'Option {len(items) + 1}'
        label = label.strip(' :-–—|')

        clean_url = url
        if 'amazon.in' in clean_url.lower():
            tag = AMAZON_AFFILIATE_TAG or 'rudranil0a-21'
            if 'tag=' not in clean_url:
                sep = '&' if '?' in clean_url else '?'
                clean_url = f'{clean_url}{sep}tag={tag}'

        items.append({
            'label': label,
            'url': clean_url,
            'price': price,
            'discount': discount,
        })

    if len(items) >= 2:
        return items
    return []

# Test 1: Single deal (must return empty list)
single = 'Asian Paints Decor Stencil: https://amazon.in/dp/B08XYZ'
print('Single deal items count:', len(parse_universal_multi_deal_items(single)))

# Test 2: Electronics multi deal
elec = '''
Anker Multi-Drop:
⚡ 20W Fast Charger @ ₹599: https://amzn.to/charger20w
⚡ 65W GaN Multi-Port @ ₹1,499: https://amzn.to/charger65w
⚡ 20000mAh Powerbank @ ₹1,899: https://amzn.to/powerbank20k
'''
print('Electronics items count:', len(parse_universal_multi_deal_items(elec)))
for it in parse_universal_multi_deal_items(elec):
    print(' ', it)

# Test 3: Myntra multi deal with overall 85% discount
myntra = '''
👕 Myntra : 85% Off On Pluss Women Clothing.
👉 ⚡Tops: https://myntr.it/6OoLFmx
👉 ⚡Dresses: https://myntr.it/18la34k
👉 ⚡Sweatshirt: https://myntr.it/xLbr76q
👉 ⚡Shirt: https://myntr.it/BFOBvQ9
👉 ⚡Jackets: https://myntr.it/AdqCpPI
👉 ⚡Trousers: https://myntr.it/GNytLjZ
👉 ⚡Co-Ords: https://myntr.it/faDmQBl
👉 ⚡Jeans: https://myntr.it/4CwuY5G
'''
print('Myntra items count:', len(parse_universal_multi_deal_items(myntra, overall_discount=85)))
for it in parse_universal_multi_deal_items(myntra, overall_discount=85):
    print(' ', it)
