# Knowledge-base answer eval — 2026-09-05 — qwen35-9b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `qwen3.5:9b` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `5.2` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **97.0%** (96/99) | every must-mention group found in the reply |
| No contradiction | **88.9%** (8/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **11.1%** (1/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **100.0%** (66/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **83.8%** (31/37) | strictest view |

Mean seconds per answer: **2.8**. Mean request payload: **7311.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1551.7**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.7 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.2 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.4 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-HL2-02` | speed | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.6 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.0 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 2.2 |
| `A-CP77-01` | expert | 3/3 | 2/3 | 2/3 | 3/3 | 3/3 | 2.6 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-CP77-03` | strategy | — | — | — | 1/3 | 3/3 | 3.7 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.6 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.6 |
| `A-FO4-05` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 3.4 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-RDR2-03` | strategy | — | — | — | 0/3 | 3/3 | 2.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.9 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 4.5 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 3.0 |

## Failures worth reading

- **A-HL2-02** sample 3: missing facts: `throw`
- **A-HADES-03** sample 1: spoiler fence missing, one was due
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-01** sample 2: missing facts: `damage taken`
- **A-CP77-01** sample 3: said: `slows time`
- **A-CP77-03** sample 1: spoiler fence missing, one was due
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-FO4-05** sample 2: missing facts: `twice`
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due
- **A-RDR2-03** sample 3: spoiler fence missing, one was due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat the Glyphid Dreadnought, you need to kite between waves and focus fire on its weak-point armor plates once they open. Save your overclock or nuke abilities for those brief windows when the armor is broken.
> 
> ```bonsai-cite
> {"source":"fallback_no_source","text":"Kite between waves; focus weak-point armor plates as they open. Save overclock/nuke for armor break windows."}
> ```
> 
> Keep moving to avoid its heavy attacks, and prioritize damaging the exposed plates rather than wasting shots on thick armor. Splitting your fire evenly if multiple targets appear helps prevent them from healing each other in later encounters.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You aren't doing anything wrong; that is their core mechanic. The two smaller Dreadnoughts (the Lacerator and the Arbalest) will actively close the distance between them to trigger a heal phase. If you focus fire on one until it's dead, the other will instantly heal back up because the gap closed.
> 
> To stop them from healing:
> *   **Split your fire:** Deal damage evenly to both twins so they never get close enough to trigger the heal mechanic.
> *   **Keep them separated:** Use movement or kiting to maintain distance between the two bosses, preventing the "gap closed" condition that starts their regeneration.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the currency used to purchase weapon upgrade cards at the between-stage shop and to reroll artifact choices from the Supply Pod. Unlike gold, which funds your dwarf's upgrades, nitra specifically fuels your arsenal; running low on it means you might end up with an underleveled weapon regardless of how much gold you've mined. Keep mining for whichever weapon carries the run, as nitra is essential for maintaining firepower between stages.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to take down the big guy without getting crushed or vomited on. Here is how you handle him:
> 
> 1.  **Don't rush:** Wait until your teammates are ready. The Tank stops sending other infected, so it's just you and three survivors against him.
> 2.  **Use the environment:** If you can slip past him while he is looking away or crouching through a vent, let the horde swarm him instead of fighting him directly.
> 3.  **Keep your distance:** He throws concrete chunks that hit harder than his punches. Stay in the open where you have room to dodge, but don't get cornered near a drop-off.
> 4.  **Protect teammates:** If a survivor is pinned or running away, put your body between them and the Tank so bullets don't kill your friend.
> 5.  **Watch out for Boomers:** If a Boomer pukes on you, it summons more infected. Shove him first, then shoot to stop the horde from coming at you.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Left 4 Dead 2, The Witch ignores gunfire and other infected unless you get too close or shine a light on her. If she was calm before and then lunged, you likely stood near her or used a flashlight on her while she was still settling. Keep your distance if she growls; back off until the growl stops so she calms down again. Once startled (by light or proximity), she will charge at whoever burned her or woke her, not necessarily the person who triggered it first.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Left 4 Dead 2's versus mode, playing as the Hunter requires a shift from standard survival to aggressive disruption. Your pounce damage scales with distance and height, so prioritize verticality: jump off ledges or ramps to maximize impact before landing on a survivor. Target stragglers rather than the main group; isolating them prevents coordinated healing or weapon sharing. If you must engage near the team, move like a common infected—crouch and blend until the melee claw registers as horde damage to someone checking their surroundings. Since your pounce recharges quickly, hold crouch between jumps to maintain relentless pressure on isolated targets. Avoid overextending into open areas where survivors can easily group up; use cover to stalk and strike from range. Remember that your primary threat is disrupting the team's cohesion, not just dealing raw damage.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You've asked about the Gels, so we'll skip the usual story warnings since you're curious about them. Think of these paints as physics modifiers rather than just colors.
> 
> Here is how each one functions on your Deck (gamepad controls included):
> 
> 1.  **Blue Gel (Repulsion):** This makes surfaces bouncy. It does not launch you upward by itself; the bounce height depends entirely on how fast you were moving when you hit it. To gain significant height, fall from a ledge onto the gel or jump down onto it. You can also use two opposing blue-coated walls to "walk" up them by bouncing back and forth between them.
> 2.  **Orange Gel (Low Friction):** This removes friction from a surface. If you slide into an orange patch, you will keep sliding at your current speed until you hit something else or the floor. It is excellent for maintaining momentum on slopes or reaching distant platforms without needing to jump repeatedly.
> 3.  **White Gel (Portalable Surfaces):** This allows you to place portals on surfaces that normally cannot hold them (like certain glass floors or specific textures). Note that it will not stick to cubes, turrets, or other moving objects. Also, Wheatley can strip this paint away with his bombs.
> 
> All three paints are useless if applied to standard glass surfaces; they simply slide off or do nothing.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If your weightless travel is carrying you the wrong way, look for the button that reverses it before assuming the route is shut. The beam passes through portals and can ferry gel or cubes as well as you, so check if a control point or switch upstream needs flipping to flip the vector.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with blind predators that hunt by vibration, so you must stay off the sand. On the coast, rocks are safe; step onto them to avoid being detected. Once you have the Pheropod from the Antlion Guard, use it to reverse their behavior: throw the bait and they'll swarm whatever you marked instead of you. Keep moving between rocks until you reach a safe zone or break the bunkers guarding Nova Prospekt.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You've already named the item, so I'll skip general spoilers. To use the bugbait (pheropod), simply throw it at a specific Antlion or group of Antlions. Once they read you as a guard, they will swarm whatever target you marked with the pheropod. For better performance during these chaotic encounters, ensure your Deck is plugged in and set to high power:
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun is versatile but has specific limits on mass and shape. It will not lift most enemies, as they are generally too heavy or have physics properties that resist the tool's primary punting force. However, it can interact with several key items:
> 
> *   **Explosive Barrels:** These are fair game; picking them up allows you to throw them at cover or enemies for maximum damage.
> *   **Sawblades:** Found in Ravenholm, these cut zombies apart when thrown and can be retrieved as ammunition.
> *   **Radiator:** A held radiator acts as a physical shield you can walk behind while shooting.
> *   **Manhacks and Scanners:** These Combine tech items are light enough to be lifted and thrown back at their operators.
> *   **Grenades:** You can pick up thrown grenades and throw them back where they came from, or toss them around corners.
> *   **Cans of Beans:** Common environmental objects that serve as basic ammunition for the gun itself.
> 
> If you are struggling with performance while handling these objects in complex environments, ensure your TDP is set appropriately:
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": 1200}
> ```

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a new run on the Steam Deck, grab the **Stygian Blade** first. It's the most forgiving of the six weapons and asks the least of you early on. The Shield of Chaos is next easiest if you like holding block to turn mistakes into nothing. The Eternal Spear is also safe since its reach keeps you out of trouble. Save the Twin Fists of Malphon for later—they are fastest but need you standing inside everything, which can be risky before you know what you're doing.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're getting torn apart by them both at once, right? That’s the core issue—Asterius telegraphs his charge with a long wind-up; sidestep it to leave him stuck briefly. Theseus throws spears and marks god-powers on the ground before they drop. Most runs go smoother if you focus on Asterius first since Theseus alone is more predictable once he’s not distracted. If you keep dying, try equipping the Shield of Chaos—holding block turns mistakes into nothing rather than taking damage, and it sets up a rush that hits hard, blending defense and offense. The Adamant Rail punishes standing still with its magazine system, but in this chaotic fight, staying mobile is key; don’t let your ammo run dry at the wrong moment.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> Beating the final boss doesn't mean the story is over; it's actually the middle of the narrative. The Pact of Punishment unlocks now, letting you add optional Heat difficulty for rewards that scale with your runs. You still need to keep playing to reach the actual ending and see how things resolve.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You asked about the Berserk operating system, so here is the direct breakdown of its functions. It acts as a melee-focused "other" OS that fundamentally changes how you handle damage and healing in combat.
> 
> When active, it provides two primary benefits:
> 1.  **Damage Reduction:** It significantly cuts the amount of damage you take from all sources while running.
> 2.  **Health Floor & Regen:** Your health will never drop below 25% (a quarter) of your maximum. Once this threshold is reached, every enemy you kill instantly restores 25% of your maximum health.
> 
> The effect on melee weapons depends on the specific model installed, but generally, it synergizes with high-damage close-quarters builds. Note that this is distinct from Sandevistan (time-slowing) or Quickhacks (netrunning), though it shares the "operating system" classification in Night City's tech tree.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For your first playthrough of Cyberpunk 2077, you need to pick two main attributes early on. Body and Reflexes give you a straightforward melee build that forgives mistakes well. Intelligence lets quickhacks do the work before fights start, but leaves you fragile if things go wrong. Technical Ability quietly helps every build by opening up crafting and cyberware options. Spreading points evenly is usually a bad idea since perks sit behind thresholds.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> The ending of *Cyberpunk 2077* depends heavily on your choices, specifically regarding Johnny Silverhand and whether you side with him or V. There are multiple endings available, ranging from a bittersweet conclusion to one where you survive but at a cost. The game offers different paths based on how much trust you place in the other character and what you decide to do in the final missions.

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You've explicitly named the boss, so I'm giving direct tactics without spoiler warnings on that specific encounter. To defeat Adam Smasher, prioritize destroying his legs first to immobilize him and reduce his damage output. Use Sandevistan abilities or high-DPS builds to capitalize on openings between his rocket barrages; cover your position during those bursts. Keep moving to avoid area-of-effect attacks, then focus fire on the weakened limbs before finishing him off with sustained damage.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're looking to take out a Deathclaw before it gets too tough, and the key is managing distance and cover. These monsters have massive health pools and resist most energy weapons, so lasers will just bounce off their hide. Start by luring it into an open area where you can use your environment—throwing cars or debris at it to stagger its charge or headbutt attacks. Keep moving behind walls to avoid grabs and decapitation attempts when its health drops low. If you have access to heavy weapons like the minigun or missile launcher, those deal better damage than lasers but still require careful positioning. Use V.A.T.S. if your build allows it to focus fire on weak points while staying safe. Remember, patience is your best friend here; don't rush in unless you're sure about your gear and strategy.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're asking about those precious 21 points you get to spend right away in Fallout 4. Since you only have one point per stat initially, your opening choices dictate which perks unlock sooner and how much XP you need to grind before feeling powerful. Intelligence is the quiet powerhouse here: raising it first makes you level up faster, letting you buy other perks like Action Boy or Strong Back much quicker. If you want to smash things with a baseball bat or heavy gun, dump points into Strength and Endurance early for durability and damage. For ranged builds, Agility boosts your carry weight and V.A.T.S. accuracy, while Perception helps you spot enemies before they see you. Charisma is useful for settlements but less critical in the first few hours. Remember, bobbleheads and magazines can fix any stat later, so pick what feels fun for your playstyle now rather than optimizing a character you haven't met yet.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with irradiated former humans that almost never travel alone. They deal radiation damage and physical hits, so prioritize taking the head off first; cutting a leg stops an attacker instantly while removing arms doesn't. Be wary of rubble where they play dead or climb out of ductwork—rooms looking clear often aren't. If you're in heavily irradiated zones like the Glowing Sea, they regenerate as you shoot them, so consider alternative takedowns there.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Your suit likely isn't "broken" in a glitchy sense; it's probably running out of fuel or needs repairs. First, check your Fusion Core. If the gauge is empty, you can still walk, but you lose V.A.T.S., steady aim, and are over-encumbered. Swap it at any Power Armor Station.
> 
> If the core is fine but the armor feels sluggish or damaged, you need to repair it. Repairs cost materials (steel, copper, etc.) and happen at a station. A common optimization trick: don't rush to upgrade every piece immediately. Wait until your Armorer and Science perks are ranked up; upgrading from a lower tier later costs the same materials as doing it all at once, so you save resources by waiting for better perk bonuses.
> 
> If you built a Power Armor Station in a settlement, ensure it's powered and that your settlers aren't too unhappy, though happiness doesn't directly fix armor—it just keeps your base running smoothly. If the suit still acts weird after swapping cores and repairing, check if you're wearing a specific mod that might be conflicting or if an enemy effect (like radiation) is degrading the frame faster than usual.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You've encountered the classic trap: at roughly half health, many Legendary enemies trigger a mutation that instantly restores them and grants a new ability. The fight effectively doubles in length if you dump all your ammo and stimpaks on the first half. Don't panic—this is by design to make the second phase harder. Save your best weapons and consider using cover or crowd control to delay the heal window. After they heal, watch for the new attack pattern; it's often faster or more damaging. Once defeated, loot the drop carefully, as it carries a random legendary effect.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're switching from *GTA* into *Red Dead Redemption 2*, so expect a deliberate shift in gameplay. Arthur has weight, horses take time to turn, and animations are key—don't rush interactions. Shooting through towns works briefly, but lawmen persist with bounties that grow if witnesses see you. Wear masks for crimes to keep bounty low, and treat camp as your base, not a menu shortcut. Honor missions affect town mood; manage stable upkeep before long hunts.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Honor rises through consistent small choices: greet strangers politely, help them without taking money, pay bounties instead of fleeing, and donate to camp. Avoid killing civilians or animals unless necessary for gameplay mechanics like hunting for food. These actions gradually shift your reputation slider upward, unlocking discounts and altering NPC reactions.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> In *Red Dead Redemption 2*, Arthur Morgan's final moments are deeply tied to your choices throughout the game. The core narrative leads toward a dramatic conclusion, but the exact path depends on how you handled key decisions earlier. If you're looking for guidance without major spoilers: Arthur faces a critical choice that defines his legacy and how he leaves the world. His story is one of redemption, sacrifice, and confronting mortality in a changing West.
> 
> For those playing on Steam Deck, ensure your performance settings prioritize smooth storytelling over maxed-out graphics near the finale—lowering shadows or draw distance can help maintain stability during emotional sequences.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Your horse is likely reacting to fear or low trust, not just random glitching. In RDR2, horses have a "bond" meter; if it’s too low, they’ll bolt or throw you off when startled by gunfire, predators, or even loud noises. Start bonding up immediately:
> 
> - **Ride often** – every ride increases bond.
> - **Feed and groom** – use the feed bucket and brush at camp or on-the-go.
> - **Pat your horse** – press the interaction button (usually X/□) to pet it when calm.
> - **Stay calm during danger** – don’t panic if a bear or gunshot appears; keep riding steadily.
> 
> Once bond is high enough, they’ll stop throwing you off and start doing advanced maneuvers like drifting and rearing. If you’re near camp, Pearson can upgrade your satchel too—more room for supplies means less running around in circles.
> 
> If you're playing on Steam Deck and experiencing performance dips that might be spooking the horse visually (e.g., frame drops), try lowering TDP:
> 
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": 900}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You extend the timer by grabbing the +15s pickups scattered across the map. Don't just clear every enemy; if you're low on health or ammo, break off from a fight and sprint to collect them. A longer round is worth more than finishing a crowd early. Treat rocket-launcher enemies as priority only when they appear late in the round, otherwise focus on time extension.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *State of Emergency*, these are two distinct gameplay styles rather than a single game with multiple modes. **Kaos Mode** is a score-attack challenge where you fight against a clock within one zone at a time; your goal is to extend the timer by hitting objectives that pop up during the riot, not just surviving. **Revolution Mode**, conversely, follows a narrative structure consisting of a chain of missions per zone with specific objectives handed out by the resistance, which also drives character and zone unlocks.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> That is a common visual glitch or misunderstanding in The Legend of Zelda: Ocarina of Time. Almost everything that looks like it's missing isn't actually gone; it's just invisible to the naked eye. Equip the Lens of Truth, and all those invisible floors, walls, and chests will instantly appear. Since holding the Lens drains your magic meter quickly, use it in short bursts rather than leaving it on permanently. Green potions or fairies found within the temple can help keep your magic running while you solve these puzzles.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to take down the fire dragon without getting burned or eaten. This fight relies on timing and using your best gear. You need the Megaton Hammer, Goron Tunic, and a shield.
> 
> First, lure Volvagia out of his lair by shooting arrows into the holes in the floor. Wait for him to emerge from one of the holes near the ledge where you are standing. As soon as he pops up, immediately swing the Megaton Hammer at his head to stun him. While he is stunned, slash him with your sword. If he flies around the room, use the Hookshot to pull him back down into the hole or onto a safe ledge so you can hit him again. Keep moving and watch for lava edges; stay on the stone platforms. Repeat this cycle until his health bar is empty.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Hoarding rests isn't saving resources; it's skipping companion scenes and quests that need those downtime moments. Supplies are plentiful, so rest when you feel right rather than forcing extra camps unless you're low on spells or hit points before a hard fight.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For your first run, aim to cover the four core slots: one talker/healer, one trap/lock expert, and two damage dealers. A classic reliable setup includes a Paladin (talk/heal), a Rogue or Ranger (traps/stealth), and two martial classes like Fighter or Barbarian for damage. Alternatively, swap one martial slot for a Bard to boost utility and dialogue options. Ensure at least one character has healing capabilities; the party fails if no one can restore health. Adjust based on your preferred playstyle, but prioritize coverage over specific builds initially.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To maximize income in the early game of The Sims 4, focus on careers that scale quickly with skill levels and minimal setup costs. Painting and writing are classic self-employed earners because they only need one skill and one object, and both scale hard with level. Gardening is slower to start and larger later. Selling collectibles funds the very early game, and a cheap starter lot leaves more for the object that earns.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To increase your gang size beyond the default one member, you must raise your **Respect** level. This acts as a hard cap; without enough Respect, the game simply won't let you recruit additional members. You can gain Respect through several methods:
> 
> *   **Missions:** Completing story missions and random events is the most reliable way to earn Respect.
> *   **Combat:** Killing rival gang members and police officers increases your Respect score.
> *   **Territory Control:** Taking over turf from other gangs (like the Ballas or Vagos) grants significant Respect bonuses.
> *   **Appearance:** Your character's look influences Respect, especially in Grove Street territory. Wearing green clothing and sporting a muscular build while keeping hair dyed green helps maintain high Respect levels.
> 
> Conversely, wearing colors associated with rival gangs (like red for the Ballas) or killing your own gang members will cause you to lose Respect, potentially dropping your gang size back down.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You asked about beating [[spoiler]]Margit, the Fell Omen[[/spoiler]]. Since you named him directly, I will give you direct tactics without spoiling later bosses or story beats.
> 
> On a Steam Deck (gamepad), the fight relies on stamina management and dodging his wide swings rather than blocking.
> 1.  **Stamina:** Keep your Vigor stat high enough to dodge repeatedly. If you run out of stamina, you will die quickly.
> 2.  **Dodge Timing:** Wait for him to swing or charge. Jump over his attacks (press jump just before impact) or roll to the side. Do not block his heavy hits unless you are very confident; it drains stamina fast.
> 3.  **Weapon Choice:** A weapon with good reach helps keep distance. If using a sword, time your thrusts when he is winding up an attack.
> 4.  **Summon Allies:** If you have the Spirit Calling Bell and can summon help, do so early to distract him.
> 
> Remember that Margit has specific phases where he gets faster or uses fire attacks; watch his animations closely.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Dying repeatedly in Tartarus usually means you're getting overwhelmed by damage or missing key upgrades. The Shield of Chaos is a great choice if blocking feels safer than attacking, and killing the bull first in multi-boss fights can simplify things. If you keep resurrecting with Death Defiance but still fail, try switching Mirror of Night rows to focus on healing or cooldowns.
