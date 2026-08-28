/**
 * Title: DRG glossary term chip registry
 * Purpose: Track mounted DRG glossary term chips so D-pad Down can focus one instead of scrolling past it.
 * Used for: DrgGlossaryTermChip (registration) and answerBubbleNavigation (the diversion).
 * Solves: The reply bubble is a single Focusable that owns vertical movement, so a term chip's own
 *         nested Focusable never receives focus without an explicit park-on-it diversion — the same
 *         problem spoilerFenceRegistry solves for masked spoiler fences, and the same fix shape.
 * Does not: Decide peek/full/dismiss state — the chip owns that.
 */
import { elementHasFocus, rememberUiDocument } from "./uiDocument";

type TermChipEntry = {
  el: HTMLElement;
  /** Set once Down has parked focus here, so a second Down scrolls on instead of trapping the user. */
  visited: boolean;
};

const chips = new Map<string, TermChipEntry>();

/** Ref callback: element on mount, null on unmount. */
export function registerDrgGlossaryTermChip(id: string, el: HTMLElement | null): void {
  if (el) {
    rememberUiDocument(el);
    chips.set(id, { el, visited: false });
  } else {
    chips.delete(id);
  }
}

/** The first still-unvisited term chip inside `bubble` that is on screen. */
export function findUnvisitedDrgGlossaryTermChipInView(
  bubble: HTMLElement,
  isInView: (el: HTMLElement) => boolean,
): HTMLElement | null {
  for (const entry of chips.values()) {
    if (entry.visited) continue;
    if (!bubble.contains(entry.el)) continue;
    if (!isInView(entry.el)) continue;
    return entry.el;
  }
  return null;
}

/** Mark a chip as parked-on so the next Down continues scrolling rather than re-focusing it. */
export function markDrgGlossaryTermChipVisited(el: HTMLElement): void {
  for (const entry of chips.values()) {
    if (entry.el === el) {
      entry.visited = true;
      return;
    }
  }
}

/**
 * Focus a term chip and mark it visited. Returns true only when focus actually landed.
 *
 * Same two load-bearing details as `focusSpoilerFence`: never overwrite an existing `tabindex`
 * (Decky already put `0` there), and verify with `elementHasFocus`, which asks the chip's own
 * document rather than SharedJSContext's shell (`.cursor/rules/decky-focus-graph.mdc`).
 */
export function focusDrgGlossaryTermChip(el: HTMLElement | null): boolean {
  if (!el) return false;
  try {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  } catch {
    try {
      el.focus();
    } catch {
      /* ignore — a detached chip simply fails to claim focus */
    }
  }
  if (!elementHasFocus(el)) return false;
  markDrgGlossaryTermChipVisited(el);
  return true;
}

/** Test-only reset. */
export function resetDrgGlossaryTermRegistry(): void {
  chips.clear();
}
