# Knowledge-base answer eval — 2026-09-05 — gemma4-e4b

What the Deck's model writes **from** the cards, scored without a judge model. Run by `scripts/eval_kb_answers.py`; the fixture is `tests/fixtures/kb_answer_eval.json` (decision D45, plan 30 W1). Rates are over samples at the shipped temperature, so one run moving a point or two is noise; a check moving ten points is a finding.

| Setting | Value |
|---|---|
| model | `gemma4:e4b-it-qat` |
| ollama | `http://127.0.0.1:11434` |
| corpus_version | `2026.09.01` |
| corpus_sections | `161` |
| prompt_variant | `baseline` |
| samples_per_case | `3` |
| cases | `37` |
| run_minutes | `4.0` |

## Summary

| Check | Rate | Meaning |
|---|---|---|
| Facts kept | **98.0%** (97/99) | every must-mention group found in the reply |
| No contradiction | **100.0%** (9/9) | nothing from the must-not-say list appeared |
| Fence not misfired | **100.0%** (96/96) | no spoiler fence where none was due |
| Fence present when due | **22.2%** (2/9) | a fence appeared on a story-beat question |
| Branch menu on Strategy first turn | **98.5%** (65/66) | the parser accepted a bonsai-strategy-branches fence |
| No menu on Speed/Expert | **100.0%** (45/45) | no stray menu outside Strategy |
| Expected card attached | **100.0%** (99/99) | retrieval, not the model: the named card was in the block |
| Control: nothing attached | **n/a** (n/a) | uncovered-game control |
| Ask succeeded | **100.0%** (111/111) | pipeline returned a reply |
| Cases with every sample clean | **86.5%** (32/37) | strictest view |

Mean seconds per answer: **2.2**. Mean request payload: **7318.9** bytes. Mean prompt tokens (Ollama prompt_eval): **1567.5**.

## Per case

