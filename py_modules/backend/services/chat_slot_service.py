"""
Title: Chat slot persistence
Purpose: Persist named chat slots (multi-turn Ask history) under Decky plugin settings.
Used for: main.py chat slot RPCs, ask turn recording on submit and completion.
Solves: Disk-backed bounded slot store with atomic writes and index.
Does not: Correlate in-flight requests — that is an in-memory map on Plugin.
"""

from __future__ import annotations

import json
import os
import time
import uuid
from typing import Any

SCHEMA_VERSION = 1
MAX_CHAT_SLOTS = 5
MAX_TURNS_PER_SLOT = 200
MAX_TURN_TEXT_LEN = 120_000
MAX_LABEL_LEN = 120
SLOTS_SUBDIR = "chat_slots"


def slots_dir(settings_dir: str) -> str:
    return os.path.join(settings_dir, SLOTS_SUBDIR)


def index_path(settings_dir: str) -> str:
    return os.path.join(slots_dir(settings_dir), "index.json")


def slot_path(settings_dir: str, slot_id: str) -> str:
    safe = _sanitize_slot_id(slot_id)
    return os.path.join(slots_dir(settings_dir), f"{safe}.json")


def _sanitize_slot_id(slot_id: str) -> str:
    sid = str(slot_id or "").strip()
    if not sid or "/" in sid or "\\" in sid or "\x00" in sid:
        raise ValueError("Invalid slot id.")
    return sid


def _empty_index() -> dict[str, Any]:
    return {"version": SCHEMA_VERSION, "slots": []}


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


def _normalize_turn_transparency(raw: Any) -> dict[str, Any] | None:
    """Sanitize the trimmed snapshot ``transparency_snapshot_for_chat_slot`` hands us.

    Only ``context_chips`` is load-bearing here — it is what
    ``SessionContextStrip.tsx`` filters archived turns on (``t.transparency && chipsFromSnapshot(...)
    .length > 0``). A turn with no chips is treated the same as no snapshot at all, so a slot
    round-tripped through disk cannot resurrect an empty placeholder as a countable turn.
    """
    if not isinstance(raw, dict):
        return None
    chips = raw.get("context_chips")
    if not isinstance(chips, list) or not chips:
        return None
    return {
        "route": str(raw.get("route") or ""),
        "success": bool(raw.get("success")),
        "context_chips": chips,
        "overflow_skips": list(raw.get("overflow_skips") or []),
    }


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
        "transparency": _normalize_turn_transparency(raw.get("transparency")),
        "created_at": int(raw.get("created_at") or time.time()),
    }


def sanitize_slot(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    sid = str(raw.get("id", "") or "").strip()
    if not sid:
        return None
    turns_raw = raw.get("turns")
    turns: list[dict[str, Any]] = []
    if isinstance(turns_raw, list):
        for t in turns_raw[:MAX_TURNS_PER_SLOT]:
            norm = _normalize_turn(t)
            if norm is not None:
                turns.append(norm)
    label = str(raw.get("label", "") or "").strip()[:MAX_LABEL_LEN] or "New chat"
    return {
        "id": sid,
        "label": label,
        "created_at": int(raw.get("created_at") or time.time()),
        "updated_at": int(raw.get("updated_at") or time.time()),
        "origin_app_id": str(raw.get("origin_app_id", "") or "").strip()[:32],
        "turns": turns,
    }


def heuristic_slot_label(first_question: str, app_name: str = "") -> str:
    q = str(first_question or "").strip()
    name = str(app_name or "").strip()
    if name:
        if q:
            trunc = q[:60] + ("…" if len(q) > 60 else "")
            return f"{name}: {trunc}"[:MAX_LABEL_LEN]
        return name[:MAX_LABEL_LEN]
    if q:
        return (q[: MAX_LABEL_LEN - 1] + "…") if len(q) > MAX_LABEL_LEN else q
    return "New chat"


def load_index(settings_dir: str, logger: Any = None) -> dict[str, Any]:
    path = index_path(settings_dir)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return _empty_index()
        slots = data.get("slots")
        if not isinstance(slots, list):
            return _empty_index()
        cleaned: list[dict[str, Any]] = []
        for row in slots[:MAX_CHAT_SLOTS]:
            if not isinstance(row, dict):
                continue
            sid = str(row.get("id", "") or "").strip()
            if not sid:
                continue
            cleaned.append(
                {
                    "id": sid,
                    "label": str(row.get("label", "") or "New chat")[:MAX_LABEL_LEN],
                    "created_at": int(row.get("created_at") or 0),
                    "updated_at": int(row.get("updated_at") or 0),
                    "origin_app_id": str(row.get("origin_app_id", "") or "").strip()[:32],
                    "turn_count": int(row.get("turn_count") or 0),
                }
            )
        return {"version": SCHEMA_VERSION, "slots": cleaned}
    except FileNotFoundError:
        return _empty_index()
    except Exception as exc:
        if logger is not None:
            logger.warning("load_chat_slots_index: failed %s: %s", path, exc)
        return _empty_index()


def save_index(settings_dir: str, index: dict[str, Any], logger: Any = None) -> None:
    path = index_path(settings_dir)
    os.makedirs(slots_dir(settings_dir), exist_ok=True)
    payload = {"version": SCHEMA_VERSION, "slots": list(index.get("slots") or [])[:MAX_CHAT_SLOTS]}
    tmp = f"{path}.tmp"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, sort_keys=True)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except OSError as exc:
        if logger is not None:
            logger.exception("save_chat_slots_index: failed %s", path)
        raise RuntimeError(f"Failed to save chat slots index: {exc}") from exc


