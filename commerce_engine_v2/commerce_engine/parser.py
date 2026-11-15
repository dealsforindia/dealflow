from __future__ import annotations

import json
import re
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from urllib.parse import parse_qsl, urljoin, urlsplit

from lxml import etree

from .categories import candidate_matches, normalize_product
from .coupons import parse_coupon
from .merchants import MerchantProfile, cls, profile_for
from .models import Availability, Evidence, ProductSnapshot, RegionContext, utcnow
from .normalization import clean_text, currency_code, decimal_value, discount, money, price_fragment, title_text
from .structured import (availability, clearly_different, document, has_type, json_scripts,
                         matches_product, node_text, observed_region, product_objects, select)
from .urls import UnsafeURL, identity, validate_url


def _add(snapshot: ProductSnapshot, field: str, value: Any, source: str, score: float,
         currency: str | None = None, scope: str = "selected_product") -> None:
    if value is not None and value != "" and value != Availability.UNKNOWN:
        snapshot.evidence.append(Evidence(field, value, source, score, snapshot.checked_at or utcnow(), currency, scope))


def _image_values(value: Any) -> list[str]:
    if isinstance(value, list):
        return [image for item in value[:50] for image in _image_values(item)]
    if isinstance(value, dict):
        return _image_values(value.get("url") or value.get("contentUrl") or value.get("src"))
    return [value] if isinstance(value, str) else []


def _offers(product: dict, snapshot: ProductSnapshot) -> list[dict]:
    offers = product.get("offers", [])
    if isinstance(offers, dict):
        offers = [offers]
    offers = [o for o in offers if isinstance(o, dict)] if isinstance(offers, list) else []
    if any(has_type(o, "AggregateOffer") or o.get("lowPrice") is not None or o.get("highPrice") is not None for o in offers):
        snapshot.add_issue("PRICE_RANGE", "Aggregate/starting prices do not identify one purchasable offer")
        return []
    matched = [o for o in offers if matches_product(o, snapshot)]
    if matched:
        offers = matched
    offers = [o for o in offers if not clearly_different(o, snapshot)]
    if len(offers) > 1:
        # Distinct sellers/variants are not silently collapsed into a lowest price.
        fingerprints = {(str(o.get("price")), str(o.get("priceCurrency")), str(o.get("seller")),
                         str(o.get("availability")), str(o.get("url"))) for o in offers}
        if len(fingerprints) > 1:
            snapshot.add_issue("AMBIGUOUS_OFFER", "Multiple seller or variant offers; selection is required")
            return []
    return offers[:1]