| Case | Mode | Card attached | Facts | No contradiction | Fence ok | Menu ok | s/answer |
|---|---|---|---|---|---|---|---|
| `A-DRG-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.8 |
| `A-DRG-02` | strategy | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.5 |
| `A-DRG-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-L4D2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.5 |
| `A-L4D2-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-L4D2-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.8 |
| `A-P2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-P2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.0 |
| `A-HL2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-HL2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 0.7 |
| `A-HL2-03` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-HADES-01` | strategy | 3/3 | 3/3 | — | 3/3 | 2/3 | 2.4 |
| `A-HADES-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.7 |
| `A-HADES-03` | strategy | 3/3 | 3/3 | — | 0/3 | 3/3 | 2.0 |
| `A-CP77-01` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1.1 |
| `A-CP77-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 3.4 |
| `A-CP77-03` | strategy | — | — | — | 1/3 | 3/3 | 4.1 |
| `A-CP77-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-FO4-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.3 |
| `A-FO4-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 5.2 |
| `A-FO4-03` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-FO4-04` | expert | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2.1 |
| `A-FO4-05` | strategy | 3/3 | 1/3 | — | 3/3 | 3/3 | 2.3 |
| `A-RDR2-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.8 |
| `A-RDR2-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.4 |
| `A-RDR2-03` | strategy | — | — | — | 1/3 | 3/3 | 1.8 |
| `A-RDR2-04` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.6 |
| `A-SOE-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SOE-02` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.2 |
| `A-OOT-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-OOT-02` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-BG3-01` | strategy | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.7 |
| `A-BG3-02` | expert | 3/3 | 3/3 | — | 3/3 | 3/3 | 2.0 |
| `A-SIMS4-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.1 |
| `A-GTASA-01` | speed | 3/3 | 3/3 | — | 3/3 | 3/3 | 1.9 |
| `A-NOCARD-01` | strategy | — | — | — | — | 3/3 | 2.8 |
| `A-VAGUE-01` | strategy | — | — | — | — | 3/3 | 2.2 |

## Failures worth reading

- **A-HADES-01** sample 2: branch menu missing
- **A-HADES-03** sample 1: spoiler fence missing, one was due
- **A-HADES-03** sample 2: spoiler fence missing, one was due
- **A-HADES-03** sample 3: spoiler fence missing, one was due
- **A-CP77-03** sample 2: spoiler fence missing, one was due
- **A-CP77-03** sample 3: spoiler fence missing, one was due
- **A-FO4-05** sample 1: missing facts: `twice`
- **A-FO4-05** sample 3: missing facts: `twice`
- **A-RDR2-03** sample 1: spoiler fence missing, one was due
- **A-RDR2-03** sample 2: spoiler fence missing, one was due

## One reply per case (sample 1, trimmed to 1,800 characters)

The full text of every sample, plus the system prompt each case received, is in the JSON next to this report.

### A-DRG-01 — Deep Rock Galactic: Survivor — strategy

**Q:** how do i beat the glyphid dreadnought  
**Cards:** Glyphid Dreadnought, Dreadnought Twins, Exploder  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You're facing the Glyphid Dreadnought, which is a tough encounter. Here is the general strategy:
> 
> *   **Kite between waves:** Keep moving to manage the incoming threats.
> *   **Focus weak-point armor plates:** Target these specific areas as they open up.
> *   **Save your big moves:** Hold off on using your overclock or nuke until you have a clear window to break the armor.
> 
> The Dreadnought is durable, so patience and precise targeting are key.

### A-DRG-02 — Deep Rock Galactic: Survivor — strategy

**Q:** the dreadnought twins keep healing back up, what am i doing wrong  
**Cards:** Dreadnought Twins, Glyphid Dreadnought, Red Sugar  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Dreadnought Twins are designed to heal if you let their health bars drift apart while they are actively repairing the gap.
> 
> Here is the breakdown of the issue and how to manage them:
> 
> *   **Split Fire:** Do not focus all your damage on just one twin. You need to split your fire evenly between both targets.
> *   **The Healing Trigger:** The healing mechanic activates when the health bars of the two twins begin to drift apart.
> *   **The Fix:** Keep them both under pressure simultaneously. If you burn one down completely, the other one will likely start its healing phase to close the gap. Keep the damage balanced so they are both constantly being pressured.
> 
> Do you want to focus on improving your damage output, or should we look at strategies for managing the waves leading up to this fight?

### A-DRG-03 — Deep Rock Galactic: Survivor — expert

**Q:** what is nitra actually for  
**Cards:** Nitra  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Nitra is the resource used to purchase weapon upgrades and reroll artifact choices.
> 
> Here is a breakdown of its uses:
> *   **Weapon Upgrades:** It is spent at the between-stage shop to buy weapon upgrade cards.
> *   **Artifact Rerolls:** It allows you to reroll the artifact selection from the Supply Pod.
> 
> Keep in mind that Nitra is distinct from Gold; while Gold is mined, Nitra is what directly improves your gear. If you run out of Nitra, your weapons will remain at a lower level even if you have plenty of Gold.
> 
> ```bonsai-cite fallback_no_source```
> Nitra is the resource that pays for weapons rather than for your dwarf.
> ```

### A-L4D2-01 — Left 4 Dead 2 — strategy

**Q:** how to beat tank  
**Cards:** Playing as the Tank, Tank, Boomer  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Tank is the big, slow infected that throws chunks of concrete at you. Here is the general approach to dealing with it:
> 
> First, try to fight it in an open area. If you are in a tight space, the Tank can use its powerful punches, and those punches can become projectiles with more reach than its fists. If you get punched near a drop, you might die instantly instead of just being knocked down.
> 
> When engaging, remember that while the Tank is active, the game stops sending out regular infected and specials outside of finales, meaning you are often facing four guns against one target. However, if you slip past the Tank, the horde will immediately come back at you.
> 
> For positioning, try to keep the Tank moving. If the route forces it to crouch through a vent, it becomes barely mobile, and it will never try to find another way around.

### A-L4D2-02 — Left 4 Dead 2 — strategy

