"""Persist named chat threads (multi-turn Ask history) under Decky plugin settings."""

from __future__ import annotations

import json
import os
import time
import uuid
from typing import Any

from backend.services.strategy_checklist_session_service import (
    rpc_entry_to_store_payload,
    sanitize_session_entry,
)

SCHEMA_VERSION = 1
MAX_THREADS = 50
MAX_TURNS_PER_THREAD = 200
MAX_TURN_TEXT_LEN = 120_000
MAX_LABEL_LEN = 120
THREADS_SUBDIR = "chat_threads"


def threads_dir(settings_dir: str) -> str:
    return os.path.join(settings_dir, THREADS_SUBDIR)


def index_path(settings_dir: str) -> str:
    return os.path.join(threads_dir(settings_dir), "index.json")


def thread_path(settings_dir: str, thread_id: str) -> str:
    safe = _sanitize_thread_id(thread_id)
    return os.path.join(threads_dir(settings_dir), f"{safe}.json")


def _sanitize_thread_id(thread_id: str) -> str:
    tid = str(thread_id or "").strip()
    if not tid or "/" in tid or "\\" in tid or "\x00" in tid:
        raise ValueError("Invalid thread id.")
    return tid


def _empty_index() -> dict[str, Any]:
    return {"version": SCHEMA_VERSION, "threads": []}


def _normalize_attachment_refs(raw: Any) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return []
    out: list[dict[str, str]] = []
    for item in raw[:8]:
        if not isinstance(item, dict):
            continue
        path = str(item.get("path", "") or "").strip()
        if not path:
            continue
        out.append(
            {
                "path": path[:512],
                "name": str(item.get("name", "") or "")[:120],
                "source": str(item.get("source", "unknown") or "unknown")[:32],
            }
        )
    return out


