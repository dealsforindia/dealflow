"""Category plugins extract conservative attributes, with explicit/inferred provenance."""
from __future__ import annotations

import re
from decimal import Decimal
from typing import Any, Callable

from .models import ProductSnapshot
from .normalization import clean_text, decimal_value, valid_gtin, valid_isbn

CATEGORY_TERMS = {
    "healthcare": "medicine paracetamol ibuprofen prescription",
    "pets": "pet pets puppy kitten kibble dog cat leash litter",
    "books": "book books paperback hardcover novel textbook isbn",
    "beauty": "serum lipstick moisturizer moisturiser shampoo sunscreen skincare makeup mascara perfume conditioner",
    "appliances": "refrigerator washing dishwasher microwave air-conditioner air-fryer",
    "furniture": "sofa wardrobe desk mattress chair furniture bed",
    "footwear": "shoes shoe sneaker sneakers sandal sandals footwear boot boots",
    "electronics": "iphone phone mobile smartphone laptop tablet earbuds headphone headphones camera television tv smartwatch charger ssd monitor",
    "fashion": "shirt shirts dress kurta saree jeans jacket trousers t-shirt tshirt blouse handbag",
    "grocery": "rice salt atta dal flour milk butter paneer oil coffee tea biscuit biscuits chocolate juice grocery cereal ghee",
    "food": "burger pizza biryani sandwich restaurant takeaway",
    "sports": "dumbbell treadmill racket badminton cricket football yoga fitness",
    "home": "curtain cookware pan saucepan utensil mop pillow towel bottle",
    "toys": "toy toys puzzle doll lego boardgame",
    "automotive": "tyre tire helmet motorbike car engine",
}


def detect_category(title: str, hint: str | None = None) -> str:
    if hint:
        hint_l = hint.lower()
        if hint_l in CATEGORY_TERMS:
            return hint_l
        for category, terms in CATEGORY_TERMS.items():
            if any(re.search(r"\b" + re.escape(term) + r"\b", hint_l) for term in terms.split()):
                return category
    text = title.lower()
    if re.search(r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|iu)\b", text) and re.search(r"\b(?:tablet|capsule|syrup)s?\b", text):
        return "healthcare"
    for category, terms in CATEGORY_TERMS.items():
        if any(re.search(r"\b" + re.escape(term) + r"\b", text) for term in terms.split()):
            return category
    return "general"


ALIASES = {
    "colour": "color", "color": "color", "shade": "shade", "size": "size",
    "storage": "storage", "storage capacity": "storage", "ram": "ram",
    "model": "model", "model number": "model", "material": "material", "fit": "fit",
    "gender": "gender", "author": "author", "edition": "edition", "language": "language",
    "format": "format", "isbn": "isbn", "strength": "strength", "dosage form": "form",
    "manufacturer": "manufacturer", "pack size": "pack_size", "skin type": "skin_type",
    "spf": "spf", "flavour": "flavour", "flavor": "flavour", "life stage": "life_stage",
    "capacity": "capacity", "energy rating": "energy_rating", "warranty": "warranty",
    "pattern": "pattern", "size system": "size_system", "quantity": "net_quantity",
    "net quantity": "net_quantity", "volume": "net_quantity", "weight": "net_quantity",
    "restaurant": "restaurant", "portion": "portion", "animal": "animal",
}


def structured_attributes(product: dict[str, Any]) -> dict[str, Any]:
    attrs: dict[str, Any] = {}
    properties = product.get("additionalProperty", [])
    if isinstance(properties, dict):
        properties = [properties]
    for prop in properties if isinstance(properties, list) else []:
        if not isinstance(prop, dict):
            continue
        label = clean_text(prop.get("name"), 64).lower()
        key = ALIASES.get(label) or re.sub(r"[^a-z0-9]+", "_", label).strip("_")
        value = clean_text(prop.get("value"))
        if key and value:
            attrs[key] = value
    for raw, key in ALIASES.items():
        value = product.get(raw)
        if isinstance(value, (str, int)) and not isinstance(value, bool):
            attrs.setdefault(key, clean_text(value))
    author = product.get("author")
    if isinstance(author, dict) and author.get("name"):
        attrs["author"] = clean_text(author["name"])
    return attrs


