# 37 — The knowledge base, zoomed out (status report, 2026-09-07, fourth pass, wave two landed)

Written from the roadmap, the knowledge-base architecture doc, the answer-quality plan, the locked
decisions, the last eval reports, the last three session plans and the code. Plain language on
purpose. It says where things stand, what each next step would buy a person using the plugin,
roughly what it costs, and what is in the way. Links are at the end, not in the sentences.

**The live list is the roadmap's [Knowledge base and RAG](../roadmap.md#knowledge-base-and-rag)
section.** That is where entries move as work lands. This report is the zoomed-out view behind it and is
updated whenever that section changes shape; the date in the title says when it was last brought in step.

**Stars say how big a job is** — effort and risk together, on the roadmap's scale: `★` easiest up to
`★★★★★★` extreme scope. Every item below carries one, finished or not, and where an item also has a
roadmap line it carries the same stars, so the two files can be read side by side. The one list without
stars is section 6, because what is in the way is not a job anyone can size.

---

## 1. The picture in one paragraph

With one of the twenty-five covered games running, a Strategy or Expert question gets the best one to
five notes from a library of **293 game notes** glued onto the instructions the AI reads, and a
troubleshooting question gets tips from a sheet of **156 Deck tips**. On questions written without looking
at the notes, the search puts the right note in its top three 84 times in a hundred and first a little
over half the time. The small model on the Deck keeps the facts from the notes about seven times in ten
and almost never contradicts them — though wave two found that **both of those checks undercount what the
model actually gets right**, see section 4. Release `2026.09.07` carries the newest notes and the
rewritten troubleshooting tips and is **live on both places it publishes to**. **It is not yet on the
maintainer's Deck** — the Deck still runs `2026.09.06`, and updating it and checking it on the device is
still owed, starting with wave two's own evening.

**Coverage was the thing wave two set out to fix.** Of the 72 questions a player might plainly ask about
the twelve games added earlier this month, only 43 had a note behind them a month ago. **64 do now** —
the other eight were written on purpose to have none, and stay blank as a control, so every question that
was meant to have an answer now has one.

## 2. What has been built, in order

