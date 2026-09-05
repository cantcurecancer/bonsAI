/**
 * Guards `effectivePresetVisibleSlots` — the single point where the "one suggestion chip"
 * setting (roadmap `[chips]` ★★★) overrides how many chips the row shows. `PRESET_VISIBLE_SLOTS`
 * itself must keep meaning "the shipped default": carouselState.test.ts pins it at exactly 2, and
 * this file must never weaken that by changing the constant instead of adding an override.
 */
import { describe, expect, it } from "vitest";
import { effectivePresetVisibleSlots, PRESET_VISIBLE_SLOTS } from "./presetRowLayout";

describe("effectivePresetVisibleSlots", () => {
  it("returns the shipped default (two) when the setting is off", () => {
    expect(effectivePresetVisibleSlots(false)).toBe(PRESET_VISIBLE_SLOTS);
    expect(effectivePresetVisibleSlots(false)).toBe(2);
  });

  it("returns one when the setting is on, regardless of what the default is", () => {
    expect(effectivePresetVisibleSlots(true)).toBe(1);
  });

  it("never returns zero or a negative count", () => {
    expect(effectivePresetVisibleSlots(true)).toBeGreaterThan(0);
    expect(effectivePresetVisibleSlots(false)).toBeGreaterThan(0);
  });
});