**Q:** why did the witch suddenly attack me  
**Cards:** The Witch, Jockey, Bile bomb  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Witch usually attacks if you startle her or get too close. She ignores gunfire unless it's aimed directly at her, and she ignores other infected unless she's provoked. If you light her up with a flashlight or get within arm's reach, she gets agitated. If she growls, she's warning you to back off. If you keep coming, she'll charge you and take you out quickly.
> 
> How are you handling the Witch right now?

### A-L4D2-03 — Left 4 Dead 2 — speed

**Q:** tips for playing as the hunter in versus  
**Cards:** Playing as the Hunter  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To play effectively as the Hunter in Versus, focus on maximizing your pounce damage and positioning.
> 
> Here are some tips:
> 
> *   **Target Wisely:** Always prioritize taking the straggler rather than engaging the main group.
> *   **Maximize Damage:** Pounce damage scales with distance; aim for long pounces, as a single well-placed one can deal up to 25 damage. This means height and a run-up are more important than just surprise.
> *   **Sustain Pressure:** The pounce recharges quickly. You can maintain pressure by holding crouch and repeatedly pouncing.
> *   **Ambiguity is Key:** If you must be near the horde, move discreetly. Your melee claw attacks read as general horde damage until someone specifically checks on you.
> 
> ```bonsai-cite wiki_no_patch "Left 4 Dead 2 / mechanic: Playing as the Hunter"```

### A-P2-01 — Portal 2 — strategy

**Q:** how do the gels work  
**Cards:** Repulsion Gel, Gels, Wheatley  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The gels are three different paints that change how surfaces behave when you use portals. Keep in mind that all three are useless on glass surfaces.
> 
> Here is what each one does:
> 
> *   **Blue Gel:** This gel makes you bounce higher. The height of the bounce depends on how far you fall onto it; you gain height by falling from a higher point, not just by jumping onto it. If you have two surfaces coated with this gel facing each other, you can bounce between them to climb.
> *   **Orange Gel:** This gel removes friction. This means that whatever speed you arrive at when you hit a surface coated with this gel, you will maintain that speed.
> *   **White Gel:** This gel allows you to portal onto a surface that normally wouldn't accept portals. However, it won't stick to cubes or turrets, and the cleansing spray will remove it.

### A-P2-02 — Portal 2 — speed

**Q:** the excursion funnel keeps pushing me the wrong way  
**Cards:** Excursion Funnel  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> If the Excursion Funnel is carrying you in the incorrect direction, look for the button that allows you to reverse its travel. Do not assume the route is completely blocked just because it's moving the wrong way; the Funnel can pass through portals and ferry cubes and gel as well as you.
> 
> ```bonsai-cite wiki_no_patch```

### A-HL2-01 — Half-Life 2 — strategy

**Q:** the antlions keep coming up out of the sand and killing me  
**Cards:** Antlions, Sandtraps, Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Antlions are blind, so they hunt by sensing vibrations. If you are in a sandy area, you need to be very careful where you step.
> 
> To stay safe from them, try to stay on solid ground or rocks if you are near the coast. If you step into the sand, they will likely come up to attack.
> 
> If you have the pheropod item, you can use it to trick them into attacking something else you mark.

### A-HL2-02 — Half-Life 2 — speed

**Q:** how do i use the bugbait  
**Cards:** Pheropod (bugbait)  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To use the pheropod, which is the bugbait, you throw it. When thrown, the antlions will read you as a guard and swarm whatever you marked.

### A-HL2-03 — Half-Life 2 — expert

**Q:** what can the gravity gun actually pick up and throw  
**Cards:** Gravity Gun, Ravenholm, Rocket-Propelled Grenade Launcher, Hunter-Chopper (helicopter), Combine soldiers  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The Gravity Gun can handle a variety of objects. For secondary uses, you can use it for secondary pulls and holds, while for primary use, it functions as a punter. Explosive barrels are effective when thrown, and sawblades can be used to cut through zombies. Additionally, a held radiator can be used as a shield that you can walk behind. It generally will not lift most enemies, but manhacks and scanners are things it can pick up and throw. Thrown grenades can also be sent back to their point of origin.

### A-HADES-01 — Hades — strategy