def load_slot(settings_dir: str, slot_id: str, logger: Any = None) -> dict[str, Any] | None:
    path = slot_path(settings_dir, slot_id)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return sanitize_slot(data)
    except FileNotFoundError:
        return None
    except Exception as exc:
        if logger is not None:
            logger.warning("load_chat_slot: failed %s: %s", path, exc)
        return None


def save_slot(settings_dir: str, slot: dict[str, Any], logger: Any = None) -> dict[str, Any]:
    sanitized = sanitize_slot(slot)
    if sanitized is None:
        raise ValueError("Invalid slot payload.")
    path = slot_path(settings_dir, sanitized["id"])
    os.makedirs(slots_dir(settings_dir), exist_ok=True)
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
            logger.exception("save_chat_slot: failed %s", path)
        raise RuntimeError(f"Failed to save chat slot: {exc}") from exc


def _upsert_index_row(index: dict[str, Any], slot: dict[str, Any]) -> dict[str, Any]:
    rows = [r for r in (index.get("slots") or []) if isinstance(r, dict)]
    rows = [r for r in rows if str(r.get("id", "")) != slot["id"]]
    rows.append(
        {
            "id": slot["id"],
            "label": slot["label"],
            "created_at": slot["created_at"],
            "updated_at": slot["updated_at"],
            "origin_app_id": slot.get("origin_app_id", ""),
            "turn_count": len(slot.get("turns") or []),
        }
    )
    rows.sort(key=lambda r: int(r.get("updated_at") or 0), reverse=True)
    return {"version": SCHEMA_VERSION, "slots": rows[:MAX_CHAT_SLOTS]}


def _prune_oldest_slot(settings_dir: str, index: dict[str, Any], logger: Any = None) -> dict[str, Any]:
    rows = list(index.get("slots") or [])
    if len(rows) < MAX_CHAT_SLOTS:
        return index
    rows.sort(key=lambda r: int(r.get("updated_at") or 0))
    while len(rows) >= MAX_CHAT_SLOTS:
        oldest = rows.pop(0)
        sid = str(oldest.get("id", "") or "")
        if sid:
            try:
                os.remove(slot_path(settings_dir, sid))
            except FileNotFoundError:
                pass
            except OSError as exc:
                if logger is not None:
                    logger.warning("prune_chat_slot: could not remove %s: %s", sid, exc)
    return {"version": SCHEMA_VERSION, "slots": rows}


def create_slot(
    settings_dir: str,
    *,
    label: str = "",
    origin_app_id: str = "",
    first_question: str = "",
    app_name: str = "",
    slot_id: str | None = None,
    logger: Any = None,
) -> dict[str, Any]:
    index = load_index(settings_dir, logger)
    index = _prune_oldest_slot(settings_dir, index, logger)
    now = int(time.time())
    sid = str(slot_id or "").strip() or str(uuid.uuid4())
    resolved_label = (label or "").strip() or heuristic_slot_label(first_question, app_name)
    slot = {
        "id": sid,
        "label": resolved_label[:MAX_LABEL_LEN],
        "created_at": now,
        "updated_at": now,
        "origin_app_id": str(origin_app_id or "").strip()[:32],
        "turns": [],
    }
    save_slot(settings_dir, slot, logger)
    index = _upsert_index_row(index, slot)
    save_index(settings_dir, index, logger)
    return slot


