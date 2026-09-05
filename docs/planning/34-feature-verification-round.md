# Plan 34 — The feature verification round

**Status:** written 2026-09-05. The device came free the same evening and the round starts from § 5 block 0.
**Purpose:** close as many of the roadmap's [Verify](../roadmap.md#verify) entries as one long overnight
run can, in an order that spends the least device time per entry closed.
**Builds on:** [plan 31](31-deck-verification-round.md), which is the same round and is part-run — its
progress log holds everything already measured. This plan does not repeat that; it starts from what is
left. Where this file and a row in [testing.md](../testing.md) or
[testing-manual.md](../testing-manual.md) disagree, the row wins.
**Does not:** change any product code. One entry needs code before it can be checked and is out of scope
(§ 2).

---

## 1. What the maintainer decided, 2026-09-05

Recorded as **D61** in [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md).

| # | Question | Answer |
|---|---|---|
| 1 | The Deck is busy — how does this session start? | Desk work now; the maintainer says when the device is free. Answered the same evening: it is free. |
| 2 | When does the in-person block run? | Last, as plan 31 § 7 has it. |
| 3 | Which gated items are in scope? | **A model pull**, yes. **Clear all plugin data** is in scope but **waits for the morning** — the maintainer will be asleep when the round reaches it and chose not to pre-authorise a destructive step. **Not** the Family View PIN, **not** the Steam Web API key. |
| 4 | What happens when a check fails? | File it as a bug with the evidence and carry on. No fixing during the round. |
| 5 | How long? | One long overnight run. |
| 6 | The chat-slot game name, which needs code first | Leave it in Verify. Do not spend device time on it. |
| 7 | The wider list of unticked checks | The Verify list, **plus a free walk of every screen** — every stop reachable and every stop actually visible. |
| 8 | Deploy first? | Yes. Get the latest build on the device before anything is measured. |

---

## 2. The Verify list is behind what the device already proved

The roadmap has **23 entries** waiting for a Deck check. Read against the test rows and plan 31's log,
several are further along than the roadmap says, and at least one is finished.

**The clear case: the thinking effort control.** Its entry says two checks are owed. Both are ticked and
both passed on the device — the four-way control was walked with the D-pad on 3 September, and a real
thinking model answered at every level on 4 September. **Nothing is owed. It belongs in Done and can move
there at the desk, with no device time at all.**

Others are part-done in ways the roadmap does not show: the panel-width entry has been measured and only
wants a look; the streaming entry has passed two and a half of its three checks; the thinking-line entry
has passed four of seven. **So the first job is a reconciliation pass** — walk all 23 entries against the
rows and the log, move anything finished, and rewrite the rest to say what is genuinely left. That is
desk work, it needs no device, and it stops the round spending device time on settled questions.

### Where each entry stands, and what it needs

**Closable by the rig, on the device (14).**

| Entry | What is actually left |
|---|---|
| Thinking effort control | **Nothing.** Move to Done at the desk. |
| Clear cache cleared the screen but not the session | The mid-generation half: clear while a reply is still being written. |
| Expert mode gets the same cards as Strategy | Its own row passed twice. The companion row wants one uncovered game on screen. |
| KB coverage chip | Two negative readings, both with an uncovered game running. |
| The vector half of retrieval | The on-screen half: the method label and the embed timing, with a covered game running. |
| Asked-entity extraction | Six sentences across four games, on screen. Three already pass by probe. |
| Deferred manual QA | Two developer commands, and the pending question after the panel is closed and reopened. |
| Thinking line fixes | Three of seven: an upright emoji, several prep phases in one turn, and one opener per Ask. |
| Soft reply-length cap | Two of five: a continue mid-fence, and a thinking model with thinking off. |
| Legacy-loader shim removal | One voice start and stop. |
| Three voice fixes | The reinstall label, one live recording, and the install state after the data clear. |
| Shell state and tab payload | The Ollama screen after the data clear. |
| Pulled models join the try order | The model pull. |
| Named chat slots | Six checks. One is already known to fail and is filed as a bug. |

