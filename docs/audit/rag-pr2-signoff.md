# RAG remediation PR2 — maintainer sign-off

**Status: awaiting sign-off. No cards written, no corpus rebuilt for eval, no bake-off run.**

This is the R1 gate from
[rag-retrieval-quality-remediation-implementation-plan.md](../rag-retrieval-quality-remediation-implementation-plan.md).
The order is deliberate: **query intents first, then the cards that answer them, then sign-off
on both, then rebuild, then measure.** Writing cards first and questions second measures
whether we can find the card we wrote the question from, which inflates every arm and settles
nothing.

Drafted 2026-08-06. Stages 6a and 6b are already committed; 6c is the file below; 6d is
blocked on your answer.

---

## 1. What is ready for review

[tests/fixtures/kb_eval_v1.json](../../tests/fixtures/kb_eval_v1.json) — **147 queries**,
tune 102 / holdout 45, strategy 107 / compat 40.

Each row carries:

| Field | What it is |
|---|---|
| `query` | How a player would type it. No card exists for it yet. |
| `intent` | What they want, in one line. This is what a card has to answer. |
| `topic_hint` | The **game entity** a card must cover — a fact about the game, not about our corpus. |
| `ban_verbatim` | Phrases the eventual card title will use. The query is checked not to contain them. |
| `expect_section` / `expect_topic` | **Empty.** Labels are filled after sign-off, not before. |

The `ban_verbatim` rule is enforced by a test, not by a reviewer's eye:
`test_v1_intents_do_not_echo_the_cards_they_will_match`. Four drafts tripped it and were
rewritten. A second test refuses to let the labels be filled while the file is still marked
`awaiting_maintainer_signoff`.

Coverage is 10 topics per title across the existing 11 titles — no net-new titles, matching
the plan's scope. Per title, seven topics carry a `tune` query and three carry a `holdout`
query, so holdout tests generalisation to intents that were never tuned against.

---

## 2. The thing you need to decide about, before cards

**The compat knowledge base is unreachable for most of its content in production.**

This is decision **Q8**, which the plan deferred as "natural-language asks skip KB". It is
worse than that phrasing suggests, and now measured rather than asserted.

`question_matches_troubleshooting_log_context` requires the literal word **`proton`** or
**`deck`** (plus a co-keyword), or one of about six exact preset phrases
([ollama_prompts.py:386](../../py_modules/backend/services/ollama_prompts.py)). Anything else
never reaches the compat path at all.

Measured against the new intents:

| Slice | Reaches retrieval |
|---|---|
| Strategy (107 queries) | **107 / 107** |
| Compat, phrased the way the gate expects (21) | **3 / 21** |
| Compat, phrased the way a player types (19) | **0 / 19** |

Against the *old* fixtures the number is 3 of 18. Both sets agree.

The three that pass are proton-crash, deck-sleep-resume, and gamescope-on-deck. The corpus
holds **27 topics**. So roughly 24 of them can be retrieved by essentially nothing a user
would type — including storage, Steam Input, anti-cheat, streaming, VR, Wine, and emulation,
each of which has 6–10 tips written and shipped.

**Two consequences for this work:**

1. Any compat number from the eval is measuring cards production would not have fetched. The
   eval now reports compat twice — overall and gate-reachable-only — so this cannot silently
   drive tuning. Gate-reachable-only is n=3, which is too small to conclude anything from.
2. The 2026-07-31 bake-off's compat half measured the same unreachable traffic. That report
   now carries a correction banner.

**What I need from you:** does Q8 stay deferred for PR2, or does the gate get widened now?

- **Stays deferred** (plan as written): I proceed to cards, and the compat arm of the bake-off
  is reported as informational with n=3 gate-reachable. Fusion weights get tuned on strategy
  evidence alone. That is defensible, but it means we ship tuned constants without compat
  evidence behind them.
- **Widen the gate now**: a scoped change — route to compat when the Ask names a topic the
  corpus covers, rather than when it happens to contain "deck" or "proton". This is a product
  behaviour change (more Asks get KB context attached), it needs its own on-Deck QA, and it
  would grow PR2. It is also the only path that makes the compat arm mean anything.

I have not touched the gate. It is a product decision, not a retrieval one.

---

## 3. First arm numbers, and why they are not evidence yet

Ran on the current shallow corpus, tune split, `nomic-embed-text`:

| Arm | top-1 | top-3 | top-3 CI |
|---|---|---|---|
| keyword | 82.5% | 90.0% | [80.0, 97.5] |
| vector-only | 85.0% | 90.0% | [80.0, 97.5] |
| RRF | 77.5% | 85.0% | [72.5, 95.0] |

**Do not read this as "fusion loses."** The corpus has 22 sections and the shortlist pulls 30,
so the keyword stage returns everything, every time — there is no shortlist for fusion to
improve on. This measures the harness. It is recorded because hiding an unflattering
intermediate number is how the 2026-07-31 conclusion happened in the first place.

The holdout split is **empty** by design. Every pre-existing fixture was written from the card
it matches, so none of them can gate anything; the eval prints "no verdict, the holdout is
empty" rather than reporting a tie. The v1 holdout above becomes the real gate once its cards
exist.

---

## 4. Checklist (from the implementation plan)

- [x] Eval query intents drafted **before** card text — not card → query echo
- [x] No query reuses distinctive noun phrases from its target card verbatim *(enforced by test)*
- [ ] Strategy cards reviewed — **not written yet; blocked on this sign-off**
- [ ] Eval fixtures + labels reviewed — labels are empty until cards exist
- [x] Compat `gate_reachable` reporting understood; Q8 still open — **see §2, needs your call**
- [x] Tune/holdout split recorded — 102 / 45
- [ ] Explicit sign-off: "approved for rebuild and bake-off"

---

## 5. What happens after you sign off

1. Write ~8–12 sections per title covering the 107 strategy intents, `bonsAI-maintainer` trust
   tier, keeping `write_attributions` in step.
2. Fill `expect_section` / `expect_topic`, flip the fixture out of
   `awaiting_maintainer_signoff`.
3. Rebuild the corpus, re-run the three-way bake-off on the deepened corpus.
4. Lock fusion weights, the RRF backfill rank, and the relevance floor from the **tune** split
   only.
5. Report **holdout** as the ship gate, under the non-overlapping-CI rule.
6. Write the superseding research report.

Nothing in steps 1–6 starts before "approved for rebuild and bake-off".

---

## Side note: attribution is thin in the current corpus

Unrelated to the gate, found while verifying the rebuild: **0 of 124** compat tips and **2 of
22** strategy sections carry a `source_url`. Maintainer-authored cards legitimately have none,
but any wiki-derived card needs one for the CC BY-SA obligation the corpus assumes. Worth
deciding the rule before 107 new cards are written, not after.