def _structured(snapshot: ProductSnapshot, source: str, product: dict, profile: MerchantProfile) -> None:
    is_ld = source == "jsonld"
    confidence = 0.95 if is_ld else 0.96
    name = title_text(product.get("name") or product.get("productName") or product.get("title"))
    _add(snapshot, "title", name, source + ".name", confidence)
    brand = product.get("brand") or product.get("brandName")
    if isinstance(brand, dict):
        brand = brand.get("name")
    _add(snapshot, "brand", clean_text(brand) or None, source + ".brand", confidence)
    _add(snapshot, "description", clean_text(product.get("description"), 5000) or None, source + ".description", confidence)
    for image in _image_values(product.get("image") or product.get("images") or product.get("image_url")):
        _add(snapshot, "image", image, source + ".image", confidence)
    group = product.get("isVariantOf")
    if isinstance(group, dict):
        gid = group.get("productGroupID") or group.get("@id")
        if isinstance(gid, str):
            snapshot.family_id = gid
    if is_ld:
        for offer in _offers(product, snapshot):
            if any(offer.get(k) for k in ("eligibleCustomerType", "eligibleQuantity", "eligibleTransactionVolume", "membershipRequired", "paymentMethod")):
                snapshot.add_issue("CONDITIONAL_PRICE", "Structured offer has unconfirmed customer, payment, or quantity conditions")
                continue
            valid_until = offer.get("priceValidUntil")
            if isinstance(valid_until, str):
                try:
                    if date.fromisoformat(valid_until[:10]) < snapshot.checked_at.date():
                        snapshot.add_issue("EXPIRED_PRICE", "Structured offer's declared validity has expired")
                        continue
                except ValueError:
                    snapshot.add_issue("INVALID_OFFER_VALIDITY", "Offer validity date is malformed")
                    continue
            currency = currency_code(offer.get("priceCurrency"))
            raw = offer.get("price")
            specification = offer.get("priceSpecification")
            if raw is None and isinstance(specification, dict) and not specification.get("minPrice"):
                if any(specification.get(k) for k in ("eligibleQuantity", "eligibleCustomerType", "priceType")):
                    snapshot.add_issue("CONDITIONAL_PRICE", "Price specification is conditional or has an unresolved price type")
                    continue
                raw = specification.get("price")
                currency = currency or currency_code(specification.get("priceCurrency"))
            _add(snapshot, "sale_price", money(raw), "jsonld.offers.price", confidence, currency)
            _add(snapshot, "availability", availability(offer.get("availability")), "jsonld.offers.availability", confidence)
            seller = offer.get("seller")
            if isinstance(seller, dict):
                snapshot.seller_id = clean_text(seller.get("@id") or seller.get("identifier") or seller.get("name")) or None
        rating = product.get("aggregateRating")
        if isinstance(rating, dict):
            scale = decimal_value(rating.get("bestRating", 5))
            if scale == 5:
                _add(snapshot, "rating", decimal_value(rating.get("ratingValue")), "jsonld.aggregateRating", confidence)
            else:
                snapshot.add_issue("UNSUPPORTED_RATING_SCALE", "Rating scale is not five-star; no conversion was guessed")
            count = decimal_value(rating.get("ratingCount", rating.get("reviewCount")))
            if count is not None and count == count.to_integral_value():
                _add(snapshot, "rating_count", int(count), "jsonld.aggregateRating", confidence)
        return

    data = product
    variants = product.get("variants")
    if isinstance(variants, list) and variants:
        matched = [v for v in variants if isinstance(v, dict) and matches_product(v, snapshot)]
        if len(matched) == 1:
            data = {**product, **matched[0]}
            snapshot.variant_id = clean_text(matched[0].get("id") or matched[0].get("sku")) or snapshot.variant_id
        elif len(variants) == 1 and isinstance(variants[0], dict) and not snapshot.variant_id:
            data = {**product, **variants[0]}
        else:
            snapshot.add_issue("VARIANT_REQUIRED", "Embedded state has multiple variants without an exact selection")
            return
    slots = data.get("storeSpecificData")
    if isinstance(slots, list) and slots:
        observed = snapshot.observed_context
        matched_slots = [slot for slot in slots if isinstance(slot, dict) and observed and
            ((observed.warehouse_id and str(slot.get("warehouseId") or slot.get("storeId")) == observed.warehouse_id) or
             (not observed.warehouse_id and str(slot.get("postalCode") or slot.get("pincode")) == observed.postal_code))]
        if len(matched_slots) == 1:
            data = {**data, **matched_slots[0]}
        else:
            snapshot.add_issue("WAREHOUSE_REQUIRED", "Cannot select a unique location-specific price slot")
            return
    currency = currency_code(data.get("currency") or data.get("priceCurrency")) or profile.default_currency
    unit_text = clean_text(data.get("priceUnit") or data.get("price_unit")).lower()
    unit = {"paise": "minor", "paisa": "minor", "minor": "minor", "rupees": "major", "rupee": "major", "major": "major"}.get(unit_text, profile.state_money_unit)
    # Shopify JSON product variants explicitly use cents; only named Shopify scripts opt in.
    if "shopify" in source.lower() or "productjson" in source.lower():
        unit = "minor"
    for field, keys in {
        "sale_price": ("priceInPaise", "price_minor", "discountedPrice", "salePrice", "sellingPrice", "offerPrice", "price", "normal_price"),
        "mrp": ("mrpInPaise", "mrp_minor", "mrp", "originalPrice", "maxRetailPrice", "compare_at_price"),
    }.items():
        for key in keys:
            raw = data.get(key)
            if raw is None:
                continue
            field_unit = "minor" if key.endswith(("InPaise", "_minor")) else unit
            if isinstance(raw, dict):
                currency = currency_code(raw.get("currency")) or currency
                field_unit = "minor" if raw.get("minorUnits") is True else field_unit
                raw = raw.get("amount") or raw.get("value")
            if field_unit is None:
                snapshot.add_issue("AMBIGUOUS_PRICE_UNIT", "Embedded price has no declared rupee/paise unit; it was not converted")
                continue
            value = money(raw, unit=field_unit)
            if value is not None:
                _add(snapshot, field, value, source + "." + key, confidence, currency)
                break
    for key in ("out_of_stock", "outOfStock"):
        if isinstance(data.get(key), bool):
            _add(snapshot, "availability", availability(not data[key]), source + "." + key, confidence)
    for key in ("is_available", "isAvailable", "available", "availability", "inventoryStatus"):
        if key in data:
            _add(snapshot, "availability", availability(data[key]), source + "." + key, confidence)
    count = decimal_value(data.get("inventory"))
    if count is not None:
        _add(snapshot, "availability", availability(count > 0), source + ".inventory", confidence)


