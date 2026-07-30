/**
 * Title: Reply stop registry
 * Purpose: Keep a live map of Main-tab reply feedback buttons so D-pad navigation can focus them by id.
 * Used for: Strategy/Ask reply chrome focus graphs on Steam Deck.
 * Solves: Focus targets miss when looked up with document.querySelector under Decky.
 * Does not: Own button layout, styling, or feedback RPC — only register and focus mounted nodes.
 */

export type ReplyStopId = "helpful" | "not-really" | "retry" | "show-details";

const stops = new Map<ReplyStopId, HTMLElement>();

export function registerReplyStop(id: ReplyStopId, el: HTMLElement | null): void {
  if (el) stops.set(id, el);
  else stops.delete(id);
}

export function getReplyStop(id: ReplyStopId): HTMLElement | null {
  return stops.get(id) ?? null;
}

/**
 * Feature: Main-tab reply D-pad (Helpful / Not really / Retry / Show details).
 * Input: stop id. Output: true if that stop is mounted and focus was claimed.
 */
export function focusRegisteredReplyStop(id: ReplyStopId): boolean {
  const el = stops.get(id);
  if (!el) return false;
  const panel = (
    el.matches?.(".Panel.Focusable") ? el : el.closest?.(".Panel.Focusable")
  ) as HTMLElement | null;
  const button = el.matches?.("button") ? el : el.querySelector?.("button");
  const targets = [panel, button, el].filter(Boolean) as HTMLElement[];
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
