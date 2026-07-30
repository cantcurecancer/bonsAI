"""Title: BonsAI stream tags

Purpose: Extract model-emitted ``<bonsai-status>`` tags from streaming Ollama replies.
Used for: Token streaming path — thinking summaries and phase toasts during pending Ask.
Solves: Parse incremental stream metadata without coupling HTTP layer to UI strings.
Does not: Own smooth stream reveal on the frontend — see useSmoothStreamReveal.
"""

from __future__ import annotations

import re
from typing import Literal, Optional, Tuple

from backend.services.ollama_prompts import (
    _user_asks_resolution_relevant_performance,
    question_matches_troubleshooting_log_context,
    user_asks_ollama_bonsai_host_or_latency,
    user_wants_power_or_performance_topic,
)
from refactor_helpers import is_current_tdp_read_intent

AskThinkingPhase = Literal[
    "starting",
    "proton_logs",
    "experiment_journal",
    "tdp_read",
    "screenshot_prep",
    "searching_kb",
    "building_context",
    "connecting_model",
    "model_retry",
]

_PHASE_MAX_LEN = 240
_APP_NAME_MAX_LEN = 40
_SNIPPET_MAX_LEN = 56
_BUILDING_CONTEXT_MAX_SECONDS = 1.0

_THINKING_TONE = Literal["neutral", "witty", "deadpan"]

_EMOJI_ONLY_LINES = ("🙄", "😮‍💨", "🫠", "🌳")

_BONSAI_STATUS_RE = re.compile(
    r"<bonsai-status>\s*(.*?)\s*</bonsai-status>",
    re.IGNORECASE | re.DOTALL,
)
_BONSAI_STATUS_OPEN = "<bonsai-status>"
_BONSAI_STATUS_CLOSE = "</bonsai-status>"

_LAZY_THINKING_OPENER_RE = re.compile(
    r"^\s*(?:"
    r"yeah\b[,!?.\s—–-]*"
    r"|fine\b[.\s—–-]*"
    r"|sure\b[.\s—–-]*"
    r"|oh joy\b[,!\s—–-]*"
    r"|right\b[.\s—–-]*"
    r")",
    re.IGNORECASE,
)


def sanitize_thinking_summary(text: str) -> str:
    """Strip lazy sarcastic openers (Yeah/Fine/Sure/…) from any thinking blurb source."""
    raw = (text or "").strip()
    if not raw:
        return raw
    cleaned = raw
    for _ in range(3):
        next_text = _LAZY_THINKING_OPENER_RE.sub("", cleaned, count=1).strip()
        if next_text == cleaned:
            break
        cleaned = next_text
    return cleaned if cleaned else raw


def _strip_incomplete_bonsai_status_open(raw: str) -> str:
    """Hide a still-streaming status tag (full open, partial `<bons…`, or broken `<bons you're…`)."""
    lower = raw.lower()
    open_idx = lower.find(_BONSAI_STATUS_OPEN)
    if open_idx >= 0:
        if _BONSAI_STATUS_CLOSE in lower[open_idx:]:
            return raw
        return raw[:open_idx].rstrip()
    # Tokens arrive as `<`, `<b`, `<bons`, … before the full opener exists.
    # Models also emit broken forms like `<bons you're asking…` (prefix then prose).
    lt = lower.rfind("<")
    if lt < 0:
        return raw
    target = "bonsai-status>"
    rest = lower[lt + 1 :]
    matched = 0
    for ch in rest:
        if matched < len(target) and ch == target[matched]:
            matched += 1
            continue
        # Diverged after matching at least "bons" → treat as broken status opener.
        if matched >= 4:
            return raw[:lt].rstrip()
        return raw
    # Exhausted input while still matching an incomplete opener (`<bons`, `<bonsai-stat`, …).
    if matched > 0:
        return raw[:lt].rstrip()
    return raw


