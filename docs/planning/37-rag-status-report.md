# 37 — The knowledge base, zoomed out (status report, 2026-09-06, second pass after wave one)

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

With one of the thirteen covered games running, a Strategy or Expert question gets the best one to
five notes from a library of 161 game cards glued onto the instructions the AI reads, and a
troubleshooting question gets tips from a sheet of 124 Deck tips. On questions written without
looking at the cards, the search puts the right card in its top three about four times in five and
first a little over half the time. The small model on the Deck keeps the facts from the cards nine
times in ten, almost never contradicts them, and since 3 September no longer hides tactics behind a
spoiler box on games with no story. The search half has been measured to the decimal for a month; the
answer half has been measured for three days. **The largest limit on quality for a real person has been
that the library covers too few games**, and every other game gets the model's memory plus one generic
genre card. That limit halved on 6 September: **twelve** more games were written up, taking the library from
thirteen games to twenty-five and from 161 cards to 266, and the release went out the same evening. It is
live on both channels and installed on the maintainer's Deck.

**Two things that evening turned up are worth reading before anything else in this report.** First, the
new games are thin: of 72 questions a player might plainly ask about them, only **43 have a note that
answers them**. Mario Kart 64 has four notes, Doom 64 five. Someone asking about those will often get
nothing. Second, a bug had been quietly costing every long question its notes — with the character voice
on and thinking turned up, the model was silently dropping the start of what it was sent, including the
notes, and answering from memory while the plugin said the notes were used. That is fixed and confirmed
on the device.

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

Chip work that touches the knowledge base also shipped in this window: corpus chips no longer vanish
after 21 seconds, the rotation no longer favours the top three, and the pinned test-chip batches exist
for QA.

## 3. The numbers today

