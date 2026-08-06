"""Title: Knowledge base service

Purpose: On-Deck knowledge base retrieval (FTS5 + optional hybrid vector re-rank).
Used for: game_ai_request when use_local_knowledge_base is enabled.
Solves: Offline RAG context blocks without cloud dependencies.
Does not: Build UI or manage KB download UI — see KnowledgeBaseSection and rag_corpus_download_service.
"""

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
    corpus_embedding_compatible,
    corpus_has_usable_compat_vectors,
    corpus_has_usable_section_vectors,
    load_manifest_from_path,
    normalize_alias,
    resolve_corpus_db_path,
    unpack_embedding_vector,
)
from backend.services.ollama_embed_service import (
    OllamaEmbedError,
    embed_texts,
    format_embed_query,
    nomic_embed_available,
)
from backend.services.ollama_prompts import question_matches_troubleshooting_log_context

HYBRID_FTS_SHORTLIST_K = 30
# "keyword_hybrid_disabled" is distinct from "keyword_embed_unavailable" on purpose
# (Decision 5): one means the maintainer turned hybrid off, the other means the embed model
# or the corpus could not support it. Collapsing them would send someone hunting for a broken
# Ollama install when they had flipped a Developer toggle. The literal and its labels land
# here in PR1; the setting that produces it is PR2 Stage 6.
RetrievalMethod = Literal[
    "keyword",
    "hybrid",
    "keyword_embed_unavailable",
    "keyword_hybrid_disabled",
]
_CONN_LOCK = threading.Lock()
_CONN_BY_PATH: dict[str, sqlite3.Connection] = {}

# --- Fusion and floor constants ------------------------------------------------------------
#
# PROVISIONAL — every value below is a PR1 placeholder. The final numbers come from the PR2
# bake-off, tuned on the *tune* split and gated on *holdout*; see R1/R3 in
# docs/rag-retrieval-quality-remediation-implementation-plan.md. Do not tune them against the
# current 22-section seed corpus: it is smaller than HYBRID_FTS_SHORTLIST_K, so the shortlist
# swallows it whole and any number derived from it measures the harness, not the ranking.
RRF_K = 60
RRF_W_FTS = 1.0
RRF_W_VEC = 1.0

# Relevance is -bm25(...), so bigger is a better match (FTS5's bm25 is negative, and more
# negative means better; flipping the sign once here keeps every comparison downstream the
# obvious direction).
#
# Deliberately LOOSE (R3): it drops near-certain junk and nothing else. Measured on the seed
# corpus 2026-08-05 — a wholly off-topic Ask ("how do I cook pasta for dinner") scores at most
# 0.75, while genuine hits score 10+. It does NOT catch the stopword-only query, which scores
# 1.9-5.2 because common words match everywhere; that is _fts_match_query's job, not the
# floor's. Too strict here and the KB silently stops attaching, which degrades cleanly but
# invisibly, so PR1 errs toward no-op.
BM25_RELEVANCE_FLOOR = 1.0

# Column weights, highest first. sections_fts is (name, card); compat_patterns_fts is
# (topic, platforms, card). A card whose *title* matches the Ask is a better hit than one
# that mentions the words somewhere in its body.
_SECTIONS_BM25 = "bm25(sections_fts, 10.0, 1.0)"
_COMPAT_BM25 = "bm25(compat_patterns_fts, 5.0, 2.0, 1.0)"


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
    # -bm25(...) at retrieval time; bigger is a better keyword match. Defaulted so callers
    # that build a card outside a search (tests, fallbacks) need not supply one.
    bm25_score: float = 0.0


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
            # immutable=1, not just mode=ro: the shipped corpus is written once on the
            # maintainer PC and never mutated on device. It tells SQLite to skip WAL/locking
            # machinery entirely, which is what makes reads safe on an exFAT SD card where
            # lock files are unreliable. The builder now checkpoints and VACUUMs before
            # shipping, so there is no -wal alongside the file to ignore.
            conn = sqlite3.connect(
                f"file:{db_path}?mode=ro&immutable=1", uri=True, check_same_thread=False
            )
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


