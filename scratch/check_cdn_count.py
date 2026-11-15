import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_sh

out = run_vm_sh("python3 -c \"import pymongo, os; from dotenv import load_dotenv; load_dotenv('/home/rudranil777/dealbot/.env'); client=pymongo.MongoClient(os.getenv('MONGODB_URI')); db=client['dealbot']; print('CDN images count:', db.UniqueDeals.count_documents({'img_url': {'$regex': 'media-amazon\\\\.com'}}))\"")
print(out)
