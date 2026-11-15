from __future__ import annotations

from dataclasses import dataclass, field, fields, is_dataclass
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Any


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def to_jsonable(value: Any) -> Any:
    """Money is serialized as decimal strings, never binary floating point."""
    if isinstance(value, Decimal):
        return format(value, "f")
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.value
    if is_dataclass(value):
        return {f.name: to_jsonable(getattr(value, f.name)) for f in fields(value)}
    if isinstance(value, dict):
        return {k: to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(v) for v in value]
    return value


class Availability(str, Enum):
    IN_STOCK = "in_stock"
    OUT_OF_STOCK = "out_of_stock"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class RegionContext:
    country: str = "IN"
    postal_code: str | None = None
    city: str | None = None
    warehouse_id: str | None = None


@dataclass(frozen=True)
class Issue:
    code: str
    message: str


@dataclass(frozen=True)
class Evidence:
    field: str
    value: Any
    source: str
    confidence: float
    observed_at: datetime
    currency: str | None = None
    scope: str = "selected_product"


@dataclass
class Coupon:
    text: str
    source: str
    amount: Decimal | None = None
    percentage: Decimal | None = None
    code: str | None = None
    min_order: Decimal | None = None
    max_discount: Decimal | None = None
    restrictions: list[str] = field(default_factory=list)
    eligible: bool | None = None
    # Never subtract an unconfirmed coupon from the advertised sale price.
    conditional_price: Decimal | None = None


@dataclass
class ProductSnapshot:
    merchant: str
    canonical_url: str
    product_id: str | None = None
    variant_id: str | None = None
    family_id: str | None = None
    offer_key: str | None = None
    seller_id: str | None = None
    title: str | None = None
    brand: str | None = None
    description: str | None = None
    category: str = "general"
    attributes: dict[str, Any] = field(default_factory=dict)
    attribute_sources: dict[str, str] = field(default_factory=dict)
    identifiers: dict[str, str] = field(default_factory=dict)
    sale_price: Decimal | None = None
    mrp: Decimal | None = None
    effective_price: Decimal | None = None
    currency: str | None = None
    discount_pct: int | None = None
    unit_price: dict[str, Any] | None = None
    availability: Availability = Availability.UNKNOWN
    image_urls: list[str] = field(default_factory=list)
    rating: Decimal | None = None
    rating_count: int | None = None
    coupons: list[Coupon] = field(default_factory=list)
    evidence: list[Evidence] = field(default_factory=list)
    selected_evidence: dict[str, Evidence] = field(default_factory=dict)
    issues: list[Issue] = field(default_factory=list)
    page_kind: str = "unknown"
    parser_version: str = "2.0.0"
    checked_at: datetime | None = None
    is_live: bool = False
    price_supported: bool = False
    price_verified: bool = False
    confidence: float = 0.0
    publishable: bool = False
    requested_context: RegionContext = field(default_factory=RegionContext)
    observed_context: RegionContext | None = None
    context_confirmed: bool = False
    affiliate_url: str | None = None
    history: dict[str, Any] | None = None

    @property
    def in_stock(self) -> bool | None:
        return {Availability.IN_STOCK: True, Availability.OUT_OF_STOCK: False,
                Availability.UNKNOWN: None}[self.availability]

    def add_issue(self, code: str, message: str) -> None:
        if not any(i.code == code for i in self.issues):
            self.issues.append(Issue(code, message))

    def to_dict(self) -> dict[str, Any]:
        result = to_jsonable(self)
        result.update(success=self.publishable, in_stock=self.in_stock)
        return result

    def legacy_dict(self) -> dict[str, Any]:
        result = self.to_dict()
        result.update(store=self.merchant, image_url=next(iter(self.image_urls), None),
                      on_page_coupon=self.coupons[0].text if self.coupons else None,
                      error=self.issues[0].code if self.issues else None,
                      asin=self.product_id if self.merchant == "Amazon" else None)
        return result


@dataclass(frozen=True)
class ShoppingCandidate:
    title: str
    raw_url: str
    merchant: str
    discovered_price: Decimal | None = None
    currency: str | None = None
    image_url: str | None = None
    discovery_source: str = "google_shopping"
    discovered_at: datetime = field(default_factory=utcnow)


@dataclass
class SearchResult:
    candidate: ShoppingCandidate
    product: ProductSnapshot

    def to_dict(self) -> dict[str, Any]:
        result = self.product.legacy_dict()
        result.update(discovery=to_jsonable(self.candidate),
                      discovered_price=to_jsonable(self.candidate.discovered_price),
                      discovered_title=self.candidate.title,
                      price_source="merchant_page" if self.product.price_verified else "unverified",
                      price=to_jsonable(self.product.sale_price),
                      raw_url=self.product.canonical_url,
                      aff_url=self.product.affiliate_url or self.product.canonical_url,
                      affiliate_applied=bool(self.product.affiliate_url))
        return result
