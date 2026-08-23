import { describe, expect, it } from "vitest";

import { turnsToCollapsedTurns } from "./chatSlotTurns";

describe("turnsToCollapsedTurns", () => {
  it("preserves trailing unpaired user turn as pendingQuestion", () => {
    const { collapsed, pendingQuestion } = turnsToCollapsedTurns([
      { id: "u1", role: "user", text: "first?" },
      { id: "a1", role: "assistant", text: "first answer" },
      { id: "u2", role: "user", text: "still waiting" },
    ]);
    expect(collapsed).toHaveLength(1);
    expect(collapsed[0]?.question).toBe("first?");
    expect(pendingQuestion).toBe("still waiting");
  });

  it("returns empty pending when turns end on assistant", () => {
    const { collapsed, pendingQuestion } = turnsToCollapsedTurns([
      { id: "u1", role: "user", text: "q" },
      { id: "a1", role: "assistant", text: "a" },
    ]);
    expect(collapsed).toHaveLength(1);
    expect(pendingQuestion).toBeNull();
  });

  it("carries the assistant turn's persisted transparency snapshot onto the collapsed turn", () => {
    // Regression: this used to be hardcoded to null for every restored turn, which made
    // SessionContextStrip always report exactly one archived turn regardless of how many
    // questions were actually asked in the slot (chipsFromSnapshot needs context_chips).
    const { collapsed } = turnsToCollapsedTurns([
      { id: "u1", role: "user", text: "first?" },
      {
        id: "a1",
        role: "assistant",
        text: "first answer",
        transparency: {
          route: "ollama",
          success: true,
          context_chips: [
            { id: "kb", rank: 1, label: "KB", attached: true, tier_class: "", body: { title: "t", paths: [], bullets: [] } },
          ],
          overflow_skips: [],
        },
      },
    ]);
    expect(collapsed[0]?.transparency?.context_chips).toHaveLength(1);
    expect(collapsed[0]?.transparency?.route).toBe("ollama");
  });

  it("keeps transparency null when the persisted turn carries none", () => {
    const { collapsed } = turnsToCollapsedTurns([
      { id: "u1", role: "user", text: "q" },
      { id: "a1", role: "assistant", text: "a" },
    ]);
    expect(collapsed[0]?.transparency).toBeNull();
  });
});
