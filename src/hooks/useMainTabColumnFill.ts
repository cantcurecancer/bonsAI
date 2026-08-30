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
 * Sanity bound on the measured chrome below the column. Anything larger is a mis-measure (a
 * mid-relayout frame, a collapsed wrapper) and is ignored rather than subtracted.
 */
const MAX_CHROME_BELOW_PX = 200;

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
      /* Distances measured inside the scroll content, so the current scroll position drops out. */
      const topOffset = columnRect.top - scrollRect.top - scroll.clientTop + scroll.scrollTop;
      const columnBottom = topOffset + columnRect.height;
      /*
       * Chrome that sits BELOW the column inside the same scroll content — PanelSection bottom
       * padding, Steam wrappers, the scroller's own padding-bottom. Measuring it directly is what
       * makes this stable. The first version instead applied the fill, measured the leftover
       * overflow and subtracted it, which oscillated: subtracting removed the overflow, the next
       * observer pass recomputed the full fill, the overflow came back, and the dock visibly moved
       * by those few pixels on every relayout.
       */
      const chromeBelow = scroll.scrollHeight - columnBottom;
      const safeChrome = chromeBelow >= 0 && chromeBelow <= MAX_CHROME_BELOW_PX ? chromeBelow : 0;
      const fill = Math.floor(scroll.clientHeight - topOffset - safeChrome);

      if (fill < MIN_FILL_PX) {
        column.style.removeProperty(MAIN_COLUMN_MIN_HEIGHT_VAR);
        return;
      }

      /*
       * Idempotent: with the fill applied, content height is exactly topOffset + fill +
       * chromeBelow == clientHeight, so re-measuring yields the same number and the value stops
       * changing. Writing only on a real change also keeps the observer from re-entering.
       */
      const next = `${fill}px`;
      if (column.style.getPropertyValue(MAIN_COLUMN_MIN_HEIGHT_VAR) !== next) {
        column.style.setProperty(MAIN_COLUMN_MIN_HEIGHT_VAR, next);
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
