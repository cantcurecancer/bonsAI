import { useCallback, useEffect, useRef, useState } from "react";
import { Router } from "@decky/ui";

import type { ChatIdleTimeoutMinutes, ChatThread, ChatThreadSummary } from "../types/chatThreads";
import type { StrategyChecklistState } from "../types/bonsaiUi";
import {
  createChatThreadRpc,
  deleteChatThreadRpc,
  fetchChatThread,
  listChatThreadSummaries,
  saveChatThreadStrategyChecklist,
  turnsToCollapsedPairs,
} from "../utils/chatThreadsApi";
import {
  clearChatSessionActivity,
  isChatSessionIdleExpired,
  touchChatSessionActivity,
} from "../utils/chatThreadIdle";
import { normalizeStrategyChecklistStateFromSession } from "../utils/strategyChecklist";

export type UseChatThreadsArgs = {
  chatIdleTimeoutMinutes: ChatIdleTimeoutMinutes;
};

export function useChatThreads({ chatIdleTimeoutMinutes }: UseChatThreadsArgs) {
  const [summaries, setSummaries] = useState<ChatThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [appIdBannerDismissed, setAppIdBannerDismissed] = useState(false);
  const requestThreadMapRef = useRef<Map<number, string>>(new Map());
  const activeThreadIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  const refreshSummaries = useCallback(async () => {
    const rows = await listChatThreadSummaries();
    setSummaries(rows);
    return rows;
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    const thread = await fetchChatThread(threadId);
    if (thread) setActiveThread(thread);
    return thread;
  }, []);

  const selectThread = useCallback(
    async (threadId: string) => {
      touchChatSessionActivity();
      setAppIdBannerDismissed(false);
      setActiveThreadId(threadId);
      const thread = await loadThread(threadId);
      return thread;
    },
    [loadThread],
  );

  const createThread = useCallback(
    async (args?: { originAppId?: string; appName?: string; firstQuestion?: string }) => {
      touchChatSessionActivity();
      const running = Router.MainRunningApp;
      const thread = await createChatThreadRpc({
        originAppId: args?.originAppId ?? running?.appid?.toString() ?? "",
        appName: args?.appName ?? running?.display_name ?? "",
        firstQuestion: args?.firstQuestion ?? "",
      });
      if (!thread) return null;
      await refreshSummaries();
      setActiveThreadId(thread.id);
      setActiveThread(thread);
      setAppIdBannerDismissed(false);
      return thread;
    },
    [refreshSummaries],
  );

  const ensureActiveThreadForAsk = useCallback(
    async (question: string) => {
      touchChatSessionActivity();
      const existing = activeThreadIdRef.current;
      if (existing) return existing;
      const thread = await createThread({
        firstQuestion: question,
      });
      return thread?.id ?? null;
    },
    [createThread],
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      const ok = await deleteChatThreadRpc(threadId);
      if (!ok) return false;
      if (activeThreadIdRef.current === threadId) {
        setActiveThreadId(null);
        setActiveThread(null);
      }
      await refreshSummaries();
      return true;
    },
    [refreshSummaries],
  );

  const bindRequestToThread = useCallback((requestId: number, threadId: string) => {
    requestThreadMapRef.current.set(requestId, threadId);
  }, []);

  const resolveThreadForRequest = useCallback((requestId: number) => {
    return requestThreadMapRef.current.get(requestId) ?? activeThreadIdRef.current;
  }, []);

  const saveThreadChecklist = useCallback(async (state: StrategyChecklistState) => {
    const tid = activeThreadIdRef.current;
    if (!tid) return;
    await saveChatThreadStrategyChecklist(tid, state);
    setActiveThread((prev) =>
      prev && prev.id === tid ? { ...prev, strategy_checklist: state } : prev,
    );
  }, []);

  const applyThreadToTranscript = useCallback((thread: ChatThread | null) => {
    if (!thread) {
      return { pairs: [], checklist: null as StrategyChecklistState | null, originAppId: "" };
    }
    const pairs = turnsToCollapsedPairs(thread.turns);
    const cl = thread.strategy_checklist
      ? normalizeStrategyChecklistStateFromSession({
          title: thread.strategy_checklist.title,
          items: thread.strategy_checklist.items,
          checked_ids: thread.strategy_checklist.checkedIds,
          app_name: thread.strategy_checklist.appName,
        })
      : null;
    return { pairs, checklist: cl, originAppId: thread.origin_app_id ?? "" };
  }, []);

  const clearActiveUiOnly = useCallback(() => {
    setActiveThreadId(null);
    setActiveThread(null);
    setAppIdBannerDismissed(false);
    requestThreadMapRef.current.clear();
  }, []);

  const evaluateIdleCleanSlate = useCallback(() => {
    if (!isChatSessionIdleExpired(chatIdleTimeoutMinutes)) return false;
    clearChatSessionActivity();
    clearActiveUiOnly();
    return true;
  }, [chatIdleTimeoutMinutes, clearActiveUiOnly]);

  const touchActivity = useCallback(() => {
    touchChatSessionActivity();
  }, []);

  useEffect(() => {
    void refreshSummaries().catch(() => {});
  }, [refreshSummaries]);

  const currentAppId = Router.MainRunningApp?.appid?.toString() ?? "";
  const showAppIdBanner =
    !appIdBannerDismissed &&
    !!activeThread?.origin_app_id &&
    !!currentAppId &&
    activeThread.origin_app_id !== currentAppId;

  return {
    summaries,
    activeThreadId,
    activeThread,
    setActiveThread,
    refreshSummaries,
    selectThread,
    createThread,
    ensureActiveThreadForAsk,
    deleteThread,
    bindRequestToThread,
    resolveThreadForRequest,
    saveThreadChecklist,
    applyThreadToTranscript,
    clearActiveUiOnly,
    evaluateIdleCleanSlate,
    touchActivity,
    showAppIdBanner,
    setAppIdBannerDismissed,
    currentAppId,
  };
}
