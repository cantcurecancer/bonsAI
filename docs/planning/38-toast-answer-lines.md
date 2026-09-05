# 38 — The answer's first lines in the reply-ready toast

Written 2026-09-05, before any code. The maintainer picked this as the first of six features to plan and
asked for a plan first: what a person gets, what has to be measured before anything is built, what they
have to decide, how it is built, and how it is proved on the Deck. The decisions are **D63** in
[maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md). Nothing in § 6 starts until
they are answered and § 3 has run.

Read first: [CLAUDE.md](../../CLAUDE.md); the model and effort table in [AGENTS.md](../../AGENTS.md) § 3;
[13-roadmap-feature-ideas.md](13-roadmap-feature-ideas.md) § C3, where this slice was first drawn;
[35-bugfix-session.md](35-bugfix-session.md) and [36-feature-session.md](36-feature-session.md), the two
sessions running today, for what they own and who holds the Deck.

**One sentence:** when an answer finishes while the menu is closed, the small notification that today
says only *Reply ready* would show your question and the first lines of the answer, so a short answer is
read without leaving the game.

---

## 1. What is true right now (checked 2026-09-05, nothing changed)

- **The toast exists and is small.** When an answer finishes and the bonsAI panel is not on screen, a
  Steam notification appears reading *Reply ready* over *Tap to open*, stays four seconds, and a tap
  opens the panel on the answer. A failed Ask shows *Ask failed* with the first 120 letters of the
  error for five seconds. Stopping an Ask shows nothing. Each answer toasts at most once, and a new
  toast replaces the old one rather than stacking.
- **Nobody has recorded seeing it on the Deck.** Its five test rows were archived unchecked on
  2026-07-30, and the one live row that mentions it is still unchecked. Whether it shows over a
  running game, where, and how much text fits, is not known. Decky draws it through Steam's own
  notification system, and there is no local copy of Decky's code to read the limits from. **This is
  the first thing to settle, and it is a measurement, not a decision.**
- **The status the toast reads carries the full answer text, the question, the game id, the branch menu
  and checklist if any, and the spoiler-consent flag. It does not carry the Ask mode.** The chat id was
  added to that status for the same reason a few weeks ago, so the shape of the change is known.
- **An answer can contain four kinds of fenced block:** a hidden spoiler, a branch menu, a checklist,
  and a citation. The branch menu is normally removed from the text before it is stored, but when the
  model garbles it the fence stays in the text. Spoiler fences are not Strategy-only: a Speed or Expert
  answer gets the fence instructions too when knowledge-base cards attach.
- **The Copy button already has the rule this needs.** It never copies a still-hidden spoiler; it swaps
  the block for a placeholder. The same rule applies here, stricter: the preview does not appear at all.
- **Three sessions share this checkout today.** The bug session holds the Deck; the feature session is
  queued for it next. The three toast files are owned by neither. Adding the mode to the status touches
  the plugin's root file, which one of the bug session's helpers is in, so that one small edit waits for
  their landing.

## 2. What a person gets

You are playing. You asked something in Speed mode, closed the menu, and kept playing. The answer
finishes. A notification appears with your question as its title and the first lines of the answer
under it. If the answer was short, the notification *is* the answer, and you never open the menu. If it
was long, you read how it starts and tap to open the rest, as today.

Strategy answers keep today's notification, because they are built around menus and hidden spoilers that
a notification cannot show safely. Any answer, in any mode, that holds a hidden block also keeps today's
notification. The failure notification and the no-notification-on-Stop rule do not change.

## 3. Measure first, on the Deck, one block

About twenty minutes, when the Deck is free. Evidence goes under `runs/` and is named in § 10.

| # | Question | How |
|---|---|---|
| M1 | Does the toast show over a running game at all, and how? | Game running, Speed Ask from the panel, close the menu, keep the game in front. Read the toast's box from the page. A screenshot only if capture works that day; the maintainer's own eyes otherwise. |
| M2 | How much text fits before it clips, in the title and in the body? | Fire a toast whose body is a counting string, read where it cuts. Same for a long title. Note the box size and the line count. |
| M3 | Does the duration field work, and where does the toast sit? | Fire one at eight seconds; time it. Note the corner, because a toast that covers a game's health bar is worse than none. |

**If M1 fails, the entry is blocked on Steam's notification behaviour, the roadmap says so, and nothing
is built.** If M2 shows one line, the feature becomes "the first line" and the roadmap entry says that.
Nothing in § 6 is sized until M2 has a number.

## 4. The rules, as proposed

Every rule below is a proposal. The ones the maintainer has to settle are in § 5.

1. **Which answers get the preview:** Speed and Expert. Strategy keeps today's toast.
2. **When the preview is withheld, even in Speed or Expert:** the answer text contains any fenced block
   of any kind; the status carries a branch menu or a checklist; the Ask mode is missing from the status
   (an older backend, or a build order mishap). In every withheld case the person sees exactly today's
   toast. Withholding is the safe direction, so every doubt resolves to it.
3. **What text is shown:** the answer with the internal tags removed, the markdown turned to plain text
   (no stars, hashes, bullets, links or code marks), whitespace collapsed, cut at a word boundary to the
   budget M2 measured, with an ellipsis when cut. A whole answer that fits is shown whole.
4. **The title:** the question, cut to fit. *Reply ready* carries no information once the body has the
   answer, and the question is the person's own words.
5. **How long it stays:** eight seconds, tap to open unchanged.
6. **The mode travels on the status from the backend**, the same way the chat id already does. The
   frontend does not guess it, because after a plugin restart a guess would be wrong.
7. **No new setting.** The toast already exists and already shows over the game; only its words change.
   A setting costs about eighteen files and a Settings row, and nobody has asked for the toast to be
   quieter yet.

