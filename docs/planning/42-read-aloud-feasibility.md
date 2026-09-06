# 42 — Reading answers aloud on the Deck: can it be done? (Sept 2026)

Written 2026-09-05, before any code. The fourth of the six features the maintainer asked to have planned
one at a time. This one is a memo, not a build plan: the roadmap has carried "Local reply TTS" at five stars
for months with no engine chosen and nobody having checked what can speak on a Deck at all. This memo checks.
The decisions are **D74** in [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md).
Nothing in § 8 starts until they are answered and the Deck rows in § 7 have run.

Read first: [CLAUDE.md](../../CLAUDE.md); the model and effort table in [AGENTS.md](../../AGENTS.md) § 3;
[38-toast-answer-lines.md](38-toast-answer-lines.md), because reading aloud and the toast preview share one
text helper; [10-wake-word-listening-feasibility.md](10-wake-word-listening-feasibility.md) for the shape of
a feasibility memo in this repo and for what the microphone work learned about the Deck's sound system.

**One sentence:** press a button under an answer and the Deck reads it out loud, with the menu open or
closed, with no internet and nothing sent anywhere; press again to stop.

**The short answer:** yes, and more cheaply than the five stars suggest. The Deck already has a voice
(SteamOS added one for its screen reader in June 2025), the plugin already knows how to reach the Deck's
sound system from its background program, and a natural-sounding voice is one download of about 90 MB.
What is not known is how fast a natural voice runs on the Deck's chip beside a game, and that is a
measurement, not a guess. § 7 is that measurement.

---

## 1. What is true right now (checked 2026-09-05)

- **The plugin never makes a sound.** It listens (voice input through a local speech-to-text engine) but
  has no code that plays audio, on the screen side or in the background program. Nothing to reuse for
  playback; two hard things to reuse from listening, below.
- **The listening code already solves the two hard problems reading aloud needs.** First, the plugin's
  background program runs as root outside the person's Steam session, and the Deck's sound system lives
  inside that session. The microphone code finds the session's sound socket by reading the environment of
  a running Steam process and points its recorder at it. Playback needs exactly the same trick with the
  matching player program, which ships in the same system package as the recorder. Second, the Deck has
  no package manager, so the listening engine is installed by a download-and-smoke-test flow with a
  progress state the Settings tab shows. A speech engine installs the same way.
- **The lesson from that install.** The first version copied a ready-made program onto the Deck and it
  crashed with an illegal-instruction error, because it was built for newer chips than the Deck's. The fix
  was to build it on the Deck. Any speech program this memo proposes must pass the same test on the device
  before it is trusted: run once, produce sound, no crash. The whisper follow-up notes are in
  [voice-input-follow-up.md](../archive/voice-input-follow-up.md).
- **The AI model cannot speak.** Ollama runs text models only. Speech output has been requested since
  2024 and is still open; a 2025 request was closed into the older one. The Deck's Gemma 4 can hear, not
  talk. So a second, small program does the speaking, whatever the model.
- **The Deck already has a voice.** SteamOS 3.7.13, June 2025, added the Orca screen reader and the
  espeak-ng speech program to the system so that Steam's own screen reader (Settings → Accessibility) can
  talk. It is the classic robotic voice. It is on every up-to-date Deck with no download at all. Steam's
  screen reader itself only reads whatever control has focus, so it cannot be asked to read an answer; but
  the speech program it brought along can be run directly.
- **Other plugins play sound in gaming mode.** Game Theme Music plays music from the plugin's screen code
  with the browser's ordinary audio player, and it keeps playing when the menu closes. Audio Loader swaps
  Steam's own interface sounds. So the screen side is a proven fallback door if the background one fails.
- **The plugin is Apache 2.0**, and its model licence tiers (open source only, by default) are a real
  constraint on what gets bundled. The speech programs below are graded against that.
- **Answer lengths, for how long a read takes.** Speed answers are capped near 600 words, Strategy near
  1,200. Spoken at a normal pace that is up to four and eight minutes. A typical Balanced answer is one to
  two minutes.

## 2. What a person gets

**Phase 1, read aloud.**

- A **Read aloud** button under the answer. Press it and the Deck starts speaking within about a second,
  because the first sentence is made and played while the rest is still being made. Press again, or ask a
  new question, and it stops.
- Close the menu and it keeps reading, so a person can go back to the game and listen. Opening the menu
  shows the Stop button.
