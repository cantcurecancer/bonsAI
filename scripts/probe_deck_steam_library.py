#!/usr/bin/env python3
"""Title: Deck Steam library reader

Purpose: List the games on the maintainer's Steam Deck — installed or merely owned — with
         playtime and last-played dates, read from the Steam client's own files over SSH.
         Feeds the new-titles tranche (decision D69, plan 40): the shortlist of games to
         write knowledge-base cards for comes from what the maintainer actually plays.
Used for: docs/planning/40-new-titles-from-the-library.md step 1. Read-only; it never
          touches the screen, so it does not compete with a session driving the Deck's UI.
Solves: Walking the library screen with the controller rig is slow and misses games that
        are owned but not installed. The client keeps two files that already hold the answer:
        every library folder's appmanifest_*.acf (installed games, with names) and
        userdata/<id>/config/localconfig.vdf (every owned app the client has seen, with
        playtime in minutes and the last-played time).
Does not: Talk to Steam's servers unless --resolve-names is passed (public store endpoint,
          used only for owned-but-not-installed ids, which carry no name locally). Nothing
          under py_modules/ imports it.

Usage (from the PC, .env supplies DECK_IP / DECK_USER / DECK_PORT):

    python scripts/probe_deck_steam_library.py                 # table to stdout
    python scripts/probe_deck_steam_library.py --json build/deck-library.json
    python scripts/probe_deck_steam_library.py --resolve-names --min-minutes 60
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEAM_ROOT = "/home/deck/.local/share/Steam"
STORE_URL = "https://store.steampowered.com/api/appdetails?appids={app_id}&filters=basic"
USER_AGENT = "bonsAI-corpus-tooling/0.1 (maintainer library read; contact via repo)"

# Steam's own runtime and redistributable entries appear in localconfig too; nobody writes
# strategy cards for them. Extend by hand if more turn up.
NON_GAME_IDS = {228980, 1070560, 1391110, 1628350, 1493710, 1826330, 2180100, 2348590, 2805730}


def load_env() -> dict:
    env = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def ssh_read(env: dict, remote_cmd: str) -> str:
    host = env.get("DECK_IP", "steamdeck.local")
    user = env.get("DECK_USER", "deck")
    port = env.get("DECK_PORT", "22")
    out = subprocess.run(
        ["ssh", "-p", port, "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", f"{user}@{host}", remote_cmd],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if out.returncode != 0:
        raise SystemExit(f"ssh failed ({out.returncode}): {out.stderr.strip()[:400]}")
    return out.stdout


# --- minimal text-VDF parsing (Valve KeyValues) ------------------------------------------

_TOKEN = re.compile(r'"((?:[^"\\]|\\.)*)"|([{}])')


def parse_vdf(text: str) -> dict:
    """Parse Valve's text KeyValues into nested dicts. Good enough for the two files we read."""
    tokens = [(m.group(1), m.group(2)) for m in _TOKEN.finditer(text)]
    root: dict = {}
    stack = [root]
    key = None
    for s, brace in tokens:
        if brace == "{":
            child: dict = {}
            stack[-1][key or ""] = child
            stack.append(child)
            key = None
        elif brace == "}":
            stack.pop()
            key = None
        elif key is None:
            key = s
        else:
            stack[-1][key] = s
            key = None
    return root


def _find_key(node: dict, wanted: str) -> dict | None:
    """Depth-first, case-insensitive search for a dict child named `wanted`."""
    for k, v in node.items():
        if isinstance(v, dict):
            if k.lower() == wanted.lower():
                return v
            hit = _find_key(v, wanted)
            if hit:
                return hit
    return None


@dataclass
class LibraryGame:
    app_id: int
    name: str
    installed: bool
    library_folder: str
    playtime_minutes: int
    last_played: str  # ISO date or ""


