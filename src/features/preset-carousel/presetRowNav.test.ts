import { describe, expect, it, vi } from "vitest";
import { buildChipNavHandlers } from "./presetRowNav";

function make(index: number, count: number) {
  const focusChip = vi.fn((_: number) => true);
  const exitDown = vi.fn(() => true);
  const exitUp = vi.fn(() => false);
  const handlers = buildChipNavHandlers({ index, count, focusChip, exitDown, exitUp });
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
});
