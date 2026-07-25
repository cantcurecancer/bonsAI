/**
 * Strip model-emitted control tags from assistant text shown in the chat transcript.
 * Backend extraction should already remove these; this is a display safety net (e.g. follow-up turns).
 */

const BONSAI_STATUS_RE = /<bonsai-status>\s*[\s\S]*?<\/bonsai-status>/gi;
const BONSAI_STATUS_OPEN = /<bonsai-status>[\s\S]*$/i;
const BONSAI_STRATEGY_BRACKET_RE = /\[bonsai-strategy-branches\]\s*\([^)]*\)/gi;

export function stripAssistantDisplayTags(text: string): string {
  let out = (text || "").replace(BONSAI_STATUS_RE, "");
  out = out.replace(BONSAI_STATUS_OPEN, "");
  out = out.replace(BONSAI_STRATEGY_BRACKET_RE, "");
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