**Q:** which weapon is easiest to start with  
**Cards:** Weapon choice, Weapon aspects, Twin Fists of Malphon  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're asking about the easiest weapon to start with, I'll give you the general consensus on the initial choices. I'll keep this spoiler-minimized, focusing only on early-game mechanics.
> 
> The Stygian Blade is generally considered the most forgiving weapon to start with because it requires the least amount of precise movement or setup from you to be effective. If you're new to the combat, it lets you focus more on dodging and understanding enemy patterns rather than mastering complex attack chains. The Shield of Chaos is also a solid early pick because its defensive nature can turn a mistake into a non-issue, which is helpful while you're still learning the flow of combat.
> 
> If you prefer a slightly safer option that keeps you at a distance, the Eternal Spear is worth looking into early on as its reach can help keep enemies from getting too close.
> 
> I'll leave the Twin Fists of Malphon for later; they are incredibly fast but demand you be right in the thick of the action.
> 
> Which aspect of the combat are you finding most challenging right now?

### A-HADES-02 — Hades — strategy

**Q:** theseus and asterius keep killing me  
**Cards:** Theseus and Asterius, Shield of Chaos, Adamant Rail  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Dealing with Theseus and Asterius requires managing two different threats at once. To make things simpler, try focusing on taking out Asterius first. He telegraph his big charge with a long wind-up, so sidestepping it will leave him vulnerable for a moment. Theseus is more erratic, but his attacks often have a visible marker on the ground before they hit, which helps you know when to dodge.
> 
> If you are struggling with survivability, consider equipping the Shield of Chaos. It allows you to turn a mistake into a block instead of taking damage, and it also lets you close the distance quickly once you've blocked.
> 
> Which aspect of the fight is giving you the most trouble right now?

### A-HADES-03 — Hades — strategy

**Q:** i beat the final boss but the game just keeps going, is that the ending?  
**Cards:** Heat and the Pact of Punishment, Theseus and Asterius, Shield of Chaos  
**Checks:** facts ✅ · contradiction — · fence ❌ · menu ✅

> The game continuing after the final boss isn't necessarily the definitive end; it's more about progression. In this game, beating the main challenges usually unlocks further story paths and deeper mechanics. If you've reached the end of the current major arc, there are usually more ways to continue the journey, often involving increased difficulty or new objectives.
> 
> If you are looking to see more of the narrative or challenge yourself further, you might want to look into increasing the difficulty or exploring optional content.

### A-CP77-01 — Cyberpunk 2077 — expert

**Q:** what does the berserk operating system do  
**Cards:** Berserk, Sandevistan, Quickhacks, Cyberpsychos, Ripperdocs  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> The Berserk operating system is a melee-focused OS that ignores the concept of time. When active, it reduces the damage you take and prevents your health from dropping below a quarter of your maximum health. Additionally, every enemy you put down while using it will return a quarter of your maximum health to you. Its specific effects with melee weapons depend on the model you have installed.

### A-CP77-02 — Cyberpunk 2077 — strategy

**Q:** which attributes should i put points into for a first playthrough  
**Cards:** Choosing a build, Lifepath, Berserk  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since this is your first run, you need a solid foundation that allows you to survive while building up your character. The attributes you choose early on are more important than the perks you take immediately after.
> 
> For a general, straightforward fighter who can forgive early mistakes, focusing on **Body** and **Reflexes** is a reliable starting point. These two attributes make for a solid melee and combat build.
> 
> If you prefer a more technical or stealth-oriented approach, **Intelligence** is the route for a Netrunner. This allows you to use quickhacks to handle situations before they become direct combat encounters, but be aware that you will be very fragile if things go south in a fight.
> 
> A useful tip is to invest a small amount of points into **Technical Ability** regardless of your main focus. This attribute quietly helps almost every build by unlocking the crafting recipes and cyberware that you'll actually want to use later on.
> 
> Avoid spreading points evenly across all attributes; this usually results in a build that doesn't excel at anything specific because the best perks are gated behind specific attribute thresholds.
> 
> Which style of character are you leaning toward for your initial playthrough?

### A-CP77-03 — Cyberpunk 2077 — strategy

