import os
from dotenv import load_dotenv
import requests

load_dotenv("/home/rudranil777/dealbot/.env")
token = os.getenv("ADMIN_API_TOKEN", "")
headers = {"X-Admin-Token": token}
r = requests.get("http://localhost:8000/api/v1/deals/pending?limit=3", headers=headers, timeout=5)
print("Pending Status:", r.status_code)
if r.status_code == 200:
    data = r.json()
    deals = data.get("deals", [])
    print("Pending count returned:", len(deals))
    for d in deals[:3]:
        print("---")
        print("ID:", d.get("id"))
        print("Store:", d.get("store"))
        print("Channel:", d.get("channel"))
        print("Title:", d.get("title")[:60] if d.get("title") else "N/A")
        print("Status:", d.get("status"))
else:
    print("Error:", r.text[:100])
