/**
 * Title: Context chip attribution helpers
 * Purpose: Pin how a licensed source is detected and read off a transparency chip.
 * Used for: ContextChipLadder accent + credit block.
 * Solves: Attribution has to be visible without selecting the chip, and must not borrow the
 *         tier_class colour axis, which already means something else.
 * Does not: Cover the Python half that builds the entries — see tests/test_source_attribution.py.
 */
import { describe, expect, it } from "vitest";
import type { ContextChip } from "./inputTransparency";
import {
  ATTRIBUTION_ACCENT,
  chipAttribution,
  chipHasAttribution,
  tierBackground,
  tierBorderColor,
} from "./contextChipsFromSnapshot";

function chip(overrides: Partial<ContextChip> = {}): ContextChip {
  return {
    id: "kb",
    rank: 1,
    label: "Keyword + meaning",
    attached: true,
    tier_class: "",
    body: { title: "Local knowledge base", paths: [], bullets: [] },
    ...overrides,
  };
}

describe("chip attribution", () => {
  it("reads credit entries off the body", () => {
    const c = chip({
      body: {
        title: "Local knowledge base",
        paths: [],
        bullets: [],
        attribution: [
          {
            source: "theportalwiki.com",
            license: "CC-BY-4.0",
            url: "https://theportalwiki.com/wiki/Portal_2",
            cards: ["Portal 2 — Chamber 21"],
          },
        ],
      },
    });
    expect(chipHasAttribution(c)).toBe(true);
    expect(chipAttribution(c)[0].source).toBe("theportalwiki.com");
  });

  it("treats a chip with no attribution key as uncredited", () => {
    expect(chipHasAttribution(chip())).toBe(false);
    expect(chipAttribution(chip())).toEqual([]);
  });

  it("treats an empty attribution list as uncredited", () => {
    const c = chip({ body: { title: "t", paths: [], bullets: [], attribution: [] } });
    expect(chipHasAttribution(c)).toBe(false);
  });

  it("survives a body that is missing entirely", () => {
    const c = { ...chip(), body: undefined } as unknown as ContextChip;
    expect(chipHasAttribution(c)).toBe(false);
  });

  it("does not collide with any model-licensing tier colour", () => {
    // tier_class is the model axis. open_weight is already amber, so an attribution accent
    // taken from that palette would make a knowledge chip read as a model chip.
    for (const tier of ["foss", "open_weight", "non_foss", ""]) {
      expect(tierBorderColor(tier)).not.toBe(ATTRIBUTION_ACCENT);
      expect(tierBackground(tier)).not.toBe(ATTRIBUTION_ACCENT);
    }
  });
});
