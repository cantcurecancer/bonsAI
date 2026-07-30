"""Builders for Ask transparency snapshot dicts shared across RPC paths."""

from __future__ import annotations

from typing import Any, Optional


def _base_snapshot_fields() -> dict[str, Any]:
    return {
        "ollama_model": None,
        "system_prompt": None,
        "user_text_for_model": None,
        "user_image_count": 0,
        "attachment_paths": [],
        "assistant_raw": None,
        "assistant_after_attachment_format": None,
        "model_policy_disclosure": None,
    }


def build_immediate_command_snapshot(
    *,
    route: str,
    parsed_question: str,
    resp: str,
    sanitizer_action: str,
    sanitizer_reason_codes: list,
    app_id: str,
    app_name: str,
    pc_ip: str,
) -> dict[str, Any]:
    """Transparency row for sanitizer/shortcut/VAC paths that finish inside ``start_background_game_ai``."""
    return ensure_context_chips_on_snapshot(
        {
            "route": route,
            "raw_question": parsed_question,
            "sanitizer_action": sanitizer_action,
            "sanitizer_reason_codes": list(sanitizer_reason_codes),
            "text_after_sanitizer": parsed_question,
            **_base_snapshot_fields(),
            "final_response": resp,
            "applied": None,
            "success": True,
            "app_id": app_id,
            "app_name": app_name,
            "pc_ip": pc_ip,
            "error_message": "",
            "elapsed_seconds": 0.0,
        }
    )


def build_sanitizer_block_snapshot(
    *,
    raw_question: str,
    sanitizer_action: str,
    sanitizer_reason_codes: list,
    text_after_sanitizer: str,
    final_response: str,
    app_id: str,
    app_name: str,
    pc_ip: str,
    elapsed_seconds: float = 0.0,
) -> dict[str, Any]:
    return {
        "route": "sanitizer_block",
        "raw_question": raw_question,
        "sanitizer_action": sanitizer_action,
        "sanitizer_reason_codes": list(sanitizer_reason_codes),
        "text_after_sanitizer": text_after_sanitizer,
        **_base_snapshot_fields(),
        "final_response": final_response,
        "applied": None,
        "success": False,
        "app_id": app_id,
        "app_name": app_name,
        "pc_ip": pc_ip,
        "error_message": "",
        "elapsed_seconds": elapsed_seconds,
    }


def build_capability_denied_snapshot(
    *,
    raw_question: str,
    attachment_paths: list[str],
    final_response: str,
    app_id: str,
    app_name: str,
    pc_ip: str,
    elapsed_seconds: float,
) -> dict[str, Any]:
    return {
        "route": "capability_denied",
        "raw_question": raw_question,
        "sanitizer_action": "n/a",
        "sanitizer_reason_codes": [],
        "text_after_sanitizer": raw_question,
        **_base_snapshot_fields(),
        "attachment_paths": list(attachment_paths),
        "final_response": final_response,
        "applied": None,
        "success": False,
        "app_id": app_id,
        "app_name": app_name,
        "pc_ip": pc_ip,
        "error_message": "media_library_access",
        "elapsed_seconds": elapsed_seconds,
        "proton_log_excerpt_attached": False,
        "proton_log_sources": [],
        "proton_log_notes": "",
    }


def build_sanitizer_command_snapshot(
    *,
    raw_question: str,
    final_response: str,
    app_id: str,
    app_name: str,
    pc_ip: str,
    elapsed_seconds: float,
) -> dict[str, Any]:
    return {
        "route": "sanitizer_command",
        "raw_question": raw_question,
        "sanitizer_action": "command",
        "sanitizer_reason_codes": [],
        "text_after_sanitizer": raw_question,
        **_base_snapshot_fields(),
        "final_response": final_response,
        "applied": None,
        "success": True,
        "app_id": app_id,
        "app_name": app_name,
        "pc_ip": pc_ip,
        "error_message": "",
        "elapsed_seconds": elapsed_seconds,
        "proton_log_excerpt_attached": False,
        "proton_log_sources": [],
        "proton_log_notes": "",
    }


