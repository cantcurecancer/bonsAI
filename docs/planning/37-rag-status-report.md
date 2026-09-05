# 37 — The knowledge base, zoomed out (status report, 2026-09-05)

Written from the roadmap, the knowledge-base architecture doc, the answer-quality plan, the locked
decisions, the last eval reports, the last three session plans and the code. Plain language on
purpose. It says where things stand, what each next step would buy a person using the plugin,
roughly what it costs, and what is in the way. Links are at the end, not in the sentences.

**The live list is the roadmap's [Knowledge base and RAG](../roadmap.md#knowledge-base-and-rag)
section.** That is where entries move as work lands. This report is the zoomed-out view behind it and is
updated whenever that section changes shape; the date in the title says when it was last brought in step.

---

## 1. The picture in one paragraph

With one of the thirteen covered games running, a Strategy or Expert question gets the best one to
five notes from a library of 161 game cards glued onto the instructions the AI reads, and a
troubleshooting question gets tips from a sheet of 124 Deck tips. On questions written without
looking at the cards, the search puts the right card in its top three about four times in five and
first a little over half the time. The small model on the Deck keeps the facts from the cards nine
times in ten, almost never contradicts them, and since 3 September no longer hides tactics behind a
spoiler box on games with no story. The search half has been measured to the decimal for a month; the
answer half has been measured for three days. **The largest limit on quality for a real person is not
either of those. It is that the library covers thirteen games**, and every other game gets the model's
memory plus one generic genre card.

## 2. What has been built, in order

| When | What shipped | What a person noticed |
|---|---|---|
| Late July | Keyword search over per-game cards, a troubleshooting tip sheet, a first "hybrid" | Game questions started arriving with notes attached; Show details said which search ran |
| 5–9 Aug | The retrieval rework: word search and meaning search genuinely combined, a relevance floor, follow-ups searching the user's words, honest transparency | Fewer irrelevant cards stapled on; the trust label stopped over-claiming |
| 6 Aug | Troubleshooting routing widened | Questions that name a topic reach the tip sheet; before, 3 of 40 did |
| 14–16 Aug | Public corpus on Hugging Face with a GitHub mirror; download, update, remove from the Ollama tab | Anyone can install the library from the plugin |
| 18 Aug | The meaning search searches on its own instead of re-ordering keyword hits; Expert mode gets the full card budget | "How do I kill the big armoured bug boss" finds the Dreadnought card; Expert stops being starved |
| 19–21 Aug | Chip guarantee and Tip badge; 16 structured enemy/item/boss cards for two titles; cards with labelled lines | A game chip always appears when the corpus knows the game; the two sample games answer "how do I deal with X" |
| 28–29 Aug | 107 blind test questions (written without reading the cards), a second relevance signal for the meaning search, ten cards re-typed | The eval became honest; unrelated chatter attaches fewer cards |
| 29–31 Aug | 28 new cards: State of Emergency, the Hades weapons, the antlion split, entity cards for Cyberpunk, Fallout 4 and Red Dead, three comparison cards | Corpus 133 → 161 |
| 1–2 Sep | Corpus point release 2026.09.01 published and installed on the Deck; the answer test built and baselined | The Deck finally has the newest 28 cards; the answer side has numbers |
| 2–3 Sep | Spoiler fence misfire fixed and measured; prompt budget guard so a long log paste cannot push the instructions out of the model's window | Fewer replies with harmless tactics hidden behind a spoiler box; confirmed 5 of 5 on the Deck |
| 3–5 Sep | Deck verifications: Expert mode cards, boss-by-name phrasing, all four coverage readings, wiki credit with date, troubleshooting routing, the seed hint | Six knowledge-base entries moved to Done |

Chip work that touches the knowledge base also shipped in this window: corpus chips no longer vanish
after 21 seconds, the rotation no longer favours the top three, and the pinned test-chip batches exist
for QA.

## 3. The numbers today

**Search.** Latest run, 161 cards, 260 labelled questions. "First" means the right card was ranked
first; "top three" means it was among the three the model actually receives in Strategy mode.

| Question set | Word search | Meaning search alone | What ships (the blend) |
|---|---|---|---|
| Questions used to tune (168), first / top three | 62% / 80% | 69% / 89% | 66% / 89% |
| Questions written blind (92), first / top three | 49% / 71% | **63% / 80%** | 54% / 76% |

Read: on realistic questions the meaning search alone beats the shipping blend by about nine points
of "right card first". You deferred acting on that on 29 August until there is more data (more games,
more questions). The weights have not been touched.

