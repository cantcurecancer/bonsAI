import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { buildAnswerBubbleElement } from "./buildAnswerBubbleElement";
import { orderedAnswerStops, resetAnswerStopRegistry } from "./answerStopRegistry";
import { registerAnswerBubbleEl } from "./answerBubbleElRegistry";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";

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

  it("drops every stop when the bubble unmounts", () => {
    const { container } = renderBubble(FENCED_BODY, true);
    const bubble = container.querySelector(".bonsai-chat-ai-bubble") as HTMLElement;
    expect(orderedAnswerStops(ANSWER_KEY, bubble)).not.toHaveLength(0);

    cleanup();

    expect(orderedAnswerStops(ANSWER_KEY, bubble)).toHaveLength(0);
  });
});
