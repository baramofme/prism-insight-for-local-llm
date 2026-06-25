#!/usr/bin/env python3
"""
Vane Search Client — AI-powered web search via self-hosted Vane instance.

Vane is an open-source AI-powered search engine.
Repository: https://github.com/ItzCrazyKns/Vane
Search API docs: https://github.com/ItzCrazyKns/Vane/blob/master/docs/API/SEARCH.md

This client wraps Vane's REST API (POST /api/search) and provides
a self-hosted search API client as a direct
Python call — no MCP server needed.

Usage:
    from vane_client import vane_search

    result = vane_search("What is the latest Fed interest rate decision?")
    print(result.answer)
    for src in result.sources:
        print(src.title, src.url)

Configuration (via env vars — see cores/llm/vane_config.py):
    VANE_BASE_URL=http://vane.internal:3000
    VANE_PROVIDER_ID=...
    VANE_CHAT_MODEL=gpt-4o-mini
    VANE_EMBEDDING_MODEL=text-embedding-3-large
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any, Optional

import httpx

from cores.llm.vane_config import get_vane_config

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class SourceItem:
    """A single source used to generate the search answer."""
    content: str = ""
    title: str = ""
    url: str = ""


@dataclass
class VaneSearchResult:
    """Full response from a Vane search query."""
    answer: str = ""
    sources: list[SourceItem] = field(default_factory=list)
    raw: Optional[dict] = None


# ---------------------------------------------------------------------------
# Provider discovery
# ---------------------------------------------------------------------------

def _discover_providers(base_url: str, timeout: int = 30) -> list[dict]:
    """Fetch available providers and models from the Vane instance.

    Returns:
        List of provider dicts with ``id``, ``name``, ``chatModels``,
        ``embeddingModels`` keys.
    """
    try:
        resp = httpx.get(
            f"{base_url}/api/providers",
            timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        providers = data.get("providers", [])
        logger.info(
            "Vane providers: %d available",
            len(providers),
        )
        return providers
    except Exception as exc:
        logger.warning("Failed to discover Vane providers: %s", exc)
        return []


def _pick_first_chat_model(providers: list[dict]) -> tuple[str, str]:
    """Return (provider_id, chat_model_key) from the first provider."""
    for p in providers:
        pid = p.get("id", "")
        models = p.get("chatModels", [])
        if pid and models:
            return pid, models[0]["key"]
    return "", ""


def _pick_first_embedding_model(providers: list[dict]) -> tuple[str, str]:
    """Return (provider_id, embedding_model_key) from the first provider."""
    for p in providers:
        pid = p.get("id", "")
        models = p.get("embeddingModels", [])
        if pid and models:
            return pid, models[0]["key"]
    return "", ""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def vane_search(
    query: str,
    *,
    sources: Optional[list[str]] = None,
    system_instructions: Optional[str] = None,
    history: Optional[list[list[str]]] = None,
    stream: bool = False,
    timeout: Optional[int] = None,
) -> VaneSearchResult:
    """Run a search query against the Vane AI search engine.

    This wraps Vane's
    REST API directly.  Returns a structured result with answer and sources.

    Args:
        query:               The search query or question.
        sources:             Search sources: ``"web"``, ``"academic"``,
                             ``"discussions"``.  Defaults to config value
                             (usually ``["web"]``).
        system_instructions: Optional custom instructions to guide the AI.
        history:             Conversation history as list of [role, msg] pairs,
                             e.g. ``[["human", "Hi"], ["assistant", "Hello"]]``.
        stream:              Enable SSE streaming (default False).
        timeout:             HTTP request timeout in seconds (overrides config).

    Returns:
        VaneSearchResult with ``.answer`` and ``.sources``.
        Returns an empty result on error.
    """
    config = get_vane_config()
    base_url = config.base_url

    # Resolve provider + models — try configured values first, then discover
    provider_id = config.provider_id
    chat_key = config.chat_model_key
    embed_key = config.embedding_model_key

    if not provider_id or not chat_key or not embed_key:
        providers = _discover_providers(base_url)
        if not provider_id or not chat_key:
            pid, cm = _pick_first_chat_model(providers)
            provider_id = provider_id or pid
            chat_key = chat_key or cm
        if not embed_key:
            _, em = _pick_first_embedding_model(providers)
            embed_key = embed_key or em

    if not provider_id or not chat_key or not embed_key:
        logger.error(
            "Vane: no provider/models configured and auto-discovery failed. "
            "Set VANE_BASE_URL, VANE_PROVIDER_ID, VANE_CHAT_MODEL, "
            "and VANE_EMBEDDING_MODEL in your .env or environment."
        )
        return VaneSearchResult()

    # Build request body
    body: dict[str, Any] = {
        "chatModel": {
            "providerId": provider_id,
            "key": chat_key,
        },
        "embeddingModel": {
            "providerId": provider_id,
            "key": embed_key,
        },
        "optimizationMode": config.optimization_mode,
        "sources": sources or config.default_sources,
        "query": query,
        "stream": stream,
    }
    if system_instructions:
        body["systemInstructions"] = system_instructions
    if history:
        body["history"] = history

    req_timeout = timeout or config.request_timeout

    logger.info(
        "Vane search: query=%r, sources=%s, mode=%s",
        query[:80], body["sources"], body["optimizationMode"],
    )

    try:
        resp = httpx.post(
            f"{base_url}/api/search",
            json=body,
            timeout=req_timeout,
        )
        resp.raise_for_status()
        data = resp.json()

        answer = data.get("message", "")
        raw_sources = data.get("sources", [])

        source_items = [
            SourceItem(
                content=s.get("content", ""),
                title=s.get("metadata", {}).get("title", ""),
                url=s.get("metadata", {}).get("url", ""),
            )
            for s in raw_sources
        ]

        logger.info(
            "Vane search done: answer=%d chars, sources=%d",
            len(answer), len(source_items),
        )
        return VaneSearchResult(
            answer=answer,
            sources=source_items,
            raw=data,
        )

    except httpx.HTTPStatusError as exc:
        logger.error(
            "Vane search HTTP error: %s — %s",
            exc.response.status_code,
            exc.response.text[:300],
        )
        return VaneSearchResult()
    except httpx.TimeoutException:
        logger.error("Vane search timed out after %ds", req_timeout)
        return VaneSearchResult()
    except Exception as exc:
        logger.error("Vane search failed: %s", exc)
        return VaneSearchResult()