def _dom(snapshot: ProductSnapshot, doc, profile: MerchantProfile) -> None:
    for field, paths in (("title", profile.titles), ("brand", profile.brands),
                         ("sale_price", profile.prices), ("mrp", profile.mrps),
                         ("availability", profile.stock)):
        for xpath in paths:
            nodes = select(doc, xpath)
            values_found = False
            for node in nodes:
                text = clean_text(node.get("content") or node_text(node))
                if field in {"sale_price", "mrp"}:
                    value, currency = price_fragment(text, profile.default_currency)
                    _add(snapshot, field, value, "merchant_dom:" + xpath, 0.91, currency)
                    values_found |= value is not None
                elif field == "availability":
                    value = availability(text)
                    _add(snapshot, field, value, "merchant_dom:" + xpath, 0.91)
                    values_found |= value != Availability.UNKNOWN
                else:
                    value = title_text(text) if field == "title" else text
                    _add(snapshot, field, value, "merchant_dom:" + xpath, 0.91)
                    values_found |= bool(value)
            if values_found:
                break
    for xpath in profile.images:
        for node in select(doc, xpath):
            raw = node.get("data-old-hires") or node.get("data-src-hq") or node.get("data-src") or node.get("src")
            dynamic = node.get("data-a-dynamic-image")
            if dynamic:
                try:
                    images = json.loads(dynamic)
                    if isinstance(images, dict):
                        ranked = sorted(images, key=lambda k: _dimensions(images[k]), reverse=True)
                        for image in ranked[:10]:
                            _add(snapshot, "image", image, "merchant_dom:dynamic_image", 0.94)
                except (ValueError, TypeError, RecursionError):
                    pass
            if not raw:
                match = re.search(r"url\(['\"]?([^)'\"]+)", node.get("style", ""))
                raw = match[1] if match else None
            _add(snapshot, "image", raw, "merchant_dom:" + xpath, 0.90)


def _dimensions(value: Any) -> int:
    if isinstance(value, list) and len(value) == 2 and all(isinstance(x, int) and 0 < x <= 20000 for x in value):
        return value[0] * value[1]
    return 0


