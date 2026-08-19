"""Title: Knowledge base service

Purpose: On-Deck knowledge base retrieval (FTS5 + optional per-game vector recall, RRF-fused).
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
from backend.services.compat_topic_router import question_targets_compat_corpus
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
# Locked 2026-08-09 by PR2 bake-off on the deepened 119-section / 124-tip seed against
# kb_eval_v2 (140 labeled rows; tune 104 / holdout 36). Holdout top-3 could not separate RRF
# from keyword (overlapping CIs). Equal weights stay; do not "tune" from a later peek at
# holdout. Report: docs/archive/research/kb-retrieval-pr2-bakeoff-2026-08-09.md
RRF_K = 60
RRF_W_FTS = 1.0
RRF_W_VEC = 1.0

# Relevance is -bm25(...), so bigger is a better match (FTS5's bm25 is negative, and more
# negative means better; flipping the sign once here keeps every comparison downstream the
# obvious direction).
#
# Kept LOOSE after PR2: the holdout gate did not justify tightening. Off-topic Asks still
# score ≤0.75 on the seed; genuine hits remain well above 1.0. Stopword-only queries are
# _fts_match_query's job, not the floor's.
BM25_RELEVANCE_FLOOR = 1.0

# PROVISIONAL (PR2 6d owns the final value). A higher bar for the D17 implicit route -- an Ask
# made while a game happens to be running, which never declared itself to be about that game.
#
# The evidence is genuinely weaker there, so it should have to clear more. Measured on the seed
# corpus 2026-08-06, per-game scoped: "what time do the shops close on a sunday" scores 2.72
# against Left 4 Dead 2 (FTS5 runs the porter stemmer, so "time" matches "timing" in an
# unrelated card), while "how do I beat the tank" scores 5.28 and a named boss scores 10+.
#
# Two data points on a two-card-per-game corpus is not a tuning basis and this number will
# move once the seed is deepened. It is here because shipping D17 with a known noise source
# is worse than shipping a constant that says out loud it is a guess.
IMPLICIT_ROUTE_RELEVANCE_FLOOR = 4.0

# The Ask modes in which the user declared the Ask to be about the game. Anything else is the
# D17 implicit route -- an Ask that merely happened while a game was running.
#
# Expert belongs here and was missing until 2026-08-18, because the test was written as
# `!= "strategy"`: it asked for Strategy by name rather than for the thing Strategy stands for.
# That left the two mode-keyed knobs disagreeing about what Expert means -- _budget_for_mode
# gives Expert the LARGEST card budget (5) while the flag put it on the STRICTEST relevance bar
# (4.0 against 1.0). Measured on device 2026-08-17, DRG Survivor (2321470), "what class should
# i pick": Strategy attached 2 cards, Expert attached 1, because "Upgrades and overclocks"
# scores bm25 2.13 and died at the 4.0 floor. The mode a stuck player picks for maximum depth
# was the one hiding the most corpus.
#
# Keep this the one definition of "explicit route". VECTOR_RECALL_FLOOR's gate reads the same
# flag, so a mode listed here gets the loose floor and the vector recall pass together, and
# they cannot drift apart again.
_DECLARED_GAME_ASK_MODES = frozenset({"strategy", "expert"})

# --- Vector recall pass --------------------------------------------------------------------
#
# The vector half searches for itself instead of re-ranking whatever BM25 handed it. Before
# this, every candidate came from one FTS query and vectors were loaded for that shortlist
# only, so a semantically perfect card sharing no keyword with the question was unreachable --
# when BM25 returned nothing, no embedding was computed at all. Measured on device 2026-08-17
# against corpus 2026.08.16: "how do i kill the big armoured bug boss" returned 0 candidates
# with DRG Survivor's Glyphid Dreadnought card sitting in the corpus. Phase 7's locked ranking
# blend asks for exactly this -- "when FTS is empty/weak, meaning fallback ... vector/ANN list
# into RRF" (docs/knowledge-base.md).
#
# Brute force over one game's sections (5-13 cards across the 13-title corpus), so it needs no
# ANN index. Phase 7's sqlite-vss item is the version of this that matters at catalog scale.
#
# Cap of 3 bounds what a *wrong* recall costs: an Ask that is not about the game at all can add
# at most three cards to the pool, and Strategy's budget only spends three. It is not a
# recall limit in practice -- in the floor measurement the correct card sat at vector rank 1
# for 10 of 15 paraphrased questions and within rank 3 for 14 of them (the exception already
# had three keyword candidates of its own).
VECTOR_RECALL_K = 3

# Cosine floor for admitting a card the keyword half never found. MEASURED, not guessed -- and
# the measurement says the two distributions overlap, so no floor separates them cleanly. Full
# table: docs/audit/rag-vector-recall-floor-2026-08-18.md (15 paraphrased questions with a
# known answer, 12 off-topic Asks, 4 titles, corpus 2026.08.16, nomic-embed-text):
#
#   correct card, paraphrased question   0.519 .. 0.738
#   best card for an off-topic Ask       0.435 .. 0.593
#
# 0.50 clears every relevant hit in that sample and rejects 4 of the 12 off-topic ones. It is
# deliberately loose because of what it is measured against, not against nothing: this floor
# only decides what to attach on the *explicit* route, where the alternative when BM25 finds
# nothing is _genre_fallback -- a generic genre card with no relation to the question at all.
# A card at cosine 0.52 is weaker evidence than a keyword hit and stronger than that.
#
# Precision on this path is carried by the route gate rather than by the floor: the pass runs
# only when the user declared the Ask to be about the game (see IMPLICIT_ROUTE_RELEVANCE_FLOOR
# and the vector_recall_ready branch). Do not tighten this above 0.55 without re-measuring --
# two of the four failures this fixes score 0.542 and 0.523.
VECTOR_RECALL_FLOOR = 0.50

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
    """Return (top_k, max_bytes) adaptive by Ask mode.

    Mode decides a second thing one layer up -- the relevance floor, via
    ``_DECLARED_GAME_ASK_MODES``. Two knobs, same input, and they disagreed once: a mode that
    earns a bigger budget here has to be on the explicit route there, or it gets more room to
    fill and a stricter bar for filling it at the same time.
    """
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
    # An explicit Strategy Ask about a running game is unambiguous and wins outright.
    if mode == "strategy" and (aid or aname):
        return True, "strategy"
    # Two gates, deliberately. The prompt-side phrase gate needs the literal word "deck" or
    # "proton", which left 24 of the corpus's 27 topics unreachable by anything a user would
    # type -- measured at 3 of 40 drafted compat questions. The topic router closes that
    # (decision D16). It is kept separate rather than folded into the phrase gate because
    # that gate also drives Proton log attachment, prompt framing and stream tags; widening
    # it would change four behaviours to fix one.
    if question_matches_troubleshooting_log_context(question) or question_targets_compat_corpus(
        question
    ):
        return True, "compat"
    # D17: game knowledge is not a property of the Ask mode. Strategy cards used to require
    # Strategy mode, so the same question about the same running game got cards in one mode
    # and nothing in Speed or Expert -- Expert being where somebody stuck on a hard fight is
    # most likely to be. Ask mode still decides how *many* cards attach (_budget_for_mode);
    # it no longer decides whether the corpus is consulted at all.
    #
    # Safe to be permissive here for the same reason D16 was: retrieval is scoped to the
    # resolved game and still has to clear BM25_RELEVANCE_FLOOR, so an Ask that is not about
    # the game attaches nothing. An unresolved game attaches nothing either -- see the
    # implicit-route check in retrieve_knowledge_context, which suppresses the generic genre
    # fallback so this does not staple a boilerplate card to every Ask.
    if aid or aname:
        return True, "strategy"
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


def _section_row_to_card(row: sqlite3.Row, *, bm25_score: float = 0.0) -> KnowledgeCard:
    """Build a card from a `sections` row. Sibling of ``_compat_row_to_card``.

    ``bm25_score`` is a keyword score the caller measured, so it is passed rather than read:
    the vector recall pass finds cards no FTS query ranked and leaves it at 0.0.
    """
    return KnowledgeCard(
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
        bm25_score=bm25_score,
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


def _vector_recall_sections(
    conn: sqlite3.Connection,
    *,
    game_id: int,
    query_vector: list[float],
    top_k: int,
    min_similarity: float,
    exclude_ids: set[int],
) -> tuple[list[KnowledgeCard], dict[int, list[float]]]:
    """Rank one game's whole section set by cosine -- the vector half's own recall path.

    Returns ``(recall_cards, vectors_by_id)``: the above-floor cards the keyword shortlist did
    not already contain, plus the vectors for **every** section of the game. The second value
    is what the fusion re-ranks with, so the caller needs exactly one load either way.

    Scoped to the resolved game for the same reason ``_search_sections`` is: the best cosine
    match in the whole corpus for an uncovered title is another game's card, and wrong-game
    advice is worse than none. A game holds 5-13 sections, so scanning all of them costs one
    indexed query and a few hundred dot products.

    Raises ``EmbeddingDimensionMismatch`` via ``_dot_similarity`` when the corpus was baked at
    a different dimension; the caller treats that as "disable hybrid for this request".
    """
    rows = conn.execute(
        "SELECT s.section_id, s.game_id, g.canonical_title, s.section_type, s.name, s.card, "
        "s.source_url, s.source_license, s.source_version, s.crawled_at "
        "FROM sections s JOIN games g ON g.game_id = s.game_id "
        "WHERE s.game_id = ?",
        (game_id,),
    ).fetchall()
    if not rows:
        return [], {}

    vectors_by_id = _load_section_vectors(conn, [int(r["section_id"]) for r in rows])
    if not vectors_by_id:
        return [], {}

    scored: list[tuple[float, int, sqlite3.Row]] = []
    for row in rows:
        section_id = int(row["section_id"])
        if section_id in exclude_ids:
            continue
        vec = vectors_by_id.get(section_id)
        if not vec:
            continue
        similarity = _dot_similarity(query_vector, vec)
        if similarity < min_similarity:
            continue
        scored.append((similarity, section_id, row))

    # Ties broken by section_id so the order is stable run to run.
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [_section_row_to_card(row) for _, _, row in scored[:top_k]], vectors_by_id


def _fuse_cards_by_rrf(
    cards: list[KnowledgeCard],
    query_vector: list[float],
    vectors_by_id: dict[int, list[float]],
    *,
    top_k: int,
    recall_cards: Optional[list[KnowledgeCard]] = None,
) -> list[KnowledgeCard]:
    """Reciprocal-rank fusion of the keyword ordering with the vector ordering.

    ``cards`` arrives in BM25 order, so a card's index is its FTS rank. Each list contributes
    ``w / (RRF_K + rank)``.

    ``recall_cards`` are cards only the vector pass found (see ``_vector_recall_sections``).
    They join the pool and take an FTS rank one past the end of the keyword list -- the same
    one-step backfill a vectorless card takes in the vector ranking below, and equal for all of
    them, so the vector ordering alone decides their order among themselves. Passing none
    leaves this a pure re-rank of the keyword shortlist, which is what the compat path does.

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
    pool = list(cards)
    if recall_cards:
        seen = {card.section_id for card in cards}
        pool.extend(card for card in recall_cards if card.section_id not in seen)
    if not pool:
        return []

    fts_missing_rank = len(cards) + 1
    scores = [
        RRF_W_FTS / (RRF_K + (index + 1 if index < len(cards) else fts_missing_rank))
        for index in range(len(pool))
    ]

    by_similarity: list[tuple[float, int]] = []
    vectorless: list[int] = []
    for index, card in enumerate(pool):
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

    order = sorted(range(len(pool)), key=lambda i: (-scores[i], i))
    return [pool[i] for i in order[:top_k]]