| When | Stars | What shipped | What a person noticed |
|---|---|---|---|
| Late July | ★★★★ | Keyword search over per-game cards, a troubleshooting tip sheet, a first "hybrid" | Game questions started arriving with notes attached; Show details said which search ran |
| 5–9 Aug | ★★★★ | The retrieval rework: word search and meaning search genuinely combined, a relevance floor, follow-ups searching the user's words, honest transparency | Fewer irrelevant cards stapled on; the trust label stopped over-claiming |
| 6 Aug | ★★ | Troubleshooting routing widened | Questions that name a topic reach the tip sheet; before, 3 of 40 did |
| 14–16 Aug | ★★★★ | Public corpus on Hugging Face with a GitHub mirror; download, update, remove from the Ollama tab | Anyone can install the library from the plugin |
| 18 Aug | ★★★ | The meaning search searches on its own instead of re-ordering keyword hits; Expert mode gets the full card budget | "How do I kill the big armoured bug boss" finds the Dreadnought card; Expert stops being starved |
| 19–21 Aug | ★★★ | Chip guarantee and Tip badge; 16 structured enemy/item/boss cards for two titles; cards with labelled lines | A game chip always appears when the corpus knows the game; the two sample games answer "how do I deal with X" |
| 28–29 Aug | ★★★ | 107 blind test questions (written without reading the cards), a second relevance signal for the meaning search, ten cards re-typed | The eval became honest; unrelated chatter attaches fewer cards |
| 29–31 Aug | ★★ | 28 new cards: State of Emergency, the Hades weapons, the antlion split, entity cards for Cyberpunk, Fallout 4 and Red Dead, three comparison cards | Corpus 133 → 161 |
| 1–2 Sep | ★★★ | Corpus point release 2026.09.01 published and installed on the Deck; the answer test built and baselined | The Deck finally has the newest 28 cards; the answer side has numbers |
| 2–3 Sep | ★★ | Spoiler fence misfire fixed and measured; prompt budget guard so a long log paste cannot push the instructions out of the model's window | Fewer replies with harmless tactics hidden behind a spoiler box; confirmed 5 of 5 on the Deck |
| 3–5 Sep | ★★ | Deck verifications: Expert mode cards, boss-by-name phrasing, all four coverage readings, wiki credit with date, troubleshooting routing, the seed hint | Six knowledge-base entries moved to Done |
| 6 Sep | ★★★★ | Eleven more games written up from their wikis — 105 cards, each naming the page it came from, the licence and the day it was read | Nothing yet: the cards exist but are not in a release, so no Deck has them |
| 6 Sep | ★★★ | 72 blind search questions and 24 answer-test rows for the twelve new games; the search test gained a weight sweep, per-question card detail, and a second right answer | Nothing yet: measurement plumbing only |
| 6 Sep | ★★★ | Speed mode's remaining meaning-search leak confirmed fixed on the Deck | A Speed question no longer spends about a second on the slower search |
| 7 Sep | ★★★★ | 27 new notes filling the 21 real gaps in the twelve new games, plus topping up the four thinnest of them | Someone asking about Doom 64, Mario Kart 64, Super Mario 64 or Paper Mario mostly gets a real answer now, where before they mostly got nothing |
| 7 Sep | ★★★ | 32 troubleshooting tips rewritten, and the routing that refused a plain "crash" question fixed | "My game keeps crashing" now reaches real advice, where before it reached nothing at all |
| 7 Sep | ★★ | Every note and tip guaranteed to have its meaning index before it can ship | Nothing directly — it stops a half-built library from reaching a Deck quietly |
| 7 Sep | ★★ | The "not in my notes" line | On a Strategy or Expert question about a covered game where nothing matched, one quiet line under the reply now says the answer is the model's own knowledge, not the notes |
| 7 Sep | ★★ | Two bug fixes: raw computer text stopped appearing in a reply, and the panel stopped naming a game after you close it | An answer no longer ends with a line of code; the line under the question box catches up within a couple of seconds of exiting a game |
| 7 Sep | ★★★ | Corpus release `2026.09.07` published (293 notes, 156 tips) | Nothing yet on the Deck — the release is live on both channels but the maintainer's device still runs the 6 September build |

Chip work that touches the knowledge base also shipped in this window: corpus chips no longer vanish
after 21 seconds, the rotation no longer favours the top three, and the pinned test-chip batches exist
for QA.

## 3. The numbers today

*(All of these were taken on 7 September on the library that actually ships — 293 notes, 25 games — after
the search test's own copy was found to be stale and rebuilt by hand. **Every search number dated 6
September or earlier in this report's history is void**: the test reuses whatever copy of the library it
finds unless someone passes a rebuild flag by hand, nobody had, and it had quietly been measuring a copy
from 31 August with 161 notes in it for weeks. That includes this wave's own starting measurement and
everything wave one reported. Do not act on a search number from before 7 September.)*

**Search — before wave two and after, on the library that ships.**

| Question set | Before | After |
|---|---|---|
| Right note in the top three, on questions nobody tuned against | 80 in 100 | **84 in 100** |
| The 72 questions about the twelve new games, right note in the top three | 38 | **58** |

All 21 of the newly answered gap questions find their note in the top three; 12 find it first. Two rows
out of 413 got worse against 24 that got better.

**Answers, the Deck's own model, three runs each, no judge model.**

| Check | Before | After |
|---|---|---|
| Clean on all three runs | 55.7 in 100 | **62.3 in 100** |
| Spoiler line appeared when it was due | 77.8 in 100 | **88.9 in 100** |
| Facts from the note kept | about seven in ten | the same figure, but it undercounts — see below |

**Two of the checks behind these numbers are now known to be wrong, and neither was fixed this wave on
purpose, so the before and after above are measured the same way.** The "never contradicts its note"
figure this project has quoted as 100% is not trustworthy: asked whether Pikmin 2 still has a day limit, a
reply said yes when the note says no, and the check missed it because it only watches for two fixed
sentences and the model used neither. And the facts-kept score is **lower than the truth**: the check
looks for a phrase inside the reply, so an answer that says "thin the crowd" fails a check written for
"keep the crowd thin" even though it is right — several of today's failures were right answers marked
wrong.