def extract_bonsai_status(text: str) -> Tuple[Optional[str], str]:
    """Return (status_summary, text_with_status_tags_removed)."""
    raw = text or ""
    summary: Optional[str] = None
    stripped = raw
    while True:
        match = _BONSAI_STATUS_RE.search(stripped)
        if not match:
            break
        if summary is None:
            candidate = sanitize_thinking_summary((match.group(1) or "").strip())
            if candidate:
                summary = candidate[:240]
        stripped = _BONSAI_STATUS_RE.sub("", stripped, count=1).lstrip()
    stripped = _strip_incomplete_bonsai_status_open(stripped)
    stripped = re.sub(r"\n{3,}", "\n\n", stripped).strip()
    return summary, stripped


def _sanitize_app_name(app_name: str) -> str:
    """Truncate and strip control chars from game title for user-visible status lines."""
    raw = (app_name or "").strip()
    if not raw:
        return ""
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", raw)
    if len(cleaned) > _APP_NAME_MAX_LEN:
        return cleaned[: _APP_NAME_MAX_LEN - 1].rstrip() + "…"
    return cleaned


def extract_question_snippet(question: str, max_len: int = _SNIPPET_MAX_LEN) -> str:
    """First meaningful clause from the user question for status-line weaving."""
    raw = re.sub(r"\s+", " ", (question or "").strip())
    if not raw:
        return ""
    for sep in (". ", "? ", "! ", "; ", " — ", " - "):
        if sep in raw:
            raw = raw.split(sep, 1)[0].strip()
            break
    if len(raw) > max_len:
        return raw[: max_len - 1].rstrip() + "…"
    return raw


def _stable_bucket(request_id: int) -> int:
    rid = max(0, int(request_id or 0))
    return (rid * 2654435761) & 0x7FFFFFFF


def _resolve_thinking_tone(
    character_enabled: bool,
    character_preset_id: Optional[str],
) -> _THINKING_TONE:
    """Default witty sarcasm; deadpan when a deadpan character preset is active."""
    if not character_enabled:
        return "witty"
    from backend.services.ai_character_service import thinking_status_tone_for_preset

    tone = thinking_status_tone_for_preset(character_preset_id)
    return tone if tone in ("witty", "deadpan") else "witty"


def _pick_template(templates: list[str], request_id: int) -> str:
    if not templates:
        return "Working on your question…"
    idx = _stable_bucket(request_id) % len(templates)
    return templates[idx]


def _thinking_weave_bits(question: str, app_name: str) -> tuple[str, str, str]:
    """Return (quote, game_bit, game_title) for woven status lines."""
    snippet = extract_question_snippet(question)
    game_title = _sanitize_app_name(app_name)
    quote = f'"{snippet}"' if snippet else "your question"
    game_bit = f" in {game_title}" if game_title else ""
    return quote, game_bit, game_title


def _witty_generic_pool(quote: str, game_bit: str, game_title: str) -> list[str]:
    pool = [
        f"🔥🔥Another crisis 🔥🔥: {quote}. Give me a moment{game_bit}.",
        f"On it — {quote}{game_bit}…",
        f'"Fascinating" request: {quote}. Processing anyway.',
        f"Great. {quote}. Just what I needed{game_bit}.",
        f"Copy that. Wrestling with {quote}{game_bit}…",
        f"Noted. {quote}. I'll pretend this is exciting.",
        f"Standing by while I dig into {quote}{game_bit}…",
        f'Ticket received: {quote}. Filing it under "urgent to you."',
        f"Alright, alright — {quote}{game_bit}…",
        *_EMOJI_ONLY_LINES,
    ]
    if game_title:
        pool.extend(
            [
                f"Still struggling with {game_title}?",
                f"Back to wrestling with {game_title}…",
                f"{game_title} again? Alright…",
                f"Having a moment with {game_title}, I see.",
            ]
        )
    return pool


