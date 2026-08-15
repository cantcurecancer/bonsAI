"""Title: Ollama Ask token budgets

Purpose: Per-mode visible ``num_predict`` caps plus reserved thinking budgets (C1).
Used for: ``post_ollama_chat`` request options; future Thinking effort control wiring.
Solves: Split visible vs thinking token budgets so ``think`` can be enabled later without
empty replies when reasoning burns the whole wall.
Does not: Own soft-continue stitching or Settings UI for effort levels.
"""

from __future__ import annotations

from typing import Any, Optional, Union

# Visible reply budgets on the wire as ``options.num_predict`` when thinking is off.
# Keys MUST match ``Plugin.VALID_ASK_MODES`` in main.py. Nothing enforces that at import
# time, and a mismatch fails silently: ``normalize_ask_mode`` falls back to "speed", so the
# mode quietly runs on the Speed cap. This table shipped keyed "deep" -- the mode's pre-
# 2026-06-26 name -- so Expert ran on 800 instead of 1200 until 2026-08-15. Settings coerce
# legacy "deep" to "expert" on load (settings_service._sanitize_ask_mode), so "deep" never
# reaches here. Guarded by test_every_valid_ask_mode_has_its_own_cap.
ASK_VISIBLE_NUM_PREDICT: dict[str, int] = {
    "speed": 800,
    "expert": 1200,
    "strategy": 1600,
}

# Reserved thinking-token budgets for effort control (Phase 1). While effort is ``off``,
# these are not added to ``num_predict`` and ``think`` stays false on the wire.
ASK_THINKING_BUDGET: dict[str, int] = {
    "off": 0,
    "low": 256,
    "medium": 512,
    "high": 1024,
}

ASK_MAX_SOFT_CONTINUES = 2

# Ephemeral stream-tail cue while a soft continue is in flight. Never persist in the
# final reply / history / copy path — strip before finalize.
SOFT_CONTINUE_CUE = "Continuing…"

SOFT_CONTINUE_USER_MESSAGE = (
    "Continue the answer from where you left off. Do not repeat text already written."
)

ThinkWire = Union[bool, str]


def normalize_ask_mode(ask_mode: Optional[str]) -> str:
    mode = str(ask_mode or "speed").strip().lower()
    if mode in ASK_VISIBLE_NUM_PREDICT:
        return mode
    return "speed"


def normalize_think_effort(think_effort: Optional[str]) -> str:
    effort = str(think_effort or "off").strip().lower()
    if effort in ASK_THINKING_BUDGET:
        return effort
    return "off"


def resolve_ask_token_budgets(
    ask_mode: Optional[str] = "speed",
    *,
    think_effort: Optional[str] = "off",
) -> dict[str, Any]:
    """Resolve wire ``num_predict`` / ``think`` plus the C1 split for later effort control.

    Bug v1 callers pass ``think_effort=\"off\"`` (default): ``think`` is false and
    ``num_predict`` equals the visible cap only. When effort is low/medium/high,
    ``num_predict`` is visible + thinking so the visible channel is not starved.
    """
    mode = normalize_ask_mode(ask_mode)
    effort = normalize_think_effort(think_effort)
    visible = int(ASK_VISIBLE_NUM_PREDICT[mode])
    thinking = int(ASK_THINKING_BUDGET[effort])
    think_wire: ThinkWire = False if effort == "off" else effort
    return {
        "ask_mode": mode,
        "think_effort": effort,
        "visible_num_predict": visible,
        "thinking_budget": thinking,
        "num_predict": visible + thinking,
        "think": think_wire,
        "max_continues": ASK_MAX_SOFT_CONTINUES,
    }


def strip_soft_continue_cue(text: str) -> str:
    """Remove a trailing ephemeral continue cue from streamed or final text."""
    raw = str(text or "")
    if not raw:
        return raw
    trimmed = raw.rstrip()
    if trimmed.endswith(SOFT_CONTINUE_CUE):
        return trimmed[: -len(SOFT_CONTINUE_CUE)].rstrip()
    return raw
