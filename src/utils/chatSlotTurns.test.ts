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
});
