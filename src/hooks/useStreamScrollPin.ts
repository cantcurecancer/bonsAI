/**
 * Title: Stream scroll pin hook
 * Purpose: Follow the end of the transcript while tokens arrive, and hold position once the user
 *          scrolls up to read something behind it.
 * Used for: MainTab chat transcript anchor during background Ask streaming.
 * Solves: Auto-scroll fighting manual scroll-up during long replies, and its mirror image — text
 *         arriving below the fold with nothing bringing it into view.
 * Does not: Find scroll containers — see chatPanelScroll.findTabContentsScroll.
 */
import { useEffect, useRef, type RefObject } from "react";
import { findTabContentsScroll, panelScrollMax, tryGeometryPanelScroll } from "../utils/chatPanelScroll";

/** How far the end of the transcript may sit below the fold and still count as "being watched". */
const FOLLOW_SLACK_PX = 48;

/**
 * Whether the user is still looking at the end of the transcript.
 *
 * Measured against the anchor rather than the panel's scroll maximum, which is what this used to
 * ask. The panel extends past the transcript — the session context strip and Save chat live below
 * it — so "within 48px of the panel bottom" is false the moment the newest text is on screen but
 * those rows are not. With nothing following, that only cost a stale pin; with following it would
 * latch the pin one frame after the first follow and stop the whole thing dead.
 */
function transcriptTailIsInView(anchor: HTMLElement, scroll: HTMLElement): boolean {
  const overshoot = anchor.getBoundingClientRect().bottom - scroll.getBoundingClientRect().bottom;
  return overshoot <= FOLLOW_SLACK_PX;
}

/**
 * While tokens stream in, keep the newest text on screen — unless the user has scrolled up, in which
 * case hold exactly where they left off.
 *
 * Both halves are driven by the same scroll listener, so touch and D-pad behave identically: the
 * D-pad's own panel steps set `scrollTop`, which fires `scroll` like a swipe does. Stepping down
 * through the answer therefore pins, and stepping to the bottom resumes the follow, without the
 * navigation code knowing this hook exists.
 */
export function useStreamScrollPin(
  anchorRef: RefObject<HTMLElement | null>,
  streamText: string,
  enabled: boolean
): void {
  const pinnedTopRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      pinnedTopRef.current = null;
      return;
    }
    const anchor = anchorRef.current;
    const scroll = findTabContentsScroll(anchor);
    if (!anchor || !scroll) return;

    const onScroll = () => {
      pinnedTopRef.current = transcriptTailIsInView(anchor, scroll) ? null : scroll.scrollTop;
    };

    scroll.addEventListener("scroll", onScroll, { passive: true });
    return () => scroll.removeEventListener("scroll", onScroll);
  }, [anchorRef, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const anchor = anchorRef.current;
    const scroll = findTabContentsScroll(anchor);
    if (!anchor || !scroll) return;

    if (pinnedTopRef.current != null) {
      scroll.scrollTop = pinnedTopRef.current;
      return;
    }

    const overshoot = anchor.getBoundingClientRect().bottom - scroll.getBoundingClientRect().bottom;
    if (overshoot <= 0) return;

    /*
     * The QAM tab often grows with its content instead of scrolling, leaving scrollHeight equal to
     * clientHeight. Assigning scrollTop there does nothing — worse, clamping to a max of 0 would
     * jump to the top — so the geometry nudge is the only thing that moves the view.
     */
    const max = panelScrollMax(scroll);
    if (max <= 0) {
      tryGeometryPanelScroll(anchor, "down");
      return;
    }
    scroll.scrollTop = Math.min(max, scroll.scrollTop + overshoot);
  }, [anchorRef, enabled, streamText]);
}
