/**
 * Title: Main tab column fill
 * Purpose: Give the Main tab column a measured min-height that reaches the QAM scroll viewport's
 *          bottom edge, so the preset/Ask dock can pin to the panel bottom via `margin-top: auto`.
 * Used for: MainTab's `.bonsai-main-tab-column` wrapper.
 * Solves: A short transcript left dead space under the Ask bar (the mockups draw it bottom-pinned).
 *         The offset between the scroll viewport and the column cannot be a CSS constant: it
 *         crosses Steam wrappers whose classes are hashed (design-language.md Rule 5), so like
 *         tabBodyViewport.ts this measures the real chain instead of guessing.
 * Does not: Size the scroll viewport itself — tabBodyViewport.ts owns --bonsai-tab-body-height;
 *           or touch width (design-language.md Rule 6: width comes from CSS).
 */
import { useLayoutEffect } from "react";

/** Matches on-device: the hashed name keeps the "TabContentsScroll" substring (design-language.md). */
const SCROLL_CONTAINER_SELECTOR = '[class*="TabContentsScroll"]';
/** Below this the pane is crushed/mid-relayout (same idea as tabBodyViewport's guards) — skip. */
const MIN_FILL_PX = 120;
/**
 * One bounded shrink pass: chrome below the column (PanelSection bottom padding, Steam wrappers)
 * would otherwise make an exactly-filled pane scrollable by a few px. A short pane's only
 * overflow IS that chrome, so subtracting a small measured overflow lands the fill exactly;
 * anything larger means the content genuinely overflows and min-height is moot anyway.
 */
const MAX_CHROME_CORRECTION_PX = 32;

export const MAIN_COLUMN_MIN_HEIGHT_VAR = "--bonsai-main-column-min-height";

/**
 * Keeps `--bonsai-main-column-min-height` on the column element equal to the space from the
 * column's top to the scroll viewport's bottom. Steam replaces the scroll node on every tab
 * switch, so the container is re-resolved on every pass rather than held.
 */
export function useMainTabColumnFill(columnRef: React.RefObject<HTMLDivElement | null>): void {
  useLayoutEffect(() => {
    const el = columnRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let raf = 0;
    let observedScroll: Element | null = null;

    const measure = () => {
      const column = columnRef.current;
      if (!column) return;
      const scroll = column.closest(SCROLL_CONTAINER_SELECTOR) as HTMLElement | null;
      if (scroll !== observedScroll) {
        if (observedScroll) ro.unobserve(observedScroll);
        observedScroll = scroll;
        if (scroll) ro.observe(scroll);
      }
      if (!scroll) {
        column.style.removeProperty(MAIN_COLUMN_MIN_HEIGHT_VAR);
        return;
      }

      const scrollRect = scroll.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      const paddingBottom = parseFloat(getComputedStyle(scroll).paddingBottom) || 0;
      /* Distance from the client-area origin to the column top, scroll position removed. */
      const topOffset = columnRect.top - scrollRect.top - scroll.clientTop + scroll.scrollTop;
      let fill = Math.floor(scroll.clientHeight - topOffset - paddingBottom);

      if (fill < MIN_FILL_PX) {
        column.style.removeProperty(MAIN_COLUMN_MIN_HEIGHT_VAR);
        return;
      }

      column.style.setProperty(MAIN_COLUMN_MIN_HEIGHT_VAR, `${fill}px`);
      /* Bounded chrome correction — see MAX_CHROME_CORRECTION_PX. Shrink only, never grow. */
      const overflow = scroll.scrollHeight - scroll.clientHeight;
      if (overflow > 0 && overflow <= MAX_CHROME_CORRECTION_PX) {
        fill -= overflow;
        if (fill >= MIN_FILL_PX) {
          column.style.setProperty(MAIN_COLUMN_MIN_HEIGHT_VAR, `${fill}px`);
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    measure();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [columnRef]);
}
