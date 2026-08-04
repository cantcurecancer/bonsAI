import { describe, expect, it } from "vitest";

import { isDownDeckButtonEvent, isOkDeckButtonEvent, isUpDeckButtonEvent } from "./focusNavigation";

/**
 * The shape Decky actually delivers to `onButtonDown`: a `GamepadEvent`, which is a `CustomEvent`
 * whose `detail.button` is a numeric `GamepadButton` (`@decky/ui`, `components/FooterLegend.d.ts`).
 */
function gamepadEvent(button: number): unknown {
  return { type: "gamepadbuttondown", detail: { button, source: 0 } };
}

const OK = 1;
const CANCEL = 2;
const DIR_UP = 9;
const DIR_DOWN = 10;

describe("isOkDeckButtonEvent", () => {
  it("accepts A from a gamepad event", () => {
    expect(isOkDeckButtonEvent(gamepadEvent(OK))).toBe(true);
  });

  /*
   * The bug this exists for: D-pad Down on a masked spoiler revealed it. The handler tested "is this
   * a direction?" against a CustomEvent, which stringifies to "[object CustomEvent]" and matches no
   * direction, so every press fell through to the reveal.
   */
  it("rejects D-pad down, which used to reveal the spoiler", () => {
    expect(isOkDeckButtonEvent(gamepadEvent(DIR_DOWN))).toBe(false);
  });

  it("rejects D-pad up", () => {
    expect(isOkDeckButtonEvent(gamepadEvent(DIR_UP))).toBe(false);
  });

  it("rejects B, so cancel does not act like confirm", () => {
    expect(isOkDeckButtonEvent(gamepadEvent(CANCEL))).toBe(false);
  });

  it("accepts a bare button id", () => {
    expect(isOkDeckButtonEvent(OK)).toBe(true);
    expect(isOkDeckButtonEvent(DIR_DOWN)).toBe(false);
  });

  it("accepts the keyboard equivalents", () => {
    expect(isOkDeckButtonEvent("Enter")).toBe(true);
    expect(isOkDeckButtonEvent("ArrowDown")).toBe(false);
  });

  it("rejects null and undefined", () => {
    expect(isOkDeckButtonEvent(null)).toBe(false);
    expect(isOkDeckButtonEvent(undefined)).toBe(false);
  });

  /* A CustomEvent with no usable detail must not be read as a confirmation. */
  it("rejects an event without a numeric button", () => {
    expect(isOkDeckButtonEvent({ detail: {} })).toBe(false);
    expect(isOkDeckButtonEvent({})).toBe(false);
  });
});

describe("direction predicates parse key strings, not gamepad events", () => {
  it("matches the key strings they were written for", () => {
    expect(isDownDeckButtonEvent("ArrowDown")).toBe(true);
    expect(isUpDeckButtonEvent("GamepadDPadUp")).toBe(true);
  });

  /*
   * Documented, not fixed: these do not understand a GamepadEvent, so every `onButtonDown` handler
   * in this repo that tests a direction is inert on device. Harmless where `onMoveDown`/`onMoveUp`
   * already do the work — which is every remaining call site — but do not add a new one expecting
   * it to fire. Tracked in docs/roadmap.md.
   */
  it("does not match a gamepad event (known limitation)", () => {
    expect(isDownDeckButtonEvent(gamepadEvent(DIR_DOWN))).toBe(false);
    expect(isUpDeckButtonEvent(gamepadEvent(DIR_UP))).toBe(false);
  });
});
