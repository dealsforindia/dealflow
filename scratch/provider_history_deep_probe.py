"""Follow only URLs observed in public provider documents or bundles."""
import json
import re
import urllib.request
from bs4 import BeautifulSoup

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as response:
        return response.status, response.url, response.read(3000000).decode('utf-8','replace')

targets = [
 ('consumer_routes','https://www.buyhatke.com/_app/immutable/entry/app.BzTvCMOt.js'),
 ('api_documentation','https://pricing-intelligence.buyhatke.com/assets/index-DK3E6ZeN.js'),
 ('product_shortcut','https://www.buyhatke.com/https://www.amazon.in/dp/B0DSQ2RF12'),
 ('desidime_cards','https://www.desidime.com/new'),
 ('documented_api_example','https://api.buyhatke.com/v1/history/SAMSUNG-S24-256'),
]
for kind, url in targets:
    result = {'kind':kind,'url':url}
    try:
        status, final, text = fetch(url)
        result.update(status=status,final_url=final)
        if kind == 'consumer_routes':
            result['routes'] = re.findall(r'.{0,70}(?:graph|price-history|product/|product\[|priceGraph).{0,160}',text,re.I)[:25]
            result['node_imports'] = re.findall(r'import\(["\']([^"\']+)["\']\)',text)[:10]
        elif kind == 'api_documentation':
            index = text.find('historical-query.js')
            result['history_example'] = text[index:index+2100]
        elif kind == 'desidime_cards':
            soup = BeautifulSoup(text,'html.parser')
            result['timestamp_samples'] = [dict(node.attrs) for node in soup.select('time')[:5]]
            result['deal_links'] = [node.get('href') for node in soup.select('a[href*="/deals/"]')[:8]]
            result['structured_types'] = re.findall(r'"@type"\s*:\s*"([^"]+)"',text)[:12]
            result['client_routes'] = re.findall(r'.{0,50}(?:data-price|data-deal|data-.*time|price-history).{0,100}',text,re.I)[:10]
        elif kind == 'product_shortcut':
            soup = BeautifulSoup(text,'html.parser')
            result['title'] = soup.title.get_text() if soup.title else None
            result['scripts'] = [node.get('src') for node in soup.select('script[src]')]
            result['history_context'] = re.findall(r'.{0,100}(?:price[ _-]?history|historyData|graph|"history").{0,180}',text,re.I)[:15]
            result['module_refs'] = re.findall(r'(?:href=["\']|import\(["\'])([^"\']+\.js)',text)[:15]
            result['inline_bootstrap'] = [node.get_text()[:2200] for node in soup.select('script:not([src])')][-3:]
            result['visible_text'] = soup.get_text(' ',strip=True)[-3500:]
        else:
            result['response_preview'] = text[:400]
    except urllib.error.HTTPError as error:
        result.update(status=error.code,response_preview=error.read(400).decode('utf-8','replace'))
    except Exception as error:
        result.update(error_type=type(error).__name__,error=str(error)[:120])
    print(json.dumps(result),flush=True)