## 5. What the maintainer decides — D63

1. **Which modes get the preview.** Speed and Expert (recommended); every mode with the fence rule as
   the only guard; Speed only.
2. **What the title says.** Your question, cut to fit (recommended); or *Reply ready* as today.
3. **How long it stays on screen.** Eight seconds (recommended); today's four; Steam's own default.
4. **A setting to turn the preview off, or always on.** Always on in v1 (recommended). The case for a
   setting: anyone looking at the screen reads the answer, so a person streaming or playing on a shared
   TV might want it off. It can be added later without undoing anything.
5. **An extra guard for story games.** The code already knows which games are story-heavy. The preview
   could be withheld on those unless the question named the thing it asks about. Not in v1
   (recommended), because Speed answers on story games rarely spoil, and the rule would hide the preview
   on the games where a quick answer is most wanted. Revisit if a leak is ever seen.
6. **Where this sits in the Deck queue.** Third, after the bug session and the feature session
   (recommended); or ask the feature session to fold M1 to M3 into its own Deck block; or the maintainer
   runs M1 by eye and reports what they see.

Nothing is built until 1 to 3 are answered. 4 to 6 have defaults that hold if there is no answer.

## 6. Build steps, after D63 and § 3

One thing per commit, all four gates green between commits. The three toast files are not owned by
either running session, so steps 2 and 3 can go on a lane of their own at any time; step 1 waits.

| Step | What lands | Who | Waits for |
|---|---|---|---|
| 1 | The Ask mode rides the background status: the state module gains the key, the two places that build a pending state pass it, the TypeScript type gains the field, one Python test asserts the key is present on a pending state. | Sonnet 5 high lane | the bug session's root-file helper to land |
| 2 | A pure text helper: answer text in, preview text or nothing out. Tests: tags removed; each fence kind returns nothing; markdown flattened; long text cut at a word with an ellipsis; short text returned whole; empty text returns nothing. | Sonnet 5 high lane | M2's budget number |
| 3 | The toast uses it. Tests: Speed answer shows question and preview; Strategy shows today's toast; a fence shows today's toast; a missing mode shows today's toast; a branch menu or checklist on the status shows today's toast; a short answer shows whole; duration is the chosen number; tap still opens the panel; dedup and failure paths unchanged. | same lane | step 2 |
| 4 | Docs: the roadmap entry moves to Verify naming the rows below; the rows join the manual test doc; a changelog line. | the session's own driver | step 3 |
| 5 | The Deck rows in § 7. | whoever holds the Deck, Opus xhigh reads the results | step 4 and a free Deck |

Effort is two stars, so by the routing table the plan is done in-session, a Sonnet lane builds, and
Opus at extra-high effort lands it because it touches the reply path.

## 7. Proving it on the Deck

Rows go in the manual test doc when step 4 lands. Titles come from the test title pool.

- **TOAST-PREVIEW-01** Deep Rock Survivor running, Speed, a fence-free question, menu closed before the
  answer finishes: the toast shows the question as title and the answer's first lines; tap opens the
  panel on that answer.
- **TOAST-PREVIEW-02** Same, Strategy: the toast reads *Reply ready* over *Tap to open*, unchanged.
- **TOAST-PREVIEW-03** A story game, Speed, knowledge base on, a question that invites a spoiler fence:
  if the answer holds a fence, the toast is today's, and no hidden text appears anywhere on it.
- **TOAST-PREVIEW-04** A question with a one-line answer: the whole answer is on the toast, no ellipsis.
- **TOAST-PREVIEW-05** A long answer: the body ends at a word with an ellipsis, nothing is cut mid-letter
  by the box, and the title is the question cut to fit.
- **TOAST-PREVIEW-06** Menu open on the Settings tab when the answer finishes: the toast still appears
  (the panel is not showing the answer), with the preview.
- The five archived rows for the original toast are folded in: M1 is the first of them, and 02 to 05 run
  as written on the day.

**Frozen chips.** The standing rule: before anyone types on the Deck, the questions are shown to the
maintainer, confirmed, then pinned as frozen test chips. Proposed batch, to confirm before pinning:
*how do i kill the big armoured bug boss* (row 01, Deep Rock Survivor); *what does the pickaxe do*
(row 04, one-line answer); *how does the story end* (row 03, Red Dead Redemption 2); *give me ten tips
for a new player* (row 05, a long answer). Row 02 reuses the first sentence in Strategy.

This is not a Main-tab layout change, so the free-play sweep is not owed by it.

## 8. Risks, and what to know

- **An unfenced spoiler in a Speed answer would show over the game.** The same words would show in the
  panel today, but now without the person opening it. Decision 5 offers the story-game guard.
- **Anyone watching the screen reads the answer.** Decision 4.
- **Steam's own notification settings may hide in-game notifications entirely** for some people. M1
  tells us whether the default shows it; the troubleshooting doc gets a line either way.
- **Character voices.** With a character on, the first lines may be flavour before the answer. Accepted;
  the person chose the voice.
- **The text budget is measured, not guessed.** If the box is small the feature shrinks to fit and the
  roadmap entry is reworded rather than the text squeezed.
- **Root-file contention.** Step 1 is two lines in the plugin's root file, and a bug-session helper is in
  that file today. It waits; steps 2 and 3 do not.

## 9. Out of scope

A persistent overlay over the game; reading a whole long answer from the toast; a toast for a partly
streamed answer; a setting (decision 4 may reopen this later); previews for Strategy; any change to the
failure toast or the no-toast-on-Stop rule; changing where Steam places its notifications.

## 10. Progress log

Written as work lands.

- **2026-09-05** — Plan written. D63 raised. Roadmap: the toast slice split out of **In-game answer
  surface** as its own ★★ entry. Nothing built, nothing measured.
