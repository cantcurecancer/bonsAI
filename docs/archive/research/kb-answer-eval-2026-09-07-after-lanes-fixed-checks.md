# Knowledge-base answer eval — 2026-09-07 — after-lanes-fixed-checks

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
| run_minutes | `4.3` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **74.3%** (127/171) | every must-mention group found in the reply |
| No contradiction | **87.0%** (47/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **99.4%** (167/168) | no spoiler fence where none was due |
| Fence present when due | **100.0%** (9/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.8%** (135/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **60.7%** (37/61) | strictest view |

Mean seconds per answer: **1.4**. Mean request payload: **6896.2** bytes. Mean prompt tokens (Ollama prompt_eval): **1490.9**.
Mean system prompt length: **6478.1** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1865.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1943.0 | 5.9 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1955.0 | 1.4 |
| `A-DRG-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.5 |
| `A-L4D2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 0/3 | 1891.0 | 1.4 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 1.0 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1777.0 | 1.6 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.6 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1721.0 | 1.1 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.5 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.8 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.5 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1823.0 | 1.5 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1776.0 | 1.2 |
| `A-CP77-01` | expert | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.9 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 2.1 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1541.0 | 1.1 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.7 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2011.0 | 1.9 |
| `A-FO4-02` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 0/3 | 1904.0 | 1.6 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.7 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.3 |
| `A-FO4-05` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 1937.0 | 1.2 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1975.0 | 1.4 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.2 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1906.0 | 0.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1595.0 | 1.0 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.4 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.7 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1979.0 | 1.2 |
| `A-OOT-02` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1878.0 | 1.2 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.2 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.7 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.3 |
| `A-GTASA-01` | speed | 3/3 | 2/3 | — | 2/3 | 3/3 | 0/3 | 1110.0 | 0.8 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1575.0 | 0.9 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 1.3 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 2/3 | 3/3 | 3/3 | 0/3 | 2242.0 | 1.2 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2183.0 | 1.3 |
| `A-HK-01` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2286.0 | 1.5 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2230.0 | 1.2 |
| `A-DOOME-01` | strategy | 3/3 | 1/3 | 0/3 | 3/3 | 3/3 | 0/3 | 2142.0 | 2.1 |
| `A-DOOME-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2108.0 | 2.0 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 1.6 |
| `A-DOOM64-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2199.0 | 1.7 |
| `A-GTAV-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2179.0 | 1.0 |
| `A-GTAV-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2197.0 | 1.5 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2252.0 | 1.2 |
| `A-GTAIV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2318.0 | 0.8 |
| `A-FNV-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2333.0 | 1.9 |
| `A-FNV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2396.0 | 1.5 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2220.0 | 1.8 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2182.0 | 1.3 |
| `A-MK64-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2223.0 | 1.1 |
| `A-MK64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2272.0 | 1.6 |
| `A-TTYD-01` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2219.0 | 1.5 |
| `A-TTYD-02` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 2324.0 | 2.4 |
| `A-PIK2-01` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 2.2 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 0/3 | 3/3 | 3/3 | 0/3 | 2193.0 | 1.3 |
| `A-MELEE-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2207.0 | 2.0 |
| `A-MELEE-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2219.0 | 1.4 |

## Failures worth reading

- **A-DRG-03** sample 2: missing facts: `weapon upgrade`, `shop`
- **A-L4D2-01** sample 3: missing facts: `open`
- **A-L4D2-02** sample 2: branch menu missing
- **A-HADES-03** sample 1: missing facts: `not the end`
- **A-CP77-01** sample 2: missing facts: `damage taken`
- **A-FO4-02** sample 2: missing facts: `intelligence`, `strength`; branch menu missing
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 2: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-OOT-02** sample 1: missing facts: `megaton hammer`
- **A-OOT-02** sample 3: missing facts: `megaton hammer`
- **A-GTASA-01** sample 1: missing facts: `respect`
- **A-GTASA-01** sample 2: spoiler fence present, none due
- **A-BMS-01** sample 1: missing facts: `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`; said: `shoot the legs / aim for the legs / target its legs`
- **A-BMS-02** sample 1: missing facts: `kept the same`
- **A-BMS-02** sample 2: missing facts: `kept the same`
- **A-BMS-02** sample 3: missing facts: `kept the same`
- **A-HK-01** sample 2: missing facts: `hit the head`
- **A-DOOME-01** sample 1: said: `rush him / get in close / close the distance / stand right next to him`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`; said: `rush him / get in close / close the distance / stand right next to him`
- **A-DOOME-01** sample 3: missing facts: `shield blocks`; said: `rush him / get in close / close the distance / stand right next to him`
- **A-GTAV-02** sample 3: missing facts: `yellow meter`
- **A-GTAIV-02** sample 1: missing facts: `clears your wanted level`
- **A-GTAIV-02** sample 2: missing facts: `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `clears your wanted level`; branch menu missing
- **A-FNV-01** sample 1: missing facts: `alpha male`, `cripple a leg`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-01** sample 3: missing facts: `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`
- **A-FNV-02** sample 3: missing facts: `Goodsprings`
- **A-MK64-01** sample 2: missing facts: `hold it behind your kart`
- **A-TTYD-01** sample 1: missing facts: `cricket`
- **A-TTYD-01** sample 3: missing facts: `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 1: missing facts: `throw purples at her head`
- **A-PIK2-01** sample 3: missing facts: `throw purples at her head`
- **A-PIK2-02** sample 1: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-PIK2-02** sample 2: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-PIK2-02** sample 3: missing facts: `two captains`; said: `there's a day limit / you have a limited number of days`
- **A-MELEE-01** sample 1: missing facts: `die early`
- **A-MELEE-02** sample 1: missing facts: `launched off the screen`
- **A-MELEE-02** sample 2: missing facts: `launched off the screen`
- **A-MELEE-02** sample 3: missing facts: `launched off the screen`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You need to focus on exploiting its armor.
> 
> *   Kite between waves.
> *   Focus on weak-point armor plates as they open.
> *   Save your overclock or nuke for when you see armor break windows.
> 
> This is how you handle the Glyphid Dreadnought.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You are fighting the Dreadnought Twins. The key here is to split your fire evenly between them. Don't focus all your damage on one, as they are both tough. The healing won't start unless you let their health bars drift apart and both become immune while they are actively healing the gap. Try to manage their health bars so they are simultaneously focused on healing the gap rather than just taking damage.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is used to buy weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod. Keep mining it for whichever weapon is carrying your run.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide Mode active. I will keep the coaching focused on the Tank enemy.
> 
> When you face the Tank, remember that it throws concrete chunks, which means you need to fight it in the open. Don't try to sneak around or use tight spaces; if it can punch you, it can throw projectiles that have more reach. Focus on taking hits rather than trying to dodge every single move.
> 
> If the Tank gets up and starts throwing those chunks, the best approach is to slip past it and let the horde come back, or if you can, try to get behind it. If the route forces it to crouch through a vent, it becomes very slow and predictable. Also, remember that if a teammate is pinned down, try to put yourself between that survivor and the rest of the team; your bullets hitting you are still bullets, but you might buy time.
> 
> For general tank play, avoid getting stuck in tight spots where it can use its bulk against you.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch doesn't just attack randomly. She is programmed to react to specific things. She ignores gunfire unless it's aimed directly at her, and she ignores other infected. What usually wakes her up is a flashlight or a survivor getting too close. The growl you hear is just a warning—back off. If you keep coming, she will stand up, flail, and then charge at whoever you picked first. Fire does slow her down, but only after she's already startled. The key is to keep her calm until you light a wandering witch while she's still relatively still, which keeps her moving at full speed.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus requires understanding how your abilities interact with the horde. Pounce damage scales with distance, meaning maximizing your run-up and height is more effective than relying solely on surprise. If you are near the group, move like a common player; your melee claw will register as horde damage until someone checks on you. Since the pounce recharges quickly, holding the crouch and re-pouncing keeps the pressure on effectively.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are tools you use to manipulate surfaces in the game. There are three main types.
> 
> The blue Gel is the Repulsion Gel. This one is used to change your vertical movement. If you drop onto it from a certain height, it will make you bounce higher. It's good for gaining height.
> 
> The orange Gel removes friction. If you use this on a surface, you keep whatever speed you have when you land on it.
> 
> The white Gel is for portals. It lets you portal through surfaces that couldn't be ported before. However, it won't stick to things like cubes or turrets, and a cleansing spray will remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, it means you need to reverse its direction before assuming the route is closed. Look for the button that reverses the funnel before you commit to that path.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are dealing with the Antlions coming up out of the sand. The key thing to remember is that they are blind and hunt vibration. If you are near the coast, the rocks are safe, but the sand is where they come up.
> 
> When you encounter them, stay alert for vibrations. If you can get your footing on the ground, try to move quickly and avoid getting stuck in the sand. If you manage to get them to reverse, remember the strategy involving the pheropod.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you acquire the pheropod from the Antlion Guard, you throw it. The antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The gravity gun can pick up and throw several things. Primary uses include secondary pulls and holds, and primary punts.
> 
> Specific items mentioned are:
> *   Explosive barrels
> *   Sawblades
> *   Manhacks
> *   Scanners
> 
> It will not lift most enemies, but the mentioned items are fair game. Additionally, thrown grenades can return to where they came from.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. Leave the Twin Fists of Malphon until later — they are the fastest, but they need you standing inside everything. The Heart-Seeking Bow and the Adamant Rail both want range and punish standing still, and the Rail can leave you reloading at the worst possible moment.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're having trouble with Theseus and Asterius. The key here is timing. Asterius, the bull, telegraphs a long charge, so you need to sidestep that charge to avoid getting stuck. Theseus throws his spear, and you'll see a god's power marked on the ground before it lands. Try to focus on killing Asterius first; he is more predictable.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game in Hades is designed to be a continuous experience. Beating the final boss is just one part of the journey.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused mechanic that does not track time. It has two primary functions:
> 
> 1.  **Damage Reduction:** It cuts the damage you take.
> 2.  **Health Regeneration:** It prevents your health from dropping below a quarter of your maximum. Furthermore, after every enemy you defeat while using Berserk, you regain a quarter of your maximum health.
> 
> The specific effects of Berserk on your melee weapons depend on the model you have installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy guide mode is active. I will keep the coaching spoiler-minimized.
> 
> For a first playthrough, the attribute split is important because it dictates your starting playstyle. You need to decide if you want to be a straightforward fighter, a tech-savvy netrunner, or something in between.
> 
> Body and Reflexes are good starting points if you want to be a solid, reliable fighter who can take a hit and keep fighting. Intelligence is better if you plan on being a netrunner, as quickhacks are crucial for getting ahead before a fight even starts, but you'll be fragile once things go south. Technical Ability is useful for unlocking the gear and cyberware you actually want.
> 
> The general advice is to spread points somewhat evenly, but putting too many points into one area can make you very specialized and less adaptable.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story progression in Cyberpunk 2077 is highly dependent on the Lifepath you choose at the start, as this dictates the opening chapter, unique side jobs, and subsequent dialogue paths. There are multiple major narrative branches, so the ending is not fixed.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high DPS builds or utilize the Sandevistan. Prioritize destroying his legs first, and try to keep cover during his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle a Deathclaw early on, remember that distance and cover are your best friends. It has very high health and resists most things, so don't try to trade blows unless you have a specific reason to.
> 
> Here's the basic approach:
> 
> 1.  **Stay Away:** Don't get into a straight fight. Use the environment to your advantage.
> 2.  **Stagger it:** It opens with a roar and a ground stomp, followed by headbutts to stagger. This is your window.
> 3.  **Use the Stagger:** When it staggers, that's when you should focus on dealing damage.
> 4.  **Avoid Energy Weapons:** The knowledge base states that lasers reflect straight off its hide, making energy weapons ineffective against it. Stick to ballistic or melee weapons if you can get close enough safely.
> 
> Focus on keeping your distance and waiting for the right opening to attack.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you are starting with one point in every stat and 21 points to spend (totaling 28), the initial allocation is crucial for determining your build. There's no single "best" build, but certain combinations lean toward specific playstyles.
> 
> Intelligence is often recommended because it raises how fast you level up, meaning every other perk arrives sooner. Strength paired with Endurance makes for a solid melee or heavy weapons survivor that can take a beating. Agility with Perception is the route for snipers or V.A.T.S. builds, focusing on killing things before they get to you. Charisma is the weakest early stat but is essential if you plan on being a settlement leader or relying heavily on speech.
> 
> The key takeaway is to pick what you enjoy playing in for the first ten hours, rather than strictly optimizing for the endgame.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take their heads off. That is the reliable weakness. Taking off one leg stops them from attacking altogether, while removing both arms does not stop them. They can deal radiation damage, so if you are in heavily irradiated areas like the Glowing Sea, shooting them will cause them to regenerate.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor isn't working properly, check a few things. First, ensure you have enough fusion core energy. The frame drains over time and drains faster when you sprint or use V.A.T.S. If the core is empty, you can still walk, but you'll lose V.A.T.S. and steady aim, and you'll be over-encumbered.
> 
> Second, check if you have any immediate mechanical issues. Sometimes, a simple repair at a power armor station or building can fix things. Ensure you are at a station capable of handling the repair you need.
> 
> If the issue persists, you might need to check your armor's integrity or look into potential mods if you are playing with them.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Legendary enemies in Fallout 4 have a star beside their name. They are tough because at about half health, they heal completely and gain a new ability. Don't waste time focusing on them until they are nearly dead.</bonsai-spoiler>
> It sounds like you're dealing with one of those tough opponents. Remember, the key is patience. If you focus too much damage on them while they are at half health, they'll just recover and get stronger. Wait for them to take significant damage before trying to finish them off.
> 
> What are you currently trying to do in the game?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It's a big shift coming from GTA. The main thing to understand is that Red Dead Redemption 2 is deliberately slow. Arthur has weight, and everything takes time—turning horses, picking up items. Don't try to sprint through towns; you'll get caught quickly.
> 
> Focus on riding instead of sprinting, and treat your camp as your base of operations. Also, be aware of the bounty system. If you get caught, leave the area, and keep your face covered if you're doing anything illegal to keep the bounty manageable. Upgrading your satchels early is also smart because running out of room stops most people from restocking before they ride out.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor is a slider mechanic, not a switch. It's influenced by the small things you do frequently.
> 
> To increase it, focus on actions like:
> *   Greeting people.
> *   Helping strangers on the road.
> *   Paying bounties instead of running from them.
> *   Donating to the camp.
> 
> Conversely, low honor is often associated with actions like robbing, killing civilians, and killing animals you don't intend to use. Remember, it's a slider; one bad day doesn't undo a good one.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending involves Arthur Morgan's final confrontation and the resolution of the main storyline.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse handling in Red Dead Redemption 2 is tied directly to the horse's bond level. Raising the bond level—which you do by riding, feeding, brushing, patting, and calming the horse during dangerous situations—will increase its stamina, improve its handling, and eventually unlock advanced maneuvers like the rear and drift. A high-bond horse will also be less likely to spook when startled. Bond is specific to each horse, meaning switching mounts will reset the bond level for the new horse.
> 
> If the horse is throwing you off immediately, focus on building that bond level through consistent, calm interaction rather than just riding it hard.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on the pickups scattered around the level. Each pickup adds 15 seconds to the round timer.
> 
> Here are the main things to consider:
> 
> *   **Prioritize Time Over Crowd:** The key tip is to know when to break off and go for time, rather than staying to fight a large crowd. Extending the round is worth more than finishing a crowd.
> *   **Look for Pickups:** Keep an eye out for these scattered pickups as you move through the level.
> *   **Timing:** Decide when the time gained from a pickup outweighs the time you spend fighting enemies.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock within a single zone. The objective here is to extend the time by hitting objectives that pop up mid-riot, rather than focusing on surviving.
> 
> Revolution mode, conversely, is centered around the story. It involves a chain of missions per zone, with objectives being handed out by the resistance. This mode is where characters and zones unlock.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are currently in the Shadow Temple and looking for missing floors. The key is to use the Lens of Truth and the invisible floors. Hold the Lens of Truth to see the invisible floors and walls. Be careful, holding it drains magic, so use it in short bursts. Green potions and the fairies in the temple will help keep your magic up.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> You are fighting the fire dragon, Volvagia. The main thing to remember is timing your attacks with its movements.
> 
> When it pops out of the floor, hit its head the instant it appears. Then, slash while it is stunned. When it flies around the room, use the hookshot to pull it back down. Keep your Goron Tunic and a shield handy, and stay clear of the lava around the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Resting more often in Baldur's Gate 3 is a trade-off. A long rest restores spells, health, and most abilities, and it also advances personal quests and companion scenes. The main drawback is that it costs camp supplies.
> 
> If you are running low on supplies, you should prioritize using a long rest to recover resources. If you have plenty of supplies and are focused on story progression or companion interactions, you might be able to manage with shorter rests.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need a balanced party that covers the core needs: talking, healing, utility, and damage. A solid starting point involves four characters covering these roles.
> 
> You need someone to talk, someone to heal, someone who can handle traps and locks, and enough damage. A common and effective setup is:
> 
> 1.  **Talker/Face:** A Bard or Paladin works well here for social skills.
> 2.  **Healer:** A Cleric or Druid provides essential healing.
> 3.  **Utility/Skill Monkey:** A Rogue or Ranger is excellent for finding and disarming traps, and often handles stealth elements.
> 4.  **Damage Dealer:** You need enough damage to keep things moving. One character often covers two of those roles, so your damage dealer can also contribute to utility or talk.
> 
> The key takeaway is that you cannot cover the need for healing without a dedicated healer. If you lack a dedicated healer, your party will struggle significantly. Focus on ensuring you have that healing presence.
> 
> ```json
> {"tdp_watts": 6, "gpu_clock_mhz": 1200}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to make money early in The Sims 4 generally revolves around activities that offer quick skill progression or immediate sellable items.
> 
> 1.  **Selling Collectibles:** This is often cited as a very fast way to generate initial funds. Focus on finding and selling items quickly, especially if you start with a cheap lot, which leaves more budget for the items you sell.
> 2.  **Painting and Writing:** These are classic self-employed earners. They require only one skill and one object to start, and both scale hard with level, meaning the time investment pays off quickly once you get the hang of it.
> 3.  **Gardening:** While slower to start than painting or selling, it is a reliable passive income stream that builds over time.
> 
> Focus on whichever activity aligns best with your initial gameplay style—quick sales for immediate cash, or skill-based activities for long-term, scalable income.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members is controlled by the 'Respect' mechanic. You can recruit up to seven gang members. This mechanic is influenced by several factors: completing missions, killing rival gang members or police, taking territory, spraying over tags, and appearance nudges like your hair, tattoos, clothes, muscle, and wearing green in Grove Street territory. It falls if you wear the wrong colors at home, kill your own gang members, or lose turf.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're asking about [[spoiler]]Margit[[/spoiler]], I can give you some general advice for that fight. Focus on managing your stamina carefully; dodge her attacks to keep your stamina up so you can execute your dodges and maintain pressure. Be aware of her attack patterns and try to stay in her blind spots.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> I see you're struggling with the early runs in Tartarus. Since we're in Strategy Guide mode, I'll keep things spoiler-minimized. Dealing with the early difficulty usually comes down to managing your positioning and utilizing the right gear.
> 
> For surviving the initial waves, focus on blocking. The item [[Shield of Chaos]] is noted as the most survivable weapon because it turns mistakes into nothing and sets up a rush. Try to use it defensively while keeping an eye on where the enemies are coming from.
> 
> If you're getting overwhelmed, think about how you are approaching the encounters. Are you focusing too much on attacking, or are you getting caught in the open?

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, The opening tram ride and where it leads  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The giant headcrab boss has a few key things to watch. At range, it spits white acid mortars from its back, so try to keep your distance. Up close, its front legs have huge damage, so be careful when it gets close. Also, it will spawn baby headcrabs in pairs whenever it sees you, so you need to manage those distractions. Watch where it walks, as it moves over pits that you and its children fall through. When it dies, the sac bursts, so back away before that happens.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, The opening tram ride and where it leads, Long Jump Module  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are mostly new work and significantly longer than the original 1998 chapters. Expect a bigger commitment of time for the alien world. The core structure remains the same: no cutscenes, scripted scenes you walk through, a crowbar for crates and vents, and fights that are better from a doorway than the middle of a room.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** Leaving the Forgotten Crossroads, False Knight, Watcher Knights  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The armored maggot in the Forgotten Crossroads is your first real fight. The key is to manage its armor.
> 
> 1.  **Jump the Shockwave:** When it slams the mace, don't back away. Jump over the shockwave.
> 2.  **Save Your Soul:** Hitting the armor does nothing. Save your soul for when the armor empties and it topples.
> 3.  **Finish the Job:** Once it exposes its head, pile hits on it. After the third exposure, it breaks the floor and falls below. Drop after it to finish it off.
> 4.  **Rage Management:** If it gets angry, it rains barrels. You can knock those barrels back into it for ten damage each, which can stagger it.
> 
> Focus on timing the jumps and knowing when to commit to hitting the exposed head.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Getting a map in Hollow Knight is tied to finding Cornifer, the humming cartographer. You need to find him in Dirtmouth. Once you have him, buying his map will fill it in as you rest at benches. Benches are crucial; they are where you can save your progress, restore your masks, and swap charms.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, The Crucible  
**Checks:** facts ✅ · contradiction ❌ · fence ✅ · menu ✅

> Fighting the Marauder in DOOM Eternal is all about positioning and timing, since that red shield blocks everything.
> 
> Focus on staying at mid-range. If you get too close, it will draw your super shotgun faster than you can dash. If you stay too far, it will throw axe waves at you.
> 
> When it winds up its axe, watch its feet. A dash is for repositioning, and a run means it's coming in to swing. The key is to hit it in that instant when its eyes flash green. After that hit, pour in the highest damage per shot you have—think super shotgun, ballista, or rocket—and swap weapons for two or three hits per stagger. Grenades and rockets exploding nearby can briefly drop its shield, giving you a window to attack.
> 
> The goal is to keep the space between you and the Marauder managed.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The basic combat loop in DOOM Eternal is about managing resources and never standing still. Think of it as a cycle of attacking, surviving, and refueling.
> 
> Here is the general flow:
> 
> 1.  **Shoot Weak Enemies:** Start by shooting weak enemies until they flash. This is how you get your initial health and ammo.
> 2.  **Glory Kill:** Finish the weak enemy with a glory kill to regain health.
> 3.  **Chainsaw for Ammo:** Use the chainsaw on a fodder demon to get three fuel units. The chainsaw refills automatically every twenty seconds, so this is a reliable way to keep your fuel topped up. Fodder demons cost one fuel unit.
> 4.  **Flame Belch for Armor:** Use the flame belch on a group of demons to kill them burning. This is your primary way to get armor. This ability has a cooldown of twenty-five seconds.
> 5.  **Manage Heavy Demons:** Heavy demons cost all three fuel units and cannot be sawed at all. You need to manage when and how you engage them.
> 6.  **Movement is Key:** Never stand still. You need to dash twice, jump twice, and swap weapons mid-fight instead of reloading. This keeps you moving and keeps the action going.
> 7.  **Run Dry:** If you run out of everything, you'll get the chainsaw for one fodder kill, which restarts the fuel cycle.
> 
> The core idea is to constantly switch between shooting, chainsawing for fuel, and flamethrowing for armor, all while moving aggressively.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> In Doom 64, beating the Mother Demon involves managing her attacks. Her flame trail tosses you into the air, and four homing rockets follow. To take her down efficiently, you need to find the fully upgraded Unmaker. Use the Unmaker at point-blank range; its fire rate will stun her, preventing her from launching the rockets, leaving you only to dodge the flame trails. Before you can engage her fully, you will need to find the three Demon Keys. If you don't have the keys, you will fight a large horde first, which will drain your ammo. Prioritize finding those keys.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, How the coloured keycards work, Finding your way through the dark, maze-like levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Doom 64 is a separate game, not just a port of Doom II. It takes the core elements of Doom II—the classic weapons and monsters—but it's a different experience. It features thirty-two new levels, redrawn sprites, and a slower, darker atmosphere.
> 
> The key difference is the new content. You get the original Doom II arsenal, plus the Unmaker, and new enemies like the fast, half-invisible nightmare imp and the Mother Demon. It also has four secret levels that offer extra rewards.
> 
> When playing, treat every quiet room like a trap. Look for switches and tripwires, and remember the colored keycard system: you need the matching keycard or skull key to open doors of that color. If you try to use a switch without the right key, you'll get a warning sound, and the corresponding key icon on your status bar will flash, telling you which color you're missing.

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in GTA V comes in five tiers, obtainable from Ammu-Nation. Each tier is stronger than the last. A key thing to know is that body armor does nothing against melee attacks. You can use cover to snap yourself to solid objects, and from there, you can blind-fire without a reticle or peek around corners.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The special abilities are unique to each character. Michael slows down time during gunfights. Franklin slows the world while he is driving any vehicle. Trevor takes half damage and deals double damage while raging.
> 
> These abilities have meters under the radar. Michael's ability, Area Kill, is bullet time for shootouts and lasts thirty seconds once the bar is maxed. Franklin's Driving Focus slows the world while he is in any land vehicle, making gaps and slides easier. Trevor's rage doubles his damage and makes him immune to everything for the duration.
> 
> The skill behind each ability grows with use. For Franklin, you grow the time you get by climbing while you drift, threading near misses at speed, driving into oncoming traffic, or holding ninety percent of a car's top speed.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Foot chases through construction sites  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You can find weapons in a few places. The basic gear, like the M4 carbine or AK assault rifle, drops on the ground when enemies are defeated, glowing with an orange light.
> 
> For more reliable access, you'll need to look for underground gun shops. These usually open up after you've dealt with certain story elements, like Do You Have Protection?. Once you get into the right area, the van owned by Little Jacob sells everything at a sixty percent discount.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Foot chases through construction sites  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is pretty straightforward. You save by walking to a bed in a safehouse and then choosing to sleep. This action will clear any active wanted level you have.
> 
> If you're looking for other tips, let me know.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Crossing the crater radiation pools, Starting out in Fallout: New Vegas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The danger around Quarry Junction comes from the Deathclaws guarding the road north. They are tougher than normal, and you have to be smart about how you approach them.
> 
> Here are the key things to know about surviving the area:
> 
> 1.  **Guards:** The main danger is the Deathclaws at the entrances. They have high health, and you need to use tactics to avoid getting overwhelmed.
> 2.  **Bypass Tactics:** The guide mentions a few ways to deal with them:
>     *   Standing on a rock they can't reach.
>     *   Diving into water.
>     *   Using a flare gun to make them flee.
>     *   If you have a crippled leg, it slows their leap attacks down significantly.
> 3.  **Loot:** Clearing the area rewards you with a Fat Man who has two mini nukes and a light machine gun in the den.
> 4.  **Other Hazards:** Be aware of the crossing the crater radiation pools. If you wade through them, you risk severe radiation sickness. Check your Pip-Boy's Geiger counter before attempting this route. RadAway and Rad-X can help if you get exposed, but you need to take them *before* entering the water.
> 
> For early survival, focus on avoiding direct confrontation with the tough Deathclaws initially, and use the environment to your advantage when you encounter them.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Choosing early armor by Damage Threshold, not by looks  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random. Instead of rolling dice, the game uses a fixed threshold. For example, a Speech check might require a Speech of 25 to succeed. If your total skill score meets or exceeds that number, you succeed. If it's below that number, you fail.
> 
> You can influence your chances of success by investing points into the relevant skills, reading skill books, or using magazines.
> 
> If you want to know how to get started with building your character, we can look at how to distribute those starting points.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Getting your first star in Bob-omb Battlefield  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to focus on timing your throws. In the first fight, when he breathes fire, jump into the air. When he jumps to shake the ground, you must be airborne to avoid being stunned. When you get close, grab his tail and spin the stick to build speed. Then, throw him into one of the four spiked bombs around the edge. If you miss, he will climb back up.
> 
> For the second fight, you'll need to watch the stage tilt when he lands, as this affects your footing. He uses single fireballs and teleports, so keep moving and try to stay out of his direct line of fire.
> 
> For the final fight at 70 stars, he has five bombs. You need to throw him three times. His slams create shockwaves on the floor, and his fire breathes upward. Focus on getting those throws in consistently.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, Getting your first star in Bob-omb Battlefield, The three caps  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is managed by the eight-wedge power meter. You refill this meter by collecting coins, spinning hearts, or by surfacing in water.
> 
> To manage your health effectively, focus on these points:
> 
> 1.  **Collect Coins and Hearts:** These are your primary ways to replenish the meter. Don't just run around aimlessly; look for collectibles and enemies that drop these items.
> 2.  **Use Water:** Surfacing in water is another reliable way to refill your health. This is useful when you find yourself low on meter.
> 3.  **Watch for Hazards:** Be aware of enemies and hazards that can drain your health, as well as anything that might cause you to lose momentum, which can indirectly affect your ability to refill.
> 
> Focus on keeping that meter topped up while navigating the castle courses.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell only comes to fourth place or lower. It moves along the ground with a siren, tries to home in on the leader, and flips anyone in its path.
> 
> Regarding blocking it, you can hold it behind your kart to block other shells before you fire it.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Drifting and Mini-Turbos, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get a rocket start, you need to hold the gas while the lights change from red to blue. If you do it too early, you'll spin your tires and go slower than everyone else.
> 
> Here are the steps:
> 1. Hold the gas button as the track lights change from red to blue.
> 2. If you are drifting, hop into that drift by holding the drift button, then wiggle the control stick side to side while keeping the drift button held.
> 3. When you let go of the drift, the smoke will turn white, then yellow, and finally orange. Letting go when it turns orange gives you a mini-turbo boost.
> 4. You can also gas and brake together to spin your kart on the spot.
> 
> Focus on holding that gas during the red-to-blue light change for the main rocket start.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Rawk Hawk, Magnus von Grapple and Cortez  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> To deal with Hooktail's healing, you need to manage the audience. She heals by eating members of the crowd. If you have too many audience members, she will keep recovering. Focus on keeping the crowd thin so she doesn't have enough targets to heal with. Also, remember that her bite cannot be blocked, so make sure your own HP is high enough to survive her attacks. Koops is useful here; his shell toss can hit her before you commit Mario.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, The final battle: hands, patterns and the charge tell  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles in Paper Mario: The Thousand-Year Door are turn-based, meaning Mario and one partner take turns acting. In a turn, you get to choose an action command for your character. This command is essentially the move you want to use.
> 
> When you use an attack, you have a few options:
> 1. **Action Command:** This is the basic move you select to attack an enemy.
> 2. **Button Press:** There are specific moments during the attack animation where you can press a button for extra damage.
> 3. **Stylish Move:** This is an extra button press at the right beat of the attack animation that makes the crowd cheer. Stylish moves only work on normal and badge attacks, not items or counters.
> 
> When an enemy attacks you, you have the option to guard it by pressing 'A' to take less damage, or you can try to superguard it by pressing 'B' during a very brief window for no damage and to get a point back.
> 
> The key is timing your action command and button presses to maximize damage and utilize those special moves.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the giant bulborb boss that keeps spawning enemies is about managing the situation based on where you are in the game. If you are in Frontier Cavern, the Empress Bulblax is awake and pumping out larvae constantly. Your main goal should be to focus on killing the mother, not the individual larvae. Keep your Pikmin squad positioned off the sides of the boss and use purples to target her head during the brief moments she stops to roll.
> 
> If you are in the Hole of Heroes, the Empress Bulblax is asleep when you arrive, which is your chance for a sneak attack.
> 
> Since I don't know exactly which area you are in, here are the general pointers:
> 
> 1.  **Prioritize the Mother:** If she is actively spawning enemies, focus your attacks on the main entity.
> 2.  **Use Purple:** Purples are noted as effective against her during pauses.
> 3.  **Positioning:** Keep your Pikmin away from the sides to avoid being overwhelmed by the constant spawns.
> 
> Where are you at in Pikmin 2?

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Growing your Pikmin squad, Purple and White Pikmin  
**Checks:** facts ❌ · contradiction ❌ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to collect ten thousand Pokos of treasure to settle the company's debt. Treasures and enemy bodies both contribute to this total.
> 
> Regarding the day limit, yes, there is still a day limit. The day ends at sunset, and any Pikmin that are not with a captain or back at the Onion will be eaten when the night creatures wake up. You need to watch the sun and call everyone in early.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Fox and Falco are good because they both have very fast movement and strong defensive options. Fox is the fastest lightweight, meaning he can move and react quickly. His shield is also very good because he can use it instantly to knock opponents sideways. Falco is slower but has a different advantage: his laser move can make people flinch and cancel when he lands, which stops opponents from approaching him. His down air spike is also effective for keeping opponents at bay.
> 
> Their main weakness is that both of them fall very fast. Because of this, they can get knocked off the screen easily if you don't manage your movement well.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Classic Mode's Metal Battle  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Damage in Melee isn't about draining a health bar. Instead, damage is calculated as a percentage of your stock. The higher the percentage of stock you lose, the further the hit will send you. If you launch an opponent past the edge of the screen, you lose a stock, not health.
> 
> Knockback is also key. Momentum carries you. When you dash into a jump, for example, you keep that momentum, which can carry you further or influence how you land. Smash attacks have a charge time; holding the attack button for up to a second increases its power by forty percent.
> 
> If you are looking to understand specific situations, like how to manage knockback from a certain move, let me know.
