"""
Model registry: maps logical role names to (model_id, LLMParams).

The primary source of truth is now ``cores/llm/agent_model_map.py``.
This module re-exports its entries so existing callers (``tracking/journal.py``,
``tracking/compression.py``) continue to work unchanged.

Swapping models is a one-line config change in ``agent_model_map.py``.
"""

from typing import Optional
from cores.llm.agent_model_map import get_agent_entry
from cores.llm.ports import LLMParams

# Re-export from the canonical mapping so existing ModelRegistry users
# see the same role names (sell_decision, trading, journal, summary).
_DEFAULT_MAPPING: dict[str, tuple[str, LLMParams]] = {
    role: (get_agent_entry(role)[1], get_agent_entry(role)[2])
    for role in ("sell_decision", "trading", "journal", "summary")
}


class ModelRegistry:
    """Maps logical role strings to ``(model_id, LLMParams)`` pairs.

    Construct via ``from_mapping()`` with a plain dict, or use the
    class-level defaults sourced from ``agent_model_map.py``.

    Example::

        reg = ModelRegistry.from_mapping({
            "sell_decision": ("gpt-5.5", LLMParams(max_tokens=30000)),
        })
        model_id, params = reg.resolve("sell_decision")
    """

    def __init__(self, mapping: dict[str, tuple[str, LLMParams]]) -> None:
        self._mapping: dict[str, tuple[str, LLMParams]] = dict(mapping)

    @classmethod
    def from_mapping(cls, mapping: dict[str, tuple[str, LLMParams]]) -> "ModelRegistry":
        """Construct from a caller-supplied dict (merged over defaults)."""
        merged = dict(_DEFAULT_MAPPING)
        merged.update(mapping)
        return cls(merged)

    @classmethod
    def defaults(cls) -> "ModelRegistry":
        """Return a registry pre-loaded with the canonical defaults."""
        return cls(dict(_DEFAULT_MAPPING))

    def resolve(self, role: str) -> tuple[str, LLMParams]:
        """Return ``(model_id, LLMParams)`` for *role*.

        Raises:
            KeyError: with a clear message listing available roles.
        """
        try:
            return self._mapping[role]
        except KeyError:
            available = ", ".join(sorted(self._mapping))
            raise KeyError(
                f"Unknown model role {role!r}. Available roles: {available}"
            ) from None

    def roles(self) -> list[str]:
        """Return all registered role names."""
        return list(self._mapping)
