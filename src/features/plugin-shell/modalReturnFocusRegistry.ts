/**
 * Title: Modal return-focus registry
 * Purpose: Send D-pad focus back to the control that opened a fullscreen picker, once it closes.
 * Used for: The four shell modals — plugin help, desktop-note save, character picker, models hub.
 * Solves: Closing a picker restored the tab but not the focused control, so the user re-walked the panel.
 * Does not: Own the tab restore (useBonsaiPluginShell) or general D-pad graphs (focus-graph rules).
 *
 * Registry rather than a DOM query on purpose: `.cursor/rules/decky-focus-graph.mdc` forbids
 * reaching for focus targets with `querySelector` / `document.activeElement`, because those miss
 * under Decky and land focus somewhere wrong. A control registers itself while mounted; if it is
 * not mounted when the modal closes, focus is left exactly where it is — today's behavior.
 */

/** One id per control that can open a modal. Two entry points to the same modal need two ids. */
export type ModalReturnFocusId =
  | "plugin-help"
  | "desktop-note-save"
  | "character-picker-settings"
  | "ollama-models-hub"
  | "chat-slot-rename";

const owners = new Map<ModalReturnFocusId, HTMLElement>();
let pendingReturn: ModalReturnFocusId | null = null;

/** Ref callback: called with the element on mount and with null on unmount. */
export function registerModalReturnFocusOwner(id: ModalReturnFocusId, el: HTMLElement | null): void {
  if (el) owners.set(id, el);
  else owners.delete(id);
}

/** Called by the control's own onClick, so the opener is never guessed from the DOM. */
export function rememberModalReturnFocus(id: ModalReturnFocusId): void {
  pendingReturn = id;
}

export function clearModalReturnFocus(): void {
  pendingReturn = null;
}

export function peekModalReturnFocus(): ModalReturnFocusId | null {
  return pendingReturn;
}

/**
 * Focus the remembered control if it is mounted. Returns true when focus was claimed.
 *
 * Consumes the pending id either way: a modal close that cannot restore should not leave the id
 * armed for some later, unrelated close.
 */
export function restoreModalReturnFocus(): boolean {
  const id = pendingReturn;
  pendingReturn = null;
  if (!id) return false;
  return focusOwnerById(id);
}

/**
 * Retry the restore across a few frames before giving up.
 *
 * Measured on-device 2026-08-04: the desktop-note opener reported `claimed: false` because the
 * control had not re-registered yet — after a Content remount the tab body mounts on its own
 * schedule, and a single attempt one frame after the tab switch can land before the button exists.
 * Each attempt is cheap (a Map lookup), and the armed id survives until one succeeds or the
 * attempts run out, so a late-mounting control still gets its focus back.
 */
export function restoreModalReturnFocusWithRetry(
  onResult?: (claimed: boolean, attempts: number) => void,
  delaysMs: number[] = [0, 120, 320],
): void {
  const id = pendingReturn;
  if (!id) {
    onResult?.(false, 0);
    return;
  }
  let index = 0;
  const attempt = () => {
    if (pendingReturn !== id) return; // something else armed or cleared it meanwhile
    if (owners.has(id)) {
      pendingReturn = null;
      onResult?.(focusOwnerById(id), index + 1);
      return;
    }
    index += 1;
    if (index >= delaysMs.length) {
      pendingReturn = null;
      onResult?.(false, index);
      return;
    }
    window.setTimeout(attempt, delaysMs[index]);
  };
  window.setTimeout(attempt, delaysMs[0]);
}

function focusOwnerById(id: ModalReturnFocusId): boolean {
  const el = owners.get(id);
  if (!el) return false;

  // Same target ladder as replyStopRegistry: Decky's focusable Panel wrapper first, then the
  // native button, then the registered element itself.
  const panel = (
    el.matches?.(".Panel.Focusable") ? el : el.closest?.(".Panel.Focusable")
  ) as HTMLElement | null;
  const button = el.matches?.("button") ? el : (el.querySelector?.("button") as HTMLElement | null);
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

/** Test-only reset. */
export function resetModalReturnFocusRegistry(): void {
  owners.clear();
  pendingReturn = null;
}