**Q:** how does the main story end  
**Cards:** Lifepath  
**Checks:** facts — · contradiction — · fence ✅ · menu ✅

> The main story ending in Cyberpunk 2077 is heavily dependent on your choices, relationships, and the specific Lifepath you chose (Nomad, Streetkid, or Corpo). There isn't a single, fixed ending; rather, there are several major conclusions based on how you navigate the game's narrative.
> 
> Since you are asking about the ending, I must provide a warning: discussing the conclusions of the main story involves significant spoilers for the entire game.
> 
> ```bonsai-spoiler
> The primary narrative conclusion revolves around your relationship with Johnny Silverhand and the fate of the city and your own existence. The specific ending you achieve is tied to your final major decisions, particularly concerning your connections and the outcome of key missions.
> ```
> 
> To give you relevant advice, I need to know where you are in the game. Are you just starting out, or are you deep into the final acts?

### A-CP77-04 — Cyberpunk 2077 — expert

**Q:** how do i beat adam smasher  
**Cards:** Adam Smasher, Iconic weapons  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To defeat Adam Smasher, focus on using Sandevistan or high DPS builds. Prioritize destroying his legs first, and use cover during his rocket barrages.
> 
> ```bonsai-cite fallback_no_source```

### A-FO4-01 — Fallout 4 — strategy

**Q:** how do i kill a deathclaw early  
**Cards:** Deathclaw, Mirelurk queen, Choosing a build  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To take down a Deathclaw early, you need to focus on positioning and exploiting its weaknesses. They have very high health and resist most damage, especially from energy weapons, so you need to be smart about your approach.
> 
> Here are the key points:
> 
> 1.  **Distance is Key:** Deathclaws are aggressive and have a powerful ground attack and a ranged attack where they throw cars. Keep distance to avoid these initial threats.
> 2.  **Weaknesses:** They are vulnerable to physical damage, and if you can find a way to exploit its low health threshold, you can finish it quickly.
> 3.  **Tactics:** Use cover to avoid its attacks. When it gets close, try to stagger it with headbutts if possible, but generally, maintaining distance and using heavy damage sources is best.

### A-FO4-02 — Fallout 4 — strategy

**Q:** what special stats should i pick at the start  
**Cards:** SPECIAL points, Choosing a build, Perks  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> You are asking about the initial allocation of your S.P.E.C.I.A.L. points in Fallout 4. Since you start with one point in every stat and 21 points to spend, you have 28 total points to distribute across the six attributes: Strength, Perception, Endurance, Charisma, Intelligence, and Agility.
> 
> The initial choices here heavily influence what perks you can even access later. While you can raise these stats later with items like bobbleheads and through leveling up, your first few hours are much easier to manage if you pick a direction now.
> 
> Here is a general breakdown of the playstyles:
> 
> *   **Intelligence:** This is often considered a quiet strong pick because it increases how fast you level up, meaning you unlock other perks sooner.
> *   **Strength + Endurance:** This combination builds a character focused on melee combat or heavy weapons, allowing you to survive mistakes in close quarters.
> *   **Agility + Perception:** This is the route for snipers and V.A.T.S. users, focusing on precision and killing enemies before they can reach you.
> *   **Charisma:** This is the build for settlement management and speech checks. It is the weakest choice early on but can be very rewarding later in the game.
> 
> Since every build can be adapted, I suggest picking the style that sounds most fun for the first ten hours, rather than trying to optimize for the entire game.
> 
> What kind of combat or playstyle are you leaning towards for your character?

### A-FO4-03 — Fallout 4 — speed

**Q:** feral ghouls keep swarming me  
**Cards:** Feral ghouls  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Feral ghouls are aggressive irradiated former humans that tend to travel in groups.
> 
> To deal with them effectively:
> *   **Weakness:** The head is the most reliable target.
> *   **Combat Tactic:** Removing one of their legs will stop them from attacking entirely. Note that removing both arms does not have the same effect.
> *   **Environment:** Be aware that they can hide in rubble, ductwork, and windows, so a room that appears clear may not be safe. While one is climbing in, it cannot fight back.
> *   **Damage Type:** They inflict both physical and radiation damage. In highly irradiated zones, like the Glowing Sea, they possess the ability to regenerate when shot.

