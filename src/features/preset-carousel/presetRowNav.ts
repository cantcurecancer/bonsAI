/**
 * Title: Preset row D-pad handlers
 * Purpose: The four move handlers a chip button carries: Left/Right walk the chips, Down hands the
 *          ring to the Ask field, Up hands it to the transcript.
 * Used for: MainTabPresetAnimatedChips, every animation mode.
 * Solves: Steam treats a Focusable container as a column unless told otherwise, and the
 *         `flow-children="horizontal"` hint alone did not change that on device (2026-09-01,
 *         runs/PRESET-ONE-LINE-03-carousel-dpad.json): Left left the plugin for the Quick Access
 *         rail and Down/Up stepped between chips. Explicit handlers — the same shape the Ask bar's
 *         buttons use — make the row behave like a row.
 * Does not: Move Steam's ring across containers itself; Down and Up call the registered handovers
 *           the caller supplies (plain `focus()` is only safe between siblings of one container).
 */
export type ChipNavHandlers = {
  onMoveLeft: () => boolean;
  onMoveRight: () => boolean;
  onMoveDown: () => boolean;
  onMoveUp: () => boolean;
};

export type BuildChipNavHandlersArgs = {
  /** This chip's position in DOM order. */
  index: number;
  /** How many chips the row holds right now. */
  count: number;
  /** Focus the chip at that position; true when it exists. */
  focusChip: (index: number) => boolean;
  /** Hand the ring to the Ask field; true when it moved. */
  exitDown: () => boolean;
  /** Hand the ring to whatever sits above the row; true when it moved. */
  exitUp: () => boolean;
  /**
   * Right at the last chip normally just claims the move without moving (see below). A pinned QA
   * batch longer than the row is the one case with a real "next" entry waiting (D58 #3): called
   * only when `index` is already the last chip, and returning `true` means a new entry was pulled
   * in (focus follows it once it renders — the caller's concern, not this one).
   */
  advanceAtEnd?: () => boolean;
};

/**
 * Returning `true` claims the move; `false` lets Steam's own navigation decide. Left at the first
 * chip and Right at the last both claim the move without moving by default: Steam's choice for
 * "left of the first chip" is the Quick Access rail, which walks the user out of the plugin by
 * accident. `advanceAtEnd`, when supplied, gets first refusal at the last chip.
 */
export function buildChipNavHandlers(args: BuildChipNavHandlersArgs): ChipNavHandlers {
  const { index, count, focusChip, exitDown, exitUp, advanceAtEnd } = args;
  return {
    onMoveLeft: () => {
      if (index > 0) focusChip(index - 1);
      return true;
    },
    onMoveRight: () => {
      if (index < count - 1) {
        focusChip(index + 1);
      } else {
        advanceAtEnd?.();
      }
      return true;
    },
    onMoveDown: () => exitDown(),
    onMoveUp: () => exitUp(),
  };
}
