# Knowledge-base answer eval — 2026-09-05 — gemma4-12b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:12b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `13.5` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **96.0%** (95/99) | every must-mention group found in the reply |
| No contradiction | **77.8%** (7/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **66.7%** (6/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **92.4%** (61/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **81.1%** (30/37) | strictest view |

Mean seconds per answer: **7.3**. Mean request payload: **7318.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1571.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 11.0 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 5.9 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.2 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 6.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 6.2 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.7 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.8 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.8 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.5 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.2 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.2 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 6.6 |
| `A-HADES-02` | strategy | 3/3 | 0/3 | — | 3/3 | 1/3 | 5.7 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 1/3 | 3/3 | 5.0 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.5 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 7.8 |
| `A-CP77-03` | strategy | — | — | — | 2/3 | 3/3 | 6.2 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.5 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 7.0 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 9.5 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 10.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 1/3 | 3/3 | 3/3 | 18.9 |
| `A-FO4-05` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 14.5 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 17.5 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 11.7 |
| `A-RDR2-03` | strategy | — | — | — | 3/3 | 3/3 | 15.1 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 18.5 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.2 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.9 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.9 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.2 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.6 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 6.1 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.3 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.8 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 6.4 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 3.8 |

## Failures worth reading

- **A-DRG-01** sample 2: missing facts: `kite`, `weak point`; branch menu missing
- **A-HADES-02** sample 1: missing facts: `asterius`, `charge`, `first`; branch menu missing
- **A-HADES-02** sample 2: missing facts: `first`
- **A-HADES-02** sample 3: missing facts: `asterius`, `charge`, `first`; branch menu missing
- **A-HADES-03** sample 1: spoiler fence missing, one was due
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-CP77-02** sample 3: branch menu missing
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-FO4-02** sample 1: branch menu missing
- **A-FO4-04** sample 2: said: `training perk`
- **A-FO4-04** sample 3: said: `training perk`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm starting you off in Strategy Guide mode. I'll keep things spoiler-minimized, focusing on gameplay mechanics and tactics rather than narrative twists.
> 
> To take down the Glyphid Dreadnought, you need to focus on its armor plates and manage your positioning carefully. Here is the breakdown:
> 
> *   **Kiting:** Move around the boss to stay out of its immediate reach while maintaining a position where you can still land hits.
> *   **Armor Plates:** Focus your fire on the weak-point armor plates as they open up.
> *   **Resource Management:** Save your overclock and nuke abilities for the windows of opportunity when the armor breaks.
> 
> ```bonsai-cite
> Kite between waves; focus weak-point armor plates as they open. Save overclock/nuke for armor break windows.
> ```
> ```bonsai-cite fallback_no_source```
> 
> Which part of the fight are you struggling with the most?

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Strategy Guide mode is active. I'll keep things spoiler-minimized, though standard boss tactics like these are generally considered routine gameplay.
> 
> The Dreadnought Twins have a specific mechanic where they will start healing each other if their health bars get too far apart. To counter this, you need to focus on keeping their health levels relatively balanced.
> 
> Here is the breakdown for handling them:
> 
> *   **Split Fire:** Don't dump all your damage into one Twin while the other sits idle. Try to distribute your damage evenly across both.
> *   **Avoid the Gap:** If you notice one is significantly lower than the other, shift your focus back to the healthier one to close that gap.
> *   **The Healing Trigger:** The healing usually kicks in when they are "out of sync." If you keep them both at similar health percentages, the healing behavior won't trigger.
> 
> ```bonsai-cite
> Neither is as tough as a full Dreadnought on its own. Let their health bars drift apart and both turn immune while they heal the gap closed. Split fire evenly rather than burning one down, and the healing never starts.
> ```
> ```bonsai-cite fallback_no_source```
> 
> Are you struggling more with the Lacerator's movement or the Arbalest's fireballs?

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'll keep this spoiler-minimized as requested.
> 
> Nitra is the primary resource used to power up your arsenal rather than your dwarf's base stats.
> 
> ```bonsai-cite
> Summary: The resource that pays for weapons rather than for your dwarf.
> Uses: Buys weapon upgrade cards at the between-stage shop and rerolls the artifact choice from the Supply Pod.
> Tips: No nitra means an underleveled weapon however much gold you mined, so keep mining it for whichever weapon carries the run.
> ```
> ```bonsai-cite fallback_no_source```
> 
> In short:
> *   **Weapon Upgrades:** Spend it at the shop between stages to improve your primary tools.
> *   **Rerolls:** Use it to cycle through artifact choices in the Supply Pod.
> *   **Priority:** While gold is important, a lack of Nitra means your weapons will fall behind the power curve. Focus on mining it for your "carry" weapon.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm starting your strategy coaching now. I'll keep spoilers to a minimum, focusing on gameplay tactics rather than narrative beats.
> 
> The Tank is a high-priority target that changes the flow of the game. Because he is a single large target, the goal is to keep him occupied while your team moves forward. Here are the core tactics:
> 
> *   **Fight in the Open:** Try to engage him in areas with plenty of space. Anything he punches becomes a projectile with more reach than his fists. If you take a punch near a ledge or a drop, it will likely kill you instantly.
> *   **Manage the Horde:** While the Tank is active, the game usually stops sending common infected outside of finales. This means it's four guns against one target. However, if you slip past him to reach your objective, the horde will immediately swarm you.
> *   **Use the Environment:** If you find a route where he has to crouch through a vent or narrow space, he becomes much less mobile and harder to hit.
> *   **Body Blocking:** If a teammate is being pinned or overwhelmed, you can put your body between them and the Tank. The bullets hitting you are bullets not hitting your friends.
> 
> How would you like to proceed with your strategy?

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm keeping the spoilers to a minimum, but since the Witch is a standard gameplay encounter, I'll give you the direct tactics for her.
> 
> In Left 4 Dead 2, the Witch is designed to be a "passive" threat until you break her rules. She will usually ignore your gunfire if you aren't aiming directly at her, and she won't attack other infected. However, she has two specific triggers that will make her stand up and charge:
> 
> 1. **Proximity:** If you get too close to her, she will wake up.
> 2. **Light:** If you shine a flashlight on her, she will wake up.
> 
> The low growl you hear is her warning. If you hear it, back away immediately. If you keep moving toward her or keep the light on her, she will stand up, flail her arms, and charge at you. Once she is charging, she will incapacitate whoever she targets in one hit.
> 
> **Pro-tip:** If you do accidentally wake her up, firing at her will slow her down, but it won't kill her quickly. It's better to let her "calm down" by backing off, or use a weapon to finish her off once she's already started her charge.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep these tactics spoiler-minimized, though standard enemy behaviors are considered routine gameplay.
> 
> To be effective as the Hunter, you need to master the balance between aggression and positioning. Here are the core tactics:
> 
> *   **Maximize Pounce Distance:** Your pounce damage scales with the distance you cover. To deal maximum damage (up to 25), prioritize high-ground advantages and long run-ups. Don't just jump on the nearest target; try to find a way to build momentum.
> *   **Target Selection:** Always prioritize the straggler. Attacking a group is high-risk; if you are forced to engage a group, try to mimic the movement of a common infected. The melee claw's read is often mistaken for horde damage until a survivor gets close enough to check.
> *   **Maintain Pressure:** The pounce ability recharges quickly. You can keep constant pressure on a survivor by holding crouch and re-pouncing as soon as the ability is available.
> *   **Use the Environment:** Use corners and doorways to break line of sight. A Hunter who is seen constantly is a Hunter who gets shot. Use your speed to reposition, then strike from an unexpected angle.
> 
> ```bonsai-cite
> Pounce damage scales with distance — up to 25 on a long one — so height and a run-up matter more than surprise alone. Take the straggler, never the group, and if you have to be near the group, move like a common: the melee claw reads as horde damage until someone checks. In Left 4 Dead 2 the pounce recharges fast, so holding crouch and re-pouncing keeps pressure on. (wiki_no_patch)
> ```

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm keeping things spoiler-free as we go, focusing only on the mechanics you asked about.
> 
> In Portal 2, the "Gels" are different types of surface coatings that change how you move. Here is the breakdown of how they behave:
> 
> *   **Repulsion Gel (Blue):** This makes you bounce. The key trick here is that the higher you fall before hitting the gel, the higher you will bounce. It's much more effective for gaining height if you drop onto it from above rather than just jumping onto it.
> *   **Propulsion Gel (Orange):** This removes friction. If you start running on it, you will keep your momentum indefinitely. You can use this to slide across large gaps or reach high speeds, but be careful—it's very hard to stop once you get going.
> *   **Conversion Gel (White):** This allows you to place portals on surfaces that normally don't support them (like certain walls). However, it won't stick to cubes or turrets, and it will be washed away if it touches the cleansing spray.
> 
> Which of these are you currently trying to figure out in your current chamber?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Coaching is spoiler-minimized by default.
> 
> If the Excursion Funnel is carrying you in the wrong direction, look for a button nearby that reverses its flow. It is designed to ferry you, gel, and cubes across the chamber, and it will pass through portals to reach the other side. Don't assume the route is shut just because it's moving the wrong way; find that toggle.
> 
> ```bonsai-cite [Portal 2 / mechanic: Excursion Funnel] (wiki_no_patch)```

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm keeping things spoiler-minimized, but since you're asking about Antlions specifically, I'll give you the direct tactics for them.
> 
> The reason they keep appearing is that Antlions are blind and hunt primarily by sensing vibrations. In the coastal areas you're currently in, the sand is "loud" to them, while the rocks are "quiet." If you step onto the sand, they will detect your movement and swarm you.
> 
> To get past them safely:
> 1. **Stay on the rocks:** Move from rock to rock. Avoid the sand entirely whenever possible.
> 2. **Use the Pheropod:** Once you obtain the Pheropod from the Antlion Guard, you can turn the tables. Throwing it will make the Antlions view you as a "guard" and cause them to swarm whatever you mark with it.
> 
> Where exactly are you in the game right now?

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep the coaching spoiler-minimized, though since you asked about the bugbait specifically, I will provide direct tactics for it.
> 
> To use the bugbait (the Pheropod) effectively, you need to have obtained it from the Antlion Guard. Once you have it, the Antlions will recognize you as one of their own. 
> 
> The mechanic works as follows:
> 1. **Mark the Target:** Aim at the specific target or area you want the Antlions to attack and "mark" it using the Pheropod.
> 2. **Lure the Swarm:** Throw the Pheropod toward the target.
> 3. **The Result:** The Antlions will read your pheromones as a guard signal and swarm whatever you marked.
> 
> ```bonsai-cite wiki_no_patch```

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'll keep the spoilers to a minimum, though since you asked about the Gravity Gun specifically, I can give you direct tactics for it.
> 
> The Gravity Gun is versatile, but it has specific limitations on what it can interact with:
> 
> *   **Interactable Objects:** You can pick up and throw explosive barrels, sawblades, and radiators. A held radiator is particularly useful as a mobile shield you can walk behind.
> *   **Enemies:** It will not lift most enemies. However, you can still pick up and throw manhacks and scanners.
> *   **Projectiles:** You can catch and throw grenades, but be careful—they can be thrown back at you if you aren't watching your timing.
> *   **Environment:** In areas like Ravenholm, loose blades can serve as "ammunition" for the gun.
> 
> ```bonsai-cite Gravity Gun mechanics (wiki_no_patch)```

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm in Strategy Guide mode, which means I'll keep spoilers to a minimum. I'll use spoiler tags for any major story beats or secrets if they become necessary.
> 
> Since you're just starting out, the best approach is to pick a weapon that is forgiving of mistakes. 
> 
> The **Stygian Blade** is widely considered the best starting point because it is the most straightforward of the six weapons and doesn't require complex positioning. If you prefer a more defensive playstyle, the **Shield of Chaos** is also very easy because holding the block button can turn a mistake into nothing.
> 
> If you want to stay at a distance, the **Eternal Spear** is a safe choice because its reach keeps you away from enemies. I'd recommend saving the **Twin Fists of Malphon** for later; while they are very fast, they require you to stand right next to everything, which can be punishing when you're still learning the enemy patterns.
> 
> ```bonsai-cite The Stygian Blade is the most forgiving of the six and asks the least of you. The Shield of Chaos is the next easiest, because holding block turns a mistake into nothing. Of the rest, the Eternal Spear is the safest, since its reach keeps you out of trouble. (fallback_no_source)```
> 
> ```bonsai-cite The Twin Fists of Malphon are the fastest weapon and the shortest reach, so it asks you to stand inside everything. (fallback_no_source)```
> 
> Which of these styles sounds like the best fit for your first run?

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ❌

> No response text.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> I'm starting our coaching session now. To keep things spoiler-free, I'll avoid revealing major plot twists or specific late-game secrets unless you ask for them.
> 
> In *Hades*, beating the final boss is a major milestone, but it isn't the "true" ending of the game. The narrative is designed to be cyclical; you'll continue to make runs to see the story progress further. You'll need to complete several more successful runs to see the full conclusion of the current arc.
> 
> Additionally, once you've reached this point, you'll eventually unlock the "Pact of Punishment," which introduces "Heat"—an optional difficulty system that provides unique rewards for taking on harder challenges.
> 
> Since you've reached the end of the first major arc, how would you like to proceed?

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused cyberware system that prioritizes aggression and survivability over time manipulation. Here is how it functions:
> 
> *   **Damage Mitigation:** While active, it reduces the amount of damage you take.
> *   **Health Floor:** It prevents your health from falling below 25%.
> *   **Health Recovery:** Every enemy you defeat while Berserk is active returns 25% of your maximum health.
> *   **Weapon Synergy:** Its specific effects on your melee weapons depend entirely on which models you have installed.
> 
> Unlike the Sandevistan, which slows down time, Berserk is designed for players who want to stay in the thick of the fight, trading high-intensity combat for constant health regeneration.
> 
> ```bonsai-cite Berserk mechanic details (wiki_no_patch)```

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm keeping things spoiler-free for now since we're just looking at your build.
> 
> Since this is your first time, the most important thing to know is that spreading your points evenly is usually a mistake. The best perks are locked behind specific attribute thresholds, so you want to focus on a few core stats rather than being "okay" at everything.
> 
> Here is the breakdown for a first playthrough:
> 
> *   **Body and Reflexes:** These are the most straightforward for a "fighter" style. Body gives you health and power; Reflexes give you mobility and speed. They are very forgiving if you make mistakes in combat.
> *   **Technical Ability:** This is a "must-have" for almost any build. It improves your crafting and, more importantly, allows you to equip better cyberware (the internal tech that makes you powerful).
> *   **Intelligence:** This is the "Netrunner" route. If you want to hack enemies and take them out before they can even see you, put points here. Just be aware that you will be much more fragile in a direct shootout.
> *   **Cool:** This is for the "ghost" playstyle. It rewards patience, stealth, and precision.
> 
> **My recommendation:** Pick two main attributes to focus on based on how you want to play (e.g., a heavy hitter vs. a stealthy hacker), and keep Technical Ability as a secondary priority.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> I'm currently in Strategy Guide mode, which means I'll keep things spoiler-minimized to ensure you get the full experience. Since you're asking about the main story's conclusion, I'll keep the details vague until you're ready to see them.
> 
> In *Cyberpunk 2077*, the ending is not a single fixed path. Instead, it is a series of branching choices based on your relationships with key characters, the specific side jobs you complete, and the final decisions you make during the climax of the game. Your choices will determine:
> 
> 1. **Your Fate:** Whether you survive the events of the main quest or meet a different end.
> 2. **Your Legacy:** How the city and your closest allies remember you.
> 3. **The Aftermath:** The state of the world and your personal life following the final confrontation.
> 
> Because there are multiple ways to "win" or "lose," it's usually best to play through the story and see how your specific choices shape the narrative.
> 
> ```bonsai-spoiler
> The game features several distinct endings. Some involve you taking control of your own destiny, while others involve sacrificing your autonomy for a specific cause. The "best" ending is subjective and depends entirely on whether you value your personal freedom, your connections to others, or the success of a specific faction.
> ```

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep the following advice spoiler-minimized, though since you asked about Adam Smasher specifically, I will provide direct tactics for that encounter.
> 
> To defeat Adam Smasher, focus on high DPS builds and mobility. Here are the core strategies:
> 
> *   **Build Synergy:** Use a Sandevistan to slow down time, allowing you to land more hits and reposition quickly.
> *   **Targeting:** Prioritize destroying his legs first to limit his movement.
> *   **Defense:** Stay behind cover during his rocket barrages to avoid heavy area-of-effect damage.
> *   **Weapon Choice:** Utilizing Iconic weapons is highly effective here. These unique weapons often have special effects and can be upgraded to scale with your level, making them more reliable than standard high-damage drops. ```bonsai-cite [Cyberpunk 2077 / boss: Adam Smasher] (fallback_no_source)``` ```bonsai-cite [Cyberpunk 2077 / item: Iconic weapons] (fallback_no_source)```

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm keeping things spoiler-minimized for the rest of your journey, but since you asked about the Deathclaw specifically, I'll give you the direct tactics for that fight.
> 
> Deathclaws are incredibly tough early on because they have high health and are resistant to almost everything. Energy weapons are your worst choice here—lasers can actually reflect off their hide. To take one down before you're fully geared up, follow these steps:
> 
> 1. **Keep Your Distance**: They can throw cars and headbutt you to stagger you. Stay as far away as possible.
> 2. **Use Cover**: Don't stand in the open. Move from one piece of cover to another to break their line of sight.
> 3. **Focus on Physical/Explosive Damage**: Since they resist energy, stick to high-caliber bullets or explosives.
> 4. **Watch the Health**: Once they get low on health, they become extremely dangerous and can kill you in one grab or decapitation. If they get close, prioritize getting away over trying to land one last hit.
> 
> ```bonsai-cite Deathclaws have very high health and are resistant to nearly everything, energy weapons worst of all — lasers can reflect straight off the hide. They open with a roar and a ground stomp, headbutts to stagger, and throw cars at you once you are out of reach. Below a certain health they can kill you outright with a grab or a decapitation, and at low level that threshold is higher than it sounds, so distance and cover matter more than raw damage. (wiki_no_patch)```
> 
> Are you currently facing one in the wild, or are you planning your build to handle them?

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> Strategy Guide Mode is active. I will keep spoilers to a minimum to ensure your experience remains fresh.
> 
> In Fallout 4, your starting SPECIAL stats are the foundation for your character's capabilities. You start with 1 point in every attribute and have 21 points to distribute. While you can increase these stats later using "bobbleheads" (collectibles) and level-up points, your starting choices determine which perks you can access early on.
> 
> Here is a breakdown of how to think about the stats:
> 
> *   **Intelligence:** Often considered a "strong" pick because it increases how quickly you gain experience. Higher Intelligence means you level up faster, allowing you to reach powerful perks sooner.
> *   **Strength & Endurance:** This is the classic "tank" route. Strength helps with carrying weight and melee damage, while Endurance provides more health and allows you to survive mistakes.
> *   **Agility & Perception:** This is the "precision" route. Agility is key for stealth and small-weapon handling, while Perception is vital for using the V.A.T.S. system and sniping.
> *   **Charisma:** This is the "diplomat" route. It makes it easier to talk your way out of fights and helps with settlement management, though it is generally considered the weakest stat for early-game combat.
> 
> Since you can always find ways to boost your stats later, the best approach is to pick what feels right for the playstyle you want to try first.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Coaching is spoiler-minimized by default. Since you asked about Feral ghouls specifically, I will provide direct tactics for them without spoilers.
> 
> Feral ghouls are fast and rarely travel alone, making them a significant threat in close quarters. Here is how to handle them effectively:
> 
> *   **Target the Head:** The head is their most reliable weakness. Focus your fire there to take them down quickly.
> *   **Limb Targeting:** If you take off one of their legs, the ghoul will stop attacking you entirely. However, taking off both arms does not stop their aggression.
> *   **Watch the Environment:** They often hide in rubble and can climb out of ductwork or windows. A room that appears clear might still have one lurking; be wary of those still climbing in, as they cannot fight back until they reach the floor.
> *   **Radiation Hazards:** They deal radiation damage alongside physical damage. In high-radiation areas like the Glowing Sea, they can actually regenerate health as you shoot them.
> 
> Keep your distance where possible to avoid being overwhelmed by their numbers.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> I'll keep this spoiler-minimized as we focus on your mechanical issue.
> 
> If your power armor has "stopped working," it is likely due to one of three common issues in Fallout 4:
> 
> **1. Depleted Fusion Core**
> Your armor runs on a fusion core that drains over time and much faster when you perform actions that spend Action Points (AP), such as sprinting or using V.A.T.S. 
> *   **The Symptom:** You can still walk, but you become over-encumbered, lose the ability to use V.A.T.S., and lose steady aim.
> *   **The Fix:** You need to find or craft a new fusion core.
> 
> **2. Damage and Repairs**
> If the armor is physically damaged, it may be malfunctioning or providing less protection.
> *   **The Fix:** You must take the armor to a Power Armor Station. You can build one at any settlement.
> 
> **3. Upgrade Costs and Requirements**
> If you are trying to upgrade a piece of armor and it won't progress, check your ranks.
> *   **The Tip:** Upgrading a piece of power armor costs the same materials regardless of which tier you are coming from. It is generally more efficient to wait until you have ranked up your Armorer and Science skills before performing the upgrade to avoid paying for the same materials twice, especially for rare late-game models. ```bonsai-cite [Fallout 4 / mechanic: Upgrading power armor] (wiki_no_patch)```

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm in Strategy Guide mode, so I'll keep spoilers to a minimum. Since you're playing Fallout 4, I can explain that specific mechanic.
> 
> That behavior is a core trait of "Legendary" enemies (the ones with the star icon next to their name). They have a unique mutation: once they reach roughly half of their health, they will automatically heal back to 100% and gain a new ability or increased aggression.
> 
> The biggest mistake players make is spending all their ammo or resources on the first half of the fight. Because they reset, you essentially have to fight the same encounter twice. It's best to save your high-damage weapons or heavy explosives for when they trigger that heal.
> 
> ```bonsai-cite Legendary enemies have a mutation where they heal completely at half health and gain a new ability, making the fight roughly twice as long as it looks. Spending everything on the first half is a mistake. (fallback_no_source)```
> 
> How would you like to proceed with this fight?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm starting you off with some spoiler-minimized coaching. Since you're coming from Grand Theft Auto, the biggest shift you'll notice is the "weight" of the world. This game is intentionally slower and more deliberate.
> 
> Here are a few key things to keep in mind:
> 
> *   **Momentum:** Arthur moves with weight. Horses take time to turn and accelerate, and picking up items involves animations rather than instant actions. Don't try to "twitch" your way through every situation; let the animations play out.
> *   **The Law:** In GTA, you can often outrun the cops or just hide for a bit. In RDR2, the law is persistent. If you commit a crime, a witness might turn into a bounty that follows you across the map. You'll need to pay these off at post offices or wear a mask to keep them manageable.
> *   **Survival & Camp:** Think of your camp as a home base rather than just a menu. You need to manage supplies and upkeep.
> *   **Combat:** Shooting your way through a town works for a moment, but the law will eventually arrive and stay. Cover is your best friend, and riding is often safer than sprinting.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep this spoiler-minimized as requested.
> 
> To raise your honor in Red Dead Redemption 2, you need to focus on "good" deeds, as the system functions on a slider based on your frequent actions rather than a single switch.
> 
> ```bonsai-cite``` (fallback_no_source)
> **Actions that increase Honor:**
> *   **Social Interactions:** Greeting people politely and engaging in friendly conversation.
> *   **Altruism:** Helping strangers on the road or performing acts of kindness.
> *   **Law Abiding:** Turning in bounties instead of running from them.
> *   **Generosity:** Donating items or money to your camp.
> 
> **Actions that decrease Honor:**
> *   **Crime:** Robbing people or engaging in unnecessary violence.
> *   **Cruelty:** Killing civilians or animals that you do not specifically need for gameplay purposes.
> 
> Because it is a slider, one bad day won't ruin your standing, but consistent positive behavior will eventually move your honor toward the higher end. High honor provides benefits such as shop discounts and different reactions from NPCs.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> I'm currently in Strategy Guide mode, which means I'll keep things spoiler-minimized by default. Since you're asking about the ending, I'll provide a general overview of how the game handles the conclusion without giving away the specific narrative beats.
> 
> In *Red Dead Redemption 2*, the story is designed to be dynamic. While there is a definitive "main" path for Arthur's journey, your choices regarding your Honor level and your interactions with the gang members will significantly influence the tone of the final chapters. The game focuses heavily on Arthur's personal growth and his legacy within theVan der Linde gang.
> 
> Because the ending is a major narrative milestone, I can give you more specific details on how your actions affect the outcome if you let me know how far you've progressed.
> 
> ```bonsai-spoiler
> Arthur's ultimate fate is tied to his health and the choices you make regarding his morality. Depending on your Honor, the final moments can be framed as a tragic sacrifice or a redemptive act of heroism.
> ```

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep my advice spoiler-minimized as requested.
> 
> There are three main reasons your horse is throwing you off, and they usually involve your bond level or the specific breed you're riding.
> 
> **1. Low Bond Level**
> Bonding is the most important factor for horse behavior. A horse with a low bond is more likely to panic and throw you when spooked by predators, gunfire, or sudden movements. To fix this, you need to perform "bonding" actions:
> *   **Ride it:** Regular travel builds bond.
> *   **Care for it:** Brush, feed, and pat your horse.
> *   **Calm it:** If it gets spooked, stay on and try to calm it down.
> ```bonsai-cite Bond level is what makes a horse feel different... A high-bond horse also stops throwing you when something scares it. (fallback_no_source)```
> 
> **2. Breed Traits**
> Not all horses are created equal. Some breeds are naturally "skittish."
> *   **Arabians:** These are fast but bolt very easily until your bond is high enough to override their instinct.
> *   **Draft Horses:** These are slower but much more stable and less likely to panic.
> *   **Racing Breeds:** These are quick but can be fragile and prone to spooking.
> ```bonsai-cite Breeds differ in speed, in stamina, and in how easily they spook at gunfire or predators. (fallback_no_source)```
> 
> **3. Handling and Weight**
> If you are carrying a massive amount of loot in your satchel or have a heavy load, it can affect your horse's stamina and stability. If you find yourself constantly running out of room, consider upgrading your satchel at camp to manage your weight more efficiently.
> ```bonsai-cite Upgrading early is worth more than it sounds, because running out of room is what stops most people restocking before they ride out. (fallback_no_source)```
> 
> **Quick Tip:** If you are currently being chased or are in …

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm starting your strategy coaching now. I'll keep things spoiler-free, focusing on mechanics and tactics to help you succeed.
> 
> In *State of Emergency*, managing the clock is just as important as clearing the crowd. Here is how you can keep the round going:
> 
> *   **Time Pickups:** Look for small items scattered throughout the level. These typically grant you a +15 second boost.
> *   **Prioritize Time over Kills:** It is often better to break off from a large fight to grab a time pickup than to stay and fight until your timer hits zero. A round you extend is worth more than a crowd you finish but lose on time.
> *   **Kaos Mode vs. Revolution Mode:** Keep in mind that the mechanics differ slightly depending on your mode. In **Kaos mode**, you extend your time by hitting specific objectives that pop up mid-riot. In **Revolution mode**, the focus is more on completing the mission objectives handed out by the resistance.
> 
> Which mode are you currently playing?

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep this advice spoiler-minimized.
> 
> In *State of Emergency*, the two modes serve completely different gameplay purposes:
> 
> **Kaos Mode**
> This is a high-intensity "score attack" mode. You are pitted against a ticking clock in a single zone. Instead of just surviving, you must complete specific objectives that pop up during the riot to extend your time. The goal is to achieve the highest score possible within the time limit.
> 
> **Revolution Mode**
> This is the primary story and progression mode. It consists of a series of missions within different zones. In this mode, you receive specific objectives from the resistance, and completing these missions is how you unlock new characters, zones, and content.
> 
> ```bonsai-cite Revolution mode is where characters and zones unlock, while Kaos is a score attack against a clock. (fallback_no_source)```

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm starting you in Strategy Guide mode. I'll keep things spoiler-minimized, though since you've already asked about the Shadow Temple floors, I'll give you the direct tactics for that area.
> 
> The Shadow Temple is designed to be disorienting. Almost every area that looks like it has a hole in the floor actually has a solid surface there.
> 
> To navigate this, you need the Lens of Truth. When you hold it up, it will reveal the invisible floors, walls, and even hidden chests. Because it drains your magic, it's best to use it in short bursts to find your path rather than keeping it active constantly. You can replenish your magic by finding green potions or fairies within the temple.
> 
> How would you like to proceed with your exploration?

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you've asked about Volvagia, I'll skip the usual spoiler warnings for this specific fight. 
> 
> To defeat the fire dragon, you need to manage its movement and stay protected from the heat. Here is the breakdown:
> 
> *   **Defense:** Wear the Goron Tunic and carry a shield. This will protect you from the fire breath and the heat of the lava.
> *   **The Attack:** Use the Megaton Hammer. Wait for the dragon's head to pop out of the floor, then hit it immediately. While it is stunned, use your sword to slash it.
> *   **The Pull:** When the dragon flies around the room, use the Hookshot to pull it back down to the floor so you can land another hammer blow.
> *   **Movement:** Stay away from the lava at the edges of the arena.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I'm keeping things spoiler-minimized for now. Since you're playing on a Steam Deck, I'll keep the advice focused on your resources and progression.
> 
> In Baldur's Gate 3, you should generally rest more than you think you need to. While it costs camp supplies, those supplies are usually easy to come by—even the food you pick up along the way counts. 
> 
> Here is why you shouldn't hoard your rests:
> - **Resource Recovery:** It restores your health, most abilities, and all your spell slots.
> - **Story Progression:** This is the most important reason. Long rests are what trigger companion scenes and advance personal quests. If you skip them, you might miss out on significant character development and story beats.
> - **Supplies:** Don't worry about running out of food; the game provides plenty to keep your camp running.
> 
> Basically, if your party is tired or your spells are spent, take the rest. It's better to have a refreshed party and a moving story than to struggle through a fight with drained resources.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep my advice spoiler-minimized, focusing only on mechanics and roles as requested.
> 
> For a first run, you want a balanced party that covers four core pillars: communication, healing, utility (traps/locks), and damage. Since many classes overlap, you can often combine these roles.
> 
> A solid "starter" framework includes:
> 
> *   **The Face (Dialogue/Charisma):** You need someone to lead conversations. Bards and Paladins are excellent choices here because they can handle social interactions while also providing combat utility.
> *   **The Healer (Support):** Ensure at least one character can provide healing or buffs. Clerics and Druids are the standard for this.
> *   **The Skill Monkey (Utility):** You need someone to handle locks and traps. Rogues and Rangers are the primary choices for these mechanics.
> *   **The Damage Dealer (DPS):** This can be anyone with high offensive output, but usually a mix of melee and ranged options is safest.
> 
> **Recommended Archetypes:**
> 1.  **A Bard or Paladin** (Face + Support/Damage)
> 2.  **A Cleric or Druid** (Healing + Support)
> 3.  **A Rogue or Ranger** (Traps/Locks + Damage)
> 4.  **A versatile "Wildcard"** (A Fighter or Wizard to fill whatever gap you feel is missing)
> 
> ```bonsai-cite (Baldur's Gate 3 / mechanic: Party composition) [fallback_no_source]```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> I will keep this advice spoiler-minimized, though wealth mechanics are generally considered low-risk for narrative spoilers.
> 
> To make money quickly in the early game of The Sims 4, focus on self-employed careers that scale well with skill progression.
> 
> *   **Painting and Writing:** These are the most reliable early-game methods. They only require one skill and one object (an easel or a computer). As your skill level increases, the value of the items you produce scales significantly. ```bonsai-cite Painting and writing are the classic self-employed earners because they only need one skill and one object, and both scale hard with level. (fallback_no_source)```
> *   **Gardening:** This is a slower start but becomes highly lucrative as you expand your lot. It requires more initial setup but provides a steady stream of high-value items to sell.
> *   **Selling Collectibles:** For the very first few days, selling found collectibles is a viable way to fund the purchase of your first "earning" objects.
> *   **Low Overhead:** Start on a cheap lot to ensure more of your initial funds go toward the objects that generate income rather than high rent or mortgage costs. ```bonsai-cite A cheap starter lot leaves more for the object that earns. (fallback_no_source)```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Spoilers are minimized by default. To increase the number of gang members you can recruit (up to a maximum of seven), you need to increase your **Respect** level.
> 
> According to the local knowledge base, you can gain Respect through the following actions:
> *   **Missions:** Complete assigned gang objectives.
> *   **Combat:** Kill rival gang members and police officers.
> *   **Territory:** Take over territory from rivals and spray over their tags.
> *   **Appearance:** Your character's look matters. You can gain Respect by getting muscle, tattoos, and specific hairstyles. 
> *   **Clothing:** Wearing green is particularly effective for gaining Respect in Grove Street territory.
> 
> ```bonsai-cite``` (wiki_no_patch)
> 
> Be careful not to lose Respect by wearing the wrong colors at your home base, killing your own gang members, or losing turf you already control.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you've already named the boss, I'll give you the direct tactics you need to take him down. I'll keep other story elements and secrets hidden for now.
> 
> Margit is designed to punish aggressive players who don't manage their stamina. Here is the breakdown for your Steam Deck playstyle:
> 
> **Core Tactics:**
> *   **Stamina Management:** Do not spam your attacks. Only swing when you have enough stamina to follow up with a dodge. If your stamina bar is empty, you cannot dodge his heavy strikes.
> *   **Spacing:** Stay at a medium distance. If you get too close, he uses wide sweeps; if you stay too far, he will use his long-reaching thrusts.
> *   **The "Poise" Factor:** He has high poise. If you have a heavy weapon or a "Stance Break" skill, try to land two hits in a row to stagger him.
> *   **Roll, Don't Block:** On the Steam Deck, rolling is often more reliable than blocking against his heavy overhead slams, which can break your guard easily.
> 
> **Quick Tips:**
> *   **Summoning:** If you have a Spirit Ash (like the Lone Wolves or the Mimic), use it to draw his attention away from you.
> *   **Buffs:** Use any "Strength" or "Dexterity" buffs you've found to increase your damage output.
> 
> How would you like to proceed with your strategy?

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> I'm here to help you get past those tougher floors. Since you're struggling in Tartarus, we can look at your specific build, your combat tactics, or some general survival tips for the harder enemies there.
> 
> I'll keep things spoiler-light for now to make sure we don't ruin any surprises.
> 
> To get started, are you looking for help with a specific boss fight, or are you just getting overwhelmed by the general difficulty of the enemies on these floors?
