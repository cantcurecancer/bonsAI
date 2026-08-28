# bonsAI testing — manual (Deck / maintainer)

On-device QA only. Automated gates: [testing-automated.md](testing-automated.md). Hub + slim coverage: [testing.md](testing.md). Roadmap Verify: [roadmap.md](roadmap.md#verify).

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

## Test title pool

The games QA rows reach for, and what each one is actually covering. Rows below name these by
AppID; keep new rows inside this pool unless a title is the thing under test, so a Deck session
does not need a different library every week.

| Title | AppID | Covers | Why this one |
|---|---|---|---|
| Deep Rock Galactic: Survivor | `2321470` | KB corpus hit, session RAG chips, `low_narrative` spoiler profile | The only title the seed corpus covers by entity (`Glyphid Dreadnought`, `Hollow Bough`) |
| Hades | `1145360` | `protect_progression`, named-entity consent | Shares the `roguelike` genre with DRG Survivor, so it is the genre over-relax guard |
| Left 4 Dead 2 | `550` | `low_narrative`, KB compat routing | Cheap to install, always in the library |
| **Black Mesa** | `362890` | **`unknown` spoiler profile**, Proton/Source compat, cold-model thinking phases | **The gap the pool had.** Every other title above is classified in `spoiler_title_profiles.py`; most of a real user's library is not, and `unknown` was untested on device. Also a Source-engine title with real Proton behaviour, so it exercises `proton_logs` without contriving a crash |

**Black Mesa is deliberately not added to `spoiler_title_profiles.py`.** Adding it would defeat the
reason it is in the pool — it is here to exercise the unclassified path a real library mostly hits.
It is a linear story campaign, so if a QA pass shows the `unknown` default is too loose for
story-shaped titles, that is a finding about the default, not a reason to special-case this AppID.

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
- [ ] **TAB-MARKER-01** — active tab icon is accent-coloured while focus is deep in the tab body (D-pad down into the panel, then look at the strip without moving focus back up); other icons stay grey. Close and reopen the plugin — the restored tab is still marked. With an AI character selected the marker takes that character's colour, not green.
- [ ] Ollama → Test connection — success or stable unreachable (no traceback)
- [ ] Short Ask; reply in focusable chunks; D-pad through chunks
- [ ] **Show details** / context chips when available (see bug CONTEXT-LADDER)
- [ ] Three preset chips visible

### SMOKE-C — Permission gate (P0)

- [ ] Turn a capability **off** → blocked action → **Open Permissions** (or troubleshooting hint button) → lands on matching toggle → **Back to …** returns → no crash
- [ ] Re-enable before Tier 1

### PERM-JUMP-01 — Permission jump D-pad (P0)

Capability off for each row; trigger the deny surface; D-pad to **Open Permissions** → Permissions tab → matching toggle focused → **Back to …** → prior tab.

| Capability | Deny surface | Expected toggle |
|------------|--------------|-----------------|
| `media_library_access` | Attach recent screenshot (browser empty / error) | Read game & screenshot context |
| `steam_logs_read` | Troubleshooting Ask hint on Main | Read game & screenshot context |
| `filesystem_write` | Save note to Desktop / Developer app-log row | Save files to Desktop |
| `microphone_access` | Ask bar mic / Settings → Voice install | Voice input (microphone) |
| `steam_web_api` | `bonsai:vac-check` reply banner | Steam ban lookup |

- [ ] D-pad: deny **Open Permissions** → Permissions toggle → **Back** without losing modal tab-restore behavior elsewhere

### ONBUTTONDOWN-AUDIT-01 — onButtonDown whitelist + direction handlers (P1)

Wave 4 G — confirm D-pad directions do not trigger A-only actions; direction handlers fire on device.

- [ ] Collapsed **Context used · tap for details** hint: D-pad **Down** past it does **not** expand; **A** expands
- [ ] Session context strip open: D-pad **Down** through turn rows does **not** change active row; **A** selects row
- [ ] Expanded turn **Show details** link: D-pad past without **A** does not change session highlight
- [ ] Collapsed turn header: **Down** enters answer bubble (section walk)
- [ ] Settings → UI scale manual profile bridge: **Left/Right** steps profile when focused on slider thumb

**This row decides an open question, so record what happens rather than just pass/fail.** Wave 4 G
removed `onMoveLeft`/`onMoveRight` from `buildDeckThumbNavHandlers` and the UI-scale bridge, leaving
`onButtonDown` as the only horizontal path — while *keeping* `onMoveUp`/`onMoveDown` on the same
object. Both cannot be right: the old string predicates provably never matched a `GamepadEvent`
(`focusNavigation.test.ts` asserts it), so before Wave 4 the `onMove*` handlers were doing all of the
work, and "redundant twins" was the one thing they could not have been. Watch for two distinct
failures:

- [ ] **Nothing happens** on Left/Right → `onButtonDown` is not reaching the thumb; restore the
      `onMove*` handlers and drop the direction branch of `onButtonDown` (not both — they double-step)
- [ ] **Two steps per press**, or the profile steps *and* focus jumps off the slider → `onButtonDown`
      fires but does not consume the direction the way `onMoveLeft` did; the bridge needs to swallow it
- [ ] All four `DeckFocusSlider` users, not just UI scale — **Ollama keep-alive**, **Reply verbosity**,
      **Connection timeout** share `buildDeckThumbNavHandlers` and changed with it

### DOC-SWEEP-01 — global document realm fixes (P1)

Wave 4 H — confirm each path works on-Deck (SharedJSContext vs QAM popup document).

- [ ] Submit Ask: focused field blurs before send (keyboard focus does not stick mid-Ask)
- [ ] Attachment row: **Right** from preview → remove button; **Left** back
- [ ] Preset carousel: auto-advance pauses while a chip has D-pad focus
- [ ] About → GitHub link: **Up** focuses reply-language dropdown
- [ ] Settings/Ollama: **Up** at panel top returns to active tab strip
- [ ] **Do the blur and attachment-row checks on the very first Ask of a fresh plugin open**, before
      any answer has rendered. Until 2026-08-07 the document was learned only from the answer-bubble /
      answer-stop / spoiler-fence registries, so everything above worked from the second Ask onward
      and silently used the wrong document on the first. `BonsaiPluginShell` now seeds it at mount;
      this is the check that proves it.
- [ ] Expand collapsed history turn: header scrolls into view

### PRESET-STREAM-ANIM-01 — stream preset chip animation (P1)

Wave 4 J — Developer tab → Preset suggestions → **stream**.

- [ ] Three chips cascade with staggered typewriter reveal and blinking block caret
- [ ] Chips stay D-pad focusable while text is still typing (A selects full prompt, not partial)
- [ ] After hold, chip clears and samples a new prompt
- [ ] With OS **prefers-reduced-motion: reduce**, chips swap instantly (no per-char reveal)

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
| **Proton logs** | PROTON-LOG-01…03 — auto-attach when **Read game & screenshot context** is on (troubleshooting Ask + AppID) |
| **Permissions cleanup** | PERMS-CLEAN-01…06 — About/Steam links no gate; no Open web links / Adjust power limits toggles; no journal / intent-pack / Response verification UI; troubleshoot hint dismissible |
| **Token streaming** | STREAM-01…05 spot; Strategy spoiler stream if flag on. **After Phase A (2026-08-07):** re-run STREAM-01/02 (P2/P3 changed the flag-off path), and STOP-PARTIAL-01 with real streamed text — Stop must keep the drafted answer under a *"Stopped — partial answer kept."* line, and must return the question to the ask field when nothing readable had arrived |
| **Token streaming — D-pad chain** | **STREAM-09**, rewritten for Phase B (2026-08-07). **D-pad only, no touch.** Long Strategy answer with streaming on: Down from the turn header steps into the answer and then through it **one section at a time**, each landing visibly marked (blue left edge); Down at the last visible section scrolls, and the next press lands on what it revealed; Down past the end reaches the reply actions and Up from the first section reaches the header — **no dead ends**; a masked spoiler is offered before the walk passes it, and **A on a spoiler wait chip must not unmask**; a section arriving mid-stream does not steal focus; the same walk works on a collapsed-then-reopened history turn. **Check after a QAM close/reopen and while the answer is still growing** — nested-Focusable survival at this count is the one unproven thing in Phase B. Full row and the fallback if it fails: [testing.md](testing.md) |
| **Token streaming — scroll follow** | **STREAM-FOLLOW-01** (new, 2026-08-07). Sitting at the bottom, new text stays on screen with no input; scrolling up mid-answer holds position (check **touch and D-pad separately**); scrolling back down resumes the follow; the follow stops at the end of the transcript, so the session context strip and Save chat are not dragged into view |
| **Strategy depth** | Spoiler policy, checklist persist, cheat gating |
| **KB** | KB-SMOKE-03, 05–10; KB-EVAL-01 before Phase 6 |
| **Character / Pyro** | One preset Ask; Pyro easter egg if touching character |
| **mDNS / Desktop notes / Model policy** | Spot when those paths change |
| **Voice STT** | VOICE-01…07 (mic required) |
| **UI scale** | UI-SCALE-01…05 on handheld / dock / TV |
| **Context ladder / micro-actions** | CONTEXT-LADDER-01…03; MICRO-01…05 (open bugs) |
| **D-pad scroll / tabs** | D-PAD-SCROLL-02 (choppy Strategy scroll bug); TAB-SWITCH-01 (LB/RB strip shuffle) |
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
- [ ] **ASK-CARET-CHAR-01** AI character on — focus empty Ask field; native caret aligns with placeholder/text (not left of `?` badge); D-pad Up from paperclip → avatar, Right → field; character-off path unchanged
- [ ] **ASK-WIDTH-01** — **partial fix landed 2026-08-15, confirm on-Deck.** Main tab, AI character **off**: the preset chips, the input box and the Ask bar all reach the QAM panel edges, with no visible gutter between them and the panel interior; the three share identical left and right edges. Repeat with the character **on**; repeat after LB/RB away and back. If a gutter survives, run `scripts/probe_deck_ask_row_width.py` and read **V0** — it walks `.bonsai-scope` → `<body>`, prints each ancestor's padding/margin and the room it eats, and marks which are bonsAI's to target vs Steam/Decky's needing a named selector. V1–V5 cover the per-row measurement loop if the ancestors come back clean
- [ ] **CONTEXT-LADDER-01** Live turn Show details reveals inline chip ladder
- [ ] **KB-COVERAGE-01** After Ask, Show details includes `kb_coverage` chip: KB off → `KB: off`; KB on + DRG Survivor + seed corpus → `KB: N sections`; KB on + uncovered title → `KB: none for this game`. **Blocked until CONTEXT-LADDER-01 passes** on live turn
- [ ] **CONTEXT-LADDER-03** D-pad: Show details / Retry **Down** → ladder focus (not session strip skip); **Left/Right** cycles chips; all chips visible when ≤6; **Up** from first chip → utility row; **Down** from last chip → session strip; **Developer details** chip reachable
- [ ] **MICRO-04** Strategy live-turn D-pad: branches → feedback → utilities
- [x] **D-PAD-SCROLL-02** Strategy reply: ~one readable step per D-pad Down. **Passed 2026-08-28** — one stop per paragraph
- [ ] **STRAT-SPOIL-DRG-01** DRG Survivor boss names not false-positive spoilers — ship gate is the three **required** rows below; acceptance is *no spoiler fence rendered for the entity named in the question* (display-level, not a claim about model behavior)
  - [ ] **DRG-01** `2321470`, *"How do I beat Glyphid Dreadnought?"*, no consent phrase, masking on → boss tactics in plain text, no tap-to-reveal
  - [ ] **DRG-01d** As DRG-01, **then ask a second question** → the first answer stays unfenced after it leaves the live turn *(the D1 regression: history turns used to re-fence)*
  - [ ] **DRG-01b/c** As DRG-01 with KB **off**, or corpus **absent** → still plain text *(D2: the low-risk signal used to be reachable only through the corpus)*
  - [ ] **DRG-01-STREAM-01** — **fixed 2026-08-15 (R4), confirm on-Deck.** As DRG-01 with streaming **on**: no `Spoiler hidden until complete…` chip appears at any point while the answer streams in — the fence renders as plain text from the moment it opens, not only after it closes
  - [ ] **HADES-UNNAMED-STREAM-01** — companion check for the fix above, so nothing was over-relaxed. Hades `1145360`, a question that does **not** name a boss, streaming on → the mid-stream mask chip **still appears** for story-adjacent detail (Hades shares the `roguelike` genre with DRG Survivor, so this is the case the R4 fix must not touch)
  - [ ] *(recommended)* **HADES-NAMED-01** Hades `1145360`, *"How do I beat Megaera?"* → plain text. Naming the boss is consent for that boss on any title (spoiler-constitution rule 7)
  - [ ] *(recommended)* **HADES-UNNAMED-01** Hades, a question that does **not** name a boss → story-adjacent detail **still fenced**. This is the genre over-relax guard: Hades shares the `roguelike` genre with DRG Survivor
  - [ ] *(extra credit, does not block)* **DRG-01e** Streaming off → plain text; **DRG-01f** `[Strategy follow-up]` turn → plain text
- [ ] **THINKING-COPY-01** Same Ask, no phase boundary crossed → the italic line does **not** change. Specifically: the opener that appears on submit must be the *only* opener — watch the first ~2s for a rewrite from one generic line to another. That rewrite was the bug; if you see it, the client is composing again
- [ ] **THINKING-OPENER-01** — **settled 2026-08-08, keep as a regression check.** Submit an Ask: the first line you can actually read should be one quoting your question. The constant *Thinking…* placeholder exists but the maintainer could not perceive it on device, which is the intended outcome — the round trip is imperceptible and the backend-authoritative design stands. If *Thinking…* ever becomes **readable** as its own line, the round trip has regressed
- [ ] **THINKING-SLOW-01** Black Mesa `362890`, cold model (first Ask after a reboot, or after `ollama stop`): the line must report **building context** and then **connecting/waking the model** before any answer text. The point is that the longest silence now says something — and says it encouragingly, not with a sigh
- [ ] **THINKING-LIVE-01** During a long answer (Expert mode, or a 30s+ reply): the line **keeps moving** on an irregular beat (4–12s between changes, first change 7–13s in) and never sits on one string for the whole run. Three things should be visible over a long generation: the `connecting` line giving way to a *writing your answer* line once tokens start, then rotating duration lines that escalate in tone, and — if the model cooperates — its own `<bonsai-status>` text cutting in and resetting the cycle. **Fail conditions:** any line held for more than ~15s; a *regular* beat you can count along to (the whole point of the randomised window); a line predicting completion (*almost done*, *nearly there*); a line repeating itself back to back; half-written text
- [ ] **THINKING-SPOILER-01** Strategy mode, masking on, a title with real spoilers: if the model names something spoilery in the thinking line it must render as blocks (`beat ████ ██████ dance`), never as plain words and never as literal `[[spoiler]]` markup. Watch for the failure direction too — a line that is *entirely* blocks means the model opened the marker and never closed it, which masks to end of line by design
- [ ] **KB-FOCUS-01** Ollama KB Update/Remove: Left/Right between pair; both Up → KB toggle; both Down → Reply style; **equal row height** (Update not taller than Remove)
- [ ] **KB-CANCEL-01** Ollama KB **while a download runs**: **Cancel** replaces Remove and is the row's only enabled stop (the primary reads *Downloading…* and is disabled). Down from **Use local knowledge base** → Cancel; Up from **Reply verbosity** → Cancel; **A** → *Cancelling…*, second press does nothing; row returns to Update/Download + Remove within a few seconds; status line reads *Download cancelled* in grey, **not** the raw backend error in red; a fresh download still starts afterwards
- [ ] **OLLAMA-FOCUS-01** Ollama tab open (no prior Test): with Ollama reachable, primary button shows **Update AI & models** (quiet auto-probe)
- [ ] **OLLAMA-FOCUS-02** Run AI on this Deck: D-pad vertical — toggle → Install/Update → Browse models → Install options… → Test connection → KB toggle
- [ ] **OLLAMA-FOCUS-03** Up from Test connection lands on **Install options…** (or last Install-options submenu row when open)
- [ ] **REPLY-VERB-01** Reply style: set **Caveman** → Ask → Input handling shows `Reply style: caveman` and reply is terse; **Balanced** → no `REPLY VERBOSITY` block vs baseline; **Detailed** → paragraphs; with **AI characters** on + Caveman, character voice (not caveman grammar); Strategy + Detailed still ends with `bonsai-strategy-branches`
- [ ] **OLLAMA-KEEPALIVE-FOCUS-01** **Keep models loaded** slider thumb: white gpfocus ring vertically centered on the dot (no ~1px high offset)
- [ ] **ROUTING-01** Set text/vision try order opens picker listing installed tags without requiring a prior Test connection tap
- [ ] **ROUTING-02** Reorder + Done persists; reopen modal shows saved order
- [ ] **ROUTING-FOCUS-01** Try-order modal chrome matches Pull Models / Character picker (deferred bug). **The D-pad half is no longer a question** — it failed on 2026-08-28, see PICKER-REORDER-01
- [x] **PICKER-EDGE-01** Fullscreen pickers: from the first control press Up, from the last press Down, ring must still reach the confirm buttons. **Character picker and AI models hub pass (2026-08-28)**; try order fails
- [x] **PICKER-REORDER-01** Try order: one press of Down moves the *highlight*, not the model. **Passed 2026-08-28** after D36 option 1. Vision list not driven separately
- [x] **PICKER-B-CLOSE-01** Try order closes on B, from a row and from the footer. **Passed 2026-08-28** once it moved onto the shared modal frame
- [ ] **TAB-RESUME-MODE-01** Developer → **Navigation → Tab to open on (D15)**: each stop changes where the *next* open lands — **A · Main** always Main, **B · Resume** the tab you left, **C · 5 min** the tab you left only within five minutes. Re-check the control after a reopen to confirm the choice persisted
- [ ] **TAB-RESUME-FOCUS-01** D-pad the same row: Down from **On-screen debug HUD** reaches the three buttons, **Left/Right** moves between A/B/C, **Down** leaves the row for **App activity logging** below, **Up** returns to Diagnostics — no stop skipped and no button acting on a direction press
- [ ] **TAB-SWITCH-01** Press **RB** repeatedly through the whole strip, with focus **deep in a scrolled** Settings or Ollama panel: the icon strip must not lurch sideways and drift back, and the content pane must not flash or jump. **RB is the case that mattered** — the fault was asymmetric and LB never showed it, so an LB-only pass proves nothing. Include the wraparound (**RB on About**, rightmost, which wraps to Main rather than doing nothing) since that is the longest strip travel. Repeat with focus parked **on the tab icons**. Fixed 2026-08-07 by `overflow: clip` in section-1.ts; if this regresses, re-run `scripts/probe_deck_tab_switch.py` and check whether `scrollLeft` on the tabs-root child stays 0 while `scrollWidth` collapses. Mechanism: [planning/03-lbrb-tab-flicker.md](planning/03-lbrb-tab-flicker.md) § 10
- [ ] **ABOUT-LINKS-01** About tab: D-pad **down** from the reply-language dropdown must reach **all four** links in order — GitHub, Built on Ollama!, Bugs & Feature Requests, PayPal — with no stop skipped and no press swallowed, and **Up** must walk back the same way. Press **A** on one and confirm Steam's browser opens (it is bright). Fixed 2026-08-07: hand-rolled `Focusable` + `onMoveUp`/`onMoveDown` wrappers returned `true` (so Steam skipped default navigation) while moving focus with a plain DOM `.focus()`, which does not transfer gamepad focus across nav containers — presses were consumed and focus never moved, making every link unreachable. The same chain also skipped the two middle links outright
- [ ] **QAM-BODY-RO-01** Switch tabs repeatedly (10+, through the taller Settings/Ollama panels), then D-pad to the **bottom** of a long panel: the pane must still reach its end and not be pinned to a stale height. Steam replaces the scroll node on every switch, so this is specifically about the 2nd switch onward — one switch proves nothing. Fixed 2026-08-08; if it regresses, `--bonsai-tab-body-height` will stop matching the live pane's `clientHeight` after a switch. **Re-run QAM-BAZZITE-01 and D-PAD-SCROLL-01 with this** — same measurement chain
- [ ] **SOFT-PREDICT-01** Speed mode, a prompt long enough to hit the 800-token wall once: confirm the `Continuing…` cue is visible and brief at the stream tail, the final reply reads as one seamless answer (no visible seam at the stitch point), and reopening the tab afterward shows no `Continuing…` in the saved history text
- [ ] **SOFT-PREDICT-03** Same setup as SOFT-PREDICT-01 — press **Stop** during the `Continuing…` cue window: kept partial body plus the small **Stopped** notice, and `Continuing…` must **not** appear in the kept text. Re-run after the 2026-08-15 throttle fix (`main.py` `_update_partial_response` shrink bypass + `stripSoftContinueCue` backstop) — this is the exact race the fix targets, so it is the highest-value manual re-check on this row
- [ ] **SOFT-PREDICT-04** Strategy mode, an answer long enough to continue mid-branch (opens a `bonsai-strategy-branches` fence before hitting the length wall): confirm no half-rendered fence or stray JSON appears at any point in the stream, including right at the continue boundary
- [ ] **SOFT-PREDICT-05** A real thinking model (e.g. a qwen3 variant) at the default `think: false`: confirm a visible reply still comes back — no empty-reply regression from the model spending the whole budget on hidden thinking
- [ ] **THINK-EFFORT-04** Ollama → **Thinking**, with a real thinking model (qwen3 variant) installed: set each of Brief / Balanced / Deep and Ask → answers still arrive, latency grows with the level, and **no raw reasoning leaks into the reply body**. Then Ask on a non-thinking model (gemma / llama) → the answer still arrives, a *Thinking not supported* toast appears **once** (not on the second Ask), and a second model that also cannot think warns separately. **While here, read the Ollama log for the 400 body** and tighten `_is_thinking_unsupported_error` in `ollama_service.py` if the wording is stable — the matcher is loose on purpose because the string is not a stable API
- [ ] **THINK-EFFORT-05** D-pad the **Thinking** row: **Down** from the Reply style slider reaches the four buttons, **Left/Right** moves between Off/Brief/Balanced/Deep, **Down** exits to **Custom timeouts** below, **Up** returns to the Reply style slider — no stop skipped, and no button acting on a direction press. Inserting this row rewired both neighbours, so check the Reply style slider's Down and the latency row's Up specifically
- [ ] **EXPERT-CAP-01** Expert-mode Ask with a long answer: it now runs to ~1200 tokens before a soft continue rather than ~800. Expert was silently capped at the Speed budget until 2026-08-15, so a long Expert reply should visibly need fewer `Continuing…` cues than before the fix

### CHAT-SLOTS-V2 — Named chat slots (P0)

- [ ] **CHAT-SLOTS-V2-01** D-pad **Down** from tab strip (or Ask) reaches the slot row; **Down** from row reaches unified input; **Up** returns toward tabs; row is quiet at rest; with one slot, ghost neighbours hidden
- [ ] **CHAT-SLOTS-V2-02** `[+]` creates a slot; **A** on title opens rename; **Right** → **×** → ConfirmModal deletes; focus returns to row after each modal
- [ ] **CHAT-SLOTS-V2-03** Ask in slot A → **LB/RB** to slot B mid-Ask → reply lands in **A**; reopen A — both Q and A present
- [ ] **CHAT-SLOTS-V2-04** Close QAM mid-Ask → reopen → pending question visible (not empty transcript)
- [ ] **CHAT-SLOTS-V2-05** With row focused: **LB/RB** cycle slots; blur row → **LB/RB** switch tabs — repeat with a game running and without; record P-0 result in [major-redesign.md](major-redesign.md) § 7 R1
- [ ] **CHAT-SLOTS-V2-06** Carousel stops at `[+]` and at last slot (no wrap); dots track active slot at cap of 5

---

## Tier 3 — Heavy manual

| Block | Notes |
|-------|-------|
| **QAMP on-Deck** | See § QAMP below — [Verify](roadmap.md#verify) |
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
| 0 | Preview Pass — **DOM/focus asserts invalidated 2026-08-08** | 2026-05-26 / 9e20a82 | Re-baseline pending. The RPC and shell steps stand; the DOM, focus-path and screenshot evidence does not — see [testing.md § Preview-suite evidence invalidated](testing.md#preview-suite-evidence-invalidated-2026-08-08). **SMOKE-A's PASS was purely vacuous.** Formal on-Deck Pass → QA backlog |
| 1 | Preview Pass — **DOM/focus asserts invalidated 2026-08-08** | 2026-05-26 / 9e20a82 | Re-baseline pending; same scope as Tier 0 above |
| 2 | Partial | 2026-06-09 / a9237e4 | |
| 3 | Open | | QAMP matrix deferred |
| 4 | Deferred | | Clean install before tag |

---

## Prompt-testing (qualitative)

Broader matrices beyond Tier 0–1 smokes are **deferred** ([Verify](roadmap.md#verify)). Prefer: one smoke per area over long prompt lists. Old Tier 1 prompt checkboxes: [archive/testing-full-pre-2026-07-30.md](archive/testing-full-pre-2026-07-30.md).