**Troubleshooting.** Of 24 plainly-worded problem sentences written by someone who had not seen the
rules, **6 reached the tips before this wave and 8 after.** The tips themselves are much deeper now —
crash went from 2 to 9, sound 1 to 8, picture 1 to 8, performance 2 to 10, controller 6 to 10 — but the
rules still catch the exact wording someone imagined rather than the idea behind it.

**The Deck, still true.** Searching by meaning still takes about a second — 1.10, 1.23 and 1.19 seconds
across three questions in a row, repeatably. The maintainer has accepted that as fine and the one-second
target stays retired.

**The library.** 293 notes over 25 games, 156 shared Deck tips, **every one of them indexed** — the build
now refuses to finish if any note or tip is missing its meaning index, where it used to only print a
warning. 1.39 MB to download. Schema stays at 3, so nothing already installed goes stale.

## 4. What is open right now

**Bugs.**

- ★★ **Raw computer text could appear in a reply — FIXED 7 September, Deck check owed (row W2-R6).** An
  answer used to end with a line of code-like text sitting where words should be. The block is now removed
  the moment it is read, and a code example someone actually asked for is left exactly as it was.
- ★★ **Unrelated questions still get game cards.** Accepted 27 August; not being worked.
- ★★ **The panel kept naming a game after it is closed — FIXED 7 September, Deck check owed (row
  W2-R6).** Exiting a game used to leave the old name under the question box. **The cause first written down
  was wrong, which is worth keeping:** the ordinary keep-in-sync check does correct itself, in about a second
  and a half. The real hole was reopening the panel — after a popup, or leaving and coming back — which
  restored whatever name had been remembered without checking whether that game was still running. It now
  checks what is actually running at that moment.
- ★ **The ring can land half hidden behind the Copy or Retry icon — measured on the Deck 7 September.**
  Three stops on one long reply were focused while only partly visible. **The cause is now understood, and
  fixing it is a look-and-feel call rather than a plain bug fix:** every question bubble has a minimum height
  of 48 pixels, and on a short question that floor adds 18 pixels the bubble did not need, which is what
  pushes the icons over the reply's own stops. Doing nothing is defensible — it is a deliberate floor, not an
  oversight — so this waits on the maintainer rather than a lane.
- ★★★ **An answer said the opposite of its own note and the check waved it through — found 7 September.**
  Asked whether Pikmin 2 still has a day limit, a reply said yes; the note says no. The check that exists to
  catch exactly this looks for two fixed sentences and the model used neither, so it passed. Every "never
  contradicts its note" figure this project has quoted needs reading with that in mind.
- ★★ **The answer test marks a fact missing when the answer said it in different words — found 7
  September.** The check looks for a phrase inside the reply, so "keep the crowd thin" fails against "thin
  the crowd" and similar near-misses. Several of today's failures were right answers counted wrong, so the
  facts-kept score is lower than the truth.
- ★★★★ **The search test had been measuring a copy of the library from 31 August, missing half the
  notes — found 7 September.** The test reuses whatever copy it finds unless someone passes a rebuild flag by
  hand; nobody had, for weeks. Every search number this project has quoted before 7 September is void,
  including the numbers behind the held weight decision.

**Settled on 6 September, no longer open.**

- **Game notes thrown away on a long question** — fixed and confirmed on the device.
- **Speed mode paying for the slow search** — confirmed fixed on the device.
- **The meaning search being about a fifth slower** — accepted. About a second on every question is the
  measured, accepted cost. The warm-up explanation was proven wrong for the Deck: the third question was
  no faster than the first.
- **The shipping blend losing to its meaning half** — measured, and held. Numbers are in section 5b and the
  decisions file. **Not yet re-checked against the stale-copy bug below**, which affects the same test — read
  them with that in mind.
- **A symptom-only troubleshooting question reaching no tips** — built, measured, held. It does not work:
  matching by meaning cannot connect the words a person uses for a crash to the way the crash tips are
  written. Rewriting the tips is the real job and now has its own roadmap entry. **Widened on 7 September**
  and the widening is the bigger half — see the next paragraph.

**Owed on the Deck.**

