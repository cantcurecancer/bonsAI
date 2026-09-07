# KB embed model bake-off

Date: 2026-09-07
Ollama: `http://127.0.0.1:11434`
Corpus: `C:\Users\still\Documents\BonsAI\build\knowledge-base-embed-bakeoff\corpus.db`

## Recommendation

No model sweep in this run (`--arms-only`); `nomic-embed-text` stands unchallenged by default, not by measurement.

**Winner under locked rule:** `nomic-embed-text`

## Key findings

- Keyword-only baseline: **56.5%** top-1 / **79.9%** top-3.
- Best hybrid prompted top-3: not measured in this run (`--arms-only`).
- Holdout arm verdict: No separation on holdout top-3: vector-only 88.5% [83.3, 93.6] vs keyword 78.8% [72.4, 85.3] vs RRF-rerank-only 82.1% [76.3, 87.8] vs RRF 84.0% [78.2, 89.7] — intervals overlap, so these fixtures (n=156) cannot tell the arms apart. Not a tie; an unresolved question. (Arms judged: keyword, vector-only, RRF-rerank-only, RRF.)
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

### tune (n=168)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 61.3% | [53.6, 68.5] | 81.0% | [75.0, 86.3] |
| vector_only | 67.9% | [61.3, 75.0] | 87.5% | [82.7, 92.3] |
| rrf_rerank_only | 63.7% | [56.5, 70.8] | 82.1% | [76.2, 87.5] |
| rrf | 65.5% | [58.3, 72.6] | 88.1% | [82.7, 92.9] |

### holdout (n=156)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 51.3% | [43.6, 58.3] | 78.8% | [72.4, 85.3] |
| vector_only | 69.9% | [62.8, 76.9] | 88.5% | [83.3, 93.6] |
| rrf_rerank_only | 54.5% | [46.8, 61.5] | 82.1% | [76.3, 87.8] |
| rrf | 58.3% | [50.6, 65.4] | 84.0% | [78.2, 89.7] |

**Holdout verdict:** No separation on holdout top-3: vector-only 88.5% [83.3, 93.6] vs keyword 78.8% [72.4, 85.3] vs RRF-rerank-only 82.1% [76.3, 87.8] vs RRF 84.0% [78.2, 89.7] — intervals overlap, so these fixtures (n=156) cannot tell the arms apart. Not a tie; an unresolved question. (Arms judged: keyword, vector-only, RRF-rerank-only, RRF.)

### Recall — labeled cases keyword search cannot answer

Cases where the **keyword** arm returned no candidate at all. Every arm is scored on the same cases, so this reads as: when keywords fail, who still finds the card?

This slice exists because its absence hid a real bug. Until 2026-08-18 the vector half only re-ordered the keyword shortlist, so every fusion arm scored **0% here by construction** — and because the corpus answers most labeled questions on keywords alone, the overall tables barely moved. A `rrf` row that matches `rrf_rerank_only` here means the recall pass has stopped working.

| Arm | top-1 | top-3 | n |
|-----|-------|-------|---|
| vector_only | 0.0% | 66.7% | 3 |
| rrf_rerank_only | 0.0% | 0.0% | 3 |
| rrf | 0.0% | 66.7% | 3 |

## Gate reachability (R2)

A fixture's `domain` is what we want retrieval to do. `should_retrieve_knowledge` decides what production *actually* does. Cases where those disagree are not retrieval failures — they are traffic that never reaches retrieval at all, and they must not drive weight tuning. (Q8 / D16 widened the compat gate; remaining unreachable rows are expected misses, not a deferred product bug.)

| Domain | Cases | Gate-reachable | Unreachable |
|--------|-------|----------------|-------------|
| compat | 76 | 57 | 19 |
| strategy | 361 | 361 | 0 |

### Compat scored twice

| Slice | Arm | top-3 | top-3 CI | n |
|-------|-----|-------|----------|---|
| overall | keyword | 48.7% | [36.8, 59.2] | 76 |
| overall | vector_only | 52.6% | [42.1, 63.2] | 76 |
| overall | rrf_rerank_only | 51.3% | [39.5, 61.8] | 76 |
| overall | rrf | 51.3% | [39.5, 61.8] | 76 |
| gate-reachable only | keyword | 63.2% | [50.9, 75.4] | 57 |
| gate-reachable only | vector_only | 66.7% | [54.4, 78.9] | 57 |
| gate-reachable only | rrf_rerank_only | 66.7% | [54.4, 78.9] | 57 |
| gate-reachable only | rrf | 66.7% | [54.4, 78.9] | 57 |


## Keyword-only baseline

- Top-1: **56.5%**
- Top-3: **79.9%**
- FTS empty: **0.9%**

## Spanish probe (informational — does not pick winner)

| Model | Hybrid bare top-3 | Hybrid prompted top-3 | Vector-only bare top-3 | Vector-only prompted top-3 |
|-------|-------------------|----------------------|------------------------|----------------------------|

## Winner rule (locked)

1. Highest **prompted top-3** on English eval + paraphrases.
2. Ties → top-1, mean embed latency, download size.
3. Switch only if margin over `nomic-embed-text` prompted top-3 ≥ **5.0** points.

## Raw JSON

Full payload: `docs/archive/research/kb-embed-bakeoff-2026-09-07-arms.json`
