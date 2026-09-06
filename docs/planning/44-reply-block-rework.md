# The block under a finished answer: three changes

Written 2026-09-06. Calls recorded as D76, D77 and D78.

## Why

Under every finished answer there is a row of three buttons — Retry, Show details, Copy. Measured on
the Deck on 2026-08-28 they were 79, 97 and 54 pixels wide, ending at 299 in a column that is 300.
There is no room left in that row, and it costs height in a panel where height is the scarce thing.

Three roadmap entries all want a piece of the same block, so they are planned together and built one
at a time.

1. **Show details becomes a line across the width**, label in the middle, instead of a button.
2. **Copy and Retry become small faded icons on the bubbles.** The button row disappears.
3. **A finished answer gets fewer D-pad stops** — neighbouring paragraphs share one.

## Order

Number 3 first: it touches nothing the other two touch. Then the line. Then the icons, which is what
finally deletes the row and its focus wiring.

## Step 1 — fewer stops (done 2026-09-06)

**What a person notices.** A long answer takes a few presses to walk past instead of ten or more.
Nothing about how it looks changes.

**What changed.** The finished answer is cut into pieces by one function, and that function now merges
neighbouring short pieces back together, up to about 900 characters — roughly half a screen of the
Deck's reading area.

Rules the merge keeps:

- A piece holding a code block is left alone in both directions. Blocks stay whole and stay by
  themselves, as before.
- A piece already 900 characters or longer is left alone.
- The words and their order never change. Paragraphs are rejoined with a blank line, the lines of a
  bullet list with a single newline, so nothing renders differently.
- The path that exists to break up ONE long paragraph does not merge, because merging would undo the
  thing it just did.

**Why no text is skipped.** Down only moves the ring to a section that is already on screen; an
off-screen section makes the panel scroll instead. That was already true. Merging removes the wasted
presses that happened when several short paragraphs shared one screen.

**Tests.** Five new cases on the splitter: ten short paragraphs become a handful of stops, a twelve-line
bullet list becomes one, a code block keeps its own stop with its neighbours in theirs, a half-screen
paragraph is not merged, and every word survives in order. One older case was reworded — it asserted
that three short paragraphs give more than one section, which is the behaviour being changed on purpose.

**Still owed on the device.** Walk a long finished answer, count the presses to the first button, and
confirm nothing is skipped. Rows D-PAD-SCROLL-02 (reworded) and STREAM-09.

## The automated checks

Three layers. Being clear about which of them actually ran:

**The test runner. Ran, green: 1,106 tests.** Beyond each builder's own suite there is now one that
renders a whole finished reply and checks the pieces add up: no button row anywhere, Retry inside the
question bubble and not the answer's, Copy inside the answer bubble and not the question's, both
named for someone who cannot see them, a long answer down to a handful of stops with none of its
words lost, the reading order question then answer then *Was this helpful?* then the line, and the
line last with nothing between it and the chips it opens. It has no layout engine, so it proves
what is drawn and in what order, and nothing about where anything sits on screen.

**The scripted UI run. Written, not run.** Five scenarios: the stop count on a long answer, a code
block keeping its own stop, the details line, Copy inside the answer bubble, and Retry inside the
question bubble with the old row gone. Two things had to be added for these to be possible at all:

- Two preview-only seams. One puts a finished question and answer straight into the transcript
  without asking a model, so the text is the same every run — it goes through the session-restore
  path that already exists, so no new setter had to be handed out of the ask state. The other reports
  the newest reply's shape: how many stops, and the rectangle of each bubble, the line, both icons
  and the old row.
- Two new checks in the runner. It could only match text inside a result before, which cannot say
  "four stops or fewer", and could not say "this icon is inside that bubble" at all.

**It could not be run from here: the scripted run needs the preview panel opened from inside the
editor.** The sandbox starts fine and the checks are committed and ready; opening the panel is a
manual step. Run it with `npm run test:preview:tier -- --tier=tier3UI --evidence --write`.

