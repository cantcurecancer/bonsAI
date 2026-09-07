# Knowledge-base answer eval — 2026-09-07 — before-wave2

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.07` |
| corpus_sections | `266` |
| prompt_variant | `baseline` |
| kb_placement | `early` |
| voice_preset | `` |
| think_effort | `off` |
| samples_per_case | `3` |
| cases | `61` |
| run_minutes | `5.1` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **70.8%** (121/171) | every must-mention group found in the reply |
| No contradiction | **100.0%** (54/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **98.2%** (165/168) | no spoiler fence where none was due |
| Fence present when due | **77.8%** (7/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **95.7%** (132/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **55.7%** (34/61) | strictest view |

Mean seconds per answer: **1.7**. Mean request payload: **6834.3** bytes. Mean prompt tokens (Ollama prompt_eval): **1479.6**.
Mean system prompt length: **6418.2** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1848.4**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1943.0 | 4.3 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 1955.0 | 1.7 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.7 |
| `A-L4D2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.8 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1891.0 | 1.5 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 1.0 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1777.0 | 1.6 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1721.0 | 1.2 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.5 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.9 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.5 |
| `A-HADES-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1823.0 | 1.6 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 1/3 | 2/3 | 0/3 | 1776.0 | 0.9 |
| `A-CP77-01` | expert | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.8 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 2.3 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1541.0 | 1.4 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.5 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2011.0 | 2.2 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1904.0 | 2.1 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.7 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.5 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1937.0 | 1.3 |
| `A-RDR2-01` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 1.6 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.3 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 2/3 | 0/3 | 1906.0 | 0.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1595.0 | 1.2 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.2 |
| `A-SOE-02` | speed | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.7 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1979.0 | 1.3 |
| `A-OOT-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1878.0 | 1.4 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.2 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.6 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.2 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1110.0 | 0.9 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1575.0 | 1.2 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 1.6 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2171.0 | 1.3 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2127.0 | 1.2 |
| `A-HK-01` | strategy | 3/3 | 0/3 | 3/3 | 0/3 | 3/3 | 0/3 | 2170.0 | 1.4 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2230.0 | 1.2 |
| `A-DOOME-01` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2156.0 | 2.5 |
| `A-DOOME-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2108.0 | 2.2 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 1.7 |
| `A-DOOM64-02` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2057.0 | 1.7 |
| `A-GTAV-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2179.0 | 1.0 |
| `A-GTAV-02` | strategy | 3/3 | 0/3 | — | 3/3 | 2/3 | 0/3 | 2197.0 | 1.5 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 0/3 | 2193.0 | 1.5 |
| `A-GTAIV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2245.0 | 1.9 |
| `A-FNV-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2320.0 | 2.7 |
| `A-FNV-02` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2381.0 | 1.8 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2173.0 | 3.2 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2136.0 | 2.6 |
| `A-MK64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2143.0 | 2.1 |
| `A-MK64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2142.0 | 2.4 |
| `A-TTYD-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2221.0 | 1.7 |
| `A-TTYD-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2316.0 | 2.4 |
| `A-PIK2-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 3.3 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2126.0 | 2.7 |
| `A-MELEE-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2207.0 | 4.6 |
| `A-MELEE-02` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2192.0 | 3.5 |

## Failures worth reading

