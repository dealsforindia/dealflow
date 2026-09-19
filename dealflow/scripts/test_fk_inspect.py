import requests

url = "https://fkrt.cc/hlS88BK"
print("Testing requests with allow_redirects=False:")
r = requests.get(url, allow_redirects=False)
print("Status:", r.status_code)
print("Headers:", dict(r.headers))
print("Body preview:", r.text[:500])

print("\nTesting requests with allow_redirects=True:")
r2 = requests.get(url, allow_redirects=True)
print("Status:", r2.status_code)
print("Final URL:", r2.url)
print("Body preview:", r2.text[:500])
