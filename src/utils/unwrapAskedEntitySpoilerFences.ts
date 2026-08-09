/**
 * Title: Asked-entity spoiler unwrap
 * Purpose: Display-time unwrap of bonsai-spoiler fences per spoiler constitution rules.
 * Used for: buildAnswerBubbleElement before markdown render.
 * Solves: Redundant spoiler hiding for consented, low-narrative, or named-entity turns.
 * Does not: Change backend spoiler policy — prompt and sanitizer remain authoritative.
 */

import { titleProfileIsLowNarrative } from "../data/spoilerTitleProfiles";

const SPOILER_FENCE_RE = /```bonsai-spoiler\s*\n([\s\S]*?)```/gi;

const ENTITY_FILLER = new Set([
  "boss",
  "enemy",
  "enemies",
  "fight",
  "fights",
  "fighting",
  "level",
  "stage",
  "area",
  "mission",
  "quest",
  "chapter",
  "section",
  "part",
  "wave",
  "round",
  "match",
  "game",
  "mode",
  "map",
  "route",
  "path",
  "spot",
  "place",
  "room",
  "hall",
  "door",
  "gate",
  "bridge",
  "tower",
  "temple",
  "dungeon",
  "cave",
  "castle",
  "fort",
  "base",
  "camp",
  "zone",
  "region",
  "world",
  "planet",
  "ship",
  "vehicle",
  "weapon",
  "gun",
  "sword",
  "shield",
  "armor",
  "item",
  "skill",
  "ability",
  "spell",
  "magic",
  "attack",
  "defense",
  "health",
  "damage",
  "strategy",
  "tactic",
  "tactics",
  "tip",
  "tips",
  "guide",
  "help",
  "build",
  "class",
  "character",
  "player",
  "team",
  "party",
  "ally",
  "allies",
  "npc",
  "npcs",
  "mob",
  "mobs",
  "minion",
  "minions",
  "add",
  "adds",
  "trash",
  "pack",
  "group",
  "horde",
  "swarm",
  "spawn",
  "spawns",
  "it",
  "this",
  "that",
  "these",
  "those",
  "one",
  "ones",
  "thing",
  "things",
  "guy",
  "guys",
  "dude",
  "dudes",
  "them",
  "they",
  "he",
  "she",
  "her",
  "him",
  "his",
  "its",
  "their",
  "there",
  "here",
  "where",
  "when",
  "what",
  "which",
  "who",
  "how",
  "why",
  "do",
  "does",
  "did",
  "can",
  "cant",
  "cannot",
  "dont",
  "is",
  "are",
  "was",
  "were",
  "be",
  "to",
  "of",
  "and",
  "or",
  "but",
  "for",
  "with",
  "on",
  "in",
  "at",
  "beat",
  "beating",
  "get",
  "got",
  "keeps",
  "keep",
  "kept",
  "need",
  "want",
  "trying",
  "best",
  "good",
  "better",
  "worst",
  "any",
  "some",
  "all",
]);

const ENTITY_CLAUSE_BREAKS = new Set([
  "without",
  "after",
  "before",
  "when",
  "while",
  "if",
  "so",
  "because",
  "unless",
  "until",
  "but",
  "though",
  "that",
  "which",
  "who",
  "against",
  "with",
  "from",
  "into",
  "onto",
  "using",
  "than",
  "versus",
  "vs",
]);

const ENTITY_TRAILING_ADVERBS = new Set([
  "early",
  "late",
  "fast",
  "quickly",
  "quick",
  "easily",
  "easy",
  "first",
  "again",
  "now",
  "here",
  "there",
  "safely",
  "solo",
  "alone",
  "properly",
  "cheaply",
  "reliably",
]);

const ENTITY_TRAILING_QUALIFIERS = new Set(["boss", "fight", "strategy", "tip", "tips", "guide", "help"]);

const ENTITY_SENTENCE_TOKENS = new Set([
  "i",
  "im",
  "ive",
  "id",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "can",
  "cant",
  "cannot",
  "dont",
  "to",
  "of",
  "and",
  "or",
  "but",
  "for",
  "with",
  "on",
  "in",
  "at",
  "beat",
  "beating",
  "get",
  "got",
  "keeps",
  "keep",
  "kept",
  "need",
  "want",
  "trying",
  "best",
  "good",
  "better",
  "worst",
  "any",
  "some",
  "all",
]);

const ENTITY_MAX_TOKENS = 4;
const ENTITY_LEADING_ARTICLES = ["the ", "a ", "an "];

const ENTITY_QUALIFIER = "(?:boss\\s+fight|boss|fight|strategy|tips?|guide|help)";

const ENTITY_VERB_FIRST_PATTERNS = [
  /(?:how\s+(?:do\s+i|to|can\s+i)\s+)?(?<![a-z])(?:beat|defeat|kill|fight|survive(?:\s+against)?)(?![a-z])\s+(?:the\s+)?(.+?)(?:\?|$)/i,
  /(?<![a-z])tips?\s+(?:for|on|against)(?![a-z])\s+(?:the\s+)?(.+?)(?:\?|$)/i,
  /(?:how\s+(?:do\s+i|to)\s+)?(?<![a-z])(?:use|counter|play\s+as)(?![a-z])\s+(?:the\s+)?(.+?)(?:\?|$)/i,
];

