import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_sh

out = run_vm_sh("python3 /home/rudranil777/dealbot/amazon_direct_harvester.py")
print(out)
