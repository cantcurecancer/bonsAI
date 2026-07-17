"""Shared schema, manifest, and path helpers for the on-Deck knowledge base corpus."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Optional

CORPUS_SCHEMA_VERSION = 1
CORPUS_MANIFEST_FILENAME = "corpus-manifest.json"
CORPUS_DB_FILENAME = "corpus.db"
CORPUS_ATTRIBUTIONS_FILENAME = "ATTRIBUTIONS.md"
DEFAULT_EMBEDDING_MODEL = "nomic-embed-text"
DEFAULT_EMBEDDING_DIM = 768

# Manifest URL placeholders — maintainer publishes assets; plugin fetches at runtime.
DEFAULT_MANIFEST_HF_URL = (
    "https://huggingface.co/datasets/cantcurecancer/bonsai-knowledge-base/resolve/main/corpus-manifest.json"
)
DEFAULT_MANIFEST_GITHUB_URL = (
    "https://github.com/cantcurecancer/bonsAI/releases/download/knowledge-base-v0/corpus-manifest.json"
)

TRUST_TIER_WIKI_VERIFIED = "wiki_verified"
TRUST_TIER_WIKI_NO_PATCH = "wiki_no_patch"
TRUST_TIER_FALLBACK = "fallback_no_source"

CREATE_SCHEMA_SQL = """
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

