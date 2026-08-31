# KB embed model bake-off

Date: 2026-08-31
Ollama: `http://127.0.0.1:11434`
Corpus: `C:\Users\still\Documents\BonsAI\build\knowledge-base-embed-bakeoff\corpus.db`

## Recommendation

No model sweep in this run (`--arms-only`); `nomic-embed-text` stands unchallenged by default, not by measurement.

**Winner under locked rule:** `nomic-embed-text`

## Key findings

- Keyword-only baseline: **58.1%** top-1 / **77.3%** top-3.
- Best hybrid prompted top-3: not measured in this run (`--arms-only`).
- Holdout arm verdict: No separation on holdout top-3: RRF 78.3% [69.6, 85.9] vs keyword 70.7% [60.9, 80.4] — intervals overlap, so these fixtures (n=92) cannot tell the arms apart. Not a tie; an unresolved question.
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
| keyword | 63.1% | [56.0, 70.2] | 81.0% | [75.0, 86.3] |
| vector_only | 70.8% | [64.3, 78.0] | 91.1% | [86.9, 95.2] |
| rrf_rerank_only | 64.3% | [57.1, 71.4] | 83.3% | [77.4, 88.7] |
| rrf | 66.1% | [58.9, 73.2] | 89.9% | [85.1, 94.0] |

### holdout (n=92)

| Arm | top-1 | top-1 CI | top-3 | top-3 CI |
|-----|-------|----------|-------|----------|
| keyword | 48.9% | [39.1, 59.8] | 70.7% | [60.9, 80.4] |
| vector_only | 63.0% | [53.3, 72.8] | 82.6% | [75.0, 90.2] |
| rrf_rerank_only | 50.0% | [39.1, 59.8] | 71.7% | [62.0, 81.5] |
| rrf | 54.3% | [44.6, 65.2] | 78.3% | [69.6, 85.9] |

**Holdout verdict:** No separation on holdout top-3: RRF 78.3% [69.6, 85.9] vs keyword 70.7% [60.9, 80.4] — intervals overlap, so these fixtures (n=92) cannot tell the arms apart. Not a tie; an unresolved question.

### Recall — labeled cases keyword search cannot answer

Cases where the **keyword** arm returned no candidate at all. Every arm is scored on the same cases, so this reads as: when keywords fail, who still finds the card?

This slice exists because its absence hid a real bug. Until 2026-08-18 the vector half only re-ordered the keyword shortlist, so every fusion arm scored **0% here by construction** — and because the corpus answers most labeled questions on keywords alone, the overall tables barely moved. A `rrf` row that matches `rrf_rerank_only` here means the recall pass has stopped working.

| Arm | top-1 | top-3 | n |
|-----|-------|-------|---|
| vector_only | 0.0% | 75.0% | 4 |
| rrf_rerank_only | 0.0% | 0.0% | 4 |
| rrf | 0.0% | 50.0% | 4 |

## Gate reachability (R2)

A fixture's `domain` is what we want retrieval to do. `should_retrieve_knowledge` decides what production *actually* does. Cases where those disagree are not retrieval failures — they are traffic that never reaches retrieval at all, and they must not drive weight tuning. (Q8 / D16 widened the compat gate; remaining unreachable rows are expected misses, not a deferred product bug.)

| Domain | Cases | Gate-reachable | Unreachable |
|--------|-------|----------------|-------------|
| compat | 52 | 49 | 3 |
| strategy | 289 | 289 | 0 |

### Compat scored twice

| Slice | Arm | top-3 | top-3 CI | n |
|-------|-----|-------|----------|---|
| overall | keyword | 65.4% | [51.9, 76.9] | 52 |
| overall | vector_only | 71.2% | [57.7, 82.7] | 52 |
| overall | rrf_rerank_only | 71.2% | [59.6, 82.7] | 52 |
| overall | rrf | 71.2% | [59.6, 82.7] | 52 |
| gate-reachable only | keyword | 69.4% | [57.1, 81.6] | 49 |
| gate-reachable only | vector_only | 73.5% | [61.2, 85.7] | 49 |
| gate-reachable only | rrf_rerank_only | 73.5% | [61.2, 85.7] | 49 |
| gate-reachable only | rrf | 73.5% | [61.2, 85.7] | 49 |


## Keyword-only baseline

- Top-1: **58.1%**
- Top-3: **77.3%**
- FTS empty: **1.5%**

## Spanish probe (informational — does not pick winner)

| Model | Hybrid bare top-3 | Hybrid prompted top-3 | Vector-only bare top-3 | Vector-only prompted top-3 |
|-------|-------------------|----------------------|------------------------|----------------------------|

## Winner rule (locked)

1. Highest **prompted top-3** on English eval + paraphrases.
2. Ties → top-1, mean embed latency, download size.
3. Switch only if margin over `nomic-embed-text` prompted top-3 ≥ **5.0** points.

## Raw JSON

Full payload: `docs/archive/research/kb-embed-bakeoff-2026-08-31-arms.json`
