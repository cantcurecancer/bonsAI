# Phase 0 — Delete (completed 2026-08-02)

Findings from the Phase 0 verification pass. Written so later sessions don't
re-derive them. Commits: `00adaf4`, `c5c782a`.

---

## Test baseline — the Python suite is NOT fully green

The refactor rule "tests green between commits" needs this qualifier. As of
`aa8d2c4` (before any Phase 0 change), the Python suite has **two pre-existing
failures** that are unrelated to any refactor work:

| Test | Kind |
|---|---|
| `test_local_ollama_teardown.TeardownLocalOllamaTests.test_removes_tags_and_home_paths` | ERROR — `AttributeError: module 'backend.services.local_ollama_teardown_service' has no attribute 'subprocess'` (mock patch target is wrong) |
| `test_ollama_prompts_stream_instruction.BonsaiStatusStreamInstructionTests.test_character_off_encourages_playful_sarcasm` | FAIL — asserts the literal string `sarcastic` appears in the generated prompt; prompt now says "disgruntled or dry-deadpan" |

**Green baseline to compare against:**

```
npm test        -> 44 files, 217 tests, all pass
npx tsc --noEmit -> exit 0, no output
npm run build   -> rollup succeeds, dist/index.js written
npm run test:py -> Ran 399 tests, FAILED (failures=1, errors=1, skipped=4)
```

A future session should confirm the Python failure *count and names* are
unchanged, not that the suite passes. Both failures look cheap to fix and are
good standalone candidates, but fixing them is a behavior/test change, not a
refactor — keep it in its own commit.

---

## `src/v0-drafts/` — deleted, was never tracked

56 files. Verified unreferenced: no dynamic imports, no build-config globs, no
string path references.

- `.gitignore:73` ignored it — `git ls-files src/v0-drafts` returned **0 files**.
  It was never committed, so `git` was never a recovery path.
- `tsconfig.json:23` excluded it from compilation.
- `packages/bonsai-mcp/scripts/generate-architecture.mjs:54` and `:67` skip it,
  so it never appeared in the generated module map.
- `vitest.config.ts:5` only collects `src/**/*.test.ts`.

Consequence the original plan didn't account for: **a fresh clone never had this
directory.** It cost a new contributor nothing; it only added local grep noise.

**Archived before deletion** to
`C:\Users\still\Documents\bonsai-v0-drafts-archive-2026-08-02.zip`
(228 KB, 56 entries verified readable). Outside the repo, so it will not be
picked up by any tooling.

The v0-drafts guards in `.gitignore`, `tsconfig.json`, and
`generate-architecture.mjs` were **left in place on purpose** — they cost a
reader nothing and stop the archived files from being committed or swept into
the generated module map if anyone restores them locally. The stale mention in
`docs/code-clarity.md` was removed, because a doc pointing at a missing
directory does mislead.

`docs/archive/roadmap-completed.md:20` still mentions v0-drafts. Left alone —
it is a historical record of what was true at the time, not current guidance.

---

## `src/config.ts` — was a generated artifact, not dead code

The plan called it "likely dead." Correct about *usage*, wrong about *why it
existed*:

- Zero importers. Nothing in `src/` imported it; `tsc --noEmit` is clean without it.
- It exported `HostIp` / `PcIp` string constants holding LAN IPs.
- **`scripts/build.sh` regenerated it on every full build** via
  `do_generate_config()`, called from `do_full_build()`. Deleting only the file
  would not have stuck — the next `./scripts/build.sh` would have recreated it.
- `scripts/build.ps1` never generated it. The Windows deploy path reads
  `DECK_IP` from `.env` directly (`build.ps1:16`), so it was unaffected.

Removed in `00adaf4`: the file, `do_generate_config()`, its call site, **and**
the `PC_IP` preflight assertion in `build.sh`. That last one matters — `PC_IP`
was consumed *only* by the generator, so leaving `: "${PC_IP:?...}"` would have
hard-failed `./scripts/build.sh` for any contributor whose `.env` lacked a
variable nothing used. Verified nothing else reads `PC_IP` or `DECK_IP` from the
environment at build time.

`.env.example` still documents `PC_IP`. Left in place — it is still the
documented way to tell the Deck which host to reach for Ollama at runtime; it is
just no longer a build-time input.

> **Note, not an action item:** `src/config.ts` was tracked in a public repo and
> its history still contains real LAN IPs. Deleting the file does not scrub
> history. Low sensitivity (private-range addresses), flagged for awareness only.

---

## Bonus finding — Phase 1's map-generation task is already done

Phase 1 asks whether `module-map.json` / `rpc-map.json` are hand-maintained or
generated, and says to write a generator plus a pre-commit hook if hand-maintained.

**They are already generated, and the hook already exists:**

- `.githooks/pre-commit` runs `packages/bonsai-mcp/scripts/sync-architecture-for-commit.mjs`,
  which regenerates and stages five snapshots: `module-map.json`, `rpc-map.json`,
  `test-inventory.json`, `preview-tiers.json`, `env-vars.json`.
- Installed per clone by `pnpm run mcp:install-hooks`, wired to npm `prepare`
  (`package.json:24-25`) so it self-installs on `pnpm install`.
- `npm run mcp:validate` exists with a `--check-generated` drift flag.

Observed working: the hook fired on both Phase 0 commits. **Drift was zero** —
regenerating after deleting a `src/` file produced no diff, because the maps only
track imported modules and never referenced `config.ts` or `v0-drafts`.

Phase 1 should verify the maps against current code for accuracy, but the
"write a generator / add a hook" half of that phase is **already satisfied**.
Scope Phase 1 down accordingly.
