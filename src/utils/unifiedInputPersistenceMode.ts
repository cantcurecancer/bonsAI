/**
 * Title: Unified input persistence guard
 * Purpose: Decide when switching into no_persist mode should clear the Ask field once.
 * Used for: usePluginSettings and unified input mount after Decky modal remount.
 * Solves: Avoid wiping restored input on every remount while already in no_persist.
 * Does not: Persist input text — session survival and settings mode own storage behavior.
 */
import type { UnifiedInputPersistenceMode } from "./settingsAndResponse";

/**
 * Clear the Ask field only when the user switches *into* no_persist — not on every mount while
 * already in no_persist (Decky remounts Content after showModal and session survival restores input).
 */
export function shouldClearUnifiedInputForPersistenceMode(
  previous: UnifiedInputPersistenceMode | null,
  next: UnifiedInputPersistenceMode
): boolean {
  return next === "no_persist" && previous !== null && previous !== "no_persist";
}
