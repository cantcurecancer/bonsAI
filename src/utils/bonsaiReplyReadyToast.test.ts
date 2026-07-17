import { afterEach, describe, expect, it, vi } from "vitest";
import { toaster } from "@decky/api";
import { Navigation } from "@decky/ui";
import type { BackgroundRequestStatus } from "../types/backgroundAsk";
import { dismissPhaseToast } from "./bonsaiPhaseToast";
import {
  consumePendingFocusMainTab,
  openBonsaiReplyFromToast,
  resetReplySurfaceState,
  setReplySurfaceVisible,
} from "./bonsaiReplySurface";
import {
  handleAskPollErrorForToast,
  handleAskTerminalForToast,
  resetReplyReadyToastState,
} from "./bonsaiReplyReadyToast";

function terminalStatus(
  overrides: Partial<BackgroundRequestStatus> = {},
): BackgroundRequestStatus {
  return {
    status: "completed",
    request_id: 42,
    question: "hello",
    app_id: "570",
    app_context: "active",
    success: true,
    response: "world",
    applied: null,
    elapsed_seconds: 1,
    error: null,
    started_at: 1,
    completed_at: 2,
    ...overrides,
  };
}

describe("bonsaiReplyReadyToast", () => {
  afterEach(() => {
    dismissPhaseToast();
    resetReplySurfaceState();
    resetReplyReadyToastState();
    vi.clearAllMocks();
  });

  it("shows Reply ready with onClick when the reply surface is hidden", () => {
    setReplySurfaceVisible(false);
    handleAskTerminalForToast(terminalStatus());

    expect(toaster.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Reply ready",
        body: "Tap to open",
        onClick: expect.any(Function),
      }),
    );

    const onClick = vi.mocked(toaster.toast).mock.calls[0]?.[0]?.onClick;
    onClick?.();
    expect(Navigation.OpenQuickAccessMenu).toHaveBeenCalledWith(999);
    expect(consumePendingFocusMainTab()).toBe(true);
    expect(consumePendingFocusMainTab()).toBe(false);
  });

  it("skips toast when the reply surface is already visible", () => {
    setReplySurfaceVisible(true);
    handleAskTerminalForToast(terminalStatus());
    expect(toaster.toast).not.toHaveBeenCalled();

    setReplySurfaceVisible(false);
    handleAskTerminalForToast(terminalStatus({ request_id: 42 }));
    expect(toaster.toast).not.toHaveBeenCalled();
  });

  it("dedupes by request_id", () => {
    setReplySurfaceVisible(false);
    handleAskTerminalForToast(terminalStatus({ request_id: 7 }));
    handleAskTerminalForToast(terminalStatus({ request_id: 7 }));
    expect(toaster.toast).toHaveBeenCalledTimes(1);
  });

  it("shows error toast on failed Ask", () => {
    setReplySurfaceVisible(false);
    handleAskTerminalForToast(
      terminalStatus({
        status: "failed",
        success: false,
        error: "Ollama unreachable",
      }),
    );
    expect(toaster.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Ask failed",
        body: "Ollama unreachable",
      }),
    );
  });

  it("shows error toast on poll failure when surface hidden", () => {
    setReplySurfaceVisible(false);
    handleAskPollErrorForToast(new Error("RPC timeout"));
    expect(toaster.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Ask failed",
      }),
    );
  });

  it("openBonsaiReplyFromToast sets pending Main focus", () => {
    openBonsaiReplyFromToast();
    expect(consumePendingFocusMainTab()).toBe(true);
  });
});
