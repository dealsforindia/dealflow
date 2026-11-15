import urllib.request
import json
import subprocess
import time
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def log(section: str):
    print("\n" + "=" * 65)
    print(f" {section}")
    print("=" * 65)

def check_backend_api():
    log("1. BACKEND API (https://api.rudranil.me)")
    # /health
    try:
        req = urllib.request.Request("https://api.rudranil.me/health", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
            print(f"  [PASS] GET /health (Status {r.status}):")
            print(f"         Redis: {data.get('redis')} | Mongo: {data.get('mongodb')} | WS Clients: {data.get('ws_clients')}")
    except Exception as e:
        print(f"  [FAIL] GET /health: {e}")

    # /api/v1/deals/public
    try:
        req = urllib.request.Request("https://api.rudranil.me/api/v1/deals/public?limit=5", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
            deals = data.get("deals", []) if isinstance(data, dict) else data
            print(f"  [PASS] GET /api/v1/deals/public (Status {r.status}) - Returned {len(deals)} published deals")
            for i, d in enumerate(deals[:3], 1):
                title = d.get('prod_name') or d.get('title') or 'N/A'
                print(f"         {i}. [{d.get('store', 'N/A')}] {title[:48]} | ₹{d.get('price')}")
    except Exception as e:
        print(f"  [FAIL] GET /api/v1/deals/public: {e}")

def check_frontends():
    log("2. WEB FRONTENDS")
    endpoints = [
        ("DealFlow Admin Curation Deck", "https://dealflow-topaz-seven.vercel.app"),
        ("IndiaDealHunts Public Storefront", "https://www.indiadealhunts.me")
    ]
    for name, url in endpoints:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                body = r.read().decode("utf-8", errors="ignore")
                print(f"  [PASS] {name} ({url}): HTTP {r.status} OK (Size: {len(body):,} bytes)")
        except Exception as e:
            print(f"  [FAIL] {name} ({url}): {e}")

def check_vm_telemetry():
    log("3. REMOTE VM SERVICES & TELEMETRY (74.225.250.0)")
    try:
        res = subprocess.run(
            ["python", "run_on_vm.py", "python3 /home/rudranil777/dealbot/audit_dealflow_vm.py"],
            capture_output=True,
            text=True,
            timeout=40
        )
        if res.returncode == 0:
            print(res.stdout.strip())
        else:
            print("Audit run failed:", res.stderr)
    except Exception as e:
        print(f"  [FAIL] VM Telemetry execution error: {e}")

if __name__ == "__main__":
    check_backend_api()
    check_frontends()
    check_vm_telemetry()
