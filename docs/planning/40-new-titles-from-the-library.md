# 40 — New titles from your library (the first tranche)

Written 2026-09-05, after the maintainer said yes to a one-off tranche of new titles for the knowledge
base and asked for the list to come from their own Steam library. Plain language on purpose. Decision
D69 in the decisions file; roadmap entry under Knowledge base and RAG § Next.

**Status 2026-09-05: the library is read and the wikis are checked (§ 5, § 6). Owed: the screen walk
when the Deck is free, and your pick of five to ten titles (§ 7).**

---

## 1. What this is

Five to ten games, picked by you from what you actually play, each getting a first pass of six to ten
cards with credit lines. It is a one-off exception to the "no new titles until the catalog" rule, not a
change to it. It buys notes for games you play, more variety in the search test, and the extra data the
blend-weights call may still want.

Already covered, so excluded: Baldur's Gate 3, Cyberpunk 2077, Deep Rock Galactic: Survivor, Fallout 4,
Grand Theft Auto: San Andreas – DE, Hades, Half-Life 2, Left 4 Dead 2, Ocarina of Time, Portal 2, Red
Dead Redemption 2, State of Emergency, The Sims 4.

## 2. Step one — read the library

Two ways to get the list.

**A. A file read over SSH — done 2026-09-05.** The Steam client keeps the answer in three files: one per
installed game with its name, a settings file listing every game the account has opened with playtime
in minutes and the last-played date, and the non-Steam shortcuts file (name, what it launches, the
collection it sits in). The reader is `scripts/probe_deck_steam_library.py`; it prints one line per game
sorted by hours, marks what is installed, and can look up names for games that are owned but not
installed. It reads files only, so it never competes with a session driving the screen. The full list
is in `build/deck-library.json` (not committed; re-run the script to refresh it).

**B. The screen walk — owed, when the Deck is free.** Open the Library, walk the shelf with the D-pad
through the rig and the controller bridge, read each tile off the page. What it adds over A: what is
actually on the shelf right now, the collections you made, and anything hidden. What it cannot add:
hours (the client keeps none for shortcuts) or games you own but removed. Use it to confirm the
shortlist in § 6, not to enumerate.

## 3. What the read found

**Steam games: 90 with any playtime, 37 installed on the internal drive, 27 on the SD card.** By hours:

| Game | Hours | Last played | Installed | Note |
|---|---|---|---|---|
| Counter-Strike 2 | 1560 | 2026-05 | no | multiplayer-only: the versus plan (17), not this tranche |
| Left 4 Dead 2 | 1417 | 2026-09 | yes | in the corpus |
| Team Fortress 2 | 1154 | 2026-08 | no | multiplayer-only |
| PUBG | 1132 | 2023-11 | no | multiplayer-only |
| Counter-Strike: Source | 737 | 2024-05 | no | multiplayer-only |
| Baldur's Gate 3 | 336 | 2026-07 | yes | in the corpus |
| Red Dead Redemption 2 | 316 | 2026-03 | no | in the corpus |
| Fallout 4 | 303 | 2026-08 | yes | in the corpus |
| Cyberpunk 2077 | 279 | 2026-07 | yes | in the corpus |
| **Stardew Valley** | 232 | 2026-01 | yes | candidate; see § 5 for the licence problem |
| **Grand Theft Auto V** (Legacy 230 + Enhanced 38) | 268 | 2026-05 | yes | candidate |
| The Sims 4 | 191 | 2026-05 | yes | in the corpus |
| Deep Rock Galactic: Survivor | 157 | 2026-09 | yes | in the corpus |
| **Grand Theft Auto IV** | 103 | 2025-12 | yes | candidate |
| Hades | 90 | 2026-06 | yes | in the corpus |
| Civilization IV (Warlords 55, Beyond the Sword 15, base 4) | 74 | 2017–2025 | no | candidate, low priority |
| Civilization: Beyond Earth | 50 | 2026-01 | no | candidate, low priority |
| **Brotato** | 31 | 2025-12 | yes | candidate; see § 5 |
| GTA: San Andreas – DE | 29 | 2026-06 | yes | in the corpus |
| **Sifu** | 27 | 2026-09 | yes | candidate |
| Death Stranding Director's Cut | 27 | 2026-06 | no | story-heavy; skip |
| Detroit: Become Human | 24 | 2025-08 | no | story game; skip |
| **Hogwarts Legacy** | 24 | 2025-09 | yes | candidate, weak source |
| Golf With Your Friends | 23 | 2024-06 | no | multiplayer; skip |
| **God of War** | 19 | 2025-12 | yes | candidate |
| GTA III – DE | 17 | 2026-05 | yes | same source as GTA V; could ride along |
| It Takes Two | 15 | 2023-06 | no | co-op story; skip |
| Marvel's Spider-Man Remastered | 14.5 | 2026-06 | yes | maybe |
| Half-Life 2 | 14 | 2026-09 | yes | in the corpus |
| **Hollow Knight** | 13 | 2024-07 | yes | candidate |
| Mirror's Edge | 13 | 2023-09 | no | skip |
| **Fallout: New Vegas** | 13 | 2025-01 | no | candidate, source already cleared |
| Portal 2 | 12 | 2026-08 | yes | in the corpus |
| Call of Juarez Gunslinger | 10 | 2025-11 | yes | skip |
| Skyrim Special Edition | 7 | 2025-05 | no | candidate, source already usable |
| Control, Mass Effect LE, Witcher 3, Batman AA, Borderlands 2 | 4–7 each | 2025 | mixed | maybe later |
| **Black Mesa** | 1.8 | 2025-12 | yes | **candidate, confirmed by you 2026-09-05** |

