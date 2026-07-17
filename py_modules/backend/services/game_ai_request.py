"""Foreground game Ask orchestration (Ollama + optional TDP) without importing ``main``.

Expects a Decky ``Plugin`` instance for ``load_settings``, transparency persistence, and keyword
short-circuits. Top-level return dict keys must stay aligned with ``execute_game_ai`` RPC consumers and
frontend parsers (success, response, applied, disclosure flags, etc.).
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Optional

import decky

from backend.services.capabilities import capability_enabled
from backend.services.bonsai_stream_tags import compose_thinking_blurb
from backend.services.thinking_tiny_model_service import spawn_tiny_thinking_blurb
from backend.services.ai_character_service import build_roleplay_system_suffix_meta
from backend.services.input_sanitizer_service import apply_input_sanitizer_lane
from backend.services.ollama_service import (
    question_matches_troubleshooting_log_context,
    user_asks_ollama_bonsai_host_or_latency,
    user_consents_strategy_spoilers,
    user_wants_power_or_performance_topic,
)
from backend.services.proton_troubleshooting_logs import collect_proton_troubleshooting_logs
from backend.services.knowledge_base_service import (
    retrieve_knowledge_context,
    should_retrieve_knowledge,
    stack_context_blocks,
)
from backend.services.screenshot_media import lookup_screenshot_vdf_metadata
from backend.services.proton_experiment_journal_service import (
    format_journal_for_prompt,
    list_entries,
    load_store as load_journal_store,
)
from backend.services.transparency_service import (
    build_capability_denied_snapshot,
    build_error_route_snapshot,
    build_knowledge_base_transparency,
    build_ollama_route_snapshot,
    build_proton_journal_transparency,
    build_proton_log_transparency,
    build_sanitizer_block_snapshot,
    build_sanitizer_command_snapshot,
)
from backend.services.response_verify import (
    maybe_append_verifier_notice,
    run_verifier_second_pass,
    verify_ollama_response,
)
from refactor_helpers import build_ollama_chat_url
from backend.services.tdp_service import (
    GPU_CLK_MAX_MHZ,
    GPU_CLK_MIN_MHZ,
    STEAMOS_PRIV_WRITE,
    TDP_MAX_W,
    TDP_MIN_W,
    apply_tdp,
    read_current_tdp_watts,
)
from refactor_helpers import is_current_tdp_read_intent, parse_tdp_recommendation

logger = decky.logger


async def run_game_ai_request(
    plugin: Any,
    question: str,
    pc_ip: str,
    app_id: str = "",
    app_name: str = "",
    attachments: Optional[list] = None,
    ask_mode: str = "speed",
    spoiler_consent: bool = False,
    token_stream_request_id: Optional[int] = None,
    strategy_checklist_state: Optional[dict] = None,
) -> dict:
    """Run one full ask lifecycle, including Ollama call timing and optional TDP application."""
    start = time.time()
    app_context = "active" if app_id else "none"
    pcls = type(plugin)
    try:
        logger.info(
            "run_game_ai_request: host=%s game=%r appid=%s question_len=%d",
            pc_ip,
            app_name,
            app_id,
            len(question),
        )

        settings = await plugin.load_settings()
        if settings.get("latency_timeouts_custom_enabled") is True:
            request_timeout_seconds = int(
                settings.get("request_timeout_seconds", pcls.DEFAULT_REQUEST_TIMEOUT_SECONDS)
            )
        else:
            request_timeout_seconds = pcls.DEFAULT_REQUEST_TIMEOUT_SECONDS

        keyword_result = await plugin._try_handle_sanitizer_keyword_command(question, app_id)
        if keyword_result is not None:
            elapsed = round(time.time() - start, 1)
            out = {**keyword_result, "elapsed_seconds": elapsed}
            logger.info("run_game_ai_request: sanitizer keyword command handled (elapsed=%.1fs)", elapsed)
            await plugin._persist_input_transparency(
                build_sanitizer_command_snapshot(
                    raw_question=question,
                    final_response=str(out.get("response", "") or ""),
                    app_id=app_id,
                    app_name=app_name,
                    pc_ip=pc_ip,
                    elapsed_seconds=elapsed,
                )
            )
            return {**out, "model_policy_disclosure": None, "strategy_guide_branches": None, "strategy_checklist": None, "strategy_spoiler_consent_effective": False}

        atts = attachments or []
        if atts and not capability_enabled(settings, "media_library_access"):
            elapsed = round(time.time() - start, 1)
            msg = (
                "Screenshot attachments require media library access. "
                "Enable it in the Permissions tab, then try again."
            )
            await plugin._persist_input_transparency(
                build_capability_denied_snapshot(
                    raw_question=question,
                    attachment_paths=[str(a.get("path", "") or "") for a in atts if isinstance(a, dict)],
                    final_response=msg,
                    app_id=app_id,
                    app_name=app_name,
                    pc_ip=pc_ip,
                    elapsed_seconds=elapsed,
                )
            )
            return {
                "success": False,
                "response": msg,
                "app_id": app_id,
                "app_context": app_context,
                "applied": None,
                "elapsed_seconds": elapsed,
                "strategy_guide_branches": None,
                "strategy_checklist": None,
                "model_policy_disclosure": None,
                "strategy_spoiler_consent_effective": False,
            }

        user_sanitizer_disabled = bool(settings.get("input_sanitizer_user_disabled"))
        lane = apply_input_sanitizer_lane(question, user_sanitizer_disabled)
        if lane.action == "block":
            elapsed = round(time.time() - start, 1)
            logger.info("run_game_ai_request: input blocked by sanitizer (%s)", lane.reason_codes)
            um = str(lane.user_message or "")
            await plugin._persist_input_transparency(
                build_sanitizer_block_snapshot(
                    raw_question=question,
                    sanitizer_action=str(lane.action),
                    sanitizer_reason_codes=list(lane.reason_codes),
                    text_after_sanitizer=str(lane.text or ""),
                    final_response=um,
                    app_id=app_id,
                    app_name=app_name,
                    pc_ip=pc_ip,
                    elapsed_seconds=elapsed,
                )
            )
            return {
                "success": False,
                "response": um,
                "app_id": app_id,
                "app_context": app_context,
                "applied": None,
                "elapsed_seconds": elapsed,
                "strategy_guide_branches": None,
                "strategy_checklist": None,
                "model_policy_disclosure": None,
                "strategy_spoiler_consent_effective": False,
            }
        question_for_model = lane.text

        active_rid = plugin._active_request_id() if hasattr(plugin, "_active_request_id") else None
        rp_meta = build_roleplay_system_suffix_meta(settings, ask_mode)
        if isinstance(active_rid, int) and hasattr(plugin, "_publish_thinking_phase"):
            blurb = compose_thinking_blurb(
                question_for_model,
                app_name=app_name,
                attachment_count=len(atts),
                ask_mode=ask_mode,
                request_id=active_rid,
                character_enabled=bool(settings.get("ai_character_enabled")),
                character_preset_id=rp_meta.resolved_preset_id,
            )
            plugin._publish_thinking_phase(active_rid, blurb)
            if settings.get("thinking_status_tiny_model_enabled") is True:
                spawn_tiny_thinking_blurb(
                    plugin,
                    active_rid,
                    question=question_for_model,
                    app_name=app_name,
                    pc_ip=pc_ip,
                )

        proton_attachment_text = ""
        proton_sources: list = []
        proton_notes_parts: list[str] = []
        want_proton_logs = (
            settings.get("attach_proton_logs_when_troubleshooting") is True
            and question_matches_troubleshooting_log_context(question_for_model)
            and bool(str(app_id or "").strip())
        )
        if want_proton_logs:
            if isinstance(active_rid, int) and hasattr(plugin, "_publish_thinking_phase_key"):
                plugin._publish_thinking_phase_key(
                    active_rid,
                    "proton_logs",
                    app_name=app_name,
                    ask_mode=ask_mode,
                    question=question_for_model,
                    character_enabled=bool(settings.get("ai_character_enabled")),
                    character_preset_id=rp_meta.resolved_preset_id,
                )
            if not capability_enabled(settings, "steam_logs_read"):
                proton_notes_parts.append(
                    "Proton log excerpts skipped: enable Steam/Proton log read in Permissions."
                )
            else:
                _loop_pl = asyncio.get_running_loop()

                def _collect_logs() -> dict:
                    return collect_proton_troubleshooting_logs(app_id)

                pl_result = await _loop_pl.run_in_executor(None, _collect_logs)
                proton_attachment_text = str(pl_result.get("text") or "")
                proton_sources = list(pl_result.get("sources") or [])
                for w in pl_result.get("warnings") or []:
                    if isinstance(w, str) and w.strip():
                        proton_notes_parts.append(w.strip())

        proton_log_transparency = build_proton_log_transparency(
            excerpt_attached=bool(proton_attachment_text.strip()),
            sources=proton_sources,
            notes="; ".join(proton_notes_parts),
        )

        journal_attachment_text = ""
        journal_notes_parts: list[str] = []
        journal_entry_count = len(list_entries(load_journal_store(logger=logger), app_id))
        want_journal = (
            settings.get("include_proton_experiment_journal_when_troubleshooting") is True
            and question_matches_troubleshooting_log_context(question_for_model)
            and bool(str(app_id or "").strip())
        )
        if want_journal:
            if isinstance(active_rid, int) and hasattr(plugin, "_publish_thinking_phase_key"):
                plugin._publish_thinking_phase_key(
                    active_rid,
                    "experiment_journal",
                    app_name=app_name,
                    ask_mode=ask_mode,
                    question=question_for_model,
                    character_enabled=bool(settings.get("ai_character_enabled")),
                    character_preset_id=rp_meta.resolved_preset_id,
                )
            if journal_entry_count <= 0:
                journal_notes_parts.append("Proton experiment journal empty for this AppID.")
            else:
                journal_attachment_text = format_journal_for_prompt(app_id)
                if not journal_attachment_text.strip():
                    journal_notes_parts.append("Journal entries present but formatting yielded no text.")
        journal_transparency = build_proton_journal_transparency(
            attached=bool(journal_attachment_text.strip()),
            entry_count=journal_entry_count,
            notes="; ".join(journal_notes_parts),
        )

        shortcut_name = ""
        for attachment in atts:
            if isinstance(attachment, dict):
                hint = lookup_screenshot_vdf_metadata(str(attachment.get("path", "") or ""))
                sn = str(hint.get("shortcut_name", "") or "").strip()
                if sn:
                    shortcut_name = sn
                    break

        kb_transparency = build_knowledge_base_transparency(
            attached=False,
            trust_tier="",
            sources=[],
            notes="",
            timing_ms={},
        )
        kb_text = ""
        should_kb, kb_domain = should_retrieve_knowledge(
            use_local_knowledge_base=settings.get("use_local_knowledge_base") is True,
            ask_mode=ask_mode,
            question=question_for_model,
            app_id=app_id,
            app_name=app_name,
        )
        if should_kb:
            if isinstance(active_rid, int) and hasattr(plugin, "_publish_thinking_phase_key"):
                plugin._publish_thinking_phase_key(
                    active_rid,
                    "searching_kb",
                    app_name=app_name,
                    ask_mode=ask_mode,
                    question=question_for_model,
                    character_enabled=bool(settings.get("ai_character_enabled")),
                    character_preset_id=rp_meta.resolved_preset_id,
                )

            def _retrieve_kb():
                return retrieve_knowledge_context(
                    settings,
                    ask_mode=ask_mode,
                    question=question_for_model,
                    app_id=app_id,
                    app_name=app_name,
                    shortcut_name=shortcut_name,
                    domain=kb_domain,
                )

            _loop_kb = asyncio.get_running_loop()
            kb_result = await _loop_kb.run_in_executor(None, _retrieve_kb)
            kb_transparency = build_knowledge_base_transparency(
                attached=kb_result.attached,
                trust_tier=kb_result.trust_tier,
                sources=kb_result.sources,
                notes=kb_result.notes,
                timing_ms=kb_result.timing_ms,
                unavailable_reason=kb_result.unavailable_reason,
            )
            if kb_result.attached:
                kb_text = kb_result.text_block

        early_context_combined = stack_context_blocks(
            proton_text=proton_attachment_text,
            journal_text=journal_attachment_text,
            knowledge_text=kb_text,
        )

        read_tdp = is_current_tdp_read_intent(question_for_model)
        wants_grounding = user_wants_power_or_performance_topic(question_for_model)
        ollama_host_topic = user_asks_ollama_bonsai_host_or_latency(question_for_model)
        tdp_grounding_requested = (read_tdp or wants_grounding) and not ollama_host_topic
        pre_cap: Optional[int] = None
        if tdp_grounding_requested:
            if isinstance(active_rid, int) and hasattr(plugin, "_publish_thinking_phase_key"):
                plugin._publish_thinking_phase_key(
                    active_rid,
                    "tdp_read",
                    app_name=app_name,
                    ask_mode=ask_mode,
                    question=question_for_model,
                    character_enabled=bool(settings.get("ai_character_enabled")),
                    character_preset_id=rp_meta.resolved_preset_id,
                )
            _loop = asyncio.get_running_loop()

            def _read_cap():
                return read_current_tdp_watts(logger)

            pre_cap = await _loop.run_in_executor(None, _read_cap)

        strategy_spoiler_consent_effective = False
        if ask_mode == "strategy":
            strategy_spoiler_consent_effective = bool(spoiler_consent) or user_consents_strategy_spoilers(
                question_for_model
            )

        ollama_result = await plugin.ask_ollama(
            question_for_model,
            pc_ip,
            app_id,
            app_name,
            request_timeout_seconds=request_timeout_seconds,
            attachments=atts,
            ask_mode=ask_mode,
            read_tdp=read_tdp,
            tdp_grounding_requested=tdp_grounding_requested,
            tdp_cap_w=pre_cap,
            proton_log_attachment=early_context_combined or None,
            proton_log_transparency=proton_log_transparency,
            strategy_spoiler_consent=strategy_spoiler_consent_effective,
            token_stream_request_id=token_stream_request_id,
            strategy_checklist_state=strategy_checklist_state,
        )
        elapsed = round(time.time() - start, 1)
        base_response_text = str(ollama_result.get("response", "") or "No response text.")
        response_text = base_response_text
        applied = None
        verify_result = None
        pyro_asshole = ollama_result.get("pyro_asshole_mode") is True

        if ollama_result.get("success"):
            has_game = bool((app_id or "").strip()) or bool((app_name or "").strip())
            run_rules = settings.get("response_verify_enabled") is True
            verify_model = str(settings.get("response_verify_model") or "").strip()
            run_second = (
                settings.get("response_verify_second_pass") is True and bool(verify_model)
            )
            if run_rules or run_second:
                verify_result = (
                    verify_ollama_response(
                        response_text=base_response_text,
                        app_id=app_id,
                        app_name=app_name,
                    )
                    if run_rules
                    else {"passed": True, "warnings": []}
                )
                should_second = run_second and (
                    not run_rules or not verify_result.get("passed")
                )
                if should_second:
                    loop_verify = asyncio.get_running_loop()

                    def _second_pass() -> dict:
                        return run_verifier_second_pass(
                            chat_url=build_ollama_chat_url(pc_ip),
                            model_name=verify_model,
                            response_text=base_response_text,
                            has_game=has_game,
                            request_timeout_seconds=request_timeout_seconds,
                            logger=logger,
                        )

                    second = await loop_verify.run_in_executor(None, _second_pass)
                    verify_result = {**verify_result, "second_pass": second}
                    if second.get("ran") and second.get("passed") is False:
                        warnings = list(verify_result.get("warnings") or [])
                        warnings.append("verifier model flagged possible unsupported claims")
                        verify_result["passed"] = False
                        verify_result["warnings"] = warnings
                if not verify_result.get("passed") and not pyro_asshole:
                    response_text = maybe_append_verifier_notice(base_response_text, verify_result)

        if ollama_result.get("success"):
            loop = asyncio.get_running_loop()
            tmin, tmax, gmin, gmax = TDP_MIN_W, TDP_MAX_W, GPU_CLK_MIN_MHZ, GPU_CLK_MAX_MHZ
            priv_write = STEAMOS_PRIV_WRITE

            def _parse_only() -> Optional[dict]:
                return parse_tdp_recommendation(
                    base_response_text,
                    tmin,
                    tmax,
                    gmin,
                    gmax,
                )

            rec = None if pyro_asshole else await loop.run_in_executor(None, _parse_only)

            if read_tdp:
                logger.info("ask_game_ai: read-TDP question; sysfs apply skipped")
            elif pyro_asshole:
                logger.info("ask_game_ai: pyro asshole easter egg; hardware apply suppressed")
            elif rec:
                if not capability_enabled(settings, "hardware_control"):
                    logger.info("ask_game_ai: TDP recommendation present but hardware_control disabled")
                    response_text += "\n\n[Hardware tuning not applied: enable Hardware control in the Permissions tab.]"
                    applied = {
                        "tdp_watts": None,
                        "gpu_clock_mhz": None,
                        "errors": ["Hardware control disabled in Permissions."],
                    }
                else:
                    logger.info("ask_game_ai: parsed TDP recommendation: %s", rec)

                    def _apply() -> dict:
                        return apply_tdp(rec, priv_write, logger)

                    applied = await loop.run_in_executor(None, _apply)
                    logger.info("ask_game_ai: apply result: %s", applied)
            else:
                logger.info("ask_game_ai: no TDP recommendation found in response")

        err_tail = ""
        if not ollama_result.get("success"):
            err_tail = base_response_text[:8000]

        await plugin._persist_input_transparency(
            build_ollama_route_snapshot(
                raw_question=question,
                sanitizer_action=str(lane.action),
                sanitizer_reason_codes=list(lane.reason_codes),
                text_after_sanitizer=question_for_model,
                ollama_result={
                    **ollama_result,
                    **kb_transparency,
                    **journal_transparency,
                    "tdp_cap_watts": pre_cap if tdp_grounding_requested else None,
                },
                base_response_text=base_response_text,
                response_text=response_text,
                applied=applied,
                app_id=app_id,
                app_name=app_name,
                pc_ip=pc_ip,
                err_tail=err_tail,
                elapsed_seconds=elapsed,
                verify_result=verify_result,
            )
        )

        logger.info("run_game_ai_request: completed in %.1fs", elapsed)
        return {
            "success": bool(ollama_result.get("success", False)),
            "cancelled": bool(ollama_result.get("cancelled")),
            "response": response_text,
            "app_id": app_id,
            "app_context": app_context,
            "applied": applied,
            "elapsed_seconds": elapsed,
            "strategy_guide_branches": ollama_result.get("strategy_guide_branches"),
            "strategy_checklist": ollama_result.get("strategy_checklist"),
            "model_policy_disclosure": ollama_result.get("model_policy_disclosure"),
            "strategy_spoiler_consent_effective": bool(
                ollama_result.get("strategy_spoiler_consent_effective", False)
            ),
            "preset_carousel_inject": ollama_result.get("preset_carousel_inject"),
        }
    except Exception:
        elapsed = round(time.time() - start, 1)
        logger.exception("run_game_ai_request failed (%.1fs)", elapsed)
        await plugin._persist_input_transparency(
            build_error_route_snapshot(
                raw_question=question,
                final_response=(
                    "Something went wrong while processing your Ask. "
                    "If this repeats, check the plugin log on the Deck."
                ),
                app_id=app_id,
                app_name=app_name,
                pc_ip=pc_ip,
                elapsed_seconds=elapsed,
            )
        )
        return {
            "success": False,
            "response": (
                "Something went wrong while processing your Ask. "
                "If this repeats, check the plugin log on the Deck."
            ),
            "app_id": app_id,
            "app_context": app_context,
            "applied": None,
            "elapsed_seconds": elapsed,
            "strategy_guide_branches": None,
            "strategy_checklist": None,
            "model_policy_disclosure": None,
            "strategy_spoiler_consent_effective": False,
        }
