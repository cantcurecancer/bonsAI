# Roadmap planning questions (expanded)

Prepared prompts for a future AI planning session. Each section has a short summary of intent, then a detailed prompt to pass to another model.

---

## 1. Automating Device QA and prompt testing

### Summary

You want to cut down manual maintainer work on the **QA backlog** — especially **Device QA Tier 0–1** and the **broader prompt-testing pass** — by using tooling you already have: deploy to Deck, scripted D-pad in preview, screenshots/video, and agent-driven test runs.

**What already exists:**

- **Fast automated checks:** Vitest, pytest, and the preview-suite tiers (`pnpm run test:preview:tier`) — some scenarios already drive D-pad via `runSequence` and check DOM/focus paths.
- **Deck deploy + capture:** `deck.deploy`, `screenshot-deck` scripts, and a v1 screen-recording spike — useful for debugging and agent review, but **not** wired up as pass/fail tests.
- **Preview limits:** In-IDE preview mocks Decky UI; real Steam Deck focus bugs still need on-device QA. The **deck-only** bucket (QAMP, CEF/CORS, clean install) cannot run in preview at all.

**Two things to keep separate:**

1. **Device QA** = controller navigation, focus graphs, smokes in BPM/Gaming Mode (`testing-manual.md`).
2. **Prompt testing** = whether AI replies are *good* (quality/hallucination), not just whether the UI responded — only partly automatable via deterministic RPC checks.

**Your video-capture idea** is really two ideas: (a) scripted input + code asserts (partially done), vs (b) an AI/vision model reading video frames to judge UI (not built yet).

### Prompt for planning agent

> **Topic:** Automating Device QA and prompt testing — what can agents realistically own?
>
> **Context:** bonsAI splits testing into automated gates (`docs/testing-automated.md`: Vitest, pytest, preview-suite tiers) and manual Deck QA (`docs/testing-manual.md`, `roadmap.md` § QA backlog). The backlog prioritizes **Device QA Tier 0–1** (SMOKE-A/C/F then B/E/H with Pass/Partial/Fail + build id) and a **broader prompt-testing pass** beyond shipped MVP matrices. We already deploy via `deck.deploy` / `scripts/build.sh`, run preview with `preview.injectFocusEvent` / `preview.runSequence` / `callRpc`, and capture Deck UI via `screenshot-deck` scripts and `deck.captureScreenshot`. Maintainer video recording exists (`record-deck.sh` spike) but is not wired into any test oracle.
>
> **Ask:**
> 1. Map the **QA backlog items** (Tier 0–1 smokes, VAC-02…06, QAMP matrix, prompt-testing pass) to the **closest existing automation** (preview scenario, RPC-only check, unit test) vs **must remain manual** (Gaming Mode, CEF focus, qualitative reply judgment). Use `testing.md` coverage rows and `testing-manual.md` tier definitions as the source list.
> 2. Propose a **tiered automation plan** (e.g. expand preview `runSequence` scenarios; agent-run tier loop with `--write`; post-deploy RPC+DOM checks via DPS; optional screenshot diffing) — with explicit limits of preview mocks vs on-Deck requirements per `AGENTS.md` and `decky-preview` workflow.
> 3. Evaluate **video/screenshot capture as test oracle** (agent or vision model reads `DeckCapture_*.png` / `DeckRecord_*.mkv` after scripted input): what scenarios could that unblock (focus position, spoiler masks, tab flicker), what infrastructure is missing (stable capture IPC, frame timing, BPM vs game-mode parity per `deck-screen-recording` spike), and what false-pass/false-fail risk remains vs DOM/`focusPath` assertions.
> 4. For **prompt testing**, separate what can be automated via deterministic RPC prompts + envelope asserts (pattern: SMOKE-F / `ask_game_ai`) from what needs human or LLM-as-judge review; recommend a minimal matrix the agent could run nightly without a human on the Deck.
>
> **Deliverable:** A prioritized backlog of automation work (★ effort), expected coverage lift (which `testing.md` rows move from Open → Partial/Verified), and what still requires a human on hardware after the plan ships.
>
> **Out of scope for this question:** Implementing the plan; fixing individual open bugs (D-PAD-SCROLL-02, MICRO-04, etc.) unless they block automation infrastructure.

---

## 2. README.md redo

*Pending — say "proceed" to expand.*

---

## 3. LB/RB tab switch flicker when scrolled

*Pending — say "proceed" to expand.*

---

## 4. Strategy spoiler false-positive

*Pending — say "proceed" to expand.*

---

## 5. Token streaming evaluation

*Pending — say "proceed" to expand.*

---

## 6. Thinking blurbs evaluation

*Pending — say "proceed" to expand.*

---

## 7. Named chat slots

*Pending — say "proceed" to expand.*

---

## 8. Kids master lock feasibility

*Pending — say "proceed" to expand.*

---

## 9. Steam Frame companion UX feasibility

*Pending — say "proceed" to expand.*

---

## 10. Wake-word listening feasibility and cost

*Pending — say "proceed" to expand.*

---

## 11. Native QAM shortcut tile / decouple from Decky

*Pending — say "proceed" to expand.*

---

## 12. Deep mod AI hints feasibility

*Pending — say "proceed" to expand.*

---

## 13. Feature ideas for roadmap.md (star-rated)

*Pending — say "proceed" to expand.*
