import requests

url = "https://fkrt.co/UC1XHr"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
try:
    r = requests.get(url, allow_redirects=False, headers=headers, timeout=5)
    print("Status:", r.status_code)
    print("Location header:", r.headers.get("Location"))
except Exception as e:
    print("Error:", e)
