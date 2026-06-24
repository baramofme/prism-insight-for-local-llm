"""
Self-healing loop for local LLM structured output.

Goal
----
Local LLMs (24B param, llama.cpp) occasionally produce malformed output —
invalid JSON, missing fields, or hallucinated keys. This module provides a
retry wrapper that:

1. Catches the error (Pydantic validation, JSON decode, or custom predicate).
2. Appends a distilled error-feedback message at the **bottom** of the prompt
   (not inline — keeps the prefix cache intact).
3. Retries up to ``max_attempts`` times with exponential backoff.

KV-cache discipline
-------------------
- The error feedback is appended AFTER the primary instruction block so that
  the cache prefix (instruction + system prompt) remains byte-identical.
- Only the last N characters (the feedback section) differs between attempts.
- llama.cpp prefix caching will reuse the cached prefix and recompute only
  the tail portion on each retry.
"""

import asyncio
import json
import logging
from typing import Any, Callable, Optional, TypeVar, ParamSpec

T = TypeVar("T")
P = ParamSpec("P")


class SelfHealingError(Exception):
    """Raised when all self-healing attempts are exhausted."""

    def __init__(self, last_error: Exception, attempts: int):
        self.last_error = last_error
        self.attempts = attempts
        super().__init__(f"Self-healing failed after {attempts} attempts: {last_error}")


def _format_validation_error(exc: Exception) -> str:
    """Format an exception into a concise, cache-friendly feedback string."""
    if hasattr(exc, "errors"):
        details = exc.errors() if callable(exc.errors) else exc.errors
        try:
            msgs = [f"field '{e['loc']}': {e['msg']}" for e in details[:3]]
            return "검증 오류: " + " | ".join(msgs)
        except Exception:
            return f"검증 오류: {exc}"
    if isinstance(exc, json.JSONDecodeError):
        return f"JSON 파싱 오류 (위치 {exc.pos}): {exc.msg}"
    return f"처리 오류: {exc}"


def _build_feedback_prompt(original_message: str, feedback: str) -> str:
    """Append feedback at the bottom, preserving the prefix cache."""
    return original_message.rstrip("\n") + f"\n\n[이전 시도 오류 — 반영하여 수정하세요]\n{feedback}\n"


async def heal_generate(
    generate_fn: Callable[..., Any],
    original_message: str,
    max_attempts: int = 3,
    validate_fn: Optional[Callable[[str], None]] = None,
    logger: Optional[logging.Logger] = None,
) -> str:
    """Wrap an LLM generation with a self-healing loop.

    Parameters
    ----------
    generate_fn : async callable
        An async function that takes ``message`` as its first argument and
        returns a string.
    original_message : str
        The initial user message (without feedback).
    max_attempts : int
        Maximum total attempts (default 3, includes the initial call).
    validate_fn : callable, optional
        A synchronous function that raises an exception if the output is invalid.
        If None, only JSON decode errors are caught.
    logger : logging.Logger, optional
        Logger for retry diagnostics.

    Returns
    -------
    str
        The validated output string from the LLM.

    Raises
    ------
    SelfHealingError
        If all attempts fail.
    """
    log = logger or logging.getLogger(__name__)
    message = original_message

    for attempt in range(1, max_attempts + 1):
        try:
            log.info("Heal attempt %d/%d", attempt, max_attempts)
            result = await generate_fn(message)

            if validate_fn:
                validate_fn(result)

            return result

        except Exception as exc:
            log.warning("Heal attempt %d failed: %s", attempt, exc)
            if attempt == max_attempts:
                raise SelfHealingError(last_error=exc, attempts=max_attempts) from exc

            feedback = _format_validation_error(exc)
            message = _build_feedback_prompt(original_message, feedback)
            backoff = 2 ** (attempt - 1)
            await asyncio.sleep(backoff)

    raise SelfHealingError(last_error=RuntimeError("Unexpected exit from heal loop"), attempts=max_attempts)


def build_validate_pydantic(model_class: type) -> Callable[[str], None]:
    """Return a validate_fn that parses *model_class* from JSON.

    Usage
    -----
    from my_pydantic_model import TradeDecision
    validate_fn = build_validate_pydantic(TradeDecision)
    result = await heal_generate(generate_fn, message, validate_fn=validate_fn)
    """

    def _validate(text: str) -> None:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if len(lines) >= 3:
                cleaned = "\n".join(lines[1:-1])
        data = json.loads(cleaned)
        model_class.model_validate(data)

    _validate.__name__ = f"validate_{model_class.__name__}"
    return _validate
