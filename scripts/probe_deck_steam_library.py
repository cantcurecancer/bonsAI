#!/usr/bin/env python3
"""Title: Deck Steam library reader

Purpose: List the games on the maintainer's Steam Deck — installed, merely owned, or added as
         non-Steam shortcuts (EmuDeck, ports, launchers) — with playtime and last-played dates,
         read from the Steam client's own files over SSH.
         Feeds the new-titles tranche (decision D69, plan 40): the shortlist of games to
         write knowledge-base cards for comes from what the maintainer actually plays.
Used for: docs/planning/40-new-titles-from-the-library.md step 1. Read-only; it never
          touches the screen, so it does not compete with a session driving the Deck's UI.
Solves: Walking the library screen with the controller rig is slow and misses games that
        are owned but not installed. The client keeps three files that already hold the answer:
        every library folder's appmanifest_*.acf (installed games, with names),
        userdata/<id>/config/localconfig.vdf (every owned app the client has seen, with
        playtime in minutes and the last-played time), and userdata/<id>/config/shortcuts.vdf
        (the non-Steam shortcuts, binary KeyValues: name, what it launches, collections).
Does not: Talk to Steam's servers unless --resolve-names is passed (public store endpoint,
          used only for owned-but-not-installed ids, which carry no name locally). Nothing
          under py_modules/ imports it.

Usage (from the PC, .env supplies DECK_IP / DECK_USER / DECK_PORT):

    python scripts/probe_deck_steam_library.py                 # table to stdout
    python scripts/probe_deck_steam_library.py --json build/deck-library.json
    python scripts/probe_deck_steam_library.py --resolve-names --min-minutes 60
    python scripts/probe_deck_steam_library.py --shortcuts-only     # just the non-Steam entries
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import struct
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

EMULATOR_WORDS = (
    "emulation", "retroarch", "emulationstation", "retrodeck", "pcsx2", "rpcs3", "dolphin",
    "yuzu", "ryujinx", "cemu", "duckstation", "ppsspp", "citra", "melonds", "mgba", "xemu",
    "primehack", "flycast", "scummvm", "vita3k", "ares", "mame", "xenia",
)
STORE_WORDS = ("heroic", "lutris", "bottles", "epic", "gog", "legendary", "junk-store", "junkstore")
PORT_WORDS = ("soh", "harkinian", "2ship", "sm64", "ship of", "portproton", "port")


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
    port = env.get("DECK_PORT") or "22"
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
    """Parse Valve's text KeyValues into nested dicts. Good enough for the files we read."""
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


# --- binary KeyValues (shortcuts.vdf) -----------------------------------------------------


def parse_binary_vdf(data: bytes) -> dict:
    """Parse Valve's binary KeyValues: 0x00 nested, 0x01 string, 0x02 int32, 0x03 float,
    0x07 uint64, 0x08 end of node. Keys and strings are NUL-terminated UTF-8."""
    pos = 0

    def read_str() -> str:
        nonlocal pos
        end = data.index(b"\x00", pos)
        s = data[pos:end].decode("utf-8", errors="replace")
        pos = end + 1
        return s

    def read_node() -> dict:
        nonlocal pos
        node: dict = {}
        while pos < len(data):
            kind = data[pos]
            pos += 1
            if kind == 0x08:
                return node
            key = read_str()
            if kind == 0x00:
                node[key] = read_node()
            elif kind == 0x01:
                node[key] = read_str()
            elif kind == 0x02:
                node[key] = struct.unpack_from("<i", data, pos)[0]
                pos += 4
            elif kind == 0x03:
                node[key] = struct.unpack_from("<f", data, pos)[0]
                pos += 4
            elif kind == 0x07:
                node[key] = struct.unpack_from("<Q", data, pos)[0]
                pos += 8
            else:
                raise ValueError(f"unknown binary KeyValues type {kind} at byte {pos}")
        return node

    return read_node()


def _ci(node: dict, key: str, default=None):
    for k, v in node.items():
        if k.lower() == key.lower():
            return v
    return default


def classify_shortcut(exe: str, start_dir: str, tags: list[str]) -> str:
    """A rough label for what kind of non-Steam entry this is, from what it launches."""
    hay = f"{exe} {start_dir} {' '.join(tags)}".lower()
    if any(w in hay for w in EMULATOR_WORDS):
        return "emulated"
    if any(w in hay for w in STORE_WORDS):
        return "other store"
    if any(w in hay for w in PORT_WORDS):
        return "port"
    return "non-steam"


@dataclass
class LibraryGame:
    app_id: int
    name: str
    installed: bool
    library_folder: str
    playtime_minutes: int
    last_played: str  # ISO date or ""
    kind: str = "steam"  # steam | non-steam | emulated | port | other store
    launches: str = ""  # shortcuts only: the executable, for a human to recognise the entry
    collections: str = ""  # shortcuts only: Steam collections / tags, comma-joined


