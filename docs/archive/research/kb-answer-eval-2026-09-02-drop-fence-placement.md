# Knowledge-base answer eval — 2026-09-02 — drop-fence-placement

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e2b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `drop_fence_placement` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `5.1` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **91.9%** (91/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **0.0%** (0/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **100.0%** (66/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **81.1%** (30/37) | strictest view |

Mean seconds per answer: **2.7**. Mean request payload: **7065.2** bytes. Mean prompt tokens (Ollama prompt_eval): **1512.0**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.6 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.0 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-HL2-03` | expert | 3/3 | 2/3 | — | 3/3 | 3/3 | 2.9 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.5 |
| `A-HADES-03` | strategy | 3/3 | 2/3 | — | 0/3 | 3/3 | 3.6 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.1 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.6 |
| `A-CP77-03` | strategy | — | — | — | 0/3 | 3/3 | 2.7 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.1 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 2.2 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-RDR2-03` | strategy | — | — | — | 0/3 | 3/3 | 2.5 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.8 |
| `A-SOE-01` | strategy | 3/3 | 0/3 | — | 3/3 | 3/3 | 2.8 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.6 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.8 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 2.5 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 2.7 |

## Failures worth reading

- **A-DRG-01** sample 1: missing facts: `kite`
- **A-HL2-03** sample 1: missing facts: `barrel`
- **A-HADES-03** sample 1: missing facts: `not the end`; spoiler fence missing, one was due
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-03** sample 1: spoiler fence missing, one was due
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due
- **A-RDR2-03** sample 3: spoiler fence missing, one was due
- **A-SOE-01** sample 1: missing facts: `pickup`
- **A-SOE-01** sample 2: missing facts: `pickup`
- **A-SOE-01** sample 3: missing facts: `pickup`

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Reviewing the strategy for the Glyphid Dreadnought. You need to focus on its armor plates as they open up. Save your powerful weapons, like the nuke or overclock, for when those armor windows appear.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Reviewing the strategy for the Dreadnought Twins fight.
> 
> The key here is splitting your fire evenly. Don't focus all your damage on one ship; instead, try to keep the damage spread out so neither one can soak up all the punishment. Also, remember that the healing never starts, so focus on keeping the gap between their health bars as wide as possible while you are firing.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource used to purchase weapon upgrade cards at the between-stage shop and to reroll the artifact choice from the Supply Pod. Keep mining it for whichever weapon you are currently running. If you don't have Nitra, you will be forced to use an underleveled weapon regardless of how much gold you have mined.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Reviewing the strategy for the Tank boss in Left 4 Dead 2.
> 
> The Tank is a big threat because he throws chunks of concrete. The key is to fight him in the open. Anything he can punch becomes a projectile with more reach than his fists, and a punch taken near a drop kills rather than knocks you down. If he gets into a crouch through a vent, he becomes barely mobile and won't look for another way around.
> 
> Focus on keeping distance and using your guns effectively to avoid getting hit by his heavy attacks.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch attacks when she is startled. She ignores gunfire unless it's aimed directly at her, and she also ignores other infected. She wakes up if a survivor gets too close or if you use a flashlight.
> 
> If you see her start to move, the growl is a warning. Back off. If you keep coming, she will charge and incapacitate you in one hit. Fire slows her down, but only if you startle her first. The best way to deal with her is to light a wandering witch while she is calm and keeps full speed.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Hunter's playstyle in Versus mode revolves around managing your pounce mechanics and positioning.
> 
> *   **Pounce Mechanics:** The Hunter's pounce damage scales with distance, reaching up to 25 on a long one. Focus on maximizing the distance you can cover to ensure your pounces are effective.
> *   **Positioning:** Take the straggler, not the main group. If you must be near the group, move like a common player, as the melee claw reads as horde damage until someone checks on you.
> *   **Pressure:** Since the pounce recharges quickly, holding the crouch and re-pouncing is a good way to maintain pressure on the infected.

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gels are three different types of surfaces you can interact with in the game.
> 
> The blue Gel is a Repulsion Gel. This one is useful for gaining height. You can bounce off it, and the higher you drop before hitting it, the higher you'll bounce. It's not about jumping; it's about using the fall to gain momentum.
> 
> The orange Gel removes friction. If you land on this, you keep the speed you have when you arrive.
> 
> The white Gel lets you portal surfaces that couldn't be ported before. However, be aware that it won't stick to cubes or turrets, and you'll need to use the cleansing spray to remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is pushing you the wrong way, you need to look for the button that reverses its direction before you assume the route is shut. Since it passes through portals, it can cross the whole chamber, but if it's misaligned, you need to reverse it.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're hitting the classic sand trap situation. The key here is to remember what the local knowledge base says: Antlions are blind and hunt vibration.
> 
> If you are near the coast, the rocks are your friend—step off the sand and stay on the solid ground. If you're in a sand area, try to move carefully and avoid stepping on loose sand where they might be waiting.
> 
> If you've already encountered the Antlion Guard, remember that once you get the pheropod from them, you can throw it to make them swarm whatever you mark.
> 
> Where are you currently stuck in the level?

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the bugbait, you first need to obtain it. You get the pheropod from the Antlion Guard. Once you have the pheropod, you throw it, and the antlions will read you as a guard, causing them to swarm whatever you have marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun is a versatile tool for manipulating objects in Half-Life 2. You can use it for secondary pulls and holds, as well as primary punts.
> 
> Here is what it can generally interact with:
> 
> *   **Secondary Pulls and Holds:** You can use it to pull objects towards you or hold them in place.
> *   **Primary Punts:** This is the main function, allowing you to launch objects with significant force.
> 
> Based on general gameplay knowledge, common items you can interact with include:
> 
> *   **Environment Objects:** Various debris, crates, and loose items scattered throughout the maps.
> *   **Enemy Equipment:** Depending on the situation, you can often use it to manipulate enemy gear.
> *   **Ammunition/Projectiles:** You can throw various items, including other grenades or ammunition, back where they came from.
> 
> Keep in mind that the specific items available to pick up or throw can change depending on the current game state and location.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The easiest weapon to start with is generally the Stygian Blade. It's the most forgiving and requires the least skill to use. The Shield of Chaos is also a good initial choice because blocking turns mistakes into nothing. The Eternal Spear is the safest option if you want maximum reach to keep enemies away. The Twin Fists of Malphon are the fastest but require you to stay inside everything, which can be tricky early on.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Two at once is the main challenge here. Asterius, the bull, will telegraph a long charge. You need to sidestep that charge to get a brief window where he's stuck. Then, use Theseus's attacks to your advantage, as his divine power will be marked on the ground before it lands. Most players find it easier to take down Asterius first because Theseus is more predictable.
> 
> If you're struggling, try focusing on dodging the big charges from Asterius first. If you're looking for a weapon, the Shield of Chaos is recommended because blocking turns a mistake into nothing, and it also sets up a rush that closes the distance.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ❌ · contradiction — · fence ❌ · menu ✅

> If you've beaten the final boss, it usually means you've completed one run, but the game structure in Hades is designed for multiple runs. Beating the final boss doesn't always signify the absolute end of the game; it often unlocks new challenges or allows you to progress further in the narrative.
> 
> Since you're stuck, we need to figure out what the game is prompting you to do next.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system in Cyberpunk 2077 is a melee-focused mechanic. It functions by cutting damage taken and prevents your health from dropping below a quarter. Furthermore, after every enemy you defeat while using it, you regain a quarter of your maximum health. The specific effect on your melee weapons depends on the model you have installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first playthrough in Cyberpunk 2077, the general advice is to focus on which two attributes you want to specialize in, as they have the biggest impact on your early gameplay.
> 
> If you want to play a straightforward fighter who can handle mistakes, prioritize Body and Reflexes. These are good for a solid, reliable build.
> 
> If you lean into the netrunner route, you should put points into Intelligence. This lets you get quickhacks up early, but be aware that you will be fragile once you start fighting.
> 
> Technical Ability is always a good general investment because it quietly helps every build by opening up crafting options and the cyberware you can actually use.
> 
> The key takeaway is that spreading points evenly is usually the worst choice; the perks worth having sit behind attribute thresholds, and an even spread often leaves you with nothing.
> 
> Since you haven't specified a build yet, I can't give you a definitive answer, but I can guide you based on your desired playstyle.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> The main story ending in Cyberpunk 2077 is heavily influenced by the Lifepath you chose at the start. Your choices dictate the opening chapter, unique side jobs, and dialogue options throughout the game, which in turn affects the narrative path you take. There isn't one single, fixed ending, but rather several potential conclusions based on those initial decisions.
> 
> Since I don't know which Lifepath you started with, I can't give you a specific ending. However, the game generally culminates in reaching a major confrontation where the outcome is determined by your accumulated choices and how you approached the various factions and missions.

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For Adam Smasher, focus on high damage output, specifically targeting his legs first. Use Sandevistan or high DPS builds to destroy his legs before engaging him directly. Cover yourself during his rocket barrages.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about killing a Deathclaw early, remember that distance and cover are your best friends. They have very high health and are resistant to a lot of stuff.
> 
> Here is the basic approach:
> 
> 1.  **Stay Back:** Don't rush in. If you get too close, they will use their stomp and headbutts to stagger you, and you risk getting caught in their attacks.
> 2.  **Use Cover:** Look for any obstacles—rocks, debris, or even buildings—to stay behind them.
> 3.  **Focus on Damage:** Since they are resistant to most things, you'll need to focus on dealing consistent damage. If you have a powerful weapon, use it from a safe spot.
> 4.  **Watch for Opportunities:** Wait for them to use an attack, or look for a moment when they are vulnerable, though this is rare early on.
> 
> If you are struggling to survive the initial encounter, you might want to consider focusing on a build that gives you better survivability, like Strength with Endurance, which helps you survive mistakes.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Picking your SPECIAL stats early in Fallout 4 is important because they determine which perks you can take later. You start with one point in every stat and 21 points to spend, meaning you begin with 28 total points.
> 
> The general advice is to focus on a build that suits your playstyle. Intelligence is often recommended because it raises how fast you level up, meaning you get access to other perks sooner. Strength paired with Endurance makes for a good melee or heavy weapons survivor that can take a beating. Agility with Perception is great if you plan on being a sniper or using V.A.T.S. to take things out before they get to you. Charisma is the weakest stat early on but pays off later for settlement and speech-based builds.
> 
> Since you are asking about the start, I need to know what kind of gameplay you plan on focusing on.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Take the head off one of the ghouls to stop its attack, while taking both arms off does not stop it. They deal radiation damage as well as physical damage. They can lie among rubble or climb out of ductwork and windows, so even if a room looks clear, a ghoul might still be hiding there and be able to climb out. If you are in heavily irradiated places like the Glowing Sea, you can regenerate as you shoot them.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> If your power armor suddenly stopped working properly, check a few things. First, ensure you have enough fusion core energy. The frame runs on a fusion core that drains with time and drains faster when you are sprinting or using V.A.T.S. If the core empties, you can still walk, but you will lose V.A.T.S. and steady aim, and you will be over-encumbered.
> 
> Second, check the armor itself. Repairs and upgrades happen at a power armor station or a settlement. If you haven't repaired it recently, it might be the issue.
> 
> Third, check your perks. While not directly related to the armor *working*, certain perks might affect its performance or your ability to manage it.
> 
> If you are experiencing a complete failure, try powering down and powering back up your armor, or check if you are over-encumbered, as that can cause issues.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> That sounds like you're running into one of the tougher encounters in the game. If you're fighting a legendary enemy and it suddenly heals back to full health, you need to be careful. The game notes indicate that legendary enemies have a mutation: at around half health, they heal themselves completely and gain a new ability. Spending all your resources on that first half is a mistake.
> 
> The key is to manage your damage output and not get greedy. Focus on taking down the enemy before it gets that critical mid-fight heal.
> 
> Since I don't have a screenshot or context on where you are in the game, I need to know what you are currently facing. Are you in a specific area, or are you looking for general advice on dealing with these tougher foes?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> <bonsai-spoiler>Coaching is spoiler-minimized by default</bonsai-spoiler>
> 
> Since you're coming from GTA, the main thing to grasp is that this game is intentionally slow. Arthur has weight, and everything takes time—turning a horse, picking up an item. Shooting through a town is a sprint, and the law will catch up fast.
> 
> Here are a few starting tips:
> 1. **Pacing:** Don't try to rush. Treat movement and actions as deliberate.
> 2. **Wanted System:** If you get a wanted level, don't just run. Try to ride or slow down. A witness seeing you can turn into a bounty you have to pay off at a post office.
> 3. **Camp Management:** Think of your camp as your base. Make sure you have stable upkeep and supplies before heading out on long hunts.
> 
> What are you looking to do first?

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor in Red Dead Redemption 2 is about how you interact with the world and the people in it. It's not a single action, but a collection of choices that build up your reputation.
> 
> The core mechanics involve:
> 
> 1.  **Positive Interactions:** Greeting people, helping strangers on the road, and making positive contributions to the community—like paying bounties instead of running, or donating to the camp.
> 2.  **Negative Interactions:** Conversely, actions like robbing, killing civilians, or killing animals you don't need can lower your Honor.
> 
> Think of it as a slider. One bad day doesn't erase a good chapter, but consistently choosing actions that build trust and respect will increase your Honor.
> 
> ```bonsai-cite
> [Red Dead Redemption 2 / mechanic: Honor] (trust: fallback_no_source)
> It moves on small things done often: greeting people, helping strangers on the road, paying bounties instead of running, donating to camp. It falls for robbery, killing civilians and animals you do not use. High honor means shop discounts and different reactions; low honor pays differently. It is a slider, not a switch — one bad day does not undo a good chapter.
> ```

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> The ending of Red Dead Redemption 2 is quite complex and involves Arthur Morgan's final choices and the outcome of his journey. Since you are asking about the end of the story, I can give you a general overview of the narrative arc without giving away specific, major plot twists or final outcomes.
> 
> The story focuses heavily on Arthur's relationships, his moral compromises, and the consequences of his actions across the game's timeline. The final moments are determined by the decisions you make throughout the game regarding your character's path and interactions with the world around you.
> 
> To give you a more specific idea of what happens, you need to decide which part of the narrative you want to focus on first.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If your horse keeps throwing you off, the primary solution involves improving the bond level between you and the horse.
> 
> The local knowledge base states that raising the bond level—through actions like riding, feeding, brushing, patting, and calming it during danger—will increase its handling, stamina, and eventually allow it to perform maneuvers like the rear or drift. Furthermore, a high-bond horse is less likely to spook when something scares it.
> 
> If you are dealing with a specific horse, focus on those bonding activities. If the issue persists across multiple mounts, consider the horse's breed; some breeds, like Arabians, bolt easily until the bond level is established.
> 
> ```bonsai-cite Red Dead Redemption 2 / mechanic: Horse bonding (trust: fallback_no_source)
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> To get more time in a round, you need to focus on completing objectives quickly rather than just surviving the crowd. The game rewards you for extending the time you spend in the round.
> 
> Here are the main ways to extend your time:
> 
> *   **Complete Objectives:** Look for objectives that pop up mid-riot. Hitting these objectives is a much better way to extend the round than just trying to survive the enemies.
> *   **Prioritize Targets:** When late-round rocket enemies appear, treat them as your top priority target immediately. Dealing with them quickly keeps the pressure off and allows you to focus on objectives.
> 
> Focus on hitting those objectives when they appear.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode is a score attack against a clock within a single zone. You extend the time by hitting objectives that pop up mid-riot rather than focusing on surviving the entire duration. Revolution mode, conversely, focuses on the story aspect, involving a chain of missions per zone with objectives handed out by the resistance, which is where characters and zones are unlocked.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> That sounds like you're stuck in the Shadow Temple. The key to finding those missing floors and walls is using the Lens of Truth and the invisible floors/walls item. You can use the invisible floors and walls in short bursts, as holding them drains magic, so make sure you have green potions or fairies nearby to keep your magic up.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about Volvagia, I can give you the basic tactics for that fight. You need to use the Megaton Hammer. Hit the head the moment it pops up, and then slash while it's stunned. When it flies around the room, the hookshot will pull it back down. Use the Goron Tunic and a shield for defense, and make sure you stay clear of the lava at the edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Resting more often in Baldur's Gate 3 is a trade-off. A long rest is a big investment: it costs camp supplies and restores spells, health, and most abilities. It's also what advances companion scenes and personal quests. Hoarding rests means you might miss out on important story moments. Supplies are generally plentiful, so focus on picking up food.
> 
> The decision really depends on what you are trying to achieve right now—are you trying to maximize story progression, or are you trying to keep your resources topped up for a tough fight?

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you want a balanced party that covers the core needs of exploration, combat, and utility. A good starting point is to aim for four distinct roles.
> 
> Here is a breakdown of what you generally need:
> 
> 1.  **Talker/Controller:** Someone who can handle dialogue, persuade NPCs, and manage social encounters. A Bard or a Paladin often excels here.
> 2.  **Healer/Support:** Essential for keeping the party alive. A Cleric or a Druid provides crucial healing and utility spells.
> 3.  **Damage/Tank:** You need characters who can deal consistent damage and absorb hits. A Fighter or a Barbarian usually fits this role well.
> 4.  **Utility/Skill Monkey:** This character handles traps, locks, and provides necessary skills. A Rogue or a Ranger is excellent for this, often covering trap disarming and scouting.
> 
> **Example Composition:**
> 
> *   **Bard:** For social skills and some utility.
> *   **Cleric:** For strong healing and divine support.
> *   **Fighter/Barbarian:** For frontline damage and tanking.
> *   **Rogue:** For traps, stealth, and single-target damage.
> 
> This setup ensures you have coverage for talking, healing, dealing damage, and handling environmental hazards. Focus on having at least one dedicated healer, as a party without healing is often doomed.
> 
> ```json
> {"tdp_watts": 5, "gpu_clock_mhz": null}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The fastest way to make money early in The Sims 4 generally involves focusing on skills that generate income quickly and require minimal upfront investment.
> 
> The most cited methods are:
> 
> 1.  **Painting and Writing:** These are classic self-employed earners because they only require one skill and one object, and both scale hard with level.
> 2.  **Selling Collectibles:** This is noted as a method that funds the very early game, especially if you start with a cheap starter lot to maximize the remaining funds for the object that earns.
> 
> Focusing on these skills early on allows you to establish a steady income stream while you build up the necessary career levels.

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To increase the number of gang members you can recruit, you need to focus on activities that increase your "Respect" level with the relevant gangs.
> 
> Respect dictates the maximum number of gang members you can have, which ranges from one up to seven. You can gain respect through several methods:
> 
> 1.  **Missions:** Completing specific missions often grants respect points.
> 2.  **Conflict:** Killing rival gang members or police officers contributes to increasing your standing.
> 3.  **Territory Control:** Taking and holding territory in the game is a major factor in gaining respect.
> 4.  **Appearance:** Certain visual cues matter, such as wearing the correct colors in Grove Street territory, as this can influence your standing.
> 
> If you are trying to maximize recruitment, focusing on territory control and eliminating rivals will yield the most direct results.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> ```bonsai-spoiler
> To beat [[spoiler]]Margit[[/spoiler]] you need to manage your stamina carefully and focus on dodging her attacks. Pay close attention to her patterns; she has distinct attack sequences that you need to learn to anticipate. Use your dodge timing to your advantage, and try to keep your stamina up so you can maintain your defensive posture.
> ```

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> It sounds like you're stuck in the early stages of Hades and struggling with the difficulty. Since you're focusing on survival, we need to look at how to manage the early encounters.
> 
> For general survival in the early runs, focus on not getting overwhelmed. Pay attention to the enemy patterns and try to use the environment to your advantage.
> 
> If you're struggling with a specific area or encounter, let me know. For instance, are you having trouble with a particular section, or are you looking for advice on managing your character's abilities?
