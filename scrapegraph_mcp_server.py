#!/usr/bin/env python3
"""
ScrapeGraphAI MCP Server — wraps scrapegraph_client as MCP tools.

Provides ``scrapegraph_scrape`` and ``scrapegraph_search`` tools as a
drop-in replacement for the firecrawl MCP server.

Usage (mcp_agent.config.yaml)::

    scrapegraph:
      command: "python3"
      args: ["scrapegraph_mcp_server.py"]
      read_timeout_seconds: 180
"""

from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from mcp.server.fastmcp import FastMCP

from scrapegraph_client import scrapegraph_search as _sg_search, scrapegraph_scrape as _sg_scrape

logger = logging.getLogger(__name__)

server = FastMCP(
    "scrapegraph",
    instructions="AI-powered web scraping via ScrapeGraphAI. "
    "Supports single-page scraping and multi-result search.",
)


@server.tool()
async def scrapegraph_scrape(
    url: str,
    prompt: str = "",
) -> str:
    """Scrape a single web page and extract structured content.

    Use this to fetch company profiles, news articles, financial data
    pages, or any specific URL.  The AI will extract the most useful
    information from the page.

    Args:
        url:     The full URL to scrape (e.g. https://finance.yahoo.com/quote/AAPL/news).
        prompt:  Optional extraction prompt (e.g. "Extract the main article body").
                 Defaults to a full-content extraction.
    Returns:
        Extracted text content, or an error message.
    """
    result = await asyncio.to_thread(lambda: _sg_scrape(url, prompt=prompt or None))
    return result or "_ScrapeGraphAI returned no content._"


@server.tool()
async def scrapegraph_search_tool(
    query: str,
    limit: int = 5,
) -> str:
    """Search the web and extract structured content from top results.

    Use this to find recent news, sector trends, and company-specific
    information.  The AI will search the web, scrape the top results,
    and return structured content for each.

    Args:
        query:  The search query (e.g. "AAPL Apple Inc. latest news June 2026").
        limit:  Maximum number of results to scrape (default 5, max 10).
    Returns:
        Concatenated content from search results, one per section.
    """
    result = await asyncio.to_thread(lambda: _sg_search(query, limit=min(limit, 10)))
    if not result.web:
        return "_ScrapeGraphAI search returned no results._"

    parts: list[str] = []
    for i, item in enumerate(result.web, 1):
        title = item.title or "Untitled"
        url = item.url or ""
        content = item.markdown or item.description or ""
        header = f"[{i}] {title}" + (f" ({url})" if url else "")
        parts.append(f"{header}\n{content}\n")

    return "\n---\n".join(parts)


def main() -> None:
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    server.run(transport="stdio")


if __name__ == "__main__":
    main()