def _expand_query(question: str, app_name: str, *, game_resolved: bool = False) -> str:
    """Rule-based query expansion (no LLM).

    The app name is dropped once ``game_resolved`` — the search is already scoped by
    ``game_id``, so the title contributes nothing but BM25 noise, and it inflates exactly the
    cards that happen to repeat the title in their text. On the unresolved path it is the only
    signal narrowing the search, so it goes *first*: appending it put it past the token cap on
    any question of ordinary length, which silently discarded it.
    """
    q = (question or "").strip()
    name = (app_name or "").strip()
    if game_resolved or not name:
        return q
    return " ".join(p for p in (name, q) if p)


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


def _trust_tier_for_compat_row(row: sqlite3.Row) -> str:
    if row["source_url"]:
        return TRUST_TIER_WIKI_NO_PATCH
    return TRUST_TIER_FALLBACK


# Function words only. Every one of these matches somewhere in almost every card, so under an
# OR query they do not narrow anything — they just hand a score to whatever card repeats them
# most. Measured on the seed corpus: the query "the a of and to it is" returned eight cards
# scoring 1.9-5.2, above several genuine compat hits, which is why the relevance floor alone
# cannot fix this.
#
# Deliberately excludes words that carry meaning on a Deck: run, boot, load, save, off, out,
# down, up, no, not, crash, fix, work. Grow this list only with evidence — a wrongly-dropped
# term is invisible, it just quietly stops matching.
_FTS_STOPWORDS = frozenset(
    """
    a an and are as at be been being but by can could did do does doing for from had has have
    how i if in into is it its just me my of on or our so some such than that the their them
    then there these they this those to was we were what when where which while who why will
    with would you your
    """.split()
)

# Raised from 12. With function words gone, 12 was cutting into the content of an ordinary
# two-sentence question; the tail of a long question is now searched rather than dropped.
_FTS_MAX_TOKENS = 24


def _fts_match_query(query: str) -> str:
    """Build the FTS5 OR expression, keeping only discriminative terms.

    Returns "" when the question is nothing but function words. That is deliberate: there is
    no such thing as a good match for "what is the best thing to do here", and returning
    nothing sends the caller to the genre/compat fallback instead of injecting whichever
    cards happened to repeat "the" most often.
    """
    q = (query or "").strip()
    if not q:
        return ""
    tokens = [t for t in re.findall(r"\w+", q) if t.lower() not in _FTS_STOPWORDS]
    tokens = tokens[:_FTS_MAX_TOKENS]
    if not tokens:
        return ""
    return " OR ".join(f'"{tok}"' for tok in tokens)


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


class EmbeddingDimensionMismatch(ValueError):
    """Raised when a stored vector's length does not match the query vector's."""


def _dot_similarity(a: list[float], b: list[float]) -> float:
    """Cosine similarity for L2-normalized Ollama embeddings (dot product).

    Length is checked rather than zipped. ``zip`` truncates to the shorter sequence, so a
    corpus baked at a different dimension used to yield a plausible-looking score computed
    over a prefix of two unrelated spaces — wrong answers with no error anywhere. Callers
    treat the raise as "disable hybrid for this request".
    """
    if len(a) != len(b):
        raise EmbeddingDimensionMismatch(
            f"embedding dimension mismatch: query {len(a)} vs corpus {len(b)}"
        )
    return sum(x * y for x, y in zip(a, b))


def _load_compat_vectors(conn: sqlite3.Connection, pattern_ids: list[int]) -> dict[int, list[float]]:
    if not pattern_ids:
        return {}
    placeholders = ",".join("?" for _ in pattern_ids)
    rows = conn.execute(
        f"SELECT pattern_id, embedding FROM compat_pattern_vectors "
        f"WHERE pattern_id IN ({placeholders}) AND embedding IS NOT NULL",
        pattern_ids,
    ).fetchall()
    out: dict[int, list[float]] = {}
    for row in rows:
        vec = unpack_embedding_vector(bytes(row["embedding"]))
        if vec:
            out[int(row["pattern_id"])] = vec
    return out


def _row_relevance(row: sqlite3.Row) -> float:
    """Read the selected ``relevance`` column when the query supplied one."""
    try:
        return float(row["relevance"])
    except (IndexError, KeyError, TypeError, ValueError):
        return 0.0


def _compat_row_to_card(row: sqlite3.Row) -> KnowledgeCard:
    return KnowledgeCard(
        section_id=int(row["pattern_id"]),
        game_id=0,
        game_title="Shared troubleshooting",
        section_type="tip",
        name=str(row["topic"] or ""),
        card=str(row["card"] or ""),
        source_url=str(row["source_url"] or ""),
        source_license=str(row["source_license"] or ""),
        source_version=None,
        crawled_at=None,
        trust_tier=_trust_tier_for_compat_row(row),
        bm25_score=_row_relevance(row),
    )


