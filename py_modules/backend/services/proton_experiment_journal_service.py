"""Per-game Proton experiment journal persisted under ~/.bonsai/."""

from __future__ import annotations

import json
import os
import re
import sys
import time
import uuid
from pathlib import Path
from typing import Any, Optional

from backend.services.proton_troubleshooting_logs import (
    path_allowed_for_proton_log,
    read_file_tail_bytes,
)

JOURNAL_FILENAME = "proton_experiment_journal.json"
SCHEMA_VERSION = 1
MAX_ENTRIES_PER_APP = 20
MAX_APP_BUCKETS = 64
MAX_PROTON_VERSION_LEN = 80
MAX_LAUNCH_OPTIONS_LEN = 512
MAX_NOTE_LEN = 120
MAX_JSON_BYTES = 256 * 1024
JOURNAL_INJECT_BUDGET_BYTES = 8 * 1024
VALID_OUTCOMES = frozenset({"worse", "same", "better"})

_PROTON_VERSION_HINT_RE = re.compile(
    r"(?i)\b((?:GE-)?Proton[\w.-]{0,24}|Proton\s+Experimental|Proton\s+Hotfix[\w.-]*)"
)


def journal_path(home: Optional[str] = None) -> str:
    expanded = Path(os.path.expanduser(home or "~"))
    return str(expanded / ".bonsai" / JOURNAL_FILENAME)


def _empty_store() -> dict[str, Any]:
    return {"version": SCHEMA_VERSION, "by_app_id": {}}


def _normalize_app_id(app_id: str | None) -> str:
    aid = str(app_id or "").strip()
    if not aid.isdigit():
        return ""
    return aid


def _normalize_outcome(raw: Any) -> str:
    val = str(raw or "").strip().lower()
    return val if val in VALID_OUTCOMES else "same"


