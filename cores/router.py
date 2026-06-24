"""
Hybrid Context Router — Route agents to LOCAL or CLOUD LLM.

Routing decisions draw from ``agent_model_map.AGENT_MODEL_MAP``:
entries with a ``"local"`` provider route to LOCAL; all others
route to CLOUD (unless *context_volume* exceeds the threshold).

Usage
-----
    from cores.router import settings_for, app_for, determine_routing

    # Get app with correct endpoint
    app = app_for("strategy", context_volume=12000)
    async with app.run():
        ...

    # Or just get settings for manual MCPApp construction
    s = settings_for("price_volume_analysis")
    app = MCPApp(name="analysis_local", settings=s)
"""

import copy
import logging

from mcp_agent.config import OpenAISettings, Settings, get_settings

from cores.llm.agent_model_map import get_agent_entry
from cores.llm.provider_config import get_provider

logger = logging.getLogger(__name__)

# ── Thresholds ────────────────────────────────────────────────────────────
# Context volume beyond this threshold forces CLOUD routing regardless of
# agent type, to mitigate "Lost in the Middle" degradation on long contexts.
CONTEXT_VOLUME_THRESHOLD = 15000  # tokens

# ── Build endpoint configs from the canonical provider registry ───────────

_LOCAL_PROVIDER = get_provider("local")
_CLOUD_PROVIDER = get_provider("openai")

LOCAL_OPENAI = OpenAISettings(
    base_url=_LOCAL_PROVIDER.base_url,
    api_key=_LOCAL_PROVIDER.api_key() or "not-needed",
    default_model=_LOCAL_PROVIDER.default_model,
    reasoning_effort=_LOCAL_PROVIDER.reasoning_effort,
)

_CLOUD_OPENAI_DEFAULTS = {
    "default_model": _CLOUD_PROVIDER.default_model,
    "reasoning_effort": _CLOUD_PROVIDER.reasoning_effort,
}


# ── Public API ────────────────────────────────────────────────────────────


def determine_routing(agent_name: str, context_volume: int = 0) -> str:
    """Return ``"LOCAL"`` or ``"CLOUD"`` for the given agent.

    Resolution order:
    1. If *context_volume* > threshold → ``"CLOUD"`` (Lost-in-the-Middle).
    2. If the agent's mapped provider is ``"local"`` → ``"LOCAL"``.
    3. Otherwise → ``"CLOUD"``.

    Args:
        agent_name: Section/agent identifier (e.g. ``"strategy"``).
        context_volume: Estimated total token count for the request.

    Returns:
        ``"LOCAL"`` or ``"CLOUD"``.
    """
    if context_volume > CONTEXT_VOLUME_THRESHOLD:
        return "CLOUD"
    try:
        provider_name = get_agent_entry(agent_name)[0]
        return "LOCAL" if provider_name == "local" else "CLOUD"
    except KeyError:
        return "LOCAL"


def set_agent_provider(agent_name: str, provider_name: str) -> None:
    """Override the provider for *agent_name* in the agent model map.

    This is a runtime-only override (not persisted).  Use it to test
    different routing during development.

    Args:
        agent_name:    Logical agent name (e.g. ``"price_volume_analysis"``).
        provider_name: ``"local"`` or ``"openai"`` (or any registered provider).
    """
    from cores.llm.agent_model_map import AGENT_MODEL_MAP
    if agent_name in AGENT_MODEL_MAP:
        _, model_id, params = AGENT_MODEL_MAP[agent_name]
        AGENT_MODEL_MAP[agent_name] = (provider_name, model_id, params)


def settings_for(agent_name: str, context_volume: int = 0) -> Settings:
    """Return a :class:`Settings` instance with the LLM endpoint overridden
    for *agent_name*.

    The returned settings carry the same MCP server definitions as the
    base config (``mcp_agent.config.yaml``), but with the ``openai``
    section replaced by the LOCAL or CLOUD endpoint determined by
    :func:`determine_routing`.

    Cloud settings preserve the API key and any custom ``base_url`` from the
    base configuration (e.g. an API proxy). Missing base config is handled
    gracefully — the cloud defaults still work.
    """
    route = determine_routing(agent_name, context_volume)
    base = _load_base_settings()

    s = copy.deepcopy(base)

    if route == "LOCAL":
        s.openai = LOCAL_OPENAI
    else:
        kwargs = dict(_CLOUD_OPENAI_DEFAULTS)
        if base.openai:
            if base.openai.api_key:
                kwargs["api_key"] = base.openai.api_key
            if base.openai.base_url:
                kwargs["base_url"] = base.openai.base_url
        s.openai = OpenAISettings(**kwargs)

    return s


def app_for(agent_name: str, context_volume: int = 0):
    """Create an :class:`MCPApp` with the correct LLM endpoint for
    *agent_name*.

    The app name carries a ``_local`` / ``_cloud`` suffix for observability.

    Returns:
        :class:`mcp_agent.app.MCPApp` (not yet started — caller must
        ``async with app.run(): ...``).
    """
    from mcp_agent.app import MCPApp

    route = determine_routing(agent_name, context_volume)
    s = settings_for(agent_name, context_volume)
    return MCPApp(name=f"{agent_name}_{route.lower()}", settings=s)


# ── Internal helpers ──────────────────────────────────────────────────────


def _load_base_settings() -> Settings:
    """Load settings from the default config file path.

    Returns an empty :class:`Settings` if no config file is found, so that
    the router degrades gracefully during development/testing.
    """
    try:
        return get_settings()
    except Exception:
        logger.warning("No base config found — using empty Settings")
        return Settings()
