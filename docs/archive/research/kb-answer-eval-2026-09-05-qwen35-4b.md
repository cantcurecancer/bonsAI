# Knowledge-base answer eval — 2026-09-05 — qwen35-4b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `qwen3.5:4b` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `5.7` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **98.0%** (97/99) | every must-mention group found in the reply |
| No contradiction | **88.9%** (8/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **99.0%** (95/96) | no spoiler fence where none was due |
| Fence present when due | **33.3%** (3/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **98.5%** (65/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **81.1%** (30/37) | strictest view |

Mean seconds per answer: **3.1**. Mean request payload: **7311.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1551.7**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.5 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3.3 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-L4D2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 3.4 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.6 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.6 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.8 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.5 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.3 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 2.5 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 2.5 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.8 |
| `A-CP77-03` | strategy | — | — | — | 1/3 | 3/3 | 2.4 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.4 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.0 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 5.7 |
| `A-FO4-05` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 3.6 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 4.7 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-RDR2-03` | strategy | — | — | — | 2/3 | 3/3 | 2.5 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.6 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.1 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.2 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.9 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.9 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.7 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 2/3 | 3/3 | 2.7 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 4.4 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 3.3 |

## Failures worth reading

- **A-L4D2-01** sample 1: missing facts: `open`; branch menu missing
- **A-HADES-03** sample 1: spoiler fence missing, one was due
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-01** sample 1: said: `slows time`
- **A-CP77-03** sample 1: spoiler fence missing, one was due
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-GTASA-01** sample 1: spoiler fence present, none due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're facing a tough boss in **Deep Rock Galactic: Survivor**. The Glyphid Dreadnought is a large, heavily armored enemy that relies on waves of smaller minions and its own heavy attacks. Here's how to approach it:
> 
> - **Kite the waves**: Keep moving to avoid taking damage. Don't stand still while it fires or when minions swarm you.
> - **Focus weak points**: Look for armor plates on its body that open up periodically. These are your best targets.
> - **Save big weapons**: Use your overclock or nuke only during brief windows when its armor is broken or it's vulnerable.
> 
> Stay patient, keep your distance, and don't get caught in its melee range unless you're ready to trade blows.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You're likely triggering their "heal the gap" phase. In this fight, the two smaller Dreadnoughts (Lacerator and Arbalest) don't just heal individually; they actively close the health difference between them. If one gets significantly lower than the other, they will begin a coordinated healing sequence to equalize their HP bars. This is why focusing fire on just one unit backfires—it creates the exact imbalance that starts their recovery loop.
> 
> Here is the fix:
> *   **Split Fire:** Do not target one Dreadnought exclusively. Keep your damage distributed evenly between both enemies at all times.
> *   **Monitor Bars:** Watch their health bars closely. If you see one dipping significantly while the other stays high, stop attacking that one immediately and shift focus to the leader or the higher-health unit to prevent them from healing back up.
> *   **Avoid Overclock/Nuke on Full HP:** Since they are immune while healing, try to avoid using heavy buffs like overclock or nukes unless you have a clear window where both are down individually.
> 
> Keep the pressure balanced, and their healing trigger should never activate.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *Deep Rock Galactic: Survivor*, Nitra is the primary currency used to fund your dwarf's progression rather than gold, which pays for weapons. Specifically, it serves two key functions at the between-stage shop: you spend it to buy weapon upgrade cards and to reroll the artifact choice provided by the Supply Pod. Without accumulating Nitra, your weapon will remain underleveled regardless of how much gold you mine during the run.

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ❌

> You're asking about the **Tank** boss in *Left 4 Dead 2*. Since you're on Steam Deck, this fight is manageable but requires precise positioning because the Tank's concrete projectiles and charge mechanics can be overwhelming. Here’s how to approach it:
> 
> ### Key Tactics for the Tank
> 1. **Wait for the Team**: The Tank only appears during the final wave of a campaign, and your teammates will be dealing with other infected. Wait until they have cleared the initial horde before engaging the Tank directly.
> 2. **Positioning is Critical**: 
>    - The Tank throws concrete chunks that can kill you in one hit if you're too close or in the wrong spot. Stay behind cover (like rocks) when he's charging his attacks.
>    - Avoid being pinned down by the Tank’s melee range; move constantly to avoid getting caught in a crossfire from your teammates’ enemies.
> 3. **Focus Fire**: Your teammates should handle most of the damage while you keep him occupied with shots at his head or body. Don’t get too close unless you’re sure he won't charge at you next.
> 4. **Use Cover Wisely**: If the Tank tries to force you into a choke point, use rocks or walls to block his path and create distance. He’s slow when crouched through vents, so exploit that if possible.
> 
> ### Boss Behavior Notes
> - The Tank will sometimes try to lure you out of cover by throwing concrete at your feet. Stay low and move around obstacles rather than standing still.
> - If he starts charging a massive attack (the big slam), back away quickly—there’s no time to dodge mid-animation.
> 
> Let me know if you want more specific advice on handling other infected types or navigating the map during this fight!

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *Left 4 Dead 2*, "The Witch" doesn't just randomly decide to attack you. Her aggression is tied directly to how she perceives your actions and proximity. She ignores bullets that aren't aimed at her and generally ignores other infected unless she's already been provoked.
> 
> There are two main scenarios for why she attacked suddenly:
> 1.  **You lit her up:** If you used a flashlight or a light source while she was calm, she will instantly stand up from her crouch, start flailing, and charge at whoever burned her. She ignores the person who actually woke her if they are far away; she targets the one who lit her.
> 2.  **You got too close:** If you walked into her range without provoking her with light, she may just stand up and attack you on sight because you are standing too close to be ignored.
> 
> The key is that once she is startled (by light or proximity), she will switch targets to whoever attacked her first, not the one who woke her. Fire kills her in about 15 seconds, but only after she has been provoked.

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in *Left 4 Dead 2* requires a shift from standard survival tactics to aggressive positioning, particularly regarding your Pounce ability. Since Pounce damage scales significantly with distance (up to 25 on a long-range hit), height and a proper run-up are critical for maximizing damage output.
> 
> Focus on taking out stragglers first rather than engaging the main group immediately. If you must engage the horde, treat your melee claw as standard melee damage until an enemy checks their health bar; do not assume it deals instant kill damage at close range. Because the Pounce recharges quickly, combining crouch movement with repeated pounces is an effective way to maintain pressure on the survivors.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": null}
> ```

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *Portal 2*, there are three types of gel, each with distinct physics rules that change how you move and interact with surfaces. You can't use them on glass, as they slide off immediately.
> 
> Here is how each works:
> 
> *   **Blue Gel (Repulsion):** This makes surfaces slippery, but in a specific way. The higher you fall onto it, the higher you bounce back up. To maximize height, don't just jump; drop from a significant distance to gain momentum. You can also use two coated walls facing each other to create a bouncing ramp for climbing.
> *   **Orange Gel (Frictionless):** This removes all friction from a surface. If you slide onto it, you will keep whatever speed you had when you arrived; the gel won't slow you down or stop your momentum. It's great for maintaining high-speed slides across floors or walls.
> *   **White Gel (Portalable):** This allows you to place portals on surfaces that normally refuse them (like metal grates or certain angled walls). However, it has limitations: it won't stick to cubes or turrets, and if you use the cleansing spray, it will strip the gel away.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with the **Excursion Funnel** in *Portal 2*. Based on the mechanics, if the funnel is pushing you the wrong way, it's likely because the direction isn't set correctly for your current path.
> 
> The Excursion Funnel allows weightless travel along the beam. If you find yourself being pushed backwards or off-course:
> 1.  **Look for a button** specifically designed to reverse the funnel's direction. This is often distinct from standard portal controls.
> 2.  Press this button to flip the vector so it pushes you in the intended direction through the chamber.
> 3.  Remember, the funnel passes through portals and can ferry objects like gel or cubes along with you, so ensure your path aligns once reversed.
> 
> No performance tweaks are needed here; this is a puzzle mechanic issue.

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're in the **Sandtraps** chapter (the coastal section). The Antlions there are blind and hunt by vibration. They won't attack you if you stay on the rocks, but they will swarm you if you step into the sand.
> 
> Here is how to handle them:
> 1.  **Stay on the rocks:** Move along the rocky outcrops when they rise from the sand.
> 2.  **Use the Pheropod:** If you have the **Pheropod** (bugbait) from the Antlion Guard fight, throw it at a rock or bunker. The antlions will treat you as a Combine guard and attack *them* instead of you.
> 
> You likely just need to keep your feet off the sand until you find a safe spot or have the pheropod ready.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the **bugbait** (pheromone lure) in *Half-Life 2*:
> 
> 1.  **Retrieve it**: You must first find a dead Antlion Guard and collect its body to get the lure.
> 2.  **Throw it**: Toss the bugbait on the ground near an active swarm of Antlions.
> 3.  **Wait for the shift**: The Antlions will stop attacking you immediately upon seeing the bait. They will reverse their behavior and begin swarming whatever object or character you have marked as "safe" (usually your friend, Dr. Kleiner).
> 4.  **Mark your target**: While the Antlions are distracted by the lure, quickly mark your target (e.g., hold `F` to mark an NPC) so they can be attacked without taking damage from the swarm.
> 
> This mechanic is essential for bypassing the aggressive AI of the Antlion Guard during combat encounters.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun in *Half-Life 2* interacts with objects and enemies differently depending on their physical properties. Based on the available strategy data:
> 
> **It will successfully pick up and throw:**
> *   **Explosive Barrels:** These are one of the most reliable targets for throwing; they hit hardest when thrown back at enemies.
> *   **Sawblades:** These can be picked up to cut zombies apart or used as ammunition.
> *   **Radiators:** A held radiator functions effectively as a shield that you can walk behind.
> *   **Manhacks & Scanners:** These specific items are fair game for pickup and use.
> *   **Grenades:** Thrown grenades can be picked up and thrown back where they came from.
> *   **Loose Blades:** Found in Ravenholm, these serve as ammunition for the Gravity Gun itself.
> 
> **It will NOT pick up (or interact with) effectively:**
> *   **Most Enemies:** The gun generally cannot lift or throw most living enemies.
> *   **Heavy Objects not listed above:** While the game physics allow for some interaction, the provided data specifically highlights the items listed as "fair game" or successful targets.
> 
> Note: This information is based on general gameplay mechanics and wiki summaries available in the context, which may vary slightly depending on specific game patches or updates (trust level: wiki_no_patch).

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Based on your question, you are likely asking about **Hades** (AppID: 1145360), which runs very well on the Steam Deck.
> 
> For the easiest starting experience in Hades, take the **Stygian Blade**. It is widely considered the most forgiving of the six weapons because its attack pattern hits quickly without requiring you to stand still or manage complex mechanics. The **Shield of Chaos** is a close second; it lets you block attacks to turn mistakes into nothing, making it very safe for beginners.
> 
> The **Eternal Spear** is also a solid choice if you prefer reaching enemies from a distance rather than getting right up in their faces. Avoid the **Twin Fists of Malphon** (the fastest but shortest reach) and weapons like the Heart-Seeking Bow or Adamant Rail until you are more comfortable, as they punish mistakes heavily by requiring specific positioning.
> 
> Remember, each weapon has unique "aspects" that unlock later using Titan Blood, so a weapon might feel weaker at first than it actually is.

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you are stuck in the final boss fight of Hades. On a gamepad, this fight is tricky because you have to manage two different attack patterns at once. The real challenge comes when both bosses hit simultaneously.
> 
> Here is how to handle it:
> *   **The Bull (Asterius):** He telegraphs his charge with a specific animation. If you see him winding up, just sidestep early. When he stops moving after the charge, he gets stuck for a split second—strike him then while he is vulnerable.
> *   **The Spearman (Theseus):** Watch the ground. A glowing circle means a spear will land there shortly. Move away from that spot immediately. He also has periodic bursts of divine power, which are usually marked on the floor before they hit.
> *   **Strategy:** Most players find it easier to kill Asterius first. Once he is down, Theseus becomes much more predictable and you can focus entirely on dodging his spear patterns without worrying about the bull's charge.
> 
> If you keep dying, try focusing your attacks on the one that is currently vulnerable rather than trying to hit both at once.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> No, beating the final boss (Theseus and Asterius) isn't the end of the story. In *Hades*, completing the main questline is just the middle act. You have to keep playing through multiple runs to unlock the true ending.
> 
> The game tracks your "Heat" level, which you can raise by taking on harder challenges or specific events. Once you've built up enough Heat, you'll unlock the **Pact of Punishment**. This allows you to enter a special mode where you fight gods with unique mechanics and rewards that are only available after reaching high Heat levels.
> 
> Here is where you are in your playthrough:

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ❌ · fence ✅ · menu ✅

> In *Cyberpunk 2077*, **Berserk** is a cyberware implant that functions as an alternative operating system, specifically designed for melee combat. It operates outside the normal time constraints of the game world, allowing you to enter a state where you are significantly more aggressive and resilient.
> 
> Here is what it does:
> *   **Damage Reduction:** While active, it cuts the damage you take from attacks.
> *   **Health Floor:** It prevents your health from dropping below 25% (a quarter of your maximum).
> *   **Healing Mechanic:** Once an enemy is defeated while Berserk is active, that enemy drops a chunk of your maximum health back to you as loot.
> *   **Weapon Synergy:** The effectiveness of your melee weapons depends on the specific model of the implant installed.
> 
> This is distinct from other implants like Sandevistan (which slows time) or Quickhacks (software programs); Berserk is purely a combat-focused biological augmentation that trades mobility and stealth for raw survivability and offensive output in close quarters.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For your first playthrough, avoid spreading your Attribute points evenly; that is the most reliable way to go badly because perks require specific thresholds to unlock. You need to pick two main attributes to build your character around:
> 
> *   **Body and Reflexes:** This creates a straightforward fighter. It makes you durable enough to take hits and fast enough to dodge, forgiving mistakes during combat.
> *   **Intelligence:** This is the route for Netrunning (hacking). Quickhacks let you disable enemies before they even start fighting, but it leaves you very fragile once a fight turns physical.
> *   **Technical Ability:** While not a primary stat like Body or Intel, this quietly helps *every* build by unlocking crafting and specific cyberware you will need later.
> 
> Your Lifepath (Nomad, Streetkid, or Corpo) mostly affects the opening chapter and dialogue options rather than core combat mechanics, so pick the one that fits your preferred story style.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> I can't give you a detailed walkthrough of the actual ending scenes or specific plot twists, as that would spoil your experience. However, I can tell you that the game's narrative is heavily influenced by your choices made throughout the campaign, particularly regarding the fate of Arasaka and the city of Night City itself. Your actions in key moments will determine which of several possible endings you see, ranging from a dystopian future to a more hopeful one.
> 
> Since you haven't shared any screenshots yet, I'm not sure exactly where you are in the game or what specific path you've taken so far. To help you better, could you tell me:
> 1. Which Lifepath did you start with (Nomad, Streetkid, or Corpo)?
> 2. Do you remember if you made any major decisions regarding Arasaka or Johnny Silverhand?

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Adam Smasher in Cyberpunk 2077, you need to focus on high DPS (Damage Per Second) builds and utilize the Sandevistan ability effectively. The key strategy involves targeting his legs first to disable him or make him vulnerable, while covering yourself during his rocket barrage attacks.
> 
> Since you are asking about specific boss tactics for Adam Smasher, this falls under your requested information. However, please note that my knowledge on this topic is based on general community strategies and may not be fully verified against the latest game patches or official guides.
> 
> ```json
> {"tdp_watts": 10, "gpu_clock_mhz": null}
> ```

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're asking about the Deathclaw, which is one of the toughest bosses in *Fallout 4*. Here's how to take it down without getting wiped out:
> 
> 1. **Stay at a distance** – The Deathclaw has high health and can kill you with a single grab or decapitation if you get too close. Keep your cover up and use vehicles as mobile shields.
> 2. **Use energy weapons carefully** – Lasers reflect off the Deathclaw's hide, so they do little damage. Focus on its weak points: the eyes (if you have a sniper rifle) or the legs (with heavy weapons).
> 3. **Avoid melee** – The Deathclaw will headbutt and throw cars at you. Melee is risky unless you're very skilled.
> 4. **Watch for low health behavior** – When it gets down to about 20% HP, it becomes more aggressive and can kill you instantly with a grab or decapitation. Stay out of range once it's below that threshold.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You start with one point in every SPECIAL stat and 21 points to spend. This is less than earlier games, but your starting values are crucial because they determine which perks you can take early on. You can raise stats later with bobbleheads, magazines, and level-ups, so pick what feels best for the first ten hours of enjoyment rather than trying to optimize a character you haven't met yet.
> 
> Here is how the main builds generally break down:
> *   **Strength + Endurance:** Great for melee combat or heavy weapons. It forgives mistakes and lets you tank hits.
> *   **Agility + Perception:** The classic sniper and V.A.T.S. route. You kill things before they can react, which is very forgiving if you miss.
> *   **Intelligence:** A quiet but strong pick. It raises your XP gain rate, meaning every other perk arrives sooner than usual.
> *   **Charisma:** Focuses on settlements and talking to people. It starts weak but pays off later in the game.
> 
> Remember, magazines scattered around the world give you extra perks for free, so keep an eye out for those too.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you specifically asked about "Feral ghouls," I can give you direct tactics without hiding spoilers for this enemy. Feral ghouls are fast, irradiated former humans that rarely travel alone and often play dead before climbing out of ductwork or windows. Their head is the reliable weakness; taking a leg off one will stop them from attacking entirely, whereas removing both arms does not. Be aware that in heavily irradiated areas like the Glowing Sea, they may regenerate health as you shoot them.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": null}
> ```

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> Since you're playing on Steam Deck, I'll assume you're concerned about performance or battery drain alongside the "stopping" issue. Here's the breakdown based on your game context:
> 
> **1. Fusion Core Depletion (Most Likely)**
> Your power armor runs on a fusion core that drains over time and faster when using Actions Points (AP) like sprinting or V.A.T.S. If it empties, you can still walk but will be over-encumbered, losing V.A.T.S. and steady aim.
> *   **Fix:** Equip a new fusion core at a Power Armor Station. It's free to swap out if you have one nearby.
> 
> **2. Performance & Battery (Steam Deck Context)**
> If the armor "stopped working" due to lag or stuttering, your TDP/GPU settings might be throttling too hard.
> *   **Action:** Try lowering the TDP to save battery and reduce heat noise, which often stabilizes frame rates better than high power modes on handhelds.
> 
> ```json
> {"tdp_watts": 8, "gpu_clock_mhz": null}
> ```
> 
> **3. Settlement vs. Station Upgrades**
> If you are trying to *upgrade* the armor model itself (not just swap cores):
> *   **Cost:** Upgrading costs materials regardless of your current tier. It is usually better to wait until you have rank 2 in Armorer and Science to get better ratios on rare materials like Carbon Fiber or Ceramics.
> 
> **4. Legendary Enemy Mutation**
> If "stopped working" refers to an enemy:
> *   **Warning:** Many legendary enemies heal completely at half health and gain a new ability, doubling the fight length. Don't spend all your ammo in the first half!
> 
> Let me know if you meant a specific error message or if it's purely about performance lag.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Based on your description, you are likely encountering a **Legendary Enemy** in *Fallout 4*. These enemies have a specific mutation: around half their health, they heal completely and gain a new ability, effectively doubling the fight's difficulty. The key to beating them is not to spend all your resources in the first half; instead, wait for that mid-fight transformation before pushing them down.
> 
> Regarding weapons and armor, these enemies drop items with random legendary effects, which are the primary way to obtain great gear. However, if you are playing in **Survival Mode**, be aware that healing mid-fight is a major disadvantage: stimpaks take 50 seconds instead of 5, and they gain weight, meaning you cannot heal easily while engaged.

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Switching from Grand Theft Auto to *Red Dead Redemption 2* is like swapping a high-speed arcade racer for a heavy-duty truck cruise. The core loop changes because the world feels much heavier and slower on purpose. In GTA, you can sprint through a city in seconds; here, Arthur Morgan has significant weight, and turning your horse takes time that requires patience.
> 
> The biggest shift is how law enforcement works. Unlike GTA's bounty system where you just run away, *RDR2* bounties are sticky. A witness who sees your face turns into a permanent wanted level in that specific region. You can't just parkour over the police; they will eventually corner you. If you want to avoid getting caught during an illegal act, cover your face (use a mask or hood) and ride rather than sprint.
> 
> Think of camp not as a quick menu hub like a safe house, but as a place you return to for stability. You need to manage stable upkeep and camp supplies before going on long hunts, as neglecting them can affect your mood and performance in the wild. The game rewards methodical exploration over frantic action sequences.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To raise your Honor score in *Red Dead Redemption 2*, focus on positive interactions and avoid actions that degrade it. Here are the concrete ways to increase it:
> 
> *   **Greet People:** Say hello to NPCs you encounter on the road or in towns.
> *   **Help Strangers:** Assist people in need, such as carrying items for them or helping them escape danger.
> *   **Pay Bounties:** If you are wanted by law enforcement, paying your fine instead of fighting raises Honor.
> *   **Donate to Camp:** Give money or supplies to Arthur Morgan and the gang members at camp.
> 
> Conversely, avoid actions that lower it, such as robbing people, killing innocent civilians, or shooting animals unless they are part of a specific quest objective. Remember, Honor is a gradual slider; one bad day won't ruin your progress, but consistent good deeds will build it up over time.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> I can't spoil your ending here, but I know what you're looking for. In *Red Dead Redemption 2*, Arthur Morgan is the central character who eventually dies as part of the story's tragic conclusion. Since you didn't ask about gameplay mechanics or performance on the Deck, I'll keep this brief and focus on the narrative arc without giving away specific scenes or dialogue.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> That behavior is a direct symptom of your bond level being too low for the current situation. In *Red Dead Redemption 2*, horses don't just ignore you; they actively react to fear based on how well you've trained them. If you ride into danger, shoot at predators, or scare the animal without calming it first, the fear meter spikes. Once that threshold is crossed, your horse will bolt away or throw you off to save itself.
> 
> To fix this, you need to raise the bond level through positive reinforcement: feed it, brush it, and pat it when it's calm. Crucially, if you are riding into a dangerous area, try to keep the horse calm before engaging; high-bond horses handle better and won't panic as easily. Remember, bonding is specific to each mount, so switching horses resets the progress.
> 
> If this happens frequently during combat, consider using Dead Eye to slow down the encounter or taking cover to reduce the stress on your animal.

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *State of Emergency*, your round timer is running down, but you can actually make it go faster by picking up items scattered around the level. Each pickup adds **+15 seconds** to your current round time.
> 
> Think of it like this: a round you successfully extend is often worth more points than just surviving a tough fight without adding extra time. Don't get stuck in one combat encounter if you see those pickups nearby; break off and collect them to boost your clock back up.
> 
> Also, be on the lookout for **late-round rocket enemies**. These appear when the timer gets low and are usually the reason runs end prematurely. If you see one, prioritize it immediately over the surrounding crowd.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> There is a common misconception here: **Kaos Mode** and **Revolution Mode** are not two different modes within a single game. They are entirely separate titles in the *State of Emergency* series.
> 
> Here is the breakdown based on the available data:
> 
> *   **State of Emergency: Kaos Mode**
>     *   **Genre:** Score Attack / Survival against the Clock.
>     *   **Mechanic:** You do not play to survive; you play to extend your time limit by hitting objectives that pop up during the riot in a single zone at a time.
>     *   **Goal:** Accumulate points within a countdown before time runs out.
> 
> *   **State of Emergency: Revolution Mode**
>     *   **Genre:** Story-driven Mission Campaign.
>     *   **Mechanic:** You play through a chain of missions per zone, receiving objectives directly from the resistance characters.
>     *   **Goal:** Unlock characters and progress through the narrative zones to complete the story.
> 
> If you are looking for specific tactics for either game, please clarify which one you need help with.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are likely stuck in the Shadow Temple because many walls, floors, and chests appear "missing" or floating when viewed normally. This is a classic trick of the game's design to hide items and create false barriers. The solution involves using the Lens of Truth, which you obtain from the Lightwood area near the start of the temple.
> 
> Equip the Lens of Truth (press C to toggle it on). When activated, it reveals all invisible objects:
> *   **Invisible Floors:** You can walk across them safely; they are just transparent walls in normal view.
> *   **Hidden Chests:** These will glow and become accessible.
> *   **False Walls:** You can see through solid blocks to find the path forward.
> 
> **Important Tip:** The Lens of Truth drains your magic meter rapidly. Use it in short bursts (e.g., only when you need to cross a gap or locate a chest) rather than leaving it on for long periods. Keep your Green Potions and Fairies ready to refresh your magic between uses.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You've already named the boss, so I can give you the direct strategy without spoilers on other parts of the game. The Volvagia fight in Death Mountain is all about timing and keeping your distance from the lava.
> 
> Here is the core loop to beat it:
> 1.  **Wait for the Head:** Wait until Volvagia rises out of the floor holes. It will be stunned when its head is fully exposed.
> 2.  **Strike Hard:** Hit the head with a heavy attack (like the Megaton Hammer or Biggoron's Sword) to stun it completely.
> 3.  **Slam and Slash:** While it is stunned, slam the ground near its feet to knock it down, then slash at its legs while it is on the ground.
> 4.  **Fly Away:** Once you've damaged it enough, it will fly around the room. Use your Hookshot (if you have it) or simply dodge to keep it from landing and spewing fire again.
> 5.  **Repeat:** Repeat the cycle: wait for it to rise, stun it, knock it down, and slash.
> 
> **Key Tips for Steam Deck/Gamepad:**
> *   **Fire Defense:** Keep a shield equipped (or use the Goron Tunic if you have it) to block the fire attacks that come when it flies or lands.
> *   **Lava Safety:** The edges of the arena are lava. Stay in the center circle where the safe floor is.
> *   **Movement:** If you don't have a Hookshot, keep moving away from Volvagia before it rises so you aren't forced to run into the fire when it lands.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> In *Baldur's Gate 3*, taking a long rest is powerful because it fully restores your spells, hit points, and most abilities. However, it also consumes your camp supplies (food and water). While you can pick up supplies in the world, hoarding rests to save resources often means missing out on story progression, companion scenes, and personal quests that require resting to trigger.
> 
> For specific situations like defending the Goblin Camp against multi-wave attacks, a short rest before the fight is usually better than a full long rest, as it keeps you fresh without burning through your limited camp stockpiles immediately. Sneak Attack damage relies heavily on having an ally next to the target or gaining advantage; if neither is present, that attack will be significantly weaker and less reliable.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For a first run, you need a balanced team covering four core roles: a talker, a healer, a trap/disarm specialist, and damage dealers. A single character often covers two of these roles, so your goal is to ensure the group has healing capabilities at all times; a party with no healers is vulnerable.
> 
> Here is a solid starting lineup based on class synergies:
> *   **The Talker:** Choose either a Bard or a Paladin for their proficiency in conversation and social checks.
> *   **The Healer:** A Cleric or Druid offers strong healing options.
> *   **The Trapper/Disarmer:** A Rogue or Ranger excels at finding, disarming traps, and picking locks.
> *   **The Damage Dealer:** You can rely on the other classes above to cover this, or add a second damage-focused character (like a Fighter or Barbarian) if you need more raw output.
> 
> **Key Mechanics to Remember:**
> *   **Sneak Attack:** This requires either advantage or an ally adjacent to the target. Use stealth as a bonus action and let your melee companion engage first. Height and darkness are also significant bonuses for ranged attacks.
> *   **Inspiration:** Track your background goals; completing actions that match them grants Inspiration, which allows you to reroll failed ability checks (including dialogue failures).
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To maximize your starting cash in *The Sims 4*, focus on activities with the lowest entry barrier and highest per-hour return. Avoid gardening initially as it requires a large lot and long growth cycles. Instead, prioritize **painting** or **writing**.
> 
> Both professions require only one skill to reach mastery and a single object (easel/canvas for painting, typewriter/keyboard for writing). Once your Sim is skilled enough, they can sell these items repeatedly to generate steady income without needing multiple objects on the lot. Ensure you have a cheap starter lot so you save up more capital immediately for this earning tool.
> 
> ```json
> {"tdp_watts": 15, "gpu_clock_mhz": 1600}
> ```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> To recruit more gang members in *Grand Theft Auto: San Andreas*, you need to increase your **Respect** level. Respect is the hidden stat that determines how many recruits (up to 7) you can have, and it directly impacts your ability to hire new members for Grove Street.
> 
> Here are the primary ways to gain Respect:
> *   **Complete Missions:** Finishing gang-related missions is the most reliable method.
> *   **Kill Rivals:** Eliminating rival gang members or police officers boosts your standing.
> *   **Take Territory:** Conquering new areas and displaying gang tags helps solidify your presence.
> *   **Appearance Nudges:** Wearing specific colors (especially green) in Grove Street territory can nudge the stat up.
> 
> Be careful, as Respect falls if you wear the wrong colors at home, kill your own members, or lose turf. Since this involves specific gameplay mechanics and potential spoilers regarding later-game gang dynamics, I will keep the details general unless you ask for a specific walkthrough.
> 
> ```bonsai-spoiler
> Recruitment is tied to the "Respect" meter, which caps at 7 members. It fluctuates based on mission completion, enemy kills, territory control, and visual cues like clothing color relative to your current gang's colors. Losing respect happens if you betray your own crew or lose ground.
> ```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Since you asked about **Margit**, you have consented to know his specific mechanics, so here are the direct steps to defeat him.
> 
> **1. Understand His Pattern**
> Margit has two main phases:
> *   **Phase 1:** He charges at you and then stands still, waiting for you to get close before attacking again.
> *   **Phase 2:** After his health is low, he will charge rapidly without stopping.
> 
> **2. The Core Strategy: Dodge Timing**
> You cannot win this fight by hitting him; you must survive long enough to land a hit.
> *   **Do not attack while he is charging.** He has high damage and will kill you in one hit if you get too close.
> *   **Wait for his "wind-up":** Watch for the slow, deliberate movement where he prepares to strike. This is your opening.
> *   **Dodge Left or Right:** As he begins his attack animation, move laterally (left or right) to avoid the hitbox.
> *   **Counter-Attack:** Once he finishes his charge and stops momentarily, immediately press `X` (or the appropriate attack button) to strike him.
> 
> **3. Managing Stamina on Steam Deck**
> *   Your controller battery is likely draining faster than usual due to the demanding combat. Keep an eye on your stamina bar; if it's low, wait for a safe moment before attacking.
> *   If you are using **DPS (Damage Per Second)** builds or heavy weapons, be extra cautious. Margit can interrupt your wind-up if he charges too fast.
> 
> **4. The Phase Transition**
> *   When his health drops to roughly 1/3, a cutscene will play where he summons two smaller knights. Defeat them quickly.
> *   He will then proceed to **Phase 2**. He will charge much faster and without pausing.
> *   In this phase, you must dodge his attacks *before* they start. There is no "wait for him to stop" moment anymore.
> 
> **5. Final Blow**
> *   Once he is downed in Phase 2, a final cu …

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> It sounds like you're stuck in a cycle of failing against the bosses down there. Since you keep dying, it's usually because you're trying to fight both Theseus and Asterius at once, which is actually the hardest part.
> 
> Most runs go better if you focus on killing Asterius (the bull) first. He telegraphs his long charge, so just sidestep when he comes at you; he gets stuck briefly and is easy to hit. Once he's down, Theseus becomes much more predictable with his ground-marked attacks.
> 
> If you're still struggling, try holding your block button during his rush—it turns a mistake into nothing rather than taking damage—and then follow up immediately with an attack. It sets up a combo that closes the distance and hits hard.
