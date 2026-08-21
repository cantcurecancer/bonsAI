import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { buildAnswerBubbleElement, stopNavProps } from "./buildAnswerBubbleElement";
import { orderedAnswerStops, resetAnswerStopRegistry } from "./answerStopRegistry";
import { registerAnswerBubbleEl } from "./answerBubbleElRegistry";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";
import { SPOILER_STREAM_MASK_LABEL } from "./streamMarkdownPrepare";

const ANSWER_KEY = "live";

/*
 * Plain prose is a single section while streaming — prepareStreamMarkdown only closes a block at a
 * fence boundary — so a body with a fence in it is what produces a multi-section stack to walk.
 */
const FENCED_BODY = ["Intro line.", "", "```bash", "echo hi", "```", "", "Tail text"].join("\n");

function renderBubble(body: string, streaming: boolean) {
  const el = buildAnswerBubbleElement({
    body,
    streaming,
    spoilerMaskingEnabled: true,
    maxWidthCss: "100%",
    answerKey: ANSWER_KEY,
  });
  expect(el).not.toBeNull();
  return render(el!);
}

function stopsIn(container: HTMLElement): HTMLElement[] {
  const bubble = container.querySelector(".bonsai-chat-ai-bubble") as HTMLElement | null;
  expect(bubble).not.toBeNull();
  return orderedAnswerStops(ANSWER_KEY, bubble!);
}

