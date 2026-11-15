from __future__ import annotations

import json
import re
from decimal import Decimal
from typing import Any, Iterator

from lxml import etree, html

from .models import Availability, ProductSnapshot, RegionContext
from .normalization import clean_text
from .urls import UnsafeURL, canonicalize, identity


def document(markup: str) -> html.HtmlElement:
    parser = html.HTMLParser(encoding="utf-8", no_network=True, remove_comments=True, huge_tree=False)
    return html.fromstring((markup or "<html></html>").encode("utf-8"), parser=parser)


def node_text(node: html.HtmlElement) -> str:
    return clean_text(" ".join(node.xpath(".//text()[not(ancestor::script) and not(ancestor::style)]")), 5000)


def usable(node: html.HtmlElement) -> bool:
    for ancestor in (node, *node.iterancestors()):
        label = " ".join((ancestor.get("class", ""), ancestor.get("id", ""))).lower()
        if re.search(r"(?:recommend|related[-_ ]|carousel|similar[-_ ]|search-result|sponsored)", label):
            return False
        if ancestor.get("hidden") is not None or ancestor.get("aria-hidden") == "true":
            return False
        if re.search(r"(?:display\s*:\s*none|visibility\s*:\s*hidden)", ancestor.get("style", ""), re.I):
            return False
    return True


def select(root: html.HtmlElement, xpath: str) -> list[html.HtmlElement]:
    try:
        return [n for n in root.xpath(xpath)[:80] if isinstance(n, html.HtmlElement) and usable(n)]
    except etree.XPathError:
        return []


def walk_json(value: Any, max_nodes: int = 30000, max_depth: int = 30) -> Iterator[tuple[str, dict[str, Any]]]:
    stack = [("$", value, 0)]
    visited = 0
    while stack and visited < max_nodes:
        path, item, depth = stack.pop()
        visited += 1
        if depth > max_depth:
            continue
        if isinstance(item, dict):
            yield path, item
            for key, child in reversed(list(item.items())):
                if isinstance(child, (dict, list)):
                    stack.append((path + "." + str(key), child, depth + 1))
        elif isinstance(item, list):
            for i, child in reversed(list(enumerate(item[:1000]))):
                stack.append((f"{path}[{i}]", child, depth + 1))


def json_scripts(doc: html.HtmlElement) -> list[tuple[str, Any]]:
    result = []
    for script in doc.xpath(".//script")[:250]:
        raw = script.text or ""
        if len(raw) > 2 * 1024 * 1024:
            continue
        script_type = script.get("type", "").lower()
        name = script.get("id", "")
        if "ld+json" in script_type:
            source = "jsonld"
        elif script_type == "application/json" or name in {"__NEXT_DATA__", "__NUXT_DATA__", "ProductJson"}:
            source = "embedded:" + (name or "application-json")
        else:
            # Decode only JSON literals after a known assignment; never evaluate JavaScript.
            match = re.match(r"\s*(?:window\.)?(?:__INITIAL_STATE__|__NUXT__|__PRELOADED_STATE__)\s*=\s*", raw)
            if not match:
                continue
            raw = raw[match.end():]
            source = "embedded:assignment"
        try:
            value, end = json.JSONDecoder(parse_float=Decimal).raw_decode(raw.lstrip())
            remaining = raw.lstrip()[end:].strip()
            if remaining not in {"", ";"}:
                continue
            result.append((source, value))
        except (ValueError, RecursionError):
            continue
    return result


def has_type(obj: dict, expected: str) -> bool:
    types = obj.get("@type", [])
    if not isinstance(types, list):
        types = [types]
    return any(isinstance(t, str) and t.rsplit("/", 1)[-1].lower() == expected.lower() for t in types)


def resolve_refs(obj: Any, index: dict[str, dict], depth: int = 0, seen: frozenset = frozenset(), budget: list[int] | None = None) -> Any:
    budget = budget if budget is not None else [30000]
    budget[0] -= 1
    if depth > 12 or budget[0] < 0:
        return None
    if isinstance(obj, list):
        return [resolve_refs(v, index, depth + 1, seen, budget) for v in obj[:1000]]
    if isinstance(obj, dict):
        ref = obj.get("@id")
        if isinstance(ref, str) and ref in index and ref not in seen and len(obj) == 1:
            return resolve_refs(index[ref], index, depth + 1, seen | {ref}, budget)
        return {k: resolve_refs(v, index, depth + 1, seen | {ref} if isinstance(ref, str) else seen, budget)
                for k, v in obj.items()}
    return obj


def _object_ids(obj: dict) -> set[str]:
    return {str(obj[k]).lower() for k in ("productID", "productId", "product_id", "id", "sku", "asin", "variantId", "variant_id")
            if isinstance(obj.get(k), (str, int)) and not isinstance(obj.get(k), bool)}


