# 36 — The feature-building session

Written 2026-09-05, before any code was written. The maintainer asked for a plan first: which features,
in what order, what runs side by side, how each one is proved on the Deck, and what needs their word.

This session runs **alongside** the second bug-fixing session, [35-bugfix-session.md](35-bugfix-session.md),
which another chat started the same day and which is holding the Deck. Section 1 is about staying out of
its way; that is the single biggest risk here.

Read first: [CLAUDE.md](../../CLAUDE.md); the model and effort table in [AGENTS.md](../../AGENTS.md) § 3;
the ground rules at the top of [26-thursday-bugfix-sesh.md](26-thursday-bugfix-sesh.md);
[35-bugfix-session.md](35-bugfix-session.md) § 2 and § 4 for what the other session owns.

---

## 1. What is true right now (checked 2026-09-05, nothing changed)

- **Another chat is running the bug-fixing session and is driving the Deck.** Its plan file is on disk
  but not yet committed. Its five helpers own: the chat transcript, the question bubble, the reply
  button row, the ask hook, the Main tab body, the prompt text, the knowledge base and embedding
  services, the scroll helper, and the spoiler block.
- **The maintainer's calls for this session, given 2026-09-05:** the other chat finishes on the Deck
  before this one touches it; scope is the small clean set, not the whole list; this session works on
  its own branch and merges once at the end; and while they are away it may deploy, restart the loader,
  change settings on the device and put them back, launch and exit games, and log and fix what it finds
  — but **must not wipe plugin data.**
- **The tree is clean** apart from the other chat's plan file.
- **The four gates pass on a clean tree** (types, frontend tests, Python tests, build), per the repo's
  own note. This session re-checks that before it starts.

## 2. The list, and what was cut

There are about **forty** roadmap features at four stars and below. Sorting them honestly:

- **About eighteen are not building work at all** — decisions, research spikes, or entries that say
  "decide something else first". Examples: the connection doctor (a rival entry has to be ruled out
  first), the web permission, the parser for controller layouts, the two SteamOS ideas.
- **Three are already built** and only owe a Deck check.
- **About seven of the rest live in files the other chat's helpers own** — the fade cue on a cut-off
  question, the chip-row glow, Show details becoming a divider, fewer stops on a finished reply, the
  session-context fold, the transcript height, and terse mode.

That leaves the set below.

### 2a. Two entries that looked good and are not buildable as written

Both are findings from this planning pass and go into the roadmap when this branch merges.

| Entry | What checking found | What happens to it |
|---|---|---|
| ★★★ **Search density** | **There is no search box anywhere in the plugin.** No component takes a query or renders a result list. The long note repeats the goal — tighter rows, highlighted matches — and names no target. Nothing exists to make denser. | **Dropped by the maintainer, 2026-09-05.** The entry comes out of the roadmap with a line saying why, in the merge commit at the end. |
| ★★ **Replace the bonsAI tab icon with the redesign's** | **The redesign has no icon in it.** The big redesign document sizes the tab cells and their icons but never draws a new tree. There is no other drawing in the design folder. Building it means a model inventing a shape, and the routing policy says shape work needs a drawing or a person's eyes, not a stronger model. | **Stays open, waiting on a drawing from the maintainer.** The entry gains a line saying that is what it is waiting for. |

### 2b. The six that are confirmed buildable

Checked in the code, not just read off the roadmap.

