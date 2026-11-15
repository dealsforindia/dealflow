import json,re,urllib.request
from bs4 import BeautifulSoup
url='https://www.buyhatke.com/https://www.amazon.in/dp/B0DSQ2RF12'
with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=15) as response:
    final=response.url; html=response.read(3000000).decode('utf-8','replace')
soup=BeautifulSoup(html,'html.parser')
boot='\n'.join(script.get_text() for script in soup.select('script:not([src])'))
start=boot.find('predictedData:{history:')
if start < 0: raise SystemExit('No observed history section')
# Read literal records, not JS execution. Do not search arbitrary prices outside history.
array_start=boot.index('[',start); depth=1; end=array_start+1; quote=None; escape=False
while end < len(boot) and depth:
    char=boot[end]
    if quote:
        if escape: escape=False
        elif char=='\\': escape=True
        elif char==quote: quote=None
    elif char in ('"',"'"): quote=char
    elif char=='[': depth+=1
    elif char==']': depth-=1
    end+=1
array=boot[array_start:end]
array=re.sub(r'([{,])\s*([A-Za-z_][\w]*)\s*:',r'\1"\2":',array)
records=json.loads(array)
prices=[record['price'] for record in records if isinstance(record.get('price'),(int,float)) and record['price']>0]
print(json.dumps({'final_url':final,'history_field':'predictedData.history','records':len(records),
 'first':records[0] if records else None,'last':records[-1] if records else None,
 'min':min(prices) if prices else None,'max':max(prices) if prices else None,
 'main_product_contexts':re.findall(r'.{0,100}B0DSQ2RF12.{0,180}',boot)[:4],
 'main_record_context':boot[max(0,boot.find('cur_price:')-850):boot.find('cur_price:')+550],
 'history_tail':boot[end:end+900],
 'timezone':'Source datetimes have no explicit UTC offset; not normalized into UTC history yet'}))
