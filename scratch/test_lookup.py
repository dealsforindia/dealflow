import urllib.request
import json

url = "https://api.rudranil.me/api/v1/deals/lookup"
payload = json.dumps({"url": "https://www.amazon.in/dp/B0D8L67DHF"}).encode("utf-8")
req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=15) as res:
        print("STATUS:", res.status)
        data = json.loads(res.read().decode("utf-8"))
        print("TITLE:", data.get("title"))
        print("PRICE:", data.get("price"))
        print("MRP:", data.get("mrp"))
        print("STORE:", data.get("store"))
        print("HISTORY POINTS:", len(data.get("history", [])))
        print("SUCCESS:", data.get("success"))
except Exception as e:
    print("ERROR:", e)

print("\n--- Testing GET analyze-url ---")
get_url = "https://api.rudranil.me/api/v1/deals/analyze-url?url=https%3A%2F%2Fwww.amazon.in%2Fdp%2FB0D8L67DHF"
req_get = urllib.request.Request(get_url)
try:
    with urllib.request.urlopen(req_get, timeout=15) as res:
        print("GET STATUS:", res.status)
        data = json.loads(res.read().decode("utf-8"))
        print("GET TITLE:", data.get("title"))
        print("GET SUCCESS:", data.get("success"))
except Exception as e:
    print("GET ERROR:", e)
