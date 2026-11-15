"""Run from the project folder: python examples/bulk_lookup.py URL [URL ...]."""
import asyncio
import json
import sys

from commerce_engine import CommerceEngine


async def main(urls: list[str]):
    slots = asyncio.Semaphore(4)
    async with CommerceEngine() as engine:
        async def lookup(url):
            async with slots:
                return (await engine.lookup(url)).to_dict()
        return await asyncio.gather(*(lookup(url) for url in urls))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Supply one or more actual merchant product URLs")
    print(json.dumps(asyncio.run(main(sys.argv[1:])), ensure_ascii=False, indent=2))
