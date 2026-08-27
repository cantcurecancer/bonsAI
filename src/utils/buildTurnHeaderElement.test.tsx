/**
 * Title: Turn header element navigation tests
 * Purpose: Pin the header's D-pad Down wiring to onMoveDown, the handler Steam invokes on device.
 * Used for: SPOILER-DPAD-01 regression guard — the header→bubble entry edge.
 * Solves: This edge shipped three times on handlers Steam never calls for the D-pad (DOM keydown,
 *         then a direction onButtonDown); each looked correct under vitest and was dead on
 *         hardware. These tests go red if the edge leaves onMoveDown again.
 * Does not: Prove on-device behavior — that is runs/SPOILER-REVEAL-*.json's job.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildTurnHeaderElement } from "./buildTurnHeaderElement";
import { focusFirstAnswerChunk } from "./answerBubbleNavigation";

vi.mock("./answerBubbleNavigation", () => ({
  focusFirstAnswerChunk: vi.fn(() => true),
}));

const mockedFocusFirstAnswerChunk = vi.mocked(focusFirstAnswerChunk);

function headerProps(expanded: boolean) {
  const el = buildTurnHeaderElement({
    turnId: "turn-1",
    title: "a question",
    expanded,
    onActivate: () => {},
  });
  return el.props as Record<string, unknown>;
}

describe("turn header D-pad Down", () => {
  beforeEach(() => {
    mockedFocusFirstAnswerChunk.mockClear();
    mockedFocusFirstAnswerChunk.mockReturnValue(true);
  });

  it("enters the answer through onMoveDown when the turn is expanded", () => {
    const onMoveDown = headerProps(true).onMoveDown as () => boolean;

    expect(onMoveDown()).toBe(true);
    expect(mockedFocusFirstAnswerChunk).toHaveBeenCalledWith("turn-1");
  });

  it("yields to Steam's own move when the turn is collapsed", () => {
    const onMoveDown = headerProps(false).onMoveDown as () => boolean;

    expect(onMoveDown()).toBe(false);
    expect(mockedFocusFirstAnswerChunk).not.toHaveBeenCalled();
  });

  /* A GamepadEvent direction must be a no-op on onButtonDown, or a press that reaches both
     handlers would enter the answer and then step once more inside it. */
  it("does not double-step: a GamepadEvent direction on onButtonDown is a no-op", () => {
    const onButtonDown = headerProps(true).onButtonDown as (b: unknown) => boolean;

    expect(onButtonDown({ type: "gamepadbuttondown", detail: { button: 10 } })).toBe(false);
    expect(mockedFocusFirstAnswerChunk).not.toHaveBeenCalled();
  });

  it("still enters on a string-shaped press, which desktop keyboards deliver", () => {
    const onButtonDown = headerProps(true).onButtonDown as (b: unknown) => boolean;

    expect(onButtonDown("ArrowDown")).toBe(true);
    expect(mockedFocusFirstAnswerChunk).toHaveBeenCalledWith("turn-1");
  });
});
