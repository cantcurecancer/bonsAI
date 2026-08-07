/**
 * Title: Permission jump registry
 * Purpose: Remember return tab and pending Permissions focus target across tab switches.
 * Used for: usePermissionJump and PermissionsTab focus restore after a deny-site jump.
 * Solves: Return-tab story and focus targeting without global document queries.
 * Does not: Own tab routing — useBonsaiPluginShell / index.tsx call setCurrentTab.
 */
import type { PermissionFocusTargetId } from "./permissionDeepLink";

const focusOwners = new Map<PermissionFocusTargetId, HTMLElement>();

let pendingReturnTab: string | null = null;
let pendingFocusTarget: PermissionFocusTargetId | null = null;

export function registerPermissionFocusOwner(id: PermissionFocusTargetId, el: HTMLElement | null): void {
  if (el) focusOwners.set(id, el);
  else focusOwners.delete(id);
}

/** Arm a jump: remember where to return and which Permissions row should receive focus. */
export function armPermissionJump(returnTab: string, focusTarget: PermissionFocusTargetId): void {
  pendingReturnTab = returnTab;
  pendingFocusTarget = focusTarget;
}

export function peekPermissionJumpReturnTab(): string | null {
  return pendingReturnTab;
}

export function peekPermissionJumpFocusTarget(): PermissionFocusTargetId | null {
  return pendingFocusTarget;
}

export function consumePermissionJumpReturnTab(): string | null {
  const tab = pendingReturnTab;
  pendingReturnTab = null;
  return tab;
}

export function clearPermissionJumpFocusTarget(): void {
  pendingFocusTarget = null;
}

export function clearPermissionJump(): void {
  pendingReturnTab = null;
  pendingFocusTarget = null;
}

function focusOwnerById(id: PermissionFocusTargetId): boolean {
  const el = focusOwners.get(id);
  if (!el) return false;

  const panel = (
    el.matches?.(".Panel.Focusable") ? el : el.closest?.(".Panel.Focusable")
  ) as HTMLElement | null;
  const button = el.matches?.("button") ? el : (el.querySelector?.("button") as HTMLElement | null);
  const toggle = el.querySelector?.('[role="switch"], input[type="checkbox"]') as HTMLElement | null;
  const targets = [panel, toggle, button, el].filter(Boolean) as HTMLElement[];
  for (const target of targets) {
    try {
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

/**
 * Focus the armed Permissions row once mounted. Consumes the pending focus target either way.
 */
export function restorePermissionJumpFocusWithRetry(
  onResult?: (claimed: boolean, attempts: number) => void,
  delaysMs: number[] = [0, 120, 320],
): void {
  const id = pendingFocusTarget;
  if (!id) {
    onResult?.(false, 0);
    return;
  }
  let index = 0;
  const attempt = () => {
    if (pendingFocusTarget !== id) return;
    if (focusOwners.has(id)) {
      pendingFocusTarget = null;
      onResult?.(focusOwnerById(id), index + 1);
      return;
    }
    index += 1;
    if (index >= delaysMs.length) {
      pendingFocusTarget = null;
      onResult?.(false, index);
      return;
    }
    window.setTimeout(attempt, delaysMs[index]);
  };
  window.setTimeout(attempt, delaysMs[0]);
}

/** Test-only reset. */
export function resetPermissionJumpRegistry(): void {
  focusOwners.clear();
  pendingReturnTab = null;
  pendingFocusTarget = null;
}
