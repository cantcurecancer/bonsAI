"""Title: Knowledge-base attribution notice

Purpose: Output-side note telling the user a Strategy/Expert reply came from the model's own
training knowledge, not the local knowledge base, on a turn where the corpus covers the game
but nothing in it matched the question.
Used for: Post-generation step in run_game_ai_request (game_ai_request.py), run once the KB
attach/coverage signals for the turn are known -- alongside the destructive-advice safety
notice this copies the shape of.
Solves: Without this, a Strategy or Expert reply built entirely from the model's general
knowledge read identically to one grounded in a note, so the player had no way to tell which
kind of answer they were looking at.
Does not: Decide whether to run the knowledge-base search, judge answer quality, or change what
was asked. It only reads the two signals the retrieval step already produced --
`kb_attached` (did a note actually reach the model this turn) and `kb_coverage_status` (does the
corpus have anything for this game at all) -- and appends one fixed line when they say "covered
game, no match". See destructive_advice_guard.py for the sibling check/append pair this mirrors.
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