def _search_compat_patterns(
    conn: sqlite3.Connection,
    *,
    query: str,
    top_k: int,
) -> list[KnowledgeCard]:
    fts_q = _fts_match_query(query)
    if not fts_q:
        return []
    # ORDER BY the *same* weighted expression that is selected. "ORDER BY rank" is the
    # unweighted bm25, so ordering by it would leave the column weights affecting the floor
    # only and silently do nothing to ranking.
    sql = (
        "SELECT p.pattern_id, p.topic, p.platforms, p.card, p.source_url, p.source_license, "
        f"-{_COMPAT_BM25} AS relevance "
        "FROM compat_patterns_fts f "
        "JOIN compat_patterns p ON p.pattern_id = f.rowid "
        "WHERE compat_patterns_fts MATCH ? "
        f"ORDER BY {_COMPAT_BM25} LIMIT ?"
    )
    try:
        rows = conn.execute(sql, (fts_q, top_k)).fetchall()
    except sqlite3.Error:
        return []
    return [
        _compat_row_to_card(row)
        for row in rows
        if float(row["relevance"]) >= BM25_RELEVANCE_FLOOR
    ]


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


def _fuse_cards_by_rrf(
    cards: list[KnowledgeCard],
    query_vector: list[float],
    vectors_by_id: dict[int, list[float]],
    *,
    top_k: int,
) -> list[KnowledgeCard]:
    """Reciprocal-rank fusion of the keyword ordering with the vector ordering.

    ``cards`` arrives in BM25 order, so a card's index is its FTS rank. Each list contributes
    ``w / (RRF_K + rank)``.

    Rank fusion replaces a cosine-only sort that appended vectorless cards *after* every
    vector-scored one, so the best keyword hit in the corpus sank below a marginal cosine
    match whenever its vector happened to be missing. Fusion also sidesteps the scale problem
    that made that sort fragile: cosine similarities bunch into a narrow band, so tiny gaps
    between near-identical scores decided the order outright.

    **Cards with no vector are given a rank one past the end of the vector list rather than
    being dropped from it.** Textbook RRF omits absent documents, and omission here would
    quietly rebuild the exile it is supposed to remove: with a 30-card shortlist, the worst
    possible vectored card scores 1/90 + 1/90 = 0.0222 while the #1 keyword hit with no vector
    scores 1/61 = 0.0164, so *having* a vector would outrank *being the best match*. Backfill
    makes the penalty for a missing vector one rank step instead of the whole list.

    Raises ``EmbeddingDimensionMismatch`` via ``_dot_similarity`` when the corpus was baked at
    a different dimension; the caller treats that as "disable hybrid for this request".
    """
    if not cards:
        return []

    scores = [RRF_W_FTS / (RRF_K + rank) for rank in range(1, len(cards) + 1)]

    by_similarity: list[tuple[float, int]] = []
    vectorless: list[int] = []
    for index, card in enumerate(cards):
        vec = vectors_by_id.get(card.section_id)
        if vec:
            by_similarity.append((_dot_similarity(query_vector, vec), index))
        else:
            vectorless.append(index)

    # Ties broken by FTS position so the fused order is deterministic run to run.
    by_similarity.sort(key=lambda item: (-item[0], item[1]))
    for vec_rank, (_, index) in enumerate(by_similarity, start=1):
        scores[index] += RRF_W_VEC / (RRF_K + vec_rank)

    missing_rank = len(by_similarity) + 1
    for index in vectorless:
        scores[index] += RRF_W_VEC / (RRF_K + missing_rank)

    order = sorted(range(len(cards)), key=lambda i: (-scores[i], i))
    return [cards[i] for i in order[:top_k]]


