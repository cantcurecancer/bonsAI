# 40 — New titles from your library (the first tranche)

Written 2026-09-05, after the maintainer said yes to a one-off tranche of new titles for the knowledge
base and asked for the list to come from their own Steam library. Plain language on purpose. Decision
D69 in the decisions file; roadmap entry under Knowledge base and RAG § Next.

**Status: waiting for the Deck.** Two other chats are steering it. The maintainer will say when it is
free; nothing here touches the device until then.

---

## 1. What this is

Five to ten games, picked by you from what you actually play, each getting a first pass of six to ten
cards with credit lines. It is a one-off exception to the "no new titles until the catalog" rule, not a
change to it. It buys notes for games you play, more variety in the search test, and the extra data the
blend-weights call may still want.

Already covered, so excluded: Baldur's Gate 3, Cyberpunk 2077, Deep Rock Galactic: Survivor, Fallout 4,
Grand Theft Auto: San Andreas – DE, Hades, Half-Life 2, Left 4 Dead 2, Ocarina of Time, Portal 2, Red
Dead Redemption 2, State of Emergency, The Sims 4.

## 2. Step one — read the library (when the Deck is free)

Two ways to get the list. Both wait for your go-ahead.

**A. A file read over SSH — exact, about a minute, never touches the screen.** The Steam client keeps
the answer in two files: one per installed game with its name, and one settings file listing every game
the account has opened, with playtime in minutes and the last-played date. The reader is ready:

```bash
python scripts/probe_deck_steam_library.py --min-minutes 60
python scripts/probe_deck_steam_library.py --resolve-names --json build/deck-library.json
```

It prints one line per game sorted by hours played, marks which are installed, and can look up names
for games that are owned but not installed. Because it reads files, it does not compete with a session
driving the Deck's screen, and it catches games you own but have removed.

**B. The screen walk you asked for — the rig and the controller bridge.** Open the Library, walk the
shelf row by row with the D-pad, read each tile's name off the page. This shows what you see: the
collections, the order, what is on the SD card. It costs a press and a page read per game, so a
library of a few hundred is an hour, and a game not on the shelf (uninstalled, hidden) never appears.

**Recommendation:** run A first for the full list with hours, then use B on the top ten or so to
confirm they are on the shelf and installed, and to read any collection names you have made. If you
would rather the walk be the source of record, say so and B runs alone.

## 3. Step two — which games make good candidates

What makes a title worth cards, before any wiki is checked:

- **You play it.** Hours and a recent last-played date. You will read the cards and know if they are
  wrong.
- **It has repeatable questions.** Bosses, enemies, items, builds, areas. Action games, roguelikes,
  survival, RPGs and strategy games fit. A pure story game does not: its cards are spoilers by nature.
  The Red Strings Club, seen on your Deck in the run logs, is that shape and is a no.
- **Not multiplayer-only.** Versus and co-op content has its own plan (17) with its own source rule.
- **Runs on the Deck** or is one you play there, so the game line and the coverage chip mean something.

## 4. Step three — the wiki check, one per candidate

The corpus is published as one CC BY-SA work, so every card needs a source with a compatible licence
and a credit line. Fandom blocks this network, so the working copy of a wiki is its archive.org dump.
For each candidate, record:

| Check | What to look for | Pass / fail |
|---|---|---|
| **Which wikis exist** | Fandom, wiki.gg, an independent wiki, an official one | Any |
| **Licence, read at the footer** | CC BY-SA 3.0 or 4.0, or CC BY: usable. NonCommercial, NoDerivatives, all rights reserved, or GFDL: not usable. Mixed per contributor: not usable | Must pass |
| **A dump on archive.org** | A WikiTeam item for that wiki; its date and size. Old dumps of a young game are thin | Must exist, or be requested |
| **Structure** | Boss, enemy, item and area pages with fact boxes, not only lore and characters | Should pass |
| **Spoiler shape** | Low-story (little to fence) or story (fence named beats and endings) | Either; note it |
| **Verdict** | usable / maybe / no, with one line why | |

Lessons already paid for: the Hades wiki on Fandom is NonCommercial and had to be excluded; the Zelda
wiki is GFDL and was excluded; the Baldur's Gate 3 wiki is mixed per contributor and was excluded; the
Red Dead and Sims wikis are fine on licence but their only dumps are stubs. Check the footer at the
source, not the archive item's own licence field, which has been wrong before.

## 5. Worked examples from games already seen on your Deck

| Game | Seen how | Wikis and dumps found 2026-09-05 | Verdict |
|---|---|---|---|
| **Sifu** | Running during the September rounds; not in the corpus | Fandom dump, CC BY-SA 3.0, from February 2022 (13 MB) — the game's launch month, so thin. A wiki.gg wiki exists; only its Russian half has a dump (November 2024). A modding wiki on Miraheze, CC BY-SA 4.0, is about mods, not play | **Maybe.** Good shape: bosses, enemies, skills, low story. Needs a fresh dump of the English wiki.gg pages, or a request for one, before cards are written |
| **Black Mesa** | Running during the September rounds; not in the corpus | The Half-Life wiki already in the corpus (CC BY-SA 4.0) covers its chapters and enemies. A small ShoutWiki dump, CC BY-SA 3.0, March 2025 | **Usable, and the cheapest new title.** The source is already cleared and the plugin already knows the Half-Life family |
| **The Red Strings Club** | In a September run log | Not checked | **No.** A story game; its cards would be its spoilers |

The rest of the list waits for the read.

## 6. Step four — you pick, then the rules for writing

You choose five to ten from the shortlist. Then:

- **Cards in one session, blind test questions in another.** Whoever writes a card can never write its
  blind question; the test method depends on it.
- **Every card carries its source and licence** the day it is written, never fixed later; the publish
  tool refuses a card without them.
- **A first pass is six to ten cards per title:** the bosses, the enemies that kill people, the items
  that matter, one "starting out" card in the new kind.
- **One corpus release for the tranche**, bundled with the other changes that need a rebuild.
- About a day per title. The lock on new titles stays for anything beyond this tranche.

## 7. Checklist

- ⬜ Maintainer says the Deck is free.
- ⬜ Step one: library read (A), shortlist confirmed on screen (B). Results recorded here.
- ⬜ Step three: wiki check per candidate, table above extended.
- ⬜ Maintainer picks the tranche; titles recorded here and in the decisions file.
- ⬜ Cards written (one session); blind questions written (another); release.

## Sources

- [maintainer-decisions-locked.md](../audit/maintainer-decisions-locked.md) — D69, D38, D68; the licence lessons under D19b and D20
- [15-corpus-licensing-attribution-plan.md](15-corpus-licensing-attribution-plan.md) — the licence gate and the wikis checked so far
- [17-kb-online-versus-strategy-content.md](17-kb-online-versus-strategy-content.md) — the source rule for multiplayer content
- [37-rag-status-report.md](37-rag-status-report.md) — the zoomed-out picture
- `scripts/probe_deck_steam_library.py` — the file-read path
- `scripts/fetch_wiki_dump_pages.py` — pulling pages and the declared licence out of an archive.org dump
