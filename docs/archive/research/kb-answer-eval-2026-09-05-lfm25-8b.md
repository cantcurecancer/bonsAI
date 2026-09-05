# Knowledge-base answer eval — 2026-09-05 — lfm25-8b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `lfm2.5:8b` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `7.3` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **98.0%** (97/99) | every must-mention group found in the reply |
| No contradiction | **88.9%** (8/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **99.0%** (95/96) | no spoiler fence where none was due |
| Fence present when due | **11.1%** (1/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **98.5%** (65/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **86.5%** (32/37) | strictest view |

Mean seconds per answer: **4.0**. Mean request payload: **7311.7** bytes. Mean prompt tokens (Ollama prompt_eval): **1551.7**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 23.7 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.7 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.6 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.9 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 1/3 | 2/3 | 10.3 |
| `A-CP77-01` | expert | 3/3 | 2/3 | 2/3 | 3/3 | 3/3 | 3.9 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.3 |
| `A-CP77-03` | strategy | — | — | — | 0/3 | 3/3 | 3.9 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.0 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.9 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.8 |
| `A-FO4-05` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.4 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.6 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-RDR2-03` | strategy | — | — | — | 0/3 | 3/3 | 3.1 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.7 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 2/3 | 3/3 | 2.7 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 3.1 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 3.8 |

## Failures worth reading

- **A-HADES-03** sample 1: missing facts: `not the end`; spoiler fence missing, one was due; branch menu missing
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-01** sample 1: missing facts: `damage taken`; said: `slows time`
- **A-CP77-03** sample 1: spoiler fence missing, one was due
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due
- **A-RDR2-03** sample 3: spoiler fence missing, one was due
- **A-BG3-01** sample 3: spoiler fence present, none due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat the Glyphid Dreadnought in Deep Rock Galactic: Survivor, you need to manage your positioning and resource usage carefully. Here's a concise guide:
> 
> - **Kite Between Waves**: Keep moving forward while dodging attacks. Don't stay in one spot for too long.
> - **Focus Weak Points**: Wait for the armor plates on its body to open up, then target them with high-damage weapons.
> - **Save Overclock/Nuke**: Hold onto your overclock or nuke abilities until the armor plates are exposed. Use them during those brief windows to deal maximum damage.
> - **Avoid Overheating**: Keep an eye on your overheating meter and manage it by retreating or using cooldowns when needed.
> 
> Follow these steps, and you should be able to defeat the Glyphid Dreadnought effectively.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You're likely letting their health bars drift apart too much. The Lacerator chases you while the Arbalest hovers back firing fireballs, but they only start healing when the gap between them closes. If you burn one down completely before touching the other, they'll heal each other up faster than you can damage them. Instead, split your fire evenly so both bars stay low and never get close enough to trigger that nasty regeneration phase. Keep kiting between them rather than focusing on a single target.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the currency used to purchase weapon upgrade cards at the between-stage shop and to reroll your artifact choice from the Supply Pod. It functions as a direct payment method for weaponry rather than character upgrades. If you find yourself with zero nitra, you risk ending up with an underleveled weapon regardless of how much gold you have mined, so prioritize mining it for whichever weapon is carrying your run.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To handle the Tank, you need to change how the team moves. The Director stops sending normal infected once he is up, so you have four guns against one big target. Do not try to tank him with a wall of bodies; instead, slip past him while he is distracted. If you let him get into an open area where he can punch things and launch them as projectiles, it gets messy. Keep the fight in narrow spaces or near drop-offs so his punches don't kill you instantly. If the route forces him to crouch through a vent, he becomes slow and stops looking for alternate paths.
> 
> Regarding the Boomer nearby: remember that their vomit isn't just damage; it summons more infected. Shove them first, then shoot. If you get biled, you glow to both teams, which can be risky if a Charger or Tank is close. The burst from killing a Boomer stumbles anyone nearby, including the Tank sometimes.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Left 4 Dead 2, The Witch is a specific type of infected that ignores gunfire unless you are aiming directly at her. She will not chase other infected or survivors unless provoked. The most common reason she attacks suddenly is if you were holding a flashlight too close to her, or if you stood too near while she was wandering calmly.
> 
> If you kept walking toward her after she started growling (which is her warning), she would switch from ignoring you to attacking. Once she starts flailing and charging, she will incapacitate the nearest survivor instantly. If you lit a fire nearby while she was still calm, she would become aggressive toward the fire source instead.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Left 4 Dead 2 versus mode, the Hunter is a high-risk, high-reward survivor. Your primary goal is to isolate and eliminate stragglers rather than engaging the main group directly. Remember that your pounce damage scales with distance; a long run-up can deal up to 25 damage, so height and momentum matter more than just surprise attacks. If you must be near the main group, move like a common survivor to avoid triggering melee claw detection until someone checks on you. Since the pounce recharges quickly, holding crouch and repeatedly pouncing maintains pressure on isolated targets. Focus on taking down the straggler first; never target the group unless necessary.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're asking about the paints, which are essential tools in this game. Here's how each one functions mechanically:
> 
> 1.  **Blue Repulsion Gel:** This makes surfaces bouncy. The key is that bounce height depends on fall distance. To get high, you must drop onto it from a greater height rather than just jumping. You can also bounce between two coated walls to climb vertically.
> 2.  **Orange Friction-less Gel:** This removes friction entirely. Objects slide indefinitely at whatever speed they had when they hit the gel; they don't accelerate or decelerate based on slope alone.
> 3.  **White Adhesion Gel:** This allows you to portal surfaces that normally refuse portals (like glass). It won't stick to cubes, turrets, or other gels, and the cleansing spray will remove it.
> 
> Note that all paints are useless if applied to glass.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Excursion Funnel is designed to transport you across the chamber via portals, but if it's carrying you the wrong way, there is almost certainly a button or interaction point nearby that reverses its direction or switches its target. Do not assume the route is shut off; simply look for the control mechanism that flips the funnel's orientation before trying to force your way through.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're getting swarmed by Antlions because they hunt vibration. On that coast, rocks are safe—step off the sand to avoid them. Once you grab the Pheropod from the Antlion Guard, throw it at them; they'll think you're a guard and attack whatever you mark instead. Keep moving between rocks until you reach the next section.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You've already named the item, so I'll skip the spoiler warning for this specific tactic. To use the bugbait, simply pick it up from the Antlion Guard and throw it at a target location or enemy. The antlions will interpret your position as that of a guard once they read the bait, causing them to swarm whatever you marked instead of attacking you directly.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun (PG-15) is versatile but has limits on mass and attachment points. It reliably picks up and throws:
> *   **Explosive Barrels:** These deal the highest damage when thrown, especially at close range or against cover.
> *   **Sawblades:** Dropped by zombies in Ravenholm; these cut through enemies effectively.
> *   **Manhack Drones:** Lightweight flying targets that can be intercepted mid-air.
> *   **Scanners:** The Combine's surveillance drones are fair game for disposal.
> *   **Grenades:** You can throw your own grenades back at the enemy or into tight spaces where they might not fit otherwise.
> *   **Radiator Units:** A held radiator acts as a mobile shield; you can walk behind it while firing other weapons.
> 
> It generally cannot lift most standard Combine soldiers due to their mass, though specific environmental objects like loose blades (in Ravenholm) are intended as ammunition for the tool.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If you are looking for the most forgiving starting weapon in Hades, the **Stygian Blade** is generally considered the best choice. It has a simple attack pattern and scales well with early boons, making it easier to manage than others that require precise positioning or have punishing cooldowns. The **Shield of Chaos** is also a strong contender if you prefer a defensive playstyle, as blocking mistakes become less costly.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're stuck on the two-headed boss fight? It's a common hurdle because you're likely trying to handle both threats equally, which splits your focus. The key is prioritization: kill Asterius first. He telegraphs his charge clearly—if you sidestep it, he gets stunned and can't move for a moment. Once he's down, Theseus becomes predictable with his spear throws and god-summons.
> 
> For defense, consider equipping the Shield of Chaos if you're taking too much damage. Blocking converts mistakes into safety rather than just reducing health, and it sets up your rush attack for counter-hits. Avoid standing still; keep moving to dodge projectiles and bomb lobes from Theseus's summons. Stay at range if possible, but don't hesitate to close in when Asterius is stunned.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Shield of Chaos, Boons and duo boons  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ❌

> You've defeated the final boss (Mega-Palace) in Hades, which triggers the true ending sequence. The game will play out a cinematic conclusion and then return to the main menu. Any further gameplay you do is considered "post-game" content or just exploring the world without the pressure of an impending death. If you want to see all endings or unlock everything, you can start new runs to experience different story paths based on your progress.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ❌ · contradiction ❌ · fence ✅ · menu ✅

> The Berserk Operating System is a melee-focused implant that fundamentally changes how you take and regain health. When active, it cuts the damage you receive from all sources and prevents your health from dropping below 25% of your maximum. Once the effect wears off or you are healed above that threshold, every enemy you kill returns 25% of your maximum health to you as a bonus. The specific effects on your melee weapons depend on the exact model installed via Ripperdoc. This is distinct from Sandevistan, which slows time for blades, and Quickhacks, which run off RAM.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For your first playthrough, you need to pick two main attributes early. Body and Reflexes make a straightforward fighter who can take hits and react fast; Intelligence lets quickhacks do the work before fights start but leaves you fragile once combat begins. Technical Ability quietly helps every build by unlocking crafting and better cyberware, so it’s worth spreading a few points there too. Avoid spreading points evenly across all six—perks sit behind thresholds, and an even spread reaches none of them reliably.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> You're asking about the main story conclusion in *Cyberpunk 2077*. Without knowing your current progress or choices made, I can't give a definitive spoiler-free summary of exactly how it ends for you. The game has multiple endings depending on your actions with Johnny Silverhand and V's final decision regarding their bodies. Generally, the ending involves a resolution between V and Johnny, often leading to either V living out their remaining life in different ways or making a sacrifice.
> 
> To tailor this better:
> - Have you completed the main storyline up to the point of choosing an ending?
> - Or are you looking for general information about the possible outcomes?
> 
> Please let me know your situation so I can provide more specific guidance.

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You asked about Adam Smasher; here is the direct, spoiler-minimized coaching you requested.
> 
> To defeat Adam Smasher, prioritize destroying his legs first to immobilize him and reduce his damage output. Use Sandevistan abilities or high DPS builds to capitalize on openings between his attacks. Maintain cover during his rocket barrages to avoid taking excessive damage. Focus fire on the legs until they are destroyed, then concentrate on his upper body.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to take out the Deathclaw while you still have some health and ammo left. It’s one of the toughest enemies in the game, so you need a mix of positioning, damage types, and timing.
> 
> First, avoid getting cornered. The Deathclaw will use its roar and stomp to close distance quickly. Stay behind cover like overturned cars or concrete barriers — it can’t reach you if you’re hidden. Use your V.A.T.S. system to target its head or neck for maximum damage. Energy weapons are bad because they bounce off its skin, so stick with laser rifles or plasma guns only if you have high AP; otherwise use ballistic weapons like .308 hunting rifles or miniguns.
> 
> If you’re low on health, retreat and heal before engaging again. You can also lure it into traps or narrow spaces where it can’t move freely. Don't let it grab you — that’s instant death at lower levels. Use grenades to create distance when it charges. And always keep moving; the Deathclaw is slow but relentless.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're looking to spend those initial 21 points wisely before bobbleheads and level-ups fill in the gaps. Since perks depend on your starting values, picking the right foundation matters most for the first ten hours of survival.
> 
> Intelligence is often a quiet powerhouse here—it boosts your XP gain, meaning you level up faster and unlock perks sooner than other builds. Strength paired with Endurance creates a tanky survivor who can absorb hits and wield heavy weapons or melee gear effectively. Agility combined with Perception favors a ranged playstyle, letting you snipe enemies before they reach you and use V.A.T.S. more efficiently. Charisma is viable for settlement management and speech skills but tends to lag behind in early combat scenarios. Remember, every stat can be improved later, so choose what feels most fun or aligned with your preferred playstyle right now rather than optimizing for a build you haven't met yet.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Feral ghouls are irradiated former humans that often lie in wait and climb out of ductwork or windows. They deal radiation damage as well as physical, so standard cover isn't enough if you're near high-radiation zones like the Glowing Sea where they regenerate. The head is the reliable weakness; taking a leg off one stops it from attacking, though removing both arms does not. Since they almost never travel alone but lie among rubble, clear rooms carefully as they may still be climbing in and unable to fight back yet. For performance on your Deck while managing these swarms, consider lowering TDP to 10 watts and GPU clock to 1200 MHz to reduce heat during intense combat:
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": 1200}
> ```

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Power armor stops working primarily due to one of two issues: a depleted fusion core or a broken frame component. If the suit is just dead, check your Fusion Core; if it's empty, replace it (or craft a new one). If you're over-encumbered because the core is drained, you can still walk but lose V.A.T.S. and steady aim until swapped.
> 
> If the suit won't turn on at all or parts are missing, you must visit a Power Armor Station (found in settlements or fixed locations) to repair broken pieces like the chest piece or legs. Note that repairing costs materials based on the current tier of the part; it is often more efficient to delay repairs until you have upgraded your Armorer and Science perks to reduce material costs for higher-tier frames.
> 
> If you are in Survival mode, remember that stimpaks now take 50 seconds to activate and have weight, so healing mid-combat isn't an option without breaking contact first. For performance tuning on the Deck if this is causing lag:
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're describing the classic Legendary Enemy trap in Fallout 4. Those foes start looking like standard enemies, but once they hit roughly half health, they trigger a mutation that fully restores their HP and often grants a new offensive ability. The mistake many players make is dumping all their ammo and stimpaks on the first half of the fight; by the time you realize what's happening, you're out of resources. Since you're on a Steam Deck, managing your loadout to handle this second phase—perhaps carrying extra weapons or relying on perks like Strong Back for weight management—is key. Remember, in Survival mode, stimpaks take much longer to work and have weight, so healing becomes a strategic pause rather than an instant fix.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Switching from *GTA* to *Red Dead Redemption 2* is a culture shock because this game forces you to move at a snail's pace. In *GTA*, you can shoot your way through a town and the cops eventually leave; here, shooting first guarantees a bounty that grows with every witness. Lawmen will track you across regions if you don't pay it off at a post office.
> 
> Your horse is not a vehicle; it is a living partner that takes time to turn and get tired. If you sprint too much, you'll overheat and slow down. Treat the camp as your actual base of operations for healing and supplies, not just a menu pause button.
> 
> Before you head out into the wild, ensure your camp is stocked with food and medicine. Honor missions in towns like Valentine will change how NPCs treat you, so try to avoid unnecessary violence early on to keep the mood friendly.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You can raise Arthur Morgan's Honor by consistently doing good deeds throughout the game. Small actions like greeting strangers politely, helping them when they are in trouble (e.g., giving money to a beggar or aiding someone attacked), paying bounties instead of fleeing, and donating to camp members all contribute to increasing your honor level. Avoid killing civilians, animals you don't need for survival, or committing crimes without cause, as these will lower your honor. Remember, it's about the accumulation of these choices over time; one bad decision won't undo a lifetime of good deeds. High Honor unlocks certain discounts at shops and changes how NPCs react to you.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> You're asking about the very last moments for Arthur Morgan in RDR2. Since I'm operating in Strategy Guide mode, I won't spoil the specific location or the exact sequence of events that leads to his end. However, knowing your current position is crucial for giving you the right advice on how to approach that final chapter without ruining the experience.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Arthur is likely getting tossed because the mount's trust level is too low to handle the current situation. In RDR2, a horse will only stay on if its bond is high enough; otherwise it panics at gunfire, predators, or rough terrain and unseats you.
> 
> To fix this:
> 1.  **Bond up:** Spend time feeding, brushing, patting, and calming your horse before riding out.
> 2.  **Manage Danger:** If a bear or gunfight is nearby, use cover (trees) and keep distance while Dead Eyeing the threat; a panicked horse won't hold you if it feels threatened.
> 3.  **Check Breed:** Draft horses panic less but are slow; Arabians are fast but bolt easily until fully bonded.
> 
> If you need to adjust performance while bonding up (lower heat/noise), here is the config:
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": 900}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In State of Emergency, you extend the clock by grabbing the +15s pickups scattered around the map. Don't just rush to kill every enemy; if you're low on health or ammo, break off from the fight and sprint to a pickup before returning to combat. Prioritize finding these time boosters over finishing crowds, as an extended round is worth more than a quick skirmish.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are looking at two distinct gameplay loops within *State of Emergency*. Here is the breakdown:
> 
> **Kaos Mode**
> This is a score-attack style challenge. You operate in a single, isolated zone against a countdown timer. Your objective isn't just to survive; you must actively extend that time by hitting specific objectives that spawn mid-riot. It focuses on high-intensity action and efficiency within one area at a time.
> 
> **Revolution Mode**
> This is the narrative campaign. You progress through a chain of missions across different zones, guided by the Resistance. This mode unlocks new characters and areas as you complete story beats, offering a more traditional mission-based experience with plot progression.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> That's actually normal behavior in this game, not a bug. The Shadow Temple is built with invisible platforms that only appear when you use the Lens of Truth. If you look around without it, those areas seem to be empty space or have missing floors. Just equip the Lens and check your surroundings; the green potions and fairies inside the temple help keep the lens active long enough to see them.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You asked about beating the fire dragon boss. Since you named it, I'll give direct tactics without spoiling other parts of the game. This assumes standard gameplay on a Steam Deck (gamepad controls apply).
> 
> The core loop is simple: wait for the head to rise, hit it hard, then pull it down when it flies away.
> 1. **Wait for the opening:** The dragon will fly around and drop fireballs. Wait until its massive head breaks the floor surface in the center of the room.
> 2. **Strike the head:** Immediately use the **Megaton Hammer** to smash the exposed head. This stuns it briefly.
> 3. **Pull it down:** Once stunned, it often flies back up or hovers. Use the **Hookshot** to grab its tail or body and pull it back into the lava or onto the platform to keep it grounded.
> 4. **Repeat:** Keep repeating this cycle: wait for head-up -> hammer -> hookshot pull -> repeat until health is depleted.
> 5. **Survival tips:** Wear the **Goron Tunic** to resist fire damage and use a shield (like the Hylian Shield) if you need extra protection against stray flames. Avoid standing on the lava edges.
> 
> If you are using gamepad, ensure your hammer button is mapped to a comfortable face button for quick access during the stun window.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Don't hoard your Long Rests; they are your primary engine for advancing personal quests and companion scenes, not just a health-top-up button. While you can technically survive on Short Rests to save food, doing so too often means missing out on critical dialogue, romance beats, and quest triggers that only unlock after sleeping. Your camp supplies are generally plentiful enough that skipping rests feels like throwing away story content rather than managing resources. If you feel low on spells or abilities, a Long Rest is the right move; if you just want to save food, consider picking up extra rations before resting.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need four slots: one talker, one healer, one trap/lock expert, and enough damage. One character often covers two roles; the party without healing fails.
> 
> Bard and Paladin handle dialogue well; Cleric and Druid handle healing; Rogue and Ranger handle traps. Pick backgrounds that match your playstyle to keep Inspiration high for rerolls after failures. Use elevation and stealth at the Goblin Camp for surprise rounds, then rest briefly before multi-wave defense.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Painting and writing are the classic self-employed earners because they only need one skill and one object, and both scale hard with level. Gardening is slower to start and larger later. Selling collectibles funds the very early game, and a cheap starter lot leaves more for the object that earns.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To recruit more than the default single member, you need to raise your **Respect** level. This cap determines how many gang members you can have (ranging from one up to seven).
> 
> You gain Respect by:
> *   Completing missions.
> *   Killing rival gang members and police officers.
> *   Taking over turf and spraying graffiti tags over enemy territory.
> *   Wearing specific clothing that matches your current location (e.g., wearing green while in Grove Street territory boosts Respect significantly).
> 
> Conversely, wearing the wrong colors at home or killing your own gang members will cause your Respect to fall.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You asked about Margit, so we will discuss him directly without spoiling later bosses. The core loop here is: stay mobile, manage stamina, and bait his heavy attacks before retreating to heal or reposition.
> 
> 1.  **Dodge Timing**: Do not block his initial heavy swings; they break your guard. Wait for the "telegraph" (the wind-up animation) and roll through or to the side. Your goal is to let him overextend, then punish with a quick stab or shield bash if you have high poise.
> 2.  **Stamina Management**: Keep an eye on your stamina bar. If it drops too low, you cannot dodge in time. Use "Ghost Flute" (if available) or just careful movement to reset your meter before engaging again.
> 3.  **Summon Allies**: If you have a Spirit Ash summon nearby, use them to distract Margit while you heal or reposition. This is often the easiest way to survive his opening phase.
> 4.  **Heal Early**: Don't wait until you are at 1 HP. Use Flask of Crimson Tears when your health gets low, then back off immediately.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Dying repeatedly in Tartarus usually means your damage output isn't scaling fast enough against the specific boss you're facing, or you're taking unnecessary hits. Since you're on Steam Deck, make sure you aren't accidentally holding a button that triggers an attack instead of blocking.
> 
> The Shield of Chaos is often the best early-game pick because it turns mistakes into nothing rather than reducing your health. If you keep dying to the same boss, try killing Asterius first in multi-boss rooms; he telegraphs his charge and gets stuck if you sidestep it, while Theseus is more predictable once you learn his spear pattern.
> 
> Also, check your Mirror of Night upgrades. Death Defiance gives free revives mid-run, which can turn a frustrating run into a learning opportunity. Don't worry about optimizing every stat yet; focus on one or two that help you survive the current boss.
