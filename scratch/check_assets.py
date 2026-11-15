import urllib.request, re, time

old_js = 'index-BTb-JYtA.js'
for i in range(12):
    try:
        html = urllib.request.urlopen('https://indiadealhunts.vercel.app/?_t=' + str(time.time())).read().decode()
        assets = re.findall(r'/assets/[a-zA-Z0-9_.-]+', html)
        current_js = [a for a in assets if 'index-' in a and a.endswith('.js')]
        if current_js and old_js not in current_js[0]:
            print("NEW DEPLOYMENT LIVE:", current_js[0])
            break
        print(f"Waiting... current is still {current_js}")
    except Exception as e:
        print("Poll error:", e)
    time.sleep(5)
