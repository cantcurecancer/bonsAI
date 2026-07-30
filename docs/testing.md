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
| Deterministic commands / VAC off / shortcut keywords | SMOKE-F | Partial | VAC full matrix → Tier 2 manual |
| TDP apply + QAMP banner | SMOKE-B | Verified | On-Deck + preview evidence |
| Strategy mode + spoilers (spot) | SMOKE-E | Partial | Deeper spoiler/checklist → Tier 2 |
| Preset carousel troubleshooting triple | SMOKE-D | Verified | |
| Vision attach | SMOKE-G | Verified | Vision sweep 2026-04 |
| Background Ask reopen | SMOKE-H | Partial | Full lifecycle → release |
| Knowledge base retrieve (keyword + hybrid) | KB-SMOKE-02/04 | Verified | Seed KB on Deck Jul 2026 |
| KB download (public HF/GitHub) | KB-SMOKE-01 | Partial | Seed install works; public publish = Phase 5 |
| Context chip ladder / live transparency | CONTEXT-LADDER-01…03 | Partial | Wrap row + focus graph fix Jul 2026; on-Deck QA open |
| Reply micro-actions / D-pad graph | MICRO-01…05 | Open | Bug: Strategy live-turn skips |
| D-pad answer scroll | D-PAD-SCROLL-01/02 | Partial | Viewport fix; choppy scroll bug open |
| Character voice / Pyro | CHAR-VOICE, PYRO-EGG | Open | Tier 2 |
| Voice STT | VOICE-01…07 | Open | Tier 2; see troubleshooting § Voice |
| Model routing pickers | ROUTING-01…02 | Partial | Fetch-on-open + save OK; focus/chrome → Bugs (**ROUTING-FOCUS-01**) |
| Ollama local-setup focus / Install label | OLLAMA-FOCUS-01…03, KB-FOCUS-01 | Open | Auto-probe + vertical chain + KB pair; re-check KB equal height |
| UI scale focus graph | UI-SCALE-01…05 | Open | Template for new controls |
| Token streaming (experimental) | STREAM-01…10 | Partial | Several preview PASS; Strategy spoiler stream open |
| Clean install / release zip | Tier 4 | Open | Before tag |

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
