import os
import pymongo
from dotenv import load_dotenv

load_dotenv('/home/rudranil777/dealbot/.env')
uri = os.getenv('MONGODB_URI') or os.getenv('MONGO_URI') or 'mongodb://localhost:27017/'
client = pymongo.MongoClient(uri)
db = client['dealbot']

deals = list(db.UniqueDeals.find({
    '$or': [
        {'title': {'$regex': 'Bedsheet', '$options': 'i'}},
        {'prod_name': {'$regex': 'Bedsheet', '$options': 'i'}},
        {'original_text': {'$regex': 'Bedsheet', '$options': 'i'}},
        {'aff_text': {'$regex': 'Bedsheet', '$options': 'i'}},
        {'message': {'$regex': 'Bedsheet', '$options': 'i'}}
    ]
}))
print(f"Total bedsheet deals found: {len(deals)}")
for d in deals:
    print(f"FP: {d.get('fp_hash')} | Status: {d.get('status')} | Store: {d.get('store')} | Platforms: {d.get('platforms')} | Price: {d.get('prices', {}).get('sale')} | Title: {(d.get('prod_name') or d.get('title') or '')[:60]} | URL: {d.get('url') or d.get('aff_url')}")
