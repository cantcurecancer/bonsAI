# Plan 31 — The Deck verification round

**Status:** **D57 locked 2026-09-03**, all nine answers recorded in
[maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md); the round started 2026-09-03
with the rig driving unattended. Progress is written into § 11 as rows close. Written against branch
`experimental` at `3b0e9d7`; the Deck runs that build (§ 2).
**Purpose:** every roadmap [Verify](../roadmap.md#verify) row, sorted by what it needs from the device
and put in a run order, so that "go" is one word and the rig does not re-derive the list mid-session.
**Does not:** change any code. Row wording is quoted from [testing.md](../testing.md) and
[testing-manual.md](../testing-manual.md); where this file and a row disagree, the row wins.

## 1. Why the Deck rows run one at a time

Anything that needs the screen or the buttons is a single serial queue, whoever drives it:

- One device with one focus ring; a second driver moves the ring under the first one's feet.
- The DPS bridge registers CDP tunnels (reads) but not presses, and has no lock, so "nobody is
  looking" does not mean "nobody is pressing" (measured 2026-09-02; the *one driver at a time* note).
- Steam's state is global: the running game, the Ask mode, the animation mode, the frozen chip
  batch, the thinking level. Two rows with different setups cannot overlap.

Subagents do not change that. They can only add two side lanes (§ 3): probes over SSH that never
touch the UI, and desk paperwork.

## 2. What is true on the device today

Read over SSH on 2026-09-02 at 23:42, no button pressed, while another chat was driving.

| Fact | Value | How known |
|---|---|---|
| Build | `main.py` and `dist/index.js` byte-identical to this checkout's build of 19:15, which post-dates the last code commit `cc110fb` (18:53) | `md5sum` both sides |
| Passwordless sudo | works (the screenshot and record scripts need it) | `sudo -n true` |
| Models on the Deck's Ollama | `qwen3.5:4b` (thinking), `qwen2.5:1.5b`, `gemma4:e2b-it-qat`, `nomic-embed-text` | `/api/tags` |
| Ollama runs as | `~/.local/bin/ollama serve`, a user process; where its stdout lands is UNKNOWN | `pgrep` |
| Knowledge base | on; corpus `2026.09.01` on the SD card; hybrid retrieval on | `settings.json` |
| Corpus covers | app ids 220, 550, 620, 377160, 1086940, 1091500, 1145360, 1174180, 1222670, 1547000, 2321470, plus two rows with no app id | `corpus.db` `games` |
| Installed and covered | Half-Life 2, Left 4 Dead 2, Portal 2, Fallout 4, Baldur's Gate 3, Cyberpunk 2077, Hades, The Sims 4, GTA San Andreas DE, Deep Rock Survivor | `steamapps/common` |
| Installed and not covered (for the "uncovered title" rows) | Black Mesa, Brotato, ULTRAKILL, Sable, Hollow Knight, Stardew Valley, Undertale | same |
| Ocarina of Time | Ship of Harkinian, a non-Steam shortcut (`soh.appimage`, shortcut app id `2593781457`); "runs incredible" per the maintainer | `shortcuts.vdf`, D57 #3 |
| Settings that the round will change and restore | `ask_mode` strategy, `ask_think_effort` off, `preset_chip_animation` carousel, `tab_resume_mode` resume_recent, streaming on, character on (Ali G), text try order empty, all five capabilities on | `settings.json` |
| Frozen chips pinned now | 10: five from another session, then the five KB-ANSWER-02 sentences | `settings.json` |
| Voice engine | binaries present under `settings/bonsAI/voice_bin/` | `find` |
| Backups already there | `settings.json.bak-preQA` | `ls` |

## 3. The lanes

- **Lane A — screen and buttons.** Serial. Sessions 1 to 3 below. Every press batch starts with a
  fresh `deck_automationStatus` and stops the moment a foreign tunnel appears; every walk uses
  `deck_runSequence` with focus acquisition on, records step 1's `from`, and checks each landing
  twice: focused (the walk result) and visible (the rect above the dock's top edge, and
  `elementFromPoint` at its centre hits the control — [QA-FREE-PLAY-01](../testing-manual.md)).
- **Lane B — over SSH, no UI.** Runs alongside lane A, except during timing rows (KB-RECALL-01's cost
  half, THINKING-LIVE-01, the STREAM rows, THINK-EFFORT-04's latency), because the probes use the same
  Ollama. § 8.
- **Lane C — desk.** A subagent can flip rows in the testing docs, move roadmap entries and write the
  archive entries while lane A drives (house rule 4: same commit as the pass).

## 4. Frozen chip batches — confirm before pinning (D57 #2)

The standing rule: show the list, get it confirmed, then pin. A batch is 3 to 12 entries; the
carousel is replaced by the batch in order, each chip badged **TEST**, and A fills the Ask field
without submitting. Pin with the panel closed, over SSH into `settings.json` or from Developer →
*Knowledge base (dev QA)*: `load_settings` re-reads the file on every call
([main.py:778](../../main.py), [settings_service.py:490](../../py_modules/backend/services/settings_service.py)),
so the next panel open picks the batch up, and a closed panel cannot save a stale copy over it.

**Batch 1 — Session 1, nothing running (11).** Ask mode per line.

| # | Sentence, verbatim | Row | Mode |
|---|---|---|---|
| 1 | `I'm out of room and want my installs on the memory card instead` | KB-ROUTER-01 (1) | Speed |
| 2 | `the game only responds to the touchpad and ignores the sticks` | KB-ROUTER-01 (2) | Speed |
| 3 | `I can play alone but online kicks me out straight away` | KB-ROUTER-01 (3) | Speed |
| 4 | `my playstation 2 games run at half speed on the handheld` | KB-ROUTER-01 (4) | Speed |
| 5 | `what should I do next` | KB-COVERAGE-NOAPP-01 first half; KB-COVERAGE-01 `KB: off` with the toggle off for one Ask | Speed |
| 6 | `reply with only the word echo` | CLEAR-CACHE-01 | Speed |
| 7 | `in left 4 dead 2, how to beat tank` | KB-ANSWER-02; also KB-ATTRIB-01's date check if the attached card is wiki-sourced (`as of 2025-04-05`) | Strategy |
| 8 | `in half-life 2 the antlions keep coming up out of the sand` | KB-ANSWER-02 | Strategy |
| 9 | `in hades, theseus and asterius keep killing me` | KB-ANSWER-02 | Strategy |
| 10 | `in ocarina of time how do i beat volvagia` | KB-ANSWER-02 | Strategy |
| 11 | `in red dead redemption 2 what happens to arthur at the end` | KB-ANSWER-02 (must fence); THINKING-SPOILER-01; SMOKE-E's tap-to-reveal | Strategy |

Lines 7 to 11 are already pinned as chips 6 to 10; the maintainer confirmed them on 2026-09-02.

**Batch 2 — Session 2, a game running (12).** The game is named per line.

| # | Sentence, verbatim | Row | Game | Mode |
|---|---|---|---|---|
| 1 | `how do i kill the big armoured bug boss` | KB-RECALL-01 | Deep Rock Survivor | Strategy, then Speed |
| 2 | `which character is best for a beginner` | KB-RECALL-01 | Deep Rock Survivor | Strategy, then Speed |
| 3 | `tips for the thorny plant level` | KB-RECALL-01 | Deep Rock Survivor | Strategy, then Speed |
| 4 | `How do I beat Glyphid Dreadnought?` | KB-ASKMODE-01 on screen; DRG-01 if in scope | Deep Rock Survivor | all three |
| 5 | `the slow-motion aiming barely lasts, how do I get more of it` | KB-ROUTER-01, the other direction (strategy cards, not a tip) | any covered game | Strategy |
| 6 | `raphael fight strategy` | STRAT-ENTITY-01 name-first | Baldur's Gate 3 | Strategy |
| 7 | `king dodongo fight` | STRAT-ENTITY-01 name-first | Ocarina of Time (UNKNOWN) | Strategy |
| 8 | `how do I beat king dodongo` | STRAT-ENTITY-01 verb-first comparison | Ocarina of Time (UNKNOWN) | Strategy |
| 9 | `fire boss that flies out of holes` | STRAT-ENTITY-01 safety: no entity named | Ocarina of Time (UNKNOWN) | Strategy |
| 10 | `how to raise a skill fast` | STRAT-ENTITY-01 safety: no entity named | The Sims 4 | Strategy |
| 11 | `best build` | STRAT-ENTITY-01: names nothing | any protect_progression title | Strategy |
| 12 | `im stuck` | STRAT-ENTITY-01: names nothing | any protect_progression title | Strategy |

Not chips: KB-EXPERT-01's pair (`what class should i pick`, `what should i upgrade`) runs through the
retrieval probe in lane B, because the Show details ladder prints no card count.

## 5. Session 1 — nothing running

In this order, so that settings change as few times as possible. Evidence per row in § 9.

1. **Fresh open, SMOKE-A** — open, LB/RB through all six tabs (TAB-MARKER-01), Ollama → Test
   connection, one short Ask with D-pad through the chunks, Show details, two chips side by side.
   Also closes **SHELL-PAYLOAD-01** (each tab renders and responds, one Ask end to end) and the Main-tab
   half of **D11-SHIM-01** (a real Ask against a reachable host).
2. **Tab-bar re-runs** — DOC-SWEEP-01 (Settings Up lands on the bar), CHAT-SLOTS-V3-01 (the walk
   starts at the bar), TAB-SWITCH-01 (RB through the strip with focus deep in a scrolled panel, wrap
   included). **TAB-BAR-09**'s desktop-note opener: `filesystem_write` is already on.
3. **Focus rows, no Ask needed** — ONBUTTONDOWN-AUDIT-01 (keep-alive, reply verbosity and connection
   timeout sliders: record *nothing happens* against *two steps*), THINK-EFFORT-05, TAB-RESUME-FOCUS-01,
   TAB-RESUME-MODE-01 (A / B / C, one close-and-reopen each), TAB-RESUME-01 (resume, and note the
   first-press snap), KIDS-REGRESS-01 (Permissions with no parental controls: no banner, toggles live).
4. **SMOKE-C** and one PERM-JUMP-01 row (a capability off → blocked action → Open Permissions → Back);
   restore the capability. **SMOKE-F** (`bonsai:disable-sanitize`, `bonsai:enable-sanitize`,
   `bonsai:shortcut-setup-deck`, `bonsai:vac-check` with Steam Web API off = **VAC-01**), then
   **VAC-02** (on, empty key).
5. **Preset rows with the batch cleared** — PRESET-KB-SEED-01 (KB on, watch the carousel for 60 s:
   the *Enable local knowledge base* chip must not appear), PRESET-ONE-LINE-01b (Developer → animation
   mode through carousel / fade / static / decode, one swap each; restore carousel). Then pin batch 1
   with the panel closed.
6. **Batch 1, Speed** — chips 1 to 4: Show details reads *Source: shared troubleshooting tips*, and
   the Proton-log permission hint does not appear. Chip 5: `KB: no game running`; KB off, chip 5 again:
   `KB: off`; KB on. Chip 6, **CLEAR-CACHE-01**: one bubble, Settings → Clear cache → Main empty, close
   the QAM, reopen, still empty; the log shows `forget_background_game_ai: stored answer dropped`; count
   chat slots before and after (the orphan half). Mid-generation half: park the ring on Clear cache,
   submit the longest Strategy prompt on `qwen3.5:4b` at Deep from the Ask bar, walk back and clear
   while it writes; if the model still finishes first, record the timing and leave the half open.
7. **Batch 1, Strategy** — chips 7 to 11 (**KB-ANSWER-02**): fence absent on 7 to 10, present on 11,
   branch menu on all five, read from the DOM. Chip 7's Show details: the credit block's date for
   **KB-ATTRIB-01**. Chip 11's fence: A to reveal, and the *Spoilers OK* phrase path (**SMOKE-E**). One
   branch pick on any of these, close, reopen, read the header: `I'm at: …` (**CHAT-HEADER-CAPTION-01**).
   After every Strategy follow-up this session, grep the plugin log for
   `checklist fence present but did NOT parse`; on a hit, read that reply for `{"title"`
   (**STRAT-CHECKLIST-JSON-01**, a watch-for row).
8. **Chat slots with real Asks** — CHAT-SLOTS-V2-03 (LB away mid-Ask, reply lands in the first slot),
   V2-04 (close the QAM mid-Ask, reopen: the pending question is visible; this is also **SMOKE-H**, and
   its two re-checks: the live question stays through to the answer, and no duplicate on the next Ask),
   V3-05a/b, V3-06a/b/c (the toast with the QAM closed), V3-07 (a slot with three archived turns shows
   the *3 earlier* pill), V3-15d (the title changes live from *New chat*).
9. **Streaming and the thinking line** — sample the line text and computed style once a second through
   each Ask. STREAM-01/02 re-run with streaming off, STREAM-04 (Stop keeps the draft, *Stopped* notice),
   STREAM-09 (D-pad through sections while streaming, each landing visible), STREAM-FOLLOW-01 D-pad half,
   STREAM-REVEAL-01 (record with `scripts/record-deck.ps1`; the by-eye verdict is Session 3).
   THINKING-EMOJI-01 (emoji upright, prose italic), THINKING-COPY-01 (one opener in the first 2 s),
   THINKING-LIVE-01 (Expert, a 30 s+ answer: irregular beat, no line held over 15 s), THINKING-SPOILER-01
   (chip 11: blocks, never plain words, never literal markup), THINKING-EMOJI-CLUSTER-01 (troubleshooting
   Asks with a screenshot attached so several prep phases fire), THINKING-SANITIZE-01 (watch-for).
   **QA-FREE-PLAY-01** on the longest reply of the session, at two carousel positions.
10. **Thinking effort and the caps** — route text to `qwen3.5:4b` through *Set text try order*, restore
    after. THINK-EFFORT-04 (Brief / Balanced / Deep: answers arrive, the log's `completed in` grows, no
    reasoning in the reply body; then `gemma4:e2b-it-qat` with thinking on: one *Thinking not supported*
    toast, not two; the 400 body is read from wherever `ollama serve` logs, UNKNOWN until the window).
    SOFT-PREDICT-05 (thinking off on the thinking model: a visible reply). SOFT-PREDICT-01 (Speed, a
    prompt that hits 800 tokens: the cue shows, then is absent from the saved text), SOFT-PREDICT-03
    (poll the DOM, press Stop while the cue shows), SOFT-PREDICT-04 (Strategy, a continue mid-fence: no
    stray JSON), EXPERT-CAP-01 (`soft_continues=` in the log for a long Expert answer).
11. **Voice** — VOICE-REINSTALL-01 (Settings → Voice input: the ready label and *Reinstall voice
    engine*, D-pad to the button; pressing it re-downloads, so read the label and stop). D11-SHIM-01's
    voice start/stop round trip: one press pair.
12. **Measurements** — ASK-WIDTH-01 (`scripts/probe_deck_ask_row_width.py`, character off and on, after
    LB/RB away and back; PNG via `scripts/screenshot-deck.ps1`), BONSAI-ICON-GEOM-01 (PNG of the strip
    icon and Decky's list icon; the pre-fix capture is one of the 2026-08-06/07 files under
    `screenshots/`, which one is UNKNOWN).
13. **Clear all plugin data** — only if D57 #4 is yes, and only as the last step of the last session:
    back up `settings.json`, `chat_slots`, `chat_threads`; clear; **VOICE-CLEAR-01** (Voice input no
    longer claims ready), **TAB-RESUME-01** (next open is Main), **SHELL-PAYLOAD-01** (the Ollama tab
    after the clear); restore the backups.

## 6. Session 2 — games running (D57 #3 decides who launches)

Pin batch 2 first, panel closed.

- **Deep Rock Survivor** (`2321470`, SD card) — chips 1 to 3 in Strategy: Show details reads
  *Keyword + meaning* and the embed time sits in the 800 to 900 ms band; the same three in Speed:
  *Keyword search*, no embed time (**KB-RECALL-01**). Chip 4 in all three modes (**KB-ASKMODE-01** on
  screen; the counts come from lane B). Chip 5 (**KB-ROUTER-01**, the other direction). Create a chat
  while it runs: the game's name above the title, older chats empty (**CHAT-SLOTS-V3-14c**).
- **Black Mesa** (`362890`, not in the corpus) — unload the model over SSH first (`keep_alive` 0),
  then one Ask: *building context*, then *connecting / waking the model*, before any text
  (**THINKING-SLOW-01**). Then batch 1's chip 5 wording typed once with `scripts/deck_send_ask.py`:
  `KB: none for this game`, and it must read differently from `KB: no game running`
  (**KB-COVERAGE-01**, **KB-COVERAGE-NOAPP-01** second half).
- **Half-Life 2** (`220`) — the longest label: both crawl, the *Tip* badge stays pinned, a chip does
  not rotate away before its label has scrolled once; frame sampling with decode on
  (**PRESET-ONE-LINE-04**; the speed-by-eye and reduced-motion halves are Session 3).
- **Baldur's Gate 3** (`1086940`, SD card) — chip 6: Raphael's tactics unfenced, everything else the
  reply touches still fenced; chips 11 and 12 name nothing (**STRAT-ENTITY-01**).
- **The Sims 4** (`1222670`) — chip 10: Show details names no entity.
- **Ocarina of Time** — runs as **Ship of Harkinian**, a non-Steam shortcut (`soh.appimage`,
  shortcut app id `2593781457`), launched by name from the Recent Games shelf. Chips 7 to 9.

## 7. What you need to do in person, and when

Only you clear these. The rig writes what it measured and leaves pictures next to each item, but it
never ticks a box here; you tick it when you have seen the thing yourself and said so in chat.

**When:** after Sessions 1 and 2 are done. The rig says so in chat and sets the panel up for each
item as you reach it. About twenty minutes at the Deck, in this order.

- [ ] **Read the tab names.** Open bonsAI and press Down twice; the thin bar opens into the strip.
  Can you read all six names at that size? The lit dash and name should be gold with Ali G or the
  TF2 Announcer, purple with Shadowheart, green otherwise. Close the QAM and reopen it: the bar names
  the tab you were on. *(TAB-BAR-07)*
- [ ] **Tap the tab bar with a finger.** Tap the thin bar: the strip opens. Tap a tab: it switches and
  the strip closes. Open it again and tap outside it: it closes. *(TAB-BAR-08)*
- [ ] **Drag a streaming reply with a finger.** Ask something long with streaming on. While the answer
  is still arriving, drag the reply up: it must stay where you put it and not jump back down. Drag
  back to the bottom: it follows the new text again. *(STREAM-FOLLOW-01, touch half)*
- [ ] **Watch the chip labels crawl.** With Half-Life 2 running and the knowledge base on, watch the
  two preset chips: the long label should crawl slowly and calmly, the *Tip* badge should stay
  still, and a chip should not swap out before its label has scrolled through once. Say whether it
  is too fast, too slow or right; the rig writes the speed back into the code. Then turn on reduced
  motion in Steam's accessibility settings and reopen: no crawl, the label is cut off with "…".
  Turn it back off. *(PRESET-ONE-LINE-04, by eye)*
- [ ] **Look at the panel edges.** Main tab, character off: the chips, the text box and the Ask bar
  should reach the panel's edges with no gutter, all three lined up. Then character on. The rig's
  measurements and PNG are next to this item. *(ASK-WIDTH-01)*
- [ ] **Look at the tree icon.** The pot should sit centred under the canopy, both in the tab strip
  and in Decky's plugin list. The rig leaves a PNG of each. *(BONSAI-ICON-GEOM-01)*
- [ ] **Read the five spoiler-fence replies.** The rig leaves them in one chat slot. Four should read
  naturally with no hidden block; the Red Dead one should hide its ending behind a block. Does the
  fencing feel right? *(KB-ANSWER-02, feel)*
- [ ] **Watch a new chat get its title.** Make a new chat with [+], ask anything, stay on it: the row's
  title should change from *New chat* to your question when the answer lands, without closing the
  panel. *(CHAT-SLOTS-V3-15d)*
- [ ] **Press Update knowledge base with your thumb.** Ollama tab, D-pad to the button, press A with
  your eyes on the toast: does an update start? A bridge press did nothing on 2026-09-02. *(Bugs)*
- [ ] **Turn on Family View.** On a spare adult account, set a Family View PIN and lock it. Open
  bonsAI → Permissions: a banner, greyed toggles, and privileged actions refused. Tell the rig it is
  locked; it runs the D-pad row. Unlock: the previous values come back. *(KIDS-LOCK-01, then the rig's
  KIDS-FOCUS-01)*
- [ ] **Type your Steam Web API key.** Permissions → Steam ban lookup on; enter the key where the
  plugin asks. Tell the rig; it runs the four cases, you never type again. Remove the key afterwards
  if you like. *(VAC-03 to 06)*
- [ ] **Say "clear it".** The last phase: Clear all plugin data. The rig has already copied your
  settings and chats aside (`settings.json.bak-round31`, `~/bonsai-round31-chats.tgz`); it runs the
  three checks and restores them. It waits for that word.

Not scheduled, stay open: **KIDS-LOCK-02** (needs a child account) and the **quick-launch macro**
checklist (Steam Input; only if you use the macro).

## 8. Lane B — over SSH, alongside lane A

- **KB-EXPERT-01** and **KB-ASKMODE-01**: `scripts/probe_deck_kb_retrieval.py` with `--pool`, app id
  `2321470`, for `what class should i pick`, `what should i upgrade` and
  `how do i beat the glyphid dreadnought` in each mode; Expert attaches at least as many cards as
  Strategy, Speed fewer, and an off-topic sentence in Speed attaches nothing. The probe's per-mode flag
  is read from its `--help` at run time.
- **KB-RECALL-01**, the card half: the three batch-2 sentences through the same probe before
  Session 2, so the screen run only has to confirm the ladder and the timing.
- **KB-ROUTER-01**, the retrieval half: the four batch-1 sentences with no app id (KB-ROUTER-02 was
  closed this way).
- Never during a timing row (§ 3).

## 9. Evidence and bookkeeping

- Walks: `runs/<ROW>-<what>.json` from `deck_runSequence`, with step 1's `from`. Geometry:
  `deck_readPage`. Pictures: `scripts/screenshot-deck.ps1`; video: `scripts/record-deck.ps1`.
  DPS's own screenshot tool is broken on this install.
- A pass flips the row in [testing.md](../testing.md) or [testing-manual.md](../testing-manual.md) and
  moves the roadmap entry to Done, with the full entry in the archive, in the same commit (roadmap
  house rule 4). Lane C does this while lane A drives.
- A device result that contradicts the code: check the installed bundle first (compare the md5 of
  the Deck's `dist/index.js` against the local build).
- Settings restored at the end from the backup taken at the start (`settings.json.bak-round31`).

## 10. Rows this round cannot close, and why

- **STRAT-CHECKLIST-JSON-01**, **THINKING-SANITIZE-01**: watch-for rows; they close only if the model
  happens to misbehave during the session.
- **KIDS-LOCK-02** (a child account), the **quick-launch macro**, **VAC-03 to 05** (a key): unless
  D57 #9 schedules them.
- **ROUTING-MERGE-01**: unless D57 #5 allows the pull.
- **STRAT-ENTITY-01**'s three Ocarina of Time sentences: only if Ship of Harkinian is on the Recent
  Games shelf, which is where `deck_launchGame` finds a title.
- **ROUTING-MERGE-01**'s model pull: deferred by the rig's judgment (D57 #5); runs only if the Verify
  rows finish with time left.
- **STREAM-11** (bursts with a game running): a Bugs entry that needs a call, not a Verify row.
- The by-eye and touch halves listed in § 7: Session 3 only.
