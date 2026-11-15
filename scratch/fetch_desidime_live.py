import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
import requests
from bs4 import BeautifulSoup
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

session = requests.Session()

deal_urls = [
    'https://www.desidime.com/deals/portronics-por-2113-wireless-standard-2175634',
    'https://www.desidime.com/deals/blinkit-x-dark-fantasy-2175137',
    'https://www.desidime.com/deals/ecolink-airomax-bldc-1200mm-ceiling-2175729'
]

for url in deal_urls:
    print("=" * 80)
    print(f"INSPECTING: {url}")
    res = session.get(url, headers=headers, timeout=15)
    if res.status_code != 200:
        print(f"Failed with {res.status_code}")
        continue
    soup = BeautifulSoup(res.text, 'html.parser')
    
    # Title
    title = soup.find('h1')
    title_text = title.get_text(strip=True) if title else "No H1"
    print(f"TITLE: {title_text}")
    
    # Heat / Degrees
    temp_elem = soup.select_one('.degree, .temperature, .deal-temperature, [data-controller="temperature"]')
    temp = temp_elem.get_text(strip=True) if temp_elem else "N/A"
    print(f"HEAT: {temp}")
    
    # Store / Merchant
    store_elem = soup.select_one('.store-name, .deal-store, a[href*="/stores/"]')
    store = store_elem.get_text(strip=True) if store_elem else "N/A"
    print(f"STORE: {store}")
    
    # Price and MRP
    price_elem = soup.select_one('.deal-price, .price, .final-price')
    price = price_elem.get_text(strip=True) if price_elem else "N/A"
    mrp_elem = soup.select_one('.mrp, .original-price, strike, del')
    mrp = mrp_elem.get_text(strip=True) if mrp_elem else "N/A"
    print(f"PRICE: {price} | MRP: {mrp}")
    
    # Description
    desc_elem = soup.select_one('.deal-desc, .deal-description, #deal-description, .post-content')
    if desc_elem:
        desc_lines = [line.strip() for line in desc_elem.get_text("\n").split("\n") if line.strip()]
        print("DESCRIPTION PREVIEW:")
        for l in desc_lines[:6]:
            print(f"   > {l}")
        # Links inside description
        links_in_desc = desc_elem.find_all('a', href=True)
        print(f"   Links inside description: {len(links_in_desc)}")
        for l in links_in_desc[:5]:
            print(f"     * {l.get_text(strip=True)} -> {l['href']}")
            
    # Buy Now / Get Deal Link
    buy_buttons = soup.select('a[href*="/visit/"], a.get-deal-btn, a.btn-deal, a[data-controller*="visit"]')
    print(f"BUY / GET DEAL BUTTONS: {len(buy_buttons)}")
    for b in buy_buttons[:3]:
        href = b.get('href', '')
        btn_text = b.get_text(strip=True)
        print(f"   Button: '{btn_text}' -> {href}")
        # If visit link, check where it redirects
        if '/visit/' in href:
            if href.startswith('/'):
                full_visit = f"https://www.desidime.com{href}"
            else:
                full_visit = href
            try:
                r_head = session.head(full_visit, headers=headers, allow_redirects=False, timeout=5)
                loc = r_head.headers.get('Location', 'No Location Header')
                print(f"     Redirect Location: {loc}")
            except Exception as e:
                print(f"     Redirect error: {e}")
                
    # Comments & Community Feedback
    comments = soup.select('.comment-item, .comment, div[id^="comment-"], .comment-content')
    print(f"COMMUNITY COMMENTS COUNT: {len(comments)}")
    for idx, c in enumerate(comments[:4], 1):
        c_text = c.get_text(" ", strip=True)
        if len(c_text) > 120:
            c_text = c_text[:120] + "..."
        print(f"   Comment #{idx}: {c_text}")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
