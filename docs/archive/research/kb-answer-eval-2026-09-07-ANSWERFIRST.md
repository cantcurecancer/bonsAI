# Knowledge-base answer eval — 2026-09-07 — ANSWERFIRST

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.07` |
| corpus_sections | `293` |
| prompt_variant | `answer_first` |
| kb_placement | `early` |
| voice_preset | `` |
| think_effort | `off` |
| judge_model | `` |
| samples_per_case | `3` |
| cases | `61` |
| run_minutes | `3.7` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **79.5%** (136/171) | every must-mention group found in the reply |
| No contradiction | **90.7%** (49/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **99.4%** (167/168) | no spoiler fence where none was due |
| Fence present when due | **88.9%** (8/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.1%** (134/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **67.2%** (41/61) | strictest view |

Mean seconds per answer: **1.2**. Mean request payload: **6901.5** bytes. Mean prompt tokens (Ollama prompt_eval): **1491.8**.
Mean system prompt length: **6480.0** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1866.0**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1943.0 | 1.1 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1955.0 | 1.4 |
| `A-DRG-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.6 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.6 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1891.0 | 1.3 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 0.8 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1779.0 | 1.4 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.6 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1723.0 | 1.0 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.4 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.8 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.3 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1824.0 | 1.0 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 0/3 | 1776.0 | 1.2 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.7 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 2.1 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1541.0 | 1.1 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.5 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2013.0 | 1.7 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1904.0 | 2.2 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.7 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.3 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 2/3 | 0/3 | 1937.0 | 1.4 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1977.0 | 1.1 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.3 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1906.0 | 0.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1595.0 | 1.0 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.2 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.6 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1981.0 | 1.0 |
| `A-OOT-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1879.0 | 1.1 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.2 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.6 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.2 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 2/3 | 3/3 | 0/3 | 1110.0 | 0.9 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1576.0 | 0.9 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 1.4 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2244.0 | 1.2 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2185.0 | 1.0 |
| `A-HK-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2288.0 | 1.3 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2232.0 | 1.1 |
| `A-DOOME-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2142.0 | 2.1 |
| `A-DOOME-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2108.0 | 1.9 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 1.5 |
| `A-DOOM64-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2199.0 | 1.8 |
| `A-GTAV-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2180.0 | 0.9 |
| `A-GTAV-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2199.0 | 1.2 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2254.0 | 1.1 |
| `A-GTAIV-02` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2320.0 | 0.8 |
| `A-FNV-01` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 2335.0 | 1.5 |
| `A-FNV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2398.0 | 1.4 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2220.0 | 1.8 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 0/3 | 2182.0 | 1.0 |
| `A-MK64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2223.0 | 1.0 |
| `A-MK64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2272.0 | 1.6 |
| `A-TTYD-01` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2221.0 | 1.2 |
| `A-TTYD-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2326.0 | 1.1 |
| `A-PIK2-01` | strategy | 3/3 | 3/3 | 1/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 1.6 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 0/3 | 3/3 | 3/3 | 0/3 | 2193.0 | 1.1 |
| `A-MELEE-01` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 2207.0 | 1.5 |
| `A-MELEE-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2219.0 | 1.5 |

## Failures worth reading

