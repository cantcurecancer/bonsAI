import { describe, expect, it } from "vitest";
import type { PresetPrompt } from "../../data/presets";
import {
  advanceCarouselFocus,
  buildInitialCarouselState,
  CAROUSEL_HISTORY_MAX,
  CAROUSEL_ROW_HEIGHT_PX,
  carouselTrackOffsetPx,
  clampHistory,
  mergeContextualSeeds,
  visibleWindowTexts,
} from "./carouselState";

function p(text: string): PresetPrompt {
  return { text, category: "test" };
}

describe("carouselState", () => {
  /* One visible row since 2026-08-31: the focused row IS the window, so each index is one row
     further down the track. (It used to centre the focus row in a three-row window.) */
  it("carouselTrackOffsetPx puts the focused row in the single visible slot", () => {
    expect(carouselTrackOffsetPx(0)).toBe(0);
    expect(carouselTrackOffsetPx(1)).toBe(CAROUSEL_ROW_HEIGHT_PX);
    expect(carouselTrackOffsetPx(2)).toBe(2 * CAROUSEL_ROW_HEIGHT_PX);
    expect(carouselTrackOffsetPx(4)).toBe(4 * CAROUSEL_ROW_HEIGHT_PX);
  });

  it("visibleWindowTexts is the focused chip alone", () => {
    const h = [p("a"), p("b"), p("c")];
    expect([...visibleWindowTexts(h, 1)]).toEqual(["b"]);
    expect([...visibleWindowTexts(h, 5)]).toEqual([]);
  });

  it("the carousel opens on the first contextual seed", () => {
    expect(buildInitialCarouselState([p("a"), p("b"), p("c")]).focusIndex).toBe(0);
  });

  it("clampHistory trims to CAROUSEL_HISTORY_MAX", () => {
    const long = Array.from({ length: 20 }, (_, i) => p(`item-${i}`));
    const clamped = clampHistory(long);
    expect(clamped.length).toBe(CAROUSEL_HISTORY_MAX);
    expect(clamped[0]?.text).toBe("item-15");
  });

  it("advanceCarouselFocus increments until end then appends", () => {
    const h = [p("a"), p("b"), p("c")];
    const mid = advanceCarouselFocus(h, 0, p("d"));
    expect(mid.focusIndex).toBe(1);
    expect(mid.history).toHaveLength(3);

    const end = advanceCarouselFocus(h, 2, p("d"));
    expect(end.focusIndex).toBe(3);
    expect(end.history.map((x) => x.text)).toEqual(["a", "b", "c", "d"]);
  });

  it("mergeContextualSeeds skips when focus window already matches", () => {
    const triple: [PresetPrompt, PresetPrompt, PresetPrompt] = [p("a"), p("b"), p("c")];
    const history = [...triple, p("older")];
    const merged = mergeContextualSeeds(history, triple, 1);
    expect(merged.history).toBe(history);
    expect(merged.focusIndex).toBe(1);
  });

  it("mergeContextualSeeds updates window without resetting focus to 0", () => {
    const history = [p("old1"), p("old2"), p("old3"), p("tail")];
    const triple: [PresetPrompt, PresetPrompt, PresetPrompt] = [
      p("new1"),
      p("new2"),
      p("new3"),
    ];
    const merged = mergeContextualSeeds(history, triple, 2);
    expect(merged.focusIndex).toBe(2);
    expect(merged.history[1]?.text).toBe("new1");
    expect(merged.history[2]?.text).toBe("new2");
    expect(merged.history[3]?.text).toBe("new3");
    expect(merged.history[0]?.text).toBe("old1");
  });
});