def _set(snapshot: ProductSnapshot, key: str, value: Any, source: str = "title_inference") -> None:
    if key not in snapshot.attributes and value is not None:
        snapshot.attributes[key] = value
        snapshot.attribute_sources[key] = source


def _quantity(snapshot: ProductSnapshot) -> None:
    text = str(snapshot.attributes.get("net_quantity") or snapshot.title or "").lower()
    pattern = r"(?<![\w.])(\d+(?:\.\d+)?)\s*(kg|mg|g|ml|cl|l|litre|liter)(?!\w)"
    matches = list(re.finditer(pattern, text))
    if len(matches) != 1:
        return  # Bundles and multiple size options need a dedicated schema.
    match = matches[0]
    amount = decimal_value(match[1])
    if not amount or match[2] == "mg":
        return
    multipliers = {"kg": ("g", Decimal(1000)), "g": ("g", Decimal(1)),
                   "l": ("ml", Decimal(1000)), "litre": ("ml", Decimal(1000)),
                   "liter": ("ml", Decimal(1000)), "cl": ("ml", Decimal(10)), "ml": ("ml", Decimal(1))}
    base, multiplier = multipliers[match[2]]
    pack_text = snapshot.title or ""
    title_matches = list(re.finditer(pattern, pack_text.lower()))
    pack_quantity_match = title_matches[0] if len(title_matches) == 1 else None
    count_text, count_match = (pack_text.lower(), pack_quantity_match) if pack_quantity_match else (text, match)
    prefix = re.search(r"(\d+)\s*[x×]\s*$", count_text[:count_match.start()])
    suffix = re.match(r"\s*[x×]\s*(\d+)\b", count_text[count_match.end():])
    pack_of = re.search(r"\bpack\s+of\s+(\d+)\b", pack_text, re.I)
    counts = {int(m[1]) for m in (prefix, suffix, pack_of) if m}
    if len(counts) > 1:
        snapshot.add_issue("AMBIGUOUS_PACK", "Conflicting pack counts; unit pricing omitted")
        return
    count = next(iter(counts), 1)
    if not 1 <= count <= 1000:
        return
    source = snapshot.attribute_sources.get("net_quantity", "title_inference")
    total = amount * multiplier * count
    if "net_quantity" in snapshot.attributes and count > 1:
        if pack_quantity_match is None:
            snapshot.add_issue("AMBIGUOUS_PACK_QUANTITY", "Declared net quantity may describe a whole multipack; unit pricing omitted")
            return
        title_amount = decimal_value(pack_quantity_match[1])
        title_base, title_multiplier = multipliers.get(pack_quantity_match[2], (None, None))
        if title_base != base or title_amount is None:
            snapshot.add_issue("QUANTITY_CONFLICT", "Structured quantity and product-title quantity disagree")
            return
        declared_total = amount * multiplier
        title_each = title_amount * title_multiplier
        if declared_total == title_each * count:
            # Merchant supplied the total pack quantity; do not multiply it a second time.
            total = declared_total
            amount, base, multiplier = title_amount, title_base, title_multiplier
            quantity_unit = pack_quantity_match[2]
        elif declared_total == title_each:
            quantity_unit = match[2]
        else:
            snapshot.add_issue("QUANTITY_CONFLICT", "Declared multipack quantity does not match the title")
            return
    else:
        quantity_unit = match[2]
    _set(snapshot, "quantity_amount", amount, source)
    _set(snapshot, "quantity_unit", quantity_unit, source)
    _set(snapshot, "pack_count", count, "title_inference")
    _set(snapshot, "total_quantity", total, source)
    _set(snapshot, "base_unit", base, source)
    if snapshot.sale_price:
        snapshot.unit_price = {"price": (snapshot.sale_price * 100 / total).quantize(Decimal("0.01")),
                               "per_quantity": 100, "unit": base, "currency": snapshot.currency,
                               "quantity_source": source}


