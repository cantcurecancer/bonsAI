import { describe, expect, it } from "vitest";
import { stripAssistantDisplayTags } from "./stripAssistantDisplayTags";

describe("stripAssistantDisplayTags", () => {
  it("removes closed bonsai-status tags", () => {
    const raw = "<bonsai-status>Checking GPU</bonsai-status>\n\nHello.";
    expect(stripAssistantDisplayTags(raw)).toBe("Hello.");
  });

  it("removes multiple status tags", () => {
    const raw =
      "<bonsai-status>One</bonsai-status>\n\nBody\n\n<bonsai-status>Two</bonsai-status>\n\nTail.";
    expect(stripAssistantDisplayTags(raw)).toBe("Body\n\nTail.");
  });

  it("hides incomplete open status tag", () => {
    expect(stripAssistantDisplayTags("Intro\n<bonsai-status>Still going")).toBe("Intro");
  });

  it("removes bracket strategy branch tag remnants", () => {
    const raw = 'Tips here.\n\n[bonsai-strategy-branches] ({"question":"Where?","options":[]})';
    expect(stripAssistantDisplayTags(raw)).toBe("Tips here.");
  });
});
