"""Merchant evidence, product identity, discovery, and price observations."""
from .engine import CommerceEngine
from .models import Availability, RegionContext, ProductSnapshot, ShoppingCandidate
from .parser import parse_product_html

__all__ = ["CommerceEngine", "Availability", "RegionContext", "ProductSnapshot",
           "ShoppingCandidate", "parse_product_html"]
