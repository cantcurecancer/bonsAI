# bonsAI Roadmap

**Next:** [Bugs](#bugs) → [Verify](#verify) → lowest ★ in your lane.

Tracks open defects ([Bugs](#bugs)), on-Deck confirmation ([Verify](#verify)), and the themed backlog ([Backlog](#backlog)). Shipped work: [archive/roadmap-completed.md](archive/roadmap-completed.md) · fixed bugs: [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md). Locked decisions: [audit/maintainer-decisions-locked.md](audit/maintainer-decisions-locked.md) (open **[D18](audit/maintainer-decisions-locked.md#d18--when-loading-settings-fails-four-values-keep-whatever-was-on-screen-bug-or-intent)**).

Setup: [troubleshooting.md](troubleshooting.md). QA: [testing.md](testing.md), [testing-manual.md](testing-manual.md). Release: [development.md](development.md), [CHANGELOG.md](../CHANGELOG.md).

Star ratings use the GTA scale: `★` easiest … `★★★★★` very high complexity; `★★★★★★` extreme scope. Within each list: **ascending stars**; ties alphabetical.

---

## Bugs (v0.5.0 fixes — LB/RB tab switch, thinking blurbs single-writer, streaming reveal tweaks, asked-entity extraction, KB phrase gate / D16, session RAG chip RPC, source attribution on chips, soft num_predict → Verify, …)

Status tags: **OPEN** · **PARTIAL**.

- ★ **Question Overlay Alignment Drift** — **OPEN.** 3-line question overlay has minor horizontal spacing mismatch vs native `TextField` internals.
- ★ **Strategy spoiler false-positive** — **PARTIAL.** Options 1+2+4 landed 2026-08-07. **Fixed 2026-08-15:** the mid-stream mask chip (R4) no longer flashes for a fence the turn already qualifies to unwrap — `prepareStreamMarkdown` now accepts an `unwrapOpenSpoilerFence` callback built from the same eligibility gate as the closed-fence unwrap, so a qualifying fence streams as prose from the first token instead of masking until it closes. **STRAT-SPOIL-DRG-01** on Deck remains — only the three ship-gate rows (DRG-01, DRG-01d, DRG-01b/c). Detail: [04-strategy-spoiler-false-positive.md](planning/04-strategy-spoiler-false-positive.md), [spoiler-constitution.md](planning/spoiler-constitution.md).
- ★ **Unified input + Ask bar no longer span QAM width** — **FIXED 2026-08-16, verified on-Deck by measurement.** Root cause was **not** the measurement loop and **not** Steam's outer chain: Steam ships **hashed class names** on the current build, so `[class*="PanelSection"]` matches **0 elements** inside the QAM (and `.decky-qam-scope` does not exist either). Every `PanelSection` reset in [section-3.ts](../src/styles/sections/section-3.ts) — including the `padding-left/right: 0` one written for exactly this — has therefore been silently inert, leaving that element's `padding: 0 16px` in force on every Main row. `_TabContentsScroll` survives as a literal, which is why that one reset did work and masked the problem. Fix reaches the element **by structure** (`div:has(> .bonsai-full-bleed-row)`) so it cannot rot when Steam rehashes; `:has()` verified supported on the Deck's CEF in the same run. **Measured before → after** with `scripts/probe_deck_ask_row_width.py`: unified host and Ask row went `x=63.99 w=268.02` → `x=48 w=300`, matching the `_TabContentsScroll` column exactly; **V1 `15.99px` each side → `0px`**; 32px reclaimed, +11.9% row width. Earlier passes that were necessary but not sufficient: `BONSAI_PLUGIN_SIDE_PAD_PX` 4 → 0, the Ask row's measured-px width replaced by `width: 100%`, and Decky's `TextField` `.Panel.Focusable` wrapper forced to fill the glass card. `useQamPanelSideBleed` (added the round before) is a **no-op on this build** — the probe shows every ancestor above the scope already at zero padding; it is kept as a guard for a Steam build that adds one, and its debug-ring entry says whether it found anything. Previous status text follows for history. — **PARTIAL.** Preset chips, unified-input textarea and Ask bar all render inset from the QAM panel edges (regression window `40f396f`) — maintainer confirms this happens whether or not the AI character avatar is on, and a 2026-08-15 device screenshot (`DeckCapture_20260815_233506_game.png`) shows all three rows sharing the same left/right gap, so the cause is an **ancestor inset**, not the per-row measurement. **Landed 2026-08-15:** every inset bonsAI itself contributed is now zero — `BONSAI_PLUGIN_SIDE_PAD_PX` 4 → 0 (the `TabContentsScroll` side pad, the only one in our CSS), explicit `padding: 0` on `.bonsai-scope`, and `padding: 0` on `.decky-qam-scope:has(> .bonsai-scope)`, the last ancestor we can name without touching other plugins. **Landed 2026-08-16**, after the maintainer reported the chips now reach the edges while the textarea and Ask button did not — which is the differential that identified the cause, since the chips are plain `width: 100%` and those two were the only rows that were not. (1) **The Ask row no longer has a measured width.** It was `--bonsai-askbar-outer-width` (host width − 1px, sampled in `useUnifiedInputSurface`) plus a `--bonsai-ask-margin-left` correction, so any sample taken mid-carousel, at first paint, or before a padding change settled froze it narrower than its neighbours. It and the unified host are sibling `PanelSectionRow` children of one column, so both are `width: 100%` now and match by construction; all three vars, both tuning constants (`ASK_BAR_ROW_WIDTH_EXTRA_PX`, `ASK_BAR_LAYOUT_SHIFT_RIGHT_PX`) and the imperative width writes are deleted. The hook still measures the field's painted bounds — the caret overlay genuinely needs that and it is not derivable from CSS. (2) **Decky's `TextField` wrapper now fills the glass card.** Decky renders the field inside a `.Panel.Focusable` that does not inherit host width — the original reason the measuring existed. section-4 already forced that wrapper to 100% inside the Ask row; the input host never had the matching rule, so the typing surface was narrower than the card holding it. Added in two forms (a `:has(textarea)` rule and a positional child-combinator rule) so it does not depend on `:has()` support, both scoped to exclude the ask-mode/attach popovers, which are also `.Panel.Focusable` inside that host. **Landed 2026-08-16 (3):** the last gutter was Steam's own ancestor chain above `.decky-qam-scope`, which no bonsAI selector can name. `useQamPanelSideBleed` walks the real chain from `.bonsai-scope` up to **and including** the QAM tab pane and zeroes horizontal padding plus fixed side margins on each node — the same walk `useQamPanelHeightGuard` already does for height, reusing its exported `findQamTabHost`. Bounded deliberately: it stops at the pane (an unbounded walk would strip Steam's own chrome), leaves `auto` margins alone (those centre the panel — zeroing would slide it, not widen us), writes no inline style when a node is already flush, and bails entirely when the pane is not found. Re-applies on pointer/resize because Steam swaps the pane on tab switch and takes inline styles with it. It logs what it reclaimed once per session under `ASK-WIDTH-01`, so a surviving gap is diagnosable from the debug ring without a probe run. 5 unit tests pin the walk boundary and the `auto`-margin case. **If a gutter still survives**, `scripts/probe_deck_ask_row_width.py` **V0** names the exact ancestor and how much it eats. Files: [constants.ts](../src/features/unified-input/constants.ts), [scopeBase.ts](../src/styles/sections/scopeBase.ts), [section-3.ts](../src/styles/sections/section-3.ts), [useUnifiedInputSurface.ts](../src/features/unified-input/useUnifiedInputSurface.ts), [probe_deck_ask_row_width.py](../scripts/probe_deck_ask_row_width.py).
- ★★ **Focus ring consistency** — **PARTIAL.** `BonsaiModalScope` on portalled modals shipped; blanket `button.gpfocus` rule reverted (native Steam outline preferred). **Fix lean:** modal CSS reach + real `Focusable`s — see [gamepadAndPullModels.ts](../src/styles/sections/gamepadAndPullModels.ts).
- ★★ **Fullscreen pickers return you to the right tab, but not to the right control** — **PARTIAL (1/3 on-Deck).** `modalReturnFocusRegistry` shipped; Models hub → Ollama and desktop-note → Main land on tab strip. **PICKER-FOCUS-01**; next step is instrumentation, not another guess.
- ★★ **Live Ask user bubble shows "…" after reopen** — **OPEN.** User question header empty after QAM close / Steam restart; answer intact. Likely `askThreadDisplayQuestion` lost on session survival. [MainTabChatTranscript.tsx:381](../src/components/MainTabChatTranscript.tsx).
- ★★ **Live-turn transparency UI missing after successful Ask** — **OPEN.** Verify **CONTEXT-LADDER-01** on Deck.
- ★★ **Main tab answer D-pad scroll choppy / multi-line jumps** — **OPEN — re-measure first.** Phase B (2026-08-07) made every answer section a D-pad stop; scroll-step is fallback only. **STREAM-09**, **D-PAD-SCROLL-02** in [testing-manual.md](testing-manual.md).
- ★★ **Model routing try-order modal focus + chrome** — **OPEN (deferred polish).** `ModelRoutingOrderModal` D-pad lands on leaf Up/Down; chrome mismatches other fullscreen pickers. Screenshot `DeckCapture_20260730_144925`.
- ★★ **No destructive-advice guardrail (compatdata / prefix deletes)** — **OPEN.** No production guardrail against reckless compatdata deletes. **Fix lean:** output-side filter on Ask reply path — [12-deep-mod-ai-hints-feasibility.md](planning/12-deep-mod-ai-hints-feasibility.md) § 5.3.
- ★★ **Strategy live-turn D-pad graph skips branches/feedback** — **OPEN.** Verify **MICRO-04** on Deck.
- ★★★ **AppID collision: OoT/SoH seed row uses real Stardew Valley AppID** — **OPEN.** `data/kb/strategy_seed.json` game_id 1 (OoT) carries `app_id: "413150"`, which is Valve's actual Stardew Valley AppID — confirmed as Stardew Valley in [12-deep-mod-ai-hints-feasibility.md:136](planning/12-deep-mod-ai-hints-feasibility.md). A Stardew Valley player matches the OoT row and inherits its cards, genres, and `PROTECT_PROGRESSION_APP_IDS` fencing; OoT/SoH itself never benefits, since SoH is a non-Steam shortcut and already resolves correctly through the `shortcut_name` alias path (`ship of harkinian` → `game_id:1`, independent of `app_id`). **Fix lean:** null `app_id` for game_id 1 (mirror State of Emergency's `app_id: null` + alias pattern), drop `"413150"` from `PROTECT_PROGRESSION_APP_IDS` in both [spoiler_title_profiles.py](../py_modules/backend/services/spoiler_title_profiles.py) and [spoilerTitleProfiles.ts](../src/data/spoilerTitleProfiles.ts), add an OoT/SoH name fallback so protection doesn't regress, and pass `app_name` into `spoiler_risk_service.py`'s currently AppID-only call. 18 files reference the id; `tests/fixtures/kb_eval_v2.json` rows need the same shortcut-keyed conversion already used for SoE — coordinate with maintainer before touching it, since the RAG PR2 bake-off report was measured against current ids.
- ★★★ **Character picker: focus ring invisible, D-pad does not move** — **OPEN (selection fixed).** Modal uses `querySelector` focus helpers — fix CSS reach first, then registered-owner pattern. Blocks AI-character on Deck. [CharacterPickerModal.tsx](../src/components/CharacterPickerModal.tsx).
- ★★★ **Fullscreen picker D-pad edge-escape (audit)** — **OPEN.** Audit Pull Models, Character picker, models hub, other `showModal` pickers for below-list / above-list escape.

---

## Verify (v0.5.0 QA owed — Wave 1 voice/icon/thinking rows, STREAM-09, KB-CANCEL-01, SHELL-PAYLOAD-01, KB-ROUTER-01 / KB-ASKMODE-01, …)

Code-fixed or shipped; on-Deck / qualitative QA still owed. Detail: [testing.md](testing.md), [testing-manual.md](testing-manual.md). Full writeups: [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).

- ★★★ **Soft** `num_predict` **+ thinking budget** — shipped 2026-08-10; **02 Verified, 01/03/04 Partial (automated, on-Deck confirm owed), 05 Open** (needs a real thinking model). Caps Speed 800 / Expert 1200 / Strategy 1600; soft continue on `done_reason=length` (max 2) with ephemeral **`Continuing…`**; C1 budgets in `ollama_ask_budgets.py` (`think: false` default). **Fixed 2026-08-15:** the cap table was keyed `deep` — the mode's pre-2026-06-26 name — so Expert silently ran on the Speed cap (800, not 1200) since the caps shipped; **EXPERT-CAP-01**. **Fixed 2026-08-15:** Stop landing within 120ms of the cue could persist `Continuing…` into the saved reply — `_update_partial_response`'s throttle dropped the cue-clear write; now a shrinking partial always bypasses the throttle, plus a client-side `stripSoftContinueCue` backstop. Unblocks **Thinking effort control**. Detail: [16-soft-num-predict-thinking-budget.md](planning/16-soft-num-predict-thinking-budget.md).
- ★★★ **Kids master lock** — shipped 2026-08-09; on-Deck **KIDS-LOCK-01**, **KIDS-FOCUS-01**, **KIDS-REGRESS-01** (and **KIDS-LOCK-02** if child account) Open. Live CEF Stage 0 confirmation still owed.
- ★ **Developer toggle for "resume last tab" (D15 B)** — shipped 2026-08-04; **TAB-RESUME-MODE-01**, **TAB-RESUME-FOCUS-01** Open/Partial.
- ★ **Install voice engine button when already ready** — fix landed 2026-08-07 (Wave 1 B); **VOICE-REINSTALL-01**. [wave1.md](wave1.md).
- ★ **Static seed tells you to enable KB when it is already on** — fixed 2026-08-07 (Wave 2 F); **PRESET-KB-SEED-01**.
- ★ **Thinking blurb italicizes emojis** — fix landed 2026-08-07 (Wave 1 A); **THINKING-EMOJI-01**. [wave1.md](wave1.md).
- ★ **Thinking line vanishes mid-Ask (lazy status tag)** — fix landed 2026-08-08; **THINKING-SANITIZE-01**. [06-thinking-blurbs-review.md § 10.1](planning/06-thinking-blurbs-review.md#101-landed-2026-08-08--7-items-13).
- ★ **~22% of Asks show bare emoji for every phase change** — fix landed 2026-08-08; **THINKING-EMOJI-CLUSTER-01**.
- ★ **Bonsai pot ~1px right of canopy (tab + plugin-list icon)** — fix landed 2026-08-07 (Wave 1 D); **BONSAI-ICON-GEOM-01**. [wave1.md](wave1.md).
- ★ **Token streaming stutters once at start** — fix landed 2026-08-07 (Phase A); **STREAM-REVEAL-01**. [05-token-streaming-review.md § 3.1](planning/05-token-streaming-review.md).
- ★ **A finished voice install survives "Clear all plugin data"** — **VOICE-CLEAR-01** Partial (backend verified; UI half open).
- ★ **VAC / `bonsai:vac-check` (Phase 1) — on-device QA** — implementation complete; finish **VAC-02…06** after Tier 0 **SMOKE-F** passes.
- ★★ **Asked-entity extraction (player typing patterns)** — fixed 2026-08-09; **STRAT-ENTITY-01**.
- ★★ **Device QA — Tier 0–1** — execute Tier 0 smokes (SMOKE-A, C, F) then Tier 1 (SMOKE-B, E, H); update coverage with Pass / Partial / Fail + build id.
- ★★ **KB compat retrieval phrase gate** — fixed 2026-08-06 (**D16**); **KB-ROUTER-01**. [audit/rag-pr2-signoff.md](audit/rag-pr2-signoff.md) § 2.
- ★★ **Prompt testing pass** — broader systematic validation beyond shipped prompt-testing MVP matrices.
- ★★ **Session context header is not D-pad focusable** — fixed 2026-08-04; confirm on-Deck.
- ★★ **Thinking blurbs — three writers disagree** — fix landed 2026-08-08; re-verify **THINKING-COPY-01**, **THINKING-SLOW-01**, **THINKING-LIVE-01**, **THINKING-SPOILER-01**. [06-thinking-blurbs-review.md § 10](planning/06-thinking-blurbs-review.md#10-implementation-log).
- ★★ **Your tab is not remembered when you leave and reopen** — **TAB-RESUME-01** Partial (tab + scroll restore; focus-after-reopen separate).
- ★★ **Wave 4 G slider direction handlers** — Deck-check: **ONBUTTONDOWN-AUDIT-01** (distinguish nothing happens vs double-step; cover Ollama keep-alive, Reply verbosity, Connection timeout sliders).
- ★★★ **D11 legacy-loader shim removal** — **D11-SHIM-01** Partial (RPC probe ok; Main-tab Ask UI pass open).
- ★★★ **KB download Cancel** — shipped 2026-08-05; **KB-CANCEL-01** (D-pad reach while downloading).
- ★★★ **QAMP verification checklist** — per-game profile on/off, QAM Performance reopen, Steam restart/reboot, GPU-clock paths. [testing-manual.md](testing-manual.md) § QAMP.
- ★★★ **Source attribution on knowledge chips** — shipped 2026-08-09; **KB-ATTRIB-01**. Distribution still → Phase 6 / [15-corpus-licensing-attribution-plan.md](planning/15-corpus-licensing-attribution-plan.md).
- ★★★★★ **Global quick-launch macro** — Guide-chord docs in [troubleshooting.md](troubleshooting.md) §5; verification checklist not run on hardware.
- **D-pad reachability sweep blind spot (2026-08-04)** — cross-file nested `Focusable` (spoiler fence) not visible to per-file static analysis; answer on-device per [testing-manual.md](testing-manual.md) focus rows.
- **Reply-language snapshot RPC (2026-08-03 fix)** — verified via `probe_deck_rpc_surface.py`; UI translation spot-check optional.
- **Session RAG / routing merge RPCs (2026-08-02)** — **SESSION-RAG-CHIPS-01** Verified; **ROUTING-MERGE-01** Open.
- **Shell state + tab payload extractions (step 8)** — **SHELL-PAYLOAD-01** Open. Smoke: six tabs, one Ask, Ollama tab after Clear all plugin data.
- **Token streaming Phase B — multi-stop navigation + scroll follow (2026-08-07)** — **STREAM-09**, **STREAM-FOLLOW-01** Open. [05-token-streaming-review.md § 3.2](planning/05-token-streaming-review.md).
- **Voice input `status()` missing (2026-08-03 fix)** — on-Deck retry of live recording still needed. [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).

---

<a id="planned"></a>

## Backlog

Stars are **effort/risk**. Grouped by **theme**; within each lane sorted ascending by ★.

**GitHub tracking:** Items rated **★★★★★** or **★★★★★★** include a placeholder link to **[bonsAI Issues](https://github.com/qd313/bonsAI/issues)** (replace with a specific issue URL when created).

### Ask / reply (v0.5.0 — token streaming live markdown, spoiler confidence chip, spoiler constitution runtime, thinking blurbs, reply-language / routing merge RPCs, Caveman reply style, …)

- ★ **Intent packs later review** (keep / quiet / Developer)
  - **Goal:** Decide whether quiet intent-pack search aliases should be deleted, left quiet, or revived under Developer.
  - **Not in scope:** re-shipping Proton journal inject without redesign.
- ★★ **Copy reply to clipboard** (reply micro-action)
  - **Goal:** One reply action copies visible answer text to host clipboard.
  - **Depends on:** shipped reply micro-actions + read clipboard pattern. Spike Wayland selection ownership first.
  - **Source:** [13-roadmap-feature-ideas.md](planning/13-roadmap-feature-ideas.md) A2.
- ★★ **Preset chip expansion** (incremental content)
  - **Goal:** Add or refresh preset strings as related features land. Wave 1 shipped four prompts; **PRESET-EXPAND-W1-01** open. [wave1.md](wave1.md).
  - **Not in scope:** replacing `fade` default animation; session RAG chips (shipped).
- ★★ **Thinking effort control** — **Phase 1 shipped 2026-08-15; Phase 2 Backlog**
  - **Phase 1 (shipped):** Ollama tab → **Thinking** row, Off / Brief / Balanced / Deep, defaulting **Off**. Sends `think: true` for all three on levels — named levels are gpt-oss-only and qwen3 / deepseek-r1 reject a string (**D21**, superseding doc 16) — with effort carried by the reserved budget (256 / 512 / 1024) added to `num_predict`. A model that cannot think gets one silent retry with thinking off, is remembered for the session, and the user is told once. On-Deck **THINK-EFFORT-04**, **THINK-EFFORT-05** Open.
  - **Phase 2 (Backlog):** Short thinking one-liners via existing blurbs (not raw model `thinking` by default).
  - **Not in scope:** Reply verbosity → token budgets; caveman / lowering `num_predict`; native gpt-oss levels (needs per-model capability detection — see D21).
- ★★ **Unfenced spoiler feedback** (thumbs-down category)
  - **Goal:** Thumbs-down refinement chip for unfenced spoilers (and optional over-fenced sibling).
  - **Depends on:** reply micro-actions; spoiler confidence chip (shipped).
  - **Related:** [spoiler-constitution.md](planning/spoiler-constitution.md).
- ★★ **User-adjustable spoiler fencing** (hide by risk band)
  - **Goal:** Settings control for tap-to-reveal / fence masking by estimated risk band.
  - **Depends on:** spoiler confidence chip; shipped `strategy_spoiler_masking_enabled`.
  - **Related:** [spoiler-constitution.md](planning/spoiler-constitution.md).
- ★★★ **Custom model in Pull Models picker** (custom pull + Ask pin + New badges)
  - **Goal:** Pull any valid Ollama-library tag; **Use for Ask** pin; **New** badge (≤30 days).
  - **Depends on:** shipped Pull Models picker + living overlay merge.
  - **Not in scope:** LAN/remote `ollama pull` (→ **LAN custom model pull**).
- ★★★ **Dynamic keep-alive / smart unload** (research spike)
  - **Goal:** Research-only: hold models loaded vs unload when a game takes focus on Deck APU? Spike decides go/no-go.
  - **Not in scope:** production unload before spike doc.
- ★★★ **Per-mode latency timeouts** (warn vs hard limit profiles)
  - **Goal:** Separate warning and timeout values per selected mode.
  - **Depends on:** Mode selector (shipped).
- ★★★★ **Connection doctor** (guided first-Ask repair — candidate)
  - **Status:** Candidate, not accepted — decide vs **Deck health snapshot** (shared probe set).
  - **Goal:** **Fix this** on Ask failure walks probes → one next action with Ollama-tab deep link.
  - **Source:** [13-roadmap-feature-ideas.md](planning/13-roadmap-feature-ideas.md) § B3.
- ★★★★ **LAN custom model pull** (remote host — decision review)
  - **Goal:** LAN Ask host: add/pull models not in catalog — blocked until mechanism chosen (R1–R4).
  - **Depends on:** **Custom model in Pull Models picker**.
- ★★★★ **Session context and user stash** (deck-first context)
  - **Goal:** Live session facts + user-editable stash notes for Ask; no embeddings/cloud.
  - **Not in scope:** vector DBs; cloud sync.
- ★★★★★ **Deck health snapshot** (full diagnostics + Ollama)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Read-only diagnostics dump to Desktop; Magic Ask `bonsai:diagnostics`.
- ★★★★★ **Local reply TTS** (Phase 1–2 character voice)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Phase 1 offline TTS play/stop; Phase 2 character-aligned read-aloud (legal gate).
- ★★★★★ **Named chat slots** (labeled threads — redesign only)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Up to 5 named, persistent chats with Main-tab LB/RB carousel (option C). Do not re-ship old mini-list picker.
  - **Status:** Code landed 2026-08-09 (storage, RPC, row UI). **On-Deck QA open** — all **CHAT-SLOTS-V2-01…06** must pass before Completed. **P-0 bumper spike** result still pending on device ([major-redesign.md](major-redesign.md) § 7 R1).
  - **★★★★ BUG found 2026-08-16 — nothing persists on device.** Every Ask logs `chat_slots: no slot for request_id=N — assistant turn dropped`, and the v2 store `chat_slots/` has never been created on the QA Deck (only the pre-v2 `chat_threads/`, last written 2026-07-17). The slot id is parsed from the question text at [main.py:2655](../main.py) and both turns are recorded only inside `if chat_slot_id:` — so when the frontend sends no id the user turn is dropped silently and the assistant turn loudly. Found from the log during KB QA, not by a slots test. Detail: [testing.md](testing.md) CHAT-SLOTS-V2 row.
  - **Design:** [major-redesign.md](major-redesign.md), [07-named-chat-slots-postmortem.md](planning/07-named-chat-slots-postmortem.md).
- ★★★★★ **On-Deck model benchmark** (measured routing order)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Rank installed models by measured speed/completion; offer as try order (with confirmation).
  - **Depends on:** shipped routing pickers; overlaps **Dynamic keep-alive** measurements.
  - **Source:** [13-roadmap-feature-ideas.md](planning/13-roadmap-feature-ideas.md) § C1.

### Focus / Deck UI (v0.5.0 — LB/RB overflow clip, QAM ResizeObserver rebind, global document sweep, onButtonDown audit, ask-bar caret + avatar, permission jump, modal return-focus registry, …)

- ★★★ **Search density UX** (match emphasis + tighter rows)
  - **Goal:** Tighter, more scannable search results with highlighted match tokens.
- ★★★★ **SteamOS Share path** (capture → attach)
  - **Goal:** Faster path from SteamOS Share / capture flows into screenshot attach where APIs allow.
- ★★★★ **SteamOS spin hint card** (immutable spins)
  - **Goal:** Detection + deep link to troubleshooting for immutable spins.

### Knowledge base (v0.5.0 — hybrid RRF + schema v3, D16 topic router, D17 mode-independent game tips, 13-title / 119-card seed, wiki attribution, KB download Cancel, session RAG chips, hybrid kill-switch, …)

- ★★★ **KB visual maps** (strategy maps — later wave)
  - **Goal:** Optional visual strategy maps in KB-grounded replies after brief callout cards exist.
  - **Plan / depends on:** [17-kb-online-versus-strategy-content.md](planning/17-kb-online-versus-strategy-content.md) Stage 5; callout cards (OV-3.1). Phase 4 chip work remains orthogonal.
- ★★★★ **KB online / versus strategy content**
  - **Goal:** Online multiplayer strategy — versus, co-op, map callouts — new `section_type` values + spoiler table updates. Tier lists parked. Visual maps later wave in same plan.
  - **Plan:** [17-kb-online-versus-strategy-content.md](planning/17-kb-online-versus-strategy-content.md) (discovery locked 2026-08-09).
  - **Source policy:** WikiTeam / archive.org dumps only; hybrid attribution (short chip + snapshot in `ATTRIBUTIONS.md`).
- ★★★★ **RAG Deck query — corpus expansion (Phase 5)**
  - **Goal:** Corpus maturity after Phase 4 sample paths; session chip vector ranking.
  - **Status:** Seed deepening largely in remediation PR2; remainder depends Phase 4. [knowledge-base.md](knowledge-base.md) § Phase 5.
- ★★★★ **RAG Deck query — extended retrieval (Phase 4)**
  - **Goal:** Richer retrieval shapes — chip visibility, structured cards, per-game compat tips.
  - **Status:** Discovery locked 2026-07-30; docs only. [knowledge-base.md](knowledge-base.md) § Phase 4.
- ★★★★ **RAG Deck query — public publish (Phase 6)**
  - **Goal:** First public versioned corpus + manifest after Phase 5 + legal scrub.
  - **Status:** Legal scrub **DONE** 2026-08-09 (plan 15, Stages 1–5); **D20** (2026-08-14) reopened D19 to include ShareAlike sources, corpus ships as one CC BY-SA 4.0 work. Packaging/publish tooling **DONE** 2026-08-14: `scripts/publish_corpus.py` (license gate + manifest self-consistency check, verified against a real build), `tests/test_rag_corpus_download.py` (10 tests — the download path had zero coverage before this), stable `qd313` HF/GitHub addresses (`knowledge_base_schema.py`), UI copy corrected (removed dev-only placeholder text, fixed the "~5 GB" claim — real corpus is ~1 MB). Fixed along the way: a live repo-identity hole (stale `cantcurecancer` GitHub username used at runtime by the corpus manifest fetch and the Pull Models overlay — now `qd313` everywhere), a Windows `os.statvfs` crash in the download path, and a cancel-state bug where cancelling a download orphaned the running task's progress reference. **First public push DONE 2026-08-14** — HF dataset `qd313/bonsai-knowledge-base` and GitHub release `knowledge-base-v1` are both live; published corpus version `2026.08.14`, `compressed_sha256` `081af237…`, 758507 bytes, schema v3, embeddings populated (117 section / 124 compat). **Verified on a real Deck 2026-08-15** — live HF download completes and passes the sha gate; GitHub mirror failover returns the same version and sha; installed corpus reports 13 games / 117 sections / 124 tips with all vectors; **KB-ATTRIB-02 Verified** (`ATTRIBUTIONS.md` beside the DB, its source list matching what actually attaches); retrieval 7/7 on-device with the hybrid path live (~60 ms embed via Deck-local Ollama) and the cross-game leak guard holding. **UI half CLOSED on-Deck 2026-08-16** (build `6329577`) — run against a Deck still holding `2026.08.14`, so the version-compare Update was genuine: Update → progress row → `2026.08.16`; second Update correctly a no-op; Remove → storage picker → first install; Strategy Ask attaches cards. The SD-card storage option was exercised as a side effect and both installs *and* serves retrieval. **KB-SMOKE-01 / KB-DOWNLOAD now Verified — Phase 6 exits.** One row does **not** come with it: **KB-CANCEL-01** is *not testable as written*, because a 758 KB corpus installs in ~0.9 s and leaves no cancel window; it needs a throttled link or a dev-only delay before it can ever be run. **Reproducibility fixed 2026-08-15:** `_seed_strategy_corpus` stamped `crawled = _utc_now()` into the 58 maintainer-authored rows, so every rebuild changed `db_sha256` (three builds on 2026-08-14 gave 758505 / 758506 / 758507 bytes). Those rows were never crawled from anywhere and the attribution generator already skips url-less rows, so the stamp had no consumer — it now writes empty, and a row citing a `source_url` without a `crawled_at` fails the build rather than being silently backdated. Two consecutive builds now produce identical `db_sha256`. Guarded by `tests/test_build_rag_reproducible.py`. **Open call CLOSED 2026-08-16 — republished.** The `2026.08.14` artifact predated the reproducibility fix and could not be rebuilt from source, so the maintainer took the version bump: point release **`2026.08.16`**, `compressed_sha256` `34bff336…`, 758502 bytes, schema v3, 117 section + 124 compat vectors. Two consecutive `--seed` builds gave an identical `db_sha256` (`019acc7c…`) and an identical artifact before it was pushed; `publish_corpus.py --check` passed the D20 licence gate; both channels were then re-read over the wire and both return `2026.08.16` with a payload hash matching the local build byte-for-byte. 750 backend tests green. **Bonus for QA:** any Deck holding `2026.08.14` now has a real version-compare **Update** to exercise, which was the weakest step in the remaining UI checklist. [knowledge-base.md](knowledge-base.md) § Phase 6 / Source attribution.
- ★★★★ **RAG Deck query — retrieval infra (Phase 7)**
  - **Goal:** Optional sqlite-vss/ANN, auto-pull nomic, RRF extensions, vision→KB, demote, packs, intent retrieval.
  - **Status:** FTS+vector shipped in remediation; remainder docs only. [knowledge-base.md](knowledge-base.md) § Phase 7.
- ★★★★★ **Community tip contribution** (corpus inbound path)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Reply → **Suggest as a tip** writes schema-valid card to Desktop + GitHub attach URL.
  - **Depends on:** **RAG Phase 6** public publish.
  - **Source:** [13-roadmap-feature-ideas.md](planning/13-roadmap-feature-ideas.md) § C2.
- ★★★★★★ **RAG Deck query — catalog corpus (Phase 8)**
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Large offline catalog after Phase 6 publish (~top 1000 Steam, ~100 Deck, emulated slice).
  - **Status:** Locked intent only. [knowledge-base.md](knowledge-base.md) § Phase 8.
  - **Depends on:** Phase 6 + likely Phase 7 infra.

### Permissions / safety (v0.5.0 — permission jump, spoiler constitution / named-entity consent, …)

- ★★★★ **Web permission** (Ask live search + online deps)
  - **Goal:** Opt-in capability for live web answers; offline Ask + local KB when off.
  - **Status:** Discovery locked; docs only. [web-permission-discovery.md](planning/web-permission-discovery.md).
  - **Depends on:** Capability Permission Center; Kids master lock (shipped — forces Web off when that key lands).
- ★★★★★ **QAMP Phase 2 profiles** (experimental Steam opt-in)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Status:** Backlog-only. Phase 1 verification in [Verify](#verify).
- ★★★★★ **VAC Phase 2 opponent IDs** (lobby/session API research)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Status:** Phase 1 complete; on-device QA in [Verify](#verify).
  - **Goal:** Surface live opponent Steam identities for ban checks when metadata allows.

### Platform / upstream (v0.5.0 — voice STT session daemon, …)

- ★★★★ **Llama.cpp provider spike** (Deck perf / replacement eval)
  - **Goal:** Research-only go/no-go vs Deck-local Ollama. Deliverable: `docs/archive/spikes/llama-cpp-provider-eval.md`. Prior: [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md).
- ★★★★ **Steam Input layout parse** (VDF → AI context)
  - **Goal:** Parse controller VDF configs for actionable control context.
  - **Not in scope:** editing/writing controller configs.
- ★★★★★ **Steam Controller copilot** (Ibex gen-2)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** AI copy tuned to gen-2 hardware + Steam Input–aligned suggestions.
- ★★★★★ **Wake-word listening** (beta; Deck first)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Opt-in always-on local wake **bonsAI** → STT → quiet Ask.
  - **Depends on:** Whisper voice Ask; Reply ready toast; Voice STT session daemon (shipped).
  - **Feasibility:** [10-wake-word-listening-feasibility.md](planning/10-wake-word-listening-feasibility.md).
- ★★★★★★ **Deep mod AI hints** (install paths + compatdata)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Detect mod frameworks/files; mod-aware AI guidance. [12-deep-mod-ai-hints-feasibility.md](planning/12-deep-mod-ai-hints-feasibility.md).
- ★★★★★★ **In-game answer surface** (no-QAM reply; overlay research)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Read answer without leaving game. Full overlay upstream-gated; unblocked slice: toast carries ~2 lines (suppress Strategy/fenced replies).
  - **Source:** [13-roadmap-feature-ideas.md](planning/13-roadmap-feature-ideas.md) § C3.
- ★★★★★★ **Native QAM shortcut tile** (under Decky; upstream research)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Separate QAM left-rail entry beneath Decky Loader icon.
  - **Feasibility:** [11-native-qam-tile-feasibility.md](planning/11-native-qam-tile-feasibility.md).
- ★★★★★★ **Remote Play diagnostics layer** (streaming host/client)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Streamed gameplay answers weight encode latency and host-vs-client fixes.
  - **Related:** noted (not folded) in [09-steam-frame-companion-feasibility.md](planning/09-steam-frame-companion-feasibility.md) § B8.
- ★★★★★★ **Steam Frame companion UX** (VR / LAN Deck)
  - **GitHub:** [bonsAI Issues](https://github.com/qd313/bonsAI/issues) — issue TBD.
  - **Goal:** Research-first companion workflows for Steam Frame. [09-steam-frame-companion-feasibility.md](planning/09-steam-frame-companion-feasibility.md).

---

## Appendix

### Cross-feature dependency summary

- **Mode selector (shipped)** → **Per-mode latency timeouts**; Strategy Guide path shipped as `strategy` Ask mode.
- **Character voice roleplay (shipped)** → accent intensity, avatars, UI accent theme, Random “?”, running-game suggestions, Pyro easter egg (all shipped); → **Local reply TTS** Phase 2.
- **Whisper voice Ask (shipped)** + mic → **Wake-word listening**.
- **Reply ready toast (shipped)** → required for hands-free wake when QAM closed; → **In-game answer surface** (toast snippet is the unblocked slice).
- **Capability Permission Center** → gates filesystem, Steam/Proton log + screenshot reads, mic, Steam Web API; → planned **Web permission** (Kids Lock forces off); → **Permission jump** shipped.
- **Llama.cpp provider spike** → research-only; related **Dynamic keep-alive / smart unload**.
- **Preset carousel (shipped)** → **Preset chip expansion**; **Session RAG preset chips** (shipped).
- **RAG / offline KB** → Phase 2–3 shipped → **retrieval quality remediation** (PR1/PR2 closed 2026-08-09) → Phase 4–8 Backlog; **KB visual maps** separate; **Spoiler constitution** runtime encoding shipped 2026-08-07; **Spoiler confidence chip** → fencing + unfenced feedback.
- **Web permission** → citations / allowlist / freshness chip.
- **Soft** `num_predict` **+ thinking budget** (shipped; Verify QA) → **Thinking effort control** (Phase 1 effort UI shipped 2026-08-15; Phase 2 blurb one-liners Backlog).
- **Native QAM shortcut tile** → shorter path than Guide-chord macro docs ([troubleshooting.md](troubleshooting.md) §5).
- **Steam Input jump Phase 1 (shipped)** → **Steam Input layout parse**.
- **Offline intent packs (quiet)** → **Intent packs later review**.
- **Deck health snapshot** ↔ **Connection doctor** — one probe stack, two presentations; decide before building either.
- **Session RAG chip candidates RPC (shipped)** → **KB coverage chip**; adjacent to **RAG Phase 4** Track 1 visibility.
- **User-owned model routing pickers (shipped)** → **On-Deck model benchmark**; overlaps **Dynamic keep-alive / smart unload**.
- **RAG Phase 6 publish** → **Community tip contribution**.
- **Permission jump** (shipped) → shared deep-link for **Connection doctor**.

```mermaid
flowchart TD
  modeSelector[ModeSelectorShipped] --> perModeProfiles[PerModeLatencyTimeouts]
  modeSelector --> strategyPath[StrategyAskShipped]
  strategyPath --> strategySafety[StrategySpoilersShipped]
  visionFeature[GlobalScreenshotsVision] --> strategyPath
  capabilityPermission[CapabilityPermissionCenter] --> modelPolicyTiers[ModelPolicyTiersShipped]
  capabilityPermission --> webPermission[WebPermission]
  kidsLock[KidsMasterLock] --> capabilityPermission
  kidsLock -->|forces off| webPermission
  webPermission -.->|may supersede zip| ragPhase6
  characterVoice[CharacterVoiceShipped] --> localTts[LocalReplyTts]
  whisperAsk[WhisperVoiceAskShipped] --> wakeWord[WakeWordListening]
  nativeQam[NativeQamShortcutTile] -.->|shorter path| macroDocs[GuideChordMacroDocsArchived]
  ragPhase3[RagPhase3Shipped] --> ragPhase4[RagPhase4]
  ragPhase4 --> ragPhase5[RagPhase5Corpus]
  ragPhase5 --> ragPhase6[RagPhase6Publish]
  ragPhase6 --> ragPhase7[RagPhase7Infra]
  ragPhase6 --> ragPhase8[RagPhase8Catalog]
  ragPhase7 -.->|helps scale| ragPhase8
  softBudget[SoftNumPredictBug] --> thinkingEffort[ThinkingEffortControl]
  capabilityPermission --> permissionJump[PermissionJump]
  permissionJump -.->|shared deep link| connectionDoctor[ConnectionDoctorCandidate]
  deckHealth[DeckHealthSnapshot] -.->|shared probe set| connectionDoctor
  ragChipRpc[SessionRagChipRpcShipped] --> kbCoverageChip[KbCoverageChip]
  ragPhase4 -.->|may absorb| kbCoverageChip
  routingPickers[RoutingPickersShipped] --> modelBenchmark[OnDeckModelBenchmark]
  ragPhase6 --> tipContribution[CommunityTipContribution]
  replyToast[ReplyReadyToastShipped] --> inGameSurface[InGameAnswerSurface]
```

### Implementation notes

#### Iconography pass — plugin list icon lesson

Decky sizes icons via CSS `font-size`. Font Awesome works because it renders `<svg width="1em">`. An `<img>` with fixed pixels is ignored. Fix: inline SVG into `<svg width="1em" height="1em" fill="currentColor">` (`BonsaiSvgIcon`). Source SVG needs `viewBox` for scaling.
