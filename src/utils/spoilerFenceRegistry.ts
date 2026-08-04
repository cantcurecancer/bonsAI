/**
 * Title: Spoiler fence registry
 * Purpose: Track mounted, still-masked spoiler fences so D-pad Down can focus one instead of scrolling past it.
 * Used for: MainTabBonsaiAiMarkdownChunk (registration) and answerBubbleNavigation (the diversion).
 * Solves: A masked spoiler was unreachable without a touchscreen — the reply bubble is a single
 *         Focusable that owns vertical movement, so the fence's own Focusable never received focus.
 * Does not: Decide what is masked, or reveal it — the fence owns its open state.
 */

type FenceEntry = {
  el: HTMLElement;
  /** Set once Down has parked focus here, so a second Down scrolls on instead of trapping the user. */
  visited: boolean;
};

const fences = new Map<string, FenceEntry>();

/** Ref callback: element on mount, null on unmount or once the fence opens. */
export function registerSpoilerFence(id: string, el: HTMLElement | null): void {
  if (el) fences.set(id, { el, visited: false });
  else fences.delete(id);
}

/**
 * The first still-masked fence inside `bubble` that is on screen and has not been parked on yet.
 *
 * Containment is checked against registered elements rather than looked up with a selector, per
 * `.cursor/rules/decky-focus-graph.mdc` — a DOM query for a focus target misses under Decky.
 */
export function findUnvisitedSpoilerFenceInView(
  bubble: HTMLElement,
  isInView: (el: HTMLElement) => boolean,
): HTMLElement | null {
  for (const entry of fences.values()) {
    if (entry.visited) continue;
    if (!bubble.contains(entry.el)) continue;
    if (!isInView(entry.el)) continue;
    return entry.el;
  }
  return null;
}

/** Mark a fence as parked-on so the next Down continues scrolling rather than re-focusing it. */
export function markSpoilerFenceVisited(el: HTMLElement): void {
  for (const entry of fences.values()) {
    if (entry.el === el) {
      entry.visited = true;
      return;
    }
  }
}

/**
 * Focus a fence and mark it visited. Returns true when a fence was claimed.
 *
 * Uses the same target ladder as `focusRegisteredReplyStop`, which is the one focus-moving helper
 * in this repo that demonstrably works on Deck: Decky's `.Panel.Focusable` wrapper first, then the
 * native `<button>` inside, then the element itself — each with `tabindex="-1"` set before
 * focusing. The first version of this focused only the outer `Focusable` div and did nothing on
 * device (2026-08-04); focusing the inner native button is the difference between the two.
 */
export function focusSpoilerFence(el: HTMLElement | null): boolean {
  if (!el) return false;
  markSpoilerFenceVisited(el);
  const panel = (
    el.matches?.(".Panel.Focusable") ? el : el.closest?.(".Panel.Focusable")
  ) as HTMLElement | null;
  const button = el.matches?.("button") ? el : (el.querySelector?.("button") as HTMLElement | null);
  const targets = [panel, button, el].filter(Boolean) as HTMLElement[];
  if (!targets.length) return false;
  for (const target of targets) {
    try {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    } catch {
      try {
        target.focus();
      } catch {
        /* ignore */
      }
    }
  }
  return true;
}

/** Debug shape for the on-device probe: which targets the ladder found. */
export function describeSpoilerFenceTargets(el: HTMLElement | null): Record<string, boolean> {
  if (!el) return { el: false, panel: false, button: false };
  return {
    el: true,
    panel: Boolean(el.matches?.(".Panel.Focusable") || el.closest?.(".Panel.Focusable")),
    button: Boolean(el.matches?.("button") || el.querySelector?.("button")),
  };
}

/** Test-only reset. */
export function resetSpoilerFenceRegistry(): void {
  fences.clear();
}