def read_installed(env: dict) -> dict[int, tuple[str, str]]:
    """app_id -> (name, folder) from every appmanifest in every library folder."""
    folders_txt = ssh_read(env, f"cat {STEAM_ROOT}/steamapps/libraryfolders.vdf")
    folders = parse_vdf(folders_txt)
    paths = []
    lf = _find_key(folders, "libraryfolders") or folders
    for _, v in lf.items():
        if isinstance(v, dict) and v.get("path"):
            paths.append(v["path"])
    if not paths:
        paths = [STEAM_ROOT]
    listing = ssh_read(env, " ; ".join(f"for f in {p}/steamapps/appmanifest_*.acf; do [ -e \"$f\" ] && echo \"===$f\" && cat \"$f\"; done" for p in paths))
    installed: dict[int, tuple[str, str]] = {}
    for chunk in listing.split("===")[1:]:
        header, _, body = chunk.partition("\n")
        m = re.search(r"appmanifest_(\d+)\.acf", header)
        if not m:
            continue
        data = parse_vdf(body)
        state = _find_key(data, "AppState") or data
        name = state.get("name", "") if isinstance(state, dict) else ""
        installed[int(m.group(1))] = (name, header.rsplit("/steamapps/", 1)[0])
    return installed


def read_owned(env: dict) -> dict[int, tuple[int, str]]:
    """app_id -> (playtime_minutes, last_played_iso) from localconfig.vdf (first user found)."""
    users = ssh_read(env, f"ls {STEAM_ROOT}/userdata").split()
    users = [u for u in users if u.isdigit() and u != "0"]
    if not users:
        return {}
    txt = ssh_read(env, f"cat {STEAM_ROOT}/userdata/{users[0]}/config/localconfig.vdf")
    data = parse_vdf(txt)
    apps = _find_key(data, "apps") or {}
    owned: dict[int, tuple[int, str]] = {}
    for k, v in apps.items():
        if not k.isdigit() or not isinstance(v, dict):
            continue
        minutes = int(v.get("Playtime", v.get("playtime", "0")) or 0)
        last = v.get("LastPlayed", v.get("lastplayed", "0")) or "0"
        iso = ""
        if last.isdigit() and int(last) > 0:
            iso = datetime.fromtimestamp(int(last), tz=timezone.utc).date().isoformat()
        owned[int(k)] = (minutes, iso)
    return owned


def resolve_name(app_id: int) -> str:
    req = urllib.request.Request(STORE_URL.format(app_id=app_id), headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            payload = json.load(resp)
        entry = payload.get(str(app_id), {})
        if entry.get("success"):
            return entry["data"].get("name", "")
    except Exception:  # noqa: BLE001 - a missing name is not a reason to stop the read
        return ""
    return ""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--json", type=Path, help="also write the full list here")
    ap.add_argument("--min-minutes", type=int, default=0, help="hide games played less than this")
    ap.add_argument("--resolve-names", action="store_true", help="look up names for owned-but-not-installed ids via the public store endpoint")
    args = ap.parse_args()

    env = load_env()
    installed = read_installed(env)
    owned = read_owned(env)
    ids = set(installed) | set(owned)
    games: list[LibraryGame] = []
    for app_id in sorted(ids):
        if app_id in NON_GAME_IDS:
            continue
        name, folder = installed.get(app_id, ("", ""))
        minutes, last = owned.get(app_id, (0, ""))
        if not name and args.resolve_names:
            name = resolve_name(app_id)
            time.sleep(0.4)  # be polite to the store endpoint
        games.append(LibraryGame(app_id, name, app_id in installed, folder, minutes, last))

    games.sort(key=lambda g: (-g.playtime_minutes, g.name.lower()))
    shown = [g for g in games if g.playtime_minutes >= args.min_minutes]
    print(f"{'app id':>9}  {'hours':>6}  {'last played':<11}  {'inst':<4}  name")
    for g in shown:
        print(f"{g.app_id:>9}  {g.playtime_minutes / 60:>6.1f}  {g.last_played or '-':<11}  {'yes' if g.installed else '-':<4}  {g.name or '(name not local; --resolve-names)'}")
    print(f"\n{len(games)} apps seen ({sum(1 for g in games if g.installed)} installed); {len(shown)} shown.")
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps([asdict(g) for g in games], indent=2), encoding="utf-8")
        print(f"wrote {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