def _search_sections(
    conn: sqlite3.Connection,
    *,
    game_id: Optional[int],
    query: str,
    top_k: int,
) -> list[KnowledgeCard]:
    fts_q = _fts_match_query(query)
    if not fts_q:
        return []
    # See _search_compat_patterns on why ORDER BY repeats the weighted expression.
    select_cols = (
        "SELECT s.section_id, s.game_id, g.canonical_title, s.section_type, s.name, s.card, "
        "s.source_url, s.source_license, s.source_version, s.crawled_at, "
        f"-{_SECTIONS_BM25} AS relevance "
        "FROM sections_fts f "
        "JOIN sections s ON s.section_id = f.rowid "
        "JOIN games g ON g.game_id = s.game_id "
    )
    if game_id is not None:
        sql = select_cols + (
            "WHERE sections_fts MATCH ? AND s.game_id = ? " f"ORDER BY {_SECTIONS_BM25} LIMIT ?"
        )
        rows = conn.execute(sql, (fts_q, game_id, top_k)).fetchall()
    else:
        sql = select_cols + ("WHERE sections_fts MATCH ? " f"ORDER BY {_SECTIONS_BM25} LIMIT ?")
        rows = conn.execute(sql, (fts_q, top_k)).fetchall()

    out: list[KnowledgeCard] = []
    for row in rows:
        relevance = _row_relevance(row)
        if relevance < BM25_RELEVANCE_FLOOR:
            continue
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
                bm25_score=relevance,
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
    tips = _search_compat_patterns(conn, query=question, top_k=1)
    if tips:
        return tips[0].card
    return None


# Weakest first. The block header states one tier for everything inside it, so it has to be
# the weakest claim present, not the strongest.
_TRUST_TIER_RANK = {
    TRUST_TIER_FALLBACK: 0,
    TRUST_TIER_WIKI_NO_PATCH: 1,
    TRUST_TIER_WIKI_VERIFIED: 2,
}

_BLOCK_HEADER = "--- Local knowledge base (bonsAI; offline corpus; may be truncated) ---"
_BLOCK_SENTINEL = "--- End local knowledge base ---"


def _lowest_trust_tier(cards: list[KnowledgeCard]) -> str:
    """Weakest tier among ``cards``.

    Was ``cards[0].trust_tier``, so a block holding one wiki_verified card and two
    fallback_no_source cards was labelled wiki_verified — the label overstated two thirds of
    its own contents, and the model was told to trust them accordingly.
    """
    if not cards:
        return TRUST_TIER_FALLBACK
    return min(cards, key=lambda c: _TRUST_TIER_RANK.get(c.trust_tier, 0)).trust_tier


def _omitted_note(count: int) -> str:
    return f"\n[{count} more card(s) omitted to fit budget]"


def _card_lines(card: KnowledgeCard, *, domain: str) -> str:
    if domain == "compat":
        return f"\n[Tip: {card.name}] (trust: {card.trust_tier})\n{card.card}"
    return (
        f"\n[{card.game_title} / {card.section_type}: {card.name}] "
        f"(trust: {card.trust_tier})\n{card.card}"
    )


