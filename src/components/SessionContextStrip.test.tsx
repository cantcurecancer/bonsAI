import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { SessionContextStrip } from "./SessionContextStrip";
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { ChatSlotTurnTransparency } from "../utils/inputTransparency";

/*
 * Same reasoning as MainTabBonsaiAiMarkdownChunk.test.tsx: `Focusable` has to render as a real DOM
 * node or this suite passes for the wrong reason.
 */
vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

const CHIP_SNAPSHOT: ChatSlotTurnTransparency = {
  route: "game_context",
  success: true,
  context_chips: [
    {
      id: "chip-1",
      rank: 0,
      label: "Game context",
      attached: true,
      tier_class: "foss",
      body: { title: "Game context", paths: [], bullets: [] },
    },
  ],
};

const ARCHIVED_TURN: AskThreadCollapsedTurn = {
  id: "turn-1",
  question: "How do I dodge the exploders",
  answer: "Keep your distance and strafe.",
  transparency: CHIP_SNAPSHOT,
};

function openPanel(container: HTMLElement) {
  const header = container.querySelector("button");
  if (header) fireEvent.click(header);
}

describe("SessionContextStrip live/archived row de-dup", () => {
  /*
   * Regression guard for "Session context counts the newest turn twice" (roadmap). After a
   * completed Ask, `liveTurn` stays populated by `transparencySnapshot` at the same moment the
   * slot reload archives the identical turn — without de-dup the newest turn rendered as both an
   * archived row and the live row, so a single completed Ask read "(2 turns)".
   */
  it("drops the live row when it matches the newest archived turn", () => {
    const { container, getByText } = render(
      <SessionContextStrip
        archivedTurns={[ARCHIVED_TURN]}
        liveTurn={{
          id: "live",
          label: "How do I dodge the exploders",
          question: "How do I dodge the exploders",
          snapshot: CHIP_SNAPSHOT,
        }}
      />
    );

    expect(getByText(/\(1 turn\)/)).toBeTruthy();

    openPanel(container);
    expect(container.querySelectorAll(".bonsai-session-context-row").length).toBe(1);
  });

  it("keeps both rows when the live turn is genuinely different", () => {
    const { container, getByText } = render(
      <SessionContextStrip
        archivedTurns={[ARCHIVED_TURN]}
        liveTurn={{
          id: "live",
          label: "What's the DPS meta right now",
          question: "What's the DPS meta right now",
          snapshot: CHIP_SNAPSHOT,
        }}
      />
    );

    expect(getByText(/\(2 turns\)/)).toBeTruthy();

    openPanel(container);
    expect(container.querySelectorAll(".bonsai-session-context-row").length).toBe(2);
  });
});
