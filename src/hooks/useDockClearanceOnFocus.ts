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
 * Delays for the repeat passes after the first one, counted from the triggering focus event.
 *
 * Used to be a single pass at 150ms. Round 35 (2026-09-05) measured a reply's last paragraph on
 * the device: the margin was written correctly, scrollIntoView was called, and the pane still read
 * scrollTop 0 at ~300ms AND ~900ms after the press — the same paragraph, covered from either
 * direction, by the chips walking down or the question box walking up. One early pass was not
 * catching whatever moves the pane back. The only other place this repo has proof of a scroll
 * getting undone after a correct scrollIntoView call is useStreamScrollPin's post-Ask rebuild,
 * where the fix was the same idea at these same two later delays (`DELIVERY_PASS_DELAYS_MS`,
 * proven on-Deck 2026-08-31 — docs/archive/roadmap-bugs-fixed.md, row CHAT-SLOTS-V3-14). Reusing
 * that schedule here rather than inventing a new one: it is the one timing this repo has already
 * seen win against this device's behaviour. Every pass re-measures and only scrolls if the element
 * is still covered, so a pass that finds nothing to do costs nothing.
 */
const SETTLE_PASS_DELAYS_MS = [150, 300, 900];

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
 * One pass an animation frame after the event, so Steam's own focus scroll has finished and the
 * lift measures the settled position, then a series of repeat passes at `SETTLE_PASS_DELAYS_MS`
 * because whatever re-asserts a stale scroll position on this device does not always stop after
 * one correction (round 35 measurement, see that constant's comment). Every pass is idempotent:
 * it measures first and scrolls only if the element is still covered, so this is safe to run
 * whether or not an earlier pass already did the job.
 */
export function useDockClearanceOnFocus(columnRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    let raf = 0;
    let settleTimers: number[] = [];

    const clearPending = () => {
      cancelAnimationFrame(raf);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      settleTimers = [];
    };

    const onFocusIn = (event: FocusEvent) => {
      const el = event.target as HTMLElement | null;
      if (!el) return;
      clearPending();
      raf = requestAnimationFrame(() => {
        if (!el.isConnected) return;
        liftAboveDock(el);
        settleTimers = SETTLE_PASS_DELAYS_MS.map((delayMs) =>
          window.setTimeout(() => {
            if (el.isConnected) liftAboveDock(el);
          }, delayMs)
        );
      });
    };

    column.addEventListener("focusin", onFocusIn);
    return () => {
      clearPending();
      column.removeEventListener("focusin", onFocusIn);
    };
  }, [columnRef]);
}