CREATE TABLE IF NOT EXISTS games (
    game_id INTEGER PRIMARY KEY,
    app_id TEXT,
    igdb_id TEXT,
    canonical_title TEXT NOT NULL,
    edition TEXT,
    platform TEXT,
    genres TEXT,
    CHECK (app_id IS NOT NULL OR igdb_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_games_app_id ON games(app_id) WHERE app_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_igdb_id ON games(igdb_id) WHERE igdb_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS aliases (
    alias_normalized TEXT NOT NULL,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    PRIMARY KEY (alias_normalized, game_id)
);

CREATE INDEX IF NOT EXISTS idx_aliases_game_id ON aliases(game_id);

CREATE TABLE IF NOT EXISTS sections (
    section_id INTEGER PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    name TEXT NOT NULL,
    card TEXT NOT NULL,
    source_url TEXT,
    source_license TEXT,
    source_version TEXT,
    crawled_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sections_game_id ON sections(game_id);

CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    name,
    card,
    content='sections',
    content_rowid='section_id',
    tokenize='porter unicode61'
);

CREATE TABLE IF NOT EXISTS genre_patterns (
    pattern_id INTEGER PRIMARY KEY,
    genre_tags TEXT NOT NULL,
    card TEXT NOT NULL,
    source_license TEXT
);

CREATE TABLE IF NOT EXISTS compat_patterns (
    pattern_id INTEGER PRIMARY KEY,
    topic TEXT NOT NULL,
    card TEXT NOT NULL,
    source_url TEXT,
    source_license TEXT
);

CREATE TABLE IF NOT EXISTS section_vectors (
    section_id INTEGER PRIMARY KEY REFERENCES sections(section_id) ON DELETE CASCADE,
    embedding BLOB
);
"""

FTS_SYNC_TRIGGERS_SQL = """
CREATE TRIGGER IF NOT EXISTS sections_ai AFTER INSERT ON sections BEGIN
    INSERT INTO sections_fts(rowid, name, card) VALUES (new.section_id, new.name, new.card);
END;
CREATE TRIGGER IF NOT EXISTS sections_ad AFTER DELETE ON sections BEGIN
    INSERT INTO sections_fts(sections_fts, rowid, name, card) VALUES('delete', old.section_id, old.name, old.card);
END;
CREATE TRIGGER IF NOT EXISTS sections_au AFTER UPDATE ON sections BEGIN
    INSERT INTO sections_fts(sections_fts, rowid, name, card) VALUES('delete', old.section_id, old.name, old.card);
    INSERT INTO sections_fts(rowid, name, card) VALUES (new.section_id, new.name, new.card);
END;
"""


def normalize_alias(text: str) -> str:
    """Lowercase, collapse whitespace, strip punctuation for alias lookup."""
    raw = (text or "").strip().lower()
    raw = re.sub(r"[^\w\s]", " ", raw, flags=re.UNICODE)
    return re.sub(r"\s+", " ", raw).strip()


def default_corpus_dir_internal() -> str:
    return str(Path.home() / ".bonsai" / "rag")


def _free_bytes_at_path(path: str) -> int:
    try:
        if hasattr(os, "statvfs"):
            st = os.statvfs(path)
            return int(st.f_bavail * st.f_frsize)
        import shutil

        return int(shutil.disk_usage(path).free)
    except OSError:
        return 0


def discover_sd_card_mount_base() -> Optional[str]:
    """First writable volume under /run/media/<user>/ (SteamOS microSD)."""
    media_root = Path(f"/run/media/{Path.home().name}")
    if not media_root.is_dir():
        return None
    try:
        candidates = sorted(
            (p for p in media_root.iterdir() if p.is_dir() and not p.name.startswith(".")),
            key=lambda p: p.name.lower(),
        )
    except OSError:
        return None
    for candidate in candidates:
        try:
            resolved = candidate.resolve()
            if os.access(resolved, os.W_OK | os.X_OK):
                return str(resolved)
        except OSError:
            continue
    return None


def default_corpus_dir_sd(sd_mount: Optional[str] = None) -> str:
    mount = str(sd_mount or discover_sd_card_mount_base() or "").strip()
    if not mount:
        raise ValueError("No SD card mount detected.")
    return str(Path(mount) / ".bonsai" / "rag")


def is_allowed_corpus_install_path(target: Path) -> bool:
    """Allow install roots under home or SteamOS SD mounts (/run/media/<user>/…)."""
    resolved = target.resolve()
    home = Path.home().resolve()
    try:
        resolved.relative_to(home)
        return True
    except ValueError:
        pass
    media_base = Path(f"/run/media/{home.name}").resolve()
    try:
        resolved.relative_to(media_base)
        return True
    except ValueError:
        return False


def list_rag_storage_options() -> dict[str, Any]:
    """Return internal + optional SD install targets for the download picker."""
    internal_path = default_corpus_dir_internal()
    internal_parent = str(Path(internal_path).parent)
    options: dict[str, Any] = {
        "internal": {
            "id": "internal",
            "label": "Internal storage",
            "install_path": internal_path,
            "free_bytes": _free_bytes_at_path(internal_parent),
        },
        "sd_card": None,
    }
    sd_mount = discover_sd_card_mount_base()
    if sd_mount:
        sd_path = default_corpus_dir_sd(sd_mount)
        options["sd_card"] = {
            "id": "sd_card",
            "label": "SD card",
            "install_path": sd_path,
            "mount": sd_mount,
            "free_bytes": _free_bytes_at_path(sd_mount),
        }
    return options


def sanitize_corpus_install_dir(install_dir: str) -> str:
    """Resolve install dir and refuse paths outside home or SteamOS SD mounts."""
    expanded = os.path.expanduser(str(install_dir or "").strip())
    if not expanded:
        raise ValueError("Install path is required.")
    target = Path(expanded).resolve()
    if not is_allowed_corpus_install_path(target):
        raise ValueError(
            "Knowledge base install path must be under your home directory or SD card (/run/media/…)."
        )
    return str(target)


def resolve_corpus_db_path(settings: dict) -> Optional[str]:
    """Return absolute path to corpus.db when configured and present."""
    path = str(settings.get("rag_corpus_path") or "").strip()
    if not path:
        return None
    db = os.path.join(path, CORPUS_DB_FILENAME)
    return db if os.path.isfile(db) else None


def corpus_install_root(path: str) -> str:
    """Normalize install directory (contains corpus.db + manifest)."""
    p = str(path or "").strip()
    if not p:
        return ""
    if os.path.basename(p) == CORPUS_DB_FILENAME:
        return os.path.dirname(p)
    return p


def parse_manifest_json(raw: Any) -> dict[str, Any]:
    """Validate minimal manifest fields."""
    if not isinstance(raw, dict):
        raise ValueError("manifest must be a JSON object")
    version = str(raw.get("version") or "").strip()
    if not version:
        raise ValueError("manifest.version is required")
    chunks = raw.get("chunks")
    if chunks is not None and not isinstance(chunks, list):
        raise ValueError("manifest.chunks must be a list when present")
    return raw


def load_manifest_from_path(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as fp:
        return parse_manifest_json(json.load(fp))


def write_manifest(path: str, manifest: dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(manifest, fp, indent=2, sort_keys=True)
        fp.write("\n")


def apply_schema(conn: Any) -> None:
    conn.executescript(CREATE_SCHEMA_SQL)
    conn.executescript(FTS_SYNC_TRIGGERS_SQL)
    conn.commit()
