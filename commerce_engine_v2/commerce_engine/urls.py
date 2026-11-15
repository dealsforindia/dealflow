from __future__ import annotations

import base64
import hashlib
import json
import ipaddress
import re
from dataclasses import dataclass
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit


class UnsafeURL(ValueError):
    pass


def public_ip(address: str) -> bool:
    try:
        ip = ipaddress.ip_address(address)
        if isinstance(ip, ipaddress.IPv6Address) and (ip.ipv4_mapped or ip.sixtofour or ip.teredo or ip.is_site_local):
            return False
        return bool(ip.is_global and not ip.is_multicast and not ip.is_reserved)
    except ValueError:
        return False


def validate_url(url: str, allowed_hosts: tuple[str, ...] | None = None) -> str:
    """Syntax and literal-IP checks. DNS is checked by the actual connector resolver."""
    if not isinstance(url, str) or not url or len(url) > 8192:
        raise UnsafeURL("Empty or oversized URL")
    if re.search(r"[\s\\\x00-\x1f\x7f]", url):
        raise UnsafeURL("Whitespace, controls, or backslashes in URL")
    try:
        parts = urlsplit(url)
        if parts.scheme.lower() not in {"http", "https"} or not parts.hostname:
            raise UnsafeURL("Only absolute HTTP(S) URLs are supported")
        if parts.username is not None or parts.password is not None:
            raise UnsafeURL("URL credentials are forbidden")
        if parts.port not in {None, 80, 443}:
            raise UnsafeURL("Only ports 80 and 443 are supported")
        host = parts.hostname.encode("idna").decode("ascii").lower().rstrip(".")
        if "%" in host:
            raise UnsafeURL("Encoded hosts and IPv6 zone identifiers are forbidden")
        try:
            ipaddress.ip_address(host)
        except ValueError:
            if len(host) > 253 or "." not in host or not all(
                re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label)
                for label in host.split(".")
            ):
                raise UnsafeURL("Invalid public hostname")
            if host.endswith((".localhost", ".local", ".internal", ".home", ".lan")):
                raise UnsafeURL("Internal hostname")
        else:
            if not public_ip(host):
                raise UnsafeURL("Non-public IP address")
        if allowed_hosts is not None and not any(host_matches(host, d) for d in allowed_hosts):
            raise UnsafeURL("Destination is outside the permitted merchant/provider domains")
        authority = f"[{host}]" if ":" in host else host
        if parts.port and parts.port != (443 if parts.scheme.lower() == "https" else 80):
            authority += f":{parts.port}"
        return urlunsplit((parts.scheme.lower(), authority, parts.path or "/", parts.query, ""))
    except (ValueError, UnicodeError) as exc:
        if isinstance(exc, UnsafeURL):
            raise
        raise UnsafeURL("Malformed URL") from exc


def host_matches(host: str, domain: str) -> bool:
    return host == domain or host.endswith("." + domain)


TRACKING = {"tag", "ascsubtag", "affid", "affextparam1", "affextparam2", "gclid", "fbclid",
            "ref", "ref_", "linkcode", "linkid", "camp", "creative", "creativeasin",
            "psc", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"}


def canonicalize(url: str) -> str:
    parts = urlsplit(validate_url(url))
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
             if k.lower() not in TRACKING and not k.lower().startswith("utm_")]
    path = parts.path
    # Only reinterpret an ASIN when the destination hostname is actually Amazon.
    if host_matches(parts.hostname or "", "amazon.in"):
        match = re.search(r"/(?:dp|gp/product|gp/aw/d|product-reviews)/([A-Z0-9]{10})(?:/|$)", path, re.I)
        if match:
            path = "/dp/" + match[1].upper()
    return urlunsplit((parts.scheme, parts.netloc, path, urlencode(sorted(query)), ""))


@dataclass(frozen=True)
class ProductIdentity:
    merchant: str
    product_id: str | None
    variant_id: str | None
    offer_key: str
    canonical_url: str


