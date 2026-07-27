import { describe, expect, it } from "vitest";
import {
  extractAskedBeatEntity,
  unwrapAskedEntitySpoilerFences,
} from "./unwrapAskedEntitySpoilerFences";

describe("unwrapAskedEntitySpoilerFences", () => {
  it("extracts Glyphid Dreadnought from beat phrasing", () => {
    expect(extractAskedBeatEntity("How do I beat Glyphid Dreadnought?")).toBe(
      "Glyphid Dreadnought"
    );
  });

  it("unwraps fence that contains the asked entity", () => {
    const q = "How do I beat Glyphid Dreadnought?";
    const raw = [
      "Here is the plan.",
      "",
      "```bonsai-spoiler",
      "Focus fire Glyphid Dreadnought weak points while kiting.",
      "```",
      "",
      "Pick a branch below.",
    ].join("\n");
    const out = unwrapAskedEntitySpoilerFences(raw, q);
    expect(out).not.toContain("```bonsai-spoiler");
    expect(out).toContain("Focus fire Glyphid Dreadnought weak points while kiting.");
  });

  it("keeps unrelated spoiler fences when AppID is narrative", () => {
    const q = "How do I beat Glyphid Dreadnought?";
    const raw = [
      "```bonsai-spoiler",
      "The true ending is that the dwarf retires.",
      "```",
    ].join("\n");
    expect(unwrapAskedEntitySpoilerFences(raw, { question: q, appId: "413150" })).toContain(
      "```bonsai-spoiler"
    );
  });

  it("unwraps all fences for known low-spoiler-risk AppIDs", () => {
    const raw = [
      "```bonsai-spoiler",
      "Dodge the charge and focus the crystal.",
      "```",
    ].join("\n");
    const out = unwrapAskedEntitySpoilerFences(raw, { appId: "2321470" });
    expect(out).not.toContain("```bonsai-spoiler");
    expect(out).toContain("Dodge the charge and focus the crystal.");
  });
});
