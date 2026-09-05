import { describe, expect, it, vi } from "vitest";
import { buildChipNavHandlers } from "./presetRowNav";

function make(index: number, count: number, advanceAtEnd?: () => boolean) {
  const focusChip = vi.fn((_: number) => true);
  const exitDown = vi.fn(() => true);
  const exitUp = vi.fn(() => false);
  const handlers = buildChipNavHandlers({ index, count, focusChip, exitDown, exitUp, advanceAtEnd });
  return { handlers, focusChip, exitDown, exitUp };
}

/* Found on device 2026-09-01: with only the container hint, Left from the right chip landed on the
   Quick Access rail and Down/Up walked between chips. These pin the explicit graph instead. */
describe("preset row D-pad handlers", () => {
  it("Left and Right walk between the chips and claim the move", () => {
    const { handlers, focusChip } = make(1, 2);
    expect(handlers.onMoveLeft()).toBe(true);
    expect(focusChip).toHaveBeenLastCalledWith(0);
    const right = make(0, 2);
    expect(right.handlers.onMoveRight()).toBe(true);
    expect(right.focusChip).toHaveBeenLastCalledWith(1);
  });

  it("holds still at both ends rather than letting Steam leave the plugin", () => {
    const first = make(0, 2);
    expect(first.handlers.onMoveLeft()).toBe(true);
    expect(first.focusChip).not.toHaveBeenCalled();
    const last = make(1, 2);
    expect(last.handlers.onMoveRight()).toBe(true);
    expect(last.focusChip).not.toHaveBeenCalled();
  });

  it("Down hands the ring to the Ask field and reports whether it moved", () => {
    const { handlers, exitDown } = make(0, 2);
    expect(handlers.onMoveDown()).toBe(true);
    expect(exitDown).toHaveBeenCalledTimes(1);
  });

  it("Up hands the ring upward, and leaves the move to Steam when nothing is registered", () => {
    const { handlers, exitUp } = make(1, 2);
    expect(handlers.onMoveUp()).toBe(false);
    expect(exitUp).toHaveBeenCalledTimes(1);
  });

  /*
   * D58 #3: a pinned QA batch longer than the row could not be reached past the first minute
   * because Right at the last chip only ever claimed the move. `advanceAtEnd` gets first refusal
   * there now; the carousel wires it to pull the next batch entry in (MainTabPresetAnimatedChips).
   */
  describe("advanceAtEnd (D58 #3: a pinned batch longer than the row)", () => {
    it("is called, instead of focusChip, when Right is pressed at the last chip", () => {
      const advanceAtEnd = vi.fn(() => true);
      const { handlers, focusChip } = make(1, 2, advanceAtEnd);
      expect(handlers.onMoveRight()).toBe(true);
      expect(advanceAtEnd).toHaveBeenCalledTimes(1);
      expect(focusChip).not.toHaveBeenCalled();
    });

    it("still claims the move when advanceAtEnd finds nothing to pull in", () => {
      const advanceAtEnd = vi.fn(() => false);
      const { handlers } = make(1, 2, advanceAtEnd);
      expect(handlers.onMoveRight()).toBe(true);
      expect(advanceAtEnd).toHaveBeenCalledTimes(1);
    });

    it("is never called away from the last chip -- Right there still just walks chips", () => {
      const advanceAtEnd = vi.fn(() => true);
      const { handlers, focusChip } = make(0, 2, advanceAtEnd);
      expect(handlers.onMoveRight()).toBe(true);
      expect(focusChip).toHaveBeenLastCalledWith(1);
      expect(advanceAtEnd).not.toHaveBeenCalled();
    });

    it("without advanceAtEnd, Right at the last chip still just holds (unchanged default)", () => {
      const last = make(1, 2);
      expect(last.handlers.onMoveRight()).toBe(true);
      expect(last.focusChip).not.toHaveBeenCalled();
    });
  });

  /*
   * D58 #2: Up used to be a single `takeNavFocus("session-context-strip")` call; it is now a
   * two-step fallback (strip, then the always-mounted chat slot row -- see usePresetRowNav in
   * MainTabPresetAnimatedChips.tsx, which is where the two `takeNavFocus` targets actually live).
   * `onMoveUp` itself does not know or care how many steps `exitUp` tries internally -- it just
   * forwards the boolean -- and these pin that contract so a future third fallback step needs no
   * change here either.
   */
  describe("onMoveUp forwards whatever exitUp decides (D58 #2)", () => {
    it("reports true when exitUp's fallback chain finds a target", () => {
      const first = vi.fn(() => false);
      const second = vi.fn(() => true);
      const exitUp = () => first() || second();
      const handlers = buildChipNavHandlers({
        index: 0,
        count: 2,
        focusChip: vi.fn(() => true),
        exitDown: vi.fn(() => true),
        exitUp,
      });
      expect(handlers.onMoveUp()).toBe(true);
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });

    it("reports false, letting Steam decide, when every step in the chain declines", () => {
      const exitUp = () => false || false;
      const handlers = buildChipNavHandlers({
        index: 0,
        count: 2,
        focusChip: vi.fn(() => true),
        exitDown: vi.fn(() => true),
        exitUp,
      });
      expect(handlers.onMoveUp()).toBe(false);
    });
  });
});