def identity(url: str, merchant: str) -> ProductIdentity:
    canonical = canonicalize(url)
    parts = urlsplit(canonical)
    query = dict(parse_qsl(parts.query))
    patterns = {
        "Amazon": r"/dp/([A-Z0-9]{10})(?:/|$)",
        "Flipkart": r"/p/(itm[a-zA-Z0-9]+)", "Shopsy": r"/p/(itm[a-zA-Z0-9]+)",
        "Myntra": r"/(\d+)/buy(?:/|$)", "AJIO": r"/p/([A-Za-z0-9_-]+)",
        "SHEIN India": r"/p/([A-Za-z0-9_-]+)", "Blinkit": r"/prid/(\d+)",
        "Zepto": r"/pvid/([A-Za-z0-9_-]+)", "Croma": r"/p/(\d+)",
        "Nykaa": r"/p/(\d+)", "Tata CLiQ": r"/p-([A-Za-z0-9_-]+)",
        "JioMart": r"/p/[^/]+/[^/]+/(\d+)", "BigBasket": r"/pd/(\d+)",
        "Swiggy": r"/item/([A-Za-z0-9_-]+)",
    }
    match = re.search(patterns[merchant], parts.path, re.I) if merchant in patterns else None
    pid = match[1] if match else None
    if merchant in {"Flipkart", "Shopsy"}:
        pid = query.get("pid") or pid
    variant = query.get("variant") or query.get("variantId") or query.get("sku")
    # Preserve all non-tracking parameters in the key. Unknown selection parameters matter.
    host = parts.hostname or ""
    if merchant in patterns and host.startswith("www."):
        host = host[4:]
    payload = [merchant, host, pid or parts.path, sorted(query.items())]
    digest = hashlib.sha256(json.dumps(payload, separators=(",", ":")).encode()).hexdigest()[:24]
    key = f"{host}:{pid or 'url'}:{digest}"
    return ProductIdentity(merchant, pid, variant, key, canonical)


WRAPPERS = ("google.com", "google.co.in", "bing.com", "amzn.to", "amzn.in", "a.co",
            "fkrt.it", "fkrt.cc", "fkrt.to", "bit.ly", "tinyurl.com", "t.co",
            "earnkaro.com", "ekaro.in", "wishlink.com", "lehlah.club", "openinapp.co",
            "openinapp.link", "clnk.in", "myntr.in", "ajiio.in", "inr.deals")


def unwrap_url(url: str, base: str | None = None, *, allowed_hosts: tuple[str, ...] | None = None) -> str:
    """Decode destinations only on known redirect services; never guess product URLs."""
    current = urljoin(base, url) if base else url
    seen: set[str] = set()
    for _ in range(8):
        current = validate_url(current)
        if current in seen:
            raise UnsafeURL("Redirect parameter loop")
        seen.add(current)
        parts = urlsplit(current)
        if not any(host_matches(parts.hostname or "", d) for d in WRAPPERS):
            return validate_url(current, allowed_hosts)
        params = dict(parse_qsl(parts.query))
        destination = next((params[k] for k in ("url", "adurl", "q", "dest", "target", "destination",
                            "redirect_url", "target_url", "link") if params.get(k)), None)
        if destination is None and host_matches(parts.hostname or "", "bing.com") and params.get("u", "").startswith("a1"):
            try:
                encoded = params["u"][2:]
                destination = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)).decode("utf-8")
            except (ValueError, UnicodeError):
                raise UnsafeURL("Invalid Bing destination encoding")
        if not destination:
            return validate_url(current, allowed_hosts) if allowed_hosts else current
        # parse_qsl already decodes percent escapes exactly once; do not unquote again.
        if destination.startswith("aHR0c"):
            try:
                destination = base64.urlsafe_b64decode(destination + "=" * (-len(destination) % 4)).decode("utf-8")
            except (ValueError, UnicodeError):
                raise UnsafeURL("Invalid encoded destination")
        if not destination.startswith(("http://", "https://")):
            return validate_url(current, allowed_hosts) if allowed_hosts else current
        current = destination
    raise UnsafeURL("Too many encoded redirects")
