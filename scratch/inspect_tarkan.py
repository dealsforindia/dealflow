import os, pymongo, json
from dotenv import load_dotenv

load_dotenv('/home/rudranil777/dealbot/.env')
uri = os.getenv('MONGODB_URI') or os.getenv('MONGO_URI') or 'mongodb://localhost:27017/'
client = pymongo.MongoClient(uri)

for db_name in ['dealbot', 'dealflow']:
    if db_name in client.list_database_names():
        db = client[db_name]
        for col_name in ['UniqueDeals', 'deals', 'DuplicateLogs']:
            if col_name in db.list_collection_names():
                count = db[col_name].count_documents({
                    '$or': [
                        {'aff_text': {'$regex': 'B0HGKT9HFJ'}},
                        {'original_text': {'$regex': 'B0HGKT9HFJ'}},
                        {'canonical_key': {'$regex': 'B0HGKT9HFJ'}},
                        {'prod_name': {'$regex': 'TARKAN', '$options': 'i'}}
                    ]
                })
                print(f"{db_name}.{col_name}: {count}")
                if count > 0:
                    for d in db[col_name].find({
                        '$or': [
                            {'aff_text': {'$regex': 'B0HGKT9HFJ'}},
                            {'original_text': {'$regex': 'B0HGKT9HFJ'}},
                            {'canonical_key': {'$regex': 'B0HGKT9HFJ'}},
                            {'prod_name': {'$regex': 'TARKAN', '$options': 'i'}}
                        ]
                    }):
                        d.pop('_id', None)
                        print(json.dumps(d, default=str, indent=2))