Below two hours: F.E.A.R., MGS2, Teardown, Dead Space, Titanfall 2, ARC Raiders, Jedi: Fallen Order,
Grim Dawn, Wreckfest, Mortal Kombat X, and about twenty more.

**Non-Steam shortcuts: 121 entries, 108 of them emulated.** The client keeps no hours for these, only a
last-played date, so they are ranked by recency and by what you said: there is good stuff in there.

| Group | What is there | Last played |
|---|---|---|
| Ports | **Ship of Harkinian** (Ocarina, in the corpus), **2 Ship 2 Harkinian** (Majora's Mask) | today; April 2026 |
| Plain shortcuts | **Palworld** (your one favourite tag), **DOOM Eternal** | March 2024; March 2024 |
| Nintendo 64 (44) | Super Mario 64, Mario Kart 64, Mario Party 1–3, Banjo-Kazooie, Banjo-Tooie, Donkey Kong 64, Star Fox 64, GoldenEye 007, Doom 64, Turok 2, Diddy Kong Racing, F-Zero X, Majora's Mask, Ocarina Master Quest, Smash 64, Yoshi's Story, Paperboy, Duke Nukem 64, plus sports and racing titles | mostly never through Steam |
| PlayStation 2 (17) | **Devil May Cry 3**, **Gran Turismo 4**, Burnout 3, Midnight Club 3 and II, NFS Underground 2, Onimusha 2, State of Emergency (in the corpus), Stuntman, The Getaway, Crazy Taxi, SpyHunter, Headhunter, Samurai Champloo, sports | DMC3 Oct 2024; GT4 Feb 2026; SoE Jul 2026 |
| GameCube / Wii (8) | **Super Smash Bros. Melee**, **Paper Mario: The Thousand-Year Door**, **Pikmin 2**, Mario Party 6 and 7, Wind Waker, Twilight Princess, Skyward Sword | not through Steam |
| Switch / Wii U (10) | Breath of the Wild (three ways), Tears of the Kingdom, DLC entries | BotW April 2026; TotK Dec 2023 |
| Others | Crash Bandicoot (PS1), Demolition Man, Road Rash, ToeJam & Earl (Genesis), Dynamite Cop (Dreamcast) | Demolition Man May 2026; Crash Oct 2024 |

## 4. Which games make good candidates

What makes a title worth cards, before any wiki is checked: you play it; it has repeatable questions
(bosses, enemies, items, builds, areas); it is not multiplayer-only (that is plan 17); and it runs on
the Deck. Pure story games are out: their cards are spoilers by nature. The Red Strings Club, seen in
the run logs, is that shape and is a no; so are Detroit and Death Stranding.

## 5. The wiki check, one per candidate (done 2026-09-05)

Rules: the corpus is one CC BY-SA work, so a source must be CC BY-SA 3.0 or 4.0, or CC BY. NonCommercial,
NoDerivatives, all rights reserved, or GFDL: not usable. Fandom refuses reads from this network, so for
Fandom wikis the licence below is what the archive.org dump declares about itself, and the dump is the
working copy; confirm at the footer through the archive before the first card. Lessons already paid
for: the Hades Fandom wiki is NonCommercial, the Zelda wikis are GFDL, the Baldur's Gate wiki is mixed.

| Game | Wiki, licence | Dump on archive.org | Verdict |
|---|---|---|---|
| **Black Mesa** | Half-Life wiki (Combine OverWiki), CC BY-SA 4.0, already cleared for the corpus | Feb 2025, 6.6 GB | **Usable. Confirmed by you.** |
| **Hollow Knight** | hollowknight.wiki, CC BY-SA 3.0 | May 2026, 12.9 GB; Fandom copy Nov 2023 | **Usable — the best source in this list.** Fresh, huge, bosses / charms / areas, little story |
| **Grand Theft Auto V** and **IV** | GTA Fandom wiki, CC BY-SA 3.0, already cleared for San Andreas | Mar 2022, 7.4 GB | **Usable.** Both games predate the dump. Missions and heists are story, so fence named beats |
| **DOOM Eternal** (and Doom 64) | doomwiki.org, CC BY-SA 4.0 | Dec 2025, 7.3 GB | **Usable.** Demons, weapons, bosses; low story |
| **Palworld** | palworld.wiki.gg, CC BY-SA 4.0 (read live today) | Nov 2023, 100 MB — before the game's launch | **Usable licence, stale dump.** The live wiki answers from here, so pages can be read live with the date recorded, or a fresh dump requested |
| **Super Mario 64, Mario Kart 64, Paper Mario TTYD, Mario Party, Donkey Kong 64, Yoshi's Story** | Super Mario Wiki (mariowiki.com), CC BY-SA 4.0 (read live today) | Jan 2026, 119 GB | **Usable.** One source covers a dozen of your emulated titles |
| **Super Smash Bros. Melee** (and Smash 64) | SmashWiki (ssbwiki.com), CC BY-SA 4.0 (read live today) | Feb 2025 | **Usable.** Characters, matchups, techniques |
| **Devil May Cry 3** | Devil May Cry Fandom wiki, CC BY-SA 3.0 | Feb 2020, 31 MB | **Usable.** The game is from 2005, so the dump is fine |
| **Fallout: New Vegas** | Fallout Fandom wiki, already cleared | in hand | **Usable, cheap.** Low hours |
| **Skyrim SE** | UESP, CC BY-SA 4.0 | Nov 2022, 48 GB | **Usable.** Low hours |
| **Crash Bandicoot** | crashbandicootwiki.com, CC BY-SA 4.0 | Mar 2025 | **Usable.** Small game |
| **Pikmin 2** | Pikipedia, CC BY-SA 4.0 (read live today) | 2014, old but the game is from 2004 | **Usable.** |
| **Turok 2** | Turok Encyclopedia (Fandom), CC BY-SA 3.0 | 2022, 27 MB | Usable, niche |
| **God of War** (2018) | God of War Fandom wiki, CC BY-SA 3.0 | Sep 2024, 8.8 GB | **Maybe.** Good source; heavy story, so much of it fences |
| **Sifu** | Fandom dump CC BY-SA 3.0 from Feb 2022 (launch month, thin); wiki.gg English has no dump | thin | **Maybe.** Needs a fresh dump of the wiki.gg pages first |
| **Civilization IV** | Civilization Fandom wiki; the dump points at the wiki's own copyright page, so read it first | Feb 2020 / 2022 | **Maybe.** Not installed; check the licence page |
| **Gran Turismo 4**, **Banjo-Kazooie**, **NFS Underground 2** | Fandom wikis exist; no main dump found for GT or Banjo; NFS dump Jul 2022 declares no licence | none / unclear | **Maybe.** Request dumps; confirm licences |
| **Hogwarts Legacy** | Harry Potter Fandom dump is from 2020 (before the game); a speedrun wiki (CC BY-SA 4.0, Aug 2026) is narrow | none useful | **No usable source today** |
| **Stardew Valley** | The official wiki declares CC BY-NC-SA (NonCommercial) on its 2019, 2023 and 2025 dumps; the Fandom copy is 4 MB and stale | not usable | **No wiki source.** Your second most played single-player game. Option: cards you write yourself from play, as the Ocarina cards were, credited to nobody and labelled so |
| **Brotato** | The wiki declares no licence at all | May 2025, 47 MB | **No wiki source.** Same option as Stardew |
| **Majora's Mask, Breath of the Wild, Tears of the Kingdom, Wind Waker, Twilight Princess, Skyward Sword** | Both Zelda wikis are GFDL | not usable | **No wiki source.** Same option; the Ocarina cards already went this way |
| Detroit, Death Stranding, The Red Strings Club, It Takes Two | — | — | **No.** Story or co-op story |
| CS2, TF2, PUBG, CS:S, Left 4 Dead, Golf With Your Friends | — | — | **Versus plan (17).** Note the hours: these five are most of what you play |

## 6. Recommended tranche

Ranked by how much you play it, how good the source is, and how well the game fits cards. The first
eight are the recommendation; the rest are options.

1. **Black Mesa** — confirmed. Source cleared.
2. **Hollow Knight** — the best wiki in the list; bosses, charms, areas; little to fence.
3. **Grand Theft Auto V** — your most played single-player game outside the corpus; source cleared.
4. **Grand Theft Auto IV** — same source, a hundred hours.
5. **DOOM Eternal**, with Doom 64 riding along — one excellent source, two of your titles.
6. **Palworld** — your one favourited shortcut; pals, bosses, tech; read the wiki live.
7. **A Mario pack**: Super Mario 64, Mario Kart 64, Paper Mario: The Thousand-Year Door — one source
   covers all three, and it is the strongest of the emulated shelf.
8. **Devil May Cry 3** — bosses and styles; played last October.

Options for slots nine and ten: **Super Smash Bros. Melee**, **Sifu** (after a fresh dump), **Fallout:
New Vegas** (cheap, source in hand), **Crash Bandicoot**, **Pikmin 2**.

Three of your most played games have no usable wiki: **Stardew Valley**, **Brotato**, and the **Zelda**
titles. If you want any of them in, the cards are written from your own play with no source line, the
way the Ocarina cards were. That is allowed and honest; it just earns the weaker trust label.

And the hours say the versus plan matters: Counter-Strike 2, Team Fortress 2, PUBG and Counter-Strike:
Source are about five thousand hours between them. That plan already has Counter-Strike 2 as its stage
four.

## 7. Step four — you pick, then the rules for writing

You choose five to ten from § 6. Then:

- **Cards in one session, blind test questions in another.** Whoever writes a card can never write its
  blind question; the test method depends on it.
- **Every card carries its source and licence** the day it is written, never fixed later; the publish
  tool refuses a card without them.
- **A first pass is six to ten cards per title:** the bosses, the enemies that kill people, the items
  that matter, one "starting out" card in the new kind.
- **One corpus release for the tranche**, bundled with the other changes that need a rebuild.
- About a day per title. The lock on new titles stays for anything beyond this tranche.

## 8. Checklist

- ✅ Step one A: library read over SSH, 2026-09-05 (90 Steam games with playtime, 121 shortcuts).
- ✅ Step three: wiki check per candidate (§ 5).
- ⬜ Maintainer says the Deck is free; step one B: the screen walk confirms the shelf and the collections.
- ⬜ Maintainer picks the tranche (§ 6); titles recorded here and in the decisions file.
- ⬜ Cards written (one session); blind questions written (another); release.

## Sources

- [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md) — D69, D38, D68; the licence lessons under D19b and D20
- [15-corpus-licensing-attribution-plan.md](15-corpus-licensing-attribution-plan.md) — the licence gate and the wikis checked so far
- [17-kb-online-versus-strategy-content.md](17-kb-online-versus-strategy-content.md) — the source rule for multiplayer content
- [37-rag-status-report.md](37-rag-status-report.md) — the zoomed-out picture
- `scripts/probe_deck_steam_library.py` — the file-read path; `build/deck-library.json` — today's read
- `scripts/fetch_wiki_dump_pages.py` — pulling pages and the declared licence out of an archive.org dump
- archive.org WikiTeam search results and the wikis' own licence declarations, read 2026-09-05
