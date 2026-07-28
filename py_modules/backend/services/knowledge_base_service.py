"""On-Deck knowledge base retrieval (FTS5 + optional hybrid vector re-rank for Strategy)."""

from __future__ import annotations

import os
import re
import sqlite3
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Literal, Optional

from backend.services.knowledge_base_schema import (
    CORPUS_MANIFEST_FILENAME,
    DEFAULT_EMBEDDING_MODEL,
    TRUST_TIER_FALLBACK,
    TRUST_TIER_WIKI_NO_PATCH,
    TRUST_TIER_WIKI_VERIFIED,
    corpus_has_usable_vectors,
    load_manifest_from_path,
    normalize_alias,
    resolve_corpus_db_path,
    unpack_embedding_vector,
)
from backend.services.ollama_embed_service import OllamaEmbedError, embed_texts, nomic_embed_available
from backend.services.ollama_prompts import question_matches_troubleshooting_log_context

HYBRID_FTS_SHORTLIST_K = 30
RetrievalMethod = Literal["keyword", "hybrid", "keyword_embed_unavailable"]
_CONN_LOCK = threading.Lock()
_CONN_BY_PATH: dict[str, sqlite3.Connection] = {}


@dataclass
class KnowledgeCard:
    section_id: int
    game_id: int
    game_title: str
    section_type: str
    name: str
    card: str
    source_url: str
    source_license: str
    source_version: Optional[str]
    crawled_at: Optional[str]
    trust_tier: str


@dataclass
class KnowledgeRetrievalResult:
    attached: bool
    text_block: str = ""
    trust_tier: str = TRUST_TIER_FALLBACK
    sources: list[dict[str, str]] = field(default_factory=list)
    notes: str = ""
    timing_ms: dict[str, float] = field(default_factory=dict)
    unavailable_reason: str = ""
    retrieval_method: RetrievalMethod = "keyword"


def _budget_for_mode(ask_mode: str) -> tuple[int, int]:
    """Return (top_k, max_bytes) adaptive by Ask mode."""
    mode = (ask_mode or "speed").strip().lower()
    if mode == "expert":
        return 5, 10_240
    if mode == "strategy":
        return 3, 6_144
    return 1, 2_048


def should_retrieve_knowledge(
    *,
    use_local_knowledge_base: bool,
    ask_mode: str,
    question: str,
    app_id: str,
    app_name: str,
) -> tuple[bool, str]:
    """Return (should_run, domain) where domain is strategy|compat|empty."""
    if not use_local_knowledge_base:
        return False, ""
    aid = str(app_id or "").strip()
    aname = str(app_name or "").strip()
    mode = (ask_mode or "speed").strip().lower()
    if mode == "strategy" and (aid or aname):
        return True, "strategy"
    if question_matches_troubleshooting_log_context(question):
        return True, "compat"
    return False, ""


def _get_connection(db_path: str) -> sqlite3.Connection:
    with _CONN_LOCK:
        conn = _CONN_BY_PATH.get(db_path)
        if conn is None:
            conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            _CONN_BY_PATH[db_path] = conn
        return conn


def close_connection(db_path: str) -> None:
    with _CONN_LOCK:
        conn = _CONN_BY_PATH.pop(db_path, None)
        if conn is not None:
            try:
                conn.close()
            except sqlite3.Error:
                pass


def _expand_query(question: str, app_name: str) -> str:
    """Rule-based query expansion (no LLM)."""
    parts = [question or ""]
    if app_name:
        parts.append(app_name)
    return " ".join(p.strip() for p in parts if p.strip())


