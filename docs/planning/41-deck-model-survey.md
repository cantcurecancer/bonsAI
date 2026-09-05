# 41 — Deck model bake-off, Sept 2026

A dated document on purpose: models move fast and this will be stale in a few months. Written 2026-09-05
at the maintainer's request while planning the reasoning display; reworked twice the same day, first to
their frame and then into a bake-off with the first results in. The frame, in their words: today's
Gemma 4 build is the best speed for the cost and is the **Strategy** model; find the **best-answering
model that fits the Deck at all** for **Expert**, however slow; and look for a **small model that beats
today's Speed pick** on speed for the quality. Also: is nomic still the right embedding model? The calls
are **D72**, locked; the embedding question is rolled into this plan rather than getting its own.

**Where it stands:** the PC half of the bake-off ran on 2026-09-05 for all eight chat models, and the
embedding sweep ran the same day and settled the nomic question. The Deck half has not run. § 4 has the
numbers, § 5 the finding that changes the picture, § 6 the embedding result, § 7 the rules for a switch,
§ 8 what runs next.

---

## 1. What the Deck can run

- The Deck shares 16 gigabytes between the system, the game and the model. A model needing about 7
  gigabytes loaded, plus a gigabyte for the conversation, fits with a light game or none; it is a gamble
  with a heavy game. Anything 18 gigabytes and up, which is every "30B with 3B active" release this
  quarter, does not fit.
- **Images are not a requirement for any text pick.** Screenshot questions go through their own model
  list, set separately in the routing pickers.
- **Today's default,** Gemma 4 at the smallest size, quantised for speed: 4.3 gigabytes on disk, about 2.9
  loaded. Sees, hears, uses tools, thinks. The Deck also has Qwen 3.5 4B at 3.4 gigabytes.

## 2. The roster, with the makers' numbers

Ollama's newest-first listing on 2026-09-05, filtered to what fits, with figures the makers publish.
Numbers from different tables were measured by different people; they give direction, not a ranking.

| Model, Ollama tag | Released | Disk | Thinks | Sees | Instruction following (IFEval) | Knowledge (MMLU-Pro) | Maths (MATH500) |
|---|---|---|---|---|---|---|---|
| **Gemma 4 E2B** `gemma4:e2b-it-qat` (today) | spring 2026 | 4.3 GB | yes | yes, plus audio | 82.9 | not published | 64.0 |
| **Gemma 4 E4B** `gemma4:e4b-it-qat` | spring 2026 | 6.1 GB | yes | yes, plus audio | 87.7 | not published | 65.0 |
| **Gemma 4 12B** `gemma4:12b-it-qat` | June 2026 | 7.2 GB | yes | yes, plus audio | not published | not published | GPQA Diamond 78.8 |
| **Qwen 3.5 2B** `qwen3.5:2b` | 2026-03-02 | 1.9 GB | yes | yes | not shown | not shown | index 16 |
| **Qwen 3.5 9B** `qwen3.5:9b` | 2026-03-02 | 6.6 GB | yes | yes | not shown | not shown | index 32 |
| **Granite 4.2 3B** `granite4.2:3b` | 2026-08-25 | 2.2 GB | yes, three efforts | no | IFBench 74.3 | 67.8 | AIME25 78.3 |
| **Granite 4.2 8B** `granite4.2:8b` | 2026-08-25 | 5.3 GB | yes, three efforts | no | IFBench 79.3 | 74.0 | AIME25 86.7 |
| **LFM 2.5 8B-A1B** `lfm2.5:8b` | 2026-05-28 | 5.2 GB | always | no | 91.8 | not shown | 88.8 |

"Index" is Artificial Analysis's intelligence index, where Qwen 3.5 4B scored 27 and led every model
under 10B in spring. LFM 2.5 is 8B on disk with 1B active per word, so it should run like a small model;
on its maker's table it makes things up far less than the others. Granite 4.2 is the only genuinely new
small family this quarter.

**Left off, and why.** Qwen 3.8 Flash-Next is 105 gigabytes. Qwen 3.6 starts at 27B. Nemotron 3.5
Lightning, Laguna XS 2.1, Muse Glimmer and Cohere's North Mini are 30B-plus mixtures at 18 gigabytes and up.
Ornith 1.5 9B neither thinks nor uses tools. Phi 4 Mini and the DeepSeek distils are 2025 models.

## 3. The three measurements

