import asyncio
import base64
import socket
import unittest
from unittest.mock import AsyncMock, patch
from urllib.parse import quote

import aiohttp

from commerce_engine.merchants import profile_for
from commerce_engine.network import FetchConfig, FetchError, FetchResponse, PublicResolver, SafeFetcher
from commerce_engine.urls import UnsafeURL, canonicalize, identity, public_ip, unwrap_url, validate_url


class URLTests(unittest.TestCase):
    def test_private_and_malformed_urls_rejected(self):
        urls = ["http://127.0.0.1/", "http://10.0.0.1/", "http://169.254.169.254/",
                "http://[::1]/", "http://[::ffff:8.8.8.8]/", "http://224.0.0.1/",
                "http://localhost/", "http://x.local/", "file:///etc/passwd", "https://example.com:8443/",
                "https://user:pass@example.com/", "https://example.com\\@127.0.0.1/",
                "https://exa mple.com/", "https://example.com/\nfoo", "http://[fe80::1%25eth0]/"]
        for url in urls:
            with self.subTest(url=url), self.assertRaises(UnsafeURL):
                validate_url(url)

    def test_public_ip(self):
        self.assertTrue(public_ip("8.8.8.8"))
        self.assertFalse(public_ip("192.0.2.1"))
        self.assertFalse(public_ip("ff02::1"))
        self.assertFalse(public_ip("fec0::1"))

    def test_merchant_detection_uses_hostname(self):
        self.assertEqual(profile_for("https://example.com/amazon-case").name, "example.com")
        self.assertEqual(profile_for("https://amazon.in.attacker.com/dp/B012345678").name, "amazon.in.attacker.com")
        self.assertEqual(profile_for("https://www.amazon.in/dp/B012345678").name, "Amazon")

    def test_domain_allowlist_boundary(self):
        self.assertEqual(validate_url("https://www.amazon.in/", ("amazon.in",)), "https://www.amazon.in/")
        with self.assertRaises(UnsafeURL):
            validate_url("https://amazon.in.evil.com/", ("amazon.in",))

    def test_amazon_aliases_and_tracking_dedupe(self):
        a = identity("https://www.amazon.in/product-reviews/B012345678?tag=aff-21", "Amazon")
        b = identity("https://amazon.in/some-slug/gp/aw/d/B012345678", "Amazon")
        self.assertEqual(a.product_id, "B012345678")
        self.assertEqual(a.offer_key, b.offer_key)

    def test_variant_queries_are_preserved(self):
        a = identity("https://example.com/p/123?variant=red&size=8&utm_source=x", "example.com")
        b = identity("https://example.com/p/123?variant=red&size=9", "example.com")
        self.assertIn("size=8", a.canonical_url)
        self.assertNotEqual(a.offer_key, b.offer_key)

    def test_google_unwrap_and_unsafe_destination(self):
        target = "https://www.amazon.in/dp/B012345678?tag=foo"
        self.assertEqual(unwrap_url("/url?q=" + quote(target, safe=""), "https://www.google.com/"), target)
        with self.assertRaises(UnsafeURL):
            unwrap_url("https://www.google.com/url?q=http%3A%2F%2F127.0.0.1")

    def test_arbitrary_store_parameter_is_not_unwrapped(self):
        url = "https://example.com/product?url=https%3A%2F%2Famazon.in%2Fdp%2FB012345678"
        self.assertEqual(unwrap_url(url), url)

    def test_bing_encoded_destination(self):
        target = "https://www.croma.com/phone/p/12345"
        encoded = base64.urlsafe_b64encode(target.encode()).decode().rstrip("=")
        self.assertEqual(unwrap_url("https://www.bing.com/ck/a?u=a1" + encoded), target)


