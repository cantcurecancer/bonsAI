/**
 * Title: Tab bar D-pad and bumper handlers
 * Purpose: The handlers the collapsing tab bar's `Focusable` carries: Left/Right and LB/RB switch
 *          tabs (wrapping at the ends), Down hands the ring to the current tab's body, Up lets
 *          Steam go to Decky's Back button.
 * Used for: TabIndicatorBar (plan 30 W4).
 * Solves: Two measured facts. LB and RB wrap on the device (runs/TAB-BAR-W3-shoulder-wrap.json:
 *         LB on Main lands on About), so Left/Right wrap the same way or the two pairs disagree.
 *         And the bar sits outside Steam's `Tabs`, so Steam never sees a bumper pressed while the
 *         ring is on the bar — the bar has to switch tabs itself.
 * Does not: Move Steam's ring across containers itself; Down calls the handover the caller
 *           supplies (`takeNavFocus` through the registry), the same shape presetRowNav.ts uses.
 */
import { isBumperLeftDeckEvent, isBumperRightDeckEvent } from "../../utils/focusNavigation";

export type TabBarNavHandlers = {
  onMoveLeft: () => boolean;
  onMoveRight: () => boolean;
  onMoveUp: () => boolean;
  onMoveDown: () => boolean;
  /** LB / RB switch tabs; everything else falls through. */
  onButtonDown: (evt: unknown) => boolean;
};

export type BuildTabBarNavHandlersArgs = {
  /** The mounted tabs in strip order. */
  tabIds: readonly string[];
  currentTab: string;
  /** The shell's `selectTab` — never Steam's `onShowTab`, which carries the post-picker lock. */
  selectTab: (id: string) => void;
  /** Hand the ring to the current tab's first stop; true when it moved. */
  exitDown: () => boolean;
};

/**
 * The tab `step` places away from `currentTab`, wrapping at both ends. An unknown current tab
 * (a stale id, or nothing mounted yet) resolves to the first tab so a press still lands somewhere
 * visible; an empty list resolves to null.
 */
export function neighbourTab(tabIds: readonly string[], currentTab: string, step: -1 | 1): string | null {
  if (tabIds.length === 0) return null;
  const index = tabIds.indexOf(currentTab);
  if (index < 0) return tabIds[0];
  return tabIds[(index + step + tabIds.length) % tabIds.length];
}

/**
 * Returning `true` claims the press; `false` lets Steam's own navigation decide.
 *
 * Left and Right always claim: sideways there is nothing of ours to reach, and Steam's answer for
 * "left of the plugin" is the Quick Access rail, which walks the user out by accident (the same
 * lesson presetRowNav.ts records). Up returns false on purpose so Steam takes the ring to Decky's
 * Back button, as it did from the strip. Down claims only when the handover moved the ring; when
 * it did not, Steam's spatial navigation runs and the hidden-header trap catches a landing on the
 * ghost.
 */
export function buildTabBarNavHandlers(args: BuildTabBarNavHandlersArgs): TabBarNavHandlers {
  const { tabIds, currentTab, selectTab, exitDown } = args;
  const step = (dir: -1 | 1): boolean => {
    const next = neighbourTab(tabIds, currentTab, dir);
    if (next !== null && next !== currentTab) selectTab(next);
    return true;
  };
  return {
    onMoveLeft: () => step(-1),
    onMoveRight: () => step(1),
    onMoveUp: () => false,
    onMoveDown: () => exitDown(),
    onButtonDown: (evt) => {
      if (isBumperLeftDeckEvent(evt)) return step(-1);
      if (isBumperRightDeckEvent(evt)) return step(1);
      return false;
    },
  };
}
