# CLAUDE.md

Orientation for agents working in this repo. Facts only — if something here
disagrees with the code, the code is right and this file is a bug.

For MCP servers, personas, Deck preview/deploy tooling, and **which model and effort to use for
which work** (§ 3, policy since 2026-09-05) see [AGENTS.md](AGENTS.md); this file does not repeat it.

## Writing to the maintainer

**Everything written to the maintainer is in simple, plain language.** Chat replies, questions, reports,
plans, and any document they will read. Short sentences; say what a person using the plugin would notice
before any term of art; no internal identifiers, file paths, symbol names or metric shorthand inside a
sentence; everyday words instead of industry ones. Measurement write-ups are where this slips most: say
what changed for a person, then the number. They have asked for this five times; a prompt-time hook
repeats it every turn because a line here alone was not enough.

## What this is

bonsAI is a **Decky Loader plugin for SteamOS / Steam Deck** that provides
self-hosted AI assistance backed by a local or LAN Ollama instance. It ships as
a TypeScript/React frontend bundled to a single file plus a Python backend the
Decky Loader imports directly.

## Layout

| Path | Contents |
|---|---|
| `src/` | Frontend, 276 `.ts`/`.tsx` files (69 of them `*.test.*`). Bundled to `dist/index.js` |
| `src/features/` | Vertical feature slices (`preset-carousel`, `unified-input`, `voice`) |
| `src/hooks/`, `src/components/`, `src/utils/`, `src/data/` | Type-bucket directories (most of the code lives here) |
| `src/test-harness/` | Vitest setup + `fakeDeckyRpc.ts` |
| `main.py` | The Decky `Plugin` class — RPC surface. 2771 lines |
| `py_modules/backend/services/` | 43 service modules; the bulk of backend logic |
| `tests/` | Python `unittest` suites (65 files) |
| `packages/bonsai-mcp/` | In-repo MCP server + generated architecture snapshots |
| `scripts/` | Build, deploy, Deck capture, RAG tooling |
| `docs/audit/` | Refactor recon output — read before re-deriving anything |

## Entry points

- **Frontend:** `src/index.tsx` (1326 lines) — plugin root, tabs, scoped CSS, RPC
  wiring. Rollup config is one line delegating to `@decky/rollup`. Modals, tab
  payloads and shell state were extracted to `src/features/plugin-shell/` in
  refactor step 8; the file is a composition root now, not a god file.
- **Backend:** `main.py`, declared by `plugin.json` (`"main": "main.py"`,
  `api_version: 1`). `class Plugin` at `main.py:193`; lifecycle hooks
  `_main` (`main.py:308`) and `_unload` (`main.py:313`).
- `main.py:24-26` inserts the plugin root onto `sys.path`, which is why backend
  imports are `from backend.services.X import ...` rather than
  `py_modules.backend.services.X`. `scripts/run_python_tests.py` reproduces that
  path setup so tests match the loader.

## The TS ↔ Python boundary

This is the only way the two sides talk. There is no HTTP server between them.

1. Frontend calls `call<Args, Result>("method_name", ...args)` from `@decky/api`.
2. **Use `callDeckyWithTimeout()`** from
   [src/utils/deckyCall.ts](src/utils/deckyCall.ts), which adds a 15s deadline
   (`DECKY_RPC_TIMEOUT_MS`) and normalizes error payloads. A bare `call()` can
   hang the UI indefinitely. Note the arg convention differs: `call()` spreads
   its arguments, the wrapper takes them as an **array**.
3. Four call sites deliberately use raw `call()` and say why in a comment:
   `clear_plugin_data`, `install_rag_corpus_local`, `start_voice_transcription`,
   `stop_voice_transcription` — each can outrun any UI deadline. Everything else
   is wrapped; justify a new raw `call()` in a comment.
4. **An RPC method is any public `async def` at indent 4 on `class Plugin`.**
   There is no decorator or registry; indentation is the contract. 50 such
   methods exist.
5. `packages/bonsai-mcp/knowledge/architecture/rpc-map.json` lists them all with
   line numbers. It is **generated** — never hand-edit it.
6. **The generated map classifies by substring, so the name you pick decides the
   domain.** `DOMAIN_KEYWORDS` in `generate-architecture.mjs` maps e.g. `rag` to
   `["rag_corpus"]` — so a knowledge-base RPC named `get_knowledge_base_*` files
   under `other`, away from its siblings, with no warning and no failure. Proof
   in-tree: `get_session_rag_chip_candidates` sits in `other`. Match the existing
   keyword for the domain you want.

