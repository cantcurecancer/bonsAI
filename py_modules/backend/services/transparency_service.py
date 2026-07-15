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
    return {
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
) -> dict[str, Any]:
    return {
        "kb_attached": attached,
        "kb_trust_tier": trust_tier,
        "kb_sources": list(sources or []),
        "kb_notes": notes or "",
        "kb_timing_ms": dict(timing_ms or {}),
        "kb_unavailable_reason": unavailable_reason or "",
    }


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
) -> dict[str, Any]:
    return {
        "route": "ollama",
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
        "kb_attached": bool(ollama_result.get("kb_attached")),
        "kb_trust_tier": str(ollama_result.get("kb_trust_tier") or ""),
        "kb_sources": ollama_result.get("kb_sources") or [],
        "kb_notes": str(ollama_result.get("kb_notes") or ""),
        "kb_timing_ms": ollama_result.get("kb_timing_ms") or {},
        "kb_unavailable_reason": str(ollama_result.get("kb_unavailable_reason") or ""),
        "ask_diagnostics": ollama_result.get("ask_diagnostics"),
        "response_verify": verify_result,
    }


def build_error_route_snapshot(
    *,
    raw_question: str,
    final_response: str,
    app_id: str,
    app_name: str,
    pc_ip: str,
    elapsed_seconds: float,
) -> dict[str, Any]:
    return {
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