| # | What a person gets | Where it lives | New setting? | Clashes with the other chat? |
|---|---|---|---|---|
| 1 | **Type any Ollama model name into the pull picker** instead of only choosing from the built-in list, with a pin for "use this for Ask" and a *New* badge for thirty days. | the pull picker and its catalogue, the pull service | no | **no** |
| 2 | **Fresh preset prompts on the chip row**, refreshed for the features that shipped since wave one. | the preset strings file and its test | no | **no** |
| 3 | **A first quick question that does not wait for the model to load** — the default Ask model is warmed at boot. Behind a developer switch first. Small models only, skipped quietly when memory is tight. | the Ollama service, the Developer screen | yes, one developer switch | **no** |
| 4 | **One preset chip instead of two, if you want the label to have the whole column.** Two stays the default. | the preset row layout, the Settings screen | yes, one choice | **no** |
| 5 | **Separate slow-warning and give-up times for each Ask mode**, instead of one pair for all three. | the Settings screen, the Ollama screen, the reply's slow notice | yes, per mode | **yes** — the reply's slow notice is in the chat transcript, which the other chat's first helper owns, and the Main tab body, which its second helper owns |
| 6 | **Replies always arrive word by word, and the switch for it disappears.** One fewer thing to decide, and it halves every test row that had to be run twice. | the settings shape in both languages, both agreement files, the Settings screen, the ask hook | **removes** one | **yes** — the ask hook is the other chat's second helper's |

Because of that last column, **five and six go last**, after the other chat's work has landed.

### 2c. What the maintainer chose for the sixth slot

**Streaming becomes the default and the switch is deleted** — decided 2026-09-05, and confirmed
separately as a yes on its own merits. Three things that go with it, all from the roadmap entry:

- It is a change in **both languages**, and where they disagree, **Python wins**.
- Both agreement files that guard the settings shape lose the key, so the two-language edit has to be
  complete or a test fails.
- **An old settings file on a real Deck must not read as a reset.** Someone upgrading with the switch
  turned off must not have every other setting snap back to its default. That is the one that needs a
  test written before the code.

Because this is settings-shape work in the same files as the three new settings, **I do it myself**,
in its own commit right after them, rather than handing it to a helper. Its own commit so that if it
goes wrong on the device it can be undone without taking the three new settings with it.

The tab icon and the model-residency question were both left for another time.

### 2d. Deliberately not this session

Everything needing a corpus rebuild or a schema bump (the extended-retrieval track three, the
"starting out" card, the versus content). Everything marked as a spike or a discovery. The tiered
spoiler setting, which needs prompt wording written per tier before any code. Anything about the
highlight ring, which the routing policy will not give to a helper without a device measurement first,
and the device is busy.

## 3. What the maintainer decided, 2026-09-05

All answered before any code was written. Nothing in this plan is now waiting on them.

| Question | Answer |
|---|---|
| How do the two sessions share the Deck? | The other chat finishes first, then this one gets it. |
| How much scope? | The small clean set, not the whole list. |
| Where does the work land? | Its own branch, merged once at the end. |
| What may run unattended on the device? | Deploy, restart the loader, change settings and put them back, launch and exit games, log and fix what turns up. **Not** wiping plugin data. |
| The sixth feature? | Streaming becomes the default. |
| Streaming as the default, on its own merits? | Yes. |
| The search-density entry? | Dropped. |
| The tab icon? | Left open, waiting on a drawing. |

Two small things are still theirs to look at, and neither blocks anything: the tab icon drawing, and
whether the model-residency question is worth answering later.

## 4. Order of work

### Wave 0 — me alone, before anything else

1. Cut a branch off the current tip so nothing interleaves with the other chat's commits.
2. Confirm the four gates are green on it.
3. Write the helper brief for this session. **The brief on disk is out of date** — it tells helpers to
   move roadmap, test and changelog lines themselves, and the newer policy says the person running the
   session does all of that. The other chat is also fixing that file, so this session does **not** edit
   it; the corrected rule goes into each helper's own task instead.
4. Work out the settings change as one diff, ready to apply but not applied yet — three settings added
   and the streaming switch removed. It touches the plugin's root file, which the other chat's second
   helper is also in, so it waits.
5. Write the upgrade test first: an existing settings file from a real Deck, with streaming switched
   off, must load with every other setting intact. That test is written before the removal, not after.

### Wave 1 — two helpers, starts immediately, nothing shared

| Helper | Feature | What it owns |
|---|---|---|
| P | 1, the custom model in the pull picker | the pull picker, its catalogue, the pull service and their tests |
| T | 2, fresh preset prompts | the preset strings file and its test |

