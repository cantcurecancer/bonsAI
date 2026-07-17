import { Navigation, QuickAccessTab } from "@decky/ui";

let replySurfaceVisible = false;
let pendingFocusMainTab = false;

/** True when QAM is open and bonsAI Main tab is showing the reply surface. */
export function isReplySurfaceVisible(): boolean {
  return replySurfaceVisible;
}

export function setReplySurfaceVisible(visible: boolean): void {
  replySurfaceVisible = visible;
}

/** Open Decky QAM from a toast tap; remounted Content should consume pending Main focus. */
export function openBonsaiReplyFromToast(): void {
  pendingFocusMainTab = true;
  try {
    Navigation.OpenQuickAccessMenu(QuickAccessTab.Decky);
  } catch {
    /* best-effort — toast still notified the user */
  }
}

/** Returns true once after toast onClick requested Main tab focus. */
export function consumePendingFocusMainTab(): boolean {
  if (!pendingFocusMainTab) return false;
  pendingFocusMainTab = false;
  return true;
}

/** Test-only reset. */
export function resetReplySurfaceState(): void {
  replySurfaceVisible = false;
  pendingFocusMainTab = false;
}
