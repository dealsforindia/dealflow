import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_sh

out = run_vm_sh("ps aux | grep python3 | grep -v 'grep'")
print(out)
