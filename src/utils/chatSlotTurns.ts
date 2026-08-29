/**
 * Title: Chat slot turn mapper
 * Purpose: Convert persisted slot turns into collapsed Ask transcript pairs.
 * Used for: useChatSlots slot switch and reload after completion.
 * Solves: Preserves trailing unpaired user turn as pendingQuestion (v1 dropped it), and gives
 *         each restored turn the AppID it was asked under instead of a blank one.
 * Does not: Persist turns — Python chat_slot_service owns disk.
 */
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { ChatSlotTurn } from "./chatSlotsApi";

export type CollapsedTurnsResult = {
  collapsed: AskThreadCollapsedTurn[];
  pendingQuestion: string | null;
};

/**
 * Which game a restored turn was about, best answer first.
 *
 * 1. The assistant turn's own AppID — what the backend recorded when the reply landed.
 * 2. The question's AppID, for a reply saved before the field existed but whose question
 *    was not, and for a cancel whose state dict had already been torn down.
 * 3. `fallbackAppId`, the slot's `origin_app_id` — the game the chat was started under.
 *
 * Step 3 is a guess and only step 3 is: a saved chat can outlive the game it began in, so a
 * turn asked after the player switched titles gets labelled with the wrong game. It is still
 * the better default. Chats are per-game in practice, and the alternative is what this
 * function used to do — hardcode "" and tell every consumer no game was running, which is
 * wrong in *every* case rather than an uncommon one. Turns written from here on carry their
 * own AppID and never reach step 3.
 */
function turnAppId(assistant: ChatSlotTurn, question: ChatSlotTurn, fallbackAppId: string): string {
  return (assistant.app_id || "").trim() || (question.app_id || "").trim() || fallbackAppId.trim();
}

export function turnsToCollapsedTurns(turns: ChatSlotTurn[], fallbackAppId = ""): CollapsedTurnsResult {
  const collapsed: AskThreadCollapsedTurn[] = [];
  let pendingQ: ChatSlotTurn | null = null;

  for (const turn of turns) {
    if (turn.role === "user") {
      pendingQ = turn;
    } else if (turn.role === "assistant" && pendingQ) {
      collapsed.push({
        id: pendingQ.id,
        question: pendingQ.text,
        // The friendly caption the user saw, when one was recorded (branch picks and preset
        // sends store it; a plain typed question saves "" and the header falls back to the text).
        questionDisplay: (pendingQ.display_text || "").trim() || undefined,
        answer: turn.text,
        transparency: turn.transparency ?? null,
        appId: turnAppId(turn, pendingQ, fallbackAppId),
        // Still hardcoded, and deliberately: spoiler consent is a live session decision, not
        // something the backend persists per turn. A restored turn re-fences by default.
        spoilerConsentEffective: false,
      });
      pendingQ = null;
    }
  }

  return {
    collapsed,
    // The pending question is pure display (the thread header while an answer is still owed),
    // so the friendly caption wins here outright.
    pendingQuestion: pendingQ ? (pendingQ.display_text || "").trim() || pendingQ.text : null,
  };
}
