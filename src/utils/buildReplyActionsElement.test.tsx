/**
 * Title: Reply actions element tests
 * Purpose: Cover the refine chip row, specifically that the unfenced-spoiler chip renders and
 *          reports its id back through onChip.
 * Used for: buildReplyActionsElement.tsx regression coverage.
 * Solves: The chip row had no render test at all before this file — every existing chip's wiring
 *         was only exercised indirectly through data-layer tests.
 * Does not: Cover D-pad focus hops between rows — see liveTurnFocusGraph tests for that.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { buildReplyActionsElement } from "./buildReplyActionsElement";

afterEach(() => {
  cleanup();
});

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