def _deadpan_generic_pool(quote: str, game_bit: str, game_title: str) -> list[str]:
    pool = [
        f"{quote}. Acknowledged{game_bit}.",
        f"Processing {quote}{game_bit}. No enthusiasm detected.",
        f"Working on {quote}. Try not to interrupt.",
        f"{quote}{game_bit}. Inevitably.",
        f"Examining {quote}. Results pending.",
        f"Request logged: {quote}. Continuing.",
        *_EMOJI_ONLY_LINES,
    ]
    if game_title:
        pool.extend(
            [
                f"{game_title}. Again.",
                f"Still {game_title}. Noted.",
                f"Resuming {game_title}. Proceeding.",
            ]
        )
    return pool


def _witty_screenshot_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Staring at your screenshot for {quote}…",
        f"Squinting at pixels for {quote}{game_bit}…",
        f"Let me decode this screenshot about {quote}…",
        f"Your screenshot and {quote} — delightful{game_bit}.",
        f"Comparing the capture to {quote}{game_bit}…",
        "🫠",
    ]


def _deadpan_screenshot_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Screenshot received for {quote}. Analyzing.",
        f"Visual input noted. Relating to {quote}.",
        f"Image attached. Context: {quote}{game_bit}.",
        f"Processing visual data for {quote}.",
        f"Screenshot queued for {quote}{game_bit}.",
        "🌳",
    ]


def _witty_troubleshooting_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Log-diving for {quote}{game_bit}. Try not to enjoy this.",
        f"Proton archaeology on {quote} — my favorite hobby{game_bit}.",
        f"Cross-referencing crash vibes with {quote}{game_bit}…",
        f"Someone said {quote}? Time to read logs{game_bit}.",
        f"Tracing {quote} through the wreckage{game_bit}…",
        "😮‍💨",
    ]


def _deadpan_troubleshooting_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Reading logs for {quote}{game_bit}. Standard procedure.",
        f"Proton log scan: {quote}. Proceeding.",
        f"Crash context for {quote}{game_bit}. No commentary.",
        f"Host/latency check on {quote}. As requested.",
        f"Diagnostic pass for {quote}{game_bit}.",
        "🙄",
    ]


def _witty_power_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Watts, frames, regrets — {quote}{game_bit}…",
        f"TDP theater for {quote}. Curtain up{game_bit}.",
        f"Benchmarking my patience with {quote}{game_bit}…",
        f"Power math on {quote}. Hold the applause{game_bit}.",
        f"Thermal feelings about {quote}{game_bit}…",
        "🙄",
    ]


def _deadpan_power_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"TDP read for {quote}{game_bit}. Expect numbers.",
        f"Power context: {quote}. Collecting.",
        f"Performance data for {quote}{game_bit}.",
        f"Wattage inquiry noted: {quote}.",
        f"Sysfs peek for {quote}{game_bit}.",
        "🌳",
    ]


def _witty_resolution_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Resolution roulette for {quote}{game_bit}…",
        f"FPS fantasies vs {quote} — let's see{game_bit}.",
        f"Graphics settings guilt trip: {quote}{game_bit}.",
        f"Balancing pixels and battery on {quote}…",
        f"FSR prayer circle for {quote}{game_bit}.",
        "🫠",
    ]


def _deadpan_resolution_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Graphics settings review: {quote}{game_bit}.",
        f"FPS/resolution analysis for {quote}.",
        f"Display tradeoffs on {quote}{game_bit}.",
        f"Settings pass: {quote}.",
        f"Frame pacing review: {quote}{game_bit}.",
        "😮‍💨",
    ]


def _witty_strategy_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Strategy mode: {quote}{game_bit} — spoilers locked.",
        f"Scouting {quote} without ruining the surprise{game_bit}…",
        f"Puzzle patrol on {quote}. Minimal hints{game_bit}.",
        f"Map in my head for {quote}{game_bit}…",
        f"Boss? What boss? Just {quote}{game_bit}.",
        "🌳",
    ]


def _deadpan_strategy_pool(quote: str, game_bit: str) -> list[str]:
    return [
        f"Strategy notes for {quote}{game_bit}. Spoiler-safe.",
        f"Guide lookup: {quote}. No plot leaks.",
        f"Tactical review of {quote}{game_bit}.",
        f"Puzzle context: {quote}. Restricted detail.",
        f"Spoiler-free pass on {quote}{game_bit}.",
        "🙄",
    ]