**Needs the maintainer's eyes or fingers (4).** The rig has already measured all four; what is left is a
yes or no.

| Entry | What is left | What the rig measured |
|---|---|---|
| Rows span the panel width | Do the three rows look flush? | The panel is 300 px and all three rows span it exactly. |
| The tab bar collapses and names the tab | Are the names readable at arm's length, and does a finger work? | All six names render in full, the active one gold. |
| Preset row, two chips across | Is the crawl the right speed, and does reduced motion stop it? | Owed: frame sampling with a long label, which the rig does in the games block. |
| Token streaming | Drag a streaming reply with a finger. | The D-pad half passes; the view tracks the growing text. |

**Cannot close tonight (5), and why.**

| Entry | Why not |
|---|---|
| A checklist the model got wrong | It only closes if the model happens to misbehave. Watched for, never scheduled. |
| VAC check | Four of its checks need the Steam Web API key typed by the maintainer — out of scope tonight. |
| Kids master lock | Needs a Family View PIN set by hand — out of scope tonight. |
| The game a chat belongs to | The decision was that the name shows only while the row has focus. That code was never written. |
| Global quick-launch macro | A Steam Input checklist, never run on hardware. Needs a person. |

---

## 3. What to do first

Sorted so the earliest work closes whole entries and the device changes its settings as few times as
possible.

1. **The reconciliation pass** (desk, no device). It moves at least one entry to Done for free and stops
   the round chasing settled checks. Everything after is planned against the corrected list.
2. **Deploy the latest build.** Verifying yesterday's build risks passing something that has changed and
   failing something already fixed.
3. **The games block, not the quiet block.** This is the one order change from plan 31. Six of the
   fourteen rig-closable entries need a specific game running, and launching and exiting games is the
   slowest thing in the round. Doing them early means a game problem surfaces while there is still a
   night left to work around it, rather than at four in the morning.
4. **Then the quiet checks** — the ones that need nothing running. They are short, they are many, and
   they are the safest thing to be doing when the night gets long.
5. **The free walk of every screen**, once, near the end, on the final build.
6. **The model pull**, last of the overnight work. **Clear all plugin data waits for the morning.**

---

## 4. What can run at the same time, and what cannot

**The device is one queue and no amount of help changes that.** One screen, one focus ring, one set of
buttons, and Steam's own state — the running game, the ask mode, the thinking level, the pinned test
questions — is shared by everything. Two drivers move the ring under each other. Subagents cannot press
buttons in parallel; that is a hardware fact, not a tooling gap.

So: **one driver, three helpers.**

| Lane | What it does | When it must stop |
|---|---|---|
| **A — the device** | Every press, every screen read, every measurement. Strictly serial. The session itself drives it. | Never runs while another chat has the device. |
| **B — probes** | Retrieval probes, settings reads, log greps, build hash checks. All over SSH, never touching the screen. | During any timing check — the probes share the same model server. |
| **C — bookkeeping** | Moves entries as they pass: the roadmap line, the test row, the archive entry, all in one commit. | Never edits code. Never touches the device. |
| **D — preparation** | Reads the evidence lane A just wrote, and writes the exact wording and expected answers for the next block. | Never decides a pass or a fail. |

Three helpers alongside one driver is the honest ceiling. The written policy allows five lanes; the
device allows one driver, and the other four would be sitting waiting on it.

---

## 5. The run order

### Block 0 — desk

- The reconciliation pass (§ 2). Move what is finished, rewrite what is part-done.
- Deploy, and verify both file hashes match on the device.
- Back up the settings, the chats and the chat threads before anything else. The data clear at the end
  depends on those backups existing.
- Re-pin the test questions. Plan 31 found that **a pinned batch of eleven only ever shows its first
  three**, so batches are pinned three at a time, with the panel closed and reopened between them.

