/**
 * Title: Preset chip focus-ring honesty
 * Purpose: Pin that a preset chip only looks focused when it really holds Steam's gamepad ring.
 * Used for: The carousel's blue current-row border and the white ring shared by plugin controls.
 * Solves: The fake focus ring found on device 2026-08-28 — a chip drew a highlight while the D-pad
 *         was on the tab strip above it, so the maintainer and the QA rig both read the wrong control.
 * Does not: Check colours, sizes or where the ring is drawn — only what has to be true first.
 *
 * These assertions read the generated stylesheet as text rather than rendering it, because the bug
 * is in the *selector*, not in the paint: the old rules matched on carousel state and on the DOM's
 * `:focus-visible`, neither of which is where Steam's ring is.
 */
import { describe, expect, it } from "vitest";

import { buildGamepadFocusRingStylesheet } from "./sections/gamepadAndPullModels";
import { buildSection4Section } from "./sections/section-4";

/** Every individual selector in a stylesheet, comments and declarations stripped. */
function selectorsOf(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const heads = withoutComments.match(/[^{}]+(?=\{)/g) ?? [];
  return heads
    .flatMap((head) => head.split(","))
    .map((sel) => sel.trim())
    .filter((sel) => sel.length > 0 && !sel.startsWith("@"));
}

/**
 * The three ways a selector is allowed to claim focus styling.
 *
 * `.gpfocus` / `.gpfocuswithin` are Steam's own markers. The third is the no-ring fallback: when
 * nothing in the panel owns a gamepad ring at all — desktop, the in-IDE preview, touch — the DOM's
 * idea of focus is the best answer available, which is the same rule `elementHasGamepadFocus` uses
 * in utils/uiDocument.ts.
 */
function isGatedOnTheRing(selector: string): boolean {
  return (
    selector.includes(".gpfocus") ||
    selector.includes(".gpfocuswithin") ||
    selector.includes(":not(:has(.gpfocus))")
  );
}

const SHEETS: Array<[string, string]> = [
  ["gamepad focus rings", buildGamepadFocusRingStylesheet()],
  ["section 4", buildSection4Section()],
];

describe("preset chip focus ring", () => {
  it.each(SHEETS)(
    "%s: the carousel's current-row border never paints unless the carousel owns the ring",
    (_name, css) => {
      const ungated = selectorsOf(css).filter(
        (sel) => sel.includes("bonsai-preset-carousel-slot--focus") && !isGatedOnTheRing(sel),
      );
      expect(ungated).toEqual([]);
    },
  );

  it.each(SHEETS)("%s: a chip's :focus-visible ring never paints while something owns the ring", (_name, css) => {
    const ungated = selectorsOf(css).filter(
      (sel) => sel.includes("bonsai-preset-glass:focus-visible") && !isGatedOnTheRing(sel),
    );
    expect(ungated).toEqual([]);
  });

  it("still paints the chip that does hold the ring", () => {
    expect(buildGamepadFocusRingStylesheet()).toContain("button.bonsai-preset-glass.gpfocus");
  });

  it("still marks the current row for mouse, touch and the preview, where no ring exists", () => {
    const selectors = selectorsOf(buildSection4Section());
    expect(
      selectors.some(
        (sel) =>
          sel.includes(":not(:has(.gpfocus))") && sel.includes("bonsai-preset-carousel-slot--focus"),
      ),
    ).toBe(true);
  });
});
