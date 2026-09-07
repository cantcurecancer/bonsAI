"""Title: TDP intent detection

Purpose: Classify Ask questions about TDP reads, changes, and recommendation parsing.
Used for: Routing TDP-related local commands before or alongside Ollama Ask handling.
Solves: Distinguish "what is my TDP" from set/recommend intents and parse JSON caps.
Does not: Write sysfs or invoke steamos-priv-write — see tdp_service for hardware I/O.
"""

import json
import re
from typing import Optional


def is_current_tdp_read_intent(question: str) -> bool:
    """True when the user wants to *read* the current TDP cap, not change or recommend one."""
    t = (question or "").strip().lower()
    if not t:
        return False
    if "tdp" not in t and "thermal design power" not in t:
        return False
    excl = (
        "recommend",
        "suggest",
        "set tdp",
        "set my tdp",
        "change ",
        "increase",
        "decrease",
        "lower my",
        "raise my",
        "cap at",
        "best tdp",
        "optimal tdp",
        "should i",
        "should i use",
        "optimize for",
    )
    if any(s in t for s in excl):
        return False
    if re.search(
        r"\b(what|how much)\b.{0,40}\b(tdp|watts?)\b",
        t,
    ) and "current" in t:
        return True
    if re.search(r"\b(what|how much)\b.{0,20}\b(current|the)\b.{0,20}\b(tdp|watts?)\b", t):
        return True
    if re.search(
        r"\b(current|read|right now|present|actual)\b.{0,30}\b(tdp|watts?)\b",
        t,
    ):
        return True
    if re.search(
        r"\b(tdp|watts?)\b.{0,20}\b(is|are|am i|we at|we running)\b",
        t,
    ):
        return True
    if re.search(r"\bwhat tdp (is|am|are|right now)\b", t) or re.search(r"\bhow much tdp\b", t):
        return True
    return "what's" in t and "tdp" in t


def parse_tdp_recommendation(
    text: str,
    tdp_min: int,
    tdp_max: int,
    gpu_min_mhz: int,
    gpu_max_mhz: int,
) -> Optional[dict]:
    """Parse and clamp TDP recommendations from JSON blocks or natural-language fallbacks."""
    rec = None

    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if not fenced:
        fenced = re.search(r'(\{\s*"tdp_watts"\s*:\s*\d+[^}]*\})', text, re.DOTALL)
    if fenced:
        try:
            rec = json.loads(fenced.group(1))
        except json.JSONDecodeError:
            rec = None

    if rec is None:
        natural = re.search(r"(?:tdp|TDP)\s*(?:to|of|at|:)?\s*(\d+)\s*(?:w|W|watts?)", text)
        if natural:
            rec = {"tdp_watts": int(natural.group(1))}

    if rec is None:
        return None

    tdp = rec.get("tdp_watts")
    gpu = rec.get("gpu_clock_mhz")
    if not isinstance(tdp, (int, float)):
        return None

    result: dict = {"tdp_watts": max(tdp_min, min(tdp_max, int(tdp)))}
    if isinstance(gpu, (int, float)):
        result["gpu_clock_mhz"] = max(gpu_min_mhz, min(gpu_max_mhz, int(gpu)))
    else:
        result["gpu_clock_mhz"] = None
    return result


_RAW_TDP_BLOCK_RE = re.compile(r'\{\s*"tdp_watts"\s*:\s*\d+[^}]*\}')
_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)


def strip_tdp_recommendation_block(text: str) -> str:
    """Remove a bare ``{"tdp_watts": ...}`` block from reply text before it reaches a person.

    ``parse_tdp_recommendation`` reads this block (it is how the power suggestion feature
    works) but never removes it, so on some replies the model's raw JSON ends up sitting in
    the words a person reads. This mirrors the same fallback pattern used to *find* the block
    so stripping matches parsing exactly, except a block sitting inside a fenced code sample
    (` ``` ... ``` `) is left alone -- that text was asked for on purpose.
    """
    if not text or '"tdp_watts"' not in text:
        return text

    fenced_spans = [m.span() for m in _FENCE_RE.finditer(text)]

    def _in_fenced_span(pos: int) -> bool:
        return any(start <= pos < end for start, end in fenced_spans)

    changed = False

    def _replace(match: "re.Match[str]") -> str:
        nonlocal changed
        if _in_fenced_span(match.start()):
            return match.group(0)
        changed = True
        return ""

    stripped = _RAW_TDP_BLOCK_RE.sub(_replace, text)
    if not changed:
        return text

    stripped = re.sub(r"[ \t]+\n", "\n", stripped)
    stripped = re.sub(r"\n{3,}", "\n\n", stripped)
    return stripped.strip()
