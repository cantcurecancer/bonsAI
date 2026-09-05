# 41 — Newer models for the Deck, surveyed 2026-09-05

Written at the maintainer's request while planning the reasoning display, and reworked the same day after
their answers. The goal, in their words: today's Gemma 4 build is the best speed for the cost and becomes
the **Strategy** model; find the **best-answering model that fits the Deck at all** for **Expert**, even if
it is much slower; and look for a **small model that beats today's Speed pick** on speed for the quality.
Also: is nomic still the right embedding model for the knowledge base?

This is a desk survey from the makers' own pages, two comparison sites and this PC's Ollama, checked
2026-09-05, with the numbers the makers publish. **It cannot say which model answers best on the Deck.
Only the answer test and a Deck measurement can.** What it does is shorten the list and say what to run.
The calls are **D72**, locked the same day; § 6 says what is now pulled and what runs next.

---

## 1. What the Deck can run

- The Deck shares 16 gigabytes between the system, the game and the model. A model needing about 7
  gigabytes loaded, plus a gigabyte for the conversation, fits with a light game or none running; it is a
  gamble with a heavy game. Anything 18 gigabytes and up, which is every "30B with 3B active" release this
  quarter, does not fit.
- **Images are not a requirement for any text pick.** Screenshot questions go through their own model
  list, set separately in the routing pickers. A text model that cannot see is fine for every mode.
- **Today's default,** Gemma 4 at the smallest size, quantised for speed: 4.3 gigabytes on disk, about 2.9
  loaded. Sees, hears, uses tools, thinks. The Deck also has Qwen 3.5 4B at 3.4 gigabytes.
- **The quality yardstick the plugin owns** is the answer test on the PC with the Deck's own model: facts
  right 90.9 percent, spoiler fence not misfired 70.8 percent, branch menu present 97.0 percent. Any
  candidate runs through it with one flag, and by the maintainer's earlier call a PC run counts as
  evidence.

## 2. What is new and fits, with the makers' numbers

Ollama's newest-first listing, filtered to what fits, with benchmark figures from the makers and two
comparison sites. Higher is better on every row. Numbers from different tables were measured by different
people and are for direction, not for ranking to the point.

| Model | Released | Fits as | Thinks | Sees | Instruction following (IFEval) | Knowledge (MMLU-Pro) | Maths (MATH500) | Notes |
|---|---|---|---|---|---|---|---|---|
| **Gemma 4 E2B** (today) | spring 2026 | 4.3 GB disk, 2.9 loaded | yes | yes, plus audio | 82.9 | not published for this size | 64.0 | Google says it roughly matches last year's Gemma 3 27B. |
| **Gemma 4 E4B** | spring 2026 | 6.1 GB disk, 4.5 loaded | yes | yes, plus audio | 87.7 | not published for this size | 65.0 | The bigger sibling; a clear step on every row of Liquid's table. |
| **Gemma 4 12B** | June 2026 | 7.2 GB disk, 6.7 loaded | yes | yes, plus audio | not published | not published | not published | GPQA Diamond 78.8, a hard-science reasoning test, which is remarkable at this size. The largest that fits. |
| **Qwen 3.5 4B** (on the Deck) | 2026-03-02 | 3.4 GB | yes | yes | 87.8 to 89.8 | 79.1 | 80.8 | Artificial Analysis rated it the most capable model under 10B in spring; index 27. |
| **Qwen 3.5 9B** | 2026-03-02 | 6.6 GB | yes | yes | not shown | not shown | not shown | Index 32, the top small model in spring. Heavy for the Deck. |
| **Qwen 3.5 2B** | 2026-03-02 | 1.9 GB | yes | yes | not shown | not shown | not shown | Index 16, said to match 7B models of a year earlier. |
| **Granite 4.2 3B** (IBM) | 2026-08-25 | 2.2 GB | yes, three efforts | no | IFBench 74.3 | 67.8 | AIME25 78.3 | The newest small model this quarter. Apache 2.0. Built for question answering over retrieved text. |
| **Granite 4.2 8B** (IBM) | 2026-08-25 | 5.3 GB | yes, three efforts | no | IFBench 79.3 | 74.0 | AIME25 86.7 | Beats Qwen 3.5 4B on four of six shared tests on one comparison site, loses on knowledge. |
| **LFM 2.5 8B-A1B** (Liquid) | 2026-05-28 | 5.2 GB disk, under 6 loaded | always, chain of thought | no | 91.8 | not shown | 88.8 | 8B on disk, 1B active per token, so it should run like a small model. Rarely makes things up: 63 percent non-hallucination against 17 for Qwen 3.5 4B and 36 for Gemma 4 E4B on Liquid's table. 146 words a second on a Ryzen AI Max laptop chip. |

**Left off, and why.** Qwen 3.8 Flash-Next is 105 gigabytes. Qwen 3.6 starts at 27B. Nemotron 3.5
Lightning, Laguna XS 2.1, Muse Glimmer and Cohere's North Mini are 30B-plus mixtures at 18 gigabytes and up.
Ornith 1.5 9B neither thinks nor uses tools and is aimed at coding agents. Phi 4 Mini and the
DeepSeek distils that the "best small model" round-ups still name are 2025 models and are not on the list
of what is new.

