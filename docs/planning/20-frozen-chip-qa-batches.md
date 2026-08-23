# 20 — Frozen-chip QA batches for the 2026-08-23 parallel bug session

Test plan for the ten bugs fixed on 2026-08-23 by five parallel worktrees. **Two batches of six
frozen test chips**, grouped by which game is running. Written 2026-08-23; the question wording in
§ 3 and § 4 is **agreed with the maintainer and must not be reworded** — several of these questions
are the exact strings a measurement was taken against, and changing a word changes what is under
test without saying so.

**One sentence:** pin six exact questions, run them on Deep Rock Galactic: Survivor, clear, pin six
more, run them on a story game, and record which of the seven code-only fixes actually hold on
hardware.

Sources: [roadmap.md](../roadmap.md) § Bugs, [testing.md](../testing.md) rows
**DESTRUCT-ADVICE-01**, **SPOILER-DPAD-01**, **REPLY-ARCHIVED-01**, **KB-COVERAGE-NOAPP-01**,
**CONTEXT-LADDER-01…03**; decisions **D25** and **D28** in
[maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md); frozen chip feature
shipped in `b278f7b`.

---

## 1. Why this needs a plan rather than a list

Ten bugs got a code fix on 2026-08-23. **Three are fully closed. Seven are proven only at a desk**
— by unit tests, by rendering a component and inspecting it, or by reading the code path. None of
the seven has been near a Steam Deck, and the failures they address are all failures of navigation,
layout, or what the search returns, which is the category that only shows up on hardware.

The standing rule (CLAUDE.md § Testing on the Deck) is that exact QA questions get pinned as frozen
chips rather than thumb-typed, because a single mistyped word changes what is under test. That
capability exists now. The constraint it comes with:

| Limit | Value | Where |
|---|---|---|
| Chips per batch | **12** max, **3** min | `MAX_FROZEN_TEST_CHIPS`, [settings_service.py:180](../../py_modules/backend/services/settings_service.py) |
| Characters per chip | **160**, silently truncated | `FROZEN_TEST_CHIP_MAX_LEN`, [settings_service.py:181](../../py_modules/backend/services/settings_service.py) |
| Mirror | `MAX_FROZEN_TEST_CHIPS` / `FROZEN_TEST_CHIP_MAX_LEN` | [bonsaiSettingsSchema.ts:246-248](../../src/data/bonsaiSettingsSchema.ts) |

Twelve would fit in one batch, but the maintainer's call 2026-08-23 was **two batches of six,
grouped by game**, so a run is one title at a time rather than a title swap mid-batch.

### 1.1 Two things a batch does to the app while it is active

Both are by design, both will invalidate a QA run if forgotten:

- **Session RAG chips are suppressed** while a batch is pinned
  ([DeveloperTab.tsx:474-478](../../src/components/DeveloperTab.tsx)). Any corpus-chip row
  **cannot pass** until the batch is cleared. Do not attempt those rows during either batch.
- **The carousel stops reseeding.** That is the point — the chips stay put in order — but it means
  the carousel is not in its normal state, so do not judge normal carousel behaviour from a run.

### 1.2 How a batch gets pinned — and the gap

The Developer tab **shows** the pinned list and offers **Clear frozen test chips**, but has no
control to add one; its own help text says *"Set the list from the host while preparing a run."*
So pinning is a host-side write of `dev_frozen_test_chips` into
`~/homebrew/settings/bonsAI/settings.json`, or a `save_settings` call.

**There is no script for this.** `scripts/` has nothing that writes a chip batch — grep for
`frozen` finds only the corpus guard and the publisher. Writing one is a natural companion to this
plan and is not blocked by anything, but it is not a precondition: a host-side edit works today.
Clearing is easier than pinning — the Developer tab button does it on device.

Filed 2026-08-23 as **Pin a frozen chip batch from the host**, Platform / upstream lane in
[roadmap.md](../roadmap.md), with the two candidate routes and the limits it has to enforce.

---

## 2. What each batch is for

| Batch | Game | Covers |
|---|---|---|
| **A** | Deep Rock Galactic: Survivor | The search cutoff re-measure obliged by **D28**, and the spoiler fence's *when* half. Plus, free of charge, four navigation checks that need nothing but a finished reply. |
| **B** | A story game (Ocarina of Time or Fallout), plus two questions asked with nothing running | The spoiler block's D-pad reachability, the destructive-advice guard, the no-game-running label, and the session turn count. |

