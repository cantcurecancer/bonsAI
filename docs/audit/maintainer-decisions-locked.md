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

**Two open:**
[D18](#d18--when-loading-settings-fails-four-values-keep-whatever-was-on-screen-bug-or-intent)
(raised 2026-08-05 by the step 11 friction test) and
[D33](#d33--the-new-character-avatars-were-drawn-for-44px-the-picker-shows-them-at-24px-which-one-moves)
(raised 2026-08-26 from the AI character avatars design handoff).
**D32, D34 and D35 are all locked and implemented** (2026-08-27) — three separate causes of the one
*Clear cache* bug, which is now fixed and confirmed on device. **D23–D27 were raised and locked during the RAG
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

### D33 — The new character avatars were drawn for 44px. The picker shows them at 24px. Which one moves?

**OPEN, but now only for the character picker — raised 2026-08-26 from the AI character avatars
design handoff.** Full intake:
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

### D19 — Mixed CC BY / BY-SA cards in one corpus file? *(superseded by D20, 2026-08-14)*

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
license header, `NOTICE` separation) already fully discharges the obligations D19 was written
to avoid taking on. No new legal information; a re-weighing of cost against what BY-only
excluded (all six ShareAlike wikis).

---

### D20 — Publish the corpus as one CC BY-SA 4.0 work, including ShareAlike sources

**Raised and locked 2026-08-14**, during Phase 6 publish planning. Supersedes D19.

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

**Why.** No code anywhere filtered by license — D19's restriction existed only as a paragraph
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

### D18 — When loading settings fails, four values keep whatever was on screen. Bug or intent?

**OPEN — raised 2026-08-05 by the step 11 friction test.**

**What's going on.** If `load_settings` fails, `usePluginSettings.ts` resets state to
defaults so the UI does not show values it could not actually read. That reset lists **40**
setters. Five other lists in the same file enumerate all of them. Four are missing from this
one and nothing says why:

- `setReplyLanguage`
- `setTextModelRoutingOrder`
- `setVisionModelRoutingOrder`
- `setStrategySpoilerAutoRevealAfterConsent`

**Why it matters, and why it probably has not bitten.** The branch only runs when the backend
read fails, which on a healthy Deck is never. When it does run, those four keep whatever was
already in state — on a first open that is their default anyway, so the visible effect is
limited to a failure *after* a successful load, e.g. a backend restart mid-session. Then the
UI would show a reply language or try-order it can no longer confirm is saved. **No test
covers this branch at all**, in either direction.

**Option A — add the four, and a test.** *(my recommendation)* Makes the branch mean one
thing: a failed load shows defaults, full stop. Cheap, and the test is what stops the list
drifting again.

**Option B — leave them out and say why.** Legitimate if the omission is deliberate — e.g.
routing orders are expensive to re-derive and a stale one is better than an empty one. Needs
a comment naming the reason, or the next reader files this again.

**Option C — delete the reset branch.** Honest if the answer is "a failed load should change
nothing." Biggest behavior change of the three and the least likely to be what you want.

**This is a symptom of the D14 item, not a separate problem.** Six hand-maintained copies of
one field list in a single file is exactly what the friction test ranked first; fixing the
plumbing removes the *class*. Answer this one anyway — it is live behavior, and the collapse
is not scheduled.

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

