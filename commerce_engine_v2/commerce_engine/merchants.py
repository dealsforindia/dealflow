"""Declarative merchant adapters. Selectors are seeds from the supplied code.

These are versioned configuration, not claims that current live markup was tested.
All selectors use XPath so lxml needs no cssselect dependency.
"""
from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlsplit

from .urls import host_matches


def cls(name: str) -> str:
    return f".//*[contains(concat(' ', normalize-space(@class), ' '), ' {name} ')]"


def ident(name: str) -> str:
    return f".//*[@id='{name}']"


def testid(name: str) -> str:
    return f".//*[@data-testid='{name}' or @data-test-id='{name}']"


@dataclass(frozen=True)
class MerchantProfile:
    name: str
    domains: tuple[str, ...]
    titles: tuple[str, ...] = ()
    prices: tuple[str, ...] = ()
    mrps: tuple[str, ...] = ()
    stock: tuple[str, ...] = ()
    images: tuple[str, ...] = ()
    brands: tuple[str, ...] = ()
    coupons: tuple[str, ...] = ()
    location_required: bool = False
    state_money_unit: str | None = "major"
    default_currency: str | None = "INR"
    version: str = "seed-2.0.0"


PROFILES = [
    MerchantProfile("Amazon", ("amazon.in",),
        (ident("productTitle"), ident("title_feature_div") + "//h1"),
        tuple(ident(scope) + "//*[contains(concat(' ',normalize-space(@class),' '),' priceToPay ')]//*[contains(concat(' ',normalize-space(@class),' '),' a-offscreen ')]"
              for scope in ("corePriceDisplay_desktop_feature_div", "apex_desktop", "mobile_buybox")) +
        (ident("priceblock_ourprice"), ident("priceblock_dealprice"), cls("priceToPay") + cls("a-offscreen")[1:]),
        (cls("a-text-price") + "//*[@data-a-strike='true']", ".//*[@data-a-strike='true']//*[contains(@class,'a-offscreen')]"),
        (ident("availability"), ident("outOfStock")),
        (ident("landingImage"), ident("main-image")), (ident("bylineInfo"),),
        (".//*[starts-with(@id,'couponText')]", cls("couponLabelText"), ident("pqv-price-coupon-message"))),
    MerchantProfile("Flipkart", ("flipkart.com",),
        (cls("VU-ZEz"), cls("B_NuCI"), ".//h1"),
        (cls("Nx9bqj"), cls("_30jeq3")), (cls("yRaY8j"), cls("_3I9_wc")),
        (cls("_16FRp0"), cls("_3XINqE"), cls("_1V5-hO")),
        (cls("_396cs4"), cls("_2r_T1I")), coupons=(cls("G6XhRU"),)),
    MerchantProfile("Shopsy", ("shopsy.in",), (".//h1", cls("VU-ZEz")),
        (cls("Nx9bqj"), cls("_30jeq3")), (cls("yRaY8j"),), images=(cls("_396cs4"),)),
    MerchantProfile("Myntra", ("myntra.com",), (cls("pdp-name"),),
        (cls("pdp-price"),), (cls("pdp-mrp"),), (cls("pdp-notSellingText"),),
        images=(cls("image-grid-image"),), brands=(cls("pdp-title"),), coupons=(cls("pdp-offers-offer"),)),
    MerchantProfile("AJIO", ("ajio.com",), (cls("prod-title"), cls("prod-name")),
        (cls("prod-sp"),), (cls("prod-cp"),), (cls("out-of-stock"),),
        (cls("prod-img"),), (cls("brand-name"), cls("prod-brand")), (cls("promo-title"),)),
    MerchantProfile("SHEIN India", ("sheinindia.in",), (".//h1",), (cls("sale-price"),), (cls("mrp"),)),
    MerchantProfile("Swiggy", ("swiggy.com",), (testid("item-name"),),
        (testid("item-offer-price"),), (testid("item-mrp"),), (testid("item-availability"),),
        (testid("item-image"),), coupons=(testid("item-discount"),), location_required=True),
    MerchantProfile("Blinkit", ("blinkit.com", "grofers.com"), (".//h1",),
        (testid("product-price"),), (testid("product-mrp"),), (testid("product-availability"),),
        location_required=True, state_money_unit=None),
    MerchantProfile("Zepto", ("zeptonow.com", "zepto.in", "zepto.com"), (".//h1",),
        (testid("product-price"),), (testid("product-mrp"),), (testid("product-availability"),),
        location_required=True, state_money_unit=None),
    MerchantProfile("Croma", ("croma.com",), (cls("pd-title"), cls("pdp-title"), cls("product-title")),
        (cls("new-price"), cls("pdp-price"), cls("final-price")),
        (cls("old-price"), cls("pdp-mrp")), images=(cls("product-img"), cls("pdp-image")),
        coupons=(cls("coupon-offer"), cls("offer-text"))),
    MerchantProfile("Nykaa", ("nykaa.com", "nykaaman.com"), (cls("product-title"), cls("css-1gc4x7i")),
        (testid("offer-price"), cls("post-discount-price")), (testid("mrp-price"), cls("mrp-price")),
        images=(cls("pdp-image"), cls("product-image")), coupons=(cls("coupon-badge"),)),
    MerchantProfile("Tata CLiQ", ("tatacliq.com", "tatacliqfashion.com"),
        (cls("ProductDescriptionPage__productName"), cls("pdp-name")),
        (cls("ProductDescriptionPage__price"),), (cls("ProductDescriptionPage__mrp"),),
        images=(cls("ProductDescriptionPage__mainImage"),), brands=(cls("ProductDescriptionPage__brandName"),)),
    MerchantProfile("JioMart", ("jiomart.com",), (cls("product-header-name"), cls("pdp-title")),
        (cls("final-price"), cls("price-box")), (cls("price-line-through"), cls("mrp")),
        images=(cls("product-image"),), coupons=(cls("coupon-box"),)),
    MerchantProfile("BigBasket", ("bigbasket.com",), (".//h1",), (testid("sale-price"),),
        location_required=True),
    MerchantProfile("Reliance Digital", ("reliancedigital.in",), (".//h1",), (cls("pdp-price"),)),
]

MERCHANT_HOSTS = tuple(d for profile in PROFILES for d in profile.domains)


def profile_for(url: str) -> MerchantProfile:
    host = (urlsplit(url).hostname or "").lower().rstrip(".")
    for profile in PROFILES:
        if any(host_matches(host, d) for d in profile.domains):
            return profile
    return MerchantProfile(host or "Unknown", (host,), default_currency=None, state_money_unit=None)


def register_profile(profile: MerchantProfile) -> None:
    """Applications can add store selectors without modifying extraction logic."""
    PROFILES.insert(0, profile)
