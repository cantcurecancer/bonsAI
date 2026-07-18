const MIN_BODY_PX = 120;
const CRUSHED_SCOPE_MAX_PX = 160;

/**
 * Pin TabContentsScroll to a measured viewport height so scrollHeight > clientHeight when content overflows.
 * Flex alone does not constrain Decky's Tabs subtree on gamescope.
 */
export function syncTabBodyViewportHeight(scope: HTMLElement): boolean {
  const scopeRect = scope.getBoundingClientRect();
  const scopeH = scopeRect.height;
  if (scopeH < CRUSHED_SCOPE_MAX_PX) return false;

  const tabContents = scope.querySelector<HTMLElement>(
    '.bonsai-decky-tabs-root [class*="TabContentsScroll"]'
  );
  if (!tabContents) return false;

  const topOffset = Math.max(0, tabContents.getBoundingClientRect().top - scopeRect.top);
  const bodyH = Math.max(MIN_BODY_PX, Math.floor(scopeH - topOffset));
  scope.style.setProperty("--bonsai-tab-body-height", `${bodyH}px`);
  return true;
}