def _metadata(snapshot: ProductSnapshot, doc, profile: MerchantProfile) -> None:
    meta = {clean_text(n.get("property") or n.get("name")).lower(): n.get("content")
            for n in doc.xpath(".//meta[@content]")}
    _add(snapshot, "title", title_text(meta.get("og:title")), "opengraph.title", 0.78)
    _add(snapshot, "image", meta.get("og:image"), "opengraph.image", 0.80)
    currency = currency_code(meta.get("product:price:currency") or meta.get("og:price:currency"))
    _add(snapshot, "sale_price", money(meta.get("product:price:amount") or meta.get("og:price:amount")),
         "opengraph.price", 0.78, currency)
    # Product microdata is scoped to one product subtree rather than the whole document.
    scopes = select(doc, ".//*[@itemscope and (contains(@itemtype,'/Product') or contains(@itemtype,'/Book'))]")
    root = scopes[0] if len(scopes) == 1 else None
    if root is not None:
        for field, itemprop in (("title", "name"), ("sale_price", "price"), ("availability", "availability")):
            for node in select(root, f".//*[@itemprop='{itemprop}']"):
                # Nested products/recommendations must not contribute to the parent offer.
                if any(a is not root and a.get("itemscope") is not None and "Product" in a.get("itemtype", "") for a in node.iterancestors() if a is not doc):
                    continue
                text = node.get("content") or node.get("href") or node_text(node)
                if field == "sale_price":
                    currencies = root.xpath(".//*[@itemprop='priceCurrency']/@content")
                    code = currency_code(currencies[0]) if currencies else profile.default_currency
                    value, code = price_fragment(text, code)
                    _add(snapshot, field, value, "microdata.price", 0.89, code)
                else:
                    value = title_text(text) if field == "title" else availability(text)
                    _add(snapshot, field, value, "microdata." + itemprop, 0.89)
    # Generic semantic fallback remains explicitly below the verification threshold.
    if not any(e.field == "title" for e in snapshot.evidence):
        for node in select(doc, ".//h1")[:1]:
            _add(snapshot, "title", title_text(node_text(node)), "semantic.h1", 0.65)
    if not any(e.field == "sale_price" for e in snapshot.evidence):
        for name in ("sale-price", "current-price", "offer-price", "final-price"):
            for node in select(doc, cls(name)):
                value, code = price_fragment(node_text(node), profile.default_currency)
                _add(snapshot, "sale_price", value, "semantic." + name, 0.65, code)


