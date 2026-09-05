/**
 * Title: Stopped-turn notice and reply actions tests
 * Purpose: Pin the fix for roadmap "Stopping a reply leaves no 'Stopped' notice" (two-star, reply,
 *          found 2026-09-04) — a stopped Ask is archived like any completed one (the backend
 *          records the assistant turn on both cancel paths), so `expandedTurnKey` moves off "live"
 *          onto the turn's own id and the old live-only notice/button gating had nowhere to draw.
 * Used for: MainTabChatTranscript archived-turn rendering when `askStopped` is true.
 * Solves: Confirms the "Stopped — partial answer kept." notice and the Helpful / Not really /
 *         Retry buttons reappear on the newest archived turn when it was the one just stopped,
 *         Retry re-asks THIS turn's own question (not the stale `lastExchange`, which a stop
 *         clears to null), and an empty stop (nothing readable kept) still shows nothing — the
 *         behaviour useBonsaiAskOrchestration.ts already deliberately preserves.
 * Does not: Cover useBonsaiAskOrchestration.ts itself (owned by a different lane) — only what
 *           MainTabChatTranscript does with the props it is handed.
 */
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { MainTabChatTranscript } from "./MainTabChatTranscript";
import type { MainTabChatTranscriptProps } from "./MainTabChatTranscript";
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";

/* Focusable/Button must be real DOM nodes or this suite passes for the wrong reason. */
vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

function baseProps(overrides: Partial<MainTabChatTranscriptProps>): MainTabChatTranscriptProps {
  return {
    fullBleedRowStyle: {},
    isAsking: false,
    selectedAttachment: null,
    ollamaContext: {} as MainTabChatTranscriptProps["ollamaContext"],
    unifiedInput: "",
    showSlowWarning: false,
    latencyWarningSeconds: 30,
    ollamaResponse: "",
    elapsedSeconds: null,
    lastApplied: null,
    canSaveDesktopNote: false,
    onOpenDesktopNoteSave: () => {},
    askMode: "speed",
    askThreadCollapsed: [],
    expandedTurnKey: "live",
    askThreadDisplayQuestion: "",
    // A stop clears `lastExchange` to null (useBonsaiAskOrchestration.ts) — reproduced here on
    // purpose rather than left at its default, since that is exactly the state under test.
    lastExchange: null,
    ...overrides,
  };
}

describe("stopped turn — notice and reply actions restored on the archived turn", () => {
  const stoppedTurn: AskThreadCollapsedTurn = {
    id: "stopped-1",
    question: "how do i beat the final boss",
    answer: "Keep your distance and bait the",
  };

  it("shows the Stopped notice and restores Helpful / Not really / Retry", () => {
    const { container, getByLabelText } = render(
      <MainTabChatTranscript
        {...baseProps({
          askThreadCollapsed: [stoppedTurn],
          expandedTurnKey: stoppedTurn.id,
          askStopped: true,
        })}
      />
    );
    expect(container.textContent).toContain("Stopped — partial answer kept.");
    expect(() => getByLabelText("Mark reply helpful")).not.toThrow();
    expect(() => getByLabelText("Mark reply not helpful")).not.toThrow();
    expect(() => getByLabelText("Retry same prompt")).not.toThrow();
  });

  it("Retry re-asks this turn's own question, not a stale lastExchange", () => {
    const onAskOllama = vi.fn();
    const { getByLabelText } = render(
      <MainTabChatTranscript
        {...baseProps({
          askThreadCollapsed: [stoppedTurn],
          expandedTurnKey: stoppedTurn.id,
          askStopped: true,
          onAskOllama,
        })}
      />
    );
    fireEvent.click(getByLabelText("Retry same prompt"));
    expect(onAskOllama).toHaveBeenCalledWith(
      stoppedTurn.question,
      expect.objectContaining({ threadQuestionDisplay: stoppedTurn.question })
    );
  });

  it("shows nothing extra for an empty stop (no readable draft kept)", () => {
    const emptyStopTurn: AskThreadCollapsedTurn = {
      id: "stopped-2",
      question: "how do i beat the final boss",
      // The backend's own fallback for a stop with nothing readable yet
      // (Plugin._cancelled_response_text) — a status, not a kept answer.
      answer: "Request cancelled.",
    };
    const { container, queryByLabelText } = render(
      <MainTabChatTranscript
        {...baseProps({
          askThreadCollapsed: [emptyStopTurn],
          expandedTurnKey: emptyStopTurn.id,
          askStopped: true,
        })}
      />
    );
    expect(container.textContent).not.toContain("Stopped — partial answer kept.");
    expect(container.textContent).not.toContain("Stopped.");
    expect(queryByLabelText("Retry same prompt")).toBeNull();
    expect(queryByLabelText("Mark reply helpful")).toBeNull();
  });

  it("does not show the notice on an older archived turn even when askStopped is true", () => {
    const older: AskThreadCollapsedTurn = { id: "older-1", question: "q1", answer: "a1" };
    const { container, queryByLabelText } = render(
      <MainTabChatTranscript
        {...baseProps({
          askThreadCollapsed: [older, stoppedTurn],
          expandedTurnKey: older.id,
          askStopped: true,
        })}
      />
    );
    expect(container.textContent).not.toContain("Stopped — partial answer kept.");
    expect(queryByLabelText("Retry same prompt")).toBeNull();
  });
});
