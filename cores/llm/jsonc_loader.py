"""
Minimal JSONC loader — strips // and /* */ comments before json.loads.

No external dependencies.  Handles:
  - Single-line comments  (// ...)
  - Multi-line comments   (/* ... */)
  - Strings containing // or /* (ignored inside quotes)
  - Trailing commas       (non-standard, but Stripe/VS Code JSONC allows them)
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Optional


def _strip_jsonc(text: str) -> str:
    """Remove JSONC comments and trailing commas from *text*.

    This is a pragmatic parser, not a full lexer.  It tracks whether we are
    inside a double-quoted string so that comment markers in strings are
    preserved.
    """
    out: list[str] = []
    i = 0
    in_string = False
    length = len(text)

    while i < length:
        ch = text[i]
        next_ch = text[i + 1] if i + 1 < length else ""

        # Toggle string state (handle escaped quotes)
        if ch == '"' and not in_string:
            in_string = True
            out.append(ch)
            i += 1
            continue
        if ch == '"' and in_string:
            in_string = False
            out.append(ch)
            i += 1
            continue
        if ch == "\\" and in_string:
            out.append(ch)
            i += 1
            if i < length:
                out.append(text[i])
                i += 1
            continue

        if not in_string:
            # Single-line comment
            if ch == "/" and next_ch == "/":
                while i < length and text[i] != "\n":
                    i += 1
                continue
            # Multi-line comment
            if ch == "/" and next_ch == "*":
                i += 2
                while i < length - 1 and not (text[i] == "*" and text[i + 1] == "/"):
                    i += 1
                i += 2  # skip */
                continue

        out.append(ch)
        i += 1

    result = "".join(out)

    # Strip trailing commas before ] or }
    result = re.sub(r",\s*([}\]])", r"\1", result)

    return result


def load_jsonc(path: str | Path) -> Any:
    """Load a JSONC file and return the parsed Python object.

    Args:
        path:  Path to the ``.jsonc`` file.

    Returns:
        Parsed JSON value (typically a ``dict``).

    Raises:
        FileNotFoundError: if *path* does not exist.
        json.JSONDecodeError: if the file is not valid JSONC.
    """
    raw = Path(path).read_text(encoding="utf-8")
    cleaned = _strip_jsonc(raw)
    return json.loads(cleaned)


def load_jsonc_optional(
    path: str | Path,
    default: Any = None,
) -> Any:
    """Load JSONC file, returning *default* if the file doesn't exist.

    Args:
        path:     Path to the ``.jsonc`` file.
        default:  Value returned when the file is absent (default ``None``).

    Returns:
        Parsed JSON value or *default*.
    """
    p = Path(path)
    if not p.exists():
        return default
    return load_jsonc(p)