| Half | What it measures | Where | Status |
|---|---|---|---|
| **A. The answer test** | What the model writes from the cards: facts kept, nothing contradicted, spoiler fence only where due and present where due, the Strategy menu present. Same 37 cases, 3 samples each, corpus 2026.09.01, today's prompt. | this PC, one flag per model | **done 2026-09-05**, § 4 |
| **B. The embedding sweep** | Whether a smaller embedding model finds the right card as often as nomic. | this PC, the existing script | **done 2026-09-05**, nomic stays, § 6 |
| **C. Fit and speed** | Does it load beside a game; load time; time to the first word; words per second; thinking seconds at Balanced. | the Deck, when free | not run |

## 4. Half A, the answer test, PC, 2026-09-05

Every model ran the same 37 cases three times. "Fence when due" is the spoiler check: on a story-beat
question, did a hidden block appear at all. Minutes are the run's own clock on this PC's graphics card
and say nothing about the Deck; they do rank the models against each other.

| Model | Facts kept | Nothing contradicted | Fence not misfired | **Fence when due** | Strategy menu | Every sample clean | Minutes |
|---|---|---|---|---|---|---|---|
| **Gemma 4 E2B** (today) | 90.9% | 100% | 92.7% | **100%** (9 of 9) | 100% | 81.1% | 2.8 |
| Gemma 4 E4B | 98.0% | 100% | 100% | 22.2% (2 of 9) | 98.5% | 86.5% | 4.0 |
| Gemma 4 12B | 96.0% | 77.8% | 100% | 66.7% (6 of 9) | 92.4% | 81.1% | 13.5 |
| Qwen 3.5 2B | 88.9% | 100% | 100% | 0% (0 of 9) | 50.0% | 45.9% | 5.6 |
| Qwen 3.5 9B | 97.0% | 88.9% | 100% | 11.1% (1 of 9) | 100% | 83.8% | 5.2 |
| Granite 4.2 3B | 96.0% | 100% | 100% | 22.2% (2 of 9) | 98.5% | 81.1% | 5.9 |
| Granite 4.2 8B | 96.0% | 100% | 100% | 22.2% (2 of 9) | 100% | 83.8% | 6.3 |
| LFM 2.5 8B | 98.0% | 88.9% | 99.0% | 11.1% (1 of 9) | 98.5% | 86.5% | 7.3 |

Reports: `docs/archive/research/kb-answer-eval-2026-09-05-<label>.md`, one per model.

**Today's own numbers moved too.** The baseline recorded on 2026-09-01 had fence-not-misfired at 70.8
percent; today it is 92.7. The fix that landed on 2026-09-02 is in, and it worked.

## 5. The finding that changes the picture

**Every candidate answers facts a little better than today's model, and none of them protects spoilers.**
Facts kept runs 96 to 98 percent against today's 91, and the candidates almost never wrap tactics in a
fence by mistake. But on the nine story-beat questions where a hidden block is due, today's Gemma 4 puts
one there every time, Gemma 4 12B two times in three, and every other candidate two times in nine or
fewer. Qwen 3.5 2B never does, and it also drops the Strategy menu half the time, so it is out.

The likely reason is not that the models are worse. The spoiler rules in the prompt were tuned on Gemma 4
E2B across three rounds of the answer test; the other models read the same instruction and do not act on
it. So a switch is not a drop-in. Two ways forward, and both are already on the roadmap:

1. **Re-tune the fence wording per candidate** and re-run half A until fence-when-due is back at nine of
   nine. That is prompt work, measured, a day per model.