def _search_sections(
    conn: sqlite3.Connection,
    *,
    game_id: Optional[int],
    query: str,
    top_k: int,
    min_relevance: float = BM25_RELEVANCE_FLOOR,
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
        if relevance < min_relevance:
            continue
        out.append(_section_row_to_card(row, bm25_score=relevance))
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
                # When the wiki text behind this card was captured. Several corpus sources
                # are archive.org snapshots years old; a credit that hides that reads as
                # current advice.
                "captured": str(c.crawled_at or ""),
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
        # D17: strategy cards now attach in any Ask mode, so most strategy retrieval arrives
        # without the user having declared the Ask to be about the game. That weaker evidence
        # gets a higher relevance bar and no genre-card consolation prize -- see
        # IMPLICIT_ROUTE_RELEVANCE_FLOOR and the fallback branch below.
        implicit_route = (ask_mode or "").strip().lower() not in _DECLARED_GAME_ASK_MODES

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
            section_floor = (
                IMPLICIT_ROUTE_RELEVANCE_FLOOR if implicit_route else BM25_RELEVANCE_FLOOR
            )
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
            # Only ever search within the resolved game. An unscoped search returns the best
            # keyword match in the whole corpus, which for an uncovered game means another
            # game's cards -- "how do I beat the tank" while playing something unrelated
            # answered with Left 4 Dead 2's Tank card. Wrong-game advice is worse than none,
            # and the genre fallback below already covers the unresolved case.
            cards = (
                _search_sections(
                    conn,
                    game_id=game_id,
                    query=expanded,
                    top_k=fts_k,
                    min_relevance=section_floor,
                )
                if game_id is not None
                else []
            )
            fts_ms = round((time.perf_counter() - t_fts) * 1000, 2)

        # Vectors exist but were not used: the user installed a corpus, so "keyword" alone
        # would misreport this as a corpus that never shipped embeddings. The kill-switch is
        # checked first on purpose -- when the maintainer turned hybrid off, saying "embed
        # unavailable" sends them hunting for an Ollama fault that is not there.
        if has_vectors and not hybrid_enabled:
            retrieval_method = "keyword_hybrid_disabled"
        elif has_vectors and not variant_ok:
            retrieval_method = "keyword_embed_unavailable"

        # Whether the vector half gets to search for itself rather than only re-order the
        # keyword shortlist. Two conditions, both load-bearing:
        #
        # - **A resolved game**, because the scan is per-game (`_vector_recall_sections`).
        # - **The explicit route**, i.e. the user declared this Ask to be about the game. The
        #   pass costs an embed round trip (793-900 ms measured on Deck 2026-08-17) and, at a
        #   floor loose enough to catch a paraphrase, will attach *something* to almost any
        #   question. Spending both on an Ask that merely happened while a game was open is
        #   the trade IMPLICIT_ROUTE_RELEVANCE_FLOOR already refused for keyword hits. Keyed
        #   off the same flag deliberately, so widening what counts as explicit (Expert is the
        #   open case) widens both at once and they cannot drift apart.
        vector_recall_ready = domain != "compat" and game_id is not None and not implicit_route

        if nomic_ready and (cards or vector_recall_ready):
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
                recall_cards: list[KnowledgeCard] = []
                if domain == "compat":
                    vectors_by_id = _load_compat_vectors(conn, [c.section_id for c in cards])
                elif vector_recall_ready and game_id is not None:
                    recall_cards, vectors_by_id = _vector_recall_sections(
                        conn,
                        game_id=game_id,
                        query_vector=query_vector,
                        top_k=VECTOR_RECALL_K,
                        min_similarity=VECTOR_RECALL_FLOOR,
                        exclude_ids={c.section_id for c in cards},
                    )
                else:
                    vectors_by_id = _load_section_vectors(conn, [c.section_id for c in cards])
                cards = _fuse_cards_by_rrf(
                    cards,
                    query_vector,
                    vectors_by_id,
                    top_k=top_k,
                    recall_cards=recall_cards,
                )
                rerank_ms = round((time.perf_counter() - t_rerank) * 1000, 2)
                retrieval_method = "hybrid"
            except (OllamaEmbedError, EmbeddingDimensionMismatch, IndexError, ValueError):
                embed_ms = round((time.perf_counter() - t_embed) * 1000, 2)
                cards = cards[:top_k]
                retrieval_method = "keyword_embed_unavailable"
        elif cards and fts_k != top_k:
            cards = cards[:top_k]

        # D17 routes every Ask made while a covered game runs, not just Strategy-mode ones.
        # The genre fallback is a generic card with no relation to the question, which is a
        # reasonable consolation for "I explicitly asked for strategy and we had nothing" and
        # pure noise stapled to an ordinary Ask that merely happened while a game was open.
        # So the fallback stays for the explicit route only.
        implicit_strategy_route = domain != "compat" and implicit_route

        fallback_text: Optional[str] = None
        if not cards:
            if domain == "compat":
                fallback_text = _compat_fallback(conn, question)
            elif not implicit_strategy_route:
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


@dataclass
class KbCoverageSummary:
    """Corpus coverage for the running game — distinct from Ask-turn KB attachment."""

    status: str
    section_count: int = 0
    reason: str = ""


def _count_game_sections(conn: sqlite3.Connection, game_id: int) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM sections WHERE game_id = ?",
        (game_id,),
    ).fetchone()
    return int(row["n"] or 0)


