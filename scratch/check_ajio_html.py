import requests
import re
from bs4 import BeautifulSoup

url = "https://www.ajio.com/s/min70percentoff-220997?query=:relevance:undefined:null:discountranges:80%"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}
try:
    r = requests.get(url, headers=headers, timeout=10)
    print("Status:", r.status_code)
    print("HTML length:", len(r.text))
    # Look for product cards or images
    imgs = re.findall(r'https?://[^\s"\'<>]+assets\.ajio\.com/medias/[^\s"\'<>]+', r.text)
    print("Found Ajio asset images:", len(imgs))
    if imgs:
        print("First 3 asset images:", imgs[:3])
    # Look for og:image
    og_img = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', r.text)
    print("og:image:", og_img.group(1) if og_img else None)
    # Look for title
    m_title = re.search(r'<title>(.*?)</title>', r.text, re.I)
    print("Page title:", m_title.group(1) if m_title else None)
except Exception as e:
    print("Error:", e)
