#!/usr/bin/env python3
"""Build the bonsAI on-Deck knowledge base corpus (maintainer PC).

Creates SQLite + FTS5 (+ optional vector placeholders), compresses for distribution,
and emits corpus-manifest.json + ATTRIBUTIONS.md. Corpus is never committed to git.

Usage:
  python scripts/build_rag_db.py --seed --out ./dist/knowledge-base
  python scripts/build_rag_db.py --out ./dist/knowledge-base   # scaffold only (no crawl in v1)
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import sys
import zlib
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PY_MODULES = REPO_ROOT / "py_modules"
if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))

from backend.services.knowledge_base_schema import (  # noqa: E402
    CORPUS_ATTRIBUTIONS_FILENAME,
    CORPUS_DB_FILENAME,
    CORPUS_MANIFEST_FILENAME,
    CORPUS_SCHEMA_VERSION,
    DEFAULT_EMBEDDING_DIM,
    DEFAULT_EMBEDDING_MODEL,
    apply_schema,
    normalize_alias,
    write_manifest,
)


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fp:
        for chunk in iter(lambda: fp.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def seed_sample_corpus(conn: sqlite3.Connection) -> None:
    """Seed dev/sample rows: OoT (alias QA) + Deep Rock Galactic: Survivor (primary Deck QA title)."""
    crawled = _utc_now()
    games = [
        (1, "413150", None, "The Legend of Zelda: Ocarina of Time", "N64", "Nintendo 64", '["action-adventure"]'),
        (
            2,
            "2321470",
            None,
            "Deep Rock Galactic: Survivor",
            "PC",
            "Steam",
            '["bullet-heaven","roguelike","action"]',
        ),
    ]
    conn.executemany(
        "INSERT INTO games(game_id, app_id, igdb_id, canonical_title, edition, platform, genres) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        games,
    )
    aliases = [
        (normalize_alias("ocarina of time"), 1),
        (normalize_alias("oot"), 1),
        (normalize_alias("zelda oot"), 1),
        (normalize_alias("ship of harkinian"), 1),
        (normalize_alias("soh"), 1),
        (normalize_alias("deep rock galactic survivor"), 2),
        (normalize_alias("drg survivor"), 2),
        (normalize_alias("drgs"), 2),
    ]
    conn.executemany(
        "INSERT INTO aliases(alias_normalized, game_id) VALUES (?, ?)",
        aliases,
    )
    sections = [
        (
            1,
            1,
            "boss",
            "King Dodongo",
            "Weak point: tail when he rolls. Toss bombs into his mouth when he inhales. "
            "Stay near the edge of the arena and roll through his fire breath.",
            "https://zelda.fandom.com/wiki/King_Dodongo",
            "CC-BY-SA-3.0",
            "1.0",
            crawled,
        ),
        (
            2,
            1,
            "dungeon",
            "Water Temple",
            "Raise/low water with Iron Boots and Longshot. Map the central pillar first; "
            "note which triforce gates need water level changes.",
            "https://zelda.fandom.com/wiki/Water_Temple",
            "CC-BY-SA-3.0",
            None,
            crawled,
        ),
        (
            3,
            2,
            "boss",
            "Glyphid Dreadnought",
            "Kite the Dreadnought between waves; focus weak-point armor plates as they open. "
            "Save overclock/nuke for armor break windows. Prioritize movement tech over raw DPS early.",
            "",
            "bonsAI-maintainer",
            "seed-1.0",
            crawled,
        ),
        (
            4,
            2,
            "area",
            "Hollow Bough",
            "Biome hazard: sticky webs and reduced visibility — take a mobility-focused build or "
            "clear web shooters first. XP magnet perks help during swarm-heavy waves.",
            "",
            "bonsAI-maintainer",
            None,
            crawled,
        ),
    ]
    conn.executemany(
        "INSERT INTO sections(section_id, game_id, section_type, name, card, source_url, "
        "source_license, source_version, crawled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        sections,
    )
    conn.execute(
        "INSERT INTO genre_patterns(pattern_id, genre_tags, card, source_license) VALUES (?, ?, ?, ?)",
        (
            1,
            "soulslike",
            "Soulslike basics: learn dodge timing, stamina management, and safe heal windows. "
            "Summon spirits/allies when available; upgrade vigor before glass-cannon damage.",
            "bonsAI-maintainer",
        ),
    )
    conn.execute(
        "INSERT INTO compat_patterns(pattern_id, topic, card, source_url, source_license) VALUES (?, ?, ?, ?, ?)",
        (
            1,
            "proton",
            "Common Deck Proton steps: verify Proton Experimental or game-forced version, "
            "clear shader cache, disable overlays, try fullscreen vs borderless, check ProtonDB for launch options.",
            "https://www.gamingonlinux.com/",
            "attribution-required",
        ),
    )
    conn.commit()


def write_attributions(out_dir: Path) -> None:
    text = """# bonsAI Knowledge Base — Attributions