def _resolve_compose_intent(question: str, ask_mode: str, has_shot: bool) -> str:
    if question_matches_troubleshooting_log_context(question) or user_asks_ollama_bonsai_host_or_latency(
        question
    ):
        return "troubleshooting"
    if is_current_tdp_read_intent(question) or user_wants_power_or_performance_topic(question):
        return "power"
    if _user_asks_resolution_relevant_performance(question):
        return "resolution"
    if ask_mode == "strategy":
        return "strategy"
    if has_shot:
        return "screenshot"
    return "generic"


def _compose_intent_pool(intent: str, tone: _THINKING_TONE, quote: str, game_bit: str, game_title: str) -> list[str]:
    if tone == "deadpan":
        if intent == "troubleshooting":
            return _deadpan_troubleshooting_pool(quote, game_bit)
        if intent == "power":
            return _deadpan_power_pool(quote, game_bit)
        if intent == "resolution":
            return _deadpan_resolution_pool(quote, game_bit)
        if intent == "strategy":
            return _deadpan_strategy_pool(quote, game_bit)
        if intent == "screenshot":
            return _deadpan_screenshot_pool(quote, game_bit)
        return _deadpan_generic_pool(quote, game_bit, game_title)
    if intent == "troubleshooting":
        return _witty_troubleshooting_pool(quote, game_bit)
    if intent == "power":
        return _witty_power_pool(quote, game_bit)
    if intent == "resolution":
        return _witty_resolution_pool(quote, game_bit)
    if intent == "strategy":
        return _witty_strategy_pool(quote, game_bit)
    if intent == "screenshot":
        return _witty_screenshot_pool(quote, game_bit)
    return _witty_generic_pool(quote, game_bit, game_title)


