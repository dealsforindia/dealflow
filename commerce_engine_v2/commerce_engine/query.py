"""Small, deterministic query understanding. Unknown facets are not invented."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from .categories import CRITICAL, normalize_product
from .models import ProductSnapshot, RegionContext
from .normalization import NUMBER, money


@dataclass
class QueryIntent:
    query: str
    category: str = "general"
    attributes: dict[str, Any] = field(default_factory=dict)
    model: str | None = None
    model_generation: str | None = None
    model_qualifiers: list[str] = field(default_factory=list)
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    currency: str | None = None


def understand_query(query: str, context: RegionContext) -> QueryIntent:
    intent = QueryIntent(" ".join(query.split())[:180])
    text = intent.query
    pattern = rf"\b(under|below|less than|above|over|more than)\s*(₹|Rs\.?|INR|USD|EUR|GBP)?\s*({NUMBER})\b"
    for match in re.finditer(pattern, text, re.I):
        value = money(match[3])
        code = match[2].upper().rstrip(".") if match[2] else ("INR" if context.country.upper() == "IN" else None)
        intent.currency = "INR" if code in {"₹", "RS"} else code
        if match[1].lower() in {"under", "below", "less than"}:
            intent.max_price = value
        else:
            intent.min_price = value
    product_text = re.sub(pattern, "", text, flags=re.I)
    probe = ProductSnapshot("query", "https://example.com/", title=product_text)
    normalize_product(probe, {})
    intent.category, intent.attributes = probe.category, probe.attributes
    match = re.search(r"\b(iphone|galaxy|pixel)\s*(\d+)\b", product_text, re.I)
    if match:
        intent.model, intent.model_generation = match[1].lower(), match[2]
        intent.model_qualifiers = [v for v in ("plus", "pro", "max", "ultra", "mini") if re.search(r"\b" + v + r"\b", product_text, re.I)]
    return intent


def query_matches(intent: QueryIntent, product: ProductSnapshot) -> tuple[bool, str | None]:
    for key in CRITICAL:
        if key not in intent.attributes:
            continue
        if key in {"quantity_amount", "quantity_unit"}:
            if "total_quantity" in intent.attributes and "total_quantity" in product.attributes:
                if intent.attributes["total_quantity"] == product.attributes["total_quantity"] and intent.attributes["base_unit"] == product.attributes["base_unit"]:
                    continue
        expected, actual = intent.attributes[key], product.attributes.get(key)
        if actual is None:
            return False, f"Requested {key} is unconfirmed"
        if str(expected).casefold().replace(" ", "") != str(actual).casefold().replace(" ", ""):
            return False, f"Product differs from requested {key}"
    if intent.model:
        match = re.search(r"\b" + intent.model + r"\s*(\d+)\b", product.title or "", re.I)
        if not match or match[1] != intent.model_generation:
            return False, "Product differs from requested model generation"
        if any(not re.search(r"\b" + v + r"\b", product.title or "", re.I) for v in intent.model_qualifiers):
            return False, "Requested model qualifier is missing"
    if intent.min_price is not None or intent.max_price is not None:
        if not product.price_verified or not product.sale_price:
            return False, "Budget cannot be checked without a verified merchant price"
        if intent.currency is None or product.currency != intent.currency:
            return False, "Budget and merchant price currencies differ or are unspecified"
        if intent.max_price is not None and product.sale_price > intent.max_price:
            return False, "Product is above the requested budget"
        if intent.min_price is not None and product.sale_price < intent.min_price:
            return False, "Product is below the requested minimum price"
    return True, None
