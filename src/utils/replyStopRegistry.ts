/** Live DOM nodes for Main-tab reply 2x2 stops (Decky `document.querySelector` is unreliable here). */

export type ReplyStopId = "helpful" | "not-really" | "retry" | "show-details";

const stops = new Map<ReplyStopId, HTMLElement>();

export function registerReplyStop(id: ReplyStopId, el: HTMLElement | null): void {
  if (el) stops.set(id, el);
  else stops.delete(id);
}

export function getReplyStop(id: ReplyStopId): HTMLElement | null {
  return stops.get(id) ?? null;
}

/** Focus a registered stop and claim the D-pad move (return true when registered). */
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