def _resolve_game_id(
    conn: sqlite3.Connection,
    *,
    app_id: str,
    app_name: str,
    shortcut_name: str,
) -> tuple[Optional[int], str]:
    """AppID-first, then alias table. Returns (game_id, resolution_note)."""
    aid = str(app_id or "").strip()
    if aid.isdigit():
        row = conn.execute(
            "SELECT game_id FROM games WHERE app_id = ? LIMIT 1",
            (aid,),
        ).fetchone()
        if row:
            return int(row["game_id"]), f"app_id:{aid}"

    candidates: list[str] = []
    if app_name:
        candidates.append(normalize_alias(app_name))
    if shortcut_name:
        candidates.append(normalize_alias(shortcut_name))
    for cand in candidates:
        if not cand:
            continue
        row = conn.execute(
            "SELECT game_id FROM aliases WHERE alias_normalized = ? LIMIT 1",
            (cand,),
        ).fetchone()
        if row:
            return int(row["game_id"]), f"alias:{cand}"
        row = conn.execute(
            "SELECT game_id FROM games WHERE lower(canonical_title) = ? LIMIT 1",
            (cand,),
        ).fetchone()
        if row:
            return int(row["game_id"]), f"title:{cand}"
    return None, "unresolved"


def _trust_tier_for_row(row: sqlite3.Row) -> str:
    if row["source_version"]:
        return TRUST_TIER_WIKI_VERIFIED
    if row["source_url"]:
        return TRUST_TIER_WIKI_NO_PATCH
    return TRUST_TIER_FALLBACK


def _load_corpus_manifest(settings: dict) -> Optional[dict[str, Any]]:
    root = str(settings.get("rag_corpus_path") or "").strip()
    if not root:
        return None
    manifest_path = os.path.join(root, CORPUS_MANIFEST_FILENAME)
    if not os.path.isfile(manifest_path):
        return None
    try:
        return load_manifest_from_path(manifest_path)
    except Exception:
        return None


def _dot_similarity(a: list[float], b: list[float]) -> float:
    """Cosine similarity for L2-normalized Ollama embeddings (dot product)."""
    return sum(x * y for x, y in zip(a, b))


def _load_section_vectors(conn: sqlite3.Connection, section_ids: list[int]) -> dict[int, list[float]]:
    if not section_ids:
        return {}
    placeholders = ",".join("?" for _ in section_ids)
    rows = conn.execute(
        f"SELECT section_id, embedding FROM section_vectors "
        f"WHERE section_id IN ({placeholders}) AND embedding IS NOT NULL",
        section_ids,
    ).fetchall()
    out: dict[int, list[float]] = {}
    for row in rows:
        vec = unpack_embedding_vector(bytes(row["embedding"]))
        if vec:
            out[int(row["section_id"])] = vec
    return out


def _rerank_cards_by_vector(
    cards: list[KnowledgeCard],
    query_vector: list[float],
    vectors_by_id: dict[int, list[float]],
    *,
    top_k: int,
) -> list[KnowledgeCard]:
    scored: list[tuple[float, KnowledgeCard]] = []
    unscored: list[KnowledgeCard] = []
    for card in cards:
        vec = vectors_by_id.get(card.section_id)
        if vec:
            scored.append((_dot_similarity(query_vector, vec), card))
        else:
            unscored.append(card)
    scored.sort(key=lambda item: item[0], reverse=True)
    ordered = [card for _, card in scored] + unscored
    return ordered[:top_k]


