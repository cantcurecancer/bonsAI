/**
 * Title: Chat slots hook
 * Purpose: List, select, and mutate named chat slots; sync active id ref synchronously.
 * Used for: index.tsx, ChatSlotRow.
 * Solves: Single owner for slot CRUD and active selection without useEffect ref lag.
 * Does not: Submit Asks or poll background status — orchestration hook owns that.
 */
import { useCallback, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Router } from "@decky/ui";

import type { AskThreadCollapsedTurn, AskThreadExpandedTurnKey } from "../types/bonsaiUi";
import {
  createChatSlot,
  deleteChatSlot,
  getChatSlot,
  listChatSlots,
  renameChatSlot,
  type ChatSlotSummary,
} from "../utils/chatSlotsApi";
import { turnsToCollapsedTurns } from "../utils/chatSlotTurns";
import { saveActiveChatSlotId } from "../features/plugin-shell/pluginStorage";

export type UseChatSlotsArgs = {
  activeSlotIdRef: RefObject<string | null>;
  initialActiveSlotId?: string | null;
  setAskThreadCollapsed: Dispatch<SetStateAction<AskThreadCollapsedTurn[]>>;
  setAskThreadDisplayQuestion: Dispatch<SetStateAction<string>>;
  setExpandedTurnKey: Dispatch<SetStateAction<AskThreadExpandedTurnKey>>;
  resetLiveAskPresentation?: () => void;
};

export function useChatSlots({
  activeSlotIdRef,
  initialActiveSlotId = null,
  setAskThreadCollapsed,
  setAskThreadDisplayQuestion,
  setExpandedTurnKey,
  resetLiveAskPresentation,
}: UseChatSlotsArgs) {
  const [summaries, setSummaries] = useState<ChatSlotSummary[]>([]);
  const [activeSlotId, setActiveSlotIdState] = useState<string | null>(
    initialActiveSlotId ?? activeSlotIdRef.current,
  );

  /*
   * The one place the active slot changes, which is why the persistence goes here rather than at
   * each call site: `selectSlot`, `createSlot`, `deleteSlot`, `ensureActiveSlotForAsk` and the
   * *Clear cache* detach all route through it. Writing null clears the stored pointer, so the
   * detach that keeps Clear cache clean (D32) keeps working across a reopen.
   */
  const setActiveSlot = useCallback(
    (id: string | null) => {
      activeSlotIdRef.current = id;
      saveActiveChatSlotId(id);
      setActiveSlotIdState(id);
    },
    [activeSlotIdRef],
  );

  /*
   * `fallbackAppId` is the slot's own `origin_app_id`, used only for turns saved before the
   * backend recorded one per turn. Passing it here rather than defaulting inside the mapper
   * keeps the mapper honest about where the guess comes from.
   */
  const applySlotTranscript = useCallback(
    (turns: Parameters<typeof turnsToCollapsedTurns>[0], fallbackAppId = "") => {
      const { collapsed, pendingQuestion } = turnsToCollapsedTurns(turns, fallbackAppId);
      setAskThreadCollapsed(collapsed);
      setAskThreadDisplayQuestion(pendingQuestion ?? "");
      setExpandedTurnKey(pendingQuestion ? "live" : collapsed.length > 0 ? collapsed[collapsed.length - 1]!.id : "live");
      resetLiveAskPresentation?.();
    },
    [resetLiveAskPresentation, setAskThreadCollapsed, setAskThreadDisplayQuestion, setExpandedTurnKey],
  );

  const refreshSummaries = useCallback(async () => {
    const rows = await listChatSlots();
    setSummaries(rows);
    return rows;
  }, []);

  const reloadActiveSlotTranscript = useCallback(async () => {
    const sid = activeSlotIdRef.current;
    if (!sid) {
      setAskThreadCollapsed([]);
      setAskThreadDisplayQuestion("");
      setExpandedTurnKey("live");
      return;
    }
    const slot = await getChatSlot(sid);
    if (!slot) return;
    applySlotTranscript(slot.turns, slot.origin_app_id ?? "");
  }, [applySlotTranscript, setAskThreadCollapsed, setAskThreadDisplayQuestion, setExpandedTurnKey]);

  const selectSlot = useCallback(
    async (slotId: string | null) => {
      setActiveSlot(slotId);
      if (!slotId) {
        setAskThreadCollapsed([]);
        setAskThreadDisplayQuestion("");
        setExpandedTurnKey("live");
        resetLiveAskPresentation?.();
        return;
      }
      const slot = await getChatSlot(slotId);
      if (!slot) return;
      applySlotTranscript(slot.turns, slot.origin_app_id ?? "");
    },
    [
      applySlotTranscript,
      resetLiveAskPresentation,
      setActiveSlot,
      setAskThreadCollapsed,
      setAskThreadDisplayQuestion,
      setExpandedTurnKey,
    ],
  );

  const createSlot = useCallback(async () => {
    const running = Router.MainRunningApp;
    const slot = await createChatSlot({
      originAppId: running?.appid?.toString() ?? "",
      appName: running?.display_name ?? "",
    });
    if (!slot) return null;
    await refreshSummaries();
    await selectSlot(slot.id);
    return slot;
  }, [refreshSummaries, selectSlot]);

  const renameSlot = useCallback(
    async (slotId: string, label: string) => {
      const saved = await renameChatSlot(slotId, label);
      if (!saved) return false;
      await refreshSummaries();
      return true;
    },
    [refreshSummaries],
  );

  const deleteSlot = useCallback(
    async (slotId: string) => {
      const ok = await deleteChatSlot(slotId);
      if (!ok) return false;
      const wasActive = activeSlotIdRef.current === slotId;
      await refreshSummaries();
      if (wasActive) {
        const rows = await listChatSlots();
        await selectSlot(rows[0]?.id ?? null);
      }
      return true;
    },
    [refreshSummaries, selectSlot],
  );

  const ensureActiveSlotForAsk = useCallback(
    async (question: string) => {
      const existing = activeSlotIdRef.current;
      if (existing) return existing;
      const running = Router.MainRunningApp;
      const slot = await createChatSlot({
        originAppId: running?.appid?.toString() ?? "",
        appName: running?.display_name ?? "",
        firstQuestion: question,
      });
      if (!slot) return null;
      await refreshSummaries();
      setActiveSlot(slot.id);
      return slot.id;
    },
    [refreshSummaries, setActiveSlot],
  );

  return {
    summaries,
    activeSlotId,
    setActiveSlot,
    refreshSummaries,
    reloadActiveSlotTranscript,
    selectSlot,
    createSlot,
    renameSlot,
    deleteSlot,
    ensureActiveSlotForAsk,
  };
}
