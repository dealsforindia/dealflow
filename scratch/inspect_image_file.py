import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from vm_exec import run_vm_sh

out = run_vm_sh("ls -lh /home/rudranil777/dealbot/images/amz_B086MZDG7H.jpg /home/rudranil777/dealbot/images/desc0_7d982990549c* 2>/dev/null; file /home/rudranil777/dealbot/images/amz_B086MZDG7H.jpg 2>/dev/null")
print(out)