def _search_sections(
    conn: sqlite3.Connection,
    *,
    game_id: Optional[int],
    query: str,
    top_k: int,
) -> list[KnowledgeCard]:
    q = (query or "").strip()
    if not q:
        return []
    # FTS5 MATCH — OR-join tokens for recall (AND is too strict with query expansion).
    tokens = re.findall(r"\w+", q)[:12]
    if not tokens:
        return []
    fts_q = " OR ".join(f'"{tok}"' for tok in tokens)
    if not fts_q:
        return []
    if game_id is not None:
        sql = (
            "SELECT s.section_id, s.game_id, g.canonical_title, s.section_type, s.name, s.card, "
            "s.source_url, s.source_license, s.source_version, s.crawled_at "
            "FROM sections_fts f "
            "JOIN sections s ON s.section_id = f.rowid "
            "JOIN games g ON g.game_id = s.game_id "
            "WHERE sections_fts MATCH ? AND s.game_id = ? "
            "ORDER BY rank LIMIT ?"
        )
        rows = conn.execute(sql, (fts_q, game_id, top_k)).fetchall()
    else:
        sql = (
            "SELECT s.section_id, s.game_id, g.canonical_title, s.section_type, s.name, s.card, "
            "s.source_url, s.source_license, s.source_version, s.crawled_at "
            "FROM sections_fts f "
            "JOIN sections s ON s.section_id = f.rowid "
            "JOIN games g ON g.game_id = s.game_id "
            "WHERE sections_fts MATCH ? "
            "ORDER BY rank LIMIT ?"
        )
        rows = conn.execute(sql, (fts_q, top_k)).fetchall()

    out: list[KnowledgeCard] = []
    for row in rows:
        out.append(
            KnowledgeCard(
                section_id=int(row["section_id"]),
                game_id=int(row["game_id"]),
                game_title=str(row["canonical_title"] or ""),
                section_type=str(row["section_type"] or ""),
                name=str(row["name"] or ""),
                card=str(row["card"] or ""),
                source_url=str(row["source_url"] or ""),
                source_license=str(row["source_license"] or ""),
                source_version=row["source_version"],
                crawled_at=row["crawled_at"],
                trust_tier=_trust_tier_for_row(row),
            )
        )
    return out


def _genre_fallback(conn: sqlite3.Connection, game_id: Optional[int]) -> Optional[str]:
    genres = ""
    if game_id is not None:
        row = conn.execute("SELECT genres FROM games WHERE game_id = ?", (game_id,)).fetchone()
        if row and row["genres"]:
            genres = str(row["genres"]).lower()
    row = conn.execute(
        "SELECT card FROM genre_patterns ORDER BY pattern_id LIMIT 1"
    ).fetchone()
    if row and "soulslike" in genres:
        pat = conn.execute(
            "SELECT card FROM genre_patterns WHERE genre_tags LIKE '%soulslike%' LIMIT 1"
        ).fetchone()
        if pat:
            return str(pat["card"])
    if row:
        return str(row["card"])
    return None


def _compat_fallback(conn: sqlite3.Connection, question: str) -> Optional[str]:
    _ = question
    row = conn.execute(
        "SELECT card, source_url FROM compat_patterns WHERE topic = 'proton' LIMIT 1"
    ).fetchone()
    if row:
        return str(row["card"])
    return None


def _format_block(
    cards: list[KnowledgeCard],
    *,
    fallback_text: Optional[str],
    domain: str,
    max_bytes: int,
) -> tuple[str, str, list[dict[str, str]]]:
    lines: list[str] = [
        "--- Local knowledge base (bonsAI; offline corpus; may be truncated) ---",
        f"Domain: {domain}",
    ]
    sources: list[dict[str, str]] = []
    trust = TRUST_TIER_FALLBACK
    if cards:
        trust = cards[0].trust_tier
        for c in cards:
            tier = c.trust_tier
            lines.append(
                f"\n[{c.game_title} / {c.section_type}: {c.name}] (trust: {tier})\n{c.card}"
            )
            if c.source_url:
                sources.append(
                    {
                        "title": f"{c.game_title} — {c.name}",
                        "url": c.source_url,
                        "license": c.source_license or "",
                    }
                )
    elif fallback_text:
        lines.append(f"\n[Genre/compat fallback] (trust: {TRUST_TIER_FALLBACK})\n{fallback_text}")
        trust = TRUST_TIER_FALLBACK
    else:
        return "", trust, sources

    lines.append("\n--- End local knowledge base ---")
    text = "\n".join(lines)
    if len(text.encode("utf-8")) > max_bytes:
        text = text.encode("utf-8")[:max_bytes].decode("utf-8", errors="ignore")
        text += "\n[…truncated to byte budget]"
    return text, trust, sources


