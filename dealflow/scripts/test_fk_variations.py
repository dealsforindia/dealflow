import requests

codes = ["hlS88BK", "hIS88BK", "h1S88BK", "HIS88BK", "HLS88BK"]
for c in codes:
    u = f"https://fkrt.cc/{c}"
    try:
        r = requests.get(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}, allow_redirects=False, timeout=5)
        print(f"{u} -> status {r.status_code}, loc: {r.headers.get('Location')}")
    except Exception as e:
        print(f"{u} -> error {e}")
