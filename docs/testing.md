# bonsAI testing

**Purpose:** Where to test, what to run, and how coverage is tracked — without dumping every historical checkbox into one file.

| Doc | Audience | Contents |
|-----|----------|----------|
| **This file** | Everyone | Overview, PR gates summary, coverage index, QA backlog pointer |
| [testing-automated.md](testing-automated.md) | Agents / CI | Commands that can run without a human on the Deck |
| [testing-manual.md](testing-manual.md) | Maintainers | On-Deck smokes, Tier 0–4 runbook, Deck-only checklists |
| [test-evidence/](test-evidence/) | CI / agents | Preview-suite artifacts (`--write`) |

Related: [roadmap.md](roadmap.md) (bugs + QA backlog + Planned), [development.md](development.md) (build/deploy), [troubleshooting.md](troubleshooting.md).

---

## Quick start

**Every change set (automated):** see [testing-automated.md](testing-automated.md) § Gates.

```bash
pnpm exec tsc --noEmit
pnpm test                  # when src/ touched
pnpm run test:py           # when Python / tests/ touched
pnpm run build             # when src/ or build config touched
```

**Deck-facing PRs:** after `scripts/build.ps1` / `build.sh`, run [testing-manual.md](testing-manual.md) **Tier 0** (SMOKE-A → C → F). Add Tier 1 when Ask / TDP / strategy / game context change.

**Release:** Tier 0–2 + clean-install proof in [testing-manual.md](testing-manual.md) § Tier 4.

---

## PR contract (summary)

| When | Do |
|------|----|
| Always (if applicable) | Automated gates in [testing-automated.md](testing-automated.md) |
| Touched paths match matrix | Extra unit/preview rows in that doc § PR-scoped matrix |
| `src/`, `main.py`, `plugin.json`, Deck RPC | Tier 0 device smokes ([testing-manual.md](testing-manual.md)) |
| New focusable Settings/QAM control | FOCUS-GRAPH-01…05 + coverage row ([testing-manual.md](testing-manual.md) § Focus graph) |
| Docs-only | State **N/A** for Deck smokes; still run applicable automated steps |

Full policy: MCP `bonsai://policy/documentation` / [.cursor/rules/docs-on-ship.mdc](../.cursor/rules/docs-on-ship.mdc).

---

## Shipped feature coverage (slim)

One smoke often covers many features. Status: **Verified** / **Partial** / **Open** / **N/A**. Update when a smoke or release pass lands. Detail checklists: [testing-manual.md](testing-manual.md).