## 3. The picks, on paper, by mode

| Mode | The maintainer's frame | Measure first | Why |
|---|---|---|---|
| **Strategy** | Gemma 4 E2B stays. Best speed for the cost. | Nothing to change. Its thinking output is what the reasoning display will show. | Accepted 2026-09-05. |
| **Expert** | The best answer that fits the Deck at all, however slow. | **Gemma 4 12B** first, then **Qwen 3.5 9B**, with **Granite 4.2 8B** as the safe fit. | The 12B is the strongest thing that fits, on the one hard number published for it, and it thinks, sees and hears. It is also the tightest on memory, so the first question is whether it loads beside a game at all. Qwen 9B is the spring champion at a size that fits more comfortably. Granite 8B is the lightest of the three and the newest. |
| **Speed** | A small model that beats the current pick on speed for the quality. | **LFM 2.5 8B-A1B**, **Granite 4.2 3B**, **Qwen 3.5 2B**. | Liquid's model is the interesting one: it should produce words as fast as a 1B model while answering like an 8B, and it makes things up far less than the others on its own table. Two risks: 5 gigabytes of memory, and it always thinks first, so time to the first answer word may be long even if words then come fast. Granite 3B is a quarter of that size with a thinking switch. Qwen 2B is the smallest that still scores. |

## 4. The embedding model for the knowledge base

Short answer: **nomic is still a sound choice, and the only way to beat it on the Deck is a smaller model
with equal recall.** The plugin's own bake-off on 2026-07-31 compared six embedding models on the seed
corpus and all six found the right card equally often; nomic was the fastest of them, 35 milliseconds per
question on the PC. Its hybrid conclusions were later superseded, but the latency finding stands. On the
Deck a nomic embed costs about 0.8 to 1.1 seconds per question, measured on 2026-09-05, which is the one
number a swap could improve.

Ollama's embedding shelf has nothing newer than eight months. Three were never in the bake-off and are
smaller or comparable: Google's EmbeddingGemma at 300 million parameters (about twice nomic's size, so
likely slower), and IBM's Granite Embedding at 278 million and at 30 million. The 30-million one is the
only candidate that could be clearly faster on the Deck; the question is whether it finds the cards as
well. The bake-off script takes a list of models, so one PC run answers it. A swap means a full corpus
re-bake and a new corpus version, so it is not done on a whim.

## 5. What the maintainer decided — D72, locked 2026-09-05

1. Pull the five candidates onto this PC: yes. 2. Re-pick all three modes, in the frame above. 3. Images
are not a must for Speed, and in fact not for any text pick, since screenshots route separately.

Added the same day at the maintainer's direction: the Expert search wants the biggest models that fit, so
Gemma 4 12B and Qwen 3.5 9B are pulled too; and the embedding question gets its measurement, so the three
untested embedding models are pulled for one sweep.

## 6. What runs next, cheapest first

1. **Pulled onto this PC on 2026-09-05:** Granite 4.2 3B and 8B, Qwen 3.5 2B and 9B, Gemma 4 E4B and 12B,
   LFM 2.5 8B, EmbeddingGemma, Granite Embedding 278m and 30m. About 40 gigabytes; 186 were free.
2. **The answer test on this PC, one run per candidate**, with the same 96 samples. Gives facts, fence
   misfires and menu presence against today's 90.9, 70.8 and 97.0. Also read from the runs: how long the
   thinking takes at Balanced, since that is what the reasoning display will show.
3. **The embedding sweep on this PC**, the existing script with the three new models added. Gives recall
   per model; the Deck speed follows from size.
4. **On the Deck, speed and fit only**, for what held up: does it load with Deep Rock Survivor running;
   load time; time to first word; words per second; thinking seconds at Balanced. This is the roadmap's
   on-Deck model benchmark entry doing its job, and this survey is its first input.
5. **Then the maintainer's read** of three answers per mode from the best two, because numbers do not say
   whether an answer reads well in a 300-pixel column.

## 7. Sources

Ollama library pages for each model, this PC's Ollama, Ollama's thinking documentation; IBM Granite 4.2
figures from the [eesel summary](https://www.eesel.ai/blog/granite-4-2) and the
[llm-stats comparison](https://llm-stats.com/models/compare/granite-4.2-8b-vs-qwen3.5-4b); Gemma 4 memory
table from [Google's model overview](https://ai.google.dev/gemma/docs/core) and the 12B figure from the
[Labellerr write-up](https://www.labellerr.com/blog/gemma-4-12b-run-locally-and-fine-tune/); Qwen 3.5
small-model figures from [Artificial Analysis](https://artificialanalysis.ai/articles/qwen3-5-small-models);
LFM 2.5 table and speeds from [Liquid AI's announcement](https://www.liquid.ai/blog/lfm2-5-8b-a1b); the
embedding bake-off from the repo's own archive.

## 8. Progress log

- **2026-09-05** — Survey written from Ollama's pages and this PC's Ollama. Nothing pulled, nothing
  measured.
- **2026-09-05, later** — Reworked to the maintainer's frame: Gemma 4 E2B is the Strategy model; Expert
  wants the best that fits; Speed wants faster for the quality. Benchmark figures added with sources. Ten
  pulls started on this PC. The embedding question answered as far as the desk allows; one sweep owed.
