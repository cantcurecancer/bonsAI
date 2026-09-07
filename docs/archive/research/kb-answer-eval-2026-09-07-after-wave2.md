# Knowledge-base answer eval — 2026-09-07 — after-wave2

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.07` |
| corpus_sections | `293` |
| prompt_variant | `baseline` |
| kb_placement | `early` |
| voice_preset | `` |
| think_effort | `off` |
| samples_per_case | `3` |
| cases | `61` |
| run_minutes | `5.2` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **71.9%** (123/171) | every must-mention group found in the reply |
| No contradiction | **100.0%** (54/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **99.4%** (167/168) | no spoiler fence where none was due |
| Fence present when due | **88.9%** (8/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.1%** (134/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **62.3%** (38/61) | strictest view |

Mean seconds per answer: **1.7**. Mean request payload: **6896.2** bytes. Mean prompt tokens (Ollama prompt_eval): **1490.9**.
Mean system prompt length: **6478.1** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1865.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 0/3 | 1943.0 | 4.5 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 1955.0 | 1.5 |
| `A-DRG-03` | expert | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.6 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.6 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1891.0 | 1.6 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 1.1 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1777.0 | 1.8 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1721.0 | 1.3 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.6 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.9 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.6 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1823.0 | 1.6 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 0/3 | 1776.0 | 1.2 |
| `A-CP77-01` | expert | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.7 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 1.9 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1541.0 | 1.2 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.6 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2011.0 | 2.2 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1904.0 | 2.1 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.7 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.6 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 2/3 | 0/3 | 1937.0 | 1.3 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1975.0 | 1.6 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.7 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1906.0 | 0.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1595.0 | 1.1 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.6 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.8 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1979.0 | 1.8 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1878.0 | 1.4 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.9 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.7 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.5 |
| `A-GTASA-01` | speed | 3/3 | 2/3 | — | 2/3 | 3/3 | 0/3 | 1110.0 | 1.1 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1575.0 | 2.1 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 2.2 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2242.0 | 1.8 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2183.0 | 1.8 |
| `A-HK-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2286.0 | 1.4 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2230.0 | 1.6 |
| `A-DOOME-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2142.0 | 2.8 |
| `A-DOOME-02` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2108.0 | 2.4 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 2.2 |
| `A-DOOM64-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2199.0 | 3.4 |
| `A-GTAV-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2179.0 | 2.0 |
| `A-GTAV-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2197.0 | 3.6 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2252.0 | 2.0 |
| `A-GTAIV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2318.0 | 2.6 |
| `A-FNV-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2333.0 | 2.3 |
| `A-FNV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2396.0 | 1.7 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2220.0 | 2.0 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2182.0 | 1.3 |
| `A-MK64-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2223.0 | 1.1 |
| `A-MK64-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2272.0 | 1.8 |
| `A-TTYD-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2219.0 | 1.9 |
| `A-TTYD-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2324.0 | 2.7 |
| `A-PIK2-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 1.9 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2193.0 | 2.1 |
| `A-MELEE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2207.0 | 1.7 |
| `A-MELEE-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2219.0 | 2.4 |

## Failures worth reading