def _resolve(snapshot: ProductSnapshot, profile: MerchantProfile) -> None:
    for field in ("title", "brand", "description", "sale_price", "mrp", "rating", "rating_count"):
        candidates = sorted((e for e in snapshot.evidence if e.field == field), key=lambda e: e.confidence, reverse=True)
        if not candidates:
            continue
        chosen = candidates[0]
        setattr(snapshot, field, chosen.value)
        snapshot.selected_evidence[field] = chosen
    prices = [e for e in snapshot.evidence if e.field == "sale_price" and e.confidence >= 0.85]
    codes = {e.currency for e in prices if e.currency}
    chosen = snapshot.selected_evidence.get("sale_price")
    if len(codes) > 1:
        snapshot.add_issue("CURRENCY_CONFLICT", "Product-specific price sources disagree on currency")
    snapshot.currency = chosen.currency if chosen else None
    if chosen and chosen.currency is None and len(codes) == 1:
        snapshot.currency = next(iter(codes))
    if chosen and chosen.currency is None and not codes and profile.default_currency:
        snapshot.currency = profile.default_currency
        _add(snapshot, "currency", profile.default_currency, "merchant_market_default", 0.75)
    if chosen and any(abs(e.value - chosen.value) > Decimal("0.01") for e in prices):
        snapshot.add_issue("PRICE_CONFLICT", "High-confidence product price sources disagree")
    states = [e for e in snapshot.evidence if e.field == "availability" and e.confidence >= 0.85]
    values = {e.value for e in states}
    if len(values) == 1:
        snapshot.availability = next(iter(values))
        snapshot.selected_evidence["availability"] = max(states, key=lambda e: e.confidence)
    elif len(values) > 1:
        snapshot.add_issue("STOCK_CONFLICT", "Availability evidence conflicts")
    if snapshot.availability == Availability.OUT_OF_STOCK:
        snapshot.add_issue("OUT_OF_STOCK", "Merchant explicitly reports unavailable")
    elif snapshot.availability == Availability.UNKNOWN:
        snapshot.add_issue("STOCK_UNKNOWN", "Availability was not explicitly confirmed")
    if snapshot.mrp is not None:
        mrp_evidence = snapshot.selected_evidence.get("mrp")
        if snapshot.sale_price is None or snapshot.mrp < snapshot.sale_price or (mrp_evidence and mrp_evidence.currency and snapshot.currency and mrp_evidence.currency != snapshot.currency):
            snapshot.mrp = None
            snapshot.add_issue("INVALID_MRP", "MRP is below sale price or in a different currency")
    snapshot.discount_pct = discount(snapshot.sale_price, snapshot.mrp)
    snapshot.effective_price = snapshot.sale_price
    if snapshot.rating is not None and not Decimal(0) <= snapshot.rating <= Decimal(5):
        snapshot.rating = None
        snapshot.add_issue("INVALID_RATING", "Rating is outside the supported five-star scale")
    seen: set[str] = set()
    for item in sorted((e for e in snapshot.evidence if e.field == "image"), key=lambda e: e.confidence, reverse=True):
        try:
            image = validate_url(urljoin(snapshot.canonical_url, item.value))
        except (UnsafeURL, TypeError):
            continue
        if image not in seen and not re.search(r"(?:sprite|placeholder|logo)(?:[._/-]|$)", urlsplit(image).path, re.I):
            seen.add(image)
            snapshot.image_urls.append(image)
        if len(snapshot.image_urls) >= 10:
            break
    if profile.location_required or snapshot.requested_context.postal_code or snapshot.requested_context.warehouse_id:
        requested, observed = snapshot.requested_context, snapshot.observed_context
        snapshot.context_confirmed = bool(requested.postal_code and observed and
            requested.postal_code == observed.postal_code and requested.country.upper() == observed.country.upper() and
            (not requested.warehouse_id or requested.warehouse_id == observed.warehouse_id))
        if not snapshot.context_confirmed:
            snapshot.add_issue("REGION_REQUIRED", "Requested postcode/warehouse was not confirmed by the merchant response")
    else:
        snapshot.context_confirmed = True
    title_evidence = snapshot.selected_evidence.get("title")
    if snapshot.title is None:
        snapshot.add_issue("TITLE_NOT_FOUND", "No merchant product title found")
    if snapshot.sale_price is None:
        snapshot.add_issue("PRICE_NOT_FOUND", "No usable product-specific price found")
    fatal = {"PRICE_CONFLICT", "CURRENCY_CONFLICT", "AMBIGUOUS_PRODUCT", "AMBIGUOUS_OFFER",
             "PRICE_RANGE", "VARIANT_REQUIRED", "WAREHOUSE_REQUIRED", "REGION_REQUIRED",
             "CONDITIONAL_PRICE", "EXPIRED_PRICE", "INVALID_OFFER_VALIDITY"}
    snapshot.price_supported = bool(chosen and chosen.confidence >= 0.85 and snapshot.currency and
        title_evidence and title_evidence.confidence >= 0.85 and snapshot.page_kind == "product" and
        not any(i.code in fatal for i in snapshot.issues))
    snapshot.price_verified = snapshot.is_live and snapshot.price_supported
    key_scores = [e.confidence for field, e in snapshot.selected_evidence.items() if field in {"title", "sale_price", "availability"}]
    snapshot.confidence = min(key_scores) if len(key_scores) == 3 and snapshot.price_supported else 0.0
    snapshot.publishable = bool(snapshot.price_verified and snapshot.in_stock is True and snapshot.confidence >= 0.85)


