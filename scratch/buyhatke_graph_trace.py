import json,re,urllib.request
from urllib.parse import urljoin
from bs4 import BeautifulSoup
def read(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=15) as response:
        return response.read(3000000).decode('utf-8','replace')
product = 'https://www.buyhatke.com/amazon-dettol-dishwash-liquid-and-kitchen-gel-cuts-tough-grease-remove-germs-lemon-fragrance-1500ml-refill-pack-price-in-india-63-77204421'
html=read(product); soup=BeautifulSoup(html,'html.parser')
boot='\n'.join(node.get_text() for node in soup.select('script:not([src])'))
print(json.dumps({'kind':'bootstrap_history','contexts':re.findall(r'.{0,100}(?:history|graph|chart)[A-Za-z_]*\s*:.{0,600}',boot,re.I)[:15]}),flush=True)
app_url='https://www.buyhatke.com/_app/immutable/entry/app.BzTvCMOt.js'
app=read(app_url)
node=re.search(r'["\'](\.\./nodes/31\.[^"\']+\.js)["\']',app)
if not node: raise SystemExit('Observed product module was not located')
node_url=urljoin(app_url,node[1]); code=read(node_url)
print(json.dumps({'kind':'product_module','url':node_url,'code':code[:7000]}),flush=True)
imports=list(dict.fromkeys(re.findall(r'["\'](\.\./chunks/[^"\']+\.js)["\']',code)))
for asset in imports[:8]:
    url=urljoin(node_url,asset); code=read(url)
    contexts=re.findall(r'.{0,180}(?:priceHistory|price.?history|graphData|historyData|getGraph|priceGraph|/graph|price_graph).{0,350}',code,re.I)[:15]
    if contexts:
        print(json.dumps({'kind':'graph_dependency','url':url,'contexts':contexts,'imports':re.findall(r'["\'](\./[^"\']+\.js)["\']',code)[:15]}),flush=True)
