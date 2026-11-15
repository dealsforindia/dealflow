import subprocess, json, time

email = "dealhunter.live@gmail.com"
print("=== Step 1: Request OTP Code ===")
payload = {"email": email}
cmd_req = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    f"curl -s -X POST http://127.0.0.1:8000/api/v1/auth/request-code -H 'Content-Type: application/json' -d '{json.dumps(payload)}'"
]
r1 = subprocess.run(cmd_req, capture_output=True, text=True)
print("Request Code Output:", r1.stdout.strip())

code = None
try:
    d1 = json.loads(r1.stdout.strip())
    code = d1.get("dev_code")
except Exception as e:
    print("JSON parse error:", e)

if not code:
    # Query mongo on remote
    cmd_mongo = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        f"mongosh dealbot --quiet --eval 'db.AuthCodes.findOne({{email: \"{email}\"}}).code'"
    ]
    r_m = subprocess.run(cmd_mongo, capture_output=True, text=True)
    code = r_m.stdout.strip()
    print("Fetched code via mongosh:", code)

print("\n=== Step 2: Verify OTP Code ===")
if code:
    v_payload = {"email": email, "code": code}
    cmd_v = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        f"curl -s -X POST http://127.0.0.1:8000/api/v1/auth/verify-code -H 'Content-Type: application/json' -d '{json.dumps(v_payload)}'"
    ]
    r2 = subprocess.run(cmd_v, capture_output=True, text=True)
    print("Verify Code Output:", r2.stdout.strip())

    token = None
    try:
        d2 = json.loads(r2.stdout.strip())
        token = d2.get("token")
    except:
        pass

    print("\n=== Step 3: Get User Profile ===")
    cmd_p = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        f"curl -s 'http://127.0.0.1:8000/api/v1/user/profile?email={email}'"
    ]
    r3 = subprocess.run(cmd_p, capture_output=True, text=True)
    print("User Profile Output:", r3.stdout.strip())

print("\n=== Step 4: Add Product Alert to Scraper ===")
alert_data = {
    "product_url": "https://www.amazon.in/dp/B09XS7JWHH",
    "target_price": 24000,
    "contact": email,
    "product_title": "Sony WH-1000XM5 Wireless Headphones",
    "current_price": 24990,
    "store": "Amazon"
}
cmd_a = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    f"curl -s -X POST http://127.0.0.1:8000/api/v1/alerts -H 'Content-Type: application/json' -d '{json.dumps(alert_data)}'"
]
r4 = subprocess.run(cmd_a, capture_output=True, text=True)
print("Create Alert Output:", r4.stdout.strip())

try:
    d4 = json.loads(r4.stdout.strip())
    alert_id = d4.get("alert_id") or d4.get("id")
    if alert_id:
        print(f"\n=== Step 5: On-Demand Scraper Check for alert {alert_id} ===")
        cmd_chk = [
            'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
            f"curl -s -X POST http://127.0.0.1:8000/api/v1/alerts/{alert_id}/check"
        ]
        r5 = subprocess.run(cmd_chk, capture_output=True, text=True)
        print("Scraper Check Output:", r5.stdout.strip())
except Exception as e:
    print("Check error:", e)
