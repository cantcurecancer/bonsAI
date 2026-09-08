# Knowledge-base answer eval — 2026-09-07 — CLEANBREAK-after

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
| judge_model | `` |
| samples_per_case | `3` |
| cases | `61` |
| run_minutes | `4.0` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **76.6%** (131/171) | every must-mention group found in the reply |
| No contradiction | **94.4%** (51/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **98.8%** (166/168) | no spoiler fence where none was due |
| Fence present when due | **77.8%** (7/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **98.6%** (136/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **60.7%** (37/61) | strictest view |

Mean seconds per answer: **1.3**. Mean request payload: **6896.2** bytes. Mean prompt tokens (Ollama prompt_eval): **1490.9**.
Mean system prompt length: **6478.1** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1865.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1943.0 | 1.3 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1955.0 | 1.6 |
| `A-DRG-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.6 |
| `A-L4D2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1891.0 | 1.3 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 0.9 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1777.0 | 1.5 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1721.0 | 1.1 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.4 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.9 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.4 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1823.0 | 1.5 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 0/3 | 1776.0 | 1.1 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.7 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 1.7 |
| `A-CP77-03` | strategy | — | — | — | 2/3 | 3/3 | 0/3 | 1541.0 | 1.0 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.5 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2011.0 | 1.7 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1904.0 | 2.3 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.5 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1937.0 | 1.3 |
| `A-RDR2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 0/3 | 1975.0 | 1.4 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.3 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1906.0 | 0.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 2/3 | 3/3 | 0/3 | 1595.0 | 1.2 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.5 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.7 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1979.0 | 1.3 |
| `A-OOT-02` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1878.0 | 1.2 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.3 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.4 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.2 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 2/3 | 3/3 | 0/3 | 1110.0 | 0.9 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1575.0 | 1.0 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 1.7 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2242.0 | 1.3 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2183.0 | 1.0 |
| `A-HK-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2286.0 | 1.4 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2230.0 | 1.5 |
| `A-DOOME-01` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2142.0 | 2.0 |
| `A-DOOME-02` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2108.0 | 2.0 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 1.4 |
| `A-DOOM64-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2199.0 | 1.8 |
| `A-GTAV-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2179.0 | 1.0 |
| `A-GTAV-02` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 2197.0 | 1.6 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2252.0 | 1.3 |
| `A-GTAIV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2318.0 | 1.4 |
| `A-FNV-01` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 2333.0 | 1.7 |
| `A-FNV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2396.0 | 1.5 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2220.0 | 1.8 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2182.0 | 1.2 |
| `A-MK64-01` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 2223.0 | 1.2 |
| `A-MK64-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2272.0 | 1.7 |
| `A-TTYD-01` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2219.0 | 1.2 |
| `A-TTYD-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2324.0 | 1.6 |
| `A-PIK2-01` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 1.9 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 0/3 | 3/3 | 3/3 | 0/3 | 2193.0 | 1.3 |
| `A-MELEE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2207.0 | 1.6 |
| `A-MELEE-02` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2219.0 | 1.4 |

## Failures worth reading

- **A-DRG-03** sample 1: missing facts: `shop`
- **A-L4D2-01** sample 1: missing facts: `open`
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-CP77-03** sample 1: spoiler fence missing, one was due
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 2: missing facts: `twice`
- **A-RDR2-01** sample 3: missing facts: `slow`, `bounty`; branch menu missing
- **A-RDR2-04** sample 3: spoiler fence present, none due
- **A-OOT-02** sample 2: missing facts: `megaton hammer`
- **A-OOT-02** sample 3: missing facts: `megaton hammer`
- **A-GTASA-01** sample 3: spoiler fence present, none due
- **A-BMS-01** sample 1: missing facts: `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`
- **A-BMS-02** sample 1: missing facts: `kept the same`
- **A-BMS-02** sample 2: missing facts: `kept the same`
- **A-BMS-02** sample 3: missing facts: `kept the same`
- **A-DOOME-01** sample 1: missing facts: `shield blocks`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`
- **A-DOOME-02** sample 2: missing facts: `glory kill`
- **A-GTAV-02** sample 1: missing facts: `yellow meter`
- **A-GTAV-02** sample 3: missing facts: `yellow meter`
- **A-GTAIV-02** sample 1: missing facts: `clears your wanted level`
- **A-GTAIV-02** sample 2: missing facts: `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `clears your wanted level`
- **A-FNV-01** sample 1: missing facts: `cripple a leg`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`
- **A-FNV-02** sample 3: missing facts: `Goodsprings`
- **A-MK64-01** sample 1: missing facts: `hold it behind your kart`
- **A-MK64-01** sample 2: missing facts: `hold it behind your kart`
- **A-MK64-02** sample 1: missing facts: `spin your tires`
- **A-TTYD-01** sample 1: missing facts: `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 2: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 1: missing facts: `throw purples at her head`
- **A-PIK2-01** sample 3: missing facts: `kill the mother`, `throw purples at her head`
- **A-PIK2-02** sample 1: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-PIK2-02** sample 2: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-PIK2-02** sample 3: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-MELEE-02** sample 1: missing facts: `launched off the screen`
- **A-MELEE-02** sample 2: missing facts: `launched off the screen`
- **A-MELEE-02** sample 3: branch menu missing

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You need to manage the fight against the Glyphid Dreadnought by focusing on its weak points.
> 
> Here are the key things to remember:
> 
> *   **Kiting:** Keep moving between waves. This keeps the Dreadnought busy and allows you to focus your fire.
> *   **Weak Points:** Target the armor plates that open up when they are hit.
> *   **Overclock/Nuke:** Save your powerful weapons or abilities for when the armor starts to break.
> 
> If you are facing the Dreadnought Twins, remember to split your fire evenly between them. Don't burn one down entirely; focus on keeping them both damaged while letting their health bars separate.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You are struggling with the Dreadnought Twins because they are designed to keep you from focusing on one target. The key here is to split your fire evenly between them. Don't try to burn one down completely; instead, spread your damage across both. The important thing is to let their health bars drift apart while they are actively healing, because the healing mechanic never actually starts.
> 
> Focus on applying consistent damage to both simultaneously.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> It pays for weapons instead of your dwarf. Keep mining it for whichever weapon is carrying your run.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To deal with the Tank, focus on avoiding his big attacks. He throws chunks of concrete, so try to slip past him rather than run directly into his attacks. Wait for the rest of the infected team to get up before you commit to a fight. If a teammate has someone pinned down, try to put your body between that survivor and their friends; bullets hitting you are just bullets. When someone runs at you with a revved chainsaw, you can punch them before they even get close. If you can get him to crouch through a vent, he becomes much slower and harder to hit.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks when she is startled. She ignores gunfire that isn't aimed directly at her and ignores other infected. What wakes her up is usually a flashlight or a survivor getting too close. If you hear her growl, back off. If you keep coming, she will stand up, flail, and then charge you for a one-hit kill. Fire will slow her down, but only after she is already startled. The best way to handle her is to light a wandering witch while she is calm and keeps full speed.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus revolves around managing your pounce mechanics and positioning relative to the horde.
> 
> Pounce damage scales with distance; you can deal up to 25 damage on a long pounce, meaning height and running up are more important than just surprise. Don't just try to surprise everyone; take the straggler. If you absolutely have to be near the main group, move like a common player, as the melee claw reads as horde damage until someone checks you.
> 
> Since the pounce recharges quickly, holding the crouch and re-pouncing is key to maintaining pressure on the enemies.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are items you can use to manipulate surfaces in the game. There are three main types:
> 
> *   **Blue Gel:** This one is used for bouncing. The higher you drop onto it, the higher you bounce off. Use this to gain height.
> *   **Orange Gel:** This one removes friction. If you coat a surface with this, you keep the speed you have when you arrive at it.
> *   **White Gel:** This allows you to portal a surface that couldn't be ported before. However, it won't stick to things like cubes or turrets, and a cleansing spray will remove it.
> 
> Which aspect of the Gels are you trying to figure out? Are you looking to gain height, maintain speed, or change how you portal things?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Excursion Funnel is a mechanic for traversing the map using a weightless beam. If you find that it is pushing you in the wrong direction, the game indicates that you need to find the button to reverse the direction before concluding the route is shut. It functions by passing through portals, allowing it to cross chambers and ferry items like gel and cubes along with you.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're stuck in the Sandtraps area and dealing with the Antlions. Remember, they hunt by vibration, so staying on the rocks is key when you're near the coast. If you're near the Antlion Guard, you need to get the pheropod from them. Once you have that, throwing it at the Antlions will make them read you as a guard, and they will swarm whatever you marked.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you obtain the pheropod from the Antlion Guard, you throw it. The Antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw various items, depending on what you are targeting. You can use it for secondary pulls and holds, as well as primary punts.
> 
> Items you can generally use include:
> *   Explosive barrels
> *   Sawblades
> *   Manhacks and scanners
> 
> You can also throw grenades, and they will generally go back where they came from. It will not lift most enemies, but it is effective against certain objects.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. Leave the Twin Fists of Malphon until later — they are the fastest, but they need you standing inside everything. The Heart-Seeking Bow and the Adamant Rail both want range and punish standing still, and the Rail can leave you reloading at the worst possible moment.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're struggling with the fight against Theseus and Asterius. The key there is managing both of them at once. Asterius, the bull, telegraphs a long charge, so you need to sidestep that attack to avoid getting stuck. Theseus, on the other hand, throws spears and calls down god's power, which you need to watch for on the ground before it lands. Most players find it easier to take down Asterius first because he's more predictable.
> 
> If you're struggling with dodging Asterius, focus on that movement. If you're having trouble dealing with Theseus's attacks, try focusing on blocking or positioning yourself to avoid the direct hits.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game doesn't have a single "ending" in the traditional sense; it's more about completing different runs and unlocking new challenges or cosmetic rewards. Beating the final boss is just one part of the journey.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused OS that ignores time. Its primary functions are to cut damage taken and prevent your health from dropping below a quarter. Furthermore, after you defeat an enemy with it, it returns a quarter of your maximum health. Its specific effect on melee weapons depends on the model installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first playthrough in Cyberpunk 2077, the attribute points you put into them are important because they define your core playstyle. The general advice is to focus on two attributes early on.
> 
> Body and Reflexes are good for a straightforward fighter. They help you survive mistakes. Intelligence is the route if you want to play as a netrunner, focusing on quick hacks before engaging in direct combat, but you risk being fragile if you get caught. Technical Ability is useful for almost every build because it unlocks crafting and the cyberware you actually want. Cool rewards patience and stealth, which can be useful depending on how you want to approach things.
> 
> Spreading points evenly is generally discouraged because the perks worth having are often behind attribute thresholds, meaning an even spread won't get you the best early perks.
> 
> Since you haven't specified a playstyle yet, I'll give you a starting point based on the general advice.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> Choose where you are stuck below.

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Focus on high DPS builds or Sandevistan usage. Prioritize destroying the legs first, then use cover while managing the rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You need to be smart about this. The Deathclaw has very high health and resists a lot of damage, especially from energy weapons.
> 
> The key is distance and cover. When it first appears, don't rush it. Use the environment to your advantage. Try to keep your distance and use cover to mitigate the damage it can do.
> 
> When it gets close, remember that it has moves like a ground stomp and headbutts to stagger you. If you can get close enough, you can try to use physical weapons, but be aware that its hide is tough. Some players find that using distractions or waiting for it to tire itself out is the best early strategy.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Your SPECIAL points at the start are crucial because they determine which perks you can even take. Since you start with one point in each stat and 21 to spend (total 28), here is a quick breakdown of what those stats generally do:
> 
> *   **Intelligence (INT):** This is often considered the quiet strong pick. It raises how fast you level up, meaning every other perk arrives sooner.
> *   **Strength (STR) with Endurance (END):** This combination makes you a solid melee or heavy weapons survivor, forgiving mistakes.
> *   **Agility (AGI) with Perception (PER):** This setup makes you a sniper or a V.A.T.S. route character, allowing you to kill things before they reach you and fold if you get overwhelmed.
> *   **Charisma (CHA):** This is generally the weakest of the five early on, but it pays off later for settlement and speech-based builds.
> 
> The key advice is to pick what makes the first ten hours enjoyable rather than just optimizing for the end game. You can always raise any stat later with bobbleheads and level-ups.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If Feral ghouls are swarming you, focus on their weaknesses. The head is the reliable weak point. Take a leg off one, and it will stop attacking altogether. Taking both arms off does not stop them. They deal radiation damage physically, so be mindful of that too, especially in heavily irradiated areas like the Glowing Sea where they regenerate if you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor suddenly stopped working, check a few things. First, ensure you have enough fusion core energy. The frame drains over time and drains faster when you sprint or use V.A.T.S. If the core runs out, you can still walk, but you'll lose V.A.T.S. and steady aim, and you'll be over-encumbered.
> 
> If the issue is related to repairs or upgrades, make sure you are at a power armor station or a settlement where you can access the necessary services. Remember that upgrading a piece costs the same materials regardless of your current tier, though waiting for Armorer and Science ranks to increase might be better for later models due to rarer materials.
> 
> If you suspect a mechanical failure, try running diagnostics if the game has any, or simply check if you have any immediate consumables like stimpaks for health or other items that might be related to system function.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Legendary enemies in Fallout 4 have a specific mechanic: at about half their health, they will heal themselves completely and gain a new ability. This means you need to manage your damage carefully; spending all your resources on the first half of the fight is a mistake.</bonsai-spoiler>
> You are currently fighting a legendary enemy. Remember that once it hits that mid-fight threshold, it's going to get a significant boost. Focus on chipping away at its health rather than trying to finish it quickly.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It's important to understand that Red Dead Redemption 2 is designed to be a slower, more deliberate experience than GTA. Arthur Morgan is heavy, and things like riding or picking up items take time, unlike the instant actions in GTA.
> 
> Here are a few initial tips:
> 
> 1.  **Pacing:** Don't try to sprint through towns like you might in GTA. Be patient. Use cover and ride when possible.
> 2.  **Law Enforcement:** Be aware that lawmen are persistent. If you are caught doing something illegal, a bounty will be placed on you in that region, and it will stay there until you pay it off.
> 3.  **Bounties:** If you are being pursued, focus on avoiding witnesses or dealing with the bounty at a post office. Wearing a mask can reduce the bounty size.
> 4.  **Camp Management:** Treat your camp as a base. Don't just run around the world; establish a routine for restocking and upgrading your gear.
> 
> We need to figure out where you are starting out.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is a gradual process based on your actions. It's not a quick fix; it's about consistent behavior.
> 
> Here is how you generally raise your Honor:
> 
> 1.  **Positive Interactions:** Greeting people politely, helping strangers on the road, and performing acts of kindness will increase your Honor.
> 2.  **Ethical Choices:** Choosing to pay bounties instead of resorting to robbery, and avoiding the killing of civilians and animals you do not intend to use, will positively affect your standing.
> 3.  **Consistency:** Honor is a slider, not a switch. A single bad day won't completely undo good behavior, but consistent positive actions build up your standing over time.
> 
> Essentially, the game tracks your interactions and decisions. Focus on the actions that align with a more law-abiding and helpful approach to gameplay.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending involves Arthur's difficult choices regarding his loyalty and his path forward in the world he helped shape.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse bonding is key to controlling your mount. Bond level dictates how much stamina you get, better handling, and eventually maneuvers like the rear and the drift. You raise the bond by riding, feeding, brushing, patting, and calming the horse during danger. A high-bond horse will also stop throwing you when something scares it. Remember that bond is per horse, so switching mounts resets the process.
> 
> If you are dealing with a specific horse, focus on those bonding actions. If the issue persists across multiple horses, consider the horse's breed; drafts carry more and panic less, while racing breeds are quick but fragile. Early on, the bond matters more than the stat line.

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on the pickups scattered around the level. Each pickup adds 15 seconds to your round timer.
> 
> Here are the main things to consider:
> 
> *   **Prioritize Time Over Crowd:** The biggest mistake new players make is staying in a fight when you should be focusing on time. A round extended by pickups is worth more than clearing a large crowd.
> *   **Scavenge Pickups:** As you move through the level, look for and collect these pickups. This is your primary method for extending the round.
> *   **Know When to Break Off:** You need to decide strategically when to stop fighting and go for the time extension instead.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock within a single zone. The objective here is to extend the time by hitting objectives that pop up mid-riot, rather than focusing on survival.
> 
> Revolution mode is centered around the story. This mode involves a chain of missions per zone, with objectives handed out by the resistance, and it is the mode where characters and zones are unlocked.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you are stuck in the Shadow Temple and looking for missing areas. The general advice is that almost everything in the temple is there, but you need to use the Lens of Truth and the invisible floors/walls to see them.
> 
> Here is what you need to know:
> 
> *   **Lens of Truth:** Equip this item. It will reveal invisible floors, walls, and chests. Be careful, as holding it drains magic. Use it in short bursts, and keep your green potions and fairies handy to keep your magic up.
> 
> Since you are focused on the missing floors, the key is using the Lens of Truth to reveal what is hidden.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle Volvagia, you need to focus on timing your attacks with the fire dragon. When it pops out of the floor holes, hit its head immediately. While it's stunned, use the Megaton Hammer to slash it. If it flies around the room, use the hookshot to pull it back down. Keep your Goron Tunic on and make sure you stay away from the lava edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Long rests are a significant resource sink in Baldur's Gate 3. They cost you camp supplies and restore your spells, health, and most abilities. They are also what drives companion scenes and personal quests. Hoarding rests means you might miss out on important story moments. Supplies are generally not a major issue since you can pick up food.
> 
> If you are struggling with resource management, consider how many rests you are taking versus how much story progression you are experiencing.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need coverage. Think about having someone to talk, someone to heal, someone to handle traps and locks, and enough damage. A good starting point is to aim for a mix that covers those bases.
> 
> You can look at characters like a Bard or Paladin for talking, a Cleric or Druid for healing, and a Rogue or Ranger for trap/lock skills. One character often covers two of those roles. The party you absolutely cannot cover is one with no healing at all.
> 
> Focus on ensuring you have at least one dedicated healer. That is usually the most critical element for surviving early encounters.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": 1200}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest ways to make money early in The Sims 4 revolve around maximizing skill progression quickly and leveraging simple, scalable income streams.
> 
> 1. **Painting and Writing:** These are often cited as the fastest because they require minimal initial setup—just one skill and one object. Both skills scale rapidly with level, meaning once you get a few paintings or books done, the income potential increases quickly.
> 2. **Selling Collectibles:** If you can find or create items that are in demand, selling them early can provide a decent starting cash injection. This is good for getting those initial funds to buy necessary things like starter lots or basic furniture.
> 3. **Gardening:** While perhaps not the *fastest* in terms of immediate cash flow, gardening offers a steady, scalable income once established, and it can be a good passive earner later on.
> 
> Focus on getting those initial skills up quickly through focused gameplay.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in GTA: San Andreas is governed by the Respect mechanic. You can recruit up to seven gang members. This mechanic is influenced by several factors: completing missions, killing rival gang members and police, taking territory, spraying over tags, and appearance nudges like hair, tattoos, clothes, muscle, and wearing green in Grove Street territory. If you wear the wrong colors at home, kill your own gang members, or lose turf, your respect level will fall.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> To deal with margit, focus on dodging her attacks and managing your stamina. Pay close attention to her attack patterns and try to dodge her heavy hits. Use your healing items wisely to stay in the fight when you get hit.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> I can help you figure out how to survive Tartarus. Since you are focusing on keeping your run going, we need to look at how to manage the encounters.
> 
> The general advice for Tartarus is to focus on survival and managing the waves. Since you are dying, it usually means you are taking too much damage or getting overwhelmed by the sheer number of enemies.
> 
> We can look at a few things:
> 
> 1.  **Weapon Choice:** Are you using the Shield of Chaos? It's noted as the most survivable weapon because blocking turns mistakes into nothing and sets up good offense.
> 2.  **Boss Management:** If you are dying to a specific boss, we should focus on their mechanics. For instance, against Theseus and Asterius, focusing on Asterius first can sometimes make the run smoother.
> 3.  **Upgrades:** Are you utilizing the permanent upgrades, like the Mirror of Night, which offers options for things like Death Defiance to give you extra chances?
> 
> To give you the best advice, I need a little more context on what exactly is causing the death. Are you struggling against a specific enemy type, or is it just general damage management?

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, The opening tram ride and where it leads  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Strategy guide mode active. I will keep the coaching spoiler-minimized.
> 
> To damage the giant headcrab boss in the Xen caverns, you need to focus your fire on the pale egg sac swinging under its body. Shots not aimed at the sac are wasted. When it gets close, its front legs will slash for significant damage. Be careful, though; it walks over pits, so watch your footing. When it dies, the sac bursts, releasing more headcrabs, so back away before that happens.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, The opening tram ride and where it leads, Long Jump Module  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are largely new work. They are significantly longer than the original 1998 levels, so expect a much larger time commitment for that alien world. The core gameplay shape remains similar: no cutscenes, no scripted scenes you walk through, and you'll rely on tools like the crowbar for crates and vents.
> 
> The main difference is the sheer scope and length of the alien content.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** Leaving the Forgotten Crossroads, False Knight, Watcher Knights  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> To beat the big armored bug boss in the Forgotten Crossroads, focus on exploiting the armor mechanics. When he leaps and slams his mace, jump the shockwave instead of backing away. Hitting the armor won't give you soul, so save your resources for when the armor breaks and his head is exposed. Pile hits on the exposed head, and then back off immediately because he will rage and rain barrels, which you can knock back into him for damage or stagger him. After the third time he exposes his head, the floor will break, and you need to drop after him to finish the fight.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Getting a map in Hollow Knight is tied to a specific character. You need to find Cornifer, the humming cartographer. Once you find him, you'll be able to buy his map. The map itself won't show you everything at once; it will fill in as you rest at benches.
> 
> Benches are important because they serve several functions. They are where you can rest, which lets you save your progress. They are also the only places where you can swap charms.
> 
> Here is what you need to focus on right now:
> 
> 1.  **Find Cornifer:** Look around the starting area for the cartographer.
> 2.  **Get the Map:** Interact with him to purchase the map.
> 3.  **Use Benches:** Use the benches to rest and unlock new areas as the map fills in.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, The Crucible  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Fighting the Marauder is about managing its positioning and exploiting brief openings. Since it blocks everything, you need to stay in a mid-range where you can control the engagement.
> 
> Here are the key tactics:
> 
> 1.  **Maintain Distance:** Don't get too close, or it will draw your super shotgun too quickly. Don't stay too far away, or it can throw axe waves. Find that sweet spot.
> 2.  **Watch Its Movement:** Pay close attention to where it moves. If it runs, it's coming in to swing. If it dashes, it's repositioning. Use your dashes to reposition yourself relative to it.
> 3.  **Exploit the Opening:** When it winds up its axe, its eyes flash green. This is your window. Hit it the instant it flashes and use your highest damage per shot—super shotgun, ballista, or rocket.
> 4.  **Use Environmental Effects:** Grenades and rockets exploding near it will briefly drop its shield, giving you a chance to land a hit.
> 5.  **Clear the Support:** Make sure you clear any other demons near it first, as they can complicate the fight.
> 
> Focus on timing your attacks with its wind-up and using your movement to avoid being blocked.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The basic combat loop in DOOM Eternal is about managing your resources—ammo and fuel—while constantly moving.
> 
> Here is the rundown:
> 
> 1.  **Shoot Weak Enemies:** Start by shooting weak enemies until they flash. Glory killing them gives you health.
> 2.  **Chainsaw Fodder:** Use the chainsaw on fodder demons. This gives you a shower of ammo. Remember, each fodder kill costs one fuel unit, and the chainsaw refills automatically every twenty seconds.
> 3.  **Flame Belch:** Use the flame belch on groups of enemies to kill them burning. This is how you generate armor. This ability has a twenty-five-second cooldown.
> 4.  **Manage Heavy Demons:** Heavy demons cost all three fuel units and cannot be sawed. You need to manage these carefully.
> 5.  **Movement is Key:** Never stand still. You must dash twice, jump twice, and swap weapons mid-fight instead of just reloading.
> 6.  **Running Dry:** If you run out of everything, the game will hand you the chainsaw for one fodder kill, and the loop restarts.
> 
> The core idea is to keep the action moving and cycle through shooting, sawing, and belching to maintain your ammo and fuel reserves.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> I can give you the basic strategy for taking down the Mother Demon. Remember, this is about managing her attacks.
> 
> First, you need to focus on getting the Demon Keys. You'll need all three of them to fight her effectively.
> 
> When she starts her attack, she tosses you into the air, and four homing rockets will follow. You need to dodge those rockets. The key to surviving her initial onslaught is using the fully upgraded Unmaker at point-blank range. Its fire rate will stun her, which stops her from launching the rockets, leaving you only to dodge the flame trails.
> 
> If you don't have all the Demon Keys, you will fight a large horde first, and she will burn a lot of your ammo doing it. Focus on securing those keys before engaging her directly.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, How the coloured keycards work, Finding your way through the dark, maze-like levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Doom 64 is a separate title from the original Doom games. It takes the core concept but significantly expands it with thirty-two new levels, redrawn sprites, colored lighting, and a slower, darker atmosphere. It includes the original Doom arsenal plus the Unmaker, and new enemies like the fast, half-invisible nightmare imp and the Mother Demon.
> 
> The key difference is the atmosphere and the new mechanics, like the colored keycard system and the fact that lines can be switches or tripwires, not just doors.
> 
> Since you are starting out, focus on finding those colored keycards. Remember that keys are lost when you leave a level, so don't worry about carrying them forward. Listen for sounds, as switches and doors will give you clues about what to try next.

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in GTA V comes in five tiers, purchased from Ammu-Nation. Each tier is stronger than the last. However, it's important to know that body armor does nothing against melee attacks. You still need to rely on your cover and aiming skills to survive those close-quarters encounters.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The special abilities are tied to the three protagonists: Michael, Franklin, and Trevor. Each has a unique ability that affects gameplay differently.
> 
> Michael has Area Kill, which is essentially bullet time for shootouts, lasting thirty seconds once the ability bar is maxed.
> 
> Franklin has Driving Focus, which slows down the world while he is in any land vehicle, including tanks. It starts at a third of its final length. You build this skill by doing things like climbing while drifting, threading near misses at high speed, or driving into oncoming traffic.
> 
> Trevor has Rage, which doubles his damage and makes him immune to everything for the duration.
> 
> The bar for each ability refills differently, and the skill behind it grows the longer you use it.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Foot chases through construction sites  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You can get weapons in GTA IV in a few ways. The basic weapons are usually dropped on the ground with an orange glow. You can also find fixed spawn points around the city that refill the same weapon every time you visit.
> 
> For better gear, you have to get into the underground gun shops, which open up after you complete the "Do You Have Protection?" mission. Once you get into the shop, Little Jacob's van sells everything at a sixty percent discount.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Foot chases through construction sites  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is straightforward. You save by walking up to a bed in a safehouse and choosing to sleep. This action will clear any current wanted level you have.
> 
> If you are looking for more specific advice on gameplay mechanics, let me know.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Crossing the crater radiation pools, Starting out in Fallout: New Vegas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The danger at Quarry Junction comes from a few specific enemies and environmental hazards. You need to be aware of the Deathclaws guarding the entrance. They are tougher than normal, and you need to know how to deal with them if you encounter them.
> 
> To survive, focus on the tips listed in the guide:
> 1. **Watch for hazards:** Be aware of the environment.
> 2. **Use environmental advantages:** If you can stand on a rock they can't reach, or dive into water, they stop attacking.
> 3. **Use weapons effectively:** A flare gun can make them flee.
> 4. **Know the reward:** Clearing the area gives you access to a Fat Man with heavy weaponry.
> 
> Since you are asking about going through it early, the main thing is preparation and knowing how to handle the immediate threats.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Choosing early armor by Damage Threshold, not by looks  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random. Instead of rolling dice, the game uses a fixed threshold for every check. For example, a Speech check needs a Speech score of 25 or higher to succeed. If you fail, it's because your score is below that required number.
> 
> You can fail checks if your score is too low for the required threshold. The game doesn't randomly penalize you for failing; it just means you didn't meet the minimum requirement.
> 
> If you want to improve your chances of success, you need to increase your relevant skill score through leveling up, taking skill books, or other in-game actions.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Getting your first star in Bob-omb Battlefield  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to focus on the first fight, which starts at eight stars. Here is the basic tactic:
> 
> 1.  **Fire Breath:** When Bowser breathes fire, jump into the air. This prevents him from shaking the ground and stunning you.
> 2.  **Claw Attack:** If he gets close and claws you, get behind him.
> 3.  **Spin and Throw:** Grab his tail, then spin your stick to build speed. Use this momentum to throw him into one of the four spiked bombs around the edge.
> 
> If you miss the bomb, he will climb back up. Try to keep your momentum going so you can get in position for the next throw.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, Getting your first star in Bob-omb Battlefield, The three caps  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is managed by the eight-wedge power meter. You refill this meter by collecting coins, spinning hearts, or by surfacing in water.
> 
> To start, focus on collecting coins and hearts as you progress through the castle paintings, as these are the primary ways to keep your health full. When you encounter water, use that to refill your meter.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Picking a kart for top speed  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell is a dangerous item. It only appears for players in fourth place or lower. It moves along the ground with a siren sound and tries to home in on the leader.
> 
> To block it, you need to hold your kart and time your action correctly. When you see it coming, you need to tap the brake. This action saves your kart from being flipped and shows a musical note.
> 
> If you are in a good position, you can also hold the blue shell behind your kart to block other shells from hitting you.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Drifting and Mini-Turbos, Picking a kart for top speed  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To get a rocket start, you need to hold the gas while the lights change from red to blue. If you hold it too early, you'll spin out and go slower than everyone else.
> 
> Here are the steps:
> 1. Hold the gas pedal steady as the track lights change from red to blue.
> 2. Once the lights are blue, you need to hop into a drift by holding the drift button.
> 3. While drifting, wiggle the control stick left and right.
> 4. Keep holding the drift button while wiggling the stick.
> 5. When you let go of the drift button while you are on the orange smoke, you'll get a mini-turbo boost. If you hit a banana, a well-timed brake tap can save you from spinning and show a musical note.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Rawk Hawk, Magnus von Grapple and Cortez  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> To deal with Hooktail healing, you need to manage the crowd size. She heals by eating members of the audience. Keep the number of audience members low so she has fewer targets to feed on. Also, remember that her bite cannot be blocked, so focus on keeping your own HP high rather than relying on guards for damage mitigation. Koops is useful because his shell toss hits her first. Fire is also effective against her.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, The final battle: hands, patterns and the charge tell  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles are turn-based. Mario and one partner take turns acting. In your turn, you choose an action command. This is the specific button press you need to time correctly for extra damage.
> 
> When an enemy attacks, you can use the 'A' button to guard, which reduces the damage they deal to you. If you time the 'B' button perfectly during a tiny window when an enemy attack lands, you can superguard, which does no damage and gives you a point back.
> 
> The goal is to use those action commands and timing windows to deal damage and manage your resources.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the giant bulborb boss means focusing on its behavior rather than just attacking it randomly. If it's in the Frontier Cavern, it's actively pumping out larvae, so your main priority should be killing the mother, not the smaller children. When it rolls from wall to wall, keep your Pikmin squad positioned on the sides to manage the movement, and use purples to hit it when it pauses.
> 
> If you encounter the Burrowing Snagret, it hides underground until you get close, then pecks. A stuck snagret is free damage, so focus on getting those stuck ones. Its bigger cousin, the Pileated Snagret, will come out and walk after you, so keep an eye on that one too.
> 
> If you are fighting a different enemy that empties your squad, remember the general tactics: spotty Bulbears require all-or-nothing engagement with purples from the side. Gatling Groinks fire mortars, and you need to manage their range.
> 
> Since you are asking about the giant bulborb boss, let's focus on that.

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Growing your Pikmin squad, Purple and White Pikmin  
**Checks:** facts ❌ · contradiction ❌ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to gather ten thousand Pokos of treasure to pay off the company's debt. Treasures and enemy bodies both contribute to this total.
> 
> Regarding the day limit, there is still a day limit. The game ends at sunset. Any Pikmin that is not with a captain or back at the Onion will be eaten when the night creatures wake up. You need to watch the sun and call everyone in early.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Fox and Falco are strong because they both utilize fast movement and specific moves that disrupt the opponent.
> 
> Fox is the fastest character. His main strengths are his quick dash, fast fall, and a three-frame jump. His shield reflector is instant and knocks opponents sideways, which is great for keeping pressure on them. However, his speed is also his weakness; falling fast means he can get combo'd hard.
> 
> Falco is slower and heavier, but he has a different kind of strength. His laser move makes opponents flinch, and it cancels when he lands, which shuts down approaches. His down air spike also goes straight down. The Falco pillar—reflector into a down air spike into more—is considered one of the best shield-wearing routines in the game. His weakness is generally being slower than Fox.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Classic Mode's Metal Battle  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Damage and knockback in Melee work differently than traditional health bars. Instead of losing health, damage is tracked as a percentage. The higher the percentage, the further the hit sends you. If you get launched past the edge of the screen, you lose a stock, not your health.
> 
> When it comes to knockback, it's tied directly to that damage percentage. A hit that deals more damage will have a greater knockback effect, sending you further away.
> 
> The game also has other mechanics that affect movement, like the faster falls and higher gravity compared to other games.
