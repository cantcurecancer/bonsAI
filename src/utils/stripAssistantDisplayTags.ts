/**
 * Title: Assistant display tag stripper
 * Purpose: Remove model-emitted bonsai-status and strategy bracket tags from chat display text.
 * Used for: buildAnswerBubbleElement and transcript rendering safety net.
 * Solves: Leaked control tags in UI when backend extraction misses a follow-up turn.
 * Does not: Parse structured status for logic — backend should strip before persistence.
 */

const BONSAI_STATUS_RE = /<bonsai-status>\s*[\s\S]*?<\/bonsai-status>/gi;
const BONSAI_STATUS_OPEN = "<bonsai-status>";
const BONSAI_STRATEGY_BRACKET_RE = /\[bonsai-strategy-branches\]\s*\([^)]*\)/gi;

/** Hide full/partial/broken `<bonsai-status>` openers (including `<bons you're…`). */
function stripIncompleteBonsaiStatusOpen(text: string): string {
  const lower = text.toLowerCase();
  const openIdx = lower.indexOf(BONSAI_STATUS_OPEN);
  if (openIdx >= 0) {
    if (lower.includes("</bonsai-status>", openIdx)) {
      return text;
    }
    return text.slice(0, openIdx).trimEnd();
  }
  const lt = lower.lastIndexOf("<");
  if (lt < 0) {
    return text;
  }
  const target = "bonsai-status>";
  const rest = lower.slice(lt + 1);
  let matched = 0;
  for (const ch of rest) {
    if (matched < target.length && ch === target[matched]) {
      matched += 1;
      continue;
    }
    if (matched >= 4) {
      return text.slice(0, lt).trimEnd();
    }
    return text;
  }
  if (matched > 0) {
    return text.slice(0, lt).trimEnd();
  }
  return text;
}

export function stripAssistantDisplayTags(text: string): string {
  let out = (text || "").replace(BONSAI_STATUS_RE, "");
  out = stripIncompleteBonsaiStatusOpen(out);
  out = out.replace(BONSAI_STRATEGY_BRACKET_RE, "");
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
