"""
Title: Compat corpus topic router
Purpose: Decide whether an Ask is about a troubleshooting topic the shared compat corpus covers.
Used for: knowledge_base_service.should_retrieve_knowledge — routing an Ask to the compat KB.
Solves: The prompt-side phrase gate needs the literal word "deck" or "proton" in the question,
        so 24 of the corpus's 27 topics could not be reached by anything a user would type.
Does not: Change prompt construction, Proton log attachment, stream tags, or the frontend
          permission hint. Those keep the narrower phrase gate they were written for.

Locked as decision D16 (2026-08-06). See docs/audit/rag-pr2-signoff.md.

Why this is a separate predicate rather than a wider
``question_matches_troubleshooting_log_context``: that function has five consumers. Widening it
would also attach Proton logs, re-frame the system prompt, change stream tags, and move the
client-side permission hint -- four behaviour changes nobody asked for, to fix one. This
predicate is additive and only the knowledge base reads it.

**Precision is deliberately traded for reach**, because the two failures are not symmetric.
A missed topic is silent: the user gets no tip and no sign one existed. A false positive is
caught downstream -- retrieval still has to clear ``BM25_RELEVANCE_FLOOR``, and a question
with no real match attaches nothing. So a rule here that fires slightly too often costs an
FTS query; one that fires too rarely costs the feature.
"""

from __future__ import annotations

import re

# topic -> rules. Each rule is a tuple of terms that must **all** appear; any rule matching
# claims the topic. Single-term rules are reserved for words that mean nothing else in a
# gaming question ("gamescope", "steamvr"); everything ambiguous needs a second term, so
# "my controller" alone does not route a strategy question into troubleshooting.
#
# Rules were written from the corpus's own topic list plus the `tune` compat intents in
# tests/fixtures/kb_eval_v1.json. The `holdout` intents were not read while writing them --
# they are the blind check, and the misses are recorded rather than patched away.
_TOPIC_RULES: dict[str, tuple[tuple[str, ...], ...]] = {
    "proton": (
        ("proton",),
        ("compatibility layer",),
        ("compat layer",),
        ("windows game", "linux"),
        ("windows game", "closes"),
        ("windows game", "shuts"),
        ("windows game", "crash"),
        ("windows title", "black"),
    ),
    "wine": (
        ("wine",),
        ("prefix",),
        ("compatdata",),
        ("compatibility files",),
    ),
    "shader": (
        ("shader",),
        ("processing", "launch"),
        ("pre-caching",),
        ("precaching",),
    ),
    "anticheat": (
        ("anti-cheat",),
        ("anticheat",),
        ("anti cheat",),
        ("easy anti",),
        ("battleye",),
        ("multiplayer", "blocked"),
        ("online", "kicks"),
        ("online", "kicked"),
    ),
    "gamescope": (
        ("gamescope",),
        ("fsr",),
        ("upscal",),
        ("scaling", "blurry"),
        ("resolution", "smear"),
        ("resolution", "blurry"),
    ),
    "steam_input": (
        ("steam input",),
        ("controller", "not detected"),
        ("controller", "not working"),
        ("controller", "layout"),
        ("controller", "profile"),
        ("controller", "mapping"),
        ("touchpad",),
        ("back button",),
        ("sticks", "ignore"),
        ("sticks", "ignores"),
    ),
    "gyro": (
        ("gyro",),
        ("motion control",),
        ("tilting",),
        ("tilt", "aim"),
        # No rule for "motion aiming". It reads as gyro, but it is also what Red Dead calls
        # its slow-motion aim, and that strategy question was being routed to the tip sheet.
    ),
    "controller": (
        ("stick drift",),
        ("deadzone",),
        ("dead zone",),
        ("rumble",),
        ("haptic",),
        ("controller", "pair"),
        ("controller", "disconnect"),
    ),
    "storage": (
        ("sd card",),
        ("microsd",),
        ("micro sd",),
        ("memory card", "install"),
        ("out of room",),
        ("out of space",),
        ("disk space",),
        ("move", "library"),
        ("storage",),
    ),
    "streaming": (
        ("remote play",),
        ("steam link",),
        ("moonlight",),
        ("sunshine",),
        ("streaming",),
        ("stream", "desktop"),
        ("stream", "pc"),
        ("from my desktop", "wifi"),
    ),
    "network": (
        ("firewall",),
        ("port", "open"),
        ("subnet",),
        ("ip address",),
        ("lan",),
        ("wifi", "cannot see"),
        ("wifi", "cant see"),
    ),
    "updates": (
        ("steamos update",),
        ("system update",),
        ("update", "stuck"),
        ("update", "reboot"),
        ("update", "failed"),
        ("same version",),
    ),
    "steamvr": (
        ("steamvr",),
        ("headset",),
        ("vr",),
        ("index",),
    ),
    "emudeck": (
        ("emudeck",),
        ("emulator",),
        ("emulation",),
        ("pcsx2",),
        ("retroarch",),
        ("dolphin",),
        ("playstation 2",),
        ("ps2",),
    ),
    "fex": (
        ("fex",),
        ("x86", "arm"),
        ("translated", "binaries"),
        ("translation layer",),
    ),
    "bpm": (
        ("big picture",),
        ("television", "menus"),
        ("tv mode",),
    ),
    "gaming_mode": (
        ("game mode",),
        ("gaming mode",),
    ),
    "desktop_mode": (
        ("desktop mode",),
    ),
    "audio": (
        ("no sound",),
        ("no audio",),
        ("audio", "output device"),
        ("audio", "crackl"),
        ("headphones", "not"),
    ),
    "display": (
        ("refresh rate",),
        ("tearing",),
        ("vsync",),
        ("v-sync",),
        ("external monitor",),
        ("hdmi",),
        ("picture tears",),
    ),
    "performance": (
        ("frame limit",),
        ("frame rate", "drop"),
        ("fps", "drop"),
        ("tdp",),
        ("battery", "hour"),
        ("battery", "drain"),
        ("fan", "loud"),
        ("fan", "scream"),
        ("overheat",),
        ("thermal",),
    ),
    "crash": (
        ("crash",),
        ("wont launch",),
        ("closes itself",),
        ("shuts itself",),
        ("black screen",),
    ),
    "deck": (
        ("steam deck",),
        ("deck",),
    ),
    "linux": (
        ("linux",),
        ("steamos",),
        ("arch",),
    ),
    "windows_steam": (
        ("dual boot",),
        ("dual-boot",),
        ("windows steam",),
        ("both operating systems",),
        ("game bar",),
    ),
    "steam_frame": (
        ("steam frame",),
    ),
    "steam_machine": (
        ("steam machine",),
    ),
}