const ENTITY_FIRST_PATTERN = new RegExp(
  `^(.{2,40}?)\\s+${ENTITY_QUALIFIER}(?:\\s+${ENTITY_QUALIFIER})*\\s*[?.!]*$`,
  "i"
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenOnWordBoundary(haystack: string, token: string): boolean {
  if (!token) return false;
  const re = new RegExp(`(?<![a-z0-9])${escapeRegExp(token)}(?![a-z0-9])`, "i");
  return re.test(haystack);
}

function cleanAskedEntity(raw: string, entityFirst: boolean): string {
  let entity = raw.replace(/\s+/g, " ").trim().replace(/^["'“”]|["'“”]$/g, "");
  entity = entity.replace(/[?.!,;:]+$/, "");
  let lowered = entity.toLowerCase();
  for (const article of ENTITY_LEADING_ARTICLES) {
    if (lowered.startsWith(article)) {
      entity = entity.slice(article.length).trim();
      lowered = entity.toLowerCase();
      break;
    }
  }
  let tokens = entity.split(/\s+/);
  if (entityFirst) {
    while (tokens.length > 1) {
      const last = tokens[tokens.length - 1]?.toLowerCase().replace(/[?.!,;:]+$/, "") ?? "";
      if (!ENTITY_TRAILING_QUALIFIERS.has(last)) break;
      tokens.pop();
    }
  } else {
    const cutIndex = tokens.findIndex((token) =>
      ENTITY_CLAUSE_BREAKS.has(token.toLowerCase().replace(/[?.!,;:]+$/, ""))
    );
    if (cutIndex >= 0) tokens = tokens.slice(0, cutIndex);
  }
  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1]?.toLowerCase().replace(/[?.!,;:]+$/, "") ?? "";
    if (!ENTITY_TRAILING_ADVERBS.has(last)) break;
    tokens.pop();
  }
  entity = tokens.join(" ");
  lowered = entity.toLowerCase();
  if (entity.length < 3 || ENTITY_FILLER.has(lowered)) return "";
  if (tokens.length > ENTITY_MAX_TOKENS) return "";
  if (
    entityFirst &&
    tokens.some((token) => ENTITY_SENTENCE_TOKENS.has(token.toLowerCase().replace(/[?.!,;:'"]+$/, "")))
  ) {
    return "";
  }
  return entity;
}

export function extractAskedBeatEntity(question: string): string {
  const raw = (question || "").trim();
  if (!raw) return "";

  for (const pat of ENTITY_VERB_FIRST_PATTERNS) {
    const match = raw.match(pat);
    if (!match?.[1]) continue;
    const entity = cleanAskedEntity(match[1], false);
    if (entity) return entity;
  }

  const entityFirstMatch = raw.match(ENTITY_FIRST_PATTERN);
  if (entityFirstMatch?.[1]) {
    const entity = cleanAskedEntity(entityFirstMatch[1], true);
    if (entity) return entity;
  }

  return "";
}

function entityMentioned(haystack: string, entity: string): boolean {
  const e = entity.toLowerCase().trim();
  if (!e) return false;
  if (e.length >= 3 && tokenOnWordBoundary(haystack, e)) return true;
  const tokens = e.split(/[\s\-_/]+/).filter((t) => t.length >= 4);
  if (!tokens.length) return false;
  const hits = tokens.filter((t) => tokenOnWordBoundary(haystack, t)).length;
  return hits >= Math.max(1, tokens.length - 1);
}

export type UnwrapSpoilerOpts = {
  question?: string;
  appId?: string | null;
  /** When true, unwrap every spoiler fence for this turn (explicit consent). */
  spoilerConsentEffective?: boolean;
};

/**
 * Convert ```bonsai-spoiler fences into plain prose when:
 * - the user consented to spoilers for this turn,
 * - the title profile is low-narrative (routine boss/tactics), or
 * - the fence body mentions the asked beat entity.
 */
export function unwrapAskedEntitySpoilerFences(
  text: string,
  questionOrOpts: string | UnwrapSpoilerOpts
): string {
  const opts: UnwrapSpoilerOpts =
    typeof questionOrOpts === "string" ? { question: questionOrOpts } : questionOrOpts;
  const question = opts.question || "";
  const appId = String(opts.appId || "").trim();
  const consent = opts.spoilerConsentEffective === true;
  const lowNarrativeTitle = titleProfileIsLowNarrative(appId);
  const entity = extractAskedBeatEntity(question);
  if (!text) return text;
  if (!consent && !lowNarrativeTitle && !entity) return text;
  return text.replace(SPOILER_FENCE_RE, (full, body: string) => {
    if (consent || lowNarrativeTitle) return String(body).replace(/\n$/, "");
    if (entity && (entityMentioned(body, entity) || entityMentioned(full, entity))) {
      return String(body).replace(/\n$/, "");
    }
    return full;
  });
}