def _phase_pool(
    phase: AskThinkingPhase,
    tone: _THINKING_TONE,
    *,
    quote: str,
    game_bit: str,
    attachment_count: int = 0,
    still_building: bool = False,
) -> list[str]:
    if still_building:
        if tone == "deadpan":
            return [
                f"Still preparing {quote}{game_bit}.",
                f"Context load: {quote}. Ongoing.",
                f"Assembly continues: {quote}.",
                f"Still working on {quote}{game_bit}.",
                "🌳",
            ]
        return [
            f"Still wrestling {quote}{game_bit}. Almost…",
            f"Context isn't instant: {quote}…",
            f"Bear with me on {quote}{game_bit}.",
            f"Still loading the drama around {quote}…",
            "🫠",
        ]

    if phase == "proton_logs":
        if tone == "deadpan":
            return [
                f"Proton logs: {quote}{game_bit}. Reading.",
                f"Log excerpt search for {quote}.",
                f"Crash log correlation: {quote}{game_bit}.",
                f"Log scan in progress: {quote}.",
                "🙄",
            ]
        return [
            f"Log spelunking for {quote}{game_bit}. Glamorous.",
            f"Proton logs vs {quote} — fight!{game_bit}",
            f"Reading crash tea leaves in {quote}{game_bit}…",
            f"Journal of pain: {quote}{game_bit}.",
            "😮‍💨",
        ]

    if phase == "experiment_journal":
        if tone == "deadpan":
            return [
                f"Proton journal: {quote}{game_bit}. Loading.",
                f"Experiment log for {quote}. Retrieved.",
                f"Historical Proton data: {quote}{game_bit}.",
                f"Prior experiments for {quote}.",
                "🌳",
            ]
        return [
            f"Your Proton diary and {quote}{game_bit} — page turner.",
            f"Experiment history meet {quote}{game_bit}…",
            f"Prior Proton swings at {quote}{game_bit}.",
            f"Flashback montage for {quote}…",
            "🙄",
        ]

    if phase == "tdp_read":
        if tone == "deadpan":
            return [
                f"Current TDP for {quote}{game_bit}. Querying.",
                f"Power limits: {quote}. Reading.",
                f"Wattage snapshot for {quote}{game_bit}.",
                f"TDP inquiry: {quote}.",
                "🌳",
            ]
        return [
            f"How many watts is {quote} worth{game_bit}?",
            f"TDP peek for {quote}. Brace{game_bit}.",
            f"Power meter on {quote}{game_bit}…",
            f"Thermal interrogation: {quote}{game_bit}.",
            "🫠",
        ]

    if phase == "searching_kb":
        if tone == "deadpan":
            return [
                f"Searching knowledge base for {quote}{game_bit}.",
                f"Local knowledge lookup: {quote}.",
                f"Offline strategy notes for {quote}{game_bit}.",
                f"Knowledge base query: {quote}.",
                "🙄",
            ]
        return [
            f"Searching knowledge base for {quote}{game_bit}.",
            f"Looking up strategy notes on {quote}…",
            f"Checking offline cards for {quote}{game_bit}.",
            f"Pulling local tips about {quote}…",
            "🌳",
        ]

    if phase == "screenshot_prep":
        n = max(0, int(attachment_count or 0))
        if n > 1:
            if tone == "deadpan":
                return [
                    f"Preparing {n} screenshots for {quote}.",
                    f"{n} images queued for {quote}{game_bit}.",
                    f"Batch visual prep: {quote}.",
                    f"{n} captures for {quote}{game_bit}.",
                    "🌳",
                ]
            return [
                f"Sorting {n} screenshots for {quote}{game_bit}.",
                f"{n} images, one question: {quote}.",
                f"Gallery night for {quote}{game_bit}.",
                f"Stacking {n} proofs of {quote}…",
                "🫠",
            ]
        if tone == "deadpan":
            return [
                f"Screenshot prep for {quote}{game_bit}.",
                f"Visual attach: {quote}. Processing.",
                f"Image pipeline for {quote}{game_bit}.",
                f"Capture queued: {quote}.",
                "🙄",
            ]
        return [
            f"Polishing pixels for {quote}{game_bit}.",
            f"Screenshot runway for {quote} — cleared{game_bit}.",
            f"Loading your proof of {quote}…",
            f"Attaching evidence of {quote}{game_bit}.",
            "😮‍💨",
        ]

    if phase == "building_context":
        if tone == "deadpan":
            return [
                f"Building context for {quote}{game_bit}.",
                f"Context assembly: {quote}.",
                f"Gathering facts for {quote}{game_bit}.",
                f"Context pass on {quote}.",
                "🌳",
            ]
        return [
            f"Gathering intel on {quote}{game_bit}…",
            f"Context assembly for {quote} — riveting{game_bit}.",
            f"Collecting breadcrumbs for {quote}…",
            f"Background work on {quote}{game_bit}.",
            "🙄",
        ]

    if phase == "connecting_model":
        if tone == "deadpan":
            return [
                f"Connecting for {quote}{game_bit}.",
                f"Model connection: {quote}.",
                f"Handshake for {quote}{game_bit}.",
                f"Linking model to {quote}.",
                "🌳",
            ]
        return [
            f"Dialing the model about {quote}{game_bit}…",
            f"Handshake time for {quote}. Deep breath{game_bit}.",
            f"Waking the neurons for {quote}…",
            f"Pinging brains for {quote}{game_bit}.",
            "🫠",
        ]

    if phase == "model_retry":
        if tone == "deadpan":
            return [
                f"Retrying models for {quote}{game_bit}.",
                f"Alternate model for {quote}.",
                f"Fallback chain: {quote}{game_bit}.",
                f"Second attempt on {quote}.",
                "🙄",
            ]
        return [
            f"Plan B for {quote}{game_bit}. Typical.",
            f"Another model, same {quote}. Joy{game_bit}.",
            f"Fallback round on {quote}…",
            f"Round two for {quote}{game_bit}.",
            "😮‍💨",
        ]

    if tone == "deadpan":
        return [f"Working on {quote}{game_bit}.", f"Processing {quote}.", "🌳"]
    return [f"Working on {quote}{game_bit}…", f"On it — {quote}{game_bit}…", "🙄"]