### A-FO4-04 — Fallout 4 — expert

**Q:** my power armor suddenly stopped working properly  
**Cards:** Upgrading power armor, Power armor and fusion cores, Stimpaks and chems, Legendary enemies, Settlement happiness  
**Checks:** facts ✅ · contradiction ✅ · fence ✅ · menu ✅

> To help diagnose why your power armor stopped working, I need a bit more information. Are you experiencing any of the following issues?
> 
> 1.  **Does the suit not power on at all?** If so, check the fusion core. If the core is empty, you can still walk around, but you lose V.A.T.S. and steady aim.
> 2.  **Is the suit running out of power too quickly?** This is usually related to how much Action Points (AP) you are using through sprinting or V.A.T.S.
> 3.  **Are you having trouble with the suit's functionality?** For example, if you are trying to upgrade it, repairs and mods are done at a power armor station, which can be built at a settlement.
> 4.  **Is the suit physically damaged?** If you are in combat, check if your armor is damaged or if you need to repair it.
> 
> If you can describe the specific symptom, I can offer more targeted advice.

### A-FO4-05 — Fallout 4 — strategy

**Q:** a legendary enemy healed back to full in the middle of the fight  
**Cards:** Legendary enemies, Stimpaks and chems, Feral ghouls  
**Checks:** facts ❌ · contradiction — · fence ✅ · menu ✅

> A legendary enemy healing back to full health mid-fight is a common occurrence in Fallout 4. These creatures have a star next to their name and a significantly larger health pool than regular enemies. The key thing to know is that at roughly half health, they undergo a mutation: they fully heal themselves and gain a new ability. This effectively doubles the fight's length from the start, so don't blow all your resources on the first half.
> 
> Each of these tougher foes drops a piece of gear—armor or a weapon—that carries a random legendary effect. That's your primary way to get good gear in the game.
> 
> What kind of combat situation are you currently in?

### A-RDR2-01 — Red Dead Redemption 2 — strategy

**Q:** i just came from gta, any tips before i start  
**Cards:** Coming from GTA, Bounties, Valentine  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you're coming from Grand Theft Auto, the biggest shift in Red Dead is the deliberate pacing. This game is designed to feel weighty and immersive, which means things don't happen instantly.
> 
> A few key things to keep in mind:
> 
> *   **Pacing and Movement:** Arthur has weight. Movement, horse turns, and picking up items are all animated sequences; they are not instant actions like in GTA.
> *   **Law and Order:** If you do something illegal, the law doesn't just disappear. Wanted levels persist, and witnesses can lead to bounties that stay active in the region.
> *   **Crime Management:** If you get into trouble, try to keep your face covered during illegal acts to keep your bounty lower. Always pay bounties at a post office to clear them.
> *   **Camp:** Treat the camp as your home base rather than just a save point. Upkeep and supplies matter for your long-term progress.

### A-RDR2-02 — Red Dead Redemption 2 — speed

**Q:** how do i raise honor  
**Cards:** Honor  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To raise Honor in Red Dead Redemption 2, focus on small, frequent actions. You can increase it by greeting people, helping strangers you encounter on the road, and choosing to pay bounties instead of running from them. Donating to camp also contributes to this. Conversely, actions like robbery or killing civilians and animals you don't need will lower your Honor. Remember, Honor is a slider, not a switch; one poor decision won't erase good deeds, but consistent choices shape your standing.

### A-RDR2-03 — Red Dead Redemption 2 — strategy

**Q:** what happens to arthur at the end of the story  
**Cards:** Coming from GTA, Bounties, Satchel upgrades  
**Checks:** facts — · contradiction — · fence ❌ · menu ✅

> I cannot provide a detailed summary of what happens to Arthur at the end of the story, as that would constitute a major story spoiler.
> 
> However, I can tell you that the game features several different paths and outcomes depending on how Arthur's journey progresses and the choices you make throughout the narrative. The final moments are directly tied to the events leading up to them.
> 
> To help guide you, what aspect of the game are you currently focused on? Are you more interested in the main story beats, character development, or perhaps the side activities?

