# KB embed model bake-off

Date: 2026-08-28
Ollama: `http://127.0.0.1:11434`
Corpus: `C:\Users\still\Documents\BonsAI\.claude\worktrees\rag-integration\build\knowledge-base-embed-bakeoff\corpus.db`

## Recommendation

No model sweep in this run (`--arms-only`); `nomic-embed-text` stands unchallenged by default, not by measurement.

**Winner under locked rule:** `nomic-embed-text`

## Key findings

- Keyword-only baseline: **71.1%** top-1 / **85.5%** top-3.
- Best hybrid prompted top-3: not measured in this run (`--arms-only`).
- Holdout arm verdict: No separation on holdout top-3: RRF 85.7% [75.0, 94.6] vs keyword 83.9% [73.2, 92.9] — intervals overlap, so these fixtures (n=56) cannot tell the arms apart. Not a tie; an unresolved question.
- Re-run: `python scripts/eval_kb_embed_models.py --write-report`

## English aggregate (kb_eval_v2, labeled rows)

Scoring uses `max(ask_mode top_k, 3)` so top-3 is meaningful when fixtures use speed mode. Blank-label gap rows are excluded from model and arm ship-gate math.

| Model | Bare top-1 | Bare top-3 | Prompted top-1 | Prompted top-3 | Mean embed ms | FTS empty % |
|-------|------------|------------|----------------|----------------|---------------|-------------|
| nomic-embed-text | —% | —% | —% | —% | — | —% |
| nomic-embed-text-v2-moe | —% | —% | —% | —% | — | —% |
| qwen3-embedding:0.6b | —% | —% | —% | —% | — | —% |
| mxbai-embed-large | —% | —% | —% | —% | — | —% |
| snowflake-arctic-embed2 | —% | —% | —% | —% | — | —% |
| bge-m3 | —% | —% | —% | —% | — | —% |

## Retrieval arms — keyword vs vector-only vs RRF

Baseline model `nomic-embed-text`, prompted, **same corpus for every arm** (R4). Confidence intervals are a seeded percentile bootstrap (2000 resamples) over per-case hits.

**Weights and the floor are tuned on `tune` only. `holdout` is the ship gate — reading it before tuning is finished invalidates it.**

### tune (n=117)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 75.2% | [66.7, 82.9] | 86.3% | [79.5, 92.3] |
| vector_only | 74.4% | [65.8, 82.1] | 91.5% | [85.5, 95.7] |
| rrf_rerank_only | 74.4% | [65.8, 82.1] | 88.9% | [82.9, 94.9] |
| rrf | 75.2% | [66.7, 82.9] | 91.5% | [86.3, 96.6] |

### holdout (n=56)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 62.5% | [50.0, 75.0] | 83.9% | [73.2, 92.9] |
| vector_only | 66.1% | [53.6, 78.6] | 83.9% | [73.2, 92.9] |
| rrf_rerank_only | 62.5% | [50.0, 75.0] | 83.9% | [73.2, 92.9] |
| rrf | 62.5% | [50.0, 75.0] | 85.7% | [75.0, 94.6] |

**Holdout verdict:** No separation on holdout top-3: RRF 85.7% [75.0, 94.6] vs keyword 83.9% [73.2, 92.9] — intervals overlap, so these fixtures (n=56) cannot tell the arms apart. Not a tie; an unresolved question.

### Recall — labeled cases keyword search cannot answer

Cases where the **keyword** arm returned no candidate at all. Every arm is scored on the same cases, so this reads as: when keywords fail, who still finds the card?

This slice exists because its absence hid a real bug. Until 2026-08-18 the vector half only re-ordered the keyword shortlist, so every fusion arm scored **0% here by construction** — and because the corpus answers most labeled questions on keywords alone, the overall tables barely moved. A `rrf` row that matches `rrf_rerank_only` here means the recall pass has stopped working.

| Arm | top-1 | top-3 | n |
|-----|-------|-------|---|
| vector_only | 0.0% | 66.7% | 3 |
| rrf_rerank_only | 0.0% | 0.0% | 3 |
| rrf | 0.0% | 33.3% | 3 |

## Gate reachability (R2)

A fixture's `domain` is what we want retrieval to do. `should_retrieve_knowledge` decides what production *actually* does. Cases where those disagree are not retrieval failures — they are traffic that never reaches retrieval at all, and they must not drive weight tuning. (Q8 / D16 widened the compat gate; remaining unreachable rows are expected misses, not a deferred product bug.)

| Domain | Cases | Gate-reachable | Unreachable |
|--------|-------|----------------|-------------|
| compat | 50 | 48 | 2 |
| strategy | 204 | 204 | 0 |

### Compat scored twice

| Slice | Arm | top-3 | top-3 CI | n |
|-------|-----|-------|----------|---|
| overall | keyword | 68.0% | [54.0, 80.0] | 50 |
| overall | vector_only | 72.0% | [60.0, 84.0] | 50 |
| overall | rrf_rerank_only | 74.0% | [60.0, 86.0] | 50 |
| overall | rrf | 74.0% | [60.0, 86.0] | 50 |
| gate-reachable only | keyword | 70.8% | [58.3, 83.3] | 48 |
| gate-reachable only | vector_only | 72.9% | [60.4, 85.4] | 48 |
| gate-reachable only | rrf_rerank_only | 75.0% | [62.5, 87.5] | 48 |
| gate-reachable only | rrf | 75.0% | [62.5, 87.5] | 48 |


## Keyword-only baseline

- Top-1: **71.1%**
- Top-3: **85.5%**
- FTS empty: **1.7%**

## Spanish probe (informational — does not pick winner)

| Model | Hybrid bare top-3 | Hybrid prompted top-3 | Vector-only bare top-3 | Vector-only prompted top-3 |
|-------|-------------------|----------------------|------------------------|----------------------------|

## Winner rule (locked)

1. Highest **prompted top-3** on English eval + paraphrases.
2. Ties → top-1, mean embed latency, download size.
3. Switch only if margin over `nomic-embed-text` prompted top-3 ≥ **5.0** points.

## Raw JSON

Full payload: `docs/archive/research/kb-embed-bakeoff-2026-08-28-arms.json`
