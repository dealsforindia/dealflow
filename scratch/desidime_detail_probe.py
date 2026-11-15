import json,re,urllib.request
from bs4 import BeautifulSoup
url='https://www.desidime.com/deals/grab-this-deal-dabur-pure-cow-2179137'
with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=15) as response:
    html=response.read(2000000).decode('utf-8','replace')
soup=BeautifulSoup(html,'html.parser')
result={'url':url,'title':soup.title.get_text() if soup.title else None,
 'time_nodes':[dict(n.attrs) for n in soup.select('time, meta[property="article:published_time"], meta[itemprop="datePublished"]')[:6]],
 'date_contexts':re.findall(r'.{0,80}(?:datePublished|dateModified|datetime=|posted-at|created_at).{0,130}',html,re.I)[:8],
 'history_contexts':re.findall(r'.{0,80}(?:price.?history|historyData|priceGraph|price_history).{0,160}',html,re.I)[:6],
 'merchant_links':list(dict.fromkeys(a.get('href') for a in soup.select('a[href]') if any(x in a.get('href','') for x in ['amazon.in/','flipkart.com/','visit.desidime.com/'])))[:8]}
print(json.dumps(result))
