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

## Step 2 — the Show details line

Not built yet. See D76 for the placement call and the roadmap entry for the shape.

## Step 3 — the corner icons

Not built yet. See D77. This is the one with real risk: it turns the question bubble from one stop
into a row of two, and neither icon may end up touch-only.
