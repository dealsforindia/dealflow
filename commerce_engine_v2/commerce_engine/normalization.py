from __future__ import annotations

import html
import re
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any

MONEY_LIMIT = Decimal("1000000000")
NUMBER = r"(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d{1,2})?"
MONEY_RE = re.compile(rf"(?<!\w)(₹|Rs\.?|INR|USD|EUR|GBP|\$|€|£)\s*({NUMBER})(?![\d.,])", re.I)
CURRENCIES = {"₹": "INR", "rs": "INR", "rs.": "INR", "inr": "INR",
              "usd": "USD", "eur": "EUR", "gbp": "GBP", "€": "EUR", "£": "GBP"}


def clean_text(value: Any, limit: int = 700) -> str:
    if not isinstance(value, (str, int, Decimal)) or isinstance(value, bool):
        return ""
    return re.sub(r"\s+", " ", html.unescape(str(value))).strip()[:limit]


def title_text(value: Any) -> str | None:
    text = clean_text(value)
    text = re.sub(r"\s*[|–-]\s*(?:Amazon(?:\.in)?|Flipkart(?:\.com)?|Myntra|AJIO|Croma|Nykaa|JioMart)\s*$", "", text, flags=re.I)
    if len(text) < 3 or text.lower() in {"product", "home", "products", "access denied", "robot check", "online shopping"}:
        return None
    return text


def decimal_value(value: Any) -> Decimal | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        text = str(value).strip().replace(",", "")
        if not re.fullmatch(r"\d+(?:\.\d+)?", text):
            return None
        amount = Decimal(text)
        return amount if amount.is_finite() and 0 <= amount <= MONEY_LIMIT else None
    except (InvalidOperation, ValueError):
        return None


def money(value: Any, *, unit: str = "major") -> Decimal | None:
    """Never infer minor units from magnitude. Adapter/schema must specify them."""
    amount = decimal_value(value)
    if amount is None or unit not in {"major", "minor"}:
        return None
    if unit == "minor":
        amount /= Decimal(100)
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if amount > 0 else None


def currency_code(value: Any) -> str | None:
    text = clean_text(value).upper()
    return text if re.fullmatch(r"[A-Z]{3}", text) else None


def parse_money_text(value: str, currency: str | None = None) -> tuple[Decimal | None, str | None]:
    text = clean_text(value)
    matches = list(MONEY_RE.finditer(text))
    if len(matches) == 1:
        match = matches[0]
        code = CURRENCIES.get(match[1].lower())
        # "$" alone is ambiguous; a surrounding explicit currency can disambiguate it.
        code = code or (currency if match[1] == "$" else currency_code(match[1]))
        if currency and code and code != currency:
            return None, None
        return money(match[2]), code
    if not matches and re.fullmatch(NUMBER, text):
        return money(text), currency
    return None, currency


def price_fragment(value: str, currency: str | None = None) -> tuple[Decimal | None, str | None]:
    """Allow labels in price nodes, but reject ranges, EMI, and conditional prices."""
    text = clean_text(value)
    if re.search(r"\b(?:emi|per month|monthly|starting|from|with\s+(?:bank|exchange|coupon)|after\s+(?:coupon|exchange)|membership)\b", text, re.I):
        return None, currency
    return parse_money_text(text, currency)


def discount(sale: Decimal | None, mrp: Decimal | None) -> int | None:
    if sale is None or mrp is None or mrp <= 0 or sale > mrp:
        return None
    return int(((mrp - sale) * 100 / mrp).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def valid_gtin(value: Any) -> str | None:
    text = clean_text(value)
    if len(text) not in {8, 12, 13, 14} or not text.isascii() or not text.isdigit():
        return None
    checksum = sum(int(d) * (3 if i % 2 == 0 else 1) for i, d in enumerate(reversed(text[:-1])))
    return text if (10 - checksum % 10) % 10 == int(text[-1]) else None


def valid_isbn(value: Any) -> str | None:
    text = re.sub(r"[\s-]", "", clean_text(value)).upper()
    if len(text) == 13 and text.startswith(("978", "979")):
        return valid_gtin(text)
    if len(text) == 10 and text[:9].isdigit() and (text[-1].isdigit() or text[-1] == "X"):
        digits = [int(c) if c != "X" else 10 for c in text]
        if sum((10 - i) * d for i, d in enumerate(digits)) % 11 == 0:
            return text
    return None