def matches_product(obj: dict, snapshot: ProductSnapshot) -> bool:
    target = snapshot.variant_id or snapshot.product_id
    if target and target.lower() in _object_ids(obj):
        return True
    if snapshot.variant_id and isinstance(obj.get("variants"), list):
        if any(isinstance(v, dict) and snapshot.variant_id.lower() in _object_ids(v) for v in obj["variants"]):
            return True
    for raw in (obj.get("url"), obj.get("@id")):
        if isinstance(raw, str) and raw.startswith(("http://", "https://")):
            try:
                linked = identity(raw, snapshot.merchant)
                if canonicalize(raw) == snapshot.canonical_url:
                    return True
                if target and linked.product_id and linked.product_id.lower() == target.lower():
                    return not snapshot.variant_id or linked.variant_id == snapshot.variant_id
            except UnsafeURL:
                pass
    return False


def clearly_different(obj: dict, snapshot: ProductSnapshot) -> bool:
    if snapshot.merchant == "Amazon" and obj.get("asin") and str(obj["asin"]).upper() != snapshot.product_id:
        return True
    explicit_variant = obj.get("variantId") or obj.get("variant_id")
    if snapshot.variant_id and explicit_variant and str(explicit_variant).lower() != snapshot.variant_id.lower():
        return True
    url = obj.get("url")
    if not isinstance(url, str) or not url.startswith(("http://", "https://")):
        return False
    try:
        linked = identity(url, snapshot.merchant)
        if linked.product_id and snapshot.product_id and linked.product_id.lower() != snapshot.product_id.lower():
            return True
        if snapshot.variant_id and linked.variant_id and linked.variant_id != snapshot.variant_id:
            return True
    except UnsafeURL:
        return True
    return False


def product_objects(scripts: list[tuple[str, Any]], snapshot: ProductSnapshot) -> list[tuple[str, dict]]:
    candidates: list[tuple[str, dict]] = []
    for source, value in scripts:
        nodes = list(walk_json(value))
        index = {obj["@id"]: obj for _, obj in nodes if isinstance(obj.get("@id"), str)}
        for path, obj in nodes:
            if re.search(r"recommend|related|similar|crosssell|upsell|itemListElement|\.isVariantOf", path, re.I):
                continue
            if source == "jsonld":
                if has_type(obj, "Product") or has_type(obj, "Book"):
                    candidates.append((source, resolve_refs(obj, index)))
            else:
                name = obj.get("name") or obj.get("productName") or obj.get("title")
                has_price = any(k in obj for k in ("price", "salePrice", "sellingPrice", "discountedPrice", "offerPrice", "priceInPaise", "variants", "storeSpecificData"))
                explicit_slot = bool(re.search(r"\.(?:product|productDetails|pdpData)$", path)) or path == "$" and "product" in source.lower()
                if name and has_price and (explicit_slot or matches_product(obj, snapshot)):
                    candidates.append((source, obj))
    matched = [(s, obj) for s, obj in candidates if matches_product(obj, snapshot)]
    if matched:
        return matched
    survivors = [(s, obj) for s, obj in candidates if not clearly_different(obj, snapshot)]
    # Multiple representations of the same product are OK; multiple named products aren't.
    names = {clean_text(obj.get("name") or obj.get("title") or obj.get("productName")).lower() for _, obj in survivors}
    if len(names) <= 1 and not snapshot.variant_id:
        return survivors
    if survivors:
        snapshot.add_issue("AMBIGUOUS_PRODUCT", "Structured data contains multiple products or an unresolved variant")
    return []


def availability(value: Any) -> Availability:
    if value is True:
        return Availability.IN_STOCK
    if value is False:
        return Availability.OUT_OF_STOCK
    text = clean_text(value).lower().rsplit("/", 1)[-1]
    if re.search(r"\b(?:coming\s+soon|pre[- ]?order|back[- ]?order|available\s+(?:soon|from|on|after)|in\s*stock\s+(?:soon|from|on|after))\b", text):
        return Availability.UNKNOWN
    if re.search(r"\b(?:out\s*of\s*stock|outofstock|sold\s*out|soldout|currently\s+unavailable|unavailable|discontinued|not\s+in\s+stock|not\s+available)\b", text):
        return Availability.OUT_OF_STOCK
    if re.search(r"\b(?:in\s*stock|instock|limitedavailability|available)\b", text):
        return Availability.IN_STOCK
    return Availability.UNKNOWN


def observed_region(doc: html.HtmlElement, scripts: list[tuple[str, Any]]) -> RegionContext | None:
    values = doc.xpath(".//meta[@name='delivery-postal-code']/@content")
    regions: list[RegionContext] = []
    if values:
        regions.append(RegionContext(postal_code=clean_text(values[0])))
    for source, value in scripts:
        if source.startswith("embedded") and isinstance(value, dict):
            props = value.get("props", {}).get("pageProps", {}) if isinstance(value.get("props"), dict) else value
            if not isinstance(props, dict):
                continue
            for key in ("deliveryAddress", "location", "regionContext"):
                region = props.get(key)
                if not isinstance(region, dict):
                    continue
                postal = region.get("postalCode") or region.get("postal_code") or region.get("pincode")
                if postal:
                    regions.append(RegionContext(country=clean_text(region.get("country") or "IN").upper(),
                        postal_code=clean_text(postal), city=clean_text(region.get("city")) or None,
                        warehouse_id=clean_text(region.get("warehouseId") or region.get("warehouse_id")) or None))
    if regions and len({(r.country, r.postal_code, r.warehouse_id) for r in regions}) == 1:
        return regions[0]
    return None
