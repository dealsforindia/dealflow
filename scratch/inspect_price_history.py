import subprocess

remote_code = r'''
import os
from pymongo import MongoClient

files = [f for f in os.listdir('/home/rudranil777/dealbot') if 'price' in f.lower() or 'history' in f.lower() or 'scan' in f.lower()]
print("Matching files:", files)

client = MongoClient('mongodb://localhost:27017/')
db = client['dealbot']
print("Collections:", db.list_collection_names())

if "PriceHistory" in db.list_collection_names():
    count = db.PriceHistory.count_documents({})
    print(f"PriceHistory total docs: {count}")
    sample = list(db.PriceHistory.find().limit(5))
    for s in sample:
        print("PriceHistory sample doc:", s)

# Check PM2 list
os.system("pm2 list")
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True
)
print("STDOUT:")
print(res.stdout)
print("STDERR:")
print(res.stderr)
