# 03 — Friction test (Phase 2c), run 2026-08-05

Execution-order step **11**, the last item. Deferred from Phase 2 on purpose so it
would measure the *post*-refactor tree rather than the starting point; steps 1–10
and 12 were complete when it ran (`dd4f22f`).

## Method, and what it can and cannot tell you

Three agents, each starting cold with no knowledge of this repo, were given one
realistic task apiece and told to work out the full change **without editing
anything** — then to log every point where they guessed, were misled by a name,
needed more than two files to answer one question, or hit a contradiction.

| Run | Task | Probes | Outcome |
|---|---|---|---|
| A | Add a Settings toggle that hides the Main-tab preset carousel | step 7 (settings SSOT) | COMPLETE, 3 flagged guesses |
| B | Fix the KB-advice seed showing when the KB is already on | step 8 (feature slices) | COMPLETE, 2 flagged guesses |
| C | Add an RPC reporting installed KB card count, surface it in the UI | step 12 (TS↔Python boundary) | **PARTIAL** — blocked on a vocabulary question |

**Ranking is by cross-run overlap first, then cost.** Phase 2c is explicit that the
overlap across runs is the real work list: one run hitting something can be that
run having a bad day, the same thing catching two of three is a property of the
repo.

**Three limits, stated so nobody over-reads this.** These are agents, not humans:
they read faster and do not get discouraged, so *absolute* effort understates what
a person would spend and only the relative ranking is trustworthy. The three tasks
were chosen by someone who already knew where the seams are, which sharpens what
the test probes but makes it a deliberate sample, not a random one. And all three
ran in one afternoon against one tree — this is a snapshot, not a trend.

**All three finished with the working tree clean.** Read-only was honored.

---

## The work list, ranked

### 1. Hand-maintained field and prop lists that fail silently — **2 of 3 runs, both HIGH**

The top cost in both runs that hit it, and the two runs found it in different
subsystems, which is what makes it structural rather than local.

**Run A**, adding one boolean: **~18 files, ~30 edit points.** The normalization
layer is genuinely one row per language — that part of step 7 worked. The
*plumbing* is untouched: `usePluginSettings.ts` repeats the field list in **7**
places, `index.tsx` in **5**, each tab payload hook in **3**. Nothing type-checks
or tests that duplication.

**Run B**, threading one flag to a component: two hand-written gates on the path,
either of which silently voids the change — `presetChipsPropsEqual`
([MainTabPresetAnimatedChips.tsx:437](../../src/components/MainTabPresetAnimatedChips.tsx),
a `React.memo` comparator feeding `:450`) and a ~50-entry `useMemo` dep array in
`useMainTabPayload.tsx:293`. Miss either and the fix compiles, tests pass, and
does nothing on device.

> **D14 predicted this exactly** — *"what remains is prop threading that only a
> rewrite would shrink"* — and closed step 8 on that basis. This is independent
> confirmation from readers who had never seen D14: the prop threading is not just
> inelegant, it is the single largest cost a newcomer pays, and its failure mode is
> silent. **The D14 Option B/C collapse is no longer a tidiness question.**

Run A's own suggestion is the cheapest concrete fix: derive `settingsSnapshotForSave`,
`hydrateFromSettings` and the debounce dep array from `BonsaiSettingsSnapshotInput`
rather than restating them — *"would collapse ~20 of the 30 edits to zero."*

### 2. Docs point at things that moved or never existed — **2 of 3 runs**

- **`CLAUDE.md` sent maintainer questions to `docs/roadmap.md` § Decisions needed.**
  That section moved to the decisions doc in the reorg; `roadmap.md:58` is now a
  forwarding note. Both runs grepped for the section, found nothing, then found the
  redirect. **Fixed 2026-08-05.**
  *This one is on the earlier work in this same session:* the link audit that
  preceded it checked markdown links and heading anchors and reported zero broken —
  it never checked **prose references to section names**, which is what this was.
- **The roadmap's own fix lean for the preset bug is incomplete** — see item 3.

### 3. `docs/roadmap.md:23`'s fix lean would have shipped a fix that regresses — **1 run, HIGH, verified**

