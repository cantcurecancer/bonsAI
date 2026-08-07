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
    }
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
    if "state of emergency" in title:
        return "low_narrative"
    return "unknown"


def title_profile_is_low_narrative(app_id: str = "", app_name: str = "") -> bool:
    return resolve_title_spoiler_profile(app_id, app_name) == "low_narrative"
