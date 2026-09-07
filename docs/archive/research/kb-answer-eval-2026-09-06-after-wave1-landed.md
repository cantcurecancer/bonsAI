# Knowledge-base answer eval — 2026-09-06 — after-wave1-landed

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.06` |
| corpus_sections | `266` |
| prompt_variant | `baseline` |
| kb_placement | `early` |
| voice_preset | `` |
| think_effort | `off` |
| samples_per_case | `3` |
| cases | `61` |
| run_minutes | `4.0` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **71.9%** (123/171) | every must-mention group found in the reply |
| No contradiction | **100.0%** (54/54) | nothing from the must-not-say list appeared |
| Fence not misfired | **97.0%** (163/168) | no spoiler fence where none was due |
| Fence present when due | **100.0%** (9/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **97.8%** (135/138) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (171/171) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (183/183) | pipeline returned a reply |
| Cases with every sample clean | **63.9%** (39/61) | strictest view |

Mean seconds per answer: **1.3**. Mean request payload: **6834.3** bytes. Mean prompt tokens (Ollama prompt_eval): **1479.6**.
Mean system prompt length: **6418.2** characters.
D46 window warnings: **0/183** samples. Mean estimated prompt tokens: **1848.4**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | Window warn | Prompt tokens | s/answer |
|---|---|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1943.0 | 1.1 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1955.0 | 1.5 |
| `A-DRG-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1300.0 | 0.7 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1918.0 | 1.8 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1891.0 | 1.5 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1159.0 | 1.1 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1777.0 | 1.6 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1167.0 | 0.6 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1721.0 | 1.1 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1115.0 | 0.5 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1585.0 | 0.9 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1845.0 | 1.5 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1823.0 | 1.6 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1776.0 | 1.0 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1758.0 | 0.8 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1870.0 | 1.9 |
| `A-CP77-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1541.0 | 1.2 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1216.0 | 0.6 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2011.0 | 1.6 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1904.0 | 2.1 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1224.0 | 0.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1726.0 | 1.6 |
| `A-FO4-05` | strategy | 3/3 | 0/3 | — | 2/3 | 2/3 | 0/3 | 1937.0 | 1.2 |
| `A-RDR2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 0/3 | 1870.0 | 1.0 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1184.0 | 1.2 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 0/3 | 1906.0 | 0.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1595.0 | 1.2 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1907.0 | 1.5 |
| `A-SOE-02` | speed | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1164.0 | 0.7 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1979.0 | 1.2 |
| `A-OOT-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 1878.0 | 1.4 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1793.0 | 1.2 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1464.0 | 1.8 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 1129.0 | 1.1 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 1/3 | 3/3 | 0/3 | 1110.0 | 0.9 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1575.0 | 1.1 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 0/3 | 1751.0 | 1.3 |
| `A-BMS-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2171.0 | 1.4 |
| `A-BMS-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2127.0 | 1.1 |
| `A-HK-01` | strategy | 3/3 | 0/3 | 3/3 | 1/3 | 3/3 | 0/3 | 2170.0 | 1.6 |
| `A-HK-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2230.0 | 1.3 |
| `A-DOOME-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2156.0 | 2.1 |
| `A-DOOME-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2108.0 | 1.8 |
| `A-DOOM64-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2017.0 | 1.6 |
| `A-DOOM64-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 2057.0 | 1.6 |
| `A-GTAV-01` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2179.0 | 1.0 |
| `A-GTAV-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2197.0 | 1.7 |
| `A-GTAIV-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2193.0 | 1.2 |
| `A-GTAIV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2245.0 | 1.2 |
| `A-FNV-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2320.0 | 2.0 |
| `A-FNV-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2381.0 | 1.4 |
| `A-SM64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2173.0 | 1.7 |
| `A-SM64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2136.0 | 1.0 |
| `A-MK64-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2143.0 | 1.2 |
| `A-MK64-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 0/3 | 2142.0 | 1.4 |
| `A-TTYD-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2221.0 | 1.4 |
| `A-TTYD-02` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 0/3 | 2316.0 | 1.5 |
| `A-PIK2-01` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2080.0 | 1.7 |
| `A-PIK2-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2126.0 | 1.2 |
| `A-MELEE-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 0/3 | 2207.0 | 1.5 |
| `A-MELEE-02` | strategy | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 0/3 | 2192.0 | 1.4 |

## Failures worth reading

