/**
 * Title: Archived turn transparency resolver
 * Purpose: Decide which transparency snapshot an expanded archived turn should show.
 * Used for: MainTabChatTranscript's Show details row on slot-restored turns.
 * Solves: Slot-restored turns always carry `transparency: null` — chatSlotTurns.ts builds them
 *         from disk and the Python slot store persists no snapshot. Since a completed Ask is
 *         archived and expanded instead of staying live, the live-only Show details row rendered
 *         nothing and the control became unreachable entirely.
 * Does not: Fetch or persist snapshots — get_input_transparency owns the live one.
 */
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { TransparencySnapshot } from "./inputTransparency";

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
): TransparencySnapshot | null {
  const { turn, index, total, liveSnapshot } = args;
  if (turn.transparency) return turn.transparency;
  const isNewest = total > 0 && index === total - 1;
  return isNewest ? liveSnapshot ?? null : null;
}
