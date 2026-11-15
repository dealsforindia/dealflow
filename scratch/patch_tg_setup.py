with open('tg-setup/src/app/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "const res = await fetch(`${API_BASE}/api/v1/channels`);"
replacement1 = "const res = await fetch(`${API_BASE}/api/v1/channels`, { headers: getAdminHeaders(false) });"

target2 = "const res = await fetch(`${API_BASE}/api/v1/channels/analytics`);"
replacement2 = "const res = await fetch(`${API_BASE}/api/v1/channels/analytics`, { headers: getAdminHeaders(false) });"

if target1 in content and target2 in content:
    content = content.replace(target1, replacement1, 1)
    content = content.replace(target2, replacement2, 1)
    with open('tg-setup/src/app/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: tg-setup/src/app/App.tsx patched with getAdminHeaders(false) for channels and analytics")
else:
    print(f"FAILED: target1 found: {target1 in content}, target2 found: {target2 in content}")