def _format_block(
    cards: list[KnowledgeCard],
    *,
    fallback_text: Optional[str],
    domain: str,
    max_bytes: int,
) -> tuple[str, str, list[dict[str, str]]]:
    """Render the KB block, dropping whole cards to fit ``max_bytes``.

    The predecessor byte-sliced the finished string. That cut the last card mid-sentence,
    threw away the end sentinel so the model could not tell where the corpus stopped and the
    conversation resumed, and still reported the truncated card in ``sources`` — a citation
    for text that was no longer there.
    """
    header = [_BLOCK_HEADER, f"Domain: {domain}"]

    def _encoded_len(parts: list[str]) -> int:
        return len("\n".join(parts).encode("utf-8"))

    def _fit(reserve_note: bool) -> list[KnowledgeCard]:
        """Longest prefix of ``cards`` that fits alongside the header, sentinel and note."""
        tail = ["\n" + _BLOCK_SENTINEL]
        if reserve_note:
            tail = [_omitted_note(len(cards))] + tail
        kept: list[KnowledgeCard] = []
        body: list[str] = []
        for card in cards:
            candidate = body + [_card_lines(card, domain=domain)]
            if _encoded_len(header + candidate + tail) > max_bytes:
                break
            body = candidate
            kept.append(card)
        return kept

    if cards:
        kept = _fit(reserve_note=False)
        if len(kept) < len(cards):
            # Something is being dropped, so the note is going in and has to fit too.
            kept = _fit(reserve_note=True)
        if not kept:
            # Not even one card fits the mode's budget; say nothing rather than a fragment.
            return "", TRUST_TIER_FALLBACK, []
        lines = header + [_card_lines(c, domain=domain) for c in kept]
        trust = _lowest_trust_tier(kept)
        # Sources describe surviving cards only — a citation for text the model never saw is
        # worse than no citation.
        sources = [
            {
                "title": f"{c.game_title} — {c.name}",
                "url": c.source_url,
                "license": c.source_license or "",
            }
            for c in kept
            if c.source_url
        ]
        if len(kept) < len(cards):
            lines.append(_omitted_note(len(cards) - len(kept)))
    elif fallback_text:
        lines = header + [
            f"\n[Genre/compat fallback] (trust: {TRUST_TIER_FALLBACK})\n{fallback_text}"
        ]
        trust = TRUST_TIER_FALLBACK
        sources = []
        if _encoded_len(lines + ["\n" + _BLOCK_SENTINEL]) > max_bytes:
            return "", TRUST_TIER_FALLBACK, []
    else:
        return "", TRUST_TIER_FALLBACK, []

    lines.append("\n" + _BLOCK_SENTINEL)
    return "\n".join(lines), trust, sources


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

        expanded = _expand_query(question, app_name, game_resolved=game_id is not None)
        manifest = _load_corpus_manifest(settings)

        # Compatibility gate. A pre-v3 corpus baked bare documents; querying it with a
        # prefixed vector compares two different spaces and silently degrades ranking, so
        # refuse hybrid outright and say why in the retrieval method.
        variant_ok = corpus_embedding_compatible(manifest, model=DEFAULT_EMBEDDING_MODEL)
        # Maintainer kill-switch. Mirrors `_bool_default_true` in settings_service: a missing
        # key means on, so an older settings.json keeps hybrid rather than silently losing it.
        hybrid_enabled = settings.get("rag_hybrid_retrieval_enabled") is not False

        if domain == "compat":
            has_vectors = corpus_has_usable_compat_vectors(conn, manifest)
            nomic_ready = (
                hybrid_enabled
                and has_vectors
                and variant_ok
                and nomic_embed_available(pc_ip, model=DEFAULT_EMBEDDING_MODEL)
            )
            t_fts = time.perf_counter()
            fts_k = HYBRID_FTS_SHORTLIST_K if nomic_ready else top_k
            cards = _search_compat_patterns(conn, query=expanded, top_k=fts_k)
            fts_ms = round((time.perf_counter() - t_fts) * 1000, 2)
            resolution = "compat_tips"
        else:
            hybrid_eligible = domain == "strategy" and game_id is not None
            has_vectors = hybrid_eligible and corpus_has_usable_section_vectors(conn, manifest)
            nomic_ready = (
                hybrid_enabled
                and has_vectors
                and variant_ok
                and nomic_embed_available(pc_ip, model=DEFAULT_EMBEDDING_MODEL)
            )
            t_fts = time.perf_counter()
            fts_k = HYBRID_FTS_SHORTLIST_K if nomic_ready else top_k
            cards = _search_sections(conn, game_id=game_id, query=expanded, top_k=fts_k)
            fts_ms = round((time.perf_counter() - t_fts) * 1000, 2)

        # Vectors exist but were not used: the user installed a corpus, so "keyword" alone
        # would misreport this as a corpus that never shipped embeddings. The kill-switch is
        # checked first on purpose -- when the maintainer turned hybrid off, saying "embed
        # unavailable" sends them hunting for an Ollama fault that is not there.
        if has_vectors and not hybrid_enabled:
            retrieval_method = "keyword_hybrid_disabled"
        elif has_vectors and not variant_ok:
            retrieval_method = "keyword_embed_unavailable"

        if nomic_ready and cards:
            t_embed = time.perf_counter()
            try:
                query_vectors = embed_texts(
                    pc_ip,
                    [format_embed_query(expanded, model=DEFAULT_EMBEDDING_MODEL)],
                    model=DEFAULT_EMBEDDING_MODEL,
                    timeout_s=3.0,
                )
                query_vector = query_vectors[0]
                embed_ms = round((time.perf_counter() - t_embed) * 1000, 2)
                t_rerank = time.perf_counter()
                if domain == "compat":
                    vectors_by_id = _load_compat_vectors(conn, [c.section_id for c in cards])
                else:
                    vectors_by_id = _load_section_vectors(conn, [c.section_id for c in cards])
                cards = _fuse_cards_by_rrf(
                    cards,
                    query_vector,
                    vectors_by_id,
                    top_k=top_k,
                )
                rerank_ms = round((time.perf_counter() - t_rerank) * 1000, 2)
                retrieval_method = "hybrid"
            except (OllamaEmbedError, EmbeddingDimensionMismatch, IndexError, ValueError):
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