Two only, on purpose. Every other candidate either needs a new setting — and all settings work funnels
through the same handful of files — or waits on the other chat.

While they work, I do the read-only preparation for wave two and watch for the other chat's landings.

### Wave 2 — starts when the other chat lands, three helpers

The trigger is automatic and needs nobody awake: when new commits appear on the shared branch and the
bug entries have moved into the waiting-for-a-Deck-check list, I rebase this branch onto them and start.

First I apply the settings work myself in **two** commits, in this order:

1. **The three new settings**, in both languages, with their Settings and Developer controls wired up
   but doing nothing yet, and their D-pad navigation entries.
2. **The streaming switch removed**, in both languages, with the upgrade test from wave 0 passing
   first. Separate commit so that if it goes wrong on the device it can be undone on its own.

That turns the one place everything would have collided into two commits, and lets the helpers work in
parallel afterwards.

| Helper | Feature | What it owns |
|---|---|---|
| R | 3, warm the model at boot | the Ollama service and its tests |
| S | 4, one chip or two | the preset row layout and the chip components |
| Q | 5, per-mode times | the reply's slow notice and the Ollama screen's warning |

Then, once the removal has landed and the gates are green, one more short pass by me: delete the code
paths that only existed to serve the off position, and collapse the test rows that ran twice.

### Wave 3 — landing, me alone

Each helper's commits are read as a diff, then taken onto the branch one at a time, oldest first. All
four gates plus the highlight checker run after every one. I move every roadmap, test and changelog line
myself, one commit per landing.

### Wave 4 — the Deck, me alone, one thing at a time

Only after the other chat says it is finished with the device.

1. Deploy once, reopen the panel — the first open after a deploy always fails, by design — and prove by
   hash that the Deck is running this exact build.
2. **The upgrade check goes first**, because it is the only one that could lose a person's settings:
   copy the Deck's real settings file aside, put a copy back with the streaming switch still in it, open
   the panel, and read every other setting back off disk. They must all still be what they were. If
   they are not, that commit comes out and the rest of the pass stops.
3. Then each feature in the order it landed, using the controller rig, asserting that each control is
   **visible** and not just highlighted. A control hidden behind the dock passes a highlight check and
   fails a person.
4. A pass moves three things in one commit: the roadmap line into the done list, the full entry into the
   archive, the test row ticked. A failure is written down with its evidence file named and the entry
   stays where it is.
5. Then a free walk of every screen with a game running.
6. Settings go back exactly as they were found and are read off disk to prove it.
7. **Plugin data is not wiped.** The maintainer withheld that.

### Wave 5 — the report and the merge

A short written summary. Everything found and not fixed goes into the bug list with its evidence.
Then the merge back to the shared branch, with the roadmap conflicts resolved **by hand, entry by
entry** — never by taking one side of the file wholesale, which has lost work here before.

## 5. Who does what

**Me: Opus at extra-high effort. Helpers: Sonnet 5 at high effort, at most five at once, and never
more than three in wave two.** That is what the routing table asks for a feature session at these star
levels. The one refinement that matters: no helper gets a highlight or layout job without a device
measurement in hand, which is why none of the highlight features are in scope.

## 6. Rules for this session

1. One feature per commit, all four gates plus the highlight checker green between commits.
2. Helpers hand back code, tests and one paragraph. They never touch the roadmap, the test docs or the
   changelog, never touch the Deck, never push, and never edit the generated architecture files.
3. Every helper checks it is building on the right base before it does anything. Helpers here have
   started up to four hundred commits behind before.
4. A failure on the device is written down with its evidence named, not argued with.
5. If a device result contradicts the code, check the installed build's hashes before believing it.
6. New Settings and Developer controls need an entry in the D-pad navigation rules **before** the
   control is written.
7. Do not sink time into something that turns out to be hard. Make a good effort, write down what was
   learned, move on.
8. Do not push. Do not wipe plugin data.

## 7. Progress log

Written as work lands.
