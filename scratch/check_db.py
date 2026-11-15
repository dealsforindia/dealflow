import os
from dotenv import load_dotenv
import pymongo, json
from bson import json_util, ObjectId

load_dotenv("/home/rudranil777/dealbot/.env")
mongo_uri = os.getenv("MONGODB_URI")
mongo_db = os.getenv("MONGODB_DB", "dealbot")

client = pymongo.MongoClient(mongo_uri)
db = client[mongo_db]

d = db['UniqueDeals'].find_one({'_id': ObjectId('6ac67b63a027fd1e1669ddf7')})
print(json_util.dumps(d, indent=2))