**Answers.** The PC runs the Deck's own model over 37 questions, three times each, and checks the
reply without a judge model.

| Check | Rate after the fence fix (2 Sep) |
|---|---|
| Facts from the card kept | 92% |
| Nothing the card contradicts | 89% (8 of 9 cases that have a must-not-say list) |
| No spoiler box where none was due | 95% (was 71% before the fix) |
| Spoiler box present on a real story question | 100% |
| Branch menu on a Strategy first turn | 98% |
| The expected card was attached | 100% |

**The Deck, measured this week.** About 1.1 seconds to embed a question for the meaning search (the
band when the feature shipped was 0.79–0.90, so it is about a fifth slower, cause unmeasured); 20–25
seconds per answer with a character voice on; the model runs with a 4,096-token window and a Strategy
prompt is about 1,500–2,000 tokens, of which only about 200 are the cards.

**The library.** 161 cards over 13 titles: 82 mechanic, 22 boss, 22 item, 19 enemy, 14 area, one
quest, one dungeon. Eleven of the thirteen titles still have no enemy or item cards. 96 cards are
maintainer-written with no source; 65 come from wikis with credit lines. 124 shared Deck tips.

## 4. What is open right now

**Bugs.**

- **A quick question in Speed mode pays for the meaning search it was meant to skip.** Found last
  night on the Deck; the code never checked the mode before running the meaning search. Fixed on the
  shared branch on 5 September by the bug-fixing session; the Deck check is owed.
- **The meaning search is about a fifth slower than when it shipped.** Same lane, time-boxed to one
  look.
- **The shipping blend loses to its meaning half on blind questions.** Deferred by you until there is
  more data. No tooling yet exists to sweep the weights on the tuning set, which is the agreed first
  step.
- **A troubleshooting question that only describes the symptom reaches no tips.** You decided on
  1 September to let the meaning search run over the tip sheet when no topic routed. Not built yet.
- **The eval cannot yet prove the recall pass on many rows.** One re-count owed on the next search
  run.
- **Unrelated questions still get game cards.** Accepted 27 August; not being worked.

**Owed on the Deck.** The recall-pass row (its Strategy half passed, its Speed half is the bug above);
one glossary touch tap; the download-cancel row (cannot be tested, the download takes a second); the
structured-cards row (testing done, it is waiting on your call about whether to strengthen the prompt
or accept prose); the chip clipping direction (behind preset-row work). Five older rows from the
August retrieval rework (schema gate, relevance floor, follow-up search, transparency, the kill
switch) have never been run on the Deck.

**Your calls that are open.** Whether "starting out" and comparison cards get their own kind or stay
filed as mechanics. Whether a Strategy first turn on a named thing with a card should answer first and
then show the menu. The structured-cards prompt question above. The blend weights, once the data you
asked for exists. And the Phase 5 rule of "no new titles", which collides with "more games" being
the data the weights decision needs.

## 5. Next phases: what each buys, and what it costs

Effort is in focused working days for one session with your calls already in hand, plus the star
scale the roadmap uses. "Buys" is what a person using the plugin would notice, with the evidence
behind the claim where there is any.

### 5a. Finish the answer-quality plan agreed on 1 September (about two to three weeks in total)

