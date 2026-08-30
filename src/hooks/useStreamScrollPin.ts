/**
 * Title: Stream scroll pin hook
 * Purpose: Follow the end of the transcript while tokens arrive, and hold position once the user
 *          scrolls up to read something behind it.
 * Used for: MainTab chat transcript anchor during background Ask streaming.
 * Solves: Auto-scroll fighting manual scroll-up during long replies, and its mirror image — text
 *         arriving below the fold with nothing bringing it into view. "The fold" is the top of the
 *         bottom-pinned dock, not the pane's bottom edge — see visibleBottom.
 * Does not: Find scroll containers — see chatPanelScroll.findTabContentsScroll.
 */
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { findTabContentsScroll, panelScrollMax, tryGeometryPanelScroll } from "../utils/chatPanelScroll";

/** How far the end of the transcript may sit below the fold and still count as "being watched". */
const FOLLOW_SLACK_PX = 48;

/** A scroll position within this many pixels of one we set is treated as our own. */
const SELF_SCROLL_EPSILON_PX = 1;

/** The bottom-pinned preset/Ask dock, which covers the foot of the pane while content overflows. */
const DOCK_SELECTOR = ".bonsai-main-tab-dock";

/**
 * The lowest point a reader can actually see inside the scroll pane.
 *
 * The Ask dock is `position: sticky; bottom: 0`, so whenever the content overflows it sits ON TOP
 * of the bottom ~245px of the pane. Measuring the fold at the pane's own bottom edge therefore
 * called the tail "in view" while it was behind the preset chips, and the follow stopped a dock's
 * height short of the end of the answer — which on device 2026-08-30 looked exactly like a long
 * reply being cut off mid-sentence. At the pane's maximum scroll the dock is back in normal flow
 * below the transcript, where its top is past the tail anyway, so the same expression is right in
 * both regimes and needs no special case.
 */
