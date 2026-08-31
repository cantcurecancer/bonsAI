/**
 * Title: Chat slots hook
 * Purpose: List, select, and mutate named chat slots; sync active id ref synchronously.
 * Used for: index.tsx, ChatSlotRow.
 * Solves: Single owner for slot CRUD and active selection without useEffect ref lag.
 * Does not: Submit Asks or poll background status — orchestration hook owns that.
 */
import { useCallback, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
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
  /** True while the backend is generating into this slot. A slot mid-answer is never swept. */
  isSlotGenerating?: (slotId: string) => boolean;
};

export function useChatSlots({
  activeSlotIdRef,
  initialActiveSlotId = null,
  setAskThreadCollapsed,
  setAskThreadDisplayQuestion,
  setExpandedTurnKey,
  resetLiveAskPresentation,
  isSlotGenerating,
}: UseChatSlotsArgs) {
  const [summaries, setSummaries] = useState<ChatSlotSummary[]>([]);
  const [activeSlotId, setActiveSlotIdState] = useState<string | null>(
    initialActiveSlotId ?? activeSlotIdRef.current,
  );
  /** Mirror of `summaries` for callbacks that must not re-close over the list on every refresh. */
  const summariesRef = useRef<ChatSlotSummary[]>([]);
  /** Turns on screen for the active slot; -1 until a transcript has been applied. */
  const activeSlotTurnCountRef = useRef(-1);

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
      /* A pending question counts: a slot whose first answer is still being written is in use. */
      activeSlotTurnCountRef.current = collapsed.length + (pendingQuestion ? 1 : 0);
      setAskThreadCollapsed(collapsed);
      setAskThreadDisplayQuestion(pendingQuestion ?? "");
      setExpandedTurnKey(pendingQuestion ? "live" : collapsed.length > 0 ? collapsed[collapsed.length - 1]!.id : "live");
      resetLiveAskPresentation?.();
    },
    [resetLiveAskPresentation, setAskThreadCollapsed, setAskThreadDisplayQuestion, setExpandedTurnKey],
  );

  const refreshSummaries = useCallback(async () => {
    const rows = await listChatSlots();
    summariesRef.current = rows;
    setSummaries(rows);
    return rows;
  }, []);

  /*
   * The dingleberry sweep (decision D42, option 2, locked 2026-08-31): a chat that was created
   * and then never used — zero turns, still wearing the default "New chat" name — deletes itself
   * when the user switches away from it. Left alone, such a chat sits in the rotation forever
   * looking almost identical to the [+] screen, which is how "there are two new chat screens"
   * got reported. A renamed empty chat is kept (the rename says "I mean to use this"), and a slot
   * the backend is generating into is never touched: its first turns simply have not landed yet.
   */
  const sweepIfNeverUsed = useCallback(
    (slotId: string, turnCount: number) => {
      if (turnCount !== 0) return;
      if (isSlotGenerating?.(slotId)) return;
      const label = summariesRef.current.find((s) => s.id === slotId)?.label ?? "";
      if (label !== "New chat") return;
      void deleteChatSlot(slotId).then((ok) => {
        if (ok) void refreshSummaries();
      });
    },
    [isSlotGenerating, refreshSummaries],
  );

  const reloadActiveSlotTranscript = useCallback(async () => {
    /*
     * The slot list is stale the moment an answer archives: appending the first turn renames the
     * slot after its question (chat_slot_service.append_turn), and every append bumps updated_at,
     * which is the row's ordering. Without this the row kept saying "New chat" over a finished
     * conversation — seen on device 2026-08-31. Fire-and-forget: the transcript below must not
     * wait on the list.
     */
    void refreshSummaries();
    const sid = activeSlotIdRef.current;
    if (!sid) {
      activeSlotTurnCountRef.current = -1;
      setAskThreadCollapsed([]);
      setAskThreadDisplayQuestion("");
      setExpandedTurnKey("live");
      return;
    }
    const slot = await getChatSlot(sid);
    if (!slot) return;
    applySlotTranscript(slot.turns, slot.origin_app_id ?? "");
  }, [applySlotTranscript, refreshSummaries, setAskThreadCollapsed, setAskThreadDisplayQuestion, setExpandedTurnKey]);

  const selectSlot = useCallback(
    async (slotId: string | null) => {
      /* Captured before anything below overwrites them: they describe the slot being LEFT. */
      const leavingId = activeSlotIdRef.current;
      const leavingTurnCount = activeSlotTurnCountRef.current;
      setActiveSlot(slotId);
      if (!slotId) {
        activeSlotTurnCountRef.current = -1;
        setAskThreadCollapsed([]);
        setAskThreadDisplayQuestion("");
        setExpandedTurnKey("live");
        resetLiveAskPresentation?.();
      } else {
        const slot = await getChatSlot(slotId);
        if (slot) applySlotTranscript(slot.turns, slot.origin_app_id ?? "");
      }
      if (leavingId && leavingId !== slotId) {
        sweepIfNeverUsed(leavingId, leavingTurnCount);
      }
    },
    [
      applySlotTranscript,
      resetLiveAskPresentation,
      setActiveSlot,
      setAskThreadCollapsed,
      setAskThreadDisplayQuestion,
      setExpandedTurnKey,
      sweepIfNeverUsed,
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