- **A-DRG-02** sample 2: branch menu missing
- **A-L4D2-01** sample 3: missing facts: `open`
- **A-HADES-02** sample 2: missing facts: `first`
- **A-HADES-03** sample 2: missing facts: `not the end`; spoiler fence missing, one was due; branch menu missing
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-01** sample 1: missing facts: `damage taken`
- **A-CP77-01** sample 2: missing facts: `damage taken`
- **A-CP77-01** sample 3: missing facts: `damage taken`
- **A-FO4-05** sample 2: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-RDR2-01** sample 1: missing facts: `bounty`
- **A-RDR2-01** sample 2: missing facts: `bounty`
- **A-RDR2-03** sample 2: branch menu missing
- **A-SOE-02** sample 2: missing facts: `score`, `story`
- **A-OOT-02** sample 1: missing facts: `megaton hammer`
- **A-BMS-01** sample 1: missing facts: `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`
- **A-BMS-02** sample 1: missing facts: `mostly new`, `kept the same`
- **A-BMS-02** sample 2: missing facts: `kept the same`
- **A-BMS-02** sample 3: missing facts: `kept the same`
- **A-HK-01** sample 1: missing facts: `hit the head`; spoiler fence present, none due
- **A-HK-01** sample 2: missing facts: `hit the head`; spoiler fence present, none due
- **A-HK-01** sample 3: missing facts: `hit the head`, `jump the shockwave`; spoiler fence present, none due
- **A-DOOME-01** sample 1: missing facts: `shield blocks`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`
- **A-DOOME-02** sample 1: branch menu missing
- **A-DOOM64-02** sample 1: missing facts: `separate sequel`
- **A-DOOM64-02** sample 3: missing facts: `separate sequel`
- **A-GTAV-02** sample 1: missing facts: `yellow meter`
- **A-GTAV-02** sample 2: missing facts: `yellow meter`; branch menu missing
- **A-GTAV-02** sample 3: missing facts: `Michael slows time`, `yellow meter`
- **A-GTAIV-01** sample 1: branch menu missing
- **A-GTAIV-02** sample 1: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 2: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-FNV-01** sample 1: missing facts: `cripple a leg`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-01** sample 3: missing facts: `alpha male`, `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`
- **A-TTYD-01** sample 1: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 2: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 3: missing facts: `eats the audience`, `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 2: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 1: missing facts: `kill the mother`, `throw purples at her head`
- **A-PIK2-01** sample 2: missing facts: `kill the mother`
- **A-PIK2-01** sample 3: missing facts: `kill the mother`
- **A-PIK2-02** sample 1: missing facts: `two captains`
- **A-PIK2-02** sample 2: missing facts: `two captains`
- **A-PIK2-02** sample 3: missing facts: `two captains`
- **A-MELEE-01** sample 1: missing facts: `die early`
- **A-MELEE-02** sample 3: missing facts: `launched off the screen`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle the Glyphid Dreadnought, focus on kiting it between waves. When it opens its armor plates, target those weak points. Save your powerful weapons, like the nuke or overclock, for when you have a clear window to break that armor.
> 
> If you encounter the Dreadnought Twins, remember that they are two separate threats. Let their health bars drift apart, and both will become immune while they try to close the gap. Split your fire evenly between them instead of trying to burn one down immediately.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You're running into a common issue with that boss fight. The key against the Dreadnought Twins is to split your fire evenly between them. Don't focus all your damage on one, as they are designed to heal the gap between them. Keep the pressure balanced so neither one can fully recover while you're attacking.
> 
> The main thing to remember is that the healing never actually *starts* until their health bars drift apart. Focus on keeping that damage output consistent across both targets.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is used to buy weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod. Keep mining it for whichever weapon you are running. If you don't have nitra, you will be using an underleveled weapon regardless of how much gold you have mined.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide Mode active. I will give you some basic tactics for dealing with the Tank.
> 
> When you see the Tank, remember that he throws concrete. You need to fight him in the open. Anything he can punch becomes a projectile with more reach than his fists, and a punch taken near a drop kills rather than knocks you down.
> 
> If you see him trying to get through a vent, he will be barely mobile and won't look for another way around. Focus on taking him down in the open areas.
> 
> If you are playing with a team, and someone has someone pinned, put your body between that survivor and their friends. Remember, bullets hitting you are bullets, not saving them.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch doesn't just attack randomly. She waits for a specific trigger. She ignores most gunfire unless it's aimed directly at her, and she also ignores other infected. What wakes her up is usually a flashlight or a survivor standing too close. When she does wake up, she lets out a growl as a warning. If you back off, she settles. If you keep coming, she will stand up, start flailing, and then charge you with a single hit.
> 
> The key is to manage the approach. If you can keep her calm, she's manageable. If you get too close or start provoking her, you're in trouble.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter revolves around managing your pounce damage and positioning. Pounce damage scales with distance, reaching up to 25 on a long one, so height and a proper run-up are more important than just surprise.
> 
> When engaging, take the straggler rather than the entire group. If you must be near the group, move like a common player; the melee claw reads as horde damage until someone checks on you. Since the pounce recharges quickly in Left 4 Dead 2, holding the crouch and re-pouncing is key to maintaining pressure on the infected.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are basically surfaces you can interact with in the game. There are three main colors, and each one does something different.
> 
> The blue Gel is the Repulsion Gel. This one is used for bouncing. The higher you drop onto it, the higher you bounce. You can use two of these facing each other to climb by bouncing between them.
> 
> The orange Gel removes friction. If you land on it, you keep the speed you had when you arrived.
> 
> The white Gel lets you portal a surface that couldn't be ported before, but be warned, it won't stick to things like cubes or turrets, and a cleansing spray will remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, you need to look for the reversal button before assuming the route is closed. It is a mechanic that allows you to travel wirelessly along the beam and can ferry items like gel and cubes.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're running into the basic Antlion threat. They hunt by vibration, so staying on the rock is key when you're near the coast. If you step onto the sand, they will come up to you.
> 
> The next step is usually dealing with the Antlion Guard. You need to get the pheropod from them. Once you have that, you can use it to make the Antlions read you as a guard and swarm whatever you mark.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you acquire the pheropod from the Antlion Guard, you throw it. The Antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw various items, including secondary pulls and holds, primary punts, explosive barrels, sawblades, and a held radiator which can function as a shield. It will not lift most enemies, but manhacks and scanners are fair game, and thrown grenades can return to where they came from.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The easiest weapons to start with, based on the current information, are the Stygian Blade and the Shield of Chaos.
> 
> The Stygian Blade is noted as the most forgiving and requires the least effort to learn. The Shield of Chaos is also very easy because holding block turns mistakes into nothing. If you want something with more reach, the Eternal Spear is the safest option. Save the Twin Fists of Malphon for later; they are fast but require you to be inside everything.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're having trouble with Theseus and Asterius. The key here is managing the timing. Asterius, the bull, charges with a long wind-up. You need to sidestep that charge to avoid getting stuck. Theseus, on the other hand, throws spears and calls down god powers that you need to watch for on the ground before they land. Most players find it easier to take down Asterius first because Theseus is more predictable.
> 
> If you are struggling, focus on dodging the bull's charge. If you are struggling with the god powers, try to keep your distance or move out of the way when they are marked on the ground.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game does not end after beating the final boss. The structure of Hades involves multiple runs, and the true ending is unlocked after completing several full cycles of the game, which involves raising your Heat to a certain level.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused OS that ignores time. It has two main functions: it cuts damage you take, and it prevents your health from dropping below a quarter. Furthermore, after you defeat an enemy, it restores a quarter of your maximum health. The specific effect on your melee weapons depends on the model installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy guide mode is active. I will keep the coaching spoiler-minimized.
> 
> For a first playthrough, the attribute split depends entirely on the playstyle you want to adopt. You need to decide if you want to be a frontline fighter, a stealthy hacker, or a balanced survivor.
> 
> If you want to be a straightforward fighter who can soak up some hits, put points into Body and Reflexes. These attributes make you a solid combatant and forgive you for making a few mistakes in the heat of the moment.
> 
> If you plan on being a netrunner, put points into Intelligence. This lets you focus on quick hacks and digital operations before you even get into a fight, but be aware that you will be fragile once things go sideways in a direct confrontation.
> 
> Technical Ability is the quiet backbone for almost any build. It opens up crafting options and unlocks the specific cyberware you actually want, so it's generally a good investment regardless of your primary role.
> 
> Spreading points evenly across all three attributes is generally the choice that leads to mediocre results, as you won't hit the thresholds needed to unlock the best perks.
> 
> Lifepath—Nomad, Streetkid, or Corpo—is less about stats and more about the narrative experience. Pick the opening that sounds most interesting to you, as it dictates your starting side job and dialogue options later on.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story progression in Cyberpunk 2077 involves making choices throughout the game that affect the narrative path you take. The ending is heavily influenced by the Lifepath you choose at the beginning, as this dictates the opening chapter, a unique side job, and subsequent dialogue options.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output, specifically targeting his legs first. Use the Sandevistan or a high DPS build to maximize your damage. Ensure you have cover while he is unleashing his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're asking about taking down a Deathclaw early on. Remember, these things are tough, especially when you're starting out. The key against the Deathclaw is distance and cover.
> 
> Here are the basic steps:
> 
> 1.  **Keep Your Distance:** Don't get right in its face. It has a big health pool, and it's resistant to a lot of damage.
> 2.  **Use Cover:** Find plenty of cover—rocks, debris, buildings—to break its line of sight and limit the damage it can do to you.
> 3.  **Focus on Staggering:** Its opening move is usually a roar and a ground stomp, followed by a headbutt to stagger you. If you can get a solid hit in early, it will be momentarily stunned, giving you a window to deal more damage.
> 4.  **Avoid Energy Weapons:** The Deathclaw has a very high resistance to energy weapons; lasers just bounce off its hide. Stick to ballistic weapons if you can.
> 
> If you manage to get close enough, aim for vital areas, but prioritize keeping that distance first.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> As a coach for your Fallout 4 run on the Steam Deck, I'll guide you on those starting SPECIAL stats. Remember, you start with one point in everything and 21 to spend, totaling 28 points. The key is to pick what makes sense for the kind of game you want to play.
> 
> Intelligence is often recommended because it raises how fast you level up, meaning you get those crucial perks sooner. Strength with Endurance is great if you plan on being up close and personal with melee weapons or heavy armor. Agility with Perception is the route for snipers or V.A.T.S. builds, focusing on killing things from a distance or spotting them early. Charisma is the weakest early stat but becomes important later for settlement building and dialogue.
> 
> For the first ten hours, focus on picking stats that make the gameplay enjoyable rather than hyper-optimizing.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Feral ghouls are fast and usually don't travel alone. The head is the reliable weakness. If you take a leg off one, it stops attacking altogether. Taking both arms off does not stop them. They deal radiation damage as well as physical damage, and in heavily irradiated areas like the Glowing Sea, they regenerate if you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor stopped working, check a few things. First, ensure you have enough fusion core energy. The frame drains with time and faster when you spend AP on activities like sprinting or V.A.T.S. If it runs out, you lose V.A.T.S. and steady aim, and you become over-encumbered.
> 
> Second, check if you have any active mods that might be interfering with the armor's functionality. Sometimes mods can break core mechanics.
> 
> Third, if you are trying to upgrade a piece, remember the general advice: repairs and mods happen at a power armor station, and upgrading costs the same materials regardless of your current tier, so waiting for Armorer and Science to rank up is usually better for the later models.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Legendary enemies in Fallout 4 have a star next to their name. They are tough because at about half health, they heal completely and gain a new ability. Don't waste time focusing on them too early; the fight will last longer than it seems.</bonsai-spoiler>
> Since you are just mentioning a legendary enemy, I need to know where you are in the game to give you useful advice.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> It sounds like you're new to the slow pace of Red Dead Redemption 2 coming from GTA. The biggest adjustment is that this game is deliberately slow. Arthur has weight, and everything feels deliberate—picking up an item, riding a horse, or even just walking around takes time. Don't try to sprint through towns; you'll just attract trouble faster.
> 
> For now, focus on making your camp sustainable. Make sure you have enough supplies and that your horses are tended to. When you do need to move, ride rather than sprint, and keep your face covered if you're doing anything questionable.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising honor is a slider, not a switch. It's built by performing actions that build positive interactions with the world.
> 
> Here are the main ways to raise honor:
> 
> *   **Greeting People:** Simply interacting with other NPCs in a friendly manner contributes to your honor.
> *   **Helping Strangers:** Performing acts of kindness for people who are in need will increase your honor.
> *   **Paying Bounties:** Choosing to pay bounties instead of resorting to violence or robbery is a way to build honor.
> *   **Donating to the Camp:** Contributing to the needs of the camp also positively affects your standing.
> 
> Conversely, low honor is gained by engaging in negative activities such as robbing people, killing civilians, or killing animals you don't intend to use. Remember, one bad day doesn't erase good progress; it's a continuous balance.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of Red Dead Redemption 2 involves Arthur Morgan's final journey and the resolution of the overarching conflict.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If your horse keeps throwing you off, it's usually related to the bond level. Bond level is what makes a horse feel different. Riding, feeding, brushing, patting, and calming it during danger will raise it. Each level adds stamina, better handling, and eventually maneuvers like the rear and the drift. A high-bond horse also stops throwing you when something scares it. Bond is per horse, so switching mounts starts again.
> 
> If you are dealing with a specific horse, focus on those bonding actions. If the issue is with general handling, ensure you are riding in a way that encourages bonding, like riding alongside it or using calming actions when things get intense.

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on the pickups scattered around the level. Each pickup adds 15 seconds to your round timer.
> 
> The key strategy is knowing when to stop fighting and start collecting time. Don't stay locked in a fight if you can quickly grab a few pickups. Extending the round time is often more valuable than clearing a large crowd of enemies.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock within a single zone. The objective here is to extend the time by hitting objectives that pop up mid-riot, rather than focusing on surviving.
> 
> Revolution mode is centered around the story. It involves a chain of missions per zone, with objectives being handed out by the resistance, and this mode is where characters and zones are unlocked.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the layout of the Shadow Temple for missing floors. The general consensus is that most of the missing areas are accessible once you have the Lens of Truth and the invisible floors item.
> 
> Here is what you need to know:
> 
> *   Equip the Lens of Truth and the invisible floors.
> *   The invisible floors, walls, and chests will become visible.
> *   Be careful: holding the item drains magic. Use it in short bursts, perhaps fueled by green potions or the fairies in the temple.
> 
> This should help you navigate the areas you are stuck in.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> I can give you the basic strategy for Volvagia. When she pops out of the floor, you need to hit her head the moment she appears, and then slash while she is stunned. When she flies around the room, use the hookshot to pull her back down. Try using the Goron Tunic and a shield for defense, and make sure to stay clear of the lava at the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> As a coach, I'll tell you that long rests are a trade-off. They cost you camp supplies, which you need for food, and they don't advance companion scenes or personal quests. If you're hoarding rests instead of using them when you need to, you'll miss out on story progression.
> 
> The general rule is to rest when you are low on resources or when you need to recover spells or abilities. Don't rest just because you can.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, aim for a balanced four-slot party that covers the core needs: talking, healing, utility (traps/locks), and damage.
> 
> A solid starting template often looks like this:
> 
> 1.  **The Face/Talker:** Someone like a Bard or Paladin to handle social encounters and dialogue checks.
> 2.  **The Healer:** A Cleric or Druid is essential for keeping the party alive, especially in early exploration.
> 3.  **The Utility/Skill Monkey:** A Rogue or Ranger handles traps, locks, and scouting. This character often covers the necessary skills.
> 4.  **The Damage Dealer:** This slot is for your primary damage source, which could be a Fighter, another Paladin, or a high-level spellcaster depending on your preferred build.
> 
> The key takeaway is ensuring you have at least one dedicated healer. If you lack healing entirely, your party will struggle significantly. Focus on characters whose backgrounds align with how you actually intend to play, as this helps with Inspiration.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Painting and writing are generally the fastest routes because they only require one skill and one object to begin earning, and both scale quickly with level. Selling collectibles from a cheap starter lot can also generate funds early on.
> 
> If you are looking for the absolute fastest income, focus on:
> 1. **Skill Focus:** Immediately dedicate time to leveling up a skill like Painting or Writing.
> 2. **Simple Earning:** Use the skills you start leveling to create simple items or content for sale.
> 3. **Lot Strategy:** Start on a very cheap lot to maximize the remaining funds for the object that generates income.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members is governed by the "Respect" mechanic. You can recruit up to seven gang members. This is influenced by several factors: completing missions, killing rival gangs or police, taking territory, spraying over tags, and appearance nudges such as hair, tattoos, clothing, muscle, and wearing green when in Grove Street territory. If you wear the wrong colors at home, kill your own gang members, or lose turf, this respect level will fall.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> If you are talking about the boss Margit, the key is managing her attack patterns and staying out of her reach. Focus on dodging her sweeping attacks and using your stamina wisely to manage your positioning. Keep an eye on when she is recovering, as that is your window to deal damage.
> 
> Since I don't have the specific context of where you are in the game, I need to know what part of the game you are currently in to give you better advice on approach.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> It sounds like you're struggling with the difficulty in Tartarus. That area can be punishing.
> 
> Since you're focusing on keeping alive, we should look at how you're managing your health and positioning. A key thing in Tartarus is learning when to block versus when to just keep moving. Blocking gives you a little more time to react, but it also commits you to a certain path.
> 
> If you're having trouble surviving a specific section, tell me what you are currently facing. Are you stuck on a particular area, or is it more about managing the sheer number of enemies?

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, Nihilanth  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Gonarch is a tough fight. Focus on the egg sac; that's the only part that takes damage. If you try to shoot anything else, you're wasting ammo. Up close, its front legs hit hard, so keep your distance. When it sees you, it spawns those weak, fast baby headcrabs to distract you, so watch your footing on the webbing it walks on.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, Long Jump Module, Gonarch  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are largely new work, meaning they are significantly longer than the original Half-Life Xen levels. You should expect a much greater time commitment in the alien world. The core structure remains the same: no cutscenes, scripted scenes you walk through, and you'll use items like the crowbar for crates and vents. The main difference is the sheer volume of new content in the alien world.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** False Knight, Watcher Knights, Broken Vessel  
**Checks:** facts ❌ · contradiction ✅ · fence ❌ · menu ✅