def lookup_game_genres(settings: dict, app_id: str) -> str:
    """Return comma-separated Steam genres for AppID from the local KB corpus, if available."""
    aid = str(app_id or "").strip()
    if not aid:
        return ""
    db_path = resolve_corpus_db_path(settings)
    if not db_path:
        return ""
    try:
        conn = _get_connection(db_path)
        row = conn.execute(
            "SELECT genres FROM games WHERE app_id = ? LIMIT 1",
            (aid,),
        ).fetchone()
        if row and row["genres"]:
            return str(row["genres"]).strip()
    except Exception:
        return ""
    return ""


def retrieve_knowledge_context(
    settings: dict,
    *,
    ask_mode: str,
    question: str,
    app_id: str,
    app_name: str,
    shortcut_name: str = "",
    domain: str,
    pc_ip: str = "",
) -> KnowledgeRetrievalResult:
    """Retrieve and format knowledge for early_context_suffix injection."""
    t0 = time.perf_counter()
    db_path = resolve_corpus_db_path(settings)
    if not db_path:
        return KnowledgeRetrievalResult(
            attached=False,
            unavailable_reason="corpus_missing",
            timing_ms={"total_ms": round((time.perf_counter() - t0) * 1000, 2)},
        )

    top_k, max_bytes = _budget_for_mode(ask_mode)
    retrieval_method: RetrievalMethod = "keyword"
    embed_ms = 0.0
    rerank_ms = 0.0
    try:
        conn = _get_connection(db_path)
        t_resolve = time.perf_counter()
        game_id, resolution = _resolve_game_id(
            conn,
            app_id=app_id,
            app_name=app_name,
            shortcut_name=shortcut_name,
        )
        resolve_ms = round((time.perf_counter() - t_resolve) * 1000, 2)

        expanded = _expand_query(question, app_name)
        manifest = _load_corpus_manifest(settings)
        hybrid_eligible = domain == "strategy" and game_id is not None
        has_vectors = hybrid_eligible and corpus_has_usable_vectors(conn, manifest)
        nomic_ready = has_vectors and nomic_embed_available(pc_ip, model=DEFAULT_EMBEDDING_MODEL)

        t_fts = time.perf_counter()
        fts_k = HYBRID_FTS_SHORTLIST_K if nomic_ready else top_k
        cards = _search_sections(conn, game_id=game_id, query=expanded, top_k=fts_k)
        fts_ms = round((time.perf_counter() - t_fts) * 1000, 2)

        if nomic_ready and cards:
            t_embed = time.perf_counter()
            try:
                query_vectors = embed_texts(
                    pc_ip,
                    [expanded],
                    model=DEFAULT_EMBEDDING_MODEL,
                    timeout_s=3.0,
                )
                query_vector = query_vectors[0]
                embed_ms = round((time.perf_counter() - t_embed) * 1000, 2)
                t_rerank = time.perf_counter()
                vectors_by_id = _load_section_vectors(conn, [c.section_id for c in cards])
                cards = _rerank_cards_by_vector(
                    cards,
                    query_vector,
                    vectors_by_id,
                    top_k=top_k,
                )
                rerank_ms = round((time.perf_counter() - t_rerank) * 1000, 2)
                retrieval_method = "hybrid"
            except (OllamaEmbedError, IndexError, ValueError):
                embed_ms = round((time.perf_counter() - t_embed) * 1000, 2)
                cards = cards[:top_k]
                retrieval_method = "keyword_embed_unavailable"
        elif cards and fts_k != top_k:
            cards = cards[:top_k]

        fallback_text: Optional[str] = None
        if not cards:
            if domain == "compat":
                fallback_text = _compat_fallback(conn, question)
            else:
                fallback_text = _genre_fallback(conn, game_id)

        text_block, trust, sources = _format_block(
            cards,
            fallback_text=fallback_text,
            domain=domain,
            max_bytes=max_bytes,
        )
        total_ms = round((time.perf_counter() - t0) * 1000, 2)
        if not text_block.strip():
            return KnowledgeRetrievalResult(
                attached=False,
                notes=f"no_hit ({resolution})",
                retrieval_method=retrieval_method,
                timing_ms={
                    "resolve_ms": resolve_ms,
                    "fts_ms": fts_ms,
                    "embed_ms": embed_ms,
                    "rerank_ms": rerank_ms,
                    "total_ms": total_ms,
                },
            )
        return KnowledgeRetrievalResult(
            attached=True,
            text_block=text_block,
            trust_tier=trust,
            sources=sources,
            notes=resolution,
            retrieval_method=retrieval_method,
            timing_ms={
                "resolve_ms": resolve_ms,
                "fts_ms": fts_ms,
                "embed_ms": embed_ms,
                "rerank_ms": rerank_ms,
                "total_ms": total_ms,
            },
        )
    except sqlite3.Error as exc:
        close_connection(db_path)
        return KnowledgeRetrievalResult(
            attached=False,
            unavailable_reason=f"corpus_error:{exc}",
            timing_ms={"total_ms": round((time.perf_counter() - t0) * 1000, 2)},
        )