def build_knowledge_base_transparency(
    *,
    attached: bool,
    trust_tier: str,
    sources: list,
    notes: str,
    timing_ms: dict,
    unavailable_reason: str = "",
    retrieval_method: str = "keyword",
    kb_domain: str = "",
) -> dict[str, Any]:
    return {
        "kb_attached": attached,
        "kb_trust_tier": trust_tier,
        "kb_sources": list(sources or []),
        "kb_notes": notes or "",
        "kb_timing_ms": dict(timing_ms or {}),
        "kb_unavailable_reason": unavailable_reason or "",
        "kb_retrieval_method": retrieval_method or "keyword",
        "kb_domain": str(kb_domain or ""),
    }


def kb_retrieval_chip_label(retrieval_method: str) -> str:
    """User-facing chip label for KB retrieval method."""
    if retrieval_method == "hybrid":
        return "Keyword + meaning"
    return "Keyword search"


def kb_retrieval_detail_label(retrieval_method: str) -> str:
    """Full retrieval label for Show details bullets."""
    if retrieval_method == "hybrid":
        return "Keyword + meaning"
    if retrieval_method == "keyword_embed_unavailable":
        return "Keyword search (embed unavailable)"
    return "Keyword search"


def build_proton_log_transparency(
    *,
    excerpt_attached: bool,
    sources: list,
    notes: str,
) -> dict[str, Any]:
    return {
        "proton_log_excerpt_attached": excerpt_attached,
        "proton_log_sources": list(sources),
        "proton_log_notes": notes,
    }


def build_proton_journal_transparency(
    *,
    attached: bool,
    entry_count: int,
    notes: str = "",
) -> dict[str, Any]:
    return {
        "proton_journal_attached": attached,
        "proton_journal_entry_count": int(entry_count or 0),
        "proton_journal_notes": str(notes or ""),
    }