> Strategy guide mode is active. I will keep the coaching spoiler-minimized.
> 
> ```bonsai-spoiler
> The first real fight involves the armoured maggot in the Forgotten Crossroads. The key is to jump the shockwave it slams into the floor instead of backing off. Hitting the armour does nothing; save your soul for when the armour empties and it topples. Pile hits on the head, then back off because it enters a rage that summons barrels, which you can knock back for damage or stagger it. After the third exposure, the floor breaks, and you drop after it to finish it.
> ```
> 
> Focus on timing your jumps to avoid the shockwave and concentrating your hits on the exposed head.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Getting a map in Hollow Knight is tied to finding Cornifer, the humming cartographer. You need to find him, and then buy his copy. Once you have it, the map will start filling in as you rest at benches.
> 
> Benches are important because they are where you can swap charms. They also serve as places to save your progress and restore your masks.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, Arch-vile  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Fighting the Marauder is about staying in the right distance and timing your attacks. Since it has that red shield, you need to manage your positioning carefully.
> 
> Here is the general approach:
> 
> 1.  **Stay at Mid Range:** Don't get too close, or it will draw your super shotgun too fast. Don't stay too far, or it can throw axe waves.
> 2.  **Watch its Movement:** Pay attention to where it is moving. When it dashes, that's your window to reposition. When it runs, it's charging in to swing.
> 3.  **Hit on the Green Flash:** When it winds up its axe, its eyes flash green. Hit it right at that instant. This will stagger it for a few seconds.
> 4.  **Use High Damage:** After you stagger it, pour in your highest damage shots—super shotgun, ballista, rocket, etc.—swapping weapons for two or three hits.
> 5.  **Manage Environment:** Keep the space between you and the Marauder clear. Grenades and rockets exploding nearby can briefly drop its shield, giving you an opening.
> 6.  **Kill the Wolf:** Once you take it down, make sure to kill the glowing wolf it summons immediately. Clear the other demons first.
> 
> Focus on dodging its attacks and hitting those specific windows when it's charging its axe.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ❌

