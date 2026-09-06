#!/usr/bin/env python3
"""Title: Knowledge-base answer eval

Purpose: Measure what the Deck's own model writes FROM the cards, not whether the cards were
         found. Runs the real Ask pipeline (``run_game_ai_request`` -> retrieval -> prompt ->
         Ollama -> fence parsing -> safety guard) on the maintainer PC with the Deck's model tag,
         and scores each reply with four judge-free checks per fixture case:
         facts kept (``must_mention``), nothing the card contradicts (``must_not_say``), spoiler
         fence only where the rules allow (``expect_fence``), and a Strategy first turn ending
         with the branch menu (``expect_branches``). Decision D45.
Used for: docs/testing.md row KB-ANSWER-01; the before/after gate for every prompt change in
          docs/planning/30-kb-answer-quality-plan.md (W4 prompt diet, W6 spoiler tiers, D54).
Solves: The search half of the knowledge base is measured to the decimal
        (scripts/eval_kb_embed_models.py); the answer half had one on-Deck data point. Every
        prompt edit so far shipped on feel.
Does not: Judge with a second model, touch the Deck, or write settings anywhere except its own
          work directory. Sampling is stochastic at the shipped temperature, so it runs each case
          several times and reports rates, never a single verdict.

Usage:
  python scripts/eval_kb_answers.py                          # every case, 3 samples, baseline prompt
  python scripts/eval_kb_answers.py --only A-DRG-01 --samples 1
  python scripts/eval_kb_answers.py --label after-w4         # report suffix for a before/after pair
  python scripts/eval_kb_answers.py --no-write-report        # console only

Needs: Ollama on this PC with the Deck's chat model and ``nomic-embed-text`` pulled, and a built
corpus at --corpus (``python scripts/build_rag_db.py --seed --out ./build/knowledge-base``).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import sys
import time
import types
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Callable, Optional

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "py_modules"))

DEFAULT_OLLAMA = "http://127.0.0.1:11434"
DEFAULT_MODEL = "gemma4:e2b-it-qat"  # what the Deck loads (measured 2026-09-01)
DEFAULT_CORPUS = ROOT / "build" / "knowledge-base"
DEFAULT_FIXTURE = ROOT / "tests" / "fixtures" / "kb_answer_eval.json"
DEFAULT_WORK_DIR = ROOT / "build" / "kb-answer-eval" / "work"
REPORT_DIR = ROOT / "docs" / "archive" / "research"
JSON_DIR = ROOT / "build" / "kb-answer-eval"

SPOILER_FENCE_RE = re.compile(r"```\s*bonsai-spoiler", re.I)
PAYLOAD_RE = re.compile(r"payload_bytes=(\d+)")
PROMPT_EVAL_RE = re.compile(r"prompt_eval=(\d+)")


# --- environment: the plugin outside Decky ----------------------------------------------------

class _ListHandler(logging.Handler):
    """Keeps every backend log line so a sample can read its own payload size afterwards."""

    def __init__(self) -> None:
        super().__init__()
        self.records: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        try:
            self.records.append(self.format(record))
        except Exception:  # pragma: no cover - logging must never break the run
            pass


def install_fake_decky(work_dir: Path) -> tuple[types.ModuleType, _ListHandler]:
    """Same stub the Python tests use, with real directories so the plugin can write."""
    if "fcntl" not in sys.modules:  # Windows has no fcntl; the plugin only uses flock()
        _fcntl = types.ModuleType("fcntl")
        _fcntl.LOCK_EX = 2
        _fcntl.LOCK_NB = 4
        _fcntl.LOCK_UN = 8
        _fcntl.flock = lambda *_a, **_k: False
        sys.modules["fcntl"] = _fcntl

    # Unix-only modules the plugin imports at module level (screenshot_media reads pwd for the
    # Deck user's home). The PC never reaches that code path, so an empty stub is enough.
    for name in ("pwd", "grp"):
        if name in sys.modules:
            continue
        try:
            __import__(name)
        except ImportError:
            stub = types.ModuleType(name)
            entry = types.SimpleNamespace(pw_name="deck", pw_dir=str(work_dir), pw_uid=1000, gr_name="deck")
            stub.getpwuid = lambda *_a, **_k: entry
            stub.getpwnam = lambda *_a, **_k: entry
            stub.getgrgid = lambda *_a, **_k: entry
            stub.getgrnam = lambda *_a, **_k: entry
            sys.modules[name] = stub

    settings_dir = work_dir / "settings"
    runtime_dir = work_dir / "runtime"
    log_dir = work_dir / "logs"
    for d in (settings_dir, runtime_dir, log_dir):
        d.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("bonsai-answer-eval")
    logger.setLevel(logging.INFO)
    logger.propagate = False
    for h in list(logger.handlers):
        logger.removeHandler(h)
    fmt = logging.Formatter("[%(asctime)s][%(levelname)s]: %(message)s")
    capture = _ListHandler()
    capture.setFormatter(fmt)
    logger.addHandler(capture)
    fh = logging.FileHandler(log_dir / "answer-eval.log", encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    decky = types.ModuleType("decky")
    decky.DECKY_PLUGIN_SETTINGS_DIR = str(settings_dir)
    decky.DECKY_PLUGIN_RUNTIME_DIR = str(runtime_dir)
    decky.DECKY_PLUGIN_LOG_DIR = str(log_dir)
    decky.HOME = str(work_dir)
    decky.logger = logger
    sys.modules["decky"] = decky
    return decky, capture


def write_harness_settings(settings_dir: Path, *, corpus_dir: Path, corpus_version: str, model: str) -> Path:
    """The settings.json the plugin will load. Everything else takes the fresh-install default."""
    payload = {
        "use_local_knowledge_base": True,
        "rag_corpus_path": str(corpus_dir),
        "rag_corpus_version": corpus_version,
        "text_model_routing_order": [model],
        "ai_character_enabled": False,
        "show_developer_tab": False,
        "input_sanitizer_user_disabled": False,
        "capabilities": {},
        # Gemma is open-weight, not OSI open source; the default tier (open_source_only) would
        # drop it and the routing fallback then picks whatever is installed first.
        "model_policy_tier": "open_weight",
    }
    path = settings_dir / "settings.json"
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return path


# --- prompt variants (hook for W4 / W6 / D54 experiments) ------------------------------------

PromptVariant = Callable[[str], str]


def _variant_baseline(prompt: str) -> str:
    return prompt


# The two fence-format sentences of the first-turn spoiler policy (ollama_prompts.py,
# _strategy_spoiler_policy_block). Sentence B is the prime suspect for the baseline misfires: a
# 2B model reads "every bonsai-spoiler block must appear above the branch fence" as a requirement
# that such a block exists, and fencing a harmless opening line satisfies it cheaply.
_FENCE_SENTENCE_A = (
    "Put unavoidably spoilery detail only inside ```bonsai-spoiler ... ``` fences "
    "(opening line exactly ```bonsai-spoiler).\n"
)
_FENCE_SENTENCE_B = (
    "On this first turn, every ```bonsai-spoiler block must appear **above** the opening "
    "```bonsai-strategy-branches line; the branch fence must still close the reply — no characters "
    "after its closing ```.\n"
)
_ENTITY_RE = re.compile(r"NAMED-ENTITY CONSENT: The user asked about “([^”]+)” by name")


def _variant_drop_fence_placement(prompt: str) -> str:
    """Experiment 1: remove only sentence B (the placement rule) on every first turn."""
    return prompt.replace(_FENCE_SENTENCE_B, "")


def _variant_fence_subtractive(prompt: str) -> str:
    """Experiment 2: on low-narrative and named-entity turns, replace both fence-format sentences
    with one plain 'do not fence' line; story-title turns with no entity are left unchanged."""
    low = "LOW-SPOILER-RISK CONTEXT:" in prompt
    m = _ENTITY_RE.search(prompt)
    if not low and not m:
        return prompt
    if low:
        line = (
            "Do not use ```bonsai-spoiler fences in this reply: nothing about this title's bosses, "
            "enemies or waves is a story spoiler.\n"
        )
    else:
        entity = m.group(1)
        line = (
            f"Do not put anything about “{entity}” inside a ```bonsai-spoiler fence. Only if you must "
            "mention a story event the user did not ask about, wrap that one thing in "
            "```bonsai-spoiler ... ``` and place it above the branch fence.\n"
        )
    out = prompt.replace(_FENCE_SENTENCE_A, line, 1)
    out = out.replace(_FENCE_SENTENCE_B, "")
    return out


VARIANTS: dict[str, PromptVariant] = {
    "baseline": _variant_baseline,
    "drop_fence_placement": _variant_drop_fence_placement,
    "fence_subtractive": _variant_fence_subtractive,
}


# --- fixture ---------------------------------------------------------------------------------

@dataclass
class Case:
    id: str
    app_id: str
    app_name: str
    ask_mode: str
    question: str
    expect_card: Optional[str]
    must_mention: list[list[str]]
    must_not_say: list[str]
    expect_fence: Optional[bool]
    expect_branches: Optional[bool]
    expect_attached: Optional[bool]
    note: str


def load_fixture(path: Path, only: Optional[set[str]]) -> list[Case]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    cases: list[Case] = []
    for row in raw.get("cases") or []:
        cid = str(row.get("id") or "")
        if only and cid not in only:
            continue
        cases.append(
            Case(
                id=cid,
                app_id=str(row.get("app_id") or ""),
                app_name=str(row.get("app_name") or ""),
                ask_mode=str(row.get("ask_mode") or "speed"),
                question=str(row.get("question") or ""),
                expect_card=row.get("expect_card") or None,
                must_mention=[[str(a) for a in group] for group in (row.get("must_mention") or [])],
                must_not_say=[str(s) for s in (row.get("must_not_say") or [])],
                expect_fence=row.get("expect_fence"),
                expect_branches=row.get("expect_branches"),
                expect_attached=row.get("expect_attached"),
                note=str(row.get("note") or ""),
            )
        )
    if only:
        missing = only - {c.id for c in cases}
        if missing:
            raise SystemExit(f"unknown case id(s): {', '.join(sorted(missing))}")
    return cases


# --- one sample ------------------------------------------------------------------------------

@dataclass
class SampleResult:
    case_id: str
    sample: int
    success: bool
    elapsed_s: float
    model: str
    reply: str
    kb_attached: bool
    cards: list[str]
    card_ok: Optional[bool]
    attached_ok: Optional[bool]
    mention_hits: list[bool]
    mention_ok: Optional[bool]
    notsay_hits: list[str]
    notsay_ok: Optional[bool]
    fence_present: bool
    fence_ok: Optional[bool]
    branches_present: bool
    branches_ok: Optional[bool]
    payload_bytes: Optional[int]
    prompt_eval_tokens: Optional[int]
    system_prompt_chars: Optional[int]
    error: str = ""
    system_prompt: str = field(default="", repr=False)

    @property
    def all_ok(self) -> bool:
        checks = [self.card_ok, self.attached_ok, self.mention_ok, self.notsay_ok, self.fence_ok, self.branches_ok]
        return self.success and all(c is not False for c in checks)


def _norm(text: str) -> str:
    t = (text or "").lower()
    t = t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    t = t.replace("—", "-").replace("–", "-")
    return " ".join(t.split())


def _card_short_names(headers: list[str]) -> list[str]:
    """``[Game / type: Name] (trust: tier)`` -> ``Name``."""
    out: list[str] = []
    for h in headers:
        m = re.match(r"^\[[^\]]*?:\s*(.+?)\]\s*\(trust:", h)
        out.append(m.group(1).strip() if m else h)
    return out


async def run_sample(
    plugin: Any,
    case: Case,
    *,
    sample_idx: int,
    ollama_base: str,
    retrieval_log: list[Any],
    capture: _ListHandler,
    kb_card_names: Callable[[str], list[str]],
    run_game_ai_request: Callable[..., Any],
) -> SampleResult:
    del retrieval_log[:]
    log_start = len(capture.records)
    snapshots: list[dict] = []

    async def _capture_snapshot(payload: Any) -> None:
        if isinstance(payload, dict):
            snapshots.append(payload)

    plugin._persist_input_transparency = _capture_snapshot  # instance attribute shadows the method

    t0 = time.perf_counter()
    try:
        result = await run_game_ai_request(
            plugin,
            case.question,
            ollama_base,
            case.app_id,
            case.app_name,
            None,
            case.ask_mode,
        )
        error = ""
    except Exception as exc:  # the pipeline swallows its own errors; this is harness breakage
        result = {"success": False, "response": ""}
        error = f"{type(exc).__name__}: {exc}"
    elapsed = round(time.perf_counter() - t0, 2)

    reply = str(result.get("response") or "")
    success = bool(result.get("success"))
    norm_reply = _norm(reply)

    kb_attached = False
    cards: list[str] = []
    if retrieval_log:
        kr = retrieval_log[-1]
        kb_attached = bool(getattr(kr, "attached", False))
        cards = _card_short_names(kb_card_names(getattr(kr, "text_block", "") or ""))

    card_ok: Optional[bool] = None
    if case.expect_card:
        want = _norm(case.expect_card)
        card_ok = any(want == _norm(c) for c in cards)
    attached_ok: Optional[bool] = None
    if case.expect_attached is not None:
        attached_ok = kb_attached == bool(case.expect_attached)

    mention_hits = [any(_norm(alt) in norm_reply for alt in group) for group in case.must_mention]
    mention_ok = all(mention_hits) if case.must_mention else None
    notsay_hits = [s for s in case.must_not_say if _norm(s) in norm_reply]
    notsay_ok = (not notsay_hits) if case.must_not_say else None

    fence_present = bool(SPOILER_FENCE_RE.search(reply))
    fence_ok = None if case.expect_fence is None else (fence_present == bool(case.expect_fence))
    branches_present = isinstance(result.get("strategy_guide_branches"), dict)
    branches_ok = None if case.expect_branches is None else (branches_present == bool(case.expect_branches))

    if not success:
        mention_ok = notsay_ok = fence_ok = branches_ok = None

    payload_bytes: Optional[int] = None
    prompt_eval: Optional[int] = None
    for line in capture.records[log_start:]:
        m = PAYLOAD_RE.search(line)
        if m:
            payload_bytes = int(m.group(1))
        m = PROMPT_EVAL_RE.search(line)
        if m:
            prompt_eval = int(m.group(1))

    system_prompt = ""
    for snap in snapshots:
        sp = snap.get("system_prompt")
        if isinstance(sp, str) and sp:
            system_prompt = sp
            break
    model = ""
    for snap in snapshots:
        for key in ("model", "model_succeeded", "ollama_model"):
            v = snap.get(key)
            if isinstance(v, str) and v:
                model = v
                break
        if model:
            break
    if not model:
        diag = None
        for snap in snapshots:
            diag = snap.get("ask_diagnostics")
            if isinstance(diag, dict):
                break
        if isinstance(diag, dict) and diag.get("model_succeeded"):
            model = str(diag.get("model_succeeded"))

    return SampleResult(
        case_id=case.id,
        sample=sample_idx,
        success=success,
        elapsed_s=elapsed,
        model=model,
        reply=reply,
        kb_attached=kb_attached,
        cards=cards,
        card_ok=card_ok,
        attached_ok=attached_ok,
        mention_hits=mention_hits,
        mention_ok=mention_ok,
        notsay_hits=notsay_hits,
        notsay_ok=notsay_ok,
        fence_present=fence_present,
        fence_ok=fence_ok,
        branches_present=branches_present,
        branches_ok=branches_ok,
        payload_bytes=payload_bytes,
        prompt_eval_tokens=prompt_eval,
        system_prompt_chars=len(system_prompt) if system_prompt else None,
        error=error,
        system_prompt=system_prompt,
    )


# --- aggregation -----------------------------------------------------------------------------

@dataclass
class Rate:
    hit: int = 0
    of: int = 0

    def add(self, ok: Optional[bool]) -> None:
        if ok is None:
            return
        self.of += 1
        if ok:
            self.hit += 1

    def pct(self) -> str:
        return "n/a" if not self.of else f"{100.0 * self.hit / self.of:.1f}%"

    def frac(self) -> str:
        return "n/a" if not self.of else f"{self.hit}/{self.of}"


@dataclass
class Summary:
    facts = Rate()
    contradictions_clean = Rate()
    fence_no_misfire = Rate()   # expect_fence False: fence absent
    fence_present_when_due = Rate()  # expect_fence True: fence present
    branches_when_due = Rate()  # expect_branches True
    branches_absent_when_not = Rate()  # expect_branches False
    card_attached = Rate()
    attached_control = Rate()
    success = Rate()
    cases_all_pass = Rate()

    def __init__(self) -> None:
        self.facts = Rate()
        self.contradictions_clean = Rate()
        self.fence_no_misfire = Rate()
        self.fence_present_when_due = Rate()
        self.branches_when_due = Rate()
        self.branches_absent_when_not = Rate()
        self.card_attached = Rate()
        self.attached_control = Rate()
        self.success = Rate()
        self.cases_all_pass = Rate()


def summarize(cases: list[Case], samples: list[SampleResult]) -> Summary:
    s = Summary()
    by_case: dict[str, list[SampleResult]] = {}
    for r in samples:
        by_case.setdefault(r.case_id, []).append(r)
    case_by_id = {c.id: c for c in cases}
    for r in samples:
        c = case_by_id[r.case_id]
        s.success.add(r.success)
        s.facts.add(r.mention_ok)
        s.contradictions_clean.add(r.notsay_ok)
        if c.expect_fence is False:
            s.fence_no_misfire.add(r.fence_ok)
        elif c.expect_fence is True:
            s.fence_present_when_due.add(r.fence_ok)
        if c.expect_branches is True:
            s.branches_when_due.add(r.branches_ok)
        elif c.expect_branches is False:
            s.branches_absent_when_not.add(r.branches_ok)
        s.card_attached.add(r.card_ok)
        s.attached_control.add(r.attached_ok)
    for cid, rs in by_case.items():
        s.cases_all_pass.add(all(r.all_ok for r in rs))
    return s


def _mean(values: list[float]) -> Optional[float]:
    vals = [v for v in values if v is not None]
    return round(sum(vals) / len(vals), 1) if vals else None


def mean_prompt_chars(samples: list[SampleResult]) -> Optional[float]:
    """Mean length of the built system prompt, over samples that captured one.

    Only sample 1 of each case keeps the full prompt text (``run_sample`` reads it off the
    transparency snapshot), so this is a mean over one sample per case, not over every sample.
    It is the cheap stand-in for token count while a prompt change is still being sized: a
    slimming that drops instructions should show up here before it shows up in the answer
    quality checks.
    """
    return _mean([float(r.system_prompt_chars) for r in samples if r.system_prompt_chars])


# --- report ----------------------------------------------------------------------------------

def _flag(ok: Optional[bool]) -> str:
    return "—" if ok is None else ("✅" if ok else "❌")


def _case_cell(rs: list[SampleResult], attr: str) -> str:
    vals = [getattr(r, attr) for r in rs]
    if all(v is None for v in vals):
        return "—"
    hit = sum(1 for v in vals if v)
    of = sum(1 for v in vals if v is not None)
    return f"{hit}/{of}"


def write_report(
    path: Path,
    *,
    cases: list[Case],
    samples: list[SampleResult],
    summary: Summary,
    meta: dict[str, Any],
) -> None:
    by_case: dict[str, list[SampleResult]] = {}
    for r in samples:
        by_case.setdefault(r.case_id, []).append(r)

    lines: list[str] = []
    lines.append(f"# Knowledge-base answer eval — {meta['date']}{(' — ' + meta['label']) if meta.get('label') else ''}")
    lines.append("")
    lines.append(
        "What the Deck's model writes **from** the cards, scored without a judge model. "
        "Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` "
        "(decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run "
        "moving a point or two is noise; a check moving ten points is a finding."
    )
    lines.append("")
    lines.append("| Setting | Value |")
    lines.append("|---|---|")
    for k in ("model", "ollama", "corpus_version", "corpus_sections", "prompt_variant", "samples_per_case", "cases", "run_minutes"):
        lines.append(f"| {k} | `{meta.get(k)}` |")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append("| Check | Rate | Meaning |")
    lines.append("|---|---|---|")
    lines.append(f"| Facts kept | **{summary.facts.pct()}** ({summary.facts.frac()}) | every must-mention group found in the reply |")
    lines.append(f"| No contradiction | **{summary.contradictions_clean.pct()}** ({summary.contradictions_clean.frac()}) | nothing from the must-not-say list appeared |")
    lines.append(f"| Fence not misfired | **{summary.fence_no_misfire.pct()}** ({summary.fence_no_misfire.frac()}) | no spoiler fence where none was due |")
    lines.append(f"| Fence present when due | **{summary.fence_present_when_due.pct()}** ({summary.fence_present_when_due.frac()}) | a fence appeared on a story-beat question |")
    lines.append(f"| Branch menu on Strategy first turn | **{summary.branches_when_due.pct()}** ({summary.branches_when_due.frac()}) | the parser accepted a bonsai-strategy-branches fence |")
    lines.append(f"| No menu on Speed/Expert | **{summary.branches_absent_when_not.pct()}** ({summary.branches_absent_when_not.frac()}) | no stray menu outside Strategy |")
    lines.append(f"| Expected card attached | **{summary.card_attached.pct()}** ({summary.card_attached.frac()}) | retrieval, not the model: the named card was in the block |")
    lines.append(f"| Control: nothing attached | **{summary.attached_control.pct()}** ({summary.attached_control.frac()}) | uncovered-game control |")
    lines.append(f"| Ask succeeded | **{summary.success.pct()}** ({summary.success.frac()}) | pipeline returned a reply |")
    lines.append(f"| Cases with every sample clean | **{summary.cases_all_pass.pct()}** ({summary.cases_all_pass.frac()}) | strictest view |")
    lines.append("")
    elapsed = _mean([r.elapsed_s for r in samples if r.success])
    payloads = _mean([float(r.payload_bytes) for r in samples if r.payload_bytes])
    pev = _mean([float(r.prompt_eval_tokens) for r in samples if r.prompt_eval_tokens])
    prompt_chars = mean_prompt_chars(samples)
    lines.append(f"Mean seconds per answer: **{elapsed}**. Mean request payload: **{payloads}** bytes. Mean prompt tokens (Ollama prompt_eval): **{pev}**.")
    lines.append(f"Mean system prompt length: **{prompt_chars}** characters.")
    lines.append("")
    lines.append("## Per case")
    lines.append("")
    lines.append("| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |")
    lines.append("|---|---|---|---|---|---|---|---|")
    for c in cases:
        rs = by_case.get(c.id) or []
        if not rs:
            continue
        card = _case_cell(rs, "card_ok") if c.expect_card else (_case_cell(rs, "attached_ok") if c.expect_attached is not None else "—")
        lines.append(
            f"| `{c.id}` | {c.ask_mode} | {card} | {_case_cell(rs, 'mention_ok')} | {_case_cell(rs, 'notsay_ok')} | "
            f"{_case_cell(rs, 'fence_ok')} | {_case_cell(rs, 'branches_ok')} | {_mean([r.elapsed_s for r in rs])} |"
        )
    lines.append("")
    lines.append("## Failures worth reading")
    lines.append("")
    any_fail = False
    for c in cases:
        for r in by_case.get(c.id) or []:
            if r.all_ok:
                continue
            any_fail = True
            reasons: list[str] = []
            if not r.success:
                reasons.append(f"ask failed: {r.error or r.reply[:200]}")
            if r.card_ok is False:
                reasons.append(f"card `{c.expect_card}` not attached (got: {', '.join(r.cards) or 'nothing'})")
            if r.attached_ok is False:
                reasons.append(f"attached={r.kb_attached}, expected {c.expect_attached}")
            if r.mention_ok is False:
                missing = [c.must_mention[i][0] for i, hit in enumerate(r.mention_hits) if not hit]
                reasons.append("missing facts: " + ", ".join(f"`{m}`" for m in missing))
            if r.notsay_ok is False:
                reasons.append("said: " + ", ".join(f"`{s}`" for s in r.notsay_hits))
            if r.fence_ok is False:
                reasons.append("spoiler fence " + ("present, none due" if r.fence_present else "missing, one was due"))
            if r.branches_ok is False:
                reasons.append("branch menu " + ("present, none due" if r.branches_present else "missing"))
            lines.append(f"- **{c.id}** sample {r.sample}: " + "; ".join(reasons))
    if not any_fail:
        lines.append("None.")
    lines.append("")
    lines.append("## One reply per case (sample 1, trimmed to 1,800 characters)")
    lines.append("")
    lines.append("The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.")
    lines.append("")
    for c in cases:
        rs = by_case.get(c.id) or []
        if not rs:
            continue
        r = rs[0]
        lines.append(f"### {c.id} — {c.app_name} — {c.ask_mode}")
        lines.append("")
        lines.append(f"**Q:** {c.question}  ")
        lines.append(f"**Cards:** {', '.join(r.cards) or 'none'}  ")
        lines.append(f"**Checks:** facts {_flag(r.mention_ok)} · contradiction {_flag(r.notsay_ok)} · fence {_flag(r.fence_ok)} · menu {_flag(r.branches_ok)}")
        lines.append("")
        body = r.reply.strip()
        if len(body) > 1800:
            body = body[:1800].rstrip() + " …"
        lines.append("> " + body.replace("\n", "\n> "))
        lines.append("")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


# --- main ------------------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--ollama", default=DEFAULT_OLLAMA, help="Ollama base URL on this PC")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="chat model tag; default is what the Deck loads")
    parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS, help="directory holding corpus.db + corpus-manifest.json")
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    parser.add_argument("--work-dir", type=Path, default=DEFAULT_WORK_DIR, help="where the fake plugin keeps settings and logs")
    parser.add_argument("--samples", type=int, default=3, help="answers per case")
    parser.add_argument("--only", default="", help="comma-separated case ids")
    parser.add_argument("--variant", default="baseline", choices=sorted(VARIANTS), help="prompt variant hook")
    parser.add_argument("--label", default="", help="suffix for the report filename, e.g. after-w4")
    parser.add_argument("--write-report", action="store_true", default=True)
    parser.add_argument("--no-write-report", action="store_false", dest="write_report")
    args = parser.parse_args()

    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows console
    except Exception:
        pass

    corpus_dir = args.corpus.resolve()
    db = corpus_dir / "corpus.db"
    manifest_path = corpus_dir / "corpus-manifest.json"
    if not db.is_file() or not manifest_path.is_file():
        print(f"no corpus at {corpus_dir}; build one with: python scripts/build_rag_db.py --seed --out {corpus_dir}", file=sys.stderr)
        return 2
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    corpus_version = str(manifest.get("version") or "?")

    work_dir = args.work_dir.resolve()
    _decky, capture = install_fake_decky(work_dir)
    write_harness_settings(work_dir / "settings", corpus_dir=corpus_dir, corpus_version=corpus_version, model=args.model)

    # Imported only now: main.py reads `decky` at import time.
    import main as plugin_main  # noqa: E402
    from backend.services import game_ai_request as gar  # noqa: E402
    from backend.services.ollama_prompts import kb_card_names  # noqa: E402

    plugin = plugin_main.Plugin()

    retrieval_log: list[Any] = []
    real_retrieve = gar.retrieve_knowledge_context

    def _recording_retrieve(*a: Any, **kw: Any) -> Any:
        out = real_retrieve(*a, **kw)
        retrieval_log.append(out)
        return out

    gar.retrieve_knowledge_context = _recording_retrieve

    variant = VARIANTS[args.variant]
    if args.variant != "baseline":
        real_build = plugin_main.build_system_prompt

        def _variant_build(*a: Any, **kw: Any) -> str:
            return variant(real_build(*a, **kw))

        plugin_main.build_system_prompt = _variant_build

    only = {s.strip() for s in args.only.split(",") if s.strip()} or None
    cases = load_fixture(args.fixture, only)
    if not cases:
        print("no cases selected", file=sys.stderr)
        return 2

    # Section count for the report header: same query the embed eval uses.
    import sqlite3  # noqa: E402

    with sqlite3.connect(str(db)) as conn:
        try:
            corpus_sections = conn.execute("SELECT COUNT(*) FROM sections").fetchone()[0]
        except sqlite3.Error:
            corpus_sections = "?"

    print(f"corpus {corpus_version} ({corpus_sections} sections) · model {args.model} · variant {args.variant} · {len(cases)} cases × {args.samples}")
    t_run = time.perf_counter()
    samples: list[SampleResult] = []
    for ci, case in enumerate(cases, 1):
        for si in range(1, args.samples + 1):
            r = asyncio.run(
                run_sample(
                    plugin,
                    case,
                    sample_idx=si,
                    ollama_base=args.ollama,
                    retrieval_log=retrieval_log,
                    capture=capture,
                    kb_card_names=kb_card_names,
                    run_game_ai_request=gar.run_game_ai_request,
                )
            )
            samples.append(r)
            status = "ok " if r.all_ok else "FAIL"
            print(
                f"[{ci:>2}/{len(cases)}] {case.id:<12} s{si} {status} {r.elapsed_s:>6.1f}s "
                f"cards={len(r.cards)} facts={_flag(r.mention_ok)} nosay={_flag(r.notsay_ok)} "
                f"fence={_flag(r.fence_ok)} menu={_flag(r.branches_ok)} card={_flag(r.card_ok)}"
                + (f" err={r.error}" if r.error else "")
            )
    run_minutes = round((time.perf_counter() - t_run) / 60.0, 1)

    summary = summarize(cases, samples)
    prompt_chars = mean_prompt_chars(samples)
    print()
    print(f"facts {summary.facts.pct()} · no-contradiction {summary.contradictions_clean.pct()} · "
          f"fence-not-misfired {summary.fence_no_misfire.pct()} · fence-when-due {summary.fence_present_when_due.pct()} · "
          f"menu-when-due {summary.branches_when_due.pct()} · card-attached {summary.card_attached.pct()} · "
          f"cases-all-clean {summary.cases_all_pass.pct()} · prompt-chars {prompt_chars} · {run_minutes} min")

    if args.write_report:
        stamp = date.today().isoformat()
        suffix = f"-{args.label}" if args.label else ""
        meta = {
            "date": stamp,
            "label": args.label,
            "model": args.model,
            "ollama": args.ollama,
            "corpus_version": corpus_version,
            "corpus_sections": corpus_sections,
            "prompt_variant": args.variant,
            "samples_per_case": args.samples,
            "cases": len(cases),
            "run_minutes": run_minutes,
            "prompt_chars_mean": prompt_chars,
        }
        report_path = REPORT_DIR / f"kb-answer-eval-{stamp}{suffix}.md"
        write_report(report_path, cases=cases, samples=samples, summary=summary, meta=meta)
        JSON_DIR.mkdir(parents=True, exist_ok=True)
        json_path = JSON_DIR / f"kb-answer-eval-{stamp}{suffix}.json"
        payload = {
            "meta": meta,
            "summary": {
                "facts": summary.facts.__dict__,
                "contradictions_clean": summary.contradictions_clean.__dict__,
                "fence_no_misfire": summary.fence_no_misfire.__dict__,
                "fence_present_when_due": summary.fence_present_when_due.__dict__,
                "branches_when_due": summary.branches_when_due.__dict__,
                "branches_absent_when_not": summary.branches_absent_when_not.__dict__,
                "card_attached": summary.card_attached.__dict__,
                "attached_control": summary.attached_control.__dict__,
                "success": summary.success.__dict__,
                "cases_all_pass": summary.cases_all_pass.__dict__,
            },
            "samples": [
                {k: v for k, v in r.__dict__.items() if k != "system_prompt"}
                | ({"system_prompt": r.system_prompt} if r.sample == 1 else {})
                for r in samples
            ],
        }
        json_path.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding="utf-8")
        print(f"Wrote {report_path}")
        print(f"Wrote {json_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
