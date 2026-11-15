"""Async compatibility entry points for the supplied store_scraper module.

Money now serializes as decimal strings and success means publishable verified stock.
Reuse CommerceEngine for connection pooling across requests.
"""
import socket

from commerce_engine import CommerceEngine, RegionContext
from commerce_engine.parser import parse_product_html
from commerce_engine.urls import UnsafeURL, canonicalize, public_ip, unwrap_url, validate_url


def is_safe_public_url(url: str) -> bool:
    """Legacy blocking check. Actual fetches also validate in the connection resolver."""
    from urllib.parse import urlsplit
    try:
        checked = validate_url(url)
        infos = socket.getaddrinfo(urlsplit(checked).hostname, None, type=socket.SOCK_STREAM)
        return bool(infos) and all(public_ip(info[4][0]) for info in infos)
    except (UnsafeURL, OSError):
        return False


async def resolve_canonical_url(url: str, *, engine: CommerceEngine | None = None) -> str:
    async def resolve(active: CommerceEngine):
        response = await active.fetcher.fetch(unwrap_url(url))
        return canonicalize(response.url)
    if engine is not None:
        return await resolve(engine)
    async with CommerceEngine() as active:
        return await resolve(active)


async def scrape_product_live(url: str, raw_text: str = "", *, context: RegionContext | None = None,
                              engine: CommerceEngine | None = None) -> dict:
    # raw_text remains accepted but cannot supply title, price, stock, or coupon evidence.
    if engine is not None:
        return (await engine.lookup(url, context=context)).legacy_dict()
    async with CommerceEngine() as active:
        return (await active.lookup(url, context=context)).legacy_dict()


__all__ = ["scrape_product_live", "resolve_canonical_url", "is_safe_public_url", "parse_product_html"]
