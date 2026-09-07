"""Title: Knowledge-base attribution notices

Purpose: Output-side notes telling the user a reply came from the model's own training
knowledge rather than the local knowledge base -- one pair for the notes (Strategy/Expert
only), one pair for the tip sheet (any Ask mode).
Used for: Post-generation step in run_game_ai_request (game_ai_request.py), run once the KB
attach/coverage/domain signals for the turn are known -- alongside the destructive-advice safety
notice this copies the shape of.
Solves: Without these, a reply built entirely from the model's general knowledge read
identically to one grounded in a note or a tip, so the player had no way to tell which kind of
answer they were looking at.
Does not: Decide whether to run the knowledge-base search, judge answer quality, or change what
was asked. It only reads signals the retrieval step already produced -- `kb_attached` (did
something actually reach the model this turn), `kb_coverage_status` (does the corpus have
strategy notes for this game at all), `kb_domain` (was this turn routed to the notes or the tip
sheet), `kb_unavailable_reason` and `kb_notes` (why nothing attached) -- and appends one fixed
line per case. See destructive_advice_guard.py for the sibling check/append pair this mirrors.
The call site decides which of the two lines below wins when both would otherwise fire; see the
comment at that call site in game_ai_request.py.
"""

from __future__ import annotations

# Wording decided 1 September, locked 2026-09-07 -- do not reword without the same process.
_NOT_IN_NOTES_LINE = "Not in my notes — this answer is from the model's own knowledge."

# Same footer shape as destructive_advice_guard._NOTICE (blank line, rule, then the line) but
# italic rather than bold: this is a quiet attribution note, not a safety warning.
_NOTICE = f"\n\n—\n*{_NOT_IN_NOTES_LINE}*"

# Strategy and Expert are the only Ask modes that declare themselves an explicit game ask (see
# `_DECLARED_GAME_ASK_MODES` in knowledge_base_service.py). Speed never shows this line even on
# a turn where the other two signals would otherwise qualify.
_ELIGIBLE_ASK_MODES = frozenset({"strategy", "expert"})

# `summarize_kb_coverage` (knowledge_base_service.py) returns this status only when the corpus
# has strategy sections for the resolved game. Its other statuses -- kb_off, corpus_missing,
# no_app, no_sections, app_unresolved, corpus_error (see transparency_service.py's
# kb_coverage_chip_label) -- all mean the game is not covered, or the library is off, or nothing
# is running, so none of them should show this line.
_COVERED_STATUS = "sections"


def should_show_not_in_notes_notice(
    *, ask_mode: str, kb_attached: bool, kb_coverage_status: str
) -> bool:
    """True when the notes cover this game but nothing in them matched the question this turn.

    ``kb_attached`` is `build_knowledge_base_transparency`'s `kb_attached` field -- whether a
    note actually reached the model. ``kb_coverage_status`` is
    `kb_coverage_to_transparency`'s `kb_coverage_status` field -- whether the corpus has
    anything for this game at all. Both are already computed once per turn in
    run_game_ai_request; this just reads them.
    """
    mode = (ask_mode or "").strip().lower()
    if mode not in _ELIGIBLE_ASK_MODES:
        return False
    if kb_attached:
        return False
    return kb_coverage_status == _COVERED_STATUS


def append_not_in_notes_notice(response_text: str, should_show: bool) -> str:
    """Append the fixed attribution line when `should_show`; unchanged otherwise.

    Appends after whatever is already in `response_text` -- including a destructive-advice
    safety notice, if one was appended first -- so the two footers stack in the order their
    callers add them rather than this function reordering anything.
    """
    if not should_show:
        return response_text
    return (response_text or "").rstrip() + _NOTICE


# --- "No tip for this" (D86 lane F, 2026-09-07) ---------------------------------------------
#
# Same shape as the notice above, for the other half of the corpus: a turn routed to the tip
# sheet (`kb_domain == "compat"`, `should_retrieve_knowledge`'s troubleshooting branch) where
# nothing attached. Wording decided in the wave-three plan; do not reword without the same
# process the sibling line above used.
_NO_TIP_FOR_THIS_LINE = "No tip for this — this answer is from the model's own knowledge."

_NO_TIP_NOTICE = f"\n\n—\n*{_NO_TIP_FOR_THIS_LINE}*"

# `should_retrieve_knowledge` (knowledge_base_service.py) returns this domain only for a
# troubleshooting-shaped question -- a game running (or named) is not required, unlike the
# notes' `_COVERED_STATUS` check above. It is never "compat" while the local knowledge base
# setting is off, so checking the domain alone already keeps this line off in that case; the
# `kb_unavailable_reason` check below covers the other "never" case the brief names, a missing
# corpus.
_COMPAT_DOMAIN = "compat"

# `run_game_ai_request` (game_ai_request.py) writes this exact string into `kb_notes` when a
# compat card was found and scored, but the context budget cut it before it reached the model --
# a real tip existed for this turn, it just did not fit. That is a different fact from "no tip
# fit", so it must not trigger this line.
_BUDGET_DROPPED_NOTE = "dropped_by_context_budget"

# The floor lane C is building (D87, knowledge_base_service.py) stamps `kb_notes` with this
# exact prefix when it decided nothing in the routed candidate pool was a real match. It is not
# tested for separately below: once that lane lands, a compat turn where it fired is *also* a
# compat turn with nothing attached and no budget-dropped tip, so the broader checks below
# already return True for it. Kept as a named constant so the two are visibly meant to line up,
# and so a later, stricter reading of this line (requiring the floor's own verdict rather than
# the broader "nothing attached" signal) has something to key off without re-deriving it.
_FLOOR_REJECTED_NOTE_PREFIX = "routed_nothing_fit"


def should_show_no_tip_for_this_notice(
    *, kb_attached: bool, kb_domain: str, kb_unavailable_reason: str = "", kb_notes: str = ""
) -> bool:
    """True when this turn was routed to the tip sheet and nothing from it reached the model.

    ``kb_domain`` is `build_knowledge_base_transparency`'s `kb_domain` field. ``kb_attached`` is
    the same field's `kb_attached`. ``kb_unavailable_reason`` and ``kb_notes`` are that same
    dict's fields, read only to rule out a missing corpus and a budget-dropped tip -- see the
    module comments above for what each rules out. All four are already computed once per turn
    in run_game_ai_request; this just reads them.

    This already fires correctly once lane C's floor lands and starts writing
    "routed_nothing_fit (...)" into ``kb_notes`` for a floor-rejected turn -- that case is a
    compat turn with nothing attached and no budget-dropped tip, which the checks below already
    catch. Until it lands, the same checks catch the plainer "no_hit (...)" case instead, which
    reads the same to a person: nothing from the tip sheet reached them.
    """
    if kb_attached:
        return False
    if (kb_domain or "").strip().lower() != _COMPAT_DOMAIN:
        return False
    if (kb_unavailable_reason or "").strip():
        return False
    if (kb_notes or "").strip() == _BUDGET_DROPPED_NOTE:
        return False
    return True


def append_no_tip_for_this_notice(response_text: str, should_show: bool) -> str:
    """Append the fixed "no tip for this" line when `should_show`; unchanged otherwise.

    Same stacking rule as `append_not_in_notes_notice`: appends after whatever is already in
    `response_text`, in whichever order the caller adds the footers.
    """
    if not should_show:
        return response_text
    return (response_text or "").rstrip() + _NO_TIP_NOTICE
