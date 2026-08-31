/**
 * Title: [+] create-position screen tests
 * Purpose: Pin what the create position shows and, as importantly, what it hides.
 * Used for: Regression coverage for the "two new chat screens" report, 2026-08-31.
 * Solves: Cycling onto [+] leaves the active slot alone by design, so anything slot-specific that
 *         keeps rendering there — the session context strip, Save chat — describes a slot the
 *         screen claims not to be. On device that made [+] and a real empty slot look like
 *         interchangeable "new chat screens".
 * Does not: Cover the Ask-from-[+] flow (create first, then submit) — that lives in MainTab and
 *           is proven on-Deck (CHAT-SLOTS-V3-15).
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { MainTabChatTranscript } from "./MainTabChatTranscript";
import type { MainTabChatTranscriptProps } from "./MainTabChatTranscript";
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { TransparencySnapshot } from "../utils/inputTransparency";

/* Focusable/Button must be real DOM nodes or this suite passes for the wrong reason. */
vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

const TURNS: AskThreadCollapsedTurn[] = [
  { id: "t1", question: "old question", answer: "old answer" },
];

function renderTranscript(overrides: Partial<MainTabChatTranscriptProps> = {}) {
  const props: MainTabChatTranscriptProps = {
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
    canSaveDesktopNote: true,
    onOpenDesktopNoteSave: () => {},
    askMode: "speed",
    askThreadCollapsed: TURNS,
    expandedTurnKey: "t1",
    askThreadDisplayQuestion: "",
    transparencySnapshot: { raw_question: "old question" } as TransparencySnapshot,
    ...overrides,
  };
  return render(<MainTabChatTranscript {...props} />);
}

describe("the [+] create-position screen", () => {
  it("shows the empty state and hides the active slot's transcript", () => {
    const { container } = renderTranscript({ showEmptySlotPreview: true });
    expect(container.querySelector(".bonsai-chat-empty-state")).not.toBeNull();
    expect(container.querySelector(".bonsai-chat-turn-slot")).toBeNull();
    expect(container.textContent).not.toContain("old question");
  });

  it("hides the active slot's session context strip and Save chat", () => {
    const { container } = renderTranscript({ showEmptySlotPreview: true });
    expect(container.querySelector(".bonsai-session-context-strip")).toBeNull();
    expect(container.querySelector(".bonsai-save-chat-desktop-row")).toBeNull();
  });

  /* The strip itself renders only when turns carry transparency snapshots (its own suite covers
     that); Save chat is unconditional, so it is the witness that the gate is [+]-only. */
  it("keeps Save chat on an ordinary slot", () => {
    const { container } = renderTranscript();
    expect(container.querySelector(".bonsai-save-chat-desktop-row")).not.toBeNull();
    expect(container.textContent).toContain("old question");
  });
});
