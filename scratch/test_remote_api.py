import urllib.request
import json

url = 'http://localhost:8000/api/v1/deals/pending?limit=10&cluster=true'
req = urllib.request.Request(url, headers={'User-Agent': 'TestClient/1.0'})
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode('utf-8'))

print("HTTP 200 OK")
print(f"Total Pending in MongoDB: {data.get('total')}")
print(f"Cluster Stats: {data.get('cluster_stats')}")
deals = data.get('deals', [])
print(f"Returned Clustered Deals: {len(deals)}")
for i, d in enumerate(deals[:3]):
    ch = d.get('channel') or d.get('source_channel')
    print(f"Deal {i+1}: [{d.get('store', 'Store')}] [{ch}] {d.get('title', '')[:50]} | Sale: ₹{d.get('prices', {}).get('sale')} | Coupon: {d.get('coupon')} | Clusters: {d.get('cluster_count', 1)}")