### Block 1 — games running

Launched and exited by the rig. One game at a time; settings changed once per game, not once per
question.

| Game | What it closes |
|---|---|
| Deep Rock Survivor | The vector recall entry's on-screen half, and the companion card-count row. |
| Black Mesa — not in the corpus | Both negative coverage readings, and the uncovered-title half of the card-count row. |
| Half-Life 2 | The frame sampling for the preset row's crawl, which is the half the rig can do. |
| Baldur's Gate 3, The Sims 4, Ship of Harkinian | The six entity sentences. The last one only if it is on the recent games shelf. |

### Block 2 — nothing running

- The mid-generation cache clear: park the ring on the clear button, start a long deep answer, walk back
  and clear while it is still writing.
- The three thinking-line checks, the two soft-cap checks, the two developer commands, and the pending
  question after the panel is closed and reopened.
- The six chat-slot checks. One is already a filed bug; run it anyway to confirm the fault is unchanged.
- Voice: the reinstall label, and one live recording, which also closes the shim entry's last half.

### Block 3 — the free walk of every screen

One sweep per screen on the final build. Every stop must be reachable **and** its rectangle must sit
above the dock, with a hit test at its centre landing on the control. That pairing is what catches the
fault this project keeps finding — a control the ring can reach that the person cannot see.

### Block 4 — the model pull

A custom setup profile that pulls a model, then confirm the new name appears at the bottom of the text
try order, and at the top instead when high-memory fallbacks are on. A vision-capable pull must also
appear in the vision list; a text-only one must not.

### Block 5 — Clear all plugin data, in the morning

**Not run overnight.** The maintainer chose not to authorise a destructive step in advance while asleep,
so the round stops before it and waits. The backups are taken in block 0 regardless, so it is one press
away whenever the word comes. It closes the voice install state, the Ollama screen after a clear, and the
reopen behaviour. Restore the backups immediately afterwards and read them back off disk to prove it.

Three entries stay open overnight because of this: the voice fixes, the shell and tab payload extraction,
and the reopen half of the cache-clear entry.

---

## 6. The maintainer's block, at the end

Plan 31 § 7 holds the list and the reason each one needs a person. Two changes for this round:

- **The Family View PIN and the Steam Web API key are out of scope**, so those items are not on this
  list. Their entries stay in Verify.
- **Screenshots work**, which was not true when § 7 was written. Every eyes item now comes with a picture
  the rig took, so the ask is *confirm what I measured*, not *go and look for yourself*.

What is left is short: read the tab names, tap the tab bar, drag a streaming reply, watch the chip labels
crawl and say whether the speed is right, look at the panel edges, look at the tree icon, read the five
spoiler replies, watch a new chat get its title, and press the knowledge base update button with a thumb.
About twenty minutes.

---

## 7. Rules for this round

1. **A failure is filed, not fixed.** Write it into the roadmap's bug list with the evidence file named,
   and move to the next check. No lane opens a fix tonight.
2. **A pass moves three things in one commit** — the roadmap line into Done, the full entry into the
   archive, and the test row ticked. Never a strike-through, never an entry left behind.
3. **Every walk is checked twice**: the ring landed, *and* the control is visible. A focused stop hidden
   behind the dock is a failure, not a pass.
4. **Evidence goes under `runs/`**, named for the row, with the first step's starting point recorded.
5. **If a device result contradicts the code**, check the installed build's hashes before believing it.
6. **Settings go back the way they were found**, read off disk to prove it, at the end of every block —
   not only at the end of the night.
7. **Model and effort:** the driving session runs Opus at extra-high effort, which is what the policy asks
   for device testing and for running lanes. The helper lanes run Sonnet 5 at high effort. Lanes never
   edit the roadmap, the test docs or the changelog; the driver does that.

---

## 8. Progress log

Written as rows close.