def _normalize_turn(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    role = str(raw.get("role", "") or "").strip().lower()
    if role not in ("user", "assistant"):
        return None
    text = str(raw.get("text", "") or "")
    if not text.strip():
        return None
    turn_id = str(raw.get("id", "") or "").strip() or str(uuid.uuid4())
    rid = raw.get("request_id")
    request_id = int(rid) if isinstance(rid, (int, float)) and not isinstance(rid, bool) else None
    return {
        "id": turn_id[:64],
        "role": role,
        "text": text[:MAX_TURN_TEXT_LEN],
        "request_id": request_id,
        "attachment_refs": _normalize_attachment_refs(raw.get("attachment_refs")),
        "created_at": int(raw.get("created_at") or time.time()),
    }


def _normalize_strategy_checklist(raw: Any) -> dict[str, Any] | None:
    if raw is None:
        return None
    if isinstance(raw, dict):
        frag = rpc_entry_to_store_payload(raw)
        if frag is not None:
            return {
                "title": frag["title"],
                "items": frag["items"],
                "checked_ids": frag["checked_ids"],
            }
        entry = sanitize_session_entry(raw)
        if entry is not None:
            return {
                "title": entry["title"],
                "items": entry["items"],
                "checked_ids": entry["checked_ids"],
            }
    return None


def sanitize_thread(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    tid = str(raw.get("id", "") or "").strip()
    if not tid:
        return None
    turns_raw = raw.get("turns")
    turns: list[dict[str, Any]] = []
    if isinstance(turns_raw, list):
        for t in turns_raw[:MAX_TURNS_PER_THREAD]:
            norm = _normalize_turn(t)
            if norm is not None:
                turns.append(norm)
    label = str(raw.get("label", "") or "").strip()[:MAX_LABEL_LEN] or "New chat"
    pending = raw.get("pending_request_id")
    pending_request_id = (
        int(pending) if isinstance(pending, (int, float)) and not isinstance(pending, bool) else None
    )
    return {
        "id": tid,
        "label": label,
        "created_at": int(raw.get("created_at") or time.time()),
        "updated_at": int(raw.get("updated_at") or time.time()),
        "origin_app_id": str(raw.get("origin_app_id", "") or "").strip()[:32],
        "turns": turns,
        "pending_request_id": pending_request_id,
        "strategy_checklist": _normalize_strategy_checklist(raw.get("strategy_checklist")),
    }


def heuristic_thread_label(first_question: str, app_name: str = "") -> str:
    q = str(first_question or "").strip()
    name = str(app_name or "").strip()
    if name:
        if q:
            trunc = q[:60] + ("…" if len(q) > 60 else "")
            return f"{name}: {trunc}"[:MAX_LABEL_LEN]
        return name[:MAX_LABEL_LEN]
    if q:
        return (q[:MAX_LABEL_LEN - 1] + "…") if len(q) > MAX_LABEL_LEN else q
    return "New chat"


def load_index(settings_dir: str, logger: Any = None) -> dict[str, Any]:
    path = index_path(settings_dir)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return _empty_index()
        threads = data.get("threads")
        if not isinstance(threads, list):
            return _empty_index()
        cleaned: list[dict[str, Any]] = []
        for row in threads[:MAX_THREADS]:
            if not isinstance(row, dict):
                continue
            tid = str(row.get("id", "") or "").strip()
            if not tid:
                continue
            cleaned.append(
                {
                    "id": tid,
                    "label": str(row.get("label", "") or "New chat")[:MAX_LABEL_LEN],
                    "created_at": int(row.get("created_at") or 0),
                    "updated_at": int(row.get("updated_at") or 0),
                    "origin_app_id": str(row.get("origin_app_id", "") or "").strip()[:32],
                    "turn_count": int(row.get("turn_count") or 0),
                }
            )
        return {"version": SCHEMA_VERSION, "threads": cleaned}
    except FileNotFoundError:
        return _empty_index()
    except Exception as exc:
        if logger is not None:
            logger.warning("load_chat_threads_index: failed %s: %s", path, exc)
        return _empty_index()


def save_index(settings_dir: str, index: dict[str, Any], logger: Any = None) -> None:
    path = index_path(settings_dir)
    os.makedirs(threads_dir(settings_dir), exist_ok=True)
    payload = {"version": SCHEMA_VERSION, "threads": list(index.get("threads") or [])[:MAX_THREADS]}
    tmp = f"{path}.tmp"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, sort_keys=True)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except OSError as exc:
        if logger is not None:
            logger.exception("save_chat_threads_index: failed %s", path)
        raise RuntimeError(f"Failed to save chat threads index: {exc}") from exc


def load_thread(settings_dir: str, thread_id: str, logger: Any = None) -> dict[str, Any] | None:
    path = thread_path(settings_dir, thread_id)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return sanitize_thread(data)
    except FileNotFoundError:
        return None
    except Exception as exc:
        if logger is not None:
            logger.warning("load_chat_thread: failed %s: %s", path, exc)
        return None


def save_thread(settings_dir: str, thread: dict[str, Any], logger: Any = None) -> dict[str, Any]:
    sanitized = sanitize_thread(thread)
    if sanitized is None:
        raise ValueError("Invalid thread payload.")
    path = thread_path(settings_dir, sanitized["id"])
    os.makedirs(threads_dir(settings_dir), exist_ok=True)
    tmp = f"{path}.tmp"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(sanitized, f, indent=2, sort_keys=True)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
        return sanitized
    except OSError as exc:
        if logger is not None:
            logger.exception("save_chat_thread: failed %s", path)
        raise RuntimeError(f"Failed to save chat thread: {exc}") from exc


def _upsert_index_row(index: dict[str, Any], thread: dict[str, Any]) -> dict[str, Any]:
    rows = [r for r in (index.get("threads") or []) if isinstance(r, dict)]
    rows = [r for r in rows if str(r.get("id", "")) != thread["id"]]
    rows.append(
        {
            "id": thread["id"],
            "label": thread["label"],
            "created_at": thread["created_at"],
            "updated_at": thread["updated_at"],
            "origin_app_id": thread.get("origin_app_id", ""),
            "turn_count": len(thread.get("turns") or []),
        }
    )
    rows.sort(key=lambda r: int(r.get("updated_at") or 0), reverse=True)
    return {"version": SCHEMA_VERSION, "threads": rows[:MAX_THREADS]}


def _prune_oldest_thread(settings_dir: str, index: dict[str, Any], logger: Any = None) -> dict[str, Any]:
    rows = list(index.get("threads") or [])
    if len(rows) < MAX_THREADS:
        return index
    rows.sort(key=lambda r: int(r.get("updated_at") or 0))
    while len(rows) >= MAX_THREADS:
        oldest = rows.pop(0)
        tid = str(oldest.get("id", "") or "")
        if tid:
            try:
                os.remove(thread_path(settings_dir, tid))
            except FileNotFoundError:
                pass
            except OSError as exc:
                if logger is not None:
                    logger.warning("prune_chat_thread: could not remove %s: %s", tid, exc)
    return {"version": SCHEMA_VERSION, "threads": rows}


def create_thread(
    settings_dir: str,
    *,
    label: str = "",
    origin_app_id: str = "",
    first_question: str = "",
    app_name: str = "",
    thread_id: str | None = None,
    logger: Any = None,
) -> dict[str, Any]:
    index = load_index(settings_dir, logger)
    index = _prune_oldest_thread(settings_dir, index, logger)
    now = int(time.time())
    tid = str(thread_id or "").strip() or str(uuid.uuid4())
    resolved_label = (label or "").strip() or heuristic_thread_label(first_question, app_name)
    thread = {
        "id": tid,
        "label": resolved_label[:MAX_LABEL_LEN],
        "created_at": now,
        "updated_at": now,
        "origin_app_id": str(origin_app_id or "").strip()[:32],
        "turns": [],
        "pending_request_id": None,
        "strategy_checklist": None,
    }
    save_thread(settings_dir, thread, logger)
    index = _upsert_index_row(index, thread)
    save_index(settings_dir, index, logger)
    return thread


def ensure_thread(
    settings_dir: str,
    thread_id: str,
    *,
    origin_app_id: str = "",
    first_question: str = "",
    app_name: str = "",
    logger: Any = None,
) -> dict[str, Any]:
    tid = _sanitize_thread_id(thread_id)
    existing = load_thread(settings_dir, tid, logger)
    if existing is not None:
        return existing
    return create_thread(
        settings_dir,
        thread_id=tid,
        origin_app_id=origin_app_id,
        first_question=first_question,
        app_name=app_name,
        logger=logger,
    )


def list_thread_summaries(settings_dir: str, logger: Any = None) -> list[dict[str, Any]]:
    index = load_index(settings_dir, logger)
    rows = list(index.get("threads") or [])
    rows.sort(key=lambda r: int(r.get("updated_at") or 0), reverse=True)
    return rows


def delete_thread(settings_dir: str, thread_id: str, logger: Any = None) -> bool:
    tid = _sanitize_thread_id(thread_id)
    try:
        os.remove(thread_path(settings_dir, tid))
    except FileNotFoundError:
        return False
    index = load_index(settings_dir, logger)
    rows = [r for r in (index.get("threads") or []) if str(r.get("id", "")) != tid]
    save_index(settings_dir, {"version": SCHEMA_VERSION, "threads": rows}, logger)
    return True


def append_turn(
    settings_dir: str,
    thread_id: str,
    *,
    role: str,
    text: str,
    request_id: int | None = None,
    attachment_refs: list[dict[str, str]] | None = None,
    label: str | None = None,
    logger: Any = None,
) -> dict[str, Any] | None:
    thread = load_thread(settings_dir, thread_id, logger)
    if thread is None:
        return None
    turn = _normalize_turn(
        {
            "id": str(uuid.uuid4()),
            "role": role,
            "text": text,
            "request_id": request_id,
            "attachment_refs": attachment_refs or [],
            "created_at": int(time.time()),
        }
    )
    if turn is None:
        return None
    turns = list(thread.get("turns") or [])
    turns.append(turn)
    thread["turns"] = turns[-MAX_TURNS_PER_THREAD:]
    thread["updated_at"] = int(time.time())
    if label:
        thread["label"] = str(label)[:MAX_LABEL_LEN]
    elif role == "user" and len(turns) == 1 and thread.get("label") in ("", "New chat"):
        thread["label"] = heuristic_thread_label(text)
    if request_id is not None and role == "user":
        thread["pending_request_id"] = request_id
    if role == "assistant":
        thread["pending_request_id"] = None
    saved = save_thread(settings_dir, thread, logger)
    index = load_index(settings_dir, logger)
    index = _upsert_index_row(index, saved)
    save_index(settings_dir, index, logger)
    return saved


def set_thread_pending_request(
    settings_dir: str, thread_id: str, request_id: int | None, logger: Any = None
) -> dict[str, Any] | None:
    thread = load_thread(settings_dir, thread_id, logger)
    if thread is None:
        return None
    thread["pending_request_id"] = request_id
    thread["updated_at"] = int(time.time())
    saved = save_thread(settings_dir, thread, logger)
    index = load_index(settings_dir, logger)
    index = _upsert_index_row(index, saved)
    save_index(settings_dir, index, logger)
    return saved


def find_thread_by_pending_request(
    settings_dir: str, request_id: int, logger: Any = None
) -> dict[str, Any] | None:
    for summary in list_thread_summaries(settings_dir, logger):
        tid = str(summary.get("id", "") or "")
        if not tid:
            continue
        thread = load_thread(settings_dir, tid, logger)
        if thread is None:
            continue
        if thread.get("pending_request_id") == request_id:
            return thread
    return None


def update_thread_strategy_checklist(
    settings_dir: str, thread_id: str, checklist: dict[str, Any] | None, logger: Any = None
) -> dict[str, Any] | None:
    thread = load_thread(settings_dir, thread_id, logger)
    if thread is None:
        return None
    thread["strategy_checklist"] = _normalize_strategy_checklist(checklist)
    thread["updated_at"] = int(time.time())
    saved = save_thread(settings_dir, thread, logger)
    index = load_index(settings_dir, logger)
    index = _upsert_index_row(index, saved)
    save_index(settings_dir, index, logger)
    return saved


def update_thread_label(
    settings_dir: str, thread_id: str, label: str, logger: Any = None
) -> dict[str, Any] | None:
    thread = load_thread(settings_dir, thread_id, logger)
    if thread is None:
        return None
    thread["label"] = str(label or "").strip()[:MAX_LABEL_LEN] or thread.get("label", "New chat")
    thread["updated_at"] = int(time.time())
    saved = save_thread(settings_dir, thread, logger)
    index = load_index(settings_dir, logger)
    index = _upsert_index_row(index, saved)
    save_index(settings_dir, index, logger)
    return saved


def parse_bundled_thread_title(response_text: str) -> str | None:
    """Extract optional ``<bonsai-thread-title>…</bonsai-thread-title>`` from first reply."""
    if not response_text:
        return None
    import re

    match = re.search(r"<bonsai-thread-title>(.*?)</bonsai-thread-title>", response_text, re.DOTALL)
    if not match:
        return None
    title = str(match.group(1) or "").strip()
    if not title:
        return None
    return title[:MAX_LABEL_LEN]


def thread_to_rpc_payload(thread: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": thread.get("id", ""),
        "label": thread.get("label", ""),
        "created_at": thread.get("created_at"),
        "updated_at": thread.get("updated_at"),
        "origin_app_id": thread.get("origin_app_id", ""),
        "turns": thread.get("turns") or [],
        "pending_request_id": thread.get("pending_request_id"),
        "strategy_checklist": thread.get("strategy_checklist"),
    }


def wipe_all_threads(settings_dir: str, logger: Any = None) -> None:
    tdir = threads_dir(settings_dir)
    if os.path.isdir(tdir):
        for name in os.listdir(tdir):
            fp = os.path.join(tdir, name)
            try:
                if os.path.isfile(fp):
                    os.remove(fp)
            except OSError as exc:
                if logger is not None:
                    logger.warning("wipe_all_threads: could not remove %s: %s", fp, exc)
    save_index(settings_dir, _empty_index(), logger)
