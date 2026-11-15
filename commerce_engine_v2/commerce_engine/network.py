from __future__ import annotations

import asyncio
import logging
import random
import socket
import time
import zlib
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from urllib.parse import urljoin, urlsplit

import aiohttp
from aiohttp.abc import AbstractResolver

from .models import utcnow
from .urls import UnsafeURL, public_ip, validate_url

log = logging.getLogger(__name__)


class FetchError(RuntimeError):
    def __init__(self, code: str, message: str):
        self.code = code
        super().__init__(message)


@dataclass(frozen=True)
class FetchConfig:
    total_timeout: float = 25
    connect_timeout: float = 7
    read_timeout: float = 10
    max_bytes: int = 4 * 1024 * 1024
    max_redirects: int = 8
    retries: int = 2
    global_concurrency: int = 12
    per_host_concurrency: int = 2
    min_interval: float = 0.25
    circuit_threshold: int = 4
    circuit_cooldown: float = 30
    user_agent: str = "CommerceEngine/2.0 (+merchant-product-observations)"


class PublicResolver(AbstractResolver):
    """Return only vetted IPs to TCPConnector itself, closing DNS rebinding gaps."""
    async def resolve(self, host: str, port: int = 0, family: int = socket.AF_INET) -> list[dict]:
        try:
            infos = await asyncio.wait_for(asyncio.get_running_loop().getaddrinfo(
                host, port, family=family, type=socket.SOCK_STREAM), timeout=6)
        except (OSError, asyncio.TimeoutError) as exc:
            raise OSError("Public DNS resolution failed closed") from exc
        if not infos or any(not public_ip(info[4][0]) for info in infos):
            raise OSError("DNS returned a non-public or mixed public/private address set")
        return [{"hostname": host, "host": info[4][0], "port": port, "family": info[0],
                 "proto": info[2], "flags": socket.AI_NUMERICHOST} for info in infos]

    async def close(self) -> None:
        pass


@dataclass
class FetchResponse:
    url: str
    status: int
    headers: dict[str, str]
    body: str
    fetched_at: datetime = field(default_factory=utcnow)
    redirect_chain: list[str] = field(default_factory=list)


@dataclass
class _HostState:
    failures: int = 0
    open_until: float = 0
    next_request: float = 0