def _normalize_entry(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    proton_version = str(raw.get("proton_version", "") or "").strip()[:MAX_PROTON_VERSION_LEN]
    launch_options = str(raw.get("launch_options", "") or "").strip()[:MAX_LAUNCH_OPTIONS_LEN]
    outcome = _normalize_outcome(raw.get("outcome"))
    note = str(raw.get("note", "") or "").strip()[:MAX_NOTE_LEN]
    if not proton_version and not launch_options:
        return None
    entry_id = str(raw.get("id", "") or "").strip() or str(uuid.uuid4())
    return {
        "id": entry_id,
        "proton_version": proton_version,
        "launch_options": launch_options or "%command%",
        "outcome": outcome,
        "note": note,
        "created_at": int(raw.get("created_at") or time.time()),
    }


def _normalize_bucket(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    entries_raw = raw.get("entries")
    if not isinstance(entries_raw, list):
        return None
    entries: list[dict[str, Any]] = []
    for item in entries_raw[:MAX_ENTRIES_PER_APP]:
        norm = _normalize_entry(item)
        if norm is not None:
            entries.append(norm)
    if not entries:
        return None
    entries.sort(key=lambda e: int(e.get("created_at") or 0), reverse=True)
    return {
        "entries": entries[:MAX_ENTRIES_PER_APP],
        "updated_at": int(raw.get("updated_at") or time.time()),
    }


def sanitize_journal_store(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        return _empty_store()
    by_app: dict[str, Any] = {}
    src = raw.get("by_app_id")
    if isinstance(src, dict):
        for key, bucket in list(src.items())[:MAX_APP_BUCKETS]:
            aid = _normalize_app_id(str(key))
            if not aid:
                continue
            norm = _normalize_bucket(bucket)
            if norm is not None:
                by_app[aid] = norm
    return {"version": SCHEMA_VERSION, "by_app_id": by_app}


def load_store(home: Optional[str] = None, logger: Any = None) -> dict[str, Any]:
    path = journal_path(home)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return sanitize_journal_store(data)
    except FileNotFoundError:
        return _empty_store()
    except Exception as exc:
        if logger is not None:
            logger.warning("load_proton_experiment_journal: failed to read %s: %s", path, exc)
        return _empty_store()


def save_store(store: dict[str, Any], *, home: Optional[str] = None, logger: Any = None) -> dict[str, Any]:
    sanitized = sanitize_journal_store(store)
    encoded = json.dumps(sanitized, indent=2, sort_keys=True).encode("utf-8")
    if len(encoded) > MAX_JSON_BYTES:
        raise ValueError("Proton experiment journal exceeds size cap")
    path = journal_path(home)
    try:
        parent = os.path.dirname(path)
        os.makedirs(parent, exist_ok=True)
        tmp_path = f"{path}.tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(encoded.decode("utf-8"))
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
        return sanitized
    except OSError as exc:
        if logger is not None:
            logger.exception("save_proton_experiment_journal: failed to write %s", path)
        raise RuntimeError(f"Failed to save proton experiment journal: {exc}") from exc


def list_entries(store: dict[str, Any], app_id: str | None) -> list[dict[str, Any]]:
    aid = _normalize_app_id(app_id)
    if not aid:
        return []
    by_app = store.get("by_app_id")
    if not isinstance(by_app, dict):
        return []
    bucket = by_app.get(aid)
    if not isinstance(bucket, dict):
        return []
    entries = bucket.get("entries")
    if not isinstance(entries, list):
        return []
    return [dict(e) for e in entries if isinstance(e, dict)]


def append_entry(
    store: dict[str, Any],
    app_id: str | None,
    *,
    proton_version: str,
    launch_options: str = "%command%",
    outcome: str = "same",
    note: str = "",
) -> dict[str, Any]:
    aid = _normalize_app_id(app_id)
    if not aid:
        raise ValueError("Numeric AppID required")
    entry = _normalize_entry(
        {
            "id": str(uuid.uuid4()),
            "proton_version": proton_version,
            "launch_options": launch_options,
            "outcome": outcome,
            "note": note,
            "created_at": int(time.time()),
        }
    )
    if entry is None:
        raise ValueError("Invalid journal entry")
    base = sanitize_journal_store(store)
    by_app = dict(base.get("by_app_id") or {})
    bucket = dict(by_app.get(aid) or {"entries": [], "updated_at": int(time.time())})
    entries = list(bucket.get("entries") or [])
    entries.insert(0, entry)
    bucket["entries"] = entries[:MAX_ENTRIES_PER_APP]
    bucket["updated_at"] = int(time.time())
    by_app[aid] = bucket
    if len(by_app) > MAX_APP_BUCKETS:
        ordered = sorted(
            by_app.items(),
            key=lambda kv: int((kv[1] or {}).get("updated_at") or 0) if isinstance(kv[1], dict) else 0,
            reverse=True,
        )
        by_app = dict(ordered[:MAX_APP_BUCKETS])
    return {"version": SCHEMA_VERSION, "by_app_id": by_app}


def delete_entry(store: dict[str, Any], app_id: str | None, entry_id: str) -> dict[str, Any]:
    aid = _normalize_app_id(app_id)
    eid = str(entry_id or "").strip()
    base = sanitize_journal_store(store)
    if not aid or not eid:
        return base
    by_app = dict(base.get("by_app_id") or {})
    bucket = by_app.get(aid)
    if not isinstance(bucket, dict):
        return base
    entries = [e for e in bucket.get("entries") or [] if isinstance(e, dict) and str(e.get("id")) != eid]
    if entries:
        by_app[aid] = {**bucket, "entries": entries, "updated_at": int(time.time())}
    else:
        by_app.pop(aid, None)
    return {"version": SCHEMA_VERSION, "by_app_id": by_app}


def clear_app(store: dict[str, Any], app_id: str | None) -> dict[str, Any]:
    aid = _normalize_app_id(app_id)
    base = sanitize_journal_store(store)
    if not aid:
        return base
    by_app = dict(base.get("by_app_id") or {})
    by_app.pop(aid, None)
    return {"version": SCHEMA_VERSION, "by_app_id": by_app}


def wipe_journal_file(home: Optional[str] = None, logger: Any = None) -> bool:
    """Remove journal file when under user home (Linux Deck target)."""
    if sys.platform.startswith("win"):
        return False
    path = journal_path(home)
    try:
        home_rp = Path.home().resolve()
        file_rp = Path(path).resolve()
        if not str(file_rp).startswith(str(home_rp) + os.sep) and file_rp != home_rp:
            return False
        if file_rp.exists():
            file_rp.unlink()
        return True
    except OSError as exc:
        if logger is not None:
            logger.warning("wipe_journal_file: %s", exc)
        return False


def format_journal_for_prompt(app_id: str | None, *, home: Optional[str] = None) -> str:
    """Timeline text for troubleshooting inject; empty when no entries."""
    entries = list_entries(load_store(home), app_id)
    if not entries:
        return ""
    lines = [
        "--- Proton experiment journal (bonsAI; do not re-suggest worse/same dead ends) ---",
        "Prior user-tagged Proton attempts for this game (newest first):",
    ]
    for entry in entries:
        pv = str(entry.get("proton_version") or "").strip() or "?"
        lo = str(entry.get("launch_options") or "").strip() or "%command%"
        outcome = str(entry.get("outcome") or "same")
        note = str(entry.get("note") or "").strip()
        row = f"- {pv} | launch: {lo} | outcome: {outcome}"
        if note:
            row += f" | note: {note}"
        lines.append(row)
    lines.append("--- End Proton experiment journal ---")
    body = "\n".join(lines)
    encoded = body.encode("utf-8")
    if len(encoded) <= JOURNAL_INJECT_BUDGET_BYTES:
        return body
    trimmed = encoded[:JOURNAL_INJECT_BUDGET_BYTES].decode("utf-8", errors="ignore")
    return trimmed + "\n[…truncated]"


def suggest_proton_version_from_logs(app_id: str | None, *, home: Optional[str] = None) -> str:
    """Best-effort hint from steam-<appid>.log tail; does not persist."""
    if sys.platform != "linux":
        return ""
    aid = _normalize_app_id(app_id)
    if not aid:
        return ""
    expanded_home = os.path.expanduser(home or "~")
    log_path = os.path.join(expanded_home, f"steam-{aid}.log")
    if not path_allowed_for_proton_log(log_path, aid, expanded_home):
        return ""
    raw = read_file_tail_bytes(log_path, 32 * 1024)
    if not raw:
        return ""
    text = raw.decode("utf-8", errors="replace")
    matches = _PROTON_VERSION_HINT_RE.findall(text)
    if not matches:
        return ""
    # Last match in tail is usually the active Proton build.
    hint = str(matches[-1]).strip()
    return hint[:MAX_PROTON_VERSION_LEN]
