"""Title: Game Ask orchestration

Purpose: Run a foreground game Ask (Ollama + optional TDP) without importing main.
Used for: RPC handlers and background workers that need the full Ask pipeline.
Solves: Keeps main.py thin while preserving one orchestration owner for context, KB, sanitizer, and Ollama.
Does not: Define Decky RPC method names or poll state — those live in main.py and async_background_job.

Return dict keys must stay aligned with execute_game_ai RPC consumers and frontend parsers
(success, response, applied, disclosure flags, etc.).
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Optional

import decky

from backend.services.capabilities import capability_enabled
from backend.services.ai_character_service import build_roleplay_system_suffix_meta
from backend.services.input_sanitizer_service import apply_input_sanitizer_lane
from backend.services.ollama_prompts import (
    build_reply_followup_context_block,
    extract_strategy_asked_entity,
    kb_text_covers_asked_entity,
    user_consents_strategy_spoilers,
    user_wants_power_or_performance_topic,
)
from backend.services.ollama_service import (
    question_matches_troubleshooting_log_context,
    user_asks_ollama_bonsai_host_or_latency,
)
from backend.services.proton_troubleshooting_logs import collect_proton_troubleshooting_logs
from backend.services.knowledge_base_service import (
    kb_coverage_to_transparency,
    lookup_game_genres,
    retrieve_knowledge_context,
    should_retrieve_knowledge,
    stack_context_blocks,
    summarize_kb_coverage,
)
from backend.services.screenshot_media import lookup_screenshot_vdf_metadata
from backend.services.spoiler_risk_service import build_spoiler_risk_signals
from backend.services.spoiler_title_profiles import resolve_title_spoiler_profile
from backend.services.transparency_service import (
    build_capability_denied_snapshot,
    build_error_route_snapshot,
    build_knowledge_base_transparency,
    build_ollama_route_snapshot,
    build_proton_log_transparency,
    build_sanitizer_block_snapshot,
    build_sanitizer_command_snapshot,
)
from backend.services.tdp_service import (
    GPU_CLK_MAX_MHZ,
    GPU_CLK_MIN_MHZ,
    TDP_MAX_W,
    TDP_MIN_W,
    read_current_tdp_watts,
)
from backend.tdp_intent import is_current_tdp_read_intent, parse_tdp_recommendation

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
    reply_followup: Optional[dict] = None,
    roleplay_meta: Any = None,
) -> dict:
    """Run one full ask lifecycle, including Ollama call timing and optional TDP application.

    ``roleplay_meta`` is a pre-resolved ``build_roleplay_system_suffix_meta`` result. The
    background Ask path resolves it at accept time so the opening thinking blurb can be composed
    before this task starts, and passes it here so the character is picked exactly once per Ask --
    ``ai_character_random`` calls ``random.choice``, so resolving twice could put a deadpan blurb
    in front of a witty reply. The foreground path passes nothing and resolves below.
    """
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
        # Retrieval searches the user's actual words. question_for_model grows a follow-up
        # header below, and _fts_match_query keeps only a bounded number of tokens, so a
        # follow-up Ask used to be searched as "REPLY FOLLOW UP CONTEXT The user is refining
        # their previous Ask ..." — boilerplate identical on every follow-up, and nothing of
        # what was asked. The model still receives the header; the index does not.
        question_for_retrieval = lane.text

        if reply_followup:
            followup_block = build_reply_followup_context_block(
                str(reply_followup.get("chip_id") or ""),
                str(reply_followup.get("parent_question") or ""),
                str(reply_followup.get("parent_answer") or ""),
            )
            question_for_model = f"{followup_block}\n{question_for_model}"

        preferred_model = (
            str(reply_followup.get("preferred_model") or "").strip() or None
            if isinstance(reply_followup, dict)
            else None
        )

        active_rid = plugin._active_request_id() if hasattr(plugin, "_active_request_id") else None
        # The opening blurb is composed by start_background_game_ai and published before this task
        # runs, so there is no second opener here -- a duplicate compose is what made the line
        # rewrite itself from one generic opener to another within the first poll.
        rp_meta = roleplay_meta or build_roleplay_system_suffix_meta(settings, ask_mode)

        proton_attachment_text = ""
        proton_sources: list = []
        proton_notes_parts: list[str] = []
        want_proton_logs = (
            capability_enabled(settings, "steam_logs_read")
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
            _loop_pl = asyncio.get_running_loop()

            def _collect_logs() -> dict:
                return collect_proton_troubleshooting_logs(app_id)

            pl_result = await _loop_pl.run_in_executor(None, _collect_logs)
            proton_attachment_text = str(pl_result.get("text") or "")
            proton_sources = list(pl_result.get("sources") or [])
            for w in pl_result.get("warnings") or []:
                if isinstance(w, str) and w.strip():
                    proton_notes_parts.append(w.strip())
        elif (
            question_matches_troubleshooting_log_context(question_for_model)
            and bool(str(app_id or "").strip())
            and not capability_enabled(settings, "steam_logs_read")
        ):
            proton_notes_parts.append(
                "Proton log excerpts skipped: enable Read game & screenshot context in Permissions."
            )

        proton_log_transparency = build_proton_log_transparency(
            excerpt_attached=bool(proton_attachment_text.strip()),
            sources=proton_sources,
            notes="; ".join(proton_notes_parts),
        )

        shortcut_name = ""
        for attachment in atts:
            if isinstance(attachment, dict):
                hint = lookup_screenshot_vdf_metadata(str(attachment.get("path", "") or ""))
                sn = str(hint.get("shortcut_name", "") or "").strip()
                if sn:
                    shortcut_name = sn
                    break

        kb_coverage_transparency = kb_coverage_to_transparency(
            summarize_kb_coverage(
                settings,
                app_id=app_id,
                app_name=app_name,
                shortcut_name=shortcut_name,
            )
        )

        kb_transparency = build_knowledge_base_transparency(
            attached=False,
            trust_tier="",
            sources=[],
            notes="",
            timing_ms={},
            kb_domain="",
        )
        kb_text = ""
        kb_result = None
        kb_survived = False
        should_kb, kb_domain = should_retrieve_knowledge(
            use_local_knowledge_base=settings.get("use_local_knowledge_base") is True,
            ask_mode=ask_mode,
            question=question_for_retrieval,
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
                    question=question_for_retrieval,
                    app_id=app_id,
                    app_name=app_name,
                    shortcut_name=shortcut_name,
                    domain=kb_domain,
                    pc_ip=pc_ip,
                )

            _loop_kb = asyncio.get_running_loop()
            kb_result = await _loop_kb.run_in_executor(None, _retrieve_kb)
            if kb_result.attached:
                kb_text = kb_result.text_block

        # Everything from here to the ask_ollama call is context assembly: stacking the blocks
        # against the budget, genre lookup, spoiler-risk signals, TDP grounding. None of it
        # published anything before, so on an Ask with no Proton logs and no KB hit this was the
        # first stretch where the line simply sat there.
        if isinstance(active_rid, int) and hasattr(plugin, "_publish_thinking_phase_key"):
            plugin._publish_thinking_phase_key(
                active_rid,
                "building_context",
                app_name=app_name,
                attachment_count=len(atts),
                ask_mode=ask_mode,
                question=question_for_model,
                character_enabled=bool(settings.get("ai_character_enabled")),
                character_preset_id=rp_meta.resolved_preset_id,
            )

        stacked = stack_context_blocks(
            proton_text=proton_attachment_text,
            knowledge_text=kb_text,
        )
        early_context_combined = stacked.text

        # Built *after* stacking, deliberately. Proton logs take budget first and can be
        # capped at 96 KiB against a 100 KiB ceiling, so recording attached=True straight off
        # the retrieval result let transparency claim the knowledge base was attached — and
        # cite its sources — on turns where the block never reached the model at all.
        if kb_result is not None:
            kb_survived = kb_result.attached and stacked.knowledge_attached
            starved = kb_result.attached and not stacked.knowledge_attached
            kb_transparency = build_knowledge_base_transparency(
                attached=kb_survived,
                trust_tier=kb_result.trust_tier if kb_survived else "",
                sources=kb_result.sources if kb_survived else [],
                notes="dropped_by_context_budget" if starved else kb_result.notes,
                timing_ms=kb_result.timing_ms,
                unavailable_reason=kb_result.unavailable_reason,
                retrieval_method=kb_result.retrieval_method,
                kb_domain=kb_domain,
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
        strategy_spoiler_game_genres = lookup_game_genres(settings, app_id)
        strategy_spoiler_asked_entity = extract_strategy_asked_entity(question_for_model)
        strategy_spoiler_kb_entity_match = kb_text_covers_asked_entity(
            kb_text, strategy_spoiler_asked_entity
        )
        kb_survived = kb_result is not None and kb_result.attached and stacked.knowledge_attached
        strategy_domain_guidance = ask_mode == "strategy" or (
            kb_domain == "strategy" and kb_survived
        )
        if strategy_domain_guidance:
            strategy_spoiler_consent_effective = bool(spoiler_consent) or user_consents_strategy_spoilers(
                question_for_model
            )

        spoiler_risk_signals = build_spoiler_risk_signals(
            ask_mode=ask_mode,
            app_id=app_id,
            question=question_for_model,
            game_genres=strategy_spoiler_game_genres,
            kb_text=kb_text,
            asked_entity=strategy_spoiler_asked_entity,
            kb_entity_match=strategy_spoiler_kb_entity_match,
            title_profile=resolve_title_spoiler_profile(app_id, app_name),
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
            strategy_spoiler_asked_entity=strategy_spoiler_asked_entity,
            strategy_spoiler_kb_entity_match=strategy_spoiler_kb_entity_match,
            strategy_domain_guidance=strategy_domain_guidance,
            token_stream_request_id=token_stream_request_id,
            strategy_checklist_state=strategy_checklist_state,
            preferred_model=preferred_model,
        )
        elapsed = round(time.time() - start, 1)
        base_response_text = str(ollama_result.get("response", "") or "No response text.")
        response_text = base_response_text
        applied = None
        pyro_asshole = ollama_result.get("pyro_asshole_mode") is True

        if ollama_result.get("success"):
            loop = asyncio.get_running_loop()
            tmin, tmax, gmin, gmax = TDP_MIN_W, TDP_MAX_W, GPU_CLK_MIN_MHZ, GPU_CLK_MAX_MHZ

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
                # TDP/GPU suggestions are read-only — never write sysfs from Ask.
                logger.info("ask_game_ai: parsed TDP recommendation (suggestion-only): %s", rec)
                applied = {
                    "tdp_watts": None,
                    "gpu_clock_mhz": None,
                    "errors": [],
                    "suggestion": {
                        "tdp_watts": rec.get("tdp_watts"),
                        "gpu_clock_mhz": rec.get("gpu_clock_mhz"),
                    },
                }
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
                    **kb_coverage_transparency,
                    "tdp_cap_watts": pre_cap if tdp_grounding_requested else None,
                    "ask_mode": ask_mode,
                    "spoiler_risk_signals": spoiler_risk_signals,
                },
                base_response_text=base_response_text,
                response_text=response_text,
                applied=applied,
                app_id=app_id,
                app_name=app_name,
                pc_ip=pc_ip,
                err_tail=err_tail,
                elapsed_seconds=elapsed,
                reply_followup=reply_followup,
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
    except Exception as exc:
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
