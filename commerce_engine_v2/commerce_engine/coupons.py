from __future__ import annotations

import re
from decimal import Decimal

from .models import Coupon
from .normalization import NUMBER, clean_text, decimal_value, parse_money_text


def parse_coupon(text: str, source: str, price: Decimal | None, currency: str | None) -> Coupon | None:
    text = clean_text(text, 1000)
    if not re.search(r"\b(?:coupon|promo\s+code|voucher|apply\s+code)\b", text, re.I):
        return None
    result = Coupon(text, source)
    code = re.search(r"\b(?:code\s*[:=-]?|apply)\s+([A-Z0-9]{3,24})\b", text)
    result.code = code[1] if code else None
    pct = re.search(r"\b(?:save|extra|coupon|flat|get)\s+(\d+(?:\.\d+)?)\s*%", text, re.I)
    if pct:
        number = decimal_value(pct[1])
        result.percentage = number if number is not None and 0 < number <= 100 else None
    amount = re.search(rf"\b(?:save|extra|flat|get|apply)\s+((?:₹|Rs\.?|INR|USD|EUR|GBP)\s*{NUMBER})\b", text, re.I)
    if amount:
        result.amount, _ = parse_money_text(amount[1], currency)
    minimum = re.search(rf"\b(?:minimum|min\.?|above|over)\s*(?:order\s*(?:of)?\s*)?((?:₹|Rs\.?|INR)\s*{NUMBER})", text, re.I)
    if minimum:
        result.min_order, _ = parse_money_text(minimum[1], currency)
    maximum = re.search(rf"\b(?:up\s*to|upto|max(?:imum)?\s*discount)\s*((?:₹|Rs\.?|INR)\s*{NUMBER})", text, re.I)
    if maximum:
        result.max_discount, _ = parse_money_text(maximum[1], currency)
    restrictions = {"payment_method": r"\b(?:bank|credit card|debit card|upi|EMI)\b",
                    "membership": r"\b(?:prime|member|membership)\b",
                    "first_order": r"\b(?:first order|new user|new customer)\b",
                    "exchange": r"\bexchange\b", "eligibility_unspecified": r"\b(?:eligible|selected users|terms apply|t&c)\b"}
    result.restrictions = [name for name, pattern in restrictions.items() if re.search(pattern, text, re.I)]
    if not result.code and result.amount is None and result.percentage is None:
        return None
    # Conditional estimates are offered only when restrictions and caps are interpretable.
    conditional = bool(result.restrictions) or (result.min_order is not None and (price is None or price < result.min_order))
    if price and not conditional and (result.amount or result.percentage):
        saving = result.amount if result.amount is not None else price * result.percentage / 100
        if result.max_discount is not None:
            saving = min(saving, result.max_discount)
        if Decimal(0) < saving < price:
            result.conditional_price = (price - saving).quantize(Decimal("0.01"))
    return result
