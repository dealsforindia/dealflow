import subprocess
import json

code = """
import pymongo
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['dealbot']
deals = list(db['UniqueDeals'].find({'status': {'$ne': 'pending'}}).sort('timestamp', -1).limit(15))
for d in deals:
    print(json.dumps({
        'title': d.get('prod_name') or d.get('title'),
        'status': d.get('status'),
        'timestamp': str(d.get('timestamp')),
        'posted_at': str(d.get('posted_at')),
        'approved_at': str(d.get('approved_at')),
        'url': d.get('url'),
        'deal_url': d.get('deal_url'),
        'img_url': d.get('img_url'),
        'image': d.get('image'),
        'is_over': d.get('is_over'),
        'destinations': d.get('destinations'),
        'broadcast_destinations': d.get('broadcast_destinations'),
    }, indent=2))
"""

p = subprocess.run(["ssh", "rudranil777@74.225.250.0", "python3"], input=code.encode('utf-8'), capture_output=True)
print(p.stdout.decode('utf-8'))
if p.stderr:
    print("ERR:", p.stderr.decode('utf-8'))
