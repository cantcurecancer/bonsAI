# Handoff — RAG work, 2026-08-18 to 2026-08-21

Written so the next session starts from what was decided rather than re-deriving it. Plain
language on purpose: the maintainer reads this file.

**Where the authority lives.** Locked calls are in
[maintainer-decisions-locked.md](maintainer-decisions-locked.md) (**D23–D25 locked 2026-08-21**,
**D26–D27 open**). Live status is [../roadmap.md](../roadmap.md). QA steps are
[../testing.md](../testing.md). Where this file disagrees with any of those, they are right —
this one goes stale first.

---

## 1. The one thing to do next

**Publish a new corpus** (D24 — locked, maintainer said yes on 2026-08-21). Nothing else on this
list is blocked on anything but that.

Three separate pieces of work are all sitting behind this single release, which is why it is one
release and not three:

| Waiting | Why it needs a release |
|---|---|
| 16 structured cards (Phase 4 track 2) | Card content is corpus data, not plugin code |
| Ocarina of Time AppID fix | The wrong AppID is a row in the corpus |
| Phase 4 track 3 (per-game tips) | Needs schema v4 — a new column on the tip table |

**The published corpus is currently stale *and* carries a known bug.** Hugging Face still serves
`2026.08.16` — 117 cards, and Ocarina of Time still holding Stardew Valley's AppID, so anyone
downloading today gets a Stardew session inheriting Zelda's cards and Zelda's spoiler fencing.
That is the strongest argument for not letting this sit.

Release surface: `CORPUS_HF_NAMESPACE = "qd313/bonsai-knowledge-base"`,
`CORPUS_GITHUB_RELEASE_TAG = "knowledge-base-v1"`
([knowledge_base_schema.py:35](../../py_modules/backend/services/knowledge_base_schema.py)).
`.env` already holds `DECK_IP`, `DECK_USER`, `HUGGINGFACE_API_KEY`, `HUGGINGFACE_USERNAME`.

**Sequencing question worth settling first:** whether to bump to schema v4 (track 3) in this same
release or publish v3 now and v4 later. Bundling means one stale-corpus event instead of two.
Publishing now means the Stardew fix reaches users sooner. Not locked — see §5.

---

## 2. What shipped, 2026-08-18 to 2026-08-21

Sixteen commits. Every change measured before and after; two planned changes were **removed**
after measurement rather than shipped for symmetry.

| Commit | What |
|---|---|
| `bf16b35` | The vector half of search got its own recall pass — it had only been re-ordering keyword results |
| `93bf100` | Expert mode moved onto the explicit retrieval route (it had been the *strictest* mode) |
| `d1601d4` | Eval harness re-aligned with the shipped pipeline |
| `3dd4c2e` | A matched troubleshooting topic now opens a recall path and acts as a preference (**D22**) |
| `543c4ad` | The corpus is reachable when the question names the game (**D19**) |
| `8ab6144` | British spelling reaches US-spelled cards; a card is reachable by its kind |
| `237dc0d` | Phase 4 track 1 — a corpus chip is guaranteed, game chips preferred, **Tip** badge |
| `5d0af46` | Phase 4 track 2 reply shape; track 3 written up as blocked |
| `c1a217d` | Phase 4 track 2 content — 16 structured cards |
| `32685e5` | Type recall narrowed to a rescue, not a ranking |
| `a70c592` | Chip pool draws one kind at a time |
| `0d577d0` | Eval harness: the model sweep could not run at all |
| `2a217cd` | Eval harness: tips were scored against strategy cards' vectors |
| `4a479b1` | Ocarina of Time stops borrowing Stardew Valley's AppID |

Suites on the last run: **792 Python, 568 vitest, `tsc` clean, `npm run build` clean.**

### The pattern worth carrying forward

**Four separate faults were invisible until the library grew**, and all four were surfaced by
adding sixteen cards, not by reading code:

