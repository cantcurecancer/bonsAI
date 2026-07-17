import { findScrollablePanel, tryScrollPanelFromAnchor } from "./chatPanelScroll";

/** Snap the tab scroll container to the top (reveals content directly under the LB/RB strip). */
export function tryScrollPanelToTop(anchor: HTMLElement | null): boolean {
  const scroll = findScrollablePanel(anchor);
  if (!scroll || scroll.scrollTop <= 0) return false;
  const before = scroll.scrollTop;
  scroll.scrollTop = 0;
  return scroll.scrollTop < before;
}

/** Move focus to the active tab title in the LB/RB strip when scroll is already at top. */
export function tryFocusActiveTabStrip(anchor: HTMLElement | null): boolean {
  const scope = anchor?.closest(".bonsai-scope") ?? document.querySelector(".bonsai-scope");
  const activeTab = scope?.querySelector<HTMLElement>(
    '.bonsai-decky-tabs-root .Panel.Focusable.Active, .bonsai-decky-tabs-root .DialogButton.Active, .bonsai-decky-tabs-root .DialogButton.active',
  );
  if (!activeTab) return false;
  activeTab.focus();
  return true;
}

/** Focus the previous control in the graph, scroll to top, step up, then focus the tab strip. */
export function tryMoveUpWithPanelScroll(
  anchor: HTMLElement | null,
  focusPrev?: () => boolean,
): boolean {
  if (focusPrev?.()) return true;
  if (tryScrollPanelToTop(anchor)) return true;
  if (tryScrollPanelFromAnchor(anchor, "up", 120)) return true;
  return tryFocusActiveTabStrip(anchor);
}
