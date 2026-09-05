/**
 * Title: Chip row "ran out of chips" edge cue — stylesheet checks
 * Purpose: Pin the two things a rendered test cannot: that the cue can actually beat the
 *          `box-shadow: none !important` / `border: ... !important` reset every preset chip
 *          carries (section-6.ts), and that reduced motion drops the ramp without touching any
 *          other control's transition.
 * Used for: The blocked-edge glow wired in MainTabPresetAnimatedChips.tsx / presetRowNav.ts
 *           (roadmap `[chips]` ★★, filed 2026-09-04).
 * Does not: Render anything or assert paint — jsdom has no layout/paint engine
 *           (design-language.md rule 6). These read the generated CSS text, the same approach
 *           presetChipFocusRing.test.ts uses for the same reason.
 */
import { describe, expect, it } from "vitest";
import { buildSection4Section } from "./section-4";
import { PRESET_CHIP_BLOCKED_EDGE_FLASH_MS } from "../../features/preset-carousel/presetRowLayout";

describe("chip row out-of-chips edge cue (section 4 CSS)", () => {
  const css = buildSection4Section();

  it("declares the cue on the real button class, !important, so it outranks the base reset", () => {
    // section-6.ts's `.bonsai-preset-glass` sets `box-shadow: none !important` and
    // `border: ... !important`; only a higher-specificity !important rule for the same
    // properties can still paint anything on the flagged chip.
    const match = css.match(
      /\.bonsai-scope button\.bonsai-preset-glass\.bonsai-preset-chip-blocked-edge\s*\{([^}]*)\}/,
    );
    expect(match).toBeTruthy();
    const body = match![1]!;
    expect(body).toMatch(/border-color:\s*rgba\(56,\s*189,\s*248,\s*0\.85\)\s*!important/);
    expect(body).toMatch(/box-shadow:\s*0 0 8px 1px rgba\(56,\s*189,\s*248,\s*0\.45\)\s*!important/);
    // A transition, not @keyframes -- see the comment above the rule for why a keyframe
    // animation cannot win against the !important reset.
    expect(body).toMatch(/transition:/);
    expect(css).not.toMatch(/@keyframes\s+bonsai-preset-chip-blocked-edge/);
  });

  it("respects reduced motion: the ramp is dropped, and only for this one selector", () => {
    const reducedBlock = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*)$/);
    expect(reducedBlock).toBeTruthy();
    const body = reducedBlock![1]!;
    expect(body).toContain(".bonsai-preset-glass.bonsai-preset-chip-blocked-edge");
    expect(body).toMatch(/transition:\s*none\s*!important/);
    // Scoped to the modifier class alone -- must not also silence the bare .bonsai-preset-glass
    // selector, which would kill the unrelated dimmed/undimmed carousel fade.
    expect(body).not.toMatch(/\.bonsai-scope\s+\.bonsai-preset-glass\s*\{/);
  });

  it("never widens the chip: no width, transform or margin on the cue rule", () => {
    const match = css.match(
      /\.bonsai-scope button\.bonsai-preset-glass\.bonsai-preset-chip-blocked-edge\s*\{([^}]*)\}/,
    );
    const body = match![1]!;
    expect(body).not.toMatch(/\b(width|transform|margin)\s*:/);
  });

  it("keeps the CSS ramp shorter than the JS flash window it lives inside", () => {
    const match = css.match(/transition:\s*border-color\s+(\d+)ms/);
    expect(match).toBeTruthy();
    const rampMs = Number(match![1]);
    expect(rampMs).toBeGreaterThan(0);
    expect(rampMs).toBeLessThan(PRESET_CHIP_BLOCKED_EDGE_FLASH_MS);
  });
});
