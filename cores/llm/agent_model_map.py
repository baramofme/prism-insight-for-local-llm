"""
Agent-to-model mapping — which provider + model each agent team uses.

This is the single source of truth for model selection across the entire
codebase.  The mapping is loaded from ``prism-models.jsonc`` at startup
(``PRISM_MODELS_CONFIG`` env var to override).

Components that previously hard-coded model strings should call
:func:`resolve_agent_model` or :func:`resolve_request_params` instead.

Teams & agents covered
----------------------
Macro (1) ………… market_regime
Analysis (6) …… price_volume_analysis, investor_trading_analysis,
                  company_status, company_overview, news_analysis,
                  market_index_analysis
Strategy (1) …… investment_strategy
Communication (3)  summary, quality_evaluation, translation
Trading (3) …… sell_decision, trading, journal
Consultation (2) … consultation, tele_consultation
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

from mcp_agent.workflows.llm.augmented_llm import RequestParams

from cores.llm.ports import LLMParams
from cores.llm.provider_config import get_provider

logger = logging.getLogger(__name__)

_HERE = Path(__file__).resolve().parent
_PROJECT_ROOT = _HERE.parent.parent


# ---------------------------------------------------------------------------
# Lazy-loading dict that reads from prism-models.jsonc on first access
# ---------------------------------------------------------------------------


def _parse_jsonc_to_entries() -> dict[str, tuple[str, str, LLMParams]]:
    """Read ``prism-models.jsonc`` → agent→(provider, model, params) dict."""
    from cores.llm.jsonc_loader import load_jsonc  # noqa: PLC0415

    config_path = os.getenv(
        "PRISM_MODELS_CONFIG",
        str(_PROJECT_ROOT / "prism-models.jsonc"),
    )

    try:
        data = load_jsonc(config_path)
    except FileNotFoundError:
        logger.warning(
            "Models config not found at %s — no agents registered. "
            "Set PRISM_MODELS_CONFIG to override.",
            config_path,
        )
        return {}
    except Exception:
        logger.exception(
            "Failed to load models config from %s — no agents registered.",
            config_path,
        )
        return {}

    raw_agents: dict[str, dict[str, Any]] = data.get("agents", {})
    mapping: dict[str, tuple[str, str, LLMParams]] = {}

    for name, cfg in raw_agents.items():
        provider_name = cfg.get("provider", "openai")
        model_id = cfg.get("model", "")
        max_tokens = cfg.get("max_tokens", 16000)
        reasoning_effort = cfg.get("reasoning_effort")

        mapping[name] = (
            provider_name,
            model_id,
            LLMParams(max_tokens=max_tokens, reasoning_effort=reasoning_effort),
        )

    logger.debug("Loaded %d agent mappings from %s", len(mapping), config_path)
    return mapping


class _LazyAgentMap(dict):
    """Dict subclass populating from ``prism-models.jsonc`` on first access.

    Preserves backward compat with code that does::

        AGENT_MODEL_MAP["agent_name"]
        "agent_name" in AGENT_MODEL_MAP
        AGENT_MODEL_MAP["agent_name"] = (provider, model, params)
    """

    _seeded: bool = False

    def _ensure_seeded(self) -> None:
        if not self._seeded:
            self.update(_parse_jsonc_to_entries())
            self._seeded = True

    def __getitem__(self, key: str) -> tuple[str, str, LLMParams]:
        self._ensure_seeded()
        return super().__getitem__(key)

    def __setitem__(self, key: str, value: tuple[str, str, LLMParams]) -> None:
        self._ensure_seeded()
        super().__setitem__(key, value)

    def __contains__(self, key: object) -> bool:
        self._ensure_seeded()
        return super().__contains__(key)

    def __len__(self) -> int:
        self._ensure_seeded()
        return super().__len__()

    def __iter__(self):
        self._ensure_seeded()
        return super().__iter__()

    def get(self, key: str, default=None):
        self._ensure_seeded()
        return super().get(key, default)

    def keys(self):
        self._ensure_seeded()
        return super().keys()

    def values(self):
        self._ensure_seeded()
        return super().values()

    def items(self):
        self._ensure_seeded()
        return super().items()

    def copy(self):
        self._ensure_seeded()
        return super().copy()

    def __repr__(self) -> str:
        self._ensure_seeded()
        return super().__repr__()


# ---------------------------------------------------------------------------
# Module-level singleton dict — populates from JSONC on first use.
# ---------------------------------------------------------------------------

AGENT_MODEL_MAP: dict[str, tuple[str, str, LLMParams]] = _LazyAgentMap()


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def get_agent_entry(agent_name: str) -> tuple[str, str, LLMParams]:
    """Return ``(provider_name, model_id, LLMParams)`` for *agent_name*.

    Raises:
        KeyError: with available agents listed.
    """
    try:
        return AGENT_MODEL_MAP[agent_name]
    except KeyError:
        available = ", ".join(sorted(AGENT_MODEL_MAP.keys()))
        raise KeyError(
            f"Unknown agent {agent_name!r}. Available: {available}"
        ) from None


def resolve_agent_model(agent_name: str) -> str:
    """Return the model identifier string for *agent_name*.

    Example::

        model = resolve_agent_model("price_volume_analysis")
        # → "Qwen-3.6-Coder"
    """
    return get_agent_entry(agent_name)[1]


def resolve_agent_params(agent_name: str) -> LLMParams:
    """Return the :class:`LLMParams` for *agent_name*."""
    return get_agent_entry(agent_name)[2]


def resolve_agent_provider(agent_name: str) -> str:
    """Return the provider name for *agent_name*."""
    return get_agent_entry(agent_name)[0]


def resolve_request_params(
    agent_name: str,
    *,
    max_tokens: int | None = None,
    temperature: float = 0.0,
    use_history: bool = False,
    parallel_tool_calls: bool = True,
) -> RequestParams:
    """Build an mcp-agent :class:`RequestParams` with model + params from
    the agent map.

    This is the primary integration point between the agent map and the
    existing ``mcp_agent``-based code path (``report_generation.py``,
    orchestrators, etc.).

    Args:
        agent_name:   Logical agent name (e.g. ``"price_volume_analysis"``).
        max_tokens:   Override the map's default token limit.
        temperature:  LLM temperature (default 0.0 for deterministic).
        use_history:  Whether to preserve conversation history.
        parallel_tool_calls: Allow parallel tool execution.

    Returns:
        :class:`RequestParams` with the resolved model and parameters.
    """
    provider_name, model_id, params = get_agent_entry(agent_name)
    provider = get_provider(provider_name)
    return RequestParams(
        model=model_id,
        reasoning_effort=params.reasoning_effort or provider.reasoning_effort,
        maxTokens=max_tokens or params.max_tokens,
        temperature=temperature,
        use_history=use_history,
        parallel_tool_calls=parallel_tool_calls,
    )


def reload_config() -> None:
    """Force-reload from disk on next access (useful in tests)."""
    AGENT_MODEL_MAP.clear()
    if isinstance(AGENT_MODEL_MAP, _LazyAgentMap):
        AGENT_MODEL_MAP._seeded = False  # type: ignore[attr-defined]
