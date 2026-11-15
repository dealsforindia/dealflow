from __future__ import annotations

import asyncio
import hashlib
import inspect
import json
import logging
import sqlite3
import time
from collections import Counter
from typing import Callable

from .cache import TTLCache
from .categories import candidate_matches
from .discovery import (BingShoppingProvider, DiscoveryProvider, GoogleShoppingProvider,
                        MerchantSearchProvider)
from .history import HistoryStore
from .merchants import MERCHANT_HOSTS, profile_for
from .models import ProductSnapshot, RegionContext, SearchResult, ShoppingCandidate, to_jsonable, utcnow
from .network import FetchConfig, FetchError, SafeFetcher
from .parser import parse_product_html
from .query import query_matches, understand_query
from .urls import WRAPPERS, UnsafeURL, identity, unwrap_url, validate_url

log = logging.getLogger(__name__)


class CommerceEngine:
    """Reusable async engine. Discovery observations never become live evidence."""
    def __init__(self, *, fetcher=None, config: FetchConfig | None = None,
                 providers: list[DiscoveryProvider] | None = None,
                 history: HistoryStore | None = None, affiliate_converter: Callable | None = None,
                 verification_concurrency: int = 4, search_timeout: float = 60,
                 discovery_cache: TTLCache | None = None):
        if verification_concurrency < 1 or search_timeout <= 0:
            raise ValueError("Verification concurrency and timeout must be positive")
        self.fetcher = fetcher if fetcher is not None else SafeFetcher(config)
        self._owns_fetcher = fetcher is None
        self.providers = providers if providers is not None else [
            GoogleShoppingProvider(self.fetcher), BingShoppingProvider(self.fetcher),
            MerchantSearchProvider(self.fetcher, "Amazon"), MerchantSearchProvider(self.fetcher, "Flipkart")]
        self.history, self.affiliate_converter = history, affiliate_converter
        self.verification_concurrency, self.search_timeout = verification_concurrency, search_timeout
        self.cache = discovery_cache if discovery_cache is not None else TTLCache()
        self.metrics: Counter = Counter()

    async def __aenter__(self) -> CommerceEngine:
        if self._owns_fetcher:
            await self.fetcher.__aenter__()
        return self

    async def __aexit__(self, *args) -> None:
        if self._owns_fetcher:
            await self.fetcher.__aexit__(*args)

    @staticmethod
    def _failure(url: str, code: str, message: str, context: RegionContext) -> ProductSnapshot:
        try:
            merchant = profile_for(url).name
        except (ValueError, TypeError, AttributeError):
            merchant = "Unknown"
        snapshot = ProductSnapshot(merchant, url, requested_context=context)
        snapshot.add_issue(code, message)
        return snapshot

    async def lookup(self, url: str, *, context: RegionContext | None = None,
                     enrich: bool = True, require_supported_merchant: bool = False) -> ProductSnapshot:
        context = context or RegionContext()
        start = time.monotonic()
        self.metrics["lookups"] += 1
        try:
            target = unwrap_url(url)
            # A known wrapper may lead to a merchant through HTTP redirects.
            # Every hop remains subject to the public-address network policy.
            response = await self.fetcher.fetch(target, **({"allowed_hosts": MERCHANT_HOSTS + WRAPPERS} if require_supported_merchant else {}))
            final_url = validate_url(response.url, MERCHANT_HOSTS if require_supported_merchant else None)
            product = await asyncio.to_thread(parse_product_html, response.body, final_url,
                context=context, is_live=True, checked_at=response.fetched_at)
        except (UnsafeURL, FetchError) as exc:
            code = exc.code if isinstance(exc, FetchError) else "UNSAFE_URL"
            product = self._failure(url, code, str(exc), context)
        except asyncio.TimeoutError:
            product = self._failure(url, "HTTP_TIMEOUT", "Lookup deadline exceeded", context)
        self.metrics["lookup_elapsed_ms"] += int((time.monotonic() - start) * 1000)
        if enrich:
            await self._enrich(product)
        self.metrics["publishable" if product.publishable else "unpublishable"] += 1
        for issue in product.issues:
            self.metrics["issue:" + issue.code] += 1
        log.info("lookup merchant=%s publishable=%s issues=%s", product.merchant,
                 product.publishable, [i.code for i in product.issues])
        return product

    async def _enrich(self, product: ProductSnapshot) -> None:
        if not product.publishable:
            return
        if self.history is not None:
            try:
                accepted, summary = await self.history.assess_and_record(product)
                product.history = summary
                if summary.get("anomaly"):
                    product.publishable = False
                    product.add_issue("PRICE_ANOMALY", "Price deviates sharply from the verified local history baseline")
                elif not accepted:
                    product.add_issue(summary.get("reason", "HISTORY_REJECTED"), "History did not accept this observation")
            except (OSError, RuntimeError, sqlite3.Error) as exc:
                product.add_issue("HISTORY_ERROR", "Local history enrichment failed")
                log.warning("history failure: %s", type(exc).__name__)
        if self.affiliate_converter and product.publishable:
            try:
                async with asyncio.timeout(2):
                    converted = self.affiliate_converter(product.canonical_url)
                    if not inspect.isawaitable(converted):
                        raise TypeError("Affiliate converter must be async")
                    affiliate_url = await converted
                    if affiliate_url:
                        product.affiliate_url = validate_url(affiliate_url)
            except (Exception, asyncio.TimeoutError) as exc:
                product.add_issue("AFFILIATE_ERROR", "Affiliate conversion failed; canonical URL remains available")
                log.debug("affiliate failure: %s", type(exc).__name__)

    async def discover(self, query: str, *, limit: int = 8,
                       context: RegionContext | None = None) -> tuple[list[ShoppingCandidate], bool, list[dict]]:
        context = context or RegionContext()
        query = " ".join(query.split())[:180]
        if not query:
            raise ValueError("Search query must not be empty")
        limit = min(max(int(limit), 1), 16)
        payload = [query.casefold(), limit, to_jsonable(context), [p.name for p in self.providers]]
        cache_key = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        cached = self.cache.get(cache_key)
        if cached is not None:
            self.metrics["discovery_cache_hits"] += 1
            return cached, True, []
        results: list[ShoppingCandidate] = []
        seen: set[str] = set()
        failures = []
        for provider in self.providers:
            try:
                async with asyncio.timeout(12):
                    batch = await provider.search(query, limit, context)
            except (Exception, asyncio.TimeoutError) as exc:
                failures.append({"provider": provider.name, "code": getattr(exc, "code", "DISCOVERY_FAILED")})
                self.metrics["provider_errors:" + provider.name] += 1
                continue
            for candidate in batch:
                try:
                    target = unwrap_url(candidate.raw_url, allowed_hosts=MERCHANT_HOSTS)
                    key = identity(target, profile_for(target).name).offer_key
                except UnsafeURL:
                    continue
                if key in seen:
                    continue
                seen.add(key)
                results.append(candidate)
                if len(results) >= limit:
                    break
            if len(results) >= limit:
                break
        if results:
            self.cache.put(cache_key, results)
        self.metrics["discovered_candidates"] += len(results)
        return results, False, failures

    async def search(self, query: str, *, limit: int = 8, context: RegionContext | None = None) -> dict:
        context = context or RegionContext()
        requested_limit = min(max(int(limit), 1), 16)
        intent = understand_query(query, context)
        candidates: list[ShoppingCandidate] = []
        completed: dict[int, SearchResult] = {}
        slots = asyncio.Semaphore(self.verification_concurrency)
        cached = False
        provider_failures: list[dict] = []
        timed_out = False
        async def verify(index: int, candidate: ShoppingCandidate) -> None:
            async with slots:
                product = await self.lookup(candidate.raw_url, context=context, enrich=False,
                                            require_supported_merchant=True)
                if product.title:
                    matched, reason = candidate_matches(candidate.title, product)
                    if not matched:
                        product.publishable = False
                        product.price_verified = False
                        product.price_supported = False
                        product.add_issue("PRODUCT_MISMATCH", reason or "Discovery did not match the merchant offer")
                    matches_query, reason = query_matches(intent, product)
                    if not matches_query:
                        product.publishable = False
                        product.add_issue("QUERY_MISMATCH", reason or "Product does not match the requested filters")
                await self._enrich(product)
                completed[index] = SearchResult(candidate, product)
        try:
            async with asyncio.timeout(self.search_timeout):
                candidates, cached, provider_failures = await self.discover(query, limit=min(requested_limit * 2, 16), context=context)
                # Structured cancellation awaits every child; no network threads are spawned.
                async with asyncio.TaskGroup() as group:
                    for index, candidate in enumerate(candidates):
                        group.create_task(verify(index, candidate))
        except asyncio.TimeoutError:
            timed_out = True
        results: list[SearchResult] = []
        final_seen: set[str] = set()
        for index, candidate in enumerate(candidates):
            result = completed.get(index) or SearchResult(candidate, self._failure(candidate.raw_url,
                "VERIFICATION_TIMEOUT", "Verification did not finish before the search deadline", context))
            key = result.product.offer_key or candidate.raw_url
            if key in final_seen:
                continue
            final_seen.add(key)
            results.append(result)
        # Rank only supported, explicitly available results by verified sale price.
        # Different currencies are grouped; there is no implicit FX conversion.
        results.sort(key=lambda r: (not r.product.publishable, r.product.currency or "ZZZ",
                                    r.product.sale_price if r.product.publishable else float("inf")))
        results = results[:requested_limit]
        return {"query": " ".join(query.split())[:180], "intent": to_jsonable(intent), "results": [r.to_dict() for r in results],
                "total": len(results), "verified_total": sum(r.product.publishable for r in results),
                "cached": cached, "cache_scope": "discovery_only", "timed_out": timed_out,
                "provider_failures": provider_failures, "scraped_at": utcnow().isoformat(),
                "price_note": "Prices are merchant observations at checked_at; checkout, delivery fees, and conditional offers may differ."}

    def health(self) -> dict:
        return {"engine": dict(self.metrics), "network": dict(getattr(self.fetcher, "metrics", {}))}