# Insertion order is the display order for compat chips — see _compat_chip_candidates.
# Note "deck" is textually identical to a static carousel seed (src/data/presets.ts), so it is
# ordered after "proton"; de-duplicating the two lists properly needs the seed list shared
# across the TS/Python boundary and is tracked separately under roadmap Bugs.
_COMPAT_CHIP_TEMPLATES: dict[str, str] = {
    "proton": "Any known Proton issues for this game?",
    "controller": "Any Steam Input issues for this game?",
    "deck": "How well does this game run on Deck?",
}

# Generic compat chips are capped so they cannot crowd out entity-named candidates.
_MAX_COMPAT_CHIP_CANDIDATES = 2


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


def _compat_chip_candidates(
    conn: sqlite3.Connection,
    *,
    limit: int = _MAX_COMPAT_CHIP_CANDIDATES,
) -> list[SessionRagChipCandidate]:
    """Curated compat chips this corpus actually has patterns for, capped and ordered.

    Capped because these are generic by construction — they read identically for every game,
    so an unbounded tail of them crowds out the entity-named candidates. Ordered by
    ``_COMPAT_CHIP_TEMPLATES`` insertion order rather than ``pattern_id`` so the chips a user
    sees do not shuffle when corpus row order changes.
    """
    topics = {
        str(row["topic"] or "").strip().lower()
        for row in conn.execute("SELECT topic FROM compat_patterns").fetchall()
    }
    out: list[SessionRagChipCandidate] = []
    for key, template in _COMPAT_CHIP_TEMPLATES.items():
        if len(out) >= max(0, limit):
            break
        if key not in topics:
            continue
        text = _truncate_chip_text(template)
        if not text:
            continue
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

        # A session RAG chip must name something the corpus knows about *this* game. Without a
        # single section, every chip we could return is a generic compat template that reads
        # the same for every title — indistinguishable from a static seed, so the carousel is
        # better served by its own seeds. Reported as {ok: false}, which the frontend already
        # treats as "use static seeds" without logging an error.
        if not candidates:
            note = "app_unresolved" if game_id is None else "no_sections"
            return SessionRagChipCandidatesResult(ok=False, reason=note)

        for compat in _compat_chip_candidates(conn):
            if compat.text in seen:
                continue
            seen.add(compat.text)
            candidates.append(compat)

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


@dataclass
class StackedContext:
    text: str = ""
    # Which blocks actually reached the model. Proton logs take budget first and can be
    # capped at 96 KiB against a 100 KiB ceiling, so the knowledge block can be starved down
    # to a fragment or to nothing at all.
    proton_attached: bool = False
    knowledge_attached: bool = False


def stack_context_blocks(
    *,
    proton_text: str,
    knowledge_text: str,
    max_total_bytes: int = 100 * 1024,
) -> StackedContext:
    """Stack Proton logs then knowledge cards under a shared byte budget.

    Returns what survived, not just the text. Callers were recording ``kb_attached=True`` from
    the retrieval result and then stacking, so transparency could claim the knowledge base was
    attached and cite its sources when stacking had dropped the block entirely.

    A block is reported attached only if it went in whole. A truncated block is a fragment
    whose sources no longer describe its contents, which is the same lie in a smaller form.
    """
    result = StackedContext()
    parts: list[str] = []
    budget = max_total_bytes
    for label, block in (
        ("proton", proton_text),
        ("knowledge", knowledge_text),
    ):
        chunk = (block or "").strip()
        if not chunk:
            continue
        encoded = chunk.encode("utf-8")
        if len(encoded) > budget:
            if budget <= 0:
                break
            chunk = encoded[:budget].decode("utf-8", errors="ignore") + "\n[…truncated]"
            parts.append(chunk)
            break
        parts.append(chunk)
        budget -= len(encoded)
        if label == "proton":
            result.proton_attached = True
        else:
            result.knowledge_attached = True
        if budget <= 0:
            break
    result.text = "\n\n".join(parts)
    return result
