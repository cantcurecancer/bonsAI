# Knowledge-base answer eval — 2026-09-02 — shipped-fence-fix

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `2.3` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **91.9%** (91/99) | every must-mention group found in the reply |
| No contradiction | **88.9%** (8/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **94.8%** (91/96) | no spoiler fence where none was due |
| Fence present when due | **100.0%** (9/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **98.5%** (65/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **75.7%** (28/37) | strictest view |

Mean seconds per answer: **1.3**. Mean request payload: **7162.5** bytes. Mean prompt tokens (Ollama prompt_eval): **1534.8**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.1 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.1 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.5 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.5 |
| `A-HL2-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.3 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0.9 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.0 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 1.9 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 1.1 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 2/3 | 2/3 | 1.7 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 1.5 |
| `A-FO4-05` | strategy | 3/3 | 2/3 | — | 0/3 | 3/3 | 1.1 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 1.0 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-SOE-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 1.6 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-OOT-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.3 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 1.4 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 1.3 |

## Failures worth reading

- **A-DRG-01** sample 2: missing facts: `kite`
- **A-HL2-03** sample 2: missing facts: `barrel`
- **A-HADES-03** sample 1: missing facts: `not the end`
- **A-CP77-02** sample 2: spoiler fence present, none due
- **A-FO4-02** sample 2: spoiler fence present, none due
- **A-FO4-02** sample 3: branch menu missing
- **A-FO4-04** sample 1: said: `training perk`
- **A-FO4-05** sample 1: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 2: spoiler fence present, none due
- **A-FO4-05** sample 3: spoiler fence present, none due
- **A-SOE-01** sample 1: missing facts: `pickup`
- **A-SOE-01** sample 2: missing facts: `pickup`
- **A-SOE-01** sample 3: missing facts: `pickup`
- **A-OOT-02** sample 2: missing facts: `megaton hammer`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To deal with the Glyphid Dreadnought, you need to focus on its armor plates.
> 
> *   **Kite between waves:** Keep moving around it to manage the incoming fire.
> *   **Focus weak points:** Target the armor plates that open up.
> *   **Save powerful weapons:** Hold onto your overclock or nuke abilities for when you can break through that armor.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Reviewing the strategy for the Dreadnought Twins. The key here is splitting the fire evenly, so you don't burn one down too fast while the other heals the gap. The healing mechanic never starts, so focus on managing the damage output between them.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource you use to buy weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the strategy for the Tank in Left 4 Dead 2.
> 
> The Tank is a big threat because he throws concrete chunks. The key is to avoid being hit by his projectiles and focus on getting past him.
> 
> Here are the main points for dealing with him:
> 
> 1.  **Stay Clear of Projectiles:** When he is up, the director stops sending out common and special attacks. This means you have a window where you need to slip past him.
> 2.  **Fight in the Open:** Anything he can punch becomes a projectile with more reach than his fists. Try to fight him in open areas where you can use your guns effectively.
> 3.  **Avoid Being Knocked Down:** A punch taken near a drop kills rather than just knocking you down. Be careful about where you position yourself relative to him.
> 4.  **Use the Environment:** If the route forces him to crouch through a vent, he becomes very slow and less mobile, which gives you an opening.
> 
> Remember, the Tank is tough, but you need to manage your positioning and use the environment to survive his attacks.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The witch doesn't usually attack randomly. She waits for a specific trigger.
> 
> She will ignore gunfire that isn't aimed directly at her and will ignore other infected. What wakes her up is usually a flashlight or a survivor standing too close. The growl you hear is a warning—back off. If you keep coming and she gets startled, she will stand up, flail, and charge whoever is closest.
> 
> If you want to keep her calm and force her to attack, you need to light a wandering witch while she is still calm. If you manage to burn her down, she will switch to whoever burned her, not necessarily the person who woke her up.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus requires a different approach than in Survival. Since the focus shifts to direct confrontation and map control, your movement and engagement style need to be more aggressive.
> 
> Here are some tips:
> 
> 1.  **Master Pouncing Mechanics:** The Hunter's pounce damage scales with distance, up to 25 on a long one. Focus on using your height and a proper run-up to maximize this damage rather than relying solely on surprise.
> 2.  **Prioritize Target Selection:** In Versus, you are fighting other players. Be aware of the positioning of the other Hunters and survivors. Take the straggler, not the entire group, unless you are certain you can handle the immediate threat.
> 3.  **Manage Engagement Range:** Understand the range at which your melee claw registers as horde damage. If you are forced to be near the group, move like a common player and wait for the melee claw check to trigger before initiating contact.
> 4.  **Maintain Pressure:** The Hunter's pounce recharges quickly. Holding the crouch and re-pouncing repeatedly is key to maintaining constant pressure on your targets, especially when trying to secure kills quickly in Versus.
> 
> Focus on aggressive positioning and efficient use of the pounce mechanic to dominate the engagement.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are items you can pick up in the game that change how you interact with surfaces or movement. There are three main types:
> 
> *   **Blue Gel:** This one is for bouncing. The higher you drop onto it, the higher you bounce. It's useful for gaining height.
> *   **Orange Gel:** This one removes friction. It lets you keep the speed you have when you land on it.
> *   **White Gel:** This one lets you portal a surface that couldn't be ported before. However, it won't stick to cubes or turrets, and you need a cleansing spray to remove it.
> 
> Which type of Gel are you interested in learning more about?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, you need to look for the button that reverses its direction before you assume the route is shut. Since it passes through portals, it can cross the whole chamber, and it ferries gel and cubes as well as you.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": 1200}
> ```

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're stuck on the coast where the sand is dangerous. Remember, Antlions are blind and hunt by vibration. The rocks are safe, and the sand is where they come up. Try to stay on the rock formations when you move along the coast.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you have the pheropod from the Antlion Guard, throw it. It will cause the Antlions to reverse and read you as a guard, leading them to swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw various items in Half-Life 2. Based on the local knowledge base, here are some examples:
> 
> *   **Secondary pulls and holds:** You can use the gun to pull and hold secondary items.
> *   **Primary punts:** It is used for throwing items.
> *   **Explosive barrels:** These hit hard when thrown.
> *   **Sawblades:** These are used to cut zombies apart.
> *   **Radiators:** A held radiator can function as a shield you can walk behind.
> *   **Manhacks and scanners:** These are fair game for pickup.
> *   **Grenades:** Thrown grenades can return to where they came from.
> 
> The local knowledge base also mentions that loose blades are gravity gun ammunition.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The easiest weapons to start with are generally the Stygian Blade and the Shield of Chaos. The Stygian Blade is the most forgiving, and the Shield of Chaos is easy because blocking turns mistakes into nothing. The Eternal Spear is also safe due to its reach. The Twin Fists of Malphon are the fastest but require you to stand inside everything.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're struggling with the fight against Theseus and Asterius. The key here is managing both of them at the same time. Asterius, the bull, telegraphs a long charge, so you need to sidestep that move to avoid getting stuck. While you're dodging him, Theseus will call down a god's power, which you need to watch for on the ground before it lands.
> 
> The general advice is to try and take down Asterius first because he's more predictable.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game does not end after beating the final boss. You are now in the post-game content, which involves continuing the run and unlocking further rewards by managing your Heat level.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a mechanic in Cyberpunk 2077 that functions as a form of damage mitigation and resource generation. It has two main effects:
> 
> 1.  **Damage Reduction:** It cuts the damage you take.
> 2.  **Health Regeneration:** It will not let your health fall below a quarter of your maximum health. Furthermore, every enemy you put down returns a quarter of your maximum health to you.
> 
> The specific effects of the Berserk system depend on the model installed in your game.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide Mode active. I will keep the coaching spoiler-minimized.
> 
> For a first playthrough, the core decision revolves around your playstyle. You need to decide if you want to be a straightforward fighter, a quick hacker, or someone who relies on stealth and technical skill.
> 
> Here is a breakdown of the main attributes:
> 
> 1.  **Body:** This is for direct combat. Putting points here makes you a solid physical fighter. It helps you take hits and generally makes the game easier to manage in a melee-focused way.
> 2.  **Reflexes:** This attribute is tied to quick reactions. Raising this makes you faster and more agile in combat, which is useful if you plan on relying on dodging and quick maneuvers rather than just tanking damage.
> 3.  **Intelligence:** This is for the netrunner route. If you plan on using quickhacks and digital manipulation to solve problems without getting into heavy melee combat, this is where you put points. Be warned: if you rely too much on this, you become very fragile once you get hit.
> 4.  **Technical Ability:** This attribute is the quiet workhorse. It opens up crafting options and unlocks certain cyberware you might want down the line. It's good for almost every build because it unlocks flexibility.
> 5.  **Cool:** This attribute rewards patience and stealth. It helps with things like stealth takedowns and certain cyberware that grant passive bonuses.
> 
> A common mistake is spreading points evenly. The local knowledge base suggests that putting points evenly usually leads to not getting the perks that sit behind attribute thresholds.
> 
> To give you better advice, I need to know what kind of character you want to be.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story ending in Cyberpunk 2077 is heavily dependent on the Lifepath you chose at the start, as this dictates the opening chapter and subsequent dialogue options.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output. Use Sandevistan or build for high DPS and prioritize destroying his legs first. Make sure you have cover while he is unleashing his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're asking about taking down a Deathclaw early. Here's the rundown: it has very high health for its level and resists almost everything, especially energy weapons. It opens with a roar and a ground stomp, and headbutts to stagger you. Throwing cars at you is also a thing if you get too close. The key is distance and cover.
> 
> Focus on staying out of its immediate reach and using cover to avoid getting hit by those initial attacks. You'll need to manage your positioning carefully until you can deal significant damage.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You start with one point in every stat, and you get 21 points to spend, bringing your total to 28. The best way to think about it is that your starting SPECIAL values determine which perks you can even take later.
> 
> For the first ten hours, the general advice is to focus on having a good foundation so you can survive and progress. Intelligence is often recommended because it raises how fast you level up, meaning other perks arrive sooner. Strength paired with Endurance makes you a solid melee or heavy weapons survivor that can take a beating. Agility with Perception sets you up as a sniper or V.A.T.S. route, focusing on killing things before they can hurt you. Charisma is the weakest early on, but it pays off later for settlement and speech builds.
> 
> Since you are asking about the start, the goal is to get a balanced build that lets you survive the initial dangers.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take a leg off one of the ghouls. It stops attacking altogether. Taking both arms off does not stop them. They deal radiation damage and physical damage, and they can regenerate if you shoot them in heavily irradiated places like the Glowing Sea.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ❌ · fence ✅ · menu ✅

> If your power armor has stopped working, the first thing to check is whether the fusion core is depleted. The frame runs on a fusion core that drains over time and drains faster when you are sprinting or using V.A.T.S. If the core empties, you can still walk, but you will lose V.A.T.S. and steady aim, and you will be over-encumbered. No specific training perk is required to deal with this.
> 
> If the core is not empty, you might need to check for damage or a malfunction. Repairs and mods can be done at a power armor station or built at a settlement. Remember that upgrading a piece costs the same materials regardless of your tier, so it is often worth waiting until Armorer and Science are ranked up before spending resources, especially for later models where materials are rarer.
> 
> If you are experiencing a specific error message or behavior, providing more detail might help narrow down the cause.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> The key takeaway is that you cannot spend all your resources on the first half of the fight against this legendary foe. At around half health, it will heal completely and gain a new ability, effectively resetting the challenge. Focus on managing your resources wisely throughout the entire encounter rather than trying to rush the first half.
> ```

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It's a big shift. Think of RDR2 as slower and more deliberate than GTA. Arthur has weight, and everything takes time—turning a horse, picking up an item—it's not instant. When you're shooting your way through a town, it only lasts about ninety seconds before the law shows up.
> 
> Here’s what you need to keep in mind right now:
> 1. **Movement:** Ride rather than sprint when possible.
> 2. **Cover:** Treat your face as something to cover for anything illegal.
> 3. **Camp:** Think of your camp as a place you go back to, not just a menu.
> 
> Since you just started, you need to decide where you want to head.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is about how you interact with the world and the people in it. It's a slider, not a switch, meaning one bad day doesn't erase a good one.
> 
> To raise it, focus on actions that build positive interactions:
> *   **Greeting People:** Engaging with NPCs in a friendly manner helps build rapport.
> *   **Helping Strangers:** Performing acts of kindness or assistance for people you don't know can increase your standing.
> *   **Paying Bounties:** Choosing to settle bounties instead of running them shows a different kind of respect for the law.
> *   **Donating to the Camp:** Contributing to the needs of the camp can positively affect your Honor level.
> 
> Conversely, low Honor results in different outcomes, such as paying more for goods or facing harsher reactions from various factions.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending in Red Dead Redemption 2 is quite complex and depends heavily on your choices throughout the game. There isn't one single, definitive ending, but rather different paths based on how you handle the major conflicts and relationships.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If your horse keeps throwing you off, it's usually related to the bond level. Riding, feeding, brushing, patting, and calming the horse during danger will raise its bond level, which in turn adds stamina, better handling, and eventually allows you to maneuver like the rear and drift. A high-bond horse also stops throwing you when something scares it. Bond is per horse, so switching mounts will reset it.
> 
> ```bonsai-cite fallback_no_source```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on objectives rather than just surviving the crowd.
> 
> Here are the main ways to extend your time:
> 
> *   **Complete Objectives:** The game rewards extending the time by hitting objectives that pop up mid-riot, rather than just surviving the immediate fight.
> *   **Prioritize Objectives:** When enemies start spawning, treat the objectives as your priority target to keep the clock moving.
> 
> Focus on completing those objectives to build up the time extension.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock within a single zone. The goal here is to extend the time by hitting objectives that pop up mid-riot, rather than focusing on surviving the entire engagement.
> 
> Revolution mode is centered on the story progression. This mode involves a chain of missions per zone, where objectives are handed out by the resistance, and it is through this mode that characters and zones are unlocked.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the shrine layout in your screenshot. The general advice is that almost everything in the Shadow Temple is there, but you need the Lens of Truth and the invisible floors/walls to see it.
> 
> Here is what you need to know about the floors:
> 
> *   Equip the Lens of Truth and the invisible floors.
> *   Holding the invisible floors/walls drains magic. Use them in short bursts, not constantly.
> *   Green potions and the fairies in the temple help keep the magic running.
> 
> Since you mentioned the floors, are you currently trying to navigate a specific area, or are you stuck trying to find a specific item or path?

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about Volvagia, we'll focus on the mechanics of that fight.
> 
> The key to beating Volvagia is using the Megaton Hammer. When the fire dragon pops out of the floor, hit its head the moment it comes up, and then slash while it is stunned. If it starts flying around the room, use the hookshot to pull it back down. Be careful, though; keep off the lava at the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If you are in a situation where you need to recover, a long rest can restore a lot of things, including spells and health. However, you need to consider what you are trying to achieve. Hoarding rests means you might miss important story moments or personal quests. Supplies are generally not an issue, but food you pick up does count.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need a balanced party that covers the essential roles. You want someone to talk, someone to heal, someone who can handle traps and locks, and enough damage.
> 
> A solid starting composition involves picking a character that can cover two of those roles. For example, a Bard and a Paladin can both talk well, and a Cleric and a Druid can both handle healing. A Rogue and a Ranger can both manage traps.
> 
> The key is ensuring you don't leave a gap in healing. The party you cannot cover is the one with no healing at all.
> 
> Focus on having at least one dedicated healer. If you can't cover all the bases, prioritize a character who can provide healing and another who can handle utility like traps or exploration.
> 
> ```json
> {"tdp_watts": 6, "gpu_clock_mhz": 1200}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest ways to make money early in The Sims 4 generally revolve around quick skill acquisition and leveraging simple, scalable activities.
> 
> 1.  **Painting and Writing:** These are classic self-employed earners because they only require one skill and one object, and both scale hard with level. Starting with these can provide an immediate, low-effort income stream.
> 2.  **Selling Collectibles:** If you can find or create items that are in demand early on, selling them can fund your initial needs faster than waiting for complex career progression.
> 3.  **Gardening:** While it might seem slower to start, if you have the time and patience, gardening can become a reliable, scalable income source as your plants mature.
> 
> Focus on quickly leveling up one of these skills to establish a steady, early cash flow.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in Grand Theft Auto: San Andreas - The Definitive Edition is tied to the "Respect" mechanic. You can recruit up to seven gang members. This is achieved through several actions, including:
> 
> *   **Missions:** Completing specific missions can grant you gang members.
> *   **Combat:** Killing rival gang members and police contributes to your respect level.
> *   **Territory Control:** Taking and holding territory is a factor.
> *   **Appearance:** Certain visual cues, such as wearing the correct colors at home, having specific tattoos, or muscle, can influence recruitment.
> 
> If you wear the wrong colors at home, kill your own gang members, or lose turf, this can negatively affect your ability to recruit.
> 
> ```bonsai-cite wiki_no_patch
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> I can give you some general advice on dealing with Margit. She is a tough boss, so focus on dodging her attacks and managing your stamina.
> 
> When she attacks, try to keep your distance and wait for her openings. Use your dodge mechanic to avoid her heavy blows. If you get close, use your light attacks to interrupt her rhythm. Keep an eye on your stamina; don't let it run out, as you'll need it for those big dodges.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're stuck dying in Tartarus, we need to focus on survivability and managing the waves. The core idea is to learn the enemy patterns and use the right tools to survive the onslaught.
> 
> For general survival, focus on blocking. The Shield of Chaos is the most survivable weapon because holding block turns a mistake into nothing rather than reducing it. It also sets up a rush that closes distance and hits hard, so defense and offense are the same button.
> 
> We also need to think about the specific area you are in. Are you struggling with a particular section, or are you just overwhelmed by the sheer number of enemies?
