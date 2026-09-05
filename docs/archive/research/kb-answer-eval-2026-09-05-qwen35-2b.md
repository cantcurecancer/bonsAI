# Knowledge-base answer eval — 2026-09-05 — qwen35-2b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `qwen3.5:2b` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `5.6` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **88.9%** (88/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **0.0%** (0/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **50.0%** (33/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **45.9%** (17/37) | strictest view |

Mean seconds per answer: **3.0**. Mean request payload: **7296.8** bytes. Mean prompt tokens (Ollama prompt_eval): **1548.1**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 0/3 | 4.8 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 1.8 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.8 |
| `A-L4D2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 0/3 | 2.0 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 1/3 | 2.0 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 1/3 | 2.5 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.1 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 1/3 | 1.4 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.4 |
| `A-HADES-01` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 1.4 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 1/3 | 2.3 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 0/3 | 2/3 | 1.8 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.1 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 1.3 |
| `A-CP77-03` | strategy | — | — | — | 0/3 | 0/3 | 1.9 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.1 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.6 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.3 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.3 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 1/3 | 1.9 |
| `A-RDR2-01` | strategy | 3/3 | 2/3 | — | 3/3 | 2/3 | 1.9 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-RDR2-03` | strategy | — | — | — | 0/3 | 3/3 | 1.7 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 5.8 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.5 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 1/3 | 2.1 |
| `A-OOT-02` | strategy | 3/3 | 1/3 | — | 3/3 | 1/3 | 7.4 |
| `A-BG3-01` | strategy | 3/3 | 2/3 | — | 3/3 | 3/3 | 34.3 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-GTASA-01` | speed | 3/3 | 0/3 | — | 3/3 | 3/3 | 2.2 |
| `A-NOCARD-01` | strategy | — | — | — | — | 1/3 | 2.1 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 2.3 |

## Failures worth reading

- **A-DRG-01** sample 1: branch menu missing
- **A-DRG-01** sample 2: branch menu missing
- **A-DRG-01** sample 3: branch menu missing
- **A-DRG-02** sample 1: branch menu missing
- **A-DRG-02** sample 2: branch menu missing
- **A-DRG-02** sample 3: branch menu missing
- **A-L4D2-01** sample 1: missing facts: `open`; branch menu missing
- **A-L4D2-01** sample 2: branch menu missing
- **A-L4D2-01** sample 3: branch menu missing
- **A-L4D2-02** sample 1: branch menu missing
- **A-L4D2-02** sample 2: branch menu missing
- **A-P2-01** sample 2: branch menu missing
- **A-P2-01** sample 3: branch menu missing
- **A-HL2-01** sample 2: branch menu missing
- **A-HL2-01** sample 3: branch menu missing
- **A-HADES-01** sample 3: missing facts: `stygian blade`; branch menu missing
- **A-HADES-02** sample 2: branch menu missing
- **A-HADES-02** sample 3: branch menu missing
- **A-HADES-03** sample 1: spoiler fence missing, one was due; branch menu missing
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-02** sample 1: branch menu missing
- **A-CP77-03** sample 1: spoiler fence missing, one was due; branch menu missing
- **A-CP77-03** sample 2: spoiler fence missing, one was due; branch menu missing
- **A-CP77-03** sample 3: spoiler fence missing, one was due; branch menu missing
- **A-FO4-05** sample 1: missing facts: `twice`; branch menu missing
- **A-FO4-05** sample 3: missing facts: `twice`; branch menu missing
- **A-RDR2-01** sample 3: missing facts: `slow`, `bounty`; branch menu missing
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due
- **A-RDR2-03** sample 3: spoiler fence missing, one was due
- **A-SOE-01** sample 2: branch menu missing
- **A-OOT-01** sample 1: branch menu missing
- **A-OOT-01** sample 3: branch menu missing
- **A-OOT-02** sample 1: branch menu missing
- **A-OOT-02** sample 2: missing facts: `megaton hammer`
- **A-OOT-02** sample 3: missing facts: `megaton hammer`; branch menu missing
- **A-BG3-01** sample 1: missing facts: `companion`
- **A-GTASA-01** sample 1: missing facts: `respect`
- **A-GTASA-01** sample 2: missing facts: `respect`
- **A-GTASA-01** sample 3: missing facts: `respect`
- **A-NOCARD-01** sample 2: branch menu missing
- **A-NOCARD-01** sample 3: branch menu missing

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> The Glyphid Dreadnought is a two-phase boss that will try to overwhelm you with numbers. Here is how to handle them on your Steam Deck:
> 
> **Phase 1: The Lacerator (Chaser)**
> *   **Tactics:** Keep the distance. Do not run into it; it will jump and shoot fireballs. If it gets too close, use a nuke or shield to stop its movement.
> *   **Weak Point:** Focus on the large orange armor plates on its back. These are the easiest targets for your weapons.
> 
> **Phase 2: The Arbalest (Backer)**
> *   **Tactics:** This one stays behind and fires fireballs in a spread pattern. It is much harder to hit than the Lacerator.
> *   **Weak Point:** Its health bar will shrink as it heals while you fight. If both Dreadnoughts are immune to healing, their health bars will drift apart.
> *   **Strategy:** Try to split your fire evenly between them so neither one gets too much damage and starts healing.
> 
> **General Tips:**
> *   **Overclock:** This is a tap-to-define in the UI that tells you how fast your weapons are firing. It's essential for clearing groups quickly.
> *   **Kiting:** Keep moving between waves to avoid getting swarmed.
> *   **Save Nuke/Overclock:** Save these for when you see armor plates opening up or need a break.
> 
> If you hit them and they run away, just keep trying! The key is patience and managing the two phases carefully. Let me know if you want tips on how to handle their specific weak points or what to do if they spawn too many at once.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ❌

> You are likely trying to kill both of them at once with a single shot or blast. The game's specific mechanic for the **Dreadnought Twins** (Lacerator and Arbalest) is that they heal when their health bars separate slightly. If you rush both too fast, they will start healing simultaneously, and your damage output drops because they are now taking less damage from you while recovering.
> 
> Here is how to fix it:
> 1.  **Split the fire:** Aim for each one individually rather than a wide spread that hits both at once.
> 2.  **Wait for separation:** Let them drift apart slightly before striking. This triggers their immunity window where they stop healing and become vulnerable again.
> 3.  **Focus on armor:** Since you can't just "tank" them, use your Overclock or Nuke to break the specific armor plates on each one individually if needed.
> 
> Try aiming for one, wait a moment, then switch targets. If you continue hitting both simultaneously while they are still close together, they will keep healing back up.

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the primary currency that funds your dwarves' weapon upgrades and artifact rerolls, rather than buying gold or crafting materials. You can find it by mining specific resources and collecting it from the Supply Pod. Without nitra, even if you mine enough gold, you cannot afford to upgrade weapons to their max levels.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ❌

> The big Tank is a nightmare, but he's also your main target. Here is how to handle him without getting eaten alive:
> 
> 1.  **Stay Behind the Cover**: He throws concrete chunks at you from a distance. You need cover (rock walls, debris) to stop his projectiles before they hit you. Don't run in front of him; get behind something solid.
> 2.  **Don't Get Stuck**: If he gets close enough to punch or jump on you, don't try to dodge every single hit. He's a brute force character. If he lands a heavy hit that knocks you down, just keep moving and let the rest of the team take him out. Don't get pinned down by his own attacks.
> 3.  **Use Your Team**: The Director stops sending enemies outside the final boss fight. This means you have four guns (or more) against one guy. Coordinate well so the other players can flank him or shoot from angles he can't reach easily.
> 4.  **Watch for the "Puke"**: On harder difficulties, he might spit out a horde of enemies. If you see this, don't run away; stay put and let your teammates handle the swarm while you keep the Tank busy.
> 
> Remember: The goal is to kill him before the horde comes back. Keep him occupied with bullets so he can't get close enough to hurt anyone else!

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> The Witch is a very sensitive creature that doesn't like being startled or overwhelmed by gunfire. Here's what likely happened:
> 
> 1. **She was awakened**: A flashlight beam, a survivor standing too close, or even just the presence of an infected nearby woke her up.
> 2. **You didn't aim at her**: She ignores bullets unless they're directly aimed at her. If you were shooting at other enemies without targeting her, she might have gotten confused and attacked first.
> 3. **She's aggressive once startled**: Once she's awake, she becomes very active—flailing, charging, and attacking whoever she picks. Keep coming close if she charges, but don't stay still or let her get too close to you.
> 
> **Quick tips:**
> - Use a flashlight sparingly; it wakes her up more easily than loud noise.
> - Don't stand right next to her unless necessary.
> - If you're in the area where she's active (like the Temple), be ready to move quickly when she charges.
> 
> Let me know where you are or what happened last, and I can help refine your next move!

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Playing as the Hunter in Left 4 Dead 2 is a high-risk, high-reward role. Unlike the standard player who focuses on survival and healing, you are tasked with eliminating the Straggler to secure the win condition. Since this is a versus match, your strategy must balance aggressive offense against the chaotic defense of other players.
> 
> Here are the core tactics for dominating as the Hunter:
> 
> **1. The Pounce Mechanic (The Core Loop)**
> *   **Distance Matters:** Your damage output scales significantly with distance. A short pounce from close range is weak; a long, high-arc pounce can deal massive damage to the Straggler or even other players if they are in the way.
> *   **Recharge Time:** The Hunter's pounce recharges very quickly (about 3 seconds). Do not hold crouch and wait. Constantly reposition and pounce to maintain pressure. Holding crouch too long allows enemies to breathe and heal, reducing your effectiveness.
> 
> **2. Target Selection: Straggler vs. Group**
> *   **Never Target the Group:** The primary goal is to eliminate the Straggler. If you are near a group of players, move *towards* them but do not engage. Engaging the whole team with one player is inefficient and leaves your health vulnerable.
> *   **The Melee Claw (Horde Damage):** If you must be near a group, move like a common player: melee claw damage reads as "horde damage" until someone checks on you. This means you can tank hits from other players while dealing massive damage to the Straggler.
> 
> **3. Versus Specific Tactics**
> *   **Avoid the Spread:** In versus matches, enemies often spread out to kill you individually. The Hunter must stay close to the center or the main group to maximize pounce range and avoid being hit by ranged attacks from multiple sources.
> *   **Positioning over Surprise:** While surprise …

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Welcome to your handheld gaming session! You've already asked about the **Gels**, so we are good to dive right in without any spoilers. In *Portal 2*, these aren't just random colored blobs; they are essential tools for solving puzzles and moving through levels.
> 
> Here is how they work, broken down simply:
> 
> *   **The Blue Gel (Repulsion):** This is the most common one you'll see. It works like a repulsive force field. If two blue gels face each other, you can bounce between them to climb up walls or floors that are otherwise unreachable. The height you reach depends on how far you drop from where you started falling onto it.
> *   **The Orange Gel (Friction):** This acts as a lubricant. When you slide across surfaces coated in orange gel, friction is removed. This means you can glide smoothly and keep your momentum, allowing you to traverse long distances or navigate tight corridors without getting stuck.
> *   **The White Gel (Portals):** This is a bit more advanced. It allows you to create portals between two surfaces that usually wouldn't work together. However, it has a catch: it won't stick to cubes or turrets. Also, if you spray the cleansing spray on white gel, it disappears and cleanses any portal left behind.
> 
> **Pro Tip:** Don't just use them randomly! Look for lines connecting different colored gels. Often, a blue gel will connect an orange gel to a surface, allowing you to use the orange gel to slide toward the blue one.
> 
> Since you're on your Steam Deck, keep your power management set to "High Performance" while experimenting with these mechanics, as they can be slightly demanding for handheld controllers!
> 
> Here is where we branch next based on what you see:

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are likely on a **beam** or **excursion** path where the funnel acts as a guide. If it's pushing you "the wrong way," check for the **reverse button**. This specific button reverses the excursion direction before you assume the route is closed. Since these funnels pass through portals, they can ferry items like gel and cubes along with you across entire chambers.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're definitely in the Sandtraps chapter where the Combine are using giant blind insects to hunt you down. Since they come out of the sand, stepping off the rocks and onto the open beach is your best bet to get away from them. However, if you see them right on top of you or if you're trapped by a wall of ants, you need to use your **Pheropod** (bugbait). Throw it at an Antlion; they will turn around and swarm whatever you marked as their target.
> 
> If you are near the train station but have already started fighting through Ravenholm, keep moving toward the coast or the tunnels to avoid being overwhelmed by the ants. If you are currently fighting them in a confined space like a bunker, try to break out using the **Pheropod** on your next move.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the **Pheropod** (often called "bugbait") in *Half-Life 2*, you need to first acquire it from the **Antlion Guard**. Here is the process:
> 
> 1.  **Acquire**: Engage with an Antlion and defeat it. Upon death, drop a Pheropod on the ground.
> 2.  **Mark**: Approach the marked location and press the **C button** to mark it.
> 3.  **Reverse**: Once marked, the antlions will reverse their behavior. Throw the Pheropod at them; they will then swarm whatever you have marked nearby.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun in *Half-Life 2* is designed for tactical utility rather than pure destruction, though it offers some surprising versatility. Here's what you can actually pick up and throw:
> 
> ### **Primary Targets**
> - **Enemies**: Most enemies (humanoids, zombies) are fair game. It will not lift most of them, but manhacks, scanners, and heavy hitters like the Hunter-Chopper are viable targets.
> - **Weapons & Equipment**: You can grab guns, ammo cases, grenades, and other items from the environment.
> 
> ### **Secondary Targets**
> - **Environment**: The gun can pick up objects like crates, barrels, and even some environmental hazards (e.g., a fallen ladder or trap mechanism).
> - **Traps**: It can interact with certain traps, such as car traps that reset when hit by an explosive barrel.
> 
> ### **Throw Mechanics & Limitations**
> - **Explosive Barrels**: These hit hardest but are also the most dangerous—be careful not to overuse them.
> - **Sawblades**: Cut zombies apart effectively without needing a full kill.
> - **Radiator Shield**: A held radiator can shield you from damage while walking behind it.
> - **Grenades**: Throw back where they came from, making them useful for crowd control or repositioning.
> 
> ### **Important Notes**
> - **Shields**: If you're holding a shield (like a radiator), the Gravity Gun won't function until you drop it.
> - **Enemy Behavior**: Some enemies resist being lifted if they're too large or heavily armored, so adjust your approach accordingly.
> - **Safety First**: Always test the gun in safe areas first before committing to high-risk throws.
> 
> If you have a specific scenario in mind (e.g., "How do I use this against zombies in Ravenholm?"), feel free to ask!

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The **Stygian Blade** is generally considered the easiest starting weapon, as it has the lowest damage output and requires you to stand inside enemies to hit them. It feels forgiving and allows you to focus on learning the flow of combat without worrying about getting killed quickly. The **Shield of Chaos** is also a very solid choice if you prefer defensive play; holding block turns mistakes into nothing, which can be great for beginners who might miss an attack.
> 
> If you want something with a bit more range or that forces you to stand outside enemies, the **Eternal Spear** is another safe option. However, weapons like the **Twin Fists of Malphon** or the **Heart-Seeking Bow** are harder to start with because they punish you for standing still or require precise positioning.
> 
> Here are your starting options:

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> It sounds like you are hitting a wall with **Theseus**. The strategy guide mentions that these two bosses can be difficult when both are active at once. Since You are running on Steam Deck, your performance should be decent, but let's make sure we maximize your damage output against them.
> 
> Here is the breakdown:
> *   **Asterius (The Bull):** He telegraphs a long charge. If you sidestep him, he gets stuck briefly. Your best play here is to keep him at range and wait for his charge to end.
> *   **Theseus:** He throws his spear periodically and calls down god's power on the ground. This is very predictable. Killing Asterius first is usually better because Theseus alone is easier to handle, but if you must kill both, focus on the "God Power" landing spots before he gets too close.
> 
> Since You are currently stuck in a fight, try these immediate steps:
> 1.  **Stay at Range:** Do not stand still for Asterius's charge. Move around slightly so he can't flank you easily.
> 2.  **Block First:** Use the Shield of Chaos to block his attacks. This turns mistakes into nothing and sets up a rush that closes distance.
> 3.  **Watch the Ground:** When Theseus calls down power, look for the specific spot on the ground marked before it lands.
> 
> If you are getting overwhelmed by the sheer number of hits, remember that blocking is your strongest defense right now. Keep using it to survive until You can land a clean hit.

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ❌

> When you defeat a boss in *Hades*, the game usually pauses and asks if you want to continue. If it keeps going immediately after, one of two things is likely happening:
> 
> 1.  **You haven't reached the "Second Run" checkpoint yet.** The game often has a specific moment where a new run starts automatically after the first boss drop. You might have just killed the final boss but missed that exact trigger to begin your next adventure.
> 2.  **You are in the post-game menu.** Sometimes, if you don't interact with certain NPCs or collect specific items before finishing, the game stays on the victory screen and waits for you to choose an ending (like "The End" or a custom one).
> 
> To help you figure this out, I need a tiny bit more context from your deck:
> 
> *   **Did you see a prompt asking if you want to continue?**
> *   **Are there any NPCs talking to you that say something about continuing the story?**
> *   **What is the last thing you did before hitting "X" or restarting?**
> 
> Once you share these details, I can give you a specific path forward. For now, keep an eye out for a prompt asking if you want to continue your run!

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The **Berserk** operating system is a melee-focused, time-slowing implant that cuts damage taken and prevents your health from dropping below a quarter. It returns up to 25% of your maximum health after every enemy you defeat. Its effects depend on the melee weapon model installed.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> For a fresh start, spreading points evenly is usually the smartest move. It avoids early-game fragility and ensures you can handle both combat and tech tasks without getting stuck on one side too soon.
> 
> **Body:** This boosts your physical stats, making you tougher in melee fights.
> **Reflexes:** Increases reaction speed, helping you dodge attacks and react quickly to enemies.
> **Intelligence:** Gives you the ability to use quickhacks and cyberware, which is great for tech-heavy builds but makes you more vulnerable if a fight goes wrong.
> **Technical Ability:** Helps with crafting and accessing your cyberware inventory during missions.
> 
> Since you're starting fresh, I'd suggest focusing on **Body**, **Reflexes**, and **Technical Ability** first to get a solid foundation before diving into the nerf-heavy Intelligence route.

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ❌ · menu ❌

> I'm not sure if you're playing the standard version or a specific modded variant, as the ending depends heavily on your choices and whether mods are installed. However, the core narrative arc generally revolves around finding the "Ethereal" and deciding its fate for humanity. Since I can't see your screenshots to pinpoint your exact location in the game, let's start with a general overview of where you might be.
> 
> Are you currently exploring the **Neon District**, trying to find the **Ethereal**, or perhaps stuck near the **San Fongus** area? If you're at a specific spot and want to know how your current path leads to the end, tell me more about what you see in your gamepad view!

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To defeat Adam Smasher, prioritize high-damage builds that utilize Sandevistan or rapid DPS. His legs are weak points; destroy them first to reduce his movement speed and health pool. During the rocket barrages, cover your character while he attacks. Since this is a boss fight without story spoilers, here are the core tactics:
> 
> 1.  **Positioning**: Stay close to him but maintain distance from his projectiles.
> 2.  **Damage Source**: Use weapons with high DPS or Sandevistan-enhanced builds to overwhelm his health over time.
> 3.  **Timing**: Focus fire on his legs while he is vulnerable; avoid getting caught in the mid-air rocket barrage unless necessary.
> 
> If you need a specific weapon recommendation, I can provide details based on your character's build and inventory.

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since I can't see your specific screenshot, let's look at the mechanics we know. The Deathclaw is tough—it has high health and hides behind cover or rocks. Early game means you want to avoid getting hit while it's charging its energy.
> 
> Your best early strategy depends on what you have:
> 1.  **If you have a Shotgun:** It's your go-to. Aim for the head first, but be ready to dodge if it throws cars at you. Keep distance until it's low enough to grab.
> 2.  **If you don't have a gun:** You need a melee weapon (like a pickaxe or axe). This is risky; if it grabs you, you die fast. Use the "Grab" button quickly before it finishes charging.
> 
> To branch your path:

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are starting with **one** point in every SPECIAL stat (Strength, Perception, Endurance, Intelligence, Charisma) and **21** total points to spend. This means you have 28 points across all five stats. Since this is your first level-up opportunity, the specific choice here sets the foundation for your entire character build.
> 
> Here are the primary paths based on how you want to play:
> 
> *   **The Survivalist:** Focuses on taking damage and getting back up.
>     *   **Strength + Endurance:** You can swing heavy weapons (like the Big Bertha) and take hits without dying immediately. This builds a tanky character who is reliable but slower.
>     *   **Perception:** Allows you to see enemies further away before they shoot, giving you an edge in V.A.T.S. combat.
> 
> *   **The Sniper:** Prioritizes accuracy over damage output.
>     *   **Agility + Perception:** You are fast and can spot targets from a distance before shooting them. This is the classic "sniper" build that relies on precision rather than raw power.
> 
> *   **The Support/Leader:** Focuses on managing settlements and social interactions.
>     *   **Charisma:** While it feels weak early on, this stat unlocks unique perks (like speech skills or settlement management) later in the game that other builds cannot access.
> 
> **My Recommendation:**
> Since you have 21 points left after your first level-up, you have plenty of room to build a hybrid or focus heavily on one area. If you want to be versatile from day one, consider swapping **Intelligence** (which boosts leveling speed) with **Strength** or **Perception**, depending on whether you prefer melee combat or ranged sniping.

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Feral Ghouls are fast, irradiated former humans who often attack in packs. Their head is your best target; removing one arm or leg stops the attack entirely. Since they lie among rubble and climb through ductwork, you may find them hiding in places that look clear. They also deal radiation damage alongside physical hits, so keep distance and aim for the head to prevent regeneration in irradiated areas like the Glowing Sea.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> You can repair your power armor at a Power Armor Station in any settlement, or build a custom frame there if you have the materials. Since it's stopped working, first check if the **Fusion Core** is empty; when that drains, you lose V.A.T.S., aim stability, and steady movement, making combat much harder. If the core isn't empty but the armor still won't engage, try a **Power Armor Station** repair or build a new frame with available materials. Note that upgrading later models costs rare materials, so consider waiting until your Armorer and Science ranks are high to save resources.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ❌

> That sounds like exactly what you're dealing with. In *Fallout 4*, these are **Legendary enemies** marked by a star next to their name (like the **Rampaging Golem**, **Berserker**, or **Radiation Beast**). They have a massive health bar, but something weird happens: when they get hit enough times, they stop taking damage and start healing themselves right back up.
> 
> This is a classic "traps" moment. If you keep shooting them until they are completely dead, they will instantly recover and come back stronger than before. The smart play here is to **break contact** immediately—use cover or an item like a stimpak (which takes 50 seconds to work) to stop the healing process while you land a few hits. If you let them get too close, they'll be back at full health and your next shot might not even register as damage.
> 
> Since you mentioned it happened "in the middle of the fight," you might have been running out of ammo or getting low on resources before realizing the enemy was resetting. Did you manage to stop the healing with cover or a specific item?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you mentioned coming from *Grand Theft Auto*, that means Arthur Morgan has a lot of weight on his shoulders. In this game, time moves differently: horses take longer to turn, picking up items involves an animation, and shooting your way through a town only works for about 90 seconds before the law arrives.
> 
> Here are some tips based on how the world reacts to you:
> *   **Cover Your Face:** If you do something illegal, cover your face immediately so witnesses don't see your face and turn into bounties.
> *   **Ride Rather Than Sprint:** Don't try to outrun the law by running; riding is safer and usually more efficient.
> *   **Treat Camp as Base:** Return to your camp when you need to rest rather than treating it just like a menu item.
> *   **Bounty Management:** Bounties stay in the region they were earned in. If you leave, lawmen keep coming. Paying off bounties at post offices is essential.
> 
> You are currently in the **Valentine** area. Honor missions affect town mood, so make sure to maintain supplies and stable upkeep before long hunts.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Raising Honor is a gradual process driven by your daily choices rather than a single action. It's best viewed as a "small things done often" metric that shifts how the world reacts to you.
> 
> **Core Mechanics:**
> *   **The Slider:** Honor is a continuous slider, not a binary switch. One bad day (like getting robbed) won't erase your good chapter of kindness.
> *   **Sources:** You gain Honor by helping strangers, paying bounties instead of running, donating to camp, and greeting people. Conversely, you lose it through robbery or killing civilians/animals you don't use.
> 
> **Tactics to Raise Honor:**
> 1.  **Greeting People:** Always say hello to NPCs; a simple "Hello" can boost your score.
> 2.  **Pay Bounties:** If an NPC is on the run and has been marked for death, paying them their bounty instead of killing them restores Honor.
> 3.  **Donation:** Donating to camp or charity events increases your Honor.
> 4.  **Avoid Robbery:** Stealing from civilians is a major Honor killer.
> 
> **Note:** If you accidentally drop a lot of Honor (e.g., during a heist), you can regain it by completing a mission where the gang members are on the run and you pay them their bounties.
> 
> If you need specific mission details or boss names, I will only reveal those if you explicitly ask about them. Otherwise, focus on daily kindness to climb the bar.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> Arthur is treated as a fully realized character, not just a plot device. Unlike many games where the protagonist dies at the climax, in RDR2 he can choose to live on and lead his own life after the story concludes. He has agency over his fate, which allows for multiple distinct endings depending on how you handle his relationship with the world and your choices throughout the game.
> 
> The specific outcome depends heavily on whether you let Arthur go free, keep him in custody, or find a way to save him from the lawmen who hunt him relentlessly. Each path offers a different flavor of freedom and consequences for the remaining characters.

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're dealing with a classic bonding problem. In *Red Dead Redemption 2*, horses only stay mounted when their bond level is high enough to handle the stress of riding or danger. If your horse keeps throwing you off, it means the current bond level is too low for whatever activity you're doing right now.
> 
> Here’s how to fix it:
> - **Bond Level**: Each bonding action (riding, feeding, brushing, patting, calming during danger) raises the bond by 1–2%. A high-bond horse won't throw you off; a low-bond one will.
> - **Immediate Fix**: Whistle at your horse from a distance to calm it down and raise the bond while still mounted. If they're too stressed to respond, dismount briefly, feed them, or brush them to boost bonding without needing to stay on.
> - **Prevention**: Keep horses fed and calm before riding. Bonding is per horse—switching mounts resets the bond counter.
> 
> If your horse refuses to mount despite high bonding, try waiting 2–3 minutes after a calming action before attempting to ride again. The game often requires patience for the bond to stabilize.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Getting more time in a round is all about knowing when to stop fighting and start running, especially since pickups add +15 seconds each. The most important thing is recognizing the difference between "extending" a round (which costs you more time) and finishing it quickly.
> 
> Here are the key tactics:
> *   **Identify the Priority Target:** Late in a round, enemies with rocket launchers appear. These are the most dangerous and should be your immediate priority, regardless of what crowd you are fighting. Treat them as the main target ahead of anything else.
> *   **Know When to Break Off:** A round you extend is worth more than a crowd you finish. If you see a safe, open area or a path away from the enemies, break off immediately rather than staying in the fight. This prevents you from wasting valuable time on an extended round.
> *   **Pickup Management:** Keep your eyes on pickups scattered around. Since each adds 15 seconds, aim to collect them while moving through the level to maximize your total time before the timer runs out.
> 
> Remember, the other thing new players often get wrong is thinking that staying in a fight guarantees you win. Sometimes going for time is actually the better strategy.

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos Mode is a high-speed, score-based survival rhythm game where you extend your time by hitting specific objectives that pop up mid-riot. You play in one zone at a time, focusing on timing hits to survive the clock.
> 
> Revolution Mode is the story-driven campaign where you complete a chain of missions per zone with objectives handed out by the resistance. This mode unlocks characters and zones.
> 
> Since these are two distinct games, there is no direct gameplay comparison between them as they belong to different franchises.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> You've hit a crucial part of Ocarina of Time where the environment seems broken, but it's actually designed to be solved with specific tools. Since you're in the **Shadow Temple**, your immediate goal is to see those missing walls and floors come back into view.
> 
> Here's what to do:
> 1.  **Equip the Lens of Truth**: This item is essential for seeing through invisible surfaces. If you don't have it, pick one up from a nearby shrine or fairy.
> 2.  **Use the Invisible Floors**: Once equipped, walk around the temple. The walls and floors will appear solid even if they look like cracks or gaps in the screen.
> 3.  **Check the Chests**: Many of these "missing" areas contain chests that hold the tools needed for later bosses (like the Megaton Hammer).
> 
> **Branching Question:**
> Where are you currently standing in the temple?
> *   a) Near a fairy or shrine where I can equip the Lens of Truth.
> *   b) Walking around looking at empty gaps, unsure if they're just broken.
> *   c) Trying to open a chest but the floor beneath it is invisible.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ❌

> You are currently facing the fire dragon boss in the final dungeon of *The Legend of Zelda: Ocarina of Time*. This is a critical encounter, so let's get straight to the mechanics.
> 
> To defeat Volvagia, you need the **Megaton Hammer**. Here is your battle plan:
> 1.  **Get the Megaton Hammer**: You must have this item equipped before entering the room where Volvagia appears. If you don't have it yet, head back to Kakariko Town and purchase it from Goron Tunic for 80 Rupees (or find it in a merchant's shop).
> 2.  **Positioning**: When Volvagia pops up from the floor, she will fly around the room while her eyes glow red. She has two main attacks:
>     *   **Head Smash**: A big hitbox on top of you that knocks you back and stuns her for a few seconds. This is your best attack.
>     *   **Hookshot**: If she flies away, use the hookshot to pull her back down into the room so you can hit her head again.
> 3.  **The Combo**: As soon as she comes up, slam the Megaton Hammer on her head. She will be stunned and fall to the ground. While she is stunned, you can slash at her body or legs for extra damage.
> 
> **Important Tips:**
> *   Don't get hit by the hookshot; it pulls you back into danger.
> *   Keep your shield up if she tries to attack with a fireball (though usually, just dodging the hookshot is enough).
> *   If you run out of Megaton Hammer, you can buy another one at Goron Tunic for 80 Rupees later in the game.
> 
> Once Volvagia dies, you will reach the end of the dungeon and unlock the final area. Good luck!

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Long rests are a core loop in *Baldur's Gate 3*, so let's break down when you actually need them versus when you can skip them. Think of it like a fuel tank: if you're driving slowly, you don't need to top up constantly, but if you hit a steep hill or run out of gas, you'll crash.
> 
> Here is the general rule for your current playstyle:
> *   **Skip Long Rests:** Unless you are in a dangerous encounter (like a Goblin Camp) or have just fought a major boss and need to heal spells/ability levels, try to avoid them if possible. They cost camp supplies and food, which are plentiful.
> *   **Rest More Often:** You should prioritize short rests (10 minutes) after every combat session, especially if you are on the edge of your health bar or have low mana. This keeps your spells active without breaking the flow.
> 
> **Specific Context for Steam Deck:**
> If you're playing on a handheld, keep an eye on battery life. Long rests can be tiring to maintain while walking around, so mixing them with short rests often gives you better stamina management than just one long rest per day.
> 
> Since I don't have your specific screenshot or save state, here are two likely scenarios for your current playthrough:
> 1.  **Safe Zone:** If you are in a quiet area and haven't fought much recently, it's okay to skip the long rest.
> 2.  **Danger Zone:** If you just came back from a fight with enemies nearby or have low health, a short rest is highly recommended.

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For your first run in *Baldur's Gate 3*, the most reliable and flexible approach is to build around **two versatile support/versatile damage roles** rather than trying to fill every single slot perfectly. Since you're new, focus on mechanics that scale well with playstyle choices (like choosing a background) and prioritize survival over maxing stats immediately.
> 
> Here is a solid starting configuration:
> *   **Healer:** Cleric or Druid are the safest bets for healing. They have reliable healing spells and generally don't require complex equipment setups to be effective early on.
> *   **Versatile Damage/Utility:** A Bard or Paladin excels at talking, finding loot, and dealing damage. If you want a dedicated damage dealer, a Rogue with Sneak Attack is the classic choice, though they need an ally nearby for critical hits.
> 
> **Key Strategy Tips for Beginners:**
> 1.  **Backgrounds Matter:** Your character's background determines their "Inspiration" pool. Choosing backgrounds that align with your playstyle (e.g., a Bard who likes talking to NPCs) keeps you inspired longer and prevents failed checks in dialogue or combat.
> 2.  **Stealth is Key:** Rogues rely heavily on hiding. Ensure you have an ally close enough to trigger Sneak Attack while you hide, as attacks without advantage are significantly weaker.
> 3.  **Rest Strategy:** Goblin camps require short rests before engaging multiple waves. Plan your downtime carefully to maintain health and morale.
> 
> If you feel the current setup is too weak or too strong for your preferred playstyle, we can adjust the roles (e.g., swapping a healer for an archer) based on what feels right in the game's world.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Early game earnings in *The Sims 4* are best achieved through low-effort, high-skill activities. Since you're asking for the fastest route, focus on these mechanics:
> 
> 1.  **Painting**: This is the most efficient method. It requires only one skill (painting) and one object (a brush). As your painting level increases, the amount of money earned per hour grows significantly. You can start earning immediately after purchasing a basic lot and buying a good-quality paintbrush.
> 2.  **Gardening**: This is slower to start but scales harder later. It requires planting seeds and watering them. While it yields more money over time, the initial rate is lower compared to painting.
> 3.  **Selling Collectibles**: This funds the very early game but does not fund your lot for long-term growth. A cheap starter lot is crucial here; selling rare items quickly can help buy a better lot faster than painting alone.
> 
> **Key Strategy**: Prioritize buying a good brush and starting to paint immediately upon purchasing your first lot. This creates the fastest initial cash flow without needing complex setups or multiple skills.
> 
> ```json
> {"tdp_watts": null, "gpu_clock_mhz": null}
> ```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> Recruiting gang members is a core mechanic in *Grand Theft Auto: San Andreas - The Definitive Edition* that affects your local police presence and territory control. Here's the breakdown based on game logic:
> 
> **Core Mechanic:**
> Your maximum recruit count starts at **1** and can increase up to **7**. This number determines how many gang members you can have in your city simultaneously.
> 
> **Factors Influencing Recruitment:**
> *   **Mission Completion:** Completing specific missions often grants recruitment bonuses or unlocks new areas.
> *   **Rival Gang Interactions:** Killing rival gang members or engaging with them can sometimes trigger recruitment opportunities.
> *   **Territory Control:** Taking over territory and spraying tags in Grove Street (the main city area) is highly effective for boosting your recruit count, especially if you wear green clothing there.
> *   **Appearance & Lifestyle:** Wearing specific colors, having high muscle mass, or wearing tattoos can influence the system.
> *   **Home Appearance:** Dressing correctly at home helps maintain recruitment levels; incorrect attire may cause a drop.
> 
> **Important Note on Spoilers:**
> The exact sequence of events and hidden triggers for recruitment is often not explicitly scripted in the main narrative, so details like specific mission names or unique NPC interactions might be spoilers. The general flow above covers the standard gameplay experience.
> 
> If you need more specific plot points or boss info, I can provide that within spoiler constraints.

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> Margit is a terrifying, fast-moving boss known for his "Dance of the Waterfowl." His primary weakness is that he cannot be hit while dancing. He also has a very specific attack pattern: he will charge forward, then backpedal and swing his sword wildly in a circle before stopping. If you dodge his initial charge, he will immediately start swinging at you from all sides.
> 
> Since you are on the Steam Deck, here is a simple approach:
> 1.  **Dodge the first charge:** Keep moving left or right to avoid the forward rush. Do not try to block; just get out of the way.
> 2.  **Block his swings:** Once he stops dancing, he will swing wildly. Use your shield (if you have one) or a block to hit him while he is stopped.
> 3.  **Use your sword:** If you can't block well, try to strike him with your blade when he is stationary.
> 
> If you are using the *Shadows of Al Bhed* DLC on the same game, Margit has an extra move where he shoots water from his hands while dancing. If you have a *Waterfowl* item or weapon, use it to hit him during his dance sequence. If not, just focus on dodging and blocking when he stops.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> That sounds like a tough spot! The Tartarus dungeon is notoriously punishing, especially if you're struggling with the boss fights. Since you mentioned keeping dying, we need to look at your current gear and approach.
> 
> Here are two distinct paths forward based on how you're performing:
