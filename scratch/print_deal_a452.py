import os
import pymongo
import json
from dotenv import load_dotenv

load_dotenv('/home/rudranil777/dealbot/.env')
uri = os.getenv('MONGODB_URI') or os.getenv('MONGO_URI') or 'mongodb://localhost:27017/'
client = pymongo.MongoClient(uri)
db = client['dealbot']

d = db.UniqueDeals.find_one({'fp_hash': 'a452e0554a89c239'})
if d:
    d.pop('_id', None)
    print(json.dumps(d, default=str, indent=2))
