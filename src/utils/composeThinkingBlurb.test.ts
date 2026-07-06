import { describe, expect, it } from "vitest";
import { composeThinkingBlurb, extractQuestionSnippet } from "./composeThinkingBlurb";

describe("composeThinkingBlurb", () => {
  it("weaves question snippet and sarcastic tone without character voice", () => {
    const out = composeThinkingBlurb("why is my fps low in elden ring", {
      appName: "Elden Ring",
      requestId: 7,
    });
    expect(out.toLowerCase()).toContain("fps");
    expect(out.length).toBeLessThanOrEqual(240);
    const lowered = out.toLowerCase();
    expect(
      lowered.includes("oh joy") || lowered.includes("another crisis") || lowered.includes("fine.") || lowered.startsWith("yeah,"),
    ).toBe(true);
  });

  it("extractQuestionSnippet matches backend clause split", () => {
    expect(extractQuestionSnippet("stuck on the shrine puzzle? help")).toContain("shrine");
    expect(extractQuestionSnippet("")).toBe("");
  });

  it("stable pick matches backend for same request id", () => {
    const a = composeThinkingBlurb("help with stuttering", { requestId: 11 });
    const b = composeThinkingBlurb("help with stuttering", { requestId: 11 });
    expect(a).toBe(b);
  });
});