---

## 3. Batch A — Deep Rock Galactic: Survivor

```json
"dev_frozen_test_chips": [
  "one sentence",
  "please repeat that",
  "thank you very much",
  "what time is it",
  "how do i deal with the exploders",
  "how do i beat the twins"
]
```

**All six are verbatim.** The first four are the exact phrases the 2026-08-22 on-Deck pass measured
and the ones **D28** obliges re-measuring; the last two are the exact phrases the spoiler trace
resolved against.

| # | Question | Expected | If it differs |
|---|---|---|---|
| 1 | `one sentence` | **No cards.** Scored 0.5034, below the new 0.515 floor. | Cards still attaching means the floor is not doing what the desk measurement said. Record the card names. |
| 2 | `please repeat that` | **One card** (Glyphid Dreadnought, 0.5308). Was three. | Three cards means no change took effect — check the build actually deployed. |
| 3 | `thank you very much` | **Still attaches** (Nitra). | **This is a pass, not a failure.** It comes from the keyword half, which **D25** and **D28** both put off limits. |
| 4 | `what time is it` | **Still attaches** (three cards). | Same — expected, keyword half. |
| 5 | `how do i deal with the exploders` | Answers **in plain text**, no spoiler block. | A fence here means the fix missed. Record the reply verbatim and whether *Show details* names the Exploder card. |
| 6 | `how do i beat the twins` | Answers in plain text. Never fenced before. | A fence here is a **regression** caused by the fix, which is more serious than #5 failing. |

**Swap available:** `what is red sugar for` in place of #6 if an item card is a more useful control
than a boss card. Both were clean before the fix. Do not run both — that costs a chip slot the
cutoff re-measure needs more.

### 3.1 Four checks that ride along, no extra chips

Ask any of the six, then:

- **Thumbs and Retry row** (**REPLY-ARCHIVED-01**) — the *Was this helpful?* row, **Retry** and the
  refinement chips must appear under a **normal completed** Ask. Before the fix they appeared only
  via a reopen path that was itself a bug.
- **Focus on plain text** — walk the D-pad down through a finished reply. It must not park on
  prose (*"Here's the lowdown:"*) or on the raw block under *Full transparency snapshot*.
- **Chip strip backwards** (**CONTEXT-LADDER-01**) — reach the last chip, then walk back. Also
  press **Up** from *Show diagnostics* and from the session context strip; both had no rule before
  and skipped the carousel entirely.
- **The blank question** — ask any of the six, then **close and reopen the panel while it is still
  thinking**. The question must come back above the reply, not `…`.

  **No chip can trigger this one.** It is a timing action, not a question. It is also the check
  most likely to be skipped by accident, so do it first while you remember.

  Watch for the **duplicate-question** follow-on at the same time. That symptom is *not* resolved —
  the archiving path was ruled out as its cause, but whether it shares a root cause with the blank
  caption is unknown and needs exactly this run to answer.

---

## 4. Batch B — a story game, plus two with nothing running

Clear batch A first (Developer tab → **Clear frozen test chips**), then pin:

```json
"dev_frozen_test_chips": [
  "what happens at the end of the main story",
  "my saves wont load after a mod update what should i delete",
  "my proton prefix is broken how do i start fresh",
  "how do i install a mod safely",
  "what should i do next",
  "is there anything nearby worth checking"
]
```

| # | Question | Expected | Notes |
|---|---|---|---|
| 1 | `what happens at the end of the main story` | **Should fence.** That is the point. | It exists to *produce* a spoiler block, so there is something to try reaching. |
| 2 | `my saves wont load after a mod update what should i delete` | Safety notice appended under the reply. | |
| 3 | `my proton prefix is broken how do i start fresh` | Safety notice appended. | Second attempt at the same thing, different wording. |
| 4 | `how do i install a mod safely` | **No notice.** | The answer will likely mention backing up, which is the case the guard must not fire on. |
| 5 | `what should i do next` | Ask **twice** — once on the story game, once with **nothing running**. | With nothing running, *Show details* must say **no game is running**, not that a game could not be matched. |
| 6 | `is there anything nearby worth checking` | Ordinary reply. | Exists to make a third turn. |

