# CLAUDE.md

Orientation for agents working in this repo. Facts only — if something here
disagrees with the code, the code is right and this file is a bug.

For MCP servers, personas, and Deck preview/deploy tooling see
[AGENTS.md](AGENTS.md); this file does not repeat it.

## What this is

bonsAI is a **Decky Loader plugin for SteamOS / Steam Deck** that provides
self-hosted AI assistance backed by a local or LAN Ollama instance. It ships as
a TypeScript/React frontend bundled to a single file plus a Python backend the
Decky Loader imports directly.

## Layout

| Path | Contents |
|---|---|
| `src/` | Frontend, 223 `.ts`/`.tsx` files. Bundled to `dist/index.js` |
| `src/features/` | Vertical feature slices (`preset-carousel`, `unified-input`, `voice`) |
| `src/hooks/`, `src/components/`, `src/utils/`, `src/data/` | Type-bucket directories (most of the code lives here) |
| `src/test-harness/` | Vitest setup + `fakeDeckyRpc.ts` |
| `main.py` | The Decky `Plugin` class — RPC surface. 3021 lines |
| `py_modules/backend/services/` | 44 service modules; the bulk of backend logic |
| `tests/` | Python `unittest` suites (50 files) |
| `packages/bonsai-mcp/` | In-repo MCP server + generated architecture snapshots |
| `scripts/` | Build, deploy, Deck capture, RAG tooling |
| `docs/audit/` | Refactor recon output — read before re-deriving anything |

## Entry points

- **Frontend:** `src/index.tsx` (1960 lines) — plugin root, tabs, scoped CSS, RPC
  wiring. Rollup config is one line delegating to `@decky/rollup`.
- **Backend:** `main.py`, declared by `plugin.json` (`"main": "main.py"`,
  `api_version: 1`). `class Plugin` at `main.py:198`; lifecycle hooks
  `_main` (`main.py:319`) and `_unload` (`main.py:325`).
- `main.py:26-28` inserts the plugin root onto `sys.path`, which is why backend
  imports are `from backend.services.X import ...` rather than
  `py_modules.backend.services.X`. `scripts/run_python_tests.py` reproduces that
  path setup so tests match the loader.

## The TS ↔ Python boundary

This is the only way the two sides talk. There is no HTTP server between them.

1. Frontend calls `call<Args, Result>("method_name", ...args)` from `@decky/api`.
2. Two styles are in use, and **raw `call()` is currently the majority**: 29 raw
   call sites vs 24 through `callDeckyWithTimeout()` in
   [src/utils/deckyCall.ts](src/utils/deckyCall.ts). The wrapper adds a 15s
   deadline (`DECKY_RPC_TIMEOUT_MS`) and normalizes error payloads; a bare
   `call()` can hang the UI indefinitely. Prefer the wrapper for new code. Note
   that `deckyCall.ts:4` claims it is used for "settings", but every
   `save_settings` / `load_settings` call site uses raw `call()`.
3. **An RPC method is any public `async def` at indent 4 on `class Plugin`.**
   There is no decorator or registry; indentation is the contract. 55 such
   methods exist.
4. `packages/bonsai-mcp/knowledge/architecture/rpc-map.json` lists them all with
   line numbers. It is **generated** — never hand-edit it.

Frontend RPC call sites are concentrated in `src/hooks/` (`usePluginSettings`,
`useBonsaiAskOrchestration`, `useBackgroundGameAi`, `useVoiceTranscription`,
`useIntentPacks`, `useScreenshotBrowser`, `useReplyLanguage`), plus
`src/index.tsx`.

There is no compile-time check that a called name exists in `main.py`. Two
frontend calls currently target methods that do not exist anywhere in Python and
fail silently — see [docs/audit/phase1-map-verification.md](docs/audit/phase1-map-verification.md).

## Where settings live

`settings.json` under `decky.DECKY_PLUGIN_SETTINGS_DIR` (`main.py:221`, `:274`).

Adding one user-facing setting currently touches six files across two languages:

```
src/components/SettingsTab.tsx        UI control
src/hooks/usePluginSettings.ts        state + debounced save
  -> RPC load_settings / save_settings
py_modules/backend/services/settings_service.py   28 hand-written sanitize_* fns
src/utils/settingsAndResponse.ts      shared shape helpers
tests/test_settings_service.py + src/utils/settingsAndResponse.test.ts
```

TS and Python each declare the setting shape independently. This is known and is
the top-ranked item in [REFACTOR-PLAN.md](REFACTOR-PLAN.md) Phase 3.1.

## Commands

```bash
npm test                 # vitest, src/**/*.test.ts — 44 files, 217 tests
npm run test:py          # python unittest via scripts/run_python_tests.py — 399 tests
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

## Conventions

- **Module headers.** Most `src/` and `py_modules/` files open with a
  `Title: / Purpose: / Used for: / Solves: / Does not:` block. Match it when
  adding a file. Rules and exclusions: [docs/code-clarity.md](docs/code-clarity.md).
- **Keep Decky RPC method names stable.** Renaming one is a two-language breaking
  change with no compiler to catch it.
- **New Settings/QAM controls need a focus-graph entry** for D-pad navigation —
  `.cursor/rules/decky-focus-graph.mdc` before writing the control.
- **Generated files are not editable.** The five JSON snapshots under
  `packages/bonsai-mcp/knowledge/architecture/` are rewritten and staged by
  `.githooks/pre-commit` on every commit (installed via npm `prepare`). Change
  `packages/bonsai-mcp/scripts/generate-architecture.mjs` instead.
- **Do not `git push` unless the user explicitly asks.** No `cursor/*` branches.
- Before marking feature work done, update `docs/roadmap.md` and `docs/testing.md`
  in the same change set.

## Refactor rules

The repo is mid-refactor; see [REFACTOR-PLAN.md](REFACTOR-PLAN.md) for phases and
[docs/audit/](docs/audit/) for completed recon.

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