| Item | What it buys | Evidence | Cost | In the way |
|---|---|---|---|---|
| **Prompt diet** — drop the dead citation instruction, send screenshot rules only with an image, move the cards next to the question | The small model reads nine tokens of instruction for every token of knowledge; fewer rules means better rule-following and ~340 tokens back in a 4k window. Expect a few points on facts kept and a slightly faster first token | The citation instruction was obeyed once in 89 asks and the UI cannot render it | 1 day, measured before and after | The prompt text is owned by the bug session's lane right now |
| **"Not in my notes" line** when a game question matches nothing | A person can tell an answer from the notes from one out of the model's memory. Does not change the answer; changes trust | Your own May note of a confident, wrong, tidy reply with no notes | 0.5–1 day, plus a focus check if it becomes a stop | Wording to settle with you |
| **Spoiler tiers setting** — strict / default / open | A strict player stops seeing boss tactics; an open player stops seeing fences at all. Today one rule fits everyone | The tiers are confirmed; the fence fix showed prompt wording moves the misfire rate 24 points | 3 days: settings plumbing (~18 files), a prompt per tier measured on the answer test, a control with a focus entry, Deck QA | Nothing, once the bug session releases the prompt file |
| **Follow-ups remember** | "What about the second phase?" gets an answer about the boss you were just asking about. Today the model receives only the newest message and the follow-up searches nothing | Agreed 1 Sep: carry the previous turn's named thing into the search first; chat history later, trimmed to the window | 1 day for the carry-over; 2 more for history within the budget | The 4k window: a Strategy reply can be 900 tokens |
| **Symptom-only troubleshooting reach** | "The game drops me back to the library" reaches the crash tips without saying "crash". Two of four blind troubleshooting questions miss today | Decided 1 Sep; measure on the 17 blind troubleshooting rows first | 1 day | None |
| **Eval tooling** — weight sweep on the tuning set, per-case output for the shipping blend, rows that may list a second right answer | Nothing a user sees. It is what unblocks the weights decision and stops every card batch reading as a regression | Agreed; zero rows use the second-answer option yet | 1–2 days | None |
| **"Starting out" card kind**, then the Cyberpunk / Fallout / Red Dead orientation cards | A new player gets a "how do I get started" chip and a matching answer; today those three cards read as "What should I know about Choosing a build?" | Your gap-sheet asks on 29 Aug | 1–2 days plus a corpus rebuild and release | Your call on the kind |
| **Card style pass** — rewrite the 139 prose cards as labelled short lines | Possibly better fact retention by the 2B model. Facts kept is already 92%, so the ceiling is low; do it only if the answer test says the labelled shape scores better | The six labelled cards kept content accurate 6 of 6 on the Deck, but the labels themselves survived 1 of 6 | 2–3 days of content, a rebuild and a release | Measure first |

### 5b. The retrieval decision (one day of work, then your call)

Run the weight sweep on the tuning set, write it up, and decide. If the meaning half is right, the
right card lands first on realistic questions about nine points more often (63% against 54%) for a
one-line change. This is the biggest single retrieval gain on the table, and it is waiting on the
data you asked for, which means more games or more blind questions.

### 5c. Corpus phases

| Phase | What it buys | Cost | In the way |
|---|---|---|---|
| **Phase 4 track 3 — per-game Deck tips** | Troubleshooting a covered game gets that game's own quirks (launch options, a known-broken layout) instead of generic tips. Content for seven titles is collected; two verified quirks are from your own Deck | 2–3 days: a schema bump, the builder, ten or so tips, an eval label, a release, a Deck reinstall | The schema bump makes every installed corpus stale until re-downloaded; bundle it with the next release |
| **Phase 5 — entity depth on the 13 titles** | "How do I deal with X" works for eleven more games; chips get variety (a game with only mechanic cards offers one flavour of chip). More cards is also the data the weights decision wants | 3–5 days of content for 40–60 cards, in tranches with a quality read from you after the first; chip vector ranking (the second half of Phase 5) 2–3 days | Whoever writes a card cannot write its blind test question, so authoring and eval rows go in different sessions; every batch lowers "first place" a little until second-answer rows exist |
| **Phase 7 — infrastructure** | Mostly nothing at 161 cards. Three pieces do matter now: **pulling the embedding model as part of installing the library** (a person without it silently gets word search only and loses the whole meaning search; a button and a hint exist, it is not part of the flow); **thumbs-down demote** (a wrong card stops coming back); **packs** (needed before a large catalog). An approximate-nearest-neighbour index buys nothing until the corpus is thousands of cards | Embed pull 1–2 days; demote 3 days; packs 5+ days; index 2–3 days; vision-to-cards a 1–2 day spike first | None for the first two |
| **Online / versus content** | Multiplayer questions (roles, callouts, co-op) get cards; today they get nothing specific | 2–3 weeks: new card kinds, a spoiler table update, Left 4 Dead 2 versus cards, then Counter-Strike 2, from archive dumps only | Source policy and licensing per card; a rebuild |
| **Community tip contribution** | A reader can turn a good reply into a proposed card with one press | 3–5 days | Unblocked since the public publish |
| **Visual maps** | A boss outline with weak points marked, or a dungeon map, in the reply | Research first; weeks | What a map is made of is undecided; authoring sits behind the source policy |
| **Phase 8 — catalog corpus** | The thing that changes the product: most people's games get notes instead of the model's memory. Top 1000 Steam, top 100 Deck, an emulated slice | Months. It cannot be hand-written (161 cards took six weeks by hand). Needs an ingestion pipeline from wiki dumps, per-source licensing, a size budget (the docs mention ~5 GB), packs, and the index above | Everything above it, and a source policy |

### 5d. What is near the ceiling, and what is not

