/**
 * Title: Collapsed turn title builder
 * Purpose: Build one-line truncated user question labels for collapsed Ask thread rows.
 * Used for: MainTabChatTranscript turn headers via buildTurnHeaderElement.
 * Solves: Readable history row titles without exposing full multi-line questions.
 * Does not: Persist thread titles — derived from in-memory exchange snapshots.
 */
/** One-line collapsed title for an Ask thread row (truncated user question). */
export function buildCollapsedTurnTitle(question: string, maxLen = 60): string {
  const normalized = (question || "").trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
}
