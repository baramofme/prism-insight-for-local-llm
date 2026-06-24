"""
Provider registry — maps logical provider names to endpoint configurations.

Providers are loaded from ``prism-models.jsonc`` at the project root (or
``PRISM_MODELS_CONFIG`` env var override).

Each provider defines the base URL, API key source, default model, and
default reasoning effort.  Components that need to construct a client or
settings object should call :func:`get_provider` rather than hard-coding
endpoint strings.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Path resolution — this file is cores/llm/provider_config.py
_HERE = Path(__file__).resolve().parent  # cores/llm/
_PROJECT_ROOT = _HERE.parent.parent       # project root

_MODELS_CONFIG_PATH = os.getenv(
    "PRISM_MODELS_CONFIG",
    str(_PROJECT_ROOT / "prism-models.jsonc"),
)


# ---------------------------------------------------------------------------
# Data class
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ProviderConfig:
    """Immutable description of a single LLM provider.

    Attributes:
        name:             Logical provider key (e.g. ``"local"``).
        base_url:         OpenAI-compatible endpoint URL. ``None`` means
                          the SDK's built-in default (OpenAI / Anthropic).
        api_key_env:      Environment variable name that holds the API key,
                          or ``None`` if the key is hard-coded (local).
        default_model:    Model identifier used when none is specified.
        reasoning_effort: Default reasoning effort.
    """
    name: str
    base_url: Optional[str] = None
    api_key_env: Optional[str] = None
    default_model: Optional[str] = None
    reasoning_effort: str = "none"

    def api_key(self) -> Optional[str]:
        """Read the API key from the environment, or return ``None``."""
        if self.api_key_env is None:
            return None
        return os.environ.get(self.api_key_env)


# ---------------------------------------------------------------------------
# Lazy loader from JSONC
# ---------------------------------------------------------------------------

_PROVIDERS: dict[str, ProviderConfig] | None = None


def _load_providers() -> dict[str, ProviderConfig]:
    """Parse ``prism-models.jsonc`` and return a provider name → config dict.

    The JSONC file's ``providers`` object is expected to have the shape::

        {
          "local": {
            "base_url": "http://...",
            "api_key_env": null,
            "default_model": "...",
            "reasoning_effort": "none"
          },
          ...
        }
    """
    global _PROVIDERS
    if _PROVIDERS is not None:
        return _PROVIDERS

    # Import here to avoid circular dependencies
    from cores.llm.jsonc_loader import load_jsonc  # noqa: PLC0415

    try:
        data = load_jsonc(_MODELS_CONFIG_PATH)
    except FileNotFoundError:
        logger.warning(
            "Models config not found at %s — falling back to built-in defaults. "
            "Set PRISM_MODELS_CONFIG to override.",
            _MODELS_CONFIG_PATH,
        )
        data = {"providers": {}}
    except Exception:
        logger.exception(
            "Failed to load models config from %s — falling back to empty.",
            _MODELS_CONFIG_PATH,
        )
        data = {"providers": {}}

    raw_providers: dict = data.get("providers", {})
    providers: dict[str, ProviderConfig] = {}

    for name, cfg in raw_providers.items():
        providers[name] = ProviderConfig(
            name=name,
            base_url=cfg.get("base_url"),
            api_key_env=cfg.get("api_key_env"),
            default_model=cfg.get("default_model"),
            reasoning_effort=cfg.get("reasoning_effort", "none"),
        )

    _PROVIDERS = providers
    logger.debug("Loaded %d providers from %s", len(providers), _MODELS_CONFIG_PATH)
    return providers


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def PROVIDERS() -> dict[str, ProviderConfig]:  # noqa: N802 — uppercase for backward compat
    """Return the full provider name → config mapping (lazy-loaded)."""
    return _load_providers()


def get_provider(name: str) -> ProviderConfig:
    """Return the :class:`ProviderConfig` for *name*.

    Raises:
        KeyError: with a list of available providers if *name* is unknown.
    """
    providers = _load_providers()
    try:
        return providers[name]
    except KeyError:
        available = ", ".join(sorted(providers))
        raise KeyError(
            f"Unknown provider {name!r}. Available: {available}"
        ) from None


def reload_config() -> None:
    """Force-reload from disk on next access (useful in tests)."""
    global _PROVIDERS
    _PROVIDERS = None
