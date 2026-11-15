import subprocess

remote_script = r'''
import sys
sys.path.insert(0, "/home/rudranil777/dealbot")
from universal_store_engine import get_store_identity, resolve_store_from_url
url = "https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/de025efa02a5f190c3b98c1fb29aed1b/MultiWidgetpage.css"
print("resolve_store_from_url:", resolve_store_from_url(url))
print("get_store_identity:", get_store_identity(url=url))
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_script,
    capture_output=True,
    text=True
)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
