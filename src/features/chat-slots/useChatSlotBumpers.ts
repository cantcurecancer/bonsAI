/**
 * Title: Chat slot bumper handlers
 * Purpose: Cycle the slot carousel on LB/RB when the row owns focus.
 * Used for: ChatSlotRow onButtonDown.
 * Solves: Centralizes bumper button ids and optional event suppression for the P-0 spike path.
 * Does not: Switch Steam tabs — bumpers release when the row blurs.
 */
import { isBumperLeftDeckEvent, isBumperRightDeckEvent } from "../../utils/focusNavigation";

export type UseChatSlotBumpersArgs = {
  onBumperLeft: () => void;
  onBumperRight: () => void;
  /** When true, call preventDefault/stopPropagation (device spike variant 2). */
  suppressSteamDefault?: boolean;
};

export function useChatSlotBumpers({
  onBumperLeft,
  onBumperRight,
  suppressSteamDefault = true,
}: UseChatSlotBumpersArgs) {
  const handleBumperButtonDown = (evt: { detail?: { button?: unknown }; preventDefault?: () => void; stopPropagation?: () => void }) => {
    const left = isBumperLeftDeckEvent(evt);
    const right = isBumperRightDeckEvent(evt);
    if (!left && !right) return false;
    if (suppressSteamDefault) {
      evt.preventDefault?.();
      evt.stopPropagation?.();
    }
    if (left) onBumperLeft();
    else onBumperRight();
    return true;
  };

  return { handleBumperButtonDown, isBumperLeftDeckEvent, isBumperRightDeckEvent };
}