The checks that exist on the answer side are close to their ceiling (facts 92%, menu 98%, card
attached 100%). Those checks are shallow: term overlap, a must-not-say list, a fence, a menu. Nothing
measures whether the answer was actually helpful, whether the model's own knowledge was right when no
card matched, or how the character voice changes the answer. Five Deck runs with a voice on lost two
facts to the voice. So the honest reading is: the pipeline delivers the cards and the model keeps
them straight; what remains is coverage, follow-up memory, and the things the test cannot see yet.

## 6. What is blocking, in one list

1. **The Deck and the knowledge-base files are held by the bug-fixing session** started today. Its
   lane owns the prompt text, the knowledge-base service and the embedding service. Knowledge-base
   code edits should wait for it or go through it.
2. **Your open calls** (section 4): the card kind, tactic-first, the structured-cards prompt, and the
   blend weights once the data exists.
3. **The "no new titles" rule** for Phase 5 versus the "more games" you asked for before deciding the
   weights. One of the two has to move.
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
track it, or a gap this read turned up. All of them now sit in the roadmap's knowledge-base section with a
star rating: the voice switch ★, the prompt diet ★★, the "not in my notes" line ★★, the eval tooling ★★,
the embedding-model pull ★★, the latency budget ★★, the window experiment ★★, follow-ups remembering ★★★,
the card style pass ★★★, deeper answer checks ★★★, the bundled release ★★★, the new-titles tranche ★★★★,
and the five August checks ★ under Deck check owed.

1. **Rows for the agreed answer-quality items** that have no roadmap line: the prompt diet, the
   "not in my notes" line, follow-ups remembering, the eval tooling, and the card style pass. All
   five were decided on 1 September and live only in the plan's checklist.
2. **Pull the embedding model as part of installing the library.** Promote it out of the Phase 7
   umbrella. A person who installs the library but not the embedding model gets word search only,
   which is the weaker half by every measurement, and nothing tells them beyond a one-time hint.
3. **Measure with the character voice on.** The Deck answers in a voice; the answer test runs with
   it off, and the five Deck runs lost two facts to the voice. One switch on the test, then the voice
   presets become measurable like the prompt is.
4. **A measured context-window experiment.** Raising the window to 8,192 as a Developer experiment
   with a game running, recording memory and time to first token. Agreed as "later, its own call" and
   then never written down.
5. **A bridge between Phase 5 and Phase 8: a first tranche of new titles.** Five to ten games you
   choose. It serves users and it is the data the weights decision is waiting for. Needs the "no new
   titles" rule reopened.
6. **One release row for everything that needs a rebuild:** per-game tips, the starting-out kind,
   the style pass. Today they are three separate entries each carrying the same release cost.
7. **Close or retire the five August QA rows** never run on the Deck. Either they are worth one
   evening with pinned chips, or they are superseded by the rows that passed this week.
8. **A latency budget for a game question.** The slowdown found last night only had a band to fail
   against because one QA row happened to record it. A written budget (embed time plus first token
   with a game running) turns the next regression into a failed check instead of a lucky catch.
9. **Deeper answer checks, when there is time:** a small set of questions where the right answer is
   not on any card, scored for "did the model admit it did not know", and a helpfulness read by a
   person on ten replies a month. The current checks cannot see either.

---

## Sources

- [roadmap.md](../roadmap.md) — the Bugs, Verify, Features and Done lanes tagged `[KB]`
- [knowledge-base.md](../knowledge-base.md) — architecture, phase locks, the recall pass
- [30-kb-answer-quality-plan.md](30-kb-answer-quality-plan.md) — the answer-quality plan and its checklist
- [28-phase5-corpus-depth.md](28-phase5-corpus-depth.md), [18-phase4-track3-per-game-compat-tips.md](18-phase4-track3-per-game-compat-tips.md), [17-kb-online-versus-strategy-content.md](17-kb-online-versus-strategy-content.md)
- [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md) — D27, D38, D40b, D41, D45–D54
- [kb-embed-bakeoff-2026-08-31c-arms.md](../archive/research/kb-embed-bakeoff-2026-08-31c-arms.md) — latest search numbers
- [kb-answer-eval-2026-09-02-shipped-fence-fix.md](../archive/research/kb-answer-eval-2026-09-02-shipped-fence-fix.md) — latest answer numbers
- [34-feature-verification-round.md](34-feature-verification-round.md), [35-bugfix-session.md](35-bugfix-session.md), [36-feature-session.md](36-feature-session.md) — this week's Deck findings and who owns which files
- `data/kb/strategy_seed.json`, `tests/fixtures/kb_eval_v2.json`, `tests/fixtures/kb_answer_eval.json` — counted directly
