# RAG retrieval quality remediation — implementation plan

**Status:** Decisions locked (discovery 2026-08-02). **Docs only until PR1 starts.**  
**Analysis source (do not edit as ship plan):** [archive/rag-retrieval-quality-remediation-plan.md](archive/rag-retrieval-quality-remediation-plan.md)

This is the **active ship plan**. It copies the technical stages from the analysis doc, then overlays maintainer-locked decisions and reconciliation items (R1–R5). Where this plan and the analysis disagree, **this plan wins**.

---

## Why (short)

The 2026-07-31 bake-off said “keyword beat hybrid” and steered Phase 7. That conclusion was mostly a **harness artifact**:

- Only 22 strategy cards (2/game) while hybrid shortlists 30 → not real hybrid ranking; with a game filter, top-3 was often trivial.
- 40 eval queries, models tied at 82.5% → metric too coarse.
- Eval used nomic `search_query:` / `search_document:` prefixes; **production did not**.
- Shipped rerank was cosine-only → strong keyword hits without vectors sank.
- No relevance floor → weak matches still injected and cited.

Intended outcome: genuinely hybrid retrieval, an eval that can detect the difference without self-referential inflation, and transparency that matches what the model received.

---

## Delivery: two PRs

| PR | Scope | Gate |
|---|---|---|
| **PR1** | Stages 1–5: prefixes + schema v3, RRF + BM25 floor (**provisional, deliberately loose**), query fixes, scale/robustness, transparency, tests, docs for that slice | Backend + frontend unit tests; no bake-off claim |
| **PR2** | Stage 6: deepen seed, grow eval fixtures, kill-switch UI, bake-off re-run, lock weights/floor from **tune** split, report **holdout** as ship gate, superseding research report, remaining docs | Maintainer sign-off on cards + eval fixtures; holdout RRF vs keyword with non-overlapping CIs on **same deepened corpus** |

PR1 ships placeholder fusion weights and a **loose** relevance floor (R3). Final constants come from PR2 tune-split eval. Do **not** compare new numbers to the old 92.5% keyword baseline (R4).

---

## Locked decisions (discovery)

| # | Decision | Choice |
|---|---|---|
| 1 | Ship shape | **Two PRs** as above |
| 2 | Strategy cards | Agent drafts best-effort; **maintainer signs off before rebuild/deploy**. Stub style OK (`bonsAI-maintainer`). Not Phase 6 wiki attributions. |
| 3 | Eval queries + labels | Agent drafts; **maintainer signs off before bake-off**. See R1 for draft **order** (queries before cards). |
| 4 | RRF + floor | **Both** strategy and compat paths |
| 5 | Kill-switch off label | Distinct Show details string (e.g. **Keyword search (hybrid disabled)**), not the same as embed-unavailable. Needs new `RetrievalMethod` literal + chip/detail label branches. |
| 6 | Schema v3 | Old v2 corpora → keyword fallback until rebuild; **no migration wizard** |
| 7 | QA / eval infra | Deck deployable; PC has Ollama + `nomic-embed-text` |
| 8 | Compat phrase gate | **OPEN / deferred** — see below. Do not silently fix or ignore. |
| 9 | Phase 5 / Phase 7 | **Partial content depth** ships in PR2; Phase 5 keeps chip vector ranking, heavier wiki ingest, full content bar. **RRF (FTS+vector)** moves out of Phase 7 into this work. Trust-tier-in-RRF, ANN, demote, etc. stay Phase 7. |
| 10 | Plain talk | Short `.cursorrules` note only — plain language + sign-off gates |

### Open decision (Q8) — compat phrase gate

Troubleshooting KB only runs when `question_matches_troubleshooting_log_context` matches a hardcoded phrase list. Natural-language asks (e.g. `deck sleep resume proton black screen`) skip KB in production. Roadmap Bugs row: **KB compat retrieval phrase gate**.

**Defer the product fix** for this remediation. **Must** make the gap visible in eval (R2) so we do not tune RRF on traffic production never routes.

---

## Reconciliation (R1–R5) — fold in before corpus / eval drafting

### R1. Prevent a self-referential eval (highest priority)

Do **not** write cards, then matching questions, then answer keys. That measures “can we find the card we wrote the query from” and inflates every arm.

**Required:**

- Draft **eval query intents** (and provisional labels) **before** writing strategy cards, or from how players phrase questions — not by reading a card and writing a matching question.
- Workflow: query intents → cards that cover those intents → maintainer sign-off on **both** → rebuild → bake-off.
- No query may reuse distinctive noun phrases from its target card **verbatim**. Explicit checklist item in maintainer sign-off.
- Split ~150 queries into **tune / holdout** (~100 / ~50). Tune RRF weights and relevance floor on **tune only**. **Holdout** is the PR2 eval gate. Record both in the superseding research report.