_CHIP_TEXT_MAX_LEN = 80

# Section types surfaced first for session preset chips (boss / stuck-style).
_CHIP_SECTION_TYPE_ORDER = ("boss", "dungeon", "encounter", "area", "quest")

_COMPAT_CHIP_TEMPLATES: dict[str, str] = {
    "proton": "Any known Proton issues for this game?",
    "deck": "How well does this game run on Deck?",
    "controller": "Any Steam Input issues for this game?",
}


@dataclass
class SessionRagChipCandidate:
    text: str
    category: str
    prefer_ask_mode: Optional[str] = None
    domain: str = ""


@dataclass
class SessionRagChipCandidatesResult:
    ok: bool
    reason: str = ""
    candidates: list[SessionRagChipCandidate] = field(default_factory=list)


def _truncate_chip_text(text: str, max_len: int = _CHIP_TEXT_MAX_LEN) -> str:
    t = " ".join((text or "").split())
    if len(t) <= max_len:
        return t
    cut = t[: max_len - 1].rsplit(" ", 1)[0]
    return (cut or t[: max_len - 1]).rstrip("?., ") + "?"


def _curtail_section_to_chip(section_type: str, name: str) -> str:
    st = (section_type or "").strip().lower()
    n = (name or "").strip()
    if not n:
        return ""
    if st == "boss":
        return _truncate_chip_text(f"How do I beat {n}?")
    if st == "dungeon":
        return _truncate_chip_text(f"How do I get through {n}?")
    if st in ("encounter", "area", "quest"):
        return _truncate_chip_text(f"Tips for {n} in this game?")
    return _truncate_chip_text(f"What should I know about {n}?")


def _curtail_compat_topic_to_chip(topic: str) -> str:
    key = (topic or "").strip().lower()
    template = _COMPAT_CHIP_TEMPLATES.get(key)
    if template:
        return _truncate_chip_text(template)
    if key:
        return _truncate_chip_text(f"Any known {key} issues for this game?")
    return ""


def _list_game_sections_for_chips(
    conn: sqlite3.Connection,
    game_id: int,
    *,
    limit: int = 6,
) -> list[tuple[str, str]]:
    order_cases = " ".join(
        f"WHEN lower(section_type) = '{st}' THEN {i}"
        for i, st in enumerate(_CHIP_SECTION_TYPE_ORDER)
    )
    sql = (
        "SELECT section_type, name FROM sections WHERE game_id = ? "
        f"ORDER BY CASE {order_cases} ELSE 99 END, section_id LIMIT ?"
    )
    rows = conn.execute(sql, (game_id, limit)).fetchall()
    return [(str(r["section_type"] or ""), str(r["name"] or "")) for r in rows]


