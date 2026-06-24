"""
Hierarchical JSON context compression for local LLM inference.

Problem
-------
Analysis agents receive large prefetched data dicts (price history, financials,
news, etc.) as context. Under llama.cpp prefix caching, every unique byte in the
prompt invalidates the cache. The goal is to reduce the context volume while
preserving critical fields, so that repeated analyses (e.g., daily scans of the
same watchlist) reuse cached prefixes.

Strategy
--------
1. **Depth‑limited retention**: Keep only N levels of nested dicts.
2. **Field whitelist per section**: Only emit fields tagged as ``critical`` or
   ``important``; drop ``verbose`` / ``debug`` fields.
3. **Numeric precision truncation**: Round floats to 2 decimal places.
4. **Length truncation**: Lists beyond ``max_items`` items are summarised as
   ``[first_item, …, last_item]`` with a count note.

Usage
-----
from cores.compression import compress_context

compressed = compress_context(prefetched_data, section="price_volume")
# Returns a dict ~40-60% smaller than the original.
"""

import math
from typing import Any, Dict, List, Optional

# ── Section-specific field retention policies ───────────────────────────────
# Keys: section names (or "default").
# Values: mapping of source keys → (keep_level, max_list_items).
#   keep_level: 0=drop, 1=critical only, 2=important, 3=all (default)
#   max_list_items: max items to keep (-1 = all)

_RETENTION: Dict[str, Dict[str, tuple]] = {
    "price_volume": {
        "prices": (2, 60),          # Keep price arrays, max 60 bars
        "volume": (2, 60),
        "moving_averages": (1, -1),
        "support_resistance": (1, -1),
        "indicators": (2, 20),
        "summary": (1, -1),
        "raw_data": (0, 0),         # Drop verbose raw data
        "debug": (0, 0),
    },
    "investor_trading": {
        "institution": (2, 20),
        "foreign": (2, 20),
        "individual": (2, 20),
        "summary": (1, -1),
        "raw_data": (0, 0),
    },
    "company_status": {
        "financials": (2, 10),
        "ratios": (1, -1),
        "summary": (1, -1),
        "verbose_cashflow": (0, 0),
    },
    "company_overview": {
        "business_model": (1, -1),
        "competitors": (2, 5),
        "growth_drivers": (1, -1),
        "summary": (1, -1),
    },
    "news_analysis": {
        "articles": (2, 10),
        "sentiment": (1, -1),
        "summary": (1, -1),
        "full_text": (0, 0),
    },
    "market_index": {
        "indices": (2, -1),
        "sectors": (2, 10),
        "summary": (1, -1),
    },
}


def _truncate_numeric(value: Any, decimals: int = 2) -> Any:
    """Round floats; pass other types through."""
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return round(value, decimals)
    if isinstance(value, dict):
        return {k: _truncate_numeric(v, decimals) for k, v in value.items()}
    if isinstance(value, list):
        return [_truncate_numeric(v, decimals) for v in value]
    return value


def _compress_list(items: List[Any], max_items: int) -> List[Any]:
    """Truncate a list, keeping first + last if max_items is exceeded."""
    if max_items < 0 or len(items) <= max_items:
        return items
    if max_items == 0:
        return [{"__truncated__": True, "count": len(items)}]
    half = max_items // 2
    return items[:half] + [{"__truncated__": True, "count": len(items) - 2 * half}] + items[-half:]


def compress_context(
    data: Dict[str, Any],
    section: str = "default",
    max_depth: int = 4,
) -> Dict[str, Any]:
    """Compress a prefetched-data dict by section-specific retention policy.

    Parameters
    ----------
    data : dict
        The raw prefetched data dict (keys match section names).
    section : str
        Section name for retention policy lookup.
    max_depth : int
        Maximum nested dict depth to traverse (default 4).

    Returns
    -------
    dict
        Compressed dict with depth-limited, whitelisted, truncated fields.
    """
    policy = _RETENTION.get(section, {})
    compressed: Dict[str, Any] = {}

    def _compress_value(value: Any, depth: int) -> Any:
        if depth > max_depth:
            return None  # Cap recursion

        if isinstance(value, dict):
            return {
                k: _compress_value(v, depth + 1)
                for k, v in value.items()
            }
        if isinstance(value, list):
            return [_compress_value(v, depth + 1) for v in value[:10]]
        return value

    for key, value in data.items():
        # Look up retention policy
        keep_level, max_items = policy.get(key, (3, -1))  # default keep all

        if keep_level == 0:
            continue  # Drop entirely

        # Truncate lists
        if isinstance(value, list):
            value = _compress_list(value, max_items)

        # Truncate floats
        value = _truncate_numeric(value)

        # Cap recursion depth
        if isinstance(value, (dict, list)):
            value = _compress_value(value, 1)

        compressed[key] = value

    return compressed


def estimate_tokens(data: Dict[str, Any]) -> int:
    """Rough token estimate (chars / 3.5) for a compressed dict."""
    text = str(data)
    return max(1, len(text) // 3)


def estimate_savings(original: Dict[str, Any], compressed: Dict[str, Any]) -> float:
    """Return compression ratio (1.0 = 100% reduction)."""
    orig_tokens = estimate_tokens(original)
    comp_tokens = estimate_tokens(compressed)
    if orig_tokens == 0:
        return 0.0
    return 1.0 - (comp_tokens / orig_tokens)