- ★★★★ **Wave two's own evening.** Rows **W2-R1** through **W2-R8** in
  [plan 47](47-kb-wave-two-session.md) § 8 — installing the release, the twelve new games, the filled gaps,
  the troubleshooting tips, the "not in my notes" line, the two bug fixes, and the ring measurement. Not
  started.
- ★★★★ **One question per new game on the device.** The only wave-one row still owed. Fallout: New Vegas
  has to be installed first.
- ★ Five older checks from the August retrieval rework, never run on the device. Worth one evening with
  pinned test chips, or worth closing.
- ★★★ One glossary word, tapped rather than reached with the D-pad.
- ★★★ The download Cancel button, which cannot be checked at all: the download finishes in about a second,
  so there is no window to press it in.
- ★★★ Which way a too-long chip label is cut off. Behind the preset-row work.

**Your calls.** Four were decided on 7 September while wave two was planned (D85): fill the 21 real
note gaps and top up the four thinnest games, keeping the eight deliberate blanks as a control; the "not in
my notes" line reads *"Not in my notes — this answer is from the model's own knowledge."*; the meaning-index
work ships the guarantee and only measures the tie-break; and the ring bug is fixed by the session running
the wave rather than a helper. Four were decided on 6 September: the symptom-only search is held and
rewriting the tips is the real job; leaning the search toward meaning is held until every note is guaranteed
to have its meaning index built; the twelve new games ship with their coverage gap known and accepted; and
about a second to search on the Deck is fine.

**One call is open.** A note written 7 September, from the writer's own memory with no source, claims that
the current in Black Mesa's electrified water is not constant — that it arcs on a cycle, with a spark and a
crackle just before it charges, so a player should move while the water is dark and wait while it is lit.
No page says this, and it shipped in the 2026-09-07 release. **Either confirm it from the game, or say the
word and it comes out** — if it comes out, that goes out as its own point release. Full entry under the
roadmap's "Calls waiting on you." **The ring bug above is also waiting on a call, not a fix:** the
48-pixel minimum bubble height is deliberate, so leaving it alone is defensible, but it does cost 18 pixels
on every short question.

## 5. Next phases: what each buys, and what it costs

Effort is in focused working days for one session with your calls already in hand, plus the star
scale the roadmap uses. "Buys" is what a person using the plugin would notice, with the evidence
behind the claim where there is any.

### 5a. Finish the answer-quality plan agreed on 1 September (about two to three weeks in total)

