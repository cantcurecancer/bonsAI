# Roadmap details

Long-form notes for **open** roadmap entries. The roadmap itself keeps each item to a few plain
sentences; everything that would otherwise have to be re-measured lives here — what was tried,
what it cost, which leads were ruled out, and the exact steps to reproduce.

Split out 2026-08-27, when roadmap entries had grown to twenty-plus lines each and the list had
stopped being readable as a list. **Fixed** items are not here; they go to
[archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).

Each heading below matches a roadmap item's title, and the roadmap item links here.

## Ordinary phrases attach game cards

  - **Implemented 2026-08-23:** `VECTOR_RECALL_FLOOR` raised `py_modules/backend/services/knowledge_base_service.py:148` from 0.50 to 0.515, against a fresh local repro (real `nomic-embed-text` via a local Ollama, real seed cards for the six phrases and the seven `V2-PARA-*` strategy rows in `kb_eval_v2.json` — script not committed). The two ranges overlap (noise up to 0.5308, a genuine paraphrase hit as low as 0.4302), so no single floor separates them cleanly; 0.515 was chosen to sit just above "one sentence"'s noise score (0.5034) and just below the lowest genuine score this change must not break (Mind Flayer / `V2-PARA-S04`, 0.5169).
  - **Re-measured all six phrases end-to-end** through `retrieve_knowledge_context` against the real test corpus (`build/knowledge-base-test/corpus.db`, real embeddings, real local Ollama for the query) rather than eyeballed:

    | Phrase | Before | After |
    |---|---|---|
    | "one sentence" | Praetorian | clean (genre fallback only) |
    | "please repeat that" | Glyphid Dreadnought, Nitra, Dreadnought Twins | Glyphid Dreadnought only |
    | "thank you very much" | Nitra | **unchanged — Nitra still attaches** |
    | "what time is it" | Glyphid Dreadnought, Praetorian, Classes | **unchanged — all three still attach** |
    | "our team" | clean (genre fallback only) | unchanged |
    | "four hours" | clean (genre fallback only) | unchanged |

    Matches D28's own prediction exactly: the two BM25-driven phrases are untouched (fixing them would mean touching `BM25_RELEVANCE_FLOOR`, out of scope here), "one sentence" is fully clean, and "please repeat that" is reduced but not clean. **Still OPEN, re-scoped to the two BM25-driven phrases and the residual `Glyphid Dreadnought` on "please repeat that"** — a keyword-side fix is a separate decision.

    **Maintainer call 2026-08-27:** interim, **live with the residual attachments** — the model is expected to mostly talk past an irrelevant card — but this row is now **research-first, not tune-first**: find out *why* a bare phrase clears the keyword bar for these cards before proposing any change. The backlog entry *Card relevance needs a second signal* (Knowledge base lane) is the vehicle for the eventual fix; the floors stay where they are (D28's correction note already forbids retuning `VECTOR_RECALL_FLOOR`, and `BM25_RELEVANCE_FLOOR` stays at 1.0 per D25).

    **On-Deck 2026-08-23 — all four phrases confirmed on hardware. The device reproduces the desk table exactly, card for card. D28's re-measure obligation is discharged.** Deep Rock Galactic: Survivor (`app_id 2321470`), corpus `2026.08.22`, model `gemma4:e2b-it-qat`, Strategy mode. Recordings `DeckRecord_20260823_170847`, `_172915`, `_173649`, `_173825`, `_173947`.

    | Phrase | Desk prediction | Cards actually attached on Deck |
    |---|---|---|
    | "one sentence" | clean (genre fallback only) | `Genre/compat fallback` **only** — reproduced on all three runs |
    | "please repeat that" | Glyphid Dreadnought only (was 3) | `boss: Glyphid Dreadnought` **only** |
    | "thank you very much" | unchanged — Nitra still attaches | `item: Nitra` |
    | "what time is it" | unchanged — all three still attach | `boss: Glyphid Dreadnought`, `enemy: Praetorian`, `mechanic: Classes` |

    **Method — and the correction it forced.** The card names are **not readable from the device UI**: *Show details* reports retrieval mode, `Trust tier`, and a corpus section count, but never names what was retrieved, and a `fallback_no_source` tier looks identical whether the payload was the genre fallback or a real game card. An earlier note on this row read that chip as "no cards attached" for *"one sentence"* — **that was wrong**, and the conclusion was only accidentally right. `kb_attached: true` was in the same snapshot the whole time, and `fallback_no_source` is a **trust tier** ([knowledge_base_schema.py:48](../py_modules/backend/services/knowledge_base_schema.py#L48)), not an attachment count. The authoritative source is the Desktop ask trace — `~/Desktop/bonsAI_logs/bonsai-ask-trace-<date>.md`, written when `desktop_ask_verbose_logging` is on ([main.py:2135](../main.py#L2135)) — which dumps the verbatim `--- Local knowledge base ---` block with one `[title / kind: Card] (trust: tier)` header per attached card. **Read the trace, not the panel**, for any card-attachment QA.

## D-pad focus is trapped inside the expanded Session context panel

  - **Root cause, confirmed by reading with the recording as evidence.** `focusAnyContextChipLadder` took the **first** `.bonsai-chip-ladder` in the document. Its own comment asserted that would always be the transcript's inline ladder, "even when the session context strip's own ladder (same class) is also mounted further down" — true only while *Show details* is open. In the recording it is **closed** (the button reads *Show details*, not *Hide details*, at 0:08–0:16), so no inline ladder is mounted at all and the strip's ladder is the *only* match. The strip header's `onMoveUp` ([MainTabChatTranscript.tsx:814](../src/components/MainTabChatTranscript.tsx#L814)) routes through that helper, so every Up press at the header threw the ring back down into the strip. A closed loop: ladder → rows → header → ladder.
  - **Second, independent half.** The strip renders `ContextChipLadder` bare ([SessionContextStrip.tsx](../src/components/SessionContextStrip.tsx)) with neither `onMoveUpFromLadder` nor `onMoveDownFromLadder`, while the transcript's copy has always passed both ([MainTabChatTranscript.tsx:438-439](../src/components/MainTabChatTranscript.tsx#L438-L439)). The ladder owns `onMoveUp` for chip stepping and delegates to `onMoveUpFromLadder` at chip 1 ([ContextChipLadder.tsx:133-140](../src/components/ContextChipLadder.tsx#L133-L140)) — absent, that returns `false` and the press dies there. Either half alone would trap the ring; both were present.
  - **FIXED 2026-08-23** (code + unit tests, **no on-Deck confirmation yet**). `focusAnyContextChipLadder` now skips any ladder inside `.bonsai-session-context-strip` via `closest()`, and returns `false` rather than a wrong target when only the strip's ladder exists — letting the caller's fallback chain (`focusContextHint` → `focusReplyUtilityRow`) do its job. The strip's ladder now gets `onMoveUpFromLadder` pointing at the row list above it (new `focusLastSessionContextRow`), falling back to the strip's own `onMoveUp`. Four regression tests in [liveTurnFocusGraph.test.ts](../src/utils/liveTurnFocusGraph.test.ts) cover both ladders mounted, only the strip's mounted, and the row target.
  - **Steps to verify on-Deck:** ask anything, leave *Show details* **collapsed**, expand **Session context**, D-pad down into the chip ladder inside it, then hold Up. The ring must climb out through the turn rows and the header and land on *Retry* / *Show details*. Repeat with *Show details* **open** — the ring must reach the transcript's own ladder on the way, not skip to the panel.

## The spoiler fence on a no-story game lands mid-reply

  - **It tracks the question, not the turn.** *"how do i deal with the exploders"* fenced on **both** captures — `DeckCapture_20260822_164957_game.png` and `DeckRecord_20260822_172630_game.mkv`, two independent generations with visibly different wording. *"what is red sugar for"* (`DeckRecord_20260822_173005`) and *"how do i beat the twins"* (`DeckRecord_20260822_172800`) fenced on **neither**. Two samples of one question is not proof, but a per-question correlation is a far more tractable bug than per-turn randomness, and it is the first thing to test: **re-run each of the three questions several times and record the fence rate per question before touching any code.** If it holds, the cause is in what that question retrieves or how its entity is resolved, not in model temperature.
  - **A lead on why that question and not the others.** The three cards differ by `section_type` — `Exploder` is **enemy**, `Red Sugar` is **item**, `Dreadnought Twins` is **boss**. The low-risk addendum's wording only names *"boss and elite enemy names"* and *"boss/enemy guidance"* ([ollama_prompts.py:261-300](../py_modules/backend/services/ollama_prompts.py#L261-L300)), and the named-entity discount runs through `_ENTITY_FILLER`, which drops words like *"boss"* and *"the boss"* but has no equivalent handling for a plural common noun like *"exploders"*. Worth checking whether `asked_entity` resolves for *twins* and *red sugar* but not for *exploders*, which would explain the split exactly.
  - **The placement changed, and that part is genuine variance.** In the earlier screenshot the fence sat at the **end** of the reply; in the recording the same question put it **in the middle**, between the opening line and *"Here's the lowdown:"*, splitting the answer in half. Mid-reply is materially worse than trailing — it interrupts the thing the user is reading mid-fight, which is the exact scenario Phase 4 track 2 restructured these cards for. Check whether this followed the 2026-08-15 `prepareStreamMarkdown` / `unwrapOpenSpoilerFence` change, since that is the most recent thing to touch where a fence is recognised during streaming. **Cross-title placement data, same evening** (`recordings/DeckRecord_20260822_195545/200257/200436/201647_game.mkv`): on Ship of Harkinian the fence landed **mid-reply** on the water-temple-boss and sink-underwater asks, at the **very top** of the reply on the bottles ask (before any prose at all), and on Fallout 4 it trailed at the **end** — all three positions in one session, same model. Those titles fence by design (`protect_progression` / narrative), so they say nothing about the false positive; they make the placement variance a cross-title fact rather than a Deep Rock quirk.
  - **Cheap mitigation while it is open:** `strategy_spoiler_masking_enabled` off in settings removes the fence for QA runs without a code change. Not a fix — it disables fencing everywhere, including the titles that need it.
  - **The lead is confirmed, at the desk, 2026-08-22 — `asked_entity` is empty for exactly the question that fenced.** Run against `extract_strategy_asked_entity` with the three card names passed as `known_entities`: *exploders* → `''`, *red sugar* → `'Red Sugar'`, *twins* → `'twins'`. A 3-of-3 match with what was observed on device, and it needs no hardware to reproduce. **Two independent gaps produce the miss, and both must be fixed or neither helps:** *"deal with"* is not in `_ENTITY_VERB_FIRST_PATTERNS` (which carries `beat|defeat|kill|fight|survive|use|counter|play as`), and `_match_known_entity` is word-boundary exact, so the card *Exploder* does not match the plural *exploders* — confirmed by the singular form resolving correctly.
  - **What the empty entity actually costs, and it is bigger than the discount.** [`_strategy_spoiler_low_risk_addendum`](../py_modules/backend/services/ollama_prompts.py#L261-L305) has three arms. With an entity it says *"do NOT wrap ... in `bonsai-spoiler` fences"*; with `kb_entity_match` it says *"do NOT fence KB-backed boss/enemy guidance"*; with neither it says only *"boss and elite enemy names are not narrative spoilers — keep mechanical coaching visible."* **The third arm is the only one carrying no explicit negative instruction.** And the second arm cannot rescue the first, because `kb_text_covers_asked_entity` returns `False` on an empty entity before it looks at the cards at all — so one extraction miss knocks out *both* arms that tell the model not to fence, with the Exploder card sitting in the prompt unused. **The title-level fact is the stronger one and is not being used:** the game is already known to be `low_narrative`, which is a better reason not to fence than knowing what was asked. **Fix lean: give the third arm the same explicit instruction**, and treat the two extraction gaps as a separate, smaller improvement — that way the fix does not depend on entity extraction succeeding for every phrasing a player might use.

## An Ask that completes instantly loses its branch picker and checklist

  - **Not what the device measures**, and that is why it is one star rather than two: `gemma4:e2b-it-qat` takes 6-32s on this hardware, so the start call answers `pending` and the polled path — the fixed one — is what real Asks take. This bites a fast or cached completion.
  - **The same literal already carries `shortcut_setup`, `thinking_unsupported` and `model` through with a comment explaining why**, so the fix is to add the two strategy fields beside them. Confirm first that the RPC actually returns them on this path before adding the fields, and keep the test on the polled path as well — these are two different routes to the same panel.

## Live Ask user bubble shows a bare ellipsis after reopen

  - **On-Deck 2026-08-23 — half the fix works, and the failure moved.** Batch A chip #1 (*"one sentence"*, Deep Rock Galactic: Survivor), QAM closed and reopened mid-think. **The caption came back correctly and stayed correct for the whole thinking phase** — that is the `pending`-branch backfill ([useBonsaiAskOrchestration.ts:502-505](../src/hooks/useBonsaiAskOrchestration.ts#L502-L505)) doing exactly its job, and it is the first time this has been seen working on hardware. **It then reverted to `…` at the moment thinking finished.** So the bug is no longer "nothing ever refills the caption"; it is "something clears it again on the terminal transition".
  - **Lead, not yet proven — the one unguarded write.** All three in-flight writes to `askThreadDisplayQuestion` are blank-only (`(prev) => prev || value`) — pending at :504, completed at :605 — **except `restoreSessionSnapshot`, which assigns unconditionally** ([useBonsaiAskOrchestration.ts:1312](../src/hooks/useBonsaiAskOrchestration.ts#L1312)). A snapshot captured before the Ask was submitted holds `askThreadDisplayQuestion: ""`, and the survival snapshot is only written before a nested-modal open ([useBonsaiPluginShell.ts:115](../src/hooks/useBonsaiPluginShell.ts)), never on a plain QAM close — so the stored value is routinely stale. If the mount-restore effect lands after the pending poll, its bare assignment overwrites the good caption with the stale blank one, and the header falls back to the `|| "…"` literal at [MainTabChatTranscript.tsx:480](../src/components/MainTabChatTranscript.tsx#L480). The ordering is **not established** — do not fix on this alone. **Cheapest next step:** make :1312 blank-only like its two siblings and re-run the same chip; if the caption survives, that was it. Note the comment already at :599-603 anticipates the restore path but guards the *poll* writes rather than the *restore* write.
  - **Second asymmetry worth folding into the same fix:** the collapsed turn header at :480 reads `buildCollapsedTurnTitle(liveQuestion) || "…"` with no fallback, while the question bubble 46 lines below at :526 reads `liveQuestion || lastExchange?.question || ""`. Whatever clears `liveQuestion`, the header is the only one of the two with nothing to fall back on — which is why the symptom is a header showing `…` rather than a blank turn.
  - **Duplicate-question follow-on: not observed this run.** Batch A #1 produced a single turn. One clean run is not a close — the symptom was always intermittent — but it is one data point against it sharing a root cause with the caption bug, since the caption bug *did* reproduce in the same session.

---

## Terse mode (Speed answers in three lines)

Discovery ran with the maintainer on 2026-08-29. **Nothing is built.** This is the settled shape,
written down so the build does not have to re-ask any of it.

**What it is.** A toggle on the Ollama tab beside the reply-style slider, off out of the box, that
caps a **Speed**-mode answer at **three lines**. A line is a sentence or a bullet — one number
covering both shapes, because the promise is about what you can take in at a glance rather than
about grammar.

**It is an output rule, not an effort rule**, and this is the thing most likely to be got wrong by
whoever builds it. The model may think as long as it likes and read a screenshot as closely as it
likes; only what lands on screen is capped. The thinking-effort control is untouched, and a
screenshot question still comes back at three lines. The toggle's own help line has to say so,
because *shorter* reads as *dumber* otherwise.

**Speed mode only, and inside Speed it wins:**

| Against | Terse |
|---|---|
| Reply-style slider (Caveman / Balanced / Detailed) | **Ignored while in Speed** |
| AI character roleplay | **Overridden** — the character still picks the words, in three lines |
| Strategy and Expert ask modes | **Does not apply**, and the toggle says so in plain words |

The character override is a deliberate reversal of Caveman, which steps aside entirely when a
character is on ([ollama_prompts.py:967](../py_modules/backend/services/ollama_prompts.py#L967)).

**Two of Caveman's three escape hatches survive.**

- **Destructive warnings** drop out of terse and are written in normal prose — the same auto-clarity
  clause Caveman carries. A squeezed data-loss warning is the one failure worth spending lines on.
- **The ten depth phrases** still loosen the cap: `step by step`, `step-by-step`, `walkthrough`,
  `explain why`, `in detail`, `full guide`, `detailed guide`, `break it down`, `tutorial`,
  `comprehensive` (`user_asks_for_detail_depth`,
  [ollama_prompts.py:908](../py_modules/backend/services/ollama_prompts.py#L908)).
- **The character step-aside does not** — see the table above.

**Free alongside the three lines:** the existing fenced panels (`bonsai-strategy-branches`,
`bonsai-strategy-checklist`, the TDP `json` block, `bonsai-cite`), code blocks and file paths, and
pictures once anything can draw one. The `<bonsai-status>` line never counted — it is stripped
before display ([stripAssistantDisplayTags.ts](../src/utils/stripAssistantDisplayTags.ts)) and shown
as a streaming blurb, so it is not in the reply body at all.

**Getting more is the branch picker, and that is the real work.** Every terse reply ends with the
strategy branch fence; pressing an option gives three more lines and a fresh set of options, forever.
Buttons are **stacked full-width** in the 300px column rather than squeezed into one row, because a
full-width label can be a real phrase and the D-pad walk is then a straight line down. There is no
separate *explain further* chip, and no exit control — the Ask field stays live throughout, so the
menu is an offer rather than a trap. Today that fence is mandatory-once, Strategy-only, and
explicitly banned on follow-ups
([ollama_prompts.py:1317](../py_modules/backend/services/ollama_prompts.py#L1317)); all three have
to change. Locked as **[D40](audit/maintainer-decisions-locked.md)**.

**Enforcement is wording only** — nothing counts, nothing trims, nothing retries. Chosen with eyes
open: a trim can chop a reply mid-thought, and a retry costs a second round trip on a device where
that is slow. The cost is that the cap is a tendency rather than a guarantee, so it gets measured
instead of asserted.

**TERSE-01** counts lines across these ten questions — Speed mode, terse on — and passes at **8 of
10**. Approved by the maintainer 2026-08-29. They get pinned as a frozen chip batch when the work
starts, so each case is one press of A rather than a sentence thumb-typed on an on-screen keyboard.

| # | Question | Why it is in the set |
|---|---|---|
| 1 | how do i beat the dreadnought | KB boss card |
| 2 | what is the max tdp on a steam deck | short fact — should be one line |
| 3 | my game stutters when i turn | troubleshooting, invites rambling |
| 4 | should i cap fps at 30 or 40 | a choice — tempts pros and cons |
| 5 | what does proton do | a definition — tempts a paragraph |
| 6 | how do i deal with exploders | KB enemy card, and the known fence repro |
| 7 | is 8 watts enough for this game | a judgement — tempts hedging |
| 8 | what should i upgrade first | wide open; expected to fail first |
| 9 | why did my save not carry over | a cause question |
| 10 | how do i get more battery life | classic long-answer question |

**None of the ten contains a depth phrase, and that is not incidental.** Any of the ten words listed
above would loosen the cap on the very row written to measure it — the same reason `KB-ROUTER-01`'s
four sentences contain neither *deck* nor *proton*. Keep that property if a question is ever swapped.

**Known gap in the set:** none of the ten attaches a screenshot, so the *screenshots still get three
lines* rule is asserted and unmeasured. Worth an eleventh row if it ever misbehaves; the maintainer
chose the ten as they stand.

**Not decided:** the on-screen wording of the toggle and its help line.

**Pictures are exempt from the count, but nothing draws one.** The dungeon map and the boss outline
the maintainer described belong to **KB visual maps** in the backlog, which stays parked on purpose.
Terse ships without them.

---

## Session context folds into Show details

Raised by the maintainer 2026-08-30 under the *Vertical space for the chat bubbles* goal. The ask is settled; **what it looks like folded
in is not**, and that is the part to workshop before any code moves.

What exists today, on a settled answer: a **Show details** button and a **Copy** button share one row, and a full-width **Session context
(N turns) ▸** bar sits under them as a second collapsed control. Two disclosures, stacked, for one answer.

Open questions:

- Does Session context become a **row inside** the expanded Show details panel, a **tab** within it, or a **section** appended to it?
- Show details is per-turn; Session context is per-session. Folding a session-wide thing into a per-turn panel means it either repeats on
  every turn or only appears on the newest one. Which?
- **Focus.** Both panels already have their own graphs, and the Session context panel has prior form here — the *stuck inside the Session
  context panel* bug (fixed 2026-08-27) was exactly this shape. Nesting one inside the other doubles the depth the D-pad has to climb back
  out of. Any design that adds a level needs an escape route drawn before it is built.
- What does the collapsed state say? "Show details" alone under-sells it once it also holds the session's chips.

## The tab icon bar collapses when it is not in use

Raised by the maintainer 2026-08-30 under the same goal: *"We need some kind of way of collapsing the tab icon bar when not in use. It's
taking up too much vertical space."* Their own sketch: **a bar indicator with little dashes to indicate where you are in the carousel**,
with the requirement that a user **can glance at any point and see what tab they are on**, and that interacting with it gives more context
and information.

The tension to workshop is in that pair of sentences. A dash strip is cheap in height but says only *3 of 6*; a glance is supposed to
answer *which* tab, which is a name or a glyph, which costs height. Candidate resolutions, none chosen:

- **Dashes plus one glyph.** The active tab keeps its icon; the others become dashes. Height falls to roughly one icon.
- **Dashes plus one word.** The active tab's *name* instead of its glyph — more legible at a glance, and it would settle the long-standing
  *full SETTINGS label* complaint, but reopens locked decision **R5** ([major-redesign.md](major-redesign.md) § 7).
- **Collapse on idle only.** Full strip while the ring is anywhere in the panel, dashes after N seconds without input. Cheapest to read,
  but the strip changing height under a settled panel moves everything below it — and the sticky Ask dock now sits at the bottom edge, so
  a height change there is visible immediately.

Constraints that are already known and should not have to be rediscovered:

- **R5 is locked**: filled active glyph only, no micro labels, no width change, no height cost. Any option above that adds a label reopens
  it in [audit/maintainer-decisions-locked.md](audit/maintainer-decisions-locked.md) first.
- **LB/RB switch tabs**, and the strip is the only thing on screen that says so. A collapsed strip that drops the shoulder hints removes
  the tab-switching affordance for anyone who has not memorised it — note that the row-focused rule already hides those glyphs while the
  chat slot row holds the ring, so the two behaviours have to be designed together, not separately.
- **Steam class names are hashed** (design-language Rule 5); the strip is ours, but anything measured around it must be measured on device.


## Shipped, QA owed — why each was built this way

Moved out of the roadmap's **Verify** section 2026-08-27. Each of these ships and works; what is
recorded here is the design reasoning, the options rejected and the measurements behind them, so
the choice does not have to be re-litigated when the QA row is finally run.

- ★★★ **Clear cache leaves the thread on disk — it clears the screen, not the session** — **fixed and device-confirmed 2026-08-27** across three separate causes ([D32](audit/maintainer-decisions-locked.md#d32--clear-cache-says-it-clears-the-thread-but-the-saved-chat-stays-on-disk-which-half-is-wrong) chat slot, [D34](audit/maintainer-decisions-locked.md#d34--locked-option-1-2026-08-27--clear-cache-is-undone-by-its-own-confirmation-box-what-should-come-back-afterwards) modal snapshot, [D35](audit/maintainer-decisions-locked.md#d35--locked-option-1-2026-08-27--clear-cache-clears-the-screen-but-the-ais-last-answer-is-still-stored-on-the-plugins-own-back-end-should-clearing-forget-it) backend forget). **CLEAR-CACHE-01** Partial — the "clears a generation still in flight" half is unit-tested only, because the model finishes faster than the D-pad walk to the button. Writeup: [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md). **Still owed as its own follow-up (not settled by D32): orphan chat slots accumulate**, one per clear-and-reask cycle.

- ★ **You cannot ask for "the boss" — a card's type is not searchable** — fixed 2026-08-19; **KB-TYPE-01** Open. `sections_fts` indexes `(name, card)` only, so *"how do i beat the boss"* returned 0 candidates on a title whose boss card was right there, and the vector half did not rescue it. Fixed by **query-time type recall** (option b of the three in the original report): a generic type word pulls that game's cards of that type into the pool and marks them preferred, reusing the same flat `RRF_W_TOPIC` signal D22 introduced for compat. Chosen over indexing `section_type` in FTS because it needs no schema change and no corpus rebuild, so it reaches an already-installed corpus — and it is easy to reverse. Verified across three titles: DRG → Dreadnought, Hades → Theseus and Asterius, OoT → Volvagia/Gohma/Twinrova, and *"what dungeon should i do first"* → the dungeon card. Explicit route only, and a named card still outranks its own kind. **Narrowed 2026-08-19** once the Phase 4 cards took Ocarina of Time from three boss cards to six: the preference now applies only to kinds the keyword half missed entirely. `_sections_of_type` returns the game's first three cards of the kind **by section_id** — authoring order, no relevance in it — so preferring them unconditionally promoted an arbitrary slice over a real match. *"how do i beat the water temple boss"* returned Queen Gohma, Volvagia and Twinrova and dropped **Morpha**, whose card opens *"The Water Temple boss"*. Per kind rather than all-or-nothing, so a question naming two types can still rescue the half that found nothing. The rescue direction is unchanged and pinned by its own test. **Maintainer note:** this was one of the three options in the bug and you were mid-flight, so I took the reversible one; say the word if you want the FTS-index version instead.

- ★★ **You cannot ask about a game unless it is running** — fixed 2026-08-19 (**D19**); **KB-NEWTITLE-01** Open on-Deck. `resolve_title_from_question` scans the question against the alias table as a last resort, only when Steam supplies neither an AppID nor a name, so a running game always wins. Longest alias wins, word boundaries, 3-character minimum. Verified locally: *hl2 ravenholm* → Ravenholm, *drg survivor what class* → Classes, *how do gels work in portal 2* → Gels, *what is the best way to beat volvagia in oot* → Volvagia. **Two things the fix turned up:** a canonical title carrying punctuation (*The Legend of Zelda: Ocarina of Time*) never matched its own normalised form, so OoT resolved to nothing and fell through to the genre card; and the spoiler profile was unreachable by name, which D19 explicitly rules out — the name tables now carry the same two profiles in **both languages**, moved together with `tests/contracts/spoiler-title-profiles.json` (that contract caught the change, as designed). **On-Deck still owes** the negative direction: with a game running, a question naming a different title must still answer about the running game.

- ★★ **Expert mode attaches fewer knowledge cards than Strategy** — fixed 2026-08-18; **KB-EXPERT-01** Open, and it re-opens **KB-ASKMODE-01** for a re-run. The route flag asked for Strategy *by name* (`!= "strategy"`), so Expert carried the largest card budget (5) and the strictest relevance floor (4.0 against 1.0) at once. Now keyed off `_DECLARED_GAME_ASK_MODES`, the one definition of "the user declared this Ask to be about the game" — which the vector recall pass reads too, so Expert gained both together. Reproduced on the seed corpus before the fix and measured after: DRG Survivor *"what class should i pick"* Strategy 2 / Expert **1 → 2**; *"what should i upgrade"* Strategy 3 / Expert **1 → 3**. **On-Deck still owes** the count check against a real corpus — note it cannot be read off the screen, the Show details ladder prints no card count; use `scripts/probe_deck_kb_retrieval.py`. Writeup: [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).

- ★★ **Compat retrieval returns a tip from the wrong topic** — fixed 2026-08-18 (**D22**); **KB-ROUTER-02** Open on-Deck. The D16 router worked out the topic and retrieval discarded it. **The bug report's premise was half wrong and the fix changed because of it:** the on-topic tips were not out-ranked, they were **absent** — 0 of 8 storage tips and 0 of 10 steam_input tips ever reached the candidate list, because the questions share no vocabulary with them. So the topic now opens a recall path first and acts as a preference second. All four KB-ROUTER-01 sentences return an on-topic tip first (was 1 of 4); compat tune top-3 81% → 100%, and 96% on a Deck with no embed model, since the fix does not depend on one. Weight is the weakest that works, and a test pins that a clearly better off-topic tip can still win — raise it and D22 stops holding. Measurement: [audit/rag-compat-topic-preference-2026-08-18.md](audit/rag-compat-topic-preference-2026-08-18.md).

- ★★★ **KB download Cancel** — shipped 2026-08-05; **KB-CANCEL-01 — not testable as written, and that is the blocker.** Attempted on-Deck 2026-08-16 and abandoned: at 758502 bytes the whole download-decompress-install cycle takes **~0.9 s** (Deck log `Downloading…` 23:32:37.711 → `Knowledge base installed` 23:32:38.610), so there is no cancel window to press. What looked like a Cancel pass was the **storage picker** (`onPrimaryClick = installed ? runUpdate : openStoragePicker`, [KnowledgeBaseSection.tsx:527](../src/components/KnowledgeBaseSection.tsx)) — press one opens the internal/SD modal, press two starts the download. **To run this row at all the download has to be slowed** — throttle the link (`tc qdisc`), point the fetch at a stalled host, or add a dev-only delay. Until then the six frontend tests are the only coverage and the D-pad-reach half (the part unit tests cannot judge) is unproven.

- ★★★ **Soft** `num_predict` **+ thinking budget** — shipped 2026-08-10; **02 Verified, 01/03/04 Partial (automated, on-Deck confirm owed), 05 Open** (needs a real thinking model). Caps Speed 800 / Expert 1200 / Strategy 1600; soft continue on `done_reason=length` (max 2) with ephemeral **`Continuing…`**; C1 budgets in `ollama_ask_budgets.py` (`think: false` default). **Fixed 2026-08-15:** the cap table was keyed `deep` — the mode's pre-2026-06-26 name — so Expert silently ran on the Speed cap (800, not 1200) since the caps shipped; **EXPERT-CAP-01**. **Fixed 2026-08-15:** Stop landing within 120ms of the cue could persist `Continuing…` into the saved reply — `_update_partial_response`'s throttle dropped the cue-clear write; now a shrinking partial always bypasses the throttle, plus a client-side `stripSoftContinueCue` backstop. Unblocks **Thinking effort control**. Detail: [16-soft-num-predict-thinking-budget.md](planning/16-soft-num-predict-thinking-budget.md).

- ★★★ **Source attribution on knowledge chips** — shipped 2026-08-09; **KB-ATTRIB-01 Partial after on-Deck 2026-08-16 — one sub-check looks like a fail.** The positive case passes: a Portal 2 (`620`) Strategy Ask surfaced `theportalwiki.com · CC-BY-4.0 · as of 2026-08-09` under Show details with the card beneath it, credit accent on the block and a capture date that is not today's. **What did not pass:** the row requires the credit accent be *visibly distinct* from the amber an `open_weight` model chip uses, with both on screen — they were (`Routed gemma4:e2b-it-qat` four rows above), and in `DeckCapture_20260816_233808_game` **the two ambers read as the same colour**. Needs a maintainer eye on the panel and then most likely a token change in [design-tokens.md](design-tokens.md). Also still owed: the negative case (a maintainer-authored-only reply must show no accent and no credit block). **KB-ATTRIB-02** (published corpus ships `ATTRIBUTIONS.md`) is Verified on Deck.

- ★★★ **The eval harness scored every troubleshooting tip against the wrong vector** — fixed 2026-08-21. It kept **one** vector map keyed by `CorpusDoc.doc_id`, and `compat_patterns.pattern_id` and `sections.section_id` are independent sequences that both land in that field — so a section card's vector overwrote the tip's for every id in both tables, **122 of 124 tips** at the current corpus size. Production has never had this problem: it stores `section_vectors` and `compat_pattern_vectors` in separate tables. **Nothing that ships changed; what we could truthfully say about it did.** Corrected on the same corpus, tips only: vector-only top-3 **12.5% → 67.5%**, fusion **57.5% → 72.5%** against keyword's unchanged 65.0%. Across all labelled tuning rows, fusion top-3 **89.2% → 94.1%** against keyword's unchanged 88.2% — so the harness had been reporting that fusion barely beat keyword when it beats it by about six points. The `keyword` arm uses no vectors and is identical in both runs, which is what confirms the diagnosis. **The holdout ship gate is unchanged and still cannot separate the arms** (n=36, 83.3% both) — the correction did not buy a verdict. Prior reports carry a correction banner; [archive/research/kb-embed-bakeoff-2026-08-21-arms.md](archive/research/kb-embed-bakeoff-2026-08-21-arms.md) is the current one. **Does not disturb the compat recall decision taken 2026-08-18** — that was measured through the production service, not this harness.

- ★★★ **Vector half of hybrid retrieval has its own recall pass** — fixed 2026-08-18; **KB-RECALL-01** Open (on-Deck), **KB-RECALL-02** Verified (PC). The vector half no longer re-orders a keyword shortlist — it searches the resolved game's sections itself and RRF fuses two real lists, so a card that shares no keyword with the question is reachable. On `kb_eval_v2` (98 labeled strategy rows) top-3 went **95.9% → 100.0%** with **zero** regressions; the four queries measured on Deck 2026-08-17 now attach. **What a Deck still has to answer:** the pass costs an embed round trip (793–900 ms on device, ~28 ms against a PC Ollama), and it is gated to the **explicit** route so an Ask that merely happened while a game was open pays nothing — confirm both halves of that on hardware. Floor is measured, not guessed, and the two distributions **overlap**: [audit/rag-vector-recall-floor-2026-08-18.md](audit/rag-vector-recall-floor-2026-08-18.md). Writeup: [archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md).


---

## Superseded originals — the Bugs entries as they read before the 2026-08-27 rewrite

The roadmap now carries a plain-language summary of each of these. The originals are kept
verbatim because several carry measurements, ruled-out leads and reproduction steps that would
otherwise have to be re-derived — in particular the spoiler-fence entry, whose *when* half was
proven at the prompt rather than from the screen, and the entity-extraction gaps closed alongside it.

Where an entry has since been fixed and verified, its writeup is in
[archive/roadmap-bugs-fixed.md](archive/roadmap-bugs-fixed.md) instead.

- ★★ **Ordinary phrases attach game cards** — **PARTIAL, D28 option 2 implemented 2026-08-23.** With a game running in Strategy mode, questions unrelated to the game still get cards stapled on: *"one sentence"* → Praetorian, *"thank you very much"* → Nitra, *"what time is it"* and *"please repeat that"* → three cards each (Deck, corpus `2026.08.22`, DRG Survivor running). This is the regression direction **KB-SPELLING-01** says must not happen, but **not for the reason that row predicts** — the British-spelling exemption set is innocent, the query is not expanded and the card scores `bm25=0.00`. Hybrid on/off splits the blame: the new vector recall pass (`bf16b35`) supplies the card alone for two of the four, while the other two attach on the keyword half by itself — so the Strategy explicit-route floor of **1.0** is the underlying cause and the vector recall widens it. Invisible to `kb_eval_v2`, because every approved question is a real question about a real game. **[D28](audit/maintainer-decisions-locked.md#d28--ordinary-phrases-attach-game-cards-how-hard-should-the-floor-be) locked 2026-08-22: option 2 — give the vector half its own floor, separate from BM25's.** The precondition cleared the same morning (D23 landed in `e606b82`), so the floor is tuned once against one baseline. `BM25_RELEVANCE_FLOOR` stays at 1.0 as instructed (raising it pushes against D25). **The floor is kept at 0.515 on the maintainer's call 2026-08-23, and the overlap behind it is filed as its own backlog entry — *Card relevance needs a second signal*, Knowledge base lane. Do not retune this number again; see the correction note under [D28](audit/maintainer-decisions-locked.md#d28--ordinary-phrases-attach-game-cards-how-hard-should-the-floor-be).**
- ★★ **Focus inside the answer bubble lands on text that does nothing** — **PARTIAL — code fix landed 2026-08-23, on-Deck confirmation owed. Originally OPEN, found 2026-08-22** from the same recording. Stepping the D-pad through a finished reply parks the focus ring on non-interactive prose — the *"Here's the lowdown:"* line inside the answer, and the raw JSON block under *Full transparency snapshot* — before reaching real controls. Two consequences: the user presses A on something inert and nothing happens, and the reachable-control count is inflated so a genuinely unreachable control (the spoiler fence above) looks like it is merely further down the list. Likely `answerStopRegistry` creating stops on text nodes; that file's own header says it handles stops *"other than the masked-spoiler diversion, which stays in `spolierFenceRegistry` and runs first"* — worth checking whether "runs first" still holds. **Research alongside the spoiler bug — same subsystem, and a fix to either can move the other.** **Checked 2026-08-23: "runs first" still holds** — `handleAnswerBubbleMoveDown` still checks `findUnvisitedSpoilerFenceInView` before the `orderedAnswerStops` walk ([answerBubbleNavigation.ts:197-220](../src/utils/answerBubbleNavigation.ts#L197-L220)), unchanged. That rules out ordering as the cause. **Every paragraph being its own D-pad stop is Phase B's intended behavior** (2026-08-07, "every section of a streaming answer is a D-pad stop"), not itself a bug to undo — the actionable part of this report is the same `<pre>`-wrap defect fixed on the row above, which is why Down was falling through past the fence to plain prose instead of diverting. The *"raw JSON block"* half of this report is not conclusively identified — the Ask diagnostics dump is reachable and does toggle on A, so it may instead describe `ContextChipLadder`'s own `devJson` panel, which has no `onActivate` by design (a read-only info display, not a control) and was not touched. **2026-08-26 — re-checked on device by script.** The prose-stop half does **not** reproduce as a defect: a 10-step D-pad walk through a finished Strategy reply produced exactly one prose stop (the turn's own question echo) before reaching *Helpful*, which is the Phase B behaviour this entry already says is intended, not an inflated count. The *raw JSON block* half was not observable on this turn — no `devJson` panel was mounted — so that half stays unverified rather than cleared. **What does still stand is the second consequence:** the reachable-control count is only honest if every control is reachable, and the spoiler fence above is confirmed still unreachable on this same build, so a user stepping this reply genuinely cannot get to it. Tracking that on the row above; this row's own actionable part is now down to the unverified JSON-block half. Original note: On-Deck re-check owed once the fence fix is confirmed, to see how much of the remaining walk-through-prose feeling is left.
- ★ **An Ask that completes on the start call loses its branch picker and checklist** — **OPEN, found 2026-08-27** while writing the STRAT-CHECKLIST-01 test, which failed against this path before being moved onto the polled one. `onAskOllama` has a fast path for a `start_background_game_ai` that returns `completed` outright; it hand-builds the terminal status rather than passing the RPC's own payload through, and that literal hardcodes `strategy_guide_branches: null` and **omits `strategy_checklist` entirely** ([useBonsaiAskOrchestration.ts:1120-1141](../src/hooks/useBonsaiAskOrchestration.ts#L1120-L1141)). So on that path neither panel can ever appear, whatever the model emitted.
- ★★★ **D-pad focus is trapped inside the expanded Session context panel** — **Found on-Deck by the maintainer 2026-08-23** (`recordings/DeckRecord_20260823_170847_game.mkv`, Batch A on Deep Rock Galactic: Survivor). With **Session context** expanded, focus enters the panel and never leaves: *Helpful*, *Not really*, *Retry* and *Show details* above it are all unreachable, and the only way out is to close the panel. **Worse than the bug it came from** — the entry above turned a one-way chip carousel into a one-way *panel*.
- ★ **The active chip in *Show details* is hard to identify — no focus ring, and "Chip 1 of 6" is easy to miss** — **OPEN, filed by the maintainer 2026-08-23** from the same session (`recordings/DeckRecord_20260823_171325_game.mkv`, *Chip 6 of 6* on screen). Stepping the chip carousel changes which chip's body is shown below, but nothing on screen makes the current chip obvious: the pager reads *Chip N of 6* in 10px `#8fa6bd` ([ContextChipLadder.tsx:169-171](../src/components/ContextChipLadder.tsx#L169-L171)) above the chip row, and the active chip is distinguished only by 11px vs 10px text and a tier-colored fill ([ContextChipLadder.tsx:200-208](../src/components/ContextChipLadder.tsx#L200-L208)). **There is no focus ring on the chip at all** — the ladder is a *single* `Focusable` that handles Left/Right/Up/Down internally, so Steam paints its ring on the whole ladder container and never on the selected chip. The user has to read a small grey counter to know what they are looking at. **Not a navigation failure** — stepping works; this is purely about knowing where you are. **Fix lean:** give the active chip a real selected treatment (border weight or an outline that reads at 300px, per [design-language.md](design-language.md)) rather than growing the pager text; the chips are already tier-colored, so the selection cue must not be another color. Check it against a 6-chip ladder where several chips are `credited` and already carry the attribution accent border.
- ★ **Question Overlay Alignment Drift** — **OPEN.** 3-line question overlay has minor horizontal spacing mismatch vs native `TextField` internals. **Second symptom captured 2026-08-22** (`screenshots/DeckCapture_20260822_164957_game.png`, red arrow): in the empty Ask field the **caret sits left of where the placeholder text begins** — it renders immediately after the AI-character avatar, with a visible gap before *"Describe the level, boss, or puzzle you're stuck on."* — so the caret does not mark where typing will actually start. Probably the same root cause as this row and as **ASK-CARET-CHAR-01** in [testing.md](testing.md) (caret behaviour with the AI character avatar present, which is exactly the configuration in the capture); check whether all three are one bug before fixing them separately. Per [design-language.md](design-language.md), measure on device — a screenshot cannot show which element owns the offset.
- ★ **`KB-NEWTITLE-01` is used as the ID for two different QA rows** — **OPEN, found 2026-08-22; decision locked same day as [D30](audit/maintainer-decisions-locked.md#d30--which-of-the-two-kb-newtitle-01-rows-keeps-the-id).** In [testing.md](testing.md), *"KB reaches a title named in the question (D19)"* and *"Every corpus title has cards"* both carry `KB-NEWTITLE-01`. They test different things. **The call:** the D19 row keeps the ID; *Every corpus title has cards* becomes **`KB-COVERAGE-ALL-01`** — it is cited nowhere outside its own table row, so the rename breaks no live reference. Fix the stale "119 sections" in that row in the same edit (it is **133** as of corpus `2026.08.22`).
- ★ **Two different decisions are both filed as D19** — **OPEN, found 2026-08-18; decision locked 2026-08-22 as [D31](audit/maintainer-decisions-locked.md#d31--which-of-the-two-d19s-keeps-the-number): the live one keeps D19, the superseded corpus-licence one becomes D19b.** [maintainer-decisions-locked.md](audit/maintainer-decisions-locked.md) uses **D19** twice: the corpus licence question (*mixed CC BY / BY-SA in one file*, superseded by D20 on 2026-08-14) and *Can you reach the strategy corpus without the game running?* (locked 2026-08-17). A reference reading "see D19" is ambiguous, and the live one is cited by the ★★ *You cannot ask about a game unless it is running* bug — so the risk is implementing against the wrong lock. **Not fixed in passing on purpose:** renaming either breaks references in roadmap.md, the bug list and the decision file's own index, so it is a maintainer call which number moves. A collision note is in place meanwhile. Prior art for the hazard: D21 carries its own numbering note because commit `e049ace` cited it as D18.
- ★★ **The spoiler fence on a no-story game is question-dependent, and it now lands mid-reply** — **PARTIAL — the "when" half fixed 2026-08-23, the "where" half still open; found 2026-08-22** across one screenshot and three recordings, all Deep Rock Galactic: Survivor, Strategy mode, corpus `2026.08.22`, same session and same model (`gemma4:e2b-it-qat`). Distinct from the false-positive row below, which is about the fence appearing at all; this is about **when** it appears and **where** it lands, and the two observations point away from "the model is just flaky".
  - **This bug is two bugs, and they belong in different places.** *When* the fence appears is backend prompt wording, traced above, and needs no device. *Where* it lands — mid-reply rather than trailing — is unexplained and is about how a reply is segmented, so it sits with the answer-bubble focus bugs above: the fence is a focus stop as well as a render decision, and `prepareStreamMarkdown` decides both. **The fence-rate-per-question measurement is now optional for the first half and still worth running for the second.**
  - **The "when" half — fixed 2026-08-23.** The third arm of `_strategy_spoiler_low_risk_addendum` (`py_modules/backend/services/ollama_prompts.py:297-301`) now carries the same explicit "do NOT wrap ... in `bonsai-spoiler` fences" instruction the other two arms already had, tied to the title already being known `low_narrative`. Covered by a new unit test (`test_strategy_spoiler_policy_low_risk_genre_with_no_entity_still_forbids_fencing` in `tests/test_ollama_service.py`); **not re-run on the Deck**, so the placement half (mid-reply vs. trailing, still out of scope — belongs with the answer-bubble focus bugs above) and any residual on-device fence rate still need on-Deck confirmation. Offering to pin the three original questions (*"how do i deal with the exploders"*, *"what is red sugar for"*, *"how do i beat the twins"*) as frozen test chips for that check.
    - **The regression this row's QA warned about has happened. `how do i beat the twins` now fences, and it did not on 2026-08-22.** On-Deck 2026-08-23 (`recordings/DeckRecord_20260823_175825_game.mkv`). § 3 of the QA plan named this exact outcome as *"more serious than #5 failing"*, because #6 is the control that was clean before the fix. `Spoiler risk: low` on the chip, and it fenced anyway. **The fence lands mid-reply** — between the opening line and the tactics — which is the first on-device evidence for the still-open "where" half below.
    - **The fence hides almost nothing.** The fenced block and the plain text immediately under it give the same advice twice: fenced *"splitting your fire evenly between them… keep both of 'em busy so they can't focus on healing"*, then in the clear *"Split the firepower evenly… Keep both of 'em busy so they can't focus on healing when you hit that gap."* Only one detail is fence-only (health bars drifting apart during the immune window). So the block is not merely a false positive, it is self-defeating — the user reveals it to read what is already on screen.
    - **A real extraction gap, found while investigating — but NOT proven to be the cause.** The two prompts differ in exactly one place. For *exploders* the prompt says *The user asked about **"Exploder"*** — the card's own title, resolved by the gazetteer. For *twins* it says *The user asked about **"twins"*** — the raw word the user typed, because `_match_known_entity` ([ollama_prompts.py:198-215](../py_modules/backend/services/ollama_prompts.py#L198-L215)) requires the **whole** card name to appear in the question, plus at most one trailing `s`. *"exploders"* is `Exploder` + s, so it resolves; *"twins"* is a **suffix** of `Dreadnought Twins`, and *"dreadnought"* never appears in the question, so the match fails and the phrasing-pattern fallback returns the bare noun. **Retrieval was fine either way** — `boss: Dreadnought Twins` was ranked first in the attached cards. This is a genuine partial-name defect worth fixing on its own: any card whose title has more words than the user typed resolves to the user's word instead of the card.
    - **Determinism established on-Deck 2026-08-23: it fences every time.** The maintainer ran *"how do i beat the twins"* three more times. The trace shows **four consecutive runs, all fenced, all with the identical entity string `"twins"`** — so this is not the turn-to-turn variance the row previously recorded, and the partial-name gap goes from "a lead" to the prime suspect with nothing else on the table.
    - **Extraction gap FIXED 2026-08-23** (`_match_known_entity`, [ollama_prompts.py](../py_modules/backend/services/ollama_prompts.py)). When no full card title appears in the question, it now falls back to the card's **head noun** — trailing word spans only, so *"twins"* resolves `Dreadnought Twins` while *"dreadnought"* resolves `Glyphid Dreadnought`, and it returns the **card's full title** rather than echoing the user's abbreviation. Verified against the exact card sets the trace recorded: `twins` → `Dreadnought Twins` (was `twins`), `exploders` → `Exploder` and `red sugar` → `Red Sugar` both unchanged, and `spitters` → `Acid Spitter` newly resolves as a free side-effect.
      - **The fallback is narrow on purpose, because over-matching here is a safety regression rather than noise** — naming an entity is what *unfences* it (spoiler-constitution rule 7), so a wrong match unfences real spoilers on a story title. Guards: it runs only when nothing matched in full; trailing spans only; minimum four characters; and a generic-head blocklist so *"how do i beat the boss"* reaches **nothing** even when a `Water Temple Boss` card is attached. A card whose entire title is a generic word (DRG's `Classes`) still matches exactly, through the full-title pass that runs first. Six new tests in `tests/test_asked_entity_extraction.py`, including the safety direction; full suite green (834).
      - **This is NOT yet shown to stop the fence.** It fixes a defect that is real on its own merits and makes the prompt name the card the corpus actually supplied. Whether the model then keeps twins tactics in plain text needs the same four-run repeat on device after deploying. **If it still fences with the entity reading `Dreadnought Twins`, the cause is prompt wording, not extraction** — and that is worth knowing, because it is the remaining hypothesis.
    - **CONFIRMED on-Deck 2026-08-23 — the "when" half holds for `exploders`, proven at the prompt, not just the pixel.** *"how do i deal with the exploders"* — the exact question that fenced on **both** 2026-08-22 captures — answered in **plain text with no fence at all** (`recordings/DeckRecord_20260823_173947_game.mkv`). The Desktop ask trace shows every link in the chain working: the extraction gap is closed (*"The user asked about "Exploder""* appears in the built prompt, so `deal\s+with` now matches), the low-risk arm fires with its new instruction (*"Reserve `bonsai-spoiler` only for hidden narrative twists, endings, or secret unlock paths — not standard boss move-sets or wave tactics"*), and the raw model output contains **no `bonsai-spoiler` fence** — so this is the prompt fix working, not a lucky generation. Three cards attached (`Exploder`, `Acid Spitter`, `Mactera`), and the reply carries real card content (*"fragile"*, *"the blast chains"*) without fencing it. **The "where" half is untouched and stays open** — no fence was produced, so nothing tested placement.
  - **The two extraction gaps — closed 2026-08-23, separate commit.** `deal\s+with` added to `_ENTITY_VERB_FIRST_PATTERNS` (`ollama_prompts.py:110-115`); `_match_known_entity` (`ollama_prompts.py:194-210`) now allows one trailing "s" past a known card's name. Re-run against the desk trace: `extract_strategy_asked_entity("how do i deal with the exploders", known_entities=["Exploder", "Red Sugar", "Dreadnought Twins"])` now returns `"Exploder"` (was `""`); the other two questions were already fine and are unchanged. Both covered by new cases in `tests/test_asked_entity_extraction.py`; kept as a separate, smaller commit from the addendum fix on purpose, so the main fix does not depend on extraction succeeding for every phrasing.
- ★ **Strategy spoiler false-positive** — **PARTIAL.** Options 1+2+4 landed 2026-08-07. **Fixed 2026-08-15:** the mid-stream mask chip (R4) no longer flashes for a fence the turn already qualifies to unwrap — `prepareStreamMarkdown` now accepts an `unwrapOpenSpoilerFence` callback built from the same eligibility gate as the closed-fence unwrap, so a qualifying fence streams as prose from the first token instead of masking until it closes. **STRAT-SPOIL-DRG-01** on Deck remains — only the three ship-gate rows (DRG-01, DRG-01d, DRG-01b/c). **Reproduced on device 2026-08-22** (`screenshots/DeckCapture_20260822_164957_game.png`, corpus `2026.08.22`): *"how do i deal with the exploders"* on Deep Rock Galactic: Survivor came back with a *Spoiler — tap to show* block. **The classification is not the fault** — DRG is correctly `low_narrative` in both languages ([spoiler_title_profiles.py:18](../py_modules/backend/services/spoiler_title_profiles.py#L18)), and the prompt correctly carries the low-risk addendum telling the model *not* to fence routine boss/enemy guidance ([ollama_prompts.py:261-300](../py_modules/backend/services/ollama_prompts.py#L261-L300)). **The model fenced anyway.** So the real finding is that fencing on a low-narrative title is enforced only by asking the model nicely, with no post-check on the way out — and a survivor-style roguelike with no campaign is the clearest case where a fence is simply wrong. **Deep research owed:** whether a low-narrative title should strip `bonsai-spoiler` fences programmatically after generation rather than trusting prompt compliance, and what that costs on the titles where fencing is load-bearing. **See also the entry above** (2026-08-22): the fence appears to be **question-dependent** rather than random, and has started landing mid-reply — establish that before deciding whether stripping is the right fix, because a per-question cause would not need stripping at all. Detail: [04-strategy-spoiler-false-positive.md](planning/04-strategy-spoiler-false-positive.md), [spoiler-constitution.md](planning/spoiler-constitution.md). **Prompt-side cause fixed 2026-08-23 — see the two new sub-bullets on the entry above** ("The spoiler fence on a no-story game is question-dependent"); not yet re-confirmed on this specific Deck repro.
- ★★ **Focus ring consistency** — **PARTIAL.** `BonsaiModalScope` on portalled modals shipped; blanket `button.gpfocus` rule reverted (native Steam outline preferred). **Fix lean:** modal CSS reach + real `Focusable`s — see [gamepadAndPullModels.ts](../src/styles/sections/gamepadAndPullModels.ts).
- ★★ **Fullscreen pickers return you to the right tab, but not to the right control** — **PARTIAL (1/3 on-Deck); one opener root-caused and fixed 2026-08-30.** The chat-slot rename opener was landing focus on the tab strip for a specific, checkable reason: `focusOwnerById` resolves its target with `el.matches('.Panel.Focusable') ? el : el.closest('.Panel.Focusable')`, and the row registered its **outer wrapper**, a plain div — so `closest` walked UP to an ancestor container and focused that. Registering the row's own Focusable fixed it; verified on device with `gpfocus` (not `activeElement`) back on `.bonsai-chat-slot-row-focus` after Cancel. **Worth checking the other two openers for the same shape** — a registered element that is not itself `.Panel.Focusable` will always resolve upward. Prior state follows. **PARTIAL (1/3 on-Deck).** `modalReturnFocusRegistry` shipped; Models hub → Ollama and desktop-note → Main land on tab strip. **PICKER-FOCUS-01**; next step is instrumentation, not another guess.
- ★★ **Live Ask user bubble shows "…" after reopen** — **Code fix landed 2026-08-23, on-Deck verification owed.** Re-verified both readings on current code, not the 368-commit-stale copy an earlier attempt used. **The backend-is-silent claim was wrong.** `get_background_game_ai_status` ([main.py:2729](../main.py)) does carry `question` at every stage: the pending write ([main.py:2648](../main.py)) calls `pending_background_state(question=parsed_question, ...)`, which puts `question` in the dict ([background_request_state.py:42-64](../py_modules/backend/services/background_request_state.py)); the terminal write ([main.py:2441](../main.py)) does `{**self._background_state, "status": terminal, ...}` — a spread that keeps `question` since it is never in the override list; and `_merge_partial_into_background_status` ([main.py:523](../main.py)) only ever `dict(state)`-copies before adding streaming fields. **The real gap was the display side**, matching the second (non-stale) hypothesis: `applyBackgroundStatusToUi` in [useBonsaiAskOrchestration.ts](../src/hooks/useBonsaiAskOrchestration.ts) never called `setAskThreadDisplayQuestion` from its `pending` branch (~491-524) or its `completed` branch (~596-650) — only `setOllamaResponse`/`setLastExchange`. A remount mid-Ask starts `askThreadDisplayQuestion` at `""` because the survival snapshot is written only right before a nested-modal open ([useBonsaiPluginShell.ts:115](../src/hooks/useBonsaiPluginShell.ts) `captureSessionBeforeModal`), not on a plain QAM close — Decky gives the plugin no closing hook to capture on. Once blank, nothing ever refilled it, even after `lastExchange` had the right text. **Fix:** both branches now backfill `askThreadDisplayQuestion` — pending from `status.question`, completed from the already-resolved `q` — via `setAskThreadDisplayQuestion((prev) => prev || value)`, so it only fires while blank and can never clobber a caption (e.g. a preset's nicer wording) already on screen. Left [MainTabChatTranscript.tsx](../src/components/MainTabChatTranscript.tsx) untouched — another helper owns that file for the answer-bubble nav bugs. **Follow-on duplicate-bubble symptom, on-Deck 2026-08-22:** traced `lastExchange.question` through the broken-header path and found it was already correct there (set from `status.question`, independent of the blank live header), so the turn-archiving effect ([useBonsaiAskOrchestration.ts:434-447](../src/hooks/useBonsaiAskOrchestration.ts)) was archiving the right text the whole time in a static read of the code — could not locate a second, independent mechanism for the stacked duplicate by inspection alone, and could not reproduce it off-device. Left **OPEN pending on-Deck re-test after this fix**; plausible the fix above closes it too by removing the blank-header window, but that is unproven without the device.
- ★★ **Live-turn transparency UI missing after successful Ask** — **OPEN, but the premise is now doubtful — retest before spending on it.** Filed as a blocker for **CONTEXT-LADDER-01**; on 2026-08-16 (build `6329577`, corpus `2026.08.16`) a live-turn **Show details** rendered the chip ladder cleanly on a Portal 2 Strategy Ask — 6 chips, no wrap fault, screenshot `DeckCapture_20260816_233808_game` — which is the opposite of this report. testing.md records that as "the CONTEXT-LADDER-01 blocker did not materialise" on the **KB-COVERAGE-01** row. Either it was fixed in passing or the original was environment-specific. **Next step: re-run CONTEXT-LADDER-01 on Deck and either close this or capture the conditions that reproduce it** — do not re-open an investigation on the old description.
- ★★ **Main tab answer D-pad scroll choppy / multi-line jumps** — **OPEN — re-measure first.** Phase B (2026-08-07) made every answer section a D-pad stop; scroll-step is fallback only. **STREAM-09**, **D-PAD-SCROLL-02** in [testing-manual.md](testing-manual.md).
- ★★ **Feedback and Retry are unreachable after a normal Ask** — **PARTIAL — code fix landed 2026-08-23, on-Deck confirmation owed. Originally OPEN, found 2026-08-23 by the maintainer** (screenshot `DeckCapture_20260822_231338_game.png`: completed *what time is it* Ask on Left 4 Dead 2 shows *Show details* and diagnostics but no thumbs row). The *Was this helpful?* row, **Retry**, and the refinement chips render only when the **live** turn is the expanded one ([MainTabChatTranscript.tsx:576-585](../src/components/MainTabChatTranscript.tsx#L576-L585)), and the archived-turn branch passes `showFeedback: false` with no `onRetry` on purpose ([MainTabChatTranscript.tsx:397](../src/components/MainTabChatTranscript.tsx#L397) — "Feedback, Retry and refinement chips stay live-only"). But after every completed Ask the slot reload finds no pending question and expands the **newest archived turn**, not live ([useChatSlots.ts:57](../src/hooks/useChatSlots.ts#L57)) — so on the normal path the whole action row is dead code. **The one path that shows it is itself a bug:** the background-rehydration reopen (the `…` entry above) restores the answer into live state without the archive-and-swap, which is why thumbs appeared only after closing the QAM mid-thinking (`DeckRecord_20260822_200436_game.mkv`). Same family as the 2026-08-17 *Show details* regression, which was fixed by teaching the archived branch to render that one control — feedback, Retry and the chips were left behind. **Fix lean:** either wire feedback/Retry through the newest archived turn (rating must land on the exchange it belongs to), or keep the live turn expanded after completion; pick one, do not split the difference per control again. **FIXED 2026-08-23** (frontend-only, code check + unit tests, no on-Deck confirmation yet): took the first option. The archived-turn branch now renders feedback/Retry/refinement chips when it is the newest archived turn, isn't mid-Ask, and `lastExchange?.answer` is non-empty — same gate the live branch used, moved onto `lastExchange` (the most recently completed exchange) rather than onto whichever turn happens to render as "live" ([MainTabChatTranscript.tsx](../src/components/MainTabChatTranscript.tsx)). `onRate`/`onRetry`/`onChip` still go through the same `lastExchange`-keyed handlers the live branch always used, so a rating lands on the exchange it belongs to. Older archived turns keep the existing details-only row.
- ★★ **Token streaming reveal is chunky under game load** — **OPEN, measured 2026-08-22.** STREAM-REVEAL-01 (2026-08-04) measured the reveal *smooth* on Deck and downgraded risk R3 in [05-token-streaming-review.md](planning/05-token-streaming-review.md), but that run left **STREAM-11** open: frame cost under game load unverified. New capture with Ship of Harkinian running (`recordings/DeckRecord_20260822_201647_game.mkv`, *what should i keep in my bottles*, `gemma4:e2b-it-qat`, streaming on): `freezedetect` over the answer region shows the text **fully static for stretches of 3.2s, 2.3s, 2.1s, 3.9s and 3.7s** during the first ~18s of streaming, with visible updates only in brief bursts between them — the opposite of the designed drip (backend flush 120ms, frontend poll 150ms, RAF reveal). The final ~10s update every 0.3–1s, so cadence improves as generation goes on. **The video cannot separate token arrival from render:** gaps this long mean either Ollama produced nothing for seconds under GPU contention with the game, or the poll/reveal pipeline stalled after catching up. **Next step is instrumentation, not code:** log poll-delivery timestamps and reveal-paint timestamps on-Deck under game load and diff the two series — whichever side owns the gaps owns the bug. STREAM-REVEAL-01's smooth result stands only for the idle-Deck case and must not be cited against this.
- ★★ **Model routing try-order modal focus + chrome** — **OPEN (deferred polish).** `ModelRoutingOrderModal` D-pad lands on leaf Up/Down; chrome mismatches other fullscreen pickers. Screenshot `DeckCapture_20260730_144925`.
- ★★ **Strategy live-turn D-pad graph skips branches/feedback** — **OPEN.** Verify **MICRO-04** on Deck.
- ★★★ **AppID collision: OoT/SoH seed row used the real Stardew Valley AppID** — fixed 2026-08-21; **KB-APPID-01** Open (on-Deck). `data/kb/strategy_seed.json` game_id 1 carried `app_id: "413150"`, which is Valve's actual Stardew Valley AppID. Reproduced before the fix: a Stardew Valley session asking *"how do i make more money on my farm"* attached **three Ocarina of Time cards**, and `resolve_title_spoiler_profile` returned `protect_progression` — so a Stardew player also inherited Zelda's progression fencing. The Phase 4 cards made it worse by eight cards before this was fixed. **The prerequisite the earlier note asked for already existed:** the name tables added for D19 on 2026-08-19 protect both *Ocarina of Time* and *Ship of Harkinian* without an AppID, so removing 413150 costs no fencing. Now `app_id: null` with `igdb_id: "emudeck-oot-n64"` — the same shape State of Emergency already used, and required by the schema's `app_id IS NOT NULL OR igdb_id IS NOT NULL` check — plus the canonical title added to the alias table so a running session still resolves by name. **The eval fixture was the one real blocker and measurement dissolved it:** the 13 `kb_eval_v2` rows keyed by the borrowed AppID became `shortcut` rows, and **every arm on every split scored identically to the decimal** before and after — keyword, vector-only, rerank-only and RRF, tune and holdout, compat and strategy. The rows test what they always tested. Four TypeScript tests used 413150 as a stand-in for *any* narrative title and were repointed to Red Dead Redemption 2; they kept passing after the change for the wrong reason, which is the failure mode CLAUDE.md rule 6 names.
- ★★★ **Character picker: focus ring invisible, D-pad does not move** — **OPEN (selection fixed).** Modal uses `querySelector` focus helpers — fix CSS reach first, then registered-owner pattern. Blocks AI-character on Deck. [CharacterPickerModal.tsx](../src/components/CharacterPickerModal.tsx).
- ★★★ **Fullscreen picker D-pad edge-escape (audit)** — **OPEN.** Audit Pull Models, Character picker, models hub, other `showModal` pickers for below-list / above-list escape.
### The raw JSON inside a reply — measured 2026-08-28

**What the report said, and what was actually there.** The entry *"Focus inside the answer bubble
lands on text that does nothing"* named two things: prose stops, and *"the raw JSON block under
Full transparency snapshot"*. Both were checked on device against a byte-identical bundle
(`md5 6e6e200aa84b8eabdbaa3cf9ad5e589a` on host and Deck).

- **Prose stops are not a defect.** A finished Strategy reply produced three of them, one per
  answer section, which is exactly what Phase B (2026-08-07) set out to do. This repeats the
  2026-08-26 result on a different reply, so the question is settled.
- **The Developer chip's JSON is not a stop.** With *Show details* open and the strip stepped to
  *Chip 5 of 5*, the `dev_json` `<pre>` mounts (181px, `overflow: auto`) but its nearest focusable
  ancestor is the chip strip itself (`tabindex="-1"`, holding `gpfocus`). The ring stays on the
  strip. That half of the report is closed as **does not reproduce** — the location named in it is
  wrong.
- **A different raw JSON block does reproduce, and it is worse**, because it is inside the answer
  the user is reading. Walking down the reply, the ring landed on
  `{"title":"General Deck Performance Tip","items":[{"id":"1","label":"Check Power Mode",…}]}`
  rendered as a visible code block (238×107px). It is a real stop —
  `bonsai-answer-stop Panel Focusable tabindex="0"` — and A on it did nothing
  (`moved: false`, panel labels unchanged before and after).

**Cause, from the log rather than from reading code.** The plugin log for that turn reads
`ask_ollama: strategy fences branch_marker=False branch_parsed=False branch_options=0
checklist_marker=True checklist_parsed=False`. The model emitted a checklist fence with **one**
item; `_normalize_checklist_payload` requires two
([strategy_guide_parse.py:29](../py_modules/backend/services/strategy_guide_parse.py#L29)), so
`_extract_checklist_fence` returns `(text, None)` — **the original text, fence and all**. Nothing
downstream removed it, so it rendered as a markdown code fence
(`pre.bonsai-md-fenced-pre`, `language-bonsai-strategy-checklist`) and picked up an answer-stop
wrapper like any other section.

**Why only the checklist had this hole.** The branch path has had
`hide_incomplete_strategy_branch_fence` since the picker shipped, for exactly this case: log the
rejection, then take the fence out of the display text. The checklist path never got the twin.

**The fix** is that twin, plus the matching warning log line. It differs in one way on purpose: it
keeps whatever follows the closing fence, because the prompt asks for the checklist *after* the
coaching prose, so a tail is model drift and not payload.

**Proof on the deployed code, not on a local copy.** The reply's exact payload was run through the
Deck's own installed parser after the reload:

```
checklist parsed: False
BEFORE hide - fence still visible: True   raw json still visible: True
AFTER hide  - fence still visible: False  raw json still visible: False
AFTER hide  - text the user reads: 'Alright, listen up! Here is the deal.'
```

**Still owed:** one sighting on device of a live reply where the model emits an under-sized
checklist. The marker to look for is the new
`ask_ollama: strategy checklist fence present but did NOT parse` warning — when it appears, the
reply above it must contain no JSON.

### Fullscreen picker edge-escape audit — run 2026-08-28

Every press below was a real controller press through the bridge board, against a byte-identical
bundle (`md5 6e6e200aa84b8eabdbaa3cf9ad5e589a` on host and Deck). The test for each picker was the
one the roadmap asked for: from the first control press **Up**, from the last press **Down**, and
see whether the ring leaves the list or sticks.

| Picker | Top edge | Walking down | Bottom edge | Verdict |
|---|---|---|---|---|
| AI character | holds on *Random* | through every character column, the custom field, then **OK** | holds on **OK** | **pass** |
| AI models hub (also where *Browse models* goes) | holds on the *Policy* tab | filters, chips, model rows, then **Pull selected** | holds on **Pull selected** | **pass** |
| Text / vision try order | holds on the first *Up* button | **reorders the list and drops the ring** | reaches the footer only after the item is dragged to the bottom | **fail** |

**On the two passes.** "Holds" is not the same as "traps". In both, the first control is the top of
the modal and there is nothing above it to reach, and the last control is **OK** / **Pull selected**
with **Cancel** one press to the right. Nothing is stranded, so both are closed. Worth noting the
footers are two-wide: a down-only walk reports the left button and misses the right one, which is
the same shape as the 2×2 reply-actions grid and should not be filed as a half pass.

**On the failure.** [ModelRoutingOrderModal.tsx:139-153](../src/components/ModelRoutingOrderModal.tsx#L139-L153)
binds each row's `onMoveUp` / `onMoveDown` to *reorder the model*, then calls
`rowRefs.current[index ± 1]?.focus()`. So on a controller:

- **Down does not move the highlight.** It moves the *model*. Measured: the order began
  `gemma4, qwen2.5:1.5b, qwen3.5:4b, nomic` and after three Down presses read
  `qwen2.5:1.5b, qwen3.5:4b, nomic, gemma4`. A user scrolling to read the list rewrites it.
- **The ring then disappears.** After each reorder, `document.querySelectorAll('.gpfocus').length`
  was **0** across every Steam view, with `document.activeElement` back on `BODY`. The `.focus()`
  call is a DOM focus, which is the thing `.cursor/rules/decky-focus-graph.mdc` says does not move
  Steam's ring — so the row moves out from under the ring and nothing picks it up.
- **B stops working while the ring is gone.** Three B presses in a row did not close the modal;
  the first two went into re-acquiring focus. This is the "picker you cannot leave" case the audit
  was written to find, and it is worse than sticking, because there is no highlight to tell you
  where you are.
- **The only exit downward is to finish the job.** Once the item reaches the last row,
  `onMoveDown` returns `false`, Steam yields to the parent, and the ring lands on *Reset to
  defaults*. Confirmed.

Nothing was saved: `Cancel` was used to close, and `text_model_routing_order` /
`vision_model_routing_order` both read `[]` on disk afterwards, unchanged. The same component
serves the vision order, so the vision list has the same defect without needing a second run.

**Also re-confirmed in passing:** closing the models hub put the ring back on the **tab strip**,
not on the button that opened it — **PICKER-FOCUS-01**, exactly as recorded on 2026-08-04.

### D36 option 1, implemented and confirmed — 2026-08-28

**The change.** Each row's `onMoveUp` / `onMoveDown` handlers are gone, along with the
`rowRefs` + `.focus()` calls they used. Reordering stays where it already worked: the **Up** and
**Down** buttons on each row, pressed with A. The body copy changed with it — *"Move up/down to set
try order"* was ambiguous once the D-pad stopped reordering, and now reads *"Use a row's Up and Down
buttons to set the try order."* A comment on the row records why the handlers must not come back.

**Confirmed on device**, real presses, bundle hash matched host and Deck (`fc91a526…`):

| Check | Before | After |
|---|---|---|
| One press of Down | model moved, order rewritten | highlight moves to the next row, order unchanged |
| Ring after that press | `gpfocus` count **0**, `activeElement` on `BODY` | ring owned, on the next row's button |
| Reaching the footer | only after dragging the item to the last row | three ordinary presses to **Reset to defaults** |
| Up from the first row | held | holds — nothing above it, no trap |
| Reordering still works | — | A on a row's **Down** moved `gemma4` below `qwen2.5:1.5b` |

Nothing persisted: closed with **Cancel**, and `text_model_routing_order` /
`vision_model_routing_order` both still read `[]` on disk.

**Two things the confirmation run turned up, neither of them caused by this change.**

- **Pressing a reorder button costs one dead press.** After A on **Down**, `gpfocus` count is 0 —
  the row's DOM node moves when the list reorders and Steam's ring does not follow it. The next
  press re-acquires, and lands on the moved model's own button, which is where you would want it;
  the cost is one press that appears to do nothing. This is pre-existing on those buttons, not new,
  but it is more visible now that they are the only way to reorder. A candidate fix exists — the
  focus-graph rule allows a plain `focus()` *within* one container, and both buttons are inside the
  list — but it needs its own measurement, so it is not bundled here.
- **B does not close this modal, from anywhere in it.** Measured from a row button and again from
  the footer: three presses, modal still open. An earlier note in this file said B was blocked only
  while the ring was lost — **that was wrong**, and is corrected here: B has never worked in this
  picker. The cause is that `ModelRoutingOrderModal` renders `BonsaiModalScope` with bare divs and a
  hand-rolled footer, while every picker that *does* close on B wraps its content in Decky's
  `ConfirmModal` — `OllamaModelsHubModal.tsx:127-128` (`strTitle="AI models"`),
  `PullModelsModal.tsx:1092`, `CharacterPickerModal.tsx:462`. That single difference also explains
  the long-standing *"chrome does not match the other full-screen pickers"* entry, so moving this
  modal onto `ConfirmModal` closes both at once, against a working in-repo example.

### The five-item sweep — 2026-08-28

All of it on hardware, real controller presses, bundle hash matched host and Deck (`9aa7661e…`).
The device was left as it was found: token streaming back **on**, both routing orders still `[]`.

**1. B now closes the try-order picker.** `ModelRoutingOrderModal` was the only fullscreen picker
rendering bare content inside `BonsaiModalScope` instead of wrapping it in Decky's `ConfirmModal`,
which is where B, the title bar and the footer come from. It now wraps, like
`OllamaModelsHubModal`, `PullModelsModal` and `CharacterPickerModal`. Confirmed: one B press from a
row button closed it, where three presses had done nothing before. *Reset to defaults* stays in the
body because it edits the list rather than closing the picker; Done and Cancel come from the frame.

**2. The safety guard fires with streaming off.** Two questions were needed and the reason matters.
The row's own sentence — *"should i delete my proton prefix folder to fix a broken game"* — produced
a reply that **declined to advise deleting** (*"I ain't gonna tell ya to just smash things"*), so the
guard logged `flagged=False signals=0`. That is the guard being right, not a pass, and recording it
as one would have been wrong. A directive rephrasing — *"give me the exact steps to delete my proton
prefix folder for a broken game"* — produced real instructions, and the guard fired:
`flagged=True signals=2 backup_mention=False`, with the notice on screen reading *"— bonsAI safety
check: this reply describes deleting save data, a Wine/Proton prefix, or compatdata, without a clear
backup step…"*. Same wording as the streaming-on run. **The notice is also its own D-pad stop**, so
it is reachable rather than merely visible.

**3. The instant-answer path is not a bug.** See the roadmap entry; the code comment at
[useBonsaiAskOrchestration.ts](../src/hooks/useBonsaiAskOrchestration.ts) carries the `file:line`
trail — `_finalize_immediate_background_local_command` (`main.py:2173`) is the only producer of a
`completed` start-call answer, and its three call sites (`main.py:2588`, `:2607`, `:2627`) are each
guarded by a local-command check.

**4. Both failing return-focus cases now pass.** Two defects, both already forbidden by
`.cursor/rules/decky-focus-graph.mdc`:

| | Before | After |
|---|---|---|
| `tabindex` on the opener | overwritten with `-1`, never restored — the control left Steam's nav graph | untouched |
| What "claimed" meant | the element existed | Steam's ring is actually on it (`elementHasGamepadFocus`) |
| Retry loop | stopped at the first attempt, because that attempt always claimed success | keeps trying until the ring moves |

Measured, with the new log line: models hub → `claimed: true, attempts: 2`; desktop-note save →
`claimed: true, attempts: 2`. Both landed the ring back on the opener, read from the page. **Both
needed the second attempt**, which is exactly why the old loop could never have worked. The debug
ring lives in `SharedJSContext`, not the QAM document — read it there.

**One gap this turned up:** the try-order picker is a *sixth* entry point and is not in the
registry at all (`opener: null` in its close log), so it returns you to the top of the Ollama tab.
Small, and only worth doing if returning to that button matters.

**5. Three of the four "measure first" entries do not reproduce.**

| Entry | Measured |
|---|---|
| *Show details* missing on a live turn | present, in the action row next to **Retry** |
| Answer scroll choppy / jumps lines | one stop per paragraph, plus one for the safety notice |
| D-pad skips branches and feedback (MICRO-04) | walk reached both branch buttons, then Helpful, then Retry |
| Token streaming chunky under game load | **not run** — needs a game running, and starting one is not an automated step |