describe("answer bubble section stops", () => {
  beforeEach(() => {
    resetAnswerStopRegistry();
    registerAnswerBubbleEl(ANSWER_KEY, null);
  });

  afterEach(() => {
    cleanup();
  });

  it("registers one stop per streamed section", () => {
    const { container } = renderBubble(FENCED_BODY, true);

    // Closed prose, the closed fence, and the live tail.
    expect(stopsIn(container)).toHaveLength(3);
  });

  it("registers one stop per chunk once the answer is final", () => {
    const { container } = renderBubble(FENCED_BODY, false);

    expect(stopsIn(container)).toHaveLength(splitResponseIntoChunks(FENCED_BODY).length);
  });

  /*
   * T3, the moment streaming stops. The layout is rebuilt from splitResponseIntoChunks, so the
   * section boundaries change and focus may jump — that is the accepted trade (locked option C).
   * What must not happen is the registry keeping the stream layout's entries: a walk that focuses an
   * unmounted node swallows the press and leaves the user stuck.
   */
  it("rebuilds the stops when streaming finishes, leaving none of the old ones behind", () => {
    const { container, rerender } = renderBubble(FENCED_BODY, true);
    const streamed = stopsIn(container);
    expect(streamed.length).toBeGreaterThan(0);

    rerender(
      buildAnswerBubbleElement({
        body: FENCED_BODY,
        streaming: false,
        spoilerMaskingEnabled: true,
        maxWidthCss: "100%",
        answerKey: ANSWER_KEY,
      })!
    );

    const final = stopsIn(container);
    expect(final).toHaveLength(splitResponseIntoChunks(FENCED_BODY).length);
    for (const stop of final) {
      expect(stop.isConnected).toBe(true);
      expect(stop.hasAttribute("data-bonsai-stream-preview")).toBe(false);
    }
  });

  /* An open fence holds the body back behind a wait chip, and that chip is a stop like any other —
     otherwise Down would have nothing to land on for as long as the model stays inside the fence. */
  it("makes the wait chip a stop while a fence is still open", () => {
    const { container } = renderBubble("Intro line.\n\n```bash\necho hi", true);

    const stops = stopsIn(container);
    expect(stops).toHaveLength(2);
    expect(stops[1]!.className).toContain("bonsai-ai-response-chunk--stream-wait");
  });

  /*
   * Decky hands `onButtonDown` a GamepadEvent, not a key string, and a stop's `onButtonDown` is its
   * only direction handler. The string predicates the bubble uses alongside its own `onMoveDown`
   * stringify to "[object Object]" and match nothing — wiring those here would have shipped a stop
   * that looks correct and never moves. Same failure that made the spoiler fence reveal itself on a
   * D-pad press (focusNavigation.ts:69-77).
   */
  describe("what a section does with a press", () => {
    const gamepad = (button: number) => ({ type: "gamepadbuttondown", detail: { button } });
    const DIR_UP = 9;
    const DIR_DOWN = 10;
    const OK = 1;

    it("walks on a real gamepad direction event", () => {
      const down = vi.fn(() => true);
      const up = vi.fn(() => true);
      const onButtonDown = stopNavProps(down, up).onButtonDown as (b: unknown) => boolean;

      expect(onButtonDown(gamepad(DIR_DOWN))).toBe(true);
      expect(down).toHaveBeenCalledTimes(1);

      expect(onButtonDown(gamepad(DIR_UP))).toBe(true);
      expect(up).toHaveBeenCalledTimes(1);
    });

    /* A on a section must not act — a spoiler wait chip is the section that makes this matter. */
    it("ignores A", () => {
      const down = vi.fn(() => true);
      const up = vi.fn(() => true);
      const onButtonDown = stopNavProps(down, up).onButtonDown as (b: unknown) => boolean;

      expect(onButtonDown(gamepad(OK))).toBe(false);
      expect(down).not.toHaveBeenCalled();
      expect(up).not.toHaveBeenCalled();
    });

    /* Returning false is what lets the press fall through and leave the bubble at either end. */
    it("reports the walk's own answer, so an exhausted walk yields", () => {
      const onButtonDown = stopNavProps(
        () => false,
        () => false
      ).onButtonDown as (b: unknown) => boolean;

      expect(onButtonDown(gamepad(DIR_DOWN))).toBe(false);
    });
  });

  it("drops every stop when the bubble unmounts", () => {
    const { container } = renderBubble(FENCED_BODY, true);
    const bubble = container.querySelector(".bonsai-chat-ai-bubble") as HTMLElement;
    expect(orderedAnswerStops(ANSWER_KEY, bubble)).not.toHaveLength(0);

    cleanup();

    expect(orderedAnswerStops(ANSWER_KEY, bubble)).toHaveLength(0);
  });

  it("unwraps spoiler fences when consent is effective even if masking is off", () => {
    const body = [
      "Intro.",
      "",
      "```bonsai-spoiler",
      "Secret boss pattern.",
      "```",
    ].join("\n");
    const el = buildAnswerBubbleElement({
      body,
      streaming: false,
      spoilerMaskingEnabled: false,
      maxWidthCss: "100%",
      answerKey: ANSWER_KEY,
      spoilerConsentEffective: true,
    });
    const { container } = render(el!);
    expect(container.textContent).toContain("Secret boss pattern.");
    expect(container.textContent).not.toContain("bonsai-spoiler");
  });

  /* R4: the spoiler mask chip must not flash for a fence the turn already qualifies to unwrap
     once it closes — DRG Survivor's AppID is on the low-narrative allowlist. */
  it("streams a low-narrative-title spoiler fence as prose instead of a mid-stream mask chip", () => {
    const body = [
      "Here is the plan.",
      "",
      "```bonsai-spoiler",
      "Dodge the charge and focus the crystal",
    ].join("\n");
    const el = buildAnswerBubbleElement({
      body,
      streaming: true,
      spoilerMaskingEnabled: true,
      maxWidthCss: "100%",
      answerKey: ANSWER_KEY,
      appId: "2321470",
    });
    const { container } = render(el!);
    expect(container.textContent).toContain("Dodge the charge and focus the crystal");
    expect(container.textContent).not.toContain(SPOILER_STREAM_MASK_LABEL);
  });

  it("still shows the mid-stream mask chip on a narrative title with no entity named", () => {
    const body = [
      "Here is the plan.",
      "",
      "```bonsai-spoiler",
      "The true ending is that the dwarf retires",
    ].join("\n");
    const el = buildAnswerBubbleElement({
      body,
      streaming: true,
      spoilerMaskingEnabled: true,
      maxWidthCss: "100%",
      answerKey: ANSWER_KEY,
      askQuestion: "Where should I go?",
      appId: "1174180",
    });
    const { container } = render(el!);
    expect(container.textContent).toContain(SPOILER_STREAM_MASK_LABEL);
    expect(container.textContent).not.toContain("dwarf retires");
  });
});