This corpus is distributed separately from the bonsAI plugin. Wiki-derived strategy cards
are adaptations of third-party content; design assumes CC BY-SA obligations apply.

## Strategy cards (sample / seed build)

- The Legend of Zelda: Ocarina of Time — Fandom wiki (CC BY-SA 3.0)
- Deep Rock Galactic: Survivor — maintainer seed cards (`bonsAI-maintainer`) for Deck QA

## Compat patterns

- GamingOnLinux — link and attribute when quoting community guidance

## Maintainer-authored

- Genre pattern library entries marked `bonsAI-maintainer` in the database

Per-reply attribution also appears in Input transparency when cards are injected.
"""
    (out_dir / CORPUS_ATTRIBUTIONS_FILENAME).write_text(text, encoding="utf-8")


def compress_db(db_path: Path) -> Path:
    """zlib-compress corpus.db for release chunks (stdlib; Deck decompresses with zlib)."""
    out = db_path.with_suffix(db_path.suffix + ".zlib")
    data = db_path.read_bytes()
    out.write_bytes(zlib.compress(data, level=9))
    return out


def build_corpus(out_dir: Path, *, seed: bool) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    db_path = out_dir / CORPUS_DB_FILENAME
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(str(db_path))
    try:
        apply_schema(conn)
        if seed:
            seed_sample_corpus(conn)
        # Rebuild FTS index after bulk insert
        conn.execute("INSERT INTO sections_fts(sections_fts) VALUES('rebuild')")
        conn.commit()
    finally:
        conn.close()

    compressed = compress_db(db_path)
    db_sha = _sha256_file(str(db_path))
    chunk_sha = _sha256_file(str(compressed))
    version = datetime.now(timezone.utc).strftime("%Y.%m.%d")

    manifest = {
        "version": version,
        "schema_version": CORPUS_SCHEMA_VERSION,
        "embedding_model": DEFAULT_EMBEDDING_MODEL,
        "embedding_dim": DEFAULT_EMBEDDING_DIM,
        "db_filename": CORPUS_DB_FILENAME,
        "db_sha256": db_sha,
        "compressed_filename": compressed.name,
        "compressed_sha256": chunk_sha,
        "compressed_bytes": compressed.stat().st_size,
        "uncompressed_bytes": db_path.stat().st_size,
        "published_at": _utc_now(),
        "chunks": [
            {
                "filename": compressed.name,
                "sha256": chunk_sha,
                "bytes": compressed.stat().st_size,
                "compression": "zlib",
            }
        ],
        "urls": {
            "huggingface": f"https://huggingface.co/datasets/cantcurecancer/bonsai-knowledge-base/resolve/main/{compressed.name}",
            "github_release": f"https://github.com/cantcurecancer/bonsAI/releases/download/knowledge-base-{version}/{compressed.name}",
        },
    }
    write_attributions(out_dir)
    manifest["attributions_markdown"] = (out_dir / CORPUS_ATTRIBUTIONS_FILENAME).read_text(encoding="utf-8")
    write_manifest(str(out_dir / CORPUS_MANIFEST_FILENAME), manifest)
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Build bonsAI knowledge base corpus")
    parser.add_argument("--out", type=Path, default=Path("dist/knowledge-base"), help="Output directory")
    parser.add_argument("--seed", action="store_true", help="Include sample games/sections for dev QA")
    args = parser.parse_args()
    manifest = build_corpus(args.out, seed=args.seed)
    print(json.dumps(manifest, indent=2))
    print(f"Wrote {args.out / CORPUS_DB_FILENAME} and manifest version {manifest['version']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