def _electronics(snapshot: ProductSnapshot) -> None:
    title = snapshot.title or ""
    matches = list(re.finditer(r"\b(\d+)\s*(GB|TB)\b", title, re.I))
    storage = []
    for match in matches:
        value = match[1] + match[2].upper()
        if re.match(r"\s*RAM\b", title[match.end():], re.I):
            _set(snapshot, "ram", value)
        else:
            storage.append(value)
    if len(set(storage)) == 1:
        _set(snapshot, "storage", storage[0])


def _fashion(snapshot: ProductSnapshot) -> None:
    title = snapshot.title or ""
    match = re.search(r"\b(?:size\s*[:=-]?\s*)(XXS|XS|S|M|L|XL|XXL|XXXL|\d+(?:\.\d+)?)\b", title, re.I)
    if match:
        _set(snapshot, "size", match[1].upper())
    for label in ("cotton", "linen", "polyester", "leather", "wool", "silk", "denim"):
        if re.search(r"\b" + label + r"\b", title, re.I):
            _set(snapshot, "material", label)
    match = re.search(r"\b(men|women|unisex|boys|girls)\b", title, re.I)
    if match:
        _set(snapshot, "gender", match[1].lower())


def _footwear(snapshot: ProductSnapshot) -> None:
    _fashion(snapshot)
    match = re.search(r"\b(UK|US|EU)\s*(\d+(?:\.\d+)?)\b", snapshot.title or "", re.I)
    if match:
        _set(snapshot, "size_system", match[1].upper())
        _set(snapshot, "size", match[2])


def _beauty(snapshot: ProductSnapshot) -> None:
    _quantity(snapshot)
    match = re.search(r"\bSPF\s*(\d+)\b", snapshot.title or "", re.I)
    if match:
        _set(snapshot, "spf", int(match[1]))


def _books(snapshot: ProductSnapshot) -> None:
    text = snapshot.title or ""
    for token in re.findall(r"(?:97[89][-\d\s]{10,20}|\d[-\d]{8,16}[\dX])", text):
        isbn = valid_isbn(token)
        if isbn:
            snapshot.identifiers.setdefault("isbn", isbn)
    for label in ("paperback", "hardcover", "ebook", "audiobook"):
        if re.search(r"\b" + label + r"\b", text, re.I):
            _set(snapshot, "format", label)
    match = re.search(r"\b(\d+)(?:st|nd|rd|th)?\s+edition\b", text, re.I)
    if match:
        _set(snapshot, "edition", match[1])


def _healthcare(snapshot: ProductSnapshot) -> None:
    title = snapshot.title or ""
    match = re.search(r"\b(\d+(?:\.\d+)?)\s*(mg|mcg|IU)\b", title, re.I)
    if match:
        _set(snapshot, "strength", match[1] + match[2].lower())
    match = re.search(r"\b(tablet|capsule|syrup|injection|ointment)s?\b", title, re.I)
    if match:
        _set(snapshot, "form", match[1].lower())
    match = re.search(r"\b(\d+)\s*(?:tablets|capsules)\b", title, re.I)
    if match:
        _set(snapshot, "pack_size", int(match[1]))


def _pets(snapshot: ProductSnapshot) -> None:
    _quantity(snapshot)
    match = re.search(r"\b(dog|cat|puppy|kitten|bird|fish)\b", snapshot.title or "", re.I)
    if match:
        _set(snapshot, "animal", match[1].lower())


def _appliances(snapshot: ProductSnapshot) -> None:
    title = snapshot.title or ""
    match = re.search(r"\b(\d+(?:\.\d+)?)\s*(kg|litre|liter|l)\b", title, re.I)
    if match:
        _set(snapshot, "capacity", match[1] + match[2].lower())
    match = re.search(r"\b([1-5])\s*star\b", title, re.I)
    if match:
        _set(snapshot, "energy_rating", int(match[1]))