- **A-DRG-03** sample 3: missing facts: `shop`
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-FO4-05** sample 2: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`; branch menu missing
- **A-OOT-02** sample 2: missing facts: `megaton hammer`
- **A-GTASA-01** sample 3: spoiler fence present, none due
- **A-BMS-01** sample 1: missing facts: `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`
- **A-BMS-02** sample 1: missing facts: `mostly new`, `kept the same`
- **A-BMS-02** sample 2: missing facts: `mostly new`, `kept the same`
- **A-BMS-02** sample 3: missing facts: `mostly new`, `kept the same`
- **A-DOOME-01** sample 1: missing facts: `shield blocks`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`
- **A-DOOME-01** sample 3: missing facts: `shield blocks`
- **A-DOOME-02** sample 1: branch menu missing
- **A-GTAV-02** sample 1: missing facts: `yellow meter`
- **A-GTAV-02** sample 2: missing facts: `yellow meter`
- **A-GTAV-02** sample 3: missing facts: `yellow meter`
- **A-GTAIV-02** sample 1: missing facts: `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `clears your wanted level`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-01** sample 3: missing facts: `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`
- **A-FNV-02** sample 3: missing facts: `Goodsprings`
- **A-SM64-02** sample 2: branch menu missing
- **A-TTYD-01** sample 2: missing facts: `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 2: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 1: said: `kill the larvae first / focus the babies`
- **A-PIK2-01** sample 3: said: `kill the larvae first / focus the babies`
- **A-PIK2-02** sample 1: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-PIK2-02** sample 2: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-PIK2-02** sample 3: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-MELEE-01** sample 1: missing facts: `die early`
- **A-MELEE-01** sample 3: missing facts: `die early`
- **A-MELEE-02** sample 1: missing facts: `launched off the screen`; branch menu missing
- **A-MELEE-02** sample 2: missing facts: `launched off the screen`
- **A-MELEE-02** sample 3: missing facts: `launched off the screen`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle the Glyphid Dreadnought, focus on kiting between its waves. Target the weak-point armor plates as they open up. Save your overclock or nuke abilities for when you have a good window to break that armor.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You are likely struggling with how to manage the simultaneous damage from the Lacerator and the Arbalest. The key against the Dreadnought Twins is to split your fire evenly between them rather than focusing all your damage on one.
> 
> Here is what you should focus on:
> 
> *   **Split Fire:** Aim to distribute your shots so you aren't burning one down too quickly while the other heals.
> *   **Wait for the Gap:** The phase of the fight involves letting their health bars drift apart. Both will become immune while they try to close the gap. This is your window to focus on the weaker point.
> *   **Healing:** Remember that the healing mechanic never starts during this phase, so focus purely on damage output during the open windows.
> 
> Try focusing on keeping the damage balanced across both targets.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource that pays for weapons instead of for your dwarf. You use it to buy weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod. If you don't have nitra, you will have an underleveled weapon regardless of how much gold you mine, so keep mining it for whichever weapon you are running.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will explain how to handle the Tank. Focus on keeping distance and avoiding getting hit by his heavy attacks.
> 
> When you see the Tank, the main thing is to keep your guns aimed at him and try to avoid getting caught in his big punches or projectiles. If he starts throwing chunks of concrete, try to slip past him rather than running through the area he is aiming at.
> 
> If you see a teammate pinned down by the Tank, try to position yourself between that survivor and the Tank. Remember, if the Tank hits you, it's just bullets, not a save for your friends. Also, if someone is running at you with a revved chainsaw, you can usually punch them before they arrive.
> 
> The key is to fight him in the open; anything he can punch becomes a projectile with more reach than his fists. If you see him trying to crouch through a vent, he will be slow and won't look for another way around.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks when she is startled. She ignores gunfire that isn't aimed directly at her and ignores other infected. What wakes her up is usually a flashlight or a survivor standing too close. When she gets startled, she will growl as a warning, then she will stand up, flail, and then charge, incapacitating whoever she picked first with one hit. Fire will slow her down, but only after she is already startled. The key is to keep things calm until you see a clear opening or a way to startle her.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter involves managing your distance and timing for maximum damage. Pounce damage scales with distance, reaching up to 25 on a long one, so focus on height and a good run-up rather than just surprise. When near the group, move like a common player, as the melee claw reads as horde damage until someone actively checks on you. Since the pounce recharges quickly, holding the crouch and re-pouncing keeps the pressure on the enemies.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are surfaces you can interact with in the game. There are three types: Blue, Orange, and White.
> 
> The Blue Gel is the repulsion gel. It makes you bounce higher the further you drop onto it. It's useful for gaining vertical height.
> 
> The Orange Gel removes friction. This means you keep the speed you have when you land on it.
> 
> The White Gel lets you portal surfaces that couldn't be ported before. However, it won't stick to cubes or turrets, and a cleansing spray will remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is carrying you in the wrong direction, you need to look for the button that reverses its travel before you assume the route is closed. It moves along the beam and can pass through portals, so it can cross the whole chamber, ferrying you, gel, and cubes.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If Antlions are coming up out of the sand, remember that they hunt vibrations. Keep moving on the coast where the rocks are solid. Avoid the sand areas if you can. If you encounter the Antlion Guard, use the pheropod you find. Throwing it will make them read you as a guard, and they will swarm whatever you marked.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you acquire the pheropod from the Antlion Guard, you throw it. The antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw various items in Half-Life 2. According to the knowledge base, secondary pulls and holds are for secondary actions, while primary punts are for throwing.
> 
> You can use it to pick up:
> *   Explosive barrels
> *   Sawblades
> 
> It will not lift most enemies, but you can use it on things like manhacks and scanners. Thrown grenades can go back where they came from.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest because holding block turns a mistake into nothing. The Eternal Spear is also a safe option because its reach keeps you out of trouble. Avoid the Twin Fists of Malphon initially because they require you to stand inside everything.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Focus on Asterius first. He telegraphs a long charge, so sidestep it to get him stuck briefly. Then, use Theseus's attacks, which are marked on the ground, to manage the damage.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> If you have defeated the final boss, you have completed the main story campaign. However, in Hades, beating the final boss is just the start. The game continues with subsequent runs and unlocks, and the true ending involves progressing through additional chapters and achieving specific achievements or conditions.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused OS. It functions by cutting damage taken and prevents your health from dropping below a quarter. Furthermore, after you put an enemy down, you regain a quarter of your maximum health. The specific effects it has on your melee weapons depend on the model you install.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy guide mode active. I will keep the advice spoiler-minimized for now.
> 
> Choosing attributes early in Cyberpunk 2077 is important because they determine your core gameplay style. There isn't one single "best" way, but here are the main paths:
> 
> 1.  **Body and Reflexes:** This is the straightforward fighter route. Raising these two gives you a solid foundation for combat and makes you relatively forgiving if you mess up a dodge or take a hit. Good for players who want to focus on melee or heavy weapon combat.
> 2.  **Intelligence:** This is the netrunner route. It focuses on quickhacks and digital manipulation before you even get into a fight. The downside is that you start fragile; if a hack fails or you get caught, you can be wiped out quickly.
> 3.  **Technical Ability:** This attribute is the wild card. It quietly helps *every* build by opening up crafting options and the specific cyberware you want. It rewards patience and stealth.
> 
> A general rule of thumb is that spreading points evenly is usually a bad idea. You should focus heavily on the two attributes that define your primary role (like Body/Reflexes for a fighter or Intelligence for a netrunner), and then dump the rest into Technical Ability.
> 
> Since you haven't specified what kind of playstyle you prefer, I need to know where you want to start.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story progression in Cyberpunk 2077 is highly dependent on the Lifepath you choose at the start. Different paths lead to different narrative beats and endings.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output, specifically using Sandevistan or high DPS builds. Prioritize destroying his legs first, and ensure you have cover during his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To deal with a Deathclaw early on, remember that distance and cover are your best friends. It has very high health and is resistant to a lot of damage, especially from energy weapons.
> 
> Here is the general approach:
> 
> 1.  **Keep Distance:** Do not walk right up to it. Stay back and use cover (rocks, debris, buildings) to avoid its initial stomp and headbutt attacks.
> 2.  **Use Cover:** Use the environment to your advantage. If you can't outrun it, use obstacles to break its line of sight and force it to waste time attacking you.
> 3.  **Target Weak Points (If Possible):** While it resists most things, if you can land a critical hit, it will stagger. Focus on sustained damage rather than trying to one-shot it with weak weapons.
> 4.  **Avoid Energy Weapons:** As noted, lasers reflect off its hide, making them inefficient. Stick to ballistic or melee weapons if you can manage the distance.
> 
> The key is to manage the engagement, not try to rush it.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You start with one point in every stat and 21 points to spend, meaning you have 28 total points to distribute across Strength, Perception, Endurance, Charisma, Intelligence, and Agility. The key thing to remember is that these starting points are more important than the perks you pick later, as the perks sit underneath the SPECIAL values that determine which perks you can even take.
> 
> For the first ten hours, the local knowledge base suggests focusing on making the character enjoyable rather than hyper-optimizing. Intelligence is often recommended because it raises how fast you level up, meaning every other perk arrives sooner. Strength with Endurance is good for a melee or heavy weapons survivor that can take a hit. Agility with Perception is the route for snipers and V.A.T.S. routes, focusing on killing things before they arrive. Charisma is the weakest early on but pays off later for settlement and speech builds.
> 
> Since you haven't specified what kind of game you are planning to play, I can't give you a definitive answer, but here is a breakdown of the general early priorities:
> 
> 1.  **Intelligence:** Good for leveling speed.
> 2.  **Strength/Endurance:** Good for survivability in melee/heavy combat.
> 3.  **Perception/Agility:** Good for ranged combat/stealth.
> 4.  **Charisma:** Good for social encounters later.
> 
> Pick the stat that feels most fun to play with in the moment.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Feral ghouls are fast and rarely travel alone. The reliable weakness is their head. If you take off one leg, they stop attacking entirely. Taking both arms off does not stop them. They deal radiation damage physically, and in heavily irradiated areas like the Glowing Sea, they regenerate if you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor suddenly stopped working, check a few things. First, ensure you have enough fusion core power. The frame drains over time, and it drains faster when you are sprinting or using V.A.T.S. If the core is empty, you can still walk, but you will lose V.A.T.S. and steady aim, and you will be over-encumbered.
> 
> Second, check if you have any immediate issues with the armor itself. Sometimes a simple inventory check or a quick reload can resolve minor glitches.
> 
> If the issue persists, you might need to repair or upgrade the armor at a power armor station or a settlement. Remember that upgrading a piece costs the same materials regardless of your current tier, so it's often better to wait until your Armorer and Science ranks are up before spending on later models, as the materials can be rare.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Legendary enemies in Fallout 4 have a star beside their name. They are tough because at about half their health, they heal themselves completely and gain a new ability. Don't spend all your resources on them in the first half of the fight.</bonsai-spoiler>
> It sounds like you're dealing with one of those tough encounters. Remember, the key is not to rush the kill. If you focus too much damage early on, you're setting yourself up for a much longer fight than it initially appears.
> 
> What part of the encounter are you stuck on?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The main difference is that RDR2 is intentionally slower. Arthur has weight, and actions like picking up items take time. Don't try to sprint everywhere; riding your horse is better for movement. Also, be aware that the law is persistent; if you cause trouble, they won't just disappear. Try to keep your face covered when doing anything illegal to keep those bounties down.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising honor in Red Dead Redemption 2 is a gradual process based on your actions. It's not a switch you flip; it's a slider that moves based on what you do.
> 
> You increase honor by engaging in actions that are generally considered positive or helpful within the game world. This includes:
> 
> *   **Greeting people:** Simply interacting with NPCs and acknowledging them positively helps build your standing.
> *   **Helping strangers:** Performing acts of kindness or assistance for people you encounter on the road can boost your honor.
> *   **Paying bounties:** Choosing to pay bounties instead of immediately resorting to taking them can positively affect your standing.
> *   **Donating to the camp:** Contributing to the camp's needs or activities can also contribute to your honor.
> 
> Conversely, low honor is associated with actions like robbing people, killing civilians, or harming animals you don't intend to use.
> 
> Remember, one bad day does not erase good progress. Focus on consistent, positive interactions to steadily increase your honor level.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of the story involves Arthur Morgan's final confrontation and the resolution of his journey.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse bonding level directly impacts handling. Raising the bond level through riding, feeding, brushing, patting, and calming the horse during danger will improve its stamina and handling, eventually allowing it to perform maneuvers like the rear and drift. A higher bond level also makes the horse less likely to spook when something scares it. Since bond is per horse, switching mounts will reset the process.

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to look for pickups scattered around the level. These pickups add 15 seconds each to your round timer.
> 
> The key is knowing when to stop fighting and start running for time, rather than staying in a prolonged fight. A round you extend is worth more than a crowd you finish.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock within a specific zone. The objective here is to extend the time by hitting objectives that appear mid-riot rather than focusing on surviving.
> 
> Revolution mode, conversely, is narrative-driven. It follows a chain of missions per zone, with objectives handed out by the resistance, and this mode is where characters and zones are unlocked.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Shadow Temple is designed to trick you into thinking certain areas are inaccessible. The key is the Lens of Truth. Equip it to see the invisible floors, walls, and chests. Be careful, holding the Lens drains magic, so use it in short bursts. You can keep the magic flowing by using the green potions or the fairies you find in the temple.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle Volvagia, you need to focus on timing your attacks with the fire dragon. When it pops out of the floor holes, hit its head immediately. While it's stunned, use the Megaton Hammer to slash it. When it flies around the room, the hookshot is your tool to pull it back down. Use the Goron Tunic and a shield to protect yourself, and make sure you stay away from the lava at the edges of the arena.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Long rests are important because they restore spells, health, and most abilities. They also advance companion scenes and personal quests. Hoarding rests means you might miss story progression, which is usually not the goal. Supplies are generally not an issue; food you pick up counts towards your supplies.
> 
> If you are struggling with resource management or feeling like you are missing content, prioritizing a long rest when you have the opportunity is generally the better move.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you want a balanced party that covers the core needs: talking, healing, utility (traps/locks), and damage.
> 
> A solid starting setup often looks like this:
> 
> 1.  **Talk/Support:** A Bard or Paladin. They handle social encounters well and often provide some frontline presence.
> 2.  **Healing:** A Cleric or Druid. You absolutely need someone dedicated to keeping the party alive.
> 3.  **Utility/Defense:** A Rogue or Ranger. These characters excel at finding and disarming traps, and they bring necessary damage.
> 4.  **Damage/Tank:** This slot is flexible. You can lean into a heavy martial class like a Fighter or Barbarian for frontline damage, or take a more versatile caster if you prefer spellcasting over pure melee.
> 
> The key takeaway is that you cannot cover all bases with one character. Ensure you have at least one dedicated healer and one character capable of dealing damage while others handle the necessary utility.
> 
> If you are struggling with specific encounters, let me know what kind of challenge you are facing, and I can give more tailored advice.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to make money early in The Sims 4 revolves around skills that scale quickly with low initial investment.
> 
> 1. **Painting and Writing:** These are often cited as the quickest self-employed earners because they require minimal initial setup—just one skill and one object. Both skills scale rapidly once you start practicing.
> 2. **Selling Collectibles:** If you can find or create collectibles, selling them can generate funds very early on, especially if you start with a cheap starter lot to keep initial costs low.
> 
> Focus on developing one of these skills immediately to start generating income while you build up your household.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members is tied to the "Respect" mechanic in the game. You can recruit up to seven gang members. This is influenced by several factors: completing specific missions, killing rival gang members or police, taking territory, spraying over tags, and appearance nudges like your hair, tattoos, clothes, muscle, and wearing green if you are in Grove Street territory. It will fall if you wear the wrong colors at home, kill your own gang members, or lose turf.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> To deal with Malenia, focus on managing your stamina and dodging her attacks precisely. When she initiates a specific move, you need to learn the exact timing for your dodge. Stay mobile; don't stand still and let her pressure you.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're stuck dying in Tartarus, we need to focus on survivability and managing the encounters. The key is to learn the patterns and use the right gear.
> 
> For immediate survival, I recommend picking up the Shield of Chaos. It's the most survivable weapon because blocking turns a mistake into nothing instead of just reducing damage. Also, remember that blocking sets up a rush, which can close the distance and hit hard. Treat defense and offense as the same button for now.
> 
> When facing specific challenges, like the fight with Theseus and Asterius, focus on Asterius first. He telegraphs a long charge, so sidestep it to get him briefly stuck. Theseus's attacks are more predictable.

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, The opening tram ride and where it leads  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> To deal with the giant headcrab boss, focus your fire on its pale egg sac. Shots aimed at anything else will be wasted. When it gets close, its front legs will slash for heavy damage, so watch your footing and try to stay out of its reach. Be aware that it will spawn weak and fast baby headcrabs to distract you, so keep an eye on them. When the main body is down, be quick; it will release a final brood of headcrabs, so back away before they all pop.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, The opening tram ride and where it leads, Long Jump Module  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are largely new work, meaning they are significantly longer than the original 1998 levels. Expect a lot more content to explore. The core gameplay shape remains similar: no cutscenes, scripted scenes you walk through, and you'll rely on a crowbar for crates and vents to progress.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** Leaving the Forgotten Crossroads, False Knight, Watcher Knights  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The False Knight is the first real fight in the Forgotten Crossroads. The key is to manage the shockwave attack. When he slams his mace, you need to jump the resulting shockwave instead of backing away. Hitting his armor doesn't give you soul, so save your health for when his armor is exposed. Once he exposes his head, focus on piling hits on it. After the third exposure, he will break the floor and fall, so drop him immediately to finish the fight. If he gets too aggressive, a wall above the left gate becomes breakable, and the Vengeful Spirit spell is in the next room, which makes the rematch easier.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Getting a map is tied to finding Cornifer, the humming cartographer. You need to find him in Dirtmouth. Once you have him, buying his copy will start filling in the map as you rest at benches.
> 
> Benches are important because they are where you can save your progress, restore your masks, and swap charms.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, The Crucible  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> To handle the Marauder when it keeps blocking you, you need to manage your distance and timing.
> 
> 1. **Stay at Mid Range:** Don't get too close, or it will draw your super shotgun too fast. Don't stay too far away, or it can throw axe waves at you.
> 2. **Watch its Movement:** Pay attention to where it is. A dash means it's trying to close the gap, while a run means it's coming in to swing.
> 3. **Hit on the Flaw:** When it winds up its axe, its eyes flash green. Hit it in that exact instant. This will momentarily stagger it.
> 4. **Use High Damage:** After you stagger it, pour in the highest damage shots you have, like the super shotgun, ballista, or rocket. Try to land two or three hits before it recovers.
> 5. **Clear the Surroundings:** Don't forget to kill the glowing wolf it summons. Clear the other demons around it first to keep the arena space open.
> 
> Focus on hitting it when it's vulnerable, not trying to overpower the block directly.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ❌

