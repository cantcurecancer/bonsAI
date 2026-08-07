# How to write KB eval queries

Authoring rules for `tests/fixtures/kb_eval_v1.json` and anything that replaces it. Written
from maintainer review of the first 147-query draft, 2026-08-06. That draft got the style
wrong in two ways that mattered, and both corrections are below.

The point of these queries is to **predict what people will actually type**, so retrieval can
be measured against reality rather than against how we happen to phrase things. Where a user
will be precise and where they will be hazy is the whole design problem — the queries encode
our best guess at that, and the cards have to answer both.

---

## 1. Write for a controller, not a keyboard

Users are on a Deck, a Steam Frame, or a couch with a controller. **Typing is expensive.** They
will not write sentences.

| Don't | Do |
|---|---|
| "the big lizard in the cave rolls into a ball and I can't hurt it" | "fire lizard boss" |
| "which weapon upgrade should I take first for a swarm build" | "best overclock for swarms" |
| "how do I actually get promoted at work" | "sim promotion faster" |

Voice input is the exception and runs a bit longer and more sentence-like. Keep **some** queries
in that register — maybe one in five — and mark them so the difference is visible.

This is not cosmetic. Short queries carry fewer keyword matches, which is exactly the condition
where meaning-search has to earn its cost. Long queries quietly flatter keyword search and
would have made the bake-off read better than the product will.

---

## 2. Users know the names the game shows them

The first draft assumed players describe rather than name. Wrong for most content. **Enemy
names are on screen. Characters shout them. Places are labelled.**

Expect the proper noun:

- **Deathclaw** — the name is displayed above the enemy
- **Tank**, **Witch**, **Charger** — characters call them out loud
- **King Dodongo** — the dungeon is literally named Dodongo's Cavern
- **Water Temple**, **Los Santos**, **Valentine** — labelled places

Expect vagueness where recall is genuinely hard:

- **Volvagia**, **Twinrova** — awkward names, awkward to type, players describe instead
- **DRG Survivor terminology** — most players do not know the jargon. Avoid our words entirely;
  "biome" is a developer's word, "the sticky plant level" is a player's.
- Anything the game names once in a cutscene and never again

**Using a proper noun is not cheating.** Cheating is reusing *our card's phrasing*.
"king dodongo weak point" is cheating because "weak point" is our card's language.
"how to beat king dodongo" is a person asking a question. See `withheld_card_terms` in the
fixture — it lists only card phrasing, never proper nouns.

---

## 3. Cover three skill levels, per title

The first draft was uniformly beginner. Real users are not.

| Level | Asks about | Example |
|---|---|---|
| **Beginner** | What a thing is, how to survive it | "how to beat tank" |
| **Familiar** | Optimisation, comparison, choices | "rank melee weapons" |
| **Power user** | Specific spots, coordination, competitive play | "death charge spots no mercy roof" |

Power-user questions are the ones the corpus most obviously cannot answer today — they need
content and card shapes that do not exist yet (see the online/versus feature in
[roadmap.md](../roadmap.md)). **Write them anyway.** A query set that only asks what we can
already answer measures nothing.

---

## 4. Calibrate per title

Maintainer read of the first draft, title by title:

| Title | Calibration |
|---|---|
| **Ocarina of Time** | Names known for Dodongo and Water Temple. Vague for Volvagia and Twinrova — those two were the best in the draft. |
| **DRG Survivor** | Keep broad. Players do not know the terminology; do not use ours. |
| **Left 4 Dead 2** | Names known (Tank, Witch). Campaign known, specific chapter usually not. **Needs versus/online questions** — the draft had none. |
| **Baldur's Gate 3** | Needs a deliberate spread of all three levels. |
| **Fallout 4** | Names known — every enemy name is on screen. |
| **State of Emergency** and other retro/obscure titles | Weight toward beginner. Less familiar, less recalled. |
| **Hades**, **Cyberpunk 2077** | Draft was already at the right level. |
| **GTA: San Andreas** | Places known (Los Santos). **Mechanics** questions skew beginner, **story** questions skew specific. |
| **The Sims 4** | Draft was good. |
| **RDR2** | Draft was fine. |

---

## 5. Some questions cannot be answered by one card

"where are all the gold spiders" has a hundred answers. No single card holds them, and a card
that tried would be useless.

Mark these `needs_clarification` in the fixture. The right product behaviour is a follow-up —
*"which area are you in?"* — not a wall of locations. **Whether that is retrieval's job or the
model's is an open design question**; the queries should exist either way, because pretending
the class does not exist is how it ships broken.

---

## 6. Fixture fields

| Field | Meaning |
|---|---|
| `query` | What the user types. Terse. |
| `intent` | What they want, one line. This is what a card must answer. |
| `topic_hint` | The **game entity** a card must cover — a fact about the game, not our corpus. |
| `withheld_card_terms` | Card *phrasing* the query must not contain. Enforced by test, not by review. Proper nouns do not belong here. |
| `skill_level` | `beginner` / `familiar` / `power_user` |
| `input_style` | `terse` (default) or `voice` |
| `split` | `tune` (weights are fitted on these) or `holdout` (the ship gate — never read while tuning) |
| `expect_section` / `expect_topic` | The exact card title that should come back. Filled only after cards exist and sign-off happens. |

`ask_mode` was in the first draft and is **being removed as a query-level field**: after decision
D17, retrieval no longer depends on the Ask mode. Mode still sets how many cards attach, which
is a budget question the eval covers separately, not a property of a question.

---

## 7. Cover both sides of a multiplayer game

A title with an online mode has two populations asking about the same subject from opposite
ends. "Smoker" means *how do I not get grabbed* to one and *how do I grab people* to the other,
and the wording barely differs:

| Survivor side | Infected side |
|---|---|
| "smoker grabbing me off roofs" | "how to use smoker" |
| "charger keeps splitting us up" | "charger best angle to charge" |
| "how to break a jockey ride" | "what are jockeys advantages" |
| "counter boomer smoker combo" | "charger then boomer then spitter?" |

Write these as **pairs on purpose**. They are the hardest retrieval case in the set — one
discriminating word ("use", "counter", "best angle") has to pull a different card. If one card
answers both, the card is wrong, not the search.

Beyond the per-special pairs, the infected side has whole subjects the survivor side has no
equivalent for — spawn positioning in ghost mode, when to hold the tank, goo placement,
where to steer a ride. Those have no survivor mirror and no cards today.

---

## 8. What "good" looks like

Maintainer-supplied examples, kept verbatim as the bar for power-user content:

- "death charge spots on the roof of no mercy"
- "what rooms usually have good loot in dead center burning building"
- "rank melee weapons"
- "dark carn best infected coordination spots"

Note the register: abbreviations ("dark carn"), no punctuation, no sentence structure, and
domain knowledge assumed. That is the target.
