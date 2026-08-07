#!/usr/bin/env python3
"""Build the bonsAI on-Deck knowledge base corpus (maintainer PC).

Creates SQLite + FTS5 (+ optional vector placeholders), compresses for distribution,
and emits corpus-manifest.json + ATTRIBUTIONS.md. Corpus is never committed to git.

Usage:
  python scripts/build_rag_db.py --seed --out ./build/knowledge-base
  python scripts/build_rag_db.py --out ./build/knowledge-base   # scaffold only (no crawl in v1)

Output goes under ``build/``, not ``dist/``: ``npm run build`` clears ``dist/``, so a corpus
built there was deleted by the next plugin build with no warning.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import sys
import urllib.request
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
PY_MODULES = REPO_ROOT / "py_modules"
KB_DATA_DIR = REPO_ROOT / "data" / "kb"
if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))

from backend.services.knowledge_base_schema import (  # noqa: E402
    CORPUS_ATTRIBUTIONS_FILENAME,
    CORPUS_DB_FILENAME,
    CORPUS_MANIFEST_FILENAME,
    CORPUS_SCHEMA_VERSION,
    DEFAULT_EMBEDDING_DIM,
    DEFAULT_EMBEDDING_MODEL,
    EMBEDDING_VARIANT,
    apply_schema,
    normalize_alias,
    pack_embedding_vector,
    write_manifest,
)
from backend.services.ollama_embed_service import format_embed_document  # noqa: E402


def _list_installed_ollama_tags(base_http: str, timeout_seconds: float = 5.0) -> list[str]:
    url = f"{base_http.rstrip('/')}/api/tags"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        models = data.get("models") if isinstance(data, dict) else None
        if not isinstance(models, list):
            return []
        tags: list[str] = []
        for m in models:
            if isinstance(m, dict):
                name = str(m.get("name") or "").strip()
                if name:
                    tags.append(name)
        return tags
    except Exception:
        return []


DEFAULT_BUILD_OLLAMA_BASE = "http://127.0.0.1:11434"

# One request per 16 rows rather than one request for the entire corpus. A single request
# scales badly with corpus depth (Phase 5 takes the seed from 22 sections to ~100+), gives no
# progress, and cannot resume.
EMBED_BATCH_SIZE = 16


class _BuildEmbedError(Exception):
    pass


def _embed_texts_build(
    base_http: str,
    texts: list[str],
    *,
    model: str,
    timeout_s: float,
) -> list[list[float]]:
    url = f"{base_http.rstrip('/')}/api/embed"
    payload = {"model": model, "input": texts[0] if len(texts) == 1 else texts}
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    embeddings = data.get("embeddings") if isinstance(data, dict) else None
    if not isinstance(embeddings, list) or len(embeddings) != len(texts):
        raise _BuildEmbedError("invalid embed response")
    return [[float(x) for x in item] for item in embeddings]


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fp:
        for chunk in iter(lambda: fp.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _load_json(path: Path) -> Any:
    with open(path, "r", encoding="utf-8") as fp:
        return json.load(fp)


def _seed_compat_patterns(conn: sqlite3.Connection) -> int:
    path = KB_DATA_DIR / "compat_patterns.json"
    if not path.is_file():
        return 0
    rows = _load_json(path)
    if not isinstance(rows, list):
        return 0
    conn.executemany(
        "INSERT INTO compat_patterns(pattern_id, topic, platforms, card, source_url, source_license) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        [
            (
                int(r["pattern_id"]),
                str(r["topic"]),
                json.dumps(r.get("platforms") or []),
                str(r["card"]),
                str(r.get("source_url") or ""),
                str(r.get("source_license") or ""),
            )
            for r in rows
        ],
    )
    return len(rows)


def _seed_strategy_corpus(conn: sqlite3.Connection, crawled: str) -> None:
    path = KB_DATA_DIR / "strategy_seed.json"
    if not path.is_file():
        seed_sample_corpus_legacy(conn)
        return
    data = _load_json(path)
    games = data.get("games") or []
    conn.executemany(
        "INSERT INTO games(game_id, app_id, igdb_id, canonical_title, edition, platform, genres) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            (
                int(g["game_id"]),
                g.get("app_id"),
                g.get("igdb_id"),
                str(g["canonical_title"]),
                g.get("edition"),
                g.get("platform"),
                json.dumps(g.get("genres") or []),
            )
            for g in games
        ],
    )
    aliases = data.get("aliases") or []
    conn.executemany(
        "INSERT INTO aliases(alias_normalized, game_id) VALUES (?, ?)",
        [(normalize_alias(str(a["alias"])), int(a["game_id"])) for a in aliases],
    )
    sections = data.get("sections") or []
    conn.executemany(
        "INSERT INTO sections(section_id, game_id, section_type, name, card, source_url, "
        "source_license, source_version, crawled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                int(s["section_id"]),
                int(s["game_id"]),
                str(s["section_type"]),
                str(s["name"]),
                str(s["card"]),
                str(s.get("source_url") or ""),
                str(s.get("source_license") or ""),
                s.get("source_version"),
                crawled,
            )
            for s in sections
        ],
    )
    genre_patterns = data.get("genre_patterns") or []
    conn.executemany(
        "INSERT INTO genre_patterns(pattern_id, genre_tags, card, source_license) VALUES (?, ?, ?, ?)",
        [
            (
                int(p["pattern_id"]),
                str(p["genre_tags"]),
                str(p["card"]),
                str(p.get("source_license") or ""),
            )
            for p in genre_patterns
        ],
    )


def seed_sample_corpus_legacy(conn: sqlite3.Connection) -> None:
    """Fallback when strategy_seed.json is missing."""
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
        (normalize_alias("ship of harkinian"), 1),
        (normalize_alias("deep rock galactic survivor"), 2),
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
            "Weak point: tail when he rolls.",
            "https://zelda.fandom.com/wiki/King_Dodongo",
            "CC-BY-SA-3.0",
            "1.0",
            crawled,
        ),
        (
            3,
            2,
            "boss",
            "Glyphid Dreadnought",
            "Kite the Dreadnought between waves.",
            "",
            "bonsAI-maintainer",
            "seed-1.0",
            crawled,
        ),
    ]
    conn.executemany(
        "INSERT INTO sections(section_id, game_id, section_type, name, card, source_url, "
        "source_license, source_version, crawled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        sections,
    )


def seed_sample_corpus(conn: sqlite3.Connection) -> None:
    """Seed dev/sample rows: 11-title strategy mix + shared compat tip sheet."""
    crawled = _utc_now()
    _seed_strategy_corpus(conn, crawled)
    tip_count = _seed_compat_patterns(conn)
    if tip_count == 0:
        conn.execute(
            "INSERT INTO compat_patterns(pattern_id, topic, platforms, card, source_url, source_license) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                1,
                "proton",
                json.dumps(["deck", "linux"]),
                "Common Deck Proton steps: verify Proton Experimental, clear shader cache, check ProtonDB.",
                "",
                "bonsAI-maintainer",
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

## Compat patterns (shared troubleshooting tips)

- Maintainer seed tips (`bonsAI-maintainer`) — Deck, Proton, Steam Input, streaming, etc.

## Maintainer-authored

- Genre pattern library entries marked `bonsAI-maintainer` in the database
- Strategy seed cards for interim 11-title QA mix (DRG Survivor, OoT, L4D2, BG3, …)

Per-reply attribution also appears in Input transparency when cards are injected.
"""
    (out_dir / CORPUS_ATTRIBUTIONS_FILENAME).write_text(text, encoding="utf-8")


