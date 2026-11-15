import time, subprocess, json

time.sleep(3)
payload = {
    "product_url": "https://www.amazon.in/dp/B09XS7JWHH",
    "target_price": 19999,
    "contact": "testuser@gmail.com",
    "product_title": "Sony WH-1000XM5 Wireless Headphones",
    "current_price": 24990,
    "store": "Amazon",
    "image_url": "https://m.media-amazon.com/images/I/61+elL4O7cL._SL1500_.jpg"
}

cmd_post = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    f"curl -s -X POST http://127.0.0.1:8000/api/v1/alerts -H 'Content-Type: application/json' -d '{json.dumps(payload)}'"
]
res_post = subprocess.run(cmd_post, capture_output=True, text=True)
print("POST Response:", res_post.stdout)

time.sleep(3)
cmd_get = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    "curl -s 'http://127.0.0.1:8000/api/v1/alerts?contact=testuser@gmail.com'"
]
res_get = subprocess.run(cmd_get, capture_output=True, text=True)
print("GET Response:", res_get.stdout)

try:
    data = json.loads(res_get.stdout)
    if data.get("alerts"):
        alert_id = data["alerts"][0]["id"]
        print(f"Testing on-demand price check for alert {alert_id}...")
        time.sleep(3)
        cmd_check = [
            'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
            f"curl -s -X POST 'http://127.0.0.1:8000/api/v1/alerts/{alert_id}/check'"
        ]
        res_check = subprocess.run(cmd_check, capture_output=True, text=True)
        print("CHECK Response:", res_check.stdout)

        time.sleep(3)
        print(f"Cleaning up test alert {alert_id}...")
        cmd_del = [
            'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
            f"curl -s -X DELETE 'http://127.0.0.1:8000/api/v1/alerts/{alert_id}'"
        ]
        res_del = subprocess.run(cmd_del, capture_output=True, text=True)
        print("DELETE Response:", res_del.stdout)
except Exception as e:
    print("Error during test:", e)
