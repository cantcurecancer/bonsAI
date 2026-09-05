# 40 — Showing the model's real thinking

Written 2026-09-05, before any code. The third of the six features the maintainer picked to plan. The
roadmap entry says "spike first", which in plain words is: run a test to find out two things before
building anything. This plan says what the test is, what it costs, what the feature would look like
after it, and what the maintainer has to decide. The decisions are **D70** in
[maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md). Nothing in § 6 starts until
the first three are answered and § 3 has run.

Read first: [CLAUDE.md](../../CLAUDE.md); the model and effort table in [AGENTS.md](../../AGENTS.md) § 3;
[06-thinking-blurbs-review.md](06-thinking-blurbs-review.md) for how today's thinking line came to be;
[16-soft-num-predict-thinking-budget.md](16-soft-num-predict-thinking-budget.md) for the thinking
budget; [38-toast-answer-lines.md](38-toast-answer-lines.md) for how these plans are shaped.

**One sentence:** while a thinking model works, the line under your question shows what it is actually
thinking instead of a stock phrase, and when the answer lands that line folds to "Thought for 12 s",
which you can open to read the whole thing.

---

## 1. What is true right now (checked 2026-09-05, nothing changed)

- **The plugin asks the model to think, pays for it, and throws the thinking away.** Since 2026-08-15 the
  Ollama tab has a *Thinking* row: Off, Brief, Balanced, Deep. Any level but Off sends the think flag and
  reserves 256, 512 or 1,024 tokens for it. The streaming reader keeps only the answer field of each
  chunk; the thinking field is never read, anywhere. Nothing of it reaches the screen or the saved chat.
- **Ollama delivers thinking as its own field, before the answer.** Its documentation says the chat
  stream carries the reasoning in one field and the answer in another, and that reasoning tokens come
  before answer tokens. That mostly answers the roadmap's first open question for the models it lists
  (Qwen 3, GPT-OSS, DeepSeek). The test in § 3 confirms it on the Deck's own thinking model.
- **A thinking model is on the Deck.** The Deep level was checked on 2026-09-04 with a small Qwen model
  already installed there: the answer took 212 seconds. That is the silence this feature fills. The
  Deck's default model does not think at all, and never will show this.
- **What the line under your question does today.** While the answer is being made, one muted 12-pixel
  line with a spinner shows a phrase the backend composes: an opener quoting your question, then rotating
  lines that escalate in tone, then whatever short status the model itself emits inside a tag. It is one
  writer, backend-authoritative, masked for spoilers in Strategy mode, and it only shows while the live
  turn is open. It vanishes when the answer lands.
- **Show details already has a row of chips** naming the model, the knowledge base and the rest. A
  thinking chip would be one more of the same kind.
- **A saved turn holds the question, the answer and the details snapshot.** Nothing about thinking.
  There is a size cap on turn text; a reasoning field would need its own.
- **The roadmap's two-star "thinking tips" entry** proposes hand-written tips in the same line. The
  roadmap already notes it is superseded by this feature once real thinking streams. § 5 asks.
- **The vertical-space goal stands.** The chat transcript is 412 pixels tall. Anything this feature
  adds while streaming has to fit in the line that already exists, or be measured against that goal.

## 2. What a person gets

You ask something with thinking on. Instead of *Not forgotten, still thinking…*, the line under your
question reads the model's own latest sentence: *Checking whether the Dreadnought's back plates are the
weak point…*, changing as it goes. It is one line and it does not grow. When the answer starts, the
line folds to *Thought for 41 s* with a small opener, and the answer streams in below as today. Later,
the ring can land on that folded line; pressing A opens the whole reasoning in a muted block, pressing
again closes it. Reopening the chat tomorrow, the folded line is still there and still opens.

Show details gains one chip: *Thinking: Balanced · 41 s · 380 tokens*, so the cost of the level you
chose is visible.

On a model that cannot think, nothing changes: today's phrases stay, no folded line, no chip.

## 3. The test to find out, before any build

Answers the roadmap's two open questions with real captured reasoning, not guesses. Costs about an hour
of a person's time and some model time.

| # | Question | How | What decides it |
|---|---|---|---|
| T1 | Does all the thinking come first, or does it weave through the answer? | A small script talks to Ollama directly with thinking on, streams three questions, and writes every chunk with its field and a timestamp to a file. | If any thinking chunk arrives after the first answer chunk, the fold has to handle a reopening line. Ollama's docs say it will not. |
| T2 | How much thinking is there, and how fast? | Same capture: characters and seconds of thinking at Brief, Balanced and Deep, for a quick fact question, a Strategy game question with cards, and an Expert one. | Whether one line can keep up, and what "Thought for N s" typically says on this hardware. |
| T3 | Does the reasoning say spoilers out loud? | The Red Dead ending question in Strategy mode with the corpus, reading the captured reasoning. | Decision 3 in § 5: whether the folded line is enough of a fence, or Strategy mode keeps the phrases. |
| T4 | How long until the first answer token? | From the same timestamps. | How much silence the live line is actually filling. |
| T5 | Does the newest sentence of the reasoning read as a status line? | Read the captures; then a mockup with the real text on the 300-pixel column, one line against a three-line pane. | The maintainer's eyes, as with the toast. |

Where it runs is decision 7. The Deck's thinking model is not on this PC; this PC has a much larger
Qwen model that thinks, which answers T1 and T3 but not T2 or T4 for the Deck. Pulling the Deck's model
onto the PC makes the whole test runnable at the desk with no Deck time.

Evidence: capture files under `runs/`, the mockup linked from § 10.

## 4. The shape, as proposed