> The combat loop in DOOM Eternal is all about managing your resources, primarily ammo and fuel. Think of it as a constant cycle:
> 
> 1.  **Shoot and Glory Kill:** Start by shooting weak enemies until they flash. Then, finish them off with a glory kill to regain health.
> 2.  **Chainsaw for Ammo:** Use the chainsaw on fodder demons to get ammo. Remember, this costs three fuel units, but it refills automatically every twenty seconds. Fodder demons cost one fuel unit, so this is a reliable way to keep your ammo flowing.
> 3.  **Flame Belch for Armor:** Use the flame belch on groups of enemies to burn them for armor. This ability has a cooldown of twenty-five seconds.
> 4.  **Manage Heavy Demons:** Heavy demons cost all three fuel units and cannot be sawed at all. You need to manage these carefully.
> 5.  **Movement is Key:** Never stand still. Dash twice, jump twice, and swap weapons mid-fight instead of just reloading. If you run out of everything, the game will give you the chainsaw for one fodder kill to restart the loop.
> 
> The core idea is to constantly move and use the right tool for the job to keep your resources balanced.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Strategy guide mode active. I will keep the coaching spoiler-minimized.
> 
> To take down the Mother Demon, focus on managing her attacks. Her flame trail tosses you around, and you need to dodge that. Four homing rockets will follow you, so try to manage those as well. The key to dealing with her effectively is using the fully upgraded Unmaker. Its fire rate stuns her, which stops her from launching the rockets, leaving you only to dodge the flame trails. Before you engage her directly, make sure you find the three Demon Keys. If you don't have all three keys, you will fight a large horde first, which will burn your ammo.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, Unmaker and the Demon Keys, The Lost Levels  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Doom 64 is a separate game with its own mechanics, redrawn graphics, and a darker atmosphere. It keeps the core elements of classic Doom but adds new features like the Unmaker and different enemy types. Think of it as a spiritual successor rather than a direct port.
> 
> The main differences are the new gun, the Unmaker, which is a slower, stronger plasma gun. Also, Doom 64 features new enemies such as the fast, half-invisible nightmare imp and the Mother Demon at the end. It also has four secret levels that offer extra rewards.
> 
> The game is designed to be played like classic Doom: find keys, hit switches, and treat every quiet room as a trap.

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in GTA V comes in five tiers, purchased from Ammu-Nation. Each tier is stronger than the last. The main thing to know is that body armor does nothing against melee attacks.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The special abilities are tied to each protagonist. Michael slows time during gunfights, Franklin slows down the world while driving any vehicle, and Trevor takes half damage while dealing double damage when he gets into a rage.
> 
> These abilities have meters that fill up. The skill behind each ability grows the longer you use it. For instance, Franklin's ability gets stronger by doing things like climbing while drifting or holding a car's top speed.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Friends and their favours  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> You can get weapons in GTA IV in a few ways. You can find dropped guns lying on the ground; they'll have a faint orange glow, and you can disarm an enemy by shooting their hand instead of killing them.
> 
> For more reliable sources, you can check out the underground gun shops. These open up after you do "Do You Have Protection?". Once Little Jacob likes you enough, his van sells everything at sixty percent off.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Girlfriends  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is pretty straightforward. You save by walking up to a bed in a safehouse and choosing to sleep. That action will clear any active wanted level you have.
> 
> If you're still in the early stages, you'll find that there are no traditional garages. Instead, the yellow Residents Parking bays on the street outside each safehouse hold two vehicles. If anything gets damaged there, it repairs itself when you leave the area or reload the game.
> 
> If you're running into specific issues with saving or wanted levels, let me know.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Hardcore mode, Companions and what each one gives you  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Quarry Junction is dangerous because it houses tough enemies, including Deathclaws, which are significantly stronger than usual. You'll also face an alpha male Deathclaw with high damage and a mother who gets berserk if you kill one in front of her.
> 
> To survive, focus on avoiding direct confrontation with the larger creatures. The guide suggests using environmental advantages: you can stop their leaping attacks by standing on rocks they can't reach, use water to slow them down, or use a flare gun to make them flee.
> 
> The reward for clearing the area is a Fat Man with two mini nukes and a light machine gun in the den. If you're concerned about the initial encounter, prioritize stealth and using the environment to your advantage rather than engaging in a straight fight.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Companions and what each one gives you  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random; they are fixed thresholds. For example, a Speech check might require a minimum of 25, and if you roll below that, you fail. It's not like a random number generator decides if you pass or fail.
> 
> You can try to influence the outcome by improving your skills or using items. For instance, you can buy skill books, which grant permanent points, or use magazines, which give you temporary boosts to checks.
> 
> The game design is built around these set thresholds, meaning if you know the required number, you can plan your actions to meet them.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Stars that are easy to miss  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to focus on timing and using his attacks to your advantage.
> 
> For the first fight, when he breathes fire, you need to jump while he is mid-air. If you stand too close, he will claw you. The key is to get behind him, grab his tail, and spin the stick to build speed. Then, throw him into one of the four spiked bombs around the edge. If you miss the bomb, he will climb back up.
> 
> For the second fight, which occurs after boarding the sub, be aware that the stage will tilt whenever he lands, and he will use single fireballs and teleport. Focus on staying close and timing your jumps around his movements.
> 
> The final fight at 70 stars requires you to throw him three times. His slams send shockwaves along the floor, and his fire breathes upward, raining back down. Practice getting behind him and throwing him into the appropriate spots.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, The three caps, Stars that are easy to miss  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is managed by the eight-wedge power meter. You refill this meter by collecting coins, spinning hearts, or by surfacing in water.
> 
> For moves, remember that you can run and jump three times for a triple jump, run then crouch and jump for the long jump, jump into a wall and jump again for the wall kick, crouch and jump for the backflip, and press crouch in the air to ground-pound. Caps last sixty seconds and only appear in courses once you have hit their switches. A hundred coins in any course grants an extra star, and the rabbit in the basement gives you a star when you catch him at fifteen stars and again at fifty stars.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Courses that fight back  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell only comes to fourth place or lower. It runs along the ground with a siren, locks onto the leader, and flips anyone in its path. You can hold it behind your kart to block other shells before you fire yours.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Courses that fight back  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Hold the gas as the lights change from red to blue for a rocket start. If you go too early, you'll just spin your tires and go slower than everyone else.
> 
> Then, hop and hold the gas to drift. While you're drifting, wiggle the stick side to side. This will make the smoke go white, then yellow, and finally orange. When the smoke turns orange, let go of the stick. This gives you a mini-turbo boost. If you combine gas and brake together, you can spin your kart right on the spot.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Star Power, Stylish moves and the crowd  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The key to dealing with Hooktail's healing mechanic is managing the audience. She heals by eating audience members, so your goal is to keep the crowd thin.
> 
> Here are a few things to keep in mind:
> 
> 1.  **Crowd Management:** Be mindful of the audience. If you have a chance to clear them out before she can eat anyone, you reduce her healing potential.
> 2.  **Damage Output:** Since her bite cannot be blocked, focus on dealing as much damage as possible to her quickly. Fire attacks are noted as hurting her badly.
> 3.  **Koops Support:** Koops can join you for the fight. Use his shell toss to hit her first, which can help you commit Mario when you have the opening.
> 
> Focus on keeping your HP topped up so you can withstand her attacks while trying to manage the audience size.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, Badges and BP  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles in Paper Mario: The Thousand-Year Door are turn-based, meaning Mario and your partner each get to act once per turn. You can also choose who goes first, which affects the order.
> 
> An action command is essentially a specific button press you need to time correctly during an attack animation to get extra damage. Every attack has one.
> 
> For example, you might need to press a button at the right moment during an attack animation to trigger a special move or increase the damage.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the giant bulborb boss depends entirely on where you are in the game. If you are in the Hole of Heroes, it will be asleep when you arrive, so that's your opening to sneak an attack. If you are in Frontier Cavern, it will be awake and pumping out larvae constantly, so you need to focus on killing the mother rather than the children.
> 
> Regarding the enemies that keep spawning, you need to manage the situation based on the specific enemy. For instance, Spotty Bulbears patrol with dwarf bulbears trailing behind, and they heal if you leave them, so you need to use purples from the side. Gatling Groinks fire mortars from range, and you need to deal with them from a distance.
> 
> Since you mentioned the "giant bulborb boss," knowing which area you are in will dictate the best approach.

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Purple and White Pikmin, Sprays and nectar  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to collect ten thousand Pokos of treasure to pay off the company's debt. Treasures and enemy bodies both count towards this total.
> 
> Regarding the day limit, there is still a day limit. The day ends at sunset. If any Pikmin are not with a captain or back at the Onion when the night creatures wake up, they get eaten. So, you need to manage your time carefully and get things done before sunset.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Fox is fast and lightweight. His strengths are his second-fastest dash, third-fastest fall, and a three-frame jump. He also has a shield reflector that knocks opponents sideways. However, his weakness is that his speed means falling fast, which makes him combo-heavy.
> 
> Falco is slower and heavier than Fox. His strength lies in his laser, which makes opponents flinch and cancels when he lands, shutting down approaches. His down air spikes straight down. His weakness is that he is slower overall.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Shields, grabs and punishing  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Damage in Melee isn't about health bars; it's about percentage damage. When you hit someone, the damage dealt is a percentage of their current stock. The higher that percentage is, the further the opponent gets sent. Losing a stock happens when you get launched past the edge of the screen, not when your health runs out.
> 
> Knockback is heavily influenced by this stock loss. A big hit sends someone flying, potentially knocking them off the stage entirely. You can also affect knockback with specific moves. For instance, Smash attacks charge for up to a second to deal 40% more power.
> 
> The key takeaway is that focusing on maximizing that percentage damage and understanding how moves launch opponents is more important than worrying about a health bar.