| Area | Covered by | Status | Notes |
|------|------------|--------|-------|
| Plugin shell / tabs / Ask / connection test | SMOKE-A | Partial | Preview May 2026; on-Deck Tier 0 still in [QA backlog](roadmap.md#qa-backlog) |
| Permissions gate | SMOKE-C | Partial | Preview May 2026 |
| Permissions cleanup batch (web links always-on; Proton auto-attach; journal/intent UI gone; TDP read-only; troubleshoot hint) | PERMS-CLEAN-01…06 | Open | Schema/RPC unit; on-Deck: About links, Steam Input jump, troubleshooting Ask with game-context on/off + dismiss hint, no power-limits toggle, no Response verification section |
| Deterministic commands / VAC off / shortcut keywords | SMOKE-F | Partial | VAC full matrix → Tier 2 manual |
| TDP suggestions (read-only; no sysfs apply) | SMOKE-B | Open | Apply path removed 2026-07-30; re-verify suggestion-only banner/behavior. 2026-08-02: the sysfs **write** code is gone too (`apply_tdp`, `write_sysfs`, `append_sandbox_sysfs_write`) — reads and clamp bounds are unchanged. `tests/test_tdp_sandbox_sysfs.py` is replaced by `tests/test_tdp_service.py`, and the `UNIT-B-pytest-sandbox-tdp` preview gate now runs that file instead. `get_input_transparency` **no longer returns a `sysfs_writes` field** (nothing produced it once the apply path went); the `getSysfsWrites` preview hook stays and returns `[]` so out-of-repo DPS scenarios keep a stable contract |
| Strategy mode + spoilers (spot) | SMOKE-E | Partial | Deeper spoiler/checklist → Tier 2 |
| Preset carousel troubleshooting triple | SMOKE-D | Verified | |
| Preset chip inject (no game append) | PRESET-GAME-01 | Open | Unit pass; on-Deck chip → Ask text |
| Session RAG preset chips | SESSION-RAG-CHIPS-01 | Open | 2026-08-02: `get_session_rag_chip_candidates` implemented (backend was missing since the feature shipped, so these chips have never appeared on-device). 5 RPC tests + existing service tests. On-Deck: with **Use local knowledge base** on and a seeded corpus, launch a covered title (DRG Survivor, OoT) and confirm KB-derived chips appear in the carousel — strategy chips should open in Strategy mode. Turn the KB **off** and confirm the carousel returns to static seeds with no console error. Uninstall the corpus and confirm the same (reason `corpus_missing`, still no rejection) |
| Strategy Ask placeholder (focus caret) | STRATEGY-PLACEHOLDER-01 | Open | Unit/CSS fix; on-Deck empty Strategy field |
| Vision attach | SMOKE-G | Verified | Vision sweep 2026-04 |
| Background Ask reopen | SMOKE-H | Partial | Full lifecycle → release |
| Knowledge base retrieve (keyword + hybrid) | KB-SMOKE-02/04 | Verified | Seed KB on Deck Jul 2026 |
| KB download (public HF/GitHub) | KB-SMOKE-01 | Partial | Seed install works; public publish = Phase 6 |
| Context chip ladder / live transparency | CONTEXT-LADDER-01…03 | Partial | Wrap row + focus graph fix Jul 2026; on-Deck QA open |
| Reply micro-actions / D-pad graph | MICRO-01…05 | Open | Bug: Strategy live-turn skips |
| D-pad answer scroll | D-PAD-SCROLL-01/02 | Partial | Viewport fix; choppy scroll bug open |
| Character voice / Pyro | CHAR-VOICE, PYRO-EGG | Open | Tier 2 |
| Voice STT | VOICE-01…07 | Open | Tier 2; see troubleshooting § Voice. **2026-08-03: voice was completely broken since `742db60` (2026-07-17)** — `VoiceTranscriptionSession.status()` had been deleted signature-only, leaving its body as unreachable code, so every start raised `AttributeError`. Fixed with two mutation-checked guards (`test_voice_session_status.py`, `test_no_unreachable_code.py`) and verified on the deployed plugin. **A live recording round-trip on-Deck is still unverified** — that is VOICE-01. Deferring this tier is what let a total outage sit for two and a half weeks |
| Voice diagnosis note | — | — | Plugin-side RPC exceptions appear in `sudo journalctl -u plugin_loader`, **not** in `homebrew/logs/bonsAI/*.log` — the loader catches them before the plugin's own logger runs. Check the journal first when a UI action reports a Python error with nothing in the plugin log |
| Model routing pickers | ROUTING-01…02 | Partial | Fetch-on-open + save OK; focus/chrome → Bugs (**ROUTING-FOCUS-01**) |
| Pulled tags merged into try order | ROUTING-MERGE-01 | Open | 2026-08-02: `merge_pulled_tags_into_routing_orders` implemented (backend was missing since the feature shipped). 8 unit tests in `tests/test_merge_pulled_tags_rpc.py`. On-Deck: run a **custom** local-Ollama setup profile that pulls a model, then confirm the new tag appears at the bottom of **Set text try order…** — and at the top instead when **Allow high-VRAM model fallbacks** is on and the tag is a large one. A vision-capable pull (e.g. `qwen2.5vl:3b`) must also appear in the vision list; a text-only pull must not. With **no** saved try order the setting stays empty by design — verify the pulled model is still reachable for Ask |
| Ollama local-setup focus / Install label | OLLAMA-FOCUS-01…03, KB-FOCUS-01 | Open | Auto-probe + vertical chain + KB pair; re-check KB equal height |
| Ollama keep-alive slider gpfocus ring | OLLAMA-KEEPALIVE-FOCUS-01 | Open | Keep models loaded thumb: white ring vertically centered on dot (1px regression) |
| UI scale focus graph | UI-SCALE-01…05 | Open | Template for new controls |
| Token streaming (experimental) | STREAM-01…10 | Partial | Several preview PASS; Strategy spoiler stream open |
| Reply language (About override) | LANG-01…03 | Partial | **LANG-01** regression fixed Jul 2026 — closed dropdown shows **Follow system** on load (`selectedOption` = option `.data`); on-Deck confirm |
| RPC timeout wrapper (behavior change) | RPC-TIMEOUT-01 | Open | 2026-08-02: bounded RPCs moved to `callDeckyWithTimeout` (15s). Verify on-Deck that settings save/load, Ask submit, background status/abort, intent packs, strategy checklist, screenshots and voice status all still succeed normally — and that the 4 deliberately unbounded calls (`clear_plugin_data`, `install_rag_corpus_local`, `start`/`stop_voice_transcription`) still complete on slow paths (multi-GB model teardown, corpus copy, long recording) without a spurious timeout |
| Settings TS/Python non-default divergence (**D13**) | (automated) | Verified | **Resolved 2026-08-03** (D13 Option A, step 7c). Four settings aligned TS → Python (`desktop_app_log_level` trims, `rag_corpus_path` rejects traversal, `rag_corpus_version` accepts an unquoted number); `preset_chip_fade_animation_enabled` aligned Python → TS as derived, since reading it independently contradicts `preset_chip_animation`. `ui_scale_manual_profile` was **not** drift — it is the `SHOW_IMMERSIVE_UI_SCALE = false` gate — and was left alone. Now guarded by `tests/contracts/settings-hostile-inputs.json` (19 cases, both languages). Re-probe: 1 divergence left, the intentional immersive gate. **No Deck smoke needed** — none of these values is reachable from the UI |
| Settings field tables (**D12**, steps 7b/7d) | (automated) | Verified | 2026-08-03: simple settings declared as one-row tables in both languages — Python `_SIMPLE_FIELDS` (19 rows) and TS `SIMPLE_FIELDS` (26 rows). Behavior-preserving, each verified by its own differential test against the pre-refactor module over ~6,000 hostile inputs, both mutation-checked. The TS table is `satisfies`-typed so a wrong-typed or unknown-key row fails `tsc`. **No Deck smoke needed** — no behavior change; the two shared contracts below are the standing guard |
| Settings TS/Python defaults contract | (automated) | Verified | 2026-08-03: `tests/contracts/settings-defaults.json` asserted by both `tests/test_settings_contract.py` and `src/data/bonsaiSettingsContract.test.ts`. Measured equal first — 40 keys, zero differences — so the fixture records real behavior. Mutation-checked: changing one fixture value fails both halves. **No Deck smoke needed** (no behavior change); if a test here fails, the two languages disagree about a default — fix the code, not the fixture |
| Deployed RPC surface probe | (automated, on-device) | Verified | 2026-08-03: `ssh deck@<ip> 'python3 -' < scripts/probe_deck_rpc_surface.py` drives 21 read-only RPCs plus the Ask admission path against the **deployed** plugin, with every writable dir redirected to a temp tree. Exists because unit tests import services and the frontend suite stubs RPCs via `fakeDeckyRpc.ts`, so a broken `class Plugin` method passes every gate. It immediately found `get_reply_language_snapshot` missing an `await` — broken since the feature shipped. **Run after any deploy that touches `class Plugin` plumbing.** Current: 21/21 ok |
| Legacy-loader shim removal (**D11**) | D11-SHIM-01 | Partial | 2026-08-03: `_coerce_instance` (55 call sites) and `_ensure_background_state` removed from `main.py`; `ollama_ask_service.py:81` called the latter on every Ask, so that call went too. Automated side is strong — token-level differ proves the change mechanical (15,446 identical tokens, 236 renames, zero other differences), 413 Python tests green, and the Deck logs `bonsAI plugin loaded!` with no traceback. **Backend half now verified 2026-08-03**: `scripts/probe_deck_rpc_surface.py` drove all the affected RPCs on-device — `_active_request_id`, `get_input_transparency`, `get_background_game_ai_status`, `abort_background_game_ai`, the Ask admission path via `start_background_game_ai`, plus voice and knowledge-base status reads — **21/21 ok, no `AttributeError`**. **Still open:** the UI-level pass, which the probe cannot do — a real Ask through the Main tab against a reachable Ollama host (the probe uses an unreachable port, so it exercises admission and abort but never a successful completion), and a voice **start/stop** round trip (excluded from the probe as it grabs the microphone) |
| Clean install / release zip | Tier 4 | Open | Before tag |
| Windows deploy prune + verify | DEPLOY-VERIFY-01…03 | Partial | 2026-08-03 (**D8**): `scripts/build.ps1` wipes the Deck plugin dir before copy, exit-code checks every `ssh`/`scp`, and SHA-256 compares all 52 shipped code files after upload. **01 Verified** — two deploys 2026-08-03 (00:47, 00:51), both `Verified 52 files on the Deck.` + exit 0 + `bonsAI plugin loaded!` + zero `Traceback`/`ERROR`. **03 Verified** — planted `STALE_SENTINEL.py` and `py_modules/backend/stale_dir/ghost.py` on the Deck, deployed, both files and the directory gone. (Do **not** use `refactor_helpers.py` as the witness — it was hand-deleted on-device 2026-08-02, so its absence proves nothing.) **02 Verified 2026-08-03** — happened for real rather than staged: a deploy attempted while the Deck had gone to sleep failed at the first `ssh` (exit 255) and the script printed *"Creating remote temp directory failed (exit code 255). Deploy aborted - the Deck may be asleep or unreachable."* with exit 1. Pre-D8 that same run would have attempted every `scp`, ignored all of them, and printed *Deployment complete!*. The `STALE` branch of the hash compare remains simulation-tested only. **Re-run with output redirected** (`.\scripts\build.ps1 2>&1 \| ...`) if the script's error handling is ever touched — a `$ErrorActionPreference = "Stop"` regression made a `pnpm` deprecation warning fatal under redirection and was caught only that way |

**Evidence snapshots (keep):** [tier0/2026-05-26](test-evidence/tier0/2026-05-26-9e20a82/), [tier1Core](test-evidence/tier1Core/2026-05-26-9e20a82/), [tier2Deep/2026-06-09](test-evidence/tier2Deep/2026-06-09-a9237e4/). Historical PASS narration: [archive/testing-results-2026.md](archive/testing-results-2026.md). Orphan evidence folders may be pruned later when nothing links them.

---

## QA backlog (from roadmap)

These are **not** missing features — deferred maintainer testing:

1. Device QA Tier 0–1 (formal Pass on current build)
2. VAC-02…06 on-device
3. QAMP verification matrix
4. Broader prompt-testing pass

See [roadmap.md § QA backlog](roadmap.md#qa-backlog) and [testing-manual.md](testing-manual.md).

---

## New focusable controls

Before shipping any new Settings/QAM control, complete the focus-graph checklist in [testing-manual.md](testing-manual.md) and add a coverage note above. Policy: `bonsai://policy/decky-ui-focus`.