1. **Live:** the existing line shows the newest sentence of the reasoning, replacing the composed phrase
   the moment the first thinking chunk arrives. One line, cut with an ellipsis, no growth. The composed
   phrases still fill the silence before the first chunk and stay as the whole story on non-thinking
   models.
2. **When the answer starts:** the line folds to *Thought for N s* and becomes a D-pad stop; A opens the
   full reasoning as a muted block above the answer, A closes it. Closed by default, always.
3. **Spoilers:** no masking inside the reasoning; the closed fold is the fence, the same shape as a
   hidden spoiler block. One notice the first time thinking is turned on, saying reasoning is unmasked.
4. **Saved with the chat:** the reasoning text rides the turn, capped at a few thousand characters, so
   a reopened chat still has the fold.
5. **Show details:** one chip with the level, the seconds and the token count.
6. **Nothing changes for models that cannot think.**

## 5. What the maintainer decides — D70

1. **Live shape.** One line that replaces the phrase (recommended); a three-line pane that scrolls; or
   keep the phrases and show nothing live, only the fold afterwards.
2. **After the answer.** A folded line you can open (recommended); only a chip in Show details; or the
   reasoning stays open above the answer.
3. **Spoilers in the reasoning.** The fold is the fence, one notice (recommended); or no live reasoning
   in Strategy mode, phrases stay there. T3 informs this.
4. **Saved with the chat.** Yes, capped (recommended); or live only.
5. **A thinking chip in Show details.** Yes (recommended); or no.
6. **The "thinking tips" entry.** Retire it, since real thinking replaces the phrases where a thinking
   model runs and the phrases stay elsewhere (recommended); or keep both.
7. **Where the test runs.** Pull the Deck's small Qwen model onto this PC, about three gigabytes, and run
   everything at the desk (recommended); run on the Deck when it is free; or run on the PC's big Qwen
   now for T1 and T3 only.

Nothing is built until 1 to 3 are answered. 4 to 7 have defaults that hold.

## 6. Build steps, after D70 and § 3

One thing per commit, all four gates green between commits. Step 1 touches the streaming reader and the
status shape, which are backend files another session may be in; it waits for a free window.

| Step | What lands | Who | Waits for |
|---|---|---|---|
| 1 | The streaming reader keeps the thinking field in its own buffer, publishes the newest sentence live and the whole text plus seconds and tokens at the end; the saved turn carries the capped text. Tests with a faked stream: thinking first then answer, thinking only, no thinking, a cut-off stream. | Sonnet 5 high lane | § 3 done, a free window on the backend |
| 2 | The live line swaps to the reasoning sentence when one exists; the fold appears when the answer starts; the fold is a focus stop with open and close. Focus-graph entry first. Tests for each state. | Opus xhigh, after a device measurement of the line's height | step 1 |
| 3 | The Show details chip, and the one-time notice. | Sonnet 5 high lane | step 1 |
| 4 | Docs: the roadmap entry moves to Verify naming the rows below; rows in the manual test doc; a changelog line; the thinking-tips entry retired if decision 6 says so. | the session's own driver | steps 2 and 3 |
| 5 | The Deck rows in § 7. | whoever holds the Deck, Opus xhigh reads the results | step 4 and a free Deck |

Five stars, so by the routing table this plan is decisions and briefs only, Sonnet lanes build, and
Opus at extra-high effort lands it and does the one focus step itself.

## 7. Proving it on the Deck

- **REASONING-01** Thinking Balanced, the Deck's thinking model first in the try order, a Strategy
  question on Deep Rock Survivor: the line under the question changes to the model's own sentences
  within a few seconds, stays one line, never grows.
- **REASONING-02** When the answer starts, the line folds to *Thought for N s*; Down reaches it; A opens
  the block, A closes it; every stop visible, not just highlighted.
- **REASONING-03** Reopen the chat after switching tabs and after a plugin restart: the fold is there and
  opens to the same text.
- **REASONING-04** Thinking Off, and separately the non-thinking default model: today's phrases, no fold,
  no chip.
- **REASONING-05** Show details on a thinking turn: the chip reads the level, seconds and tokens.
- **REASONING-06** Red Dead, Strategy, the ending question: whatever the reasoning says stays inside the
  closed fold; nothing of it appears on the live line after the answer starts.
- The free-play sweep runs, since this changes the Main tab.

Frozen chips, to confirm before pinning: *how do i kill the big armoured bug boss* (rows 01, 02, 05);
*how does the story end* (row 06, Red Dead Redemption 2); *what does the pickaxe do* (row 04).

## 8. Risks, and what to know

- **It only helps people who turned thinking on and run a model that can.** The Deck's default model
  cannot. Worth saying in the Thinking row's help text.
- **Reasoning can spoil.** The model may reason about an ending before deciding to hide it. Decision 3.
- **A pane costs height the transcript does not have.** The one-line shape is recommended for that
  reason alone; the mockup in T5 shows both on the real column width.
- **The reasoning eats the same budget the answer uses.** Deep reserves 1,024 tokens for it. Showing it
  live does not change that cost; it makes it visible, which is the point of the chip.
- **The fold is a new D-pad stop inside the reply**, on the Deck's hardest surface. Measured before it is
  handed to a lane, as the routing rule says.
- **Long reasoning, saved per turn, grows the chat file.** The cap in decision 4 bounds it.

## 9. Out of scope

Reasoning from models that do not support it; summarising the reasoning with a second model call;
masking words inside the reasoning; showing reasoning on the toast; changing the thinking levels or
budgets; the hand-written tips entry, beyond deciding its fate.

## 10. Progress log

Written as work lands.

- **2026-09-05** — Plan written. D70 raised. Roadmap: the entry points here; the thinking-tips entry
  notes the question. Nothing captured, nothing built.