- **A-DRG-03** sample 2: missing facts: `shop`
- **A-HADES-03** sample 3: missing facts: `not the end`
- **A-FO4-05** sample 1: missing facts: `twice`; spoiler fence present, none due
- **A-FO4-05** sample 2: missing facts: `twice`; branch menu missing
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-RDR2-01** sample 1: missing facts: `slow`, `bounty`; branch menu missing
- **A-SOE-02** sample 1: missing facts: `score`, `story`
- **A-OOT-02** sample 1: missing facts: `megaton hammer`
- **A-GTASA-01** sample 1: spoiler fence present, none due
- **A-GTASA-01** sample 3: spoiler fence present, none due
- **A-BMS-01** sample 1: missing facts: `shell blocks`
- **A-BMS-01** sample 2: missing facts: `shell blocks`
- **A-BMS-01** sample 3: missing facts: `shell blocks`
- **A-BMS-02** sample 1: missing facts: `kept the same`
- **A-BMS-02** sample 2: missing facts: `mostly new`, `kept the same`
- **A-BMS-02** sample 3: missing facts: `kept the same`
- **A-HK-01** sample 1: missing facts: `hit the head`, `jump the shockwave`; spoiler fence present, none due
- **A-HK-01** sample 2: missing facts: `hit the head`, `jump the shockwave`; spoiler fence present, none due
- **A-HK-01** sample 3: missing facts: `hit the head`
- **A-DOOME-01** sample 1: missing facts: `shield blocks`
- **A-DOOME-01** sample 2: missing facts: `shield blocks`
- **A-DOOME-01** sample 3: missing facts: `shield blocks`
- **A-DOOM64-02** sample 1: branch menu missing
- **A-GTAV-02** sample 1: missing facts: `Michael slows time`, `yellow meter`
- **A-GTAV-02** sample 2: missing facts: `Michael slows time`, `yellow meter`
- **A-GTAV-02** sample 3: missing facts: `Michael slows time`, `yellow meter`
- **A-GTAIV-02** sample 1: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 2: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-GTAIV-02** sample 3: missing facts: `sleep in the bed`, `clears your wanted level`
- **A-FNV-01** sample 1: missing facts: `cripple a leg`
- **A-FNV-01** sample 2: missing facts: `cripple a leg`
- **A-FNV-01** sample 3: missing facts: `cripple a leg`
- **A-FNV-02** sample 1: missing facts: `Goodsprings`
- **A-FNV-02** sample 2: missing facts: `Goodsprings`
- **A-FNV-02** sample 3: missing facts: `Goodsprings`
- **A-TTYD-01** sample 1: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 2: missing facts: `eats the audience`, `cricket`
- **A-TTYD-01** sample 3: missing facts: `eats the audience`, `cricket`
- **A-TTYD-02** sample 1: missing facts: `guard with A`
- **A-TTYD-02** sample 2: missing facts: `guard with A`
- **A-TTYD-02** sample 3: missing facts: `guard with A`
- **A-PIK2-01** sample 1: missing facts: `kill the mother`
- **A-PIK2-01** sample 2: missing facts: `kill the mother`
- **A-PIK2-01** sample 3: missing facts: `kill the mother`
- **A-PIK2-02** sample 1: missing facts: `two captains`
- **A-PIK2-02** sample 2: missing facts: `two captains`
- **A-PIK2-02** sample 3: missing facts: `two captains`
- **A-MELEE-01** sample 3: missing facts: `fastest lightweight`, `die early`
- **A-MELEE-02** sample 1: missing facts: `launched off the screen`
- **A-MELEE-02** sample 2: missing facts: `launched off the screen`
- **A-MELEE-02** sample 3: missing facts: `launched off the screen`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle the Glyphid Dreadnought, focus on kiting the waves. Target the weak-point armor plates as they open up. Save your powerful weapons, like the nuke or overclock, for when you see windows for armor breaks.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You are fighting the Dreadnought Twins, which is a tough encounter because they heal each other while you try to damage them. The key is to split your fire evenly between them. Don't focus all your damage on one twin, or they will just keep healing the other one. Try to keep the damage balanced so neither one gets overwhelmed too quickly. Also, remember that the healing never starts, so you need to focus on keeping the damage output steady.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is used to buy weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod. If you don't have nitra, you will have an underleveled weapon regardless of how much gold you mine, so keep mining it for whichever weapon carries the run.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will guide you on how to handle the Tank. Remember, this is about positioning and not just shooting.
> 
> When you see the Tank, the main thing is to avoid getting hit by his big attacks. He throws concrete chunks, so try to stay out of his direct line of sight. If you can slip past him, the horde will come right back to you.
> 
> If you see a teammate who is pinned down, put your body between that survivor and their friends. Don't just stand there; use your body as a shield. Also, be aware of how he moves; if he tries to crouch through a vent, he becomes very slow and might not look for an alternate route.
> 
> For fighting him, try to engage him in the open. Anything he can punch becomes a projectile that has more reach than his fists. If you take a punch near a drop, it's usually more dangerous than just getting knocked down.
> 
> Remember, the goal is to survive his attacks and use your positioning to help your team.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, The Director  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks when she is startled. She ignores gunfire unless it's aimed directly at her, and she ignores other infected.
> 
> She gets agitated when you use a flashlight or when a survivor gets too close. When she growls, back off. If you keep coming, she will charge you.
> 
> To slow her down, you need to use fire on her. However, if you startle her first, she will switch her attack to whoever burned her, not necessarily whoever woke her.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter involves managing your pounce damage scaling with distance. A long pounce can deal up to 25 damage, so height and a good run-up are more important than just surprise.
> 
> If you have to be near the group, move like a common player. The melee claw reads as horde damage until someone checks. To maintain pressure, hold crouch and re-pounce quickly, as the pounce recharges fast. Take the straggler, not the entire group.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are three different surfaces you can interact with in the game, and each one has a specific function.
> 
> The blue Gel is the Repulsion Gel. This one is used to gain height. The higher you drop onto it, the higher you bounce. You can use it to climb by bouncing between two blue surfaces that are facing each other.
> 
> The orange Gel removes friction. If you land on an orange Gel, you keep the speed you have when you land.
> 
> The white Gel is used for portaling. It allows you to portal a surface that wouldn't normally allow portals, but be warned, the cleansing spray will strip it away.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is carrying you in the wrong direction, look for the button that reverses its direction before you assume the route is shut. Since it passes through portals, it can cross the whole chamber, and it ferries gel and cubes along with you.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are running into Antlions because they hunt by vibration. The key is to stay on the rocks when you are near the coast; the sand is where they come up to attack. Stick to the rock formations to stay safe from them.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Once you acquire the pheropod from the Antlion Guard, you throw it. The antlions will then read you as a guard and swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can pick up and throw a variety of items. Based on the information available, this includes:
> 
> *   Secondary pulls and holds.
> *   Primary punts.
> *   Explosive barrels.
> *   Sawblades (which can cut zombies apart).
> *   A held radiator, which can be used as a shield while you walk behind an enemy.
> *   Manhacks and scanners are fair game for picking up.
> *   Thrown grenades can be returned to where they came from.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the Stygian Blade first. It is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. Leave the Twin Fists of Malphon until later — they are the fastest, but they need you standing inside everything. The Heart-Seeking Bow and the Adamant Rail both want range and punish standing still, and the Rail can leave you reloading at the worst possible moment.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you're struggling with the timing against Theseus and Asterius. The key is managing both of them simultaneously. Asterius, the bull, telegraphs a long charge—you need to sidestep that charge, and you'll be stuck briefly. Theseus, on the other hand, throws spears and calls down god powers marked on the ground.
> 
> Most players find it easier to take down Asterius first because he's more predictable. If you can handle the initial charge, you can focus on managing Theseus's attacks.
> 
> For survivability, consider using the Shield of Chaos. Holding block turns a mistake into nothing, and it also sets up a rush that closes the distance.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The game does not end after defeating the final boss. You are now entering a phase where the game continues, and you can choose to increase the difficulty by managing Heat for rewards.
> ```

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused system that ignores time. It functions by cutting damage taken and prevents your health from dropping below a quarter. Furthermore, after you defeat an enemy, it restores a quarter of your maximum health. The specific effects it has on your melee weapons depend on the model you have installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first playthrough, the attribute split is key because it dictates your early gameplay loop. You need to decide what kind of playstyle you want to lean into.
> 
> If you want to be a straightforward fighter who can absorb hits, focus on Body and Reflexes. These two attributes make you a solid frontline combatant and are forgiving if you make a mistake.
> 
> If you are leaning into the netrunner or hacker route, Intelligence is your primary focus. This lets you use quickhacks to bypass things before you get into a sustained fight, but you will be very fragile if things go wrong.
> 
> Technical Ability is the quiet backbone. It helps with crafting and unlocking the cyberware you actually want, which is important for long-term build customization. Cool rewards patience and stealth, which can be useful depending on your chosen Lifepath.
> 
> The general advice is that spreading points evenly is usually the worst choice, as you won't get the necessary attribute thresholds for the perks.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The main story's ending is heavily influenced by the Lifepath you chose at the start (Nomad, Streetkid, or Corpo). The final sequence involves making choices throughout the game that determine the ultimate outcome and the specific narrative path you follow.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher, focus on high damage output, specifically using Sandevistan or high DPS builds. Prioritize destroying his legs first, and make sure you have cover while he's launching rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Deathclaw is tough, especially early on. It has high health and resists a lot of damage, and energy weapons are useless against its hide.
> 
> For an early encounter, distance and cover are your best friends. You need to use cover to keep it from getting close enough to stomp or grab you. When it does open up, focus on keeping your distance and using any cover you have available. If you can't avoid it, aim for its weak points, but generally, stay away until you have better gear or a stronger build.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Strategy Guide mode active. I will keep the advice spoiler-minimized.
> 
> The starting SPECIAL points are one in each stat, totaling 28 points to spend. The best early build depends entirely on what kind of gameplay you want to do.
> 
> Intelligence is a quiet strong pick. It increases how fast you level up, meaning you get more perks sooner. Strength combined with Endurance makes you a good melee or heavy weapons survivor who can take a hit and keep going. Agility with Perception is for the sniper or V.A.T.S. route, focusing on killing things before they can get to you. Charisma is the weakest early stat but is crucial for settlement and speech builds later on. Remember, you can still raise any stat later with bobbleheads and level-ups, so don't obsess over perfection in the first few hours. Pick what feels fun to play.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If Feral ghouls are swarming you, focus on exploiting their physical weaknesses. Take a leg off one, and it will stop attacking altogether. Taking both arms off does not stop them. They are fast and deal radiation damage, so if you are in heavily irradiated areas like the Glowing Sea, you can regenerate as you shoot them. They can also climb out of ductwork and windows, so be aware of your surroundings in rooms that look clear.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor has stopped working, check a few things. First, ensure you have enough fusion core charge. The frame drains faster when you sprint or use V.A.T.S. If the core is empty, you can still walk, but you will lose V.A.T.S. and steady aim, and you will be over-encumbered.
> 
> Second, check your power armor station. Repairs and upgrades need to be done at a power armor station, or you can build one at a settlement. If you are trying to upgrade a piece, make sure you have the necessary materials, as the cost is the same regardless of your tier, but later models require rarer materials.
> 
> Third, consider if the issue is related to the armor itself or the core. If the core is depleted, you might need to find a way to recharge it or replace the armor entirely.
> 
> If you are experiencing a specific error message or behavior, providing more detail might help narrow down the problem.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ✅

> ```bonsai-spoiler
> Legendary enemies have a mechanic where, around half their health, they will heal themselves completely and gain a new ability. This means you shouldn't spend all your resources on the first half of the fight; you need to manage your damage carefully to avoid being completely wiped before the second phase begins.
> ```

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ❌

> No response text.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor is a slider, not a switch. It's determined by the small things you do often.
> 
> *   **Be Helpful:** Greeting people, helping strangers on the road, and offering assistance generally increases your Honor.
> *   **Avoid Negative Actions:** Actions like robbery, killing civilians, and harming animals you don't intend to use will lower your Honor.
> *   **Choose Your Interactions Wisely:** The specific actions you take, such as whether you pay a bounty or choose to help instead, affect your score.
> 
> Think of it as a continuous process. One bad day won't undo a good chapter, but consistent positive behavior will push the slider up.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> ```bonsai-spoiler
> The ending of Red Dead Redemption 2 involves Arthur Morgan's final confrontation and the resolution of the main conflict.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Horse bonding is key to handling. Bond level directly affects stamina, handling, and maneuvers like the rear and drift. You improve this by riding, feeding, brushing, patting, and calming the horse during danger. A high-bond horse is less likely to spook when something scares it. Bond is specific to each horse, so switching mounts resets the process.
> 
> If the issue persists, consider the horse's breed. Different breeds have varying speeds, stamina, and spookiness at gunfire or predators. Draft horses carry more and panic less, while racing breeds are quick but fragile. Early on, the bond matters more than the stat line; a bonded horse will handle better and arrive when you whistle from further away.

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Unlocking characters  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on pickups. The game has pickups scattered around the level that add 15 seconds each to your round timer.
> 
> Here are the main tips:
> 
> *   **Prioritize Time Over Crowd:** The key strategy is knowing when to stop fighting enemies and start grabbing these pickups. Extending your round time is often worth more than clearing a crowd of enemies.
> *   **Scan for Pickups:** Keep an eye on the environment. If you see a pickup, move toward it and grab it.
> *   **Patience:** Don't just rush into fights. Look for opportunities to slow down and collect those extra seconds.
> 
> This is the basic mechanic for extending your time.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> No response text.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Shadow Temple is designed to trick you into thinking sections are unreachable. The key is using the Lens of Truth and the invisible floors/walls.
> 
> Here is the basic approach:
> 
> *   **Use the Lens of Truth:** This item will reveal the invisible floors, walls, and chests.
> *   **Magic Drain:** Be aware that holding the Lens drains magic. Use it in short bursts rather than keeping it on constantly.
> *   **Power Up:** Keep your magic flowing using Green Potions and the fairies found within the temple.
> 
> Since you are asking about the missing floors, the primary solution is equipping the Lens of Truth to see what you need to step on.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> You are facing Volvagia. The key to this fight is timing. When the fire dragon pops out of the floor, hit its head immediately when it comes up. Then, slash it while it is stunned. If it flies around the room, use the hookshot to pull it back down. For defense, use the Goron Tunic and a shield, and make sure to stay away from the lava at the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Sneak Attack, Party composition  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Long rests in Baldur's Gate 3 cost camp supplies and restore spells, health, and most abilities. Hoarding rests means you might miss story progression or important companion scenes.</bonsai-spoiler>
> If you are running low on supplies or need to recover from combat, a long rest is generally a good option. However, if you are in a safe area and have plenty of supplies, you might be better off resting shorter periods to keep moving and advance the plot.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, aim for a balanced party that covers the core needs: talking, healing, utility, and damage. A solid starting point is often a combination that ensures you aren't completely helpless.
> 
> Consider this general breakdown:
> 
> 1.  **Talk/Skill Check:** A Bard or Paladin is great for dialogue and social encounters.
> 2.  **Healing:** A Cleric or Druid is essential for keeping the group alive.
> 3.  **Utility/Defense:** A Rogue or Ranger handles traps, locks, and provides necessary ranged damage.
> 
> If you need to cover all bases, a common setup involves these roles:
> 
> *   **Frontline/Tank:** Often a Fighter or Paladin to soak initial hits.
> *   **Damage Dealer (Melee):** A Fighter or Barbarian.
> *   **Damage Dealer (Ranged/Skill):** A Ranger or Rogue.
> *   **Support/Healer:** A Cleric or Druid.
> 
> If you are struggling with specific encounters, focus on ensuring you have at least one dedicated healer and one character capable of dealing consistent damage. Remember that backgrounds matter; picking backgrounds that match how you actually play will help you generate Inspiration, which can be useful for difficult checks.
> 
> If you tell me what kind of content you are focusing on (e.g., exploration, combat, specific areas), I can give you a more tailored suggestion.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The quickest ways to generate income early in The Sims 4 usually involve focusing on skills that require minimal upfront investment.
> 
> 1. **Painting and Writing:** These are classic self-employed earners because they only require one skill and one object. Both skills scale hard with level, meaning they become very profitable once you invest time in them.
> 2. **Selling Collectibles:** Starting with a cheap starter lot allows you to focus on selling items that generate funds very early in the game.
> 
> Gardening is generally slower to start because it takes time to establish a viable plot, and painting/writing offer a faster path to consistent, scalable income.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> Recruiting more gang members is governed by the Respect mechanic. You can recruit up to seven gang members. This is influenced by several factors: completing missions, killing rival gang members and the police, taking territory, spraying over tags, and appearance nudges like hair, tattoos, clothes, muscle, and wearing green when in Grove Street territory. It falls if you wear the wrong colors at home, kill your own members, or lose turf.
> 
> ```bonsai-spoiler
> The exact conditions for increasing the recruitment limit are tied to maintaining a certain level of gang affiliation and activity within the game world.
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You're asking about Margit. Since you're playing Elden Ring, beating her involves managing your stamina and dodging her attacks carefully. Focus on timing your dodges to avoid getting hit, and try to keep your stamina up so you can maintain your defensive posture.
> 
> Since you're asking about her, we can focus on the general approach.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> It sounds like you're stuck in Tartarus. Since we are in Strategy Guide mode, I will focus on general advice for surviving the early stages.
> 
> ```bonsai-spoiler
> When you are struggling to keep up, focus on managing your resources and positioning. Try to prioritize survival over aggressive play initially. For instance, if you are struggling with a specific encounter, consider using defensive options like blocking if you have the Shield of Chaos, as it turns mistakes into damage rather than taking them. Also, pay close attention to the mechanics of the area you are in; understanding the enemy patterns is key to surviving the waves.
> ```

### A-BMS-01 — Black Mesa — strategy

**Q:** How do I damage the giant headcrab boss at the end of the Xen caverns in Black Mesa?  
**Cards:** Gonarch, Starting out in Black Mesa, Nihilanth  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Reviewing the layout and mechanics for the Gonarch boss in the Xen caverns.
> 
> To damage the Gonarch, you need to be aware of its vulnerabilities. At range, it will lob white acid mortars from its back. Up close, its front legs deliver huge damage. The key weakness is the pale egg sac swinging under its body; any shot not aimed at that sac is wasted. Also, watch your footing, as it walks over pits that you and its children fall straight through. When it dies, the sac bursts and releases a final brood, so keep your distance.

### A-BMS-02 — Black Mesa — strategy

**Q:** What's different about the Xen levels in Black Mesa compared to the original Half-Life?  
**Cards:** Starting out in Black Mesa, Long Jump Module, Gonarch  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The Xen chapters in Black Mesa are mostly new work and significantly longer than the original 1998 levels. Expect a much larger alien world to explore. The core gameplay loop remains the same: no cutscenes, scripted scenes you walk through, using a crowbar for crates and vents, and fights that are better from a doorway than the middle of a room.

### A-HK-01 — Hollow Knight — strategy

**Q:** How do I beat the big armored bug boss in the Forgotten Crossroads?  
**Cards:** False Knight, Watcher Knights, Broken Vessel  
**Checks:** facts ❌ · contradiction ✅ · fence ❌ · menu ✅

> Strategy Guide Mode active. I will keep the coaching spoiler-minimized.
> 
> ```bonsai-spoiler
> The first encounter with the armored maggot involves dodging its initial charge and slamming a mace that creates a shockwave across the floor. The key is to jump over that wave instead of backing away. Saving your soul is important because you don't gain it from hitting the armor directly. You only get soul or deal real damage when the armor is broken and the maggot topples. After the first rage, a wall above the left gate becomes breakable, and a Vengeful Spirit spell is available in the next room, which simplifies the rematch.
> ```
> 
> To deal with the initial attack, focus on timing your jumps to avoid the shockwave. Once the armor starts breaking, focus on hitting the head while managing your health. If it gets too aggressive, use the environment to your advantage, like the breakable wall.

### A-HK-02 — Hollow Knight — strategy

**Q:** I just started Hollow Knight and don't have a map -- how do I get one, and what do benches actually do?  
**Cards:** Starting out in Hollow Knight, Watcher Knights, Charms and notches  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Getting a map in Hollow Knight is tied to finding a specific character. You need to find Cornifer, the humming cartographer. Once you meet him, you can buy his map. The map itself won't fill in automatically; you need to rest at benches to actually reveal the areas.
> 
> Benches are crucial. They serve several purposes: they are where you can rest, save your progress, and this is the only place you can swap charms. Think of them as your hub for managing your gear and saving your game.

### A-DOOME-01 — DOOM Eternal — strategy

**Q:** How do I fight the Marauder in DOOM Eternal? He keeps blocking everything.  
**Cards:** Starting out in DOOM Eternal: the combat loop, Marauder, Arch-vile  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Fighting the Marauder is about managing its blocking ability and exploiting its openings.
> 
> Stay at mid-range. If you get too close, it will draw your super shotgun faster than you can dash. If you stay too far, it will throw axe waves at you.
> 
> The key is to watch its feet. When it winds up the axe, its eyes will flash green. Hit it in that exact instant. This will make it stagger for a couple of seconds. During that window, pour in your highest damage per shot, like the super shotgun, ballista, or rocket. Try to swap weapons between hits to keep the pressure on.
> 
> Grenades and rockets exploding near it can also briefly knock down its shield, giving you an opening. Kill the glowing wolf it summons immediately, and make sure you clear the other demons first. Keep the space between you and the arena.

### A-DOOME-02 — DOOM Eternal — strategy

**Q:** What's the basic combat loop I'm supposed to be doing in DOOM Eternal?  
**Cards:** Starting out in DOOM Eternal: the combat loop, Doom Hunter, The Crucible  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The basic combat loop in DOOM Eternal is about managing resources and never standing still. Here are the core steps:
> 
> 1. **Shoot Weak Enemies:** Start by shooting weaker demons until they flash. Then, glory kill them to get their health.
> 2. **Chainsaw Fodder:** Use the chainsaw on fodder demons. This gives you a quick burst of ammo. Remember, the chainsaw uses three fuel units, and it refills automatically every twenty seconds. Fodder demons cost one fuel unit.
> 3. **Flame Belch Groups:** Use the flame belch ability on groups of demons to kill them on fire, which gives you armor. This ability has a cooldown of twenty-five seconds.
> 4. **Manage Fuel and Movement:** Keep an eye on your fuel. Heavy demons cost all three fuel units and cannot be sawed at all. Crucially, never stand still. Dash twice, jump twice, and swap weapons mid-fight instead of just reloading. If you run out of everything, you'll get the chainsaw for one fodder kill and the loop resets.
> 
> Focus on keeping the action moving and balancing your resource usage.

### A-DOOM64-01 — Doom 64 — strategy

**Q:** How do I beat the final boss in Doom 64, the Mother Demon?  
**Cards:** Starting out in Doom 64, Mother Demon, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> I can give you some general advice on how to handle the Mother Demon. The key is managing her attacks.
> 
> First, you need to focus on getting the Demon Keys. You'll need all three of them to fight her effectively.
> 
> When she starts her attack, she tosses you into the air, and four homing rockets will follow. You need to dodge those rockets. The crucial part is using the fully upgraded Unmaker at point-blank range. Its fire rate stuns her, which stops her from launching the rockets, leaving you only to dodge the flame trails.
> 
> If you haven't found all three Demon Keys yet, you'll fight a large horde before she appears, which will burn a lot of your ammo. Prioritize getting those keys first.

### A-DOOM64-02 — Doom 64 — strategy

**Q:** Is Doom 64 just a port of the original Doom games, or is it different?  
**Cards:** Starting out in Doom 64, Unmaker and the Demon Keys, The Lost Levels  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ❌

> Doom 64 is a separate game, not just a port of the original Doom. It features thirty-two new levels, redrawn larger sprites, colored lighting, and a slower, darker atmosphere compared to Doom II. It keeps the core gameplay but adds new elements like the Unmaker and different monsters.
> 
> The key difference is that it's a sequel with its own identity. You need to focus on finding keys and switches to power up the Unmaker, which eventually allows you to stun everything.
> 
> Where are you at in Doom 64?

### A-GTAV-01 — Grand Theft Auto V — strategy

**Q:** How does body armor work in GTA V, and does it help against melee?  
**Cards:** Starting out in GTA V, Weapons, armour and cover, Special abilities and how to grow them  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Body armor in GTA V comes in five tiers, purchased from Ammu-Nation. Each tier is stronger than the last. The main thing to know is that body armor does nothing against melee weapons. It's purely for protection against gunfire.

### A-GTAV-02 — Grand Theft Auto V — strategy

**Q:** How do the special abilities work for the three characters in GTA V?  
**Cards:** Starting out in GTA V, Special abilities and how to grow them, Side jobs and collectibles that count  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The special abilities are unique to each character. Michael has Area Kill, which is bullet time for shootouts and lasts for thirty seconds once the ability bar is maxed. Franklin has Driving Focus, which slows the world while he is in any land vehicle, making gaps and slides easier. Trevor has Rage, which doubles his damage and makes him immune to everything for its duration.

### A-GTAIV-01 — Grand Theft Auto IV — strategy

**Q:** Where can I reliably buy weapons in GTA IV, and is there a discount anywhere?  
**Cards:** Starting out in GTA IV, Weapons and where to buy them, Friends and their favours  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You can get weapons in a few ways in GTA IV. You can find dropped guns lying on the ground; they'll have a faint orange glow, and you can disarm an enemy by shooting their hand instead of killing them.
> 
> For more reliable sources, you can check out the underground gun shops that open after you do Do You Have Protection? Once Little Jacob likes you enough, his van sells everything at sixty percent off. That's a good discount.

### A-GTAIV-02 — Grand Theft Auto IV — strategy

**Q:** How does saving work in GTA IV, and does it clear my wanted level?  
**Cards:** Starting out in GTA IV, Wanted levels and the search circle, Girlfriends  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Saving in GTA IV is straightforward. You save by walking to the bed in a safehouse and choosing to sleep. This action will also clear any current wanted level.
> 
> If you are currently playing and want to know about wanted levels, let me know.

### A-FNV-01 — Fallout: New Vegas — strategy

**Q:** Why is Quarry Junction so dangerous, and how do I survive if I have to go through it early?  
**Cards:** Deathclaws and Quarry Junction, Hardcore mode, Companions and what each one gives you  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Quarry Junction is dangerous because it's a heavily fortified area with tough enemies and specific environmental hazards. The main threats you'll face are the Deathclaws, who are much tougher than the standard ones, and the unique challenges within the quarry itself.
> 
> Here is a quick rundown of what makes it tricky:
> 
> 1.  **Enemies:** You'll encounter Deathclaws at double or triple their usual strength. Be aware of the alpha male, which hits hard, and the mother, who gets berserk if you kill one near her.
> 2.  **Environmental Hazards:** The area has specific ways to avoid getting overwhelmed. If you can stand on a rock they can't reach, dive into water, or use a flare gun to scare them off, you can stop their pursuit. Also, a crippled leg can slow down their leaping attacks significantly.
> 3.  **Loot:** The primary objective is clearing the area to find the Fat Man, who has two mini nukes and a light machine gun in his den.
> 
> If you are going through it early, focus on survival first. Use your movement and environmental tactics to avoid direct confrontation with the tougher Deathclaws until you have a plan for dealing with them.

### A-FNV-02 — Fallout: New Vegas — strategy

**Q:** I'm new to Fallout: New Vegas -- how do skill checks work, and can I fail them randomly?  
**Cards:** Starting out in Fallout: New Vegas, Skills, SPECIAL points, implants and books, Companions and what each one gives you  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Skill checks in Fallout: New Vegas are not random; they are based on a fixed threshold. If you need a Speech check of 25, you either succeed or you fail, depending on whether your total score meets or exceeds that number. It's not a dice roll where you can randomly fail.
> 
> You get skill points based on your stats and the skills you choose to tag. Each level you gain in a skill gives you points, and you have to meet the required threshold for the check.
> 
> If you want to get a better idea of how your stats and skills translate into points, we can look at how to start building your character.

### A-SM64-01 — Super Mario 64 — strategy

**Q:** How do I actually beat Bowser in Super Mario 64? I keep missing the bombs.  
**Cards:** Starting out in Super Mario 64, Bowser: the three fights, Stars that are easy to miss  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Bowser, you need to manage his attacks carefully. In the first fight, when he breathes fire, try to get behind him and grab his tail. Then, spin the stick to build speed and throw him into one of the four spiked bombs around the edge. Missing the bomb means he climbs back on.
> 
> For the second fight, which happens after you board the sub, be aware that the stage will tilt whenever he lands. He uses single fireballs and teleports, so focus on timing your jumps and positioning to avoid the direct hits.
> 
> The final fight at 70 stars involves five bombs. The key is to throw him three times. His slams send shockwaves along the floor, and his fire breath rains back down, so you need to keep moving and avoid standing still too long.

### A-SM64-02 — Super Mario 64 — strategy

**Q:** How does health work in Super Mario 64, and how do I refill it?  
**Cards:** Starting out in Super Mario 64, The three caps, Stars that are easy to miss  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Health in Super Mario 64 is managed by the eight-wedge power meter. You refill it by collecting coins, spinning hearts, or by surfacing in water.
> 
> If you are stuck on a specific section, let me know.

### A-MK64-01 — Mario Kart 64 — strategy

**Q:** Who gets the blue shell in Mario Kart 64, and can I block it?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Courses that fight back  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The blue Spiny Shell is an item that only appears for players in fourth place or lower. It runs along the ground with a siren sound, locks onto the leader, and flips anyone in its path. You can also hold it behind your kart to block other shells from firing.
> 
> If you are in the top three, you won't get the blue shell. If you are in fourth place or lower, you can get it, and you can use it defensively to block incoming shells.

### A-MK64-02 — Mario Kart 64 — strategy

**Q:** How do I get a rocket start off the line in Mario Kart 64?  
**Cards:** Starting out in Mario Kart 64, Items and who gets them, Courses that fight back  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get a rocket start, you need to hold the gas as the lights change from red to blue. If you hold it too early, you'll spin your tires and go slower than everyone else.
> 
> For the actual start, try this: Hop and hold the gas to drift, and then wiggle the stick side to side while sliding. This action makes the smoke turn white, then yellow, and finally orange. Letting go on that orange smoke gives you a mini-turbo boost. If you manage to drive straight into a banana, a well-timed tap of the brake can save the spin and show a musical note.

### A-TTYD-01 — Paper Mario: The Thousand-Year Door — strategy

**Q:** What's the trick to beating Hooktail in Thousand-Year Door? She keeps healing.  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Hooktail, Star Power, Stylish moves and the crowd  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The trick to dealing with Hooktail's healing is managing the audience. She heals by eating members of the crowd.
> 
> Here's what you need to know:
> 
> 1.  **Keep the crowd thin:** The less audience there is, the less she can heal.
> 2.  **Clear the audience:** Since she eats them, you need to focus on clearing the audience members first before focusing too much on taking damage.
> 3.  **Use Koops:** Koops can join your party. His shell toss hits her first, which can be effective.
> 4.  **Use Fire:** Fire attacks hurt her badly.
> 
> Focus on using your attacks to clear the audience quickly, and try to keep your own HP topped up since her bite cannot be blocked.

### A-TTYD-02 — Paper Mario: The Thousand-Year Door — strategy

**Q:** How does battling actually work in Thousand-Year Door -- what's an action command?  
**Cards:** Starting out in Paper Mario: The Thousand-Year Door, Star Power, Stylish moves and the crowd, Badges and BP  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Battles in Paper Mario: The Thousand-Year Door are turn-based, taking place on a theatre stage. Mario and one partner take turns acting.
> 
> An action command is essentially a button press at the right moment during an attack animation to perform an extra action, like dealing more damage or using a special move.
> 
> You can also use a button press when an enemy attack lands to guard with 'A' for reduced damage, or 'B' for a superguard for no damage and a point back, but that requires timing.

### A-PIK2-01 — Pikmin 2 — strategy

**Q:** How do I deal with the giant bulborb boss that keeps making more enemies?  
**Cards:** Empress Bulblax and the Snagrets, The enemies that empty a squad, Segmented Crawbster  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Dealing with the giant bulborb boss involves managing its behavior. If it's in Frontier Cavern, it will be awake and pumping out larvae constantly, so you need to focus on killing the mother, not the children. Since it rolls from wall to wall, keep your Pikmin squad positioned off the sides and use purple Pikmin to attack its head during the moments it pauses.
> 
> If you are dealing with enemies that empty your squad, remember that Spotty Bulbears patrol with dwarf bulbears trailing behind, and they heal if you leave them, meaning it's all or nothing—use purples from the side.
> 
> Since you mentioned a "giant bulborb boss," I am focusing on general tactics for dealing with large, mobile threats.

### A-PIK2-02 — Pikmin 2 — strategy

**Q:** What's the actual goal in Pikmin 2, and is there still a day limit?  
**Cards:** Starting out in Pikmin 2, Purple and White Pikmin, Sprays and nectar  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> The main goal in Pikmin 2 is to collect ten thousand Pokos of treasure to pay off the company's debt. There is no day limit; you can continue working until sunset. However, be careful because any Pikmin left without a captain or back at the Onion will be eaten when the night creatures wake up.
> 
> The game involves managing your Pikmin colors: red for fire and the toughest enemies, yellow for height and safety from electricity, blue for water, purple for heavy strength, and white for speed and poison immunity.

### A-MELEE-01 — Super Smash Bros. Melee — strategy

**Q:** What makes Fox and Falco so good in Melee, and what's their weakness?  
**Cards:** Fox and Falco, Starting out in Melee, Unlocking the other eleven  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Fox is fast and lightweight. His strengths are his second fastest dash, third fastest fall, and a shield reflector that knocks opponents sideways. However, his speed is also his weakness because falling fast makes him vulnerable to being combo'd hard.
> 
> Falco is slower and heavier than Fox. His strength lies in his laser, which makes opponents flinch and cancels when he lands, shutting down approaches. His down air spikes straight down, and the Falco pillar (reflector into a down air spike into more) is noted as one of the best shield-wearing routines. His weakness is generally his slower movement compared to Fox.

### A-MELEE-02 — Super Smash Bros. Melee — strategy

**Q:** How does damage and knockback work in Melee if there's no health bar?  
**Cards:** Starting out in Melee, The techniques the game never tells you about, Shields, grabs and punishing  
**Checks:** facts ❌ · contradiction ✅ · fence ✅ · menu ✅

> Damage in Melee isn't about health bars; it's about percentage damage. When you hit an opponent, the damage dealt scales based on a percentage of their current health. The higher the percentage you hit them with, the further the knockback they are sent. If you launch an opponent past the edge of the screen, they are out of the match, not because they lost health.
> 
> The game also features mechanics that make movement and positioning crucial. For example, the speed of your attacks and how you manage your momentum after a dash or jump directly affects how far you can launch someone.