# Topics whose rules are broad enough to fire on ordinary questions. A match on one of these
# alone is not enough to route -- "deck" appears in plenty of strategy asks, and "crash" is a
# thing bosses do to you. They confirm a routing decision another topic already made.
_WEAK_TOPICS = frozenset({"deck", "linux", "crash"})


def _normalize(question: str) -> str:
    """Lowercase, drop apostrophes, punctuation to spaces, collapse runs.

    Apostrophes are **deleted**, not spaced: "won't" has to become "wont" so a rule can be
    written as one word. Spacing it produces "won t", which no readable rule would match --
    a rule written as "won't launch" would then be permanently dead and look fine.
    """
    lowered = str(question or "").lower().replace("'", "").replace("’", "")
    # Keep the hyphen: "anti-cheat" and "dual-boot" are listed with and without it, and
    # flattening it here would make those two rules identical and one of them dead.
    cleaned = re.sub(r"[^a-z0-9\- ]+", " ", lowered)
    return f" {' '.join(cleaned.split())} "


def _term_matches(haystack: str, term: str) -> bool:
    """Match a term at a word boundary, allowing a suffix on its last word.

    Plain substring matching is what made "lan" fire on "plants", "plane" and "island" --
    three strategy questions routed into troubleshooting by a network rule. Requiring a
    boundary at the **start** only keeps the useful half: "upscal" still reaches "upscaling"
    and "smear" reaches "smeared", without inventing matches inside unrelated words.
    """
    return re.search(rf"(?<![a-z0-9]){re.escape(term)}", haystack) is not None


def _rule_matches(haystack: str, rule: tuple[str, ...]) -> bool:
    return all(_term_matches(haystack, term) for term in rule)


def match_compat_corpus_topics(question: str) -> list[str]:
    """Every corpus topic this question plausibly asks about, strongest signal first.

    Returned for diagnosis and eval reporting. Retrieval itself does not filter by topic --
    FTS already searches the whole tip sheet -- so this is about *whether* to search, not
    *what* to search.
    """
    haystack = _normalize(question)
    if not haystack.strip():
        return []
    strong: list[str] = []
    weak: list[str] = []
    for topic, rules in _TOPIC_RULES.items():
        if any(_rule_matches(haystack, rule) for rule in rules):
            (weak if topic in _WEAK_TOPICS else strong).append(topic)
    return strong + weak


def question_targets_compat_corpus(question: str) -> bool:
    """True when the Ask names a troubleshooting topic the shared compat corpus covers.

    A weak-topic match on its own does not route. "How do I beat the boss on my deck" is a
    strategy question that happens to say "deck"; routing it to the tip sheet would attach
    troubleshooting advice to a boss fight.
    """
    return any(topic not in _WEAK_TOPICS for topic in match_compat_corpus_topics(question))


def known_compat_topics() -> frozenset[str]:
    """Topics this router can reach. Compared against the corpus in tests to catch drift."""
    return frozenset(_TOPIC_RULES)
