import subprocess

cmd = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    'curl -s -w "\nHTTP_STATUS: %{http_code}" -X POST http://127.0.0.1:8000/api/v1/auth/request-code -H "Content-Type: application/json" -d "{\\"email\\": \\"invalid_format\\"}"'
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Output:\n", res.stdout.strip())
