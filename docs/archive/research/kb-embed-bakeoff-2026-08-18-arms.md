# KB embed model bake-off

Date: 2026-08-18
Ollama: `http://127.0.0.1:11434`
Corpus: `C:\Users\still\Documents\BonsAI\build\knowledge-base-embed-bakeoff\corpus.db`

## Recommendation

No model sweep in this run (`--arms-only`); `nomic-embed-text` stands unchallenged by default, not by measurement.

**Winner under locked rule:** `nomic-embed-text`

## Key findings

- Keyword-only baseline: **73.9%** top-1 / **87.0%** top-3.
- Best hybrid prompted top-3: not measured in this run (`--arms-only`).
- Holdout arm verdict: No separation on holdout top-3: RRF 80.6% [66.7, 91.7] vs keyword 83.3% [69.4, 94.4] — intervals overlap, so these fixtures (n=36) cannot tell the arms apart. Not a tie; an unresolved question.
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

### tune (n=102)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 75.5% | [66.7, 83.3] | 88.2% | [81.4, 94.1] |
| vector_only | 66.7% | [56.9, 75.5] | 81.4% | [73.5, 89.2] |
| rrf_rerank_only | 74.5% | [65.7, 82.4] | 86.3% | [79.4, 92.2] |
| rrf | 75.5% | [66.7, 83.3] | 90.2% | [83.3, 96.1] |

### holdout (n=36)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 69.4% | [52.8, 83.3] | 83.3% | [69.4, 94.4] |
| vector_only | 52.8% | [36.1, 69.4] | 63.9% | [47.2, 80.6] |
| rrf_rerank_only | 63.9% | [47.2, 80.6] | 80.6% | [66.7, 91.7] |
| rrf | 61.1% | [44.4, 75.0] | 80.6% | [66.7, 91.7] |

**Holdout verdict:** No separation on holdout top-3: RRF 80.6% [66.7, 91.7] vs keyword 83.3% [69.4, 94.4] — intervals overlap, so these fixtures (n=36) cannot tell the arms apart. Not a tie; an unresolved question.

### Recall — labeled cases keyword search cannot answer

Cases where the **keyword** arm returned no candidate at all. Every arm is scored on the same cases, so this reads as: when keywords fail, who still finds the card?

This slice exists because its absence hid a real bug. Until 2026-08-18 the vector half only re-ordered the keyword shortlist, so every fusion arm scored **0% here by construction** — and because the corpus answers most labeled questions on keywords alone, the overall tables barely moved. A `rrf` row that matches `rrf_rerank_only` here means the recall pass has stopped working.

| Arm | top-1 | top-3 | n |
|-----|-------|-------|---|
| vector_only | 0.0% | 100.0% | 1 |
| rrf_rerank_only | 0.0% | 0.0% | 1 |
| rrf | 0.0% | 100.0% | 1 |

## Gate reachability (R2)

A fixture's `domain` is what we want retrieval to do. `should_retrieve_knowledge` decides what production *actually* does. Cases where those disagree are not retrieval failures — they are traffic that never reaches retrieval at all, and they must not drive weight tuning. (Q8 / D16 widened the compat gate; remaining unreachable rows are expected misses, not a deferred product bug.)

| Domain | Cases | Gate-reachable | Unreachable |
|--------|-------|----------------|-------------|
| compat | 40 | 39 | 1 |
| strategy | 179 | 179 | 0 |

### Compat scored twice

| Slice | Arm | top-3 | top-3 CI | n |
|-------|-----|-------|----------|---|
| overall | keyword | 65.0% | [50.0, 80.0] | 40 |
| overall | vector_only | 20.0% | [7.5, 32.5] | 40 |
| overall | rrf_rerank_only | 57.5% | [42.5, 72.5] | 40 |
| overall | rrf | 57.5% | [42.5, 72.5] | 40 |
| gate-reachable only | keyword | 66.7% | [51.3, 82.1] | 39 |
| gate-reachable only | vector_only | 20.5% | [7.7, 33.3] | 39 |
| gate-reachable only | rrf_rerank_only | 59.0% | [43.6, 74.4] | 39 |
| gate-reachable only | rrf | 59.0% | [43.6, 74.4] | 39 |


## Keyword-only baseline

- Top-1: **73.9%**
- Top-3: **87.0%**
- FTS empty: **0.7%**

## Spanish probe (informational — does not pick winner)

| Model | Hybrid bare top-3 | Hybrid prompted top-3 | Vector-only bare top-3 | Vector-only prompted top-3 |
|-------|-------------------|----------------------|------------------------|----------------------------|

## Winner rule (locked)

1. Highest **prompted top-3** on English eval + paraphrases.
2. Ties → top-1, mean embed latency, download size.
3. Switch only if margin over `nomic-embed-text` prompted top-3 ≥ **5.0** points.

## Raw JSON

Full payload: `docs/archive/research/kb-embed-bakeoff-2026-08-18-arms.json`
