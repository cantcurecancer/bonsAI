/**
 * Title: Hidden tab header trap
 * Purpose: When Steam's ring lands on one of its hidden tab buttons, hand it to the collapsing tab
 *          bar at once, so the hidden button never shows as a stop.
 * Used for: TabIndicatorBar (plan 30 W4).
 * Solves: Steam's `Tabs` keeps its header buttons in the gamepad tree even at `display: none` —
 *         measured 2026-09-02 under both hiding properties (runs/TAB-BAR-W1c-*.json): the second
 *         Down from a fresh open landed on the invisible Main tab button, and Up from the top of a
 *         tab landed on it too. No prop removes them. The explicit hops (the bar's Down, each body's
 *         Up, B routed through `onCancelFromTabHeader`) cover the paths we know; this covers the
 *         ones we do not, such as a modal's return-focus miss or a future Steam change.
 * Does not: Decide where the ring should be; it only bounces a landing on the ghost to the bar,
 *           and only when the bar's nav node is registered. Nothing here calls DOM `focus()`.
 */
import { useEffect } from "react";

import { bonsaiDebugLog } from "../../utils/bonsaiDebugIngest";
import { takeNavFocus } from "../../utils/navFocusRegistry";
import { getUiDocument } from "../../utils/uiDocument";

/**
 * Steam's tab button is the only element that can carry `gpfocus` AND contain one of our title
 * leaves: the leaf is what the plugin hands `Tabs` as each tab's title (tabTitles.tsx).
 */
function isHiddenTabButton(el: Element): boolean {
  return el.classList.contains("gpfocus") && !!el.querySelector(".bonsai-tab-title-leaf");
}

export function useHiddenTabHeaderTrap(onBounce?: (bounced: boolean) => void): void {
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const doc = getUiDocument();
    const root = doc.querySelector(".bonsai-decky-tabs-root");
    if (!root) return;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const target = record.target;
        if (!(target instanceof Element) || !isHiddenTabButton(target)) continue;
        const bounced = takeNavFocus("tab-bar");
        bonsaiDebugLog("tabBar:trap", "ring on hidden tab button", "H3", { bounced });
        onBounce?.(bounced);
        return;
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"], subtree: true });
    return () => observer.disconnect();
  }, [onBounce]);
}