| Item (with its stars) | What it buys | Evidence | Cost | In the way |
|---|---|---|---|---|
| ★★ **Fix the two ways the answer test lies** — roadmap "pick up here" item 1 | Every answer number this project has quoted rests on a check that missed a real contradiction and a check that undercounts facts kept; nothing else should be decided from those numbers until this is done | Both found 7 September while taking this wave's own measurements, see the bugs list above | Cheap | Nothing named yet — not started |
| ★★★★ **Make the search test rebuild its own copy of the library** — roadmap "pick up here" item 2 | No search number can be trusted for a decision, including the ones the held weight decision rests on, until the test stops silently reusing a stale copy | Found 7 September: the copy was from 31 August with 161 notes, so every question about the twelve new games scored zero regardless of the real library | Cheap | Nothing named yet — not started |
| ★★ **Prompt diet** — **SHIPPED 6 September** | The small model reads nine tokens of instruction for every token of knowledge; fewer rules means better rule-following and ~340 tokens back in a 4k window. Expect a few points on facts kept and a slightly faster first token | The citation instruction was obeyed once in 89 asks and the UI cannot render it | Done | None. Instructions fell from 6,930 to 5,682 characters; moving the notes next to the question was measured and rejected, because it placed the spoiler warning correctly far less often |
| ★★ **"Not in my notes" line** when a game question matches nothing — **SHIPPED 7 September, Deck check owed (row W2-R5)** | A person can tell an answer from the notes from one out of the model's memory. Does not change the answer; changes trust | Your own May note of a confident, wrong, tidy reply with no notes | Done | None. Wording: *"Not in my notes — this answer is from the model's own knowledge."* Confirming it works the same on the Deck is the only thing left |
| ★★★ **Spoiler tiers setting** — strict / default / open | A strict player stops seeing boss tactics; an open player stops seeing fences at all. Today one rule fits everyone | The tiers are confirmed; the fence fix showed prompt wording moves the misfire rate 24 points | 3 days: settings plumbing (~18 files), a prompt per tier measured on the answer test, a control with a focus entry, Deck QA | Nothing, once the bug session releases the prompt file |
| ★★★ **Follow-ups remember** | "What about the second phase?" gets an answer about the boss you were just asking about. Today the model receives only the newest message and the follow-up searches nothing | Agreed 1 Sep: carry the previous turn's named thing into the search first; chat history later, trimmed to the window | 1 day for the carry-over; 2 more for history within the budget | The 4k window: a Strategy reply can be 900 tokens |
| ★★★ **A troubleshooting question mostly never reaches the tips** — **routing widened and tips rewritten 7 September, still short** | *"My game keeps crashing"* now gets crash advice where before it got nothing. Of 24 fresh problem sentences written blind, 6 reached the tips before this wave and 8 after | Measured 7 September: crash tips went from 2 to 9, controller 6 to 10, and similar gains elsewhere. But the rules still match the exact wording someone imagined rather than the idea behind it | Done for this wave; the rest is unscoped | **What's missing is a way for the search to say "none of these tips fit."** The held meaning-search branch was re-measured on the new tips and stays held: with nothing running it reaches all 24 sentences, but what it attaches is often the wrong tip — the same objection that held it before |
| ★★ **Eval tooling** — weight sweep on the tuning set, per-case output for the shipping blend, rows that may list a second right answer | Nothing a user sees. It is what unblocks the weights decision and stops every card batch reading as a regression | **Shipped 6 September, and the sweep has now been run** — see section 3. No question uses the second-answer option yet | Done | None |
| ★★★ **"Starting out" card kind**, then the Cyberpunk / Fallout / Red Dead orientation cards | A new player gets a "how do I get started" chip and a matching answer; today those three cards read as "What should I know about Choosing a build?" | Your gap-sheet asks on 29 Aug | 1–2 days plus a corpus rebuild and release | Your call on the kind |
| ★★★ **Card style pass** — rewrite the 139 prose cards as labelled short lines | Possibly better fact retention by the 2B model. Facts kept is already 92%, so the ceiling is low; do it only if the answer test says the labelled shape scores better | The six labelled cards kept content accurate 6 of 6 on the Deck, but the labels themselves survived 1 of 6 | 2–3 days of content, a rebuild and a release | Measure first |

### 5b. ★★★★ The retrieval decision (one day of work, then your call)

The four stars are the risk of changing what every question goes through, not the size of the change
itself — the change is one line, and the tooling it needs is the ★★ eval row above.

**Done on 6 September, and the answer was not the one expected.** The sweep ran, the winning balance was
confirmed on the held-back questions, and it was still reverted — it buries a newly added note until its
meaning index is built, it lets the meaning search push aside a note that exactly matches the words
someone typed, and it breaks one case of a locked decision. Numbers and the full reasoning are in section
3 and in the decisions file.

**What would unlock it — and read this carefully, because it is easy to get wrong.** Guaranteeing every note
has its meaning index answers **one of the three objections**, not all three. The other two — a note whose
words exactly match being pushed aside, and one case of the locked topic-preference decision — are untouched
by that trigger. So the guarantee on its own does not deliver the four-to-six points; it removes one blocker
of three.

**The route that could deliver them** is the follow-up the decision itself recommends: leave the balance
alone and change only the tie-break, so meaning wins where there is no strong word match. That targets the
same gap without touching any of the three rules. Wave two ships the guarantee — worth having on its own,
because the corpus build has three separate ways to put unindexed notes on a device and only warns — and
**measures** the tie-break, so the next call comes with numbers rather than a hope. (D85)

### 5c. Corpus phases