- **A-DRG-01** sample 2: branch menu missing
- **A-DRG-02** sample 2: branch menu missing
- **A-DRG-03** sample 1: missing facts: `shop`
- **A-DRG-03** sample 2: missing facts: `weapon upgrade`, `shop`
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-CP77-01** sample 2: missing facts: `damage taken`
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `half`, `twice`; branch menu missing
- **A-GTASA-01** sample 1: missing facts: `respect`
- **A-GTASA-01** sample 2: spoiler fence present, none due
- **A-BMS-01** sample 1: missing facts: `egg sac`, `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`
- **A-BMS-02** sample 1: missing facts: `kept the same`
- **A-BMS-02** sample 2: missing facts: `kept the same`
- **A-BMS-02** sample 3: missing facts: `kept the same`
- **A-HK-01** sample 1: missing facts: `hit the head`
- **A-HK-01** sample 2: missing facts: `hit the head`
- **A-HK-01** sample 3: missing facts: `hit the head`
- **A-DOOME-01** sample 1: missing facts: `shield blocks`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`
- **A-DOOME-01** sample 3: missing facts: `shield blocks`
- **A-DOOME-02** sample 3: missing facts: `glory kill`; branch menu missing
- **A-GTAV-02** sample 1: missing facts: `yellow meter`
- **A-GTAV-02** sample 2: missing facts: `Michael slows time`, `yellow meter`
- **A-GTAV-02** sample 3: missing facts: `yellow meter`
- **A-GTAIV-02** sample 1: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 2: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-FNV-01** sample 1: missing facts: `cripple a leg`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-01** sample 3: missing facts: `alpha male`, `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`
- **A-FNV-02** sample 3: missing facts: `Goodsprings`
- **A-MK64-01** sample 2: missing facts: `hold it behind your kart`
- **A-MK64-02** sample 1: missing facts: `spin your tires`
- **A-TTYD-01** sample 1: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 2: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 3: missing facts: `eats the audience`, `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 2: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 1: missing facts: `kill the mother`
- **A-PIK2-01** sample 2: missing facts: `kill the mother`, `throw purples at her head`
- **A-PIK2-01** sample 3: missing facts: `kill the mother`
- **A-PIK2-02** sample 1: missing facts: `two captains`
- **A-PIK2-02** sample 2: missing facts: `two captains`
- **A-PIK2-02** sample 3: missing facts: `two captains`
- **A-MELEE-02** sample 1: missing facts: `launched off the screen`
- **A-MELEE-02** sample 2: missing facts: `launched off the screen`
- **A-MELEE-02** sample 3: missing facts: `launched off the screen`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the strategy for the Glyphid Dreadnought.
> 
> To handle the Glyphid Dreadnought, focus on kiting between waves. Target the weak-point armor plates as they open up. Save your powerful weapons, like the nuke or overclock, for when you see windows to break its armor.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> It sounds like you're struggling with how to handle the Dreadnought Twins fight. The key here is to split your fire evenly between them instead of trying to focus all your damage on one. The strategy is to let their health bars drift apart, and both of them will turn immune while they heal the gap between them. Make sure you aren't burning one down too quickly; focus on keeping both under pressure simultaneously.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> It functions as currency for weapon progression and artifact selection. Keep mining it if you want to buy better weapons, as it directly impacts your loadout.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide Mode active. I will explain how to handle the Tank.
> 
> When you encounter the Tank, remember that it throws chunks of concrete at you. The key is to avoid getting hit by those projectiles. Try to slip past him and fight him in the open area. Anything he can punch becomes a projectile with more reach than his fists, so a punch taken near a drop is more dangerous than a simple knock down. If the route allows him to crouch through a vent, he becomes very slow and won't look for alternate paths.
> 
> Focus on keeping your distance and avoiding those big hits.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch doesn't usually attack randomly. She waits for a specific trigger. She ignores most gunfire and other infected unless something specific happens.
> 
> If you see her start to attack, it's usually because a survivor is standing too close, or you've used a flashlight. Her growl is a warning sign—you need to back off. If you keep coming, she will stand up, flail, and then charge, hitting whoever you picked in one hit.
> 
> Fire does slow her down, but only after she is already startled. The key is to light a wandering witch while she is still calm; this keeps her moving at full speed. If you burn her, she will switch to whoever burned her, not necessarily whoever woke her.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus requires understanding his movement and attack mechanics. Pounce damage scales with distance, reaching up to 25 on a long one, so focus on using height and a good run-up rather than relying solely on surprise.
> 
> When engaging the horde, remember that the melee claw reads as horde damage until someone checks on you. If you have to be near the group, move like a common player. Holding crouch and re-pouncing keeps the pressure on due to the fast recharge rate of the pounce. Take the straggler, not the entire group, as this is generally the most effective tactic.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are three different types of surfaces you can interact with in the game. They are essentially tools for movement and manipulation.
> 
> The blue Gel is the Repulsion Gel. This is used to gain height. The higher you drop, the higher you bounce when you land on it. You can use it to bounce between two blue surfaces to climb.
> 
> The orange Gel removes friction. If you land on it, you keep the speed you have when you arrive.
> 
> The white Gel lets you portal a surface that couldn't be portalized before. However, it won't stick to cubes or turrets, and a cleansing spray will remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is carrying you in the wrong direction, you need to look for the button that reverses its direction before you assume the route is closed. Remember, it passes through portals, so it can cross the entire chamber, and it ferries everything along with you.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with the Antlions, which are blind and hunt by vibration. The key thing to remember is that the sand is dangerous; stay on the rocks when you can. If you encounter the Antlion Guard, you need to use the pheropod they give you. Throwing that pheropod will make them read you as a guard, and they will then swarm whatever you marked.
> 
> Since you are currently being killed by them, the immediate focus should be on moving to safer ground, specifically sticking to the rock formations.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you acquire the pheropod from the Antlion Guard, you throw it. This will cause the Antlions to read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw several items. According to the knowledge base, this includes secondary pulls and holds, primary punts. Specifically, explosive barrels hit hard, sawblades cut zombies apart, and a held radiator can be used as a shield while you walk behind. It is noted that it will not lift most enemies, but manhacks and scanners are fair game, and thrown grenades can return to their original location.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. Leave the Twin Fists of Malphon until later — they are the fastest, but they need you standing inside everything. The Heart-Seeking Bow and the Adamant Rail both want range and punish standing still, and the Rail can leave you reloading at the worst possible moment.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're struggling with the fight against Theseus and Asterius. The key here is managing their dual threats. Asterius, the bull, telegraphs a long charge, so you need to sidestep that swing. When he's stuck, that's your window. Theseus, on the other hand, keeps calling down a god's power, which you'll see marked on the ground before it lands.
> 
> My focus will be on how to prioritize dealing with them. Generally, it's better to focus on taking down Asterius first because he is more predictable.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game does not end after beating the final boss. You will continue to play and unlock new content and challenges.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused OS that ignores time. It functions by cutting damage taken and prevents your health from dropping below a quarter. Furthermore, after you defeat an enemy, it returns a quarter of your maximum health. Its effectiveness for melee weapons is dependent on the specific model installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy guide mode active. I will keep the coaching spoiler-minimized.
> 
> Choosing attributes is important because they define your playstyle. For a straightforward fighter, you should prioritize Body and Reflexes. These two attributes make you a solid brawler and are forgiving if you make a mistake in combat.
> 
> If you lean into a netrunner style, Intelligence is key, as quickhacks allow you to operate before a fight even starts, though you'll be fragile once things get serious. Technical Ability helps with crafting and the cyberware you actually want.
> 
> The general advice is to spread points evenly, as putting too many into one area often means missing out on the perks that sit behind attribute thresholds.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story has several significant branching paths based on your Lifepath choice (Nomad, Streetkid, or Corpo). These choices fundamentally alter the opening chapter, the unique side job you start with, and the dialogue options you encounter throughout the game. The ending is not singular; it depends entirely on which path you committed to early on.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high DPS builds or utilize the Sandevistan to destroy his legs first. Ensure you keep cover while he is unleashing his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> When you first encounter a Deathclaw, remember that distance and cover are your best friends. They have very high health and are resistant to almost everything, so don't try to trade blows with them head-on unless you have a very good reason.
> 
> Here is the general approach for an early encounter:
> 
> 1.  **Use Cover:** Find plenty of cover—rocks, debris, buildings. Stay behind it.
> 2.  **Manage Distance:** Don't let it get close enough to initiate its heavy attacks.
> 3.  **Exploit Weaknesses (If Applicable):** While they are tough, remember that energy weapons can sometimes be effective against them, though they can reflect lasers. Focus on avoiding its physical attacks first.
> 4.  **Stagger/Damage:** Use your weapons to try and stagger it. If you can get a good hit, it might lose some of its momentum.
> 5.  **Avoid Direct Confrontation:** If you are low on health, or if you are unsure of your build, the safest bet is to keep your distance and try to lure it into an area where you can use environmental hazards or superior positioning.
> 
> Since you are asking about an early encounter, the key is survival and positioning, not trying to out-damage it immediately.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Fallout 4, your starting SPECIAL points are crucial because they determine which perks you can even take. Since you start with one point in each of the five stats and 21 points to spend (totaling 28), you need to decide where to focus your initial investment.
> 
> The general advice is that Intelligence is often the quiet strong pick. It raises how fast you level up, meaning every other perk arrives sooner, which is useful for getting into the game quickly. Strength paired with Endurance makes you a solid melee or heavy weapons survivor who can absorb damage. Agility with Perception sets you up well for a sniper or V.A.T.S. route, allowing you to kill things before they even get close. Charisma is the weakest early on but pays off later for settlement or speech builds.
> 
> Since you are asking about the start, focus on making the first ten hours enjoyable rather than trying to optimize a character you haven't met yet. Pick a stat that aligns with the kind of gameplay you want to have.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If Feral ghouls are swarming you, focus on their weakness. Take a leg off one, and it stops attacking altogether. Taking both arms off does not stop them. They lie around in rubble and can climb out of tight spaces, so expect them in unexpected places. They deal radiation damage as well as physical damage, and in heavily irradiated zones like the Glowing Sea, they regenerate if you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor has stopped working properly, check a few things. First, ensure you have enough fusion core power. The frame drains with time and drains faster when you are sprinting or using V.A.T.S. If the core is empty, you can still walk, but you will lose V.A.T.S. and steady aim, and you will be over-encumbered.
> 
> Second, check if you are wearing the armor correctly. Power armor overrides your normal armor bonuses entirely, and it can push your Strength past the usual limit of 10. Make sure there are no conflicting mods or issues with the armor's integrity.
> 
> If the issue persists, you might need to check the power armor station where repairs and upgrades are handled. Ensure you have the necessary materials to attempt a repair or upgrade.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Legendary enemies are tough because at about half their health, they heal themselves completely and gain a new ability. Don't waste your time focusing too much on the first half of the fight; that's usually a mistake.</bonsai-spoiler>
> 
> Since you mentioned a legendary enemy, are you currently engaged in a tough fight, or are you just looking for general advice on how to handle them?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It's a big jump from GTA. The main thing to understand is that RDR2 is intentionally slower. Arthur has weight, and things take time—turning a horse, picking up an item—it's all deliberate. Don't try to sprint through towns like you might in GTA; you'll get caught by the law way too fast.
> 
> Focus on riding instead of sprinting. Treat your camp as a place to rest and manage your gear. Also, be mindful of the law; if you're doing anything illegal, cover your face to keep the bounty smaller.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is not a direct mechanic you can force up with a single action; it's a slider based on your daily interactions with the world.
> 
> The game tracks your Honor through various actions. To raise it, focus on actions that build positive interactions:
> 
> 1.  **Be Helpful:** Greeting people, offering aid to strangers on the road, and generally being cooperative with the environment helps increase your standing.
> 2.  **Avoid Negative Actions:** The primary way to lower Honor is by engaging in actions like robbery, killing civilians, or harming animals you are not intending to use.
> 3.  **Strategic Choices:** How you handle situations matters. Choosing to pay a bounty instead of running, for instance, contributes to a higher Honor score.
> 
> Think of it as a balance. A good day involves positive interactions and minimal harmful actions. One bad day won't completely erase good progress, but consistent positive behavior will steadily raise your Honor meter.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of Red Dead Redemption 2 involves Arthur Morgan's final confrontation and the resolution of his journey.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse bonding in Red Dead Redemption 2 is directly related to how well the horse handles you. You improve a horse's handling by riding it, feeding it, brushing it, patting it, and calming it during dangerous situations. Each successful interaction raises the bond level, which in turn grants you better stamina, improved handling, and eventually allows you to use maneuvers like the rear and the drift. A high-bond horse will also be less likely to spook when something scares it. Remember that bond is per horse, so if you switch mounts, you start the bonding process over.

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on the pickups scattered around the level. Each pickup adds 15 seconds to the round timer.
> 
> Here are the main things to focus on:
> 
> *   **Prioritize pickups:** Look for glowing or distinct objects that look like pickups.
> *   **Don't fight everything:** The key tip is knowing when to break off and go for time instead of staying in a fight. Extending the round is worth more than clearing a crowd.
> 
> Focus on finding those pickups and taking them.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock in one zone at a time. The objective here is to extend the time by hitting objectives that pop up mid-riot rather than focusing on surviving.
> 
> Revolution mode is focused on the story. It involves a chain of missions per zone with objectives handed out by the resistance, and this mode is where you unlock characters and zones.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the layout and mechanics of the Shadow Temple in The Legend of Zelda: Ocarina of Time.
> 
> If you are looking at the Shadow Temple and see areas that look like they are missing floors or walls, you need to use the Lens of Truth. Equip it, and the invisible floors, walls, and chests will become visible. Be careful, as holding the Lens of Truth drains magic, so use it in short bursts. You can keep it running by using green potions and the fairies in the temple.
> 
> What are you trying to do right now?

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To deal with Volvagia, focus on timing your attacks with the Megaton Hammer. Hit the head the moment it comes up, and then slash while it is stunned. When it flies around the room, use the hookshot to pull it back down. Keep your Goron Tunic and a shield handy, and try to stay away from the lava at the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Resting more often is a choice, and it depends entirely on what you are trying to accomplish. A long rest costs camp supplies and restores spells, health, and most abilities. It also advances companion scenes and personal quests. Hoarding rests means you might miss out on important story moments. Supplies are generally plentiful, so focus on what you need most.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, focus on covering the core needs: talking, healing, utility (traps/locks), and damage.
> 
> A solid starting template involves four slots:
> 
> 1.  **Talk/Social:** A Bard or Paladin is excellent for this.
> 2.  **Healing:** A Cleric or Druid is necessary to keep the party upright.
> 3.  **Utility/Defense:** A Rogue or Ranger handles trap disarming and scouting well.
> 4.  **Damage/Tank:** This slot can often be filled by the same character who handles utility (e.g., a heavily armored Fighter or a martial character who can also deal significant damage).
> 
> The key is ensuring you have at least one dedicated healer. If you lack a dedicated healer, you will struggle significantly against tougher encounters.
> 
> Focus on picking classes that synergize with the content you are tackling in the early game.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to make money early in The Sims 4 usually involves activities that require minimal initial investment and scale quickly.
> 
> Focus on these methods:
> 
> 1.  **Selling Collectibles:** This is often the quickest route. Start by finding cheap starter lots and focusing on acquiring and selling collectibles. This generates cash very early on.
> 2.  **Painting and Writing:** These skills are excellent because they require only one skill and one object. Both scale hard with level, meaning the time invested translates directly into income as you advance.
> 3.  **Gardening:** While slower to start than painting or selling, once established, gardening can become a steady income source.
> 
> The key is to prioritize activities that require low upfront costs and have a high skill progression rate.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in GTA: San Andreas is determined by several factors. You can recruit up to seven gang members. This recruitment mechanic is influenced by:
> 
> *   **Missions:** Completing specific missions can unlock recruitment opportunities.
> *   **Conflict:** Killing rival gang members and police contributes to your standing.
> *   **Territory Control:** Taking and holding territory is a factor.
> *   **Appearance:** Your in-game appearance, including hair, tattoos, clothes, and wearing green in Grove Street territory, affects recruitment chances.
> 
> If you are struggling to recruit, focus on engaging in activities that increase your gang standing, such as taking territory or eliminating rivals.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> To handle Margit, focus on dodging her heavy attacks and managing your stamina carefully. When she uses her large, sweeping attacks, try to time your dodges to get in the recovery windows. Keep your distance when possible to avoid getting caught in her area-of-effect attacks.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're struggling in Tartarus, we need to focus on survivability and managing the encounters. We can look at how to handle specific challenges or general progression.
> 
> ```bonsai-spoiler
> When facing tough sections, focus on using the Shield of Chaos. Blocking turns a mistake into nothing, and it also sets up a rush that closes distance and hits hard. It's a good pick for bosses you keep dying to.
> ```

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, The opening tram ride and where it leads  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Reviewing the strategy for dealing with the giant headcrab boss. When you are up close, its front legs have huge damage. However, be aware that it will also lobs white acid mortars from its back, so you need to watch your positioning. Also, it will spawn baby headcrabs when it sees you, so keep an eye on those distractions while trying to focus on the main body. Watch your footing as it walks over the pits.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, The opening tram ride and where it leads, Long Jump Module  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are mostly new work and significantly longer than the original 1998 levels. Expect a lot more alien content to deal with. The core gameplay shape remains similar: no cutscenes, scripted scenes you walk through, a crowbar for crates and vents, and fights that are better from a doorway than from the middle of a room.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** Leaving the Forgotten Crossroads, False Knight, Watcher Knights  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The big armored bug boss in the Forgotten Crossroads is the False Knight. The key is to manage the damage. When he leaps and slams his mace, you need to jump the shockwave instead of backing off. Hitting his armor does nothing, so save your soul for when his armor empties and he falls. After the third time he exposes his head, he will break the floor, and you need to drop after him to finish him off.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Welcome to Hallownest. Don't worry about not having a map right now; that's part of the exploration.
> 
> To get a map, you need to find Cornifer, the humming cartographer. He's a key character in the town of Dirtmouth. Once you find him, you'll be able to buy his copy. The map won't fully fill in until you rest at a bench, and you need to own a quill from his wife to unlock that feature.
> 
> Benches are important. They are where you can rest, save your progress, restore your masks, and crucially, they are the only places where you can swap charms. Think of them as your central hub for managing your gear.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, The Crucible  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Fighting the Marauder can be annoying because of that red shield blocking everything. You need to manage your distance and timing.
> 
> 1. **Stay at mid-range:** Don't get too close, or it will draw your super shotgun too fast. Don't stay too far back, or it will throw axe waves that are hard to manage.
> 2. **Watch its movement:** When it winds up to swing its axe, its eyes will flash green. Hit it right in that instant. This will stagger it for a few seconds.
> 3. **Use burst damage:** After you stagger it, pour in the highest damage shots you have—think super shotgun, ballista, or rocket. Swap weapons between hits to keep applying pressure.
> 4. **Exploit the shield:** Grenades and rockets exploding near it will briefly drop its shield, giving you an opening to hit it hard.
> 5. **Summon control:** Make sure you kill the glowing wolf it summons right away. Clearing the other demons first keeps the arena space manageable.
> 
> Focus on hitting it during those green flash windows, and keep moving around so you aren't stuck in a static fight.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The basic combat loop in DOOM Eternal is about managing resources and never standing still. Here is the rundown:
> 
> 1.  **Shoot and Glory Kill:** Start by shooting weak enemies until they flash. Then, finish them off with a glory kill to regain health.
> 2.  **Fuel Management:** Ammo is scarce. You need fuel for the chainsaw, which is essential for clearing fodder demons. The chainsaw refuels automatically every twenty seconds, and fodder costs one unit.
> 3.  **Armor and Cooldowns:** Use the flame belch ability to hit groups of enemies and burn them for armor. This ability has a twenty-five-second cooldown.
> 4.  **Movement is Key:** Never stand still. You must constantly dash twice, jump twice, and swap weapons mid-fight instead of reloading.
> 5.  **Running Dry:** If you run out of everything, the game gives you the chainsaw for one more fodder kill, and the loop restarts.
> 
> Focus on keeping your movement high and managing that fuel/ammo balance.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Strategy Guide Mode active. I will keep the guidance focused on the fight against the Mother Demon.
> 
> To take down the Mother Demon, you need to manage her attacks carefully. She has a flame trail that tosses you into the air, and she follows up with four homing rockets.
> 
> The key to surviving her initial onslaught is using the fully upgraded Unmaker. You need to get the Unmaker to point-blank range. When it's close, its fire rate will stun her, which prevents her from launching the rockets. This leaves you only with dodging her flame trails.
> 
> Before you can reliably use the Unmaker, you must find the three Demon Keys. If you don't have those keys, you will fight a large horde first, and she will burn a significant amount of your ammo. Focus on finding those keys first.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, How the coloured keycards work, Finding your way through the dark, maze-like levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Doom 64 is a distinct sequel to Doom II. It features thirty-two new levels, redrawn larger sprites, and a slower, darker atmosphere. While it retains much of the classic Doom arsenal, it introduces new elements like the Unmaker and the Mother Demon.
> 
> The main differences are the darker mood, the new gameplay mechanics, and the expanded level count. Think of it as a continuation of the Doom experience with a more mature, atmospheric twist.
> 
> For now, focus on the core mechanics: find keys and skull keys to unlock doors. Remember that keys are lost when you leave a level, so don't worry about carrying them forward. Also, pay attention to switches and tripwires, as they are often the way to progress, and listen for sounds to indicate changes in the environment.

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in Grand Theft Auto V comes in five tiers, purchased from Ammu-Nation. Each tier is stronger than the last. The key thing to know is that once you buy a heavier armor set, the lighter ones you previously owned will disappear from the shelf. Also, body armor does nothing against melee weapons.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The three protagonists have distinct special abilities tied to their character. Michael slows down time during gunfights with his Area Kill, which lasts for thirty seconds once the ability bar is maxed. Franklin's Driving Focus slows the world while he is in any vehicle, making slides and gaps easier. Trevor's rage doubles his damage and makes him immune to everything for the duration of his rage.
> 
> These abilities have skill progression. For Michael, you grow the time you get by doing things like landing shots to build shooting skill. For Franklin, you grow the time by climbing while drifting, threading near misses at speed, driving into oncoming traffic, or holding ninety percent of a car's top speed. For Trevor, you grow his power by using his rage.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Foot chases through construction sites  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get weapons in GTA IV, you generally need to look for underground gun shops. The game has sixteen weapons in two tiers. You can find dropped guns lying on the ground, which will glow faintly orange. You can disarm enemies by shooting their hand instead of killing them.
> 
> For discounts, once you like Little Jacob enough, his van sells everything at sixty percent off.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Foot chases through construction sites  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is pretty straightforward. You save by walking over to the bed in a safehouse and choosing to sleep. This action also clears any wanted level you might have been on.
> 
> If you're looking to manage wanted levels, remember that getting outside the flashing circle without being seen and staying quiet for a few seconds will make the stars fade. If you get spotted leaving, the circle will re-center on you. You can also use things like swapping cars, entering bars, or using the subway above two stars to drop the wanted level without having your weapons or armor. Pay 'n' Spray works if you enter unseen in a car that fits, or a bed can clear it.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Crossing the crater radiation pools, Starting out in Fallout: New Vegas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Quarry Junction is dangerous because the area past Sloan is blocked by Deathclaws. These creatures are tougher than normal, and you have to be careful of the alpha male and the mother with the babies.
> 
> To survive going through it early, focus on avoiding direct confrontation if possible. The guide mentions that you can stop the Deathclaws if you stand on a rock they can't reach, dive into water, or if you have a crippled leg that slows their attack. A flare gun can also make them flee.
> 
> The main objective is to clear the entrance to get the reward, which is a Fat Man with two mini nukes and a light machine gun in the den.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Choosing early armor by Damage Threshold, not by looks  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random. They are fixed thresholds. If you have a Speech check, you need a Speech score of 25 or higher to succeed. If you don't meet that number, you fail.
> 
> You can try to succeed by using skill books or magazines, which are items you can carry. Magazines are good for a quick boost, and books give you permanent points.
> 
> The game doesn't hand out enough skill points to max everything, so you'll need to choose which skills to focus on.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Getting your first star in Bob-omb Battlefield  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to focus on specific moves during the three fights.
> 
> For the first fight, when he breathes fire, you need to get behind him, grab his tail, and spin the stick to build speed. Then, throw him into one of the four spiked bombs around the edge. If you miss, he will climb back up.
> 
> For the second fight, be aware that the stage will tilt when he lands, and he will throw single fireballs and teleport. Stick to maneuvering around the tilting stage and dodging those fireballs.
> 
> For the final fight at 70 stars, you need to throw him three times. His slams now send shockwaves along the floor, and he breathes fire upward that rains back down. Focus on timing your throws to avoid getting hit by the fire rain.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, Getting your first star in Bob-omb Battlefield, The three caps  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is managed by the eight-wedge power meter. You refill this meter by collecting coins, spinning hearts, or by surfacing in water.
> 
> To manage your health effectively:
> 1.  **Collect Coins and Hearts:** These are the primary ways to restore your meter.
> 2.  **Surfacing in Water:** This is another method for refilling the meter.
> 
> Focus on staying in areas where you can easily collect these items to keep your meter full.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell only comes to fourth place or lower. It runs along the ground with a siren, locks onto the leader, and flips anyone in its path. You can hold it behind your kart to block other shells before you fire.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Drifting and Mini-Turbos, Picking a kart for top speed  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To get a rocket start in Mario Kart 64, you need to hold the gas while the lights change from red to blue. If you hold it too early, your tires will spin, and you'll go slower than everyone else.
> 
> Here is the sequence:
> 1. Hold the gas as the lights change from red to blue.
> 2. Hop and hold to drift.
> 3. While holding the drift button, wiggle the control stick side to side.
> 4. Keep wiggling until the smoke turns white, yellow, then orange.
> 5. Let go of the drift button when the smoke is orange for a mini-turbo boost.
> 6. If you drive straight into a banana, a well-timed tap of the brake will save the spin and give you a musical note.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Rawk Hawk, Magnus von Grapple and Cortez  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The key to dealing with Hooktail's healing is managing the audience. She heals by eating members of the audience, so you need to keep the crowd thin. Also, remember that her bite cannot be blocked, so focus on keeping your own HP high rather than trying to guard against her attacks. Koops is useful here because his shell toss hits her first before you commit Mario. Fire is also noted as hurting her badly.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, The final battle: hands, patterns and the charge tell  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles are turn-based on a theatre stage. Mario and one partner take turns acting. In your turn, you have a few options.
> 
> An action command is essentially the specific button press you use during an attack to perform a special move or gain extra damage. It's not just a normal attack button; it's the timing of that press that matters for extra effects.
> 
> For example, when you attack, there's a specific moment to press the button to trigger a move that deals extra damage or a special effect. You can also use a button press to guard an enemy attack, which can reduce the damage you take.
> 
> The key is timing. You need to press the right button at the right moment for things like extra damage or to make the crowd cheer with a Stylish move.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the giant bulborb boss who keeps spawning enemies in Pikmin 2 depends entirely on which area you are in. If you are facing the Empress Bulblax, remember that she rolls across the map. Keep your Pikmin squad positioned on the sides to avoid getting hit, and use purple Pikmin to hit her head during the pauses when she rolls. If you are in a different area, the enemy spawning might be related to a specific enemy type or environmental hazard.
> 
> Since I don't know exactly which area you are in, I need a little more context to give you precise advice.

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Growing your Pikmin squad, Purple and White Pikmin  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to gather ten thousand Pokos of treasure to settle the company's debt. Treasures and enemy bodies both contribute to this total.
> 
> Regarding the day limit, yes, there is still a day limit. The day ends at sunset, and any Pikmin that is not with a captain or back at the Onion will be eaten when the night creatures wake up. You need to watch the sun and call everyone in early.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Fox and Falco are both top-tier characters in Melee, but they have very different playstyles.
> 
> Fox is the fastest character. His strengths are his speed: he has the second fastest dash, the third fastest fall, and a three-frame jump. He also has a very instant shield reflector that knocks opponents sideways. His main weakness is that his speed means he falls very fast, which makes him susceptible to being combo'd hard.
> 
> Falco is slower and heavier than Fox, but he has a different kind of threat. His laser move causes opponents to flinch and cancels when he lands, which shuts down approaches. His down air spike also spikes straight down. His main weakness is that he is slower than Fox.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Classic Mode's Metal Battle  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Damage in Melee isn't about depleting a health bar; it's about percentage damage. The higher the percentage damage you deal, the further the opponent gets sent. A stock is lost when you get launched past the edge of the screen, not when your health runs out.
> 
> Knockback is heavily influenced by that damage percentage. Since the game is faster than previous titles, you'll notice things like less freeze on hits, higher gravity, and faster falls. Momentum is key; you can carry momentum from a dash into a jump.
> 
> If you want to keep the pressure up, focus on landing hits that build up that percentage damage.