def summarize_kb_coverage(
    settings: dict,
    *,
    app_id: str,
    app_name: str,
    shortcut_name: str = "",
) -> KbCoverageSummary:
    """Return how many strategy sections the offline corpus has for this game."""
    if settings.get("use_local_knowledge_base") is not True:
        return KbCoverageSummary(status="kb_off")

    db_path = resolve_corpus_db_path(settings)
    if not db_path:
        return KbCoverageSummary(status="corpus_missing")

    try:
        conn = _get_connection(db_path)
        game_id, _ = _resolve_game_id(
            conn,
            app_id=app_id,
            app_name=app_name,
            shortcut_name=shortcut_name,
        )
        if game_id is None:
            return KbCoverageSummary(status="app_unresolved")
        count = _count_game_sections(conn, game_id)
        if count <= 0:
            return KbCoverageSummary(status="no_sections", section_count=0)
        return KbCoverageSummary(status="sections", section_count=count)
    except sqlite3.Error as exc:
        return KbCoverageSummary(status="corpus_error", reason=str(exc))


def kb_coverage_to_transparency(summary: KbCoverageSummary) -> dict[str, Any]:
    return {
        "kb_coverage_status": summary.status,
        "kb_coverage_section_count": int(summary.section_count or 0),
        "kb_coverage_reason": summary.reason or "",
    }


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
