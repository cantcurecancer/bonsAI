/**
 * Title: Dock clearance on focus
 * Purpose: Keep the gamepad-focused element visible above the bottom-pinned preset/Ask dock.
 * Used for: MainTab, on the same column useMainTabColumnFill owns.
 * Solves: Steam scrolls a newly focused element into the PANE, but the dock covers the pane's
 *         bottom ~245px, so a control near the end of a reply (Helpful, Show details, the branch
 *         buttons) took the focus ring while sitting behind the preset chips — recorded on device
 *         2026-08-31. Steam cannot know about the dock; this listens for focus landing under it
 *         and lifts the element clear.
 * Does not: Follow streaming text or deliver the end of an answer — see useStreamScrollPin, which
 *           also owns the evidence for WHY the nudge is scrollIntoView and not a scrollTop write
 *           (Steam's scroller erases direct writes).
 */
import { useEffect, type RefObject } from "react";
import { findTabContentsScroll } from "../utils/chatPanelScroll";

const DOCK_SELECTOR = ".bonsai-main-tab-dock";

/** Breathing room between the lifted element and the dock's top edge. */
const CLEARANCE_PAD_PX = 6;

/**
 * The lift itself, exported for tests. Returns true when it scrolled.
 *
 * `block: "end"` is deliberate: to the browser an element behind the dock is already fully inside
 * the scrollport, so `"nearest"` would measure it as visible and do nothing. `scroll-margin-bottom`
 * carries the dock's covered strip, which is the only vocabulary scrollIntoView has for "the
 * usable bottom edge is higher than the pane's".
 */
export function liftAboveDock(el: HTMLElement): boolean {
  const scroll = findTabContentsScroll(el);
  if (!scroll) return false;
  const dock = scroll.querySelector<HTMLElement>(DOCK_SELECTOR);
  if (!dock || dock.contains(el)) return false;

  const paneBottom = scroll.getBoundingClientRect().bottom;
  const dockTop = dock.getBoundingClientRect().top;
  const covered = paneBottom - Math.min(paneBottom, dockTop);
  if (covered <= 0) return false;

  const rect = el.getBoundingClientRect();
  if (rect.bottom <= dockTop + 1) return false;

  el.style.scrollMarginBottom = `${Math.ceil(covered) + CLEARANCE_PAD_PX}px`;
  el.scrollIntoView({ block: "end", behavior: "auto" });
  return true;
}

/**
 * Watch focus arriving anywhere under `columnRef` and lift whatever lands behind the dock.
 *
 * Two passes per focus: one animation frame after the event, so Steam's own focus scroll has
 * finished and the lift measures the settled position — and one more shortly after, because
 * Steam's scroller can re-assert its recorded position a few frames later (the same behaviour
 * that eats direct scrollTop writes). Both passes are idempotent: they measure first and scroll
 * only if the element is still covered.
 */
export function useDockClearanceOnFocus(columnRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    let raf = 0;
    let settleTimer = 0;

    const onFocusIn = (event: FocusEvent) => {
      const el = event.target as HTMLElement | null;
      if (!el) return;
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      raf = requestAnimationFrame(() => {
        if (!el.isConnected) return;
        liftAboveDock(el);
        settleTimer = window.setTimeout(() => {
          if (el.isConnected) liftAboveDock(el);
        }, 150);
      });
    };

    column.addEventListener("focusin", onFocusIn);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      column.removeEventListener("focusin", onFocusIn);
    };
  }, [columnRef]);
}