def _compat_chip_candidates(conn: sqlite3.Connection) -> list[SessionRagChipCandidate]:
    out: list[SessionRagChipCandidate] = []
    seen: set[str] = set()
    rows = conn.execute(
        "SELECT topic FROM compat_patterns ORDER BY pattern_id"
    ).fetchall()
    for row in rows:
        topic = str(row["topic"] or "")
        text = _curtail_compat_topic_to_chip(topic)
        if not text or text in seen:
            continue
        seen.add(text)
        out.append(
            SessionRagChipCandidate(
                text=text,
                category="troubleshooting",
                domain="compat",
            )
        )
    return out


def suggest_chip_candidates(
    settings: dict,
    *,
    app_id: str,
    app_name: str,
    shortcut_name: str = "",
) -> SessionRagChipCandidatesResult:
    """Return curtailed preset-chip prompts from the offline KB for the running game."""
    if settings.get("use_local_knowledge_base") is not True:
        return SessionRagChipCandidatesResult(ok=False, reason="kb_off")

    db_path = resolve_corpus_db_path(settings)
    if not db_path:
        return SessionRagChipCandidatesResult(ok=False, reason="corpus_missing")

    try:
        conn = _get_connection(db_path)
        game_id, resolution = _resolve_game_id(
            conn,
            app_id=app_id,
            app_name=app_name,
            shortcut_name=shortcut_name,
        )

        candidates: list[SessionRagChipCandidate] = []
        seen: set[str] = set()

        if game_id is not None:
            for section_type, name in _list_game_sections_for_chips(conn, game_id):
                text = _curtail_section_to_chip(section_type, name)
                if not text or text in seen:
                    continue
                seen.add(text)
                candidates.append(
                    SessionRagChipCandidate(
                        text=text,
                        category="strategy",
                        prefer_ask_mode="strategy",
                        domain="strategy",
                    )
                )

        for compat in _compat_chip_candidates(conn):
            if compat.text in seen:
                continue
            seen.add(compat.text)
            candidates.append(compat)

        if not candidates:
            note = "app_unresolved" if game_id is None else "no_sections"
            return SessionRagChipCandidatesResult(ok=False, reason=note)

        _ = resolution
        return SessionRagChipCandidatesResult(ok=True, candidates=candidates)
    except sqlite3.Error as exc:
        close_connection(db_path)
        return SessionRagChipCandidatesResult(ok=False, reason=f"corpus_error:{exc}")


def session_rag_chip_candidates_to_rpc(result: SessionRagChipCandidatesResult) -> dict[str, Any]:
    """Serialize chip candidates for Decky RPC."""
    return {
        "ok": result.ok,
        "reason": result.reason,
        "candidates": [
            {
                "text": c.text,
                "category": c.category,
                "prefer_ask_mode": c.prefer_ask_mode,
                "domain": c.domain,
            }
            for c in result.candidates
        ],
    }


def stack_context_blocks(
    *,
    proton_text: str,
    journal_text: str = "",
    knowledge_text: str,
    max_total_bytes: int = 100 * 1024,
) -> str:
    """Stack Proton logs, experiment journal, then knowledge cards under a shared byte budget."""
    parts: list[str] = []
    budget = max_total_bytes
    for label, block in (
        ("proton", proton_text),
        ("journal", journal_text),
        ("knowledge", knowledge_text),
    ):
        chunk = (block or "").strip()
        if not chunk:
            continue
        encoded = chunk.encode("utf-8")
        if len(encoded) > budget:
            chunk = encoded[:budget].decode("utf-8", errors="ignore") + "\n[…truncated]"
            encoded = chunk.encode("utf-8")
        parts.append(chunk)
        budget -= len(encoded)
        if budget <= 0:
            break
        _ = label
    return "\n\n".join(parts)