def compress_db(db_path: Path) -> Path:
    """zlib-compress corpus.db for release chunks (stdlib; Deck decompresses with zlib)."""
    out = db_path.with_suffix(db_path.suffix + ".zlib")
    data = db_path.read_bytes()
    out.write_bytes(zlib.compress(data, level=9))
    return out


def _populate_vectors_for_table(
    conn: sqlite3.Connection,
    *,
    table: str,
    id_column: str,
    select_sql: str,
    ollama_base: str = DEFAULT_BUILD_OLLAMA_BASE,
    model: str = DEFAULT_EMBEDDING_MODEL,
    timeout_s: float = 120.0,
) -> int:
    tags = _list_installed_ollama_tags(ollama_base, timeout_seconds=5.0)
    model_l = model.lower()
    if not any(t.lower() == model_l or t.lower().startswith(f"{model_l}:") for t in tags):
        print(f"Skipping {table} embeddings: {model} not installed on {ollama_base}", file=sys.stderr)
        return 0

    rows = conn.execute(select_sql).fetchall()
    if not rows:
        return 0

    total = len(rows)
    populated = 0
    cleared = False
    print(f"Embedding {total} rows for {table} (batch {EMBED_BATCH_SIZE})...", file=sys.stderr)

    for start in range(0, total, EMBED_BATCH_SIZE):
        batch = rows[start : start + EMBED_BATCH_SIZE]
        # Document task prefix — must stay paired with format_embed_query() at retrieval
        # time. The pairing is what EMBEDDING_VARIANT in the manifest records.
        texts = [format_embed_document(f"{row[1]}\n{row[2]}", model=model) for row in batch]
        try:
            vectors = _embed_texts_build(
                ollama_base,
                texts,
                model=model,
                timeout_s=timeout_s,
            )
        except (_BuildEmbedError, OSError, urllib.error.URLError) as exc:
            if not cleared:
                # Nothing has been deleted yet, so the corpus keeps whatever vectors it had.
                print(f"Skipping {table} embeddings: {exc}", file=sys.stderr)
                return 0
            print(
                f"WARNING: {table} embeddings stopped after {populated}/{total} rows: {exc}\n"
                f"         The table is now partially populated. Re-run the build.",
                file=sys.stderr,
            )
            conn.commit()
            return populated

        # Clear only once the host has actually answered. The previous code deleted the whole
        # table before the single embed request, so any failure wiped existing vectors and
        # left nothing to fall back on.
        if not cleared:
            conn.execute(f"DELETE FROM {table}")
            cleared = True

        for row, vector in zip(batch, vectors):
            if len(vector) != DEFAULT_EMBEDDING_DIM:
                print(
                    f"Skipping {table} {row[0]}: expected dim {DEFAULT_EMBEDDING_DIM}, "
                    f"got {len(vector)}",
                    file=sys.stderr,
                )
                continue
            conn.execute(
                f"INSERT INTO {table}({id_column}, embedding) VALUES (?, ?)",
                (int(row[0]), pack_embedding_vector(vector)),
            )
            populated += 1
        conn.commit()
        print(f"  {table}: {min(start + EMBED_BATCH_SIZE, total)}/{total}", file=sys.stderr)

    return populated


