/**
 * Title: Chat slot turn mapper
 * Purpose: Convert persisted slot turns into collapsed Ask transcript pairs.
 * Used for: useChatSlots slot switch and reload after completion.
 * Solves: Preserves trailing unpaired user turn as pendingQuestion (v1 dropped it).
 * Does not: Persist turns — Python chat_slot_service owns disk.
 */
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { ChatSlotTurn } from "./chatSlotsApi";

export type CollapsedTurnsResult = {
  collapsed: AskThreadCollapsedTurn[];
  pendingQuestion: string | null;
};

export function turnsToCollapsedTurns(turns: ChatSlotTurn[]): CollapsedTurnsResult {
  const collapsed: AskThreadCollapsedTurn[] = [];
  let pendingQ: { id: string; text: string } | null = null;

  for (const turn of turns) {
    if (turn.role === "user") {
      pendingQ = { id: turn.id, text: turn.text };
    } else if (turn.role === "assistant" && pendingQ) {
      collapsed.push({
        id: pendingQ.id,
        question: pendingQ.text,
        answer: turn.text,
        transparency: turn.transparency ?? null,
        appId: "",
        spoilerConsentEffective: false,
      });
      pendingQ = null;
    }
  }

  return {
    collapsed,
    pendingQuestion: pendingQ?.text ?? null,
  };
}