class DNSAndRedirectTests(unittest.IsolatedAsyncioTestCase):
    async def test_dns_failure_closed(self):
        loop = asyncio.get_running_loop()
        with patch.object(loop, "getaddrinfo", AsyncMock(side_effect=socket.gaierror())):
            with self.assertRaises(OSError):
                await PublicResolver().resolve("unresolved.example.com", 443)

    async def test_mixed_dns_rejected(self):
        infos = [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("8.8.8.8", 443)),
                 (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("127.0.0.1", 443))]
        loop = asyncio.get_running_loop()
        with patch.object(loop, "getaddrinfo", AsyncMock(return_value=infos)):
            with self.assertRaises(OSError):
                await PublicResolver().resolve("mixed.example.com", 443)

    async def test_resolver_returns_exact_validated_addresses(self):
        info = [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("8.8.8.8", 443))]
        loop = asyncio.get_running_loop()
        with patch.object(loop, "getaddrinfo", AsyncMock(return_value=info)) as mocked:
            rows = await PublicResolver().resolve("example.com", 443)
        self.assertEqual(rows[0]["host"], "8.8.8.8")
        self.assertEqual(mocked.await_count, 1)

    async def test_redirect_to_private_is_blocked_before_connection(self):
        fetcher = SafeFetcher()
        fetcher._hop = AsyncMock(return_value=FetchResponse("https://example.com/", 302,
            {"location": "http://127.0.0.1/admin"}, ""))
        with self.assertRaises(FetchError) as caught:
            await fetcher.fetch("https://example.com/")
        self.assertEqual(caught.exception.code, "UNSAFE_URL")
        self.assertEqual(fetcher._hop.await_count, 1)

    async def test_redirect_loop(self):
        fetcher = SafeFetcher()
        fetcher._hop = AsyncMock(return_value=FetchResponse("https://example.com/", 302, {"location": "/"}, ""))
        with self.assertRaises(FetchError) as caught:
            await fetcher.fetch("https://example.com/")
        self.assertEqual(caught.exception.code, "REDIRECT_LOOP")

    async def test_redirect_host_allowlist(self):
        fetcher = SafeFetcher()
        fetcher._hop = AsyncMock(return_value=FetchResponse("https://example.com/", 302, {"location": "https://evil.com/"}, ""))
        with self.assertRaises(FetchError):
            await fetcher.fetch("https://example.com/", allowed_hosts=("example.com",))
        self.assertEqual(fetcher._hop.await_count, 1)

    async def test_retry_budget(self):
        fetcher = SafeFetcher(FetchConfig(retries=2))
        fetcher._hop = AsyncMock(side_effect=[FetchResponse("https://example.com/", 503, {}, ""),
            FetchResponse("https://example.com/", 503, {}, ""), FetchResponse("https://example.com/", 200, {}, "ok")])
        with patch("commerce_engine.network.asyncio.sleep", AsyncMock()):
            response = await fetcher.fetch("https://example.com/")
        self.assertEqual(response.body, "ok")
        self.assertEqual(fetcher.metrics["retries"], 2)

    async def test_external_cancellation_propagates(self):
        fetcher = SafeFetcher()
        fetcher._hop = AsyncMock(side_effect=asyncio.CancelledError())
        with self.assertRaises(asyncio.CancelledError):
            await fetcher.fetch("https://example.com/")


class Body:
    def __init__(self, chunks):
        self.chunks = chunks
    async def iter_chunked(self, n):
        for chunk in self.chunks:
            yield chunk


class Response:
    def __init__(self, chunks, *, content_type="text/html", status=200):
        self.status = status
        self.headers = {"content-type": content_type}
        self.charset = "utf-8"
        self.content = Body(chunks)
    async def __aenter__(self):
        return self
    async def __aexit__(self, *args):
        pass


class Session:
    def __init__(self, response):
        self.response = response
    def get(self, url, **kwargs):
        assert kwargs["allow_redirects"] is False
        return self.response


class ResponseLimitTests(unittest.IsolatedAsyncioTestCase):
    async def test_decoded_stream_limit(self):
        fetcher = SafeFetcher(FetchConfig(max_bytes=5, min_interval=0))
        fetcher._session = Session(Response([b"abc", b"def"]))
        with self.assertRaises(FetchError) as caught:
            await fetcher.fetch("https://example.com/")
        self.assertEqual(caught.exception.code, "RESPONSE_TOO_LARGE")

    async def test_content_type_rejected(self):
        fetcher = SafeFetcher(FetchConfig(min_interval=0))
        fetcher._session = Session(Response([b"hello"], content_type="application/pdf"))
        with self.assertRaises(FetchError) as caught:
            await fetcher.fetch("https://example.com/")
        self.assertEqual(caught.exception.code, "UNSUPPORTED_CONTENT_TYPE")

    async def test_real_connector_has_guarded_resolver(self):
        async with SafeFetcher() as fetcher:
            self.assertIsInstance(fetcher._session.connector._resolver, PublicResolver)
            self.assertFalse(fetcher._session.trust_env)
            self.assertIsInstance(fetcher._session.cookie_jar, aiohttp.DummyCookieJar)
