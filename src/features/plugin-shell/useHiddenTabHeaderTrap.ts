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
 *
 *         Two more paths found 2026-09-03, both landing on a hidden button with no `attributes`
 *         mutation for the old watch to see (`runs/CLEAR-CACHE-01-b-after-modal-back-to-main.json`,
 *         `runs/CLEAR-CACHE-01-c-close-panel-for-remount.json`):
 *         - Closing the *Clear cache* confirmation remounts the whole plugin (the `onBeforeDeckyModal`
 *           comment in index.tsx). The fresh header can arrive already carrying `gpfocus`, before this
 *           effect has attached at all.
 *         - `TabIndicatorBar` and `.bonsai-decky-tabs-root` share one fragment key that only changes on
 *           a UI-scale Apply (`index.tsx:1537`, the `bonsai-tabs-gen-` key) — verified by reading that
 *           file, not measured on device — so a QAM chord close/reopen does not remount either one and
 *           this effect stays attached throughout. The leading theory, UNKNOWN until measured on
 *           device, is that Steam's own `Tabs` still rebuilds its header's child nodes on the
 *           visibility change: a node born already carrying `gpfocus` produces a `childList` record,
 *           never an `attributes` one, which the old config (attributes-only) had no way to catch.
 *         Fixed by checking what already holds the ring the instant the trap turns on, and by watching
 *         insertions as well as class changes on nodes already in the tree — this covers the childList
 *         theory above and any other way a hidden button could arrive already focused, without needing
 *         the theory to be the confirmed mechanism.
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

/** `el` itself, or whichever descendant currently holds the ring, if either is a hidden tab button. */
function findHiddenTabButton(el: Element): Element | null {
  if (isHiddenTabButton(el)) return el;
  const nested = el.querySelector(".gpfocus");
  return nested && isHiddenTabButton(nested) ? nested : null;
}

export function useHiddenTabHeaderTrap(onBounce?: (bounced: boolean) => void): void {
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const doc = getUiDocument();
    const root = doc.querySelector(".bonsai-decky-tabs-root");
    if (!root) return;

    const bounce = () => {
      const bounced = takeNavFocus("tab-bar");
      bonsaiDebugLog("tabBar:trap", "ring on hidden tab button", "H3", { bounced });
      onBounce?.(bounced);
    };

    /*
      A landing that happens before this effect attaches leaves no mutation for the observer below
      to see: a node born already carrying `gpfocus` never fires an `attributes` record for it. Check
      what is already true the instant the trap turns on, not only what changes afterward.
    */
    if (findHiddenTabButton(root)) bounce();

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") {
          for (const node of record.addedNodes) {
            if (node instanceof Element && findHiddenTabButton(node)) {
              bounce();
              return;
            }
          }
          continue;
        }
        const target = record.target;
        if (target instanceof Element && isHiddenTabButton(target)) {
          bounce();
          return;
        }
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [onBounce]);
}
