import asyncio
import aiohttp
import sys
from pathlib import Path

sys.path.insert(0, "/home/rudranil777/dealbot")
from worker import expand_url

async def main():
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        url = "https://fkrt.co/UC1XHr"
        print("Expanding:", url)
        expanded = await expand_url(session, url)
        print("Result:", expanded)
        assert "/p/itm" in expanded or "flipkart.com" in expanded, f"Failed expansion: {expanded}"
        print("[SUCCESS] expand_url correctly unpacked fkrt.co into Flipkart product URL!")

if __name__ == "__main__":
    asyncio.run(main())