def compose_thinking_blurb(
    question: str,
    *,
    app_name: str = "",
    attachment_count: int = 0,
    ask_mode: str = "speed",
    request_id: int = 0,
    character_enabled: bool = False,
    character_preset_id: Optional[str] = None,
    elapsed_seconds: float = 0.0,
) -> str:
    """Instant, question-woven pending status (Tier A composer — no extra model call)."""
    del elapsed_seconds  # kept for API parity; selection is request_id-only
    quote, game_bit, game_title = _thinking_weave_bits(question, app_name)
    has_shot = int(attachment_count or 0) > 0
    tone = _resolve_thinking_tone(character_enabled, character_preset_id)
    intent = _resolve_compose_intent(question, ask_mode, has_shot)
    pool = _compose_intent_pool(intent, tone, quote, game_bit, game_title)
    text = _pick_template(pool, request_id)
    return text[:_PHASE_MAX_LEN]


def format_thinking_phase(
    phase: AskThinkingPhase,
    *,
    app_name: str = "",
    attachment_count: int = 0,
    ask_mode: str = "speed",
    elapsed_seconds: float = 0.0,
    question: str = "",
    request_id: int = 0,
    character_enabled: bool = False,
    character_preset_id: Optional[str] = None,
) -> str:
    """Build a deterministic, context-aware status line for pending Ask phases."""
    woven_q = (question or "").strip()
    if woven_q:
        if phase == "starting":
            return compose_thinking_blurb(
                woven_q,
                app_name=app_name,
                attachment_count=attachment_count,
                ask_mode=ask_mode,
                request_id=request_id,
                character_enabled=character_enabled,
                character_preset_id=character_preset_id,
                elapsed_seconds=elapsed_seconds,
            )
        quote, game_bit, _game_title = _thinking_weave_bits(woven_q, app_name)
        tone = _resolve_thinking_tone(character_enabled, character_preset_id)
        still_building = phase == "building_context" and elapsed_seconds > _BUILDING_CONTEXT_MAX_SECONDS
        pool = _phase_pool(
            phase,
            tone,
            quote=quote,
            game_bit=game_bit,
            attachment_count=attachment_count,
            still_building=still_building,
        )
        text = _pick_template(pool, request_id)
        return text[:_PHASE_MAX_LEN]

    if phase == "building_context" and elapsed_seconds > _BUILDING_CONTEXT_MAX_SECONDS:
        return "Still preparing…"[:_PHASE_MAX_LEN]
    game = _sanitize_app_name(app_name)
    game_clause = f" for {game}" if game else ""

    if phase == "starting":
        text = "Starting…"
    elif phase == "proton_logs":
        text = f"Reading Proton logs{game_clause}…" if game else "Reading Proton logs…"
    elif phase == "experiment_journal":
        text = f"Loading Proton journal{game_clause}…" if game else "Loading Proton journal…"
    elif phase == "tdp_read":
        text = "Checking current power limits…"
    elif phase == "searching_kb":
        text = f"Searching knowledge base{game_clause}…" if game else "Searching knowledge base…"
    elif phase == "screenshot_prep":
        n = max(0, int(attachment_count or 0))
        if n <= 1:
            text = "Preparing screenshot…"
        else:
            text = f"Preparing {n} screenshots…"
    elif phase == "building_context":
        text = f"Building context{game_clause}…" if game else "Building context…"
    elif phase == "connecting_model":
        text = "Connecting to model…"
    elif phase == "model_retry":
        text = "Trying another model…"
    else:
        text = "Working…"

    return text[:_PHASE_MAX_LEN]


def deterministic_thinking_phase_fallback(
    *,
    streaming: bool,
    has_partial: bool,
    elapsed_seconds: float,
) -> str:
    """Phase label when the model did not emit ``<bonsai-status>``."""
    if streaming and has_partial:
        return "Drafting your masterpiece…"
    if elapsed_seconds >= 8:
        return "Still here. Still thinking…"
    if elapsed_seconds >= 2:
        return "Pretending this is hard…"
    return "Warming up the brain cells…"
