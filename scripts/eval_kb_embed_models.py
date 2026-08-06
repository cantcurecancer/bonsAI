#!/usr/bin/env python3
"""KB embed model bake-off — maintainer eval against seed corpus hybrid path.

Mirrors production FTS shortlist (N=30) → query embed → cosine re-rank.
Scores bare vs prompted columns per model; writes JSON + markdown report.

Usage:
  python scripts/eval_kb_embed_models.py
  python scripts/eval_kb_embed_models.py --ollama http://127.0.0.1:11434 --write-report
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Literal

REPO_ROOT = Path(__file__).resolve().parents[1]
PY_MODULES = REPO_ROOT / "py_modules"
FIXTURES = REPO_ROOT / "tests" / "fixtures"
DEFAULT_OUT_DIR = REPO_ROOT / "dist" / "knowledge-base-embed-bakeoff"
DEFAULT_OLLAMA = "http://127.0.0.1:11434"

DEFAULT_MODELS = [
    "nomic-embed-text",
    "nomic-embed-text-v2-moe",
    "qwen3-embedding:0.6b",
    "mxbai-embed-large",
    "snowflake-arctic-embed2",
    "bge-m3",
]

BASELINE_MODEL = "nomic-embed-text"
WINNER_MARGIN_TOP3 = 5.0  # absolute percentage points on prompted top-3

MODEL_SIZE_MB: dict[str, int] = {
    "nomic-embed-text": 274,
    "nomic-embed-text-v2-moe": 958,
    "qwen3-embedding:0.6b": 639,
    "mxbai-embed-large": 670,
    "snowflake-arctic-embed2": 1200,
    "bge-m3": 1200,
}

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))

from backend.services.knowledge_base_service import (  # noqa: E402
    HYBRID_FTS_SHORTLIST_K,
    KnowledgeCard,
    _budget_for_mode,
    _dot_similarity,
    _expand_query,
    _fuse_cards_by_rrf,
    _resolve_game_id,
    _search_compat_patterns,
    _search_sections,
)
from backend.services.ollama_embed_service import (  # noqa: E402
    format_embed_document,
    format_embed_query,
)

PromptMode = Literal["bare", "prompted"]
EVAL_MIN_TOP_K = 3  # fixtures often use speed (top_k=1); bake-off needs top-3 signal


@dataclass
class CorpusDoc:
    doc_id: int
    domain: Literal["compat", "strategy"]
    label: str
    bare_text: str


@dataclass
class QueryCase:
    case_id: str
    query: str
    ask_mode: str
    domain: Literal["compat", "strategy"]
    app_id: str
    shortcut: str
    expect_topic: str
    expect_section: str
    suite: str


@dataclass
class QueryResult:
    case_id: str
    hit_at_1: bool
    hit_at_3: bool
    fts_empty: bool
    embed_ms: float
    top_names: list[str] = field(default_factory=list)


@dataclass
class ModelScores:
    model: str
    prompt_mode: PromptMode
    top1_pct: float
    top3_pct: float
    mean_embed_ms: float
    fts_empty_pct: float
    query_results: list[QueryResult] = field(default_factory=list)


class EmbedError(Exception):
    pass


def _load_fixture(path: Path, suite: str) -> list[QueryCase]:
    data = json.loads(path.read_text(encoding="utf-8"))
    out: list[QueryCase] = []
    for row in data.get("queries", []):
        out.append(
            QueryCase(
                case_id=str(row["id"]),
                query=str(row["query"]),
                ask_mode=str(row.get("ask_mode") or "speed"),
                domain=row["domain"],
                app_id=str(row.get("app_id") or ""),
                shortcut=str(row.get("shortcut") or ""),
                expect_topic=str(row.get("expect_topic") or ""),
                expect_section=str(row.get("expect_section") or ""),
                suite=suite,
            )
        )
    return out


def _ensure_seed_db(out_dir: Path) -> Path:
    db_path = out_dir / "corpus.db"
    if db_path.is_file():
        return db_path
    out_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            sys.executable,
            str(REPO_ROOT / "scripts" / "build_rag_db.py"),
            "--seed",
            "--out",
            str(out_dir),
        ],
        check=True,
        cwd=str(REPO_ROOT),
    )
    return db_path


def _load_corpus_docs(conn: sqlite3.Connection) -> list[CorpusDoc]:
    docs: list[CorpusDoc] = []
    for row in conn.execute(
        "SELECT pattern_id, topic, card FROM compat_patterns ORDER BY pattern_id"
    ):
        topic = str(row[1] or "")
        card = str(row[2] or "")
        docs.append(
            CorpusDoc(
                doc_id=int(row[0]),
                domain="compat",
                label=topic,
                bare_text=f"{topic}\n{card}",
            )
        )
    for row in conn.execute("SELECT section_id, name, card FROM sections ORDER BY section_id"):
        name = str(row[1] or "")
        card = str(row[2] or "")
        docs.append(
            CorpusDoc(
                doc_id=int(row[0]),
                domain="strategy",
                label=name,
                bare_text=f"{name}\n{card}",
            )
        )
    return docs


# "prompted" delegates to the production helpers on purpose. These used to be private copies
# here, and the copies are how the eval drifted from what shipped — it measured prefixed
# retrieval while production embedded bare text. "bare" stays local because it exists only to
# measure the no-prefix arm; production has no such mode.
def _format_query(model: str, query: str, mode: PromptMode) -> str:
    if mode == "bare":
        return query
    return format_embed_query(query, model=model)


def _format_document(model: str, bare_text: str, mode: PromptMode) -> str:
    if mode == "bare":
        return bare_text
    return format_embed_document(bare_text, model=model)


def _embed_batch(
    ollama_base: str,
    model: str,
    texts: list[str],
    *,
    timeout_s: float = 120.0,
    batch_size: int = 16,
) -> list[list[float]]:
    if not texts:
        return []
    url = f"{ollama_base.rstrip('/')}/api/embed"
    out: list[list[float]] = []
    for start in range(0, len(texts), batch_size):
        chunk = texts[start : start + batch_size]
        payload = {"model": model, "input": chunk if len(chunk) > 1 else chunk[0]}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout_s) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:300]
            raise EmbedError(f"{model}: HTTP {exc.code}: {detail}") from exc
        except Exception as exc:
            raise EmbedError(f"{model}: {exc}") from exc
        embeddings = data.get("embeddings") if isinstance(data, dict) else None
        if not isinstance(embeddings, list) or len(embeddings) != len(chunk):
            raise EmbedError(f"{model}: invalid embed response for batch of {len(chunk)}")
        for item in embeddings:
            if not isinstance(item, list) or not item:
                raise EmbedError(f"{model}: empty vector in batch response")
            out.append([float(x) for x in item])
    return out


def _embed_one(ollama_base: str, model: str, text: str, *, timeout_s: float = 30.0) -> tuple[list[float], float]:
    t0 = time.perf_counter()
    vectors = _embed_batch(ollama_base, model, [text], timeout_s=timeout_s, batch_size=1)
    ms = round((time.perf_counter() - t0) * 1000, 2)
    return vectors[0], ms


def _card_matches(case: QueryCase, card: KnowledgeCard) -> bool:
    if case.domain == "compat":
        return case.expect_topic.lower() == card.name.lower()
    return case.expect_section.lower() == card.name.lower()


def _eval_top_k(ask_mode: str) -> int:
    top_k, _ = _budget_for_mode(ask_mode)
    return max(top_k, EVAL_MIN_TOP_K)


def _score_cards(cards: list[KnowledgeCard], case: QueryCase, top_k: int) -> tuple[bool, bool]:
    trimmed = cards[:top_k]
    hits = [_card_matches(case, c) for c in trimmed]
    hit_at_1 = bool(hits and hits[0])
    hit_at_3 = any(hits[: min(3, len(hits))])
    return hit_at_1, hit_at_3


def _keyword_retrieve(
    conn: sqlite3.Connection,
    case: QueryCase,
    *,
    fts_k: int,
    top_k: int,
) -> list[KnowledgeCard]:
    expanded = _expand_query(case.query, "")
    if case.domain == "compat":
        return _search_compat_patterns(conn, query=expanded, top_k=min(fts_k, top_k))
    game_id, _ = _resolve_game_id(
        conn,
        app_id=case.app_id,
        app_name="",
        shortcut_name=case.shortcut,
    )
    return _search_sections(conn, game_id=game_id, query=expanded, top_k=min(fts_k, top_k))


def _hybrid_retrieve(
    conn: sqlite3.Connection,
    case: QueryCase,
    *,
    query_vector: list[float],
    vectors_by_id: dict[int, list[float]],
    fts_k: int,
    top_k: int,
) -> list[KnowledgeCard]:
    expanded = _expand_query(case.query, "")
    if case.domain == "compat":
        cards = _search_compat_patterns(conn, query=expanded, top_k=fts_k)
    else:
        game_id, _ = _resolve_game_id(
            conn,
            app_id=case.app_id,
            app_name="",
            shortcut_name=case.shortcut,
        )
        cards = _search_sections(conn, game_id=game_id, query=expanded, top_k=fts_k)
    if not cards:
        return []
    return _fuse_cards_by_rrf(
        cards,
        query_vector,
        vectors_by_id,
        top_k=top_k,
    )


def _vector_only_compat(
    case: QueryCase,
    *,
    query_vector: list[float],
    compat_docs: list[CorpusDoc],
    compat_vectors: dict[int, list[float]],
    top_k: int,
) -> list[KnowledgeCard]:
    scored: list[tuple[float, CorpusDoc]] = []
    for doc in compat_docs:
        vec = compat_vectors.get(doc.doc_id)
        if vec:
            scored.append((_dot_similarity(query_vector, vec), doc))
    scored.sort(key=lambda item: item[0], reverse=True)
    out: list[KnowledgeCard] = []
    for _, doc in scored[:top_k]:
        topic, _, card = doc.bare_text.partition("\n")
        out.append(
            KnowledgeCard(
                section_id=doc.doc_id,
                game_id=0,
                game_title="Shared troubleshooting",
                section_type="tip",
                name=topic,
                card=card,
                source_url="",
                source_license="bonsAI-maintainer",
                source_version=None,
                crawled_at=None,
                trust_tier="fallback",
            )
        )
    return out


def _build_vectors(
    ollama_base: str,
    model: str,
    docs: list[CorpusDoc],
    mode: PromptMode,
) -> dict[int, list[float]]:
    texts = [_format_document(model, doc.bare_text, mode) for doc in docs]
    vectors = _embed_batch(ollama_base, model, texts)
    return {doc.doc_id: vec for doc, vec in zip(docs, vectors)}


def _evaluate_model(
    conn: sqlite3.Connection,
    ollama_base: str,
    model: str,
    docs: list[CorpusDoc],
    cases: list[QueryCase],
    *,
    prompt_mode: PromptMode,
    hybrid: bool,
    vectors_by_id: dict[int, list[float]] | None = None,
) -> ModelScores:
    if hybrid and vectors_by_id is None:
        vectors_by_id = _build_vectors(ollama_base, model, docs, prompt_mode)
    elif not hybrid:
        vectors_by_id = {}
    # warm query embed
    if hybrid:
        _embed_one(ollama_base, model, _format_query(model, "warmup", prompt_mode))

    results: list[QueryResult] = []
    embed_times: list[float] = []
    fts_empty = 0

    for case in cases:
        top_k = _eval_top_k(case.ask_mode)
        expanded = _expand_query(case.query, "")
        if hybrid:
            q_text = _format_query(model, expanded, prompt_mode)
            q_vec, embed_ms = _embed_one(ollama_base, model, q_text)
            embed_times.append(embed_ms)
            cards = _hybrid_retrieve(
                conn,
                case,
                query_vector=q_vec,
                vectors_by_id=vectors_by_id,
                fts_k=HYBRID_FTS_SHORTLIST_K,
                top_k=top_k,
            )
        else:
            embed_ms = 0.0
            cards = _keyword_retrieve(
                conn,
                case,
                fts_k=top_k,
                top_k=top_k,
            )

        if not cards:
            fts_empty += 1
        hit_at_1, hit_at_3 = _score_cards(cards, case, top_k)
        results.append(
            QueryResult(
                case_id=case.case_id,
                hit_at_1=hit_at_1,
                hit_at_3=hit_at_3,
                fts_empty=not cards,
                embed_ms=embed_ms,
                top_names=[c.name for c in cards[:3]],
            )
        )

    n = len(cases) or 1
    return ModelScores(
        model=model,
        prompt_mode=prompt_mode,
        top1_pct=round(100.0 * sum(r.hit_at_1 for r in results) / n, 1),
        top3_pct=round(100.0 * sum(r.hit_at_3 for r in results) / n, 1),
        mean_embed_ms=round(sum(embed_times) / len(embed_times), 1) if embed_times else 0.0,
        fts_empty_pct=round(100.0 * fts_empty / n, 1),
        query_results=results,
    )


def _evaluate_spanish_probe(
    conn: sqlite3.Connection,
    ollama_base: str,
    model: str,
    compat_docs: list[CorpusDoc],
    cases: list[QueryCase],
    *,
    bare_vectors: dict[int, list[float]],
    prompted_vectors: dict[int, list[float]],
) -> dict[str, Any]:
    def _run(mode: PromptMode, vectors: dict[int, list[float]], *, vector_only: bool) -> ModelScores:
        results: list[QueryResult] = []
        embed_times: list[float] = []
        fts_empty = 0
        for case in cases:
            top_k = _eval_top_k(case.ask_mode)
            expanded = _expand_query(case.query, "")
            q_text = _format_query(model, expanded, mode)
            q_vec, embed_ms = _embed_one(ollama_base, model, q_text)
            embed_times.append(embed_ms)
            if vector_only:
                cards = _vector_only_compat(
                    case,
                    query_vector=q_vec,
                    compat_docs=compat_docs,
                    compat_vectors=vectors,
                    top_k=top_k,
                )
            else:
                cards = _hybrid_retrieve(
                    conn,
                    case,
                    query_vector=q_vec,
                    vectors_by_id=vectors,
                    fts_k=HYBRID_FTS_SHORTLIST_K,
                    top_k=top_k,
                )
            if not cards:
                fts_empty += 1
            hit_at_1, hit_at_3 = _score_cards(cards, case, top_k)
            results.append(
                QueryResult(
                    case_id=case.case_id,
                    hit_at_1=hit_at_1,
                    hit_at_3=hit_at_3,
                    fts_empty=not cards,
                    embed_ms=embed_ms,
                    top_names=[c.name for c in cards[:3]],
                )
            )
        n = len(cases) or 1
        return ModelScores(
            model=model,
            prompt_mode=mode,
            top1_pct=round(100.0 * sum(r.hit_at_1 for r in results) / n, 1),
            top3_pct=round(100.0 * sum(r.hit_at_3 for r in results) / n, 1),
            mean_embed_ms=round(sum(embed_times) / len(embed_times), 1) if embed_times else 0.0,
            fts_empty_pct=round(100.0 * fts_empty / n, 1),
            query_results=results,
        )

    return {
        "hybrid_bare": _run("bare", bare_vectors, vector_only=False),
        "hybrid_prompted": _run("prompted", prompted_vectors, vector_only=False),
        "vector_only_bare": _run("bare", bare_vectors, vector_only=True),
        "vector_only_prompted": _run("prompted", prompted_vectors, vector_only=True),
    }


def _aggregate_english(scores: list[ModelScores]) -> ModelScores:
    if not scores:
        return ModelScores(model="", prompt_mode="bare", top1_pct=0.0, top3_pct=0.0, mean_embed_ms=0.0, fts_empty_pct=0.0)
    total = sum(len(s.query_results) for s in scores)
    top1 = sum(sum(1 for r in s.query_results if r.hit_at_1) for s in scores)
    top3 = sum(sum(1 for r in s.query_results if r.hit_at_3) for s in scores)
    embeds = [r.embed_ms for s in scores for r in s.query_results if r.embed_ms > 0]
    fts_empty = sum(sum(1 for r in s.query_results if r.fts_empty) for s in scores)
    return ModelScores(
        model=scores[0].model,
        prompt_mode=scores[0].prompt_mode,
        top1_pct=round(100.0 * top1 / total, 1) if total else 0.0,
        top3_pct=round(100.0 * top3 / total, 1) if total else 0.0,
        mean_embed_ms=round(sum(embeds) / len(embeds), 1) if embeds else 0.0,
        fts_empty_pct=round(100.0 * fts_empty / total, 1) if total else 0.0,
    )


def _pick_winner(english_prompted: dict[str, ModelScores]) -> tuple[str, str]:
    baseline = english_prompted.get(BASELINE_MODEL)
    baseline_top3 = baseline.top3_pct if baseline else 0.0

    ranked = sorted(
        english_prompted.items(),
        key=lambda item: (
            -item[1].top3_pct,
            -item[1].top1_pct,
            item[1].mean_embed_ms,
            MODEL_SIZE_MB.get(item[0], 9999),
        ),
    )
    winner_model, winner_scores = ranked[0]
    margin = winner_scores.top3_pct - baseline_top3

    if winner_model == BASELINE_MODEL or margin < WINNER_MARGIN_TOP3:
        reason = (
            f"Keep `{BASELINE_MODEL}`: best prompted top-3 is `{winner_model}` at "
            f"{winner_scores.top3_pct}% vs baseline {baseline_top3}% "
            f"(margin {margin:+.1f} pts; need ≥{WINNER_MARGIN_TOP3} to switch)."
        )
        return BASELINE_MODEL, reason

    return winner_model, (
        f"Recommend `{winner_model}`: prompted English top-3 {winner_scores.top3_pct}% "
        f"beats `{BASELINE_MODEL}` {baseline_top3}% by {margin:+.1f} pts "
        f"(≥{WINNER_MARGIN_TOP3} threshold). Mean query embed {winner_scores.mean_embed_ms} ms; "
        f"~{MODEL_SIZE_MB.get(winner_model, '?')} MB download."
    )


def _scores_to_dict(scores: ModelScores) -> dict[str, Any]:
    return {
        "model": scores.model,
        "prompt_mode": scores.prompt_mode,
        "top1_pct": scores.top1_pct,
        "top3_pct": scores.top3_pct,
        "mean_embed_ms": scores.mean_embed_ms,
        "fts_empty_pct": scores.fts_empty_pct,
        "query_results": [
            {
                "case_id": r.case_id,
                "hit_at_1": r.hit_at_1,
                "hit_at_3": r.hit_at_3,
                "fts_empty": r.fts_empty,
                "embed_ms": r.embed_ms,
                "top_names": r.top_names,
            }
            for r in scores.query_results
        ],
    }


def _write_report(
    report_path: Path,
    *,
    payload: dict[str, Any],
    recommendation: str,
    winner: str,
) -> None:
    lines = [
        "# KB embed model bake-off",
        "",
        f"Date: {payload['date']}",
        f"Ollama: `{payload['ollama_base']}`",
        f"Corpus: `{payload['corpus_db']}`",
        "",
        "## Recommendation",
        "",
        recommendation,
        "",
        f"**Winner under locked rule:** `{winner}`",
        "",
        "## Key findings",
        "",
        f"- Keyword-only baseline: **{payload['keyword_baseline']['top1_pct']}%** top-1 / **{payload['keyword_baseline']['top3_pct']}%** top-3.",
        f"- Best hybrid prompted top-3: **{max((m, payload['english']['prompted'][m]['top3_pct']) for m in payload['models'])}%** (see table below).",
        "- Re-run: `python scripts/eval_kb_embed_models.py --write-report`",
        "",
        "## English aggregate (kb_eval_v0 + paraphrases)",
        "",
        f"Scoring uses `max(ask_mode top_k, {EVAL_MIN_TOP_K})` so top-3 is meaningful when fixtures use speed mode.",
        "",
        "| Model | Bare top-1 | Bare top-3 | Prompted top-1 | Prompted top-3 | Mean embed ms | FTS empty % |",
        "|-------|------------|------------|----------------|----------------|---------------|-------------|",
    ]
    for model in payload["models"]:
        bare = payload["english"]["bare"].get(model, {})
        prompted = payload["english"]["prompted"].get(model, {})
        lines.append(
            f"| {model} | {bare.get('top1_pct', '—')}% | {bare.get('top3_pct', '—')}% | "
            f"{prompted.get('top1_pct', '—')}% | {prompted.get('top3_pct', '—')}% | "
            f"{prompted.get('mean_embed_ms', '—')} | {prompted.get('fts_empty_pct', '—')}% |"
        )

    lines.extend(
        [
            "",
            "## Keyword-only baseline",
            "",
            f"- Top-1: **{payload['keyword_baseline']['top1_pct']}%**",
            f"- Top-3: **{payload['keyword_baseline']['top3_pct']}%**",
            f"- FTS empty: **{payload['keyword_baseline']['fts_empty_pct']}%**",
            "",
            "## Spanish probe (informational — does not pick winner)",
            "",
            "| Model | Hybrid bare top-3 | Hybrid prompted top-3 | Vector-only bare top-3 | Vector-only prompted top-3 |",
            "|-------|-------------------|----------------------|------------------------|----------------------------|",
        ]
    )
    for model, probe in payload.get("spanish_probe", {}).items():
        lines.append(
            f"| {model} | {probe['hybrid_bare']['top3_pct']}% | {probe['hybrid_prompted']['top3_pct']}% | "
            f"{probe['vector_only_bare']['top3_pct']}% | {probe['vector_only_prompted']['top3_pct']}% |"
        )

    lines.extend(
        [
            "",
            "## Winner rule (locked)",
            "",
            "1. Highest **prompted top-3** on English eval + paraphrases.",
            "2. Ties → top-1, mean embed latency, download size.",
            f"3. Switch only if margin over `{BASELINE_MODEL}` prompted top-3 ≥ **{WINNER_MARGIN_TOP3}** points.",
            "",
            "## Raw JSON",
            "",
            f"Full payload: `{payload['json_path']}`",
            "",
        ]
    )
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(lines), encoding="utf-8")


def run_bakeoff(
    *,
    ollama_base: str,
    out_dir: Path,
    models: list[str],
    write_report: bool,
) -> dict[str, Any]:
    db_path = _ensure_seed_db(out_dir)
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row

    docs = _load_corpus_docs(conn)
    compat_docs = [d for d in docs if d.domain == "compat"]

    english_cases = (
        _load_fixture(FIXTURES / "kb_eval_v0.json", "kb_eval_v0")
        + _load_fixture(FIXTURES / "kb_eval_paraphrase_v0.json", "paraphrase")
    )
    spanish_cases = _load_fixture(FIXTURES / "kb_eval_es_probe_v0.json", "spanish_probe")

    keyword_scores = _evaluate_model(
        conn, ollama_base, "keyword", docs, english_cases, prompt_mode="bare", hybrid=False
    )

    eval_v0 = _load_fixture(FIXTURES / "kb_eval_v0.json", "kb_eval_v0")
    eval_para = _load_fixture(FIXTURES / "kb_eval_paraphrase_v0.json", "paraphrase")

    english_bare: dict[str, dict[str, Any]] = {}
    english_prompted: dict[str, dict[str, Any]] = {}
    english_prompted_scores: dict[str, ModelScores] = {}

    for model in models:
        print(f"Embedding corpus for {model} (bare)...", file=sys.stderr)
        bare_vectors = _build_vectors(ollama_base, model, docs, "bare")
        print(f"Evaluating {model} (bare)...", file=sys.stderr)
        bare_v0 = _evaluate_model(
            conn, ollama_base, model, docs, eval_v0, prompt_mode="bare", hybrid=True, vectors_by_id=bare_vectors
        )
        bare_para = _evaluate_model(
            conn, ollama_base, model, docs, eval_para, prompt_mode="bare", hybrid=True, vectors_by_id=bare_vectors
        )
        bare_agg = _aggregate_english([bare_v0, bare_para])
        english_bare[model] = _scores_to_dict(bare_agg)

        print(f"Embedding corpus for {model} (prompted)...", file=sys.stderr)
        prompted_vectors = _build_vectors(ollama_base, model, docs, "prompted")
        print(f"Evaluating {model} (prompted)...", file=sys.stderr)
        prompted_v0 = _evaluate_model(
            conn,
            ollama_base,
            model,
            docs,
            eval_v0,
            prompt_mode="prompted",
            hybrid=True,
            vectors_by_id=prompted_vectors,
        )
        prompted_para = _evaluate_model(
            conn,
            ollama_base,
            model,
            docs,
            eval_para,
            prompt_mode="prompted",
            hybrid=True,
            vectors_by_id=prompted_vectors,
        )
        prompted_agg = _aggregate_english([prompted_v0, prompted_para])
        english_prompted[model] = _scores_to_dict(prompted_agg)
        english_prompted_scores[model] = prompted_agg

    spanish_probe: dict[str, Any] = {}
    for model in models:
        print(f"Spanish probe {model}...", file=sys.stderr)
        bare_cv = _build_vectors(ollama_base, model, compat_docs, "bare")
        prompted_cv = _build_vectors(ollama_base, model, compat_docs, "prompted")
        probe = _evaluate_spanish_probe(
            conn,
            ollama_base,
            model,
            compat_docs,
            spanish_cases,
            bare_vectors=bare_cv,
            prompted_vectors=prompted_cv,
        )
        spanish_probe[model] = {
            "hybrid_bare": _scores_to_dict(probe["hybrid_bare"]),
            "hybrid_prompted": _scores_to_dict(probe["hybrid_prompted"]),
            "vector_only_bare": _scores_to_dict(probe["vector_only_bare"]),
            "vector_only_prompted": _scores_to_dict(probe["vector_only_prompted"]),
        }

    conn.close()

    winner, recommendation = _pick_winner(english_prompted_scores)
    today = date.today().isoformat()
    json_path = REPO_ROOT / "docs" / "archive" / "research" / f"kb-embed-bakeoff-{today}.json"

    payload: dict[str, Any] = {
        "date": today,
        "ollama_base": ollama_base,
        "corpus_db": str(db_path),
        "models": models,
        "keyword_baseline": _scores_to_dict(keyword_scores),
        "english": {"bare": english_bare, "prompted": english_prompted},
        "spanish_probe": spanish_probe,
        "winner": winner,
        "recommendation": recommendation,
        "json_path": str(json_path.relative_to(REPO_ROOT)).replace("\\", "/"),
    }

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    if write_report:
        report_path = REPO_ROOT / "docs" / "archive" / "research" / f"kb-embed-bakeoff-{today}.md"
        _write_report(report_path, payload=payload, recommendation=recommendation, winner=winner)
        print(f"Wrote {report_path}", file=sys.stderr)

    print(f"Wrote {json_path}", file=sys.stderr)
    print(recommendation, file=sys.stderr)
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="KB embed model bake-off eval")
    parser.add_argument("--ollama", default=DEFAULT_OLLAMA, help="Ollama HTTP base URL")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT_DIR, help="Seed corpus output dir")
    parser.add_argument(
        "--models",
        nargs="+",
        default=DEFAULT_MODELS,
        help="Ollama embed model tags to evaluate",
    )
    parser.add_argument("--write-report", action="store_true", default=True)
    parser.add_argument("--no-write-report", action="store_false", dest="write_report")
    args = parser.parse_args()

    try:
        run_bakeoff(
            ollama_base=args.ollama,
            out_dir=args.out,
            models=args.models,
            write_report=args.write_report,
        )
    except EmbedError as exc:
        print(f"embed error: {exc}", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print(f"build_rag_db failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
