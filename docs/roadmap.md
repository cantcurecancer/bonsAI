# bonsAI Roadmap

**Next session starts at** [execution order](#maintainer-decisions-locked--2026-08-02) **step 8** (entry-point split — resume `index.tsx` from step 5b's remaining list). Steps **5c** ([D8](#d8--the-deploy-path-has-two-blind-spots-fix-them-or-keep-checking-by-hand)), **5d** ([D7](#d7--two-more-dead-functions-turned-up-delete-them-too)), **6** (`main.py` inventory — [07-mainpy-inventory.md](audit/07-mainpy-inventory.md)), **6b** ([D11](#d11--mainpy-carries-a-compatibility-shim-for-a-loader-you-may-never-use-remove-it) shim removal, `main.py` 2971 → 2865)  and **7a–7d** (settings: drift guard, Python field table, D13 alignment, TypeScript field table) are done. The deploy path is verified on-device, so step 8's gates are trustworthy (**DEPLOY-VERIFY-01/03** verified, **02** partial; see [testing.md](testing.md)). **No decisions are open.** [D7–D10](#d7d10--raised-during-the-2026-08-02-session-locked-2026-08-03) locked 2026-08-03.

Tracks **bugs and active engineering** ([In Progress](#in-progress)), **executed cleanup** ([Cleanup candidates](#cleanup-candidates)), **refactor decisions** ([Decisions needed](#decisions-needed) — locked 2026-08-02), deferred **QA** ([QA backlog](#qa-backlog)), the **backlog** ([Planned](#planned)), and pointers to shipped work ([Completed](#completed)).

Setup and vision tuning: [troubleshooting.md](troubleshooting.md). QA: [testing.md](testing.md). Release: [development.md](development.md), [CHANGELOG.md](../CHANGELOG.md).

Star ratings use the GTA scale: `★` easiest … `★★★★★` very high complexity; `★★★★★★` extreme scope.

---

## In Progress

Known **defects** only. Deferred QA lives under [QA backlog](#qa-backlog). *QAMP Phase 1 (safe default) is shipped. Phase 2 (experimental profile sync) remains backlog-only.*

### Bugs

- ★ **Install voice engine button is actionable when the engine is already ready:** Settings → Voice input offers **Install voice engine** even when `engine_readiness` reports `binary_ready` and `model_ready`; pressing it re-runs the full install, including a podman pull of `ghcr.io/ggml-org/whisper.cpp`. Observed 2026-08-03 while troubleshooting the voice `status()` bug — the user pressed it precisely because the Main tab claimed voice was broken while Settings said ready, so the misleading state came from that bug, but the button being live regardless is its own issue. **Fix lean:** when ready, show the state and offer *Reinstall* as a distinct, clearly-labelled secondary action rather than the primary one. Needs a focus-graph entry if the control count changes (`.cursor/rules/decky-focus-graph.mdc`).
- ★ **Strategy spoiler false-positive:** Genre-aware spoiler policy + KB entity match (DRG Survivor boss names); verify **STRAT-SPOIL-DRG-01** on Deck.
- ★ **Question Overlay Alignment Drift:** The 3-line question overlay has minor horizontal spacing mismatch vs native `TextField` internals.
- ★★★ **Fullscreen picker D-pad edge-escape (audit):** Audit **Pull Models**, **Character picker**, **Ollama models hub**, and other `showModal` pickers for below-list / above-list escape (left from row → primary action; right from trailing control → Close).
- ★★ **Main tab answer D-pad scroll choppy / multi-line jumps:** Scrolling the Strategy reply with D-pad Down still advances many lines per press (choppy, hard to read line-by-line). Do not remove scroll-step logic until on-Deck confirmation after multi-day QA. Regression row: **D-PAD-SCROLL-02** in [testing-manual.md](testing-manual.md).
- ★★ **Live-turn transparency UI missing after successful Ask:** Backend `ensure_context_chips_on_snapshot` + slimmer dev chip JSON + frontend `transparencyUiAvailable` gating; verify **CONTEXT-LADDER-01** on Deck.
- ★★ **Strategy live-turn D-pad graph skips branches/feedback:** Geometry scroll gate + yield-to-parent (`return false`) with Focusable branch picker as turn-slot sibling; verify **MICRO-04** on Deck.
- ★★★ **Soft** `num_predict` **+ thinking budget:** `options.num_predict` is a hard Ollama wall (500 Speed/Expert, 900 Strategy) with no overshoot/continue; `"think": False` avoids empty replies when thinking ate the wall (`done_reason=length`, zero content) but leaves quality on the table for thinking models. **Intent:** length preference with small overshoot OK — not a hard cut, not unlimited. **Fix lean:** (1) raise base caps; (2) continuation on `done_reason=length` (small extra budget, capped continues — especially when content empty/short); (3) optional Reply verbosity → answer `num_predict`; (4) **budget thinking separately** (application policy): re-enable thinking with a fixed Deck default effort (`low`/`medium`) plus answer-floor / continue-if-content-starved; log thinking vs content lengths. Ollama has no true dual hard budgets in one completion — levels + continue stand in. **Not in scope:** delete the ceiling entirely; Settings UI for effort (→ **Thinking effort control**); parallel second Ask; spoiler chip work.
- ★★ **Model routing try-order modal focus + chrome:** Text/vision **Set … try order…** fullscreen (`ModelRoutingOrderModal`) — D-pad focus lands on leaf Up/Down buttons and feels broken; layout/chrome does not match other fullscreen pickers (Pull Models / Character picker / Models hub `ConfirmModal` pattern). Screenshot `DeckCapture_20260730_144925`. Discovery locked 2026-07-30. **Defer** — fetch-on-open + save already shipped; polish later.
- ★★ **KB compat retrieval phrase gate:** Troubleshooting KB (compat hybrid / **Keyword + meaning**) only runs when `question_matches_troubleshooting_log_context` matches a **hardcoded phrase list** in `ollama_prompts.py` (preset-style strings like `proton issue`, `why is my game crashing`). Natural-language asks (e.g. `deck sleep resume proton black screen`) skip the KB entirely — no chip, no hybrid, no **Source: shared troubleshooting tips**. **Intent:** when **Use local knowledge base** is on, attempt compat tip retrieval for general troubleshooting-shaped Asks without growing a brittle regex/preset farm in bonsAI. **Fix lean:** broaden gate (e.g. KB-on + not strategy-with-game → compat shortlist; or lightweight intent/heuristic separate from carousel presets); keep Strategy path AppID-gated. Regression: **KB-SMOKE-07/08** queries in [testing-manual.md](testing-manual.md) must pass without adding new hardcoded strings per smoke case. **Phase 4 discovery (2026-07-30):** lean gate fix (**B1**) ships with Phase 4 when implemented — not a separate forever-defer.
- ★★★ **LB/RB tab switch flicker when scrolled:** Switching tabs with shoulder buttons while focus is deep in a scrolled panel (not on tab icons) flashes/jitters. Investigate carousel + remount/scroll/focus survival (partial anti-flicker CSS already on `TabContentsScroll`). Discovery locked 2026-07-29. **Recon: [08-lbrb-tab-flicker.md](audit/08-lbrb-tab-flicker.md)** — ranked hypotheses, fix tracks, on-Deck probe P0 to run first.

**Fixed 2026-08-03 — voice input was completely broken for two and a half weeks.**
`VoiceTranscriptionSession.status()` did not exist. `742db60` (*Voice STT session daemon*,
2026-07-17) replaced the `def status(self)` **signature line** with the new `_transcribe_pcm`
method and never re-added it, leaving `status()`'s two body lines stranded as **unreachable
code** after `_transcribe_pcm`'s `return`. Python does not warn about that, and neither did any
gate.

One deleted line broke four callers: `start()` and `stop()` inside the class, plus
`start_voice_transcription` and `get_voice_transcription_status` in `main.py`. Every voice
attempt raised `AttributeError: 'VoiceTranscriptionSession' object has no attribute 'status'`.

**Why the symptoms looked contradictory.** Settings correctly reported *voice ready* because
`get_voice_engine_status` checks the binary and model on disk and never touches `status()`; only
the Main-tab start path did. The engine was genuinely fine throughout — verified after the fact:
`binary_ready: true, model_ready: true, ready: true`. The **Voice input unavailable** message
that appeared later was the frontend reacting to repeated RPC failures, not a real missing
engine, so no reinstall was ever needed.

**Found from a user report, not a gate** — the traceback was only in `journalctl -u
plugin_loader`, since the exception was raised before the plugin's own logger ran. Worth
remembering: **plugin-side RPC exceptions land in the loader journal, not
`homebrew/logs/bonsAI/`.**

Coverage, both mutation-checked: `tests/test_voice_session_status.py` (5 tests, including a
public-surface assertion over `start`/`stop`/`force_stop`/`status`) and
`tests/test_no_unreachable_code.py` — an AST guard over `main.py` and all of `py_modules/` that
fails on any statement following a `return`/`raise`/`break`/`continue`. That second one is the
real mechanism: it catches the *fingerprint of a half-finished deletion* rather than this one
instance. It found zero other sites, so the tree is clean. Re-verified on the deployed plugin:
`status()` returns the state mapping. **On-Deck retry of a live recording is still needed.**

**Fixed 2026-08-03 — reply-language snapshot RPC raised on every call.**
`get_reply_language_snapshot` read `self.load_settings()` **without awaiting it** and then
called `.get()` on the coroutine ([main.py:2046](../main.py)), so it raised
`AttributeError: 'coroutine' object has no attribute 'get'` every single time — broken since the
multi-language feature shipped in `9fb79bd`, not a regression from any refactor (the pre-D11
code had the same omission).

**Why nothing caught it.** The frontend hook swallows the failure and keeps its English default
([useReplyLanguage.ts:45](../src/hooks/useReplyLanguage.ts)), and
`src/test-harness/fakeDeckyRpc.ts` stubs this RPC with a canned object, so the frontend suite
exercised the fake rather than the backend. Python unit tests import services, not `class
Plugin`. It passed `tsc`, 263 frontend tests, 418 Python tests, and `npm run build`.

**Scope, precisely.** Ask reply *content* was unaffected — that reads `reply_language` from
settings on the Ask path, not from this snapshot. What silently fell back to English was the
plugin's own UI-string translation (`t()`) and the displayed Steam client language.

**Found by driving the deployed RPC surface directly**, which is now kept as
[scripts/probe_deck_rpc_surface.py](../scripts/probe_deck_rpc_surface.py) rather than thrown
away — it calls every read-only RPC plus the Ask admission path against a real deployed plugin,
with all writes redirected to a temp dir. A sweep for the same mistake across `main.py` found no
others (the one other hit was `asyncio.create_task`, correct by construction). Coverage:
`tests/test_reply_language_snapshot_rpc.py`, 3 tests, mutation-checked — all three error without
the `await`. Verified on-device: 21/21 RPCs ok, `bonsAI plugin loaded!`, zero log errors.

**Fixed 2026-08-02 — session RAG preset chips never appeared.** `get_session_rag_chip_candidates` is now implemented at [main.py:1681](../main.py); the frontend at [sessionRagChipCandidates.ts:54](../src/utils/sessionRagChipCandidates.ts) had called it since the feature shipped, so with **Use local knowledge base** on the call always rejected and the carousel silently fell back to static seeds. The backend it needed already existed — `suggest_chip_candidates` and `session_rag_chip_candidates_to_rpc` in `knowledge_base_service.py`, with tests — so this is the missing RPC adapter only; **no ranking or candidate policy was designed or changed**, per **D1b**. KB-off, missing corpus and corpus read errors all return `{ok: false}` with a reason rather than rejecting. An **unreadable corpus** is additionally written to the plugin log — it is a real fault rather than "this game has no tips", and the console warning the frontend emits is not somewhere anyone looks on a Deck. It is logged once per distinct fault, not per Ask, because the carousel re-queries whenever it has no cached suggestions ([useBonsaiAskOrchestration.ts:244-249](../src/hooks/useBonsaiAskOrchestration.ts)). Coverage: `tests/test_session_rag_chip_candidates_rpc.py` (7 tests) over the existing service tests; on-Deck row **SESSION-RAG-CHIPS-01** in [testing.md](testing.md).

**Fixed 2026-08-02 — pulled model tags never merged into routing order.** `merge_pulled_tags_into_routing_orders` is now implemented at [main.py:1776](../main.py); the frontend call at [OllamaWhereAiRunsSection.tsx:576](../src/components/OllamaWhereAiRunsSection.tsx) had no Python counterpart since the feature shipped. Pulled tags append to a saved try order (or go to the top when they are high-VRAM and that toggle is on), and vision-capable tags also join the vision list. **Deliberate no-op:** when the user has no saved try order, the RPC writes nothing — `resolve_routing_order` derives the chain from installed models ([ollama_routing.py:366-370](../py_modules/backend/ollama_routing.py)) and already includes anything just pulled, so writing a one-tag list would have *narrowed* the chain rather than extended it. Coverage: `tests/test_merge_pulled_tags_rpc.py` (8 tests); on-Deck row **ROUTING-MERGE-01** in [testing.md](testing.md).

---

## Decisions needed

Open questions that need a maintainer call before the work can continue. Written
in plain language on purpose — each one says what the situation is, what your
choices are, and what happens either way. **Locked calls (2026-08-02 for D1–D6,
2026-08-03 for D7–D10)** are in
[Maintainer decisions locked](#maintainer-decisions-locked--2026-08-02); implement
from that section when it disagrees with an option above.

**None currently open.** D1–D13 are all locked; see the table below for each call.

Evidence for all of these lives in [docs/audit/](audit/), especially
[05-plan.md](audit/05-plan.md).

---

### D1 — Two features were built with a frontend but no backend. Build them, or remove them?

**What's going on.** Two buttons/flows in the UI call into Python functions that
were never written. The names exist only in TypeScript. Because both call sites
threw the error away, nothing ever surfaced — no crash, no log, no message. They
now log to the console, and both are listed as bugs above.

The two are very different sizes, so you may want a different answer for each.

**Option A — build the small one, delete the big one.** *(my recommendation)*

`merge_pulled_tags_into_routing_orders` is small: after you install models with a
custom setup profile, it should add those models to your try-order list. The
setting it needs (`model_routing_order`) and its validator already exist, so this
is a short piece of work with a clear right answer.

`get_session_rag_chip_candidates` is the bigger one: it should suggest preset
prompts drawn from your local knowledge base for whatever game is running. There
is no backend for it at all, and building one means deciding what counts as a
good suggestion and how to rank them — that is product design, not a refactor.
Deleting the frontend path means the preset carousel keeps using its fixed
built-in prompts, which is exactly what it does today, so users would notice no
change.

**Option B — build both.** You get the RAG preset chips feature you originally
planned. It costs real design time and it is new behavior, so it should not ride
along inside refactor work.

**Option C — delete both.** Smallest and safest. You lose the pulled-model
try-order convenience, which means setting try-order by hand after installing
models.

**Option D — leave them as they are.** They now log loudly, so they are no longer
invisible. Costs nothing, but two dead paths stay in the code and a future reader
has to work out why they are there.

**Either way:** the CHANGELOG entry that announced "Session RAG preset chips" as
a shipped feature has been corrected to say it is frontend-only and not working.

---

### D2 — A whole group of backend functions is unused. Safe to delete?

**What's going on.** When the Proton experiment journal UI was removed on
2026-07-30, the backend behind it was left in place. Five backend functions and
their service module are still there with nothing calling them. The same cleanup
removed the "tiny model thinking blurbs" feature and left
`thinking_tiny_model_service.py` behind — that file is now imported by literally
nothing. There are also six other backend functions with no caller, and a TDP
power-adjustment function whose only remaining caller is its own test.

Altogether that is roughly 12 unused entry points plus two modules.

**Option A — delete it all after one check.** *(my recommendation)*

The check: I looked at the app code only, not the preview test suite. Before
deleting anything I would grep `tests/preview-suite/` to confirm none of these
are driven from there. That is a couple of minutes' work. If it comes back clean,
deleting is safe and makes every future search through the codebase smaller and
less confusing.

**Option B — delete the certain ones, keep the ambiguous ones.** The Proton
journal group and `thinking_tiny_model_service.py` are unambiguous — the features
were removed on purpose. Two others are worth a second thought:

- `ask_game_ai` is described in the code as the *foreground* Ask path. The app
  only uses the background one now. If you ever want a synchronous Ask, this is
  the code for it; if not, it is dead weight.
- `cancel_rag_corpus_download` suggests knowledge-base downloads were meant to be
  cancellable and the button was never wired up. That might be a missing feature
  rather than dead code.

**Option C — keep everything.** No risk, but the confusion stays: a newcomer
reading `main.py` cannot tell which of the 55 functions are live.

---

### D3 — The riskiest refactor has no safety net. How do you want to handle it?

**What's going on.** This is the most important decision here.

The plan's Phase 3.4 wants to break up the two biggest frontend files —
`src/index.tsx` (1,965 lines, changed more often than any other file) and
`useBonsaiAskOrchestration.ts` (the whole Ask flow: submit, cancel, polling,
streaming, follow-ups).

Neither has a single automated test. More broadly, 44 UI component files share
one test file between them. The practical meaning: **`npm test` passing tells you
nothing about whether a UI change broke something.** It would still pass if every
component were deleted. So a refactor that is supposed to change structure
without changing behavior cannot actually be *shown* to have done that.

**Option A — write safety-net tests first, then refactor.** *(my recommendation
if this refactor matters to you)*

Write tests that capture what these files do today, then move code and confirm
the tests still pass. The groundwork exists — there is already a fake backend for
tests (`fakeDeckyRpc.ts`) and three working hook tests — so this is a known
quantity, not an experiment. It is real extra work up front, and it is the only
option where a mistake gets caught before it reaches your Deck.

**Option B — refactor anyway, verify by hand on the Deck.** Faster to start. Each
change needs you to install to the Deck and click through it, and a subtle
regression (focus behaviour, a race in Ask polling) can slip through a manual
pass. If you choose this, the work should be sequenced last and done in small
commits so anything broken is easy to undo.

**Option C — leave those two files alone.** Do the lower-risk items instead
(there are plenty) and accept that the two biggest files stay big. Honest and
zero-risk; the handoff goal is only partly met, since these are exactly the files
a newcomer finds hardest.

The smaller `MainTab.tsx` is a useful middle ground under any option: it is only
187 lines and changes constantly purely because every new feature has to thread
props through it. Fixing that is structural and easy to eyeball.

---

### D4 — Old QA evidence: keep or prune?

**What's going on.** `docs/test-evidence/` holds 263 files across nine folders of
past test-run output. Only three of those folders are linked from any document;
the other six are referenced by nothing. It is the largest directory in `docs/`
and about 96% of it is unreferenced. `testing.md` already anticipated this,
noting orphan evidence folders may be pruned once nothing links them.

**Option A — prune the six unreferenced folders.** Keeps the three that are cited
as evidence. Makes `docs/` much smaller and easier to look through.

**Option B — keep everything.** It is only disk space, and old run output can be
useful when chasing a regression that reappears.

**Option C — prune, but archive first.** Zip the removed folders somewhere
outside the repo, same approach used for the v0 drafts in Phase 0.

I have no strong view — this is about what QA history is worth to you, not about
code quality. I did not touch it.

---

### D5 — Import graph: keep the built-in one, or switch to madge?

**What's going on.** You approved adding a dependency graph so the refactor can
answer "who imports this file?" reliably. The plan suggested the `madge` tool.
madge was not installed, and this generator runs on **every commit** via the
pre-commit hook, so adding a tool plus a multi-second graph build to every commit
seemed like the wrong trade. I wrote a small built-in version instead — about 50
lines, no new dependency, instant.

It currently reports 479 imports, no circular dependencies, no orphans. It has
already proved more accurate than searching by hand: checking what imports
`deckyCall.ts`, it found 15 files where my own grep found 14.

**Option A — keep the built-in one.** *(my recommendation)* Fast, no dependency,
and it does what the refactor needs.

**Option B — switch to madge.** More battle-tested and handles exotic import
styles this codebase does not currently use. Costs a dependency and slows every
commit slightly. Worth doing if you ever add TypeScript path aliases, which would
make the simple version unreliable.

---

### D6 — Sequencing: what should I do next?

Not a hard decision, just a checkpoint. The audit produced a ranked plan in
[05-plan.md](audit/05-plan.md). The first four items are all low-risk, mechanical,
and verifiable by the compiler and existing tests:

1. Delete the unused backend code (needs **D2**)
2. Fix four one-line inaccuracies in the docs, and move a plan document that
   declares itself archived into the archive folder
3. Delete `refactor_helpers.py` — a leftover forwarding file that adds nothing
   (careful: the deploy scripts copy it, so that has to be updated too)
4. Delete `settingsAndResponse.ts` — another forwarding file, this one with 22
   files pointing at it

Together these measurably shrink the codebase without requiring any design
decision. **D3** is the one that changes the shape of everything after it.

Also worth knowing: the friction test (having a fresh pair of eyes try a real
task and log everywhere they got stuck) is deferred until after the refactor, per
your earlier call, so it will measure the improved codebase rather than the
starting point.

---

### D7–D10 — raised during the 2026-08-02 session, locked 2026-08-03

**D1–D6 are locked and largely executed.** These four came out of doing the work;
options below stay as the decision record. **Locked calls** are in the table under
[Maintainer decisions locked](#maintainer-decisions-locked--2026-08-02) and in
**execution order** steps **5c–5d**.

---

#### D7 — Two more dead functions turned up. Delete them too?

`_reencode_oversized_capture` and `_mirror_capture_to_plugin_dir` in
`screenshot_media.py` have **no production callers** (`_mirror_capture_to_plugin_dir`
is an explicit deprecated no-op; capture uses `_finalize_steam_capture_file`).
Unlike the kmsgrab set deleted in `4a26cfa`, these were **already dead before**
any of this session's work — they are not a cascade from a deletion, so they were
left alone rather than folded into someone else's commit. One unit test still calls
`_reencode_oversized_capture`.

- **Delete them.** Consistent with everything else this session removed; ~2
  functions, no production callers, and the module has real behavioral coverage.
- **Keep them.** If either is a deliberate parking spot for capture work you
  intend to resume, say so and they get a comment saying why they are unused —
  which is the thing that stops a future session proposing this again.

**Locked 2026-08-03:** **Delete both**; remove the `_reencode_oversized_capture`
unit test (or fold any useful assertion into `_finalize_steam_capture_file` tests).

---

#### D8 — The deploy path has two blind spots. Fix them, or keep checking by hand?

Both were found by accident this session, and both mean a deploy can look
successful while the Deck is running something else:

1. **It reports success without landing.** A deploy ran while the Deck drifted to
   sleep. `build.ps1` printed *Deployment complete!*; the bundle on the Deck
   still carried the previous deploy's timestamp and no new plugin log appeared.
   The script never verifies what it copied.
2. **It copies but never prunes.** Files no longer shipped stay on the device
   from earlier deploys. When `refactor_helpers.py` was deleted, the stale copy
   sat on the Deck and would have satisfied any import that had been missed —
   the plugin loading proved nothing until it was removed by hand.

   **Code check (2026-08-03):** this is primarily a **Windows / `build.ps1`**
   problem — `build.sh deploy` already `rm -rf`s the plugin dir before copy.
   `watch-deploy.ps1` delegates to `build.ps1`; `watch-deploy.sh` delegates to
   `build.sh deploy`.

**Options.** Harden the scripts (compare a build hash after upload; remove
plugin files that are no longer in the manifest) — a contained change to
`build.ps1` (and `watch-deploy.ps1` by inheritance) that removes a whole class
of false-pass. Or leave them and rely on the manual check now written into
[05-plan.md](audit/05-plan.md) §1.3, accepting that it depends on someone
remembering.

The second option is the one Phase 5's prevention pass would reject on
principle: discipline is not a mechanism.

**Locked 2026-08-03:** **Harden `build.ps1`** — prune stale plugin files before
copy and verify the deploy landed (e.g. compare `dist/index.js` hash or mtime on
the Deck vs local build; fail the script on mismatch). **Blocker before step 8**
(entry-point split resumes only after deploy trust is fixed).

---

#### D9 — How far does the entry-point split actually go?

Three slices are out of `index.tsx` (1955 → 1709). The remaining list in
execution-order step 8 would land it near **700–800 lines** (estimate, not yet
measured). Two bigger files were never in scope for step 8:

- **`useBonsaiAskOrchestration.ts`** — 1222 lines, the whole Ask state machine.
  It now has 13 characterization tests, so it is the best-protected large file
  in the repo; it is also where a subtle polling or cancel regression would hurt
  most on-device.
- **`MainTab.tsx`** — 187 lines, churn 42, and [05-plan.md](audit/05-plan.md)
  calls it the cheapest entry point because its churn is pure prop-threading
  tax. It gets cheaper still after the state extractions above.

Decide whether "done" means `index.tsx` alone, or those two as well.

**Locked 2026-08-03:** **Done = finish step 8 (`index.tsx` only).**
`useBonsaiAskOrchestration.ts` and `MainTab.tsx` are **follow-ups** — revisit
after step 8 lands and `index.tsx` is near the 700–800 line target.

---

#### D10 — Focus and D-pad behavior has no automated coverage. What gates the remaining split?

The safety net built in step 5 covers the **Ask lifecycle** and the plugin
**mounting** — not focus order, not modal open/close lifecycle. The remaining
extractions (character picker, models hub, desktop note, plugin help) are
exactly that kind of behavior. Preview tier 3 covers tabs/settings/permissions —
**not** those four modals.

- **On-Deck D-pad pass per commit.** Slowest, and the only option that actually
  catches a focus regression before it ships.
- **Preview suite per commit, on-Deck at the end.** Faster; a focus regression
  would be found late, against a batch of commits rather than one.
- **Write focus-graph tests first.** Highest up-front cost. Worth pricing only if
  focus regressions have bitten before — `.cursor/rules/decky-focus-graph.mdc`
  and the **UI-SCALE-01…05** rows suggest they have.

**Locked 2026-08-03:** **`tsc` + `npm test` + preview smoke every step 8
commit.** **On-Deck D-pad pass required only for the four modal extractions**
(character picker, models hub, desktop note, plugin help) — not for mechanical
state-only commits (connection/IP, session-reset, UI-scale, error-capture). Do
not write focus-graph tests upfront.

---

### D11 — `main.py` carries a compatibility shim for a loader you may never use. Remove it?

**What's going on.** Found during the step 6 inventory
([07-mainpy-inventory.md](audit/07-mainpy-inventory.md) §3). Every RPC in `main.py` starts
by calling `_coerce_instance(self)` — **55 call sites**. Its whole job is to cope with an
older Decky loader that passes the *class* instead of an instance. `plugin.json:6` declares
`"api_version": 1`, and that loader passes an instance, so on your Deck this call does
nothing at all.

It has a partner: `_ensure_background_state` (35 lines) re-creates runtime state for the
same "loader skipped `__init__`" case.

Two things make this more than tidying:

- The fallback **does not work anyway.** It backfills 11 of the 29 pieces of runtime state.
  Voice, knowledge-base download, intent packs and Ollama setup are not covered, so if the
  case it defends against ever happened, those would still crash.
- If the class-passed branch ever *did* fire, `_coerce_instance` would build a brand new
  plugin object and quietly throw away any Ask in progress. It is not a safety net; it is a
  bug that never fires.

**Option A — remove both.** *(my recommendation)* About 90-120 lines gone and 55 call sites
simplified — the single largest mechanical shrink left in `main.py`. Safe as long as bonsAI
stays on `api_version: 1`. If Decky ever ships a loader that behaves differently, the plugin
would fail loudly at load rather than silently losing state, which is the better failure.

**Option B — keep them, and write down why.** Costs nothing today. The comment has to explain
why a half-covering fallback is worth 55 call sites, because otherwise a future session
proposes this again.

**Option C — finish the fallback instead.** Extend `_ensure_background_state` to cover all 29
attributes. Most work, and it makes a path nothing exercises more elaborate.

**Not urgent.** Nothing depends on this; it is sequenced after step 8. Flagged now because
step 7 (settings single source of truth) touches instance lifetime and would be affected by
the answer.

**Locked 2026-08-03: Option A — remove both.** Executed the same day and pulled ahead of
step 7 rather than left until after step 8, since step 7 touches the same instance-lifetime
assumption. See execution-order step **6b**.

---

### D12 — Settings live in two languages. How far do you want to go to fix that?

**What's going on.** Step 7's goal is making "add a setting" cheap. Recon first
established the baseline (execution-order step **7a**): TS and Python each declare all
**40** settings independently, and — checked by running both — they currently agree
**exactly**, 40 keys, zero differences.

So nothing is broken. The cost is that adding one setting means editing six files across
two languages and getting them to match by hand, with nothing checking that you did.

**Already shipped (step 7a), and it needs no decision:** a shared defaults fixture both
languages assert against, so an incomplete two-language edit now fails a test. That closes
the *drift* risk. It does not reduce the *cost*, which is what the options below are about.

**Option A — declarative field table per language.** *(my recommendation)*

Most of the 40 settings are one of five boring kinds: boolean defaulting false, boolean
defaulting true, enum with a default, integer clamped to a range, string with a max length.
Those become rows in a table on each side rather than a hand-written function. The genuinely
custom ones — the latency/timeout reconciliation, the two legacy migrations, model policy,
capabilities, named hosts, routing order — stay as functions.

Adding a simple setting becomes one row in each language plus the UI control. Roughly
two-thirds of the 28 Python sanitizers collapse. Both languages stay readable on their own
terms, and the fixture proves the rewrite changed nothing.

**Option B — generate both sides from one spec.** A single machine-readable file describing
every field, from which the TypeScript types and the Python sanitizers are generated. This is
the only option where the two languages *cannot* disagree, because only one thing is written
by hand. It fits how the repo already works — six architecture snapshots are generated and
validated on every commit.

It is also the biggest commitment: a generator to maintain, generated files people must not
edit, and the awkward cases (migrations, cross-field reconciliation) either stay hand-written
anyway or push complexity into the spec format.

**Option C — stop here.** Keep the fixture, keep the hand-written code. Drift is now caught,
which was the real risk; adding a setting stays a six-file chore. Zero further work, and
honest if settings are not being added often.

**What I'd weigh.** B's advantage over A is only realized if settings keep being added — the
generator has to be paid for by future edits. A gets most of the cost reduction for a fraction
of the machinery, and does not foreclose B later, since the field table is most of the spec B
would need anyway.

---

### D13 — TS and Python disagree about five settings. Which side is right?

**What's going on.** The step 7a check compared the two languages on a **fresh install** and
found them identical. That was true and is still true — but it only tested one input. Writing
the TypeScript field table meant reading every rule side by side, which surfaced six settings
where the two disagree once the value is *not* the default.

Confirmed by running both sanitizers over 31 hostile inputs:

| Setting | Input | TypeScript | Python |
|---|---|---|---|
| `rag_corpus_path` | `"../../etc/passwd"` | passes it through | `""` (traversal rejected) |
| `preset_chip_fade_animation_enabled` | `{preset_chip_animation: "carousel"}` | `false` (derived from the new field) | `true` (independent, defaults on) |
| `desktop_app_log_level` | `" verbose "` | `"off"` (exact match only) | `"verbose"` (trims first) |
| `rag_corpus_version` | `123` | `""` (non-strings rejected) | `"123"` (stringified) |
| ~~`ui_scale_manual_profile`~~ | `"IMMERSIVE"` | `"handheld"` | `"immersive"` |

**Correction (2026-08-03):** the `ui_scale_manual_profile` row is **not drift** and was
mis-diagnosed here as case-sensitivity. `normalizeUiScaleProfileId`
([uiScaleProfile.ts:117](../src/data/uiScaleProfile.ts)) already trims *and* lowercases; the
downgrade comes from `SHOW_IMMERSIVE_UI_SCALE = false` two lines later — a deliberate feature
gate on a profile the UI never offers. Aligning it to Python would have re-enabled a hidden
profile. So the count is **five settings** (six diverging cases — `preset_chip_animation`
diverged for both `"carousel"` and `"static"`), of which four were fixed.

**How much does this matter?** Less than the table suggests, and it is worth being precise.
The UI sends exact values from its own controls, so none of these fire in normal use, and
**Python is the gatekeeper for what reaches disk** — `save_settings` sanitizes on the way in,
so the persisted file is always the Python answer. The exposure is a hand-edited
`settings.json`, a value from an older build, or the frontend acting on its own reading before
a save round-trips.

`rag_corpus_path` is the one I would not leave alone: the frontend would show and act on a
traversal path that the backend refuses to store, so the two layers genuinely disagree about
what the knowledge-base location is.

One detail worth knowing: `ui_scale_manual_profile: " Handheld "` **agrees** across both
sides — but only because both happen to land on `handheld`, one by trimming and one by
falling back to the default. Agreement by coincidence, not by shared rule.

**Option A — make Python authoritative and align TS to it.** *(my recommendation)* Python is
what persists, so aligning TS to it removes the possibility of the UI showing something the
backend will not store. Five of the six are one-line changes to the TS normalizers; the sixth
(`preset_chip_fade_animation_enabled`) needs a call on whether the legacy field is derived or
independent — see below.

**Option B — align case by case.** For at least one setting TS is arguably the better
behavior: deriving `preset_chip_fade_animation_enabled` from `preset_chip_animation` keeps the
deprecated field consistent with the live one, where Python can report `fade_enabled: true`
alongside `animation: "carousel"`. Pick per row rather than by language.

**Option C — leave them and document.** Nothing is broken in normal use. Costs nothing now,
and the next person to read both files finds the same six discrepancies.

**Either way, the guard should get stronger.** The 7a fixture only pins the fresh-install
payload. Once the six are settled, the same hostile-input set that found them should become a
second shared contract, so this class of drift fails a test instead of waiting to be noticed.

**Blocks step 7d** (the TypeScript field table). Writing that table now means encoding rules
this decision may change, then rewriting it.

**Locked 2026-08-03: Option A — Python authoritative, TS aligned.** Executed as step **7c**;
`save_settings` decides what reaches disk, so a frontend reading a value the backend will not
store is the broken combination.

**One row went the other way, deliberately.** `preset_chip_fade_animation_enabled` was aligned
**Python → TypeScript** (derived from `preset_chip_animation`) rather than the reverse. Reading
the deprecated key independently produces a self-contradictory payload —
`preset_chip_animation: "carousel"` with `fade_animation_enabled: True` claims fades are on
while a non-fade animation is selected — and TypeScript already derived it on **both** its
normalize and save paths ([settingsPayload.ts:29](../src/utils/settingsPayload.ts)), so Python
was the outlier. Safe where it is read: `MainTabPresetRow` gates on
`presetChipAnimation === "fade" && presetChipFadeAnimationEnabled`, so the flag is only
consulted when the animation is already `fade`. This is the row flagged up front as a genuine
judgement call; applying Option A literally would have made the payload contradict itself.

**And the guard got stronger, as this decision required.**
`tests/contracts/settings-hostile-inputs.json` now holds 19 cases — the inputs that found the
divergences plus the migrations and clamps most likely to drift next — asserted by both
languages. Re-running the 31-input cross-language probe afterwards: **1 divergence remaining**,
and it is the intentional immersive gate.

---

### Maintainer decisions locked — 2026-08-02

The options above stay as the decision record. **Locked below** is what we are
doing and why. Where a locked call disagrees with an earlier recommendation in
**D1–D6**, the locked call wins — some premises were corrected after reading the
current tree (especially **D1b** and parts of **D2** / **D4**).

| Id | Locked decision | Why |
|----|-----------------|-----|
| **D1** | **Finish both missing RPCs** — `merge_pulled_tags_into_routing_orders` and `get_session_rag_chip_candidates` | Both are wiring gaps, not greenfield features. Routing merge reuses `merge_pulled_tag` / `sanitize_model_routing_order` for `text_model_routing_order` and `vision_model_routing_order`. Session RAG already has `suggest_chip_candidates` + tests in `knowledge_base_service.py`; only the public RPC adapter on `class Plugin` is missing. Restores intended UX without reopening Phase 4 visibility / Phase 5 vector ranking. |
| **D2** | **Targeted dead-code cleanup** — delete confirmed orphans; **archive** tiny-model thinking code; keep active Ask, debug, and KB-cancel paths | Proton journal RPCs + service, `apply_tdp` (+ its test-only caller), `log_navigation`, and legacy `capture_screenshot` are safe to remove after preview-suite grep. **`ask_game_ai`** stays — preview suite drives it. **`ask_ollama`** stays — every Ask calls it internally. **`dbg_fe_log`** stays — intentional on-Deck debug bridge. **`cancel_rag_corpus_download`** stays — backend cancel path exists; UI Cancel is planned (**D2 follow-up**). **`thinking_tiny_model_service.py`** is **deleted outright** in `c8ed045`; git history is the archive. To restore the tiny-model thinking blurbs: `git show c8ed045^:py_modules/backend/services/thinking_tiny_model_service.py`. An in-tree archive folder was rejected — the file would still surface in greps and still need explaining, which defeats the point of the cleanup. |
| **D3** | **Option A — characterization tests first, then refactor** | `index.tsx` and `useBonsaiAskOrchestration.ts` have zero automated coverage; `npm test` would pass if every component were deleted. `fakeDeckyRpc.ts` + existing hook tests prove the pattern. Preview and on-Deck QA still required for D-pad and layout. |
| **D4** | **Prune by policy, not by folder count** | Keep evidence linked from current or archived QA docs; keep the latest useful pass per tier and meaningful failure runs. Audit links before deleting anything. Remove only duplicate, incomplete, or truly unreferenced generated runs. Add a retention rule so future `--write` runs do not grow `docs/test-evidence/` without bound. |
| **D5** | **Option A — keep the built-in import graph** | Fast, no dependency, runs on every commit, and matches today's relative-import-only `tsconfig`. Revisit only if path aliases land, unresolved internal imports appear, or a parser-based tool finds real discrepancies. |
| **D6** | **Sequencing below** | Fix real user-visible gaps before shrinking/refactoring; build the safety net before the risky split; measure handoff friction on the improved tree. |
| **D7** | **Delete both screenshot helpers** | `_reencode_oversized_capture` and `_mirror_capture_to_plugin_dir` have no production callers; `_mirror_capture_to_plugin_dir` is an explicit deprecated no-op. One unit test still calls `_reencode` — remove it with the function. Consistent with D2 cleanup; module has behavioral coverage via `_finalize_steam_capture_file`. |
| **D8** | **Harden `build.ps1` (prune + verify)** | Windows deploy path merges without pruning and prints success without checking the artifact landed. `build.sh deploy` already wipes the plugin dir — fix `build.ps1` (and `watch-deploy.ps1` by inheritance): remove stale files, compare `dist/index.js` hash or mtime after upload, fail on mismatch. Blocker before step 8. |
| **D9** | **Done = step 8 (`index.tsx`) only** | Finish the state-before-JSX plan to ~700–800 lines (estimate). `useBonsaiAskOrchestration.ts` (1222 lines, 13 characterization tests) and `MainTab.tsx` (187 lines, prop-threading tax) are follow-ups after step 8 — splitting them now fights the locked order. |
| **D13** | **Option A — Python authoritative, TypeScript aligned (one row inverted)** | `save_settings` decides what reaches disk, so a frontend reading a value the backend will not store is the broken combination. Four settings aligned TS → Python. `preset_chip_fade_animation_enabled` went the other way — reading the deprecated key independently yields a self-contradictory payload and TS already derived it on both its normalize and save paths, so Python was the outlier. `ui_scale_manual_profile` turned out not to be drift at all but the `SHOW_IMMERSIVE_UI_SCALE` gate; left alone. Guard extended to a 19-case hostile-input contract asserted by both languages. Executed as step **7c**. |
| **D12** | **Option A — declarative field table per language** | The two languages agreed exactly on fresh-install defaults, so this is cost reduction, not a bug fix. Most settings are one of five plain shapes; those become one-line rows, and the genuinely custom ones stay functions with a stated reason. Python side shipped as step **7b** (19 rows, 32 → 20 defs, 6,659-input differential test, zero mismatches). Full codegen (Option B) was not taken: its only extra guarantee is that the languages cannot disagree, and it has to be paid for by future settings churn — the field table is most of the spec it would need anyway, so it stays available later. |
| **D11** | **Option A — remove `_coerce_instance` and `_ensure_background_state`** | Both exist for a loader that passes the class instead of an instance; `plugin.json:6` pins `api_version: 1`, where the call is an identity function across 55 sites. The fallback covered 11 of 29 runtime attributes, and if it had ever fired it would have built a fresh `Plugin` and discarded the in-flight Ask — a latent bug, not a safety net. Removed 103 lines with the RPC surface unchanged at 50. Executed as step **6b**, ahead of step 7, because step 7 depends on the same instance-lifetime assumption. |
| **D10** | **Preview/tests every commit; on-Deck D-pad for modal extractions only** | `tsc` + `npm test` + preview smoke on every step 8 commit. On-Deck D-pad required for character picker, models hub, desktop note, and plugin help extractions only — not state-only commits. Tier 3 preview does not cover those modals; focus-graph tests upfront rejected. |

**Step labels.** The numbers in this list are the **only** authoritative step labels; cite them
verbatim in commit subjects, and keep one label to one commit series.

> **Collision resolved 2026-08-03.** Commit `b5b8e95` carries the subject *"Step 7b: evaluate
> the cost of shared-schema mechanism for settings"*, which clashes with **7b** below (the
> Python field table). Its subject also does not describe its diff — the commit adds five
> unrelated audit and planning documents, while the settings evaluation it describes is step
> **7a** (`6651e45`). History was left alone rather than rewritten; read this list, not that
> subject line. The settings work is `6651e45` → `3f44368` → `65fc2bf` → step 7c.
>
> Same pass renamed `docs/audit/09-token-streaming-review.md` to `10-…` — it had been committed
> alongside `09-strategy-spoiler-false-positive.md`, giving two different documents the same
> ordinal. Nothing linked either file, so the rename was safe.

**Execution order (locked, amended 2026-08-03):**

1. **Record decisions** — this section; turn accepted work into implementation rows as work ships. *(done — `dcbcccf`, `e2111f9`, plus this amendment)*
2. **D1 — wire both RPCs** — **done 2026-08-02**, see Bugs § *Fixed*. D1a routing merge (`510139d`) and D1b session RAG adapter, 13 new unit tests between them. On-Deck QA still open: **ROUTING-MERGE-01** and **SESSION-RAG-CHIPS-01** in [testing.md](testing.md). **This is feature work, not refactor** — separate commits, not labeled behavior-preserving, and it changes what `useBonsaiAskOrchestration.ts` does at runtime. Sequenced before step 5 on purpose so the characterization tests capture intended behavior rather than the silent-fallback bug.
3. **D2 — targeted cleanup** — **done 2026-08-02** (`309c386`, `ebdc0f2`, `c8ed045`, `45cb0ff`, `d93027b`, `36f34cd`). Removed: 5 Proton-journal RPCs + their service, `thinking_tiny_model_service.py`, `log_navigation`, `capture_screenshot`, and the TDP sysfs write path. Kept per D2: `ask_game_ai`, `ask_ollama`, `dbg_fe_log`, `cancel_rag_corpus_download`. RPC surface 57 → 50. Two things the audit got wrong are recorded in [05-plan.md](audit/05-plan.md) §1.1: the journal service was not dead (`clear_plugin_data` needed its file wipe) and `find_amdgpu_hwmon` was not apply-only (`read_current_tdp_watts` calls it). The kmsgrab orphans this pass left behind were cleared later the same day under **Cleanup candidates** (`4a26cfa`).

   **Preview-suite gate — first pass was incomplete.** Grepping `tests/preview-suite/` and `scripts/` for *symbol* names returns zero hits for `proton_experiment`, `apply_tdp`, `log_navigation`, `capture_screenshot`, `dbg_fe_log`, `cancel_rag_corpus_download`, `thinking_tiny`, and 22 hits for `ask_game_ai` across five tiers (keep, per D2). **That grep missed file-level references.** `tests/preview-suite/unit-gates.json:25` runs `tests/test_tdp_sandbox_sysfs.py` by filename under a gate tagged `TDP-APPLY`, and `tier-manifest.json:96` advertises "sysfs TDP apply + clamp asserts" in the Tier 2 description. Only two test files are referenced this way — the other is `test_capabilities.py` — so no other deletion in this pass was affected. **When checking whether a deletion is preview-safe, grep the preview suite for the test filename as well as the symbol.**
4. **Mechanical refactors** — **done 2026-08-02** (`3813764`, `666e3e3`, `2156441`, `ef65f8e`), one behavior-preserving commit each, all gates green between. Four stale doc claims fixed and the self-declared-archived RAG analysis moved to `archive/`; `refactor_helpers.py` shim deleted and its 9 importers repointed; `settingsAndResponse.ts` barrel deleted and its 22 importers repointed (`tsc --noEmit` is the safety net here); `settingsPayload.ts` split, with reply-text formatting moved to `appliedTuningText.ts`.

   **Deploy gate — passed, and it mattered.** The shim was referenced by `build.sh`, `build.ps1` and `verify-decky-plugin-zip.sh`, none of which any test covers. Deployed to the Deck and confirmed `bonsAI plugin loaded!`. **The first load proved nothing**: the deploy scripts copy without pruning, so the deleted shim was still sitting on the Deck from an earlier deploy and would have satisfied any import that had been missed. Deleting it plus `__pycache__` on-device and restarting `plugin_loader` is what made the check real. See [05-plan.md](audit/05-plan.md) §1.3 — **any future deletion of a Deck-facing Python file needs the same step.**
5. **D3 — safety net** — **done 2026-08-02.** 22 new tests (suite 217 → 239): `useBonsaiAskOrchestration.test.ts` covers submit guards, request payload, the invalid / blocked / completed / thrown-error branches, polling, cancel, and thread archiving; `index.test.tsx` covers the Decky contract, a real mount, settings wiring, the tab set, and error containment. Both **mutation-checked** — three deliberate breaks in each turn the suite red — because a characterization test that cannot fail is worse than none. Three harness defects had to be fixed first and are recorded in [04-coverage.md](audit/04-coverage.md): vitest collected only `*.test.ts` so **a `.tsx` test could never run**, jsdom lacks `ResizeObserver` so the tree silently rendered the ErrorBoundary fallback, and `globals: false` left renders leaking between tests.
5b. **D3 — entry-point split, in progress 2026-08-02.** `index.tsx` 1955 → 1709 across three commits: `984498e` moved the stateless shell pieces (error boundary, localStorage helpers, tab titles) to `src/features/plugin-shell/`; `26c67e6` moved voice Ask input to `src/features/voice/`; `fda8051` moved the try-order modal to `src/features/model-routing/`. Destination follows REFACTOR-PLAN §3.4 (vertical slices), not the type-buckets.

   **Measured finding that redirected the work:** extracting the tab JSX — the obvious first move — is a *lateral* change. The six tab payloads thread 94 (`mainTab`), ~30 (`ollamaTab`), 27 (`settingsTab`) and 21 (`developerTab`) props out of `Content`'s scope, so moving one to its own module means declaring those props a second time as an args type. `index.tsx` would shrink while the codebase got worse. The threading is a *symptom* of state living in `Content`; each state extraction deletes props instead of copying them, and the tab JSX becomes cheap to move only afterwards. **Do the state first.**

   **Remaining in `Content`:** character-picker modal (~76 lines, ~11 deps), Ollama models hub (~84, ~10), desktop-note modal (~49), plugin-help modal (~11), plus connection/IP, session-reset, UI-scale and error-capture state. Then the tab payloads.

5c. **D8 — harden `build.ps1`** — **done 2026-08-03.** Three changes: the plugin dir is
   `rm -rf`'d before copy (matching `build.sh deploy`, and the remote temp dir is wiped
   first so a failed run cannot ship stale files); every `ssh`/`scp` is exit-code checked
   via `Assert-LastExit` — **unchecked native exit codes were the actual false-pass
   mechanism**, since PowerShell does not stop on a non-zero `scp`; and the deploy is
   verified by SHA-256 after upload. `watch-deploy.ps1` inherits all of it.

   **Verification hashes all 52 shipped code files, not just `dist/index.js`.** The locked
   text suggested `dist/index.js` alone, which does not hold: a Python-only change leaves
   the bundle byte-identical to the previous deploy, so an index.js-only check would pass
   while nothing new landed — the same false pass, one layer down. The list is
   `package.json`, `plugin.json`, `main.py`, `dist/index.js`, and every non-`__pycache__`
   `py_modules/**/*.py`; the remote side is one `sha256sum` call (~2.5 KB command line).
   `plugin_loader` is restarted **even when verification fails** — leaving it stopped would
   break every other Decky plugin on the device, not just this one — and the script then
   exits non-zero with a per-file `MISSING` / `STALE` list.

   **Found while doing it — `watch-deploy.ps1` could not parse under Windows PowerShell
   5.1.** No `.ps1` in `scripts/` has a BOM, so 5.1 decodes them as CP1252; a UTF-8 em-dash
   inside a **double-quoted string** becomes `U+201D`, which PowerShell accepts as a string
   delimiter, and parsing dies at the *next* line. Reproduced with a two-line script, then
   confirmed by parsing every `scripts/*.ps1`: `watch-deploy.ps1:44` was the only live
   casualty (em-dashes in *comments* are harmless, which is why `setup-dev.ps1` and
   `revert-dev.ps1` are fine). Both deploy scripts are ASCII-only now with a comment saying
   why. **New file rule: no non-ASCII in `.ps1` strings.**

   **Verified on-device the same day**, two deploys. Both printed `Verified 52 files on the
   Deck.` and exited 0, with `bonsAI plugin loaded!` at 00:47:29 and 00:51:24 and no
   `Traceback`/`ERROR` in the log.

   **The prune was proven with planted sentinels, not by inference.** The obvious witness —
   the stale `refactor_helpers.py` from 2026-08-02 — proves nothing, because it was
   *hand-deleted* on-device that day; it was already absent before any of this. So a
   `STALE_SENTINEL.py` and a whole `py_modules/backend/stale_dir/ghost.py` were planted on
   the Deck first: after the deploy, both files **and the directory** are gone. `__pycache__`
   likewise cannot outlive a deletion — the two dirs on the device are regenerated by the
   loader after the copy.

   **Regression found and fixed during that testing.** The first version of this script
   opened with `$ErrorActionPreference = "Stop"`. Under 5.1 that promotes a *native command's
   stderr* to a terminating `NativeCommandError` whenever the script's output is redirected,
   so `.\scripts\build.ps1 2>&1 | ...` died on a `pnpm`/node **deprecation warning** before
   reaching the Deck. It is removed: every failure path already calls `exit 1` explicitly, so
   the preference bought nothing, and the two cmdlets whose silent failure would corrupt the
   run (`Set-Location`, `Get-FileHash`) carry their own `-ErrorAction Stop`. Failure messages
   are `Write-Host` red rather than `Write-Error` so the exit code is the single signal.
   `watch-deploy.ps1` now checks `$LASTEXITCODE` after invoking the deploy — it previously
   caught only exceptions, so an `exit 1` would have been swallowed and the watch loop would
   have carried on as if the Deck were current: the same false pass, one level up.

   **The false-pass fix then proved itself for real, later the same day.** A step 7 deploy was
   attempted while the Deck had drifted to sleep. The script failed at the first `ssh`
   (exit 255) and reported *"Deploy aborted - the Deck may be asleep or unreachable"* with a
   non-zero exit. Before D8 that exact run would have attempted every `scp`, ignored all of
   their failures, and printed **Deployment complete!** — the original bug, reproduced by
   accident and now caught. **DEPLOY-VERIFY-02 upgraded to Verified.**

   **Remaining gap:** the `STALE` branch of the hash compare is still simulation-tested only —
   it needs a deploy where files land but with stale content, which has not happened naturally.
   **DEPLOY-VERIFY-01…03** in [testing.md](testing.md).

5d. **D7 — delete screenshot helpers** — **done 2026-08-03.** `_reencode_oversized_capture`
   and `_mirror_capture_to_plugin_dir` removed from `screenshot_media.py`. Preview gate run
   on **symbols and the test filename** per the step-3 lesson: clean. The `_reencode` unit
   test asserted "a file that needs no work is returned untouched"; that assertion is folded
   into `test_finalize_steam_capture_file_passes_through_missing_file`, which covers the
   equivalent guard on the live function ([screenshot_media.py:245](../py_modules/backend/services/screenshot_media.py))
   and was previously untested. Python suite stays at 413.

   **Left alone deliberately:** `take_steam_game_screenshot` still declares a
   `plugin_runtime_dir` parameter that nothing in its body reads — it was the mirror
   helper's argument. Dropping it changes a public signature, which is not what D7 authorized;
   it belongs with the step-6 `main.py` inventory pass.

6. **2.3 — `main.py` extraction investigation** — **done 2026-08-03**, read-only, no code
   changed. Inventory: [07-mainpy-inventory.md](audit/07-mainpy-inventory.md).

   **Answer to §2.3's question ("thin facade or logic in both layers?"): both, and not where
   the file claims.** By count it reads as a facade — 27 of 96 methods are ≤8 lines. By
   volume it is not: the six largest public RPCs are **706 lines, 24% of the file**, and ten
   methods hold 869 lines (29% of the file in 10% of its methods). Split: 1767 lines across
   the 50 public RPCs, 895 across 46 private helpers, ~210 in imports and class constants.

   **One outright contract violation.** `main.py:6` says the file *"Does not: Own Ollama
   HTTP"*. `test_ollama_connection` ([main.py:1038](../main.py), 178 lines) is the only
   `urllib` consumer in the file — it opens `/api/version`, `/api/tags` and `/api/ps`
   directly and derives a VRAM-share ratio from the response. About 70 lines of transport
   belong in `ollama_service.py`; the loopback-recovery policy and logging stay.

   **Four other findings**, each with the destination named in the doc: the background-state
   dict shape is declared **four times** (one copy omits three keys — latent, not live, since
   `_merge_partial_into_background_status` backfills them); three near-identical local-command
   dispatch blocks in `start_background_game_ai`; four repetitions of cancel-task-and-reset in
   `clear_plugin_data`; and `abort_background_game_ai` closing a raw `urllib` handle
   cross-thread. Ranked extraction order with risk is §8 — **none of it was executed**, per
   "investigation, not yet a refactor".

   **Raised as [D11](#d11--mainpy-carries-a-compatibility-shim-for-a-loader-you-may-never-use-remove-it):** `_coerce_instance` is a no-op under `api_version: 1` and is called
   at **55 sites**, with a 35-line `_ensure_background_state` partner. Biggest mechanical
   shrink available (~90-120 lines) but it needs a maintainer call, not a refactor decision.

   **Two §2.3 premises were stale** and are corrected in the doc: `main.py` is 2971 lines not
   3021, imports 29 of 40 services not "35 of 42", and the coverage claim ("5 tests, all
   locking, none RPC behavior") is now 8 test files, two of which do test RPC behavior — those
   two are the pattern to copy for the extractions above. Still true: **none of the ten
   largest methods has a behavioral test.**
6b. **D11 — remove the legacy-loader compatibility layer** — **done 2026-08-03.**
   `_coerce_instance` (55 call sites) and `_ensure_background_state` (35 lines) deleted;
   `main.py` **2971 → 2865** (−103 lines, −2 methods), **RPC surface unchanged at 50**. The
   53 `plugin = Plugin._coerce_instance(self)` aliases became direct `self` use, not
   `plugin = self`, so no vestigial indirection is left behind.

   **The shim had a service-side half** that [07-mainpy-inventory.md](audit/07-mainpy-inventory.md)
   had not found: [ollama_ask_service.py:81](../py_modules/backend/services/ollama_ask_service.py)
   called `plugin_inst._ensure_background_state()` before touching `_active_request_id()`,
   and `tests/test_ollama_ask_service.py` carried a matching no-op on its `_FakePlugin`.
   Deleting only the `main.py` side would have raised `AttributeError` on **every Ask** with
   the unit suite still green — the fake satisfied the call. Both removed together.

   **Verified as mechanical, not merely untested.** A token-level differ compared the files
   before and after: with the intentionally deleted regions removed, both sides yield
   **15,446 identical tokens**, 236 `plugin`/`plugin_bg` NAME tokens become `self`, and
   there are **zero** other differences. This mattered — 8 test files touch only a fraction
   of the 53 methods changed, and a plain find-and-replace would have corrupted the
   `"plugin.lifecycle"` / `"plugin.data_clear"` log event names and docstring prose. Then
   413 Python tests, then a deploy: `bonsAI plugin loaded!`, zero `Traceback`/`ERROR`,
   deployed `main.py` at 2865 lines. **On-Deck functional QA of the Ask, voice and
   knowledge-base paths is still open** — **D11-SHIM-01** in [testing.md](testing.md).

7a. **2.2 — settings recon + drift guard** — **done 2026-08-03.** The audit deferred this
   design deliberately ([05-plan.md](audit/05-plan.md) §2.2: *"Do not design the shared-schema
   mechanism from this document"*), so the first move was measuring rather than building.

   **Baseline: there is no drift.** Both sides were executed and their outputs diffed —
   Python `sanitize_settings({})` against TypeScript `normalizeSettings({})` — and they agree
   **exactly**: 40 keys each, no key on one side only, **zero value differences**. That
   reframes the work: step 7 is not fixing a bug, it is removing a per-setting cost and the
   standing risk that the two hand-maintained shapes stop matching. It also makes the
   remaining refactor verifiable — any mechanism must reproduce exactly this payload.

   *(An early probe appeared to show `capabilities` differing. That was the probe's own bug —
   a replacer array passed to `JSON.stringify` filters keys at every nesting level, not just
   the top. Re-measured before reporting.)*

   **Shipped: a drift guard, not a redesign.** `tests/contracts/settings-defaults.json` is the
   fresh-install payload, and each language asserts against it in its own runner — no
   cross-runtime plumbing. Python: `tests/test_settings_contract.py`. TypeScript:
   `src/data/bonsaiSettingsContract.test.ts`. Three assertions each: exact equality, key-set
   equality reported separately so a missing key reads as a key rather than a diff, and
   **idempotency** — feeding the defaults back in must not change them, which specifically
   guards the two legacy migrations (`preset_chip_animation` reading
   `preset_chip_fade_animation_enabled`, `screenshot_attachment_preset` reading
   `screenshot_max_dimension`), where a re-firing migration would rewrite a saved value on
   every load.

   **Mutation-checked**: mutating one fixture value fails both halves. Suites 413 → 416
   Python, 239 → 242 frontend. `tsc` clean.

   **Next decision: [D12](#d12--settings-live-in-two-languages-how-far-do-you-want-to-go-to-fix-that)** — how far to go on reducing the six-file cost. Step 7b is blocked on it.

7b. **D12 — Python field table** — **done 2026-08-03.** [D12](#d12--settings-live-in-two-languages-how-far-do-you-want-to-go-to-fix-that) locked Option A. 19 settings whose rule is a plain
   shape (boolean defaulting false, boolean defaulting true, enum with a default, trimmed
   length-capped string, and a variant that stringifies non-strings) are now one-line rows in
   `_SIMPLE_FIELDS` instead of a hand-written function each. Adding such a setting was two
   edits in this file — write a `sanitize_*`, then wire it into the returned dict — and is now
   one row. Top-level defs **32 → 20**.

   **Line count barely moved (477 → 458)** and that is the honest number: the shape builders
   and the comments explaining why each remaining function is exempt cost most of what the
   collapsed functions saved. The value is the per-setting edit cost and having the five
   shapes named once, not the size of the file.

   Two collapsed sanitizers keep a named function because `ollama_ask_service` imports them
   directly; they delegate to their table row so the rule still has one definition. The exempt
   settings are now annotated with *why* — reconciled in pairs, options supplied by `Plugin`
   class constants, reads a legacy key, structured/list-valued, traversal rejection, or owned
   by another service.

   **Verified by differential test, not by the suite alone.** The pre-refactor module was
   loaded from git alongside the new one and both run over **6,659 inputs** — every key set
   individually to each of ~60 hostile values, non-dict payloads, 4,000 random combinations,
   both migration pairs exhaustively, and the latency/timeout pair across its clamp
   boundaries. **Zero mismatches.** Mutation-checked: flipping one row's default diverges
   6,643 of them. This mattered — the predicates are not interchangeable (`is True` vs
   `is not False` differ for every non-boolean, and the two string kinds differ for
   non-strings), and the 7a fixture only pins the empty-input case.

   A dead `sanitize_screenshot_max_dimension` was deleted first, in its own commit, so this
   diff stayed purely structural.

7c. **D13 — align the five diverging settings** — **done 2026-08-03.** [D13](#d13--ts-and-python-disagree-about-five-settings-which-side-is-right) locked Option A
   (Python authoritative). Four settings changed on the TypeScript side: `desktop_app_log_level`
   now trims before matching, `rag_corpus_path` rejects `..` traversal as Python always did,
   `rag_corpus_version` accepts an unquoted number, and both string coercions share one helper
   documenting exactly where parity stops (scalars are exact; booleans, objects and arrays are
   garbage-in cases both sides now discard rather than pretending to match Python's `repr`).

   **One row was aligned the other way on purpose** — `preset_chip_fade_animation_enabled` is
   now derived in Python too. See D13 for why applying Option A literally there would have made
   the payload contradict itself.

   **One row was not drift at all.** `ui_scale_manual_profile` was mis-diagnosed in the original
   D13 write-up as case-sensitivity; the TS normalizer already trims and lowercases, and the
   downgrade is the `SHOW_IMMERSIVE_UI_SCALE = false` feature gate. Changing it would have
   re-enabled a hidden profile. Corrected in D13 rather than quietly dropped.

   **Guard strengthened, per D13's own condition:**
   `tests/contracts/settings-hostile-inputs.json`, 19 cases, asserted by
   `tests/test_settings_hostile_contract.py` and
   `src/data/bonsaiSettingsHostileContract.test.ts`. Each case pins only the keys it is about,
   so a failure names the broken rule instead of dumping a 40-key diff. Python 416 → 418,
   frontend 242 → 263. Re-running the 31-input probe after the fixes: **1 divergence left**, the
   intentional immersive gate, documented in [tests/contracts/README.md](../tests/contracts/README.md).

7d. **D12 — TypeScript field table** — **done 2026-08-03.** The mirror of step 7b.
   `SIMPLE_FIELDS` in [bonsaiSettingsNormalizers.ts](../src/data/bonsaiSettingsNormalizers.ts)
   now declares **26 settings** in one row each; 15 hand-written normalizers collapsed into
   them. Exported functions **36 → 16**, file 457 → 441 lines. Same honest caveat as 7b: the
   value is the per-setting edit cost, not the line count.

   **The TS table has a shape the Python one does not.** Some rows delegate to a named function
   because that field's option list or feature gate lives in its own module — `reply_verbosity`,
   `reply_language`, `ollama_keep_alive`, and importantly `ui_scale_manual_profile`, whose
   `normalizeUiScaleProfileId` also applies the `SHOW_IMMERSIVE_UI_SCALE` gate. Inlining that as
   a plain enum row would have silently dropped the gate — the same mistake the original D13
   write-up nearly made. The row is annotated to say so.

   **Four `DEFAULT_*` imports became unused** and were removed: the boolean defaults had been
   stated twice, once as a constant and once inside the predicate. The kinds encode them once.

   **`as const satisfies { [K in keyof BonsaiSettings]?: (value: unknown) => BonsaiSettings[K] }`**
   makes the table self-checking: a row whose coercer returns the wrong type for its key, or
   names a key that is not in `BonsaiSettings`, fails `tsc` rather than a test.

   **Verified by differential test**, matching 7b's rigor. The pre-refactor module was copied in
   beside the new one and both run over **~6,000 comparisons** — every key set individually to
   each of ~75 hostile values, non-object payloads, 3,000 seeded random combinations, all three
   migration pairs exhaustively, and the latency/timeout pair across its clamp boundaries. Zero
   mismatches; mutation-checked (flipping one row's default fails all five groups). Temporary
   copy and test removed afterwards. All four gates green: `tsc`, 263 frontend, 418 Python,
   `npm run build`.

   A dead `normalizeScreenshotMaxDimension` — the exact twin of the Python function deleted in
   step 7b — went first in its own commit.

**Step 7 is complete.** Both languages now declare their simple settings as tables, the shape
is pinned by two shared contracts, and the five D13 divergences are resolved.

**Not yet deployed.** Steps 7a–7d are verified by `tsc`, 263 frontend tests, 418 Python tests,
`npm run build`, and two differential tests — but the Deck was asleep when the deploy was
attempted, so this work has **not run on-device**. Settings load on every plugin start
(`_main` → `_maybe_app_log` → `load_settings` → `sanitize_settings`), so a deploy plus a
`bonsAI plugin loaded!` check is a real smoke of it. Do that before step 8, together with the
still-open **D11-SHIM-01** pass. — REFACTOR-PLAN §3.1, the highest-value item in the audit and the best-covered by existing tests (`tests/test_settings_service.py` asserts per-setting round-trips). Expect that suite to break on shape, not behavior — rewrite the assertions, do not contort the design.
8. **D3 — entry-point split, continued** — resume from **5b** above (after **5c** deploy hardening). Remaining, in the order they get cheaper: character-picker modal (~76 lines, ~11 deps), Ollama models hub (~84, ~10), desktop-note modal (~49), plugin-help modal (~11), connection/IP, session-reset, UI-scale, error-capture — **then** the six tab payloads. **`tsc` + `npm test` + preview smoke every commit** per locked **D10**. **On-Deck D-pad pass only for the four modal extractions** (not state-only commits). **Done scope = `index.tsx` only** per locked **D9** — `useBonsaiAskOrchestration.ts` and `MainTab.tsx` are follow-ups after step 8.
9. **KB download Cancel button** — wire `cancel_rag_corpus_download` in `KnowledgeBaseSection.tsx`; D-pad row in `testing.md` / `testing-manual.md`.
10. **D4 — evidence hygiene** — link audit, prune orphans only. The retention rule must live **in the script that writes evidence**, not in a doc — a rule that depends on remembering is not a mechanism.
11. **Deferred friction test** — run Phase 2c newcomer task on the post-refactor tree; file `docs/audit/03-friction.md`.

**Amendment rationale (2026-08-02):** steps 6 and 7 were missing from the original
order. As first written it ran the riskiest, least-covered work (entry-point
split) while skipping the highest-value, best-covered work (settings SSOT), and
left step 8 without the `main.py` inventory it needs. Both are restored ahead of
the split.

**Amendment rationale (2026-08-03):** **D7–D10** locked after code verification.
**D8** inserted as **5c** before step 8 — Windows `build.ps1` merge-without-prune
was the real false-pass class; **D7** as **5d** is a quick cleanup. **D9** narrows
"done" to step 8 only. **D10** replaces "on-Deck every commit" with modal-only
D-pad gating so state extractions are not blocked on full device QA.

**Session results — 2026-08-02.** Steps 1–5 complete, step 6 partly done, all
Cleanup candidates executed. Gates green at every commit.

| Measure | Before | After |
|---|---|---|
| RPC surface (`class Plugin`) | 55 | 50 |
| `main.py` | 3021 | 2971 |
| `index.tsx` | 1955 | 1709 |
| Python tests | 399 | 413 |
| Frontend tests | 217 (44 files) | 239 (46 files) |

Shipped: both missing RPCs wired (session RAG chips and pulled-tag routing merge
had **never worked** on-device); dead backend from three removed features
deleted; two re-export shims removed and their 31 importers repointed; the two
files that blocked the split given mutation-checked characterization tests.

**Four things the audit or the tooling got wrong**, all recorded with evidence
so they are not rediscovered:

1. `proton_experiment_journal_service.py` was **not** dead — `clear_plugin_data`
   needed its file wipe. Deleting it as written would have broken *Clear all
   data* on-device with every test still green.
2. `find_amdgpu_hwmon` was **not** apply-only — `read_current_tdp_watts` calls
   it, so removing it would have killed the current-TDP read Ask uses.
3. The preview-suite gate grep searched **symbols only**; the suite also names
   test *files*. Grep both. ([05-plan.md](audit/05-plan.md) §1.1)
4. `vitest.config.ts` collected only `*.test.ts`, so a `.tsx` test **could never
   run**. The 44 untested component files were a tooling gap, not a discipline
   gap. ([04-coverage.md](audit/04-coverage.md))

**Outstanding on-Deck QA from this session:** **ROUTING-MERGE-01** and
**SESSION-RAG-CHIPS-01** in [testing.md](testing.md) — both features are
implemented and unit-tested but have never been exercised on a Deck.

**Corrections to audit premises (for implementers):**

- **D1b:** `suggest_chip_candidates` ([knowledge_base_service.py:685](../py_modules/backend/services/knowledge_base_service.py)) and `session_rag_chip_candidates_to_rpc` (`:744`) already exist with four tests in `tests/test_knowledge_base_service.py`. **`main.py:163-164` already imports both and never calls them** — the work was interrupted between the import and the method. The frontend sends `[appId, appName, shortcutName]` ([sessionRagChipCandidates.ts:55](../src/utils/sessionRagChipCandidates.ts)), which matches the service signature exactly. This is an adapter of roughly ten lines. Do not redesign ranking before wiring it.
- **D2:** `ask_game_ai` is not dead — `tests/preview-suite/` calls it extensively. `ask_ollama` is the internal Ask engine, not an orphan RPC.
- **D4:** Six of nine evidence folders are not all unreferenced — several are cited from [archive/testing-results-2026.md](archive/testing-results-2026.md) and [archive/testing-failures-2026.md](archive/testing-failures-2026.md). Prune only after a link audit.

---

## Cleanup candidates — locked and executed 2026-08-02

Dead or hazardous code found during the 2026-08-02 refactor. All five rows were
locked by the maintainer and, except the deferred one, executed the same day.
Nothing here changed product behavior.

| # | Locked decision | Outcome |
|---|---|---|
| 1 | **Delete the one-shot migration scripts** | `071221e` — `scripts/extract_ollama_section.py` and `scripts/trim_settings_tab.py` gone. They rewrote `SettingsTab.tsx` / `OllamaWhereAiRunsSection.tsx` from source text hardcoded inside the scripts; running either would have reverted real components and reintroduced the deleted `settingsAndResponse` barrel import. Keeping them was the hazard |
| 2 | **Delete the orphaned kmsgrab capture sub-tree** | `4a26cfa` — six functions, not the four enumerated. `_build_kmsgrab_argv` was called only by `try_kmsgrab_screenshot`, and `gamescope_session_active` only by `_desktop_session_active`, so stopping at four would have left the same problem one node deeper. Preview gate run on **symbols and filenames** both, per the TDP lesson: clean. Live capture paths untouched |
| 3 | **Remove the `journal_text` plumbing** | `a029c2d` — parameter dropped from `stack_context_blocks`, caller stopped passing `""`. Its ordering test asserted a three-block arrangement that can no longer occur and was replaced with one covering what the stacker still guarantees. The duplicate roadmap note under Planned is collapsed |
| 4 | **Remove the `sysfs_writes` reader and field; keep the preview hook empty** | `a9353cc` — `read_sandbox_sysfs_writes` and the `get_input_transparency` field gone; `sandbox_sysfs_root` stays because `find_amdgpu_hwmon` needs it. `getSysfsWrites` kept returning `[]`: the in-repo runner never calls it, but `__bonsaiTestHooks` is consumed by DPS scenarios outside this repo, so the contract stands |
| 5 | **Defer the `docs/archive/` broken links to D4** | Not actionable here by decision. 272 relative links in historical files point at a `docs/` layout that no longer exists; fixing them is evidence hygiene, not code legibility. Folded into **D4** — see [06-doc-triage.md](audit/06-doc-triage.md) § Link audit. Live docs are already link-clean |

**Found while executing, deferred to D7 (locked 2026-08-03, executed same day):**
`_reencode_oversized_capture` and `_mirror_capture_to_plugin_dir` in
`screenshot_media.py` — no production callers; deleted in execution-order step **5d**.

---

## QA backlog

Maintainer on-Deck / qualitative work — **not** active feature engineering. Detail and checklists: [testing.md](testing.md), [testing-manual.md](testing-manual.md).

- ★★ **Device QA — Tier 0–1:** Execute Tier 0 smokes (SMOKE-A, C, F) then Tier 1 (SMOKE-B, E, H); update coverage with Pass / Partial / Fail + build id. Tier 2+ before release.
- ★ **VAC / `bonsai:vac-check` (Phase 1) — on-device QA:** Implementation complete; finish **VAC-02…06** after Tier 0 **SMOKE-F** passes.
- ★★★ **QAMP verification checklist:** Per-game profile on/off, QAM Performance reopen, Steam restart/reboot, GPU-clock recommendation paths. See [testing-manual.md](testing-manual.md) § QAMP.
- ★★ **Prompt testing pass:** Broader systematic validation beyond the shipped prompt-testing MVP matrices.

---

## Planned

Stars are **effort/risk** within bands. Grouped by **horizon**; **within each horizon sorted ascending by star rating**.

- **Near-term:** Incremental product work, bounded research spikes.
- **Medium-term:** Larger features inside the plugin + user-hosted stack.
- **Long-term:** ★★★★★★ scope and/or ★★★★★ work gated on upstream APIs or broad surface area.

**GitHub tracking:** Each **Planned** item rated **★★★★★** or **★★★★★★** includes a placeholder link to **[bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues)** (replace with a specific issue URL when created).

**Planned titles:** Short **noun-first** label (about 3–6 words); secondary context in parentheses. Detail under **Goal** / **Primary work**.

### Near-term

Within this section: ascending stars (★ → ★★★★).

- ★ **Intent packs later review** (keep / quiet / Developer — discovery leftover 2026-07-30)
  - **Goal:** Decide whether the quiet intent-pack search aliases should be deleted, left quiet, or revived under Developer.
  - **Proton journal half closed 2026-08-02.** The 5 journal RPCs and `proton_experiment_journal_service.py` are gone (`309c386`, `ebdc0f2`); only the file wipe survived, relocated into `plugin_data_reset.py` because **Clear all data** still needs it. The last of the plumbing — the `journal_text` parameter on `stack_context_blocks` — was removed on the Ask path in the cleanup pass. Reviving the feature now means rebuilding the store, not re-enabling a flag.
  - **Not in scope:** rewriting unified search ranking; re-shipping journal inject without a redesign.
- ★★ **Preset chip expansion** (streaming / LAN / Steam Input — incremental)
  - **Baseline shipped:** `PRESET_PROMPTS` in [`src/data/presets.ts`](../src/data/presets.ts).
  - **Goal:** Add or refresh preset strings as related features land — content tuning only.
  - **Not in scope:** treating each string batch as a versioned feature ship. AppID/session RAG chips → shipped (**Session RAG preset chips**).
- ★★ **Spoiler confidence chip** (transparency estimate — decisions locked 2026-07-29)
  - **Goal:** Concise Show details context-chip estimate of topic spoiler likelihood on **all Ask modes** — chip label `Spoiler risk: med` (bands `low` / `med` / `high`; keep ≤ ~18 chars).
  - **Status:** Decisions locked; ready to implement (standalone). Distinct from hybrid retrieval.
  - **Discovery locked (2026-07-29):** bands only; score from genre + intent + KB `section_type` + entity match + optional model tag `<bonsai-spoiler-risk>` (~60% when parsed); always show under Show details; v1 transparency-only (no fencing change); heuristic ASAP while streaming; no parallel rater Ask.
  - **Related:** **User-adjustable spoiler fencing**; **Unfenced spoiler feedback**.
  - **Not in scope (v1):** Calibrated ML probability; percent chip copy; parallel rater Ask; changing fencing from this chip.
- ★★ **Unfenced spoiler feedback** (thumbs-down category)
  - **Goal:** After thumbs-down, refinement chip for **unfenced spoilers** (and optional over-fenced sibling). Improves future Asks — does not fix the current turn.
  - **Depends on:** reply micro-actions; **Spoiler confidence chip** signals useful later.
- ★★ **User-adjustable spoiler fencing** (hide by risk band)
  - **Goal:** Settings control for when to apply tap-to-reveal / fence masking from estimated risk — e.g. hide when risk ≥ **high** / **med** / **low**, or **never hide**.
  - **Depends on:** **Spoiler confidence chip**; shipped `strategy_spoiler_masking_enabled`.
- ★★ **Thinking effort control** (Settings Off / Low / Medium / High)
  - **Goal:** User-adjustable Ollama thinking effort mapped to `think: false | "low" | "medium" | "high"` (global v1).
  - **Depends on:** **Soft** `num_predict` **+ thinking budget** (Bugs).
  - **Not in scope:** shipping Settings before the soft-budget bug fix.
- ★★★ **Dynamic keep-alive / smart unload** (research spike — discovery locked 2026-07-29)
  - **Goal:** Research-only: hold models loaded vs unload when a game takes focus, safely on Deck APU shared memory? Spike decides go/no-go. No ship commitment until spike writes outcome.
  - **Not in scope:** promising true per-game VRAM detection; production unload before spike doc.
- ★★★ **Per-mode latency timeouts** (warn vs hard limit profiles)
  - **Goal:** Separate warning and timeout values per selected mode.
  - **Depends on:** Mode selector (shipped).
- ★★★ **Custom model in Pull Models picker** (custom pull + Ask pin + New badges)
  - **Goal:** Pull any valid Ollama-library tag not in curated catalog; **Use for Ask** pin; **New** badge (released within 30 days). Custom pull is backup to living overlay; background catalog refresh when stale.
  - **Primary work:** Phase 1 Pull UI + Ask pin + routing prepend + New badge; Phase 2 hooks to future text model chains.
  - **Depends on:** shipped Pull Models picker + living overlay merge.
  - **Not in scope:** LAN/remote `ollama pull` (→ **LAN custom model pull**); Modelfile UI; full chain editor in v1.
- ★★★ **Search density UX** (match emphasis + tighter rows)
  - **Goal:** Tighter, more scannable results: spacing, wider lines, incremental filtering, highlighted match tokens.
- ★★★ **KB visual maps** (strategy maps — light prelim)
  - **Goal:** Optional visual strategy maps in KB-grounded replies — light prelim discovery only until closer to implementation.
  - **Depends on:** mature strategy corpus + Phase 3/4 retrieval quality.
  - **Note:** Separate roadmap row — not folded into RAG Phase 4–8.
- ★★★★ **Llama.cpp provider spike** (Deck perf / replacement eval)
  - **Goal:** Research-only: can Deck-local llama.cpp beat Deck-local Ollama enough to justify a possible long-term replacement? **No code** in this spike. Supersedes the 2026-05-20 go/no-go in [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md).
  - **Discovery locked (2026-07-17):** Baseline Deck-local Ollama **gemma4 E2B**; go bar must win **both** game FPS hitch **and** peak GPU memory; load = DRG Survivor. Write `docs/archive/spikes/llama-cpp-provider-eval.md` (the spike's deliverable — does not exist yet).
  - **Not in scope:** Production provider UI/code; LAN/remote llama.cpp; cloud APIs.
- ★★★★ **SteamOS Share path** (capture → attach)
  - **Goal:** Faster path from SteamOS **Share** / capture flows into screenshot attach where APIs allow.
  - **Not in scope:** kernel framebuffer hacks as default.
- ★★★★ **SteamOS spin hint card** (immutable spins)
  - **Goal:** Detection + deep link to troubleshooting for immutable spins.
  - **Not in scope:** auto-fix firewall rules.
- ★★★★ **RAG Deck query — extended retrieval (Phase 4)**
  - **Goal:** Richer retrieval and content shapes after Phase 3 — session chip **visibility**, structured enemy/item sample cards + light reply bullets, T1 per-game AppID compat tips, lean compat phrase-gate fix.
  - **Status:** Discovery locked 2026-07-30; **docs only** — not implementing yet. Full lock: [knowledge-base.md](knowledge-base.md) § Phase 4.
  - **Discovery locked (2026-07-30):** All three tracks in one ship when implemented. Track 1 = visibility first (**V1+V3+V4**): guarantee ≥1 RAG chip when candidates exist (prefer game RAG → **Tip** badge; compat fallback); reseed so remix actually runs; **Tip** badge on **game** RAG chips only. Track 2 = **C3** corpus + reply shape, **R1** light bullets, **S1** sample on DRG Survivor + OoT/SoH, **F2** fields, both enemies+items, unfenced when user named the entity. Track 3 = **P1** prefer per-game tips then shared; **T1** ~3–5 tips × sample titles; same hybrid; **B1** lean phrase-gate fix; **N1** no game → shared only; **U1** no new Settings.
  - **Depends on:** Phase 3 (shipped 2026-07-29).
  - **Not in scope (Phase 4):** Chip **vector ranking** (→ Phase 5); broad per-game tips beyond T1 (→ Phase 5); structured cards beyond DRG+OoT sample (→ Phase 5); custom UI enemy/item cards / **KB visual maps**; public HF publish (→ Phase 6); sqlite-vss / auto-pull nomic (→ Phase 7).
- ★★★★ **RAG retrieval quality remediation** (hybrid fix + eval honesty — discovery locked 2026-08-02)
  - **Goal:** Fix shipped hybrid defects (nomic prefixes, RRF instead of cosine-only rerank, relevance floor, query/transparency bugs) and re-validate with a deepened seed + honest eval (tune/holdout; no self-referential card→query pairs).
  - **Status:** Decisions locked; **docs only** until PR1. Active plan: [rag-retrieval-quality-remediation-implementation-plan.md](rag-retrieval-quality-remediation-implementation-plan.md). Analysis (archived): [archive/rag-retrieval-quality-remediation-plan.md](archive/rag-retrieval-quality-remediation-plan.md).
  - **Ship shape:** **PR1** = Stages 1–5 infra (provisional loose floor); **PR2** = Stage 6 corpus/eval/kill-switch; maintainer sign-off on cards + eval before bake-off; holdout is the ship gate.
  - **Open:** Compat phrase gate product fix deferred (roadmap Bugs row); eval must report gate-reachable vs overall compat scores.
  - **Not in scope:** sqlite-vss/ANN; auto-pull nomic; public HF; Phase 5 chip ranking / wiki ingest; trust-tier-in-RRF.
- ★★★★ **RAG Deck query — corpus expansion (Phase 5)**
  - **Goal:** Finish Phase 3 **11-title** corpus maturity after Phase 4 sample paths — profiled tips/structured cards + heavier wiki ingest; then session chip **vector ranking** (baked cold-open / live after Ask).
  - **Status:** Discovery locked 2026-07-30; **partially rescoped 2026-08-02** — **strategy seed deepening (~8–12 sections/game) ships in RAG retrieval quality remediation PR2** for eval honesty; Phase 5 keeps the rest. Full lock: [knowledge-base.md](knowledge-base.md) § Phase 5.
  - **Discovery locked (2026-07-30):** Content → ranking. Depth-first on all 11 (no net-new titles); profiled minimum bar (~3–5 tips + strategy sections; enemy/item handful where genre fits); heavier wiki ingest with complete attribution as added; shared tip sheet stays ~as-is; no size budget; Dev-tab install only. Chip ranking hybrid with precomputed cold path; keep ~30% + Phase 4 ≥1 guarantee; no new Settings. Spoiler high-flag metadata only (no runtime). Non-Steam/alias must retrieve (SoE). Speed/Expert light KB only. Exit = content bar + KB-EVAL + smoke on DRG, OoT/SoH, Cyberpunk, RDR2, SoE.
  - **Strict gate amended (2026-08-02):** Seed deepening for remediation eval may proceed **without** waiting for Phase 4 implement + smoke. Remaining Phase 5 work still depends on Phase 4 sample paths where noted.
  - **Depends on:** Phase 4 implementation + on-Deck QA of sample paths (except remediation seed depth — see above).
  - **Not in scope:** Public HF/GitHub publish (→ Phase 6); sqlite-vss/ANN; auto-pull `nomic` (→ Phase 7); catalog-scale titles (→ Phase 8); custom UI cards / **KB visual maps**; new Settings; net-new titles; material shared-tip growth; runtime spoiler behavior from corpus flags; RRF FTS+vector (→ remediation, then Phase 7 for trust/ANN extensions).
- ★★★★ **RAG Deck query — public publish (Phase 6)**
  - **Goal:** First public versioned corpus + manifest (HF primary, GitHub Releases mirror) after Phase 5 maturity + legal scrub — closes **KB-DOWNLOAD** Partial.
  - **Status:** Light discovery locked 2026-07-30; **docs only** — fuller Phase 6 discovery later. Lock: [knowledge-base.md](knowledge-base.md) § Phase 6.
  - **Discovery locked (light, 2026-07-30):** Publish **Phase 5’s matured 11** + shared tips only (not catalog). Full ATTRIBUTIONS / no placeholder licenses on first public tag; NOTICE that sources can err → fix forward. Point-release updates. Manifest **forward-hooks** for future packs/deltas (unused at v1 OK). sqlite-vss/ANN + nomic + Phase 7 optional paths → **Phase 7**; catalog scale → **Phase 8**.
  - **Depends on:** Phase 5 corpus expansion + extended on-Deck KB testing; legal scrub of published zip.
  - **Not in scope:** sqlite-vss/ANN; auto-pull `nomic`; demote/vision→KB (→ Phase 7); core RRF FTS+vector (→ remediation); Steam ~1000 / Deck ~100 / emu catalog (→ Phase 8). Pack/delta **wire format** is Phase 7+ (hooks only in Phase 6).
- ★★★★ **RAG Deck query — retrieval infra (Phase 7)**
  - **Goal:** Optional **sqlite-vss / ANN**; optional **auto-pull `nomic`** (consent); plus optional paths — **RRF extensions** (trust/demote lists; ANN as another RRF list), **vision→entity→retrieve**, retrieval **thumbs + local demote**, **delta/packs**, **named thinking hit**; plus **intent retrieval** (keyword-heavy blend + meaning when FTS weak; gated translate for non-English).
  - **Status:** Tight discovery locked 2026-07-30; **intent / cross-lingual locks extended 2026-07-31**; **RRF FTS+vector pulled forward 2026-08-02** into [RAG retrieval quality remediation](rag-retrieval-quality-remediation-implementation-plan.md). **Docs only** for remaining tracks — fuller discovery later. One umbrella; tracks not gated on each other; UX may ship earlier when deps exist. May spike in parallel with Phase 6; **must not block** first public publish. Full lock: [knowledge-base.md](knowledge-base.md) § Phase 7.
  - **Discovery locked (tight, 2026-07-30):** Silent RRF (FTS+vector+trust; +demote when ready) — **FTS+vector ships in remediation**; trust/demote/ANN extensions remain here. ANN↔RRF deferred (hypothesize ANN as another RRF list); vision same-Ask piggyback (no extra extract call; lean Strategy+screenshot+KB, gate deferred); thumbs `wrong_tip`/`outdated`/`wrong_edition`; demote = JSONL + index, soft then hard, needs `section_id`s; Phase 6 manifest forward-hooks; core + optional packs; delta = goal only; name thinking hits (fence on reply); screenshot+KB preset deferred; first-run wow out.
  - **Discovery locked (intent, 2026-07-31):** From bake-off [kb-embed-bakeoff-2026-07-31.md](archive/research/kb-embed-bakeoff-2026-07-31.md) — keep **`nomic-embed-text`**. Ranking = **C** (strong FTS → keyword-heavy blend; empty/weak FTS → meaning/ANN fallback into RRF). Cross-lingual v1 = **gated translate → English → search** (chat/routing model, not nomic; rare second call; prefer one reply Ask). Fuzzy Deck-term glossary = nice-to-have. **Avoid:** dual vector tables in one zip; mixing a second embed against nomic-baked vectors; routine translate. Multilingual embed only later via **second corpus** or **on-device re-embed** (explicit follow track). **Note (2026-08-02):** bake-off “keyword beat hybrid” conclusion is **under remediation** — do not treat as settled architecture truth until the superseding report lands.
  - **Depends on:** Phase 6 publish path healthy (or spike-only until then). Demote needs KB slice `section_id`s; some UX can precede ANN. Remediation PR1/PR2 preferred before relying on RRF in production.
  - **Not in scope:** Replacing Phase 6 publish; catalog authoring (→ Phase 8); cite-to-source tap; faithfulness chip; abstain; KB browser; cross-encoder; cloud demote sync; first-run wow; multilingual default embed; dual nomic+multilingual vectors in one download.

### Medium-term

Within this section: ascending stars (★★★★ → ★★★★★★).

- ★★★★ **LAN custom model pull** (remote host — decision review)
  - **Goal:** When Ask uses a **LAN Ollama host**, let users add/pull models not in the bonsAI catalog — **blocked until mechanism is chosen** (R1 instructions-only / R2 Deck pull while LAN Ask / R3 remote execution / R4 pin-only).
  - **Depends on:** **Custom model in Pull Models picker** (Deck-local v1).
  - **Not in scope:** shipping without explicit mechanism sign-off.
- ★★★★ **Steam Input layout parse** (VDF → AI context)
  - **Goal:** Parse controller VDF configs and feed actionable control context to AI.
  - **Not in scope:** editing/writing controller configs.
- ★★★★ **Web permission** (Ask live search + online deps — discovery in progress)
  - **Goal:** Opt-in capability so Ask can fetch live answers about current games/patches/news (web search spine). Offline Ask + local KB remain usable when permission is off or network is down. HF AppID card streaming and Ollama catalog freshness are dependents / related follow-ons, not the primary job.
  - **Status:** Discovery in progress (2026-07-30); **docs only** — not implementing yet. Resume discovery or say “ready to plan” to lock a full plan into this bullet.
  - **Discovery locked (2026-07-30):**
    - Spine = **web search for Ask**; HF stream + Ollama catalog updates are dependents/follow-ons (**bundle model C**).
    - Primary user job = live patches/news/current-game answers (not smaller KB first).
    - Offline contract = always usable when Web off or network down; only live/extra bits skipped.
    - Wanted product pieces: **citations in Show details**, **domain allowlist**, **freshness chip**, **HF card stream by AppID**.
    - Auto-search when question looks “current” (**consent A**).
    - Kids Master Lock → Web **forced off** (cannot enable).
    - Enabling Web → **ConfirmModal** explaining in simple terms that Ask text (and maybe game AppID/title) may leave the Deck to a search provider.
    - Search implementation tech = undecided; choose for Deck latency + privacy at implement time.
    - Domain allowlist starter set OK for now (Steam news/changelog, ProtonDB, relevant wikis; HF host for cards).
    - HF stream intended to **replace the big zip download over time**.
    - Ollama “constantly updates models it can pull” = **related follow-on Planned item**, not in this bullet’s ship scope.
  - **Useful ideas deferred / not locked:** per-Ask opt-in, cache+TTL, bandwidth caps, Steam context in query, KB vs web conflict policy (see open decisions).
  - **Depends on:** Capability Permission Center; Kids Master Lock; existing Show details / Source patterns; Strategy spoiler fencing (interaction TBD).
  - **Related (separate):** Ollama Pull Models living catalog refresh / Update AI & models (already partly shipped) — do not merge into this item; track as follow-on if needed. RAG Phases 4–8 (zip/corpus) may need reconcile when HF stream replaces zip.
  - **Not in scope (this item):** shipping search/HF stream code yet; merging catalog refresh into v1; requiring agentic multi-hop search.
  - **Open decision points** (hold for implement / next discovery — do not block this stub):
    1. **“Current” heuristic triggers** — Which intents auto-search? (patch/changelog, news/release, live MP/outage, prices/sales, SteamOS/Proton version, date words, other)
    2. **False-positive preference** — Extra search OK vs prefer miss vs cancelable “Searching web…” affordance
    3. **Latency budget** — +2–5s / +5–15s / progress UI only
    4. **KB vs web conflict** — Web-by-freshness / KB for strategy·web for patches / always both+Show details / defer
    5. **Citations v1** — title+domain+link vs title+domain only; snippet quote optional?
    6. **Freshness chip placement** — Show details only / bubble chip / both; clock = fetched-at vs page published/updated
    7. **Local-only transparency** — Silence when heuristic skips vs quiet “Local only” under Show details
    8. **Roadmap shape vs HF stream** — Search-first then HF phase of same epic / one Planned with phases / two Planned items
    9. **Reconcile with RAG Phases 4–8** — Evolve Phase 6+ to card API / parallel track superseding zip / note conflict and resolve later
    10. **End-state without zip** — Web ON → on-demand AppID cards; Web OFF → local corpus or model-only — confirm
    11. **Metered / weak Wi‑Fi** — Hard skip / soft toast / nothing in v1
    12. **Spoilers + web** — Fence like KB / exclude from Strategy / allow with citation only
  - **Follow-up discovery prompts** (when resuming):
    - Non-goals: upload of screenshots/logs with web search? telemetry?
    - Provider choice constraints (no API key vs user-supplied vs bonsAI-proxied)?
    - Cache retention of search snippets / HF cards on disk (privacy wipe on Clear all data)?
    - Star weight / hard deps on Phase 4–6 (revisit if scope grows)
    - D-pad: Permissions row + ConfirmModal focus graph; any Main-tab “Searching…” control
    - Testing rows: Web on/off, Kids Lock, offline failover, allowlist miss, Show details cites
- ★★★★★ **Named chat slots** (labeled threads — redesign only)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **History:** We previously implemented named chat slots. It was **seriously bugged** (persistence/picker/overwrite behavior) and was **removed**. Leftover folders on device are harmless — see [troubleshooting.md](troubleshooting.md) § leftover named-chat folders.
  - **Goal:** Multiple labeled threads beyond single persisted QA — **only if redesigned**; do not re-ship the old mini-list / fullscreen picker approach without a clean redesign.
  - **Depends on:** unified Ask state machine.
  - **Not in scope:** re-implementing the failed design; cross-device merge or server-backed sync.
- ★★★★★ **Deck health snapshot** (full diagnostics + Ollama)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** **Read-only** full diagnostics; save markdown/JSON to Desktop when **Save files to Desktop** is on. **Magic Ask** `bonsai:diagnostics` + natural-language confirm modal. No new capability.
  - **Not in scope:** New permission tier; telemetry upload; privileged repair commands.
- ★★★★★ **Local reply TTS** (Phase 1–2 character voice)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Dedup:** distinct from Whisper voice Ask (shipped) and **Wake-word listening**. Phase 1 offline TTS play/stop; Phase 2 character-aligned read-aloud (legal research gate before ship).
  - **Not in scope:** Cloud celebrity voice cloning; wake-word; claiming official voices.
- ★★★★★ **Kids master lock** (Steam parental restricted)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Disable plugin capabilities when Steam reports a restricted kids account.
  - **Depends on:** Capability Permission Center and a detectable Steam signal.
- ★★★★★ **Steam Controller copilot** (Ibex gen-2)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** AI and in-app copy tuned to gen-2 hardware + Steam Input–aligned suggestions.
  - **Not in scope:** Writing controller configs.
- ★★★★★ **Wake-word listening** (beta; Deck first)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Opt-in always-on local wake on fixed keyword **bonsAI** → STT → quiet Ask. New capability + mic permission; ConfirmModal on enable.
  - **Depends on:** Shipped Whisper voice Ask; Reply ready toast; Voice STT session daemon.
  - **Not in scope (v1):** Custom wake phrases; always-on full Whisper; cloud STT; auto-open QAM on wake.
- ★★★★★★ **Remote Play diagnostics layer** (streaming host/client)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** When gameplay is streamed, answers weight encode latency and host-vs-client fixes.
  - **Not in scope:** Packet inspection or kernel hacks.
- ★★★★★★ **Steam Frame companion UX** (VR / LAN Deck)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Research-first companion workflows for Steam Frame; comfort/framerate/wrong-display disclaimers.
  - **Not in scope:** Shipping a full VR overlay inside Frame as v1.

### Long-term

Within this section: ascending stars (★★★★ → ★★★★★★).

- ★★★★ **Session context and user stash** (deck-first context)
  - **Goal:** Unified deck-first context for Ask — live session facts + user-editable stash notes. No embeddings/cloud. Explicit alternative to RAG for deck-only quality.
  - **Not in scope:** embeddings, vector DBs, cloud sync, auto web fetch.
- ★★★★★ **QAMP Phase 2 profiles** (experimental Steam opt-in)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Status:** Backlog-only. Phase 1 verification lives in [QA backlog](#qa-backlog) / [testing-manual.md](testing-manual.md).
  - **Goal:** Experimental opt-in tying QAMP reflection UX to Steam per-game performance profiles.
  - **Not in scope:** silent sysfs or profile applies without consent.
- ★★★★★ **VAC Phase 2 opponent IDs** (lobby/session API research)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Status:** Phase 1 complete; on-device QA still in [QA backlog](#qa-backlog).
  - **Goal:** When metadata allows, surface live opponent Steam identities for ban checks. Research spike first; if no stable API → enhanced manual flow.
  - **Not in scope:** automated reporting or punitive automation.
- ★★★★★★ **Deep mod AI hints** (install paths + compatdata)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Detect mod frameworks/files; mod-aware AI guidance.
  - **Not in scope:** downloading/installing mods automatically.
- ★★★★★★ **RAG Deck query — catalog corpus (Phase 8)**
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Large offline catalog after Phase 6’s matured-11 publish — sketch: ~top **1000** Steam titles; ~top **100** Steam Deck (priority slice); ~**50 emulated** per era Genesis→Xbox 360/PS3 (~300–500 emu) with verified alias/Non-Steam matching.
  - **Status:** Intent only 2026-07-30; **fuller discovery later**. Not Phase 6 v1.
  - **Depends on:** Phase 6 public publish + legal lessons; likely Phase 7 infra for scale.
  - **Not in scope:** Shipping catalog as the first public HF corpus; thin stubs that drown hybrid retrieval without a tiering plan.
- ★★★★★★ **Native QAM shortcut tile** (under Decky; upstream research)
  - **GitHub (tracking placeholder):** [bonsAI Issues](https://github.com/cantcurecancer/bonsAI/issues) — dedicated issue TBD.
  - **Goal:** Separate QAM left-rail entry for bonsAI beneath the Decky Loader icon (fewer steps than Decky plugin list). Requires upstream Steam/Decky support — plugins cannot register sibling QAM icons from `plugin.json` alone.
  - **Related:** Guide-chord macro docs remain in [troubleshooting.md](troubleshooting.md) §5 for power users; not a casual-user priority (archived from Planned).
  - **Not in scope:** Shipping a forked Steam client or undocumented UI injection as default.

### Reference — vision model fallback order

When a screenshot is attached, `select_ollama_models(..., requires_vision=True)` tries `qwen2.5vl:3b` **first**, then `qwen3.5:4b`, then legacy `llava:7b`, then Tier 2 `gemma4:e2b-it-qat` / `gemma4:e2b`. **Settings → Model policy → Allow high-VRAM model fallbacks** appends large tags after the essentials chain.

---

## Completed

Shipped features live in the archive for readability.

**Full checklist:** [archive/roadmap-completed.md](archive/roadmap-completed.md).

**Archived from Planned (low casual-user value):**

- ★★★★★ **Global quick-launch macro** — Guide-chord → QAM → Decky → bonsAI documentation and verification checklist shipped in [troubleshooting.md](troubleshooting.md) §5. Cool for power users; **not worth further product effort** for casual users. Refresh only if Steam/Decky QAM layout changes or **Native QAM shortcut tile** lands. Detail also in [archive/roadmap-completed.md](archive/roadmap-completed.md).

Coverage for shipped work: [testing.md](testing.md).

---

## Appendix

### Cross-feature dependency summary

- **Mode selector (shipped)** → **Per-mode latency timeouts**; Strategy Guide path shipped as `strategy` Ask mode.
- **Character voice roleplay (shipped)** → accent intensity, avatars, UI accent theme, Random “?”, running-game suggestions, Pyro easter egg (all shipped); → **Local reply TTS** Phase 2.
- **Whisper voice Ask (shipped)** + mic → **Wake-word listening**.
- **Reply ready toast (shipped)** → required for hands-free wake when QAM closed.
- **Capability Permission Center** → gates filesystem, Steam/Proton log + screenshot reads, mic, Steam Web API; web/Steam jumps always allowed; TDP/GPU suggestions read-only (no apply); → planned **Web permission** (Ask live search; Kids Lock forces off).
- **Llama.cpp provider spike** → research-only; related **Dynamic keep-alive / smart unload**.
- **Preset carousel (shipped)** → incremental **Preset chip expansion**; **Session RAG preset chips (shipped)**.
- **RAG / offline KB** → Phase 2–3 shipped → **retrieval quality remediation** (PR1/PR2, docs locked) → Phase 4–8 Planned (4 extended retrieval, 5 corpus expansion remaining after remediation seed depth, 6 public publish, 7 infra — ANN/nomic/RRF extensions/vision→KB/demote/delta-packs/named hit, 8 catalog corpus); **KB visual maps** separate; **Spoiler confidence chip** → fencing + unfenced feedback (distinct from Phase 7 retrieval thumbs); **Web permission** may eventually replace zip download with HF AppID card stream (open decision vs Phases 4–8).
- **Web permission** → citations / allowlist / freshness chip; HF stream + catalog refresh are dependents/follow-ons (catalog not in this bullet).
- **Soft** `num_predict` **+ thinking budget** (Bugs) → **Thinking effort control**.
- **Native QAM shortcut tile** → shorter path than Guide-chord macro docs (§5).
- **Steam Input jump Phase 1 (shipped)** → **Steam Input layout parse**.
- **Offline intent packs (quiet)** → **Proton journal / intent packs later review**.
- **Deck health snapshot** → `steam_logs_read` + Proton log helpers; Desktop save needs `filesystem_write`.

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
```

### Implementation notes

#### Iconography pass — plugin list icon lesson

Decky sizes icons via CSS `font-size`. Font Awesome works because it renders `<svg width="1em">`. An `<img>` with fixed pixels is ignored. Fix: inline SVG into `<svg width="1em" height="1em" fill="currentColor">` (`BonsaiSvgIcon`). Source SVG needs `viewBox` for scaling.
