import requests

url = "https://fkrt.cc/hlS88BK"

headers_list = [
    {
        "name": "Standard Chrome Windows",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
    },
    {
        "name": "Android Mobile Chrome",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
    },
    {
        "name": "cURL user agent",
        "headers": {
            "User-Agent": "curl/7.88.1"
        }
    }
]

for item in headers_list:
    print(f"\n--- Testing {item['name']} ---")
    try:
        r = requests.get(url, headers=item['headers'], allow_redirects=False, timeout=10)
        print("Status:", r.status_code)
        print("Location:", r.headers.get("Location"))
        if r.status_code == 200:
            print("Preview:", r.text[:200])
    except Exception as e:
        print("Error:", e)