1. Search preferred an arbitrary slice of boss cards over a real keyword match — visible only
   once Ocarina of Time had more boss cards than the recall cap.
2. The chip pool flooded with one kind — visible only once one kind outnumbered the others.
3. The eval harness collided two ID namespaces — the collision rate rose with the corpus.
4. A borrowed AppID handed one game's cards to another — eight cards worse than it had been.

Treat corpus growth as a test of the machinery. Phase 8's thousand titles will find more.

---

## 3. Where the numbers stand

**Corrected 2026-08-21** (`2a217cd`). Every vector-using figure published before that date is
understated; prior reports carry a correction banner and must not be quoted.

Current, on the 133-card corpus, `nomic-embed-text`, same corpus for every arm:

| Slice | keyword | vector only | fusion (ships) |
|---|---|---|---|
| Labelled tune, top-3 | 88.2% | 93.1% | **94.1%** |
| Labelled holdout, top-3 | 83.3% | 83.3% | **83.3%** |
| Troubleshooting tips, top-3 | 65.0% | 67.5% | **72.5%** |

Report: [../archive/research/kb-embed-bakeoff-2026-08-21-arms.md](../archive/research/kb-embed-bakeoff-2026-08-21-arms.md).

**The holdout half still cannot separate the arms** (n=36, identical either way). That is the
honest locked answer and the correction did not change it. **D23** is the work that should.

---

## 4. Locked this session — do not re-litigate

- **D23 — fold the paraphrase questions into the approved set.** Expect the totals to *drop*;
  that is the point. The 2026-08-21 report becomes the last one measured on the old set, and
  old and new numbers are not comparable afterwards (R4).
- **D24 — publish a new corpus.** See §1.
- **D25 — the type/"the boss" fix stays in its light form.** Query-time recall, no schema change,
  reaches an already-installed corpus. The heavier FTS-indexed version is not wanted.

Full reasoning for each in [maintainer-decisions-locked.md](maintainer-decisions-locked.md).

---

## 5. Still owed by the maintainer

Both are quick, neither blocks the release.

- **D26 — endorse the re-keyed eval rows.** Thirteen rows in the approved set identified an
  Ocarina of Time session by the borrowed AppID; they now identify it by name. Measured: **every
  arm on every split scored identically to the decimal** before and after. Nothing to undo, only
  to confirm.
- **D27 — Phase 4 shipping two tracks of three.** Accept the split, or hold tracks 1–2 out of the
  release notes until track 3 lands.

Also unlocked, smaller: whether schema v4 rides in this release or the next (§1).

---

## 6. Open, not blocked

- **On-device QA.** Nothing from this week has been on a Deck. Every QA row written for it is
  Open: `PHASE4-CARDS-01`, `PHASE4-CHIPS-01`, `KB-APPID-01`, plus the amendments to `KB-TYPE-01`,
  `KB-ROUTER-02`, `KB-NEWTITLE-01`, `KB-SPELLING-01`. Several **cannot be run from the screen** —
  the details panel prints no card count — so they need `scripts/probe_deck_kb_retrieval.py`
  over SSH.
- **Phase 5 is gated on Phase 4 passing on the Deck.** Maintainer's own gate; a good one.
- Two small bugs: the details panel says *"Running game could not be matched"* when no game is
  running, and two different decisions are both filed as **D19**.

---

## 7. Reproducing the measurements

```bash
python scripts/build_rag_db.py --seed --out ./build/knowledge-base-test   # 133 sections
python scripts/eval_kb_embed_models.py --arms-only --write-report          # arms only
python scripts/eval_kb_embed_models.py --write-report                      # + model sweep
npm test && npm run test:py && npx tsc --noEmit && npm run build
```

Needs a local Ollama with `nomic-embed-text` pulled. The test suite rebuilds
`build/knowledge-base-test` from the seed on every run, so a stale corpus cannot silently
survive a seed edit.
