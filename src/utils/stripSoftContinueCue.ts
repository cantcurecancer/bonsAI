/**
 * Title: Soft-continue cue stripper
 * Purpose: Remove a trailing ephemeral "Continuing…" cue from a persisted assistant reply.
 * Used for: The cancelled-Ask path in useBonsaiAskOrchestration, as a backstop against the
 *   cue surviving into a saved/stopped reply.
 * Solves: Non-terminal partial writes are rate-limited (main.py PARTIAL_RESPONSE_FLUSH_INTERVAL_S);
 *   a Stop landing inside that window can drop the backend's own cue-clear delta.
 * Does not: Run during live streaming — the cue is intentional UI while an Ask is in progress.
 */

const SOFT_CONTINUE_CUE = "Continuing…";

/** Mirrors strip_soft_continue_cue in py_modules/backend/services/ollama_ask_budgets.py. */
export function stripSoftContinueCue(text: string): string {
  const raw = typeof text === "string" ? text : "";
  if (!raw) {
    return raw;
  }
  const trimmed = raw.trimEnd();
  if (trimmed.endsWith(SOFT_CONTINUE_CUE)) {
    return trimmed.slice(0, -SOFT_CONTINUE_CUE.length).trimEnd();
  }
  return raw;
}
