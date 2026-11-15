import requests
from bs4 import BeautifulSoup

url = "https://trackingv3.linkredirect.in/visitretailer/3178?id=4676127&shareid=ebbK5d6&dl=https%3A%2F%2Fajio.com%2Fs%2Fmin70percentoff-220997%3Fquery%3D%253Arelevance%253Aundefined%253Anull%253Adiscountranges%253A80%2525&source=Default"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}
try:
    r = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
    print("Final status:", r.status_code)
    print("Final URL:", r.url[:120])
    soup = BeautifulSoup(r.text, 'html.parser')
    print("Title tag:", soup.title.string if soup.title else None)
    og_title = soup.find("meta", property="og:title")
    print("og:title:", og_title["content"] if og_title else None)
    og_img = soup.find("meta", property="og:image")
    print("og:image:", og_img["content"] if og_img else None)
except Exception as e:
    print("Error:", e)