### 4.1 The spoiler block, by D-pad (**SPOILER-DPAD-01**)

Ask #1, wait for the fence, then try to reach it with the D-pad alone. **Do not touch the
screen** — touching it is what made this look fixed before.

This regressed once already after being marked verified on 2026-08-04, which is why the roadmap
entry says the *recurrence* is the bug. The 2026-08-23 fix removed a real structural defect — the
markdown renderer was nesting the clickable control inside a `<pre>`, a scroll and formatting
context it was never designed to sit in — and a test now asserts that nesting cannot return. But
**that was proven by rendering, not by a controller**, and the fix is explicitly *not* claimed to
be the sole cause.

### 4.2 The destructive-advice guard (**DESTRUCT-ADVICE-01**)

Two positives (#2, #3) and one negative (#4), because a guard that fires on innocent replies gets
switched off, which is the same as not having one.

**Read the reply before recording a failure.** If no notice appears on #2 or #3, check whether the
model actually told you to delete anything. If it did not, **the question missed, not the guard**.
That is why there are two attempts at it.

**Record which model you ran.** The check is tuned against plausible phrasing, not against phrasing
pulled from a live model, so a miss is a wording gap in the check rather than a wiring failure —
and the fix for those two things is different.

**Known and accepted limitation:** with token streaming on, the risky line is already on screen
before the notice is appended beneath it. Accepted by the maintainer 2026-08-23 — the app and repo
already tell the user to double-check AI answers, so a late flag beats no flag.

**Run both with streaming on and off, but expect this to shrink.** The maintainer's direction is
that streaming becomes the default and the setting is removed once the streaming bugs are fixed
(see *Make token streaming the default and drop the setting*, Ask / reply backlog). When that
lands, the streaming-off half of this row stops existing.

### 4.3 The session turn count

Ask #1, #5 and #6 back to back in **one** chat, waiting for each answer. The session panel must
say **three turns**, with a row per question — not one.

Then close and reopen, or switch chats and back, and check the count still holds. That second half
is the part that matters: the backend now saves a small snapshot with each answer, and the whole
point is that the older turns survive, which the frontend-only shortcut could never achieve.

### 4.4 The no-game-running label (**KB-COVERAGE-NOAPP-01**)

Ask #5 with every game closed. *Show details* must read **no game running**. Then launch a game
with no corpus coverage and ask the same question — it must read **none for this game**. The two
must look different; before the fix they were the same string, which is what made the panel claim
a match had failed when nothing was running.

---

## 5. What neither batch covers

| Not covered | Why | Where it goes instead |
|---|---|---|
| The mid-reply spoiler fence **placement** | The *when* half was fixed; **where** it lands is untouched and is about how a reply is segmented. | Still OPEN in the roadmap under the spoiler fence entry. |
| Corpus / session RAG chips | Suppressed while any batch is pinned (§ 1.1). | Needs its own run with chips cleared. |
| Chunky streaming under game load | A performance measurement, not a question. Needs the capture and timing tooling. | **STREAM-09** / **STREAM-11**. |
| The five device-only bugs already on the list | Never had a code fix — they need measurement first, not confirmation. | [roadmap.md](../roadmap.md) § Bugs. |
| Anything about the search's **keyword** half | Off limits by **D25** and **D28**. Two of the four phrases attaching cards do so through it, by design. | *Card relevance needs a second signal*, Knowledge base backlog. |

---

## 6. Recording the result

Per CLAUDE.md, findings go to files, not chat. For each batch:

1. Update the QA rows in [testing.md](../testing.md) with pass, fail, or *question missed*.
2. For the four search phrases, record **which cards attached**, not just whether any did — the
   expected result for two of them is that cards still attach, so a bare pass/fail loses the
   information.
3. For the guard, record the **model name** alongside the result.
4. Move anything that fully passes out of [roadmap.md](../roadmap.md) § Bugs and into
   [archive/roadmap-bugs-fixed.md](../archive/roadmap-bugs-fixed.md), which the list's own rule
   requires.
5. Clear the batch when done. A pinned batch left behind will quietly fail the next person's
   corpus-chip run and give no reason why.
