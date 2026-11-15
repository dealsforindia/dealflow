import subprocess, sys

script = """
import asyncio, sys
sys.path.append('/home/rudranil777/dealbot')
from store_scraper import scrape_product_live

async def test():
    res = await scrape_product_live('https://amazon.in/dp/B0F2245Z9Y?psc=1&th=1')
    print('Scraped:', res)

asyncio.run(test())
"""

cmd = ["ssh", "rudranil777@74.225.250.0", "python3 -"]
p = subprocess.run(cmd, input=script.encode(), capture_output=True)
sys.stdout.buffer.write(p.stdout)
if p.stderr:
    sys.stderr.buffer.write(p.stderr)
