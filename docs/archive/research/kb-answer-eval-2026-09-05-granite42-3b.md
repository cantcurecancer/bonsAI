# Knowledge-base answer eval — 2026-09-05 — granite42-3b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `granite4.2:3b` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `5.9` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **96.0%** (95/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **22.2%** (2/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **98.5%** (65/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **81.1%** (30/37) | strictest view |

Mean seconds per answer: **3.2**. Mean request payload: **7311.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1551.7**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 7.2 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.0 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.6 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.9 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.1 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.8 |
| `A-HADES-02` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 3.5 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 1/3 | 3/3 | 3.5 |
| `A-CP77-01` | expert | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3.2 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.1 |
| `A-CP77-03` | strategy | — | — | — | 1/3 | 3/3 | 2.9 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.0 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 3.6 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.2 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 3.2 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.6 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-RDR2-03` | strategy | — | — | — | 0/3 | 3/3 | 3.2 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.6 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.6 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.8 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.2 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 4.6 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 3.4 |

## Failures worth reading

- **A-HADES-02** sample 1: missing facts: `first`
- **A-HADES-03** sample 1: spoiler fence missing, one was due
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-01** sample 2: missing facts: `damage taken`
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-FO4-02** sample 1: branch menu missing
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due
- **A-RDR2-03** sample 3: spoiler fence missing, one was due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat the Glyphid Dreadnought in Deep Rock Galactic: Survivor, you need to manage your positioning and resource usage carefully. Here are some key steps:
> 
> 1. **Kite Between Waves**: Keep moving between waves of smaller enemies to avoid being overwhelmed by their attacks. This also helps you maintain a safe distance from the Dreadnought's powerful melee strikes.
> 2. **Focus Weak-Point Armor Plates**: As the battle progresses, the Dreadnought will expose weak points on its armor plates. Target these areas with your most damaging weapons or abilities to deal significant damage.
> 3. **Save Overclock/Nuke for Armor Break Windows**: Use your overclock ability or nuke only when the Dreadnought's armor is broken and it is vulnerable. This maximizes the impact of your attacks.
> 
> Remember, patience and strategic use of your resources will be crucial in overcoming this formidable foe. Good luck!

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The problem isn't your aim; it's how you're managing their health bars. The Twins (Lacerator and Arbalest) have a specific mechanic where they will stop taking damage and heal if you focus fire on just one of them while the other is still alive. They heal to close the gap between their bars. To prevent this, you must split your fire evenly between both Dreadnoughts simultaneously. Don't let one die before the other; keep their health draining in parallel so they never trigger that healing phase. Use your overclock or nuke only when an armor plate opens on one of them to break it down quickly, but maintain pressure on the second one at all times.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *Deep Rock Galactic: Survivor*, **Nitra** is the currency used to purchase weapon upgrade cards at the between-stage shop and to reroll your artifact choice from the Supply Pod. Unlike standard gold, which funds dwarf upgrades, Nitra specifically powers your loadout evolution—keep mining it for whichever weapon carries the run, since no Nitra means an underleveled weapon regardless of how much gold you gathered.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To take down the Tank in Left 4 Dead 2, you need a coordinated team effort because he is incredibly strong. Here are the core steps:
> 
> 1.  **Keep him open:** Do not let him crouch into vents or tight spaces; he becomes much harder to hit there.
> 2.  **Use rocks and cover:** Use rocks to block his line of sight if you need to reposition, but try to keep him in the open where his punches have less range.
> 3.  **Focus fire:** All four survivors should aim at him. If he is near a drop-off or ledge, use that to your advantage.
> 4.  **Protect teammates:** If a teammate gets pinned, stand between them and the Tank to take damage yourself rather than letting him hit your friends.
> 5.  **Watch for vomit:** If you see a Boomer nearby, deal with it first before the Tank arrives, as his vomit can summon more infected.
> 
> Remember, patience is key; do not rush in blindly without a plan. Stay calm and use the environment to your advantage.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch ignores bullets unless you aim directly at her, but she snaps if a survivor stands too close or if you shine a flashlight on her. If you kept advancing while she was growling, that’s exactly what triggered her charge; once startled, she targets whoever burned her, not necessarily the one who woke her. Fire can slow her down and kill her in about fifteen seconds, but only after she’s already agitated—lighting a calm Wandering Witch keeps her moving fast without triggering an immediate strike.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In Left 4 Dead 2 Versus, surviving as the Hunter requires exploiting your unique mechanics rather than relying on surprise alone. Your pounce damage scales with distance and height, so a full run-up before leaping is often more effective than a blind jump.
> 
> Target stragglers or isolated survivors first; if you must engage the main group, move slowly like a common survivor to avoid triggering immediate melee detection until your claw reads as horde damage. Since your pounce recharges quickly, maintain pressure by crouching and repeatedly pouncing to keep survivors off-balance.
> 
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": null}
> ```

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You asked about the Gels, so here is the lowdown on how they function in-game:
> 
> The **Blue Gel** acts like a trampoline. Its bounce height depends entirely on how fast you were moving before hitting it. If you just jump onto it, you'll barely rise. To get high, you need to fall from a greater height or slide down a ramp into it. You can also use two blue gels facing each other to climb walls by bouncing back and forth between them.
> 
> The **Orange Gel** removes friction. Once you touch it, you keep your current speed indefinitely until you hit something else. This is great for maintaining momentum on slopes but makes stopping difficult.
> 
> The **White Gel** allows you to portal surfaces that normally refuse portals (like metal or glass). Note that it won't stick to cubes or turrets, and the Cleansing Spray will remove it instantly.
> 
> ```bonsai-cite
> Source: Portal 2 Strategy Guide (wiki_no_patch)
> ```
> 
> Where are you at in your current run?

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Excursion Funnel is designed to carry you along a beam, but if it's pushing you the wrong way, there is likely a button nearby that reverses its flow. It can cross the whole chamber via portals, so don't assume the route is shut—just look for the control that flips the direction.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're getting swarmed because Antlions hunt vibration. On the coast, rocks are safe; don't walk on the sand near them. Step off the beach onto solid ground or jump between boulders to avoid triggering them. If you have the Pheropod (bugbait) from the Antlion Guard, throw it at a group of Antlions to reverse their behavior—they'll swarm whatever you marked instead of you. Keep moving and use cover when they rise up.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You’ve already named the item, so I’ll be direct: pick up the Pheropod (bugbait) from the Antlion Guard. Once you have it, throw it onto the ground near a group of Antlions. The device will emit a signal that reclassifies you as a friendly guard in their eyes. Immediately after throwing it, turn around and run away or hide behind cover; the antlions will reverse their aggression and swarm whatever enemy you mark instead.
> 
> If you need performance tweaks while doing this (e.g., to keep FPS stable during chaotic encounters), let me know your target frame rate and I’ll suggest a TDP/GPU clock adjustment in the required JSON format.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun in Half-Life 2 is versatile but has limits: it grabs explosive barrels, sawblades (which shred zombies), radiators (acting as shields), manhacks, and scanners. It can also throw back grenades. However, it cannot lift most enemies; only specific tech units like manhacks are fair game for lifting.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're asking about starting weapons in Hades, which is a great question since early runs are all about learning the rhythm. The Stygian Blade is widely considered the most forgiving option for new players because it's simple to use and doesn't demand complex combos. It lets you focus on dodging and positioning while you figure out how boons work. If you prefer keeping distance, the Eternal Spear offers safe reach without punishing mistakes too harshly. Avoid the Twin Fists of Malphon at first—they're fast but require you to stay in melee range constantly, which can be overwhelming early on. Remember, weapon aspects change gameplay significantly later, so don't judge a weapon by its starting form alone.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> You're getting torn apart by the duo, which is common early on. The real trick isn't just dodging; it's prioritizing the bull. Asterius telegraphs a long charge—you sidestep it to make him stick, then focus fire him. Once he's down, Theseus becomes predictable with his spears and god-summons. If you're still dying, equip the Shield of Chaos; holding block turns mistakes into safety while letting you rush in for damage. Stay mobile, but don't freeze when the ground lights up—dodge the markers then counter.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> You have likely just finished the main story, but beating the final boss isn't the absolute end of *Hades*—the Pact of Punishment unlocks afterward. The game keeps going because you can continue fighting enemies and bosses to raise your Heat level, which grants unique rewards that only appear in these post-game runs. This is intentional design; it lets you finish side content and unlock the true ending sequence after a few more cycles.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You asked about the Berserk Operating System, so I will skip spoilers for other story beats and focus on its specific functions.
> 
> Berserk is an alternative operating system that prioritizes melee combat over time management. Its core effects are:
> 1.  **Damage Reduction:** While active, it significantly cuts down the damage you take from enemies.
> 2.  **Health Floor:** It prevents your health from dropping below 25% (one-quarter) of your maximum.
> 3.  **Regeneration:** After you defeat an enemy, you instantly regain 25% of your maximum health.
> 
> The specific effects on melee weapons depend on the "model" installed in your cyberware. This makes it distinct from Sandevistan, which focuses on slowing time for blade attacks, though both are melee-oriented systems. If you are considering using this for a build, ensure your TDP and GPU clock settings can handle the increased combat intensity if needed:
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first playthrough, you don't need to max out everything immediately. Attributes decide more than perks do, so focus on the two that define your playstyle early on. Body and Reflexes make a straightforward fighter who can handle mistakes well. Intelligence is the netrunner route where quickhacks do the work before fights start, but you're fragile once combat begins badly. Technical Ability quietly helps every build by unlocking crafting and better cyberware. Spreading points evenly usually goes badly because perks sit behind thresholds; an even spread reaches none of them. Pick your path: if you want to tank hits and brawl, dump into Body/Reflexes. If you prefer hacking from afar, go Intelligence first. Technical Ability is a solid third choice for almost anyone.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> You're asking about the main story conclusion in Cyberpunk 2077. The game offers multiple endings depending on your choices with Johnny Silverhand and whether you side with Arasaka or go rogue. I won't spoil specific plot twists, boss names, or exact outcomes here to keep things fresh for you.
> 
> ```bonsai-spoiler
> The final scenes vary based on your relationship with Johnny and the fate of key characters like Judy, Panam, or River. Some endings involve escaping Night City while others see heavy consequences for V's life expectancy and relationships. One path leads to a "secret" ending involving taking over Arasaka's legacy, while another results in V choosing their own destiny alone.
> ```
> 
> Where are you at in Cyberpunk 2077?

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you explicitly named the boss, I will provide direct tactics without spoiler warnings for that specific encounter.
> 
> To defeat Adam Smasher in *Cyberpunk 2077*, you must leverage his predictable patterns and your build's strengths:
> 
> 1.  **Prioritize Legs**: His legs are weak points. Use high-damage weapons or explosives (like the G-96 rocket launcher or heavy grenades) to target them first. Destroying one leg slows him down; destroying both makes him vulnerable.
> 2.  **Use Sandevistan**: If you have a Street Kid or Nomad background with the Sandevistan cyberware, activate it during his attacks to dodge easily and close the distance for melee strikes. This is often the safest way to chip away at his massive health pool.
> 3.  **Exploit Rocket Barrages**: When he fires a spread of rockets, cover up immediately (using walls or your own body) until they clear, then counter-attack.
> 4.  **Weapon Choice**: High DPS builds work best. If you lack Sandevistan, keep a safe distance and use ranged weapons that can target his legs from afar before he can close the gap.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```
> *(Note: These power settings ensure maximum performance for high-DPS combat scenarios.)*

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to end that fight fast, but its hide reflects laser fire and it stomps the ground to start. Keep distance, use cover, and let your build do the work. If you have a high Agility/Perception setup, V.A.T.S. headshots are key; Strength/Endurance lets you trade hits with heavy weapons or melee while staying behind walls. Energy weapons are poor choices here—save them for other threats. The moment it roars and stompes, be ready to dodge or take cover immediately. Don't get greedy before its health drops below the lethal grab threshold.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> You're looking to spend your initial 21 points wisely in Fallout 4, where you begin with one point in every stat. Since perks depend on these stats to unlock, your starting choices shape your character's progression significantly. Intelligence is a strong pick because it increases your level-up rate, allowing you to gain more SPECIAL points faster. Strength and Endurance are excellent for melee or heavy weapons builds, while Agility and Perception suit snipers and V.A.T.S. users. Charisma is weaker early on but useful for settlements and speech perks later. Consider what playstyle you enjoy most in the first ten hours rather than optimizing for a specific endgame build immediately.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are dealing with irradiated former humans that almost never travel alone; they lie in rubble waiting to climb out. The most reliable weakness is their head, but taking a leg off one stops it from attacking entirely while leaving arms intact won't do much. In heavily irradiated zones like the Glowing Sea, they regenerate as you shoot them, so focus on suppressing numbers or using radiation resistance gear there. Since you named these entities directly, I'm giving plain tactics without spoiler fences for this specific threat.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> This is a common issue in the Commonwealth; don't panic yet. First, check if your Fusion Core is depleted—the suit will still move but you'll lose V.A.T.S. and steady aim. If the core is charged, visit a Power Armor Station to inspect for missing limbs or degraded components like the neck ring or shoulder actuators.
> 
> If you recently modified the armor, ensure all pieces are properly attached; sometimes mods can glitch out if not re-equipped after loading a save. Also, verify your Strength attribute—if it's below 9, you won't be able to wear the T-60 frame at all (though this usually shows up immediately, not suddenly).
> 
> For optimal performance while troubleshooting:
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```
> 
> If the problem persists after checking these basics, consider reloading a save from before you entered the area or modified the armor. Remember, in Survival mode, healing chems take longer and have weight—so keep medkits handy if you're testing fixes mid-combat.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> You are right to be wary—that is exactly how the Legendary enemies work. At roughly 50% health, they trigger a mutation that fully restores their HP and often grants a new, more dangerous ability. The fight effectively doubles in length if you try to drain them before this point. A common mistake is using all your ammo and stimpaks on the first half; by then it's too late to heal yourself or repair limbs if you got crippled. Each one drops a weapon or armor piece with a random legendary effect, so surviving the second phase is key to getting that gear.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Welcome to Red Dead Redemption 2. Since you're coming from GTA, remember that Arthur has weight and horses take time to turn; shooting your way through a town works for about ninety seconds before the law arrives and stays. Wanted levels don't simply expire: a witness who sees your face turns into a bounty you pay off at a post office. Cover your face for anything illegal, ride rather than sprint, and treat camp as somewhere you go back to rather than a menu.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to raise Honor? Fine. It’s not a toggle; it’s a grind of small choices. Help strangers on the road, pay bounties instead of fleeing, and donate cash to camp. Avoid killing civilians or animals you don’t need. Do these often, and the meter climbs. High Honor unlocks shop discounts and changes NPC reactions. Low Honor flips those benefits and penalties. One mistake won’t ruin a good run; keep doing the right small things.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> You're asking about Arthur Morgan's fate in [[spoiler]]Red Dead Redemption 2[[/spoiler]]. The game ends with a choice: Arthur either dies from his tuberculosis or survives if you manage his health carefully. If he dies, he passes away in his bed at camp, and the story concludes with John Marston reflecting on Arthur's legacy. If he survives, he lives out his days as a free man, though the exact outcome depends on your choices throughout the game.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Your horse isn't just dropping you because of a glitch—it's reacting to fear or lack of trust. In RDR2, horses have distinct bond levels that directly affect their stability. If your mount is panicking due to gunfire, wildlife, or rough terrain, it will buck you off regardless of its raw stats.
> 
> First, check the horse's current bond level. A low-bond horse will spook easily and refuse to hold a line under pressure. You need to raise this bond through riding, feeding, brushing, and patting the animal while it is calm or during dangerous situations. Once the bond is high enough, the horse will stop throwing you when startled.
> 
> If the horse is currently panicked, dismount safely if possible (or let it buck you off if you're near cover), then use Dead Eye to take down threats without shooting directly at the horse unless necessary. Use trees or rocks for cover to keep the animal calm while it regroups. Avoid sprinting away from danger with a low-bond mount; instead, ride slowly and give it time to recover.
> 
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": null}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *State of Emergency*, you gain extra time by picking up the +15 second pickups scattered around the map. These are usually marked with distinct icons or glowing effects. Prioritize grabbing these over staying in a fight, as an extended round is more valuable than clearing a crowd. Be wary of rocket enemies late in the round; they can end your run quickly.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're looking at two distinct gameplay loops in *State of Emergency*. **Kaos Mode** is a score-attack challenge where you fight against a ticking clock within a single zone. Your goal isn't just survival; you must actively hit pop-up objectives to extend the time limit, pushing for high scores rather than narrative progression.
> 
> In contrast, **Revolution Mode** follows a linear story structure. It breaks down into a chain of missions per zone, with objectives handed out by the resistance faction. This mode is where you unlock new characters and zones as you progress through the campaign. Essentially, Kaos is about maximizing efficiency in isolated bursts, while Revolution is about advancing the plot and expanding your roster.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are looking at invisible blocks in the Shadow Temple. That’s normal—use the Lens of Truth to reveal them, then switch back to your eyesight for combat and navigation. Keep Green Potions handy so you can recharge the Lens without draining too much magic.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to take down the fire dragon, Volvagia. Since you're on a Steam Deck with a controller, here is the direct approach using the Megaton Hammer, which is essential for this fight.
> 
> First, ensure you are wearing the Goron Tunic and holding a shield capable of blocking fire (like the Hylian Shield). Stand near the edge of the lava pit but stay safe from the falling rocks. Wait for Volvagia to emerge from its lair; when its head appears, immediately hit it with the Megaton Hammer until it is stunned. While it is stunned, slash it repeatedly with your sword. If it flies around the room, use the Hookshot to pull it back down so you can repeat the hammering process. Keep moving to avoid lava and falling debris.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Resting too much burns through your food supplies for no real gain, and you'll miss out on companion scenes that advance the story. A long rest fully heals you and refills spell slots, but hoarding them is a waste of resources; pick up extra rations when you can. Only camp when you need to recover or push a specific quest forward.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For your first run, you need four slots covering Talk, Heal, Traps/Locks, and Damage. One character often covers two roles. The party you cannot cover is the one with no healing at all.
> 
> Pick:
> - Talk: Bard or Paladin (Paladin also heals).
> - Heal: Cleric or Druid.
> - Traps/Locks: Rogue or Ranger.
> - Damage: Any of the above if they have a strong weapon, or a Fighter/Monk for pure brute force.
> 
> If you want a balanced first run, go with a Paladin (Talk/Heal), Cleric (Heal), Rogue (Traps/Damage), and Fighter (Damage). This covers all bases without relying on stealth mechanics too heavily early on.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Painting and writing are the classic self-employed earners because they only need one skill and one object, and both scale hard with level. Gardening is slower to start and larger later. Selling collectibles funds the very early game, and a cheap starter lot leaves more for the object that earns.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You want to expand your crew beyond the initial seven slots? Respect is the only currency that matters here. It’s a fragile stat; kill cops or rivals, spray tags on turf, and complete missions to bank it up. But watch out—wearing the wrong colors in Los Santos (like blue instead of green near Grove Street) will drain it fast. Keep your hair, tattoos, and clothes aligned with the gang aesthetic to stop the bleed. If you lose too much territory or kill a brother, that number drops instantly.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You asked about beating Margit, so I will focus on that specific encounter without spoiling later bosses or story beats. On a Steam Deck, use Gamepad mode to access the dodge roll and block buttons comfortably.
> 
> First, learn his attack patterns: he telegraphs heavy swings with slow wind-ups, while quick slashes come from close range. Time your dodge rolls just before the swing connects; rolling too early wastes stamina. Keep your health high by using Flask of Crimson Tears wisely—wait for safe windows between his combos to heal. If you have a summon sign available, use it to draw aggro and learn his rhythm safely.
> 
> Avoid standing directly in front of him when he charges forward; instead, dodge to the side or back. When he jumps, wait for him to land before countering with a heavy attack. Patience is key—do not rush into combat if you are low on health.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Dying repeatedly in Tartarus usually means you need to switch your build or learn a specific dodge pattern. Since you're on Steam Deck, controls are tight, so let's look at the two main fixes: blocking vs. dodging and boss priority.
> 
> If you keep getting overwhelmed by damage, the Shield of Chaos is often the best early-game pick because holding block turns mistakes into nothing rather than reducing health. It also lets you rush in safely. If you prefer dodging, focus on Asterius first—he telegraphs a long charge you can sidestep to get stuck—then finish Theseus.
> 
> The Mirror of Night upgrades (Darkness) let you revive mid-run; rank 1 is usually enough to keep momentum without spoiling the flow. Try one run with just these adjustments and see if it sticks.
