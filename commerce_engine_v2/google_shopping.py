"""Discovery plus mandatory merchant verification, preserving the old async API."""
import asyncio

from commerce_engine import CommerceEngine, RegionContext
from commerce_engine.discovery import GoogleShoppingProvider
from commerce_engine.models import to_jsonable


async def search_google_shopping(query: str, limit: int = 8, affiliate_converter=None, *,
                                 context: RegionContext | None = None, engine: CommerceEngine | None = None) -> dict:
    if engine is not None:
        if affiliate_converter is not None:
            raise ValueError("Configure affiliate_converter on the reusable engine")
        return await engine.search(query, limit=limit, context=context)
    async with CommerceEngine(affiliate_converter=affiliate_converter) as active:
        return await active.search(query, limit=limit, context=context)


def scrape_google_shopping(query: str, limit: int = 8, gl: str = "in", hl: str = "en") -> list[dict]:
    """Legacy sync discovery only; returned listing prices are always unverified."""
    if hl != "en":
        raise ValueError("Only English discovery parsing is configured")
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        pass
    else:
        raise RuntimeError("Use await search_google_shopping() inside an event loop")
    async def discover():
        async with CommerceEngine(providers=[]) as engine:
            provider = GoogleShoppingProvider(engine.fetcher)
            engine.providers = [provider]
            candidates, _, _ = await engine.discover(query, limit=limit, context=RegionContext(country=gl.upper()))
            return [{"title": c.title, "price": to_jsonable(c.discovered_price), "merchant": c.merchant,
                     "image": c.image_url, "google_link": c.raw_url, "price_verified": False,
                     "source_type": c.discovery_source} for c in candidates]
    return asyncio.run(discover())