def _first_user(env: dict) -> str | None:
    users = ssh_read(env, f"ls {STEAM_ROOT}/userdata").split()
    users = [u for u in users if u.isdigit() and u != "0"]
    return users[0] if users else None


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
    # A library folder with no games leaves the glob unexpanded, and the loop's last test
    # then fails; the trailing `true` keeps that from reading as an SSH failure.
    cmd = " ; ".join(
        f'for f in {p}/steamapps/appmanifest_*.acf; do [ -e "$f" ] && echo "===$f" && cat "$f"; done'
        for p in paths
    ) + " ; true"
    listing = ssh_read(env, cmd)
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
    user = _first_user(env)
    if not user:
        return {}
    txt = ssh_read(env, f"cat {STEAM_ROOT}/userdata/{user}/config/localconfig.vdf")
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


def read_shortcuts(env: dict) -> list[LibraryGame]:
    """Every non-Steam shortcut from shortcuts.vdf (first user found). Playtime and the
    last-played date come from localconfig when present, else from the shortcut itself."""
    user = _first_user(env)
    if not user:
        return []
    path = f"{STEAM_ROOT}/userdata/{user}/config/shortcuts.vdf"
    b64 = ssh_read(env, f"[ -f {path} ] && base64 -w0 {path} || true").strip()
    if not b64:
        return []
    root = parse_binary_vdf(base64.b64decode(b64))
    entries = _ci(root, "shortcuts", {}) or {}
    games: list[LibraryGame] = []
    for _, sc in entries.items():
        if not isinstance(sc, dict):
            continue
        raw_id = _ci(sc, "appid", 0) or 0
        app_id = raw_id & 0xFFFFFFFF  # Steam shows shortcut ids unsigned
        tags_node = _ci(sc, "tags", {}) or {}
        tags = [str(v) for v in tags_node.values()] if isinstance(tags_node, dict) else []
        exe = str(_ci(sc, "Exe", "") or "").strip('"')
        start_dir = str(_ci(sc, "StartDir", "") or "").strip('"')
        last = int(_ci(sc, "LastPlayTime", 0) or 0)
        iso = datetime.fromtimestamp(last, tz=timezone.utc).date().isoformat() if last > 0 else ""
        games.append(LibraryGame(
            app_id=app_id,
            name=str(_ci(sc, "AppName", "") or ""),
            installed=True,
            library_folder=start_dir,
            playtime_minutes=0,
            last_played=iso,
            kind=classify_shortcut(exe, start_dir, tags),
            launches=os.path.basename(exe.rstrip("/")) or exe,
            collections=", ".join(tags),
        ))
    return games


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
    ap = argparse.ArgumentParser(description="List the games on the Deck from the Steam client's own files (read-only, over SSH).")
    ap.add_argument("--json", type=Path, help="also write the full list here")
    ap.add_argument("--min-minutes", type=int, default=0, help="hide Steam games played less than this (shortcuts always show)")
    ap.add_argument("--resolve-names", action="store_true", help="look up names for owned-but-not-installed ids via the public store endpoint (only for rows that pass --min-minutes)")
    ap.add_argument("--shortcuts-only", action="store_true", help="list only the non-Steam shortcuts")
    args = ap.parse_args()

    env = load_env()
    shortcuts = read_shortcuts(env)
    owned = read_owned(env)
    games: list[LibraryGame] = []
    if not args.shortcuts_only:
        installed = read_installed(env)
        shortcut_ids = {s.app_id for s in shortcuts}
        for app_id in sorted(set(installed) | set(owned)):
            if app_id in NON_GAME_IDS or app_id in shortcut_ids:
                continue
            name, folder = installed.get(app_id, ("", ""))
            minutes, last = owned.get(app_id, (0, ""))
            games.append(LibraryGame(app_id, name, app_id in installed, folder, minutes, last))
    for s in shortcuts:
        minutes, last = owned.get(s.app_id, (0, ""))
        s.playtime_minutes = minutes
        s.last_played = s.last_played or last
        games.append(s)

    games.sort(key=lambda g: (-g.playtime_minutes, g.name.lower()))
    shown = [g for g in games if g.playtime_minutes >= args.min_minutes or g.kind != "steam"]
    if args.resolve_names:
        for g in shown:
            if not g.name and g.kind == "steam":
                g.name = resolve_name(g.app_id)
                time.sleep(0.4)  # be polite to the store endpoint

    print(f"{'app id':>10}  {'hours':>6}  {'last played':<11}  {'inst':<4}  {'kind':<11}  name")
    for g in shown:
        extra = ""
        if g.kind != "steam":
            extra = f"  [{g.launches}{'; ' + g.collections if g.collections else ''}]"
        label = g.name or "(name not local; --resolve-names)"
        print(f"{g.app_id:>10}  {g.playtime_minutes / 60:>6.1f}  {g.last_played or '-':<11}  {'yes' if g.installed else '-':<4}  {g.kind:<11}  {label}{extra}")
    steam_installed = sum(1 for g in games if g.installed and g.kind == "steam")
    print(f"\n{len(games)} entries ({steam_installed} Steam games installed, {len(shortcuts)} non-Steam shortcuts); {len(shown)} shown.")
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps([asdict(g) for g in games], indent=2), encoding="utf-8")
        print(f"wrote {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