**The device. Not run.** This is where focus and layout problems actually show, and where the corner
icons need looking at hardest.

## Step 2 — the Show details line (done 2026-09-06)

**What a person notices.** Under the answer: *Was this helpful?* and its two buttons, then Retry and
Copy, then a thin line across the reply with **Show details ↓** in the middle. Pressing it opens the
detail chips below the line and the label becomes **Hide details ↑**.

**What changed.** The button left the row and became a line, built the same way the collapsed-history
row is — a label centred on a hairline — with a rule on both sides instead of one. It registers under
the same focus name the button used, so everything that looked the button up still finds it.

The reply block also went from 88% of the column to 92%, matching the answer bubble and the question
above it, so the line shares their left and right edge instead of sitting slightly inside them.

**Two things worth knowing.**

- The line answers the A button one way and a finger tap another, and deliberately not a third. Steam
  fires its own activation for the A press as well, so wiring all three would toggle twice on one
  press. If the device shows a single press opening and immediately closing it, that guess was wrong
  and one of the two comes off. It is in the test row.
- Copy took the column Show details vacated, so the pairing above and below is kept: Helpful sits
  over Retry, Not really over Copy.

**Tests.** Five new cases: the line renders and the button is gone, the label flips, one press calls
the toggle once, a running answer dims it and disconnects both presses, and a reply with neither
Retry nor Copy shows the line with no button row at all. Two older cases changed: one built the row
with only Show details in it, which no longer makes a row; one asserted that coming up from below the
chips lands on Retry, when the line is now what sits directly above them.

**Still owed on the device.** Row SHOW-DETAILS-01, rewritten.

## Step 3 — the corner icons (done 2026-09-06)

**What a person notices.** The row of buttons under a reply is gone. Copy is a small faded icon in
the answer bubble's bottom right corner. Retry is a faded circular arrow on the newest question's
bubble, on its left. Under the answer there is now only *Was this helpful?*, its two buttons, and the
Show details line.

**Copy.** Everything it did when pressed is unchanged — it reads the text at the moment of the press,
tries three ways of putting it on the clipboard, and shows the result for two seconds. Only what it
draws is new: the usual two overlapping rounded squares, a tick when it works, a cross when it does
not. The words have no room, so they live in the spoken label, which did not change. It appears on a
finished answer only: a still-arriving one has no settled bottom to pin it to, and the text would
change under the press.

**Retry.** The question bubble went from one D-pad stop to a row of two: the icon, then the question
text. The icon is a normal part of the row rather than something pinned to a corner, because that
bubble is right-aligned and only as wide as its text — its left edge moves, and pinning to a moving
edge would need a measurement, which the design rules forbid. As part of the row, the bubble simply
grows to fit it.

Pressing to open and close the question moved onto the text half, so pressing the icon cannot also
open the question. A turn with no Retry to offer — every turn but the newest — renders exactly as it
did before, one stop.

**The risk, plainly.** This is the change most likely to be wrong in a way no test can catch. The
test runner has no layout engine and the scripted run does not check D-pad graphs. If it is wrong it
will show as the question no longer opening when pressed, as pressing the question firing Retry, or
as the ring skipping past the answer. All three are visible in one pass on the device.

**Tests.** Six on the question bubble: one stop and activation on the bubble when there is no Retry;
two stops with activation moved onto the text when there is; Down into the answer staying on the
outer row rather than either half; one press calling Retry once; and the icon greyed out and its
Left press refused while an answer is on its way. Five on the answer bubble: the icon on a finished
answer, nothing while streaming, nothing without copy text, the room reserved on the last section,
and Right offered from the last section and no other. Two older tests changed: the pair that pressed
Up out of the button row now press Up out of the line, which inherited the same fallback chain.

**Still owed on the device.** Rows COPY-REPLY-01, COPY-REPLY-02, the new RETRY-CORNER-01, and
CHAT-REPLY-ENTRY-01.
