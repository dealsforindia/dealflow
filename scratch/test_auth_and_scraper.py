import subprocess, json, time, sys

print("=== 1. Testing Auth Request Code ===")
payload = {"email": "dealhunter.test@gmail.com"}
cmd = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    f"""python3 -c "import requests; r = requests.post('http://127.0.0.1:8000/api/v1/auth/request-code', json={json.dumps(payload)}); print(r.text)" """
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Auth Request Code Response:", res.stdout.strip())

code = None
try:
    data = json.loads(res.stdout.strip())
    code = data.get("dev_code")
except Exception as e:
    print("Could not parse json:", e)

if not code:
    # Fetch from Mongo
    cmd_mongo = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        """python3 -c "from pymongo import MongoClient; c = MongoClient('mongodb://localhost:27017/')['dealbot']; doc = c['AuthCodes'].find_one({'email': 'dealhunter.test@gmail.com'}); print(doc['code'] if doc else '')" """
    ]
    res_m = subprocess.run(cmd_mongo, capture_output=True, text=True)
    code = res_m.stdout.strip()
    print("Fetched OTP code from DB:", code)

print("\n=== 2. Testing Auth Verify Code ===")
if code:
    verify_payload = {"email": "dealhunter.test@gmail.com", "code": code}
    cmd_verify = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        f"""python3 -c "import requests; r = requests.post('http://127.0.0.1:8000/api/v1/auth/verify-code', json={json.dumps(verify_payload)}); print(r.text)" """
    ]
    res_v = subprocess.run(cmd_verify, capture_output=True, text=True)
    print("Verify Code Response:", res_v.stdout.strip())
    
    token = None
    try:
        data_v = json.loads(res_v.stdout.strip())
        token = data_v.get("token")
    except:
        pass

    print("\n=== 3. Testing User Profile Endpoint ===")
    cmd_prof = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        f"""python3 -c "import requests; r = requests.get('http://127.0.0.1:8000/api/v1/user/profile?email=dealhunter.test@gmail.com'); print(r.text)" """
    ]
    res_p = subprocess.run(cmd_prof, capture_output=True, text=True)
    print("Profile Response:", res_p.stdout.strip())

print("\n=== 4. Testing Scraper Alert Add & Auto-Check ===")
alert_payload = {
    "product_url": "https://www.amazon.in/dp/B09XS7JWHH",
    "target_price": 24000,
    "contact": "dealhunter.test@gmail.com",
    "product_title": "Sony WH-1000XM5",
    "current_price": 24990,
    "store": "Amazon"
}
cmd_alert = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    f"""python3 -c "import requests; r = requests.post('http://127.0.0.1:8000/api/v1/alerts', json={json.dumps(alert_payload)}); print(r.text)" """
]
res_a = subprocess.run(cmd_alert, capture_output=True, text=True)
print("Create Alert Response:", res_a.stdout.strip())

try:
    a_data = json.loads(res_a.stdout.strip())
    alert_id = a_data.get("alert_id") or a_data.get("id")
    if alert_id:
        print(f"\nTriggering on-demand live scraper check for alert {alert_id}...")
        cmd_chk = [
            'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
            f"""python3 -c "import requests; r = requests.post('http://127.0.0.1:8000/api/v1/alerts/{alert_id}/check'); print(r.text)" """
        ]
        res_chk = subprocess.run(cmd_chk, capture_output=True, text=True)
        print("Scraper Check Response:", res_chk.stdout.strip())
except Exception as e:
    print("Alert check error:", e)
