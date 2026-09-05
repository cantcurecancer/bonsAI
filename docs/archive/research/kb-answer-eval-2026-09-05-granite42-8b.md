# Knowledge-base answer eval — 2026-09-05 — granite42-8b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `granite4.2:8b` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `6.3` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **96.0%** (95/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **22.2%** (2/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **100.0%** (66/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **83.8%** (31/37) | strictest view |

Mean seconds per answer: **3.4**. Mean request payload: **7311.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1551.7**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 8.0 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 4.6 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-L4D2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 13.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.0 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.0 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.5 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.4 |
| `A-HADES-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 3.8 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 3.2 |
| `A-CP77-01` | expert | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 2.4 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-CP77-03` | strategy | — | — | — | 0/3 | 3/3 | 3.5 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.1 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.4 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.1 |
| `A-FO4-05` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.2 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-RDR2-03` | strategy | — | — | — | 0/3 | 3/3 | 2.9 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.3 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.8 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 3.0 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 4.3 |

## Failures worth reading

- **A-L4D2-01** sample 1: missing facts: `open`
- **A-HADES-02** sample 2: missing facts: `first`
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-CP77-01** sample 1: missing facts: `damage taken`
- **A-CP77-01** sample 3: missing facts: `damage taken`
- **A-CP77-03** sample 1: spoiler fence missing, one was due
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due
- **A-RDR2-03** sample 3: spoiler fence missing, one was due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat the Glyphid Dreadnought, your main goal is to kite it between waves while focusing its weak-point armor plates when they open. Save your overclock or nuke abilities specifically for those windows where the armor breaks.
> 
> ```bonsai-cite
> [Deep Rock Galactic: Survivor / boss: Glyphid Dreadnought] (trust: fallback_no_source)
> Kite between waves; focus weak-point armor plates as they open. Save overclock/nuke for armor break windows.
> ```
> 
> The key is patience and positioning. Don't try to melt it down immediately if you can avoid it. Let the fight drag on slightly while chipping away at those exposed plates.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You're likely letting their health bars drift apart too much. When that happens, they start regenerating once you stop focusing fire evenly. Keep splitting damage between them so neither can close the gap and heal up. Also, don't waste your overclock or nuke on one while the other is still alive—save those big bursts for when both armor plates are exposed at the same time.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the currency you spend exclusively at the between-stage shop to purchase weapon upgrade cards and reroll artifact choices from the Supply Pod. It acts as a direct investment in your firepower rather than health or shield regeneration for your dwarf. If you run out of nitra, you cannot afford better weapons regardless of how much gold you've mined, so it's critical to keep mining it for whichever weapon carries the run.
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To take down the Tank in Left 4 Dead 2, you need to manage his aggression and environment carefully. First, keep him away from the ground where he can punch or throw debris; if possible, lure him into a vent so he is forced to crouch and loses mobility. Use ranged weapons like shotguns or assault rifles to chip away at his health while staying mobile. Avoid letting him get close enough to grab you, as being pinned near a drop can be fatal. If you have teammates, coordinate attacks from different angles to distract him. Always watch for his thrown debris, which can deal significant damage if not dodged. Remember that the Tank is vulnerable to sustained fire but requires patience and teamwork to defeat effectively.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch usually ignores gunfire unless you aim directly at her, but she is hyper-sensitive to light and proximity. If a flashlight beam hit her or if you (or another survivor) stood too close without noticing, she would snap into an attack state instantly. Also, if you were carrying a flare or burning something nearby, that could have triggered her aggression.
> 
> Here's what to do next:
> - Keep the team spread out so no one is within her grab range unless you're ready to fight.
> - Avoid shining lights directly at her; use darkness to your advantage when possible.
> - If she wakes up while calm, try to light a fire or throw a molotov near her to distract and damage her before she charges.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Left 4 Dead 2 Versus, the Hunter is a high-risk, high-reward survivor. Since pounce damage scales with distance (up to 25 points on a long jump), height and momentum matter more than just surprise attacks. For optimal performance, consider these adjustments:
> 
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": 1200}
> ```
> 
> **Core Tactics:**
> *   **Target Selection:** Always go for the straggler (the survivor furthest from the group). Never jump on a clustered group unless you are desperate; melee claws read as horde damage until someone checks, so isolating targets is key.
> *   **Movement:** If you must be near the main group to track them, move like a common survivor to avoid detection until you have a clear shot.
> *   **Recharge Management:** The pounce recharges fast. Holding crouch and repeatedly re-pouncing keeps pressure on the survivors without wasting cooldowns.
> 
> Remember that coaching is spoiler-minimized by default; these are routine gameplay beats for the Hunter entity, not story spoilers.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You asked about the Gels, so here is how they function in *Portal 2* without spoiling future events:
> 
> 1.  **Blue Gel (Repulsion):** This paint makes surfaces slippery and bouncy. It does not add height on its own; instead, it multiplies your fall speed. To bounce higher, you must drop from a significant height onto the blue gel. If you just jump from standing, the bounce will be minimal. You can also use two opposing blue-coated walls to "wallride" by bouncing between them repeatedly to gain altitude.
> 2.  **Orange Gel (Low Friction):** This removes friction from surfaces. It allows you to maintain your current speed indefinitely once moving. It is best used on slopes or when sliding down a ramp to reach distant portals quickly. Like the blue gel, it is useless on glass and cannot be used to climb walls unless combined with other mechanics.
> 3.  **White Gel (Portalable):** This paint allows you to create portals on surfaces that normally refuse them (like metal or certain plastics). It will not stick to cubes, turrets, or already painted surfaces. Note that the Cleansing Spray removes this paint instantly.
> 
> All three gels are ineffective if applied to glass surfaces.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Excursion Funnel is weightless travel along a beam; if it is carrying you the wrong way, look for the button that reverses it before assuming the route is shut. It passes through portals, so it can cross the whole chamber, and it ferries gel and cubes as well as you. Check your surroundings for the control mechanism to flip its vector.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with the vibration-sensitive hunters on the coast; they ignore light touch but explode when you step in loose sand. Keep your feet on rocks or solid ground to stay safe, and use the Pheropod (bugbait) from the Antlion Guard to reverse their aggression so they attack enemies instead of you. Avoid throwing the bait near your own path unless you want a swarm.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You already have consent to know about the bugbait (pheropod). To use it, simply throw the item at a group of Antlions. This action marks them as friendly toward you and hostile toward anyone else. They will then swarm your enemies instead of attacking you. Note that this only works once per group; if they reset or you leave and return, you may need to re-throw it.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun is versatile but has specific limits. It can lift debris like boxes, pipes, and concrete chunks to toss at enemies or break glass. Explosive barrels are high-priority targets for throwing back, as are sawblades which cut through zombies effectively. You can also pick up manhack drones and scanners; grenades are throwable too, even returning to your hand if missed. However, it generally cannot lift most Combine soldiers directly, though you can throw their own weapons or debris at them.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If you're looking for the most forgiving entry point, grab the Stygian Blade first. It has the longest reach and lets you keep distance easily, which is huge early on when your boons are still limited. The Shield of Chaos is a close second because blocking mistakes becomes less punishing once you get used to it. Save the Twin Fists or Heart-Seeking Bow for later; they demand tighter positioning or specific range setups that can feel overwhelming right now. Remember, weapons also have alternate aspects you can buy with Titan Blood later—don't judge them by their starting form alone.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're getting torn apart by the double-boss fight? That's a common choke point. The real issue is usually trying to kill them simultaneously or not spacing out their attacks.
> 
> Here's the fix:
> 1. **Prioritize Asterius (the Bull)**: He telegraphs his charge with a long wind-up. Sidestep it, and he gets stuck in place for a moment. This creates an opening.
> 2. **Then hit Theseus**: Once Asterius is stunned or you've dodged his charge, focus fire on Theseus. He throws spears and calls down godly strikes that are marked on the floor before they land—dodge those markers.
> 3. **Use the Shield of Chaos**: If you're struggling to survive, equip this shield. Blocking turns mistakes into nothing rather than taking damage, and it sets up a rush attack that hits hard. It's one of the most survivable weapons for this fight.
> 4. **Don't stand still**: Both bosses punish standing in place. Keep moving, especially when Theseus calls down godly powers.
> 
> If you keep dying, try killing Asterius first to reduce pressure, then finish Theseus before his next big attack comes down.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Not quite yet—this is a common point in Hades where you might expect the end, but the story continues. You've completed the core campaign, but there's more to explore: new areas like Tartarus (if available), further character arcs, and optional challenges. The Pact of Punishment also unlocks now for higher difficulty runs.
> 
> ```bonsai-spoiler
> You have defeated [[spoiler]Zeus]] as the final boss of the main story, but Hades continues with post-game content including new regions, romance conclusions, and optional challenges.
> [[/spoiler]]
> ```
> 
> Let's focus on what you can do next:
> 1. Explore new areas (like Tartarus) to uncover more secrets.
> 2. Complete remaining character arcs for full story closure.
> 3. Try the Pact of Punishment for a harder challenge.
> 4. Review any unfinished side quests or collectibles.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk Operating System is Night City's answer to a melee build that ignores time. When active, it drastically cuts incoming damage and prevents your health from dropping below 25% of your maximum. Once the effect ends, every enemy you kill immediately heals you for 25% of your max HP. The exact behavior of your melee weapons while Berserk is running depends on which specific model you installed via a Ripperdoc.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Cyberpunk 2077, your attribute choices early on lock in your build's foundation. Spreading points evenly is the worst move because perks sit behind thresholds you won't reach. You need to pick two main stats and raise them first; Technical Ability helps every build via crafting and cyberware slots, so it's a strong secondary choice for most. Body and Reflexes make a straightforward fighter that forgives mistakes, while Intelligence opens quickhacks for netrunners. Cool rewards patience but punishes being caught. If you want to avoid the "even spread" trap, commit to two mains early rather than trying to max everything later.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> The main story of *Cyberpunk 2077* concludes with multiple endings depending on your choices throughout the game, particularly regarding Johnny Silverhand and V's relationship with Arasaka. The final act involves confronting Adam Smasher and deciding V's fate—whether to live out their days in a new body, sacrifice themselves for humanity, or find an alternative solution involving the Relic. Each path reflects different themes of redemption, legacy, and what it means to be human in a world where identity is fluid.

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To defeat Adam Smasher in *Cyberpunk 2077*, you must prioritize destroying his legs first, as this disables his mobility and reduces his damage output. Equip a Sandevistan implant to slow his attacks relative to your speed, allowing you to dodge or counter more effectively. Use cover during his rocket barrages to avoid heavy damage. High DPS builds are also effective if you can keep him off balance.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to know how to kill a Deathclaw early in Fallout 4. Since you're playing on Steam Deck, keep these tips concise and controller-friendly:
> 
> - **Distance is key**: The Deathclaw has massive health and can grab you or decapitate you at low levels. Stay behind cover and use ranged weapons like laser rifles (though beware—lasers reflect off its hide) or plasma cannons.
> - **Use V.A.T.S. wisely**: Aim for the head if possible, as it's more vulnerable. Use V.A.T.S. to lock on and take shots without exposing yourself.
> - **Exploit weaknesses**: Energy weapons are less effective due to reflection, so consider ballistic weapons like .50 cal rifles or heavy machine guns for sustained damage.
> - **Environmental hazards**: Lure the Deathclaw into areas with explosives or falling debris to deal additional damage.
> 
> Remember, managing your resources and positioning is crucial when facing such a formidable opponent early on.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're looking at a tight budget of 21 points to distribute, so your first ten hours matter most. Intelligence is the quiet powerhouse here; boosting it early speeds up leveling, letting you grab perks faster than any other stat. If you want to punch or carry heavy gear, Strength plus Endurance builds a tanky survivor who forgives mistakes. For sniping and V.A.T.S., Agility with Perception lets you kill threats before they reach you. Charisma is the weakest early on but pays off later for settlements and speech. Since you can raise these later with bobbleheads and level-ups, pick what feels fun right now rather than optimizing a character you haven't met yet.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with irradiated former humans who almost never travel alone and lie in wait. Since they climb out of ductwork and windows, a room that looks clear often isn't—though one still climbing in cannot fight back yet. Their head is the reliable weakness; taking a leg stops their attack entirely, while removing both arms does not. In heavily irradiated places like the Glowing Sea, they regenerate as you shoot them, so prioritize neutralizing threats before entering those zones or use radiation-resistant gear. Avoid standing still near rubble where they might be playing dead.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Your suit likely needs a fusion core swap; draining cores disable V.A.T.S. and steady aim, leaving you over-encumbered. Check your inventory for a fresh core or find one in the wasteland. If the frame is damaged, visit a Power Armor station—either built at a settlement or found in the world—to repair and mod pieces. Upgrading costs materials based on current tier, so rank up Armorer and Science first to avoid double payments. Remember, legends with stars often heal mid-fight; don't waste resources on them early. For performance tweaks if needed: {"tdp_watts": 15, "gpu_clock_mhz": 1600}.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're spot on with your observation: that star-marked foe is a **Legendary** variant, and they absolutely will snap back to full health right around the 50% mark. This is their signature mutation, designed to punish players who dump all their ammo and caps into them early. The fight effectively doubles in length because you have to survive this second phase where they often gain an extra ability or become significantly tougher.
> 
> The key takeaway here is resource management: don't go in guns blazing on the first half. Save your best weapons, heavy ammo, and healing items for when that heal trigger fires. If you're playing on Survival mode, remember that stimpaks take 50 seconds to work and have weight, so breaking contact to heal might be necessary before engaging them again after they heal.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Welcome to Red Dead Redemption 2. Since you're coming from GTA, the biggest adjustment is that this game is slow on purpose. Arthur has weight, horses take time to turn, and picking something up is an animation rather than an instant action. Shooting your way through a town works for about ninety seconds, and then the law arrives and stays. Wanted levels do not simply expire either: a witness who sees your face turns into a bounty you pay off at a post office. Cover your face for anything illegal, ride rather than sprint, and treat camp as somewhere you go back to rather than a menu.
> 
> Where are you currently in the game? Are you just starting the prologue or already in the main story? This helps me tailor advice on pacing and resource management.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Honor shifts gradually through daily choices rather than grand gestures; avoid spoilers for story beats you haven't seen yet. Focus on consistent, low-stakes actions that compound over time.
> 
> **Daily Actions That Increase Honor:**
> *   **Greeting Strangers:** Say "hello" to people in towns or on the road, even if they aren't immediately friendly.
> *   **Helping Others:** Assist strangers in need (e.g., helping a woman carry groceries).
> *   **Paying Bounties:** Turn yourself in at a lawman when you have a bounty instead of running away.
> *   **Donating to Camp:** Give money to camp members for their needs.
> *   **Saving Animals:** Rescue animals from danger or help them recover.
> 
> **Avoid Actions That Lower Honor:**
> *   **Robbery:** Stealing from people or businesses.
> *   **Killing Civilians:** Shooting non-hostile characters.
> *   **Unnecessary Animal Killing:** Killing animals without a clear need (e.g., for food or materials).
> 
> Remember, one bad day won't undo your progress; consistency is key.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> You're asking about Arthur Morgan's fate in Red Dead Redemption 2. Since I'm sticking to spoiler-minimized coaching, I'll focus on general themes rather than specific plot points. Arthur's journey is deeply tied to his relationships and choices throughout the game. The ending reflects these developments.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Your mount is likely reacting to fear or low trust before it throws you. In RDR2, bond level directly dictates a horse's ability to handle stress; a high-bond horse stops throwing you when startled. Check if your current horse has been fed, brushed, and ridden recently—these actions raise the bond meter. If the horse is spooked by gunfire or predators, keep it at a distance and use cover (trees) while Dead Eyeing threats to calm it down. Switching mounts resets the bonding progress, so stick with one if you want stability. For performance tuning during chaotic moments, consider lowering TDP to 8 watts and GPU clock to 1200 MHz to reduce thermal throttling that might cause frame drops exacerbating motion sickness or dismounts.
> 
> ```json
> {"tdp_watts": 8, "gpu_clock_mhz": 1200}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to extend your round timer. The game gives you +15 seconds per pickup scattered around the map. Don't just rush to kill every enemy; if a fight drags on, break off and sprint to grab those pickups first. A longer round is worth more than finishing a crowd early. Late in the round, ignore everything else and hunt down rocket-launcher enemies immediately—they end runs faster than time loss does.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are looking at two distinct gameplay loops within State of Emergency, not just difficulty settings.
> 
> **Revolution Mode** is the narrative campaign. It follows a chain of missions across different zones, where objectives are handed out by the resistance to advance the story and unlock new characters and areas. This is the "story" path.
> 
> **Kaos Mode** is a score-attack challenge. In this mode, you focus on clearing a single zone at a time against a clock. You do not progress by surviving indefinitely; instead, you extend your time limit by hitting specific objectives that pop up during the riot. It tests speed and efficiency rather than narrative progression.
> 
> If you need to optimize performance for either mode while running State of Emergency, I can provide TDP/GPU adjustments if requested.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're seeing that in The Legend of Zelda: Ocarina of Time, many "missing" floors or walls in the Shadow Temple are actually invisible to your naked eye. Equip the Lens of Truth and you'll see them all clearly again. It drains magic while held, so use it in bursts rather than leaving it on constantly. Green potions and fairies inside the temple will help keep it running longer.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to take down the fire dragon, Volvagia? Here is the plan for your Steam Deck controller. First, make sure you are wearing the Goron Tunic and holding a shield with fire resistance; the lava edges will hurt otherwise. The Megaton Hammer is your main weapon here. Wait at the ledge until the dragon rises from its hole. As soon as its head breaks the surface, slam it repeatedly with the hammer to stun it. While it is stunned, you can also slash its body if you want extra damage. If Volvagia flies around the room or into the air, use your Hookshot to pull it back down to the lava floor immediately; hitting it while airborne wastes precious time. Keep moving along the ledge to avoid the fire breath and lava pools. Repeat this cycle: wait for the rise, hammer the head, hookshot if it flies, repeat until it falls. Once it is defeated, you can proceed with confidence.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Baldur's Gate 3, hoarding long rests is usually a bad idea; the game encourages you to rest whenever you can. A long rest restores your hit points, spell slots, and class abilities, which is essential for tackling tougher encounters later. Additionally, many companion romance scenes and personal quests only progress when you take a long rest at camp. Since food supplies are generally plentiful (you can pick up rations or scavenge), there's rarely a need to skip a rest unless you're specifically trying to conserve resources for a very specific tactical situation.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need four slots: one to talk, one to heal, one to handle traps/locks, and enough damage. One character often covers two roles. A common solid build is a Bard (talk + support), a Cleric or Druid (heal), a Rogue or Ranger (traps + sneak attack), and a Fighter or Paladin (damage + tank). The party you cannot cover is the one with no healing at all. Ensure your healer is present early; without one, survival drops significantly.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Painting and writing are the classic self-employed earners because they only need one skill and one object, and both scale hard with level. Gardening is slower to start and larger later. Selling collectibles funds the very early game, and a cheap starter lot leaves more for the object that earns.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To expand your crew beyond the initial seven, you need to boost your **Respect** level. This is a hard cap mechanic; without enough Respect, the game simply won't let you add more members.
> 
> You can earn Respect through several methods:
> *   **Killing rivals:** Eliminating members of rival gangs (like Ballas or Vagos) grants significant respect. Be careful not to kill your own gang members by accident.
> *   **Taking territory:** Spray graffiti tags over rival gang turf in Los Santos and San Fierro. This increases your reputation in that area.
> *   **Missions:** Completing story missions, especially those involving Grove Street or other allied factions, provides steady respect gains.
> *   **Appearance matters:** In Grove Street territory specifically, wearing green clothing and sporting a muscular build (via the gym) helps maintain or slightly boost respect. Conversely, wearing rival colors or looking weak can cause respect to drop if you linger too long in your own turf.
> 
> Once your Respect meter is high enough, new gang members will appear on the streets for you to recruit automatically.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You asked about beating Margit, so here is a spoiler-minimized guide focusing on mechanics rather than specific story beats.
> 
> To survive and damage Margit, you must manage your stamina carefully. Wait for him to finish an attack animation before dodging; timing your roll just as the hitbox appears is crucial. Keep moving to avoid his sweeping attacks and heavy strikes. Use a ranged spell or weapon if available to chip away at his health while staying out of reach. If he gets too close, dodge backward or roll under his swings. Don't hesitate to heal when safe, but try to conserve resources until you have an opening.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Dying repeatedly in Tartarus is common until you stop treating it like a boss fight and start treating it like a rhythm game. The main issue is usually running out of Darkness while stuck on one floor or getting overwhelmed by the God's power.
> 
> First, check your Mirror of Night setup. If you have Death Defiance active, you get a free revive, but if you run out of Darkness mid-run without it, you're dead. Make sure you're not hoarding too much Darkness early; spend it on buffs or healing potions when needed.
> 
> Second, look at your weapon choice. The Shield of Chaos is great for survival because blocking turns mistakes into nothing rather than reducing health. If you keep dying to enemy attacks, try switching to a shield-based build so you can rush in and hit hard without taking damage.
> 
> Third, prioritize killing Asterius first if you're facing Theseus and Asterius together. Asterius telegraphs his charge well—if you sidestep it, he gets stuck, making him easier to deal with before Theseus throws spears or calls down god powers.
> 
> If you're still struggling, try running the Tartarus solo for a few floors to see where exactly you're dying. Is it on a specific floor? Are certain enemies too strong? Let me know and I can tailor advice further.
