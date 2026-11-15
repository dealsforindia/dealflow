import subprocess

cmd = [
    'ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0',
    "python3 -c \"import socket; print('gmail.com IP:', socket.gethostbyname('gmail.com'))\""
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Output:\n", res.stdout.strip())