Call sites are concentrated in `src/hooks/` plus `src/index.tsx`.

There is no compile-time check that a called name exists in `main.py`, so a typo
in an RPC name is a runtime failure. Two frontend calls once targeted methods
that existed nowhere in Python; both were wired 2026-08-02 under decision **D1**
(`get_session_rag_chip_candidates` at `main.py:1440`,
`merge_pulled_tags_into_routing_orders` at `main.py:1563`). How they went
unnoticed — both call sites swallowed the error — is the lesson worth keeping:
[docs/audit/phase1-map-verification.md](docs/audit/phase1-map-verification.md).

## Where settings live

`settings.json` under `decky.DECKY_PLUGIN_SETTINGS_DIR` (`main.py:263`, `:276`).

Adding one user-facing setting touches `SettingsTab.tsx` (UI) →
`usePluginSettings.ts` (state + debounced save) → RPC `load_settings` /
`save_settings` → `settings_service.py`, plus `src/data/bonsaiSettingsSchema.ts`
and `bonsaiSettingsNormalizers.ts`.

**That list is the normalization layer only, and it is the cheap half.** Measured
2026-08-05 by the step 11 friction test: one boolean is **~18 files and ~30 edit
points** end to end. The cost is not normalization — it is *plumbing*.
`usePluginSettings.ts` repeats the field list in **7** places (state, snapshot,
hydrate, load-failure reset, debounce deps, the returned object, the save
snapshot); `index.tsx` in **5**; each tab payload hook in **3**. None of that
duplication is caught by a type or a test, and `BonsaiSettingsSnapshotInput` has
no optional fields, so four full snapshot literals in `settingsContracts.test.ts`
and `bonsaiSessionSurvival.test.ts` must gain the key or `tsc` fails. Budget for
the plumbing, not the tables. See [docs/audit/03-friction.md](docs/audit/03-friction.md).

TS and Python still declare the setting shape independently, but **refactor step
7 (Phase 3.1) is complete** and changed what that costs:

- A setting whose rule is one of the plain shapes is **one row per language** —
  `_SIMPLE_FIELDS` in `settings_service.py` (20 rows) and `SIMPLE_FIELDS` in
  `bonsaiSettingsNormalizers.ts` (28 rows). The two counts differ on purpose —
  Python keeps fields out of its table when they need caller-supplied options or
  live in another service. Only genuinely custom rules
  (migrations, cross-field reconciliation, feature gates) stay as functions, and
  each one is annotated with why it is exempt.
- Drift is caught by two shared contracts asserted from both languages:
  `tests/contracts/settings-defaults.json` (fresh-install payload plus an
  idempotency check) and `tests/contracts/settings-hostile-inputs.json` (21
  cases). An incomplete two-language edit fails a test rather than shipping.
- **Python is authoritative** where the two disagree (decision **D13**):
  `save_settings` decides what reaches disk. One deliberate exception is
  documented there.

## Commands

```bash
npm test                 # vitest, src/**/*.test.{ts,tsx} — 107 files, 821 tests
npm run test:py          # python unittest via scripts/run_python_tests.py — 890 tests
npx tsc --noEmit         # typecheck (build does not typecheck)
npm run build            # rollup -> dist/index.js
npm run test:preview     # in-IDE QAM preview suite (see AGENTS.md)
npm run mcp:generate     # regenerate architecture snapshots
npm run mcp:validate     # fails if snapshots differ from HEAD
```

All four of `npm test`, `npm run test:py`, `npx tsc --noEmit`, and `npm run build`
pass on a clean tree. Any failure is a regression.

Deploy to a Deck (needs `.env`, copy from `.env.example`):

```bash
./scripts/build.sh dev       # build + deploy to remote Deck over SSH
./scripts/build.sh local     # build + deploy on this machine (Bazzite/Deck)
./scripts/build.sh release   # distributable zip via Decky CLI
```

`scripts/build.ps1` is the Windows equivalent of `dev`. `.env` supplies
`DECK_IP`, `DECK_USER`, `DECK_PORT`, `DECK_DIR`, `PLUGIN_NAME`.

## Testing on the Deck

**When you need the maintainer to run questions on the device, offer to pin them as frozen
test chips first — every time, before asking them to type anything.** Standing instruction from
the maintainer, 2026-08-22.

The rule:

1. Work out the exact questions the QA row needs.
2. **Show them the list and get it confirmed before pinning anything.** A wrong sentence
   invalidates the row it was meant to test — several KB rows are worded specifically around
   which words they avoid (`KB-ROUTER-01`'s four sentences contain neither "deck" nor "proton").
3. Only then pin them and freeze them in the chip rotation.

Why it is a rule and not a nicety: the alternative is thumb-typing a verbatim sentence on an
on-screen keyboard, once per case, and a single mistyped word changes what is under test without
saying so. `scripts/deck_send_ask.py` exists for exactly this problem and solves half of it — it
types the question but deliberately does not press Ask.

**The chip-freezing capability shipped 2026-08-22.** Pin a batch by writing
`dev_frozen_test_chips` in settings (free text, 3-12 entries, 160 chars each — **a batch under 3
is treated as off**), or from Developer → *Knowledge base (dev QA)*. The pinned batch replaces the
carousel in order, badges each chip **TEST** in amber, and stops reseeding until cleared. Pressing
A on a chip **fills the Ask field verbatim and does not submit** — the Ask press is a separate
step, the same split `deck_send_ask.py` uses. On-Deck row: **QA-FROZEN-CHIPS-01**.

So the offer is real: make it, then pin. `deck_send_ask.py` is the fallback for a one-off sentence
not worth a batch.

## Conventions

- **Module headers.** Most `src/` and `py_modules/` files open with a
  `Title: / Purpose: / Used for: / Solves: / Does not:` block. Match it when
  adding a file. Rules and exclusions: [docs/code-clarity.md](docs/code-clarity.md).
- **UI work follows [docs/design-language.md](docs/design-language.md).** Eight rules,
  each earned by a specific bug. Rule 1: the QAM column is **300 CSS px** — use all of
  it, a gutter is a bug until proven otherwise. Also: never target Steam/Decky by class
  name (they are hashed — `[class*="PanelSection"]` matches **nothing**), width comes
  from CSS not from a measurement, and measure layout on device before changing it
  (`scripts/probe_deck_ask_row_width.py`) because a screenshot cannot show which element
  is at fault. Values live in [docs/design-tokens.md](docs/design-tokens.md).
- **Keep Decky RPC method names stable.** Renaming one is a two-language breaking
  change with no compiler to catch it.
- **New Settings/QAM controls need a focus-graph entry** for D-pad navigation —
  `.cursor/rules/decky-focus-graph.mdc` before writing the control.
- **Generated files are not editable.** The six JSON snapshots under
  `packages/bonsai-mcp/knowledge/architecture/` are rewritten and staged by
  `.githooks/pre-commit` on every commit (installed via npm `prepare`). Change
  `packages/bonsai-mcp/scripts/generate-architecture.mjs` instead.
- **`import-graph.json` answers "who imports this?"** — full `imports` /
  `importedBy` sets for all 256 TS files under `src/`, plus cycle and orphan
  detection. Check it before moving a symbol; it is more reliable than grep,
  which misses specifiers that differ by relative depth. `hotspots.json` is a
  size ranking, not a dependency graph.
- **Do not `git push` unless the user explicitly asks.** No `cursor/*` branches.
- Before marking feature work done, update `docs/roadmap.md` and `docs/testing.md`
  in the same change set.

## Refactor rules

The repo is mid-refactor; see [REFACTOR-PLAN.md](REFACTOR-PLAN.md) for phases and
[docs/audit/](docs/audit/) for completed recon. Questions that need a maintainer
call go in
[docs/audit/maintainer-decisions-locked.md](docs/audit/maintainer-decisions-locked.md)
— which also holds the locked D1–D15 calls and the authoritative execution order
— (plain language, with
options) — not into chat, where they get lost.

1. **One refactor per commit**, behavior-preserving, tests green between commits.
   Never mix a move with a rewrite — it makes the diff unreviewable and
   `git bisect` useless when something breaks on-device.
2. **No new abstraction without 3+ existing call sites** that would collapse into it.
3. **Cite `file:line` for factual claims.** Write `UNKNOWN` rather than inferring.
4. **Persist recon to `docs/audit/`**, not to chat, so the next session reads a
   summary instead of re-deriving it.
5. **Use `grep` and `git log -S` to establish call sites.** Read a file in full
   only when modifying it or when its logic is non-obvious. Do not survey broadly.
6. When a test fails after a move, check whether it asserted implementation shape
   rather than behavior before contorting the code to keep it passing. This repo
   has prior art for that failure mode (`docs/audit/00-phase0.md`).
