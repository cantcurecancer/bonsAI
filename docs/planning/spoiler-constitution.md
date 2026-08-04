# Spoiler constitution (product rules)

Living product rulebook for when bonsAI should fence, unwrap, or (later) omit
spoiler-sensitive Strategy guidance. **Not** an implementation plan.

- Bug slice that enforces named-entity display: [04-strategy-spoiler-false-positive.md](04-strategy-spoiler-false-positive.md)
- Roadmap feature to encode this into prompts/signals over time: [roadmap.md § Planned](../roadmap.md#planned) (**Spoiler constitution**)
- Related Planned: **Spoiler confidence chip**, **User-adjustable spoiler fencing**, **Unfenced spoiler feedback**

Draft locked from maintainer planning chat 2026-08-04. Encoding into runtime
behavior is ★★★★ Planned work — do not treat this file as shipped policy in code.

---

## Commonality (what “low spoiler risk” really means)

Tone and Steam genre tags are weak proxies. The useful question is:

> **Does this game use hidden narrative or progression-gated knowledge as part of
> the designed experience?**

- If **no** (arcade / horde / pure multiplayer tactics / no progressive story
  secrets) → default open for routine boss/enemy guidance.
- If **yes** → default conservative (fence), then relax only with a clear signal
  (named entity, explicit consent phrase, known progress, or later risk-band
  settings).

**Do not** treat broad genres alone (`roguelike`, `action rpg`) as “almost never
spoil.” Counterexample: Hades shares `roguelike` with DRG Survivor; Hades bosses
and relationships *are* narrative.

### Examples (illustrative, not an allowlist)

| Usually open for tactics | Protect story / progression secrets |
|---|---|
| Tetris, Vampire Survivors, Brotato, DRG Survivor, TF2 class tips, Cuphead *patterns* | Hades / Hades II, Celeste, Hollow Knight, Outer Wilds, Portal, Undertale, Spiritfarer, Firewatch, Ori, Binding of Isaac endings/lore, Animal Well / Tunic secrets |

Story/campaign games that feel “laid back” still belong in the protect column.

---

## Rules

1. **Irreversible early perception.** Prefer gating text that would permanently
   change a first-time player’s view of early-game characters or goals.
2. **Player-shouldn’t-know-yet.** Fence (or later omit) information the
   protagonist/player is not supposed to have at that point (temples, later
   tools, late bosses, etc.). Example: answering a hookshot question must not
   freely spoil the longshot unless the user asked or opted in.
3. **Surprise / suspense.** Designed horror, fake-outs, and twist beats stay
   gated.
4. **Low-narrative titles.** Games without progressive story secrets rarely need
   spoilers for routine combat/boss tactics — use the commonality above, not
   genre substring alone.
5. **Premise & mechanics.** Almost never gate. How the game plays, controls, and
   difficulty framing stay plain.
6. **Lore ≠ spoiler.** Early guidance and background that does not affect the
   story stay plain. Things the player should not know yet stay gated.
7. **Named-entity consent.** If the user names a beat/boss/item in the question,
   tactics **for that named thing** are not hidden. Adjacent secrets stay fenced.
8. **Explicit opt-in wins.** Phrases like “spoilers are okay” open the turn;
   Settings spoiler masking off removes the mask UI entirely.
9. **Default when unsure.** Prefer fencing on progressive/story titles; prefer
   open only with a clear signal. Richer “when to mask by risk band” leans on the
   Planned **Spoiler confidence chip** and **User-adjustable spoiler fencing**
   (chip v1 is transparency-only and does not change fencing).
10. **Progression-gated knowledge stays gated.** Next-tool / next-area secrets
    stay behind a fence (or later soft-omit) unless asked or consented.
11. **Don’t fence the map of the conversation.** Orientation, controls, and
    “you’re stuck because of this mechanic” stay plain — without freely naming
    the next secret (rules 2 and 10).
12. **Surprise is sacred; grind is not.** Twists stay gated. Wave patterns, DPS
    checks, and arena layouts usually do not — unless learning them early ruins
    a designed discovery.
13. **Honest promises only.** Promise what code can keep (e.g. named-entity
    display unwrap). Do not promise zero false positives or perfect story
    judgment from a small local model.

---

## Mask vs omit (parked)

**Today:** tap-to-reveal fences (`bonsai-spoiler`) are the shipped control.

**Later (not the STRAT-SPOIL-DRG-01 ship):** for *adjacent* secrets, prefer
partial advice plus a soft invite (“say if you want the spoiler”) over dumping
masked content. Named-entity questions still get plain tactics for the thing
named (rule 7). Soft-omit belongs with constitution encoding + confidence /
adjustable fencing — not the false-positive bug fix.

---

## Relationship to the false-positive bug

[04-strategy-spoiler-false-positive.md](04-strategy-spoiler-false-positive.md)
ships one **enforceable slice**: display invariant + prompt steering for the
entity named in the question (recon options 1+2+4). It does **not** encode this
whole constitution into runtime.