def populate_section_vectors(
    conn: sqlite3.Connection,
    *,
    ollama_base: str = DEFAULT_BUILD_OLLAMA_BASE,
    model: str = DEFAULT_EMBEDDING_MODEL,
    timeout_s: float = 120.0,
) -> tuple[bool, int]:
    """Embed section cards when local Ollama has ``model``; returns (populated, count)."""
    count = _populate_vectors_for_table(
        conn,
        table="section_vectors",
        id_column="section_id",
        select_sql="SELECT section_id, name, card FROM sections ORDER BY section_id",
        ollama_base=ollama_base,
        model=model,
        timeout_s=timeout_s,
    )
    return count > 0, count


def populate_compat_vectors(
    conn: sqlite3.Connection,
    *,
    ollama_base: str = DEFAULT_BUILD_OLLAMA_BASE,
    model: str = DEFAULT_EMBEDDING_MODEL,
    timeout_s: float = 120.0,
) -> tuple[bool, int]:
    """Embed compat tip cards; returns (populated, count)."""
    count = _populate_vectors_for_table(
        conn,
        table="compat_pattern_vectors",
        id_column="pattern_id",
        select_sql="SELECT pattern_id, topic, card FROM compat_patterns ORDER BY pattern_id",
        ollama_base=ollama_base,
        model=model,
        timeout_s=timeout_s,
    )
    return count > 0, count


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
        conn.execute("INSERT INTO sections_fts(sections_fts) VALUES('rebuild')")
        conn.execute("INSERT INTO compat_patterns_fts(compat_patterns_fts) VALUES('rebuild')")
        section_populated, embedding_section_count = populate_section_vectors(conn)
        compat_populated, embedding_compat_count = populate_compat_vectors(conn)
        embeddings_populated = section_populated or compat_populated
        conn.commit()
        # Ship a single self-contained file. The schema opens WAL, so without this the tail of
        # the corpus can sit in a -wal that is not part of the release, and the Deck now opens
        # the DB with immutable=1, which ignores a WAL outright. DELETE mode folds it back in;
        # VACUUM then reclaims the space the build churned.
        conn.execute("PRAGMA journal_mode=DELETE")
        conn.isolation_level = None  # VACUUM cannot run inside sqlite3's implicit transaction
        conn.execute("VACUUM")
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
        "embedding_variant": EMBEDDING_VARIANT,
        "embeddings_populated": embeddings_populated,
        "embedding_section_count": embedding_section_count,
        "embedding_compat_count": embedding_compat_count,
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
    # Not under dist/ -- `npm run build` clears that directory and would delete the corpus.
    parser.add_argument("--out", type=Path, default=Path("build/knowledge-base"), help="Output directory")
    parser.add_argument("--seed", action="store_true", help="Include sample games/sections for dev QA")
    args = parser.parse_args()
    manifest = build_corpus(args.out, seed=args.seed)
    print(json.dumps(manifest, indent=2))
    print(f"Wrote {args.out / CORPUS_DB_FILENAME} and manifest version {manifest['version']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
