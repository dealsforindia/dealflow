from __future__ import annotations

import copy
import time
from collections import OrderedDict
from typing import Any


class TTLCache:
    """Bounded process-local discovery cache. It never stores verified merchant prices."""
    def __init__(self, max_entries: int = 256, ttl: float = 30):
        if max_entries < 1 or ttl < 0:
            raise ValueError("Cache capacity must be positive and TTL nonnegative")
        self.max_entries = max_entries
        self.ttl = ttl
        self._entries: OrderedDict[str, tuple[float, Any]] = OrderedDict()

    def get(self, key: str) -> Any | None:
        entry = self._entries.get(key)
        if entry is None:
            return None
        if entry[0] <= time.monotonic():
            del self._entries[key]
            return None
        self._entries.move_to_end(key)
        return copy.deepcopy(entry[1])

    def put(self, key: str, value: Any) -> None:
        self._entries[key] = (time.monotonic() + self.ttl, copy.deepcopy(value))
        self._entries.move_to_end(key)
        while len(self._entries) > self.max_entries:
            self._entries.popitem(last=False)
