# Knowledge-base answer eval — 2026-09-05 — today-e2b

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
| run_minutes | `2.8` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **90.9%** (90/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **92.7%** (89/96) | no spoiler fence where none was due |
| Fence present when due | **100.0%** (9/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **100.0%** (66/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **81.1%** (30/37) | strictest view |

Mean seconds per answer: **1.5**. Mean request payload: **7318.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1567.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.0 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.4 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.5 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.6 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-HADES-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.0 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.3 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.2 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 1/3 | 3/3 | 1.9 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 1.1 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.6 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-FO4-02` | strategy | 3/3 | 2/3 | — | 2/3 | 3/3 | 1.8 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.4 |
| `A-FO4-05` | strategy | 3/3 | 0/3 | — | 0/3 | 3/3 | 1.1 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 1.4 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-SOE-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 1.5 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 1.3 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 2.3 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 1.9 |

## Failures worth reading

- **A-HADES-02** sample 1: missing facts: `first`
- **A-HADES-03** sample 1: missing facts: `not the end`
- **A-CP77-02** sample 1: spoiler fence present, none due
- **A-CP77-02** sample 3: spoiler fence present, none due
- **A-FO4-02** sample 1: spoiler fence present, none due
- **A-FO4-02** sample 2: missing facts: `intelligence`
- **A-FO4-05** sample 1: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 2: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 3: missing facts: `twice`; spoiler fence present, none due
- **A-SOE-01** sample 1: missing facts: `pickup`
- **A-SOE-01** sample 2: missing facts: `pickup`
- **A-SOE-01** sample 3: missing facts: `pickup`
- **A-BG3-01** sample 2: spoiler fence present, none due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You need to focus on exploiting its armor plates while kiting the waves. Save your powerful weapons, like the overclock or nuke, for when you find those windows where the armor starts to break down.
> 
> The key is to kiting between the waves and focusing on the weak points on the armor.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Dreadnought Twins are designed to be tough because they heal each other while you try to damage them. The key is to split your fire evenly between them instead of focusing all your damage on one. This prevents one of them from getting too much health while the other stays relatively untouched.
> 
> Focus on keeping your fire spread out. The healing process never starts if you manage the damage correctly.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource you use to purchase weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the tactics for the Tank. This is the big one that throws concrete chunks at you.
> 
> When the Tank is up, the director stops sending out common and special infected, meaning you'll be dealing with four guns against one target. The key is to slip past him and let the horde come straight back. Fight him in the open; anything he can punch becomes a projectile with more reach than his fists, and a punch taken near a drop kills rather than knocks you down. If the route makes him crouch through a vent, he becomes barely mobile and won't look for another way around.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks because she is triggered by specific things. She ignores most gunfire and other infected unless you get too close or use a flashlight. The growl is a warning; if you back off, she settles. If you keep coming, she will charge and incapacitate you. Fire slows her down, but you need to light a wandering witch while she is calm to keep her moving at full speed.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus revolves around managing your positioning and using your abilities effectively against the opposing team.
> 
> Here are some key tactics:
> 
> 1.  **Pounce Management:** The Hunter's pounce damage scales with distance. For effective play, focus on timing your pounces. A long pounce can deal up to 25 damage, so height and a proper run-up are crucial. Don't rely solely on surprise; use your movement to set up the attack.
> 2.  **Group Awareness:** Be mindful of how your melee claw reads. If you are near the group, the melee claw reads as horde damage until someone actively checks on you. This means you need to be aware of when and where to engage versus when to play a more supportive role.
> 3.  **Target Selection:** On Versus, prioritize taking down threats that are causing immediate damage to the opposing team. Be tactical about when to engage and when to reposition.
> 4.  **Movement and Positioning:** Since the pounce recharges relatively quickly, holding crouch and utilizing quick re-pounces can help maintain pressure on the enemy. Use your movement to stay in positions where you can maximize your damage potential while minimizing exposure to incoming fire.
> 
> Focus on disciplined movement and timing your pounces to maximize your impact in the Versus environment.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are items you can use to manipulate physics in the game. There are three main types:
> 
> 1.  **Blue Gel:** This one is used for bouncing. The higher you drop onto it, the higher you bounce when you jump off. It's useful for gaining vertical height.
> 2.  **Orange Gel:** This removes friction. Using this allows you to maintain the speed you have when you arrive at a surface.
> 3.  **White Gel:** This is used for portals. It lets you create a portal to a surface that couldn't be ported before. However, it won't stick to things like cubes or turrets, and a cleansing spray will remove it.
> 
> Which type of Gel are you interested in learning more about?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, you need to look for the button that reverses its direction before you assume the route is closed. Since it passes through portals, it can cross the entire chamber, but you need to ensure you are controlling its orientation correctly.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're running into the classic coastal hazard. Since the Antlions hunt vibration, the sand is dangerous, especially near the coast. To deal with them, you need to be careful where you step.
> 
> If you are near the coast, try to move rock to rock when you need to cross the sand. If you've already encountered the Antlion Guard, remember that once you get the Pheropod, throwing it will make them read you as a guard and swarm whatever you marked.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You obtain the pheropod from the Antlion Guard. Once you have it, throw it, and the antlions will read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw several things in Half-Life 2. Based on the available information, this includes:
> 
> *   **Secondary Pulls and Holds:** You can use the gun to pull and hold various objects.
> *   **Primary Punts:** It is used for throwing items.
> *   **Explosive Barrels:** These hit hard when thrown.
> *   **Sawblades:** These are used to cut zombies.
> *   **Radiators:** Holding one can function as a shield that you can walk behind.
> *   **Manhacks and Scanners:** These are fair game for interaction.
> *   **Grenades:** Thrown grenades can return to where they came from.
> 
> If you are referring to specific items in a particular area, the interaction might be limited by the environment.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. Leave the Twin Fists of Malphon until later — they are the fastest, but they need you standing inside everything. The Heart-Seeking Bow and the Adamant Rail both want range and punish standing still, and the Rail can leave you reloading at the worst possible moment.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> It sounds like you're struggling with the fight against Theseus and Asterius. The key here is managing their dual threats. Asterius telegraphs a big charge, so you need to sidestep that move to avoid getting stuck. Theseus is predictable, so focus on dealing with him while keeping an eye on the charging bull.
> 
> If you're struggling with survivability, consider using the Shield of Chaos. Holding block lets you turn a mistake into nothing, and it also sets up a rush that can close the gap and hit hard.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game in Hades is not truly over after beating the final boss. Beating the final boss unlocks the next major phase of the game, which introduces a new challenge and a different set of mechanics.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a mechanic in Cyberpunk 2077 that functions as a melee-focused system. It has two main effects:
> 
> 1.  **Damage Mitigation:** It cuts the damage you take. It will not let your health fall below a quarter (25%) of your maximum health.
> 2.  **Health Gain:** After every enemy you put down, you regain a quarter of your maximum health.
> 
> The specific effects of the Berserk system depend on the melee weapon model you have installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> Strategy guide mode active. I'll keep the coaching spoiler-minimized, focusing on build choices.
> 
> ```bonsai-spoiler
> For a first playthrough, the general consensus is to focus on Body and Reflexes if you want a straightforward fighter who can absorb mistakes. If you lean into the netrunner route, Intelligence is key for quickhacks, but be aware you'll be fragile once things get serious. Technical Ability is always useful for unlocking the cyberware and crafting you'll actually want later. Spreading points evenly is usually the move that gets you nowhere.
> ```
> 
> Where are you at in your attribute allocation?

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story ending in Cyberpunk 2077 is heavily dependent on the Lifepath you chose at the start. Different paths lead to distinctly different conclusions regarding the fate of V and the city.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output. Use a Sandevistan or high DPS build. Prioritize destroying his legs first, and make sure to cover yourself during his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle a Deathclaw early on, remember that distance and cover are your best friends. They have very high health and resist most damage, so you need to avoid getting into a straight fight unless you have a good plan.
> 
> Here are the basic steps:
> 
> 1.  **Use Cover:** Always try to stay behind obstacles or in areas where you can hide. Don't let it corner you.
> 2.  **Stagger It:** The Deathclaw opens with a roar and a ground stomp, followed by headbutts to stagger you. Use this opening to get some distance or reposition yourself.
> 3.  **Target Weak Points (If Possible):** While it resists most things, focus on exploiting openings. If you can get close enough, try to land critical hits, but be prepared for it to retaliate with heavy blows.
> 4.  **Manage Distance:** If you can't avoid it, try to keep the fight at a distance where you can use cover effectively. Avoid getting caught in its immediate area.
> 
> If you find yourself in a situation where you need to know more about specific encounters, let me know where you are in the game.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> For the first ten hours, focus on having a decent spread. Intelligence is recommended because it increases how fast you level up, meaning you get access to more perks sooner. Strength with Endurance makes you a solid melee or heavy weapons survivor. Agility with Perception is good for snipers and V.A.T.S. routes. Charisma is the weakest early on, but it pays off later for settlement and speech builds.
> ```

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Feral ghouls are fast, irradiated former humans that rarely travel alone. Their heads are the reliable weakness; taking a leg off one stops them from attacking altogether, but taking both arms off does not stop them. They deal both radiation and physical damage. In heavily irradiated areas like the Glowing Sea, you can regenerate as you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor has stopped working properly, check a few things. First, ensure you are not over-encumbered, as this can affect your V.A.T.S. and steady aim, and wearing the armor overrides normal armor bonuses entirely, which might be causing confusion. Second, check if your fusion core is empty; if it is, you can still walk, but you will lose V.A.T.S. and steady aim. If the issue persists, you might need to repair it at a power armor station or build a new one at a settlement.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> If you focus on taking damage, you'll make a mistake. Legendary enemies have a specific mechanic: at about half their health, they heal themselves completely and gain a new ability. Don't waste time trying to finish them off quickly; that's the trap.
> ```

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Alright, coming from GTA means you're used to a different pace. Arthur has weight, and things take time. Don't try to sprint through everything; ride your horse. When you're in town, treat it like a place you go back to, not a quick mission zone. If you get into trouble, cover your face for anything illegal, and remember that a bounty stays where it's earned.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is a slider mechanic, not a switch. It's influenced by the actions you take throughout the game.
> 
> The primary ways to affect your Honor level are:
> 
> 1.  **Positive Interactions:** Greeting people, helping strangers on the road, and donating to the camp will generally increase your Honor.
> 2.  **Negative Interactions:** Robbing, killing civilians, and killing animals you don't use will decrease your Honor.
> 
> Think of it as a scale; one bad day won't undo a good one, but consistent positive and negative actions will shift your standing.
> 
> ```bonsai-cite Red Dead Redemption 2 / mechanic: Honor (trust: fallback_no_source)```

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of Red Dead Redemption 2 involves Arthur Morgan's final confrontation and the resolution of his journey.
> ```
> It's a long way from where you are now. The story wraps up with a specific confrontation that determines the final fate of Arthur and the world around him.
> 
> Since you're asking about the end, we need to figure out where you are in the story right now to give you the right advice.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If your horse keeps throwing you off, it's usually related to the bond level or the horse's temperament.
> 
> Bond level is what makes a horse feel different. Riding, feeding, brushing, patting, and calming it during danger all raise it. Each level adds stamina, better handling, and eventually maneuvers like the rear and the drift. A high-bond horse also stops throwing you when something scares it. Bond is per horse, so switching mounts starts again.
> 
> You should focus on improving the bond with your specific horse by riding, feeding, brushing, and patting it, especially when things get tense.
> 
> ```bonsai-cite Red Dead Redemption 2 / mechanic: Horse bonding (trust: fallback_no_source)
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on objectives rather than just surviving the fight.
> 
> *   **Prioritize Objectives:** Instead of just fighting enemies, look for objectives that pop up mid-riot. Hitting these objectives extends the round timer.
> *   **Kaos Mode Focus:** If you are in Kaos mode, the strategy is to attack the clock by completing objectives that appear during the riot, rather than focusing solely on surviving the crowd.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Revolution mode is the story progression path. It involves a chain of missions within each zone, and objectives are handed out by the resistance, which is where characters and zones unlock. Kaos mode is a score attack against a clock within a single zone. Instead of focusing on survival, you extend the time by hitting objectives that pop up mid-riot.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Alright, you're in the Shadow Temple and the floors look missing. That means you need to use the Lens of Truth and the invisible floors to see everything.
> 
> Here's the gist:
> *   Use the Lens of Truth and the invisible floors to reveal missing floors, walls, and chests.
> *   Be careful—holding the Lens drains magic. Use it in short bursts, maybe keep some green potions handy to keep it going.
> 
> Since you're in the Shadow Temple, the next big thing is figuring out the order of the dungeons.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To deal with Volvagia, you need to use the Megaton Hammer. Hit its head the moment it pops up, and then slash while it is stunned. When it flies around the room, use the hookshot to pull it back down. Use the Goron Tunic and a shield for fire protection, and make sure you stay away from the lava at the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Long rests are a decision. They cost you camp supplies, but they restore spells, health, and most abilities. They also advance companion scenes and personal quests. Hoarding rests means you might miss story progression.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need a balanced group that covers the necessary roles. Generally, aim for four slots that cover talking, healing, utility (traps/locks), and damage.
> 
> A solid starting composition often looks like this:
> 
> 1.  **Talker/Face:** A Bard or Paladin works well for this. They handle social encounters.
> 2.  **Healer:** A Cleric or Druid is essential for keeping the party alive, especially early on.
> 3.  **Utility/Controller:** A Rogue or Ranger is good for handling traps, disabling mechanisms, and scouting.
> 4.  **Damage:** This slot should be filled by a character who can deal significant damage, often a Fighter or another martial class depending on your preferred build.
> 
> Remember, the key is coverage. The party you cannot cover is the one without healing. Ensure you have at least one dedicated healer.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to make money early in The Sims 4 generally involves focusing on skills that generate income quickly, such as painting or writing. These skills require minimal initial investment and scale rapidly with level. Selling collectibles is also a viable early option if you can acquire cheap starter lots.
> 
> For a more detailed breakdown, I can elaborate on specific skill progression or lot acquisition strategies if you provide more context on what you are currently doing in the game.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in San Andreas is tied to the "Respect" mechanic. You can increase the number of gang members you can recruit, up to seven, through several methods:
> 
> *   **Missions:** Completing specific missions will unlock opportunities to recruit members.
> *   **Conflict:** Killing rival gang members or police will contribute to increasing your standing and recruitment potential.
> *   **Territory Control:** Taking territory and spraying over gang tags is a direct way to boost your influence and recruitment capacity.
> *   **Appearance:** Certain appearance nudges, such as wearing the correct colors in Grove Street territory, can also affect your standing.
> 
> This system is governed by the Respect mechanic. If you wear the wrong colors at home, kill your own gang members, or lose turf, it can negatively impact your ability to recruit.
> 
> ```bonsai-cite wiki_no_patch
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You're asking about Margit. Since you haven't specified the game, I'm operating under the assumption that you are playing a Soulslike, as that's the only genre context I have for coaching.
> 
> To give you actual advice on defeating Margit, I need to know which game you are playing. Margit is a boss in several games, and the strategy is completely different depending on the game.
> 
> If you can tell me the game, I can give you specific tips on dodging, stamina management, and attack patterns.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> ```bonsai-spoiler
> If you are struggling with surviving Tartarus, focus on managing your resources and learning enemy patterns. A key tactic is using the Shield of Chaos effectively; holding block turns mistakes into nothing and sets up an aggressive rush. Also, pay close attention to the ground markings for when the god's power will land, as anticipating these attacks is crucial for survival.
> ```