def _developer_chip_snapshot_summary(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Lightweight dev chip payload — avoids duplicating full prompts in RPC responses."""
    return {
        "route": snapshot.get("route"),
        "success": snapshot.get("success"),
        "app_id": snapshot.get("app_id"),
        "app_name": snapshot.get("app_name"),
        "ollama_model": snapshot.get("ollama_model"),
        "elapsed_seconds": snapshot.get("elapsed_seconds"),
        "kb_attached": snapshot.get("kb_attached"),
        "user_image_count": snapshot.get("user_image_count"),
        "reply_verbosity": snapshot.get("reply_verbosity"),
        "note": "Enable Desktop Ask verbose logging for full prompt dump.",
    }


def ensure_context_chips_on_snapshot(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Attach ranked context chips when missing (legacy/error/immediate-command rows)."""
    if isinstance(snapshot.get("context_chips"), list) and snapshot["context_chips"]:
        return snapshot
    manifest = build_context_chips_manifest(
        snapshot=snapshot,
        overflow_skips=snapshot.get("overflow_skips") or [],
    )
    out = dict(snapshot)
    out["context_chips"] = manifest["context_chips"]
    out["overflow_skips"] = manifest["overflow_skips"]
    return out


def _chip_body(
    *,
    title: str,
    paths: Optional[list[str]] = None,
    bullets: Optional[list[str]] = None,
    dev_json: Any = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {"title": title, "paths": list(paths or []), "bullets": list(bullets or [])}
    if dev_json is not None:
        body["dev_json"] = dev_json
    return body


def _tier_class_from_source_class(source_class: str) -> str:
    sc = str(source_class or "").strip().lower()
    if sc == "foss":
        return "foss"
    if sc in ("open_weight", "open-weight", "openweight"):
        return "open_weight"
    if sc in ("non_foss", "non-foss", "nonfoss"):
        return "non_foss"
    return ""


def build_context_chips_manifest(
    *,
    snapshot: dict[str, Any],
    overflow_skips: Optional[list[str]] = None,
) -> dict[str, Any]:
    """Assemble ranked context chips for F11 Option C UI from a near-complete snapshot."""
    chips: list[dict[str, Any]] = []
    rank = 1

    if snapshot.get("proton_log_excerpt_attached") or snapshot.get("proton_log_notes"):
        sources = snapshot.get("proton_log_sources") or []
        paths = [str(s.get("path", "")) for s in sources if isinstance(s, dict) and s.get("path")]
        bullets: list[str] = []
        if snapshot.get("proton_log_excerpt_attached"):
            bullets.append("Excerpt attached to system prompt")
        else:
            bullets.append("No excerpt attached")
        notes = str(snapshot.get("proton_log_notes") or "").strip()
        if notes:
            bullets.append(notes)
        chips.append(
            {
                "id": "proton_logs",
                "rank": rank,
                "label": "Read Proton log tail" if snapshot.get("proton_log_excerpt_attached") else "Proton logs (skipped)",
                "attached": bool(snapshot.get("proton_log_excerpt_attached")),
                "tier_class": "",
                "body": _chip_body(title="Proton / Steam logs", paths=paths, bullets=bullets),
            }
        )
        rank += 1

    journal_count = int(snapshot.get("proton_journal_entry_count") or 0)
    if journal_count > 0 or snapshot.get("proton_journal_notes"):
        bullets_j: list[str] = []
        if snapshot.get("proton_journal_attached"):
            bullets_j.append(f"{journal_count} prior attempt(s) injected")
        else:
            bullets_j.append("Journal present but not injected this Ask")
        jnotes = str(snapshot.get("proton_journal_notes") or "").strip()
        if jnotes:
            bullets_j.append(jnotes)
        chips.append(
            {
                "id": "journal",
                "rank": rank,
                "label": f"Inject {journal_count} prior tries" if journal_count else "Experiment journal",
                "attached": bool(snapshot.get("proton_journal_attached")),
                "tier_class": "",
                "body": _chip_body(title="Proton experiment journal", bullets=bullets_j),
            }
        )
        rank += 1

    img_count = int(snapshot.get("user_image_count") or 0)
    att_paths = [str(p) for p in (snapshot.get("attachment_paths") or []) if p]
    if img_count > 0 or att_paths:
        chips.append(
            {
                "id": "screenshot",
                "rank": rank,
                "label": f"Attach {img_count or len(att_paths)} screenshot(s)",
                "attached": img_count > 0 or len(att_paths) > 0,
                "tier_class": "",
                "body": _chip_body(
                    title="Screenshot attachment",
                    paths=att_paths,
                    bullets=[f"{img_count or len(att_paths)} image(s) sent to vision model"],
                ),
            }
        )
        rank += 1

    if snapshot.get("kb_attached") or snapshot.get("kb_notes") or snapshot.get("kb_unavailable_reason"):
        kb_sources = snapshot.get("kb_sources") or []
        kb_bullets: list[str] = []
        retrieval_method = str(snapshot.get("kb_retrieval_method") or "keyword")
        if snapshot.get("kb_attached"):
            kb_bullets.append(f"Retrieval: {kb_retrieval_detail_label(retrieval_method)}")
            kb_domain = str(snapshot.get("kb_domain") or "").strip().lower()
            if kb_domain == "compat":
                kb_bullets.append("Source: shared troubleshooting tips")
            tier = str(snapshot.get("kb_trust_tier") or "").strip()
            if tier:
                kb_bullets.append(f"Trust tier: {tier}")
            kb_notes = str(snapshot.get("kb_notes") or "").strip()
            if kb_notes:
                kb_bullets.append(kb_notes)
            timing = snapshot.get("kb_timing_ms") or {}
            embed_ms = timing.get("embed_ms")
            rerank_ms = timing.get("rerank_ms")
            if embed_ms:
                kb_bullets.append(f"Embed: {embed_ms} ms")
            if rerank_ms:
                kb_bullets.append(f"Re-rank: {rerank_ms} ms")
        else:
            reason = str(snapshot.get("kb_unavailable_reason") or snapshot.get("kb_notes") or "").strip()
            kb_bullets.append(reason or "Not attached")
        chip_label = (
            kb_retrieval_chip_label(retrieval_method)
            if snapshot.get("kb_attached")
            else "Knowledge base (skipped)"
        )
        chips.append(
            {
                "id": "kb",
                "rank": rank,
                "label": chip_label,
                "attached": bool(snapshot.get("kb_attached")),
                "tier_class": "",
                "body": _chip_body(
                    title="Local knowledge base",
                    bullets=kb_bullets,
                    paths=[str(s) for s in kb_sources if isinstance(s, str)],
                ),
            }
        )
        rank += 1

    tdp_w = snapshot.get("tdp_cap_watts")
    if tdp_w is not None:
        chips.append(
            {
                "id": "tdp",
                "rank": rank,
                "label": "Read current TDP",
                "attached": True,
                "tier_class": "",
                "body": _chip_body(
                    title="Power context",
                    bullets=[f"{tdp_w} W cap read for this reply"],
                ),
            }
        )
        rank += 1

    reply_verbosity = str(snapshot.get("reply_verbosity") or "").strip()
    if reply_verbosity:
        chips.append(
            {
                "id": "reply_verbosity",
                "rank": rank,
                "label": f"Reply style: {reply_verbosity}",
                "attached": True,
                "tier_class": "",
                "body": _chip_body(
                    title="Reply verbosity",
                    bullets=[f"Active style: {reply_verbosity}"],
                ),
            }
        )
        rank += 1

    disclosure = snapshot.get("model_policy_disclosure")
    model_name = str(snapshot.get("ollama_model") or "").strip()
    if isinstance(disclosure, dict) or model_name:
        src_class = ""
        label = "Model routing"
        if isinstance(disclosure, dict):
            src_class = str(disclosure.get("source_class") or "")
            m = str(disclosure.get("model") or model_name or "").strip()
            tier_num = disclosure.get("tier")
            label = f"Routed {m}" if m else "Model policy"
            if tier_num is not None:
                label += f" · Tier {tier_num}"
        elif model_name:
            label = f"Routed {model_name}"
        bullets_m: list[str] = []
        if isinstance(disclosure, dict) and disclosure.get("rationale"):
            bullets_m.append(str(disclosure.get("rationale")))
        chips.append(
            {
                "id": "model",
                "rank": rank,
                "label": label,
                "attached": bool(model_name),
                "tier_class": _tier_class_from_source_class(src_class),
                "body": _chip_body(title="Model source policy", bullets=bullets_m or [label]),
            }
        )
        rank += 1

    skips = [str(s) for s in (overflow_skips or []) if str(s).strip()]
    chips.append(
        {
            "id": "developer",
            "rank": 999,
            "label": "Developer details",
            "attached": True,
            "tier_class": "",
            "body": _chip_body(
                title="Full transparency snapshot",
                bullets=["Raw RPC snapshot JSON below"] + ([f"Skipped: {s}" for s in skips] if skips else []),
                dev_json=_developer_chip_snapshot_summary(snapshot),
            ),
        }
    )

    return {"context_chips": chips, "overflow_skips": skips}


def build_ollama_route_snapshot(
    *,
    raw_question: str,
    sanitizer_action: str,
    sanitizer_reason_codes: list,
    text_after_sanitizer: str,
    ollama_result: dict[str, Any],
    base_response_text: str,
    response_text: str,
    applied: Any,
    app_id: str,
    app_name: str,
    pc_ip: str,
    err_tail: str,
    elapsed_seconds: float,
    verify_result: Optional[dict] = None,
    reply_followup: Optional[dict] = None,
) -> dict[str, Any]:
    route = "ollama"
    if isinstance(reply_followup, dict):
        chip_id = str(reply_followup.get("chip_id") or "").strip()
        if chip_id:
            route = f"reply_followup:{chip_id}"
    base: dict[str, Any] = {
        "route": route,
        "raw_question": raw_question,
        "sanitizer_action": sanitizer_action,
        "sanitizer_reason_codes": list(sanitizer_reason_codes),
        "text_after_sanitizer": text_after_sanitizer,
        "ollama_model": ollama_result.get("model"),
        "system_prompt": ollama_result.get("system_prompt"),
        "user_text_for_model": ollama_result.get("user_text_for_model"),
        "user_image_count": int(ollama_result.get("user_image_count") or 0),
        "attachment_paths": ollama_result.get("attachment_paths") or [],
        "assistant_raw": ollama_result.get("assistant_raw"),
        "assistant_after_attachment_format": base_response_text,
        "final_response": response_text,
        "applied": applied,
        "success": bool(ollama_result.get("success", False)),
        "app_id": app_id,
        "app_name": app_name,
        "pc_ip": pc_ip,
        "error_message": err_tail,
        "elapsed_seconds": elapsed_seconds,
        "model_policy_disclosure": ollama_result.get("model_policy_disclosure"),
        "proton_log_excerpt_attached": bool(ollama_result.get("proton_log_excerpt_attached")),
        "proton_log_sources": ollama_result.get("proton_log_sources") or [],
        "proton_log_notes": str(ollama_result.get("proton_log_notes") or ""),
        "proton_journal_attached": bool(ollama_result.get("proton_journal_attached")),
        "proton_journal_entry_count": int(ollama_result.get("proton_journal_entry_count") or 0),
        "proton_journal_notes": str(ollama_result.get("proton_journal_notes") or ""),
        "tdp_cap_watts": ollama_result.get("tdp_cap_watts"),
        "kb_attached": bool(ollama_result.get("kb_attached")),
        "kb_trust_tier": str(ollama_result.get("kb_trust_tier") or ""),
        "kb_sources": ollama_result.get("kb_sources") or [],
        "kb_notes": str(ollama_result.get("kb_notes") or ""),
        "kb_timing_ms": ollama_result.get("kb_timing_ms") or {},
        "kb_unavailable_reason": str(ollama_result.get("kb_unavailable_reason") or ""),
        "kb_retrieval_method": str(ollama_result.get("kb_retrieval_method") or "keyword"),
        "ask_diagnostics": ollama_result.get("ask_diagnostics"),
        "response_verify": verify_result,
        "reply_verbosity": str(ollama_result.get("reply_verbosity") or "balanced"),
    }
    chip_manifest = build_context_chips_manifest(
        snapshot=base,
        overflow_skips=ollama_result.get("overflow_skips") or [],
    )
    base["context_chips"] = chip_manifest["context_chips"]
    base["overflow_skips"] = chip_manifest["overflow_skips"]
    return base


def build_error_route_snapshot(
    *,
    raw_question: str,
    final_response: str,
    app_id: str,
    app_name: str,
    pc_ip: str,
    elapsed_seconds: float,
) -> dict[str, Any]:
    return ensure_context_chips_on_snapshot(
        {
            "route": "error",
            "raw_question": raw_question,
            "sanitizer_action": "error",
            "sanitizer_reason_codes": [],
            "text_after_sanitizer": raw_question,
            **_base_snapshot_fields(),
            "final_response": final_response,
            "applied": None,
            "success": False,
            "app_id": app_id,
            "app_name": app_name,
            "pc_ip": pc_ip,
            "error_message": "Internal error (details logged on device).",
            "elapsed_seconds": elapsed_seconds,
            "proton_log_excerpt_attached": False,
            "proton_log_sources": [],
            "proton_log_notes": "",
        }
    )


def build_voice_transcribe_snapshot(*, model_id: str) -> dict[str, Any]:
    return {
        "route": "voice.transcribe",
        "raw_question": None,
        "sanitizer_action": None,
        "sanitizer_reason_codes": [],
        "text_after_sanitizer": None,
        **_base_snapshot_fields(),
        "final_response": None,
        "voice_local_only": True,
        "voice_model_id": model_id,
        "voice_audio_persisted": False,
    }