### R2. Make the deferred phrase gate visible in eval numbers

`scripts/eval_kb_embed_models.py` never calls `should_retrieve_knowledge` / `question_matches_troubleshooting_log_context`; it trusts fixture `domain`. Compat cases that miss the production gate must not silently drive weight tuning.

**Required:**

- Track `gate_reachable` for every compat case (prefer compute in eval runner or a check that asserts fixture flags match the live phrase function — avoid stale baked booleans).
- Report compat scores **twice**: overall, and gate-reachable-only.
- Superseding research report shows both; note the gap is deferred Q8, not retrieval quality.

### R3. PR1 relevance floor — loose and provisional

After PR1, existing corpora are schema v2 → hybrid refused → keyword fallback. RRF is dead until rebuild. The relevance floor is the main live ranking change in PR1.

**Required:**

- Floor deliberately **loose** (drop only near-certain junk). Too strict → KB stops attaching (clean degrade); too loose → no-op.
- Tag the constant in code as provisional; name PR2 / bake-off as source of the final value.
- PR2 tightens using **tune-split** data (R1).

### R4. Baseline comparability

Do **not** compare new hybrid/RRF numbers to the 2026-07-31 keyword 92.5%. Re-run keyword / vector-only / RRF on the **deepened** corpus; report only same-corpus comparisons.

### R5. Easy-to-miss touch points

- PR1 must **rewrite** (not leave as regressions):  
  `tests/test_knowledge_base_service.py::test_rerank_cards_by_vector_orders_by_similarity`  
  and `::test_hybrid_retrieval_reranks_when_nomic_available`. Call out in the PR body.
- Decision 5: new `RetrievalMethod` member in `knowledge_base_service.py` + matching branches in `kb_retrieval_chip_label` / `kb_retrieval_detail_label` in `transparency_service.py`.
- Active implementation plan stays at **`docs/` root**. Analysis doc gets an archived banner pointing here.
- `.cursorrules` stays bootstrap-only: Plain talk ~2 lines (or MCP policy + link). Do not dump full review policy there.

### Good news (no extra work)

`tests/test_knowledge_base_service.py` rebuilds seed via `build_rag_db.py --seed`, so schema v3 + deepened seed flow through automatically.

---

## Maintainer sign-off checklist (PR2)

Before rebuild / bake-off:

- [ ] Eval query intents drafted **before** (or independently of) card text — not card→query echo
- [ ] No query reuses distinctive noun phrases from its target card verbatim
- [ ] Strategy cards reviewed (best-effort correctness + distinctness)
- [ ] Eval fixtures + labels reviewed
- [ ] Compat `gate_reachable` reporting understood; Q8 still open
- [ ] Tune/holdout split recorded
- [ ] Explicit sign-off: “approved for rebuild and bake-off”

---

## Stage 1 — Embedding prefixes and corpus compatibility

Prefixes change the vector format — breaking for existing corpora. Blast radius: seed/dev only (no public publish yet).

- Add `format_embed_query()` / `format_embed_document()` to `py_modules/backend/services/ollama_embed_service.py` as the single owner of prefix logic. Port model-family branching from `scripts/eval_kb_embed_models.py`; eval **imports** these — no divergent copies.
- Apply `search_document:` in `build_rag_db.py:_populate_vectors_for_table`, and `search_query:` at the `embed_texts` call in `knowledge_base_service.py`.
- Bump `CORPUS_SCHEMA_VERSION` 2 → 3; add `embedding_variant: "nomic-prefixed-v1"` to the manifest.
- Compatibility gate in `retrieve_knowledge_context`: missing/mismatched `embedding_variant` or `embedding_model` → keyword with `retrieval_method="keyword_embed_unavailable"`.
- Replace silent `zip()` truncation in `_dot_similarity` with an explicit length check; mismatch skips the card and disables hybrid for that request.

## Stage 2 — RRF fusion, relevance floor, BM25 weighting

Applies to **strategy and compat**.

- Replace `_rerank_cards_by_vector` with RRF:  
  `score = w_fts/(k + rank_fts) + w_vec/(k + rank_vec)`, `k = 60`. Vectorless cards keep FTS contribution. Keep `w_fts`, `w_vec`, `k` as module constants for eval sweeps.
- Capture BM25 score in `_search_sections` and `_search_compat_patterns`; drop below floor; if all dropped → genre/compat fallback → `attached=False`.
- Column weighting: `bm25(sections_fts, 10.0, 1.0)`; `bm25(compat_patterns_fts, 5.0, 2.0, 1.0)`.
- PR1: provisional weights + **loose** floor (R3). PR2: lock from **tune** split; gate on **holdout** (R1). Trust tier is **not** in fusion yet (Phase 7).

