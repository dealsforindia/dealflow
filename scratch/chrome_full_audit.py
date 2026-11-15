import os
import sys
import uuid
import subprocess
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CHROME = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://127.0.0.1:4173/"
OUT_DIR = Path(r"E:\Rudranildocs0066543\html-yt\scratch\chrome_shots")
OUT_DIR.mkdir(parents=True, exist_ok=True)

views = [
    ("chrome_desktop_light", "", False, 1440, 900),
    ("chrome_desktop_dark", "", True, 1440, 900),
    ("chrome_mobile_light", "", False, 390, 844),
    ("chrome_mobile_dark", "", True, 390, 844),
    ("chrome_saved_light", "?tab=saved", False, 1440, 900),
    ("chrome_saved_dark", "?tab=saved", True, 1440, 900),
    ("chrome_tools_emi_light", "?modal=tools&tool=emi", False, 1440, 900),
    ("chrome_tools_emi_dark", "?modal=tools&tool=emi", True, 1440, 900),
    ("chrome_search_light", "?modal=search", False, 1440, 900),
    ("chrome_search_dark", "?modal=search", True, 1440, 900),
    ("chrome_profile_light", "?tab=profile", False, 1440, 900),
    ("chrome_profile_dark", "?tab=profile", True, 1440, 900),
]

for name, query, dark, w, h in views:
    user_dir = f"C:\\temp\\chrome_prof_{uuid.uuid4().hex[:8]}"
    out_file = OUT_DIR / f"{name}.png"
    target_url = f"{BASE_URL}{query}"
    
    args = [
        CHROME,
        "--headless=new",
        f"--user-data-dir={user_dir}",
        f"--screenshot={out_file}",
        f"--window-size={w},{h}",
        "--disable-gpu",
        "--no-first-run",
    ]
    if dark:
        args.append("--force-dark-mode")
    args.append(target_url)

    try:
        subprocess.run(args, timeout=20, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if out_file.exists():
            print(f"✓ Chrome captured: {name}.png ({out_file.stat().st_size:,} bytes) -> {query}")
        else:
            print(f"✗ Chrome file missing: {name}")
    except Exception as e:
        print(f"✗ Chrome failed on {name}: {e}")