> The basic combat loop in DOOM Eternal is about managing your limited resources—ammo and fuel—while constantly moving.
> 
> Here is the breakdown:
> 
> 1.  **Shoot Weak Enemies:** Start by shooting weak enemies until they flash. This allows you to glory kill them for health.
> 2.  **Use the Chainsaw:** Use the chainsaw on fodder demons. This consumes three fuel units but refills automatically every twenty seconds. It's your primary way to generate ammo when you run dry.
> 3.  **Flame Belch:** Use the flame belch on groups of enemies to kill them on fire, which gives you armor. This has a cooldown of twenty-five seconds.
> 4.  **Manage Heavy Demons:** Heavy demons cost all three fuel units and cannot be sawed. Be careful with these.
> 5.  **Movement is Key:** Never stand still. You need to dash twice, jump twice, and swap weapons mid-fight instead of just reloading. If you run out of everything, you'll use the chainsaw for one more kill and the loop restarts.
> 
> Focus on keeping your movement high and using the right tool (shotgun, chainsaw, or flame belch) for the enemy type you are facing.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Strategy guide mode active. I will keep the advice focused on the fight mechanics.
> 
> To take down the Mother Demon, you need to manage her attacks carefully. Her flame trail tosses you around, and she launches four homing rockets. The key to surviving her initial assault is to dodge the flame trail and the rockets.
> 
> The main strategy revolves around using the fully upgraded Unmaker. Its high fire rate is crucial because it can stun her, which stops her from launching the rockets, leaving you only to deal with the flame trails. You need to find the three Demon Keys first to access the necessary items, including the Unmaker, before facing her directly.
> 
> Once you have the Unmaker, aim for point-blank range to stun her and then use the BFG or rockets to finish her off. Prioritize getting those keys.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, How the coloured keycards work, Finding your way through the dark, maze-like levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Doom 64 is a distinct game that builds on the Doom II formula but introduces significant changes. It has thirty-two new levels, redrawn sprites, and a slower, darker atmosphere compared to the original Doom. It keeps the core elements of the classic Doom arsenal but adds new weapons, like the Unmaker, and new monsters.
> 
> The key differences are in the presentation and the expanded content. It's not a port; it's a sequel that takes the classic Doom feel and pushes it in a different direction with its own unique aesthetic and level design.

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in GTA V comes in five tiers, bought from Ammu-Nation. Each tier is stronger than the last. A key point is that body armor does nothing against melee attacks. You still need to rely on your weapon or cover to handle close-quarters combat.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The special abilities are tied to each character and have different effects. Michael slows time in gunfights, Franklin slows time while driving any vehicle, and Trevor takes half damage and deals double while raging. You grow the skill behind each ability by using them in specific ways.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Foot chases through construction sites  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For weapons in GTA IV, you'll find them in a few places. The generic weapons are available on the ground where enemies drop them, and you can disarm them by shooting their hand instead of killing them. If you need specific gear, you'll need to look for underground gun shops. After you've dealt with some initial threats, a van belonging to Little Jacob will sell everything at a sixty percent discount. Body armor is also sold alongside the guns and is useful for taking more hits.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Foot chases through construction sites  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is pretty straightforward. You clear a wanted level by walking to a bed in a safehouse and choosing to sleep. This action will also clear any wanted level you currently have.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Crossing the crater radiation pools, Starting out in Fallout: New Vegas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The danger at the quarry past Sloan comes from the Deathclaws. They are tougher than normal, and there are specific tactics you can use to deal with them.
> 
> To survive, focus on these tips:
> 1. **Environmental Hazards:** They stop chasing if you stand on a rock they can't reach or dive into water. Use this to your advantage to slow them down.
> 2. **Crippled Legs:** If you have a crippled leg, it stops their leaping attack and slows them to a limp. This is a good defensive option.
> 3. **Distraction:** A flare gun can make them flee. Use this if you need to escape a tight spot.
> 
> The main goal is to clear the area to get the reward, which includes a Fat Man with two mini nukes and a light machine gun.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Choosing early armor by Damage Threshold, not by looks  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random; they are fixed thresholds. If you have a Speech check of 25, you succeed, or you fail. It's not a dice roll where you can randomly fail based on luck. You need to meet the required number.
> 
> The game is designed so that these checks are consistent. You'll find these checks throughout the game, from talking to NPCs to performing actions.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Getting your first star in Bob-omb Battlefield  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to focus on timing your throws and using the stick to build speed.
> 
> For the first fight, when he breathes fire, don't just stand there. Jump into the air and try to get behind him. When he jumps to shake the ground, make sure you are airborne so you aren't stunned. If you can get close, grab his tail, spin the stick to build up speed, and then throw him into one of the four spiked bombs around the edge. If you miss, he will climb back up, so try to get that throw in.
> 
> For the second fight, which happens after you board the sub, be aware that the stage will tilt when he lands. Watch for single fireballs and teleportation patterns.
> 
> For the final fight at 70 stars, he has five bombs. You will need to throw him three times. Remember that his slams now send shockwaves along the floor, and he breathes fire upward that rains back down. Focus on keeping him off the ground and timing your throws to avoid getting hit by the downward fire.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, Getting your first star in Bob-omb Battlefield, The three caps  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is represented by the eight-wedge power meter. You refill this meter by collecting coins, spinning hearts, or by surfacing in water.
> 
> To refill it, focus on these things:
> 1.  **Coins:** Collect the coins scattered throughout the castle courses.
> 2.  **Hearts:** Look for any spinning hearts that appear in the game.
> 3.  **Water:** If you encounter water, surfacing in it will refill your health meter.
> 
> Keep an eye on that meter; it's crucial for surviving the challenges.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell is a powerful item in Mario Kart 64. It only comes to players in fourth place or lower. It runs along the ground with a siren, locks onto the leader, and flips anyone in its path. You can hold it behind your kart to block other shells from firing.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Drifting and Mini-Turbos, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get a rocket start in Mario Kart 64, you need to hold the gas pedal as the lights change from red to blue. If you hold it too early, you'll spin your tires and go slower than everyone else.
> 
> The key is to hop into a drift by holding the drift button through a turn, and then wiggle the control stick side to side while you hold it. This motion will cause the smoke to change color—white, then yellow, then orange. Letting go of the drift when the smoke is orange will give you a mini-turbo boost on top of your current speed. If you go straight into a banana, a quick tap of the brake will save the spin and show a musical note.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Rawk Hawk, Magnus von Grapple and Cortez  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> To deal with Hooktail healing, you need to manage the crowd. Since she heals by eating members of the audience, keep the number of enemies in the field low. Also, remember that her bite cannot be blocked, so focus on keeping your own HP high instead of trying to guard against it. Koops is useful here because his shell toss hits her first before you commit Mario. Fire attacks also hurt her quite badly.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, The final battle: hands, patterns and the charge tell  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles in Paper Mario: The Thousand-Year Door are turn-based, meaning Mario and your partner each get to act once per turn. You can choose who goes first, and that partner will then act.
> 
> An action command is essentially the specific button press you need to time correctly during an enemy's attack animation to perform an extra action, like dealing more damage or using a special move.
> 
> For example, you need to press the right button at the right moment during an enemy's attack to use an action command for bonus damage.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ✅ · contradiction ❌ · fence ✅ · menu ✅

