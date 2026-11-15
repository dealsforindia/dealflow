import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

script = r"""
import requests
from bs4 import BeautifulSoup
import re

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
    "Referer": "https://www.desidime.com/",
})

for url in ["https://www.desidime.com/deals", "https://www.desidime.com/new"]:
    r = session.get(url, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")
    cards = soup.select("article.deal-card, .deal-detail, .grid-item, div[data-controller='deal-card']")
    print(f"{url} -> status {r.status_code} | cards found: {len(cards)}")
    
    # Check sample card
    if cards:
        c = cards[0]
        text = c.get_text(" ", strip=True)
        temp_m = re.search(r'[-+]?(\d+)\s*°', text)
        temp = temp_m.group(1) if temp_m else "None"
        print(f"  First card sample text: {text[:100]}... | Temp: {temp}°")
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3 -"], input=script.encode(), capture_output=True)
print(p.stdout.decode('utf-8', errors='replace'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8', errors='replace'))