The entry says the KB-seed bug "needs the KB flag threaded into `getRandomPresets` /
`getContextualPresets`". There is a **third sampler** it never mentions:
`getRandomPresetExcluding`, called from
[MainTabPresetAnimatedChips.tsx:164](../../src/components/MainTabPresetAnimatedChips.tsx)
and `:297` on `setTimeout` loops running for `PRESET_CAROUSEL_ACTIVE_MS = 60_000`
(`:35`). The component re-samples the pool itself; it does not merely render the
`seeds` prop it is given.

A fix following that lean literally shows correct chips at mount, then fades the KB
chip back in within seconds. **Intermittent is harder to diagnose than always-on**,
so following the roadmap would have made the bug worse. Run B caught it only after
writing a complete, wrong plan.

**Verified in code before recording.** Roadmap entry corrected in the same pass.

### 4. Misleading names — **3 of 3 runs**, different names each time

Every run lost time to a name that meant something other than it said. That it was
a *different* name each time is the finding: this is a class, not three incidents.

| Run | Name | Reality |
|---|---|---|
| C | "knowledge base" vs `rag_corpus` | The same feature under two vocabularies. Every user-facing string, the doc, the component and both services say *knowledge base*; every RPC, setting key and path says *rag_corpus*. A grep for one finds half the surface — run C's first search for "knowledge base" returned 60 files and **missed all five managing RPCs**. |
| A | `MainTabPresetRow` | Not the preset row. A three-tenant container: help chip, carousel, agent-inject chip. Its root div also carries `presetCarouselHostRef`, a D-pad anchor — hiding the component would null the ref and break `focusFirstPresetChip` **for everyone**, not just users with the setting on. |
| B | `joinPresetWithRunningGame` | Does not join the preset with the running game. Body is `return presetText;`. `presets.ts:6` still points at it as though it does. The behavior was deliberately removed 2026-07-30. |
| C | `embedding_section_count` | Not a section count — the number of sections that got a *vector*, `0` whenever embeddings were never populated. The remediation plan actively recommends preferring it over `COUNT(*)`, which would have produced a confidently wrong number. |

### 5. The focus-graph rule contradicts the code it governs — **1 run, MEDIUM-HIGH**

`.cursor/rules/decky-focus-graph.mdc:12` is `alwaysApply: true` and says **ALWAYS**
build an explicit focus graph for a new Settings row. `SettingsTab.tsx:308-313` and
`:448-453` ship plain `ToggleField`s with zero focus handlers. Run A read this as a
hard blocker on its own task.

The resolution — a plain `ToggleField` inside an existing `PanelSection` inherits
the section's chain and needs no owner — exists in exactly one place: a single table
cell at `docs/testing.md:96`, inside a 159-line table.

### 6. `docs/glossary.md` does not define "card" — **1 run, HIGH, and it blocked the task**

The only run that did not finish. "Card" is the central noun of run C's task and is
never defined; it turns out to be a literal column name on **three** different
tables (`sections`, `genre_patterns`, `compat_patterns`), and the docs and UI use it
inconsistently across them — one modal says "strategy **cards** and compat **notes**"
(two things) while the toggle description says "downloaded offline **cards**" (one).

Run C would not guess silently and stopped. **That is the correct behavior and it is
still a failed task** — the glossary exists and answers the question for other terms.

### 7. Smaller, single-run, all verified

- **An RPC's name silently determines its snapshot domain.** `generate-architecture.mjs:25`
  classifies by substring, and the KB keyword is `rag_corpus` — so a sensibly-named
  `get_knowledge_base_card_count` files under `other`. Nothing warns; nothing fails.
  The proof is already in-tree: `get_session_rag_chip_candidates` sits in `other`.
  CLAUDE.md documents the indent-4 rule but stops one sentence short of this.
- **`FRONTEND_RPC_METHODS` is commented "keep in sync with grep / main.py"**
  ([fakeDeckyRpc.ts:6](../../src/test-harness/fakeDeckyRpc.ts)) implying an automated
  cross-check. There is none — `assertAllFrontendRpcMethodsRegistered` only checks
  list→handler, and its test asserts `length > 10`.