### A-RDR2-04 — Red Dead Redemption 2 — expert

**Q:** my horse keeps throwing me off  
**Cards:** Horse bonding, Bear, Horse breeds, Coming from GTA, Satchel upgrades  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Your horse throwing you off is usually related to its bond level or its temperament.
> 
> If your horse is throwing you off due to fear or spookiness, increasing its bond is the primary fix. Bonding is raised through actions like riding, feeding, brushing, patting, and calming it when it's in danger. A higher bond level makes the horse less likely to bolt when startled.
> 
> Also, consider the breed. Some breeds, like Arabians, are naturally prone to bolting until their bond is established.
> 
> If you are trying to ride through a dangerous area, remember that a high-bond horse will be more reliable. If you are unfamiliar with the game's pace, remember that this game is deliberately slow; movement and reactions take time.
> 
> ```bonsai-cite fallback_no_source```

### A-SOE-01 — State of Emergency — strategy

**Q:** how do i get more time in a round  
**Cards:** Round time and the +15s pickups, Late-round rocket enemies, Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To get more time in a round in State of Emergency, you need to focus on the pickups scattered around the level. Each of those pickups adds 15 seconds to the round timer.
> 
> However, a key tip is to know when to prioritize time extension versus continuing to fight. Sometimes, breaking off from a fight to secure a time-adding pickup is more valuable than continuing to clear a crowd.
> 
> Also, be aware that late in any round, enemies with rocket launchers will appear. Treat these rocket enemies as a top priority target the moment they show up, even if you are currently engaged with a larger group of enemies.
> 
> What aspect of the current round are you struggling with most?

### A-SOE-02 — State of Emergency — speed

**Q:** whats the difference between kaos mode and revolution mode  
**Cards:** Kaos mode and Revolution mode  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Kaos mode and Revolution mode are two distinct ways to play State of Emergency.
> 
> Revolution mode is the primary story experience. It consists of a chain of missions within each zone, and it is through this mode that characters and zones are unlocked.
> 
> Kaos mode is a different type of challenge. It is a score attack against a clock, and you are in one zone at a time. Instead of surviving, you extend the time by hitting objectives that pop up mid-riot.

### A-OOT-01 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** the shadow temple has floors missing everywhere  
**Cards:** Shadow Temple invisible floors, Dark Link, Adult dungeon order  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> The missing floors in the Shadow Temple are not actually missing; they are just invisible. To see them, you need to use the Lens of Truth. Be aware that holding the Lens of Truth drains your magic, so use it in short bursts. Keep the temple's fairies and green potions active to keep the Lens running.

### A-OOT-02 — The Legend of Zelda: Ocarina of Time — strategy

**Q:** how do i beat volvagia  
**Cards:** Volvagia, Biggoron's Sword, Gold Skulltulas  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To beat Volvagia, you need to be prepared for the fire dragon that emerges from the floor holes. The core of the fight relies on using the Megaton Hammer. When the dragon pops up, hit its head immediately. After that, you can slash at it while it's stunned. If it starts flying around the arena, use the Hookshot to pull it back down to the ground. Keep in mind you'll want the Goron Tunic and a shield to handle the fire, and you must avoid the lava edges.

### A-BG3-01 — Baldur's Gate 3 — strategy

**Q:** should i be long resting more often  
**Cards:** Long rest, Goblin Camp, Sneak Attack  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Taking a long rest is generally recommended more often than you might think, even if you feel fine. A long rest does more than just restore your health and spells; it also advances companion scenes and personal quests, which are important for the story. While camp supplies can be consumed, they are usually plentiful, and you can pick up more food.
> 
> If you are concerned about resources, remember that short rests restore some resources but don't advance the narrative as much as a long rest does.
> 
> Do you want to discuss the general importance of resting, or are you concerned about specific resource management in the current area?

### A-BG3-02 — Baldur's Gate 3 — expert

