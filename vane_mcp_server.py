#!/usr/bin/env python3
"""
Vane MCP Server — wraps vane_client as an MCP tool for the agent framework.

Provides a ``vane_ask`` tool for AI-powered search via the self-hosted Vane
server.  Provides ``vane_ask`` tool for AI-powered web search.

Usage (mcp_agent.config.yaml)::

    vane:
      command: "python3"
      args: ["vane_mcp_server.py"]
      read_timeout_seconds: 120
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

# Ensure project root is on sys.path so vane_client can be imported
_project_root = Path(__file__).resolve().parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from mcp.server.fastmcp import FastMCP

from vane_client import vane_search

logger = logging.getLogger(__name__)

server = FastMCP("vane", instructions="Vane AI search engine — self-hosted web search and analysis.")


@server.tool()
async def vane_ask(query: str) -> str:
    """Search the web using the self-hosted Vane engine.

    Use this tool to find recent news, sector trends, and company-specific
    information.  Always include the reference date in your query.

    Args:
        query: The search question, e.g. "As of 20260620, what are the
               2-3 leading stocks in the technology sector?"
    Returns:
        Plain-text answer with citations.
    """
    result = vane_search(query, sources=["web"], optimization_mode="speed")
    if not result.answer:
        return "_Vane search returned no results._"
    answer = result.answer
    if result.sources:
        answer += "\n\n**Sources:**\n"
        for i, src in enumerate(result.sources, 1):
            title = src.title or "Untitled"
            url = src.url or ""
            if url:
                answer += f"{i}. [{title}]({url})\n"
            else:
                answer += f"{i}. {title}\n"
    return answer


def main() -> None:
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    server.run(transport="stdio")


if __name__ == "__main__":
    main()
