import { toaster, type ToastData, type ToastNotification } from "@decky/api";

let activePhaseToast: ToastNotification | null = null;

/** Dismiss the current bonsAI phase toast, if any. */
export function dismissPhaseToast(): void {
  try {
    activePhaseToast?.dismiss();
  } catch {
    /* best-effort */
  }
  activePhaseToast = null;
}

/** Replace any prior bonsAI phase toast (no stack) and show the next one. */
export function showPhaseToast(data: ToastData): ToastNotification {
  dismissPhaseToast();
  const notification = toaster.toast(data);
  activePhaseToast = notification;
  return notification;
}

/** Test-only: read whether a phase toast is currently held. */
export function peekActivePhaseToast(): ToastNotification | null {
  return activePhaseToast;
}