**Q:** what party composition should i use for a first run  
**Cards:** Party composition, Sneak Attack, Goblin Camp, Inspiration  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> Since you are asking about party composition, I will keep the advice focused on general utility and not spoil specific story beats.
> 
> For a first run, you want a balanced party that covers essential roles. A good starting point is to ensure you have someone who can talk, someone who can heal, someone who can handle traps/locks, and sufficient damage output. One character can often cover two of these roles.
> 
> Specifically, you should aim to have:
> 1.  **A Speaker:** To handle dialogue challenges. (Bards and Paladins are good options here.)
> 2.  **A Healer:** To keep the party alive. (Clerics and Druids are reliable choices.)
> 3.  **A Utility/Skill Expert:** To manage traps and locks. (Rogues and Rangers are generally good at this.)
> 4.  **Damage:** Enough consistent damage to clear encounters.
> 
> The one role you absolutely cannot afford to lack is healing.
> 
> ```bonsai-cite fallback_no_source```
> This advice is based on general mechanics for the game.

### A-SIMS4-01 — The Sims 4 — speed

**Q:** fastest way to make money early  
**Cards:** Making money  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> For early money in The Sims 4, the fastest methods are generally self-employed careers that require minimal starting investment. Painting and writing are good options because they only need one skill and one object, and both scale up quickly as the skill level increases. Selling collectibles can also fund the very beginning of the game if you have them.
> 
> ```bonsai-cite fallback_no_source```

### A-GTASA-01 — Grand Theft Auto: San Andreas - The Definitive Edition — speed

**Q:** how do i recruit more gang members  
**Cards:** Respect  
**Checks:** facts ✅ · contradiction — · fence ✅ · menu ✅

> To increase your gang's respect level, which dictates how many members you can recruit (up to seven), you need to focus on several activities.
> 
> The primary ways to boost respect include:
> 
> *   **Completing Missions:** Certain story missions will directly contribute to your gang's standing.
> *   **Territory Control:** Taking over rival gang territory is a major factor.
> *   **Aggression:** Killing rival gang members and police officers helps build respect.
> *   **Tagging:** Spraying over gang tags in areas is a recognized way to show dominance.
> *   **Appearance:** Your character's look matters. Things like your hairstyle, tattoos, and clothing can influence respect.
> *   **Grove Street Presence:** Wearing green while in Grove Street territory is a specific appearance nudge that helps boost respect.
> 
> Conversely, respect can decrease if you wear the wrong colors at home, kill your own gang members, or lose turf.
> 
> ```bonsai-cite wiki_no_patch```

### A-NOCARD-01 — ELDEN RING — strategy

**Q:** how do i beat margit  
**Cards:** none  
**Checks:** facts — · contradiction — · fence — · menu ✅

> To approach Margit, the Fell Omen, you need to manage your stamina and positioning carefully, as he is very aggressive.
> 
> General strategy involves dodging his heavy attacks by timing your roll correctly—usually rolling *into* or *through* the attack, depending on the specific move. Since he hits hard, prioritize dodging over blocking unless you have high-level poise.
> 
> When he pauses between combos, look for openings to strike. If you are struggling with his aggression, consider using a weapon or spell that has good range or area-of-effect damage to keep him at bay until you can get a solid combo in.
> 
> Since you asked specifically about Margit, I will focus the next set of options on the encounter itself.

### A-VAGUE-01 — Hades — strategy

**Q:** keep dying in tartarus  
**Cards:** Shield of Chaos, Theseus and Asterius, Mirror of Night  
**Checks:** facts — · contradiction — · fence — · menu ✅

> You're running into trouble in the lower levels of the Underworld. Since you're dying often in Tartarus, we need to focus on making your character more resilient or more effective at dealing with the rooms and enemies you encounter there.
> 
> The **Shield of Chaos** is often recommended for survivability because it lets you turn a mistake into a complete block rather than taking damage. It effectively merges defense and offense.
> 
> If you're looking for permanent ways to improve your runs, you should be focusing on the **Mirror of Night** upgrades, which are purchased with Darkness. Remember, each upgrade row has two choices, and you can swap them later if you find something better for your current build.
> 
> To give you the best advice, I need to know what part of the Underworld you are currently struggling with.
