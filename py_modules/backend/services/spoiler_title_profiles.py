"""Title: Spoiler title profiles (constitution runtime)

Purpose: Built-in per-title spoiler sensitivity profiles for prompts, risk chip, and display unwrap.
Used for: ollama_prompts, spoiler_risk_service; mirrored in src/data/spoilerTitleProfiles.ts.
Solves: Title-level open vs protect decisions without genre substring or KB entity match.
Does not: Runtime mask/omit behavior, corpus schema flags, or user-adjustable fencing settings.
"""

from __future__ import annotations

from typing import Literal

SpoilerTitleProfile = Literal["low_narrative", "protect_progression", "unknown"]

# Low narrative: routine boss/tactics rarely spoil progressive story secrets.
LOW_NARRATIVE_APP_IDS = frozenset(
    {
        "2321470",  # Deep Rock Galactic: Survivor
        "550",  # Left 4 Dead 2
        "1222670",  # The Sims 4
    }
)

# Protect progression: story/campaign titles stay conservative unless the user names the entity.
PROTECT_PROGRESSION_APP_IDS = frozenset(
    {
        "413150",  # The Legend of Zelda: Ocarina of Time
        "1086940",  # Baldur's Gate 3
        "377160",  # Fallout 4
        "1145360",  # Hades
        "1091500",  # Cyberpunk 2077
        "1547000",  # GTA: San Andreas — The Definitive Edition
        "1174180",  # Red Dead Redemption 2
        "220",  # Half-Life 2
        # Portal 2 is the first title the two-profile split does not really fit: chamber
        # solutions spoil nothing, but the story is built on a late reveal. Protect, because
        # the cost of being wrong is asymmetric — over-fencing a puzzle hint annoys, and
        # under-fencing the ending cannot be taken back. Section type carries the rest.
        "620",  # Portal 2
    }
)


# Same two profiles, reachable by title name. **Required by D19:** a title recognised from the
# question text has no AppID to look up -- "what is the best way to beat volvagia in oot" with
# nothing running resolved to Ocarina of Time and then fenced as `unknown`, which is the one
# outcome D19 ruled out.
#
# Substring match on a normalised title, so the corpus's canonical form ("The Legend of Zelda:
# Ocarina of Time") and a user's shorthand both land. Kept as a separate table from the AppID
# sets rather than derived from them: the AppID for Ocarina in the seed is **Stardew Valley's**
# (a known open bug), so deriving names from IDs would inherit that error and spread it.
_LOW_NARRATIVE_TITLES = (
    "state of emergency",
    "deep rock galactic",
    "left 4 dead 2",
    "the sims 4",
)

_PROTECT_PROGRESSION_TITLES = (
    "ocarina of time",
    "ship of harkinian",
    "baldur's gate 3",
    "baldurs gate 3",
    "fallout 4",
    "hades",
    "cyberpunk 2077",
    "san andreas",
    "red dead redemption 2",
    "half-life 2",
    "half life 2",
    "portal 2",
)


def _normalize_title(name: str) -> str:
    return " ".join((name or "").strip().lower().split())


def resolve_title_spoiler_profile(app_id: str = "", app_name: str = "") -> SpoilerTitleProfile:
    """Return built-in profile for AppID or, when absent, a title-name fallback (e.g. SoE)."""
    aid = str(app_id or "").strip()
    if aid in LOW_NARRATIVE_APP_IDS:
        return "low_narrative"
    if aid in PROTECT_PROGRESSION_APP_IDS:
        return "protect_progression"
    title = _normalize_title(app_name)
    if not title:
        return "unknown"
    # Protect first: when a title matches both tables the conservative answer wins, because
    # over-fencing annoys and under-fencing cannot be taken back.
    if any(known in title for known in _PROTECT_PROGRESSION_TITLES):
        return "protect_progression"
    if any(known in title for known in _LOW_NARRATIVE_TITLES):
        return "low_narrative"
    return "unknown"


def title_profile_is_low_narrative(app_id: str = "", app_name: str = "") -> bool:
    return resolve_title_spoiler_profile(app_id, app_name) == "low_narrative"
