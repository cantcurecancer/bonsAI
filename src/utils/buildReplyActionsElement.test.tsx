/**
 * Title: Reply actions element tests
 * Purpose: Cover the reply action row's controls — the refine chip row (specifically that the
 *          unfenced-spoiler chip renders and reports its id back through onChip) and the Copy
 *          control (renders only when getAnswerCopyText is supplied).
 * Used for: buildReplyActionsElement.tsx regression coverage.
 * Solves: The chip row had no render test at all before this file — every existing chip's wiring
 *         was only exercised indirectly through data-layer tests.
 * Does not: Cover D-pad focus hops between rows — see liveTurnFocusGraph tests for that.
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { buildReplyActionsElement } from "./buildReplyActionsElement";
import { registerAnswerBubbleEl } from "./answerBubbleElRegistry";
import { registerAnswerStop, resetAnswerStopRegistry } from "./answerStopRegistry";
import { resetUiDocument } from "./uiDocument";

vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

afterEach(() => {
  cleanup();
});

/*
 * Move handlers live on nested Focusable rows inside the returned tree (the utility row's own
 * onMoveUp/onMoveDown, not the outer reply-actions Focusable's), and the fake Decky harness strips
 * onMove* before it ever reaches the DOM (see fakeDeckyUi.tsx) — so a handler can only be reached by
 * walking the unrendered React element tree and reading it off the matching node's props, the same
 * technique buildTurnHeaderElement.test.tsx uses for the single-Focusable case.
 */
function findByClassName(node: React.ReactNode, className: string): React.ReactElement | null {
  if (node == null || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByClassName(child, className);
      if (found) return found;
    }
    return null;
  }
  if (!React.isValidElement(node)) return null;
  const props = node.props as Record<string, unknown>;
  if (typeof props.className === "string" && props.className.split(" ").includes(className)) {
    return node;
  }
  return findByClassName(props.children as React.ReactNode, className);
}

describe("buildReplyActionsElement refine chip row", () => {
  it("renders the unfenced-spoiler chip alongside the other refine chips once rated down", () => {
    const onChip = vi.fn();
    const el = buildReplyActionsElement({
      replyKey: "r1",
      rating: "down",
      onRate: () => {},
      showFeedback: true,
      onChip,
    });
    expect(el).not.toBeNull();
    render(el!);

    expect(screen.getByLabelText("Bad information")).toBeTruthy();
    expect(screen.getByLabelText("Misidentified game/problem")).toBeTruthy();
    expect(screen.getByLabelText("Unfenced spoiler")).toBeTruthy();
  });

  it("reports unfenced_spoiler through onChip when that chip is pressed", () => {
    const onChip = vi.fn();
    const el = buildReplyActionsElement({
      replyKey: "r1",
      rating: "down",
      onRate: () => {},
      showFeedback: true,
      onChip,
    });
    render(el!);

    fireEvent.click(screen.getByLabelText("Unfenced spoiler"));

    expect(onChip).toHaveBeenCalledWith("unfenced_spoiler");
  });

  it("does not render refine chips before the reply is rated down", () => {
    const onChip = vi.fn();
    const el = buildReplyActionsElement({
      replyKey: "r1",
      rating: null,
      onRate: () => {},
      showFeedback: true,
      onChip,
    });
    render(el!);

    expect(screen.queryByLabelText("Unfenced spoiler")).toBeNull();
  });
});

describe("buildReplyActionsElement Copy control", () => {
  it("renders a Copy button in the utility row when getAnswerCopyText is supplied", () => {
    const el = buildReplyActionsElement({
      replyKey: "live",
      rating: "up",
      onRate: () => {},
      showFeedback: true,
      onRetry: () => {},
      getAnswerCopyText: () => "the answer text",
    });
    render(<>{el}</>);
    expect(screen.getByText("Copy")).toBeTruthy();
  });

  it("does not render a Copy button when getAnswerCopyText is not supplied", () => {
    const el = buildReplyActionsElement({
      replyKey: "live",
      rating: "up",
      onRate: () => {},
      showFeedback: true,
      onRetry: () => {},
    });
    render(<>{el}</>);
    expect(screen.queryByText("Copy")).toBeNull();
  });

  it("shows the utility row (and Copy) even with no Retry and no transparency toggle", () => {
    const el = buildReplyActionsElement({
      replyKey: "live",
      rating: null,
      onRate: () => {},
      showFeedback: false,
      getAnswerCopyText: () => "answer",
    });
    render(<>{el}</>);
    expect(screen.getByText("Copy")).toBeTruthy();
    expect(screen.queryByText("Retry")).toBeNull();
  });

  it("returns null when there is nothing to show, Copy included", () => {
    const el = buildReplyActionsElement({
      replyKey: "live",
      rating: null,
      onRate: () => {},
      showFeedback: false,
    });
    expect(el).toBeNull();
  });
});

/*
 * Up from the utility row (Retry / Show details), the last fallback before yielding to Steam.
 * Measured shape, already documented on `upIntoGlossaryChip`: with no thumbs row, no refinement
 * chips and no DRG glossary chip in view, Up used to yield and land on the bare answer bubble — a
 * second Up was needed to reach its last section. Same double landing as Down from the turn header
 * (roadmap: "Down from the chat slot lands on the whole reply before its first section"), approached
 * from underneath.
 */
describe("buildReplyActionsElement Up from the utility row into the answer", () => {
  afterEach(() => {
    resetAnswerStopRegistry();
    resetUiDocument();
    registerAnswerBubbleEl("live", null);
    document.body.innerHTML = "";
  });

  function registerBubbleWithStops(count: number): HTMLElement[] {
    const bubble = document.createElement("div");
    bubble.className = "bonsai-chat-ai-bubble";
    document.body.appendChild(bubble);
    registerAnswerBubbleEl("live", bubble);

    const stops: HTMLElement[] = [];
    for (let i = 0; i < count; i++) {
      const stop = document.createElement("div");
      stop.className = "bonsai-answer-stop";
      bubble.appendChild(stop);
      registerAnswerStop("live", i, stop);
      stops.push(stop);
    }
    return stops;
  }

  it("lands on the bubble's last section when no thumbs, chips or glossary chip claim the press", () => {
    const stops = registerBubbleWithStops(2);
    const el = buildReplyActionsElement({
      replyKey: "live",
      rating: null,
      onRate: () => {},
      showFeedback: false, // no thumbs row
      onToggleTransparency: () => {}, // utility row renders (Show details)
    });

    const utilityRow = findByClassName(el, "bonsai-chat-reply-actions-row--utility");
    expect(utilityRow).not.toBeNull();
    const onMoveUp = (utilityRow!.props as Record<string, unknown>).onMoveUp as () => boolean;

    expect(onMoveUp()).toBe(true);
    expect(document.activeElement).toBe(stops[stops.length - 1]);
  });

  it("still yields to Steam when the answer has no registered sections at all", () => {
    // No bubble registered under "live" — the pre-fix behavior (yield, Steam lands on the bubble)
    // stays correct for the one case that genuinely has nothing to enter.
    const el = buildReplyActionsElement({
      replyKey: "live",
      rating: null,
      onRate: () => {},
      showFeedback: false,
      onToggleTransparency: () => {},
    });

    const utilityRow = findByClassName(el, "bonsai-chat-reply-actions-row--utility");
    const onMoveUp = (utilityRow!.props as Record<string, unknown>).onMoveUp as () => boolean;

    expect(onMoveUp()).toBe(false);
  });
});