## Stage 3 — Query construction fixes

- Separate `question_for_retrieval = lane.text` for `should_retrieve_knowledge` / `retrieve_knowledge_context`; keep follow-up block on `question_for_model` only.
- Drop `app_name` from expansion when `game_id` resolved; prepend only on unresolved-game path.
- Stopword filtering in `_fts_match_query`; raise token cap.

## Stage 4 — Scale and robustness

- Prefer manifest `embedding_section_count` / `embedding_compat_count`; else `EXISTS … LIMIT 1` instead of full-table `COUNT(*)`.
- Cache `nomic_embed_available` per `(host, model)` with short TTL.
- Batch embed in `build_rag_db.py` (batch_size=16), write incrementally, delete only after first successful batch, print progress.
- `VACUUM` + `PRAGMA journal_mode=DELETE` before `compress_db`; open corpus `?mode=ro&immutable=1`.

## Stage 5 — Transparency and attribution correctness

- Block trust tier = **lowest** tier present.
- `_format_block`: drop whole cards to fit budget; always emit end sentinel; `sources` from surviving cards only.
- `stack_context_blocks` reports which blocks survived; build KB transparency **after** stacking.
- Kill-switch off → distinct `RetrievalMethod` + labels (Decision 5).

## Stage 6 — Corpus depth, kill-switch, re-validated eval (PR2)

- Deepen `data/kb/strategy_seed.json` to ~8–12 sections per existing 11 titles (no net-new titles). Keep `write_attributions` in step. **After** query intents (R1).
- Grow eval fixtures toward ~150 English queries with tune/holdout; `gate_reachable` reporting (R2).
- Extend eval to keyword / vector-only / RRF + confidence intervals; non-overlapping-CI rule; same-corpus only (R4).
- Hybrid kill-switch: `sanitize_rag_hybrid_retrieval_enabled` (default `True`), schema/normalizers/payload, Developer tab toggle next to seed install. Honour before `nomic_ready`. No Ollama-tab focus-graph changes.
- Superseding report under `docs/archive/research/`; correction note on 2026-07-31 bake-off.

---

## Tests

Extend `tests/test_knowledge_base_service.py` (seed rebuild via `--seed` is automatic):

- Prefix application; eval and runtime agree
- Variant / dimension mismatch → keyword fallback
- RRF keeps strong keyword hit when vector missing
- Relevance floor → `attached=False` on weak cards (loose in PR1)
- Follow-up Asks retrieve on user question, not follow-up header
- Lowest trust tier in mixed block; whole-card drop + sentinel; stacking starvation → `attached=False`
- Kill-switch disables hybrid; keyword intact
- Rewrite cosine-only tests (R5)

Also: `tests/test_ollama_embed_service.py` prefix helpers; `tests/test_settings_service.py` new setting; `src/utils/settingsAndResponse.test.ts` frontend round-trip.

---

## Documentation (with each PR’s change set)

- `docs/roadmap.md` — active index; remediation row under [Planned](../roadmap.md#planned); fixed-bug detail in [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md)
- `docs/knowledge-base.md` — correct Phase 2/3 hybrid claim; prefixes, variant, schema v3, floor, kill-switch
- `docs/testing.md` — RRF, floor, follow-up, variant mismatch, KB-EVAL-01 re-run; Deck rows **Open** until on-device
- `docs/troubleshooting.md` — rebuild after schema bump; Dev toggle
- `docs/archive/roadmap-completed.md` + `CHANGELOG.md` when shipped

---

## Verification

1. `python scripts/run_python_tests.py`
2. `pnpm vitest run` (settings / related suites)
3. `python scripts/build_rag_db.py --seed --out ./dist/knowledge-base` — manifest `embedding_variant`, schema 3, batch progress
4. After maintainer sign-off: `python scripts/eval_kb_embed_models.py --write-report` — three-way on deepened corpus; **holdout** gate; compat overall vs gate-reachable
5. Point `rag_corpus_path` at pre-bump corpus → keyword fallback
6. On-Deck QA (`deck.deploy`, ingest): Strategy, troubleshooting, follow-up, hybrid off, corpus removed

Load `deck-dev-loop` before Stage 6 Dev-tab / deploy work.

---

## Out of scope

sqlite-vss / ANN, auto-pull `nomic-embed-text`, cross-lingual retrieval, vision→entity→retrieve, thumbs-demote, delta/packs, public HF publish (Phase 6), catalog-scale titles (Phase 8), net-new titles, compat phrase-gate **product** fix (Q8 open), trust-tier-in-RRF (Phase 7).