- It reads what is on screen, and only that: hidden spoiler blocks are left out (§ 5), formatting is not
  read as symbols, the branch menu of a Strategy answer is not read.
- When enabled in Settings (off by default; the maintainer's call, D74): when an answer finishes with the
  menu closed, read it without a press. That is the in-game case the toast preview in plan 38 serves for
  short answers; reading serves it for long ones.
- One voice in Phase 1: the Deck's own, which works the moment the plugin is installed (the maintainer's
  call, D74). The natural voice, a one-time download of about 90 MB from the Settings tab the way the
  listening engine installs today, moves to Phase 2 with the character voices.

**Phase 2, a voice per character.** The natural voice download, and then, when an AI character is selected,
a voice that fits the character: a stock voice with the right regional sound, or an invented voice made
once from a description or a short recording (§ 6). Never a copy of a real person's voice without their
consent; that is the whole legal gate.

## 3. What can speak on the Deck: the options

Sizes are the download. Speed guesses are for the Deck's chip and are guesses until § 7 runs; the one
published measurement per engine is quoted so the guess is not bare. Licence classes use the plugin's own
words: open source means an OSI licence.

| Option | Where it comes from | Download | How it sounds | Speed on the Deck (guess) | Licence | Verdict |
|---|---|---|---|---|---|---|
| **A. The Deck's own voice** (espeak-ng) | Already on SteamOS 3.7.13 and later | none | Robotic, clear, tireless; fine for a 20-second hint, tiring for four minutes | Instant | GPL-3, a separate program the system ships; the plugin only runs it | **Phase 1's zero-install voice and the fallback for everything else** |
| **B. A Piper voice, run by the sherpa-onnx runner** | Runner: one 28 MB archive for Linux x64 from its releases (v1.13.7, 2026-09-01). Voice: about 63 MB each from the Piper voice set | about 90 MB | Natural; what Home Assistant uses; reads like a good audiobook app, not a person | A published measurement puts Piper at three times faster than real time on a desktop core; guess two to four times on the Deck, so a one-minute answer is ready in 15 to 30 seconds and the first sentence in about one | Runner Apache 2.0. Each voice carries its own data licence, checked per voice (§ 9, question 6). The Piper engine itself is not needed: the old binary is MIT, the new package is GPL-3, and the runner replaces both | **The natural voice; Phase 2 since the maintainer's call of 2026-09-05** |
| **C. Kokoro, same runner** | The runner's model set; 100 MB packed, 330 MB full | 100 to 330 MB | The best of the small voices; close to a person | Slower than real time on a Raspberry Pi 4 even with four threads; guess around real time on the Deck using every core, which the game also wants | Apache 2.0 | A quality option for listening with the menu open, later; not the default |
| **D. Kitten TTS nano, same runner** | The runner's model set; released Feb 2026 | about 25 MB | Decent; eight voices; the smallest natural voice there is | Faster than B, most likely | Apache 2.0 | The small alternative if Piper's per-voice licences turn out to be a bother; measure alongside B |
| **E. Supertonic, Pocket TTS, Inflect** | Python packages; the runner also supports the first two | 240 to 450 MB | Good to very good | Faster than real time on a four-core server | Pocket TTS MIT; Supertonic 3 OpenRAIL-M, which is not open source by the plugin's classes | Skip for now; the runner keeps the door open |
| **F. A speech server on the PC that runs Ollama** | The person's own PC | none on the Deck | Whatever the PC runs | Depends on the LAN | n/a | Not offline; a later option for LAN users |
| **G. Steam's own screen reader** | Already on the Deck | none | Same voice as A | Instant | n/a | No: it reads the focused control and cannot be aimed at an answer |
| **H. The browser's built-in speech inside Steam's interface** | Steam's web engine | none | Same voice as A, if it works at all | Instant | n/a | Unknown: on Linux it needs the speech service SteamOS now ships, and Valve's build may not have it switched on. One line of code to find out; row 06 |

Why the runner and not the engines directly: sherpa-onnx is one Apache 2.0 program that runs Piper,
Kokoro, Kitten and more, ships ready-built for Linux x64, and needs no Python packages, no compiler and no
container on the Deck. The listening engine needed a container and a 60-second compile because no clean
prebuilt existed; here one does. It comes as a shared build, so the plugin sets the library path before
running it, which the listening code already does for its own engine.

