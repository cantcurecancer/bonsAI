# bonsAI Roadmap

Open bugs, work fixed but not yet confirmed on the Deck, planned features, and what shipped for v0.5.0. Four lists, each sorted
from one star to six.

- **Long notes for open items:** [roadmap-details.md](roadmap-details.md)
- **Shipped features, full detail:** [archive/roadmap-completed.md](archive/roadmap-completed.md) · **Fixed bugs, full detail:** [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md)
- **Maintainer decisions (D1 onward):** [audit/maintainer-decisions-locked.md](audit/maintainer-decisions-locked.md)
- **QA rows and device evidence:** [testing.md](testing.md), [testing-manual.md](testing-manual.md) · **Release notes:** [CHANGELOG.md](../CHANGELOG.md)

## House rules for this file

1. **An entry is at most five lines**, in plain language, and says what a user would notice. Anything longer goes to
   [roadmap-details.md](roadmap-details.md) (open) or [archive/](archive/) (finished) and is linked, never deleted.
2. **Three lists for live work: [Bugs](#bugs), [Features](#features), [Verify](#verify).** A new entry goes straight into the
   right list at its star position (ascending; within a star band by tag, then by title) with a tag. Do not add sub-headings
   beyond Verify's own **Bugs** / **Features** split.
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

---

## Bugs


- ★ `[focus]` **An answer section can take the ring while hidden behind the Ask box** — **OPEN, found 2026-09-04.** Walking up the
  Red Dead turn landed on a bubble measured only 67% visible, covered by `.bonsai-unified-input-text-box`'s input.
- ★ `[focus]` **Down does not move the ring off an unrevealed spoiler block** — **OPEN, found 2026-09-04.** With the ring on
  `.bonsai-spoiler-reveal-target`, Down reports the press arriving and nothing moving. After the block is revealed, Down escapes
  normally, so it is the hidden state that traps.
- ★ `[reply]` **A branch question elides the game name** — **OPEN, found 2026-09-04.** The Ravenholm branch picker asked
  *"Where are you at in … ?"* with the title replaced by an ellipsis.
- ★★ `[focus]` **After the panel remounts the ring parks on a zero-size container** — **OPEN, found 2026-09-04.** On a fresh mount
  the ring lands on "Ask bonsAI" (Main) or "Where AI runs" (Ollama), both 0x0 rects that the visibility oracle calls OFFSCREEN, so
  the panel opens with nothing highlighted until the first press.
- ★★ `[focus]` **Focus ring styling is inconsistent** between plugin controls and Steam's own — **PARTIAL.** Modal scoping shipped; a
  blanket rule was tried and reverted in favour of Steam's native outline.
- ★★ `[focus]` **Up skips the answer sections and the chat slot row** — **OPEN, found 2026-09-04.** Down walks a reply chunk by
  chunk (three `.bonsai-answer-stop` stops on one turn); Up jumps from the feedback buttons straight past them to the bubble and
  the turn header. With the archive expanded, Up from the first archived header ran 18 presses to the tab bar and Decky's back
  button without the chat slot row ever taking the ring, though two Downs reach it normally. Same family as **ONBUTTONDOWN-AUDIT-01**.
- ★★ `[KB]` **A troubleshooting question that only describes the symptom reaches no tips** — **OPEN, maintainer call.** The router
  needs a topic word: *"the game drops me back to the library"* never routes because *crash* is absent. Two of four blind compat
  rows miss. A reach limit of the D16 gate, not a regression; neither row was reworded. [Detail](roadmap-details.md#a-troubleshooting-question-that-only-describes-the-symptom-reaches-no-tips).
- ★★ `[KB]` **Unrelated questions still get game cards stapled on** — **ACCEPTED 2026-08-27.** With a game running, *"thank you very
  much"* still attaches a card. Raising the keyword floor pushes against D25, and the model mostly ignores an irrelevant card.
  [Detail](roadmap-details.md#ordinary-phrases-attach-game-cards).
- ★★ `[reply]` **Stopping a reply leaves no "Stopped" notice** — **OPEN, found 2026-09-04.** Pressing *Stop generation* inside the
  soft-continue window keeps the partial body correctly and strips the `Continuing…` cue (the 2026-08-15 fix works), but the small
  **Stopped** notice **SOFT-PREDICT-03** asks for never appears — the word is absent from the turn, the panel and the whole page —
  and the stopped turn also loses its *Helpful / Not really / Retry* buttons, keeping only *Show details* and *Copy*.
- ★★ `[reply]` **Token streaming reveals text in bursts while a game is running** — **ACCEPTED 2026-09-04 (D58 #4).** Measured 2026-08-28 with
  a game running: tokens arrive in bursts, and during a burst the overlay drops to 47 fps; between bursts it is a flat 60. Delivery
  is bursty, painting is not slow. The game's own frame rate is unmeasured. Accepted as a nice-to-have; reopen only if the game's own frame rate is measured
  and suffers. Making streaming the default stays a separate feature call. Row **STREAM-11**. [Detail](roadmap-details.md#token-streaming-reveals-text-in-chunks-while-a-game-is-running).
- ★★★★ `[chat]` **A Strategy thread's branch block shows in whichever chat slot you are looking at** — **OPEN, found 2026-09-04.**
  Slot A was asked a long Ravenholm question; switching to slot B showed B's own two turns followed by A's branch picker,
  *"Where are you at in … ? A. Just starting in the town area / B. Dealing with a tough encounter or trap"*. It is still in B after
  A's reply finished, so it is not a mid-stream race — the block is not scoped to the slot that made it. Seen twice: a
  *"Dodging Asterius's Charge — Progress is saved for this game…"* block from A's Hades thread also rendered while viewing B.
  Breaks **CHAT-SLOTS-V3-05a**, whose whole point is that a slot shows zero of another slot's content.
- ★★★★ `[KB]` **The shipping retrieval arm loses to the vector half alone on rows nobody tuned against** — **OPEN, deferred under
  D38.** On the blind holdout, `vector_only` beats the shipping `rrf` blend by 7.6 points of top-1; on the tuning rows they tie.
  No weight changes until D38 is answered, and never by tuning against holdout. Groundwork done: 51 blind rows added to `tune`.
  [Detail](roadmap-details.md#the-shipping-retrieval-arm-loses-to-the-vector-half-alone-on-rows-nobody-tuned-against).

---


## Features

**Standing goal from the maintainer (2026-08-30):** buy back as much vertical room for the chat bubbles as possible; every
`[layout]` entry serves it. Items rated ★★★★★ or above carry a placeholder link to [bonsAI Issues](https://github.com/qd313/bonsAI/issues) in the archive;
replace it with a specific issue when one exists.

- ★ `[ask]` **Intent packs later review** — **OPEN.** Decide whether the quiet intent-pack search aliases are deleted, left quiet, or
  revived under Developer. Not in scope: re-shipping Proton journal inject without a redesign.
- ★★ `[chat]` **First-run ghost "New chat" label at the create position** — **OPEN, parked by decision.** The create position is the
  literal `[+]`, re-confirmed on board 8f and again in the v3 rows. Reopen that decision before building it.
- ★★ `[chips]` **A visible cue when the chip row runs out of chips** — **OPEN, filed 2026-09-04 by the maintainer.** When Left or
  Right on the preset chips reaches the first or last chip, nothing on screen says so; a stopped ring and a stopped list look the
  same. Wanted: a short glow or bounce at the blocked edge, the way Android lights up the end of a list you scroll past, for both
  the D-pad and a finger. Any effect with the same meaning is fine. Must respect reduced motion and stay inside the 300 px column;
  the row's edge behaviour itself (Left/Right hold still, Right pulls the next pinned entry in) does not change.
- ★★ `[chips]` **Preset chip expansion** — **OPEN, incremental.** Add or refresh preset strings as features land. Wave 1 shipped four
  prompts; row **PRESET-EXPAND-W1-01** still owed. Not in scope: replacing the `fade` default; session RAG chips (shipped).
- ★★ `[focus]` **Fewer D-pad stops on a finished reply** — **OPEN, filed 2026-09-02.** A finished answer gets one stop per paragraph,
  so a long reply is ten or more presses before the chips. Merge neighbouring paragraphs into sections of about one screen each.
  Streaming is untouched: the finished reply is re-split once the stream closes. Code fences stay whole.
- ★★ `[KB]` **The eval fixture cannot see a recall failure** — **OPEN, one measurement owed.** The keyword-blind slice was 3 rows when
  last counted (2026-08-28), before 36 more blind rows landed. Re-count it on the next arms run before calling this closed.
  [Detail](roadmap-details.md#eval-fixture-cannot-see-a-recall-failure).
- ★★ `[layout]` **Show details becomes a divider, not a chip** — **OPEN.** A full-width rule with the label in the middle reads as the
  end of the answer and frees the row it shares. Copy the collapsed-history row's shape (`.bonsai-chat-earlier-pill-row`).
- ★★ `[reply]` **Make token streaming the default and drop the setting** — **OPEN, maintainer direction 2026-08-23.** Gated on the
  burst finding under Bugs. Halves every "streaming on and off" QA row. A two-language removal: Python is authoritative (D13), both
  settings contracts lose the key, and an old `settings.json` must not read as a reset. [Detail](roadmap-details.md#make-token-streaming-the-default-and-drop-the-setting).
- ★★ `[reply]` **Thinking tips replace the status blurb (Phase 2)** — **OPEN.** Hand-curated bonsAI tips, feature tips for generic
  asks and KB-strategy tips for game asks, chosen by current game and mode. The generic filler copy goes away entirely. Data file
  shaped like `data/kb/strategy_seed.json`. Superseded by **Reasoning display** once real thinking streams.
- ★★ `[ui]` **Replace the bonsAI tab icon with the redesign's** — **OPEN.** Flatter, more silhouette, because it renders at 14px. It
  has to be an inline SVG path, not the PNG, so it inherits `currentColor` (`BonsaiTreeTabIcon`). Update `icons.bonsaiGeometry.test.tsx`
  in the same change.
- ★★★ `[chips]` **A setting for one or two preset chips** — **OPEN, filed 2026-09-02.** Two stays the default (D43); one gives the label
  the whole column. The row already reads one constant (`PRESET_VISIBLE_SLOTS`); the cost is the ~18-file settings plumbing plus a QA
  row per mode. The 2026-08-31 one-chip build (`fc1b245`) is the reference. [Detail](roadmap-details.md#a-setting-for-one-or-two-preset-chips).
- ★★★ `[chips]` **Decode preset chip animation** — **VERIFY, feel only.** Shipped 2026-08-28. Measured on device: a flat 60 fps with
  all chips decoding. Whether it feels right is a person's call. Row **PRESET-STREAM-ANIM-01**.
- ★★★ `[KB]` **DRG Survivor glossary terms** — **VERIFY, one touch tap owed.** Shipped 2026-08-28 and walked on device: underline, popup,
  D-pad reachability, B, one-press Up. Rows **DRG-GLOSSARY-01…04**. [Detail](archive/roadmap-completed.md#moved-from-the-roadmap-2026-09-02).
- ★★★ `[KB]` **KB download Cancel** — **VERIFY, blocked.** Shipped 2026-08-05. The download finishes in about a second on device, so
  there is no window to press Cancel in. Needs a slower fixture or a throttle. Row **KB-CANCEL-01**.
- ★★★ `[KB]` **KB visual maps** — **OPEN.** Two shapes named by the maintainer 2026-08-29: a dungeon map, and a boss outline with weak
  points marked. Nothing draws anything in a reply today. A dungeon map has to be authored, which sits behind the source policy and a
  corpus rebuild. [Detail](roadmap-details.md#kb-visual-maps).
- ★★★ `[KB]` **Spoiler coverage as a tiered setting** — **OPEN, maintainer proposal 2026-08-29.** One end fences nothing the user
  asked about; the other fences bosses, endings and chapters; a middle tier fences anything past the intro. Default if nothing is
  chosen: fence only named story beats and endings. Needs a Settings control, a focus-graph entry, and prompt wording per tier.
  Absorbs the older "hide by risk band" idea. [Detail](roadmap-details.md#spoiler-coverage-should-be-a-setting-with-tiers).
- ★★★ `[KB]` **The corpus has no "starting out" card** — **OPEN.** Every card is about a thing; the maintainer asked for build and
  early-game guidance, and an orientation card for someone who knows a neighbouring game. Decide first whether that is a new
  `section_type` or a `mechanic` naming convention. [Detail](roadmap-details.md#the-corpus-has-no-starting-out-card).
- ★★★ `[layout]` **Copy sits in the answer's corner, not in a button row** — **OPEN.** A small semi-transparent copy glyph in the
  bubble's corner, the same weight as the microphone. The hard part is focus: bubbles need a way in and back out, and Copy must not
  become touch-only.
- ★★★ `[layout]` **Give the reclaimed height to the transcript** — **OPEN, next step under the vertical-space goal.** The collapsing
  tab bar freed 61px, but the transcript is still 412px: the room went into Main's overflow and the gap above the dock. What caps
  the transcript is a Main-tab layout question, worked out in [planning/30-collapsing-tab-bar.md](planning/30-collapsing-tab-bar.md) § 8.
- ★★★ `[layout]` **Session context folds into Show details** — **OPEN, workshop before building.** The **Session context (N turns)**
  bar stops being its own row, so a settled answer costs one collapsed control instead of two.
  [Open questions](roadmap-details.md#session-context-folds-into-show-details).
- ★★★ `[ollama]` **Custom model in the Pull Models picker** — **OPEN.** Pull any valid Ollama-library tag, a **Use for Ask** pin, and a
  **New** badge (30 days). Not in scope: LAN pull (see **LAN custom model pull**).
- ★★★ `[ollama]` **Dynamic keep-alive / smart unload** — **OPEN, research spike.** Hold models loaded, or unload when a game takes
  focus on the Deck APU? The spike decides go or no-go; no production unload before it.
- ★★★ `[ollama]` **Per-mode latency timeouts** — **OPEN.** Separate warning and timeout values per Ask mode.
- ★★★ `[reply]` **Terse mode: Speed answers in three lines** — **OPEN, planned 2026-08-29, nothing built.** A toggle beside the
  reply-style slider, off by default, capping a Speed answer at three lines. It overrides the slider and the character; destructive
  warnings and the depth phrases escape it. The real work is widening the branch picker (D40). **TERSE-01** passes at 8 of 10.
  [Detail](roadmap-details.md#terse-mode-speed-answers-in-three-lines).
- ★★★ `[ui]` **Adjustable text size in Settings** — **OPEN.** `uiScalePx()` already runs through the stylesheet; the work is exposing it,
  deciding what must not scale (icons, the 300px column), and paying the settings plumbing. [Detail](roadmap-details.md#adjustable-text-size-in-settings).
- ★★★ `[ui]` **Search density** — **OPEN.** Tighter, more scannable results with highlighted match tokens.
- ★★★★ `[ask]` **Connection doctor** — **OPEN, candidate.** **Fix this** on an Ask failure walks the probes to one next action with an
  Ollama-tab deep link. Decide against **Deck health snapshot** first; they share a probe set.
- ★★★★ `[ask]` **Session context and user stash** — **OPEN.** Live session facts plus user-editable notes for Ask. No embeddings, no cloud.
- ★★★★ `[KB]` **KB online / versus strategy content** — **OPEN, discovery locked 2026-08-09.** Versus, co-op and map callouts as new
  `section_type` values. WikiTeam / archive.org dumps only. [Plan](planning/17-kb-online-versus-strategy-content.md).
- ★★★★ `[KB]` **RAG Phase 4: extended retrieval** — **PARTIAL.** Tracks 1 and 2 shipped 2026-08-19 (chip guarantee, 16 structured
  cards). Track 3 (per-game troubleshooting tips) needs a schema v4 bump and a corpus rebuild. Two maintainer calls owed: accept the
  split, and whether to strengthen the prompt or accept prose on **PHASE4-CARDS-01**. [Detail](roadmap-details.md#rag-phase-4-extended-retrieval).
- ★★★★ `[KB]` **RAG Phase 5: corpus expansion** — **OPEN.** Corpus maturity after Phase 4; session chip vector ranking.
  [knowledge-base.md](knowledge-base.md) § Phase 5.
- ★★★★ `[KB]` **RAG Phase 7: retrieval infra** — **OPEN.** Optional ANN index, auto-pull nomic, vision to KB, packs. The meaning
  fallback shipped 2026-08-18, so ANN is an optimisation of a path that exists. [knowledge-base.md](knowledge-base.md) § Phase 7.
- ★★★★ `[ollama]` **LAN custom model pull** — **OPEN.** Blocked until a mechanism is chosen (R1 to R4). Depends on **Custom model in
  the Pull Models picker**.
- ★★★★ `[ollama]` **Speed-mode VRAM preload** — **OPEN, developer toggle first.** Preload the default Ask model at boot so the first
  Ask skips the cold load. Models of 3B or under, skip silently under VRAM pressure, no background polling. Open question: does
  residency survive suspend? [Detail](roadmap-details.md#speed-mode-vram-preload).
- ★★★★ `[perms]` **Web permission** — **OPEN, discovery locked.** Opt-in live web answers; offline Ask and local KB when off. Kids
  lock forces it off. [Discovery](planning/web-permission-discovery.md).
- ★★★★ `[platform]` **Llama.cpp provider spike** — **OPEN, research only.** Go or no-go against Deck-local Ollama. Prior:
  [llama-cpp-provider.md](archive/spikes/llama-cpp-provider.md).
- ★★★★ `[platform]` **Steam Input layout parse** — **OPEN.** Parse controller VDF configs for control context. Not in scope: writing
  configs.
- ★★★★ `[ui]` **SteamOS Share path** — **OPEN.** Faster path from Share and capture flows into screenshot attach where APIs allow.
- ★★★★ `[ui]` **SteamOS spin hint card** — **OPEN.** Detect immutable spins and deep-link to troubleshooting.
- ★★★★★ `[ask]` **Deck health snapshot** — **OPEN.** Read-only diagnostics dump to Desktop; Magic Ask `bonsai:diagnostics`.
- ★★★★★ `[KB]` **Community tip contribution** — **OPEN, unblocked.** Reply → **Suggest as a tip** writes a schema-valid card to Desktop
  plus a GitHub attach URL. Phase 6 publish shipped 2026-08-16.
- ★★★★★ `[ollama]` **On-Deck model benchmark** — **OPEN.** Rank installed models by measured speed and completion; offer as try order
  with confirmation.
- ★★★★★ `[perms]` **VAC Phase 2: opponent IDs** — **OPEN, research.** Surface live opponent identities for ban checks when metadata allows.
- ★★★★★ `[platform]` **Controller macro test rig and live view** — **OPEN, discovery locked 2026-08-23, board ordered.** A bridge board
  the Deck sees as a real controller, a macro runner gated on real UI state, and one recording pipeline. Primitives land upstream in
  decky-plugin-studio. Next: spikes S1 to S3. [Plan](planning/19-controller-macro-test-rig.md), [program](planning/21-ai-owned-testing-program.md).
- ★★★★★ `[platform]` **Steam Controller copilot (Ibex gen-2)** — **OPEN.** AI copy tuned to gen-2 hardware.
- ★★★★★ `[reply]` **Reasoning display** — **OPEN, spike first.** Stream the model's real `thinking` inline, collapse to a summary,
  expand on demand, with a transparency chip. Two open questions: whether models interleave thinking with content, and whether a
  single truncated line or a bounded pane reads better. [Detail](roadmap-details.md#reasoning-display).
- ★★★★★ `[voice]` **Local reply TTS** — **OPEN.** Phase 1 offline play/stop; Phase 2 character-aligned read-aloud (legal gate).
- ★★★★★ `[voice]` **Wake-word listening** — **OPEN, beta.** Opt-in always-on local wake **bonsAI**, then STT, then a quiet Ask.
  [Feasibility](planning/10-wake-word-listening-feasibility.md).
- ★★★★★★ `[KB]` **RAG Phase 8: catalog corpus** — **OPEN, intent only.** Large offline catalog (top 1000 Steam, 100 Deck, emulated
  slice). [knowledge-base.md](knowledge-base.md) § Phase 8.
- ★★★★★★ `[platform]` **Deep mod AI hints** — **OPEN.** Detect mod frameworks and files; mod-aware guidance.
  [Feasibility](planning/12-deep-mod-ai-hints-feasibility.md).
- ★★★★★★ `[platform]` **Native QAM shortcut tile** — **OPEN, upstream research.** A separate left-rail entry beneath the Decky icon.
  [Feasibility](planning/11-native-qam-tile-feasibility.md).
- ★★★★★★ `[platform]` **Remote Play diagnostics layer** — **OPEN.** Streamed-gameplay answers weight encode latency and host-vs-client
  fixes. Noted in [09-steam-frame-companion-feasibility.md](planning/09-steam-frame-companion-feasibility.md) § B8.
- ★★★★★★ `[platform]` **Steam Frame companion UX** — **OPEN, research first.** [Feasibility](planning/09-steam-frame-companion-feasibility.md).
- ★★★★★★ `[reply]` **In-game answer surface** — **OPEN.** Read an answer without leaving the game. The full overlay is upstream-gated;
  the unblocked slice is a toast carrying two lines.

---


<a id="done-for-v050"></a>

## Verify

Fixed, unit-tested and shipped, but not yet confirmed on the Deck. Owed QA row named in each entry; full evidence in
[testing.md](testing.md) / [testing-manual.md](testing-manual.md). Once a Deck run confirms one, move it in the same commit: a line into
[Done](#done-for-v050), the full entry into the matching archive file, drop it from here.

### Bugs that need verification

- ★ `[ask]` **The question overlay sits a few pixels off the native text field** — **VERIFY.** Fixed at the desk
  2026-09-04: measured 22:00 (build `49241e7`), the field and its two mirrors differed on `white-space`,
  `overflow-wrap`, font-family (dormant while Motiva Sans is installed) and width (274.463px vs a
  `clientWidth`-rounded 274px) — enough to wrap a long line one character sooner in the mirrors. They now copy the
  field's own computed style each pass. Owed: the same read after the fix, within 0.1px. Row **ASK-OVERLAY-01**.
- ★ `[chips]` **A frozen test-chip batch longer than the row cannot be reached after the first minute** — **VERIFY.**
  Fixed at the desk 2026-09-04, Deck check owed: Right at the last visible chip now pulls the next pinned entry into
  the carousel's history, mirroring how Left at the edge already pulls an earlier one back; and every mode's
  60-second walk restarts when an Ask completes, even though a pinned batch always reseeds to the same three chips.
  Row **QA-FROZEN-CHIPS-02**.
- ★ `[chips]` **Chip rotation favours the top of the candidate list** — **VERIFY.** Fixed at the desk
  2026-09-04, Deck check owed: the guarantee and the roll both used to take the first unseen candidate every
  time, so ranks 1-3 came round every minute and ranks 4-6 rarely appeared; both now pick at random among the
  eligible candidates, keeping game chips ahead of generic Deck tips. Row **CHIP-ROTATION-01**.
  [Detail](roadmap-details.md#chip-rotation-is-biased-to-the-top-of-the-candidate-list).
- ★ `[focus]` **Reordering in the try-order picker drops the highlight** — **VERIFY, two fixes failed on the Deck 2026-09-04, cause
  found.** Any button press inside the picker closes it, Reset included: the buttons are plain submit buttons inside the modal's form,
  so an A press submits it. The lane is stopping the submit and keeping the Steam-transfer refocus. Row **PICKER-REORDER-02**.
- ★ `[focus]` **The active chip in Show details is hard to spot** — **VERIFY, measured on the Deck 2026-09-04, your glance owed.** The
  active chip now carries a cyan glow and a brighter fill, and the *Chip 1 of 6* counter is bold cyan; on the device exactly one chip
  carried the highlight. Picture for your eyes: `screenshots/DeckCapture_20260904_220827_game.png`. Row **CONTEXT-LADDER-01**.
- ★ `[focus]` **The focus ring is clipped on grid layouts** — **VERIFY.** Fixed at the desk 2026-09-04: each character-picker
  grid column now carries 6px of inner padding so a focused tile's ring has room to render before the column's own
  `overflow: hidden` clips it — most visible before the fix on an edge tile. Style only. Owed: a screenshot with the ring
  visible on an edge tile. Row **CHAR-PICKER-RING-01**.
- ★ `[reply]` **After reopening the panel, a branch-pick turn's header shows the internal prompt** — **VERIFY.** Fixed at the desk
  2026-08-28: the caption the user saw is saved with the turn. Owed: make a branch pick, reopen, read the header. Row
  **CHAT-HEADER-CAPTION-01**. [Detail](archive/roadmap-bugs-fixed.md#moved-from-the-roadmap-2026-09-02).
- ★★ `[focus]` **A checklist the model got wrong was left in the reply as raw JSON**, its own D-pad stop that did nothing — **VERIFY.**
  Fixed 2026-08-28: a rejected checklist block is dropped, as a rejected branch block already was. Owed: one sighting on device of a
  reply where it happens. Row **STRAT-CHECKLIST-JSON-01**.
- ★★ `[focus]` **After a modal closes or the QAM reopens, the ring can sit on a hidden Steam tab button** — **VERIFY, both measured
  paths pass on the Deck 2026-09-04.** Closing the Clear cache confirmation returns the ring to the Clear cache button; after the
  trap's node check was made realm-safe, a chord close and reopen left the ring on Decky's back button, visible. Owed: the
  suspend-and-resume remount, which the rig cannot force. Row **TAB-BAR-11**.
- ★★ `[focus]` **Down from the chat slot lands on the whole reply before its first section** — **VERIFY, Down half passed, Up half
  failed on the Deck 2026-09-04.** From the chat row, Down lands on the turn header and then on the first stop inside the answer,
  never on the bare bubble. Up from Helpful still lands on the bare bubble: the fix reached only the Retry row, and the thumbs
  row's Up still hands the press to Steam. Back with its lane. Row **CHAT-REPLY-ENTRY-01**.
- ★★ `[focus]` `[perms]` **The Open Permissions button under a blocked reply is not a D-pad stop** — **VERIFY, first fix failed on
  the Deck 2026-09-04.** The button is built as a stop now, but the hops into its row used a plain focus across containers: Up from
  the session strip lost the ring, and the helper stamped the row with a tab index that removes it from Steam's graph. Back with its
  lane for a registered-nav-node version. Rows **PERM-JUMP-01**, **SMOKE-C**.
- ★★ `[reply]` **Spoiler fences wrapped harmless tactics on games with no story, and on bosses you named** — **VERIFIED on the
  Deck 2026-09-03.** Fixed 2026-09-02: on those turns the prompt now says plainly not to fence. Measured on the PC with the answer
  eval: 28 of 96 misfires before, 3 after, ending questions still fenced. Deck run **KB-ANSWER-02**, 5 of 5: Tank, antlions,
  Theseus and Asterius, Volvagia unfenced with the branch menu; the Red Dead ending question fenced. Deck-local model, character
  voice on. [Detail](roadmap-details.md#the-spoiler-fence-on-a-no-story-game-lands-mid-reply).
- ★★★ `[chat]` **Clear cache cleared the screen but not the session** — **VERIFY.** Fixed and confirmed 2026-08-27, and again on the
  Deck 2026-09-03. The orphan half is measured: the chat stays behind after a clear, so each clear-and-reask cycle leaves one more
  chat in the rotation — a follow-up, not a regression. Only the mid-generation half is still owed: clearing while a reply is still
  being written (unit-tested, not reproducible by hand yet). Row **CLEAR-CACHE-01**. [Why](roadmap-details.md#shipped-qa-owed--why-each-was-built-this-way).

### Features that need verification

- ★ `[layout]` **Rows span the QAM panel width** — **VERIFY.** Fixed 2026-08-16 and measured by probe (268 to 300 px); the visual walk
  was never run. Confirm the Main rows look flush and nothing overflows the column. Row **ASK-WIDTH-01**.
- ★ `[ollama]` **Pulled models join the model try order** — **VERIFY.** RPC wired 2026-08-02. Row **ROUTING-MERGE-01**.
- ★ `[platform]` **Shell state and tab payload extraction (refactor step 8)** — **VERIFY.** Smoke: six tabs, one Ask, Ollama tab
  after Clear all plugin data. Row **SHELL-PAYLOAD-01**.
- ★ `[platform]` **VAC check (`bonsai:vac-check`) on-device QA** — **VERIFY.** Implementation complete; run **VAC-02…06** after Tier 0
  **SMOKE-F** passes.
- ★ `[voice]` **Three voice fixes from early August** — **VERIFY.** A finished install survives *Clear all plugin data*
  (**VOICE-CLEAR-01**, backend half verified), the install button reads right when the engine is already ready
  (**VOICE-REINSTALL-01**), and the `status()` fix still wants one live recording retried on the Deck.
- ★★ `[chat]` **The game a chat belongs to, above its title** — **VERIFY.** Shipped 2026-08-30 in quiet text above the slot title;
  only chats created after that date carry the name. Row **CHAT-SLOTS-V3-14c**. It costs a line of height, which cuts against the
  vertical-space goal; decide whether it shows always or only when the row has focus.
- ★★ `[KB]` **Asked-entity extraction reads how players actually type** — **VERIFY.** Fixed 2026-08-09. Row **STRAT-ENTITY-01**.
- ★★ `[KB]` **Expert mode gets the same cards as Strategy** — **VERIFY.** Fixed 2026-08-18; the route flag asked for Strategy by
  name. Row **KB-EXPERT-01**, and **KB-ASKMODE-01** needs a re-run. [Why](roadmap-details.md#shipped-qa-owed--why-each-was-built-this-way).
- ★★ `[QA]` **Deferred manual QA** — **VERIFY.** Tier 0 smokes (SMOKE-A, C, F) then Tier 1 (SMOKE-E, H), and a broader prompt-testing
  pass. SMOKE-B was retired 2026-09-03 (D57 #6). Round in progress: [plan 31](planning/31-deck-verification-round.md).
- ★★ `[reply]` **Thinking effort control, Phase 1** — **VERIFY.** Shipped 2026-08-15: Ollama tab **Thinking** row, Off / Brief /
  Balanced / Deep. Rows **THINK-EFFORT-04** (real thinking model) and **THINK-EFFORT-05** (D-pad) owed.
- ★★ `[reply]` **Thinking line fixes from 2026-08-07/08** — **VERIFY.** Emoji upright, lazy status tag survives, no bare-emoji phase
  changes, one writer. Rows **THINKING-EMOJI-01**, **THINKING-SANITIZE-01**, **THINKING-EMOJI-CLUSTER-01**, **THINKING-COPY-01**,
  **THINKING-SLOW-01**, **THINKING-LIVE-01**, **THINKING-SPOILER-01**. [Log](planning/06-thinking-blurbs-review.md#10-implementation-log).
- ★★ `[reply]` **Token streaming Phase A/B** — **VERIFY.** Start stutter fixed, sections as D-pad stops, scroll follow. Rows
  **STREAM-REVEAL-01**, **STREAM-09**, **STREAM-FOLLOW-01**. [Review](planning/05-token-streaming-review.md).
- ★★★ `[KB]` **KB coverage chip in Show details** — **VERIFY.** The positive case passed on device. Owed: KB off reads `KB: off`, an
  uncovered title reads `KB: none for this game` (**KB-COVERAGE-01**), and an unmatched running game no longer says "no game
  running" (**KB-COVERAGE-NOAPP-01**, fixed 2026-08-23).
- ★★★ `[KB]` **The vector half of retrieval has its own recall pass** — **VERIFY.** Fixed 2026-08-18; it searches the game's cards
  directly instead of re-ordering the keyword shortlist. Row **KB-RECALL-01** owed on device; **KB-RECALL-02** verified at the desk.
- ★★★ `[perms]` **Kids master lock** — **VERIFY.** Shipped 2026-08-09. Rows **KIDS-LOCK-01**, **KIDS-FOCUS-01**, **KIDS-REGRESS-01**
  (and **KIDS-LOCK-02** with a child account). Live CEF Stage 0 confirmation still owed.
- ★★★ `[platform]` **Legacy-loader shim removal (D11)** — **VERIFY.** RPC probe passed; the Main-tab Ask pass is open. Row **D11-SHIM-01**.
- ★★★ `[reply]` **Soft reply-length cap and thinking budget** — **VERIFY.** Shipped 2026-08-10. Sub-check 02 verified; 01, 03 and 04
  automated with a Deck confirm owed; 05 needs a real thinking model. [Why](roadmap-details.md#shipped-qa-owed--why-each-was-built-this-way).
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

## Done for v0.5.0

Everything shipped since v0.4.9 (2026-07-08), one line each, newest first. Detail: [CHANGELOG.md](../CHANGELOG.md),
[archive/roadmap-completed.md](archive/roadmap-completed.md), [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).

**Withdrawn 2026-09-02:** *QAMP Phase 2 profiles* and the *QAMP verification checklist*. Both tested TDP apply, which was removed
on 2026-07-30 (`apply_tdp` no longer exists). Preserved in the archive.

**Closed as not reproduced 2026-09-02:** *`run_python_tests.py` exits 0 when tests fail*. The script has returned 1 on failure
since April (`25742f2`), and a deliberate failing test exits 1 today. If it recurs, record the exact command and shell.

**September 2026**
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
