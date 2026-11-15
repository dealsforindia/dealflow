import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = """
import requests
from bs4 import BeautifulSoup
import json, re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": "https://www.desidime.com/",
}

session = requests.Session()
session.headers.update(HEADERS)

deal_urls = [
    "https://www.desidime.com/deals/portronics-por-2113-wireless-standard-2175634",
    "https://www.desidime.com/deals/blinkit-x-dark-fantasy-2175137",
    "https://www.desidime.com/deals/instamart-hammer-airflow-flex-2174862"
]

for url in deal_urls:
    r = session.get(url, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")
    
    title_el = soup.find("h1") or soup.find("div", class_=re.compile("deal-title|title"))
    title = title_el.get_text(strip=True) if title_el else "No Title"
    
    price_el = soup.find(class_=re.compile(r"price|deal-price|special-price"))
    price = price_el.get_text(strip=True) if price_el else "N/A"
    
    temp_el = soup.find(class_=re.compile(r"vote|degree|temperature"))
    temp = temp_el.get_text(strip=True) if temp_el else "N/A"
    
    store_el = soup.find(class_=re.compile(r"store|merchant"))
    store = store_el.get_text(strip=True) if store_el else "N/A"
    
    buy_btn = soup.find("a", href=re.compile(r"/visit|/out/|visit\.desidime"))
    buy_link = buy_btn.get("href") if buy_btn else "No Buy Button"
    
    desc_el = soup.find("div", class_=re.compile(r"deal-desc|description|content"))
    desc = desc_el.get_text(" ", strip=True)[:300] if desc_el else "N/A"
    
    # Sub-links inside description or comments
    sub_links = []
    if desc_el:
        for a in desc_el.find_all("a", href=True):
            sub_links.append(a["href"])
            
    print(f"==================================================")
    print(f"TITLE: {title}")
    print(f"TEMP: {temp} | PRICE: {price} | STORE: {store}")
    print(f"BUY LINK: {buy_link}")
    print(f"DESC: {desc[:180]}...")
    print(f"SUB LINKS ({len(sub_links)}): {sub_links[:4]}")
    print(f"==================================================\\n")
"""

p = subprocess.run(['ssh', 'rudranil777@74.225.250.0', 'python3 -'], input=script.encode('utf-8'), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
