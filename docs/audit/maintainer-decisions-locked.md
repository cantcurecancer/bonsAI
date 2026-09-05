# Maintainer decisions locked (refactor / handoff)

> **Moved from** [roadmap.md](../roadmap.md) **2026-08-04.** Full decision record for D1–D15, execution order, and cleanup candidates. Active index: [roadmap.md](../roadmap.md). Reorg commit: `ba2e5c5` (`git show ba2e5c5`).

Evidence lives in this audit folder — especially [05-plan.md](05-plan.md).

---

## Decisions needed

Open questions that need a maintainer call before the work can continue. Written
in plain language on purpose — each one says what the situation is, what your
choices are, and what happens either way. **Locked calls (2026-08-02 for D1–D6,
2026-08-03 for D7–D10)** are in
[Maintainer decisions locked](#maintainer-decisions-locked--2026-08-02); implement
from that section when it disagrees with an option above.

**One deferred, two awaiting an answer.** **D45–D52 were locked 2026-09-01** from the knowledge-base answer-quality plan ([planning/30-kb-answer-quality-plan.md](../planning/30-kb-answer-quality-plan.md)); **D53 and D54 are open** pending an explanation the maintainer asked for. The eval "D40" of 2026-08-31 is **D40b** from 2026-09-01 (resolved by D51). **D38** — the fusion weights, raised 2026-08-29 by D37's
first measurement — is **deferred at the maintainer's request** pending more data, more games and
more questions; it is not waiting on a decision today and nothing about the weights changes until it
is. **D37**, the blind holdout rows, was endorsed and locked
2026-08-29, and the measurement it was gating was run the same day (see D37 for the numbers and the
two findings that came out of them). **D39 and D40 are locked 2026-08-29 as well** — D39 by the
corpus gap sheet, and **D40** in discovery for **Terse mode**, before a line of code for it exists.
Before that, D18 — raised 2026-08-05 by the step 11 friction test — was locked as
option A on 2026-08-27 and implemented the same day.
**D32, D34 and D35 are all locked and implemented** (2026-08-27) — three separate causes of the one
*Clear cache* bug, which is now fixed and confirmed on device. **D33 is locked and implemented**
(2026-08-27, option C at 26px); it still owes a look on the Deck, which is what the maintainer asked
for. **D23–D27 were raised and locked during the RAG
work of 2026-08-18 to 2026-08-21; D28–D31 were raised and locked 2026-08-22.** Everything else
D1–D31 is locked; **D19 is superseded by D20** (below), and **D31 renumbers the superseded one to
D19b**. See the table below for D1–D15 and the sections below for D16, D17, D19–D31.

**Session handoff for the 2026-08-18 to 2026-08-21 RAG work:**
[session-handoff-2026-08-21.md](session-handoff-2026-08-21.md) — what shipped, what the numbers
are now, and what is still owed.

> **Numbering collision, flagged 2026-08-18 and resolved by [D31](#d31--which-of-the-two-d19s-keeps-the-number)
> on 2026-08-22.** The superseded corpus-licence question becomes **D19b**; the live
> *"Can you reach the strategy corpus without the game running?"* keeps **D19**.

---

### D33 — LOCKED (option C at 26px, 2026-08-27) — The new character avatars were drawn for 44px. The picker shows them at 24px. Which one moves?

**Locked in the maintainer's words: "let's go for 26 px and see how that is, I may change to another
after seeing how it looks."** So option C — grow the picker part of the way rather than to the
design's full 44px. Implemented the same day.

**What shipped.** Every avatar in the picker is now the drawn artwork at **26 pixels** — the
character rows, the Random row, the Custom row, and the little preview on the **OK** button. Before
this they were five different hardcoded numbers (22, 24, 24, 26, 26) and still the old pixel-grid
faces. They are now one number in one place, `PICKER_AVATAR_PX` in `CharacterPickerModal.tsx`, so
changing your mind is a one-line edit rather than a hunt through the file.

**26 is not an arbitrary middle.** It is exactly the line the design draws for where the letter
badge sits — inside the disc at 26 and above, beside it below. Putting every picker avatar at 26
puts them all on the same side of that line, which is what stops one screen showing two badge
styles at once. Anything you move to next is worth keeping at 26 or higher for that reason; below
it, the badges split.

**One visible change beyond the rows:** the avatar on the **OK** button grew from 22 to 26, so that
button is very slightly taller. It was included deliberately — it previews the character you are
about to pick, and leaving it at 22 would have been the one avatar on the wrong side of the badge
line.

**What did not change.** The main tab Ask bar stays at its own 18px and is deliberately not wired to
the picker's number, because the standing instruction is that the Ask row must not move.

**Locked by two tests** ([CharacterPickerModal.test.tsx](../../src/components/CharacterPickerModal.test.tsx)):
every avatar the modal draws is the same size, and every one is the drawn emblem rather than the old
pixel grid. Both were checked to fail without the change. That second test matters more than it
looks — the art style is an opt-in setting that falls back to the *old* pixel grids, so forgetting it
renders something that looks fine and is wrong.

**Not yet seen on the Deck.** The maintainer asked to look at 26 before settling, so the next step is
a device pass on the picker: row heights, how many characters fit on one screen, and whether the
props read clearly at 26.

**Original intake, raised 2026-08-26 from the AI character avatars design handoff.** Full detail:
[25-ai-character-avatars-handoff.md](../planning/25-ai-character-avatars-handoff.md).

> **The main tab half is settled (2026-08-26).** The maintainer's instruction was that the Ask bar
> textarea must not look any different except for better artwork in the corner. A true-size mock-up
> confirmed that is achievable exactly — same 18 × 18 slot, same 50.0 × 276.8px text row, same badge
> — provided the main tab renders the plain glyph and keeps its existing corner badge, rather than
> the design's `CharacterAvatar` wrapper, whose selection chip would be clipped by the slot's
> `overflow: hidden`. **What remains open below is the picker only.**

**What the situation is.** A design handoff arrived that replaces the little
pixel-grid character faces with drawn objects — Scout's bat, Heavy's sandvich,
Nick Valentine's fedora — each sitting on a coloured disc. The art is finished
and was reviewed at **44 pixels** across, and the handoff's own notes say the
character picker is a 44px grid.

It is not. In this codebase the picker draws those avatars at **24 pixels**, and
the largest avatar anywhere in the plugin is 26. Nothing is 44, and nothing is
bigger. So the art would land at a little over half the size it was approved at,
and nobody has seen it at that size.

**The second half of the same problem.** The design puts the letter badge in two
different places depending on size: inside the disc at 26 and above, and off to
the side as a small pill below 26. The picker's avatars are 22, 24, 24, 26 and
26 — which straddles that line. As written, **one picker screen would show both
styles at once**: side pills on the character rows, in-disc badges on the Random
and Custom rows. The side pill also adds roughly 19 pixels of width to a
selected row, in a list that currently reserves only the width of the circle.

**Your choices.**

**A. Grow the picker to 44px.** The art is shown at the size it was designed and
reviewed for, and every avatar lands on the same side of the badge line, so the
picker looks consistent. The cost is that the picker rows get noticeably taller,
which means fewer characters visible per screen on the Deck, and the row layout
has to be re-measured on device.

**B. Keep 24px and have the design re-checked at that size.** Nothing in the
picker layout moves. The risk is that the props were tuned at 44px — the bat
barrel taper, the fedora crown pinch, Navi's wings — and detail chosen at 44 may
turn to mush at 24. That is the exact failure the pixel grids were being
replaced for, so it would be worth someone looking at it small before we commit.

**C. Split the difference — grow the picker to 26 or 32, not the full 44.** Puts
every avatar on the same side of the badge line, which fixes the mixed-styles
problem cheaply, without the full row-height cost of A. The art is still below
its reviewed size, just less so.

**What happens either way.** Whichever you pick, the badge line needs to end up
with all the picker's avatars on one side of it, or the picker will look like two
different designs stitched together. If you would rather not decide from a
description, the approved prototype is in the repo at
`docs/design/handoffs/ai-character-avatars/AI character avatars.dc.html` — open it
in a browser and it shows the real thing at several sizes.

---

### D35 — LOCKED (option 1, 2026-08-27) — *Clear cache* clears the screen, but the AI's last answer is still stored on the plugin's own back end. Should clearing forget it?

**Locked in the maintainer's words: "tell Python to forget, if answer is still being generated,
stop it."** So both halves of option 1, including its open sub-question. Implemented the same day.

**What shipped.** A new command `forget_background_game_ai` ([main.py:2815](../../main.py#L2815)),
sent the moment you press **Clear** and not waited on. It drops the stored answer, and if a reply is
still being written it stops that too — properly, by closing the connection to the AI rather than
only cancelling the plugin's own job, because the AI keeps writing until the connection goes. After
a clear you see **nothing at all** — not a "Request cancelled." bubble.

**Why it is not waited on.** Waiting would hold the confirmation box open for up to a second and a
half while the AI is told to stop, on a button that should feel instant. The order is safe without
waiting: the forget clears the stored answer before it can be interrupted, so the screen's own
"what was the last answer?" question, sent a moment later when the panel rebuilds, either finds
nothing or waits its turn.

**Confirmed on your Deck the same day.** Asked a question, cleared, switched tabs — gone. Then
closed and reopened the Quick Access Menu, which is the strongest version of the same test — still
gone. The plugin log now records the drop, so a future session can tell "the command ran" apart
from "the screen just didn't redraw".

**One honest gap.** The *stop a reply mid-write* half is covered by four automated tests but was not
reproducible by hand on the Deck: the model answers in well under a minute even when asked for an
essay, and walking the D-pad from **Ask** to **Clear cache…** takes longer than that. Nothing
suggests it is broken; it simply has not been watched happening.

**Raised 2026-08-27, measured on your Deck. This is what actually makes *Clear cache* look like it
does nothing** — D32 and D34 were both real problems, both are now fixed, and **neither was the
one you were seeing.**

**How we know.** After clearing, the returning conversation was tagged `live` — the label the
plugin uses for *the answer that just came back from the AI*, not the label it uses for a saved
chat. So it was not reloaded from the saved chat file, and it was not restored from the
confirmation-box snapshot. Both of those routes are now closed and it still came back.

**What is actually happening, plainly.** When you ask something, the Python side of the plugin
keeps the finished answer so the screen can be rebuilt if you close and reopen the menu — that is a
feature, and it is why a reply survives you tabbing away mid-generation. *Clear cache* only empties
the screen. It never tells the Python side to forget. So the next time the panel rebuilds itself —
switching tabs is enough — the plugin asks "what was the last answer?", Python still has it, and it
gets painted straight back.

**Your two options.**

1. **Tell the back end to forget the last answer when you clear.** A small new command from the
   screen to Python saying "drop it".
   - *Good:* the cleanest meaning of the word "clear". Nothing lingers anywhere.
   - *Cost:* one new command between the two halves of the plugin, and we would need to decide what
     happens if you clear *while an answer is still being generated* — most likely it should stop
     it, which makes Clear cache slightly more powerful than it is today.

2. **Leave the back end alone; have the screen ignore anything older than the clear.** The screen
   remembers "I cleared at this point" and skips restoring anything from before it.
   - *Good:* no change to Python at all, and a generation still running is untouched.
   - *Cost:* the answer is still sitting in memory on the Python side, just not shown. If anything
     else ever reads it, the bug comes back wearing a different hat — and that is exactly the shape
     of this bug's last three "fixes".

**My read, if you want one:** option 1. This bug has now had three separate causes, and two of them
survived because something kept a copy the clear did not reach. Option 2 knowingly leaves a third
copy in place. The extra question option 1 raises — what a clear does to an in-flight answer — is
worth answering once, out loud, rather than inheriting by accident.

**Note on the two already-landed fixes.** They stay. D32's chat-slot detach stops the saved chat
being reloaded after your *next* question, and D34's snapshot discard stops the confirmation box
undoing the clear. Both were reproduced, fixed and re-tested on the Deck; they were simply not the
route you were hitting first.

---

### D34 — LOCKED (option 1, 2026-08-27) — *Clear cache* is undone by its own confirmation box. What should come back afterwards?

**Locked in the maintainer's words: option 1 — throw the whole photo away.** Implemented the same
day: `resetPluginSession` now calls `clearBonsaiSessionSurvival()`, which is the same discard
`clear_plugin_data` already used, so this is an established path rather than a new mechanism.

**On the accepted cost — it did not materialise in testing.** The worry was that discarding the
snapshot would also drop the remembered tab, bouncing you from **Settings** back to **Main** right
after pressing Clear. Measured on the Deck: the panel **stayed on the Settings tab**. Worth
re-checking if the modal machinery changes, but as it stands there is no visible cost.

**This fix is correct and was not sufficient on its own** — the cleared thread still came back, by a
third route that is nothing to do with the snapshot. That route is **D35**, now also locked and
fixed; the bug is closed.

**Raised 2026-08-27, measured on your Deck the same day. This is a follow-on from D32 — D32's
answer still stands, but the reason the button looked broken turned out to be something else, and
fixing it needs one small call from you.**

**What we found.** D32 assumed the old chat came back on your *next question*. It comes back
sooner than that. Press **Clear**, ask nothing at all, and the conversation is already back on the
screen. Measured twice with a real controller, on a build checked against the source.

**Why it happens, in plain terms.** *Clear cache* asks "are you sure?" in a pop-up box. Opening any
pop-up box makes the plugin restart itself behind the scenes — that is normal, and the plugin
handles it by taking a photo of your session first, then putting everything back afterwards. The
trouble is the order. The photo is taken **when the box opens**, which is *before* you press Clear.
So: photo taken (chat still there) → you press Clear (chat wiped) → box closes → plugin restarts →
plugin restores the photo → **your chat is back**. The button works; the box quietly puts
everything back a moment later.

**What needs deciding.** The fix is to stop that photo from restoring a session you just cleared.
The question is how much of the photo to throw away, because it holds more than the chat:

1. **Throw the whole photo away.** Simplest and safest to reason about.
   - *Good:* the clear definitely sticks, with the least fiddly code.
   - *Cost:* the photo also remembers which tab you were on. You press Clear while in **Settings**,
     and the plugin would likely drop you back on the **Main** tab instead of leaving you where you
     were. A small jolt, right after you pressed a button.

2. **Keep the photo, but blank out the conversation parts of it.** Keeps your tab position.
   - *Good:* nothing moves except what you asked to be cleared.
   - *Cost:* more fiddly — there is a list of things a clear resets, and blanking them in the photo
     means keeping that list correct in a second place. If the two ever drift apart, a future clear
     half-works and it will be hard to spot.

**My read, if you want one:** option 2, because option 1's tab jump is exactly the kind of "did that
do what I meant?" moment this whole bug was about — but it is your call, and option 1 is genuinely
more robust. If you pick 2, I would keep the two lists side by side in one file so drift is obvious.

**Not blocking anything else.** The pointer-detach half of D32 is already done and tested; this
decides only what the restart puts back.

---

### D32 — *Clear cache* says it clears the thread, but the saved chat stays on disk. Which half is wrong?

**Raised 2026-08-23 from Deck QA** (`recordings/DeckRecord_20260823_172915_game.mkv`).
**Locked 2026-08-27, in the maintainer's words: "yes it should clear the saved chat slot or at
least hide it so that the user comes back to a clean main tab."** That is option 1 with latitude
on the mechanism: clearing must leave the Main tab clean **and it must stay clean** — the old
turns must not come back when the next question triggers a transcript reload. Whether the slot
file is deleted or merely detached (the active-slot pointer cleared so nothing reloads it) is the
implementer's choice; detaching is acceptable. **The leftover-chats half is NOT settled by this
lock** — if the implementation detaches rather than deletes, the pile-up question below still
needs an answer, and it can be its own follow-up.

**What happens now.** You press **Clear cache…**. Its confirmation box says it clears *"this
session from RAM: input, reply, thread, transparency, branches, attachments, timers."* The screen
goes empty and a toast appears. But the chat itself is saved in a file under
`~/homebrew/settings/bonsAI/chat_slots/`, and that file is not touched. The plugin also keeps
pointing at it, so the next time anything reloads the chat — which happens automatically after your
next question — the old turns can come straight back.

**Checked on your Deck the same day.** Five saved chats were sitting there, none of them removed by
any clear. Three carried the same name, *Deep Rock Galactic: Survivor: one sentence*, made at 17:05,
17:08 and 17:29 — one for each time you cleared and asked again. So clearing does not reuse or empty
the old chat, it leaves it behind and starts another. They pile up.

**This is not the "Clear all plugin data" button.** That one is separate, and it does delete saved
chats properly. Only the smaller *Clear cache* is in question here.

**Your two options.**

1. **Make the button match its words.** Clearing also empties or deletes the saved chat you are
   looking at. Pressing it means the conversation is gone for good.
   - *Good:* the button does exactly what it says, and nothing accumulates.
   - *Cost:* if you were treating saved chats as things you can come back to, this throws one away,
     and there is no undo.

2. **Make the words match the button.** Clearing only tidies the screen; the saved chat is kept.
   Reword the box to say so — drop "thread" and say the saved chat is kept.
   - *Good:* nothing is ever destroyed by a button meant to tidy up.
   - *Cost:* the screen and the saved chat disagree until you switch chats, and the clear feels like
     it did less than you wanted — which is the complaint that started this.

**Either way, one thing still needs answering:** the leftover chats. Five built up from QA alone.
Should old ones be cleaned up automatically, or is a growing list of saved chats the intended
behavior and just needs somewhere to manage them from?

**My read, if you want one:** option 2 plus a cleanup answer. Option 1 makes a tidy-up button
destructive, and nothing else in the plugin deletes your content without saying "delete".

---

### D31 — Which of the two D19s keeps the number?

**Raised 2026-08-18, locked 2026-08-22: the live one keeps D19. The superseded corpus-licence
question becomes D19b.**

**The situation.** Two unrelated decisions both carried **D19** — the corpus licence question
(*mixed CC BY / BY-SA in one file*, superseded by D20 on 2026-08-14) and *Can you reach the
strategy corpus without the game running?* (locked 2026-08-17). A reference reading "see D19" was
ambiguous, and the risk was implementing against the wrong lock.

**Why the superseded one moves.** It is the cheaper side by reference count. The live D19 is cited
by roadmap.md (twice), by the *You cannot ask about a game unless it is running* entry, by the
`KB-NEWTITLE-01` row in testing.md, and by the fix commit itself. The superseded one is cited only
by D20, which sits directly beside it in this file — so the rename touches two adjacent paragraphs
instead of five files.

**Why `D19b` rather than the next free number.** Reusing D32 would scatter a 2026-08-14 decision
into the middle of the 2026-08-22 block and lose the ordering that makes this file readable. The
suffix keeps it where it belongs and makes the relationship to D19 obvious. Prior art in this file:
D21 carries its own numbering note because commit `e049ace` cited it as D18.

**Not chosen: leaving the collision note in place.** It had been there since 2026-08-18 and did not
stop the ambiguity — a reader following a "see D19" link still lands on whichever comes first.

---

### D30 — Which of the two `KB-NEWTITLE-01` rows keeps the ID?

**Raised 2026-08-22, locked 2026-08-22: the D19 row keeps `KB-NEWTITLE-01`. *Every corpus title has
cards* is renamed.**

**The situation.** Two rows in [testing.md](../testing.md) both carried `KB-NEWTITLE-01` —
*KB reaches a title named in the question (D19)* (line 177, **Verified on Deck 2026-08-22**) and
*Every corpus title has cards* (line 193, **Open**). They test different things: the first is
whether a question naming a game reaches that game's cards, the second is whether all thirteen
titles have any coverage at all.

**Why the newer one moves.** Same reasoning as D31 — reference count. The D19 row is cited from
roadmap.md, from this file, and from the 2026-08-21 session handoff. *Every corpus title has cards*
is cited nowhere outside its own table row, so renaming it breaks no live reference.

**New ID: `KB-COVERAGE-ALL-01`.** It names what the row actually checks (every title has cards),
and does not collide with `KB-COVERAGE-01`, which is the corpus-honesty chip row and a different
test.

**Watch for one thing when applying it.** The row also still says the corpus is 119 sections; it is
**133** as of corpus `2026.08.22`. Fix that in the same edit rather than leaving a second wrong fact
in a row being touched anyway.

---

### D29 — Which titles get Phase 4 track 3's per-game tips?

**Raised and locked 2026-08-22: keep Deep Rock Galactic: Survivor and Ocarina of Time, and write
their tips from research.**

**The situation.** Track 3's locked sample titles are DRG Survivor and Ocarina of Time, but the
only real per-game knowledge in the repo is for **Fallout 4** (`moshortcut://"F4SE"`) and **GTA:
San Andreas – DE** (`%command% -dx12`), both confirmed on the maintainer's own Deck on
2026-08-21. Three options were put: move the sample titles to the two proven ones, cover all
four, or keep the locked pair and research their tips.

**Chosen: the third.** [The planning page](../planning/18-phase4-track3-per-game-compat-tips.md)
rated it least preferred — it puts unverified claims in the part of the corpus users act on most
directly — and the maintainer chose it with that rating in front of them. Settled; not to be
re-argued.

**What it obliges, recorded so the risk is handled rather than just accepted.** A researched tip
has no provenance a user can weigh, so it must not render like a confirmed one: give researched
tips a distinct provenance line and the weaker trust tier the corpus already carries for this
case. Prefer quirks checkable on the maintainer's Deck in a minute (a shader stall, a menu that
ignores touch) over ones that cannot be checked at all (a claim about a specific Proton build) —
the second kind goes stale silently. The Fallout 4 and San Andreas quirks are still real and
still dated; author them somewhere rather than discarding the only verified per-game knowledge
in the repo. And keep 3–5 tips a target rather than a gate: with no natural supply the pull
towards padding is stronger here than under either other option.

**Still true regardless of this choice:** track 3 is blocked on the **schema v4** bump
(`app_id TEXT` on `compat_patterns`) and therefore on a second corpus release, and the eval
cannot currently tell a per-game tip from a shared tip on the same topic — so it ships unmeasured
unless a label is added. Both are on the planning page under *What to check before starting*.

---

### D28 — Ordinary phrases attach game cards. How hard should the floor be?

**Raised 2026-08-22 by the first on-Deck QA pass, locked the same day: option 2 — give the vector
half its own floor, separate from BM25's.**

**The precondition cleared before the lock.** The recommendation was "option 2, and not before
A2/D23 lands". D23 landed the same morning in `e606b82` — the fifteen paraphrase questions folded
into `kb_eval_v2`, taking it 219 → 234 rows and 138 → 153 labelled, with a **new baseline series
that is not comparable to anything measured before 2026-08-22**. So the floor is now tuned once
against one baseline, which is exactly what the recommendation was waiting for.

**What this obliges when it is implemented.**

- **Measure against the new series only.** Labelled tune top-3 is 86.3 keyword / 91.5 vector /
  91.5 fusion; labelled holdout 83.3 across all three; tips 68.8 / 72.9 / 75.0. Any before/after
  claim quoting a pre-2026-08-22 number is comparing two different fixtures.
- **Do not touch `BM25_RELEVANCE_FLOOR`.** Option 1 was explicitly not chosen because raising it
  pushes against D25, locked eleven days earlier to make short questions like *"the boss"* and
  *"gels"* reachable. The keyword half keeps its 1.0.
- **The keyword half is not innocent and this decision does not fix it.** Two of the four
  measured cases — *"thank you very much"* and *"what time is it"* — attach cards with the vector
  half switched **off**. Option 2 fixes the half that is clearly over-reaching; it will not make
  those two clean. Re-measure all six phrases from the table below after the change and record
  which ones still attach, rather than declaring the bug closed.
- **The eval cannot see this bug.** Every question in `kb_eval_v2` is a real question about a real
  game, so nothing in it scores worse when noise attaches. The six phrases below are the only
  evidence either way — keep them as a written check, and consider them a candidate for the frozen
  test chips shipped in `b278f7b`.

**Correction, 2026-08-23 — the vector half already had its own floor.** This decision is worded
as "give the vector half its own floor", but `VECTOR_RECALL_FLOOR` already existed at 0.50
(`py_modules/backend/services/knowledge_base_service.py`). So what was implemented is a retune of
an existing number, not the addition of a new gate. The decision text above is left as written,
because it records what was decided with the information available at the time; this note records
what turned out to be true. The intent — move the vector half, leave the keyword half alone — was
carried out exactly.

**And the retune is thin. 0.50 -> 0.515, measured 2026-08-23** against corpus `2026.08.22` seed
cards with the real embedding model. The measurement found what the 2026-08-18 run had already
found: **no single floor separates the noise from the genuine hits, because the two ranges
overlap.** 0.515 sits between *"one sentence"* at 0.5034 (noise, now excluded) and Mind Flayer /
`V2-PARA-S04` at 0.5169 (genuine, the lowest score the change must not break) — a margin of
0.0011. That margin is a property of today's card set, not a safety buffer; adding cards or
changing the embedding model moves it. Kept on the maintainer's call 2026-08-23, with the overlap
itself filed as its own backlog entry (*Card relevance needs a second signal*, Knowledge base lane)
rather than treated as a tuning job. **Do not retune this number again without re-running the
measurement — and if the answer is a third floor value, that is the signal to go do the backlog
entry instead.**

**The original write-up follows, kept because it is the measurement this decision rests on.**

**The situation.** With a game running and Strategy mode on, questions that have nothing to do
with the game still get game cards stapled to them. Measured on the Deck against corpus
`2026.08.22` with Deep Rock Galactic: Survivor running:

| What was asked | What attached |
|---|---|
| *"one sentence"* | Praetorian |
| *"thank you very much"* | Nitra |
| *"what time is it"* | Glyphid Dreadnought, Praetorian, Classes |
| *"please repeat that"* | Glyphid Dreadnought, Nitra, Dreadnought Twins |
| *"our team"* | nothing (clean) |
| *"four hours"* | nothing (clean) |

This is the regression direction `KB-SPELLING-01` in [testing.md](../testing.md) explicitly says
must not happen. **That row points at the British-spelling exemption set as the first place to
look, and the exemption set is innocent** — the query is not expanded at all, and Praetorian
scores `bm25=0.00` and never enters the keyword pool.

**Where it actually comes from — both halves, unequally.** Comparing hybrid on against hybrid off
on the same questions: the vector recall pass (`bf16b35`, this week) supplies the card on its own
for *"one sentence"* and *"please repeat that"*, where keyword-only attaches nothing. But
*"thank you very much"* and *"what time is it"* attach cards **with the vector half switched
off**, so the keyword floor is letting near-noise through by itself. The underlying cause is the
Strategy explicit route's relevance floor of **1.0**, which the new vector recall then widens.

**Why it did not show up before.** Every question in `kb_eval_v2` is a real question about a real
game. Nothing in the approved set asks *"what time is it"*, so no score moves when this
misbehaves. It is invisible to the eval and visible immediately on a device — the same shape as
the four faults in §2 of the [handoff](session-handoff-2026-08-21.md).

**Your options.**

1. **Raise the Strategy floor** (say 1.0 → 2.5) and re-measure. Cheapest change, one number.
   Costs recall on genuinely short questions — *"the boss"* and *"gels"* are short too, and the
   whole point of D25's light fix was to reach them. **Must be measured against the eval before
   and after, not eyeballed.**
2. **Give the vector half its own floor**, separate from BM25's. Fixes the half that is clearly
   over-reaching without touching keyword recall. More code, and picking the cosine cut-off is its
   own tuning job.
3. **Gate on the question rather than the score** — attach nothing when the question names no
   noun the corpus knows. Most precise, most work, and a new failure mode when a real question
   happens to use only common words.
4. **Accept it for now.** With no users (as of 2026-08-21) nobody sees it, and a stray card in the
   prompt degrades an answer rather than breaking it. Revisit before the first real user.

**Recommendation at the time, and the option chosen: option 2, and not before A2/D23 lands.** The
paraphrase rows were about to move every number anyway, and tuning a floor twice against two
different baselines wastes the measurement. Option 1 is tempting because it is one number, but it
pushes directly against D25, which was locked eleven days earlier to make exactly these short
questions reachable.

**Note this is not a reason to hold the corpus release** — it is plugin behaviour, not corpus
data, and the corpus published on 2026-08-22 is unaffected either way.

---

### D27 — Phase 4 shipped two tracks of three. Accept the split, or hold it?

**Raised 2026-08-19, locked 2026-08-21: accept the split — tracks 1 and 2 go in the release
notes now.** Written into `CHANGELOG.md` under `[Unreleased]` the same day. Track 3 gets its
own entry when it lands; Phase 4 is announced in two parts rather than held.

**Original framing.** Phase 4 was locked to ship all three tracks together. Tracks 1 and
2 shipped on 2026-08-19 and 2026-08-21; track 3 did not.

**Why it split.** Track 3 needs an `app_id` column on `compat_patterns` — a schema v4 bump and a
corpus rebuild, which by **Decision 6** (no migration) makes every installed corpus stale until
re-downloaded. That is a release action rather than an effort problem, and the two tracks that
shipped are the ones a user can see.

**Your choices.**

- **Accept the split.** Tracks 1–2 go in the release notes now; track 3 lands with the next
  corpus. Costs nothing but a lock you set yourself.
- **Hold.** Keep tracks 1–2 out of the release notes until track 3 lands, so Phase 4 is
  announced once and completely. Costs visible work sitting unannounced.

**Why the split was accepted.** **D24** settled that the corpus ships now rather than waiting
for track 3, so holding tracks 1–2 would have meant announcing nothing about work that is
already in users' hands the moment the corpus lands.

### D26 — Thirteen eval rows were re-keyed off a borrowed AppID. Endorse it?

**Raised and locked 2026-08-21: endorsed — "yes, still the same test."**

**Original framing.** `kb_eval_v2` is the approved scored set and the bake-off numbers
were measured against it, so editing it normally needs a call first.

**What happened.** Thirteen rows identified *"asked while Ocarina of Time is running"* by AppID
`413150` — which is Stardew Valley's real AppID, and was the bug being fixed (see the AppID
collision entry in [../roadmap.md](../roadmap.md)). Removing it from the corpus meant those rows
had to identify the game by name instead, using `shortcut`, exactly as State of Emergency
already does.

**Measured before asking, because the objection was measurable.** Every arm on every split
scored **identically to the decimal** before and after the re-key: keyword, vector-only,
rerank-only and RRF, across tune, holdout, compat-all and compat-gate-reachable. Sixteen
score pairs, zero movement. The rows test what they always tested.

**The standard this sets, which is the part worth keeping.** Editing an approved fixture is
allowed when the edit is shown not to move any score, and the showing comes *before* the ask.
An edit that does move a score is a different question and goes back to the maintainer with the
movement quantified, not with an argument about why it should be fine.

### D25 — "How do I beat the boss" — the light fix or the indexed one?

**Raised 2026-08-19, locked 2026-08-21: keep it light.**

**The situation.** A card knows its type — `boss`, `item`, `area` — but `sections_fts` indexes
only `(name, card)`, so the type was never searchable and *"how do i beat the boss"* returned
zero candidates on a title whose boss card was right there.

**Choice: query-time type recall.** A generic type word pulls that game's cards of that type
into the candidate pool. No schema change, no corpus rebuild, so it reaches a corpus already
installed on a Deck, and it is easy to reverse.

**Not chosen: indexing `section_type` in `sections_fts`.** A bare "boss" would then match every
boss card at BM25 rank — right for a one-boss title, noisy for a twelve-boss one — and it needs
a corpus rebuild to reach anyone.

**Why the light one held up.** It was narrowed on 2026-08-21 (`32685e5`) once the Phase 4 cards
took Ocarina of Time to six boss cards: the preference now applies only to kinds the keyword
half missed entirely, because `_sections_of_type` returns cards in authoring order and
preferring that slice outranked real matches. The narrowing made the light version behave
better, which strengthens rather than weakens this call.

### D24 — Publish a new corpus?

**Raised 2026-08-19, locked 2026-08-21: yes, publish.**

**Why it was a question.** Publishing makes every installed corpus stale until re-downloaded
(**Decision 6**, no migration), so it is a deliberate, announced action rather than a quiet
edit — and it pushes to Hugging Face and the GitHub mirror, which are outward-facing.

**One release, not three.** Three separate pieces of work were each individually blocked on it:

1. **Phase 4 track 2's 16 structured cards** — card content is corpus data, not plugin code.
2. **The Ocarina of Time AppID fix** — the wrong AppID is a row in the corpus.
3. **Phase 4 track 3** — needs schema v4, a new column on `compat_patterns`.

**The strongest argument, recorded because it will be the reason someone hurries this:** the
published corpus is currently stale *and* carries a known bug. Hugging Face serves `2026.08.16`,
which is 117 cards with Ocarina of Time still holding Stardew Valley's AppID — so anyone
downloading today gets a Stardew Valley session inheriting Zelda's cards and Zelda's spoiler
fencing.

**Sequencing, settled 2026-08-21: publish now — do not wait for schema v4.** The question was
whether to bundle track 3's schema bump so users take one stale-corpus event instead of two.
The maintainer's answer removed the premise: **there are no users yet.** Nothing is installed in
the field, so the no-migration cost of **Decision 6** is currently zero, and a second corpus
release when track 3 lands costs nothing either.

**Record that fact with a date, because it expires.** As of **2026-08-21** the plugin has no
users, and several cautions in this repo — the no-migration rule, the stale-corpus warning, the
reluctance to bump the schema — are priced for a world where it does. They are still the right
long-run rules and they cost nothing to keep, but do not treat a schema bump as expensive today
and do not assume it is still cheap in three months. The first real user makes all of it real.

### D23 — Where do the paraphrase questions go?

**Raised 2026-08-18, locked 2026-08-21: fold them into `kb_eval_v2`.**

**The situation.** `kb_eval_v2` has **one** labelled case out of 138 where keyword search returns
nothing, so the slice that proves the vector half adds recall is a sample of one. The fixture
questions share vocabulary with the cards they match, so it almost never exercises someone
phrasing a question in their own words — which is the exact failure the 2026-08-18 recall fix
was for.

**Choice: fold in.** The fifteen paraphrase questions in
[rag-vector-recall-floor-2026-08-18.md](rag-vector-recall-floor-2026-08-18.md) — already
written, measured and labelled with the card each should return, and sitting in
`tests/fixtures/kb_eval_paraphrase_v0.json` — join the approved set rather than forming a v3 or
staying a separately reported slice.

**Not chosen:** a v3 fixture (two sets to keep in step, and the older one keeps being quoted);
a separate reported slice (a number nobody gates on is a number nobody reads).

**Consequence, stated up front so nobody is surprised.** These questions are built to share no
words with their card, so scores will very likely **fall** — most on the keyword arm. That drop
is the measurement working, not a regression. Two things follow:

- The **2026-08-21 report is the last one measured on the old set.** Old and new numbers are not
  comparable and must not be quoted against each other (**R4**, same-corpus-and-fixture only).
- The tune/holdout split has to be assigned for the new rows before anything is tuned on them
  (**R1**), or the ship gate is contaminated on arrival.

**What it is for.** The holdout half currently cannot separate the arms at all — 83.3% whichever
approach is used, on 36 rows. This is the work that should give it something to separate.

**Done 2026-08-22.** The 15 rows are in `kb_eval_v2.json` as `V2-PARA-*` (219 → 234 rows,
138 → 153 labelled). **The split was assigned before the eval was re-run: all 15 are `tune`.**
That is forced, not chosen — they paraphrase `kb_eval_v0`, which is card-derived in full
("written alongside the cards they match", R1), and a paraphrase of a card-derived query is
still card-derived. A holdout row has to be written blind, and these were not.

**New baseline — a new series. Do not compare these against any report dated before
2026-08-22 (R4).** Last old-set report:
[kb-embed-bakeoff-2026-08-21-arms.md](../archive/research/kb-embed-bakeoff-2026-08-21-arms.md).
New: [kb-embed-bakeoff-2026-08-22-arms.md](../archive/research/kb-embed-bakeoff-2026-08-22-arms.md).

| Slice | keyword | vector only | fusion (ships) |
|---|---|---|---|
| Labelled tune, top-3 (n=117) | 86.3% | 91.5% | **91.5%** |
| Labelled holdout, top-3 (n=36) | 83.3% | 83.3% | **83.3%** |
| Troubleshooting tips, top-3 (n=48) | 68.8% | 72.9% | **75.0%** |

**Three results worth your attention, two of them unwelcome.**

1. **The scores fell where they were meant to.** Labelled tune fusion went from 94.1% to 91.5%
   on a set that is 15 rows harder. That is the measurement working, exactly as this decision
   said it would.
2. **This did not do what it was for.** D23's stated purpose was to give the holdout something
   to separate. **The holdout is untouched — still n=36, still 83.3% on every arm, still
   overlapping intervals.** It could not be otherwise: the split rule sends all 15 rows to
   `tune`, so a decision aimed at the holdout could never reach it. The holdout separation
   problem is exactly where it was on 2026-08-21, and **it needs rows written blind against
   the cards** — which is a different piece of work from this one.
3. **The troubleshooting slice went up, not down** — 72.5% → 75.0%. The 8 compat paraphrases are
   *easier* than the compat rows already in the set, so folding them in raised the average. Worth
   knowing before anyone reads that rise as an improvement in retrieval: nothing improved, the
   test got easier on that slice.

**Two smaller things that changed shape.** The recall slice — labelled cases where keyword
search returns nothing, the one D23 called "a sample of one" — is now **n=3**. Better, still
too small to carry a verdict. And on that slice fusion now scores **33.3%** top-3 against
vector-only's **66.7%**, where on the old single case both scored 100%. On the tune slice fusion
no longer beats vector-only either (both 91.5%). Neither is a regression in shipped behaviour —
the corpus and the code are unchanged — but if fusion is going to be defended over plain vector
search, these are now the numbers it has to be defended with. **Related: [D28](#d28--ordinary-phrases-attach-game-cards-how-hard-should-the-floor-be)** — tune a floor once, against this baseline, not the old one.

---

### D22 — A matched troubleshooting topic is a strong preference, not a filter

**Raised and locked 2026-08-18**, while planning the fix for *"Compat retrieval returns a tip
from the wrong topic"*. Extends **D16**, which decided *whether* a question reaches the tip
sheet; this decides *what it is allowed to return once it gets there*.

**The question, plainly.** The router already works out what a troubleshooting question is
about — "the game only responds to the touchpad and ignores the sticks" is a Steam Input
question. Today that answer is thrown away and the search runs across all 124 tips, which is
how a question about controllers comes back with a tip about screen resolution that happens to
contain the word "ignores". Should the matched topic **restrict** what can be returned, or
merely **favour** it?

**Choice:** a **strong preference**. The matched topic feeds the ranking as a heavy signal;
tips on that topic rise, tips on other topics can still surface when their match is genuinely
better. Nothing is excluded outright.

**Why.** The router guesses, and a hard filter turns every wrong guess into an empty result or
a forced-wrong answer with no way back. A question that spans two topics — "my controller
stops working after sleep" is Steam Input *and* power management — has no single right topic
to filter on. Preference degrades gracefully in both cases; a filter fails hard in both.

**Cost, stated plainly:** an off-topic tip can still win if it outscores everything on the
right topic by a wide margin. That is the failure this fix is *for*, so the preference has to
be weighted heavily enough to actually change the outcome, and the fix is not done until the
four `KB-ROUTER-01` sentences return on-topic tips. If measurement later shows preference is
too weak on this corpus, tightening toward a filter is a weight change, not a rewrite — which
is the other reason to start here.

**Not chosen:** hard filter (predictable, but one bad guess and the user gets nothing);
leaving it as-is (measured 2026-08-17: half the router's own test sentences return an
off-topic tip).

**Amended the same day, by measurement.** The plan said the compat path would also get the
vector recall pass the strategy path got. It was built, measured and **removed**: on the tune
split it cost a case and gained none (27/27 without, 26/27 with), and structurally it cannot
help — reaching compat retrieval means the router matched a topic, so topic recall has already
filled the pool, and a vector pass could only add *off-topic* candidates, which is the opposite
of this decision. Zero of the 40 compat fixture rows reach retrieval with no routed topic.
Detail: [rag-compat-topic-preference-2026-08-18.md](rag-compat-topic-preference-2026-08-18.md).

**Implemented 2026-08-18.** Weight `RRF_W_TOPIC = 0.30` — the *weakest* setting that fixes all
four KB-ROUTER-01 sentences, chosen that way because the decision was preference, not score.
Router sentences 1/4 → **4/4**; compat tune top-3 81% → **100%**. Works without an embed model.

### D21 — Thinking effort sends "on", not the level name

**Raised and locked 2026-08-15**, while implementing Thinking effort control Phase 1.
Supersedes the wire mapping locked in
[16-soft-num-predict-thinking-budget.md](../planning/16-soft-num-predict-thinking-budget.md).

**The question, plainly.** When you pick Brief / Balanced / Deep, what should bonsAI ask the
model for? Some models understand "think a little" vs "think a lot" as named levels. Most
thinking models only understand "think" or "don't think".

**Choice:** send plain **`think: true`** for all three levels. The difference between them is
how many tokens are *reserved* for thinking (256 / 512 / 1024), which is added on top of the
mode's reply budget so reasoning cannot eat the answer's allowance.

**Why.** The named levels `"low"` / `"medium"` / `"high"` are a **gpt-oss-family** feature.
qwen3 and deepseek-r1 — the thinking models actually likely to be installed on a Deck, and
the ones in the pull catalog — accept `think` only as a boolean. Sending them `"low"` would
have broken models that genuinely think, which is worse than under-using one family's dial.
Portability beat depth-on-one-family.

**Cost, stated plainly:** on gpt-oss models the three levels differ less than they could,
because their built-in dial is ignored. Native levels remain available as a later change,
and would need per-model capability detection to be safe.

**Not chosen:** "try the level, fall back to boolean, then fall back to off" — best result per
model, but three possible round trips and the most code to get right for a benefit only one
model family sees today.

**Related, same session:** a model that cannot think *at all* is not a decision but a
mechanism — it gets one silent retry with thinking off, is remembered for the plugin session,
and the user is told once. Without it a plain HTTP 400 would have failed the Ask outright,
because `ollama_ask_service` does not fall through to the next model on a generic 400.

> **Numbering note:** the commit that landed this (`e049ace`) cites it as **D18** in its
> message, written before D18–D20 were known to be taken. The decision is **D21**; every
> code and doc reference says D21.

---

### D19b — Mixed CC BY / BY-SA cards in one corpus file? *(superseded by D20, 2026-08-14)*

> **Numbering note:** formerly filed as D19 by mistake; renumbered D19b 2026-08-28 per
> [D31](#d31--which-of-the-two-d19s-keeps-the-number). The other D19 — *Can you reach the
> strategy corpus without the game running?* — keeps the number.

**Raised and locked 2026-08-09** (ATTR-1.3 in
[15-corpus-licensing-attribution-plan.md](../planning/15-corpus-licensing-attribution-plan.md)).

**Choice: CC BY 4.0 only for the publishable corpus.** ShareAlike sources (CC BY-SA 3.0/4.0)
are deferred until attribution / ShareAlike redistribution work is ready. Do **not** treat
`source_license` coexistence as the locked policy — the seed may still hold BY-SA cards for
dev QA, but Phase 6 public publish is BY-only until that deferral lifts.

**Why.** ShareAlike binds adaptations; publishing a mixed corpus needs the full
`ATTRIBUTIONS.md` + ShareAlike path. Restricting to BY 4.0 (Portal Wiki today) keeps first
publish simpler.

**Follow-up 2026-08-09:** `zelda.fandom.com` is **GFDL**, not Fandom's usual CC-BY-SA
(page footer confirmed). Seed `source_license` corrected; still excluded from publish under
this decision (GFDL ≠ CC BY 4.0). See
[15-corpus-licensing-attribution-plan.md](../planning/15-corpus-licensing-attribution-plan.md)
ATTR-1.1.

**Superseded 2026-08-14 by D20** — reopened during Phase 6 publish planning once it was
established that the ShareAlike attribution machinery (`ATTRIBUTIONS.md` generation, corpus
license header, `NOTICE` separation) already fully discharges the obligations D19b was written
to avoid taking on. No new legal information; a re-weighing of cost against what BY-only
excluded (all six ShareAlike wikis).

---

### D20 — Publish the corpus as one CC BY-SA 4.0 work, including ShareAlike sources

**Raised and locked 2026-08-14**, during Phase 6 publish planning. Supersedes D19b.

**Choice:** the first public corpus ships as a single work licensed **CC BY-SA 4.0**, and
ShareAlike sources (the CC-BY-SA-3.0/4.0 wikis: L4D2, Fallout, GTA, Cyberpunk, Combine
OverWiki) are **included**, not deferred. Per-card `source_license` stays recorded and
queryable — declaring one license for the whole work is what Hugging Face's dataset metadata
requires, not a claim that every card shares one license underneath.

Still excluded, on grounds D20 does not touch: `zelda.fandom.com` (**GFDL** — a different
license family that does not mix with Creative Commons; the 2 affected cards are dropped
from the seed entirely rather than published under the wrong license — see
[15-corpus-licensing-attribution-plan.md](../planning/15-corpus-licensing-attribution-plan.md)),
`hades.fandom.com` and `developer.valvesoftware.com` (NonCommercial), `bg3.wiki`
(per-contributor licensing is ambiguous — some contributors' text is NC-only and no page says
which).

**Why.** No code anywhere filtered by license — D19b's restriction existed only as a paragraph
in the generated `ATTRIBUTIONS.md` header
([build_rag_db.py](../../scripts/build_rag_db.py) `_attributions_header_lines()`) and about
eight doc mentions; enforcing it as a real gate would have meant writing a filter to *shrink*
an already-small, already-licensed, already-tested corpus for no legal necessity — ShareAlike
obligations are fully satisfied by the attribution machinery Stages 1–5 already shipped.
Sweeping the exclusion under one BY-only rule was overcautious relative to what CC BY-SA
actually requires.

**Consequence:** first publish grows from ~67 sections (58 maintainer + 9 Portal) to 117 of
the 119 seed sections, across 6 wikis instead of 1.

### D17 — Game knowledge was gated on the Ask mode toggle

**Raised and locked 2026-08-06. Choice: ungate it.** Shipped the same day.

**What was going on.** Strategy cards only attached when the Ask mode toggle was set to
*Strategy*. The same question, about the same running game, got cards in one mode and nothing
in the other two:

| Ask mode | "how do I beat the tank", Left 4 Dead 2 running |
|---|---|
| Speed | nothing |
| Strategy | cards |
| Expert | nothing |

Expert is where somebody stuck on a hard fight is most likely to be, and it got no game
knowledge at all. This is D16's shape on the other side of the corpus: the content existed,
and reaching it depended on something unrelated to the question.

**The call.** Ask mode still decides **how many** cards attach (`_budget_for_mode`: Speed 1,
Strategy 3, Expert 5). It no longer decides **whether** the corpus is consulted. Explicit
Strategy mode still wins outright; a troubleshooting-shaped question still routes to compat
even with a game open.

**Two guards, because the new route is permissive by design.** An Ask that never declared
itself to be about the game is weaker evidence than one that did, so on that route: the
relevance bar is higher (`IMPLICIT_ROUTE_RELEVANCE_FLOOR`, provisional — see below), and the
generic genre fallback is suppressed, so an ordinary Ask made while a game happens to be open
does not grow a boilerplate strategy block that answers nothing.

**Two things found while shipping it.**

*Cross-game leak, fixed first in its own commit.* Strategy search fell back to an unscoped
corpus-wide query when the running game could not be resolved, so "how do I beat the tank"
while playing an uncovered game returned Left 4 Dead 2's card. Wrong-game advice, delivered
confidently. D17 would have routed far more traffic through it. Search is now scoped to a
resolved game or does not run.

*The relevance floor is looser than it looked.* FTS5 runs the porter stemmer, so "what time do
the shops close on a sunday" matched "crescendo **timing**" in an unrelated card and scored
2.72 — above the 1.0 floor. Named-boss questions score 10+, a plain "how do I beat the tank"
scores 5.28. `IMPLICIT_ROUTE_RELEVANCE_FLOOR = 4.0` sits between them. **That is two data
points on a two-card-per-game corpus and will move in stage 6d** — it is in the code because
shipping a known noise source is worse than shipping a constant that admits it is a guess.

On-Deck QA: **KB-ASKMODE-01**.

---

### D16 — The compat knowledge base was unreachable for most of its content

**Raised and locked 2026-08-06. Choice: widen the gate now.** Shipped the same day.

**What was going on.** Routing an Ask to the troubleshooting knowledge base required the
literal word `deck` or `proton` in the question, or one of about six preset phrases. Measured
against 40 freshly drafted troubleshooting questions: **3 reached it**. Of the 19 phrased the
way a player actually types, **zero** did — and 18 of the 21 written deliberately to match the
gate also missed. That left roughly 24 of the corpus's 27 topics — storage, Steam Input,
anti-cheat, streaming, VR, Wine, emulation — unreachable, each with 6–10 tips shipped behind
it. This was decision **Q8**, deferred as "natural-language asks skip KB"; the measurement
showed it was not a nicety but the feature being mostly off.

**The options were:** keep Q8 deferred and tune fusion on strategy evidence alone, accepting
that the compat arm of the bake-off would score cards production never fetches; or widen the
gate as a scoped product change. Maintainer chose to widen.

**How it was done, and the constraint that shaped it.** `question_matches_troubleshooting_log_context`
has **five** consumers — knowledge base routing, Proton log attachment, system-prompt framing,
stream tags, and the client-side permission hint. Widening it would have changed four
behaviours to fix one. So the fix is a **separate, additive** predicate,
[compat_topic_router.py](../../py_modules/backend/services/compat_topic_router.py), that only
the knowledge base reads; `should_retrieve_knowledge` runs the compat path when either matches.
The phrase gate and the frontend heuristic that mirrors it are untouched.

**Result:** reachability 3/40 → **39/40**, **13/13** on a blind holdout split whose queries were
not read while the rules were written, and **0/107** strategy false positives. Old fixtures
3/18 → 18/18.

**Two things found while building it, both now pinned by test.** Substring matching had `lan`
firing inside *plants*, *plane* and *island*, routing three strategy questions to
troubleshooting; terms now match at a word boundary. And normalizing apostrophes to spaces
turned `can't see` into `can t see`, silently killing two rules that read as though they
worked; apostrophes are dropped instead. A third test asserts every topic in
`data/kb/compat_patterns.json` has a routing rule, so shipping content nobody can reach fails
rather than repeats.

Full measurement and the options as presented: [rag-pr2-signoff.md](rag-pr2-signoff.md) § 2.
On-Deck QA: **KB-ROUTER-01**.

Evidence for all of these lives in [docs/audit/](.), especially
[05-plan.md](05-plan.md).

---

### D1 — Two features were built with a frontend but no backend. Build them, or remove them?

**What's going on.** Two buttons/flows in the UI call into Python functions that
were never written. The names exist only in TypeScript. Because both call sites
threw the error away, nothing ever surfaced — no crash, no log, no message. They
now log to the console, and both are listed as bugs above.

The two are very different sizes, so you may want a different answer for each.

**~~Option A — build the small one, delete the big one.~~** *(my recommendation)*

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

**~~Option C — delete both.~~** Smallest and safest. You lose the pulled-model
try-order convenience, which means setting try-order by hand after installing
models.

**~~Option D — leave them as they are.~~** They now log loudly, so they are no longer
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

**~~Option B — delete the certain ones, keep the ambiguous ones.~~** The Proton
journal group and `thinking_tiny_model_service.py` are unambiguous — the features
were removed on purpose. Two others are worth a second thought:

- `ask_game_ai` is described in the code as the *foreground* Ask path. The app
  only uses the background one now. If you ever want a synchronous Ask, this is
  the code for it; if not, it is dead weight.
- `cancel_rag_corpus_download` suggests knowledge-base downloads were meant to be
  cancellable and the button was never wired up. That might be a missing feature
  rather than dead code.

**~~Option C — keep everything.~~** No risk, but the confusion stays: a newcomer
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

**~~Option B — refactor anyway, verify by hand on the Deck.~~** Faster to start. Each
change needs you to install to the Deck and click through it, and a subtle
regression (focus behaviour, a race in Ask polling) can slip through a manual
pass. If you choose this, the work should be sequenced last and done in small
commits so anything broken is easy to undo.

**~~Option C — leave those two files alone.~~** Do the lower-risk items instead
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

**~~Option B — keep everything.~~** It is only disk space, and old run output can be
useful when chasing a regression that reappears.

**~~Option C — prune, but archive first.~~** Zip the removed folders somewhere
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

**~~Option B — switch to madge.~~** More battle-tested and handles exotic import
styles this codebase does not currently use. Costs a dependency and slows every
commit slightly. Worth doing if you ever add TypeScript path aliases, which would
make the simple version unreliable.

---

### D6 — Sequencing: what should I do next?

Not a hard decision, just a checkpoint. The audit produced a ranked plan in
[05-plan.md](05-plan.md). The first four items are all low-risk, mechanical,
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
[05-plan.md](05-plan.md) §1.3, accepting that it depends on someone
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
- **`MainTab.tsx`** — 187 lines, churn 42, and [05-plan.md](05-plan.md)
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
([07-mainpy-inventory.md](07-mainpy-inventory.md) §3). Every RPC in `main.py` starts
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

**~~Option B — keep them, and write down why.~~** Costs nothing today. The comment has to explain
why a half-covering fallback is worth 55 call sites, because otherwise a future session
proposes this again.

**~~Option C — finish the fallback instead.~~** Extend `_ensure_background_state` to cover all 29
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

**~~Option B — generate both sides from one spec.~~** A single machine-readable file describing
every field, from which the TypeScript types and the Python sanitizers are generated. This is
the only option where the two languages *cannot* disagree, because only one thing is written
by hand. It fits how the repo already works — six architecture snapshots are generated and
validated on every commit.

It is also the biggest commitment: a generator to maintain, generated files people must not
edit, and the awkward cases (migrations, cross-field reconciliation) either stay hand-written
anyway or push complexity into the spec format.

**~~Option C — stop here.~~** Keep the fixture, keep the hand-written code. Drift is now caught,
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
([uiScaleProfile.ts:117](../../src/data/uiScaleProfile.ts)) already trims *and* lowercases; the
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

**~~Option B — align case by case.~~** For at least one setting TS is arguably the better
behavior: deriving `preset_chip_fade_animation_enabled` from `preset_chip_animation` keeps the
deprecated field consistent with the live one, where Python can report `fade_enabled: true`
alongside `animation: "carousel"`. Pick per row rather than by language.

**~~Option C — leave them and document.~~** Nothing is broken in normal use. Costs nothing now,
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
normalize and save paths ([settingsPayload.ts:29](../../src/utils/settingsPayload.ts)), so Python
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

### D14 — `index.tsx` is at 1291 lines, not the 700–800 step 8 predicted. Stop, or keep going?

**What's going on.** Everything step 8 listed is done: three slices, four modals, one state
hook, six tab payloads. `index.tsx` went 1955 → 1291. The 700–800 figure in **D9** was an
estimate made before anyone measured what was left, and it assumed the remaining lines were
JSX. They are not. What is left is four blocks of prop threading:

| Block | Lines | What it is |
|---|---|---|
| `usePluginSettings` destructure | ~85 | 40 settings and their setters, unpacked into locals |
| `settingsSnapshotForSave` | ~90 | the same 40 keys listed twice — object body and memo deps |
| session-survival snapshot | ~65 | a default shape plus a live snapshot getter, ~30 fields each |
| preview test-hook registration | ~55 | a preview-only `getState`/`setTab`/`triggerAsk` bridge |

Moving any of these to another file does not make them smaller; it moves the same lines and
adds an argument list. They shrink only by **collapsing** — passing grouped objects instead of
40 named locals — and that is a rewrite of every consumer, which refactor rule 1 keeps out of a
behavior-preserving step.

**Option A — call step 8 done at 1291 and correct the estimate.** *(my recommendation)* The
stated goal was a composition root that composes; that is now literally what the file is. The
700–800 number was never measured and chasing it buys nothing a reader would notice.

**~~Option B — do the one cheap collapse first, then stop.~~** Have `usePluginSettings` return
`settingsSnapshotForSave` itself. It already owns all 40 states, so this is a move into the hook
that owns the data, not a redesign — about 90 lines out of `index.tsx`, and it deletes a 40-key
list that is currently maintained by hand in two places. It is genuinely step 7 work (settings
SSOT) that happens to land in `index.tsx`. Low risk, one commit, gates unchanged.

**~~Option C — collapse the prop threading properly.~~** Group the Ask slice and the settings slice
into objects and thread those. Would get near the original estimate. It is also exactly the
rewrite **D9** deferred, it touches `MainTab.tsx` (already a follow-up), and it is unreviewable
as a single diff.

**Not urgent.** Nothing is blocked on this. It only decides whether step 8 closes now or takes
one more commit first.

**Locked 2026-08-03: Option A — step 8 is done at 1291 lines; the 700–800 estimate in D9 is
withdrawn as unmeasured.** Option B stays available but belongs to step 7's settings SSOT
thread, not here; it is not a prerequisite for anything and is not scheduled.

**Record the cost honestly, because step 5b predicted it.** Across the five commits `src/`
grew **+1012 / −447, net +565 lines** while `index.tsx` fell 1522 → 1291. Step 5b already
measured this: *"extracting the tab JSX is a lateral change… `index.tsx` would shrink while the
codebase got worse."* Doing the state and modal extractions first removed some of that tax, and
deriving each payload's args from `React.ComponentProps<typeof Tab>` removed the rest of the
*type* duplication 5b warned about — but the prop **names** are still written twice per tab,
once at the call site and once in the hook. The payload step bought a composition root that
reads as composition, and it cost 565 lines to get it. **The state and modal extractions were
worth more per line than the payloads were**, which is the useful lesson for the next entry
point: do the state, and treat the JSX as optional.

---

### D15 — When you reopen the plugin, should it put you back where you were?

**What's going on.** Today it always opens on **Main**. Not by decision — by omission: the only
tab-restoring machinery is for modal round-trips, and nothing saves your tab when the plugin
closes. Reported on-Deck 2026-08-04 as *"getting back to the tab you were at seems cumbersome"*.

The code change is a few lines either way (persist `currentTab`, read it in `resolveInitialTab`).
The question is what the plugin should *do*, and that is not a code question.

**~~Option A — always open on Main.~~** *(today's behavior, by accident)* Main is where you Ask, and
Asking is the point. Every open starts from the same place, which is predictable and needs no
memory of what you were doing. The cost is exactly what was reported: if you were mid-way through
Ollama or Settings, you walk back every time.

**Option B — resume the tab you left.** *(my recommendation)* Matches how the plugin already
behaves around modals, so it is consistent rather than novel, and it removes the reported
friction. The risk is the opposite complaint: you set something in Settings, come back later
wanting to Ask, and land in Settings. On a D-pad that is one shoulder press, so the downside is
smaller than the upside.

**~~Option C — resume, but expire it.~~** *(shipped as Developer toggle only, not default)* Resume the tab if you reopen within N minutes, else Main.
Fixes both complaints and is the most code and the most explaining. Hard to justify before A or
B has actually annoyed someone.

**Worth deciding together with the focus-restore item above** — if pickers are going to restore
focus within a tab, resuming the tab itself is the same idea one level up. Doing B without focus
restore is still a clear improvement; doing focus restore without B is a bit odd.

**Locked 2026-08-04: Option B — resume the tab you left.** Shipped the same day, together with
the focus-restore item as the discussion above suggested. See both entries under **Bugs**.
On-Deck confirmation still owed: **TAB-RESUME-01** and **PICKER-FOCUS-01**.

**Amended 2026-08-04: all three options now ship behind one Developer control**, `tab_resume_mode`
— `always_main` (A) / `resume` (B) / `resume_recent` (C, five minutes). **B stays the default and
the locked decision**; the other two exist so this entry stops being settled on paper alone. C was
argued above as *"hard to justify before A or B has actually annoyed someone"* — that argument was
against **shipping** C as the default, and it is unchanged. What changed is the cost of finding
out: with a stop for each, the answer comes from a week of use rather than another discussion.
**Close this out when there is a verdict** — if nobody moves off B, delete the control and the
setting rather than leaving three modes to maintain forever. See the **Bugs** entry for the
mechanism and **TAB-RESUME-MODE-01** for how to test it.

---

### D18 — LOCKED (option A, 2026-08-27) — When loading settings fails, four values keep whatever was on screen. Bug or intent?

**Locked in the maintainer's word: A.** So a failed read shows defaults — all of them, no
exceptions. Implemented the same day: the four missing resets (reply language, both model
routing orders, spoiler auto-reveal after consent) were added to the failure branch in
`usePluginSettings.ts`. The two routing orders reset to **empty**, matching where they start,
because an order is worked out from the models the machine actually has and there is no static
default to fall back to.

**On the test, and an honest limit.** The reset only runs from the mount effect, and by the time it
can fire the values are already sitting at their defaults — so no test that drives the hook can tell
a complete list from an incomplete one. What broke here was not a wrong value, it was **a list that
drifted**: six hand-written copies of the same field list in one file, and four fields fell out of
one copy. So the test checks that invariant directly, by comparing the two lists in the source:
anything the successful-load path sets, the failure path must reset. It fails with exactly those
four names on the old code. When D14 collapses the duplication, that test goes with it.

**Which also means the fix is currently invisible.** It is correct, and today nothing can reach the
state where it matters. It becomes reachable the moment anything restores settings before the load
resolves — which the session-survival path already does a few lines away.

**Original question, rewritten in plain language 2026-08-27 at the maintainer's request; nothing
about it changed.**

**The short version.** When the plugin cannot read your saved settings, it deliberately blanks the
Settings screen back to factory values, so you are never shown a setting it could not actually
confirm. It blanks 40 of them. Four are missed, and no note anywhere says whether that was on
purpose. Those four are: **reply language**, the **two model try-orders** (text and vision), and
**auto-reveal spoilers after you have consented**.

**What you would actually see.** Almost certainly nothing, almost all of the time. This only runs
when reading the settings file fails, which on a healthy Deck does not happen. And on a fresh open
those four are sitting at their factory values anyway, so blanking them would change nothing
visible.

The one case where it bites: the read fails *after* a successful one — say the plugin's back end
restarts while you have the menu open. Then the screen keeps showing your reply language and your
model try-order, looking saved and settled, when the plugin has just admitted it cannot read them.
Everything around them has snapped back to factory. So the screen is telling you two different
stories at once, and the four that stayed are the ones you would be least likely to doubt.

**Nothing tests this either way**, so today there is no record of which behaviour was intended.

**Your choices.**

**A. Blank those four too, and add a test.** *(my recommendation)* Then a failed read means one
simple thing — the screen shows factory values, all of them, no exceptions — and it is the same
answer every time. The test is what stops the list quietly drifting apart again, which is how this
happened in the first place.

**B. Leave them out on purpose, and write down why.** Reasonable if there is a real reason — for
instance, a model try-order is worked out from what your machine actually has, and showing a stale
one may genuinely beat showing an empty one. It just needs a sentence saying so, or the next person
to read this file files the same question again.

**C. Stop blanking anything on a failed read.** Honest if you think a failed read should simply
leave the screen alone. It is the biggest change of the three, and it means a failure looks
identical to everything being fine — which is the thing the current behaviour is trying to avoid.

**Worth knowing:** this is a symptom, not its own problem. The same list of settings is written out
by hand **six times** in one file, and these four fell out of one copy. Fixing that duplication is
already the top item from the friction test (D14) and would remove the whole class of mistake. But
that work is not scheduled, and this is live behaviour, so it is worth answering on its own.

---

### D19 — Can you reach the strategy corpus without the game running?

**LOCKED 2026-08-17**, raised during the KB QA sweep. **Implemented 2026-08-19**; on-Deck QA
owed as KB-NEWTITLE-01.

> **Two things the implementation turned up, both fixed with it.** A canonical title carrying
> punctuation never matched its own normalised form — `normalize_alias` strips the colon in
> *The Legend of Zelda: Ocarina of Time* while `lower(canonical_title)` keeps it — so OoT
> resolved to nothing and fell through to the genre card. And the spoiler profile this decision
> requires was unreachable by name: `resolve_title_spoiler_profile` only knew AppIDs plus a
> single hard-coded title, so a text-resolved OoT fenced as `unknown`. Both languages now carry
> the name tables, moved together with the shared contract that caught it.

**What's going on.** `should_retrieve_knowledge`
([knowledge_base_service.py:136](../../py_modules/backend/services/knowledge_base_service.py))
has three ways through, and **every strategy path requires `app_id` or `app_name`**:

```python
if mode == "strategy" and (aid or aname):  return True, "strategy"
if <compat topic router matches>:          return True, "compat"
if aid or aname:                           return True, "strategy"
return False, ""
```

With no running game the only door is the troubleshooting router, so all strategy content is
unreachable however explicitly the user names the title. Measured on device 2026-08-17 against
the published `2026.08.16` corpus: `hl2 ravenholm` and `drg survivor what class` both return
`gate=False` in **Speed and Strategy alike**, while `ravenholm` with Half-Life 2 running
retrieves the Ravenholm card normally. The corpus is fine; nothing asks it.

**This is a bug, not a design choice.** `KB-NEWTITLE-01` in [testing.md](../testing.md) already
specifies the opposite as expected — *"with no game running, ask something naming a title
(`hl2 ravenholm`, `drg survivor what class`) and confirm the right game's cards attach and no
other game's do."* The behavior was documented and never implemented.

**The machinery already exists.** `_resolve_game_id` (`:222`) resolves app_id → alias table →
canonical title, and the alias table already holds `hl2`, `oot`, `drg survivor`, `portal 2`.
It is only ever handed `app_id` / `app_name` / `shortcut_name` — never the question text.

**Locked shape.** Scan the question against the alias table as a **last resort** in the gate,
only when `aid` and `aname` are both empty, so it can never override a running game. Word-boundary
match, longest alias wins (`portal 2` beats `portal`). `BM25_RELEVANCE_FLOOR` still applies, so a
title mention alone does not force a card.

| Question | Locked answer |
|---|---|
| Does a text-resolved title apply that game's spoiler profile? | **Yes** — and fence spoilers as best we can. Asking about OoT by name gets OoT's progression fencing, same as if it were running |
| Minimum alias length on this path? | **3 characters.** Excluding 3-char aliases would fail `hl2 ravenholm`, which is the documented test case this fixes |

**Known risk, accepted.** Short aliases appear in ordinary sentences — *"this game is hades on my
battery"* would wrongly resolve Hades. The relevance floor catches most, not all. Revisit if QA
shows real-world false positives; do not pre-emptively widen the denylist without evidence.

---

### Maintainer decisions locked — 2026-08-02

The options above stay as the decision record. **Locked below** is what we are
doing and why. Where a locked call disagrees with an earlier recommendation in
**D1–D6**, the locked call wins — some premises were corrected after reading the
current tree (especially **D1b** and parts of **D2** / **D4**).

| Id | Locked decision | Why |
|----|-----------------|-----|
| **D1** | **Finish both missing RPCs** — `merge_pulled_tags_into_routing_orders` and `get_session_rag_chip_candidates` | Both are wiring gaps, not greenfield features. Routing merge reuses `merge_pulled_tag` / `sanitize_model_routing_order` for `text_model_routing_order` and `vision_model_routing_order`. Session RAG already has `suggest_chip_candidates` + tests in `knowledge_base_service.py`; only the public RPC adapter on `class Plugin` is missing. Restores intended UX without reopening Phase 4 visibility / Phase 5 vector ranking. |
| **D2** | **Targeted dead-code cleanup** — delete confirmed orphans; **archive** tiny-model thinking code; keep active Ask, debug, and KB-cancel paths | Proton journal RPCs + service, `apply_tdp` (+ its test-only caller), `log_navigation`, and legacy `capture_screenshot` are safe to remove after preview-suite grep. **`ask_game_ai`** stays — preview suite drives it. **`ask_ollama`** stays — every Ask calls it internally. **`dbg_fe_log`** stays — intentional on-Deck debug bridge. **`cancel_rag_corpus_download`** stays — backend cancel path exists; UI Cancel is planned (**D2 follow-up**). ***Follow-up shipped 2026-08-05 as execution-order step 9** — keeping it was the right call; the button was missing, not the code.* **`thinking_tiny_model_service.py`** is **deleted outright** in `c8ed045`; git history is the archive. To restore the tiny-model thinking blurbs: `git show c8ed045^:py_modules/backend/services/thinking_tiny_model_service.py`. An in-tree archive folder was rejected — the file would still surface in greps and still need explaining, which defeats the point of the cleanup. |
| **D3** | **Option A — characterization tests first, then refactor** | `index.tsx` and `useBonsaiAskOrchestration.ts` have zero automated coverage; `npm test` would pass if every component were deleted. `fakeDeckyRpc.ts` + existing hook tests prove the pattern. Preview and on-Deck QA still required for D-pad and layout. |
| **D4** | **Prune by policy, not by folder count** | Keep evidence linked from current or archived QA docs; keep the latest useful pass per tier and meaningful failure runs. Audit links before deleting anything. Remove only duplicate, incomplete, or truly unreferenced generated runs. Add a retention rule so future `--write` runs do not grow `docs/test-evidence/` without bound. **Executed as step 10, 2026-08-05 — and "prune by policy, not by folder count" is exactly what saved it.** The link audit the decision demanded found the audit's own premise wrong: 10 of 13 **runs** were referenced, not 3 of 9 folders, so a folder-count prune would have deleted cited evidence and a 4-failure run. 3 runs / 9 files removed; retention now lives in `run-preview-suite.mjs`. |
| **D5** | **Option A — keep the built-in import graph** | Fast, no dependency, runs on every commit, and matches today's relative-import-only `tsconfig`. Revisit only if path aliases land, unresolved internal imports appear, or a parser-based tool finds real discrepancies. |
| **D6** | **Sequencing below** | Fix real user-visible gaps before shrinking/refactoring; build the safety net before the risky split; measure handoff friction on the improved tree. |
| **D7** | **Delete both screenshot helpers** | `_reencode_oversized_capture` and `_mirror_capture_to_plugin_dir` have no production callers; `_mirror_capture_to_plugin_dir` is an explicit deprecated no-op. One unit test still calls `_reencode` — remove it with the function. Consistent with D2 cleanup; module has behavioral coverage via `_finalize_steam_capture_file`. |
| **D8** | **Harden `build.ps1` (prune + verify)** | Windows deploy path merges without pruning and prints success without checking the artifact landed. `build.sh deploy` already wipes the plugin dir — fix `build.ps1` (and `watch-deploy.ps1` by inheritance): remove stale files, compare `dist/index.js` hash or mtime after upload, fail on mismatch. Blocker before step 8. |
| **D9** | **Done = step 8 (`index.tsx`) only** | Finish the state-before-JSX plan. `useBonsaiAskOrchestration.ts` (1222 lines, 13 characterization tests) and `MainTab.tsx` (187 lines, prop-threading tax) are follow-ups after step 8 — splitting them now fights the locked order. **Amended 2026-08-03 (D14):** the "~700–800 lines" figure here was an unmeasured estimate and is **withdrawn**. Step 8 closed at **1291**; what remains is prop threading that only a rewrite would shrink. |
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
> ordinal. Nothing linked either file, so the rename was safe. **2026-08-03:** planning answers
> (Q1–Q8) now live under `docs/planning/` with question-number prefixes; refactor recon stays in
> `docs/audit/`.

#### Execution order (locked, amended 2026-08-03)

1. **Record decisions** — this section; turn accepted work into implementation rows as work ships. *(done — `dcbcccf`, `e2111f9`, plus this amendment)*
2. **D1 — wire both RPCs** — **done 2026-08-02**, see Bugs § *Fixed*. D1a routing merge (`510139d`) and D1b session RAG adapter, 13 new unit tests between them. On-Deck QA still open: **ROUTING-MERGE-01** and **SESSION-RAG-CHIPS-01** in [testing.md](../testing.md). **This is feature work, not refactor** — separate commits, not labeled behavior-preserving, and it changes what `useBonsaiAskOrchestration.ts` does at runtime. Sequenced before step 5 on purpose so the characterization tests capture intended behavior rather than the silent-fallback bug.
3. **D2 — targeted cleanup** — **done 2026-08-02** (`309c386`, `ebdc0f2`, `c8ed045`, `45cb0ff`, `d93027b`, `36f34cd`). Removed: 5 Proton-journal RPCs + their service, `thinking_tiny_model_service.py`, `log_navigation`, `capture_screenshot`, and the TDP sysfs write path. Kept per D2: `ask_game_ai`, `ask_ollama`, `dbg_fe_log`, `cancel_rag_corpus_download`. RPC surface 57 → 50. Two things the audit got wrong are recorded in [05-plan.md](05-plan.md) §1.1: the journal service was not dead (`clear_plugin_data` needed its file wipe) and `find_amdgpu_hwmon` was not apply-only (`read_current_tdp_watts` calls it). The kmsgrab orphans this pass left behind were cleared later the same day under **Cleanup candidates** (`4a26cfa`).

   **Preview-suite gate — first pass was incomplete.** Grepping `tests/preview-suite/` and `scripts/` for *symbol* names returns zero hits for `proton_experiment`, `apply_tdp`, `log_navigation`, `capture_screenshot`, `dbg_fe_log`, `cancel_rag_corpus_download`, `thinking_tiny`, and 22 hits for `ask_game_ai` across five tiers (keep, per D2). **That grep missed file-level references.** `tests/preview-suite/unit-gates.json:25` runs `tests/test_tdp_sandbox_sysfs.py` by filename under a gate tagged `TDP-APPLY`, and `tier-manifest.json:96` advertises "sysfs TDP apply + clamp asserts" in the Tier 2 description. Only two test files are referenced this way — the other is `test_capabilities.py` — so no other deletion in this pass was affected. **When checking whether a deletion is preview-safe, grep the preview suite for the test filename as well as the symbol.**
4. **Mechanical refactors** — **done 2026-08-02** (`3813764`, `666e3e3`, `2156441`, `ef65f8e`), one behavior-preserving commit each, all gates green between. Four stale doc claims fixed and the self-declared-archived RAG analysis moved to `archive/`; `refactor_helpers.py` shim deleted and its 9 importers repointed; `settingsAndResponse.ts` barrel deleted and its 22 importers repointed (`tsc --noEmit` is the safety net here); `settingsPayload.ts` split, with reply-text formatting moved to `appliedTuningText.ts`.

   **Deploy gate — passed, and it mattered.** The shim was referenced by `build.sh`, `build.ps1` and `verify-decky-plugin-zip.sh`, none of which any test covers. Deployed to the Deck and confirmed `bonsAI plugin loaded!`. **The first load proved nothing**: the deploy scripts copy without pruning, so the deleted shim was still sitting on the Deck from an earlier deploy and would have satisfied any import that had been missed. Deleting it plus `__pycache__` on-device and restarting `plugin_loader` is what made the check real. See [05-plan.md](05-plan.md) §1.3 — **any future deletion of a Deck-facing Python file needs the same step.**
5. **D3 — safety net** — **done 2026-08-02.** 22 new tests (suite 217 → 239): `useBonsaiAskOrchestration.test.ts` covers submit guards, request payload, the invalid / blocked / completed / thrown-error branches, polling, cancel, and thread archiving; `index.test.tsx` covers the Decky contract, a real mount, settings wiring, the tab set, and error containment. Both **mutation-checked** — three deliberate breaks in each turn the suite red — because a characterization test that cannot fail is worse than none. Three harness defects had to be fixed first and are recorded in [04-coverage.md](04-coverage.md): vitest collected only `*.test.ts` so **a `.tsx` test could never run**, jsdom lacks `ResizeObserver` so the tree silently rendered the ErrorBoundary fallback, and `globals: false` left renders leaking between tests.
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
   **DEPLOY-VERIFY-01…03** in [testing.md](../testing.md).

5d. **D7 — delete screenshot helpers** — **done 2026-08-03.** `_reencode_oversized_capture`
   and `_mirror_capture_to_plugin_dir` removed from `screenshot_media.py`. Preview gate run
   on **symbols and the test filename** per the step-3 lesson: clean. The `_reencode` unit
   test asserted "a file that needs no work is returned untouched"; that assertion is folded
   into `test_finalize_steam_capture_file_passes_through_missing_file`, which covers the
   equivalent guard on the live function ([screenshot_media.py:245](../../py_modules/backend/services/screenshot_media.py))
   and was previously untested. Python suite stays at 413.

   **Left alone deliberately:** `take_steam_game_screenshot` still declares a
   `plugin_runtime_dir` parameter that nothing in its body reads — it was the mirror
   helper's argument. Dropping it changes a public signature, which is not what D7 authorized;
   it belongs with the step-6 `main.py` inventory pass.

6. **2.3 — `main.py` extraction investigation** — **done 2026-08-03**, read-only, no code
   changed. Inventory: [07-mainpy-inventory.md](07-mainpy-inventory.md).

   **Answer to §2.3's question ("thin facade or logic in both layers?"): both, and not where
   the file claims.** By count it reads as a facade — 27 of 96 methods are ≤8 lines. By
   volume it is not: the six largest public RPCs are **706 lines, 24% of the file**, and ten
   methods hold 869 lines (29% of the file in 10% of its methods). Split: 1767 lines across
   the 50 public RPCs, 895 across 46 private helpers, ~210 in imports and class constants.

   **One outright contract violation.** `main.py:6` says the file *"Does not: Own Ollama
   HTTP"*. `test_ollama_connection` ([main.py:1038](../../main.py), 178 lines) is the only
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

   **The shim had a service-side half** that [07-mainpy-inventory.md](07-mainpy-inventory.md)
   had not found: [ollama_ask_service.py:81](../../py_modules/backend/services/ollama_ask_service.py)
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
   knowledge-base paths is still open** — **D11-SHIM-01** in [testing.md](../testing.md).

7. **Settings single source of truth — COMPLETE 2026-08-03** — REFACTOR-PLAN §3.1, the highest-value item in the audit and the best-covered by existing tests (`tests/test_settings_service.py` asserts per-setting round-trips). Expect that suite to break on shape, not behavior — rewrite the assertions, do not contort the design. Shipped as **7a–7d** below. *(This header was reconstructed 2026-08-04: the reorg dropped the numbered `7.` entry and left its tail glued to the end of 7d.)*

7a. **2.2 — settings recon + drift guard** — **done 2026-08-03.** The audit deferred this
   design deliberately ([05-plan.md](05-plan.md) §2.2: *"Do not design the shared-schema
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
   intentional immersive gate, documented in [tests/contracts/README.md](../../tests/contracts/README.md).

7d. **D12 — TypeScript field table** — **done 2026-08-03.** The mirror of step 7b.
   `SIMPLE_FIELDS` in [bonsaiSettingsNormalizers.ts](../../src/data/bonsaiSettingsNormalizers.ts)
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

~~**Not yet deployed.**~~ **Smoked on-device 2026-08-04.** Steps 7a–7d were verified by `tsc`,
263 frontend tests, 418 Python tests, `npm run build`, and two differential tests, and the Deck
was asleep when the deploy was first attempted. The step 12 deploys on 2026-08-04 carried this
code and logged `bonsAI plugin loaded!` with zero `Traceback`/`ERROR` — and settings load on
every plugin start (`_main` → `_maybe_app_log` → `load_settings` → `sanitize_settings`), which is
exactly the smoke this note asked for. **Not covered by that:** no on-device pass has exercised
*changing* a setting and reading it back through the new tables. **D11-SHIM-01** remains Partial
for the same reason — its RPC probe passed, its UI pass did not run.
8. **D3 — entry-point split — COMPLETE 2026-08-03** (`index.tsx` **1955 → 1291**, closed at
   Option A of **D14**). Everything below shipped behavior-preserving with gates green between
   commits. **Remaining work is on-Deck QA, not code**: the four-modal D-pad batch
   (**MODAL-EXTRACT-01…04**) and the **SHELL-PAYLOAD-01** smoke.

   **QA status update 2026-08-04.** The modal batch is **Verified** — all four reached by D-pad,
   **B** closes cleanly, each returns to the tab it was opened from, and LB/RB kept focus in the
   same pass ([testing.md](../testing.md) **MODAL-EXTRACT-01…04**). It also surfaced the two gaps
   now filed under Bugs: focus is not restored *within* a tab after a picker closes, and the tab
   itself was not remembered across a reopen (**D15**). **SHELL-PAYLOAD-01 is still Open** and is
   the only refactor QA left; the paragraphs below still read as if neither had been run.

   **Modals done 2026-08-03**, `index.tsx` **1718 → 1522** across four gated commits (`e7728fa`, `6cd0b93`, `fdc669a`, `5cb7707`). All four now live in `src/features/plugin-shell/` as hooks: plugin-help, desktop-note save, character picker, Ollama models hub. **`index.tsx` no longer references `showModal` at all** — the shell opens no Decky modal directly. **On-Deck D-pad pass for the four modals is due in one batch** per **D10**; deployed and loading clean, so it can be run against real code.

   **Two roadmap estimates were wrong, in opposite directions.** The state items are much smaller than listed — `error-capture` and `UI-scale` were **already extracted** into `useCapturedFrontendErrors` and `useUiScaleProfile` before this session, so what remains of "connection/IP, session-reset, UI-scale, error-capture" is roughly **15 lines**: three `useState`s (`ollamaIp`, `ollamaTabResetKey`, `lastConnectionStatus`), one memo, and a one-line `uiScaleApplyToken`. Those three cohere as one Ollama-connection concern and are worth one small hook, not four commits. The modals were the real win and were listed last.

   **Found while extracting — three inconsistencies and a redundant dependency array.** The four openers each combined the same two lifecycle steps differently: plugin-help captured the session *and* set the return-tab ref, desktop-note set the ref *without* capturing, character picker captured *without* setting the ref. All preserved exactly and now commented where a reader would ask. Having them in one directory is what made it visible. Separately, `openCharacterPickerModal` carried a **32-entry dependency array of which 22 were never read in the body** — redundant, because `buildSettingsPayload` is memoized on the settings snapshot and its identity already changes when any setting does; the hook lists the 10 real deps, matching what `onCommitOllamaModelsHub` and the step-5b `useRoutingOrderModal` already did. `openOllamaModelsHub` was also missing two deps it used.

   **Gate note:** `npm run test:preview` **cannot run headlessly** — buckets C/D need Decky's preview open in Cursor (`preview-state.json` missing → `IPC timeout for callTestHook`). `npm run test:preview -- --tier=preGate` does run and was green (2/2) on every commit; that is the runnable portion of the D10 preview gate here.

   **State slice and all six payloads done 2026-08-03**, `index.tsx` **1522 → 1291** across
   four more gated commits. `useOllamaConnectionState` took the host/connection slice; the six
   tab payloads moved to `src/features/plugin-shell/tabs/`. Each payload hook derives its
   argument type from the tab component's own props (`React.ComponentProps<typeof Tab>`), so a
   prop added to a tab cannot drift from its payload. Derivations that served exactly one tab
   moved with it: the two layout constants, `isQamSetting` and the whole AI-character avatar
   block went to the Main tab, the `saveIp` binding and the remount key to the Ollama tab, and
   the three project links to About. `index.tsx` no longer imports `MainTab`, `SettingsTab`,
   `OllamaTab`, `PermissionsTab`, `DeveloperTab`, `AboutTab` or `characterCatalog`.

   **The 700–800 line target is not reachable this way, and the estimate should be corrected
   rather than chased.** At 1291 lines the remaining bulk is not JSX; it is prop threading —
   the ~85-line `usePluginSettings` destructure, the ~90-line `settingsSnapshotForSave` memo
   that lists all 40 settings twice, the ~65-line session-survival snapshot, and the ~55-line
   preview-hook registration. Moving those into files does not shrink them; **collapsing** them
   does, and that means passing grouped objects instead of 40 named locals — a rewrite, not a
   move, which rule 1 keeps out of this step. The cheapest real win left is having
   `usePluginSettings` return `settingsSnapshotForSave` itself, since it already owns all 40
   states: about 90 lines, and it removes a list that is currently duplicated by hand. That is
   step 7 territory (settings SSOT), not step 8. **Locked as D14 Option A** — the estimate is
   withdrawn, step 8 closes at 1291, and that 90-line collapse is unscheduled. D14 also records
   the cost: **net +565 lines across `src/`**, exactly the lateral trade step 5b predicted.

   **Gates on every commit:** `tsc`, 268 frontend tests, preview `preGate` 2/2, `npm run build`.
   The Main tab move was additionally checked prop-for-prop against the previous commit: 95
   props, identical set and order. **On-Deck:** the four modal extractions still owe their D-pad
   batch per **D10**; the state and payload commits add no new control, so they need the
   **SHELL-PAYLOAD-01** smoke rather than a full pass. **Found while extracting:** a pre-existing
   token-streaming defect, filed under Bugs — the Main tab memo never sees the smooth-reveal
   frames, and its premise contradicts audit item W4.
9. **KB download Cancel button — done 2026-08-05.** `cancel_rag_corpus_download` is wired in
   `KnowledgeBaseSection.tsx`; **KB-CANCEL-01** rows added to [testing.md](../testing.md) and
   [testing-manual.md](../testing-manual.md). This is the **D2 follow-up** the cleanup pass
   deliberately kept the RPC for — D2 called it *"a missing feature rather than dead code"*, and
   that reading was right.

   **It closed a focus dead end, not just a missing button.** While a download runs the primary
   button is `disabled` and Remove is not rendered, so the action row held **no focusable control
   at all** — the D-pad could not enter it, and the only escape from a ~5 GB download was closing
   the plugin. Cancel takes the row's second slot for the duration, which gives it exactly one
   stop. The parent's up-path (`focusKbUpFromReplyVerbosity` in `OllamaTab.tsx`) now tries Cancel
   **first**, because during a download a ref to either of the other two buttons focuses nothing.

   **A wart the wiring exposed, fixed here.** The backend writes the unwinding exception into
   `error` even when the user asked for the stop
   ([rag_corpus_download_service.py:344](../../py_modules/backend/services/rag_corpus_download_service.py)),
   and `get_rag_corpus_status` spreads that state, so a cancel would have rendered raw exception
   text in failure red. The section now shows a neutral cancelled line and keeps red for real
   failures. Frontend-only — the backend was not touched.

   **6 tests** in `KnowledgeBaseSection.test.tsx`, the first automated coverage this component has
   had, plus the five KB methods added to `fakeDeckyRpc`'s registry (they were invoked from `src/`
   but missing from a list that claims to track exactly that). **Mutation-checked**: never
   rendering Cancel, dropping the double-press guard, and treating a cancel as an error each turn
   the suite red. Gates: `tsc`, **366** frontend tests (57 files), 497 Python, `npm run build`,
   preview `preGate` 2/2. **On-Deck QA is what remains** — **KB-CANCEL-01**.
10. **D4 — evidence hygiene — done 2026-08-05.** Link audit first, as D4 required, and it
    **overturned the premise the decision was written on.**

    **The audit ([06-doc-triage.md](06-doc-triage.md) § Prune stale evidence) searched
    `testing.md` only.** The archived QA docs cite evidence heavily, at individual
    case-manifest level. Counting whole **runs** (`tier/date-sha`) rather than tier folders:
    **10 of 13 runs referenced, 0 broken links** — not "96% unreferenced". The unit that is
    cited is the run, and the folder count was never the right denominator.

    **Pruned: 3 runs, 9 files.** All unreferenced *and* carrying no signal — the two tests D4
    asked for, applied together. `hookSmoke/2026-05-26-9e20a82` and
    `hookSmoke/2026-06-09-a9237e4` both failed with `Error: IPC timeout for callTestHook`,
    which is the preview harness being unavailable headlessly — the same limitation step 8
    recorded — so they are not the "meaningful failure runs" D4 protects.
    `deckOnly/2026-06-09-9e20a82` skipped all three cases. **What that deletion would have
    destroyed is now written down** in [testing.md](../testing.md#evidence-retention):
    `HOOK-smoke-setTab` has never produced a real result in this tree. Kept, explicitly:
    `tier2Deep/2026-06-09-9e20a82`, 7 pass / **4 fail** — a meaningful failure run whose cases
    no doc names, which a naive orphan sweep would have taken.

    **Retention is now a mechanism, in `scripts/run-preview-suite.mjs`.** Keeps the 3 newest
    runs per batch; never deletes a run cited by any `docs/**/*.md`, since evidence is linked
    by path and deleting a cited run turns a link into a lie; never deletes the run the current
    invocation just wrote. All three branches were exercised against planted folders — delete,
    keep-because-cited, keep-because-current — not just the happy path.

    **Found while doing it — the batch summaries lie, and two in the tree prove it.** The run
    folder is keyed by date + sha only, so a `--filter` re-run on the same day and commit lands
    in an earlier full run's folder and `writeBatchSummary` replaced the roll-up wholesale.
    `tier2/2026-05-26-9e20a82` records **1** result beside **8** case directories — and
    [archive/testing-failures-2026.md](../archive/testing-failures-2026.md) independently calls
    that batch *tier2 (8/8)*, which is the corroboration; `tier2Deep/2026-06-09-a9237e4` records
    1 beside 11. Summaries now merge per scenario id and report `ranThisInvocation` /
    `carriedFromEarlierRun` so a filtered run is legible as one. Mutation-checked by restoring
    the replace-wholesale line: the bug reproduces exactly (`total=1`), and the fix restores
    `total=2`. **The historical summaries were left as they are** — rewriting recorded QA output
    to match a later theory is not evidence hygiene; the caveat is documented instead.
11. **Deferred friction test — done 2026-08-05. [03-friction.md](03-friction.md).**
    Three cold readers, one task each, chosen to probe step 7 (settings), step 8 (feature
    slices) and step 12 (the RPC boundary). Two completed their plan; **one was blocked** —
    `docs/glossary.md` never defines "card", which turns out to be a column name on three
    different tables that the docs and UI use inconsistently.

    **The overlap is the work list, and the top item confirms D14 from the outside.** Two of
    three runs put hand-maintained field and prop lists first, at HIGH cost, in different
    subsystems: one boolean setting is **~18 files and ~30 edit points** — the normalization
    tables really are one row per language, but `usePluginSettings.ts` restates the field list
    **7** times, `index.tsx` **5**, each payload hook **3** — and threading one flag to a
    component passes two silent gates (`presetChipsPropsEqual`, a `useMemo` dep array) where a
    miss compiles, passes tests, and does nothing on device. D14 called this *"prop threading
    that only a rewrite would shrink"* and closed step 8 on it; readers who had never seen D14
    independently ranked it the single largest cost. **The D14 Option B/C collapse now has
    evidence behind it rather than taste.**

    **It also found live defects.** `docs/roadmap.md:23`'s fix lean for the preset/KB bug was
    incomplete in a way that would have shipped a *worse* bug — it names two samplers and misses
    `getRandomPresetExcluding`, which re-draws chips on a 60-second timer, so the fix would have
    regressed within seconds of mount. Verified in code and corrected. `CLAUDE.md` was still
    routing maintainer questions to `docs/roadmap.md` § *Decisions needed*, moved out of that
    file by the reorg — **the link audit two steps earlier reported zero broken links because it
    checked markdown links and heading anchors, not prose references to section names.**

    **And it caught the same-day work.** CLAUDE.md's settings counts — 19 / 26 / 19 — were
    written hours earlier during a pass whose purpose was fixing stale numbers. They were copied
    from this file, accurate on 2026-08-03, and never counted against the tree; the real values
    are **20 / 28 / 21**. The staleness-fixing pass reproduced the failure it was fixing. That is
    the strongest argument the exercise made for itself.

    **Kept, explicitly:** all three runs praised the module header convention unprompted and used
    it to skip reading bodies; run A called the shared two-language settings contracts *"the best
    thing in this repo"*, which is step 7a's payoff confirmed by someone who did not know it
    existed. Recommended next actions are ranked at the end of
    [03-friction.md](03-friction.md); items 3–5 are one-line doc edits that clear the blocking
    failure and two MEDIUM findings.
12. **`main.py` extractions — COMPLETE.** Items 1, 2, 4 and 5 executed 2026-08-03; item 3
    **dropped** 2026-08-04 by maintainer call (reasoning below). `main.py` **2865 → 2750**, with
    **66 new Python tests** where these paths had almost none. One commit each, suite green
    between. Remaining work is on-Deck QA, not code.

    | Item | What moved | Where | Tests |
    |---|---|---|---|
    | 1 | Background-request state shape | `background_request_state.py` | 20 |
    | 2 | Ollama health probe (`/api/version`, `/api/tags`, `/api/ps`) | `ollama_service.py` | 22 |
    | 4 | Cancel-and-await, from 5 teardown sites | `async_task_lifecycle.py` | 8 |
    | 5 | Stop-button transport (close handle, spawn unload) | `ollama_service.py` | 9 |

    **`main.py` no longer imports `urllib`** — item 2 resolved the header contradiction the
    inventory called its one clear contract violation. Every new test file is mutation-checked.

    **Item 3 — dropped 2026-08-04 by maintainer call. The list is now 4 of 4; step 12 is
    complete as scoped.** The reasoning, kept as the record: the
    three blocks (sanitizer / shortcut / VAC) look identical but differ in a column that is not a
    value: `shortcut_setup` is *omitted* for sanitizer, *taken from the handler's return* for
    shortcut, and *explicitly None* for VAC. A table would need a three-way mode enum with one
    mode per row, which relocates the difference rather than collapsing it — and it would put a
    `getattr`-by-name indirection on the Ask admission path, the highest-traffic code in the
    plugin, to save about 17 lines. Refactor rule 2 wants 3+ call sites that *collapse*; these
    three do not. If it is ever reopened, the honest version is a small helper for the
    `handled is not None` / `resp = str(...)` preamble — ~12 lines, and the dispatch stays
    readable. **Do not re-propose the table** without new evidence; this is the second time the
    three blocks have been read as duplication that turned out not to be.

    **One defect found while extracting and fixed separately 2026-08-04** — a finished voice
    install surviving *Clear all plugin data*, now `_reset_voice_install_after_clear` with 6
    tests, two of which fail against the old code. It was filed under Bugs first and fixed in its
    own commit rather than inside a behavior-preserving move. Separately, a first draft of item 2
    hardened `/api/ps` parsing per-row; that was reverted for the same reason and the original
    all-or-nothing behavior is now pinned by a test.

    ~~**Not yet deployed.**~~ **Deployed and verified 2026-08-04**, superseding the note below.
    **MAINPY-EXTRACT-01 is Verified**: 54 files hash-verified on the Deck, `bonsAI plugin loaded!`
    with zero `Traceback`/`ERROR`, `probe_deck_rpc_surface.py` 21/21 and a new
    `probe_deck_step12_extractions.py` 14/14 — including the moved Ollama probe against the real
    on-Deck runtime and a **real streaming Ask aborted mid-flight**, which is the path item 12.4
    moved. **VOICE-CLEAR-01 stays Partial**: the backend reset is verified on-device, the UI half
    (Settings → Voice input after a real *Clear all plugin data*) is not. See
    [testing.md](../testing.md). Original note, kept for the record: *All four extractions plus the
    voice fix are verified by 492 Python tests only; none has run on-device. Item 5 changes the
    Stop path, item 4 changes plugin unload, and the voice fix changes* Clear all plugin data *— all
    three want a real on-Deck check.*

    Original entry: the ranked list in [07-mainpy-inventory.md](07-mainpy-inventory.md) §8, **identified 2026-08-03**. Item 6 (the D11 shim) was pulled ahead and is done; 1–5 are not: background-request state shape (~60 lines, LOW), `test_ollama_connection` transport → `ollama_service.py` (~70, LOW-MED — the only outright contradiction of `main.py`'s own header), local-command dispatch table (~40, MED), `cancel_and_reset` for `clear_plugin_data` (~45, MED), `abort_background_game_ai` transport (~25, MED). ~240 lines against a 2865-line file that is still the #1 hotspot by nearly 3×.

    **Sequencing needs a call.** §8 said items 1–2 were *"worth doing before step 7"* — step 7 shipped without them, so that guidance already lapsed once; items 3–5 were gated on *"after step 8"*, which is now. Nothing here is blocked, and nothing above is blocked on it. **Note the coverage cost before starting:** none of the ten largest `main.py` methods has a behavioral test (§9), so unlike step 8 there is no safety net — `test_merge_pulled_tags_rpc.py` and `test_session_rag_chip_candidates_rpc.py` are the only worked examples of testing a `class Plugin` RPC directly and are the pattern to copy. Expect *write the test first* to be most of the work for items 2–5.

**Phase 5 — done 2026-08-07.** [08-postmortem.md](08-postmortem.md) and
[09-prevention.md](09-prevention.md), written as two passes because folding them together
makes the mechanisms go vague. **Numbered 08/09, not the 07/08 REFACTOR-PLAN specifies** —
`07-mainpy-inventory.md` already held that ordinal.

The postmortem dates each structural problem from git rather than asserting it: the two
backend-less RPCs were live for **15 and 16 days** (`8b4be92` / `ac2c738` → `510139d` /
`a6213b8`), and `vitest.config.ts` shipped `include: ["src/**/*.test.ts"]` **at creation**
(`da028a6`, 2026-05-23), so a `.tsx` test could never run for **71 days**. The workflow
section names multi-concern commits as upstream of both — `da028a6` bundled that config
with jarring-redraw fixes, a recording prototype and an easter egg.

**Prevention adopts 7 checks and rejects 4**, ranked by problems-prevented ÷
friction-added. Top three: RPC-name cross-check (the only one that would have stopped a
user-visible defect, and `rpc-map.json` already supplies the data), test-collection
completeness (a dozen lines), and doc link/anchor validation. **Rejected on principle:**
enforcing one concern per commit — the strongest signal in the postmortem and the one
with no honest mechanism; enforcing vocabulary; and turning on the React dep-array lint,
which would make the duplication permanent by making it safe when the real fix is
derivation. Also rejected: doc "last reviewed" stamps, which are discipline wearing a
mechanism's clothes.

**Two findings landed on this refactor's own work.** Correcting CLAUDE.md's stale counts
introduced three fresh wrong ones (19/26/19 for 20/28/21) by copying a doc accurate four
days earlier — which is why prevention item 6 is *generate the numbers*, not *check them*.
And the first run of the link checker produced **38 false positives** from one file by not
stripping `:NNN` line citations; that calibration requirement is now written into the
proposal, because a gate that fires 38 times on day one is switched off on day one.

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
   test *files*. Grep both. ([05-plan.md](05-plan.md) §1.1)
4. `vitest.config.ts` collected only `*.test.ts`, so a `.tsx` test **could never
   run**. The 44 untested component files were a tooling gap, not a discipline
   gap. ([04-coverage.md](04-coverage.md))

**Outstanding on-Deck QA from this session:** **ROUTING-MERGE-01** in
[testing.md](../testing.md) — implemented and unit-tested but never exercised on a
Deck. **SESSION-RAG-CHIPS-01** closed 2026-08-03: verified end-to-end in the UI
once the `settingsLoaded` race was fixed (see [Bugs](../roadmap.md#bugs)).

**Corrections to audit premises (for implementers):**

- **D1b:** `suggest_chip_candidates` ([knowledge_base_service.py:685](../../py_modules/backend/services/knowledge_base_service.py)) and `session_rag_chip_candidates_to_rpc` (`:744`) already exist with four tests in `tests/test_knowledge_base_service.py`. **`main.py:163-164` already imports both and never calls them** — the work was interrupted between the import and the method. The frontend sends `[appId, appName, shortcutName]` ([sessionRagChipCandidates.ts:55](../../src/utils/sessionRagChipCandidates.ts)), which matches the service signature exactly. This is an adapter of roughly ten lines. Do not redesign ranking before wiring it.
- **D2:** `ask_game_ai` is not dead — `tests/preview-suite/` calls it extensively. `ask_ollama` is the internal Ask engine, not an orphan RPC.
- **D4:** Six of nine evidence folders are not all unreferenced — several are cited from [archive/testing-results-2026.md](../archive/testing-results-2026.md) and [archive/testing-failures-2026.md](../archive/testing-failures-2026.md). Prune only after a link audit.

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
| 5 | **Defer the `docs/archive/` broken links to D4** | Not actionable here by decision. 272 relative links in historical files point at a `docs/` layout that no longer exists; fixing them is evidence hygiene, not code legibility. Folded into **D4** — see [06-doc-triage.md](06-doc-triage.md) § Link audit. Live docs are already link-clean |

**Found while executing, deferred to D7 (locked 2026-08-03, executed same day):**
`_reencode_oversized_capture` and `_mirror_capture_to_plugin_dir` in
`screenshot_media.py` — no production callers; deleted in execution-order step **5d**.


---

### D36 — LOCKED (option 1, 2026-08-28) — Pressing down in the try-order picker reorders your models. How should reordering work on a controller?

**Raised 2026-08-28 from the fullscreen picker edge-escape audit.** Real controller presses; the
full measurement is in [roadmap-details.md](../roadmap-details.md) under *Fullscreen picker
edge-escape audit*.

**What happens now.** Open **Set text model try order…**. Press down. The highlighted model moves
one place down the list — the highlight does not move to the next model, the *model* moves. Press
again and it moves again. After each move the highlight vanishes entirely: nothing on screen looks
selected, and **B no longer closes the picker** until another press brings the highlight back. The
only way to get out downward is to keep pressing until the model has been pushed to the bottom of
the list, at which point the highlight finally escapes to *Reset to defaults*. Measured: three
presses turned `gemma4, qwen2.5:1.5b, qwen3.5:4b, nomic` into
`qwen2.5:1.5b, qwen3.5:4b, nomic, gemma4`. The vision list works the same way — it is the same
screen.

**Why it matters.** Reading the list and rearranging the list are the same gesture, so a user who
just wants to see what is in there rewrites their own model order without being told. Nothing is
saved unless they press **Done**, so the damage stops at the picker — but they have no highlight to
tell them what is going on, and B appearing to be broken is the worst part of it.

**What is not in question.** Whichever option is chosen, the `.focus()` calls have to go: they are
plain DOM focus, which is not how Steam's ring moves, and they are the reason the highlight
disappears. `.cursor/rules/decky-focus-graph.mdc` already says so.

**Options.**

| # | Option | What it costs you |
|---|---|---|
| 1 | **Up/down move the highlight; reorder only with the Up/Down buttons on each row** | Simplest, and the buttons already work — you press A on one. Reordering becomes a two-step gesture: move to the row, move right to its buttons, press A. Matches every other picker in the plugin |
| 2 | **A "grab" mode** — press A on a row to pick it up, then up/down move it, then A again to drop it | Closest to how people expect to drag a list with a controller, and keeps reordering fast. Needs a visible "held" state, or it is the current bug with extra steps |
| 3 | **Leave up/down as reorder, but fix the highlight** so it follows the moved row and never disappears | Smallest change to what exists. Does not fix the real complaint — you still cannot read the list without editing it |

**Recommendation: option 1.** It is the least code, it removes a whole class of focus bug rather
than papering over it, and the reorder buttons it relies on are already there and already labelled
(*"Move gemma4:e2b-it-qat up"*). Option 2 is the nicer gesture if reordering turns out to be
something people do often, and it can be added later on top of option 1 without undoing it.

**Locked 2026-08-28, in the maintainer's words: "option 1. Fix it now."** Implemented and
confirmed on device the same day: the row handlers and their `.focus()` calls are gone, Down moves
the highlight, and reordering lives on each row's Up/Down buttons. Measurements and the two
side-findings the confirmation run turned up are in
[roadmap-details.md](../roadmap-details.md) under *D36 option 1, implemented and confirmed*.

---

### D37 — LOCKED (endorsed 2026-08-29) — Blind holdout rows added to `kb_eval_v2`. Endorse them?

**Locked in the maintainer's words: "D37: i endorse it" (2026-08-29).** The method stands, and both
batches — 56 rows in total, `V2-BLIND-H01` … `V2-BLIND-H56` — are the holdout baseline from here on.
Not to be re-argued; what remains is measurement, not permission.

**What the endorsement settles, so it is not re-litigated later:** writing a question from a bare
metadata listing (id, title, `section_type`, game) plus the author's own knowledge of the title
counts as blind, even though the author is the one certifying they did not read the card. The
evidence for that claim is the written procedure and the automated title-word-leak check, not a
guarantee — and that was visible when the call was made.

**What it does not settle:** the wording of any individual row was explicitly not part of the ask.
Any row can still be challenged on its merits; what cannot be re-opened is whether rows written
this way belong in holdout at all.

#### First measurement against the 92-row holdout, 2026-08-29 — the rows earned their keep

Run after the rows merged (`ebd2361`) and after the endorsement, in that order, as promised.
`nomic-embed-text` prompted, seed corpus `build/knowledge-base-test` manifest `2026.08.29` (same
card content as `2026.08.28` — `data/kb/` is unchanged since `4a479b1`), same corpus for every arm.
Run of record:
[../archive/research/kb-embed-bakeoff-2026-08-29-arms.md](../archive/research/kb-embed-bakeoff-2026-08-29-arms.md).

| Arm | holdout top-3 | CI | holdout top-1 | CI |
|---|---|---|---|---|
| keyword | 70.7% | [60.9, 80.4] | 51.1% | [41.3, 62.0] |
| vector_only | **83.7%** | [76.1, 91.3] | **64.1%** | [54.3, 73.9] |
| rrf_rerank_only | 71.7% | [62.0, 81.5] | 52.2% | [42.4, 63.0] |
| rrf (ships) | 79.3% | [70.7, 87.0] | 56.5% | [46.7, 67.4] |

**Every number is lower than the n=56 series and that is the rows working, not a regression.**
Fusion fell 85.7% → 79.3%; keyword fell 83.9% → 70.7%. Keyword lost **twice as much**, which is
exactly the direction rows written to share no vocabulary with their card should push it. The
gap between the two grew from **1.8 points to 8.6**. Not comparable as levels (R4) — comparable
as a direction.

**Two findings that matter more than the headline:**

1. **The holdout has started to separate.** keyword 70.7% [60.9, 80.4] against vector_only 83.7%
   [76.1, 91.3] overlap by 4.3 points, where the old 36-row holdout scored every arm *identically*.
   The harness's printed verdict still reads "no separation" because it only ever compares `rrf`
   against `keyword` — the pair that separates is `vector_only` against `keyword`, and the verdict
   line does not look at it. Worth fixing in the harness so the sentence matches the table.
2. **The shipping arm is beaten by the vector half alone, on holdout only.** `rrf` 79.3% / 56.5%
   against `vector_only` 83.7% / **64.1%** — 7.6 points of top-1. On `tune` the two are level
   (91.5% top-3 each, `rrf` ahead on top-1). An arm that ties on the rows the weights were tuned on
   and loses by 7.6 points on rows nobody tuned against is the textbook shape of **fusion weights
   that do not generalise** — and catching that is the entire reason a blind holdout exists. Filed
   on the roadmap; **not** to be acted on by re-tuning against holdout, which would burn it.

> **Numbering note, resolved 2026-08-28.** The parallel duplicate-D19 fix renamed that decision to
> **D19b** (per D31) rather than taking a new number, so D37 stands and no renumbering is needed.

**The situation.** [D23](#d23--where-do-the-paraphrase-questions-go) folded 15 paraphrase rows into
`kb_eval_v2` but, by its own rule (R1), had to assign every one of them to `tune` — they paraphrase
`kb_eval_v0`, which is card-derived throughout, so a paraphrase of a card-derived query is still
card-derived. The holdout split (n=36 at the time) was left exactly as it was: unable to separate
keyword, vector-only and fusion retrieval at all, all three scoring identically. D23 said outright
that fixing this needs "rows written blind against the cards" — a different piece of work. This is
that piece of work.

**What was added.** Twenty new rows, `V2-BLIND-H01` through `V2-BLIND-H20`, all `split: holdout`,
none `tune`. Eighteen are strategy-domain (spread across 12 of the 13 corpus titles — every title
except State of Emergency, skipped for lack of confident general knowledge of that game) and two
are compat-domain (topics `steam_input` and `storage`). Full row list and per-row provenance:
[kb-blind-holdout-rows-2026-08-28.md](kb-blind-holdout-rows-2026-08-28.md).

**The method, in one paragraph.** Each row was written from the author's own general knowledge of
the title plus a metadata-only listing (id, title, section_type, game — generated by a throwaway
script over `data/kb/*.json`) — never from the card text itself. Any card whose title alone wasn't
enough to write a confident question was skipped rather than peeked at. No retrieval, embedding, or
eval-harness run touched these rows at any point before this write-up — the split was fixed
(all holdout) before anything could be measured, which is the same R1 discipline D23 named and
could not itself satisfy for its own rows.

**What this is not.** Not a re-measurement. The holdout baseline numbers on record (83.3% across
every arm, as of the last measurement cited in
[session-handoff-2026-08-21.md](session-handoff-2026-08-21.md)) are from the old 36-row holdout.
Adding 20 rows changes what "holdout" means as a set, so **any number measured against the new
84-row holdout is a new series and is not comparable to the old 83.3% figures (R4)** — the same
caveat D23 recorded for its own fold-in. **The first measurement against this new holdout happens
after this change merges, not as part of writing it** — writing blind and then immediately
measuring in the same session would let the split leak into the numbers before anyone outside this
session has seen them, which is exactly what R1 exists to prevent.

**What the maintainer is being asked to endorse.** Whether twenty rows written this way — general
knowledge plus an id/title/type/game listing only, zero measurement before the ask — count as
genuinely blind for the purpose D23 described, and whether they should stand as the new holdout
baseline once next measured. Not being asked: the specific wording of any individual row, which is
reviewable from the row list in the linked write-up.

**First measurement, 2026-08-28 (after merge, as promised above).** One arms run on the merged
tree — new rows plus the pool-margin gate from
[kb-second-signal-2026-08-28.md](kb-second-signal-2026-08-28.md) — with `nomic-embed-text`, seed
corpus at `build/knowledge-base-test`. On the labelled holdout (now n=56): **fusion 85.7%
[75.0, 94.6] vs keyword 83.9% [73.2, 92.9] top-3.** That is the first time the two arms have
produced *different* holdout numbers at all — the old 36-row holdout scored every arm identically —
but the confidence intervals still overlap, so the honest reading is unchanged: these fixtures
cannot yet tell the arms apart. Not a tie; an unresolved question that now at least has a
direction. Run of record:
[../archive/research/kb-embed-bakeoff-2026-08-28-arms.md](../archive/research/kb-embed-bakeoff-2026-08-28-arms.md)
(this run supersedes the same-day file committed with the second-signal work, which measured the
pre-fold-in fixture; those numbers survive in that work's own write-up and in git history). One
row, `V2-BLIND-H19`, describes its controller symptom without any troubleshooting term and so
never reaches compat retrieval in production — the same known-miss shape as `V2-C-04`. It is
**named in the reach pin** (`test_compat_topic_router.py`,
`test_measured_reach_on_the_drafted_intents`) rather than reworded, because rewording it until it
routes would tune it against the router and undo its blindness. That a blind row immediately found
a hole the card-derived rows never could is the method working, not a defect in the row.

**Batch 2, added 2026-08-28 — thirty-six more rows, same method, same ask.** `V2-BLIND-H21` …
`V2-BLIND-H56`: 34 strategy rows across 11 titles and 2 compat rows, every one targeting a card
that carried no eval row of any kind before. Write-up and full row list:
[kb-blind-holdout-rows-batch2-2026-08-28.md](kb-blind-holdout-rows-batch2-2026-08-28.md).

Why a second batch rather than stopping at the first measurement: the arms differ by under two
points and the interval half-width at n=56 is about ten, so the overlap above is mostly a
sample-size problem rather than an answer. **Labelled holdout is now 92** (holdout overall 84 →
120). By the same R4 rule this file keeps applying, the 85.7% / 83.9% figures in the paragraph
above are now the *previous* series and are not comparable to anything measured from here on. **No
measurement was run while writing batch 2**, for the reason batch 1 gives; the first run against
the 92-row holdout happens after that change merges.

Batch 2 found the same hole again before it was scored: `V2-BLIND-H55` (*"the game drops me back
to the library a few minutes in"* — a crash with the word *crash* never used) also fails to reach
compat retrieval, and is named in the reach pin alongside H19 rather than reworded. **Two of the
four blind compat rows now miss**, which is a reach limit of the D16 router worth its own roadmap
entry, not a defect in either row.

**What is being asked has not changed** — endorse the method and let these stand as the holdout
baseline once next measured. Batch 2 rides on the same answer; a "no" on the method retires both
batches together.

---

### D38 — DEFERRED at the maintainer's request (raised 2026-08-29) — What ships is beaten by half of itself on the blind rows. How should that be acted on?

**Maintainer's position, 2026-08-29, in their own words: "I need more data, more games, more
questions before I can make an informed decision."** So this is **not** open for an answer yet, and
nothing about the fusion weights is to be changed until it is. What the deferral asks for is being
built — see *What is being done about it* below.

**The situation, in plain language.** The plugin finds knowledge cards two ways: **word matching**
(cards containing the words you typed) and **meaning matching** (cards that mean the same thing,
even sharing no words). It blends the two lists into one ranking, and each way currently gets an
**equal vote**.

The first measurement against the blind holdout rows says that equal vote is costing us:

| Split | keyword | vector_only | rrf (ships) |
|---|---|---|---|
| tune (n=117) | 75.2 / 86.3 | 74.4 / 91.5 | **75.2 / 91.5** |
| holdout (n=92) | 51.1 / 70.7 | **64.1 / 83.7** | 56.5 / 79.3 |

*(top-1 / top-3. Run of record:
[../archive/research/kb-embed-bakeoff-2026-08-29-arms.md](../archive/research/kb-embed-bakeoff-2026-08-29-arms.md))*

**On the blind rows the meaning half alone beats the shipping blend by 7.6 points of top-1.** The
reason is legible: the blind questions share no wording with their card by construction, so the
word-matching half has nothing to go on — and because it still gets an equal vote, it drags good
answers down the ranking.

**Why this is a decision and not just a number to change.** The weights
([knowledge_base_service.py:60-68](../../py_modules/backend/services/knowledge_base_service.py))
were never tuned. They were set equal and locked on 2026-08-09 with an explicit instruction: *"Equal
weights stay; do not 'tune' from a later peek at holdout."* That rule is correct — tuning after
peeking is how a ship gate quietly stops being one. But **the only split it is legitimate to tune
against said "change nothing"**: on tune, the blend was already the best arm available. So the rule
that keeps the gate honest was also blocking the fix the gate had just asked for. That is the knot,
and it is why this went to the maintainer rather than being quietly re-weighted.

**The options as they stood when it was raised.**

- **A — give tune the missing kind of question, then tune normally.** Write blind rows into `tune`
  so tuning can finally see keyword-hostile questions, sweep the weights on tune alone, and spend
  one holdout confirmation at the end. Costs writing effort; keeps the gate intact. Recommended.
- **B — re-weight from reasoning, then spend one holdout check to confirm.** Fast, but it uses up
  some of the gate's honesty and cannot be repeated.
- **C — change nothing.** Accept that the blend does worse on realistic questions than one of its
  own halves. Defensible while there are no users; less so after the first one.

**What is being done about it while it is deferred**, all of it option A's groundwork and none of it
touching a weight:

1. **51 blind rows added to `tune`** (`V2-BLINDT-01`…`51`), 2026-08-29 — the split had **zero**
   before, which is the whole reason it could not see the defect. Labelled tune 117 → 168. Method
   and disclosures: [kb-blind-tune-rows-2026-08-29.md](kb-blind-tune-rows-2026-08-29.md). **Every
   tune figure in the table above is superseded by this (R4)**; holdout is untouched.
2. **A weight sweep on `tune` only** — measuring whether any keyword/vector ratio looks better than
   equal, which is the legal move under the lock. Result to be recorded here.
3. **More games** — the maintainer asked for these explicitly. Flagged rather than started, because
   [knowledge-base.md](../knowledge-base.md) § Phase 5 locks *"no net-new titles in Phase 5"*
   (2026-07-30), sending catalog growth to Phase 8. Net-new titles therefore need that lock revisited
   first, and a title list only the maintainer can supply. Deepening the existing 13 is Phase 5 work
   and is gated on Phase 4 passing on the Deck, which is now all but complete.

**Not to be done meanwhile:** no weight change, and no tuning against holdout, whatever a later
number looks like.

---

### D39 — LOCKED (2026-08-29) — Four cards are filed under an arguable kind. Which kind do they take?

**All four answered by the maintainer on the corpus gap sheet, 2026-08-29.** Full answers and
context: [corpus-gap-answers-2026-08-29.md](corpus-gap-answers-2026-08-29.md).

**Why it was asked.** A card's `section_type` is not cosmetic: it decides the wording of the carousel
chip built from it (*"How do I deal with X?"* for an enemy, *"What should I know about X?"* for a
mechanic), it feeds the D25 type-recall rescue, and it decides what the one-kind-at-a-time chip pool
interleaves. Ten cards were re-typed without asking because the call was clear-cut. These four were
not clear-cut, and a wrong call is worse than none, so they went to the maintainer.

| Cards | Locked call |
|---|---|
| Cyberpunk 2077 — *Sandevistan*, *Kerenzikov*, *Berserk* | **Stay `mechanic`.** In their words: "not worth the churn" |
| Portal 2 — gels, funnels, faith plates, light bridges | **Stay `mechanic`** |
| Half-Life 2 — *Antlions and the sand* | **Split into two cards** |
| Hades — *Starting weapons* | **One card per weapon** |

**The first two cost nothing** — they confirm the depth plan's proposal to leave them alone, so no
card changes and no measurement is needed for either.

**The second two are authoring work**, and they are the only card writing this round has an explicit
instruction for:

- **Half-Life 2** — one card becomes two: the antlions as an `enemy`, and the sand rule as a
  `mechanic`. The existing card is wiki-sourced (`combineoverwiki.net`, CC-BY-SA-4.0), so **both
  halves inherit that source and licence** and the ATTRIBUTIONS entry must still name it. Splitting
  a sourced card does not make either half maintainer-authored.
- **Hades** — one card becomes six, one per Infernal Arm. These are maintainer-authored
  (`source_license: bonsAI-maintainer`, empty `source_url`), so they carry the weaker
  `fallback_no_source` trust tier, the same standing as the existing DRG Survivor and Ocarina entity
  cards.

**Both are behaviour changes, not refactors.** Splitting a card changes what retrieval can return and
changes the chip pool's kind mix, so both are measured before and after, and Half-Life 2 and Hades
each get their chip pool re-checked the way `PHASE4-CHIPS-01` does for Left 4 Dead 2.

**Not asked and not decided here:** whether the corpus should gain a *build / early-game orientation*
card shape, which the same gap sheet asked for twice in free text. That is a bigger question than a
`section_type` value and is filed on the roadmap rather than smuggled in under this decision.

#### D39 follow-up (2026-08-29) — the Half-Life 2 half is done; the Hades half is blocked

**Half-Life 2 — shipped, but not in the shape this decision wrote down.** D39 above says the two
halves become an `enemy` and a `mechanic`. They became an `enemy` and an **`item`**. The reason is a
card nobody had looked at when D39 was written: **`Sandtraps` (section 37) already carries the sand**
— *"Rock to rock on the way out; after the Antlion Guard you keep the pheropod and use antlions to
break the Combine bunkers."* A new `mechanic` card about sand would have been the **third** Half-Life
2 card on the same subject, all three competing for the same query. So the pheropod became what it
actually is — a thing you carry and throw, the same kind as `Gravity Gun` and the RPG — and the sand
rule stayed with the antlions, because it is a fact *about the antlions* (they are blind, they feel
vibration) rather than a rule of its own.

Result: section 36 is now `enemy` **Antlions**, section 142 is `item` **Pheropod (bugbait)**. Both
sentences are the original wording, split where the original card already changed subject; the only
new words are the four needed to stop *"it reverses"* dangling. Both keep
`combineoverwiki.net/wiki/Antlion` and CC-BY-SA-4.0, so the ATTRIBUTIONS entry gains a row rather
than losing one. Half-Life 2 goes 8 cards to 9, spanning four kinds.

The name carries **both** words the game uses — *pheropod* in dialogue, *bugbait* in the HUD — so a
player who only ever saw one of them still reaches the card.

**Two eval rows were repointed**, which is worth stating plainly because repointing a question after
seeing how it scores is how a score gets quietly flattered:

| Row | Was | Now |
|---|---|---|
| `V2-S-HL2-06` — *"there is a bit on the beach where you cant touch the sand and i keep dying"* | Antlions and the sand | **Antlions** |
| `V2-S-HL2-08` — *"antlions how to control them"* | Antlions and the sand | **Pheropod (bugbait)** |

**Both are on `tune`. No holdout row was touched**, so the honest ship gate is unaffected by this
edit. 887 Python tests pass.

**Hades — blocked, and not on schema or tooling.** The maintainer said on 2026-08-29 that they do
not know the game well enough to supply the content. That is a real blocker, because the existing
card cannot be split into six: **it names four of the six Infernal Arms** — the Stygian Blade, the
Shield of Chaos, the Rail and the Bow. The Eternal Spear and the Twin Fists appear nowhere in the
corpus. Splitting what exists yields four one-line cards and still leaves two weapons missing, which
is motion rather than progress.

Three ways out, none of them started, none needing a decision before the corpus republishes:

1. **Source it.** A Hades wiki under CC-BY-SA-3.0 is already precedented in this corpus (Cyberpunk,
   Fallout 4, Left 4 Dead 2 and GTA all use Fandom under exactly that licence, and D20's publish
   policy already covers it). This removes the need for maintainer knowledge **and** upgrades the
   cards from `fallback_no_source` to a sourced tier. Best option on the merits.
2. **Split the four that exist** and leave the Spear and Fists absent, with the gap recorded rather
   than hidden.
3. **Leave section 89 alone** until either of the above is worth doing.

Recommendation is (1). It is the only one that ends with six real cards, and it is the option that
does not spend the maintainer's time on a game they have told us they do not know well.

---

### D40 — LOCKED (2026-08-29) — Terse mode's branch menu appears on every reply and never stops. The branch fence is mandatory-once and banned on follow-ups. Which rule wins?

**Locked in discovery with the maintainer on 2026-08-29, before any code exists.** Roadmap entry:
**Terse mode** under Backlog → Ask / reply; full shape in
[roadmap-details.md](../roadmap-details.md).

**Why it was asked.** Terse caps a Speed answer at three lines, so it needs a way to get the rest.
The maintainer chose the existing strategy branch picker over a new *explain further* chip — reusing
a control that already renders and is already D-pad reachable. But the picker as built is close to
the opposite of what terse needs. Today it is **Strategy-mode only**, **mandatory on the first
turn**, and the prompt explicitly forbids repeating it — *"Do NOT repeat this branching fence when
the user later sends a message starting with [Strategy follow-up]"*
([ollama_prompts.py:1317](../../py_modules/backend/services/ollama_prompts.py#L1317)). Terse needs it
in Speed, on every reply, without end.

**Four shapes were drawn out for the maintainer, who picked B:**

| | Buttons appear | Pressing one leads to | Picked |
|---|---|---|---|
| A | every reply | one more reply, then the trail ends | |
| **B** | **every reply** | **another set of buttons, forever** | **yes** |
| C | only when there is more to say | one more reply, then ends | |
| D | only when there is more to say | another set, forever | |

**Why B.** It is the version you can play a whole session with and never touch the on-screen
keyboard, which on a couch is the point of the feature. **C was rejected on a specific ground rather
than taste:** enforcement is wording only, so a missing button row is ambiguous — you cannot tell
*"there was nothing more to say"* from *"the model forgot to offer"*.

**What is locked:**

- The branch fence becomes **repeatable** and available **outside Strategy mode**. This decision
  *widens* the fence; it does not delete the existing Strategy rule, which stays once-only until
  someone measures a reason to change it.
- Buttons are **stacked full-width** in the 300px column, not squeezed into a single row.
- **No separate *explain further* chip.** The menu already does that job, and two controls for one
  intention is one more thing to reach with the D-pad.
- **No exit control.** The Ask field stays live throughout, so the menu is an offer, not a trap.

**What this decision does not cover**, both build-time questions rather than maintainer calls: how
many options a terse menu should offer (Strategy's fence allows 2–8), and how a repeating fence
interacts with the spoiler rule that currently requires every `bonsai-spoiler` block to sit **above**
the branch fence on a first turn
([ollama_prompts.py:454](../../py_modules/backend/services/ollama_prompts.py#L454)).

**Also settled in the same session and deliberately given no number of their own**, because nothing
in the existing code or docs argues with them: terse overrides the reply-style slider and the AI
character inside Speed; it is off by default; it changes output only and never thinking effort; and
it keeps Caveman's destructive-warning and depth-phrase escapes but not its character step-aside.

#### D39 follow-up, correction (2026-08-31) — "source the Hades wiki" was bad advice; the split shipped anyway

**The recommendation above was wrong, and this repo had already proved it wrong.** It said a Hades
wiki under CC-BY-SA-3.0 was precedented. There is no such wiki:

| Source | Licence | Verdict |
|---|---|---|
| `hades.fandom.com` | **CC BY-NC-SA 3.0** | NonCommercial — excluded by D20 since 2026-08-14 |
| `hades.wiki.fextralife.com` | "Custom License" | not a free licence; never a candidate |
| `hades.wiki.gg` | — | does not exist |

Worse, the Fandom case is a **trap this project already walked into and marked**: the archive.org
item for that snapshot advertises **CC BY-SA 3.0**, while the wiki's own `siteinfo` inside the
snapshot says **CC BY-NC-SA 3.0**. Checked 2026-08-09, resolved in favour of the stricter one, and
written down in three places — D20, ATTR-1.2 in
[15-corpus-licensing-attribution-plan.md](../planning/15-corpus-licensing-attribution-plan.md), and
the body of commit `ac03617`. Anyone who trusts the item metadata files NC content under a free
licence. **Read D20 before proposing a source, not after.**

**The blocker was never real.** Commit `ac03617` settled how the seven unsourceable titles get
content — *"maintainer-authored where [dumps] do not [exist]"* — and Hades is one of the seven.
Every Hades card in the corpus, section 89 included, was already written that way. So splitting it
needs no new standing, no new licence, and no game knowledge from the maintainer that the existing
card did not already require.

**Shipped.** Section 89 becomes `mechanic` **Weapon aspects**, carrying the one sentence in the old
card that was never about a single weapon. Six new `item` cards, sections 143–148, one per Infernal
Arm: Stygian Blade, Shield of Chaos, Heart-Seeking Bow, Eternal Spear, Twin Fists of Malphon,
Adamant Rail. The Spear and the Fists appear in the corpus for the first time. Each card keeps the
old card's judgement where it made one — the Blade is still *"the safest thing to learn on"*, the
Shield still *"turns a mistake into nothing"*.

Hades goes 8 cards to 14, and gains an `item` kind it did not have, so its chip pool can interleave
four kinds instead of three. `V2-S-HADES-02` (*"which weapon is easiest"*) repoints from
*Starting weapons* to **Stygian Blade** — on `tune`, no holdout row touched. 890 Python tests pass.

**What is genuinely weaker here, and should be said rather than buried:** these six carry
`fallback_no_source`, so nothing external backs them. That is the same standing as the 74 cards
already in the corpus and is covered by the ATTRIBUTIONS *Accuracy* section — cards are distilled,
not authoritative, and wrong ones get fixed forward. It also means, per the note closing
[corpus-gap-answers-2026-08-29.md](corpus-gap-answers-2026-08-29.md), that **whoever wrote them can
never write a blind eval row for them.** Six cards' worth of blind-row capacity was spent here.

### D40 — OPEN (raised 2026-08-31) — The eval allows one right answer per question. The corpus has outgrown that.

> **Resolved by [D51](#d51--locked-2026-09-01--the-eval-may-hold-a-second-right-answer-resolves-the-eval-d40-which-becomes-d40b) on 2026-09-01: option 1, with a written reason per second card.** Numbering collision with the Terse-mode D40 above; this one is **D40b** from here on (D31 precedent).

**Evidence:** [kb-eval-after-depth-2026-08-31.md](kb-eval-after-depth-2026-08-31.md). Adding 13
cards regressed 7 eval cases and improved none. **Five of the seven are cases where more than one
card is a fair answer**, and the fixture can only name one.

The clearest is `V2-S-SOE-03`, *"how to get more time"*. It expects `Kaos mode and Revolution mode`,
which is what State of Emergency had when it owned five cards and that one was the only thing
resembling an answer. Retrieval now returns `Round time and the +15s pickups` — a card written from
the maintainer's own words about that exact confusion. **The answer got better and the number went
down.**

This will happen again on every depth pass, and it gets worse as the corpus improves, which makes it
a measurement bug rather than a content bug.

**Options, in plain language:**

1. **Let a row list several acceptable cards.** `expect_section` becomes a list; a hit is any of
   them. Cheapest change, and it matches how a reply actually works — three cards are injected, not
   one. Risk: a lazily-written list of four cards makes a row impossible to fail.
2. **Keep one expected card but score top-3 only**, dropping top-1 as a headline. Honest about what
   the product does, but throws away the signal that says *"the best card came first"*.
3. **Leave it, and treat the score as a floor** rather than a measurement — every future number is
   read as "at least this good".
4. **Split the rows instead**: where two cards are both fair, write two questions that separate
   them. Most work, best fixture, and it is the only option that makes the eval sharper rather than
   more forgiving.

**Constraint that is not negotiable:** whatever is chosen, `V2-S-SOE-07` and `V2-S-SOE-09` are
**holdout** rows that were seen to fail. Rewriting either one now converts the ship gate into a
mirror. If option 1 or 4 is taken, it is applied to `tune` and to *unread* holdout rows, and those
two are left alone or retired outright.

### D41 — OPEN (raised 2026-08-31) — A card named after a category outranks the cards inside it

**One real regression** came out of the Hades split. `V2-S-HADES-02` asks *"which weapon is
easiest"* and expects `Stygian Blade`, whose card says *"the safest thing to learn on"*. It now
returns `Weapon aspects`, `Shield of Chaos`, `Adamant Rail` — the right card is not in the top three
at all.

The cause is plain: **`Weapon aspects` contains the word *weapon* and the six weapons do not.** They
are named `Stygian Blade`, `Eternal Spear` and so on. Before the split, one card was called
*Starting weapons* and won the same match honestly, because it *was* the answer.

**What must not be done:** rewording the Blade card to say *"easiest"*, or renaming `Weapon aspects`
to dodge the match. Both are fitting the corpus to a test question, and this repo has already
recorded that failure mode once ([00-phase0.md](00-phase0.md)).

**The real question:** should a card whose name is a *category* sit in the same pool as cards that
are *instances* of that category? Options:

1. **Accept it.** One tune row is wrong; the shipped `rrf` arm may well rank it correctly, and this
   was never measured per-case for `rrf` — the per-case data only exists for the keyword arm.
   **Measure `rrf` per-case before deciding anything.** Cheapest and most likely correct first step.
2. **Give instance cards their category word.** Name them `Stygian Blade (weapon)` and so on. Fixes
   retrieval generally rather than for one question, at the cost of clumsier chip labels — and chip
   width is already a known problem on a 300px column.
3. **Fold `Weapon aspects` into the mechanic it belongs beside** (`Mirror of Night`, `Darkness, keys
   and gems`) so the category name stops competing with the instances.

**Recommended first step is (1)** — the finding rests entirely on the keyword arm, which is not what
ships, and the tooling does not currently write per-case results for the fusion arms.

### D42 — LOCKED 2026-08-31 — Never-used chats clean themselves up (option 2)

Pressing A on the [+] position creates a chat immediately, named "New chat". If the user then
never asks anything in it, that empty chat stays in the rotation forever — and on the strip it is
almost indistinguishable from the [+] screen itself, which is how "there are two new chat screens"
got reported on 2026-08-31. The 2026-08-31 fixes make asks from [+] create-and-name a chat
properly, so new empties can now only come from A-create followed by walking away.

Options:

1. **Do nothing.** The × on the row already deletes one. Empty chats are rare after the fix, and a
   user who created one on purpose keeps it. Cheapest; the confusion case mostly died with the fix.
2. **Sweep on leave.** When the user switches away from a chat that has zero turns AND still has
   the default "New chat" name, delete it quietly. A renamed empty chat is kept, treating the
   rename as "I mean to use this". Risk: a delete the user did not ask for, even if what is
   deleted is by definition empty.
3. **Stop creating on A.** Make A on [+] only focus the Ask field, so a chat only ever comes into
   existence with its first question (asks from [+] already work this way now). No empties can
   exist at all; changes a shipped affordance, needs the focus graph checked.

**Locked the same day: option 2, sweep on leave.** Maintainer's words: "YES! Definitely don't
leave those dingleberries." Implemented in `useChatSlots.sweepIfNeverUsed` with both protections —
a renamed empty chat is kept, and a chat the backend is generating into is never touched (the
Ask-from-[+] flow makes a chat that is briefly empty AND named "New chat" while the first answer
is being written; sweeping it would lose that answer). Proven on-Deck the same evening:
`runs/V3-21-sweep-empty-chat.json` — A on [+] created "New chat", one RB away and it was gone
from the rotation.

### D43 — LOCKED 2026-09-01 — Two chips across the preset row, or three? (option 1, two across)

The one-chip preset row (`fc1b245`) is being redone to the drawing: chips side by side in one row,
long labels scrolling sideways ([planning/29-preset-row-three-thirds-plan.md](../planning/29-preset-row-three-thirds-plan.md)).
The drawing says **three** ([major-redesign.md:149](../major-redesign.md), "three chips, not four").
The maintainer asked, 2026-09-01, whether **two** would be better given how narrow the QAM column is.

**Measured, not predicted.** The column is 300 CSS px (docked 1080p; handheld unmeasured). With a
4 px gap, three chips are ~97 px each and two are ~148 px. Label room is that minus Steam's
`DialogButton` side padding, which this plugin does not override and has not been measured; at 8 px a
side, three across leaves **~12 characters** and two across **~20** (6.45 px per character at 12 px,
from PHASE4-CHIPS-01). The 43 built-in suggestions run 16 to 52 characters, median 35; corpus chips
about 20 to 50, median ~30. So at three across **no suggestion is recognisable without watching it
scroll** ("How do I fix", "What TDP sho"); at two across most are ("How do I fix stutter", "Why is my
game crash"). Badged Tip/Test chips lose another ~21 px; the Couch and Immersive UI scales lose a
further 15 to 22 %.

**What two across costs:** one fewer suggestion on screen; the three contextual seeds no longer all
show at once (a two-slot queue replaces the one-chip queue instead of deleting it); and **the corpus
Tip guarantee silently breaks** unless it is changed, because it converts the *last* of the three
seeds ([sessionRagComposer.ts:113-120](../../src/features/preset-carousel/sessionRagComposer.ts)),
which would be the hidden one. It also departs from the drawing, which is why this is a decision and
not a build choice.

Options:

1. **Two across (recommended).** Chips readable at a glance. Convert a visible slot for the Tip
   guarantee; generalise the seed queue to two slots; record the departure in
   `major-redesign.md § 7`.
2. **Three across, as drawn.** Three fragments that make sense only in motion, three crawls at once.
   Simplest code path: delete the one-chip queue, no guarantee change.
3. **Three across, but only the focused chip scrolls.** Calmer than 2, still unreadable at rest.

Whichever is chosen, the first deploy measures the button padding and the real character counts on
the live page and writes them into the plan's § 3b.

**Locked 2026-09-01 by the maintainer: option 1, two across.** Build per
[planning/29-preset-row-three-thirds-plan.md](../planning/29-preset-row-three-thirds-plan.md); the
first deploy writes the measured padding and character counts back into that plan's § 3b.

### D44 — LOCKED 2026-09-02 — Reopen R5: the tab strip collapses to a thin bar and gets names (option 1, the discovery answer)

**R5** ([major-redesign.md § 7](../major-redesign.md), 2026-08-09; re-confirmed in the turn-8 review
2026-08-29/30) locked the tab strip as *filled active glyph only, no micro labels, no width change, no
height cost*. Two things have moved since. The maintainer set the vertical-space goal on 2026-08-30 and
filed *the tab names never appear* as a bug the same day. And the collapsing bar was workshopped on
2026-09-01: [planning/30-collapsing-tab-bar.md](../planning/30-collapsing-tab-bar.md), twelve decisions,
all taken.

What R5 protected, and what the plan does to each:

- *No height cost.* The plan goes the other way: the strip drops from about 85px to about 20px at rest,
  and the open strip floats over the panel, so it never costs the transcript anything.
- *No micro labels.* The open strip carries a small name under every icon, shown only while the ring is
  on the strip. The thin bar carries the active tab's name at a readable 11px the whole time.
- *No width change.* Kept. There is no wide active cell; the maintainer dropped it in discovery.
- *Filled active glyph.* Kept on the open strip.

Options:

1. **Reopen R5 as the plan says (the discovery answer, 2026-09-01).** Names on the thin bar and on the
   open strip, no wide cell. R5's height objection is moot because the strip only opens while focused
   and floats over the panel.
2. **Keep R5's label ban and still collapse.** Dashes plus the active *icon* at rest, icons only when
   open. Saves nearly the same height, but a glyph is what people said they cannot read, and the *tab
   names never appear* bug stays open.
3. **Leave R5 alone and do nothing.**

The maintainer chose option 1 in discovery. **Lock it here once the device spike in the plan's § 5 W1
passes** (LB/RB still switch tabs with Steam's bar hidden). If the spike fails, the plan stops by the
maintainer's own call and this entry records why. R5's other reason, whether 7px caps survive on a
handheld, is a device check in the plan (**TAB-BAR-07**), not a paper decision.

**Locked 2026-09-02: the spike passed.** With Steam's header wrapper hidden by a hash-free `display: none`
rule, RB ×5 and LB ×5 from inside the body switched every tab and `currentTab` followed each press, both
with no game running and with Half-Life 2 running (the rig launched and exited the game itself);
evidence `runs/TAB-BAR-W1a-no-game.json` and `runs/TAB-BAR-W1a-with-game-2.json`, numbers in
[planning/30-collapsing-tab-bar.md § 8](../planning/30-collapsing-tab-bar.md). The body gained the full
80px (616 → 696px). What the spike also found — Steam's hidden tab button stays a focus stop — is a
separate call, **D55** below.

---

### D45 — LOCKED 2026-09-01 — What counts as a "better answer", and does a run on the PC count as evidence? (yes to both)

Raised by [planning/30-kb-answer-quality-plan.md](../planning/30-kb-answer-quality-plan.md) § 3 Q1.
The search half of the knowledge base is measured to the decimal; what the small model on the
Deck writes from the cards has never been measured. The maintainer's on-Deck run of
`PHASE4-CARDS-01` is the only data point (labels kept 1 of 6, content accurate 6 of 6).

**Locked: yes.** A better answer is one that passes four judge-free checks: (a) it contains the
card's key facts (a short must-mention list per question, copied from the card); (b) it says
nothing the card contradicts (a short must-not-say list); (c) a spoiler fence appears only where
the rules allow; (d) a Strategy first turn ends with the branch menu. The test runs on the
maintainer PC with the Deck's own model tag (`gemma4:e2b-it-qat`, shipped temperature) and its
numbers are the regression gate; the Deck run is for feel.

**What it obliges.** Build `scripts/eval_kb_answers.py` (plan § 4.1) and baseline the current
prompt before changing it. The two prompt trims the maintainer did not object to — dropping the
citation-fence sentence (obeyed 1 time in 89 on device, unrendered by the UI) and sending the
screenshot-reading rules only when an image is attached — ship only with a before/after from this
test. Must-mention lists are written by someone who has read the card; that is fine here because
these are not blind retrieval rows, but the same person must not also write new blind eval rows in
that session.

### D46 — LOCKED 2026-09-01 — The Deck's 4,096-token window: trim what we send, do not raise the window (option: trim)

Measured 2026-09-01: Ollama `0.32.15` on the Deck loads `gemma4:e2b-it-qat` with
`context_length: 4096`, nothing in the plugin sets one
(`ollama_service.py:497-501` sends only `num_predict` and `temperature`), and a troubleshooting
ask may attach 96 KiB of Proton logs (`proton_troubleshooting_logs.py:18`, ~25,000 tokens).
Ollama keeps the end of an overlong prompt and drops the start silently. Not seen in the 161
recorded asks (none attached logs); reachable by construction.

**Locked: trim.** Cap the Proton log excerpt to a size that leaves room for cards and a reply
(~6–8 KB, keeping the newest lines), cap the parent answer pasted into a follow-up-chip message,
and log a warning whenever an estimated prompt plus `num_predict` would not fit the window.
Raising the window with `num_ctx` is **not** done now; it may be tried later as a measured
Developer experiment (VRAM and time-to-first-token with a game running) and needs its own call.

### D47 — LOCKED 2026-09-01 — Follow-ups remember (yes)

The model receives only the system prompt and the newest message (`ollama_ask_service.py:170`);
a typed follow-up such as *"what about the second phase?"* has no entity to search and no idea
what *the* refers to.

**Locked: yes**, in the recommended order: first carry the previous turn's asked entity into
retrieval when the new question names none (cheap, spends no window; transparency notes
`carried_entity:…`); chat history as `messages` only after D46's budget shows how much room there
is, and then trimmed to fit.

### D48 — LOCKED 2026-09-01 — When no card matched a game question, the reply says so (yes)

Today a reply looks the same whether it came from the notes or from the model's memory; only
*Show details* knows. The maintainer's own Deck note (`bonsai-debug-wronginfo.md`, 2026-05-20)
shows what a small model does with no notes: confident, wrong, tidy.

**Locked: yes.** One muted plain line appended by **code, not the model** (same mechanism as the
destructive-advice notice), only on explicit game asks (Strategy / Expert) where the corpus knows
the game but nothing matched (`kb_attached=False` with coverage status `sections`). Not shown
when the KB is off or the game is uncovered — the coverage chip already says that. Wording to be
settled with the maintainer; it costs a line in a 300 px column, and a focus-graph check if it is
a stop.

### D49 — LOCKED 2026-09-01 — Publish the 161-card corpus now (yes)

Both channels served `2026.08.22` (133 cards) on 2026-09-01; the seed holds 161. The 28 cards
added since 2026-08-29 (State of Emergency, the Hades weapons and *Weapon choice*, the Half-Life
2 antlion split, the Cyberpunk / Fallout 4 / Red Dead entity cards, three comparison cards) had
never reached a device. **Locked: publish**, schema stays 3 so the Deck updates in place, and the
Deck installs it before any on-Deck answer testing — otherwise the device tests the wrong corpus
(the 2026-08-21 handoff's lesson). Release record: plan § Checklist W2.

### D50 — LOCKED 2026-09-01 — Spoiler tiers confirmed

Three tiers as the maintainer proposed on the 2026-08-29 gap sheet: **strict** (no bosses,
endings or chapters), **default** (fence only named story beats and endings), **open** (anything
the user asks about). **Confirmed:** the default tier is *"named story beats and endings"*, and
naming a boss or item still unlocks it under **strict** (rule 7 of the spoiler constitution
holds in every tier). Built after D45's test exists, so each tier's prompt wording is measured
against the 8-of-41 low-story misfire set rather than eyeballed. Setting shape: plan § 4.5.

### D51 — LOCKED 2026-09-01 — The eval may hold a second right answer (resolves the eval "D40", which becomes D40b)

The eval "D40 — OPEN (raised 2026-08-31)" below shares its number with the Terse-mode D40 locked
2026-08-29; following the D31 precedent, the eval one is **D40b** from here on. The maintainer
agreed with the recommendation: **option 1** — a row may list a **second** acceptable card, on
`tune` rows and on holdout rows *not yet seen to fail*, and only with a written `note` saying
why the second card is fair; **retire `V2-S-SOE-07`** (no card can answer it, as the maintainer
said on 2026-08-31); **leave `V2-S-SOE-09` alone**; use option 4 (split into two sharper
questions) only where it is obvious. Any number measured after the fixture changes is a new
series (R4).

### D52 — LOCKED 2026-09-01 — Symptom-only troubleshooting questions get a meaning search, only when no topic routed

*"the game drops me back to the library a few minutes in"* never reaches the tip sheet because it
does not say *crash* (2 of the 4 blind compat holdout rows miss; filed 2026-08-28). The maintainer
agreed with the recommendation: **option (b)** — when the topic router matches nothing and the
phrase gate did not fire, run the meaning search over the tip sheet behind the second-signal gate.
The 2026-08-18 measurement that removed a compat vector pass was taken *with* a routed topic and
does not cover this case. Measure on the 17 holdout compat rows first and record the result here.

### D53 — OPEN (raised 2026-09-01) — "Starting out" and comparison cards: a new kind, or leave them as `mechanic`?

Three such cards exist as `mechanic` (*Choosing a build* ×2, *Weapon choice*, *Coming from
GTA*). The maintainer asked for more explanation before deciding; the explanation is in the
2026-09-01 session and will be copied here with the answer.

### D54 — OPEN (raised 2026-09-01) — Strategy first turn: give the tactic first, then the menu?

Today a Strategy first turn gives an orientation and a branch menu before tactics, by design.
The maintainer asked for more explanation before deciding; the explanation is in the 2026-09-01
session and will be copied here with the answer.

### D55 — LOCKED 2026-09-03 (option 1, via D57 #8) — Steam's hidden tab buttons stay focus stops: route around them, or stop plan 30?

Plan 30's spike (§ 8 of [planning/30-collapsing-tab-bar.md](../planning/30-collapsing-tab-bar.md))
hid Steam's tab header and then walked the D-pad. LB/RB kept working (that was the gate, and it
passed). But the **active tab's hidden button is still a focus stop**: from a fresh open, Down lands
on Decky's Back button, then on the invisible tab button, then on the body; Up from the top of a tab
lands on the same invisible button; a free-play sweep of Settings recorded it twice and nothing else
hidden. It behaves identically under `display: none` and under `height: 0; visibility: hidden`, so it
is Steam's navigation tree — built from mounted `Focusable`s, not from layout — and no CSS removes it.
The plan's risk table (§ 7) said: switch the property, and if both leave ghosts, stop.

Options:

1. **Route around it (recommended, and what W4 builds).** Our bar's Down does not return `false`
   to Steam; it moves the ring itself to the current tab's first stop through `navFocusRegistry`,
   and each tab's first stop moves Up to the bar the same way. One `Focusable` wrapper per tab body
   in `index.tsx`'s tab list carries the `navRef`, so it is six registrations from one place, the
   same hop the chat-slot row already uses. Add a small focus trap on the hidden header: if Steam
   ever lands the ring on a hidden tab button by any other path (B from inside a body does exactly
   that today), bounce it to our bar. Cost: one wrapper, one observer, and TAB-BAR-05 must show
   zero focused-but-not-visible stops on every tab. Risk: the trap and the hops are ours to keep
   working across Steam updates; the fail-safe stays — if the hiding rule ever stops matching,
   Steam's strip reappears and the trap has nothing to catch.
2. **Stop plan 30 here**, as § 7 literally says. Keeps Steam's strip and its 85px. The names bug
   and the vertical-space item stay open.
3. **Hide the header but leave the ghost**, shipping W3 only (the thin bar, no focus stop). Reclaims
   the 80px at once; the ghost is one invisible Down between Decky's Back button and the body, and
   Up from the top of a tab stops on it once. This is the "focused but not visible" bug class the
   maintainer named on 2026-08-31, so it is listed only to be rejected.

Built under option 1 from W4 on because the maintainer said "keep going" and option 1 is the plan's
own § 4.5 fallback, applied in both directions. If the answer is 2, W2–W3 are harmless on their own
and W4+ is reverted.

**Locked 2026-09-03 on option 1** (D57 #8, the maintainer answered "ok" to the recommendation):
TAB-BAR-01 to 06 pass under it on the device, so the hops and the trap stay. Reopen only if a Steam
update breaks the hiding rule or the trap.

### D56 — LOCKED 2026-09-02 (a corrected assumption, no maintainer input needed) — The collapsing tab bar's Left/Right wrap at the ends, because LB/RB do

Plan 30's discovery notes assumed *"Left at the first tab and Right at the last do nothing, matching
LB and RB."* Measured after W3 on the device (`runs/TAB-BAR-W3-shoulder-wrap.json`): **LB on Main
goes to About and RB on About goes to Main.** Steam's `Tabs` defaults `wrapAround` to true and
bonsAI never set it. So the half of the assumption about LB/RB was wrong, and the plan's own rule
("matching LB and RB") decides the rest: the bar's Left, Right, LB and RB wrap the same way
(`tabBarNav.ts`), measured passing in `runs/TAB-BAR-03-switch-on-the-bar.json`. The alternative —
passing `wrapAround: false` to Steam so the bumpers stop at the ends — changes existing behaviour
for every user and was not what anyone asked for. Reopen here if the wrap turns out to be a nuisance.

### D57 — LOCKED 2026-09-03 (raised 2026-09-02) — The Deck verification round: nine calls before "go"

[Plan 31](../planning/31-deck-verification-round.md) sorts every roadmap **Verify** row by what it needs
from the device and puts them in a run order. Nothing in the code blocks the round. Checked over SSH on
2026-09-02 at 23:42, without pressing a button: the Deck already runs this checkout (`main.py` and
`dist/index.js` are byte-identical to the local build of 19:15, which post-dates the last code commit
`cc110fb`), passwordless sudo works, the thinking model `qwen3.5:4b`, the embed model `nomic-embed-text`
and corpus `2026.09.01` are installed, the voice engine binaries are present, and the knowledge base is
on. What blocks the round is nine things only the maintainer can decide. Answer by number in chat; the
answers get copied here.

1. **The window.** Every row that touches the screen or the buttons runs one at a time: one device, one
   focus ring, one bridge with no lock, and Steam's state (running game, settings, Ask mode) is global.
   The other chat's DPS session has to stop for the whole block, or its presses corrupt the runs
   (measured 2026-09-02, see the *one driver at a time* note). Proposed: two evening blocks (Session 1
   with no game running, Session 2 with games) and about twenty minutes with you at the Deck for
   Session 3. No deploy is needed unless code lands first; a deploy restarts Decky Loader.
2. **Frozen chips.** Standing rule: you confirm the sentences before anything is pinned. Plan 31 § 4
   lists two batches (11 and 12 sentences). The batch on the Deck right now has ten entries: the five
   KB-ANSWER-02 sentences (kept, they are in batch 1) and five that no testing row names —
   *"explain in detail how proton runs windows games on linux"*, *"name one deck tip"*, *"say hello"*,
   *"name one proton tip"*, *"name one battery tip"*. Options: (a) drop those five and pin batch 1 as
   written (recommended); (b) keep them, which leaves two free slots, so each batch goes in over several
   re-pins with a panel close between.
3. **Launching games from the PC.** Session 2 needs six titles running in turn. The KB-COVERAGE-NOAPP-01
   row says "the plan forbids launching a game by automation"; where that rule comes from is UNKNOWN
   (no plan file says it), and another session launched Half-Life 2 through the bridge on 2026-09-02.
   Options: (a) the rig launches and exits games itself (`deck_launchGame` / `deck_exitGame`), so you are
   not needed until Session 3 (recommended); (b) you launch each title when asked in chat. Either way,
   one UNKNOWN to settle: how Ocarina of Time runs on this Deck. It is not a Steam install, and
   STRAT-ENTITY-01's two King Dodongo sentences need it running; the Raphael sentence uses Baldur's
   Gate 3, which is on the card.
4. **Clear all plugin data.** Three owed checks need a real clear: VOICE-CLEAR-01's UI half,
   TAB-RESUME-01's "next open is Main", and SHELL-PAYLOAD-01's Ollama tab after a clear. Per the
   VOICE-CLEAR-01 row it wipes the real settings and the model records. Options: (a) yes, as the very
   last step of the last session, after copying `settings.json`, `chat_slots` and `chat_threads` aside
   over SSH and restoring them afterwards (recommended; a `settings.json.bak-preQA` from an earlier
   round already sits next to the live file); (b) skip those three sub-checks this round.
5. **A model pull for ROUTING-MERGE-01.** The row needs a custom setup profile that pulls a model — for
   example `qwen2.5vl:3b`, about 3 GB — and then checks the try-order picker and the vision list. It is
   the only row that adds files to the device. Options: (a) allow the pull; (b) defer the row
   (recommended unless you want that model anyway).
6. **SMOKE-B.** It tests TDP apply, removed 2026-07-30, and the *Deferred manual QA* entry still lists it
   under Tier 1. Options: (a) retire it and drop it from Tier 1 (recommended); (b) rewrite it as a
   suggestion-only banner check.
7. **Scope.** Options: (a) the roadmap Verify rows plus the three re-runs the tab bar asked for
   (DOC-SWEEP-01, CHAT-SLOTS-V3-01, TAB-SWITCH-01) (recommended); (b) also the *Open regression IDs*
   list in testing-manual.md — about twenty-five more rows, the DRG spoiler set among them — as a
   stretch if time remains.
8. **Two product calls that sit inside Verify entries.** Neither blocks the run; both block moving the
   entry to Done. **D55** (Steam's hidden tab buttons; built under option 1, and TAB-BAR-01 to 06 pass
   under it): lock option 1, or not. **CHAT-SLOTS-V3-14c** (the game's name above the chat title): show
   it always, or only while the row has focus. Recommendation: lock D55 on option 1; show the name only
   on focus, because the roadmap entry itself says the line costs height that the vertical-space goal
   wants back.
9. **Your hands.** Which of the in-person rows happen in Session 3 and which stay open: TAB-BAR-07
   (eyes), TAB-BAR-08 (touch), STREAM-FOLLOW-01's touch half, PRESET-ONE-LINE-04's speed-by-eye and
   reduced-motion halves, ASK-WIDTH-01 and BONSAI-ICON-GEOM-01 by eye (the rig measures and takes the
   PNG first), KB-ANSWER-02's feel run, CHAT-SLOTS-V3-15d's glance, the *Update knowledge base* thumb
   press from the Bugs list, KIDS-LOCK-01 (Family View PIN on a spare adult account, then the rig runs
   KIDS-FOCUS-01), KIDS-LOCK-02 (a child account; the row already allows it to stay Open), VAC-03 to 06
   (you type the Steam Web API key, the rig drives the rest), and the quick-launch macro (Steam Input,
   never run on hardware). Recommendation: schedule all of them except KIDS-LOCK-02 and the macro.

**Answers, 2026-09-03, all nine locked** (the maintainer answered by number in chat):

1. The window is open now; the other chat is done. The rig runs unattended for a few hours and the
   maintainer checks back on progress in chat.
2. Go: the five unnamed chips are dropped and the batches are pinned as written in plan 31 § 4.
3. The rig launches and exits games. Ocarina of Time runs as **Ship of Harkinian**, a non-Steam
   shortcut (`soh.appimage`, shortcut app id `2593781457`), and runs well. `deck_launchGame` needs it
   on the Recent Games shelf; if it is not there, those sentences wait for the maintainer to play it
   once.
4. Yes: Clear all plugin data runs as its own last phase, after a copy of settings and chats is taken
   aside (done 2026-09-03 00:48: `settings.json.bak-round31` and `~/bonsai-round31-chats.tgz`); the
   rig waits for the words "clear it" in chat before running it.
5. Left to the rig's judgment. Deferred: disk is not the problem (735 GB free under `/home`), but the
   row needs a custom setup profile driven through the UI and is the only row that adds files to the
   device; it runs only if the Verify rows finish with time left.
6. SMOKE-B is retired and comes off Tier 1.
7. Scope is the Verify rows plus the three tab-bar re-runs; the wider regression list only if time
   remains.
8. D55 locked on option 1. CHAT-SLOTS-V3-14c: the game's name above the chat title shows only while
   the row has focus. That is a code change now owed; the entry stays in Verify until it ships and
   passes on the device, and this round only confirms the name is stored and shown for a chat created
   while a game runs.
9. The in-person list is plan 31 § 7, written in plain terms with what is needed and when. The rig
   never ticks those boxes; only the maintainer clears an item, after seeing it themselves.

### D58 — LOCKED 2026-09-04 (raised 2026-09-04) — The bug-fixing session: nine calls before "go"

[Plan 32](../planning/32-bugfix-session.md) sorts the roadmap's twenty Bugs entries into thirteen to fix
now, two that need a call, two that are research for another conversation, and three that are
bookkeeping. It puts the thirteen into five lanes that run at once and one serial Deck phase. Nothing
in the code blocks it. Checked read-only on 2026-09-04: the Deck already runs this checkout (hashes
match), the rig is armed and the board is on `COM7`, no frozen batch is pinned, tests are green here,
and the focus linter is red on a clean tree with three findings newer than its baseline. What blocks
the session is nine things only the maintainer can decide. Answer by number in chat; the answers get
copied here.

1. **Scope.** (a) all thirteen fixable entries in plan 32 § 2a (recommended); (b) the nine `[focus]`
   entries only, leaving the two chip entries, the arms report and the overlay for another day.
2. **Up from the preset chips.** Today one Up press steps back one chip through the carousel history
   and can take five presses to leave the row. (a) Up leaves the row at once, Left keeps walking the
   history (recommended); (b) keep it as it is and close the entry as accepted.
3. **A frozen batch longer than the row.** (a) Right at the last visible chip pulls the next batch
   entry in, and an Ask restarts the sixty-second walk (recommended: it fixes both ways the batch
   got stuck on 2026-09-03); (b) only the Ask restarts the walk; (c) only the edge advances.
4. **Streaming in bursts with a game running.** Measured 2026-08-28: the overlay drops to 47 fps only
   during a burst and is flat 60 otherwise; the game's own frame rate is unmeasured. (a) accept it and
   move the entry to ACCEPTED (recommended: it is a nice-to-have by the earlier call, and it does not
   gate anything this session); (b) keep it open until the game-side frames are measured with the
   maintainer's FPS overlay.
5. **Focus ring styling, PARTIAL.** (a) skip this session (recommended); (b) include a small pass.
6. **The focus linter's three new findings.** (a) the orchestrator triages each in Phase 0: fix what
   is a real defect, baseline what is deliberate with a one-line reason in the commit, and file a
   Bugs entry for anything real that is not a one-line fix (recommended); (b) baseline all three now
   and look later; (c) leave the linter red and skip it as a gate.
7. **Models.** (a) Fable at max as the orchestrator and Sonnet 5 at high effort in all five lanes
   (recommended; the two subtle fixes are decided by device measurement, not by the model); (b) Opus
   for lanes A and D, Sonnet elsewhere.
8. **The Deck window.** The session needs the device for two short blocks: about half an hour of
   measurements early on, then about two hours of verification after the fixes land, with one deploy
   in between that restarts Decky Loader. Every other chat has to stay off the buttons for both
   blocks, and the maintainer should not be playing on it. (a) the window is open now and the rig
   may also carry on into plan 31 § 5 step 6 afterwards if time remains (recommended); (b) the two
   bug blocks only, plan 31 waits; (c) not tonight.
9. **The unfiled sixth bug from session 1** — a deterministic command reply (`bonsai:vac-check`)
   leaves the turn header reading `…` and the chat titled *New chat*. (a) file it in Phase 0 and let
   lane A try it only after its own two bugs, stopping if the cause takes more than an hour to find
   (recommended); (b) file it and leave it; (c) do not file it.

**Answers, 2026-09-04, all nine locked** (the maintainer answered by number in chat; #2 after a mockup):

1. All thirteen.
2. (a): Up leaves the row at once; Left keeps walking the history. Answered 2026-09-04 at 18:50 after
   an interactive mockup. The maintainer also asked for a visible end-of-row cue, filed as a Features entry.
3. The recommendation: Right at the last visible chip pulls the next batch entry in, and an Ask restarts
   the sixty-second walk.
4. Accepted. The entry is marked **ACCEPTED 2026-09-04** and stays in Bugs under that word; the
   STREAM-11 row says so.
5. Skipped this session.
6. Yes: the orchestrator triages the three findings in Phase 0. Outcome: all three are deliberate and are
   baselined, each with a written reason in the commit and in plan 32 § 10.
7. Sonnet 5 at high effort in every lane.
8. Yes, when the device is free. Another chat is driving the Deck for several hours from about 17:00, so
   the desk half runs now and the Deck half waits. The rig watches the `runs/` folder and the tunnel
   registry; after thirty quiet minutes it announces in chat and proceeds ten minutes later unless told
   to wait. It may carry on into plan 31's remaining rows afterwards.
9. Yes: filed in Phase 0 as a ★★ `[chat]` entry; lane A may try it after its own two bugs, one hour cap.

### D59 — LOCKED 2026-09-05 (raised 2026-09-05) — Model and effort routing: adopt plan 33 § 2 as policy?

The measured cost and outcome record is in [docs/planning/33-model-routing.md](../planning/33-model-routing.md).
Five calls, answer by number:

1. **The routing table (plan 33 § 2).** (a) adopt as written (recommended); (b) edit rows first, say which.
2. **Orchestrator for bug-fixing sessions.** (a) Opus 5 at xhigh (recommended: it reviews diffs, resolves docs
   conflicts and drives the Deck, and Fable max was more than half the 09-04 session's cost); (b) keep Fable 5.1 max.
3. **What lanes may edit.** (a) code, tests and a one-paragraph report only; the orchestrator moves roadmap,
   testing and changelog rows in one commit per landing (recommended); (b) keep plan 32's split where lanes move
   their own rows.
4. **Haiku 4.5.** (a) try it for read-only lookups with a checkable answer in the next lane session
   (recommended, it is nearly free); (b) leave it out of this project.
5. **Where the policy lives once locked.** (a) copy the table into AGENTS.md and link plan 33 for the evidence
   (recommended); (b) keep it in plan 33 and link from AGENTS.md.

**Answers, 2026-09-05** (the maintainer in chat: "sounds good on the refactoring and subagents, add that";
"go ahead and write the AGENTS.md file"): 1 (a), 2 (a), 3 (a), 5 (a). The table and rules are in
AGENTS.md § 3; the roadmap carries a six-line rough guide. **4 (a), locked later the same day with a
condition:** Haiku 4.5 is on trial for read-only lookups, every use logged in plan 33 § 4a and grep-confirmed;
if Sonnet or Opus has to step in more than twice in ten uses, it is dropped.

### D60 — LOCKED 2026-09-05 (raised 2026-09-05) — The question bubble: how much of your question shows, and how you know there is more

Raised by the maintainer in chat: *"the users question in the chat bubble gets truncated immediately after an
ask. I think the whole prompt should be there, only collapse it when looking at earlier turns."*

What the bubble does today, before any change: the question is cut twice. The code chops it at 60 letters,
then the one-line rule chops it again at whatever fits the bubble — about 48 letters at this size — so the
second cut nearly always wins and the 60-letter one is never seen. The same cut applies to the turn you just
asked as to a turn from an hour ago; nothing looks at whether the turn is open. Pressing A on the bubble
already opens and closes the answer, so A was not free.

Four calls, answered in chat the same day:

1. **The A button clash.** (a) tie the whole question to the turn being open, so A already does both
   (recommended); (b) give the question its own open and close, which adds a D-pad stop to every turn and
   pushes against the "fewer stops on a reply" item.
2. **How much of a long question shows when the turn is open.** (a) all of it; (b) a cap, and if so what.
3. **What the cue looks like when the ring lands on a cut question.** Four options were drawn against the
   plugin's real colours and column: (A) the text fades out at the right-hand edge instead of ending in three
   dots; (B) a small arrow slides in on the left; (C) the three dots brighten and breathe; (D) a hairline
   appears under the text.
4. **Does the cue show for a finger too?** (a) ring only; (b) both.

**Answers, 2026-09-05:** 1 (a). 2 — **a cap of five lines**, with the last line fading out. 3 — **option A**,
after a correction: A and C were first recommended together, and the maintainer spotted from the drawing that
only one effect was visible. Both cues live in the same few pixels at the bubble's right edge, and the fade
goes fully see-through there, so it rubbed the dots out. A on its own is the only option that adds nothing and
shifts nothing. 4 (a), ring only.

The drawings are kept at [docs/demos/question-bubble-cue-mockups.html](../demos/question-bubble-cue-mockups.html) —
open it in a browser. It carries the four options, the wrong pairing, and two pairings that do work, so nobody
has to re-draw them to understand why A won.

**Two notes for whoever builds this.** The fade wanted here already exists in the stylesheet, written for
cut-off answer bubbles and currently used by nothing; the one in there starts halfway down and would wash out
three of the five lines, so it needs pulling back. And **one check is owed before the cue is built**: the
question bubble switches its own outline off and is not on the list of controls that get the plugin's ring, so
what it actually shows when focused has to be looked at on the Deck. Every version of this cue is triggered by
focus.

Both halves are on the roadmap as two-star chat entries — the cut question under Bugs, the cue under Features.

---

### D61 — LOCKED 2026-09-05 (raised 2026-09-05) — The feature verification round: what is in scope, and what waits

Raised at the start of the round planned in
[planning/34-feature-verification-round.md](../planning/34-feature-verification-round.md). The Verify list
had 23 entries owing a device check and the round needed its edges drawn before anything was pressed.

**Answers, 2026-09-05, all eight locked** (the maintainer answered in chat):

1. **Start shape.** Desk work begins immediately; the device work waits for the maintainer's word. The
   other chat finished the same evening and handed the device over.
2. **The in-person block runs last**, as plan 31 § 7 has it — not first, even though the rig has now
   measured most of those items.
3. **Gated items.** A model pull is in scope. Clear all plugin data is in scope but **runs in the
   morning**, not overnight: the maintainer declined to authorise a destructive step in advance while
   asleep. The Family View PIN and the Steam Web API key are **out of scope** this round, so the kids
   lock and the ban lookup entries stay in Verify.
4. **On a failure: file it and carry on.** Write the bug into the roadmap with the evidence named and move
   to the next check. No fixes during the round.
5. **Length: one long overnight run.**
6. **The chat-slot game name stays in Verify and is not checked.** D57 #8 decided the name should show
   only while the row has focus; that code was never written, so the entry is waiting on code, not on the
   device.
7. **Scope: the Verify list, plus a free walk of every screen** — every stop reachable and every stop
   visible. Wider than D57 #7, which kept to the Verify rows alone.
8. **Deploy first.** The device was running a build from before the two colour fixes; verifying an old
   build risks passing something since changed and failing something already fixed.

**Consequence worth recording.** Three entries cannot close overnight because they all depend on the data
clear: the voice fixes, the shell and tab payload extraction, and the reopen half of the cache-clear
entry. They close in the morning in one short block.

### D62 — LOCKED 2026-09-05 (raised 2026-09-05) — The second bug-fixing session: four calls before "go"

Raised at the start of the session planned in
[planning/35-bugfix-session.md](../planning/35-bugfix-session.md). Seventeen entries sat in the bug list;
five of them were already settled one way or another, and the rest needed their edges drawn before any
code was written.

**Answers, 2026-09-05, all four locked** (the maintainer answered in chat):

1. **Scope: all eleven fixable bugs.** The stuck panel, nothing highlighted when the panel opens, the
   answer paragraph hidden behind the question box, the trapped unrevealed spoiler block, the branch
   picker leaking between chats, the question cut off after 48 letters, the missing *Stopped* notice, the
   wrong "no active game" line, the three dots where a game name belongs, Speed paying for the slow
   search, and the search that got a fifth slower. **Out:** the ring-styling design call (skipped once
   already under D58 #5), the router that needs a topic word, and the retrieval blend deferred under D38 —
   all three are decisions and measurements, not fixes, and each wants its own conversation.
2. **Speed mode does the quick keyword lookup and nothing else**, which is what its test row has always
   said. Takes about a second off every Speed question on the device. The trade the maintainer accepted:
   a Speed answer loses the cards that only the meaning search finds — the ones whose wording does not
   match the question. Strategy and Expert are untouched. If Speed answers get visibly worse, the fallback
   already sketched is to run the meaning search only when the keyword hits are thin, which is a threshold
   somebody has to pick and measure.
3. **Both paired features are in.** The fade on a cut question (chosen 2026-09-05 under D60, and nearly
   free alongside the cut-question fix, same file, the fade already unused in the stylesheet), **and** the
   glow at the end of the chip row. **Worth recording about the second one:** it is motion, so no
   measurement closes it — it ends on the maintainer's own checklist as a picture or a recording to judge,
   not in the done list.
4. **Wiping all plugin data is authorised, with a message first.** The session sends word right before
   pressing it and waits. **If no reply comes before the run ends, the wipe does not happen** — three
   entries stay open rather than a destructive step going ahead unanswered. Backups were taken in round
   34 block 0 and are still beside the settings file and in the home directory; they are restored
   immediately afterwards and read back off disk to prove it.

**Consequence worth recording.** Two of the eleven — the stuck panel and the unhighlighted open — have no
measured cause yet, so the routing policy keeps them off a helper lane. The session's own driver takes
them, after a device measurement, and if that measurement does not name a cause they are written up with
their numbers rather than guessed at.
