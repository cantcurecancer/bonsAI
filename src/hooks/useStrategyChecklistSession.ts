/**
 * Title: Strategy checklist session sync
 * Purpose: Load, persist, and clear per-game Strategy checklist state across Ask mode changes.
 * Used for: useBonsaiAskOrchestration Strategy mode checklist UI.
 * Solves: Checklist survives game switches and disk reload without entangling submit/poll logic.
 * Does not: Render checklist UI or build Ask payloads — see strategyChecklist utils.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Router } from "@decky/ui";

import type { AskModeId } from "../data/bonsaiSettingsSchema";
import type { StrategyChecklistState } from "../types/bonsaiUi";
import {
  clearStrategyChecklistSession,
  loadStrategyChecklistSession,
} from "../utils/strategyChecklistPersistence";
import { peekBonsaiSessionPendingRestore } from "../utils/bonsaiSessionSurvival";

export function useStrategyChecklistSession(askMode: AskModeId) {
  const survivalPeek = peekBonsaiSessionPendingRestore();
  const [strategyChecklist, setStrategyChecklist] = useState<StrategyChecklistState | null>(
    () => survivalPeek?.strategyChecklist ?? null,
  );
  const strategyChecklistRef = useRef<StrategyChecklistState | null>(strategyChecklist);
  useEffect(() => {
    strategyChecklistRef.current = strategyChecklist;
  }, [strategyChecklist]);

  const runningAppIdRef = useRef<string>("");

  const hydrateStrategyChecklistFromDisk = useCallback(async (appId: string) => {
    runningAppIdRef.current = appId;
    try {
      const loaded = await loadStrategyChecklistSession(appId);
      if (runningAppIdRef.current !== appId) return;
      setStrategyChecklist(loaded);
    } catch {
      if (runningAppIdRef.current === appId) setStrategyChecklist(null);
    }
  }, []);

  const [trackedRunningAppId, setTrackedRunningAppId] = useState(
    () => Router.MainRunningApp?.appid?.toString() ?? "",
  );
  useEffect(() => {
    const poll = () => {
      const next = Router.MainRunningApp?.appid?.toString() ?? "";
      setTrackedRunningAppId((prev) => (prev !== next ? next : prev));
    };
    poll();
    const id = window.setInterval(poll, 1500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    void hydrateStrategyChecklistFromDisk(trackedRunningAppId);
  }, [hydrateStrategyChecklistFromDisk, trackedRunningAppId]);

  const prevAskModeRef = useRef(askMode);
  useEffect(() => {
    const prev = prevAskModeRef.current;
    prevAskModeRef.current = askMode;
    if (prev === "strategy" && askMode !== "strategy") {
      const appId = Router.MainRunningApp?.appid?.toString() ?? "";
      setStrategyChecklist(null);
      void clearStrategyChecklistSession(appId).catch(() => {});
    }
  }, [askMode]);

  return {
    strategyChecklist,
    setStrategyChecklist,
    strategyChecklistRef,
    hydrateStrategyChecklistFromDisk,
    trackedRunningAppId,
  };
}