| Phase (with its stars) | What it buys | Cost | In the way |
|---|---|---|---|
| ★★★★ **Phase 4 track 3 — per-game Deck tips** | Troubleshooting a covered game gets that game's own quirks (launch options, a known-broken layout) instead of generic tips. Content for seven titles is collected; two verified quirks are from your own Deck | 2–3 days: a schema bump, the builder, ten or so tips, an eval label, a release, a Deck reinstall | The schema bump makes every installed corpus stale until re-downloaded; bundle it with the next release |
| ★★★★ **Phase 5 — entity depth, now across 25 titles** | "How do I deal with X" works for more of the library; chips get variety (a game with only mechanic cards offers one flavour of chip). More cards is also the data the weights decision wants | 3–5 days of content for 40–60 cards, in tranches with a quality read from you after the first; chip vector ranking (the second half of Phase 5) 2–3 days | Whoever writes a card cannot write its blind test question, so authoring and eval rows go in different sessions; every batch lowers "first place" a little until second-answer rows exist |
| ★★★★ **Phase 7 — infrastructure** | Mostly nothing at 266 cards. Three pieces do matter now: **pulling the embedding model as part of installing the library** (a person without it silently gets word search only and loses the whole meaning search; a button and a hint exist, it is not part of the flow); **thumbs-down demote** (a wrong card stops coming back); **packs** (needed before a large catalog). An approximate-nearest-neighbour index buys nothing until the corpus is thousands of cards | Embed pull 1–2 days; demote 3 days; packs 5+ days; index 2–3 days; vision-to-cards a 1–2 day spike first | None for the first two |
| ★★★★ **Online / versus content** | Multiplayer questions (roles, callouts, co-op) get cards; today they get nothing specific | 2–3 weeks: new card kinds, a spoiler table update, Left 4 Dead 2 versus cards, then Counter-Strike 2, from archive dumps only | Source policy and licensing per card; a rebuild |
| ★★★★★ **Community tip contribution** | A reader can turn a good reply into a proposed card with one press | 3–5 days | Unblocked since the public publish |
| ★★★ **Visual maps** | A boss outline with weak points marked, or a dungeon map, in the reply | Research first; weeks | What a map is made of is undecided; authoring sits behind the source policy |
| ★★★★★★ **Phase 8 — catalog corpus** | The thing that changes the product: most people's games get notes instead of the model's memory. Top 1000 Steam, top 100 Deck, an emulated slice | Months. It cannot be hand-written (161 cards took six weeks by hand). Needs an ingestion pipeline from wiki dumps, per-source licensing, a size budget (the docs mention ~5 GB), packs, and the index above | Everything above it, and a source policy |

### 5d. What is near the ceiling, and what is not

The checks that exist on the answer side are close to their ceiling (facts 92%, menu 98%, card
attached 100%). Those checks are shallow: term overlap, a must-not-say list, a fence, a menu. Nothing
measures whether the answer was actually helpful, whether the model's own knowledge was right when no
card matched, or how the character voice changes the answer. Five Deck runs with a voice on lost two
facts to the voice. So the honest reading is: the pipeline delivers the cards and the model keeps
them straight; what remains is coverage, follow-up memory, and the things the test cannot see yet.

## 6. What is blocking, in one list

1. **The two ways the answer test lies, and the search test's stale copy.** No answer number and no search
   number can be trusted for a decision until both are fixed. One check missed an answer that said the
   opposite of its own note; another marks a fact missing just because the reply used different words; and
   the search test had been quietly measuring a copy of the library from 31 August for weeks. Coverage is no
   longer the top blocker — wave two brought it from 43 of 72 to 64 of 72 — but nothing measured against the
   library or the model can be signed off on until these three are fixed.
2. **Fallout: New Vegas is owned but not installed on the Deck**, so its cards cannot be judged in place
   until it is. That is the only thing blocking the last wave-one device row.
3. **The "no new titles" rule** for Phase 5 is reopened for one tranche only; the catalog stays its own
   phase.
4. **Any schema change is a release that stales every installed corpus.** Per-game tips, a new card
   kind and the style pass all want a rebuild; they should ride one release.
5. **Card authors cannot write blind eval questions.** Content sessions and eval sessions must be
   separate people or separate sessions.
6. **The model and the window.** A 2B model with 4,096 tokens: every extra instruction, card or turn
   of history competes for the same space. Raising the window is an experiment nobody has run.
7. **Coverage and sourcing.** Thirteen titles, and new content must come from archive dumps with
   per-card credit. There is no ingestion pipeline; every card so far was written or pasted by hand.

