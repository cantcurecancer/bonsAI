# KB retrieval PR2 bake-off (superseding)

Date: 2026-08-09  
Corpus: schema v3 seed — **119** strategy sections / **124** compat tips / **13** titles  
Fixture: [`tests/fixtures/kb_eval_v2.json`](../../../tests/fixtures/kb_eval_v2.json) — **221** queries, **140** labeled (tune 104 / holdout 36)  
Embed model: `nomic-embed-text` (prompted prefixes)  
Raw arms payload: [kb-embed-bakeoff-2026-08-09-arms.json](kb-embed-bakeoff-2026-08-09-arms.json) · machine summary: [kb-embed-bakeoff-2026-08-09-arms.md](kb-embed-bakeoff-2026-08-09-arms.md)

This report **supersedes** [kb-embed-bakeoff-2026-07-31.md](kb-embed-bakeoff-2026-07-31.md) for retrieval-quality claims. That earlier run measured cosine-only re-rank against a 22-card seed and an unreachable compat gate; none of those conditions apply here.

## Ship decision

| Question | Answer |
|---|---|
| Does RRF beat keyword on holdout top-3 (non-overlapping CIs)? | **No separation.** RRF 80.6% [66.7, 91.7] vs keyword 83.3% [69.4, 94.4], n=36 labeled holdout. |
| Lock fusion constants? | **Yes — keep equal weights.** `RRF_K=60`, `RRF_W_FTS=1.0`, `RRF_W_VEC=1.0`, `BM25_RELEVANCE_FLOOR=1.0`. |
| Keep hybrid on by default? | **Yes.** Kill-switch remains (`rag_hybrid_retrieval_enabled`). Vector-only alone is weak; fusion stays as the hybrid path. |
| Swap embed model? | **No** (arms-only run; prior bake-off already kept nomic). |

The old headline “keyword beat hybrid” is retired. On an honest deepened corpus, keyword and RRF are statistically inseparable on the ship gate. Point estimates lean slightly keyword; that is not a mandate to turn hybrid off.

## Numbers (labeled rows only)

Blank `expect_*` rows are deliberate content gaps and are excluded from ship-gate math so automatic misses do not drown the arms.

### Tune (n=104) — for locking only

| Arm | top-1 | top-3 |
|---|---|---|
| keyword | 76.0% [67.3, 83.7] | **88.5%** [81.7, 94.2] |
| vector_only | 66.3% [56.7, 75.0] | 79.8% [72.1, 87.5] |
| rrf | 75.0% [66.3, 83.7] | 86.5% [78.8, 92.3] |

### Holdout (n=36) — ship gate

| Arm | top-1 | top-3 |
|---|---|---|
| keyword | 69.4% [52.8, 83.3] | **83.3%** [69.4, 94.4] |
| vector_only | 52.8% [36.1, 69.4] | 63.9% [47.2, 80.6] |
| rrf | 63.9% [47.2, 80.6] | 80.6% [66.7, 91.7] |

**Verdict:** no separation (overlapping intervals). Not a tie claimed as a win.

### Compat (gate-reachable, n=39)

| Arm | top-3 |
|---|---|
| keyword | **66.7%** [51.3, 82.1] |
| rrf | 59.0% [43.6, 74.4] |
| vector_only | 15.4% [5.1, 28.2] |

Compat still prefers keyword. Vector-only over the tip sheet is poor. Fusion is between the two. Phase 7’s “keyword-heavy when FTS is strong” remains the right follow-up if a later bake-off needs to move the needle — not a silent weight change after reading holdout.

### Gate reachability (D16)

| Domain | Cases | Reachable |
|---|---|---|
| strategy | 181 | 181 |
| compat | 40 | 39 |

One known compat miss remains; that is intentional and stable.

## What this run fixed vs 2026-07-31

1. Production prefixes (`search_query:` / `search_document:`) match the eval.
2. Ranking is RRF, not cosine-only exile.
3. Compat traffic is mostly gate-reachable (D16).
4. Corpus is large enough that the FTS shortlist does not swallow every card.
5. Holdout exists and is labeled; empty-holdout “no verdict” is gone.

## Reproduce

```bash
python scripts/eval_kb_embed_models.py --arms-only --force-rebuild --write-report
```

Requires local Ollama with `nomic-embed-text`.
