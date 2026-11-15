import subprocess, json

def test_email(email_str):
    cmd = [
        'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
        f'curl -s -w "\\nHTTP_STATUS: %{{http_code}}" -X POST http://127.0.0.1:8000/api/v1/auth/request-code -H "Content-Type: application/json" -d \'{json.dumps({"email": email_str})}\''
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

print("3. Testing Cooldown:")
print("First call:")
print(test_email("dealhunter.test@gmail.com"))
print("\nImmediate second call:")
print(test_email("dealhunter.test@gmail.com"))