*(All of these were taken on 6 September on the full 266-card library, so they compare like with like.
Older numbers in this report's history were taken on 161 cards and are not comparable.)*

**Search — the blend that ships against the alternatives.** These were the starting numbers before the
twelve new games had their questions matched to notes.

| Question set | Word search | Meaning search alone | What ships (the blend) |
|---|---|---|---|
| Written blind (92), in the top three | 70.7% | **80.4%** | 76.1% |

The ranges overlap, so on this set the four methods **cannot be told apart**. That is an open question,
not a tie.

**Search — the weight sweep, run for the first time.** Nine balances between the word search and the
meaning search. Only one beat today's even split on both measures at once: counting meaning twice as
much as words.

| Balance | Right note first | In the top three |
|---|---|---|
| Today's even split, tuning questions (168) | 65.5% | 88.7% |
| Leaning on meaning, tuning questions (168) | **69.6%** | **89.9%** |
| Today's even split, held-back questions (135) | 37.0% | 51.9% |
| Leaning on meaning, held-back questions (135) | **43.0%** | **53.3%** |

It won on both sets independently. **It was still reverted** — it breaks three behaviours chosen on
purpose, the worst being that a newly added note gets buried until its meaning index is built. Held until
every note is guaranteed to have its index first.

**Read the held-back numbers carefully.** 37% against about 70% in August is the test getting harder, not
the search getting worse. That set grew from 36 questions to 135 by adding blind questions about the
twelve new games, which describe things rather than naming them. **That is the new floor.**

**Answers.** The PC runs the Deck's own model over the test questions, three times each, no judge model.
Comparing the same 37 questions before and after the prompt work:

| Check | Before | After |
|---|---|---|
| Facts from the note kept | 92.9% | 91.9% |
| No spoiler box where none was due | 93.3% | **97.1%** |
| Branch menu when due | 100% | 98.2% |
| The expected note was attached | 100% | 100% |
| Length of the instructions sent | 6,930 characters | **5,682** |

The two small falls are inside this test's own wobble of about two points; the spoiler number is a real
four-point gain. **Across all 183 samples, not one question lost the start of its prompt** — that count
used to be 22 of 37.

Run over all 61 questions, including the 24 new-game ones, facts kept reads **71.9%**. That is the new
games being genuinely harder, not a regression, and it is the number to beat next.

**The Deck, measured 6 September.** Searching by meaning takes **1.10, 1.23 and 1.19 seconds** — on every
question, not just the first. The maintainer has accepted that as fine and the one-second target is
retired. A Strategy question with the voice on used to run about 2,690 tokens against a 4,096-token
window with a 2,112-token reply budget, going over by 703 to 780. After the prompt slimming it is about
2,296, and when it still would not fit the answer is shortened instead of the notes being lost.

**The library.** 266 cards over 25 titles, 124 shared Deck tips. The mix is 128 mechanic, 46 boss, 37
item, 34 enemy, 19 area, one quest, one dungeon. 96 cards are maintainer-written with no source; 170 come
from wikis with credit lines, across eight source sites. **Published as `2026.09.06`, 1.27 MB, live on
both channels and installed on the Deck.**

## 4. What is open right now

**Bugs.**

- ★★ **Raw computer text can appear in a reply.** New, 6 September. An answer ended with a line of code-like
  text sitting where words should be. The plugin's own log shows it recognised the block as a power
  suggestion — it just did not remove it from what the person reads. Nobody has traced it yet.
- ★★ **Unrelated questions still get game cards.** Accepted 27 August; not being worked.
- ★★ **The panel keeps naming a game after it is closed.** New, 6 September. After exiting a game the line
  under the question box still named it. A question that names its own game still works; one that does not
  may pick up the wrong game's notes. Not proven to cause a wrong answer yet.

**Settled on 6 September, no longer open.**

- **Game notes thrown away on a long question** — fixed and confirmed on the device.
- **Speed mode paying for the slow search** — confirmed fixed on the device.
- **The meaning search being about a fifth slower** — accepted. About a second on every question is the
  measured, accepted cost. The warm-up explanation was proven wrong for the Deck: the third question was
  no faster than the first.
- **The shipping blend losing to its meaning half** — measured properly at last, and held. See section 3.
- **A symptom-only troubleshooting question reaching no tips** — built, measured, held. It does not work:
  matching by meaning cannot connect the words a person uses for a crash to the way the crash tips are
  written. Rewriting the tips is the real job and now has its own roadmap entry.

**Owed on the Deck.**

- ★★★★ **One question per new game on the device.** The only wave-one row still owed. Fallout: New Vegas
  has to be installed first.
- ★ Five older checks from the August retrieval rework, never run on the device. Worth one evening with
  pinned test chips, or worth closing.
- ★★★ One glossary word, tapped rather than reached with the D-pad.
- ★★★ The download Cancel button, which cannot be checked at all: the download finishes in about a second,
  so there is no window to press it in.
- ★★★ Which way a too-long chip label is cut off. Behind the preset-row work.

**Your calls.** Four were decided on 6 September: the symptom-only search is held and rewriting the tips is
the real job; leaning the search toward meaning is held until every note is guaranteed to have its meaning
index built; the twelve new games ship with their coverage gap known and accepted; and about a second to
search on the Deck is fine. Nothing is waiting on you right now.

## 5. Next phases: what each buys, and what it costs

Effort is in focused working days for one session with your calls already in hand, plus the star
scale the roadmap uses. "Buys" is what a person using the plugin would notice, with the evidence
behind the claim where there is any.

### 5a. Finish the answer-quality plan agreed on 1 September (about two to three weeks in total)

| Item (with its stars) | What it buys | Evidence | Cost | In the way |
|---|---|---|---|---|
| ★★ **Prompt diet** — **SHIPPED 6 September** | The small model reads nine tokens of instruction for every token of knowledge; fewer rules means better rule-following and ~340 tokens back in a 4k window. Expect a few points on facts kept and a slightly faster first token | The citation instruction was obeyed once in 89 asks and the UI cannot render it | Done | None. Instructions fell from 6,930 to 5,682 characters; moving the notes next to the question was measured and rejected, because it placed the spoiler warning correctly far less often |
| ★★ **"Not in my notes" line** when a game question matches nothing | A person can tell an answer from the notes from one out of the model's memory. Does not change the answer; changes trust | Your own May note of a confident, wrong, tidy reply with no notes | 0.5–1 day, plus a focus check if it becomes a stop | Wording to settle with you |
| ★★★ **Spoiler tiers setting** — strict / default / open | A strict player stops seeing boss tactics; an open player stops seeing fences at all. Today one rule fits everyone | The tiers are confirmed; the fence fix showed prompt wording moves the misfire rate 24 points | 3 days: settings plumbing (~18 files), a prompt per tier measured on the answer test, a control with a focus entry, Deck QA | Nothing, once the bug session releases the prompt file |
| ★★★ **Follow-ups remember** | "What about the second phase?" gets an answer about the boss you were just asking about. Today the model receives only the newest message and the follow-up searches nothing | Agreed 1 Sep: carry the previous turn's named thing into the search first; chat history later, trimmed to the window | 1 day for the carry-over; 2 more for history within the budget | The 4k window: a Strategy reply can be 900 tokens |
| ★★ **Symptom-only troubleshooting reach** — **BUILT, MEASURED, HELD 6 September** | It did not work. One of four target sentences improved; the crash one now attaches a tip about desktop mode where it used to attach nothing, which is worse | Matching by meaning does not connect the words people use for a crash to how the crash tips are written | Superseded | **Rewriting the tips so they use the words people type** is the actual job, and now has its own roadmap entry |
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

**What would unlock it:** guarantee every note has its meaning index before it can be searched. Then the
first objection disappears and the other two still need answering. A better route may be to leave the
balance alone and change only the tie-break, so meaning wins when there is no strong word match. That is
real work rather than a constant change, and needs its own measurement.

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

1. **Coverage, and it is now the top one.** The twelve new games shipped thin: 43 of 72 plain player
   questions have a note behind them. This is content work, not code, and no tooling is in the way.
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
- `runs/plan46-*.json` — the device evidence behind the 6 September Deck readings
- [34-feature-verification-round.md](34-feature-verification-round.md), [35-bugfix-session.md](35-bugfix-session.md), [36-feature-session.md](36-feature-session.md) — this week's Deck findings and who owns which files
- `data/kb/strategy_seed.json`, `tests/fixtures/kb_eval_v2.json`, `tests/fixtures/kb_answer_eval.json` — counted directly
