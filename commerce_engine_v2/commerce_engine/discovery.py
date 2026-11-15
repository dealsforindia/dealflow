from __future__ import annotations

import asyncio
from typing import Protocol
from urllib.parse import urlencode, urlsplit

from lxml import etree

from .merchants import MERCHANT_HOSTS, cls, profile_for
from .models import RegionContext, ShoppingCandidate
from .network import SafeFetcher
from .normalization import clean_text, parse_money_text, title_text
from .structured import document, node_text
from .urls import UnsafeURL, identity, unwrap_url, validate_url


class DiscoveryProvider(Protocol):
    name: str
    async def search(self, query: str, limit: int, context: RegionContext) -> list[ShoppingCandidate]: ...


def _first(nodes, paths):
    for path in paths:
        try:
            matches = nodes.xpath(path)
        except etree.XPathError:
            continue
        if matches:
            return matches[0]
    return None


def parse_discovery_html(markup: str, *, source: str = "google_shopping",
                         base_url: str = "https://www.google.com/", limit: int = 16) -> list[ShoppingCandidate]:
    try:
        doc = document(markup)
    except (etree.ParserError, ValueError):
        return []
    card_classes = ("sh-dgr__content", "sh-dlr__list-result", "sh-np__click-target") if source == "google_shopping" else ("br-item",)
    cards = doc.xpath(" | ".join(cls(name) for name in card_classes) + (" | .//*[@data-docid]" if source == "google_shopping" else ""))
    results: list[ShoppingCandidate] = []
    seen: set[str] = set()
    for card in cards[:300]:
        title_node = _first(card, (".//h3", ".//*[@role='heading']", cls("sh-np__product-title"), cls("tAxLfb"), cls("br-title")))
        title = title_text(node_text(title_node)) if title_node is not None else None
        if not title:
            continue
        href = None
        for anchor in card.xpath(".//a[@href]")[:25]:
            try:
                candidate_url = unwrap_url(anchor.get("href"), base_url, allowed_hosts=MERCHANT_HOSTS)
            except UnsafeURL:
                continue
            path = urlsplit(candidate_url).path.lower()
            if path in {"/", "/s", "/search", "/shop"} or path.startswith(("/search/", "/category/", "/categories/")):
                continue
            href = candidate_url
            break
        if href is None:
            continue
        profile = profile_for(href)
        key = identity(href, profile.name).offer_key
        if key in seen:
            continue
        price_node = _first(card, tuple(cls(c) for c in ("a8Pemb", "HRLxBb", "kHxwFf", "pd-price", "br-price")))
        # No whole-card regex: delivery fees and crossed-out prices share that text.
        price, currency = parse_money_text(node_text(price_node)) if price_node is not None else (None, None)
        image = _first(card, (".//img[@data-src-hq or @data-src or @src]",))
        image_url = None
        if image is not None:
            try:
                image_url = validate_url(image.get("data-src-hq") or image.get("data-src") or image.get("src"))
            except UnsafeURL:
                pass
        seen.add(key)
        results.append(ShoppingCandidate(title, href, profile.name, price, currency, image_url, source))
        if len(results) >= limit:
            break
    return results


class GoogleShoppingProvider:
    name = "google_shopping"
    def __init__(self, fetcher: SafeFetcher):
        self.fetcher = fetcher

    async def search(self, query: str, limit: int, context: RegionContext) -> list[ShoppingCandidate]:
        params = urlencode({"q": query, "tbm": "shop", "gl": context.country.lower(), "hl": "en"})
        response = await self.fetcher.fetch("https://www.google.com/search?" + params,
                                           allowed_hosts=("google.com", "google.co.in"))
        return parse_discovery_html(response.body, source=self.name, base_url=response.url, limit=limit)


class BingShoppingProvider:
    name = "bing_shopping"
    def __init__(self, fetcher: SafeFetcher):
        self.fetcher = fetcher

    async def search(self, query: str, limit: int, context: RegionContext) -> list[ShoppingCandidate]:
        response = await self.fetcher.fetch("https://www.bing.com/shop?" + urlencode({"q": query}),
                                           allowed_hosts=("bing.com",))
        return parse_discovery_html(response.body, source=self.name, base_url=response.url, limit=limit)


class StaticProvider:
    """Adapter for already-discovered URLs, affiliate feeds, and test fixtures."""
    name = "provided_candidates"
    def __init__(self, candidates: list[ShoppingCandidate]):
        self.candidates = candidates

    async def search(self, query: str, limit: int, context: RegionContext) -> list[ShoppingCandidate]:
        return self.candidates[:limit]


class MerchantSearchProvider:
    """Direct search of Amazon/Flipkart only. Return real product anchors, never guesses."""
    def __init__(self, fetcher: SafeFetcher, merchant: str):
        if merchant not in {"Amazon", "Flipkart"}:
            raise ValueError("Direct search adapter exists only for Amazon and Flipkart")
        self.fetcher, self.merchant = fetcher, merchant
        self.name = "merchant_search:" + merchant.lower()

    async def search(self, query: str, limit: int, context: RegionContext) -> list[ShoppingCandidate]:
        if self.merchant == "Amazon":
            url = "https://www.amazon.in/s?" + urlencode({"k": query})
            hosts = ("amazon.in",)
        else:
            url = "https://www.flipkart.com/search?" + urlencode({"q": query})
            hosts = ("flipkart.com",)
        response = await self.fetcher.fetch(url, allowed_hosts=hosts)
        doc = document(response.body)
        results = []
        seen: set[str] = set()
        for anchor in doc.xpath(".//a[@href]")[:2000]:
            try:
                target = unwrap_url(anchor.get("href"), response.url, allowed_hosts=hosts)
                ident = identity(target, self.merchant)
            except UnsafeURL:
                continue
            if not ident.product_id or ident.offer_key in seen:
                continue
            headings = anchor.xpath(".//h2 | .//h3")
            image = _first(anchor, (".//img[@alt]",))
            name = anchor.get("title") or (node_text(headings[0]) if headings else None) or (image.get("alt") if image is not None else None)
            title = title_text(name)
            if not title:
                continue
            seen.add(ident.offer_key)
            results.append(ShoppingCandidate(title, target, self.merchant, discovery_source=self.name))
            if len(results) >= limit:
                break
        return results