def ensure_slot(
    settings_dir: str,
    slot_id: str,
    *,
    origin_app_id: str = "",
    first_question: str = "",
    app_name: str = "",
    logger: Any = None,
) -> dict[str, Any]:
    sid = _sanitize_slot_id(slot_id)
    existing = load_slot(settings_dir, sid, logger)
    if existing is not None:
        return existing
    return create_slot(
        settings_dir,
        slot_id=sid,
        origin_app_id=origin_app_id,
        first_question=first_question,
        app_name=app_name,
        logger=logger,
    )


def list_slot_summaries(settings_dir: str, logger: Any = None) -> list[dict[str, Any]]:
    index = load_index(settings_dir, logger)
    rows = list(index.get("slots") or [])
    rows.sort(key=lambda r: int(r.get("updated_at") or 0), reverse=True)
    return rows


def delete_slot(settings_dir: str, slot_id: str, logger: Any = None) -> bool:
    sid = _sanitize_slot_id(slot_id)
    try:
        os.remove(slot_path(settings_dir, sid))
    except FileNotFoundError:
        return False
    index = load_index(settings_dir, logger)
    rows = [r for r in (index.get("slots") or []) if str(r.get("id", "")) != sid]
    save_index(settings_dir, {"version": SCHEMA_VERSION, "slots": rows}, logger)
    return True


def append_turn(
    settings_dir: str,
    slot_id: str,
    *,
    role: str,
    text: str,
    request_id: int | None = None,
    attachment_refs: list[dict[str, str]] | None = None,
    transparency: dict[str, Any] | None = None,
    label: str | None = None,
    logger: Any = None,
) -> dict[str, Any] | None:
    slot = load_slot(settings_dir, slot_id, logger)
    if slot is None:
        return None
    turn = _normalize_turn(
        {
            "id": str(uuid.uuid4()),
            "role": role,
            "text": text,
            "request_id": request_id,
            "attachment_refs": attachment_refs or [],
            "transparency": transparency,
            "created_at": int(time.time()),
        }
    )
    if turn is None:
        return None
    turns = list(slot.get("turns") or [])
    turns.append(turn)
    slot["turns"] = turns[-MAX_TURNS_PER_SLOT:]
    slot["updated_at"] = int(time.time())
    if label:
        slot["label"] = str(label)[:MAX_LABEL_LEN]
    elif role == "user" and len(turns) == 1 and slot.get("label") in ("", "New chat"):
        slot["label"] = heuristic_slot_label(text)
    saved = save_slot(settings_dir, slot, logger)
    index = load_index(settings_dir, logger)
    index = _upsert_index_row(index, saved)
    save_index(settings_dir, index, logger)
    return saved


def update_slot_label(
    settings_dir: str, slot_id: str, label: str, logger: Any = None
) -> dict[str, Any] | None:
    slot = load_slot(settings_dir, slot_id, logger)
    if slot is None:
        return None
    slot["label"] = str(label or "").strip()[:MAX_LABEL_LEN] or slot.get("label", "New chat")
    slot["updated_at"] = int(time.time())
    saved = save_slot(settings_dir, slot, logger)
    index = load_index(settings_dir, logger)
    index = _upsert_index_row(index, saved)
    save_index(settings_dir, index, logger)
    return saved


def slot_to_rpc_payload(slot: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": slot.get("id", ""),
        "label": slot.get("label", ""),
        "created_at": slot.get("created_at"),
        "updated_at": slot.get("updated_at"),
        "origin_app_id": slot.get("origin_app_id", ""),
        "turns": slot.get("turns") or [],
    }


def wipe_all_slots(settings_dir: str, logger: Any = None) -> None:
    sdir = slots_dir(settings_dir)
    if os.path.isdir(sdir):
        for name in os.listdir(sdir):
            fp = os.path.join(sdir, name)
            try:
                if os.path.isfile(fp):
                    os.remove(fp)
            except OSError as exc:
                if logger is not None:
                    logger.warning("wipe_all_slots: could not remove %s: %s", fp, exc)
    save_index(settings_dir, _empty_index(), logger)
