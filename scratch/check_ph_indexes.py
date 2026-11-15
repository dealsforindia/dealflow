import subprocess

remote_code = r'''
import os
from dotenv import load_dotenv
load_dotenv("/home/rudranil777/dealbot/.env")
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB", "dealbot")]

print("PriceHistory indexes:", list(db.PriceHistory.list_indexes()))
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
