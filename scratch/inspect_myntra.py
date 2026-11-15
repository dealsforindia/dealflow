import os
import pymongo
import json
from dotenv import load_dotenv

load_dotenv('/home/rudranil777/dealbot/.env')
uri = os.getenv('MONGODB_URI') or os.getenv('MONGO_URI') or 'mongodb://localhost:27017/'
client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)

print("DBs:", client.list_database_names())
for db_name in ['dealbot', 'indiadealhunts', 'test']:
    if db_name in client.list_database_names():
        db = client[db_name]
        print(f"Collections in {db_name}:", db.list_collection_names())
        deal = db.UniqueDeals.find_one({'fp_hash': '8b6ff6e8db35ad80'})
        if deal:
            print(f"Found in {db_name}.UniqueDeals!")
            deal.pop('_id', None)
            print(json.dumps(deal, default=str, indent=2))
        # also search by regex 'Bedsheet'
        b = db.UniqueDeals.find_one({'title': {'$regex': 'Bedsheet', '$options': 'i'}})
        if b:
            print(f"Found bedsheet in {db_name}!")
            b.pop('_id', None)
            print(json.dumps(b, default=str, indent=2))