Ollama and the LAN PC are not the answer today, and nothing the maintainer waits on changes that.

## 4. How the sound gets out, and how fast

**Two doors.** The background program can play through the Deck's sound system with the player that
ships beside the recorder the microphone uses, pointed at the session socket the microphone code already
finds. That door keeps playing with the menu closed, needs no data to cross the plugin's bridge, and Stop
is ending one process. Or the screen side can play: the background program hands over a sound file as
text through the bridge and the browser's audio player plays it, as Game Theme Music does. That door is
proven on other plugins but a minute of speech is about 3.5 MB of text across the bridge, and the player
dies if the plugin reloads. **Recommendation: the background door, with the screen door as the fallback**
if playback from a root program into the session fails on the device. Rows 02 and 06 check both.

**The first sentence first.** The text is split into sentences; the engine makes one while the player
plays the previous one. So the wait before sound is one short sentence's work, about a second for B, and
the total work hides under playback as long as the engine stays ahead. For A it is nothing. For C it may
not stay ahead on the Deck; that is why C is not the default.

**What it costs the game.** A uses nothing. B uses about one core for a fraction of the answer's length.
C uses every core for most of it, which a running game notices. Battery follows the same order. Row 05
measures B beside Deep Rock Survivor, the same standard the model bake-off uses.

**Where the sound goes.** Whatever the Deck is using: speakers, headphones, Bluetooth, the dock. That is
the session's default output and needs no choosing. Volume is the Deck's volume; a plugin-side slider is
not needed in Phase 1.

## 5. What gets read, and what does not

- **The same text helper as the toast preview** (plan 38, build step 1): internal tags out, every hidden
  block out, formatting flattened. One helper, two users. Reading aloud adds sentence splitting on top.
- **Hidden spoiler blocks** are never read. Whether the voice says a short marker such as *"a spoiler is
  hidden here"* or skips silently is D74, question 3. Recommendation: say it, so the person knows the
  answer had more and can open the block on screen if they want it.
- **Tables and code** are not read out symbol by symbol. The voice says one phrase, *"there is a table on
  screen"*, and moves on.
- **Character answers** are read as written; the accent is already in the words.
- **The branch menu** at the end of a Strategy answer is not read; it is a control, not the answer.
- **Stop** on: the button, a new question, the plugin unloading, the Deck going to sleep.

## 6. Phase 2: a voice that fits the character, and the legal gate

The maintainer's ask, 2026-09-05: not a stock reader, and not a copy of any real performer, but an
invented character voice with a heavy regional accent, the way the character mode already writes in one.
Three ways to get there, cheapest first. All three keep the one rule that is the legal gate: **never a
copy of a real person's voice without that person's consent.** Invented voices, consented recordings and
a person's own voice are all fine; a soundalike of a named performer is not, and several US states now
make it unlawful.

1. **A stock voice with the right regional sound.** The Piper set has a British pack trained on 109
   consented speakers from across the UK, attribution licence, and the pack's speaker list says where
   each is from, so a young man from Surrey or London is a matter of picking the right number. The words
   already carry the slang and the rhythm, because the character mode writes them that way. What this
   cannot do is the performance: the exaggerated delivery of a comic character. Cost: one voice pack, the
   runner from § 3, no new engine; Deck speed as measured for B.
2. **Invent the voice once on the PC, then copy it on the Deck.** Two engines do this. One makes a new
   voice from a plain-language description (a young man from Surrey, a heavy London-Jamaican accent, quick
   and cocky); it wants a graphics card, so it runs once on the PC, never on the Deck. The other, Pocket
   TTS, takes a five-second clip of any voice and reads new text in it; it is a 100-million-parameter
   model that runs on two CPU cores, its code is MIT, and it is in the runner's model set. So: design the
   voice on the PC, keep a five-second clip, and the Deck reads every answer in it. The clip is of nobody.
   Or skip the design step and record yourself doing the accent for five seconds; your own voice needs
   nobody's permission. A five-second copy keeps the sound of the voice and much of the accent and loses
   some of the performance. Cost: Pocket TTS on the Deck is unmeasured (row 04 now includes it); one
   published measurement puts it near real time on a four-core server, so beside a game it may not keep
   ahead of playback. Its weights' licence is checked on the day; its terms forbid copying a voice without
   consent, which is the rule anyway.