class SafeFetcher:
    def __init__(self, config: FetchConfig | None = None):
        self.config = config or FetchConfig()
        if self.config.total_timeout <= 0 or self.config.max_bytes <= 0:
            raise ValueError("Timeout and response-size limit must be positive")
        if min(self.config.global_concurrency, self.config.per_host_concurrency) < 1:
            raise ValueError("Concurrency limits must be positive")
        self._session: aiohttp.ClientSession | None = None
        self._slots = asyncio.Semaphore(self.config.global_concurrency)
        self._host_slots: dict[str, asyncio.Semaphore] = {}
        self._states: dict[str, _HostState] = defaultdict(_HostState)
        self.metrics: Counter = Counter()

    async def __aenter__(self) -> SafeFetcher:
        connector = aiohttp.TCPConnector(resolver=PublicResolver(), use_dns_cache=False,
            limit=self.config.global_concurrency, limit_per_host=self.config.per_host_concurrency)
        self._session = aiohttp.ClientSession(connector=connector, trust_env=False, auto_decompress=False,
            cookie_jar=aiohttp.DummyCookieJar(), headers={"User-Agent": self.config.user_agent,
            "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-IN,en;q=0.9",
            "Accept-Encoding": "identity"},
            timeout=aiohttp.ClientTimeout(total=self.config.total_timeout,
                connect=self.config.connect_timeout, sock_read=self.config.read_timeout))
        return self

    async def __aexit__(self, *_args) -> None:
        if self._session:
            await self._session.close()
            self._session = None

    async def _hop(self, url: str) -> FetchResponse:
        if self._session is None:
            raise RuntimeError("Use SafeFetcher as an async context manager")
        # validate_url also checks literal IPs, which aiohttp does not pass to a resolver.
        url = validate_url(url)
        host = urlsplit(url).hostname or ""
        slot = self._host_slots.setdefault(host, asyncio.Semaphore(self.config.per_host_concurrency))
        state = self._states[host]
        if state.open_until > time.monotonic():
            raise FetchError("CIRCUIT_OPEN", "Merchant temporarily paused after repeated failures")
        async with slot, self._slots:
            delay = max(0.0, state.next_request - time.monotonic())
            state.next_request = max(time.monotonic(), state.next_request) + self.config.min_interval
            if delay:
                await asyncio.sleep(delay)
            async with self._session.get(url, allow_redirects=False) as response:
                self.metrics["requests"] += 1
                headers = {k.lower(): v for k, v in response.headers.items()}
                if response.status in {301, 302, 303, 307, 308}:
                    return FetchResponse(url, response.status, headers, "")
                if response.status in {429, 500, 502, 503, 504}:
                    return FetchResponse(url, response.status, headers, "")
                if response.status in {401, 403}:
                    raise FetchError("BLOCKED_HTTP", f"Merchant returned HTTP {response.status}")
                if response.status != 200:
                    raise FetchError("HTTP_ERROR", f"Merchant returned HTTP {response.status}")
                content_type = headers.get("content-type", "").split(";", 1)[0].strip().lower()
                if content_type not in {"text/html", "application/xhtml+xml"}:
                    raise FetchError("UNSUPPORTED_CONTENT_TYPE", "Response is not HTML")
                content_length = headers.get("content-length")
                if content_length and content_length.isdigit() and int(content_length) > self.config.max_bytes:
                    raise FetchError("RESPONSE_TOO_LARGE", "Declared response exceeds size limit")
                encoding = headers.get("content-encoding", "identity").lower().strip()
                if encoding not in {"identity", "", "gzip", "deflate"}:
                    raise FetchError("UNSUPPORTED_CONTENT_ENCODING", "Only identity/gzip/deflate HTML is accepted")
                decoder = zlib.decompressobj(16 + zlib.MAX_WBITS if encoding == "gzip" else zlib.MAX_WBITS) if encoding in {"gzip", "deflate"} else None
                data = bytearray()
                wire_bytes = 0
                # Bound decompression itself, before an expansion can fill aiohttp's read buffer.
                async for chunk in response.content.iter_chunked(16384):
                    wire_bytes += len(chunk)
                    if wire_bytes > self.config.max_bytes:
                        raise FetchError("RESPONSE_TOO_LARGE", "Encoded response exceeds size limit")
                    try:
                        decoded = decoder.decompress(chunk, self.config.max_bytes - len(data) + 1) if decoder else chunk
                    except zlib.error as exc:
                        raise FetchError("INVALID_CONTENT_ENCODING", "Compressed HTML is malformed") from exc
                    data.extend(decoded)
                    if len(data) > self.config.max_bytes:
                        raise FetchError("RESPONSE_TOO_LARGE", "Decoded response exceeds size limit")
                if decoder and (not decoder.eof or decoder.unused_data):
                    raise FetchError("INVALID_CONTENT_ENCODING", "Compressed response is truncated or has extra members")
                try:
                    body = bytes(data).decode(response.charset or "utf-8", errors="replace")
                except LookupError:
                    body = bytes(data).decode("utf-8", errors="replace")
                return FetchResponse(url, response.status, headers, body)

    async def fetch(self, url: str, *, allowed_hosts: tuple[str, ...] | None = None) -> FetchResponse:
        try:
            async with asyncio.timeout(self.config.total_timeout):
                return await self._fetch(url, allowed_hosts)
        except UnsafeURL as exc:
            self.metrics["unsafe_urls"] += 1
            raise FetchError("UNSAFE_URL", str(exc)) from exc
        except (asyncio.TimeoutError, aiohttp.ServerTimeoutError) as exc:
            self.metrics["timeouts"] += 1
            raise FetchError("HTTP_TIMEOUT", "Request deadline exceeded") from exc
        except aiohttp.ClientError as exc:
            self.metrics["network_errors"] += 1
            raise FetchError("NETWORK_ERROR", "Connection, TLS, or public DNS validation failed") from exc

    async def _fetch(self, url: str, allowed_hosts: tuple[str, ...] | None) -> FetchResponse:
        current = validate_url(url, allowed_hosts)
        chain: list[str] = []
        for _ in range(self.config.max_redirects + 1):
            if current in chain:
                raise FetchError("REDIRECT_LOOP", "Redirect destination already visited")
            chain.append(current)
            host = urlsplit(current).hostname or ""
            state = self._states[host]
            for attempt in range(self.config.retries + 1):
                try:
                    response = await self._hop(current)
                except (aiohttp.ClientError, FetchError, asyncio.TimeoutError) as exc:
                    if isinstance(exc, FetchError) and exc.code == "CIRCUIT_OPEN":
                        raise
                    state.failures += 1
                    if state.failures >= self.config.circuit_threshold:
                        state.open_until = time.monotonic() + self.config.circuit_cooldown
                    raise
                if response.status not in {429, 500, 502, 503, 504}:
                    state.failures = 0
                    break
                state.failures += 1
                if state.failures >= self.config.circuit_threshold:
                    state.open_until = time.monotonic() + self.config.circuit_cooldown
                if attempt == self.config.retries:
                    raise FetchError("RATE_LIMITED" if response.status == 429 else "HTTP_ERROR",
                                     f"Retry budget exhausted for HTTP {response.status}")
                retry_after = response.headers.get("retry-after", "")
                delay = min(float(retry_after), 5) if retry_after.isdigit() else min(0.5 * 2 ** attempt + random.random() * 0.2, 5)
                self.metrics["retries"] += 1
                await asyncio.sleep(delay)
            if response.status in {301, 302, 303, 307, 308}:
                location = response.headers.get("location")
                if not location:
                    raise FetchError("INVALID_REDIRECT", "Redirect has no Location header")
                # Validation precedes every actual redirected connection, including literals.
                current = validate_url(urljoin(current, location), allowed_hosts)
                self.metrics["redirects"] += 1
                continue
            response.redirect_chain = chain
            self.metrics["fetch_success"] += 1
            return response
        raise FetchError("TOO_MANY_REDIRECTS", "Redirect budget exceeded")
