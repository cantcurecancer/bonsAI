# 05 — Ranked refactor plan (Phase 2g, 2026-08-02)

Synthesised from [01-map.md](01-map.md), [02-hotspots.md](02-hotspots.md),
[04-coverage.md](04-coverage.md), and [06-doc-triage.md](06-doc-triage.md).

Ranked by **value ÷ risk**, not by size. Each item states what it fixes, what it
touches, blast radius, whether it is strictly behavior-preserving, what test
coverage exists, and a risk grade.

> **Maintainer decisions live in [roadmap.md](../roadmap.md#decisions-needed)**
> (D1–D6), written in plain language with options and trade-offs. This document
> is the technical evidence behind them; that one is where the calls get made.
> Items below that are blocked cite their decision id.

**No item below proposes a new abstraction.** Three propose *deleting* one. Per
the plan's rule, an abstraction needs 3+ existing call sites that collapse into
it; nothing here qualified, so nothing is invented.

---

## Corrections to REFACTOR-PLAN.md

Three of the plan's Phase 3 items were written against a tree that has since
changed. Do not execute them as written.

| Plan item | Status | Why |
|---|---|---|
| **3.2 Split `settingsAndResponse.ts`** | **Invert it** | Already split. It is now a 16-line pass-through barrel (`:14-16`). The plan's own "Combine when… pass-through re-export barrels" rule says delete it, not split it. The real two-concern file is `settingsPayload.ts` |
| **3.5 Redistribute `refactor_helpers.py`** | **Reframe it** | "For every function… list its call sites" — it has **no functions**. 65 lines of pure re-export. The action is redirecting importers and deleting the shim |
| **2f Split docs by audience** | **Done already** | 3 of 4 targets no longer exist in `docs/`; see [06-doc-triage.md](06-doc-triage.md) |

The churn table in REFACTOR-PLAN.md predates these changes. Rank the settings
*cluster* high — that diagnosis holds — but not on the strength of any single
file's churn number.

---

## Tier 1 — do first (high value, low risk, fully evidenced)

### 1.1 Delete dead backend code

**Problem.** An entire RPC domain and two modules survive features that were
removed. The 2026-07-30 permissions cleanup deleted UI without deleting what fed
it ([01-map.md](01-map.md) §4).

| Dead thing | Evidence |
|---|---|
| 5 Proton-journal RPCs | `main.py:974, 981, 1005, 1020, 1034` — no frontend caller |
| `proton_experiment_journal_service.py` | serves only those 5 |
| `thinking_tiny_model_service.py` (108 lines) | **zero importers repo-wide** |
| `tdp_service.apply_tdp` (`:163`) | only caller is its own test, `test_tdp_sandbox_sysfs.py:41` |
| `log_navigation` (`:1125`), `dbg_fe_log` (`:2618`), `capture_screenshot` (`:2163`), `cancel_rag_corpus_download` (`:1576`) | no frontend caller |

**Files touched.** `main.py`, 3 service modules, 2–3 test files,
`src/test-harness/fakeDeckyRpc.ts:31,142`.
**Blast radius.** Small and closed — nothing imports these.
**Behavior-preserving.** Yes, if the precondition holds.
**Coverage.** `test_proton_experiment_journal_service.py` and
`test_tdp_sandbox_sysfs.py` exist and would be deleted with their subjects.
**Risk: LOW** — with one gate. **Blocked on [D2](../roadmap.md#decisions-needed).**

> **Gate before deleting: run 2026-08-02, one hole found.** The RPC scan
> originally covered `src/` only. Grepping `tests/preview-suite/` and `scripts/`
> for symbol names returns zero hits for `proton_experiment`, `apply_tdp`,
> `log_navigation`, `capture_screenshot`, `dbg_fe_log`,
> `cancel_rag_corpus_download`, and `thinking_tiny`. `ask_game_ai` returns 22
> hits across five tier files — it stays, per
> [D2](../roadmap.md#maintainer-decisions-locked--2026-08-02). `apply_tdp` has no
> non-test reference anywhere in the repo, so the `tier1-tdp.json` cases that ask
> to set wattage exercise the recommendation path and cannot reach it.
>
> **A symbol grep is not sufficient.** The preview suite also names test files
> directly: `unit-gates.json:25` runs `tests/test_tdp_sandbox_sysfs.py` under a
> `TDP-APPLY` gate. Grep the preview suite for the *test filename* too. Only
> `test_tdp_sandbox_sysfs.py` and `test_capabilities.py` are referenced that way.

**Deletions cascade one level.** Removing an authorized RPC orphaned a helper
below it in two cases — `try_gamescope_screenshot_capture`
(`screenshot_media.py:861`, now unreferenced, but that module is DO-NOT-TOUCH)
and the `write_sysfs` / `find_amdgpu_hwmon` pair that only `apply_tdp` calls.
Neither was in D2's list. Check one level down before declaring a deletion
complete.

**Why first:** permanently shrinks the search space for every later session,
needs no design decisions, and is the highest-confidence item in the audit.

### 1.2 Fix the four stale doc claims

**Problem.** Four one-line inaccuracies that mislead a newcomer
([06-doc-triage.md](06-doc-triage.md)): `development.md:100` describes the
deleted `src/config.ts` generation step; `glossary.md` advertises TDP adjustment
that was removed; `mcp-setup.md` omits `bonsai.arch.previewTiers`;
`DOCUMENTATION_INDEX.md` omits 5 docs it exists to index.

Also move `docs/rag-retrieval-quality-remediation-plan.md` to `docs/archive/` —
its own banner says not to implement from it, and its name differs from the
active implementation plan by one word.

**Blast radius.** Docs only (plus one link fix for the archive move).
**Behavior-preserving.** Yes — no code.
**Risk: LOW.**

### 1.3 Delete `refactor_helpers.py`

**Problem.** A root-level re-export shim whose own header says *"prefer
backend.ollama_urls, backend.ollama_routing, backend.tdp_intent."* It exists to
avoid breaking import paths "in one release" — a migration that never finished.

**Files touched.** 5 production importers (`main.py:178`,
`bonsai_stream_tags.py:20`, `game_ai_request.py:59`,
`local_ollama_setup_service.py:25`, `ollama_ask_service.py:44`), 4 test
importers, plus deploy references in `scripts/build.sh:179,208`,
`scripts/build.ps1:48`, and `scripts/verify-decky-plugin-zip.sh:44`.
**Blast radius.** ~12 files, all mechanical import rewrites.
**Behavior-preserving.** Yes — the shim adds no logic.
**Coverage.** `tests/test_refactor_helpers.py` plus 3 other suites import through
it; they get repointed, not rewritten.
**Risk: LOW-MEDIUM** — the only real trap is the **deploy scripts and the zip
verifier**, which copy and require the file. Miss those and the plugin breaks
on-device while every test still passes.

Do 1.1 first: `thinking_tiny_model_service.py` is one of the importers, so
deleting it shrinks this item.

### 1.4 Delete the `settingsAndResponse.ts` barrel

**Problem.** A 16-line pass-through with **22 importers**, obscuring which of the
three real modules any consumer actually depends on.

**Files touched.** 22 importers + the barrel + `settingsAndResponse.test.ts`
(468 lines) repointed to the real modules.
**Blast radius.** 23 files — largest in Tier 1, but `tsc --noEmit` catches every
mistake at compile time.
**Behavior-preserving.** Yes — re-export only.
**Coverage.** Strong and indirect: the 468-line test covers all three modules
through this barrel (116 `normalize` references). Splitting the test by module is
part of the work.
**Risk: LOW** — mechanical, compiler-verified.

---

## Tier 2 — real design work

### 2.1 Split `settingsPayload.ts` — the actual "and" file

**Problem.** 109 lines owning two concerns: settings-payload construction, plus
`formatAppliedTuningBannerText` (`:74`) and `buildResponseText` (`:97`), which
format assistant reply text. The filename advertises only the first. This is the
file REFACTOR-PLAN 3.2 was really describing.

**Files touched.** `settingsPayload.ts` → 2 files; importers via the barrel
(sequence after 1.4).
**Behavior-preserving.** Yes — pure moves.
**Coverage.** Behavioral, through `settingsAndResponse.test.ts`.
**Risk: LOW.** Small file, well covered. Listed in Tier 2 only because it should
follow 1.4.

### 2.2 Settings single source of truth (plan 3.1)

**Problem.** TS and Python each declare the setting shape independently. Adding
one setting touches six files across two languages; `settings_service.py` carries
28 hand-written `sanitize_*` functions and has churn 28 — roughly one commit per
sanitizer.

**Files touched.** `SettingsTab.tsx`, `usePluginSettings.ts`,
`bonsaiSettingsSchema.ts`, `bonsaiSettingsNormalizers.ts`, `settings_service.py`,
`main.py` (`load_settings`/`save_settings`), both test suites.
**Blast radius.** Wide but concentrated in one concept.
**Behavior-preserving.** **Only if** the generated/mirrored schema reproduces
every current sanitizer's edge-case behavior exactly. Defaults and clamping are
where this will bite.
**Coverage.** Best in the repo on the Python side —
`tests/test_settings_service.py` asserts per-setting round-trips; TS normalizers
covered via the barrel test.
**Risk: MEDIUM.** Highest stated value in the plan, and the coverage genuinely
supports it. Expect `test_settings_service.py` (churn 33 > source 28) to break on
shape rather than behavior — rewrite those assertions, do not contort the design.

> Do **not** design the shared-schema mechanism from this document. That needs
> its own session with the six files open.

### 2.3 Resolve the `main.py` extraction (plan 3.3)

**Problem.** Unanswered: is `main.py` a thin RPC facade or does business logic
live in both layers? It imports 35 of 42 services, but its own header
(`main.py:8-9`) admits some Ask branches finalize inline. 3021 lines,
complexity 467 — the #1 hotspot by nearly 3×.

**This is an investigation, not yet a refactor.** Output should be a file:line
inventory of what remains inline and where each piece belongs.
**Coverage.** Smoke-only — 5 of 50 Python tests import `Plugin`, all testing
locking, not RPC behavior.
**Risk: MEDIUM to investigate, HIGH to execute** until the inventory exists.

---

## Tier 3 — blocked on coverage

### 3.1 `index.tsx` / `MainTab.tsx` / `useBonsaiAskOrchestration.ts` (plan 3.4)

**Problem.** `index.tsx` — 1965 lines, churn 82 (highest), 54 imports.
`useBonsaiAskOrchestration.ts` — complexity 353, the whole Ask state machine.
`MainTab.tsx` — 187 lines but churn 42, pure prop-threading tax.

**Coverage: NONE.** No automatic test executes any of the three
([04-coverage.md](04-coverage.md)). 44 component files share one vitest file.

**Risk: HIGH.** A behavior-preserving move here **cannot be verified as
behavior-preserving**. **Blocked on [D3](../roadmap.md#decisions-needed).** `npm test` would pass with every component deleted.

**Do not start this until one of:**

1. Characterization tests exist for `index.tsx` and `useBonsaiAskOrchestration.ts`.
   `src/test-harness/fakeDeckyRpc.ts` exists and 3 hook tests already pass, so
   the pattern is proven — this is cost, not novelty.
2. Or it is explicitly accepted as on-device-QA-verified work, sequenced last,
   with a tight rollback plan and a preview-suite pass per commit.

`MainTab.tsx` is the cheapest entry point of the three: small, and its churn is
caused by prop threading rather than internal logic, so the fix is structural and
inspectable.

---

## DO-NOT-TOUCH

Works, well-isolated, boring. High complexity here means *settled*, not *risky* —
all have low churn and real behavioral coverage.

| File | Cx | Churn | Coverage |
|---|---|---|---|
| `voice_transcription_service.py` | 310 | 6 | behavioral (2 suites) |
| `screenshot_media.py` | 243 | 4 | behavioral |
| `intent_pack_service.py` | 185 | 4 | behavioral |
| `bonsai_stream_tags.py` | 105 | 12 | behavioral — 59 asserts / 30 tests, deepest suite |
| `PullModelsModal.tsx` | 209 | 7 | none, but stable and not a plan target |
| `strategy_guide_parse.py` | 143 | 6 | behavioral |

Also leave alone: the four deliberately unwrapped raw `call()` sites
(`clear_plugin_data`, `install_rag_corpus_local`, `start`/`stop_voice_transcription`)
— each is commented and each can legitimately outrun a UI deadline.

---

## Suggested order

```
1.1 dead code      -> shrinks 1.3 and the whole search space
1.2 doc fixes      -> independent, trivial
1.3 refactor_helpers shim  (after 1.1)
1.4 settingsAndResponse barrel
2.1 split settingsPayload  (after 1.4)
2.3 main.py investigation  -> produces the inventory 2.2 and Tier 3 need
2.2 settings single source of truth
--- reassess; run the deferred Phase 2c friction test here ---
3.1 entry-point split, only once coverage or an explicit QA-verified decision exists
```

Tier 1 is four commits, all low-risk and mechanically verifiable — a good
session's work that measurably shrinks the repo before any design decision is
required.

**Phase 2c (friction test) is deferred to after Phase 3** by maintainer decision
(2026-08-02), so it will measure the refactored tree rather than the starting
point. Slot it at the reassess point above.