- **`usePluginSettings.ts:312-353`**, the `load_settings` failure reset, enumerates
  38 of ~42 fields while five sibling lists in the same file enumerate all of them.
  Nothing marks the four omissions deliberate and no test covers the branch, so it
  cannot tell a newcomer what to do. **Either a latent bug or an undocumented
  decision** — worth a maintainer look.
- **Dead branch:** `generate-architecture.mjs:50` preserves `_main`/`_unload`, then
  `:51` unconditionally drops every underscore name — `:50` can never take effect.

---

## What the test caught in its own session

Run A found that CLAUDE.md's settings counts were wrong: `_SIMPLE_FIELDS` **20** not
19, `SIMPLE_FIELDS` **28** not 26, hostile-input cases **21** not 19.

Those numbers were written **earlier the same day**, during a pass whose stated
purpose was correcting stale numbers in CLAUDE.md. They were copied from
`maintainer-decisions-locked.md` — accurate when it was written on 2026-08-03 — and
not counted against the tree. **The staleness-fixing pass reproduced the exact
failure it was fixing.** Corrected 2026-08-05.

This is the strongest argument for the exercise: it found a defect in work done
hours earlier by someone who believed they had just verified that file.

---

## What is genuinely working — do not "clean this up"

All three runs volunteered these unprompted, and two are directly attributable to
refactor steps.

- **The module header convention** (`Title / Purpose / Used for / Solves / Does not`)
  earned its keep in **3 of 3 runs**. Every run used headers to decide whether to
  read a file's body, and all reported them accurate. Run B ruled three files out of
  scope from seven lines each. This is the highest-value-per-line convention in the
  repo.
- **The shared two-language settings contracts** — run A called them *"the best thing
  in this repo"*. Exact key-set equality asserted from both languages meant it never
  had to reason about whether it had forgotten the Python half: a test says so, by key
  name. **This is step 7a's payoff, confirmed by someone who did not know it existed.**
- **Comments that explain *why*, not *what*.** Named specifically:
  `generate-architecture.mjs:44-46` (why `^\s+` was tried and how it broke),
  `KnowledgeBaseSection.tsx:522-527` (why Cancel exists partly so the D-pad has any
  reachable stop), `useBonsaiAskOrchestration.ts:307-315` (the pre-hydration race).
  Run B: *"Someone paid for that lesson and wrote it down."*
- **CLAUDE.md's TS↔Python boundary section is accurate and load-bearing.** Run C
  spot-checked every claim and all held — the `callDeckyWithTimeout` array-vs-spread
  gotcha, the four justified raw `call()` sites, "generated files are not editable."
  Its verdict: *"The stale numbers are cosmetic; the rules were right."*
- **`main.py` needed nothing at all** for run A's task, confirmed in two greps.
  For a 2755-line RPC surface with no compile-time checking, better than expected.
- **`docs/roadmap.md` having the bug pre-filed with `file:line`** put run B on the
  right file in one grep — incomplete (item 3), but a far better start than most repos.

---

## Recommended next actions, in order

1. **Collapse the settings plumbing** — derive the repeated lists from
   `BonsaiSettingsSnapshotInput`. Item 1, ~20 of 30 edit points, and the failure mode
   is silent. This is D14 Option B/C, now with evidence behind it.
2. **Comment the two silent gates** — `presetChipsPropsEqual` and the
   `useMainTabPayload` dep array both need an explicit *"any new prop must be added
   here"*, and `MainTabPresetAnimatedChips` has no test at all.
3. **Define "card" in `docs/glossary.md`** — one line unblocks the only task that failed.
4. **Fix `decky-focus-graph.mdc:12`** to say a plain `ToggleField` in an existing
   `PanelSection` needs no focus owner, rather than leaving that verdict in a table cell.
5. **Add the domain-substring rule to CLAUDE.md's RPC section** — one sentence.
6. **Decide the `usePluginSettings.ts:312-353` omissions** — bug or intent.
7. **Reconcile the two vocabularies**, or at minimum say in `docs/knowledge-base.md`
   that *knowledge base* and *rag_corpus* name the same thing and that grepping one
   misses the other.

Items 3, 4 and 5 are one-line doc edits that between them address the blocking failure
and two MEDIUM findings.
