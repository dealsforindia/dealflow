"""Read public provider HTML/scripts as evidence; never execute downloaded code."""
import json
import re
import urllib.request
from urllib.parse import urljoin, urlsplit

targets = ['https://www.buyhatke.com/', 'https://pricing-intelligence.buyhatke.com/', 'https://www.desidime.com/new']
def read(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,application/javascript'})
    with urllib.request.urlopen(request, timeout=15) as response:
        return response.status, response.read(3000000).decode('utf-8', 'replace')

for url in targets:
    item = {'url': url, 'assets': []}
    try:
        status, html = read(url)
        item['status'] = status
        item['title'] = re.findall(r'<title[^>]*>(.*?)</title>', html, re.S)[:1]
        item['history_mentions'] = re.findall(r'.{0,65}(?:price.?history|priceHistory|historical).{0,100}', html, re.I)[:10]
        scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)', html, re.I)
        scripts += re.findall(r'<link[^>]+href=["\']([^"\']+\.js)["\']', html, re.I)
        scripts += re.findall(r'import\(["\']([^"\']+)["\']\)', html)
        scripts = [urljoin(url, asset) for asset in scripts]
        scripts = list(dict.fromkeys(asset for asset in scripts if (urlsplit(asset).hostname or '').endswith(('buyhatke.com','desidime.com'))))
        item['script_urls'] = scripts
        # Bound reads, and ignore third-party analytics.
        for asset in scripts[-6:]:
            info = {'url': asset}
            try:
                code_status, code = read(asset)
                info['status'] = code_status
                info['price_routes'] = sorted(set(re.findall(r'https?://[^\s"\'`<>\\]*(?:buyhatke|desidime)[^\s"\'`<>\\]*', code)))[:30]
                info['history_context'] = re.findall(r'.{0,100}(?:priceHistory|price_history|price-history|historyData|historical).{0,180}', code, re.I)[:15]
            except Exception as error: info['error_type'] = type(error).__name__
            item['assets'].append(info)
    except Exception as error: item['error_type'] = type(error).__name__; item['error'] = str(error)[:160]
    print(json.dumps(item), flush=True)