## 7. Added to the roadmap on 2026-09-05

None of these had a roadmap line before this report. Each is either an agreed decision with no line to
track it, or a gap this read turned up. All of them now sit in the roadmap's knowledge-base section,
carrying the same stars they carry here.

1. ★★–★★★ **Rows for the agreed answer-quality items** that have no roadmap line: the prompt diet, the
   "not in my notes" line, follow-ups remembering, the eval tooling, and the card style pass. All
   five were decided on 1 September and live only in the plan's checklist.
2. ★★ **Pull the embedding model as part of installing the library.** Promote it out of the Phase 7
   umbrella. A person who installs the library but not the embedding model gets word search only,
   which is the weaker half by every measurement, and nothing tells them beyond a one-time hint.
3. ★ **Measure with the character voice on.** The Deck answers in a voice; the answer test runs with
   it off, and the five Deck runs lost two facts to the voice. One switch on the test, then the voice
   presets become measurable like the prompt is.
4. ★★ **A measured context-window experiment.** Raising the window to 8,192 as a Developer experiment
   with a game running, recording memory and time to first token. Agreed as "later, its own call" and
   then never written down.
5. ★★★★ **A bridge between Phase 5 and Phase 8: a first tranche of new titles.** Five to ten games you
   choose. It serves users and it is the data the weights decision is waiting for. Needs the "no new
   titles" rule reopened.
6. ★★★ **One release row for everything that needs a rebuild:** per-game tips, the starting-out kind,
   the style pass. Today they are three separate entries each carrying the same release cost.
7. ★ **Close or retire the five August QA rows** never run on the Deck. Either they are worth one
   evening with pinned chips, or they are superseded by the rows that passed this week.
8. ★★ **A latency budget for a game question.** The slowdown found last night only had a band to fail
   against because one QA row happened to record it. A written budget (embed time plus first token
   with a game running) turns the next regression into a failed check instead of a lucky catch.
9. ★★★ **Deeper answer checks, when there is time:** a small set of questions where the right answer is
   not on any card, scored for "did the model admit it did not know", and a helpfulness read by a
   person on ten replies a month. The current checks cannot see either.

---

## Sources

- [roadmap.md](../roadmap.md) — the Bugs, Verify, Features and Done lanes tagged `[KB]`
- [knowledge-base.md](../knowledge-base.md) — architecture, phase locks, the recall pass
- [30-kb-answer-quality-plan.md](30-kb-answer-quality-plan.md) — the answer-quality plan and its checklist
- [28-phase5-corpus-depth.md](28-phase5-corpus-depth.md), [18-phase4-track3-per-game-compat-tips.md](18-phase4-track3-per-game-compat-tips.md), [17-kb-online-versus-strategy-content.md](17-kb-online-versus-strategy-content.md)
- [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md) — D27, D38, D40b, D41, D45–D54, D65–D69
- [kb-embed-bakeoff-2026-09-06-arms.md](../archive/research/kb-embed-bakeoff-2026-09-06-arms.md) — latest search numbers, on all 266 cards
- [kb-answer-eval-2026-09-06-before-wave1.md](../archive/research/kb-answer-eval-2026-09-06-before-wave1.md) and [kb-answer-eval-2026-09-06-after-wave1-landed.md](../archive/research/kb-answer-eval-2026-09-06-after-wave1-landed.md) — answer numbers either side of the prompt work
- [46-kb-wave-one-session.md](46-kb-wave-one-session.md) — the wave that produced everything dated 6 September, with its progress log
- [47-kb-wave-two-session.md](47-kb-wave-two-session.md) — wave two, landed: the 27 gap-filling notes, the troubleshooting path widened, two bugs fixed, the index guarantee shipped, the "not in my notes" line, and the `2026.09.07` release
- `runs/plan46-*.json` — the device evidence behind the 6 September Deck readings
- [34-feature-verification-round.md](34-feature-verification-round.md), [35-bugfix-session.md](35-bugfix-session.md), [36-feature-session.md](36-feature-session.md) — this week's Deck findings and who owns which files
- `data/kb/strategy_seed.json`, `tests/fixtures/kb_eval_v2.json`, `tests/fixtures/kb_answer_eval.json` — counted directly
