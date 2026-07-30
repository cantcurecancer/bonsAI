/**
 * Title: Background Ask polling
 * Purpose: Poll get_background_game_ai_status until a terminal state and fan out to the UI bridge.
 * Used for: useBonsaiAskOrchestration after start_background_game_ai.
 * Solves: Stale poll callbacks when the user submits again or unmounts (sequence invalidation).
 * Does not: Map status payloads to presentation state — caller supplies applyBackgroundStatusToUi.
 */
import { useCallback, useEffect, useRef } from "react";
import { call } from "@decky/api";
import type { BackgroundRequestStatus } from "../types/backgroundAsk";

/** Poll interval while backend ``status`` stays ``pending`` (matches Steam Deck cadence vs RPC load). */
export const BACKGROUND_STATUS_POLL_MS = 1200;
/** Faster poll while token streaming exposes partial_response on pending asks. */
export const BACKGROUND_STREAM_POLL_MS = 150;

export type UseBackgroundGameAiOptions = {
  /** When true, poll at BACKGROUND_STREAM_POLL_MS for the whole pending ask (not only when status.streaming). */
  tokenStreamingEnabledRef?: React.MutableRefObject<boolean>;
};

/**
 * Background ask lifecycle: invalidates stale polls when the user submits again or unmounts,
 * and fans out ``get_background_game_ai_status`` until a terminal state.
 */
export function useBackgroundGameAi(
  applyBackgroundStatusToUi: (status: BackgroundRequestStatus, fallbackQuestion?: string) => void,
  onPollError: (error: unknown) => void,
  options?: UseBackgroundGameAiOptions,
) {
  const askRequestSeqRef = useRef(0);
  const isMountedRef = useRef(true);
  const backgroundPollTimerRef = useRef<number | null>(null);

  const clearBackgroundPollTimer = useCallback(() => {
    if (backgroundPollTimerRef.current != null) {
      window.clearTimeout(backgroundPollTimerRef.current);
      backgroundPollTimerRef.current = null;
    }
  }, []);

  const isRequestActive = useCallback((seq: number) => {
    return isMountedRef.current && seq === askRequestSeqRef.current;
  }, []);

  const startNextRequest = useCallback(() => {
    askRequestSeqRef.current += 1;
    return askRequestSeqRef.current;
  }, []);

  const invalidateRequests = useCallback(() => {
    askRequestSeqRef.current += 1;
    clearBackgroundPollTimer();
  }, [clearBackgroundPollTimer]);

  const startBackgroundStatusPolling = useCallback(
    (seq: number, fallbackQuestion: string = "") => {
      clearBackgroundPollTimer();

      const pollOnce = async () => {
        if (!isRequestActive(seq)) return;
        try {
          const status = await call<[], BackgroundRequestStatus>("get_background_game_ai_status");
          if (!isRequestActive(seq)) return;
          applyBackgroundStatusToUi(status, fallbackQuestion);

          if (status.status === "pending") {
            const fastPoll =
              status.streaming === true || options?.tokenStreamingEnabledRef?.current === true;
            const delayMs = fastPoll ? BACKGROUND_STREAM_POLL_MS : BACKGROUND_STATUS_POLL_MS;
            backgroundPollTimerRef.current = window.setTimeout(() => {
              void pollOnce();
            }, delayMs);
          }
        } catch (e: unknown) {
          if (!isRequestActive(seq)) return;
          onPollError(e);
        }
      };

      void pollOnce();
    },
    [applyBackgroundStatusToUi, clearBackgroundPollTimer, isRequestActive, onPollError, options?.tokenStreamingEnabledRef],
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      askRequestSeqRef.current += 1;
      clearBackgroundPollTimer();
    };
  }, [clearBackgroundPollTimer]);

  return {
    startNextRequest,
    invalidateRequests,
    startBackgroundStatusPolling,
    isRequestActive,
  };
}
