import { describe, expect, it } from "vitest";
import { composeChipAutofillPrefix, replyMicroActionById } from "./replyMicroActions";

describe("replyMicroActions", () => {
  it("composes prefix ending with original question", () => {
    const action = replyMicroActionById("too_long");
    expect(action).toBeTruthy();
    const text = composeChipAutofillPrefix(action!, "Why is FPS low?");
    expect(text.endsWith("Why is FPS low?")).toBe(true);
    expect(text).toContain("Original question:");
  });

  it("composes the unfenced-spoiler prefix pointing at the bonsai-spoiler fence syntax", () => {
    const action = replyMicroActionById("unfenced_spoiler");
    expect(action).toBeTruthy();
    const text = composeChipAutofillPrefix(action!, "How do I beat the final boss?");
    expect(text.endsWith("How do I beat the final boss?")).toBe(true);
    expect(text).toContain("Original question:");
    expect(text).toContain("```bonsai-spoiler```");
  });
});