CATEGORY_HANDLERS: dict[str, Callable[[ProductSnapshot], None]] = {
    "electronics": _electronics, "fashion": _fashion, "footwear": _footwear,
    "grocery": _quantity, "beauty": _beauty, "books": _books, "healthcare": _healthcare,
    "pets": _pets, "appliances": _appliances,
}


def normalize_product(snapshot: ProductSnapshot, product: dict[str, Any]) -> None:
    snapshot.category = detect_category(snapshot.title or "", clean_text(product.get("category")))
    attrs = structured_attributes(product)
    for key, value in attrs.items():
        snapshot.attributes[key] = value
        snapshot.attribute_sources[key] = "merchant_structured_data"
    for raw in ("gtin", "gtin8", "gtin12", "gtin13", "gtin14"):
        gtin = valid_gtin(product.get(raw))
        if gtin:
            snapshot.identifiers["gtin"] = gtin
    isbn = valid_isbn(product.get("isbn") or attrs.get("isbn"))
    if isbn:
        snapshot.identifiers["isbn"] = isbn
    for key in ("sku", "mpn"):
        value = clean_text(product.get(key))
        if value:
            snapshot.identifiers[key] = value
    match = re.search(r"\b(black|white|navy blue|blue|red|green|grey|gray|pink|silver|gold|beige|brown|purple|walnut)\b", snapshot.title or "", re.I)
    if match:
        _set(snapshot, "color", match[1].lower().replace("gray", "grey"))
    CATEGORY_HANDLERS.get(snapshot.category, lambda _: None)(snapshot)


CRITICAL = ("storage", "ram", "size", "size_system", "color", "shade", "quantity_amount",
            "quantity_unit", "pack_count", "edition", "language", "format", "strength", "form",
            "pack_size", "capacity", "model", "flavour", "animal")


def candidate_matches(discovered_title: str, snapshot: ProductSnapshot) -> tuple[bool, str | None]:
    """No fuzzy cross-merchant merging. Use this only to reject discovery mismatches."""
    probe = ProductSnapshot(snapshot.merchant, snapshot.canonical_url, title=discovered_title)
    normalize_product(probe, {})
    for key in CRITICAL:
        if key in {"quantity_amount", "quantity_unit"} and all("total_quantity" in s.attributes for s in (probe, snapshot)):
            if probe.attributes["total_quantity"] != snapshot.attributes["total_quantity"] or probe.attributes["base_unit"] != snapshot.attributes["base_unit"]:
                return False, "Discovery and merchant disagree on net quantity"
            continue
        a, b = probe.attributes.get(key), snapshot.attributes.get(key)
        if a is not None and b is not None and str(a).lower().replace(" ", "") != str(b).lower().replace(" ", ""):
            return False, f"Discovery and merchant disagree on {key}"
    def tokens(text: str) -> set[str]:
        if all("total_quantity" in s.attributes for s in (probe, snapshot)):
            text = re.sub(r"\b\d+(?:\.\d+)?\s*(?:kg|mg|g|ml|cl|l|litre|liter)\b", "", text, flags=re.I)
        return set(re.findall(r"[a-z]+|\d+", text.lower())) - {"buy", "online", "new", "the", "with", "for", "and"}
    left, right = tokens(discovered_title), tokens(snapshot.title or "")
    if left and right and len(left & right) / min(len(left), len(right)) < 0.45:
        return False, "Discovery title does not sufficiently match the merchant product"
    # Brand/model revisions must not be merged merely because most other words match.
    if snapshot.category == "electronics":
        for model in ("iphone", "galaxy", "pixel"):
            a = re.search(r"\b" + model + r"\s*(\d+)\b", discovered_title, re.I)
            b = re.search(r"\b" + model + r"\s*(\d+)\b", snapshot.title or "", re.I)
            if a and b and a[1] != b[1]:
                return False, "Different model generations"
        qualifiers = {"plus", "pro", "max", "ultra", "mini"}
        if (left & qualifiers) != (right & qualifiers):
            return False, "Different model qualifiers"
    return True, None
