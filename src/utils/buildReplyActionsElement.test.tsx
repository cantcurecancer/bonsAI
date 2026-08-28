import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { buildReplyActionsElement } from "./buildReplyActionsElement";

vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

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
