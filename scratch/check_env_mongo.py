import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_sh

out = run_vm_sh("grep -E 'MONGO|MONGODB' /home/rudranil777/dealbot/.env | sed 's/:.*@/:***@/'")
print(out)
