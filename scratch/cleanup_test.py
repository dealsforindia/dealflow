import subprocess

cmd = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    'python3', '-c',
    "from pymongo import MongoClient; db = MongoClient('mongodb://localhost:27017/')['dealbot']; db.PriceAlerts.delete_many({'contact': 'dealhunter.live@gmail.com'}); db.AuthCodes.delete_many({'email': 'dealhunter.live@gmail.com'}); db.Users.delete_many({'email': 'dealhunter.live@gmail.com'}); print('Cleaned!')"
]
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout.strip())
