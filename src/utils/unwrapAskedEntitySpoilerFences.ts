/**
 * Title: Asked-entity spoiler unwrap
 * Purpose: Display-time unwrap of bonsai-spoiler fences when the user already named the entity.
 * Used for: buildAnswerBubbleElement before markdown render.
 * Solves: Redundant spoiler hiding for boss-fight questions the user explicitly asked about.
 * Does not: Change backend spoiler policy — prompt and sanitizer remain authoritative.
 */

const SPOILER_FENCE_RE = /```bonsai-spoiler\s*\n([\s\S]*?)```/gi;

/** AppIDs where named bosses/waves are routine gameplay, not narrative spoilers. */
const LOW_SPOILER_RISK_APP_IDS = new Set([
  "2321470", // Deep Rock Galactic: Survivor
]);

export function extractAskedBeatEntity(question: string): string {
  const raw = (question || "").trim();
  if (!raw) return "";
  const patterns = [
    /(?:how\s+(?:do\s+i|to|can\s+i)\s+)?(?:beat|defeat|kill|fight|survive(?:\s+against)?)\s+(?:the\s+)?(.+?)(?:\?|$)/i,
    /(?:tips?\s+(?:for|on|against))\s+(?:the\s+)?(.+?)(?:\?|$)/i,
  ];
  for (const pat of patterns) {
    const match = raw.match(pat);
    if (!match?.[1]) continue;
    const entity = match[1].trim().replace(/[?.!]+$/, "").trim();
    if (entity.length >= 3) return entity;
  }
  return "";
}

function entityMentioned(haystack: string, entity: string): boolean {
  const h = haystack.toLowerCase();
  const e = entity.toLowerCase();
  if (e && h.includes(e)) return true;
  const tokens = e.split(/[\s\-_/]+/).filter((t) => t.length >= 4);
  if (!tokens.length) return false;
  const hits = tokens.filter((t) => h.includes(t)).length;
  return hits >= Math.max(1, tokens.length - 1);
}

export type UnwrapSpoilerOpts = {
  question?: string;
  appId?: string | null;
};

/**
 * Convert ```bonsai-spoiler fences into plain prose when:
 * - the fence body mentions the asked beat entity, or
 * - the active AppID is a known low-spoiler-risk title (bullet-heaven / survivor).
 */
export function unwrapAskedEntitySpoilerFences(
  text: string,
  questionOrOpts: string | UnwrapSpoilerOpts
): string {
  const opts: UnwrapSpoilerOpts =
    typeof questionOrOpts === "string" ? { question: questionOrOpts } : questionOrOpts;
  const question = opts.question || "";
  const appId = String(opts.appId || "").trim();
  const lowRiskApp = Boolean(appId && LOW_SPOILER_RISK_APP_IDS.has(appId));
  const entity = extractAskedBeatEntity(question);
  if ((!entity && !lowRiskApp) || !text) return text;
  return text.replace(SPOILER_FENCE_RE, (full, body: string) => {
    if (lowRiskApp) return String(body).replace(/\n$/, "");
    if (entity && (entityMentioned(body, entity) || entityMentioned(full, entity))) {
      return String(body).replace(/\n$/, "");
    }
    return full;
  });
}
