# bonsAI testing — manual (Deck / maintainer)

On-device QA only. Automated gates: [testing-automated.md](testing-automated.md). Hub + slim coverage: [testing.md](testing.md). Roadmap QA backlog: [roadmap.md](roadmap.md#qa-backlog).

Record **build id / git SHA** and **SteamOS** when marking Pass / Partial / Fail.

Historical full checklist (pre–2026-07-30 split): [archive/testing-full-pre-2026-07-30.md](archive/testing-full-pre-2026-07-30.md).

---

## Tags

| Tag | Meaning |
|-----|---------|
| **P0–P3** | Importance — P0 = core; P3 = polish |
| **S0–S3** | Setup cost — S0 = BPM + Ollama; S3 = reboot / clean install |
| **Tier 0–4** | Run order — finish lower tiers first unless PR-scoped |

---

## Focus graph (mandatory before shipping new controls)

Policy: `bonsai://policy/decky-ui-focus`. Patterns: `bonsai://architecture/focus-graph-patterns`.

- [ ] **FOCUS-GRAPH-01** Every focus stop listed in the section parent
- [ ] **FOCUS-GRAPH-02** D-pad Up/Down reaches each stop (no skips)
- [ ] **FOCUS-GRAPH-03** Sliders / horizontal groups: Left/Right on the **focus owner** (bridge if needed)
- [ ] **FOCUS-GRAPH-04** Cross-section links via parent refs
- [ ] **FOCUS-GRAPH-05** Coverage note in [testing.md](testing.md) (template: **UI-SCALE-05**)

References: `SettingsTabUiScaleSection.tsx`, `OllamaTab.tsx`, `PullModelsModal.tsx`.

---

## Cross-cutting smokes

| ID | Name | Tier | Setup | Covers |
|----|------|------|-------|--------|
| **SMOKE-A** | Golden path | 0 | S0, BPM | Shell, tabs, Ask, connection, D-pad chunks, presets |
| **SMOKE-C** | Permission gate | 0 | S0 | Capability blocked-action toast |
| **SMOKE-F** | Deterministic commands | 0 | S0, no model | Sanitizer, shortcut-setup, vac-check off |
| **SMOKE-B** | TDP apply 8W | 1 | S1, game + Hardware | TDP, QAMP banner, game context |
| **SMOKE-E** | Strategy one-shot | 1 | S1 | Mode, spoilers, Spoilers OK |
| **SMOKE-D** | Frozen carousel triple | 1 | S1 | Presets troubleshooting — **verified** |
| **SMOKE-G** | Vision attach once | 1 | S1, Media | Attach + multimodal — **verified** |
| **SMOKE-H** | Background Ask reopen | 1 | S1 | Close QAM while pending → restore |

**Tier 0 (~15 min):** A → C → F · **Tier 1 (~20 min):** B → E → confirm D/G → H

---

## Tier 0 — Quick wins (S0)

BPM (Desktop → Big Picture → QAM → bonsAI). Ollama reachable.

### SMOKE-A — Golden path (P0)

- [ ] Open plugin; no crash on first paint
- [ ] LB/RB cycles Main → Ollama → Settings → Permissions → (Developer) → About
- [ ] Ollama → Test connection — success or stable unreachable (no traceback)
- [ ] Short Ask; reply in focusable chunks; D-pad through chunks
- [ ] **Show details** / context chips when available (see bug CONTEXT-LADDER)
- [ ] Three preset chips visible

### SMOKE-C — Permission gate (P0)

- [ ] Turn a capability **off** → blocked action → toast to Permissions → no crash
- [ ] Re-enable before Tier 1

### SMOKE-F — Deterministic commands (P2)

- [ ] `bonsai:disable-sanitize` / `bonsai:enable-sanitize` — confirmation; no Ollama call
- [ ] `bonsai:shortcut-setup-deck` — fixed help; points to [troubleshooting.md](troubleshooting.md) §5
- [ ] `bonsai:vac-check` with Steam Web API **off** → capability message only (**VAC-01**)

---

## Tier 1 — Core shipped (S1)

### SMOKE-B — TDP apply 8W (P0)

- [ ] Game running; Hardware permission on; Ask to set TDP 8W → apply + QAMP banner

### SMOKE-E — Strategy one-shot (P1)

- [ ] Strategy mode Ask; spoiler tap-to-reveal / Spoilers OK path works

### SMOKE-H — Background Ask reopen (P1)

- [ ] Start Ask; close QAM; reopen → Thinking… or final reply restored

### Tier 1 extras

- [ ] Persist last Q&A across plugin reopen
- [ ] One Ask each in Speed and Expert (routing/disclosure differs)
- [ ] “What game am I playing?” with game focused

---

## Tier 2 — Opt-in (run when touching related code or before RC)

| Block | Checklist |
|-------|-----------|
| **VAC matrix** | VAC-02…06 below (preview PASS; on-Deck still in QA backlog) |
| **Proton logs** | PROTON-LOG-01…03 — attach on troubleshooting Ask |
| **Token streaming** | STREAM-01…05 spot; Strategy spoiler stream if flag on |
| **Strategy depth** | Spoiler policy, checklist persist, cheat gating |
| **KB** | KB-SMOKE-03, 05–10; KB-EVAL-01 before Phase 5 |
| **Character / Pyro** | One preset Ask; Pyro easter egg if touching character |
| **mDNS / Desktop notes / Model policy** | Spot when those paths change |
| **Voice STT** | VOICE-01…07 (mic required) |
| **UI scale** | UI-SCALE-01…05 on handheld / dock / TV |
| **Context ladder / micro-actions** | CONTEXT-LADDER-01…03; MICRO-01…05 (open bugs) |
| **D-pad scroll** | D-PAD-SCROLL-02 (choppy Strategy scroll bug) |
| **Data clear** | DATA-CLEAR-01 (permissions/settings wipe survives reopen) |
| **Reply language** | LANG-01…03 (**LANG-01** Follow system on load — code fix Jul 2026; on-Deck confirm) |

### VAC / `bonsai:vac-check`

- [x] **VAC-01** Capability off — SMOKE-F
- [ ] **VAC-02** On, empty key — *preview PASS; confirm on Deck*
- [ ] **VAC-03** Valid key + SteamID
- [ ] **VAC-04** Profile URL
- [ ] **VAC-05** Vanity `/id/…` unsupported note
- [ ] **VAC-06** Permission off after key saved — no network

### Open regression IDs (bugs / recent ships)

- [ ] **PRESET-GAME-01** With a game running, tap a preset chip — Ask field shows chip text only (no `— {Game}` append; “this game” unchanged)
- [ ] **STRATEGY-PLACEHOLDER-01** Strategy mode, empty Ask — focus field; italic placeholder does not shift when fake caret appears
- [ ] **CONTEXT-LADDER-01** Live turn Show details reveals inline chip ladder
- [ ] **CONTEXT-LADDER-03** D-pad: Show details / Retry **Down** → ladder focus (not session strip skip); **Left/Right** cycles chips; all chips visible when ≤6; **Up** from first chip → utility row; **Down** from last chip → session strip; **Developer details** chip reachable
- [ ] **MICRO-04** Strategy live-turn D-pad: branches → feedback → utilities
- [ ] **D-PAD-SCROLL-02** Strategy reply: ~one readable step per D-pad Down
- [ ] **STRAT-SPOIL-DRG-01** DRG Survivor boss names not false-positive spoilers
- [ ] **KB-FOCUS-01** Ollama KB Update/Remove: Left/Right between pair; both Up → KB toggle; both Down → Reply style; **equal row height** (Update not taller than Remove)
- [ ] **OLLAMA-FOCUS-01** Ollama tab open (no prior Test): with Ollama reachable, primary button shows **Update AI & models** (quiet auto-probe)
- [ ] **OLLAMA-FOCUS-02** Run AI on this Deck: D-pad vertical — toggle → Install/Update → Browse models → Install options… → Test connection → KB toggle
- [ ] **OLLAMA-FOCUS-03** Up from Test connection lands on **Install options…** (or last Install-options submenu row when open)
- [ ] **OLLAMA-KEEPALIVE-FOCUS-01** **Keep models loaded** slider thumb: white gpfocus ring vertically centered on the dot (no ~1px high offset)
- [ ] **ROUTING-01** Set text/vision try order opens picker listing installed tags without requiring a prior Test connection tap
- [ ] **ROUTING-02** Reorder + Done persists; reopen modal shows saved order
- [ ] **ROUTING-FOCUS-01** Try-order modal D-pad + chrome match Pull Models / Character picker (deferred bug)

---

## Tier 3 — Heavy manual

| Block | Notes |
|-------|-------|
| **QAMP on-Deck** | See § QAMP below — [QA backlog](roadmap.md#qa-backlog) |
| **TDP boundary clamps** | 1W/3W/15W/20W + GPU-800 advisory (many preview PASS) |
| **Background Ask full lifecycle** | Timeout, error, busy guard |
| **Multi-game matrix** | Title-specific behavior |
| **Guide-chord macro** | Power-user only — [troubleshooting.md](troubleshooting.md) §5; not casual priority |

---

## Tier 4 — Release gate

1. Clean install: Ollama not yet installed → README path → one text Ask succeeds
2. Record Decky / SteamOS / Ollama host in a short note under [testing.md](testing.md) or release PR
3. Tier 0–2 Pass or explicit Waive with reason

| Date | Git SHA / tag | Result | SteamOS / Decky | Ollama host | Notes |
|------|---------------|--------|----------------|-------------|-------|
| | | | | | |

---

## QAMP verification (Phase 1)

**Code / unit (verified 2026-04-26):** banner wattage, reopen Performance guidance, stale-slider note, GPU MHz advisory-only.

**On-Deck (Tier 3 — QA backlog):**

- [ ] **QAMP-DECK-01** Per-game profile ON: TDP apply + guidance
- [ ] **QAMP-DECK-02** Per-game profile OFF: same
- [ ] **QAMP-DECK-03** Close/reopen QAM Performance: cap reflects write
- [ ] **QAMP-DECK-04** After Steam restart: OS default (not plugin regression)
- [ ] **QAMP-DECK-05** After full reboot: same

---

## Progress tracker

| Tier | Status | Last run | Notes |
|------|--------|----------|-------|
| 0 | Preview Pass | 2026-05-26 / 9e20a82 | Formal on-Deck Pass → QA backlog |
| 1 | Preview Pass | 2026-05-26 / 9e20a82 | |
| 2 | Partial | 2026-06-09 / a9237e4 | |
| 3 | Open | | QAMP matrix deferred |
| 4 | Deferred | | Clean install before tag |

---

## Prompt-testing (qualitative)

Broader matrices beyond Tier 0–1 smokes are **deferred** ([QA backlog](roadmap.md#qa-backlog)). Prefer: one smoke per area over long prompt lists. Old Tier 1 prompt checkboxes: [archive/testing-full-pre-2026-07-30.md](archive/testing-full-pre-2026-07-30.md).