3. **The voice-design model on the Deck itself.** No: it wants four to eight gigabytes of graphics memory,
   which the Deck shares with the game.

Recommendation: way 1 first, because it is one file and rides on the natural voice download; way 2 when
the maintainer wants the voice to be truly its own, once row 04 says the Deck can carry it. The rule
stays as written.

## 7. Proving it on the Deck

Rows go in the manual test doc when the build lands; the feasibility rows run before the build, when the
Deck is free. Another chat holds the Deck today. Rows 01 to 03 are shell commands over SSH and take under
half an hour; a probe script (§ 8, step 0) runs them in one go.

- **TTS-FEAS-01, the built-in voice is there.** Read the SteamOS version; confirm the speech program,
  the screen-reader speech service and the sound player exist; make a five-second sound file from one
  sentence. Pass: a file with speech in it, made in under a second.
- **TTS-FEAS-02, sound from the background.** From the plugin's background program, with the session
  socket found the way the microphone finds it, play that file with the menu closed and a game running.
  Then again with headphones, then Bluetooth. Pass: heard each time, on the right output, over the game.
- **TTS-FEAS-03, the natural voice runs.** Download the runner archive and one Piper medium voice to
  the Deck, set the library path, make a sound file from a 150-word answer taken from the answer test.
  Pass: no illegal-instruction crash, speech in the file; record seconds taken and memory used, and the
  seconds for the first sentence alone.
- **TTS-FEAS-04, the other voices** (same day): Kitten nano, Kokoro packed, and Pocket TTS reading from a
  five-second clip of the maintainer's own voice, same measure. Pocket TTS's number decides whether § 6
  way 2 is a Deck feature or a PC-only one.
- **TTS-FEAS-05, beside a game.** Row 03 again with Deep Rock Survivor running: seconds taken, and a
  note by eye on whether the game stuttered. This is the number that decides whether B is the default
  or only an option.
- **TTS-FEAS-06, the screen door.** From the plugin's screen code in gaming mode, play a short sound
  with the browser's audio player, close the menu, confirm it keeps playing; and ask the browser for its
  built-in voices (one line). Pass for the first half: heard with the menu closed. The second half is
  information only.

## 8. Build steps, when this is picked up

Only after D74 is answered and rows 01 to 03 have passed.

| # | Step | Who | Depends on |
|---|---|---|---|
| 0 | A probe script for rows 01 to 04 over SSH, in the shape of the existing Deck probes. Writes what it finds to a run file. | Opus xhigh writes it; anyone runs it | the Deck being free |
| 1 | The text helper shared with plan 38 (if plan 38 has not built it yet), plus sentence splitting. Tests: the plan 38 list, and sentences split on full stops, question marks and line breaks but not on decimals or abbreviations. | Sonnet 5 high lane | nothing |
| 2 | Background: a speak service. Takes text, splits it, makes each sentence with the Deck's own voice into a sound file, plays them in order through the session's sound system, stops on request. The engine is behind one small interface so Phase 2 adds the natural voice without touching the rest. Three bridge methods: start, stop, status. Start returns at once and the screen polls status, so no call outruns the 15-second deadline. Tests with a fake engine and a fake player. | Sonnet 5 high lane | 1 |
| 3 | Screen: the Read aloud / Stop button under the answer with a focus-graph entry, and the Settings row for reading new answers on their own when the menu is closed, off by default. Plumbing budget from the settings note in CLAUDE.md: a boolean is about eighteen files. | Sonnet 5 high lane; Opus xhigh reviews the focus entry | 2 |
| 4 | Docs: roadmap, testing rows, changelog. | Sonnet 5 high | 3 |
| 5 | Phase 2, the natural voice: download the runner and one voice, smoke-test once, write the ready marker; progress shown in Settings the way the listening engine's is. Reuse that code's download, progress and cancel pieces rather than copy them. A Settings row picks the voice. | Sonnet 5 high lane | Phase 1 shipped; row 03 passed |
| 6 | Phase 2, the character voices: the character-to-voice table (a stock speaker number, or a five-second clip) and passing the choice through; the clip path only if row 04 passed. | Sonnet 5 high lane | 5 |

**Effort, honestly.** Phase 1, the Deck's own voice only, is two stars: the plumbing exists, the engine
is there. Phase 2 is three stars: the natural voice download and its Settings state, plus the character
table; the copied-voice path adds a Deck measurement, not much code. The roadmap's five stars were the
price of not knowing any of this.