2. **Let the reasoning verdict do the fencing** (plan 40's second job). If the model decides in its
   thinking what to hide, the fence stops depending on how one model reads one sentence. The reasoning
   display has to land first, and its answer test has to show the verdict works.

Until one of those holds, the Expert and Speed picks below are provisional: the model can be measured on
the Deck now, but it does not ship as a mode's default while it hides spoilers two times in nine.

## 6. Half B, the embedding sweep

The question was whether nomic is still right. The plugin's own bake-off on 2026-07-31 found six models
equal at finding the right card and nomic the fastest, at 35 milliseconds per question on the PC. The only
thing a swap could buy is the Deck's 0.8 to 1.1 seconds per question, measured on 2026-09-05, and only a
smaller model with equal recall buys it. Three small models never in that bake-off were pulled and run:
EmbeddingGemma at 300 million, Granite Embedding at 278 million and at 30 million.

**First try, 15:40, failed on the last model.** The 30-million model produces vectors 384 wide; the corpus
is baked 768 wide, and the recall pass refuses the mismatch by design. **Second try, 17:46, the three
768-wide models, done in under two minutes.** This time it is not a tie:

| Embedding model | Right card in the first three | Right card first | Time per question on this PC |
|---|---|---|---|
| **nomic** (today) | **84.2%** | 61.5% | 16 ms |
| EmbeddingGemma | 71.2% | 45.4% | 34 ms |
| Granite Embedding 278m | 71.5% | 49.2% | 39 ms |

Nomic finds the right card 13 points more often than either newcomer and takes half the time. The locked rule
needs a 5-point win to switch; the newcomers lose by 13. The 30-million model was not measured, because it
needs the corpus re-baked at its width, and with its 278-million sibling this far behind that re-bake is not
worth paying for. Report: `docs/archive/research/kb-embed-bakeoff-2026-09-05.md`. One aside for the
knowledge-base work, not for this plan: the same run re-measured the retrieval arms, and the vector-only arm
led keyword again on both the tuning and the held-out cases, with overlapping intervals on the held-out set.

**So: no separate nomic bake-off is needed, and nomic stays.** This was the bake-off, and it is done. The
Deck's second per question is the cost of embedding at all, not of nomic in particular; the only route to a
faster Deck embed would be a model much smaller than nomic that still finds the card, and nothing on the
shelf today is that.

## 7. Rules for a switch, so the Deck half has a finish line

Written so a lane can run the Deck rows and read a verdict off them without a person weighing it up.

- **Any mode.** Facts kept within 2 points of today's or better, nothing-contradicted within 5 points,
  and **fence when due at nine of nine** on half A with the prompt that would ship. Until then, no
  switch, whatever the speed.
- **Expert.** Loads beside Deep Rock Survivor without the game stuttering; two words a second or better
  on the Deck; then the best facts and fence numbers wins. Slow is allowed; not loading is not.
- **Speed.** Time to the first word no worse than today's and words per second better than today's on
  the Deck, with thinking Off; then the best facts number wins.
- **Strategy.** Stays Gemma 4 E2B by the maintainer's call. Re-open only if an Expert winner also beats
  it on speed, which is not expected.
- **Embedding.** Switch only if a candidate beats nomic by 5 points on the sweep's locked measure, the
  rule from July, **or** matches it within 1 point and cuts the Deck's embed time by half, measured on the
  Deck, and the re-bake is paid for.
- **Then the maintainer's read** of three answers per mode from the best two, because numbers do not say
  whether an answer reads well in a 300-pixel column.

## 8. What runs next

1. ~~The embedding sweep~~ done; nomic stays. Half B is closed.
2. **Deck half, when the Deck is free,** one block, game closed then Deep Rock Survivor running. Rows:
   - **BAKEOFF-01** Fit: pull the candidate on the Deck, load it with the game running, note memory and
     whether the game stutters. Gemma 4 12B, Qwen 3.5 9B, Granite 4.2 8B, LFM 2.5 8B.
   - **BAKEOFF-02** Speed: the same question three times per model with thinking Off, then once at
     Balanced; time to the first word, words per second, thinking seconds. All eight, today's included.
   - **BAKEOFF-03** dropped: no embedding survivor to time against nomic.
   - **BAKEOFF-04** The maintainer's read, three answers per mode from the best two.
   Frozen chips, to confirm before pinning: *how do i kill the big armoured bug boss*; *what does the
   pickaxe do*; *give me ten tips for a new player*.
3. **Prompt re-tune for the Expert front-runner** (§ 5, way 1), or wait for the reasoning verdict (way 2).
   The maintainer's call once the Deck numbers are in.

## 9. Sources

Ollama library pages for each model, this PC's Ollama, Ollama's thinking documentation; IBM Granite 4.2
figures from the [eesel summary](https://www.eesel.ai/blog/granite-4-2) and the
[llm-stats comparison](https://llm-stats.com/models/compare/granite-4.2-8b-vs-qwen3.5-4b); Gemma 4 memory
table from [Google's model overview](https://ai.google.dev/gemma/docs/core) and the 12B figure from the
[Labellerr write-up](https://www.labellerr.com/blog/gemma-4-12b-run-locally-and-fine-tune/); Qwen 3.5
small-model figures from [Artificial Analysis](https://artificialanalysis.ai/articles/qwen3-5-small-models);
LFM 2.5 table and speeds from [Liquid AI's announcement](https://www.liquid.ai/blog/lfm2-5-8b-a1b);
the July embedding bake-off and the eight answer-test reports from the repo's own archive.

## 10. Progress log

- **2026-09-05** — Survey written from Ollama's pages and this PC's Ollama.
- **2026-09-05, later** — Reworked to the maintainer's frame; makers' figures added with sources; ten
  pulls started.
- **2026-09-05, later still** — Turned into the bake-off. Half A ran for all eight models in 51 minutes on
  this PC; the spoiler finding in § 5 came out of it. Half B's first try failed on the 30-million model's
  width; the second try ran clean and nomic won by 13 points, so it stays. Half C, the Deck, not run.
  Switch rules written so the Deck half has a finish line.
