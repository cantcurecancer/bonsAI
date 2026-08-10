"""Title: Capability toggles

Purpose: Sanitize and default user capability flags for high-impact plugin actions.
Used for: Permission Center settings, RPC guards, and legacy install grandfathering.
Solves: A fixed key set with safe False defaults and explicit legacy all-on migration.
Does not: Enforce permissions at runtime alone — callers must check before privileged I/O.
"""

from typing import Any

# Fixed keys persisted under settings["capabilities"]; keep in sync with frontend BonsaiSettings.
CAPABILITY_KEYS = (
    "filesystem_write",
    "media_library_access",
    "steam_logs_read",
    "steam_web_api",
    "microphone_access",
)

# Session Kids master lock (Steam parental). Not persisted — frontend pushes via RPC.
# Checked first in capability_enabled so every key (including future Web) denies while active.
_kids_lock_active: bool = False


def set_kids_lock_active(active: bool) -> None:
    """Set the session Kids lock flag (does not rewrite stored capabilities)."""
    global _kids_lock_active
    _kids_lock_active = bool(active)


def kids_lock_active() -> bool:
    """True when Steam parental lock is active this session."""
    return _kids_lock_active


def sanitize_capabilities(value: Any) -> dict[str, bool]:
    """Normalize capabilities to a full dict; missing keys default to False."""
    raw = value if isinstance(value, dict) else {}
    out: dict[str, bool] = {}
    for key in CAPABILITY_KEYS:
        v = raw.get(key)
        if isinstance(v, bool):
            out[key] = v
        else:
            out[key] = v is True or v == 1
    return out


def legacy_grandfather_capabilities() -> dict[str, bool]:
    """All-on defaults for settings files created before the capabilities block existed."""
    out = {k: True for k in CAPABILITY_KEYS}
    # Outbound Steam Web API uses the user's key; do not auto-enable for legacy installs.
    out["steam_web_api"] = False
    # Microphone capture is opt-in even for legacy installs.
    out["microphone_access"] = False
    return out


def capability_enabled(settings: dict, key: str) -> bool:
    """True when settings explicitly enable a capability (unknown keys are denied).

    Kids lock denies every key in CAPABILITY_KEYS while active — including any future
    Web capability that joins the tuple — without mutating sanitize_capabilities output.
    """
    if _kids_lock_active:
        return False
    if key not in CAPABILITY_KEYS:
        return False
    caps = settings.get("capabilities")
    if not isinstance(caps, dict):
        return False
    return caps.get(key) is True
