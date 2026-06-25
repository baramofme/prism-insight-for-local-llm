#!/usr/bin/env python3
"""
ScrapeGraphAI Client Module — local AI-powered web scraping.
Uses ScrapeGraphAI (https://github.com/ScrapeGraphAI/Scrapegraph-ai) for
AI-powered web scraping and search.  Replaces firecrawl_client.

Requirements:
    pip install scrapegraphai
    python3 -m playwright install chromium

Usage:
    from scrapegraph_client import scrapegraph_search, scrapegraph_scrape

    results = scrapegraph_search("latest AI news", limit=5)
    for r in results:
        print(r.title, r.url, r.markdown[:200])

    text = scrapegraph_scrape("https://example.com", prompt="Extract main content")
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import Any, Optional

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Result types (mirror firecrawl SDK shapes for drop-in compatibility)
# ---------------------------------------------------------------------------

@dataclass
class ScrapegraphSearchItem:
    """Single search-result item, compatible with firecrawl's result objects."""
    title: str = ""
    url: str = ""
    description: str = ""
    markdown: str = ""


@dataclass
class ScrapegraphSearchResult:
    """Top-level wrapper that mimics firecrawl's SearchData."""
    web: list[ScrapegraphSearchItem] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Configuration helpers
# ---------------------------------------------------------------------------

def _resolve_api_key() -> str:
    """Resolve ScrapeGraphAI API key from environment.

    ScrapeGraphAI can use local Ollama models (no key needed), OpenAI-compatible
    keys, or the ScrapeGraphAI cloud API key (SCRAPEGRAPHAI_API_KEY).
    """
    return os.getenv("SCRAPEGRAPHAI_API_KEY") or ""


def _default_llm_config() -> dict:
    """Return a default LLM config for ScrapeGraphAI graphs.

    Order of preference:
      1. SCRAPEGRAPHAI_API_KEY → use ScrapeGraphAI cloud
      2. OPENAI_API_KEY         → use OpenAI GPT-4o-mini
      3. Fallback               → Ollama local (llama3.2)
    """
    sg_key = os.getenv("SCRAPEGRAPHAI_API_KEY")
    if sg_key:
        return {
            "api_key": sg_key,
            "model": "scrapegraphai/gpt-4o-mini",
        }

    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        return {
            "api_key": openai_key,
            "model": "openai/gpt-4o-mini",
        }

    logger.info("No API key found — falling back to Ollama local model")
    return {
        "model": "ollama/llama3.2",
        "model_tokens": 8192,
        "format": "json",
    }


def _build_graph_config(**overrides: Any) -> dict:
    """Build a ScrapeGraphAI graph config dict with optional overrides."""
    config: dict[str, Any] = {
        "llm": _default_llm_config(),
        "verbose": os.getenv("SCRAPEGRAPHAI_VERBOSE", "0") == "1",
        "headless": True,
    }
    config.update(overrides)
    return config


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def scrapegraph_search(
    query: str,
    limit: int = 10,
    **kwargs: Any,
) -> ScrapegraphSearchResult:
    """Search the web via ScrapeGraphAI SearchGraph.

    SearchGraph queries a search engine (DuckDuckGo by default), scrapes the
    top *limit* results, and returns structured content for each.

    Args:
        query:  Search query string.
        limit:  Maximum number of results to scrape (default 10).
        **kwargs:  Extra keyword args forwarded to the graph config.

    Returns:
        ScrapegraphSearchResult with a ``.web`` list of ScrapegraphSearchItem.
        Returns an empty result on error instead of raising.
    """
    try:
        from scrapegraphai.graphs import SearchGraph

        graph_config = _build_graph_config(**kwargs)
        graph = SearchGraph(
            prompt=f"Extract all useful information about: {query}",
            config=graph_config,
        )
        result = graph.run()

        items: list[ScrapegraphSearchItem] = []
        if isinstance(result, list):
            for entry in result:
                items.append(_normalise_search_item(entry))
        elif isinstance(result, dict):
            # Single dict result
            items.append(_normalise_search_item(result))

        logger.info(
            "ScrapeGraphAI search: query=%r, results=%d",
            query[:50], len(items),
        )
        return ScrapegraphSearchResult(web=items[:limit])

    except ImportError:
        logger.error(
            "scrapegraphai is not installed. Run: pip install scrapegraphai"
        )
        return ScrapegraphSearchResult()
    except Exception as exc:
        logger.error("ScrapeGraphAI search failed: %s", exc)
        return ScrapegraphSearchResult()


def scrapegraph_scrape(
    url: str,
    prompt: Optional[str] = None,
    **kwargs: Any,
) -> Optional[str]:
    """Scrape a single web page via ScrapeGraphAI SmartScraperGraph.

    Args:
        url:     Target page URL.
        prompt:  Extraction prompt (e.g. "Extract the main article body").
                 Defaults to a generic full-content extraction.
        **kwargs:  Extra keyword args forwarded to the graph config.

    Returns:
        Readable text content as a string, or ``None`` on failure.
    """
    try:
        from scrapegraphai.graphs import SmartScraperGraph

        extraction_prompt = (
            prompt
            or "Extract all useful information and content from this page. "
            "Return the full text in a readable format."
        )
        graph_config = _build_graph_config(**kwargs)
        graph = SmartScraperGraph(
            prompt=extraction_prompt,
            source=url,
            config=graph_config,
        )
        result = graph.run()

        if isinstance(result, dict):
            # Flatten dict values into a single string
            parts: list[str] = []
            for v in result.values():
                if isinstance(v, str):
                    parts.append(v)
                elif isinstance(v, (list, tuple)):
                    parts.extend(str(x) for x in v)
            text = "\n".join(parts)
        elif isinstance(result, str):
            text = result
        else:
            text = str(result)

        logger.info(
            "ScrapeGraphAI scrape: url=%r, %d chars", url, len(text)
        )
        return text if text.strip() else None

    except ImportError:
        logger.error(
            "scrapegraphai is not installed. Run: pip install scrapegraphai"
        )
        return None
    except Exception as exc:
        logger.error("ScrapeGraphAI scrape failed for %r: %s", url, exc)
        return None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _normalise_search_item(entry: Any) -> ScrapegraphSearchItem:
    """Convert a ScrapeGraphAI result dict/object to ScrapegraphSearchItem."""
    if isinstance(entry, dict):
        return ScrapegraphSearchItem(
            title=entry.get("title", entry.get("name", "")),
            url=entry.get("url", entry.get("link", "")),
            description=entry.get("description", entry.get("snippet", "")),
            markdown=entry.get("markdown", entry.get("content", "")),
        )
    # Fallback: stringify
    return ScrapegraphSearchItem(description=str(entry))
