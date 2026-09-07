# Knowledge-base answer eval — 2026-09-07 — wave0-old-checks

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
| run_minutes | `4.7` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **73.1%** (125/171) | every must-mention group found in the reply |
| No contradiction | **100.0%** (54/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (168/168) | no spoiler fence where none was due |
| Fence present when due | **77.8%** (7/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.1%** (134/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **65.6%** (40/61) | strictest view |

Mean seconds per answer: **1.5**. Mean request payload: **6896.2** bytes. Mean prompt tokens (Ollama prompt_eval): **1490.9**.
Mean system prompt length: **6478.1** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1865.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1943.0 | 3.5 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1955.0 | 1.3 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.7 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.8 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1891.0 | 1.5 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 1.0 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1777.0 | 1.4 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.6 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1721.0 | 1.1 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.5 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.8 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.5 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1823.0 | 1.7 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 1/3 | 3/3 | 0/3 | 1776.0 | 1.1 |
| `A-CP77-01` | expert | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.7 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 1.7 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1541.0 | 0.9 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.6 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2011.0 | 2.1 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1904.0 | 1.9 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.6 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 0/3 | 1937.0 | 1.3 |
| `A-RDR2-01` | strategy | 3/3 | 1/3 | — | 3/3 | 2/3 | 0/3 | 1975.0 | 1.2 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.5 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1906.0 | 1.2 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1595.0 | 1.1 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.2 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.9 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1979.0 | 1.7 |
| `A-OOT-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1878.0 | 1.4 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.7 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.9 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.0 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1110.0 | 0.9 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1575.0 | 1.0 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 1.7 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2242.0 | 1.5 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2183.0 | 1.4 |
| `A-HK-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2286.0 | 1.7 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2230.0 | 1.3 |
| `A-DOOME-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2142.0 | 2.3 |
| `A-DOOME-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2108.0 | 2.2 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 1.6 |
| `A-DOOM64-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2199.0 | 2.6 |
| `A-GTAV-01` | strategy | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2179.0 | 1.3 |
| `A-GTAV-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2197.0 | 2.5 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2252.0 | 1.8 |
| `A-GTAIV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2318.0 | 1.2 |
| `A-FNV-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2333.0 | 2.3 |
| `A-FNV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2396.0 | 1.7 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2220.0 | 2.5 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2182.0 | 1.9 |
| `A-MK64-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2223.0 | 1.7 |
| `A-MK64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2272.0 | 2.1 |
| `A-TTYD-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2219.0 | 1.7 |
| `A-TTYD-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2324.0 | 1.8 |
| `A-PIK2-01` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 2.0 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2193.0 | 1.6 |
| `A-MELEE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 0/3 | 2207.0 | 2.2 |
| `A-MELEE-02` | strategy | 3/3 | 1/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2219.0 | 2.3 |

## Failures worth reading

- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-HADES-03** sample 3: missing facts: `not the end`; spoiler fence missing, one was due
- **A-CP77-01** sample 2: missing facts: `damage taken`
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-RDR2-01** sample 1: missing facts: `slow`, `bounty`; branch menu missing
- **A-RDR2-01** sample 3: missing facts: `bounty`
- **A-OOT-02** sample 1: missing facts: `megaton hammer`
- **A-BMS-01** sample 1: missing facts: `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`
- **A-BMS-02** sample 1: missing facts: `mostly new`, `kept the same`
- **A-BMS-02** sample 2: missing facts: `mostly new`, `kept the same`
- **A-BMS-02** sample 3: missing facts: `kept the same`
- **A-HK-01** sample 1: missing facts: `hit the head`
- **A-HK-01** sample 2: missing facts: `hit the head`
- **A-HK-01** sample 3: missing facts: `hit the head`
- **A-DOOME-01** sample 1: missing facts: `shield blocks`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`
- **A-DOOME-01** sample 3: missing facts: `shield blocks`
- **A-GTAV-01** sample 3: missing facts: `does nothing against melee`
- **A-GTAV-02** sample 1: missing facts: `Michael slows time`, `yellow meter`
- **A-GTAV-02** sample 2: missing facts: `yellow meter`
- **A-GTAV-02** sample 3: missing facts: `yellow meter`
- **A-GTAIV-02** sample 1: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 2: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-FNV-01** sample 1: missing facts: `cripple a leg`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-01** sample 3: missing facts: `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`; branch menu missing
- **A-FNV-02** sample 3: missing facts: `Goodsprings`
- **A-MK64-01** sample 3: missing facts: `hold it behind your kart`
- **A-TTYD-01** sample 1: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 2: missing facts: `eats the audience`
- **A-TTYD-01** sample 3: missing facts: `eats the audience`, `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 2: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 2: missing facts: `kill the mother`
- **A-PIK2-01** sample 3: missing facts: `kill the mother`
- **A-PIK2-02** sample 1: missing facts: `two captains`
- **A-PIK2-02** sample 2: missing facts: `two captains`
- **A-PIK2-02** sample 3: missing facts: `two captains`
- **A-MELEE-01** sample 1: branch menu missing
- **A-MELEE-02** sample 1: missing facts: `launched off the screen`; branch menu missing
- **A-MELEE-02** sample 2: missing facts: `launched off the screen`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle the Glyphid Dreadnought, focus on kiting the waves. Target the weak-point armor plates as they open up. Save your powerful weapons, like the overclock or nuke, for when you see windows for armor breaks.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You are likely struggling with how to manage the split fire when the Dreadnought Twins are healing each other. The key here is to split your fire evenly between them instead of focusing all your attention on one. The local knowledge suggests that neither of them is as tough as a full Dreadnought alone, so you need to keep the pressure on both simultaneously. Also, remember that the healing mechanic never starts, so you don't need to worry about them suddenly getting stronger.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is used to buy weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod. If you don't have nitra, you will be underleveled in weapons regardless of how much gold you mine, so keep mining it for whichever weapon configuration you are running.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide mode active. I will keep the coaching spoiler-minimized.
> 
> When you face the Tank, remember that while he's up, the director stops sending out the common and special infected. This means you are fighting four guns against one target, so you need to slip past him. Focus on fighting him in the open. Anything he can punch becomes a projectile with more reach than his fists, and a punch taken near a drop kills rather than knocks down. If the route forces him to crouch through a vent, he becomes barely mobile and won't look for another way around.
> 
> If you are playing as the Tank, general advice is to avoid getting stuck in tight spots where mounted guns can shred you. Wait for the rest of the infected team to be up before you commit to an area.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch doesn't attack randomly; she is triggered by specific actions. She ignores most gunfire unless you aim directly at her, and she ignores other infected. What wakes her up is usually a flashlight or a survivor getting too close.
> 
> If you hear a growl, back off immediately. If you keep coming, she will stand up, flail, and then charge you. Fire is what slows her down, but only after she is already startled. The key is to keep her calm and light a wandering witch while she is still slow, which keeps her moving at full speed. If you burn her, she will switch her attention to the person who burned her, not the person who woke her up.
> 
> It's less about a sudden attack and more about reacting to her specific triggers.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Versus relies on managing distance and timing. Pounce damage scales with distance, reaching up to 25 on a long one, so focus on height and a good run-up rather than just relying on surprise. If you are near the group, move like a common player, as the melee claw reads as horde damage until someone checks on you. Since the pounce recharges quickly, holding the crouch and re-pouncing is key to maintaining pressure on the survivors.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are materials you can interact with in the game to change how you move or manipulate surfaces. There are three main types: Blue, Orange, and White.
> 
> The Blue Gel is a repulsion gel. It lets you bounce higher the further you drop onto it. If you drop from a greater height, you'll bounce higher. You can also use two coated surfaces facing each other to climb by bouncing between them.
> 
> The Orange Gel removes friction. This means you keep the speed you have when you arrive on it.
> 
> The White Gel lets you portal surfaces that couldn't be ported before. However, it doesn't stick to cubes or turrets, and a cleansing spray will remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is carrying you the wrong way, look for the button that reverses its direction before assuming the route is closed. It passes through portals, which allows it to cross the entire chamber, and it can ferry both gel and cubes along with you.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are encountering the Antlions near the coast. Remember, they are blind and hunt vibrations, so the rocks are safe, but the sand is dangerous—step off and they come up. If you have the Pheropod (bugbait) from the Antlion Guard, you can throw it to make them read you as a guard and swarm whatever you mark.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the pheropod bugbait, you first need to obtain it from the Antlion Guard. Once you have it, you throw it. The Antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw various items, including secondary pulls, holds, and primary punts. Specifically, you can use it to pick up explosive barrels, sawblades, and a held radiator which functions as a shield you can walk behind. It will not lift most enemies, but it can be used on manhacks and scanners. You can also throw grenades, and they will return to where they came from.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. Leave the Twin Fists of Malphon until later — they are the fastest, but they need you standing inside everything. The Heart-Seeking Bow and the Adamant Rail both want range and punish standing still, and the Rail can leave you reloading at the worst possible moment.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The key to dealing with Theseus and Asterius is managing their separate threats. Asterius, the bull, has a long charge, so you need to sidestep his initial attack to avoid getting stuck. Theseus, on the other hand, is predictable because he calls down a god's power that is marked on the ground before it lands.
> 
> Most successful runs involve taking down Asterius first, as he is more predictable. If you can handle that, Theseus becomes a manageable secondary threat.
> 
> For survivability, consider using the Shield of Chaos. Holding block allows you to turn a mistake into nothing, and it also sets up a rush that can close the distance and hit hard.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game in Hades is designed so that beating the final boss is only the middle of the story. The game continues with new challenges and story progression.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused OS. It functions by cutting damage taken and prevents your health from dropping below a quarter. Furthermore, every enemy you defeat restores a quarter of your maximum health. The specific effects it has on your melee weapons depend on the model installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first playthrough, focusing on the core attributes that define your playstyle is key. The general advice is that Body and Reflexes are good starting points if you want a straightforward fighter who can absorb mistakes. Intelligence is the route for netrunners, but you'll be fragile early on. Technical Ability is useful for unlocking better gear and cyberware down the line. Spreading points evenly is generally discouraged because you won't get the bonuses from the perks that sit behind attribute thresholds.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story ending is heavily influenced by the Lifepath you choose at the start (Nomad, Streetkid, or Corpo). Different paths lead to different outcomes and dialogue sequences.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output, specifically targeting his legs first. Utilize abilities like Sandevistan or high DPS builds to maximize your damage. Ensure you have cover during his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> When you first encounter a Deathclaw, remember that distance and cover are your best friends. It has very high health and is resistant to most damage, especially from energy weapons.
> 
> Here is how to approach it:
> 
> 1.  **Stay Back:** Do not engage in a straight line. Use the environment—walls, rocks, debris—to keep the Deathclaw at a distance.
> 2.  **Use Cover:** Look for anything that can block its attacks. This is crucial because direct hits will do very little.
> 3.  **Stagger It:** The Deathclaw opens with a roar and a ground stomp, followed by a headbutt to stagger you. When it does this, use that opening to get some distance or reposition yourself.
> 4.  **Avoid Direct Hits:** If you are using energy weapons, be aware that lasers can reflect straight off its hide. Focus on melee weapons or heavy physical damage if you can manage to get close enough.
> 5.  **Watch for Weak Spots:** While it's tough, pay attention to its movements. If you see an opening, use it. If it gets too close, try to use the environment to knock it off balance or find a way to run past it.
> 
> Focus on survival and evasion rather than trying to trade blows with it early on.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about the starting SPECIAL stats in Fallout 4, remember you get one point in each of the five stats, and you have 21 points to spend, meaning you start with 28 total. The key is to decide on a build early on, as your initial stats heavily influence which perks you can even take later.
> 
> For a general starting point, the advice is to focus on Intelligence. Intelligence raises how fast you level up, which means you get more perks sooner. Strength with Endurance makes you a solid melee or heavy weapon survivor who can take a hit. Agility with Perception sets you up for a sniper or V.A.T.S. route, focusing on killing things before they get to you. Charisma is the weakest early on, but it's crucial for settlement and speech builds later.
> 
> Don't stress too much about optimizing everything right away; just pick what makes the first few hours enjoyable.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the head off one of the Feral Ghouls. That is the reliable weakness. If you take off one leg, it stops attacking altogether. Taking off both arms does not stop them. They deal radiation damage, and in heavily irradiated areas like the Glowing Sea, you can regenerate if you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor stopped working properly, check a few things. First, ensure you have enough fusion core energy. The frame drains with time and drains faster when you sprint or use V.A.T.S. If the core is empty, you can still walk, but you will lose V.A.T.S. and steady aim, and you will become over-encumbered.
> 
> Second, check if you have any immediate issues with the armor itself. Sometimes a simple inventory check or a quick reload might resolve minor glitches.
> 
> If the issue persists, the most direct fix is usually related to the fusion core. If you are in a situation where you cannot immediately access a power armor station, try to find a way to replenish your core energy or find a repair station.
> 
> If you are looking to upgrade your power armor, remember that repairs and upgrades happen at a power armor station, and you can build one at a settlement. Upgrading a piece costs the same materials regardless of your current tier, so it is often worth waiting until Armorer and Science are ranked up before paying twice, especially for later models whose materials are rare.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Legendary enemies in Fallout 4 have a specific mechanic: around half health, they will heal themselves completely and gain a new ability. This means you should avoid spending all your resources on them in the first half of the fight.</bonsai-spoiler>
> Since you mentioned a legendary enemy mechanic, I'm focusing on how to handle those encounters. You need to manage your health and resources carefully, knowing that taking damage might not be the best strategy before that mid-fight heal kicks in.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ❌

> No response text.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is a gradual process based on your interactions with the world. It's not a single action but a cumulative effect.
> 
> You raise Honor by performing actions that align with the game's moral framework. This includes:
> 
> *   **Greeting people:** Being polite and friendly to NPCs.
> *   **Helping strangers on the road:** Offering assistance to those in need.
> *   **Paying bounties instead of running:** Choosing to resolve conflicts through legal means rather than resorting to violence.
> *   **Donating to the camp:** Contributing resources to the community.
> 
> Conversely, lowering your Honor comes from actions like robbing people, killing civilians, or taking animals you don't use.
> 
> Think of it as a slider; one bad day doesn't completely erase good progress, but consistent positive actions will move the slider in the right direction.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of Red Dead Redemption 2 involves Arthur Morgan's final confrontation and the resolution of the main narrative threads.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse bonding is key to handling your mounts better in Red Dead Redemption 2. Each bond level improves stamina, handling, and eventually unlocks maneuvers like the rear and drift. You build this bond by riding, feeding, brushing, patting, and calming the horse during danger.
> 
> If your horse is throwing you off, focus on increasing that bond level.
> 
> <bonsai-spoiler>
> The specifics on how to maximize bonding are detailed in the general horse bonding mechanic.
> </bonsai-spoiler>

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on the pickups scattered around the level. Each pickup adds 15 seconds to your round timer.
> 
> Here are the main things to focus on:
> 
> *   **Prioritize Time Over Crowd:** The key tip is to know when to break off and go for time, rather than staying in a fight against a crowd. Extending the round is worth more than clearing a large group of enemies.
> *   **Locate Pickups:** Keep an eye out for those scattered pickups. If you see one, prioritize getting to it.
> 
> Focus on finding those pickups and using them to extend your time.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode focuses on score attack against a clock in a single zone. You extend the time by hitting objectives that pop up mid-riot rather than focusing on surviving.
> 
> Revolution mode is centered around the story. It involves a chain of missions per zone, with objectives being handed out by the resistance, and this mode is where characters and zones unlock.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide Mode active. I will focus on how to navigate the Shadow Temple.
> 
> The Shadow Temple is designed to be confusing, but the key is using the Lens of Truth.
> 
> *   Equip the Lens of Truth.
> *   Use the invisible floors, walls, and chests to your advantage.
> *   Be careful: holding the Lens drains magic. Use it in short bursts, perhaps fueled by green potions or the fairies you encounter.
> 
> This should help you find those missing sections.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Reviewing the fight against Volvagia. This fire dragon fight is straightforward once you know the mechanics.
> 
> Focus on this: When the fire dragon pops out of the floor holes, you need to hit its head the moment it comes up, and then slash it while it is stunned. While it's flying around the room, use the hookshot to pull it back down to repeat the attack. Keep your Goron Tunic and shield ready, and make sure you stay clear of the lava at the edges of the arena.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It depends entirely on what you are trying to achieve. Long rests are a big deal in Baldur's Gate 3 because they restore spells, health, and most abilities, and they also advance certain personal quests and companion scenes.
> 
> If you are running low on resources or need to recover from heavy combat, resting more often is usually a good idea. However, if you are deep into a narrative moment or a specific quest that requires you to progress quickly, hoarding those long rests might be necessary to keep the story moving.
> 
> To give you better advice, I need to know what part of the game you are currently in or what your main goal is right now.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, focus on having a balanced group that covers the core needs. You need someone who can talk, someone who can heal, someone who can handle traps and locks, and enough damage.
> 
> A solid starting point often involves a mix:
> 
> 1.  **Talker/Face:** A Bard or a Paladin. They handle social encounters well.
> 2.  **Healer:** A Cleric or a Druid. You absolutely cannot run a party without someone dedicated to keeping everyone alive.
> 3.  **Utility/Skill Monkey:** A Rogue or a Ranger. They are essential for finding traps, disarming them, and dealing with stealth situations.
> 4.  **Damage:** This slot is flexible. A Fighter or a Wizard can provide reliable damage, or you can lean into a martial class that complements your other choices.
> 
> The key takeaway is ensuring you have at least one dedicated healer. If you lack healing entirely, your party will struggle immensely.
> 
> ```json
> {"tdp_watts": 8, "gpu_clock_mhz": null}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The quickest methods for making money early in The Sims 4 usually revolve around self-employment. Painting and writing are classic choices because they require minimal initial investment—just a skill and one object—and both scale their income significantly as you level up. Gardening is slower to start and requires more upfront time. Selling collectibles can also generate funds early on, especially if you start with a cheap lot, allowing you to reinvest in the object that generates the most income. Focus on maximizing skill progression in one of these areas to boost your earnings rapidly.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Recruiting more gang members in GTA: San Andreas is tied to the "Respect" mechanic. You can recruit from one up to seven gang members. This is influenced by several factors: completing missions, killing rival gang members or police, taking territory, spraying over tags, and appearance nudges like hair, tattoos, clothes, muscle, and wearing green, especially in Grove Street territory. It falls if you wear the wrong colors at home, kill your own members, or lose turf.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> To deal with margit, focus on managing your stamina and dodging her attacks. Keep an eye on her attack patterns and try to stay in a position where you can dodge her heavy swings. Use your healing items wisely, especially during her more aggressive phases.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you're struggling in Tartarus, we need to focus on survivability and managing the encounters. The key right now is how you handle the fights and the permanent upgrades.
> 
> For general survival, remember that blocking in Hades is often your best bet. It turns a mistake into nothing, and it sets up a rush that closes the distance. Focus on using that block defensively, especially when you're unsure of an enemy's pattern.
> 
> Regarding the permanent upgrades, if you're running into trouble, check the Mirror of Night. Each row offers alternatives, and you can switch them out. Death Defiance is particularly useful early on because each rank grants you a free revive mid-run, which can make a huge difference when you're constantly dying.
> 
> To give you more specific advice, I need to know what part of Tartarus is giving you the most trouble right now.

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, The opening tram ride and where it leads  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> You're asking about the giant headcrab mother, the Gonarch, in the Xen caverns. The key thing to remember is that its shell is tough, so you need to target the pale egg sac underneath its body. Any shot that misses the sac is wasted.
> 
> When you are close up, its front legs will slash for heavy damage. Keep an eye out because whenever it spots you, it spawns pairs of baby headcrabs. These babies are weak and fast, so you need to deal with them to distract the main threat. Watch your footing as it walks over the pits in its webbing. When it finally dies, the sac will burst, releasing a last brood, so back away before that happens.
> 
> Since you're asking about the end of the Xen caverns, we need to figure out where you are in the campaign.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, The opening tram ride and where it leads, Long Jump Module  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are largely new work, meaning they are significantly longer than the original 1998 levels. Expect a lot more content to explore there. The core gameplay loop remains similar: you'll deal with alien environments, and you'll need to use tools like the crowbar to open crates and navigate tight spaces using vents.
> 
> The main difference is the sheer volume and the new content added to the Xen universe.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** Leaving the Forgotten Crossroads, False Knight, Watcher Knights  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The big armored maggot in the Forgotten Crossroads requires you to manage its armor. When it leaps and charges, you need to jump the shockwave it slams onto the floor instead of backing away. Hitting the armor does nothing; save your health for when the armor empties so you can deal real damage. Once the armor is gone, pile hits on its head. After the third time it exposes its head, it will break the floor and fall below. Drop after it to finish the fight. If it gets too aggressive, a wall above the left gate becomes breakable, and the Vengeful Spirit spell is in the next room, which makes the rematch easier.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Getting a map in Hollow Knight is tied to finding a specific item. You need to locate Cornifer, the humming cartographer. Once you find him, you'll be able to buy his copy of the map. The map itself won't fill in automatically; it will only become visible when you rest at a bench after you've acquired a quill from his wife in Dirtmouth.
> 
> Benches are important because they are your main hub for saving progress, restoring your masks, and swapping charms. You can only swap charms while you are sitting on a bench.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, The Crucible  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the Marauder's shield is a common sticking point. Since it blocks everything, you need to focus on disrupting its rhythm and exploiting its openings.
> 
> Here is how to approach it:
> 
> 1.  **Stay at Mid-Range:** Don't get too close, or it will draw your super shotgun too fast. Don't stay too far, or it will throw axe waves. Find the sweet spot where you can manage both.
> 2.  **Watch Its Movement:** This is key. A dash means it's repositioning, and a run means it's charging in to swing.
> 3.  **Exploit the Stun:** The Crucible is your best tool here. You can only use it once the Marauder is stunned. Focus on landing hits that stagger it first.
> 4.  **Damage Output:** Once you have a stagger, pour in the highest damage per shot you have. This means using your super shotgun, ballista, or rocket repeatedly.
> 5.  **Use Environment:** Grenades and rockets exploding near it can briefly drop its shield, giving you a window to land critical hits.
> 6.  **Clear Summons:** Don't forget to kill the glowing wolf it summons; clear the other demons first to keep the arena space between you.
> 
> Focus on those quick hits and exploiting the moments it's vulnerable.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The basic combat loop in DOOM Eternal is about managing resources—ammo and fuel—while constantly moving.
> 
> Here is the general flow:
> 
> 1.  **Engage and Kill:** Shoot weak enemies until they flash, then use a glory kill to regain health.
> 2.  **Manage Fuel:** Use the chainsaw on fodder demons to get fuel units. Remember, the chainsaw costs three fuel units per kill, and it refills automatically every twenty seconds.
> 3.  **Build Armor:** Use the flame belch on groups of enemies to build up armor, which helps you survive. This has a cooldown.
> 4.  **Handle Heavy Threats:** Heavy demons cost all three fuel units and cannot be sawed at all.
> 5.  **Movement is Key:** Never stand still. You need to dash twice, jump twice, and swap weapons mid-fight instead of just reloading. If you run out of everything, you get the chainsaw for one fodder kill to restart the cycle.
> 
> The core idea is to keep moving, using the right tool for the job, and managing your limited fuel and ammo pools.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Strategy Guide Mode active. I will keep the guidance focused on the fight mechanics.
> 
> To take down the Mother Demon, you need to manage her attacks carefully. Her flame trail tosses you around, and she will follow up with four homing rockets. The key to surviving her is to dodge the flame trails and manage the incoming rockets.
> 
> The most effective way to deal with her is by using the fully upgraded Unmaker. Use the Unmaker at point-blank range. Its fire rate will stun her, preventing her from launching the rockets, allowing you to focus on dodging the flame trails. If you haven't collected all three Demon Keys yet, you will also be fighting a large horde before she appears, which will drain your ammo. Focus on getting those keys first.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, How the coloured keycards work, Finding your way through the dark, maze-like levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Doom 64 is a separate title, not just a port of the original Doom games. It's considered a sequel that builds on the original Doom II, featuring thirty-two new levels, redrawn larger sprites, and a slower, darker mood. It keeps the core gameplay mechanics from Doom II but adds new elements like the Unmaker and the Mother Demon.
> 
> The main difference is the overall presentation and content. It's designed to be significantly darker than the previous games, with lower lighting to create a more atmospheric feel.
> 
> Once you start playing, focus on the core mechanics: find keys, hit switches, and treat quiet rooms as traps. Remember that the colored keycard system is crucial—if a door won't open, check the status bar; it will flash the color you are missing. Keys are lost when you leave a level, so don't worry about carrying them forward.

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in GTA V comes in five tiers, purchased from Ammu-Nation. Each tier is stronger than the last. The key thing to know is that body armor does nothing against melee attacks; it only protects you from things like bullets.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The special abilities are unique to each character and are tied to a small meter on the radar.
> 
> Michael has Area Kill, which is essentially bullet time for shootouts and lasts for thirty seconds once the ability bar is maxed.
> 
> Franklin has Driving Focus, which slows the world while you are in any land vehicle, including tanks. It starts at a third of its final length. You build this skill by doing things like climbing while drifting, threading near misses at speed, driving into oncoming traffic, or holding ninety percent of a car's top speed.
> 
> Trevor has Rage, which doubles his damage and makes him immune to everything for the duration.
> 
> The skill behind each ability grows with use, so the longer you use them in the right ways, the stronger they become.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Foot chases through construction sites  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In GTA IV, you can get weapons in a few places. You start with basic gear, and you can find more options later.
> 
> For the initial weapons, you'll find them dropped on the ground as glowing items. You can also find fixed spawn points around the city that refill the same weapon every time you visit.
> 
> For better gear, you need to progress in the story. Once you reach certain points, underground gun shops open up. The van belonging to Little Jacob is mentioned as selling everything at a sixty percent discount.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Foot chases through construction sites  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is straightforward. To save your progress, you need to walk up to a bed in a safehouse and choose to sleep. This action will save your game state and also clear any active wanted level you might have.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Crossing the crater radiation pools, Starting out in Fallout: New Vegas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The danger at Quarry Junction comes from the Deathclaws. They are tougher than normal, and you have to watch out for the alpha male and the mother with the babies who get berserk if you kill one in front of her.
> 
> To survive, you need to use the environmental tricks mentioned: stand on a rock they can't reach, dive into water to stop their leaps, or use a flare gun to make them flee. The reward is a Fat Man with two mini nukes and a light machine gun in the den.
> 
> Since you are asking about going through it early, you need to be prepared for those tough encounters.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Choosing early armor by Damage Threshold, not by looks  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random. They are fixed thresholds. For example, a Speech check of 25 might succeed, but a Speech check of 24 will fail. It's not a dice roll where you can just roll a 1 to pass.
> 
> You can fail them by not meeting the required threshold. If you don't meet the minimum number required for the skill check, you fail.
> 
> If you want to improve, you can increase your skill level by leveling up, which gives you more skill points. You can also buy skill books or magazines to get temporary boosts.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Getting your first star in Bob-omb Battlefield  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to manage his attacks and get behind him to throw him into the spiked bombs.
> 
> For the first fight, when he breathes fire, jump into the air so the fire doesn't stun you. When he jumps to shake the ground, try to stay airborne. When he claws, try to move away from him. The key is to get behind him and grab his tail. Then, spin the stick to build speed and throw him into one of the four spiked bombs around the edge. If you miss, he climbs back up, so you need to repeat the maneuver.
> 
> For the second fight, you'll need to navigate the tilting stage and avoid the single fireballs and teleporting attacks.
> 
> For the final fight at 70 stars, you must throw him three times. His slams send shockwaves, and his fire breathes back down. Focus on timing your throws to avoid getting hit by the downward fire.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, Getting your first star in Bob-omb Battlefield, The three caps  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is managed by the eight-wedge power meter. You refill this meter by collecting coins, spinning hearts, or by surfacing in water.
> 
> If you are struggling to manage your health, focus on these things:
> 
> 1.  **Collect Coins:** These are the most straightforward way to gain power.
> 2.  **Spinning Hearts:** Look for any objects that spin and drop hearts; these will refill your meter.
> 3.  **Surfacing in Water:** When you are in water, surfacing will refill your health meter.
> 
> The game also has specific moves that can affect your health, like the triple jump or the long jump, which use up your power.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell only comes to fourth place or lower. It runs along the ground with a siren, tries to home in on the leader, and flips anyone in its path. You can hold it behind your kart to block other shells before you fire yours.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Drifting and Mini-Turbos, Picking a kart for top speed  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get a rocket start in Mario Kart 64, you need to hold the gas while the lights change from red to blue. If you do it too early, you'll spin your tires and go slower than everyone else.
> 
> The key is to hop into a drift by holding the drift button through a turn, and then wiggle the control stick side to side while you keep holding it. This action charges a short speed boost. When you let go of the drift, that boost fires instantly on top of your current speed.
> 
> If you drive straight into a banana, a well-timed tap of the brake will save the spin and give you a musical note.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Rawk Hawk, Magnus von Grapple and Cortez  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> To handle Hooktail's healing, you need to manage the crowd size in the arena. Since she eats members of the audience to heal, the key is to keep the number of enemies in the field low. If you have too many enemies, she will heal herself, making her much harder to take down.
> 
> Also, remember that her bite cannot be blocked, so make sure Mario has high HP so he can survive those hits. Koops is useful here because his shell toss hits her first, which can help control the initial exchange. Fire attacks are also noted as being particularly effective against her.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, The final battle: hands, patterns and the charge tell  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles in Paper Mario: The Thousand-Year Door are turn-based. Mario and one partner take turns acting. In a turn, you get to perform an action command.
> 
> An action command is essentially the specific move you choose to use in that turn. You have a few options:
> 
> 1.  **Standard Attack:** This is the basic move you use to hit an enemy.
> 2.  **Action Command:** This is a special button press at the right moment during an attack animation. This press can grant you extra damage.
> 3.  **Stylish Move:** If you press the button at the exact beat of the attack animation, you can use a Stylish Move. This works on normal and badge attacks.
> 
> When an enemy attacks you, you have a few options to defend:
> 
> 1.  **Guard (A):** This reduces the damage you take.
> 2.  **Superguard (B):** This is a special move that can sometimes result in no damage and even give you a point back.
> 
> Focus on timing those action commands and stylish moves to maximize your impact.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the giant bulborb boss depends entirely on where you are in the game. If you are in Frontier Cavern, the Empress Bulblax is awake and pumping out larvae constantly. In that case, your main goal is to kill the mother, not the children. Since she rolls from wall to wall, keep your Pikmin squad positioned off the sides of the screen and throw your purple Pikmin at her head during the pauses when she stops moving.
> 
> If you are in the Hole of Heroes, she is asleep when you arrive, which is your best chance for a sneak attack.
> 
> Regarding the enemies spawning, if you are dealing with a general swarm, remember that some enemies, like Gatling Groinks, fire mortars from a range you can't reach, and a dead one will respawn. You need to manage the immediate threats while focusing your main attack on the boss.
> 
> Where are you at in Pikmin 2?

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Growing your Pikmin squad, Purple and White Pikmin  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to collect ten thousand Pokos of treasure to pay off the company's debt. Treasures and enemy bodies both contribute to this total.
> 
> Regarding the day limit, there is still a day limit. The day ends at sunset. Any Pikmin that is not with a captain or back at the Onion will be eaten when the night creatures wake up. You need to watch the sun and call everyone in early.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> Fox is fast and lightweight. His main strengths are his quick dash, fast fall, and three-frame jump. His shield is also quick to deploy and knocks opponents sideways. However, his speed is also his weakness because falling fast means he can be combo'd hard.
> 
> Falco is slower and heavier than Fox. His strength lies in his laser, which makes opponents flinch and cancels when he lands, shutting down approaches. His down air spikes straight down. The Falco pillar—reflector into a down air spike into more—is considered one of the best shield routines in the game. Both characters die early because they fall very fast.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Classic Mode's Metal Battle  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ❌

> Damage in Melee isn't about draining a health bar; it's about percentage-based damage. When you hit an opponent, the damage dealt is a percentage of their current health. The higher that percentage goes, the further the hit sends them. A stock is lost when you launch an opponent past the edge of the screen, not when their health reaches zero.
> 
> Knockback is also tied to that launch distance. A bigger hit percentage means a greater knockback effect, sending the opponent flying further.