def parse_product_html(markup: str, url: str, *, context: RegionContext | None = None,
                       is_live: bool = False, checked_at: datetime | None = None) -> ProductSnapshot:
    profile = profile_for(url)
    ident = identity(url, profile.name)
    snapshot = ProductSnapshot(profile.name, ident.canonical_url, product_id=ident.product_id,
        variant_id=ident.variant_id, offer_key=ident.offer_key, requested_context=context or RegionContext(),
        checked_at=checked_at or utcnow(), is_live=is_live, parser_version=profile.version)
    if len(markup.encode("utf-8")) > 4 * 1024 * 1024:
        snapshot.add_issue("RESPONSE_TOO_LARGE", "Parser input exceeds 4 MiB")
        return snapshot
    try:
        doc = document(markup)
    except (ValueError, etree.ParserError):
        snapshot.add_issue("INVALID_HTML", "HTML could not be parsed")
        return snapshot
    title = " ".join(doc.xpath(".//title/text()"))
    body_text = node_text(doc)
    if (re.search(r"(?:robot check|access denied|just a moment|captcha|verify you are human)", title, re.I)
        or re.search(r"type the characters you see|enter the characters you see|verify you are human", body_text, re.I)
        or doc.xpath(".//form[contains(@action,'validateCaptcha') or contains(@action,'captcha')]") ):
        snapshot.page_kind = "captcha"
        snapshot.add_issue("BLOCKED_CAPTCHA", "Merchant returned a challenge/interstitial")
        return snapshot
    path = urlsplit(url).path.lower()
    if re.search(r"^/(?:search(?:/|$)|s(?:/|$)|category(?:/|$)|categories(?:/|$)|login(?:/|$)|signin(?:/|$))", path):
        snapshot.page_kind = "search_or_non_product"
        snapshot.add_issue("UNSUPPORTED_PAGE", "Search, category, and sign-in pages are not product offers")
        return snapshot
    scripts = json_scripts(doc)
    snapshot.observed_context = observed_region(doc, scripts)
    products = product_objects(scripts, snapshot)
    microdata = select(doc, ".//*[@itemscope and (contains(@itemtype,'/Product') or contains(@itemtype,'/Book'))]")
    snapshot.page_kind = "product" if (products or snapshot.product_id or len(microdata) == 1) else "unknown"
    if snapshot.page_kind != "product":
        snapshot.add_issue("UNSUPPORTED_PAGE", "No reliable product-page identity or structured product found")
    for source, product in products:
        _structured(snapshot, source, product, profile)
    _dom(snapshot, doc, profile)
    _metadata(snapshot, doc, profile)
    _resolve(snapshot, profile)
    selected_product = products[0][1] if products else {}
    if isinstance(selected_product.get("variants"), list) and snapshot.variant_id:
        selected_variants = [v for v in selected_product["variants"] if isinstance(v, dict) and matches_product(v, snapshot)]
        if len(selected_variants) == 1:
            selected_product = {**selected_product, **selected_variants[0]}
    normalize_product(snapshot, selected_product)
    if any(i.code == "QUANTITY_CONFLICT" for i in snapshot.issues):
        snapshot.price_supported = snapshot.price_verified = snapshot.publishable = False
        snapshot.confidence = 0.0
    for item in snapshot.evidence:
        if item.field == "title" and item.confidence >= 0.85 and snapshot.title and item.value != snapshot.title:
            matches, reason = candidate_matches(item.value, snapshot)
            if not matches:
                snapshot.add_issue("TITLE_CONFLICT", reason or "Product titles conflict")
                snapshot.price_supported = snapshot.price_verified = snapshot.publishable = False
                snapshot.confidence = 0.0
    selection = dict(parse_qsl(urlsplit(snapshot.canonical_url).query))
    for attr in ("size", "color", "shade"):
        requested_value = selection.get(attr)
        if requested_value and clean_text(snapshot.attributes.get(attr)).casefold().replace(" ", "") != requested_value.casefold().replace(" ", ""):
            snapshot.add_issue("VARIANT_UNCONFIRMED", f"Requested {attr} was not confirmed by merchant product data")
            snapshot.price_supported = snapshot.price_verified = snapshot.publishable = False
            snapshot.confidence = 0.0
    for xpath in profile.coupons:
        for node in select(doc, xpath):
            coupon = parse_coupon(node_text(node), "merchant_dom:" + xpath, snapshot.sale_price, snapshot.currency)
            if coupon and all(c.text != coupon.text for c in snapshot.coupons):
                snapshot.coupons.append(coupon)
    if not snapshot.is_live:
        snapshot.add_issue("OFFLINE_INPUT", "HTML extraction is an offline observation, not a live price check")
    return snapshot
