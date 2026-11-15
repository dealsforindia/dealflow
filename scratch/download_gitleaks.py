import os, urllib.request, zipfile

scratch_dir = r"C:\Users\Neel\.gemini\antigravity-ide\brain\e2c344eb-349a-406f-8909-6a0d3e93abde\scratch\gitleaks"
os.makedirs(scratch_dir, exist_ok=True)
zip_path = os.path.join(scratch_dir, "gitleaks.zip")
exe_path = os.path.join(scratch_dir, "gitleaks.exe")

url = "https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_windows_x64.zip"

if not os.path.exists(exe_path):
    print("Downloading Gitleaks v8.30.1...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp, open(zip_path, 'wb') as f:
        f.write(resp.read())
    print("Downloaded. Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(scratch_dir)
    print("Extracted successfully!")
else:
    print("Gitleaks already exists at:", exe_path)

print("Gitleaks binary ready at:", exe_path)