> When dealing with a large bulborb boss that keeps spawning enemies, the key is usually managing the threat while focusing on the boss itself.
> 
> If the boss is awake and actively pumping out larvae, you need to prioritize killing the mother first. Keep your Pikmin off the sides of the screen to avoid getting swarmed by the larvae. Use your purple Pikmin to attack the boss's head during the pauses when it rolls from wall to wall. If you encounter Burrowing Snagrets, they hide underground; if you get close, they rise to peck, and a stuck one deals extra damage, which is good.
> 
> If the boss is asleep, that's your window to sneak an attack.
> 
> If you are in a situation where you are constantly overwhelmed by enemies, try to focus on clearing the immediate threats around the boss, but always keep an eye on its movement pattern.

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Growing your Pikmin squad, Purple and White Pikmin  
**Checks:** facts ❌ · contradiction ❌ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to collect ten thousand Pokos of treasure to pay off the company's debt. Treasures and enemy bodies both contribute to this total.
> 
> Regarding the day limit, there is still a day limit. The day ends at sunset, and any Pikmin that is not with a captain or back at the Onion will be eaten when the night creatures wake up. You need to watch the sun and call everyone in early.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> In Melee, Fox and Falco are strong because they utilize very different approaches. Fox is fast. He has the second fastest dash and third fastest fall, which means he can get around the stage quickly. His shield is also instant, which lets him react fast to opponents. However, his main weakness is that he falls very fast, and if you get hit while falling, it can be very hard to recover.
> 
> Falco is slower and heavier. His main strength is his laser attack. When his laser hits someone, it flinches them and cancels their approach, which stops them from getting in close. His down air spike also goes straight down, which is a reliable way to finish opponents. His weakness is that he is slower than Fox.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Classic Mode's Metal Battle  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ❌

> In Melee, you don't worry about a health bar draining. Instead, damage is calculated as a percentage of your stock. The higher the damage percentage you deal, the further your opponent gets sent. If you launch them past the edge of the screen, you lose a stock, not health.
> 
> Knockback is also tied to this. When you hit someone, the force of the hit determines how far they are sent. This is influenced by things like the speed of your attack and the specific move you use.