function visibleBottom(scroll: HTMLElement): number {
  const paneBottom = scroll.getBoundingClientRect().bottom;
  const dock = scroll.querySelector<HTMLElement>(DOCK_SELECTOR);
  if (!dock) return paneBottom;
  return Math.min(paneBottom, dock.getBoundingClientRect().top);
}

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
  const overshoot = anchor.getBoundingClientRect().bottom - visibleBottom(scroll);
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
  /** The last scrollTop this hook set, so its own scrolls are not read as the user's. */
  const selfWroteTopRef = useRef<number | null>(null);
  /** Content height at the previous scroll event, to tell a clamp from a deliberate scroll. */
  const lastScrollHeightRef = useRef(0);

  /*
   * Reset on every transition, including *into* streaming: a pin taken during the previous answer —
   * or by the `expandedTurnKey` scrollIntoView that fires as a turn opens — would otherwise survive
   * into this one and freeze the view before a single token had arrived.
   *
   * A layout effect declared above the follow, so that on the commit where streaming begins the
   * reset has already happened. As a passive effect it ran *after* the first follow of the answer,
   * which is one commit too late — and it also wiped the position that follow had just recorded,
   * making the very next scroll event look like the user's.
   */
  useLayoutEffect(() => {
    pinnedTopRef.current = null;
  }, [anchorRef, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const anchor = anchorRef.current;
    const scroll = findTabContentsScroll(anchor);
    if (!anchor || !scroll) return;

    lastScrollHeightRef.current = scroll.scrollHeight;

    const onScroll = () => {
      const top = scroll.scrollTop;
      /*
       * A CLAMP, not the user. Submitting an Ask replaces a long transcript with one short turn,
       * so the content collapses and the browser clamps scrollTop down to fit — which arrives as
       * an ordinary scroll event at a position nobody chose. Reading that as "the user scrolled
       * up" pinned the view at 0 for the whole answer, and every later pass then re-asserted 0.
       *
       * It is the normal path, not an edge case: reaching the ASK button by D-pad scrolls the pane
       * on the way down, so the clamp is guaranteed. Measured on device 2026-08-30 - three long
       * replies in a row settled with 872 to 1240px of scroll range and scrollTop still 0.
       */
      const shrank =
        lastScrollHeightRef.current > 0 && scroll.scrollHeight < lastScrollHeightRef.current;
      lastScrollHeightRef.current = scroll.scrollHeight;
      /*
       * Our own scroll, arriving late. `scroll` events are asynchronous, so by the time one lands
       * the reveal has usually added more text and the tail is below the fold again — reading that
       * as "the user scrolled up" pins the view at the position we just set and the follow never
       * runs again. That is the freeze this guard exists for: it looks exactly like following that
       * works and then stops a paragraph short.
       */
      if (
        selfWroteTopRef.current !== null &&
        Math.abs(top - selfWroteTopRef.current) <= SELF_SCROLL_EPSILON_PX
      ) {
        return;
      }
      /* The user has taken over, so the position we remember is no longer a useful comparison —
         keeping it would make a later scroll that happens to land there look like ours. */
      selfWroteTopRef.current = null;
      if (shrank) return;
      pinnedTopRef.current = transcriptTailIsInView(anchor, scroll) ? null : top;
    };

    scroll.addEventListener("scroll", onScroll, { passive: true });
    return () => scroll.removeEventListener("scroll", onScroll);
  }, [anchorRef, enabled]);

  /*
   * Layout effect, not effect: the reveal commits text every animation frame, and adjusting the
   * scroll after paint shows one frame of the new text below the fold before it snaps up.
   */
  useLayoutEffect(() => {
    if (!enabled) return;
    const anchor = anchorRef.current;
    const scroll = findTabContentsScroll(anchor);
    if (!anchor || !scroll) return;

    /** Record before assigning as well as after: a synchronous listener sees the pre-set value. */
    const setScrollTop = (next: number) => {
      selfWroteTopRef.current = next;
      scroll.scrollTop = next;
      selfWroteTopRef.current = scroll.scrollTop;
    };

    const tailBelowFold = () => anchor.getBoundingClientRect().bottom - visibleBottom(scroll);

    const follow = () => {
      if (pinnedTopRef.current != null) {
        setScrollTop(pinnedTopRef.current);
        return;
      }

      const overshoot = tailBelowFold();
      if (overshoot <= 0) return;

      /*
       * The QAM tab often grows with its content instead of scrolling, leaving scrollHeight equal
       * to clientHeight. Assigning scrollTop there does nothing — worse, clamping to a max of 0
       * would jump to the top — so the geometry nudge is the only thing that moves the view.
       */
      const max = panelScrollMax(scroll);
      if (max <= 0) {
        tryGeometryPanelScroll(anchor, "down");
        selfWroteTopRef.current = scroll.scrollTop;
        return;
      }

      setScrollTop(Math.min(max, scroll.scrollTop + overshoot));

      /*
       * Clamped at the container's maximum and the tail is still off screen, so this container
       * cannot show it. Some ancestor can: on device the answer runs past the bottom edge while
       * the panel reports itself fully scrolled. Hand it to the browser, which will move whichever
       * ancestor actually has the range.
       */
      if (tailBelowFold() > 0) {
        anchor.scrollIntoView({ block: "end", behavior: "auto" });
        selfWroteTopRef.current = scroll.scrollTop;
      }
    };

    follow();

    /*
     * The text prop is not a reliable signal that the ANSWER has finished laying out. On the commit
     * where it lands, the bubble is often still short — markdown, spoiler fences and glossary chips
     * expand it over the frames that follow — so the one pass above can measure a pane that does
     * not overflow yet, take the max <= 0 branch, and never run again, because nothing changes the
     * prop afterwards. Measured on device 2026-08-30 with the preview off: the pane finished with
     * 1240px of scroll range and scrollTop still 0, the whole answer below the fold.
     *
     * Watching the anchor closes that gap for free and costs nothing while the height is steady.
     */
    if (typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(follow);
    });
    ro.observe(anchor);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [anchorRef, enabled, streamText]);
}
