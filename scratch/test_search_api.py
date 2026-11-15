import urllib.request
import urllib.parse

searches = ['shoes', 'iphone', '50%', '[test]', '(test)', '.*', '₹', 'test+deal', 'a'*200, 'jhfhy@gmail.com']

for s in searches:
    url = f'http://74.225.250.0:8000/api/v1/deals/public?limit=40&skip=0&sort=newest&search={urllib.parse.quote(s)}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass
    except urllib.error.HTTPError as e:
        print(f'Search "{s}" FAILED: {e.code}')
    except Exception as e:
        print(f'Search "{s}" Exception: {e}')

print('Search check completed!')
