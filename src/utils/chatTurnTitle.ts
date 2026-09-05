/**
 * Title: Collapsed/expanded turn title builder
 * Purpose: Build user question labels for Ask thread turn headers — a one-line truncated title
 *          for a closed turn, and the whole question (whitespace-normalized, un-truncated) for an
 *          open one.
 * Used for: MainTabChatTranscript turn headers via buildTurnHeaderElement. The header's own CSS
 *           (`.bonsai-chat-turn-row-header--expanded .bonsai-chat-turn-row-title`) wraps the
 *           expanded title to a five-line cap with a fade on the last line — this module only
 *           decides which string to hand it, not how it lays out.
 * Solves: D60 (docs/audit/maintainer-decisions-locked.md) — the question was cut twice, once here
 *         at 60 letters and again by a one-line CSS rule at ~48, so the 60-letter cap was never
 *         actually seen. A turn being open should show the whole thing.
 * Does not: Persist thread titles — derived from in-memory exchange snapshots.
 */
function normalizeQuestionText(question: string): string {
  return (question || "").trim().replace(/\s+/g, " ");
}

/** One-line collapsed title for a CLOSED Ask thread row (truncated user question). */
export function buildCollapsedTurnTitle(question: string, maxLen = 60): string {
  const normalized = normalizeQuestionText(question);
  if (!normalized) return "";
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
}

/**
 * Whole-question title for an OPEN Ask thread row. Whitespace-normalized only — no length cap.
 * The turn header's expanded CSS wraps this and caps it visually at five lines.
 */
export function buildExpandedTurnTitle(question: string): string {
  return normalizeQuestionText(question);
}
