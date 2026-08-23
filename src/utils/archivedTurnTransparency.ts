/**
 * Title: Archived turn transparency resolver
 * Purpose: Decide which transparency snapshot an expanded archived turn should show.
 * Used for: MainTabChatTranscript's Show details row on slot-restored turns.
 * Solves: A slot-restored turn now carries its own (trimmed) snapshot — chat_slot_service.py
 *         persists one alongside each assistant turn — but slots written before that fix, or a
 *         turn some other path never attached one to, still carry `transparency: null`. This
 *         keeps the one-turn live-snapshot fallback for exactly that gap instead of assuming
 *         every archived turn now has its own.
 * Does not: Fetch or persist snapshots — get_input_transparency owns the live one,
 *         chat_slot_service.py owns the persisted one.
 */
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { ChatSlotTurnTransparency, TransparencySnapshot } from "./inputTransparency";

export type ArchivedTurnTransparencyArgs = {
  turn: Pick<AskThreadCollapsedTurn, "transparency">;
  /** Index of this turn within the archived list. */
  index: number;
  /** Length of the archived list. */
  total: number;
  /** Snapshot for the most recently completed Ask, from `get_input_transparency`. */
  liveSnapshot: TransparencySnapshot | null | undefined;
};

/**
 * A turn's own snapshot wins when it has one. Otherwise only the NEWEST archived turn may borrow
 * the live snapshot, because that snapshot describes the Ask that was just archived. Older turns
 * return null rather than borrowing it — showing one turn's context under another turn's answer
 * would be worse than showing none, since the whole point of the panel is to say what *this*
 * reply was built from.
 */
export function archivedTurnTransparency(
  args: ArchivedTurnTransparencyArgs
): TransparencySnapshot | ChatSlotTurnTransparency | null {
  const { turn, index, total, liveSnapshot } = args;
  if (turn.transparency) return turn.transparency;
  const isNewest = total > 0 && index === total - 1;
  return isNewest ? liveSnapshot ?? null : null;
}
