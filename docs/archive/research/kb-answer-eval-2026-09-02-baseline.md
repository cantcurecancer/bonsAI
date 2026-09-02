# Knowledge-base answer eval — 2026-09-02 — baseline

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
| run_minutes | `2.6` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **90.9%** (90/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **70.8%** (68/96) | no spoiler fence where none was due |
| Fence present when due | **100.0%** (9/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.0%** (64/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **0.0%** (0/3) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **56.8%** (21/37) | strictest view |

Mean seconds per answer: **1.4**. Mean request payload: **7188.3** bytes. Mean prompt tokens (Ollama prompt_eval): **1539.4**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 1.6 |
| `A-DRG-02` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 1.1 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 1.9 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 1.7 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 1.8 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 1.3 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.6 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.0 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 1.4 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 1.3 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0.9 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 1.5 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.6 |
| `A-FO4-01` | strategy | 3/3 | 2/3 | — | 0/3 | 3/3 | 1.9 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 2.1 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.8 |
| `A-FO4-05` | strategy | 3/3 | 2/3 | — | 0/3 | 3/3 | 1.4 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 1.4 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 1.3 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-SOE-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 1.5 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 0/3 | 2/3 | 1.4 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 1.7 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-NOCARD-01` | strategy | 0/3 | — | — | — | 3/3 | 1.2 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 2.0 |

## Failures worth reading

- **A-DRG-01** sample 1: missing facts: `kite`
- **A-DRG-01** sample 2: missing facts: `kite`
- **A-DRG-02** sample 3: missing facts: `split`, `health bar`
- **A-L4D2-01** sample 1: spoiler fence present, none due
- **A-L4D2-01** sample 2: spoiler fence present, none due
- **A-L4D2-01** sample 3: spoiler fence present, none due
- **A-L4D2-02** sample 1: spoiler fence present, none due
- **A-L4D2-02** sample 2: spoiler fence present, none due
- **A-L4D2-02** sample 3: spoiler fence present, none due
- **A-P2-01** sample 3: spoiler fence present, none due
- **A-HL2-01** sample 1: spoiler fence present, none due
- **A-HL2-01** sample 2: spoiler fence present, none due
- **A-HL2-01** sample 3: spoiler fence present, none due
- **A-HADES-02** sample 1: spoiler fence present, none due
- **A-HADES-02** sample 2: spoiler fence present, none due
- **A-HADES-02** sample 3: spoiler fence present, none due
- **A-HADES-03** sample 1: missing facts: `not the end`
- **A-FO4-01** sample 1: spoiler fence present, none due
- **A-FO4-01** sample 2: missing facts: `energy`; spoiler fence present, none due
- **A-FO4-01** sample 3: spoiler fence present, none due
- **A-FO4-02** sample 3: branch menu missing
- **A-FO4-05** sample 1: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 2: spoiler fence present, none due
- **A-FO4-05** sample 3: spoiler fence present, none due
- **A-RDR2-01** sample 1: spoiler fence present, none due
- **A-RDR2-01** sample 2: spoiler fence present, none due
- **A-RDR2-01** sample 3: spoiler fence present, none due
- **A-SOE-01** sample 1: missing facts: `pickup`
- **A-SOE-01** sample 2: missing facts: `pickup`
- **A-SOE-01** sample 3: missing facts: `pickup`
- **A-OOT-01** sample 1: spoiler fence present, none due; branch menu missing
- **A-OOT-01** sample 2: spoiler fence present, none due
- **A-OOT-01** sample 3: spoiler fence present, none due
- **A-OOT-02** sample 1: spoiler fence present, none due
- **A-OOT-02** sample 2: spoiler fence present, none due
- **A-OOT-02** sample 3: spoiler fence present, none due
- **A-NOCARD-01** sample 1: attached=True, expected False
- **A-NOCARD-01** sample 2: attached=True, expected False
- **A-NOCARD-01** sample 3: attached=True, expected False

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Strategy Guide mode active. I will keep the focus on the Dreadnought's mechanics.
> 
> The Glyphid Dreadnought is a tough target. Here is what you need to know about its tactics:
> 
> *   **Weak Points:** Focus on the armor plates that open up when they are hit.
> *   **When to Use Heavy Weapons:** Save your powerful weapons like the nuke or overclock for those specific armor break windows.
> *   **General Tip:** Keep your distance. The Exploder enemies chain their blasts, so aiming for the swarm when you stand back is usually the best approach.
> 
> If you are struggling with a specific phase or encounter, let me know.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Dreadnought Twins are tough because they can heal back up while you're trying to damage them. The key is to split your fire evenly between them instead of focusing all your damage on one. This prevents one of them from getting overwhelmed while the other keeps healing.
> 
> Focus on keeping their health bars separated. If you can manage that, their healing won't start.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource used to purchase weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod.
> 
> It's important to note that if you don't have Nitra, you will be forced to use an underleveled weapon, regardless of how much gold you mine. Keep mining it for whatever weapon you need for your run.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> This guide focuses on general tactics against the Tank.
> ```
> The Tank is the big one who throws chunks of concrete at you. While he is up, the Director stops sending out the common and special attacks, meaning you have four guns against one target. The key is to slip past him and let the horde come back straight at you.
> 
> Fight him in the open. Anything he can punch becomes a projectile with more reach than his fists. If you take a punch near a drop, it kills you rather than knocking you down. If the route makes him crouch through a vent, he is barely mobile and never looks for another way around.
> 
> If you are playing as the Tank yourself, remember to go around rather than through, and wait for the rest of the infected team to be up before you commit. Chase the panicking one or the biled one rather than the nearest one. If a teammate has someone pinned, put your body between that survivor and their friends—the bullets hitting you are bullets, not saving them. Someone running at you with a revved chainsaw gets punched before they arrive.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> The Witch attacks when she is startled, usually by a flashlight or a survivor standing too close. Her growl is a warning; if you keep coming, she will stand up, flail, and then charge, incapacitating whoever she picked first.
> ```
> The Witch is generally patient until provoked. If she attacks, it means you either got too close or used a light source near her.
> 
> If she is calm, you can try lighting a wandering witch while she is still calm; this keeps her at full speed. If you manage to burn her with fire, it slows her down, but only if she was already startled first. Remember, she switches targets to whoever burned her, not necessarily whoever woke her.
> 
> What is your current situation? Are you trying to get past her, or are you trying to survive the immediate threat?

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus mode requires a different approach than in Survival. The core concept revolves around managing your positioning and utilizing your abilities effectively against a team.
> 
> Here are some general tips:
> 
> 1.  **Positioning is Key:** Since pounce damage scales with distance, focus on setting up advantageous situations. Don't just charge blindly. Use cover and terrain to control the engagement range.
> 2.  **Manage the Pounce Recharge:** The pounce recharges relatively fast. Holding the crouch button and re-pouncing strategically can maintain pressure on the team, especially when they are clustered together.
> 3.  **Target the Straggler:** A common tactical advice is to prioritize taking down the straggler first. If you have to engage the main group, move like a common player—use melee attacks cautiously until you are close enough to confirm the damage.
> 4.  **Use Movement to Control Space:** Leverage your movement to dictate where the fight happens. Use flanking maneuvers or repositioning to draw attention away from weaker teammates or to set up better angles for your pounces.
> 
> Remember, the Hunter's strength lies in its mobility and ability to dictate the pace of the engagement.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Gels are essential for movement and interaction in Portal 2. There are three main types:
> 
> 1.  **Blue Gel:** This is the one that affects your jump. The further you drop onto it, the higher you bounce. It's useful for gaining vertical height.
> 2.  **Orange Gel:** This removes friction. If you land on this, you maintain the speed you have when you hit it.
> 3.  **White Gel:** This is used to portal surfaces that weren't portal-able before. However, it won't stick to cubes or turrets, and a cleansing spray will remove it.
> 
> If you're trying to figure out how to use them in a specific situation, tell me what you're trying to achieve.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, you need to look for the button that reverses its direction before you assume the route is shut. It's a common issue with that mechanic.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> Antlions are blind and hunt vibration. On the coast, the rocks are safe, and the sand is where they come up to attack.
> ```
> It sounds like you are in a coastal area and the Antlions are hunting you in the sand. The key here is to stay off the sand and move onto the rocks.
> 
> Try stepping onto the rocks immediately. If you are near the Antlion Guard, remember that you need to use the pheropod to make them swarm whatever you mark.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the bugbait, you first need to obtain it. You can get the pheropod from the Antlion Guard. Once you have the pheropod, you throw it, and the antlions will read you as a guard, causing them to swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun in Half-Life 2 is used for various interactions with the environment and enemies. You can use it for:
> 
> *   **Secondary Pulls and Holds:** You can use the gun to pull objects towards you or hold them in place.
> *   **Primary Punts:** It is used to launch objects at enemies or other targets.
> 
> Specific items you can interact with include:
> 
> *   **Explosive Barrels:** These are noted as hitting hard.
> *   **Sawblades:** These are effective for cutting zombies.
> *   **Radiators:** Holding one can function as a shield, allowing you to walk behind it.
> *   **Manhacks and Scanners:** These are fair game for interaction.
> *   **Grenades:** Thrown grenades can be returned to their original location.
> 
> The local knowledge base also mentions that loose blades are a source of gravity gun ammunition.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The easiest weapon to start with is the Stygian Blade. It is the most forgiving and requires the least skill to use.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> This is a tough boss because you have to manage two threats at once. Asterius, the bull, has a long charge, so you need to sidestep his attack. Theseus throws spears and calls down divine power, which you need to watch for on the ground before it hits. The key is usually to deal with Asterius first because he is more predictable.
> ```

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game in Hades is an endless roguelite. Beating the final boss only unlocks the next run. The true "ending" is simply continuing to play and see how far you can progress and what rewards you can unlock across multiple runs.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a mechanic in Cyberpunk 2077 that functions as a melee-focused operating system. It has two primary effects:
> 
> 1.  **Damage Reduction:** It cuts the damage you take.
> 2.  **Health Regeneration:** It prevents your health from dropping below a quarter of your maximum health. Furthermore, every enemy you put down returns a quarter of your maximum health to you.
> 
> The specific effects of the Berserk operating system can depend on the melee weapon model you have installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first playthrough in Cyberpunk 2077, the core decision revolves around your primary role. The attributes you focus on depend entirely on whether you want to be a pure fighter, a tech specialist, or a hacker.
> 
> If you want to be a straightforward fighter, focus on Body and Reflexes. These attributes make you resilient and good at handling direct combat.
> 
> If you lean into the netrunner route, Intelligence is key. Quickhacks are what do the heavy lifting before you even start fighting, but if you get caught in melee, you'll be fragile.
> 
> Technical Ability is the quiet workhorse. It helps you unlock the best crafting options and the cyberware you actually want, regardless of your primary role.
> 
> The general advice is to spread points evenly, because putting too many points into one area often leaves you missing out on the benefits of other attributes.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> The main story ending in Cyberpunk 2077 is quite complex and depends heavily on the Lifepath you chose at the beginning. There isn't one single definitive ending, but rather several major paths based on your starting choices.
> 
> ```bonsai-spoiler
> The ultimate ending is determined by your Lifepath (Nomad, Streetkid, or Corpo). Each path leads to a distinct conclusion regarding your relationship with V and the fate of Night City.
> ```
> 
> To give you relevant advice, I need to know where you are currently in the game.

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output, specifically targeting his legs first. Use Sandevistan or high DPS builds to destroy his legs before engaging him directly. Cover yourself while he is using rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> The Deathclaw is a very tough early encounter. Because it has high health and resists most damage, you need to focus on positioning and exploiting its weaknesses rather than just spamming your weapons.
> ```
> To kill a Deathclaw early, you need to manage the fight carefully. Its main strategy is to use its stomp and headbutts to stagger you, and then throw cars at you once you are out of reach.
> 
> Here is the general approach:
> 
> 1.  **Stay Back and Observe:** Do not rush it. Use the environment to your advantage. Find cover, like rocks or buildings, to avoid being hit by its initial attacks.
> 2.  **Manage Distance:** Since it is resistant to energy weapons, avoid using those unless you have a specific weakness identified (which is rare for the Deathclaw). Focus on melee weapons or heavy armor if you have them.
> 3.  **Exploit Stagger:** When it stomps or headbutts you, that is your window. Use that moment to get close and deliver heavy damage.
> 4.  **Avoid the Throw:** The most dangerous part is when it throws vehicles. If you see it preparing to throw something, move *away* from the predicted impact zone immediately.
> 
> Since you asked about killing it early, the key is patience and using cover to survive its initial onslaught until you can land a critical hit when it is momentarily staggered.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about the SPECIAL stats at the start of Fallout 4, remember you get one point in each stat, and you have 21 points to spend, meaning you start with 28 total points. The general advice is to focus on Intelligence first because it raises how fast you level up, which means every other perk arrives sooner. Strength with Endurance makes you a good melee survivor who can take a hit, and Agility with Perception is great if you plan on being a sniper or using V.A.T.S.
> 
> The key is to pick what feels good for your playstyle right now, rather than trying to perfectly optimize everything.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If Feral Ghouls are swarming you, the most reliable tactic is to target their heads. Taking a leg off one of them will stop it from attacking altogether. Taking both arms off does not stop the attack. They deal radiation damage as well as physical damage, and in heavily irradiated areas like the Glowing Sea, you can regenerate if you shoot them.
> 
> ```bonsai-cite wiki_no_patch
> ```

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor has stopped working, check a few things. First, ensure you have enough fusion core energy. The frame drains with time and drains faster when you sprint or use V.A.T.S. If the core empties, you can still walk, but you will lose V.A.T.S. and steady aim, and you'll be over-encumbered.
> 
> Second, check if you have any critical damage or if the armor itself is damaged. If the armor is damaged, you can usually repair it at a power armor station or build one at a settlement. The local knowledge base indicates that repairs and mods happen at a power armor station, and upgrading a piece costs the same materials regardless of your tier, so it's often better to wait until Armorer and Science are ranked up before spending resources, especially for later models.
> 
> If you suspect a specific component is failing, you'll need to inspect the armor's condition. If you're having trouble with a specific mechanic, let me know what you are trying to do next.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> Legendary enemies in Fallout 4 have a specific mechanic: at about half their health, they will heal completely and gain a new ability. This means you shouldn't spend all your resources on them in the first half of the fight.
> ```

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> Coming from GTA, the main adjustment is that this game is slow on purpose. Arthur has weight, horses take time to turn, and picking something up is an animation rather than an instant. Shooting your way through a town works for about ninety seconds, and then the law arrives and stays. Wanted levels do not simply expire either: a witness who sees your face turns into a bounty you pay off at a post office. Cover your face for anything illegal, ride rather than sprint, and treat camp as somewhere you go back to rather than a menu.
> ```

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is about how you interact with the world and the people you meet. It's not a single action, but a cumulative effect based on your choices.
> 
> Here are the main ways to raise your Honor:
> 
> 1.  **Good Interactions:** Greeting people politely, helping strangers in need, and generally behaving in a way that is considered honorable will increase your Honor score.
> 2.  **Fulfilling Obligations:** Paying bounties instead of running from them, or donating to the camp, are actions that contribute positively to your standing.
> 3.  **Avoiding Bad Actions:** Conversely, actions like robbing people or killing civilians and animals that you don't need to, will lower your Honor.
> 
> Think of it as a slider, not a switch. One bad day won't completely undo a good chapter, but consistently choosing actions that align with honorable behavior will steadily increase your score.
> 
> ```bonsai-cite
> [Red Dead Redemption 2 / mechanic: Honor] (trust: fallback_no_source)
> It moves on small things done often: greeting people, helping strangers on the road, paying bounties instead of running, donating to camp. It falls for robbery, killing civilians and animals you do not use. High honor means shop discounts and different reactions; low honor pays differently. It is a slider, not a switch — one bad day does not undo a good chapter.
> ```

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending involves a final confrontation where Arthur faces a difficult choice regarding his path and the fate of the outlaw life.
> ```
> The ending of Red Dead Redemption 2 is quite complex, involving Arthur's final choices and the consequences of his actions throughout the game. It's not a single, straightforward outcome, but rather a culmination of his journey.
> 
> Since you're asking about the end, we need to figure out where you are in the game right now to give you the right advice.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse handling in RDR2 is tied directly to the bond level. A horse "throwing you off" usually means it's spooked or losing its composure.
> 
> To improve this, you need to focus on building the bond:
> 
> 1.  **Riding and Care:** Regularly ride your horse, feed it, brush it, and pat it. These actions raise the bond level.
> 2.  **Handling in Danger:** Crucially, you need to calm the horse during dangerous situations. If you are in peril, use the horse to help you, and actively try to keep it calm. A high-bond horse will be less likely to spook when something scares it.
> 
> Remember, bond is per horse, so if you switch mounts, you start the bonding process over. Early on, the bond matters more than specific stat lines; a bonded horse handles better and will respond to a whistle from further away.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Strategy Guide mode is active. I will keep coaching spoiler-minimized.
> 
> The main way to get more time in a round is to focus on objectives rather than just surviving.
> 
> *   **Kaos Mode:** In Kaos mode, you extend the time by hitting the objectives that pop up mid-riot. Focus on those objectives when they appear instead of just trying to survive the immediate onslaught.
> *   **General Tip:** The core idea is to actively seek out and complete objectives that grant you time extensions, rather than just trying to outlast the enemy crowd.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock in one zone at a time. You extend the time by hitting objectives that pop up mid-riot rather than by focusing on surviving. Revolution mode is where the story unfolds, involving a chain of missions per zone with objectives handed out by the resistance, which is where characters and zones unlock.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ❌

> ```bonsai-spoiler
> The Shadow Temple is tricky because many areas look like they are missing floors. To navigate them, you need to equip the Lens of Truth and the invisible floors. Be careful, as holding the invisible floors will drain your magic, so use them in short bursts. Green potions and the fairies in the temple will help keep your magic up.
> ```
> Since you're dealing with the Shadow Temple invisible floors, you need to decide how to proceed.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> The Megaton Hammer is the main attack. Hit the head the second it comes up, then slash while it's stunned. Use the hookshot to pull it back down when it flies around the room. Use the Goron Tunic and a shield for fire protection, and stay away from the lava edges.
> ```
> To beat Volvagia, focus on timing the Megaton Hammer correctly. When it lunges, hit its head immediately, and then wait for it to be stunned before striking it with a slash. Keep an eye on its movement; the hookshot is your primary tool for controlling its position. Use your Goron Tunic and shield to mitigate the fire damage, and make sure you stay clear of the lava edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the strategy for long rest in Baldur's Gate 3. Generally, resting more than feels right is fine, but you need to manage your resources. A long rest costs camp supplies and restores spells, health, and most abilities. If you hoard rests, you risk missing story progression and personal quests. Supplies are plentiful, so focus on picking up food.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, focus on covering the core needs of the party: talking, healing, utility (traps/locks), and damage.
> 
> A solid starting composition often looks like this:
> 
> 1.  **Talk/Support:** A Bard or Paladin. They are excellent for social encounters and provide some frontline presence.
> 2.  **Healer:** A Cleric or Druid. You absolutely cannot run a party without dedicated healing, especially early on when things get rough.
> 3.  **Utility/Control:** A Rogue or Ranger. These characters are crucial for dealing with traps, picking locks, and scouting.
> 4.  **Damage/Tank:** This slot often gets filled by a martial class that can handle frontline combat, such as a Fighter or a Barbarian, or sometimes a Sorcerer/Wizard if you prefer magical damage over pure melee.
> 
> The key takeaway is that you need coverage. If you lack a dedicated healer, you will struggle significantly. If you lack someone who can deal with traps and locks, you'll waste time and resources.
> 
> If you are struggling with specific encounters, let me know.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to generate early income in The Sims 4 generally involves focusing on skills that scale quickly or selling items that require minimal initial investment.
> 
> Here are the primary methods:
> 
> 1.  **Painting and Writing:** These are often cited as the quickest starting points because they only require one skill and one object. Both skills scale rapidly with level, meaning you can start earning money relatively quickly once you commit to them.
> 2.  **Selling Collectibles:** If you can find or create collectible items early on, selling them can provide a decent initial cash injection. This relies on finding a niche or completing early objectives.
> 3.  **Gardening:** While it is slower to start, gardening can become a significant money-maker later in the game as you cultivate larger plots and sell mature produce.
> 
> The key is to prioritize skills that offer a fast return on time invested, like painting or writing, to establish a steady income stream before investing heavily in slower, higher-yield activities.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in GTA: San Andreas is tied to your **Respect** level. You can recruit up to seven members, depending on your current standing.
> 
> The mechanics for increasing this limit involve several actions:
> 
> 1.  **Missions:** Completing specific missions can grant you more respect and potentially unlock higher recruitment caps.
> 2.  **Conflict:** Killing rival gang members and police officers contributes to your respect.
> 3.  **Territory Control:** Taking and holding territory is a factor in gaining respect.
> 4.  **Appearance:** Certain visual elements, such as wearing green clothing in Grove Street territory, can influence your respect level.
> 
> Losing turf or wearing the wrong colors at home can cause your respect to drop, which in turn affects how many gang members you can recruit.
> 
> ```bonsai-cite wiki_no_patch
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> ```bonsai-spoiler
> To deal with Margit, focus on dodging her heavy attacks and using your stamina wisely. Keep your distance when possible, as she has some dangerous aerial maneuvers.
> ```
> Since you're asking about Margit, I'll focus on the immediate tactics. You need to manage your stamina because she has some punishing attacks that will drain it quickly. Focus on dodging her big swings and try to keep your distance.
> 
> Where are you at in the fight against Margit?

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> It sounds like you're struggling with the difficulty in Tartarus. Since I don't have a screenshot, I'll give you some general advice based on what I know about the game.
> 
> The key in Tartarus is managing your resources and knowing when to switch tactics. If you're dying repeatedly, it often means you're either taking too much damage or not utilizing the available defenses effectively.
> 
> Here are a few things to consider:
> 
> 1.  **Blocking:** As I mentioned, blocking is your best defense. It turns a mistake into nothing, and it sets up a rush that can close the distance and hit hard. Try to focus on holding block when you feel overwhelmed.
> 2.  **Movement:** Don't just stand there. Keep moving around. Dodging attacks and repositioning yourself can help you avoid the worst hits.
> 3.
