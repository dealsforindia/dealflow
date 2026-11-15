import subprocess

remote_code = r'''
import sys
sys.path.insert(0, "/home/rudranil777/dealbot")
from genie_history import lookup_price_history

urls = [
    "https://www.amazon.in/dp/B0CX25NP84",
    "https://www.amazon.in/dp/B0H624K81D",
    "https://www.flipkart.com/kenstar-pureza-8-l-ro-uv-uf-copper-alkaline-minerals-water-purifier/p/itm12345678"
]

for u in urls:
    print(f"\nTesting: {u}")
    try:
        res = lookup_price_history(u, timeout=5)
        print("Success:", res.get("success"))
        if res.get("success"):
            hist = res.get("history") or []
            print(f"Points returned: {len(hist)}")
            if hist:
                print("First point:", hist[0], "Last point:", hist[-1])
        else:
            print("Error:", res.get("error"))
    except Exception as ex:
        print("Exception:", ex)
'''

res = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', 'rudranil777@74.225.250.0', 'python3 -'],
    input=remote_code,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)
print("STDOUT:")
print(res.stdout.encode('ascii', errors='replace').decode('ascii'))
