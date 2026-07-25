# bonsAI Roadmap

This document tracks **shipped** work (**[Completed](#completed)**), **active** engineering and QA (**[In Progress](#in-progress)**), and the **backlog** (**[Planned](#planned)**). Operational setup, firewalls, and vision tuning: [troubleshooting.md](troubleshooting.md). QA: [testing.md](testing.md) (run order, coverage, PR gates). Release process: [development.md](development.md), [CHANGELOG.md](../CHANGELOG.md).

Star ratings use the GTA scale: `★` easiest … `★★★★★` very high complexity; `★★★★★★` extreme scope.

---

## In Progress

Active features, maintainer tasks, and **known defects**. *QAMP Phase 1 (safe default) is [shipped](#ai-assisted-power-and-long-response-ux). Phase 2 (experimental profile sync) remains backlog-only.*

### Bugs

- ★ **Strategy spoiler false-positive:** Strategy replies sometimes wrap non-spoilery coaching (e.g. Glyphid Dreadnought boss tips) in `bonsai-spoiler` fences when the user did not opt in — tune spoiler policy / model fence heuristics so generic boss guidance stays visible by default.
- ★ **Question Overlay Alignment Drift:** The 3-line question overlay has minor horizontal spacing mismatch vs native `TextField` internals.
- ★★★ **Fullscreen picker D-pad edge-escape (audit):** Audit **Pull Models**, **Character picker**, **Ollama models hub**, and other `showModal` pickers for below-list / above-list escape (left from row → primary action; right from trailing control → Close).



### Active work

- ★★ **Device QA runbook — Tier 0–1:** Execute [testing.md](testing.md#device-qa-runbook) **Tier 0** smokes (SMOKE-A, C, F) then **Tier 1** (SMOKE-B, E, H); update [testing.md](testing.md) **Shipped feature coverage** and scenario checkboxes with **Pass / Partial / Fail** + build id. Tier 2+ ongoing before release.
- ★ **VAC /** `bonsai:vac-check` **(Phase 1) — on-device QA:** Implementation [complete](#steam-input); finish **VAC-02…06** in [testing.md](testing.md) (Tier 2) after Tier 0 **SMOKE-F** passes.

---



## Planned

Stars are **effort/risk** within bands (GTA scale in the header). Items below are grouped by **horizon** — approximate sequencing intent, not a commitment — and **within each horizon sorted by ascending star rating** (ties keep a stable reading order).

- **Near-term:** Incremental product work, QA-heavy passes, or **bounded** research spikes that do not require new Steam/Decky platform APIs.
- **Medium-term:** Larger features (**★★★★**–**★★★★★★** when retaining ecosystem brainstorm rows **E–H**) that stay mostly inside the plugin + user-hosted stack.
- **Long-term:** ★★★★★★ scope and/or ★★★★★ work **gated on upstream APIs**, undocumented Steam internals, or unusually broad surface area.

Maintainers may move items between horizons after discussion; if you want different definitions (e.g. time-boxed quarters), say so in an issue or PR.

**The April 2026 release-window requirements freeze has ended.**

**GitHub tracking:** Each **Planned** item rated **★★★★★** or **★★★★★★** includes a placeholder link to **[bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues)** for eventual per-feature tickets (replace with a specific issue URL when created).

**Planned titles:** Short **noun-first** label (about 3-6 words, roughly one line); put secondary context in **parentheses** (brainstorm letter, phase, platform, research spike, dedup). Spell out detail under **Goal** / **Primary work**, not in the title.

### Near-term

Within this section: ascending stars (★★ → ★★★ → ★★★★). Brainstorm letters **B**, **J–N**, **S**, **V**: [roadmap_feature_ideas plan](../.cursor/plans/roadmap_feature_ideas_f5560e15.plan.md).

- ★★ **Prompt testing pass** (beyond shipped MVP)
  - **Goal:** Broader systematic validation and tuning beyond the shipped doc MVP (see **Completed** → Prompt-testing MVP; working matrices in [testing.md](testing.md)).
- ★★ **Preset chip expansion** (streaming / LAN / Steam Input — incremental, N)
  - **Baseline shipped:** `PRESET_PROMPTS` in `[src/data/presets.ts](../src/data/presets.ts)` drives the main-tab carousel (advice-first strings, strategy mode switches, honest `beta: true` previews). See **Completed** → First-run and prompts — not a separate ship milestone.
  - **Goal:** Add or refresh preset strings as related features land (streaming perf, LAN/Ollama, Steam Input troubleshooting) — content tuning only.
  - **Primary work:** New/edited `PRESET_PROMPTS` entries + category alignment; no new carousel mechanics.
  - **Files:** `src/data/presets.ts`, optional docs cross-links.
  - **Depends on:** shipped preset carousel + category routing.
  - **Not in scope:** treating each string batch as a versioned feature ship. **AppID/session RAG dynamic chips** → **Session RAG preset chips** (separate Planned row).
- ★★★ **Per-mode latency timeouts** (warn vs hard limit profiles)
  - **Goal:** Separate warning and timeout values per selected mode.
  - **Primary work:** mode-keyed settings schema and runtime value resolution.
  - **Files:** `main.py`, `src/index.tsx`.
  - **Depends on:** **Mode selector (main screen)** (shipped).
  - **Not in scope:** per-game/per-model fine-grained profile matrix.
- ★★★ **QAMP verification checklist** (profiles / GPU / reboot matrix)
  - **Goal:** Verify behavior across per-game profile modes, QAM reopen, Steam restart/reboot, and GPU-related recommendations.
  - Verify behavior with per-game profile on/off.
  - Verify behavior after closing and reopening the QAM Performance tab.
  - Verify behavior after Steam restart and full reboot.
  - Verify behavior when prompt includes GPU clock recommendations.
- ★★★ **Custom model in Pull Models picker** (custom pull + Ask pin + New badges)
  - **Goal:** Let users pull any valid Ollama-library tag not yet in the curated/living catalog, opt it in for Ask via a global **Use for Ask** toggle, and spot recently released catalog models via a **New** badge (released within 30 days). Custom pull is a **backup** to the living overlay ([`data/pull-model-catalog-overlay.json`](../data/pull-model-catalog-overlay.json)); opening the picker triggers a **background catalog refresh** when overlay data is stale (e.g. >24h since last successful fetch).
  - **Primary work:** **Phase 1 — Pull UI:** footer **Add custom model…** → nested modal (`TextField` + validate + single-tag pull via existing `pull_ollama_models` / `_start_custom_ollama_pull` with `profile: "custom"`). Surfaces: [`PullModelsModal.tsx`](../src/components/PullModelsModal.tsx) fullscreen + [`OllamaModelsHubModal.tsx`](../src/components/OllamaModelsHubModal.tsx) embedded mode only. **Phase 1 — Ask pin:** per-row **Use for Ask** toggle on all rows; exactly one global preferred tag in settings (v1: same tag for Speed / Strategy / Expert); default **off** after successful custom pull; read-only line in Settings → Model policy (*Preferred model: `tag` — change in Browse models*). **Phase 1 — Routing:** prepend pinned tag when installed, then existing `select_ollama_models` chain + policy filter in [`ollama_ask_service.py`](../py_modules/backend/services/ollama_ask_service.py) / [`ollama_routing.py`](../py_modules/backend/ollama_routing.py); screenshot asks fall back to the vision chain with a clear status/transparency note when the pin lacks vision (no extra confirm). **Phase 1 — Unknown metadata:** minimal row for tags not in merged catalog; generic unclassified confirm; no stretch VRAM modal when size unknown; keep registry gate ([`ollama_catalog_service.py`](../py_modules/backend/services/ollama_catalog_service.py)). **Phase 1 — Discovery:** **New** badge when catalog `releasedYm` is within 30 days ([`pullModelCatalog.ts`](../src/data/pullModelCatalog.ts)); stale refresh on picker mount in [`usePullModelCatalog.ts`](../src/hooks/usePullModelCatalog.ts). **Phase 2:** full per-mode chain editor → future **Text model chains** row; custom pull should hook to seed top chain slot.
  - **Files:** `PullModelsModal.tsx`, new nested modal component, `OllamaModelsHubModal.tsx`, `usePullModelCatalog.ts`, `pullModelCatalog.ts`, `settings_service.py`, `settingsAndResponse.ts`, `settingsPayload.ts`, Model policy Settings panel, `ollama_routing.py`, `ollama_ask_service.py`, `main.py` (if RPC for pin persistence), `docs/testing.md` (D-pad + smoke when implementing).
  - **Depends on:** shipped Pull Models picker + living overlay merge ([`mergePullModelCatalog.ts`](../src/utils/mergePullModelCatalog.ts)); `pull_ollama_models` custom profile; Ask routing (`select_ollama_models` + `build_effective_models_to_try`).
  - **Not in scope:** LAN/remote `ollama pull` (see **LAN custom model pull**); Modelfile / `ollama create` UI; auto-append to maintainer overlay; full chain editor UI in v1; per-user “seen” badges; auto-pin after pull.
- ★★★ **Search density UX** (match emphasis + tighter rows)
  - **Goal:** Tighter, more scannable results: spacing, wider lines, incremental filtering, highlighted match tokens.
  - **Files:** `src/index.tsx`, prompt/search UX test notes.
  - **Depends on:** unified search indexing and response-state handling.
  - **Not in scope:** changing ranking semantics for unrelated search domains.
- ★★★★ **Llama.cpp provider spike** (Deck perf / replacement eval)
  - **Goal:** Research-only evaluation of whether **Deck-local llama.cpp** can beat **Deck-local Ollama** on resource cost for the same Ask quality, enough to justify a possible long-term **Ollama replacement** (maintainer cost must not outweigh wins). **No code** in this spike. Explicitly **supersedes** the 2026-05-20 Ollama-only go/no-go in [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md).
  - **Discovery locked (2026-07-17):** Baseline = Deck-local Ollama **gemma4 E2B**; spike recommends closest GGUF. Quality = envelope metrics only (TTFT, duration, tokens, context used, failures). **Go bar:** must win **both** game FPS hitch **and** peak GPU memory under load; VRAM-only wins with same GPU contest are no-go. Scorecard also records GPU busy/power (if readable), cold start→first token, warm tok/s, load/unload/keep-alive. Game load = **Deep Rock Galactic: Survivor** (fixed map/scene, pause OK, 3 runs/side). Lifecycle = sleep/resume with model loaded + long idle vs keep-alive (**match bonsAI Ollama keep-alive setting**). Measure text+stream+vision+load/unload on Deck; pull/catalog = document gaps only. Vision without peer GGUF: spike decides replacement no-go vs conditional dual-stack (still report text-only). Runtime under test = user-started server **or** noted packaging path — label which. UX cutover and model-mgmt options = recommend from evidence / list options+cost. Early abort only if streaming is unusable for Ask; ugly TTFT/chunk shape still finishes the matrix. Maintainer-cost weights: **must** API/Ask drift, support burden, dual-stack period; **should** binary/SteamOS/GPU matrix + model discovery; **note** test-surface growth.
  - **Primary work (when researching):** On-Deck measurement protocol + parity matrix; write [llama-cpp-provider-eval.md](archive/spikes/llama-cpp-provider-eval.md); banner on [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md) pointing to the new eval; go/no-go + phased path + likelihood×impact risk matrix.
  - **Expected output:** Superseding eval doc (go/no-go, phased path, risk matrix, GGUF recommendation, model-mgmt options+cost). Roadmap Files line then points at the eval doc.
  - **Files:** [docs/archive/spikes/llama-cpp-provider-eval.md](archive/spikes/llama-cpp-provider-eval.md) (to create), [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md) (supersede banner), this roadmap row.
  - **Not in scope:** Any production provider UI/code; LAN/remote llama.cpp; cloud APIs; Windows-only llama.cpp; embeddings/`nomic`; voice wake; shipping full production support.
- ★★★★ **Session context and user stash** (deck-first context; C)
  - **Goal:** Unified, **deck-first** context for Ask — no embeddings, no LAN companion, no cloud. Two lanes injected into the system prompt before mode/TDP tail: **(1) Live session context** — deterministic facts for *this turn* (running game/AppID, screenshot attachments, Proton/troubleshooting log excerpts when gated + relevant, TDP/sysfs snapshot when hardware topic applies); **(2) User stash** — user-editable plain-text notes (build URLs, ProtonDB tips, aliases) persisted on-device, optionally scoped per AppID, included when the user opts in or when a per-game stash matches the active title. Primary answer-quality path for **deck-only** and LAN users alike; explicit alternative to **RAG Deck query**.
  - **Primary work:** **Phase 1 — User stash:** storage schema + size caps; Settings editor; per-Ask include toggle; inject via `early_context_suffix` / dedicated block in `[build_system_prompt](../py_modules/backend/services/ollama_prompts.py)` (same splice documented for future RAG). **Phase 2 — Session bundle:** single assembly helper (e.g. `context_bundle_service.py`) that gathers live session slices from existing paths (`[game_ai_request.py](../py_modules/backend/services/game_ai_request.py)`, `[proton_troubleshooting_logs.py](../py_modules/backend/services/proton_troubleshooting_logs.py)`, attachment prep in `[main.py](../main.py)`); token/byte budget + truncation rules; **Input transparency** and optional Main-tab **context chip** listing what was attached (stash vs live).
  - **Files:** `py_modules/backend/services/ollama_prompts.py`, `game_ai_request.py`, `settings_service.py`, `main.py`; `src/utils/settingsAndResponse.ts`, Settings UI, `MainTab.tsx` / input transparency utils.
  - **Depends on:** shipped **Input handling transparency**; **Capability Permission Center** (media, filesystem/log reads); `[build_system_prompt](../py_modules/backend/services/ollama_prompts.py)` layer order.
  - **Not in scope:** embeddings, vector DBs, Chroma, outbound corpus ingest, multi-MB stash, cloud sync, auto web fetch (see **RAG Deck query**). Clipboard-only “append to Ask field” without system inject remains optional polish, not a separate ship line.
- ★★★★ **SteamOS Share path** (capture → attach, A)
  - **Goal:** Faster path from SteamOS **Share** / capture flows into screenshot attach or Ask context where APIs allow.
  - **Primary work:** research spike on Decky/SteamOS hooks; gated integration behind capabilities.
  - **Files:** `main.py`, `src/index.tsx`, [troubleshooting.md](troubleshooting.md).
  - **Depends on:** **media library access** patterns for screenshots (shipped capability lane).
  - **Not in scope:** kernel framebuffer hacks or unsupported private APIs as default.
- ★★★★ **SteamOS spin hint card** (immutable spins, M)
  - **Goal:** Detection + deep link to troubleshooting for immutable spins.
  - **Primary work:** lightweight OS hint probe + Settings or toast entry point.
  - **Files:** `main.py`, Settings or toast, [troubleshooting.md](troubleshooting.md) anchor.
  - **Depends on:** reliable benign signals (e.g. read-only root hints) without brittle parsing.
  - **Not in scope:** auto-fix firewall rules.



### Medium-term

Within this section: ascending stars (★★★★ → ★★★★★ → ★★★★★★). ★★★★★ entries share one band (alphabetical by title). Brainstorm **T**, **E–H**: [roadmap_feature_ideas plan](../.cursor/plans/roadmap_feature_ideas_f5560e15.plan.md). **E** does not depend on deferred **D** or **I**.

- ★★★★ **Named chat slots** (labeled threads, T — redesign)
  - **Goal:** Multiple labeled threads (e.g. “Elden Ring build”, “Network debug”) beyond single persisted QA — reduces overwrite friction without full cloud sync.
  - **Primary work:** thread id + label storage; UI to switch thread; Ask/reply scoped per slot. Prior mini-list / fullscreen picker pass deferred — redesign picker UX before re-ship.
  - **Files:** `main.py`, `src/index.tsx`, `settings_service.py`, persistence layer.
  - **Depends on:** unified Ask state machine.
  - **Not in scope:** cross-device merge or server-backed sync.
- ★★★★ **LAN custom model pull** (remote host — decision review)
  - **Goal:** When Ask uses a **LAN Ollama host**, let users add/pull models not in the bonsAI catalog without requiring Deck-local `ollama pull` — **blocked until mechanism is chosen**.
  - **Decision points (resolve before implementation):** **R1 — Instructions only:** Deck UI captures tag + shows copy/pull instructions for the PC host (no remote execution). **R2 — Pull on Deck while Ask uses LAN:** run `ollama pull` on Deck even when routing targets LAN (usually wrong topology; likely reject). **R3 — Remote execution:** new RPC/agent runs `ollama pull` on the LAN host (secure remote path; highest lift). **R4 — Pin/routing only:** custom add sets **Use for Ask** for tags already on the LAN host; pull remains out-of-band (Konsole/PC).
  - **Primary work:** spike + pick R1–R4; if R3, security review for remote subprocess; UI parity with Deck-local custom add where honest.
  - **Files:** `main.py`, `PullModelsModal.tsx`, `OllamaWhereAiRunsSection.tsx`, connection/LAN helpers, [troubleshooting.md](troubleshooting.md).
  - **Depends on:** **Custom model in Pull Models picker** (Deck-local v1); LAN connection test path ([`test_ollama_connection`](../main.py)).
  - **Not in scope:** choosing R1–R4 in this roadmap row; shipping without explicit mechanism sign-off.
- ★★★★ **Steam Input layout parse** (VDF → AI context)
  - **Goal:** Parse controller VDF configs and feed actionable control context to AI.
  - **Primary work:** config discovery, VDF parsing, normalization to human-readable actions.
  - **Files:** `main.py`, `src/index.tsx`.
  - **Depends on:** bundled VDF parser support.
  - **Not in scope:** editing/writing controller configs.
- ★★★★★ **Deck health snapshot** (full diagnostics + Ollama)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** **Read-only** full diagnostics: device/DMI (incl. BIOS where readable), SteamOS/kernel/Steam client versions, plugin/Decky fingerprint, battery snapshot + health estimate, Ollama connection quality (extend `[test_ollama_connection](../main.py)`), running game, storage free space, TDP cap read-only (`[read_current_tdp_watts](../py_modules/backend/services/tdp_service.py)`), **line excerpts** from Proton/Steam/system journals and prior-boot kernel panic markers — bounded like `[proton_troubleshooting_logs.py](../py_modules/backend/services/proton_troubleshooting_logs.py)`. Save markdown/JSON to `~/Desktop/bonsAI_logs/` when **Save files to Desktop** is on. **Supersedes** former **Support diagnostics block** (version/fingerprint copy).
  - **Permission:** **No new capability.** Log-bearing collectors require existing `steam_logs_read` (Permissions → game & screenshot context / Proton logs). No `hardware_control` writes.
  - **Ollama routing (v1):** **Magic Ask only:** `bonsai:diagnostics` (exact phrase pattern, same family as `bonsai:vac-check`) runs collectors → writes saved file with excerpts → submits a fixed Ask with report summary in system context. **Natural-language intent** (“run diagnostics”, “health check”, “kernel panic logs”) detected on ordinary Asks → **confirm modal** before running (no silent full scan).
  - **Primary work:** `deck_diagnostics_service.py` with isolated timeout-bounded collectors; RPC `run_deck_diagnostics`; redaction for paths/serials in copy paths; preset chip + troubleshooting cross-link; intent heuristic + confirm UI.
  - **Files:** `main.py`, `py_modules/backend/services/deck_diagnostics_service.py`, reuse/extend `proton_troubleshooting_logs.py`, `game_ai_request.py`, `src/data/presets.ts`, local-only command module (e.g. `diagnostics_commands.py`), About tab one-liner pointing to magic phrase.
  - **Depends on:** `steam_logs_read`; shipped connection test; optional `filesystem_write` for Desktop save only.
  - **Not in scope:** New permission tier; telemetry upload; auto background scans; privileged repair commands (`sudo` fixes); replacing **Session context and user stash**; passive **Deck health sentinel** (future brainstorm).
- ★★★★★ **Global quick-launch macro** (Steam Input doc spike)
  - **GitHub (tracking pblaceholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Status:** **Baseline doc shipped** — full recipe, delay ladder, tuning, and maintainer **Verification checklist** in [troubleshooting.md](troubleshooting.md) §5; optional macro row in [testing.md](testing.md#regression-gates) §3. Ongoing: refresh if Steam/Decky QAM or Decky list behavior changes, or when **Native QAM shortcut tile** (**Long-term**) lands (shorter macro).
  - **Goal:** Near-instant BonsAI from in-game or Home via Guide chord → QAM → Decky → bonsAI.
  - **Primary work:** Document and test optimal macro sequence (user-specific QAM tab order).
  - **Files:** `README.md`, `docs/development.md`.
  - **Depends on:** native Steam Input (Guide chord) and QAM layout.
  - **Related / future UX:** Today's path assumes **Decky as intermediary**. **Native QAM shortcut tile** is the target way to **shorten the macro** once platform or Decky support exists.
  - **Assessment:** High value; until a native QAM entry exists, maintenance is mostly documentation and macro tuning. Any future Decky/Steam glue for deep-link or QAM registration would be bounded, small-scope integration — not "zero" work, but still no evdev or DOM hacks.
  - **Not in scope:** evdev sniffing, WebSockets, React DOM hacks.
- ★★★★★ **Local reply TTS** (Phase 1–2 character voice; R)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Dedup:** distinct from **Whisper voice Ask** (shipped — see **Completed** / [archive/roadmap-completed.md](archive/roadmap-completed.md)) and from planned **Wake-word listening** (always-on STT) — this item is **text-to-speech** playback only.
  - **Phase 1 — Baseline:** Offline/local engine on loopback or LAN (e.g. Piper / Kokoro-class); **per-reply** play/stop; no cloud TTS; no always-on listening.
  - **Phase 2 — Character-aligned read-aloud:** When **Character Voice Roleplay Mode** is on, map resolved catalog preset id (e.g. `gta5_michael`, `gta5_trevor` per `[src/data/characterCatalog.ts](../src/data/characterCatalog.ts)`) to TTS voice/profile/parameters so playback matches the same expressive intent as the text path; Settings toggle **Match read-aloud to AI character** (concept); fallback to neutral when roleplay off or mapping missing. **Random / Custom** behavior: mirror roleplay resolution rules (see brainstorm [roadmap_feature_ideas plan](../.cursor/plans/roadmap_feature_ideas_f5560e15.plan.md) § R).
  - **Legal (before Phase 2 ship):** research spike on voice likeness/publicity, false endorsement, publisher/performer rights, TTS asset licenses and ToS, regional variance; outcome defines disclosures and ship/no-ship boundaries (see § R in same brainstorm doc).
  - **Primary work:** TTS daemon contract + Deck audio path + UI controls (Phase 1); preset→voice mapping layer + disclosures (Phase 2).
  - **Files (expected):** `main.py`, `src/index.tsx`, install/troubleshooting docs; Phase 2 ties into `[py_modules/backend/services/ai_character_service.py](../py_modules/backend/services/ai_character_service.py)` / settings surfaces.
  - **Depends on:** Phase 1 transport before Phase 2; shipped character catalog ids for mapping.
  - **Not in scope:** Cloud celebrity voice cloning; wake-word or ambient mic; claiming official/licensed voices in UI.
- ★★★★★ **RAG Deck query — hybrid vectors (Phase 2)**
  - **Status:** Follow-up — v1 on-Deck offline FTS5 shipped; see [knowledge-base.md](knowledge-base.md).
  - **Goal:** Enable baked corpus vectors via Ollama `/api/embed` (`nomic-embed-text`) for hybrid retrieval; FTS5 remains fallback.
  - **Not in scope:** PC-hosted Chroma companion (superseded by on-Deck v1 architecture).
- ★★★★★ **Kids master lock** (Steam parental restricted)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Disable plugin capabilities when Steam reports a restricted kids account; restore when full account returns.
  - **Primary work:** parental-restriction detection, global lock above capability checks, banner lifecycle.
  - **Required behavior:** lock forces permissions off/blocked while restricted; message clears when full account detected.
  - **Files:** `main.py`, `src/index.tsx`, settings/help docs.
  - **Depends on:** **Capability Permission Center** and a detectable Steam signal.
  - **Not in scope:** bypassing platform restrictions or separate auth systems.
- ★★★★★ **Steam Controller copilot** (Ibex gen-2, G)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** AI and in-app copy tuned to **gen-2** hardware — puck vs Bluetooth, **dual trackpads**, **gyro**, **rear grips**, **Steam / QAM** — plus actionable **Steam Input**-aligned suggestions (extends **Steam Input Jump** Phase 1; does not replace **Steam Input layout parse** above).
  - **Primary work:** Lexicon + troubleshooting tables; prompt inject when user selects **controller profile** or when detected; no VDF writes.
  - **Files:** `[src/data/steam-input-lexicon.ts](../src/data/steam-input-lexicon.ts)`, `steamInputJump`, `ollama_service.py`, docs.
  - **Depends on:** Permissions for Steam navigation where relevant.
  - **Not in scope:** Writing controller configs (see **Steam Input layout parse**).
- ★★★★★ **Wake-word listening** (beta; Deck first)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Opt-in always-on local wake on fixed keyword **bonsAI** (Deck beta first; Steam Frame later). After wake → speech gate → **Listening…** toast → user-configurable silence timeout (default ~2 s, range 1–5 s; max utterance ~30 s) → strip wake word from prompt text → quiet Ask (no auto-open QAM) via normal Ollama routing and last-used Ask mode. English-only post-wake STT in v1. Idle wake-only target **<15% CPU** (lightweight keyword spotter, not always-on Whisper); battery impact measured post-v1.
  - **Permissions / beta:** New capability **Wake-word listening (beta)** **plus** existing `microphone_access` (both required). **ConfirmModal** with **I understand** on every enable. Block enable until mic permission and separate **Install wake listener** are ready (modal with install CTA). Honest disclosure: audio is not uploaded or retained as recordings; transcript text is treated like typed Ask text.
  - **Toast phases (replace prior):** Listening… → Thinking… → **Reply ready** (shipped) / failure / Didn't catch that (+ spam guard). Toast tap = Stop (abort listen or cancel in-flight Ask). Cancel + Developer toggle: **A** keep draft in Ask (default; closed-QAM toast **Cancelled — open bonsAI to edit**) vs **B** discard transcript.
  - **Other v1 behavior:** Ignore new wakes while an Ask is in flight; suspend wake during mic-button STT Ask; stop on Deck sleep and resume on wake; hard-stop on plugin unload (no orphan wake/whisper processes); auto-pause when Steam voice or Discord is detectable, else document shared-mic risk; same Ollama path as normal Asks. Mid-session engine loss → disable listening + toast once.
  - **Primary work:** Keyword spotter install + daemon; integrate with `[voice_transcription_service.py](../py_modules/backend/services/voice_transcription_service.py)` / new wake service; capabilities + Permissions UI; ConfirmModal; Settings silence timeout; Developer A/B cancel toggle; toast phase machine; sleep/unload lifecycle; on-Deck CPU/battery QA.
  - **Files (expected):** `voice_transcription_service.py`, `main.py`, `capabilities.py`, `settings_service.py`, `settingsAndResponse.ts`, `PermissionsTab.tsx`, `DeveloperTab.tsx`, `src/index.tsx`, [voice-input-follow-up.md](voice-input-follow-up.md), [troubleshooting.md](troubleshooting.md).
  - **Depends on:** Shipped Whisper voice Ask + `microphone_access`; shipped **Reply ready toast**; shipped **Voice STT session daemon** for post-wake STT cost.
  - **Related (after v1):** Optional brevity inject for wake Asks; non-English wake/STT; Steam Frame companion path; **Local reply TTS** for hands-free read path; optional Speed-for-wake setting.
  - **Not in scope (v1):** Custom wake phrases; always-on full Whisper; cloud STT; Frame VR overlay; auto-open QAM on wake; reading answers via TTS.
  - **Dedup:** Distinct from push-to-talk Whisper Ask (shipped) and **Local reply TTS** (playback only).
- ★★★★★★ **Remote Play diagnostics layer** (streaming host/client, E)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** When gameplay is **streamed**, answers weight **encode latency**, input path, and “fixes first on **host** vs **client**” — reducing wrong TDP/sysfs advice applied on the wrong silicon.
  - **Primary work:** Research spike on **detectable** remote-play/session flags in Decky’s context; conditional system-prompt suffix + UI badge; timeout/latency copy tuned for jitter.
  - **Files (expected):** `game_ai_request.py`, `ollama_service.py`, `src/` Main/settings surfaces.
  - **Depends on:** None mandatory; optional revival of a manual streaming profile toggle (deferred **I** in brainstorm) if auto-detection stalls.
  - **Not in scope:** Packet inspection or kernel hacks.
- ★★★★★★ **Steam Frame companion UX** (VR / LAN Deck, H)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** **Research-first** path for **Steam Frame** users (VR or theater-style flat): **companion** workflows (Deck/phone on LAN with bonsAI while HMD is in-game); prompt disclaimers for **comfort**, **framerate**, and **wrong-display** context.
  - **Primary work:** Architecture note (Decky vs LAN-only); UX matrix; gated experimental prompts post-spike.
  - **Files:** `docs/` research page; optional `main.py` / prompt hooks after spike.
  - **Depends on:** ecosystem messaging accuracy (verify against Valve primary sources as hardware ships).
  - **Not in scope:** Shipping a full VR overlay inside Frame as v1.



### Long-term

Within this section: ★★★★★ items first (ascending stars), then ★★★★★★ items (ascending stars).

- ★★★★★ **QAMP Phase 2 profiles** (experimental Steam opt-in)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Status:** Backlog-only — scoped explicitly later; Phase 1 verification: [testing.md](testing.md) § QAMP Verification.
  - **Goal:** Experimental opt-in path tying QAMP reflection UX to Steam **per-game** performance profile workflows (details TBD).
  - **Primary work:** upstream/API feasibility, Settings gate, safety rails and confirmation UX.
  - **Depends on:** [QAMP Reflection (Phase 1 — Safe Default)](#ai-assisted-power-and-long-response-ux) (shipped).
  - **Not in scope:** silent sysfs or profile applies without explicit user consent.
- ★★★★★ **VAC Phase 2 opponent IDs** (lobby/session API research)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Status:** **Phase 1 complete** (shipped); **QA** still pending — see [testing.md](testing.md) § **VAC / Steam ban lookup (**`bonsai:vac-check`**)**. Feature summary: [Completed](#steam-input) → **VAC / ban lookup (Phase 1 — Ask command)**.
  - **Goal:** When metadata allows, surface **live opponent** Steam identities so ban checks map to **this session** with **lower confidence** if identity is inferred rather than pasted.
  - **Research spike (before implementation):**
    - **Decky Loader** APIs: what **Steam/CEF** surfaces expose lobby or recent-player lists to plugins (if any); stability across Steam updates.
    - **Steam client** on Deck: overlay/friends/game **Router** or similar JS APIs — document what is reachable from Decky's injected context vs unsupported.
    - **Per-game variance:** many titles never expose opponent SteamIDs to the client; plan UX for **manual paste** remaining primary.
  - **If no stable API:** Phase 2 becomes **enhanced manual flow** (clipboard split, recent-ID scratch list in-session) rather than automation.
  - **Risks:** same as Phase 1 (quota, privacy, incomplete data) plus **false linkage** if IDs are guessed.
  - **Not in scope:** automated reporting, punitive automation, bypassing protections.
- ★★★★★★ **Deep mod AI hints** (install paths + compatdata)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Detect mod frameworks/files; mod-aware AI guidance.
  - **Primary work:** per-game path discovery, mod signals, context injection UX.
  - **Files:** `main.py`, `src/index.tsx`.
  - **Depends on:** reliable install and compatdata scanning.
  - **Not in scope:** downloading/installing mods automatically.
- ★★★★★★ **Native QAM shortcut tile** (under Decky; upstream research)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** A separate Quick Access Menu (QAM) left-rail entry for BonsAI **directly beneath the Decky Loader icon**, so a Guide-chord macro (and manual navigation) can reach BonsAI with **fewer steps** than the current path through the Decky plugin list (see [troubleshooting.md](troubleshooting.md) § BonsAI shortcut setup).
  - **Why not a plugin-only change:** QAM sidebar tiles are governed by the **Steam client** and **Decky Loader** host; individual plugins cannot register a sibling QAM icon from `plugin.json` alone.
  - **Research tracks:**
    1. **Decky Loader / plugin API:** Upstream support for pinned QAM entries, deep-linking straight into a plugin, or a launcher row under Decky (docs/issues; may require upstream contribution).
    2. **Steam / SteamOS:** Whether Valve exposes stable third-party QAM tiles without Decky as intermediary (treat as **assumption until validated**).
    3. **Standalone or companion host:** What a non-Decky BonsAI surface would cost (separate surface, Decky-only APIs, TDP/sysfs paths, distribution) — long-range path if (1–2) are unavailable.
  - **Related:** **Global quick-launch macro** (Medium-term); when a native entry exists, refresh the macro sequence in [troubleshooting.md](troubleshooting.md).
  - **Not in scope:** Shipping a forked Steam client or undocumented UI injection as the default approach.

### Reference — vision model fallback order

When a screenshot is attached, `select_ollama_models(..., requires_vision=True)` in `[refactor_helpers.py](../refactor_helpers.py)` tries `qwen2.5vl:3b` **first**, then `qwen3.5:4b`, then legacy `llava:7b`, then Tier 2 `gemma4:e2b-it-qat` / `gemma4:e2b`. The fullscreen **Pull Models** picker lists `qwen3.5:4b` in Deck essentials (vision/chat/ocr/strategy). Ask mode differences are prompt-only on the same short chain. **Settings → Model policy → Allow high-VRAM model fallbacks** appends large tags after the essentials chain.

---



## Completed

Shipped features are grouped in the archive for readability. The live roadmap keeps **In Progress**, **Planned**, and dependency notes only.

**Full checklist** (release notes, file paths, QA cross-links): [archive/roadmap-completed.md](archive/roadmap-completed.md).

Coverage and on-device verification for shipped work: [testing.md](testing.md) **Shipped feature coverage** and **Test Results**.

## Appendix

Dependency graph and implementation notes that are not feature checklist items.

### Cross-feature dependency summary

- **Mode selector (main screen)** (shipped: Speed / Strategy / Expert + model fallbacks; persisted id `expert`) → **Per-mode latency/timeout profiles**; **Strategy Guide prompt path (beta)** is shipped as `strategy` Ask mode — see **[Completed](#tabs-icons-and-unified-ask-flow)**.
- **Character voice roleplay (shipped)** → baseline for **Character accent intensity (shipped)**; presets in [archive/research/voice-character-catalog.md](archive/research/voice-character-catalog.md), [src/data/characterCatalog.ts](../src/data/characterCatalog.ts).
- **Character voice roleplay (shipped)** → **Pyro talent-manager easter egg (hidden preset)** (shipped — see **Completed** → Character voice roleplay; on-device QA: [testing.md](testing.md#regression-gates) §2 / §3).
- **Character voice roleplay** + avatar mapping → **Higher-resolution character avatars (GTA-style art pass)**.
- **Character voice roleplay (shipped)** → **Character-derived UI accent theme (preset-selected)** (shipped — see **Completed**); **Random character “?” avatar** (shipped — see **Completed**); **Running-game character suggestions (AI picker)** (shipped — see **Completed**).
- **Character voice roleplay (shipped)** → **Local reply TTS** (Phase 2 — preset→voice mapping; legal research gate before ship).
- **Whisper voice Ask (shipped)** + `microphone_access` → **Wake-word listening** (additional beta capability + separate wake-engine install).
- **Reply ready toast (shipped)** → completion UX for all Asks; required for hands-free wake loop when QAM is closed.
- **Wake-word listening** → later **Local reply TTS** for hands-free read path; optional wake brevity inject / Speed-for-wake after v1.
- **Voice STT session daemon** (shipped) → reduces post-wake STT cost for wake-word listening.
- **Character voice roleplay (shipped)** → **Playful thinking status lines (shipped)** — persona tone in `compose_thinking_blurb`; **Thinking phase copy polish (shipped)** keeps mid-Ask `format_thinking_phase` lines prompt-woven; **Always-sarcastic thinking blurb (shipped)** — witty/deadpan always on, visible during stream; **Thinking blurb copy refresh (shipped)** — phase/intent-native witty/deadpan pools, no Yeah/Fine prefix farm, request-id-only selection.
- **Unified Ask pipeline and input transparency (shipped)** → **User-owned text/vision routing pickers** (shipped — see **Completed**); **Retry same prompt** (shipped — see **Completed** → Tabs).
- **Input sanitizer (shipped)** + **Input handling transparency (shipped)** → future sanitizer extensions should keep user-visible auditability.
- **Strategy Ask mode (**`strategy`**; Strategy Guide in prompts)** (shipped) → **Strategy Guide safety and spoilers** (shipped — on-device QA: [testing.md](testing.md) § Spoiler Policy and Consent), **Strategy checklist** (shipped — per-game persistence; on-device QA: [testing.md](testing.md) § Strategy depth / `STRATEGY-CHECKLIST`).
- **Global screenshots and vision** → richer strategy + screenshot context.
- **Capability Permission Center** → gates filesystem, elevated tasks, hardware, Steam/Proton log reads for troubleshooting excerpts, and (future) web/search calls.
- **Model policy tiers + disclosure UX (shipped)** → layered on **Capability Permission Center**; tiered routing + per-reply disclosure — see **Completed** → Permissions.
- **Llama.cpp provider spike** (Deck perf / replacement eval; discovery locked 2026-07-17) → research-only; may inform deeper **Lan vs Deck provider layering** or a future replacement path atop shipped Deck-first routing defaults (**Local/runtime deck-first defaults + onboarding** — see **Completed** → Connection). Eval artifact: [llama-cpp-provider-eval.md](archive/spikes/llama-cpp-provider-eval.md) (not written yet); supersedes May 2026 POC go/no-go.
- **Local/runtime deck-first defaults + onboarding** (Completed) lays baseline routing + **Connection** onboarding; advanced provider matrix work remains backlog if needed alongside **Llama.cpp provider spike**.
- **Restricted kids account master lock** → above permission toggles while restricted.
- **Built on Ollama link** → shipped in About.
- **SteamOS Media screenshot share button** → possible fast path into **Global screenshots and vision** if APIs allow.
- **Reset session cache (shipped)** → in-memory unified-input / reply state only; see **Completed** → Tabs.
- **Preset carousel (Phase 1 shipped)** → extends presentation without changing category routing; `PRESET_PROMPTS` **baseline (shipped)** → incremental **Preset chip expansion** (streaming / LAN / Steam Input themes) as features land — content tuning, not a distinct ship line; **Session RAG preset chips (shipped)** — AppID-aware ~30% RAG mix via offline KB curtail; **Pyro talent-manager easter egg (shipped)** adds a separate inject chip outside the trio’s `PRESET_CAROUSEL_ACTIVE_MS` window.
- **RAG Deck query / offline KB v1** ([knowledge-base.md](knowledge-base.md)) → feeds **Session RAG preset chips** (compat + strategy curtail for running AppID); Ask-path splice remains separate.
- **Global quick-launch macro** ↔ **Native QAM shortcut tile** (shorter macro once a direct QAM tile exists).
- **Bundled VDF parsing** → **Steam Input layout parse** (and optional deeper parsing).
- **Steam Input settings search + jump** → Phase 1 shipped; broader catalog deferred.
- **Offline intent pack exchange** → offline-first search quality.
- **Session context and user stash** → deck-first Ask quality; complements shipped game/vision/Proton/TDP injects and **RAG Deck query (on-Deck offline v1)**.
- **User stash (Phase 1)** → **Input handling transparency** (show injected stash bytes and sources).
- **Reply micro-actions** (shipped — see **Completed** → Tabs); distinct from shipped **Reply style** (global verbosity slider).
- **Proton experiment journal (shipped 2026-07-17)** → complements Proton log attach; optional inject into troubleshooting Asks; **context chip ladder** shows journal slice in Main tab. Distinct from **Session context and user stash** (structured timeline vs freeform notes).
- **Deck health snapshot** → `steam_logs_read` + `[proton_troubleshooting_logs.py](../py_modules/backend/services/proton_troubleshooting_logs.py)` + connection test; **supersedes** removed **Support diagnostics block**; Desktop save needs `filesystem_write`.
- **Settings persistence** → mode profiles, language override, background completion metadata; **Debug tab opt-in (Settings)** (shipped — see **Completed** → Tabs).
- **Brainstorm letters (ecosystem E–H, companion J–N, chat R–V)** are indexed in [roadmap_feature_ideas plan](../.cursor/plans/roadmap_feature_ideas_f5560e15.plan.md); **Planned** above is canonical for horizon ordering.

```mermaid
flowchart TD
  modeSelector[ModeSelectorMainScreenShipped] --> perModeProfiles[PerModeLatencyTimeoutProfiles]
  modeSelector --> strategyPath[StrategyGuidePromptPathBetaShipped]
  strategyPath --> strategySafety[StrategyGuideSafetyShipped]
  strategyPath --> strategyChecklist[StrategyChecklistWorkflowChatScoped]
  visionFeature[GlobalScreenshotsAndVision] --> strategyPath
  mediaShareButton[SteamOSMediaScreenshotShareButtonResearchSpike] --> visionFeature
  resetCacheAction[ResetSessionCacheShipped] --> settingsBase
  presetCarousel[PresetCarouselAndTransitionUx] --> strategyPath
  settingsBase[SettingsPersistenceBase] --> perModeProfiles
  settingsBase --> strategySafety
  settingsBase --> multiLanguage[MultiLanguageResponses]
  settingsBase --> backgroundCompletion[BackgroundPromptCompletion]
  settingsBase --> capabilityPermission[CapabilityPermissionCenter]
  capabilityPermission --> modelPolicyTiers[ModelPolicyTiersDisclosureShipped]
  modelPolicyTiers --> tierOpenSource[OpenSourceOnly]
  modelPolicyTiers --> tierOpenWeight[OpenSourcePlusOpenWeight]
  modelPolicyTiers --> tierNonFoss[NonFossUnlock]
  kidsLock[RestrictedKidsAccountMasterLock] --> capabilityPermission
  steamLogsRead[steam_logs_read capability] --> deckHealth[DeckHealthSnapshot]
  llamaEval[LlamaCppCompatibilityEvaluation] -.-> deckLanAdvance[LanVsDeckProviderLayerFuture]
  localRuntimeBanner[LocalRuntimeDefaultsBetaShipped] --> modelRouting[ModelProviderRoutingLayer]
  tierOpenSource --> modelRouting
  tierOpenWeight --> modelRouting
  tierNonFoss --> modelRouting
  builtOnOllama[BuiltOnOllamaAboutLink] --> aboutTab[AboutTab]
  vdfSupport[BundledVdfParsingSupport] --> steamInput[SteamInputLayoutParse]
  characterVoiceRoleplay[CharacterVoiceRoleplayShipped] --> pyroManagerEgg[PyroTalentManagerEasterEggShipped]
  presetCarousel --> pyroManagerEgg
  nativeQamBonsai[NativeQamShortcutTile] -.->|shorter macro when shipped| globalQuickLaunch[GlobalQuickLaunchMacro]
```





### Implementation notes



#### Iconography pass — plugin list icon lesson

Decky sizes icons via CSS `font-size`. Font Awesome works because it renders `<svg width="1em">` which inherits that font-size. An `<img>` with fixed pixel dimensions is ignored — pixel tweaks do not fix it. The fix was inlining SVG path data into `<svg width="1em" height="1em" fill="currentColor">` (`BonsaiSvgIcon`), matching Font Awesome. The `<img>`-based `BonsaiLogoIcon` remains for tab headers where layout is controlled. The source SVG needs `viewBox` for scaling.
