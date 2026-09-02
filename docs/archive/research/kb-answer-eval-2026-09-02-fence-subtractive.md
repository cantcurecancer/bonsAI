# Knowledge-base answer eval — 2026-09-02 — fence-subtractive

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `fence_subtractive` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `4.8` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **93.9%** (93/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **96.9%** (93/96) | no spoiler fence where none was due |
| Fence present when due | **88.9%** (8/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.0%** (64/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **78.4%** (29/37) | strictest view |

Mean seconds per answer: **2.6**. Mean request payload: **7171.3** bytes. Mean prompt tokens (Ollama prompt_eval): **1536.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.9 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.1 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.8 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.0 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-HL2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.2 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-HL2-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.9 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 2.3 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.0 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.8 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 3.7 |
| `A-CP77-03` | strategy | — | — | — | 2/3 | 3/3 | 3.0 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.9 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 3.4 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.7 |
| `A-FO4-05` | strategy | 3/3 | 0/3 | — | 1/3 | 3/3 | 2.1 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 2.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.6 |
| `A-SOE-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.9 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 1.3 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 1.7 |

## Failures worth reading

- **A-HL2-01** sample 3: missing facts: `rock`
- **A-HL2-03** sample 3: missing facts: `barrel`
- **A-HADES-01** sample 3: branch menu missing
- **A-CP77-02** sample 1: spoiler fence present, none due
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-FO4-02** sample 2: branch menu missing
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 2: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 3: missing facts: `twice`; spoiler fence present, none due
- **A-SOE-01** sample 3: missing facts: `pickup`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat the Glyphid Dreadnought, you need to focus your fire on its weak points as they open up.
> 
> Here are the general tactics:
> *   Kite between the waves.
> *   Focus on the weak-point armor plates as they become exposed.
> *   Save your powerful weapons, like the overclock or nuke, for when you find windows to break the armor.
> 
> If you are struggling with a specific phase or encounter, let me know.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You're running into a common issue with the Dreadnought Twins—they are designed to keep you busy by healing each other while you try to damage them.
> 
> Here is what you need to focus on:
> 
> *   **Split the Fire:** Don't focus all your damage on one ship. Spread your fire evenly between the Lacerator and the Arbalest.
> *   **Avoid Burning One Down:** If you focus too much on one, the other will just heal the gap, and you'll waste damage.
> *   **Wait for the Gap:** The key phase is when their health bars drift apart and both turn immune while they heal the gap closed. This is your window to hit them hard.
> 
> Focus on splitting the damage evenly rather than trying to burn one down completely.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource used to purchase weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the strategy for Tank.
> 
> To handle the Tank, focus on keeping distance and managing the horde. Don't try to rush him head-on if you can avoid it. If you see him throwing concrete chunks, try to slip past him rather than getting caught in the line of fire. Anything he can punch becomes a projectile, so aim for areas where you can safely shoot him. If he gets into a crouch through a vent, he becomes very slow, which gives you a chance to reposition.
> 
> If you are playing as the Tank, remember that you need to be careful where you stand. Avoid getting caught in the open if he can use his powerful punches to knock you down. Focus on taking down surrounding threats so he doesn't have easy targets.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks when she is startled. She ignores gunfire unless it's aimed directly at her, and she also ignores other infected. She wakes up if a survivor gets too close or if you use a flashlight. The growl is a warning. If you keep coming, she will charge you. Fire does slow her down, but only after she is already startled. The key is to light a wandering witch while she is calm and still moving at full speed.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus mode requires a different approach than the standard co-op experience. The key is managing your positioning and utilizing your movement mechanics effectively.
> 
> Here are some general tips for playing as the Hunter:
> 
> 1.  **Pounce Damage Scaling:** Remember that pounce damage scales with distance, reaching up to 25 on a long one. This means height and a proper run-up are more important than just relying on surprise.
> 2.  **Targeting Strategy:** Take the straggler, not the entire group. If you are forced to be near the group, move like a common player, as the melee claw reads as horde damage until someone actively checks on you.
> 3.  **Movement and Pressure:** The pounce recharges quickly. Holding the crouch button and re-pouncing repeatedly is a good tactic to maintain constant pressure on the infected.
> 
> Focus on controlling the engagement distance and using your movement to maximize the damage potential of your pounces.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are items you can use to manipulate physics in the game. There are three main types:
> 
> 1.  **Blue Gel:** This one is used for bouncing. The higher you drop onto it, the higher you bounce off. It's useful for gaining height.
> 2.  **Orange Gel:** This removes friction. If you have speed, this allows you to keep that speed when you move.
> 3.  **White Gel:** This lets you portal surfaces that couldn't be ported before. However, it won't stick to cubes or turrets, and a cleansing spray will remove it.
> 
> Which type of Gel are you interested in using or understanding better?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you in the wrong direction, you need to look for the button that reverses its direction before you assume the route is closed. Since it passes through portals, it can cross the whole chamber, but if it's misaligned, you need to reverse it.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're stuck in a sand trap. Remember, Antlions are blind and hunt by vibration, so the safest place is on the coast where the rocks are. If you're near the sand, try to move onto the rock immediately.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you obtain the Pheropod from the Antlion Guard, you throw it. The Antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun is primarily used for secondary pulls and holds, and for primary punts.
> 
> You can use it to pick up and throw several things:
> 
> *   **Secondary Pulls and Holds:** This is a key function. You can use it to pull objects toward you or hold them in place.
> *   **Explosive Barrels:** These hit quite hard when thrown.
> *   **Sawblades:** These are effective for cutting zombies apart.
> *   **Radiators:** Holding a radiator can function as a shield, allowing you to walk behind it.
> *   **Manhacks and Scanners:** These are fair game for picking up.
> *   **Loose Blades:** These can serve as ammunition for the Gravity Gun.
> *   **Thrown Grenades:** These can be thrown back where they came from.
> 
> It will not lift most enemies, but the list above covers the main interactive objects.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The easiest weapon to start with in Hades is generally the Stygian Blade. It is described as the most forgiving of the six weapons and asks the least of you in terms of difficulty to master.
> 
> The Shield of Chaos is also relatively easy because holding block turns mistakes into nothing. The Eternal Spear is the safest choice because its reach helps keep you out of trouble.
> 
> The Twin Fists of Malphon are the fastest, but they require you to stand inside everything, making them harder to manage initially. The Heart-Seeking Bow and the Adamant Rail both demand range and punish you for standing still.
> 
> Which weapon sounds like the best fit for your current playstyle?

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Focus on Asterius first. He telegraphs a long charge; sidestep it to get him stuck briefly. Then, use Theseus's attacks, which are marked on the ground before they land.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game in Hades does not have a single, definitive "ending" in the traditional sense. Completing the main story and defeating the major bosses is just the middle of the journey. The game is designed to be replayable, and you continue to play to unlock new rewards and challenges.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a mechanic in Cyberpunk 2077 that functions as a type of operating system or implant. It is primarily used by melee combatants and has two main effects:
> 
> 1.  **Damage Mitigation:** It cuts the damage you take.
> 2.  **Health Management:** It prevents your health from falling below a quarter (25%) of your maximum health. Furthermore, every enemy you put down returns a quarter of your maximum health to you.
> 
> The specific effects of the Berserk system can depend on the model installed on it.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> For a first playthrough, focusing on Body and Reflexes is generally recommended. These attributes make you a straightforward fighter, which helps forgive mistakes when you're new to the game.
> ```

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story ending in Cyberpunk 2077 involves significant choices made throughout the game, particularly concerning your Lifepath (Nomad, Streetkid, or Corpo). The final outcome is heavily dependent on which path you chose and the specific narrative threads you pursued.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output. Utilize a Sandevistan or a high DPS build. Prioritize destroying his legs early on, and make sure you have cover while he's unleashing his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To deal with a Deathclaw early on, remember that it has very high health and is resistant to almost everything. The key is to manage distance and use cover.
> 
> 1.  **Avoid Direct Confrontation:** Don't try to run straight at it unless you have a massive advantage or are using specific abilities.
> 2.  **Use the Environment:** Look for ways to keep it at a distance. Use the terrain, cover, and any environmental hazards to slow it down or force it into a predictable pattern.
> 3.  **Stagger and Damage:** The Deathclaw has a ground stomp and headbutts to stagger you. If you can manage to get in close enough to land a solid hit, focus on dealing damage rather than trying to tank its massive health bar.
> 4.  **Be Wary of Range:** If you are too close, it can kill you outright with a grab or a decapitation. Use ranged weapons or traps if possible.
> 
> Focus on positioning and chipping away at its health rather than trying to overpower it immediately.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about starting SPECIAL stats in Fallout 4, remember you get one point in each of the five stats, and you have 21 points to spend, meaning you start with 28 total points. The early game is about having a balanced start so you can survive and get some decent perks.
> 
> Intelligence is a solid choice because it boosts how fast you level up, which means you get access to other perks sooner. Strength paired with Endurance makes you a good melee or heavy weapons survivor, forgiving mistakes. Agility with Perception sets you up for a sniper or V.A.T.S. build, letting you kill things before they can hurt you. Charisma is the weakest early stat, but it's crucial later for settlement and speech perks.
> 
> For the first ten hours, focus on picking a stat that makes leveling enjoyable for you, rather than trying to optimize a perfect build.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Feral Ghouls are fast, irradiated former humans. They deal radiation damage and physical damage. A reliable tactic is to target their heads; taking a leg off one will stop it from attacking altogether, but taking both arms off does not stop the attack. They can be found lying around in rubble or climbing out of ductwork and windows.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor has stopped working, check a few things. First, make sure you have enough fusion core energy. The frame runs on a fusion core that drains over time and drains faster when you sprint or use V.A.T.S. If it runs out, you can still walk, but you will lose V.A.T.S. and steady aim, and you'll be over-encumbered.
> 
> Next, check if you have any mods installed that might be conflicting with the game's mechanics. Sometimes mods can interfere with core systems.
> 
> If the issue persists, you might need to repair it at a power armor station or build a new one at a settlement. Remember that upgrading a piece costs the same materials regardless of your current tier, so it's usually worth waiting until Armorer and Science are ranked up before paying for the later models, as their materials are rarer.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": 1200}
> ```

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The legendary enemies in Fallout 4 are tough because they have a mutation: when they get around half their health, they heal themselves completely and gain a new ability. They also drop gear, which is how you get good stuff. Spending all your health on them in the first half is a mistake.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It's a different kind of slow. Think of it less like a sprint and more like a deliberate grind. Arthur has weight, and everything takes time—turning a horse, loading a weapon, or even just walking into a town.
> 
> Here are a few starting points:
> 
> 1.  **Patience is Key:** Don't try to rush things. If you're trying to get from point A to point B quickly, you'll likely get bogged down in the slow animations and environmental interactions. Take your time to observe how the world reacts.
> 2.  **Wanted System:** The law doesn't just disappear when you leave an area. If you cause trouble, that bounty stays put, and more people will show up. If you're trying to move through a town, try to keep your actions low-key or use cover if you have it.
> 3.  **Camp Management:** Treat your camp like your base. Make sure you have enough supplies and stable upkeep before you venture out on a long hunt.
> 
> Where are you at in the game right now?

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising honor in Red Dead Redemption 2 is about how you interact with the world and the people in it. It's not a single action, but rather a collection of choices you make throughout your gameplay.
> 
> The core idea is that your honor is a slider, not a fixed stat. It changes based on the actions you take.
> 
> Here are the main ways to increase your honor:
> 
> 1.  **Help Strangers:** Act kindly toward people who are in need. This could involve offering aid, giving them resources, or simply showing them respect.
> 2.  **Pay Bounties Instead of Running:** When you encounter a bounty, instead of trying to evade it, paying the bounty is a sign of respect and adherence to the law, which positively affects your honor.
> 3.  **Donate to the Camp:** Contributing resources or time to the needs of the camp or other community members can boost your standing.
> 4.  **Avoid Certain Actions:** Conversely, actions like robbing people or killing civilians and animals you don't use will lower your honor.
> 
> Essentially, the game tracks these interactions. A high honor level means you get shop discounts and different reactions from various NPCs. Keep making choices that demonstrate respect and community involvement, and your honor will trend upward.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of Red Dead Redemption 2 is quite complex and involves Arthur's final choices and the consequences of his actions throughout the game.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If your horse keeps throwing you off, it's usually related to the bond level or the horse's temperament.
> 
> Here is what you need to know about horse bonding in the game:
> 
> *   **Bond Level Matters:** The bond level is what makes a horse feel different. Riding, feeding, brushing, patting, and calming it during danger all raise it. Higher bond levels grant you better handling, increased stamina, and eventually allow you to perform maneuvers like the rear and the drift.
> *   **Spook Factor:** A high-bond horse will stop throwing you when something scares it.
> *   **Horse Breeds:** Different breeds have different traits. Draft horses carry more weight and panic less but are slow. Racing breeds are quick and fragile. Arabians and war breeds are noted for being worth saving, though an Arabian can bolt easily until its bond is established. Early on, the bond matters more than the stat line; a bonded horse handles better and responds to whistles from further away.
> 
> To improve this, focus on spending time with the horse at camp, riding with it, and using calming actions.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on extending the time rather than just surviving the crowd.
> 
> Here are the main ways to extend your round:
> 
> *   **Use Pickups:** The most direct way is to actively seek out and collect the scattered pickups. Each pickup adds 15 seconds to your round timer.
> *   **Prioritize Objectives:** If you are in Kaos mode, focusing on hitting objectives that pop up mid-riot will extend the time more effectively than just trying to survive the immediate fight.
> 
> When you are fighting enemies, try to be efficient. If you focus too much on fighting and not enough on collecting items or objectives, the round will end quickly.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock within a single zone. The objective here is to extend the time by hitting objectives that pop up mid-riot, rather than focusing on survival.
> 
> Revolution mode, conversely, centers around the story. This mode involves a chain of missions per zone where objectives are handed out by the resistance, and this is where characters and zones are unlocked.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Shadow Temple has floors missing everywhere. You need to equip the Lens of Truth and the invisible floors. Hold the Lens of Truth to see the missing floors, walls, and chests. Be careful, holding the Lens drains magic, so use it in short bursts. Green potions and the fairies in the temple will help keep the magic up.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Volvagia, you need to use the Megaton Hammer effectively. When the fire dragon pops out of the floor holes, hit its head the moment it comes up, and then slash while it is stunned. If it flies around the room, use the hookshot to pull it back down. You'll need the Goron Tunic and a shield for fire protection, and make sure to stay away from the lava at the edges of the arena.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Long resting more often is a choice, not a rule. It depends entirely on what you are trying to achieve.
> 
> If you are trying to advance the main story or get more story content, resting is important because it advances companion scenes and personal quests. Hoarding rests means you might miss out on those narrative moments.
> 
> If you are low on supplies or need to recover spells and abilities, then resting is necessary. Supplies are generally plentiful, so you won't run out of food quickly.
> 
> The general advice is: rest when you are tired, or when you need to recover resources. Don't feel like you have to rest just because you can.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you want a balanced party that covers the core needs: talking, healing, utility (traps/locks), and damage.
> 
> A solid starting template involves:
> 1.  **Talker/Face:** Someone like a Bard or Paladin to handle dialogue and social encounters.
> 2.  **Healer:** A Cleric or Druid is essential for keeping the party alive.
> 3.  **Utility/Skill Monkey:** A Rogue or Ranger is good for dealing with traps, picking locks, and scouting.
> 4.  **Damage/Tank:** A Fighter or Barbarian provides the necessary frontline damage and survivability.
> 
> You cannot cover everything perfectly with one person, so ensure you have at least one dedicated healer and one dedicated utility character. If you lack a dedicated healer, you risk the entire party dying quickly.
> 
> If you are struggling with specific encounters, let me know.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to make money early in The Sims 4 generally involves focusing on skills that require minimal upfront investment and high scaling potential.
> 
> Based on general gameplay mechanics:
> 
> 1.  **Painting and Writing:** These are classic self-employed earners. They only require one skill and one object, and both scale significantly with level.
> 2.  **Selling Collectibles:** This is often cited as a good way to fund the very early game, especially if you can acquire cheap starter lots.
> 
> Gardening is generally slower to start and requires more initial setup, so prioritize the skill-based options mentioned above for the quickest cash flow.
> 
> ```bonsai-cite fallback_no_source```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in San Andreas is tied to the Respect mechanic. You can recruit up to seven gang members, depending on your actions.
> 
> You gain respect through several activities:
> *   Completing missions.
> *   Killing rival gang members and police.
> *   Taking territory and spraying over tags.
> *   Appearance nudges, such as wearing green in Grove Street territory, or having the correct hair, tattoos, and clothes.
> 
> Losing respect happens if you wear the wrong colors at home, kill your own gang members, or lose turf.
> 
> ```bonsai-cite wiki_no_patch
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're asking about beating Margit, I'll focus on the general strategy for that encounter. Margit is a tough boss that tests your stamina and attack timing.
> 
> The key is to manage your stamina carefully. You need to dodge her heavy attacks, especially the big swings, and focus on hitting her weak points when she's recovering or vulnerable. Don't just spam attacks; use your dodges to keep her off balance. Try to keep your own stamina high enough to maintain your dodging rhythm.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're stuck dying in Tartarus, we need to focus on survivability and managing those tough encounters. The key is usually mastering the combat rhythm and knowing when to play safe versus when to push for damage.
> 
> For general survival, try focusing on blocking when you are low on health. As noted in the knowledge base, holding block turns a mistake into nothing, and it sets up a rush that can close the distance and hit hard. It's about being defensive when you can't afford to be aggressive.
> 
> When facing specific bosses or areas, we need to know what you are dealing with. Are you struggling with a particular section, or are you just having trouble surviving the general waves?
