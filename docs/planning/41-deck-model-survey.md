# 41 — Newer models for the Deck, surveyed 2026-09-05

Written at the maintainer's request while planning the reasoning display. The question: of the models on
Ollama's library, released or refreshed from July to September 2026, are any a better balance of quality
and speed for the Deck than the Gemma 4 build it runs today, and are there better picks for the three Ask
modes? This is a desk survey from Ollama's own pages and this PC's Ollama, checked 2026-09-05. **It cannot
say which model is better on the Deck. Only a measurement on the Deck can.** What it can do is shorten
the list to the few worth measuring, and say what to measure. The calls are **D72**.

---

## 1. What the Deck can run, and what it runs now

- The Deck shares 16 gigabytes between the system and the model. In practice that is models up to about
  6 gigabytes on disk with room to spare, and up to about 7 with the game closed. Anything 18 gigabytes
  and up, which is every new "30B with 3B active" model on the library this quarter, does not fit.
- **Today's default:** Gemma 4, the smallest build, quantised for speed. 4.3 gigabytes. It sees images,
  hears audio, uses tools, and **it thinks**: Ollama lists the thinking capability on it. The Deck also
  has a small Qwen 3.5 at 3.4 gigabytes, used for the Deep-thinking check on 2026-09-04, where an answer
  took 212 seconds.
- **The one measured number the plugin has for quality** is the answer test on the PC with the Deck's own
  model: facts right 90.9 percent of the time, spoiler fence not misfired 70.8 percent, branch menu
  present 97.0 percent. Any candidate can be run through the same test with one flag, and a PC run
  counts as evidence by the maintainer's earlier call.

## 2. What is actually new and small enough (July to September 2026)

Ollama's newest-first listing on 2026-09-05, filtered to what fits. The window the maintainer asked for
is short on small models: most of the quarter's releases are large mixture-of-experts models.

| Model | Sizes that fit | Thinks | Sees | Age on the library | Why it is on the list |
|---|---|---|---|---|---|
| **Granite 4.2** (IBM) | 3b at 2.2 GB, 8b at 5.3 GB | yes, all sizes, three effort levels | no | 1 week | The only genuinely new small family this quarter. Dense, 128k context, built for question answering with retrieved text, which is what the knowledge base does. Apache 2.0. |
| **Qwen 3.5** refresh | 2b at 1.9 GB, 4b at 3.4 GB, 9b at 6.6 GB | yes | yes | model 6 months old; new 8-bit builds 4 days ago | Already on the Deck at 4b. The refresh is a heavier 8-bit build, which is slower, not faster; the 4-bit builds are unchanged. |
| **Gemma 4** refresh | e2b-it-qat 4.3 GB (current), e4b-it-qat 6.1 GB, 12b-it-qat 7.2 GB | yes | yes, plus audio on the small ones | small builds 3 months old; only the Mac-only format refreshed this quarter | The bigger sibling of today's default is the obvious quality step up, at a speed cost. |
| **LFM 2.5** (Liquid) | 8b at 5.2 GB | yes | no | about 3 months, on the edge of the window | Sold as "fastest in its size class on both CPU and GPU", built for on-device assistants and tool use. Text only. |
| MiniCPM-V 4.6 | 1b, vision only | no | yes | 3 months | Only worth a look for the screenshot lane, not for Ask. |

**Not on the list, and why:** Qwen 3.8 Flash-Next is a 125-billion-parameter preview, 105 gigabytes.
Qwen 3.6 starts at 27b. Nemotron 3.5 Lightning, Laguna XS 2.1, Muse Glimmer and Cohere's North Mini are all
30-billion-plus mixture-of-experts builds at 18 gigabytes and up. Ornith 1.5's 9b sees images but neither
thinks nor uses tools and is aimed at coding agents. GLM, Kimi, DeepSeek and MiniMax entries are cloud
or far too large.

## 3. Candidates by Ask mode, on paper only

| Mode | Keep measuring against | Candidates to pull and measure | What would make one win |
|---|---|---|---|
| **Speed** | Gemma 4 e2b (today) | Granite 4.2 3b; Qwen 3.5 2b | Time to first word and words per second on the Deck at least as good as today, facts and fence numbers within a few points, and thinking that arrives fast enough for the reasoning display. Granite gives up images; Speed rarely needs them. |
| **Strategy** | Qwen 3.5 4b (on the Deck) | Gemma 4 e4b; Granite 4.2 8b | The fence misfire number and the facts number on the answer test, then the thinking speed at Balanced on the Deck. This is the mode where the reasoning display and the spoiler verdict matter most. |
| **Expert** | whichever is largest and still tolerable | Granite 4.2 8b; LFM 2.5 8b; Qwen 3.5 9b | Expert tolerates slow. Quality on the answer test at the Deep level, and whether the model stays under the memory ceiling with a game running. Qwen 9b at 6.6 gigabytes is the risky one. |

## 4. How to find out, cheapest first

1. **On this PC, the answer test with each candidate**, one flag per run. Needs the candidates pulled here:
   Granite 4.2 3b and 8b, Qwen 3.5 2b, Gemma 4 e4b-it-qat, LFM 2.5 8b, about 21 gigabytes in all. Gives
   facts, fence misfires and menu presence for each, against today's 90.9, 70.8 and 97.0.
2. **On the Deck, speed only**, for the ones that held up: load time, time to first word, words per second,
   and thinking seconds at Balanced, with the game closed and again with Deep Rock Survivor running. This
   is what the roadmap's on-Deck model benchmark entry was written to measure; this survey is its first
   real input.
3. **Then a maintainer's read** of three answers per mode from the best two, because numbers do not say
   whether an answer reads well in a small column.

## 5. What the maintainer decides — D72

1. **Pull the five candidates onto this PC** for the answer test, about 21 gigabytes? Yes (recommended), or
   a shorter list, or not now.
2. **Which modes to re-pick.** All three (recommended), or Strategy only, where the quality gap shows most.
3. **Whether image support is a must** for Speed and Strategy. If yes, Granite and LFM drop out of those
   modes and only the Gemma and Qwen sizes remain (recommended: not a must for Speed; a must for any mode
   that takes screenshots today).

## 6. Progress log

- **2026-09-05** — Survey written from Ollama's pages and this PC's Ollama. Nothing pulled, nothing
  measured.
