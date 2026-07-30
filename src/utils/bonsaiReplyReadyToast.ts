/**
 * Title: Ask reply ready toast
 * Purpose: Show one terminal toast per completed/failed background Ask when reply surface is hidden.
 * Used for: useBackgroundGameAi and bonsaiAskCompletionWatch poll handlers.
 * Solves: Notify user of finished Ask without spamming duplicate toasts per request_id.
 * Does not: Open QAM or focus Main tab — see bonsaiReplySurface.openBonsaiReplyFromToast.
 */
import type { BackgroundRequestStatus } from "../types/backgroundAsk";
import { formatDeckyRpcError } from "./deckyCall";
import { showPhaseToast } from "./bonsaiPhaseToast";
import { isReplySurfaceVisible, openBonsaiReplyFromToast } from "./bonsaiReplySurface";

const toastedRequestIds = new Set<number>();

function markRequestToasted(requestId: number | null): void {
  if (requestId != null && Number.isFinite(requestId)) {
    toastedRequestIds.add(requestId);
  }
}

function wasRequestToasted(requestId: number | null): boolean {
  return requestId != null && Number.isFinite(requestId) && toastedRequestIds.has(requestId);
}

function truncateToastBody(text: string, maxLen = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

/** Notify once per completed/failed Ask when the reply surface is not already visible. */
export function handleAskTerminalForToast(status: BackgroundRequestStatus): void {
  const requestId = status.request_id;

  if (wasRequestToasted(requestId)) return;

  if (isReplySurfaceVisible()) {
    markRequestToasted(requestId);
    return;
  }

  if (status.status === "completed" && status.success) {
    showPhaseToast({
      title: "Reply ready",
      body: "Tap to open",
      duration: 4000,
      onClick: openBonsaiReplyFromToast,
    });
    markRequestToasted(requestId);
    return;
  }

  if (status.status === "failed" || (status.status === "completed" && !status.success)) {
    const body =
      truncateToastBody(status.error ?? "") ||
      truncateToastBody(status.response ?? "") ||
      "Something went wrong.";
    showPhaseToast({
      title: "Ask failed",
      body,
      duration: 5000,
    });
    markRequestToasted(requestId);
  }
}

/** Background status poll failed while QAM was closed — surface a single error toast. */
export function handleAskPollErrorForToast(error: unknown): void {
  if (isReplySurfaceVisible()) return;
  const body = truncateToastBody(formatDeckyRpcError(error));
  showPhaseToast({
    title: "Ask failed",
    body: body || "Connection error.",
    duration: 5000,
  });
}

/** Test-only reset. */
export function resetReplyReadyToastState(): void {
  toastedRequestIds.clear();
}
