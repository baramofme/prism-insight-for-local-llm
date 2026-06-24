"""
Vane Search — configuration for self-hosted AI search engine.

Vane is an open-source AI-powered search engine.
Repository: https://github.com/ItzCrazyKns/Vane

This module provides a central config for pointing at your Vane instance
and selecting default provider/model for search queries.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import Optional

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Config dataclass
# ---------------------------------------------------------------------------

@dataclass
class VaneConfig:
    """Runtime configuration for a Vane search instance.

    Attributes:
        base_url:   Root URL of the self-hosted Vane instance
                    (default: http://localhost:3000).
        provider_id:  UUID of the LLM provider to use for chat & embedding.
                      Auto-discovered on first call if not set.
        chat_model_key:   Model key string (e.g. "gpt-4o-mini").
                          Auto-discovered if not set.
        embedding_model_key:  Embedding model key (e.g. "text-embedding-3-large").
                              Auto-discovered if not set.
        default_sources:  Search sources to enable by default.
        optimization_mode:  "speed" | "balanced" | "quality"
        request_timeout:  HTTP request timeout in seconds (default 60).
    """

    base_url: str = ""
    provider_id: str = ""
    chat_model_key: str = ""
    embedding_model_key: str = ""
    default_sources: list[str] = field(default_factory=lambda: ["web"])
    optimization_mode: str = "balanced"
    request_timeout: int = 60


# ---------------------------------------------------------------------------
# Load from environment
# ---------------------------------------------------------------------------

def load_vane_config() -> VaneConfig:
    """Load VaneConfig from environment variables.

    Resolution order (first non-empty wins):
      1. VANE_BASE_URL           — Full URL (e.g. http://vane.internal:3000)
      2. VANE_HOST + VANE_PORT   — Host + port components (default 3000)
      3. Fallback                — http://localhost:3000

    Other env vars:
      VANE_PROVIDER_ID          — Provider UUID (optional, auto-discovered)
      VANE_CHAT_MODEL           — Chat model key (optional, auto-discovered)
      VANE_EMBEDDING_MODEL      — Embedding model key (optional, auto-discovered)
      VANE_DEFAULT_SOURCES      — Comma-separated: web,academic,discussions
      VANE_OPTIMIZATION_MODE    — speed / balanced / quality
      VANE_REQUEST_TIMEOUT      — HTTP timeout in seconds
    """
    base_url = os.getenv("VANE_BASE_URL") or ""
    if not base_url:
        host = os.getenv("VANE_HOST", "localhost")
        port = os.getenv("VANE_PORT", "3000")
        base_url = f"http://{host}:{port}"

    # Strip trailing slash
    base_url = base_url.rstrip("/")

    sources_raw = os.getenv("VANE_DEFAULT_SOURCES", "web")
    sources = [s.strip() for s in sources_raw.split(",") if s.strip()]

    timeout_str = os.getenv("VANE_REQUEST_TIMEOUT", "60")
    try:
        timeout = int(timeout_str)
    except ValueError:
        timeout = 60

    return VaneConfig(
        base_url=base_url,
        provider_id=os.getenv("VANE_PROVIDER_ID", ""),
        chat_model_key=os.getenv("VANE_CHAT_MODEL", ""),
        embedding_model_key=os.getenv("VANE_EMBEDDING_MODEL", ""),
        default_sources=sources,
        optimization_mode=os.getenv("VANE_OPTIMIZATION_MODE", "balanced"),
        request_timeout=timeout,
    )


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_config: Optional[VaneConfig] = None


def get_vane_config() -> VaneConfig:
    """Get the singleton VaneConfig (loaded once from env)."""
    global _config
    if _config is None:
        _config = load_vane_config()
        logger.info(
            "Vane config loaded: base_url=%s, sources=%s, mode=%s",
            _config.base_url,
            _config.default_sources,
            _config.optimization_mode,
        )
    return _config


def reload_vane_config() -> VaneConfig:
    """Force-reload config from environment (useful in tests)."""
    global _config
    _config = load_vane_config()
    return _config
