# bonsAI Roadmap

Open bugs, work fixed but not yet confirmed on the Deck, planned features, and what shipped for v0.5.0. Four lists plus one
section for the knowledge base, each sorted from one star to six.

- **Knowledge base and RAG, all in one place:** [its own section](#knowledge-base-and-rag) — bugs, owed checks, next steps
  and the calls waiting on the maintainer, with [a status report](planning/37-rag-status-report.md) kept in step with it.
- **Long notes for open items:** [roadmap-details.md](roadmap-details.md)
- **Shipped features, full detail:** [archive/roadmap-completed.md](archive/roadmap-completed.md) · **Fixed bugs, full detail:** [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md)
- **Maintainer decisions (D1 onward):** [audit/maintainer-decisions-locked.md](audit/maintainer-decisions-locked.md)
- **QA rows and device evidence:** [testing.md](testing.md), [testing-manual.md](testing-manual.md) · **Release notes:** [CHANGELOG.md](../CHANGELOG.md)
- **Checks only the maintainer can do** — the standing list, kept as a tickable page:
  [Twelve Checks Only You Can Do](https://claude.ai/code/artifact/3e5ec678-b219-439d-b952-139d75ff2db4).
  Anything a session finds that needs their eyes or their fingers is added there, not left in a chat.

## House rules for this file

1. **An entry is at most five lines**, in plain language, and says what a user would notice. Anything longer goes to
   [roadmap-details.md](roadmap-details.md) (open) or [archive/](archive/) (finished) and is linked, never deleted.
2. **Three lists for live work: [Bugs](#bugs), [Features](#features), [Verify](#verify)** — except knowledge-base work,
   which keeps its bugs, owed checks and plans together in [Knowledge base and RAG](#knowledge-base-and-rag). A new entry goes
   straight into the right list at its star position (ascending; within a star band by tag, then by title) with a tag. Do not
   add sub-headings beyond Verify's own **Bugs** / **Features** split and the knowledge-base section's own lists.
3. **Status words in Bugs and Features:** **OPEN** (nothing built) · **PARTIAL** (some of it built) · **ACCEPTED** (the
   maintainer chose to live with it). Nothing else — as soon as something is fixed and unit-tested, it moves to **Verify**
   rather than taking a fourth status word.
4. **When code lands that fixes a Bugs entry or ships a Features entry, but a Deck check is still owed:** move the entry, in
   the same commit, out of Bugs or Features and into Verify's matching sub-list (name the QA row). **When the Deck check
   passes:** move it again, same-commit, into [Done](#done-for-v050) as one line, with the full entry going to the matching
   archive file. Never leave a finished item sitting in Bugs or Features, and never mark one with a strike-through.
5. **Stars** are effort and risk on the GTA scale: `★` easiest … `★★★★★` very high; `★★★★★★` extreme scope.
6. **Tags:** `[ask]` Ask bar and input · `[chat]` chat slots · `[chips]` preset chips · `[focus]` D-pad and focus ring ·
   `[KB]` knowledge base · `[layout]` Main tab layout and vertical space · `[ollama]` models and routing · `[perms]` permissions ·
   `[platform]` build, deploy, tooling, upstream · `[QA]` testing · `[reply]` the answer itself · `[tabs]` the tab bar ·
   `[ui]` everything else on screen · `[voice]` voice.

**Every Main-tab UI change also owes the free-play sweep** (standing row **QA-FREE-PLAY-01** in
[testing-manual.md](testing-manual.md)): walk the pane like a user and require every focused stop to also be visible.

**Maintainer note (2026-09-05): pick the model before you pick up an item.** Rough guide, details and evidence in
[planning/33-model-routing.md](planning/33-model-routing.md), policy in [AGENTS.md § 3](../AGENTS.md):
★–★★ Sonnet 5 high · ★★★–★★★★ Opus xhigh plans, Sonnet lanes implement when the cause is known · ★★★★★+ Fable max
plans only, Sonnet lanes build, Opus xhigh lands · `[focus]` `[layout]` `[ui]` measure on the Deck first, then Opus xhigh,
never a lane without the measurement · docs and bookkeeping Sonnet or Opus medium (the bookkeeper helper; a guard
refuses Fable's own edits to the roadmap, testing docs, changelog and test files) · escalate a tier only after two device
failures with a measurement · Haiku 4.5 on trial for read-only lookups, log each use in plan 33 § 4a. A prompt-time
hook gives a gentle heads-up when a session starts work outside this.

---

## Bugs


- ★ `[focus]` **Pressing A on an open question closes it and drops the highlight** — the answer folds away and the ring
  lands nowhere; the next D-pad press places it fresh instead of moving it. Seen on the Deck 2026-09-06 while checking the
  corner icons, and the earlier run that pressed the question recorded the same landing ("nothing"), so it is not new to
  the corner icons. Runs: `retry-corner-collapse-question`, `press-question-not-retry`.

- ★ `[focus]` **Closing the model try order picker drops the highlight onto the tab rather than the button you opened it from** —
  **OPEN, seen twice 2026-09-06.** After pressing *Done*, the highlight lands on the Ollama tab's outer frame, not back on
  *Set text model try order…*. It is not a dead end — the next press moves normally — but it costs about thirteen presses to get
  back to where you were. The *Clear cache…* and *Clear all data…* buttons were taught to hand the highlight back on
  2026-09-04; the two try-order buttons were not.

- ★ `[focus]` **A greyed-out button still takes the highlight, so the D-pad lands on something that does nothing** —
  **OPEN, measured 2026-09-05.** Watched on the device while a question was in flight: the Ask button is greyed and the
  highlight still lands on it. It is not one button — it is how greyed buttons behave here, so it now also applies to the
  Helpful and Not really buttons that were greyed on a stopped reply the same day. The greyed *Clear frozen test chips*
  button had the same problem and was fixed by removing it; that is not open here, because the maintainer asked for greyed
  rather than gone. So the fix is to step over them with the D-pad instead. Evidence `runs/round35-CHECK-stop-press.json`.
- ★ `[focus]` **Left on the collapsed-history row throws the highlight out of the plugin** — **OPEN, found 2026-09-05,
  confirmed twice.** With the highlight on the *N earlier* row above a chat, Left hands it to Steam's Quick Access rail and
  the person is out of bonsAI entirely. Right brings it back, but nothing says so. Same shape as the Ollama sliders fixed on
  2026-09-04: the row does not claim the press, so Steam's own idea of "past the edge" fires. Left should either walk the
  history or hold still. Evidence `runs/round35-BUG-left-from-earlier-pill-leaves-plugin.json`,
  `runs/round35-BUG-left-from-earlier-pill-retry.json`.
- ★ `[focus]` **Pressing Ask drops the highlight** — **OPEN, found 2026-09-05, widened the same day.** Filed first as an
  empty-box problem; it is not. **Every** press of the Ask button leaves nothing highlighted — with a real question and with an
  empty box alike, measured four times. The page's own focus falls back to the document body, so the next press has to place the
  highlight again before it can move it. On a fresh panel that placing press lands on Decky's back arrow, above the plugin. Same
  family as nothing being highlighted when the panel opens, and likely the same fix.
- ★ `[focus]` **Down does not move the ring off an unrevealed spoiler block** — **OPEN, found 2026-09-04, did not reproduce
  2026-09-05.** With the ring on the hidden block, Down reported the press arriving and nothing moving. Retried today on a fresh
  Red Dead ending reply with a real hidden block on screen: **Down left it normally**, straight onto the branch picker's first
  button, and every stop on the walk was fully visible. So the hidden state does not trap on its own. Most likely the same
  underlying fault as the stuck panel below — both are a hop that dies only sometimes — and best closed with it rather than
  chased separately. Evidence `runs/round35-spoiler-block-down-and-up.json`.
- ★ `[focus]` **Walking down a reply and walking back up visit different stops** — **OPEN, found 2026-09-05.** On one reply,
  Down went question, hidden spoiler block, branch A, branch B, Helpful — never stopping on either paragraph of the answer. Up
  from Helpful went both paragraphs, then the question — never stopping on the spoiler block or the branch buttons. So a person
  who walks past something and presses Up to go back does not return to it; they land somewhere they never visited. Related to the
  two-star entry about Up skipping sections, but sharper: the two directions disagree about what the reply's stops are.
  Evidence `runs/round35-spoiler-block-down-and-up.json`.
- ★★ `[focus]` **After the panel remounts the ring parks on a zero-size container** — **OPEN, found 2026-09-04.** On a fresh mount
  the ring lands on "Ask bonsAI" (Main) or "Where AI runs" (Ollama), both 0x0 rects that the visibility oracle calls OFFSCREEN, so
  the panel opens with nothing highlighted until the first press.
  **Measured again 2026-09-05** on builds 3 and 4 (four fresh mounts, two of them after a Decky loader restart): the reading was
  not a 0x0 stop but **no ring at all** — the rig's own report each time was *the ring is unowned, so the first D-pad press will
  place it rather than move it*, and that press then landed on the tab bar, visible. Same thing to look at (nothing is
  highlighted when the panel opens), so the fix is to place the ring on mount rather than to move it off a bad element.
  **Measured again 2026-09-05 on a fresh open, and it is worse than written:** nothing owned the highlight, and the first Down put
  it on **Decky's own back arrow at the top of the panel, outside bonsAI entirely**. So opening the plugin costs two presses before
  a person is anywhere useful, and the first one moves them away from the chat. Evidence `runs/round35-trap-attempt-1-after-b-reopen.json`.
- ★★ `[focus]` **Focus ring styling is inconsistent** between plugin controls and Steam's own — **PARTIAL.** Modal scoping shipped; a
  blanket rule was tried and reverted in favour of Steam's native outline.
- ★★ `[focus]` **Up skips the answer sections and the chat slot row** — **OPEN, found 2026-09-04.** Down walks a reply chunk by
  chunk (three `.bonsai-answer-stop` stops on one turn); Up jumps from the feedback buttons straight past them to the bubble and
  the turn header. With the archive expanded, Up from the first archived header ran 18 presses to the tab bar and Decky's back
  button without the chat slot row ever taking the ring, though two Downs reach it normally. Same family as **ONBUTTONDOWN-AUDIT-01**.
  **Half of this moved on 2026-09-05:** Up from the feedback buttons now lands on the reply's last section rather than skipping
  to the bubble (measured, CHAT-REPLY-ENTRY-01). What is still open is the archived-header half — Up from the first archived
  header runs to the tab bar without the chat slot row ever taking the ring.
- ★★ `[reply]` **An answer can end with a block of raw computer text where a power tip should be** — **OPEN, seen on the
  Deck 2026-09-06.** In Speed mode with Deep Rock Galactic: Survivor running and the character voice on, a reply ended
  with the literal line `{"tdp_watts": 5, "gpu_clock_mhz": 1200}` sitting in the words a person reads. The plugin's own
  log shows it recognised this as a power suggestion, so it understood it correctly — it was just never removed from the
  text shown on screen. Needs someone to trace where that block should be stripped before the reply reaches the screen.
- ★★ `[reply]` **Token streaming reveals text in bursts while a game is running** — **ACCEPTED 2026-09-04 (D58 #4).** Measured 2026-08-28 with
  a game running: tokens arrive in bursts, and during a burst the overlay drops to 47 fps; between bursts it is a flat 60. Delivery
  is bursty, painting is not slow. The game's own frame rate is unmeasured. Accepted as a nice-to-have; reopen only if the game's own frame rate is measured
  and suffers. Making streaming the default stays a separate feature call. Row **STREAM-11**. [Detail](roadmap-details.md#token-streaming-reveals-text-in-chunks-while-a-game-is-running).
- ★★★ `[focus]` **The panel can get into a state where pressing Down stops half way and the Ask button is out of reach** —
  **OPEN, found 2026-09-05.** After leaving the panel with B and opening it again from the Decky list, Down walked as far as the
  answer and then stopped dead: ten presses, no movement, Left and Right dead too, only Up escaping. The answer's own buttons, the
  preset chips, the question box and the **Ask button** were all on screen below and none could be reached. It happened on a chat
  with history and again on a brand new empty chat, where the ring stuck in the question box instead. Same in Speed and in
  Strategy, with the mode written while the panel was closed, so the mode is not the cause.
  **What clears it: restarting the Decky loader, not reopening the panel.** After a loader restart the identical walk on the
  identical chat went all the way down — through the answer, its highlighted words, the settings block, Show details, the session
  strip, a chip, the question box — and reached the Ask button on the next press. So this is a **stale navigation state that a
  panel reopen does not clear**, not a permanently trapping control. At the moment of the trap Steam's ring and the page's own
  focus were on different elements every time (the answer bubble versus a highlighted word; the question box versus the Ask
  button), which is the signature to chase. How a person gets into the state is not yet pinned down — it followed a game launch
  and several panel reopens. Evidence, in order: `runs/round34-BUG-down-cannot-reach-ask-bar.json` (trapped, 10 presses),
  `runs/round34-BUG-down-walk-strategy-mode-control.json` (trapped, other mode), `runs/round34-BUG-empty-chat-input-trap.json`
  (trapped, empty chat), `runs/round34-BUG-down-walk-after-loader-restart.json` and
  `runs/round34-BUG-input-to-ask-final-check.json` (clean after the restart).
  **2026-09-05, three deliberate attempts, not reproduced:** leaving with B and reopening from the Decky list; a button-then-cancel
  around the question box; and switching through all six tabs and back six times before walking the panel top to bottom. Every walk
  reached the Ask button. **A mechanism was found by reading instead.** The table that hands the highlight between the panel's parts
  lives outside the panel and is keyed by fixed names, not by which copy of the panel is on screen; it is only emptied when the
  plugin's code loads fresh. A stale entry therefore survives a panel reopen, and the handler that asks it to move the highlight
  gets back something that still looks alive, reports the press as handled, and moves nothing. That matches every symptom on record,
  including why only a loader restart clears it. Evidence `runs/round35-trap-*.json`,
  [plan 35](planning/35-bugfix-session.md) § 7.
  **A fix for that mechanism landed 2026-09-05** — a departing part of the panel can no longer unregister the one on
  screen — but **the entry stays here, not in Verify**, because the fault never reproduced on demand, so nothing proved
  the fix against it. It closes only when the panel is driven hard over time and the state does not come back. The
  unrevealed-spoiler entry above is most likely the same fault and closes with it.

---


## Features

**Standing goal from the maintainer (2026-08-30):** buy back as much vertical room for the chat bubbles as possible; every
`[layout]` entry serves it. Items rated ★★★★★ or above carry a placeholder link to [bonsAI Issues](https://github.com/qd313/bonsAI/issues) in the archive;
replace it with a specific issue when one exists.

- ★ `[ask]` **Intent packs later review** — **OPEN.** Decide whether the quiet intent-pack search aliases are deleted, left quiet, or
  revived under Developer. Not in scope: re-shipping Proton journal inject without a redesign. **New evidence 2026-09-06 (D79):**
  the bundled Deck basics list ships switched on and is the *only* reason a whole sentence ever matches a setting — its 88 words
  match when your sentence contains one of them, so *can you help me with performance* returns three results. The maintainer folded
  that finding into this entry. [Detail](planning/45-settings-shortcut-card.md#5-two-things-about-the-search-that-are-not-obvious).
- ★★ `[chat]` **A quiet cue that a cut question can be opened** — **OPEN, filed 2026-09-05 by the maintainer.** When the ring lands on
  a question bubble that has been cut short, nothing on screen says the rest is there. Chosen 2026-09-05 from four drawn options: the
  text fades out at the right-hand edge instead of ending in three dots, only while the ring is on it, nothing for a finger. Nothing
  is added and nothing shifts. The same fade already sits in the stylesheet with no user, written for cut-off answer bubbles.
  One check owed first: the question bubble turns its own outline off and gets no ring rule, so look on the Deck at what focus shows.
- ★★ `[chat]` **First-run ghost "New chat" label at the create position** — **OPEN, parked by decision.** The create position is the
  literal `[+]`, re-confirmed on board 8f and again in the v3 rows. Reopen that decision before building it.
- ★★ `[ollama]` **Expert offers the stronger Deck-run models first, and the licence list learns the Sept 2026 models** —
  **OPEN, planned 2026-09-05, calls locked (D73).** In the model picker's Expert group, the models that beat today's Gemma 4 on the
  answer test come first, in bake-off order. The plugin's licence list is behind: Gemma 4 has been Apache 2.0 since April and is
  still filed as open-weight; Granite and Liquid are unknown to it, so the default open-source-only tier would not route to them.
  One change to the list, the picker's catalogue and the Expert group. [Bake-off](planning/41-deck-model-survey.md).
- ★★ `[reply]` **The answer's first lines in the reply-ready toast** — **OPEN, planned 2026-09-05, calls locked (D63).** When an
  answer finishes while the menu is closed, the toast says only *Reply ready*. It would read *bonsAI* over the first lines of
  the answer, in every mode, for eight seconds, so a short answer is read without leaving the game; tap still opens the panel.
  Hidden blocks are skipped; if nothing safe is left the toast stays as it is. **Measure first, on two screens with screenshots:**
  the Deck's own screen and a 24-inch 1080p monitor; the popup is expected to be small. [Plan and mockup](planning/38-toast-answer-lines.md).
- ★★ `[ui]` **Replace the bonsAI tab icon with the redesign's** — **OPEN, and no longer waiting on a drawing.** Flatter,
  more silhouette, because it renders at 14px. **Checked 2026-09-05: the redesign document never actually draws one**, and the
  maintainer has said they do not want to supply one. So whoever builds it proposes a shape and the maintainer approves it by
  eye — a shape is not something to settle from a description or by reaching for a stronger model. It has to be an inline SVG
  path rather than the PNG so it takes the colour around it. Update the icon geometry test in the same change.
- ★★ `[voice]` **Read answers aloud** — **OPEN, planned 2026-09-05, calls locked (D74).** A Read aloud button under the answer.
  The Deck's own voice, which SteamOS has shipped since June 2025, so nothing to download; it keeps reading with the menu closed and
  stops on a second press or a new question. A setting reads new answers on its own when the menu is closed, off by default. A
  hidden spoiler block is skipped with a short spoken phrase. Three Deck checks run before the build. [Memo](planning/42-read-aloud-feasibility.md).
- ★★★ `[ask]` `[focus]` **Steam settings shortcuts float above the question box** — **OPEN, planned 2026-09-06, all calls locked
  (D79).** Today the list of matching Steam settings appears under the box and pushes the box, the chips and the whole
  conversation up the screen; two letters can match 71 settings and throw the box off the top. It moves to a card above the box
  that holds the best eight and never moves anything. Up walks into it, Down walks out, B closes it and keeps your words.
  [Plan](planning/45-settings-shortcut-card.md) · [Mockups](https://claude.ai/code/artifact/1ab2a570-2ae5-45cd-b12b-332694f96fd5).
- ★★★ `[chips]` **Decode preset chip animation** — **VERIFY, feel only.** Shipped 2026-08-28. Measured on device: a flat 60 fps with
  all chips decoding. Whether it feels right is a person's call. Row **PRESET-STREAM-ANIM-01**.
- ★★★ `[layout]` **Give the reclaimed height to the transcript** — **OPEN, next step under the vertical-space goal.** The collapsing
  tab bar freed 61px, but the transcript is still 412px: the room went into Main's overflow and the gap above the dock. What caps
  the transcript is a Main-tab layout question, worked out in [planning/30-collapsing-tab-bar.md](planning/30-collapsing-tab-bar.md) § 8.
- ★★★ `[layout]` **Session context folds into Show details** — **OPEN, workshop before building.** The **Session context (N turns)**
  bar stops being its own row, so a settled answer costs one collapsed control instead of two.
  [Open questions](roadmap-details.md#session-context-folds-into-show-details).
- ★★★ `[ollama]` **Dynamic keep-alive / smart unload** — **OPEN, research spike.** Hold models loaded, or unload when a game takes
  focus on the Deck APU? The spike decides go or no-go; no production unload before it.
- ★★★ `[ollama]` **Per-mode latency timeouts** — **OPEN, weighed and deliberately not built 2026-09-05.** Separate warning and
  give-up values per Ask mode. It was the sixth candidate in round 36 and was dropped on purpose, said in advance rather than
  discovered late: it is the largest of that set — the two existing values already run through sixteen files each and going per mode
  triples them — and the least of them for a person, since it changes when a warning appears rather than what the plugin can do.
- ★★★ `[reply]` **Spy: a character who lies to you on purpose** — **OPEN, filed 2026-09-06 by the maintainer.** A new
  Team Fortress 2 character. Pyro's Heavy setting already gives bad advice because he is a stubborn arse; the Spy gives bad advice
  because he is clever and working for the other side. Sometimes he opens by claiming to be a different character instead. Same hard
  floor as Pyro's: nothing that can damage the Deck, lose a save, or cost money — wasted time only. And you have to be able to find
  out, so the reveal is planned before anything is built. [Detail](roadmap-details.md#spy-a-character-who-lies-to-you-on-purpose).
- ★★★ `[reply]` **Terse mode: Speed answers in three lines** — **OPEN, planned 2026-08-29, nothing built.** A toggle beside the
  reply-style slider, off by default, capping a Speed answer at three lines. It overrides the slider and the character; destructive
  warnings and the depth phrases escape it. The real work is widening the branch picker (D40). **TERSE-01** passes at 8 of 10.
  [Detail](roadmap-details.md#terse-mode-speed-answers-in-three-lines).
- ★★★ `[ui]` **Adjustable text size in Settings** — **OPEN.** `uiScalePx()` already runs through the stylesheet; the work is exposing it,
  deciding what must not scale (icons, the 300px column), and paying the settings plumbing. [Detail](roadmap-details.md#adjustable-text-size-in-settings).
- ★★★ `[ui]` **Search density** — **OPEN.** Tighter, more scannable results with highlighted match tokens.
- ★★★ `[voice]` **A voice per character** — **OPEN, after Read answers aloud; two calls open (D74).** A natural voice as a one-time
  download of about 90 MB, then a voice that fits the selected character: a stock British voice from a 109-speaker pack picked by
  region, or an invented voice designed once on the PC and copied on the Deck from a five-second clip. The invented voice is
  the maintainer's pick (D74). Never a copy of a real person's voice without consent. Open: which stock voices, if any, the
  plugin lists; Piper's best-known American voice is research-only and never ships.
  [Memo](planning/42-read-aloud-feasibility.md).
- ★★★ `[ollama]` **How fast is this model on this Deck** — **OPEN, planned 2026-09-06, calls open (D75).** Next to each installed
  model, how fast it answered on this Deck the last time it was used, and a button to time it now with one fixed question. The
  numbers already exist on every answer; the plugin keeps a last-ten record per model with the game that was running, shows a
  badge in the picker and a plain line under Show details, and never reorders anything. The bake-off's Deck half becomes one
  press per model. [Plan](planning/43-model-speed-readout.md).
- ★★★★ `[ask]` **Connection doctor** — **OPEN, planned 2026-09-05, calls locked (D64).** When an Ask fails, a **Fix this** button
  under the failed reply runs the checks the plugin already has, shows the one that failed, and offers the one thing to do
  next with a button that lands you on that control on the Ollama tab. It only offers; nothing changes without a press.
  **Save a report** inside it, and a typed command, write a read-only report of the setup to the Desktop: the former
  **Deck health snapshot**, folded in here. [Plan](planning/39-connection-doctor.md).
- ★★★★ `[ask]` **Session context and user stash** — **OPEN.** Live session facts plus user-editable notes for Ask. No embeddings, no cloud.
- ★★★★ `[ollama]` **LAN custom model pull** — **OPEN.** Blocked until a mechanism is chosen (R1 to R4). Depends on **Custom model in
  the Pull Models picker**.
- ★★★★ `[perms]` **Web permission** — **OPEN, discovery locked.** Opt-in live web answers; offline Ask and local KB when off. Kids
  lock forces it off. [Discovery](planning/web-permission-discovery.md).
- ★★★★ `[platform]` **Llama.cpp provider spike** — **OPEN, research only.** Go or no-go against Deck-local Ollama. Prior:
  [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md).
- ★★★★ `[platform]` **Steam Input layout parse** — **OPEN.** Parse controller VDF configs for control context. Not in scope: writing
  configs.
- ★★★★ `[ui]` **SteamOS Share path** — **OPEN.** Faster path from Share and capture flows into screenshot attach where APIs allow.
- ★★★★ `[ui]` **SteamOS spin hint card** — **OPEN.** Detect immutable spins and deep-link to troubleshooting.
- ★★★★★ `[ollama]` **On-Deck model benchmark** — **OPEN, descoped on 2026-09-06, one call open (D75).** Rank installed models by measured
  speed and completion; offer as try order with confirmation. Its own gate said: if timings do not hold still, descope to a
  one-shot readout. That readout is now its own three-star entry, [plan 43](planning/43-model-speed-readout.md), and its record
  of timings answers the gate over time. Whether this line retires is D75. **First input, 2026-09-05:** the desk survey of this
  quarter's models in [41-deck-model-survey.md](planning/41-deck-model-survey.md); the calls are D72.
- ★★★★★ `[perms]` **VAC Phase 2: opponent IDs** — **OPEN, research.** Surface live opponent identities for ban checks when metadata allows.
- ★★★★★ `[platform]` **Controller macro test rig and live view** — **OPEN, discovery locked 2026-08-23, board ordered.** A bridge board
  the Deck sees as a real controller, a macro runner gated on real UI state, and one recording pipeline. Primitives land upstream in
  decky-plugin-studio. Next: spikes S1 to S3. [Plan](planning/19-controller-macro-test-rig.md), [program](planning/21-ai-owned-testing-program.md).
- ★★★★★ `[platform]` **Steam Controller copilot (Ibex gen-2)** — **OPEN.** AI copy tuned to gen-2 hardware.
- ★★★★★ `[reply]` **Reasoning display** — **OPEN, planned 2026-09-05, calls locked (D70, D71).** The plugin asks a
  thinking model to think and throws the thinking away; the line under your question shows a stock phrase for the whole wait.
  Planned: three lines at the answer's size show the model's own newest sentences, fold to one line with the seconds when the
  answer starts, open to the full text; Show details gets a thinking chip; and the thinking is also spent deciding what counts
  as a spoiler for you. The Deck's default model can think. A test runs on the PC first, then the Deck. [Plan](planning/40-reasoning-display.md).
- ★★★★★ `[voice]` **Wake-word listening** — **OPEN, beta.** Opt-in always-on local wake **bonsAI**, then STT, then a quiet Ask.
  [Feasibility](planning/10-wake-word-listening-feasibility.md).
- ★★★★★★ `[platform]` **Deep mod AI hints** — **OPEN.** Detect mod frameworks and files; mod-aware guidance.
  [Feasibility](planning/12-deep-mod-ai-hints-feasibility.md).
- ★★★★★★ `[platform]` **Native QAM shortcut tile** — **OPEN, upstream research.** A separate left-rail entry beneath the Decky icon.
  [Feasibility](planning/11-native-qam-tile-feasibility.md).
- ★★★★★★ `[platform]` **Remote Play diagnostics layer** — **OPEN.** Streamed-gameplay answers weight encode latency and host-vs-client
  fixes. Noted in [09-steam-frame-companion-feasibility.md](planning/09-steam-frame-companion-feasibility.md) § B8.
- ★★★★★★ `[platform]` **Steam Frame companion UX** — **OPEN, research first.** [Feasibility](planning/09-steam-frame-companion-feasibility.md).
- ★★★★★★ `[reply]` **In-game answer surface** — **OPEN, split 2026-09-05.** Read an answer without leaving the game. The full overlay
  is upstream-gated and stays here as research. The unblocked slice, the toast carrying the answer's first lines, is its own ★★
  entry above, planned in [38](planning/38-toast-answer-lines.md).

---


<a id="done-for-v050"></a>

## Verify

Fixed, unit-tested and shipped, but not yet confirmed on the Deck. Owed QA row named in each entry; full evidence in
[testing.md](testing.md) / [testing-manual.md](testing-manual.md). Once a Deck run confirms one, move it in the same commit: a line into
[Done](#done-for-v050), the full entry into the matching archive file, drop it from here.

### Bugs that need verification
- ★ `[platform]` **Clear all plugin data left three things behind** — **VERIFY.** Found 2026-09-05 when the maintainer
  asked for the wipe to be best-effort. Three flags remembering that the plugin had already warned about a knowledge base problem
  are spelled with an underscore where everything else uses a colon, and the wipe only looked for the colon. After wiping
  everything the plugin still believed it had warned you, so it stayed quiet when it should have spoken up. Fixed to match the
  bare word, which catches both spellings and clears the old ones off devices that already carry them. The New labels in the pull
  picker go with it. Three tests. Row **CLEAR-ALL-PREFIX-01**; **not run on the device**, because doing so destroys the
  maintainer's chats and settings and that was not asked for.

- ★★ `[focus]` **A checklist the model got wrong was left in the reply as raw JSON**, its own D-pad stop that did nothing — **VERIFY.**
  Fixed 2026-08-28: a rejected checklist block is dropped, as a rejected branch block already was. Owed: one sighting on device of a
  reply where it happens. Row **STRAT-CHECKLIST-JSON-01**.
- ★★★ `[chat]` **Clear cache cleared the screen but not the session** — **VERIFY.** Fixed and confirmed 2026-08-27, and again on the
  Deck 2026-09-03. The orphan half is measured: the chat stays behind after a clear, so each clear-and-reask cycle leaves one more
  chat in the rotation — a follow-up, not a regression. Only the mid-generation half is still owed: clearing while a reply is still
  being written (unit-tested, not reproducible by hand yet). Row **CLEAR-CACHE-01**. [Why](roadmap-details.md#shipped-qa-owed--why-each-was-built-this-way).

### Features that need verification

- ★★★ `[layout]` **Copy sits in the answer's corner, not in a button row** — **VERIFIED on the Deck 2026-09-06.** The row of
  buttons under a reply is gone. **Copy** is a small faded icon tucked to the answer's bottom right — press Right from the last
  part of the answer to reach it, Left to come back. **Retry** is a faded circular arrow on the newest question's bubble, on its
  left — press Left from the question, Right to come back. **What the runs show:** walking the whole reply down and back up
  again visits every control once, in order, with no loop and nothing hidden, and pressing Copy put all 1,834 characters of the
  answer on the clipboard. Pressing the question still opens and closes it and does not start a Retry. An older question shows
  no arrow. Two problems were found and fixed on the device before this closed — see the notes on the entry below and the
  planning file. Runs: `reply-block-final-walk`, `copy-right-from-answer`, `press-question-not-retry`,
  `question-bubble-two-stops`. Rows **COPY-REPLY-01**, **COPY-REPLY-02**, **RETRY-CORNER-01**, **CHAT-REPLY-ENTRY-01**.

- ★★ `[layout]` **Show details becomes a divider, not a chip** — **VERIFIED on the Deck 2026-09-06.** Under a finished answer
  there is a thin line across the reply with **Show details ↓** in the middle. **What the runs show:** the line is 267 pixels
  wide starting at the same left edge as the answer bubble above it, so the two share both edges exactly. One press opens the
  chips and turns the label into **Hide details ↑**; one more press closes it — the double-toggle worry did not happen. The
  ring reaches it walking down and walking up, and it is fully on screen, not behind the input bar. Nothing overflows sideways.
  Run: `reply-block-final-walk`. Row **SHOW-DETAILS-01**.

- ★★ `[focus]` **Fewer D-pad stops on a finished reply** — **VERIFIED on the Deck 2026-09-06.** **What a person notices:** an
  answer of about 1,800 characters used to be one stop per paragraph — six of them. It is three now, and each press either moves
  the ring to a part of the answer already on screen or scrolls the panel; nothing is skipped. A short answer of 400 characters
  is a single stop. Code blocks still stand alone. Runs: `reply-block-final-walk`. Rows **D-PAD-SCROLL-02**, **STREAM-09**.

- ★★ `[chips]` **A glow when the chip row runs out of chips** — **VERIFY.** Built at the desk 2026-09-05 under D62 #3: press Left or Right past the first or last suggestion chip and that chip glows briefly, the way a phone lights up the end of a list. Nothing about the row’s existing edge behaviour changes. Reduced motion keeps the cue and drops the movement. **No measurement closes this one** — whether it reads as *end of list* rather than *error* is the maintainer’s call from a recording, and it is on their checklist.

- ★ `[ollama]` **Pulled models join the model try order** — **MOSTLY VERIFIED on the Deck 2026-09-06, one case left.**
  A model pulled from the picker landed at the **bottom** of the text list, and showed up in the vision list because it can
  read pictures — while a text-only model and the embedding one stayed out of that list. What is still owed is the opposite
  placement: with *Allow high-VRAM model fallbacks* on, a **large** pulled model is supposed to go to the **top** instead.
  That needs a large model on the device and the switch turned on. Row **ROUTING-MERGE-01**.

- ★ `[layout]` **Rows span the QAM panel width** — **VERIFY.** Fixed 2026-08-16 and measured by probe (268 to 300 px); the visual walk
  was never run. Confirm the Main rows look flush and nothing overflows the column. Row **ASK-WIDTH-01**.
- ★ `[platform]` **Shell state and tab payload extraction (refactor step 8)** — **VERIFY.** Smoke: six tabs, one Ask, Ollama tab
  after Clear all plugin data. Row **SHELL-PAYLOAD-01**.
- ★ `[platform]` **VAC check (`bonsai:vac-check`) on-device QA** — **VERIFY.** Implementation complete; run **VAC-02…06** after Tier 0
  **SMOKE-F** passes.
- ★ `[voice]` **Three voice fixes from early August** — **VERIFY.** A finished install survives *Clear all plugin data*
  (**VOICE-CLEAR-01**, backend half verified), the install button reads right when the engine is already ready
  (**VOICE-REINSTALL-01**, done 2026-09-05), and the `status()` fix — a live start/stop recording — **done on the Deck
  2026-09-06**: the button went *Voice input* → *Stop voice input* → *Voice input* with no error. It recorded silence, so
  nothing was transcribed; whether speech comes back as the right words is still owed and needs a person to talk to it.
  Only the *Clear all plugin data* half (**VOICE-CLEAR-01**) is left, and that waits for the final phase.
- ★★ `[chat]` **The game a chat belongs to, above its title** — **VERIFY.** Shipped 2026-08-30 in quiet text above the slot title;
  only chats created after that date carry the name. Row **CHAT-SLOTS-V3-14c**. It costs a line of height, which cuts against the
  vertical-space goal; decide whether it shows always or only when the row has focus.
- ★★ `[QA]` **Deferred manual QA** — **VERIFY.** Tier 0 smokes (SMOKE-A, C, F) then Tier 1 (SMOKE-E, H), and a broader prompt-testing
  pass. SMOKE-B was retired 2026-09-03 (D57 #6). Round in progress: [plan 31](planning/31-deck-verification-round.md).
- ★★ `[reply]` **Thinking line fixes from 2026-08-07/08** — **VERIFY.** Emoji upright, lazy status tag survives, no bare-emoji phase
  changes, one writer. Rows **THINKING-EMOJI-01**, **THINKING-SANITIZE-01**, **THINKING-EMOJI-CLUSTER-01**, **THINKING-COPY-01**,
  **THINKING-SLOW-01**, **THINKING-LIVE-01**, **THINKING-SPOILER-01**. [Log](planning/06-thinking-blurbs-review.md#10-implementation-log).
- ★★ `[reply]` **Token streaming Phase A/B** — **VERIFY.** Start stutter fixed, sections as D-pad stops, scroll follow. Rows
  **STREAM-REVEAL-01**, **STREAM-09**, **STREAM-FOLLOW-01**. [Review](planning/05-token-streaming-review.md).
- ★★★ `[ollama]` **Custom model in the Pull Models picker** — **VERIFY, one check owed and it needs your permission.**
  Shipped and walked on the Deck 2026-09-05. A typed library name that is not in the built-in list pulls and installs; a made-up
  one explains itself; the star pins a model for Ask and reaches the settings file; a freshly pulled model is the only one badged
  **New**. **Three bugs were found on the device and fixed:** every installed model wrongly labelled New, a typing field 50 pixels
  wide, and the embedding model offered as one Ask could use. Owed: whether *Clear all plugin data* takes the New labels with it
  (**PULL-NEW-BADGE-01**) — not run, because wiping data was not authorised. Rows **PULL-CUSTOM-01**, **02**, **PULL-PIN-01** pass.
- ★★★ `[perms]` **Kids master lock** — **VERIFY.** Shipped 2026-08-09. Rows **KIDS-LOCK-01**, **KIDS-FOCUS-01**, **KIDS-REGRESS-01**
  (and **KIDS-LOCK-02** with a child account). Live CEF Stage 0 confirmation still owed.
- ★★★ `[reply]` **Soft reply-length cap and thinking budget** — **VERIFY.** Shipped 2026-08-10. Sub-check 02 verified; 01, 03 and 04
  automated with a Deck confirm owed; 05 needs a real thinking model. [Why](roadmap-details.md#shipped-qa-owed--why-each-was-built-this-way).
- ★★★★ `[ollama]` **Speed-mode VRAM preload** — **VERIFY, the mechanism proved on the Deck 2026-09-05, the timing not.**
  A Developer switch, off by default, loads the model Ask will use into memory at start-up. **A bug was found and fixed on the
  device:** it warmed the first small model installed rather than the one Ask reaches for, which on this Deck were different, so it
  spent memory on a model no question would touch. It now uses Ask's own resolver, and warms nothing when Ask's model is over the
  three-billion cap — which is what happens on this Deck, confirmed. **Still owed:** the timing comparison (**PRELOAD-01**), which
  needs a Deck whose Ask model is under the cap, and the memory-pressure case (**PRELOAD-02**). Open and untouched: whether the
  model survives the Deck sleeping.
- ★★★★ `[chips]` **Preset row: two chips across, with scrolling labels** — **VERIFY.** Rebuilt 2026-09-01 under D43. Two 30px chips
  side by side, a long label scrolls through Steam's `Marquee`, the help chip owns the row until dismissed. The dock went 245 to
  161px. Rows 02 and 03 passed on device; owed **04** only (scroll feel by eye, decode churn, reduced motion); 01b passed 2026-09-03.
  Closes the label-overflow bug. [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-02).
- ★★★★ `[tabs]` **The tab bar collapses when not in use, and names the tab** — **VERIFY.** Shipped 2026-09-02 (plan 30 W0 to W6): a
  20px bar with the active tab's name at rest, opening to a strip that labels all six. Steam's header 81px to 20px. Rows 01 to 06,
  09 and 10 pass; owed **TAB-BAR-07** (legibility by eye) and **08** (touch). Closes the "tab names never appear" bug and D44.
  [Plan](planning/30-collapsing-tab-bar.md).
- ★★★★★ `[chat]` **Named chat slots** — **VERIFY.** Redesign v3 landed 2026-08-30; the layout inverts to slot row, transcript, presets,
  Ask bar. Most rows pass on device. Owed: **CHAT-SLOTS-V2-01, 03, 04**, **V3-05a/b**, **06a/b/c**, **07**, **15d**.
  [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-02).
- ★★★★★ `[platform]` **Global quick-launch macro** — **VERIFY.** Guide-chord docs in [troubleshooting.md](troubleshooting.md) § 5; the
  checklist was never run on hardware.

---

## Knowledge base and RAG

Everything about the game notes and the search that feeds them, in one place, so you can open this file and pick up
where you left off. **Read first:** [the status report](planning/37-rag-status-report.md) — the zoomed-out picture, what
each next step buys a person, and rough costs. It is kept in step with this section. Architecture:
[knowledge-base.md](knowledge-base.md). The agreed answer-quality work: [plan 30](planning/30-kb-answer-quality-plan.md).

Same rules as the lists above: five lines an entry, stars ascending in each list, a fix moves to **Deck check owed** and
then to [Done](#done-for-v050) in the same commit. The one difference is that the knowledge base keeps its bugs, its owed
checks and its plans together here instead of spread over three lists.

**Where things stand (2026-09-06).** 266 cards over 25 games, plus 124 Deck tips, after the tranche nearly doubled both.
On questions written without seeing the cards, the right card is in the top three about four times in five and first about
half the time; those numbers are from the old thirteen games and have not been re-measured since. The Deck's own model
keeps the card's facts nine times in ten and no longer hides plain tactics behind a spoiler box. Coverage is still the
biggest limit for a person, but less so: twenty-five games now, and every other game gets the model's memory plus one
generic genre card. The new cards are not on the Deck yet; they ship with the next corpus release.

**Pick up here, in order.**

1. The bug-fixing session running today owns the knowledge-base code files. Let it land the two bugs it holds before
   touching them.
2. The new titles have their cards (plan 40 § 7). What they still need is blind test questions, written in a session that
   has not read the cards, then one corpus release. Only Fallout: New Vegas is not installed on the Deck. The sweep, the
   prompt diet and the eval tooling need no Deck.
3. Then work **Next** from the top: the prompt diet, the "not in my notes" line, symptom-only troubleshooting, the eval
   tooling and the weight sweep, spoiler tiers, follow-ups remembering, and one corpus release that carries everything
   needing a rebuild.

### Calls waiting on you

None open. **Decided 2026-09-05:** "starting out" cards get their own kind (D65); answer-first is tested both ways before
a decision (D66, the test entry under Next); structured cards stay prose (D67); the blend-weight sweep runs now and the
weights change if it agrees (D68); a first tranche of new titles comes from your own Steam library (D69, the read waits
for the Deck to be free). Anything new goes here, one line each, with what it decides.

### Bugs

- ★★ `[KB]` **Unrelated questions still get game cards stapled on** — **ACCEPTED 2026-08-27.** With a game running, *"thank
  you very much"* still attaches a card. Raising the keyword floor costs real matches, and the model mostly ignores an
  irrelevant card. [Detail](roadmap-details.md#ordinary-phrases-attach-game-cards).
- ★★ `[KB]` **A troubleshooting question that only describes the symptom reaches no tips** — **OPEN, decided 2026-09-01,
  not built.** *"The game drops me back to the library"* never reaches the crash tips because the word *crash* is absent;
  two of four blind troubleshooting questions miss. Agreed fix: when no topic matched, let the meaning search run over the
  tip sheet, measured on the 17 blind troubleshooting rows first. About a day. (D52)
  [Detail](roadmap-details.md#a-troubleshooting-question-that-only-describes-the-symptom-reaches-no-tips).
- ★★★ `[KB]` **The meaning search got about a fifth slower** — **OPEN, found 2026-09-05, still open 2026-09-06.** Three
  Strategy questions took about 1.09 s each to embed against the 0.79–0.90 s band recorded when the feature shipped; a
  repeat on the Deck 2026-09-06 read 1.10, 1.23 and 1.19 s. The earlier explanation — only the first question after a
  quiet spell pays to wake the search model and the rest are nearly free, measured on the PC at 1.47 s then 0.05 s —
  **does not hold on the Deck**: the third question here was no faster than the first. Cause still unmeasured. Evidence
  `runs/round34-drg-q*.json`, `runs/plan46-R2-strategy-half.json`.
- ★★★★ `[KB]` **What ships loses to its own meaning half on questions nobody tuned against** — **OPEN, decided 2026-09-05.**
  On the blind questions the meaning search alone puts the right card first 63% of the time; the shipping blend 54%. Agreed:
  build the weight sweep, run it on the tuning questions only, confirm once on the blind set if it agrees, then change the
  weights. Never tune against the blind set. Groundwork done: 51 blind rows in the tuning set. (D68) [Detail](roadmap-details.md#the-shipping-retrieval-arm-loses-to-the-vector-half-alone-on-rows-nobody-tuned-against).

### Deck check owed

- ★ `[KB]` **Five checks from the August retrieval rework were never run on the Deck** — **VERIFY, or retire.** The corpus
  format gate, the relevance floor, follow-ups searching the user's words, transparency matching what the model got, and
  the Developer kill-switch. Either one evening with pinned test chips, or close them as superseded by the rows that
  passed this week. Rows **KB-VARIANT-01**, **KB-FLOOR-01**, **KB-FOLLOWUP-01**, **KB-TRANSPARENCY-01**, **KB-KILLSWITCH-01**.
- ★★★ `[KB]` **The meaning search searches on its own instead of re-ordering keyword hits** — **VERIFY, the label half now
  passes in both modes; the timing half does not.** Confirmed again on the Deck 2026-09-06: three Strategy questions all
  read *Keyword + meaning*, and the same three in Speed read *Keyword search* with no embed time — the Speed half is
  closed, see Done. What still fails is the clock: the meaning search took 1.10, 1.23 and 1.19 seconds on that run, every
  question, not just the first, where the row wants the second and third at or under one second. Row **KB-RECALL-01**
  stays owed for the timing only; **KB-RECALL-02** verified at the desk.
- ★★★ `[KB]` **DRG Survivor glossary terms** — **VERIFY, one touch tap owed.** Shipped 2026-08-28 and walked on device:
  underline, popup, D-pad reachability, B, one-press Up. Rows **DRG-GLOSSARY-01…04**.
  [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-02).
- ★★★ `[KB]` **KB download Cancel** — **VERIFY, blocked.** Shipped 2026-08-05. The download finishes in about a second on
  device, so there is no window to press Cancel in. Needs a slower fixture or a throttle. Row **KB-CANCEL-01**.

### Next

- ★ `[KB]` **Measure answers with the character voice on** — **OPEN, added 2026-09-05.** The Deck answers in a voice; the
  answer test runs with it off, and five Deck runs lost two facts to the voice. One switch on the test, and the voice
  presets become measurable the way the prompt is.
- ★★ `[KB]` **Prompt diet** — **OPEN, agreed 2026-09-01.** The model reads about nine tokens of rules for every token of
  knowledge. Drop the citation instruction (obeyed once in 89 asks, and the UI cannot show it), send screenshot rules only
  when an image is attached, put the cards next to the question. About a day, measured before and after on the answer test.
- ★★ `[KB]` **Answer first, then the menu: test both shapes before deciding** — **OPEN, test decided 2026-09-05.** Today
  a named question with a matching card gets a short orientation and the menu; the other shape gives the card's tactics
  first and the same menu. PC first: an "answer first" variant on the answer test, the named-thing cases twice each way,
  comparing facts kept, menu present and length. Then three pinned sentences on the Deck in both shapes for you to read.
  Row **KB-ANSWER-03**. Examples and trade-offs in the decisions file. (D66)
- ★★ `[KB]` **"Not in my notes" line** — **OPEN, agreed 2026-09-01.** When a game question matches no card, one muted line
  built by code says the answer is general knowledge, so a person can tell notes from memory. Only on Strategy and Expert
  asks for a covered game; never when the library is off or the game is uncovered. Wording to settle with you. (D48)
- ★★ `[KB]` **Eval tooling: the weight sweep, per-question results for what ships, a second right answer** — **OPEN,
  agreed 2026-09-01, sweep go-ahead 2026-09-05.** Nothing a user sees. The sweep runs on the tuning questions and decides
  the blend-weights bug above; the rest stops every card batch reading as a regression when two cards are both fair
  answers. No row uses the second-answer option yet. One to two days. (D51, D68)
- ★★ `[KB]` **The eval cannot yet prove the meaning search rescues many questions** — **OPEN, one measurement owed.** The
  slice of questions the word search cannot answer at all was 3 rows when last counted, before 36 more blind rows landed.
  Re-count it on the next search run before calling this closed. [Detail](roadmap-details.md#eval-fixture-cannot-see-a-recall-failure).
- ★★ `[KB]` **Pull the embedding model as part of installing the library** — **OPEN, added 2026-09-05.** A person who
  installs the library but never presses the pull button silently gets word search only, the weaker half by every
  measurement. A button and a one-time hint exist today; make the pull part of the download flow, with consent, never
  silent. Promoted out of Phase 7. One to two days.
- ★★ `[KB]` **A latency budget for a game question** — **OPEN, added 2026-09-05.** The slowdown above was only caught because
  one QA row happened to record a band. Write down the budget (embed time plus first token with a game running) so the next
  regression fails a check instead of relying on luck.
- ★★ `[KB]` **A measured context-window experiment** — **OPEN, research, added 2026-09-05, re-measured 2026-09-06.** The
  Deck's model runs with a 4,096-token window and a Strategy question with cards already goes over it (the bug above). Try 8,192 as a Developer experiment with a game
  running, recording memory and time to first token, before it becomes a setting. Agreed as "later, its own call". (D46)
- ★★★ `[KB]` **Follow-ups remember** — **OPEN, agreed 2026-09-01.** *"What about the second phase?"* should answer about the
  boss you were just asking about; today the model gets only the newest message and the follow-up searches nothing. First
  carry the previous turn's named thing into the search (a day); then chat history trimmed to the window (two more). (D47)
- ★★★ `[KB]` **Spoiler coverage as a tiered setting** — **OPEN, tiers confirmed 2026-09-01.** Strict fences bosses, endings
  and chapters; default fences only named story beats and endings; open fences nothing you asked about. Naming a boss still
  unlocks it in every tier. Needs the settings plumbing, a prompt per tier measured on the answer test, a control with a
  focus entry, and Deck QA. About three days. (D50) [Detail](roadmap-details.md#spoiler-coverage-should-be-a-setting-with-tiers).
- ★★★ `[KB]` **"Starting out" cards get their own kind** — **OPEN, decided 2026-09-05, nothing built.** A new player gets
  a *"How do I get started in Fallout 4?"* chip and *"where do I start"* finds the card. One new kind in the validator and
  the two kind lists, one chip wording, a rescue phrase list, a rebuild; then re-type the three cards filed as mechanics and
  write the Cyberpunk, Fallout 4 and Red Dead ones you asked for. Rides the bundled release. (D65)
  [Detail](roadmap-details.md#the-corpus-has-no-starting-out-card).
- ★★★ `[KB]` **Card style pass** — **OPEN, measure first, added 2026-09-05.** Rewrite the 139 prose cards as labelled short
  lines, the shape the 16 structured cards use. Facts kept is already 92%, so the ceiling is low; do it only if the answer
  test shows the labelled shape scores better. Two to three days of content plus a rebuild.
- ★★★ `[KB]` **Deeper answer checks** — **OPEN, added 2026-09-05.** The answer test checks facts, contradictions, fences and
  the menu, and cannot see whether a reply was helpful or whether the model admitted not knowing. Add a small set of
  questions no card can answer, scored for an honest "I don't know", and a read by a person of ten replies a month.
- ★★★ `[KB]` **The next corpus release carries everything that needs a rebuild** — **OPEN, added 2026-09-05.** Any format
  change makes every installed library stale until re-downloaded, so per-game tips, the starting-out kind and the style pass
  ride one release rather than three. Same format as today for anything that can wait.
- ★★★ `[KB]` **KB visual maps** — **OPEN.** Two shapes you named 2026-08-29: a dungeon map, and a boss outline with weak
  points marked. Nothing draws anything in a reply today. A dungeon map has to be authored, which sits behind the source
  policy and a corpus rebuild. Research first. [Detail](roadmap-details.md#kb-visual-maps).
- ★★★★ `[KB]` **RAG Phase 4: extended retrieval** — **PARTIAL.** The chip guarantee and 16 structured cards shipped
  2026-08-19; the split was accepted 2026-08-21 and prose replies were accepted 2026-09-05 (D67). Left: per-game Deck tips (content for seven titles collected, two quirks from
  your own Deck), which need a format bump and a release — see the release entry above. Two to three days. The chip
  clipping check waits on the preset-row work. [Detail](roadmap-details.md#rag-phase-4-extended-retrieval).
- ★★★★ `[KB]` **RAG Phase 5: depth on the thirteen titles** — **PARTIAL.** 133 → 161 cards since 2026-08-29. Eleven of the
  thirteen titles still have no enemy or item cards, so "how do I deal with X" works for two games. Next: 40–60 entity cards
  in tranches with a quality read from you after the first; then chip ranking by meaning. Card authors cannot write blind
  test questions, so content and eval rows go in separate sessions. [Plan](planning/28-phase5-corpus-depth.md).
- ★★★★ `[KB]` **A first tranche of new titles from your Steam library** — **PARTIAL, cards written 2026-09-06.** All eleven
  games now have notes: Black Mesa, Hollow Knight, GTA V, GTA IV, DOOM Eternal, Doom 64, Super Mario 64, Mario Kart 64,
  Paper Mario TTYD, Super Smash Bros. Melee, Fallout: New Vegas, Pikmin 2. 105 cards, every one citing a page, a licence
  and the day it was read. Owed: blind test questions in a different session, then one corpus release, then the Deck check
  (**KB-TRANCHE-01**). [Plan](planning/40-new-titles-from-the-library.md). (D69)
- ★★★★ `[KB]` **KB online / versus strategy content** — **OPEN, discovery locked 2026-08-09.** Multiplayer questions
  (roles, callouts, co-op) get cards; today they get nothing specific. New card kinds and a spoiler table update, Left 4
  Dead 2 first, then Counter-Strike 2, from archive dumps only. Two to three weeks. [Plan](planning/17-kb-online-versus-strategy-content.md).
- ★★★★ `[KB]` **RAG Phase 7: retrieval infrastructure** — **OPEN.** Mostly nothing at 161 cards. What still matters: a
  thumbs-down that stops a wrong card coming back (three days), add-on packs before any large catalog (five days or more),
  a screenshot feeding the search (a short test to find out first). A nearest-neighbour index buys nothing until the corpus
  is thousands of cards. The embedding-model pull is its own entry above. [knowledge-base.md](knowledge-base.md) § Phase 7.
- ★★★★★ `[KB]` **Community tip contribution** — **OPEN, unblocked.** A reader turns a good reply into a proposed card with
  one press: **Suggest as a tip** writes a valid card to the Desktop plus a GitHub attach link. Three to five days.
- ★★★★★★ `[KB]` **RAG Phase 8: catalog corpus** — **OPEN, intent only.** The change that makes most people's games get
  notes instead of the model's memory: about the top 1000 Steam titles, the top 100 on Deck, and an emulated slice. Months:
  it cannot be hand-written (161 cards took six weeks), so it needs an ingestion pipeline from wiki dumps, per-source
  licensing, a size budget, packs and the index. [knowledge-base.md](knowledge-base.md) § Phase 8.

---

## Done for v0.5.0

Everything shipped since v0.4.9 (2026-07-08), one line each, newest first. Detail: [CHANGELOG.md](../CHANGELOG.md),
[archive/roadmap-completed.md](archive/roadmap-completed.md), [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).

**Verified on the Deck 2026-09-06 (knowledge base, wave one):**
- ★★★ `[KB]` **A long Strategy question no longer throws away its game notes** — when a question would send more to the
  model than its window can hold, the reply now gets shorter instead of the notes being dropped from the front of what
  the model reads. Confirmed on the Deck with the character voice on, thinking at medium, Hades running: asking about
  Megara — a boss with a note — got an answer built from it, and the log showed the reply budget trimmed from 2112 to
  1800 tokens so the prompt fit, with the old silent-drop warning gone. **Correction to this entry's old evidence:** it
  used to point at a different Hades boss, the Bone Hydra, who has no note in the library — a generic answer to that
  question was always correct and never proved the bug. The real evidence is a PC test run that lost the start of 22 of
  37 prompts, and three Deck questions that went over the window by 703, 780 and 712 tokens. Full numbers and the three
  smaller trims that came first: [CHANGELOG.md](../CHANGELOG.md). On-Deck **KB-PROMPT-FIT-01** in [testing.md](testing.md).
  [Detail](roadmap-details.md#game-notes-are-attached-and-then-thrown-away).
- ★★★ `[KB]` **A quick question in Speed mode no longer pays for the slow search** — confirmed on the Deck 2026-09-06 with
  Deep Rock Galactic: Survivor running, on a fresh build. All three of the row's sentences were asked in Speed: two read
  *Keyword search*, the third read *Knowledge base (skipped)* because the word search found nothing on its own — none of
  them spent any time on the meaning search. Fixed on the shared branch 2026-09-05 (`c72310a`). Row **KB-RECALL-01**'s
  Speed half closes; the timing half of its Strategy check is still open, in the knowledge base section. Evidence
  `runs/plan46-R2-speed-half.json`.

**Checked on the Deck 2026-09-06 and found fine:** a suggestion chip that looked like scrambled characters was the
reveal animation caught mid-frame, and a slow-reply notice that looked like it was missing words reads correctly in
full — *"69 seconds, over 60: prefer GPU for Ollama, not CPU."*

**Verified on the Deck 2026-09-06 (reply block, second pass):**
- ★ `[reply]` **Retry works on a reply that came back after a restart** — reopening the plugin after it restarts shows your
  last conversation, and the Retry badge on it used to send nothing at all. It re-asks the question it is drawn on now.
  Found and fixed 2026-09-06; confirmed on the Deck the same day, badge pressed with the controller, a real request logged
  with that question. [Detail](archive/roadmap-bugs-fixed.md#retry-on-a-restored-reply-sent-nothing).
- ★★ `[focus]` **The end of a long answer now stays clear of the Ask bar in both directions** — coming back up from the
  Show details line used to leave a third of the last part behind the bar, at the same spot every run. A scroll log on the
  Deck showed why: the plugin's "lift it clear" step was being ignored by the browser for anything inside the answer
  bubble, and Steam's own slow scroll then dragged the part under the bar. The lift now moves the panel itself when the
  browser will not. Runs: `reply-block-up-into-answer-fixed`, `reply-block-both-ways-after-lift-fix`,
  `reply-block-corner-icons-inside`.
- ★★ `[reply]` **Retry and Copy sit inside their bubbles' corners** — both had been straddling the bubble edge, half in
  and half out. Retry is 7px in from the question bubble's left edge and 4px up from its bottom; Copy is 7px in from the
  answer's right edge and 4px up. Each bubble's last line leaves room for its icon, no bubble grew, and the reply block
  starts where it did before the icons existed. Runs: `reply-block-corner-icons-inside`, `reply-block-copy-right-down-up`.

**Verified on the Deck 2026-09-06 (round 34 continued):**
- ★★★ `[ollama]` **The order you set for which model to try now sticks** — found and fixed the same night. Setting an order used
  to be undone half a second later, so the setting looked like it did nothing.
  [Detail](archive/roadmap-bugs-fixed.md#round-34-continued-2026-09-06)
- ★ `[reply]` **A branch question names the game again** — the follow-up question at the end of a Strategy answer used to say
  *"Where are you at in … ?"* with the game's name replaced by three dots. It now says the name.
  [Detail](archive/roadmap-bugs-fixed.md#round-34-continued-2026-09-06)
- ★★ `[reply]` **Stopping a reply now says so** — pressing Stop leaves a *Stopped — partial answer kept.* line, keeps the half
  answer, greys out Helpful and Not really, and leaves Retry live.
  [Detail](archive/roadmap-bugs-fixed.md#round-34-continued-2026-09-06)
- ★★★★ `[chat]` **A chat's follow-up question stays in its own chat** — the block used to show up in whichever chat you were
  looking at. It now shows only in the chat that asked for it, and comes back when you switch back.
  [Detail](archive/roadmap-bugs-fixed.md#round-34-continued-2026-09-06)
- ★★★ `[platform]` **Legacy-loader shim removal (D11)** — the last two checks it owed ran on the device: a real Ask typed into
  the Main tab, and a voice recording started and stopped for real.
  [Detail](archive/roadmap-completed.md#round-34-continued-2026-09-06)

**Verified on the Deck 2026-09-05 (round 36):**
- ★ `[layout]` **The question bubble lines up with the answer below it** — it used to sit further in from the left than
  the answer sat from the right, which read as lopsided. Both are now the same width and mirrored.
  [Detail](archive/roadmap-bugs-fixed.md#round-36-2026-09-05)
- ★★ `[reply]` **Replies always arrive word by word** — streaming is how replies work now, and the Developer switch for it is
  gone. [Detail](archive/roadmap-completed.md#round-36-2026-09-05)
- ★★ `[chips]` **Preset chip expansion** — six new suggestion chips for the things that shipped since early August. Both waves
  checked in one sitting. [Detail](archive/roadmap-completed.md#round-36-2026-09-05)
- ★★★ `[chips]` **One suggestion chip instead of two** — a Settings switch, off by default, gives one chip the whole column.
  [Detail](archive/roadmap-completed.md#round-36-2026-09-05)

**Withdrawn 2026-09-02:** *QAMP Phase 2 profiles* and the *QAMP verification checklist*. Both tested TDP apply, which was removed
on 2026-07-30 (`apply_tdp` no longer exists). Preserved in the archive.

**Closed as not reproduced 2026-09-02:** *`run_python_tests.py` exits 0 when tests fail*. The script has returned 1 on failure
since April (`25742f2`), and a deliberate failing test exits 1 today. If it recurs, record the exact command and shell.

**September 2026**
- ★★★ `[KB]` **A quick question stops paying for the slow search** — Speed mode now does the fast keyword lookup and
  nothing else, which takes about a second off every Speed question. Measured on the Deck 2026-09-05, same question and game
  in all three modes: Speed spent **0 ms** on the slow search, Strategy 1473 ms, Expert 53 ms. Strategy and Expert are
  unchanged. The trade the maintainer accepted is that a Speed answer loses the cards only the slower search finds (D62 #2).
- ★★ `[chat]` **The question you asked shows in full** — open a turn and the whole thing is there, wrapped over up to five
  lines with the last one fading; close it and it goes back to a single line. It used to be cut twice and you never saw more
  than about 48 letters. Confirmed on the Deck 2026-09-05: a 57-letter question wrapped over two lines with no dots (D60).
- ★ `[main]` **The line under the question box knows a game is running before you ask** — it used to say no game was
  running until your first question, even with a game open and its own chips on screen. Confirmed on the Deck 2026-09-05:
  started a game, opened the panel, pressed nothing, and the line named the game (CHIP-ROTATION-01).
- ★ `[focus]` **An answer paragraph no longer takes the highlight while hidden behind the bottom bar** — the step that
  lifts it clear now tries again at 300 and 900 milliseconds instead of giving up after the first go. Confirmed on the Deck
  2026-09-05: walking a reply down and back up, every stop fully visible, where the same walk before the fix had two a
  person could not see.
- ★★ `[KB]` **Asking about a boss by name works the way people actually type** — *king dodongo fight* now names the boss
  just as *how do I beat king dodongo* does, so its tactics come through unfenced; a vague question still names nothing and stays
  fenced. All seven sentences confirmed on the Deck 2026-09-05.
  [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-05).
- ★★ `[KB]` **Expert mode gets as many cards as Strategy** — Expert was quietly starved of the knowledge base. Five cards
  against Strategy's three on the same question (2026-09-04), and the last owed check — an uncovered game attaching nothing —
  passed 2026-09-05. [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-05).
- ★★★ `[KB]` **Show details says what the knowledge base had for your game** — all four readings now confirmed on the Deck:
  a covered game reads the section count, the toggle off reads off, no game running says so, and a game the corpus does not
  cover reads *none for this game* (2026-09-05). [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-05).
- ★★ `[reply]` **Choose how hard the AI thinks** — an Off / Brief / Balanced / Deep row on the Ollama tab. Both Deck checks
  passed (the D-pad walk 2026-09-03, a real thinking model 2026-09-04); the entry had simply never been moved.
  [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-05).
- ★★ `[focus]` **Show details tells you where you are without a wall of colour** — you failed the first version on the Deck
  2026-09-05 ("too much noise"); rebuilt to one colour on the row and passed on the second look (CONTEXT-LADDER-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[focus]` **The character picker uses the plugin's own white highlight** — you failed the first version on the Deck 2026-09-05
  ("rings that are yellow, they should be white"); the tiles now take the same white ring as everything else and passed on the second look (CHAR-PICKER-RING-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★★ `[focus]` `[perms]` **A blocked reply's Open Permissions button works end to end on the D-pad** — verified on the Deck
  2026-09-05: the button is a stop, A lands on the matching toggle, A turns it on, and *Back to Main* returns to the reply (PERM-JUMP-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★★ `[focus]` **After a modal closes or the panel remounts, the ring no longer sits on a hidden tab button** — verified on
  the Deck on all three paths the rig can drive: modal return, QAM reopen and a loader restart (TAB-BAR-11). A real suspend and resume still wants a by-hand look. [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★★ `[focus]` **Entering a reply from above or below lands on a section, not the whole bubble** — verified on the Deck:
  Down from the chat row reaches the first section (2026-09-04) and Up from Helpful the last (2026-09-05), after the thumbs row's own Up was fixed (CHAT-REPLY-ENTRY-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[focus]` **Reordering in the try-order picker keeps the highlight and keeps the picker open** — verified on the Deck
  2026-09-04 on the third fix: A on a row's Down button moves the row and the ring follows it (PICKER-REORDER-02). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[ask]` **The question overlay now sits exactly on the native text field** — verified on the Deck 2026-09-04: the field and
  its two mirrors agree on wrapping, font and width to 0.02 px, empty and with a two-line question (ASK-OVERLAY-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[chips]` **Chip rotation reaches past the top three of the candidate list** — verified on the Deck 2026-09-04 with Half-Life 2
  running: ranks 2, 3, 4 and 5 of its eight chips came round inside 30 seconds and rank 1 did not (CHIP-ROTATION-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★★ `[chat]` **A command reply keeps its question as the header and titles the chat** — verified on the Deck 2026-09-04: the VAC
  check reply is saved to the chat like any other turn, so the header and the chat title read the command (CMD-REPLY-TITLE-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[focus]` **Up from a preset chip leaves the row in one press** — verified on the Deck 2026-09-04 on an empty chat (to the chat row)
  and with a reply on screen (to the session strip); Left still walks the history (PRESET-ONE-LINE-03, D58 #2). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[chips]` **A pinned test batch longer than the row now reaches its tail, and an Ask restarts the walk** — verified on the Deck
  2026-09-04 with the eleven-sentence batch (QA-FROZEN-CHIPS-02). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[focus]` **The greyed-out Clear frozen test chips button no longer takes a dead press** — verified on the Deck 2026-09-04: with no
  batch pinned the button is gone and a Developer sweep finds no such stop (DEV-CLEAR-CHIPS-01). [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★★ `[focus]` **Left on the Ollama sliders no longer throws the ring out of the plugin** — verified on the Deck 2026-09-04 on the Reply
  style, keep-alive and custom-timeout sliders (ONBUTTONDOWN-AUDIT-01); the UI-scale slider got the same fix, unit-tested only. [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[KB]` **The KB arms report's verdict now judges every retrieval arm** — fixed at the desk 2026-09-04. It used to compare
  only `rrf` against `keyword` and could print "no separation" while a third arm (`vector_only`) was well ahead in the same
  table; desk-only, no Deck check applies. [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- ★ `[reply]` **A branch-pick turn keeps the caption you saw** — verified on the Deck 2026-09-04 (CHAT-HEADER-CAPTION-01):
  the header read *"I'm at: Dodging Asterius's charge"* before and after closing and reopening the panel.
- ★ `[ui]` **The bonsai pot sits centred under the canopy** — measured from a Deck capture 2026-09-04 (BONSAI-ICON-GEOM-01):
  canopy, stem, pot rim and pot body all centre on the same pixel column, in the tab strip and in Decky's plugin list.
- ★★ `[KB]` **Troubleshooting questions reach the compat cards** — D16's word-boundary routing verified on the Deck 2026-09-04
  (KB-ROUTER-01, four sentences, every one routed to `compat_tips`).
- ★★★ `[KB]` **Knowledge chips say where the card came from, and when** — the owed capture-date check passed on the Deck
  2026-09-04 (KB-ATTRIB-01): `combineoverwiki.net · CC-BY-SA-4.0 · as of 2026-08-09`.
- ★★ `[tabs]` **Your tab is remembered when you leave and reopen** — D15's three-way choice verified on the Deck 2026-09-03
  (TAB-RESUME-01/-MODE-01/-FOCUS-01); the first-press focus snap stays open with the picker focus-restore item.
- ★ `[chips]` **The static seed stops telling you to enable the knowledge base when it is already on** — verified on the Deck
  2026-09-03 (PRESET-KB-SEED-01).
- Prompt budget guard (D46): attached Proton logs capped at 4 KiB newest-first, the follow-up paste capped at 1,500
  characters, and a plugin-log warning whenever prompt plus reply budget would not fit the Deck's 4,096-token window,
  2026-09-03.
- Fence fix confirmed on the Deck (**KB-ANSWER-02**, 5 of 5) and the *Update knowledge base* button confirmed working from a
  controller press, 2026-09-03. [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-04).
- Collapsing tab bar with tab names (plan 30 W0 to W6), 2026-09-02.
- Preset row rebuilt: two chips across, scrolling labels, help chip owns the row (D43), 2026-09-01/02.
- Spoiler fences no longer wrap harmless tactics on no-story games or named bosses, 2026-09-02.
- Answer-side eval harness (`scripts/eval_kb_answers.py`, D45) with its first baseline, 2026-09-02.
- Corpus `2026.09.01` (161 cards) published and installed on the Deck, 2026-09-02.

**Late August 2026**
- A finished long reply scrolls to its end through Steam's own scroller, 2026-08-31.
- Chat slot strip runs newest to oldest; an Ask at `[+]` creates the chat; never-used chats delete themselves (D42), 2026-08-31.
- Focused controls at the end of a reply are lifted clear of the preset dock, 2026-08-31.
- Free-play sweep added as a standing QA row (QA-FREE-PLAY-01), 2026-08-31.
- Nothing hangs below the bottom of the screen (50px clip fixed), 2026-08-30.
- Named chat slots v3 redesign, all 19 commits; sticky Ask dock; game name above the slot title, 2026-08-30.
- Corpus chips no longer vanish 21 seconds after the panel opens; all six game chips rotate through, 2026-08-29.
- "Force session RAG chips" reaches rotation as well as seeding, 2026-08-29.
- Card relevance has its second signal (pool margin); junk questions get no cards from the vector half, 2026-08-28.
- A finished reply remembers which game it was about (per-turn AppID), 2026-08-28.
- DRG Survivor glossary terms: tap-to-define jargon in replies, 2026-08-28.
- Copy reply to clipboard, 2026-08-28.
- Decode preset chip animation replaces the typewriter, 2026-08-28.
- Show diagnostics folded into Show details, 2026-08-28.
- Unfenced-spoiler feedback chip, and refine chips reach the backend again, 2026-08-28.
- A rejected checklist block no longer reaches the reply as raw JSON, 2026-08-28.
- Try-order picker: Down moves the highlight (D36), B closes it, same modal frame as the other pickers, 2026-08-28.
- Pickers return the ring to the button that opened them, 2026-08-28.
- A chip only looks focused when it holds the ring; tab icons have names, 2026-08-28.
- B on a glossary popup or a spoiler fence closes it without leaving the reply; one Up reaches a glossary chip, 2026-08-28.
- Branch-pick turns keep the caption the user saw (desk), 2026-08-28.
- Safety guard confirmed with streaming off; Show details, D-pad scroll step, and branch buttons re-measured fine, 2026-08-28.
- Blind holdout rows (56) and D37 measurement; first blind `tune` rows, 2026-08-28/29.
- Session context panel no longer traps the D-pad; destructive-advice guard fires on real replies, 2026-08-27.
- Clear cache clears the session (D32, D34, D35), 2026-08-27.
- AI character avatars: prop emblems on the Ask bar and in the picker (D33), 2026-08-26/27.
- Frozen test chips for QA, 2026-08-22.
- Corpus point release `2026.08.22` (133 cards), 2026-08-22.
- Static focus checks and CI running the existing gates, 2026-08-24.

**Mid August 2026**
- KB coverage chip says "could not be matched" instead of "no game running", 2026-08-23.
- Session context strip counts every archived turn, and never the newest twice, 2026-08-23/27.
- Eval harness: tips scored against the right vector, model sweep runs again, 2026-08-21.
- RAG Phase 4 tracks 1 and 2: chip guarantee, Tip badge, 16 structured cards, 2026-08-19.
- British spellings find US-spelled cards; "the boss" reaches a boss card; ask about a game with nothing running (D19), 2026-08-19.
- Vector half of retrieval has its own recall pass; compat tips stay on the routed topic (D22); Expert mode gets the full card
  budget, 2026-08-18.
- Knowledge base retrieval is genuinely hybrid (RRF, schema v3), 2026-08-18.
- Named chat slots persist a turn; rows span the QAM panel width, 2026-08-16.
- RAG Phase 6: public corpus publish on Hugging Face and GitHub, 2026-08-16.
- Thinking effort control Phase 1 (D21), 2026-08-15.
- Soft reply-length cap and thinking budget, 2026-08-10.
- Kids master lock; Reply style Caveman; source attribution on knowledge chips; asked-entity extraction, 2026-08-09.
- RAG retrieval-quality remediation PR1 and PR2 closed, 2026-08-09.
- Thinking line fixes: sanitizer, emoji, single writer, 2026-08-07/08.
- KB coverage chip; permission jump; Wave 1 icon and voice fixes; token streaming Phase A and B, 2026-08-07.
- KB compat routing widened (D16); KB download Cancel, 2026-08-05/06.
- Resume last tab (D15); shell modal and payload extractions (refactor step 8), 2026-08-04.
- Session RAG chip candidates and routing-merge RPCs wired (D1), reply-language snapshot RPC, voice `status()`, 2026-08-02/03.

**July 2026**
- RPC calls time out (15s wrapper); agent architecture snapshots; dead backend and shims removed.
- Permissions cleanup and obsolete-features batch (web links always on, TDP apply removed), 2026-07-30.
- Knowledge base covers all thirteen titles (119 cards); Portal 2 and Half-Life 2 wiki cards; hybrid kill-switch.
- Session RAG preset chips; voice STT session daemon; install voice engine in one pass.
- Token streaming with live markdown (experimental); Strategy streaming with masked spoilers, 2026-07-15.

---

<a id="appendix"></a>

The cross-feature dependency summary, the dependency diagram, and the icon-sizing note moved to
[roadmap-details.md](roadmap-details.md#appendix-moved-from-the-roadmap-2026-09-02) on 2026-09-02.
