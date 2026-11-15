from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from .engine import CommerceEngine
from .history import HistoryStore
from .models import RegionContext
from .parser import parse_product_html


def main() -> None:
    parser = argparse.ArgumentParser(description="Evidence-based commerce engine")
    parser.add_argument("--history-db", help="SQLite history path; omitted means history disabled")
    parser.add_argument("--postal-code")
    parser.add_argument("--country", default="IN")
    parser.add_argument("--warehouse-id")
    sub = parser.add_subparsers(dest="command", required=True)
    lookup = sub.add_parser("lookup", help="Fetch and inspect a live merchant product URL")
    lookup.add_argument("url")
    search = sub.add_parser("search", help="Discover candidates and verify merchant pages")
    search.add_argument("query")
    search.add_argument("--limit", type=int, default=8)
    offline = sub.add_parser("parse", help="Parse a saved HTML fixture; never marks live verification")
    offline.add_argument("file", type=Path)
    offline.add_argument("--url", required=True)
    args = parser.parse_args()
    context = RegionContext(args.country.upper(), args.postal_code, warehouse_id=args.warehouse_id)
    if args.command == "parse":
        result = parse_product_html(args.file.read_text(encoding="utf-8"), args.url, context=context).to_dict()
    else:
        async def run():
            history = HistoryStore(args.history_db) if args.history_db else None
            async with CommerceEngine(history=history) as engine:
                if args.command == "lookup":
                    return (await engine.lookup(args.url, context=context)).to_dict()
                return await engine.search(args.query, limit=args.limit, context=context)
        result = asyncio.run(run())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
