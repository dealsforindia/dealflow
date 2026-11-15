import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_sh

out = run_vm_sh("python3 -c \"import json; f = open('/home/rudranil777/dealbot/images/desc0_7d982990549c_1791877652.jpg', 'rb'); b = f.read(); print(f'Size: {len(b)} bytes'); print('First 100 bytes:', b[:50])\"")
print(out)
