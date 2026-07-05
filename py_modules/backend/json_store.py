"""Generic JSON file load/sanitize/save for plugin persisted stores."""

import json
import os
from typing import Any, Callable, Optional


def load_json_store(
    path: str,
    sanitize: Callable[[Any], dict],
    logger: Any = None,
    *,
    empty_factory: Callable[[], dict] | None = None,
    max_bytes: int | None = None,
    log_prefix: str = "load_json_store",
) -> dict:
    """Read JSON from ``path``, sanitize, or return empty defaults on missing/invalid data."""
    if empty_factory is None:
        empty_factory = lambda: sanitize({})

    if not os.path.isfile(path):
        return empty_factory()

    try:
        size = os.path.getsize(path)
        if max_bytes is not None and size > max_bytes:
            if logger:
                logger.warning(
                    "%s: %s exceeds %d bytes (%d); using defaults",
                    log_prefix,
                    path,
                    max_bytes,
                    size,
                )
            return empty_factory()
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        if logger:
            logger.warning("%s: failed to read %s: %s", log_prefix, path, exc)
        return empty_factory()

    if not isinstance(data, dict):
        if logger:
            logger.warning("%s: expected object in %s, got %s", log_prefix, path, type(data).__name__)
        return empty_factory()
    return sanitize(data)


def save_json_store(path: str, data: dict, logger: Any = None, *, log_prefix: str = "save_json_store") -> bool:
    """Write ``data`` as indented JSON; create parent dirs when needed."""
    try:
        parent = os.path.dirname(path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, sort_keys=True)
            fh.write("\n")
        return True
    except OSError as exc:
        if logger:
            logger.warning("%s: failed to write %s: %s", log_prefix, path, exc)
        return False