## 9. What the maintainer decided — D74, partly locked 2026-09-05

Locked the same day, the maintainer's answers:

1. **The Deck's own voice for Phase 1.** No download. The natural voice moves to Phase 2.
2. **Reading new answers on their own when the menu is closed ships in Phase 1**, as a setting, off by
   default.
3. **A skipped spoiler block is said out loud**, one short phrase.
5. **The roadmap entry is split**: *Read answers aloud* (two stars, now that no download is in it) and *A
   voice per character* (three stars, since the download moved into it).

Still open:

4. **The character voice.** The maintainer wants an invented character voice with a heavy regional accent,
   not a stock reader and not a copy of a named performer. § 6 has the three ways. The call: (a) the stock
   regional voice first; (b) straight to the invented voice, after the Deck check; (c) both, stock first,
   invented when the check passes. *Recommendation: (c).*
6. **Voice licences.** The pros and cons the maintainer asked for are in the decisions file under D74,
   with a middle path: the voice list follows the tier setting the models already use.
   *Recommendation: the middle path.*

## 10. Sources

- SteamOS 3.7.13 notes, Orca and espeak-ng added: [Steam Deck HQ](https://steamdeckhq.com/news/steamos-3-7-13-released-with-wifi-regressions-fixes-for-steam-deck-oled-and-better-support-for-rog-ally/), [Steam news](https://store.steampowered.com/news/app/1675200/view/529850584204838038)
- Steam's screen reader, what it reads and how it is controlled: [Can I Play That](https://caniplaythat.com/2025/06/19/steam-adds-new-accessibility-features-in-beta/), [Steam Deck HQ](https://steamdeckhq.com/news/steam-deck-client-update-accessibility-features/)
- Ollama has no speech output: [issue 11021, closed into 5424](https://github.com/ollama/ollama/issues/11021)
- Piper today: [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) (GPL-3, Python); the archived MIT binary release: [rhasspy/piper 2023.11.14-2](https://github.com/rhasspy/piper/releases/tag/2023.11.14-2), Linux x64 archive 26 MB; a medium voice: [en_US lessac medium, 63 MB](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium)
- The runner: [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx), Apache 2.0; [v1.13.7 release assets](https://github.com/k2-fsa/sherpa-onnx/releases), Linux x64 shared archive 27.9 MB; its [Kokoro](https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/kokoro.html) and [Kitten](https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/kitten.html) model pages, with the Raspberry Pi 4 speed figures
- CPU speed and quality of the small voices, July 2026: [Neo's four-model benchmark](https://heyneo.com/blog/kokoro-supertonic-inflect-nano-pocket-tts-cpu-benchmark); sizes, memory and licences, Aug 2026: [Picovoice's on-device comparison](https://picovoice.ai/blog/on-device-tts/) (a vendor page; its own engine is the one it favours)
- Kitten TTS, Feb 2026: [NYU Shanghai write-up](https://rits.shanghai.nyu.edu/ai/kittentts-state-of-the-art-voice-synthesis-in-under-25-mb/)
- Kokoro 82M, Apache 2.0, six times real time on a laptop: [VisionStory review](https://www.visionstory.ai/open-source/kokoro-tts)
- Plugins that play sound in gaming mode: [Game Theme Music](https://github.com/OMGDuke/SDH-GameThemeMusic) (browser audio player from the plugin's screen code), [Audio Loader](https://github.com/DeckThemes/SDH-AudioLoader)

## 11. Progress log

- **2026-09-05** — Memo written. Found: SteamOS has shipped a voice since June 2025; the plugin's
  microphone code already reaches the session's sound system from root; a natural voice is one Apache 2.0
  runner plus one 63 MB voice, no compile, no container. Not yet measured: speed beside a game. Six
  questions to the maintainer as D74. Deck rows written, waiting on the Deck.
- **2026-09-05, later** — Four calls locked: the Deck's own voice for Phase 1, auto-read as an off-by-default
  setting, the spoken spoiler phrase, the split. The maintainer asked for an invented accent voice for the
  character rather than a stock one; researched and written up in § 6: Pocket TTS copies a voice from a
  five-second clip on two CPU cores and is in the runner's set, the voice-design models need a graphics
  card, so design on the PC and read on the Deck. Row 04 now measures Pocket TTS. Voice licences open,
  pros and cons written.
