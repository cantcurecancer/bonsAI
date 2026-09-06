# Knowledge-base answer eval — 2026-09-06 — before-wave1

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.06` |
| corpus_sections | `266` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `3.5` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **92.9%** (92/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **93.8%** (90/96) | no spoiler fence where none was due |
| Fence present when due | **88.9%** (8/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **100.0%** (66/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **78.4%** (29/37) | strictest view |

Mean seconds per answer: **1.9**. Mean request payload: **7327.1** bytes. Mean prompt tokens (Ollama prompt_eval): **1569.3**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 7.1 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.1 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.9 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.2 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.6 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.9 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.1 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.1 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.0 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 2.7 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 2/3 | 3/3 | 2.2 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.8 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 1/3 | 3/3 | 2.5 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 1.3 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.0 |
| `A-FO4-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.1 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.5 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 0/3 | 3/3 | 1.1 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 1.2 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.1 |
| `A-OOT-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.2 |
| `A-BG3-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.3 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.1 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 1.2 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 1.1 |

## Failures worth reading

- **A-DRG-01** sample 3: missing facts: `kite`
- **A-HADES-01** sample 1: spoiler fence present, none due
- **A-HADES-03** sample 1: spoiler fence missing, one was due
- **A-HADES-03** sample 3: missing facts: `not the end`
- **A-CP77-02** sample 2: spoiler fence present, none due
- **A-CP77-02** sample 3: spoiler fence present, none due
- **A-FO4-01** sample 1: missing facts: `energy`
- **A-FO4-05** sample 1: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 2: spoiler fence present, none due
- **A-FO4-05** sample 3: missing facts: `twice`; spoiler fence present, none due
- **A-OOT-02** sample 2: missing facts: `megaton hammer`
- **A-BG3-01** sample 2: missing facts: `companion`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat the Glyphid Dreadnought, focus on its armor plates. When it starts attacking, try to kite it, meaning you keep moving away from it while still shooting. Save your powerful weapons, like the nuke, for when you see the armor start to break open.
> 
> If you are facing the Dreadnought Twins, remember that they are two separate targets. Let their health bars drift apart, and both will turn immune while they try to close the gap. Split your fire evenly between them instead of focusing all your damage on one.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Dreadnought Twins are tough because they heal each other while you try to damage them. The key is to split your fire evenly between them so you don't let one of them get completely overwhelmed while the other heals.
> 
> Here are the main points:
> *   Let their health bars drift apart.
> *   Both will turn immune while they heal the gap closed.
> *   Focus on splitting the fire evenly; don't burn one down too fast.
> *   Remember that the healing never starts unless you focus all your damage on one of them.
> 
> If you are struggling with the timing, try kiting between them to keep pressure on both simultaneously.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource you use to purchase weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Tank is a tough encounter. The key is to avoid getting caught in the open where he can throw concrete projectiles. Try to slip past him, especially if you can get behind him through a vent, as he is barely mobile when he crouches. If you are fighting him in the open, focus on taking his punches rather than trying to dodge them, as a punch taken near a drop kills rather than knocks you down.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks because she is looking for a threat. She ignores gunfire unless it's aimed directly at her, and she ignores other infected. What usually wakes her up is a survivor standing too close or a flashlight. If you start shooting at her, she might just ignore you. If you want to fight her, try to keep your distance and aim for her when she's not startled. If you manage to start her off, fire will slow her down, but only if she's already startled.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus involves managing your distance and positioning relative to the horde.
> 
> *   **Pounce Damage Scaling:** Remember that pounce damage scales with distance, reaching up to 25 on a long one. This means height and a good run-up are more important than just surprise.
> *   **Targeting Strategy:** Take the straggler, not the entire group. If you must be near the group, move like a common player; the melee claw reads as horde damage until someone checks on you.
> *   **Re-pouncing:** The pounce recharges relatively fast, so holding crouch and re-pouncing keeps pressure on the enemies.
> 
> This is based on general knowledge regarding the Hunter mechanic in the game.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are basically physics tools you can use to move or manipulate objects in the game. There are three main types:
> 
> 1.  **Blue Gel:** This one is used for bouncing. The higher you drop onto it, the higher you bounce off. It's useful for gaining vertical height.
> 2.  **Orange Gel:** This one removes friction. If you coat something with this and then move it, it will keep the speed you had when you touched it.
> 3.  **White Gel:** This one lets you portal surfaces that normally wouldn't work. However, it won't stick to things like cubes or turrets, and you need a cleansing spray to remove it.
> 
> Which type of Gel are you trying to figure out how to use?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, it means it is carrying you in the incorrect direction relative to the portal it is entering. You need to look for the button that reverses the direction of the funnel before assuming the route is closed.
> 
> ```bonsai-cite wiki_no_patch```

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're running into the classic coastal hazard. The Antlions are blind and hunt by vibration, so the safest bet is to stay on the rocks and avoid the sand where they spawn.
> 
> If you are near the coast, try moving onto the rocks. If you are in an area where they have already spawned, you might need to use the Pheropod to make them swarm something else.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the bugbait, you first need to acquire it. You get the pheropod from the Antlion Guard. Once you have the pheropod, you throw it, and the antlions will read you as a guard, causing them to swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun is primarily used for manipulating objects in the game world. Based on the available data, here is what it can generally interact with:
> 
> *   **Secondary Pulls and Holds:** You can use it to pull and hold various objects in the environment.
> *   **Primary Punts:** It is used to throw objects at enemies or other parts of the environment.
> 
> Specific items and enemies that can be manipulated include:
> 
> *   **Explosive Barrels:** These are noted as being among the things that hit the hardest when thrown.
> *   **Sawblades:** These can be used to cut zombies apart.
> *   **Radiators:** Holding a radiator can function as a shield that you can walk behind.
> *   **Manhacks and Scanners:** These are fair game for picking up or throwing.
> *   **Grenades:** These can be thrown back where they came from.
> *   **Loose Blades:** These are mentioned as being usable as gravity gun ammunition.
> 
> It is important to remember that it is not capable of lifting most enemies.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> The easiest weapons to start with are the Stygian Blade and the Shield of Chaos. The Stygian Blade is the most forgiving overall, and the Shield of Chaos makes mistakes less punishing because blocking negates damage.
> ```

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Focusing on how to manage the dual threats from Theseus and Asterius. Asterius, the bull, telegraphs a long charge, so try to sidestep that charge to get a brief window where he's stuck. Theseus, on the other hand, calls down god's power, which is marked on the ground before it lands. Most runs suggest that taking down Asterius first is the better approach because he is more predictable.
> 
> If you are struggling, consider using the Shield of Chaos. Holding block turns a mistake into nothing, and it also sets up a rush that closes the distance and hits hard. It's a good pick when you keep dying.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> It sounds like you've cleared the final challenge, but the game continues. In Hades, beating the final boss is just the start of the journey. The game is designed to let you continue playing and unlocking new content and challenges.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a mechanic in Cyberpunk 2077 that functions as a form of damage mitigation and health management. It operates in the following manner:
> 
> 1.  **Damage Reduction:** It cuts the damage you take.
> 2.  **Health Floor:** It prevents your health from dropping below a quarter of your maximum health.
> 3.  **Health Recovery:** After you defeat an enemy with Berserk, you regain a quarter of your maximum health.
> 
> The specific effects of Berserk on your melee weapons depend on the model of the cyberware installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The decision on attributes in Cyberpunk 2077 depends entirely on the playstyle you want to adopt. You're essentially deciding whether you want to be a pure combat specialist, a stealth/hacker focused netrunner, or something in between.
> 
> For a straightforward fighter, I recommend putting points into Body and Reflexes. These two attributes make you a solid, reliable combatant and help you forgive mistakes in the heat of a fight.
> 
> If you lean into the netrunning route, Intelligence is key. Quickhacks are your primary tool, and you want that to be as fast as possible before you get into direct confrontation. However, be aware that if you rely too much on Intelligence, you will be fragile once a fight actually starts.
> 
> Technical Ability is the quiet workhorse. It helps with crafting and unlocking the specific cyberware you actually want, which is crucial for building a customized build. Cool rewards patience and stealth, and it punishes you if you get caught in the open.
> 
> The general advice is that spreading points evenly is usually the worst choice, as the perks worth having are often locked behind attribute thresholds.
> 
> Since you haven't specified a build yet, I can't give you a definitive answer. We need to figure out what kind of character you want to be.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story in Cyberpunk 2077 has multiple endings depending on your Lifepath choices and major narrative decisions. The game doesn't have one single definitive ending, but rather several paths that lead to different outcomes for V.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, you need to focus on high damage output. The general advice is to use a Sandevistan or a high DPS build and prioritize destroying his legs first. You should also utilize cover during his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To take down a Deathclaw early, you need to focus on distance and cover. Don't engage them head-on unless you're prepared for massive damage.
> 
> Here are the basic steps:
> 
> 1.  **Use Cover:** Find plenty of cover. The Deathclaw is very tough, so you need to avoid getting hit.
> 2.  **Wait for the Right Moment:** They open with a roar and a ground stomp. Wait for them to stomp or move away from you.
> 3.  **Target Weak Points (If Possible):** While their hide is tough, look for openings. If you have a weapon that can exploit specific areas, use it.
> 4.  **Manage Distance:** Keep your distance. If you get too close, they can use their massive grabs or decapitations to finish you off quickly.
> 
> Remember, raw damage isn't your friend against them early on. Focus on survival and using the environment to your advantage.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It's the early game, so don't stress too much about the absolute perfect build right away. The key is to focus on what makes you feel good in combat and exploration.
> 
> For your starting points, here is a quick breakdown:
> 
> *   **Intelligence (INT):** This is often recommended. It directly affects how fast you level up, which means you get those crucial perks sooner. It's a quiet strength that makes everything else easier.
> *   **Strength (STR) with Endurance (END):** This combination makes you a solid frontline fighter or heavy weapons user who can take a beating and keep going. Good for those early encounters.
> *   **Agility (AGI) with Perception (PER):** This path is for the sniper or stealthy character. Perception helps you spot enemies before they can react, and Agility helps you dodge or move quickly.
> 
> Remember, you start with one point in each, and you get 21 to spend, totaling 28 points. Don't worry about maxing them immediately; focus on getting the perks that make the gameplay enjoyable right now.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If Feral Ghouls are swarming you, the most reliable tactic is to target their heads. Taking a leg off one of them will stop it from attacking altogether, though taking both arms off does not stop the attack. They deal radiation damage as well as physical damage, and if you are in heavily irradiated areas like the Glowing Sea, you can regenerate if you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor suddenly stopped working, check a few things. First, ensure you have enough power in your fusion core. It drains faster when you sprint or use V.A.T.S. If the core is empty, you can still walk, but you will lose V.A.T.S. and steady aim, and you'll be over-encumbered.
> 
> Second, check if you have any active mods or if there's a corruption issue. Sometimes mods can interfere with core mechanics.
> 
> Third, if you are dealing with a specific bug, sometimes a hard restart of the game or the Steam Deck can resolve temporary glitches.
> 
> If you are looking to improve power armor performance, remember that upgrades are usually best done at an Armorer and Science station, as the materials required for later models are often rare.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> The enemy you are referring to is a Legendary enemy in Fallout 4. These creatures have a specific mechanic: when they drop to about half their health, they instantly heal back to full health and gain a new ability. This means you should not spend all your resources on the first half of the fight; you need to manage your damage to keep them at a lower health threshold or use tactics that exploit this healing mechanic.
> ```

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Look, coming from GTA means you're used to a different pace. This game is slow on purpose. Arthur has weight, and everything takes time—like turning a horse or picking up an item. Shooting your way through a town will only get you so far before the law shows up.
> 
> The main things to remember right now are:
> 1. Ride, don't sprint.
> 2. Treat your camp like a home base, not just a place to sleep.
> 3. Be mindful of the law; if you do something illegal, wear a mask to keep bounties smaller.
> 
> Since you just arrived, you need to decide where to focus your immediate attention.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is about how you interact with the world and the people in it. It's not a simple stat you can just increase; it's a slider influenced by your actions.
> 
> Here are the main ways to raise Honor:
> 
> 1.  **Be Helpful:** Greeting people, helping strangers on the road, and generally being cooperative with the community contributes positively to your Honor.
> 2.  **Pay Bounties:** Choosing to pay bounties instead of immediately running from them shows a level of respect and commitment to the law.
> 3.  **Avoid Unnecessary Violence:** Killing civilians or animals you don't need to, or engaging in excessive robbery, will decrease your Honor.
> 4.  **General Conduct:** Your overall conduct in the game, including how you treat NPCs and your choices in situations, affects this value.
> 
> Think of it as a continuous process. One bad day doesn't erase a good one, but consistent positive actions build up your standing.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The story has a definitive ending where Arthur's fate is sealed by his choices and the events of the game.
> ```
> The ending is quite complex, and what happens to Arthur really depends on how you play the game and what decisions you make throughout the narrative. It's not a single, simple outcome.
> 
> For now, we need to figure out where you are in the story so I can give you the right advice.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse bonding is key here. If your horse is throwing you off, it likely means the bond level isn't high enough for the situation, or the horse is spooked.
> 
> To improve handling:
> 1.  **Riding and Interaction:** Riding, feeding, brushing, and patting the horse will raise its bond level.
> 2.  **Danger Management:** Calming the horse during danger is crucial. A high-bond horse will handle better and will stop throwing you when something scares it.
> 
> If you are dealing with a specific horse breed, remember that their natural tendency to spook can factor in, but early on, the bond matters more than the stat line.
> 
> ```bonsai-cite Red Dead Redemption 2 / mechanic: Horse bonding (trust: fallback_no_source)```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Getting more time in a round is about managing your pace. You gain time by not getting bogged down in fights and instead focusing on completing objectives or surviving longer.
> 
> Here are the main ways to extend your round:
> 
> *   **Focus on Time Pickups:** The game has pickups scattered around the level that add +15 seconds each. Prioritize these over engaging in prolonged fights.
> *   **Pacing:** Don't stay in a fight if you know you are going to lose. Breaking off and going for time is often better than trying to finish a crowd.
> 
> The core idea is to treat the round timer as a resource you need to manage, not just a countdown to a fight.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Revolution mode is the story-driven aspect of the game, featuring a chain of missions per zone with objectives handed out by the resistance, which is where characters and zones unlock. Kaos mode is a score attack against a clock in one zone at a time, where you extend the time by hitting objectives that pop up mid-riot rather than by surviving.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are looking for the missing floors in the Shadow Temple. The key is to use the Lens of Truth and the invisible floors. Hold the Lens of Truth to see the invisible floors, walls, and chests. Be careful, holding it drains magic, so use it in short bursts and keep your green potions handy to keep the magic flowing.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To deal with Volvagia, you need to use the Megaton Hammer. Hit the head the moment it pops up, and then slash while it is stunned. If it flies around the room, use the hookshot to pull it back down. Make sure you have the Goron Tunic and a shield for protection, and stay clear of the lava at the edges of the area.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Resting more often depends entirely on what you are trying to achieve. Long rests are a big commitment. They cost you supplies, and you have to manage what you're carrying. They are also what advances companion scenes and personal quests. If you hoard rests, you might miss story moments.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run in Baldur's Gate 3, you generally want a party that covers the core needs: talking, healing, utility/traps, and damage.
> 
> A solid starting composition often looks like this:
> 
> 1.  **Talk/Social:** A Bard or a Paladin. They handle dialogue checks well.
> 2.  **Healer:** A Cleric or a Druid. You need someone reliable to keep the party alive.
> 3.  **Utility/Skill:** A Rogue or a Ranger. They are good for finding and disarming traps, and they often cover some damage needs too.
> 
> The key is ensuring you don't leave a gap. If you lack a dedicated healer, you must compensate with a character who can provide some form of support or self-sustain.
> 
> If you are struggling with specific encounters, let me know.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest ways to make money early in The Sims 4 generally revolve around low-effort, high-return activities that scale well.
> 
> 1.  **Painting and Writing:** These are classic self-employed earners. They require only one skill and one object, and both scale hard with level.
> 2.  **Selling Collectibles:** Funds generated from selling items can provide a quick injection of cash early on, especially if you have access to a cheap starter lot to maximize space for other activities.
> 3.  **Gardening:** While slower to start, this can become a reliable income source as your garden matures.
> 
> Focusing on painting or writing will likely give you the quickest consistent income stream based on the game mechanics.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in Grand Theft Auto: San Andreas - The Definitive Edition is governed by the Respect mechanic. You can recruit between one and seven gang members. This is achieved through several methods:
> 
> *   Completing missions.
> *   Killing rival gang members and police.
> *   Taking territory.
> *   Spraying over tags.
> *   Appearance nudges, such as hair, tattoos, clothes, muscle, and wearing green in Grove Street territory.
> 
> Losing turf or wearing the wrong colors at home will cause the respect level to fall, which can negatively impact your ability to recruit.
> 
> ```bonsai-cite wiki_no_patch```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You are asking how to beat Margit. That's a specific challenge.
> 
> To give you the best advice, I need a little more context. Are you currently in the area where you encounter her, or are you trying to figure out the general strategy for the fight?
> 
> Since you're asking about Margit, I'll focus on the general approach. In this game, the key to beating her usually involves managing your stamina carefully and focusing on dodging her heavy attacks. You need to learn her attack patterns—when she winds up for a big swing or a jump—and use your dodge mechanic to avoid the damage.
> 
> If you can tell me what stage you are at, I can give you more specific tips on positioning and which abilities to prioritize.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> ```bonsai-spoiler
> Since you're stuck dying in Tartarus, we need to focus on maximizing your survivability and managing the waves. A key strategy is mastering the Shield of Chaos. Remember, holding block turns a mistake into nothing rather than just reducing the damage, and it also sets up a rush that closes distance and hits hard. It's your best bet for defense and offense combined.
> ```
