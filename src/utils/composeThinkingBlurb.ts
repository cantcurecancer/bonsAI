/**
 * Client-side mirror of backend `compose_thinking_blurb` for instant Ask openers.
 * Keep selection logic aligned with `py_modules/backend/services/bonsai_stream_tags.py`.
 */
import type { AskModeId } from "../data/bonsaiSettingsSchema";
const SNIPPET_MAX_LEN = 56;
const PHASE_MAX_LEN = 240;
const APP_NAME_MAX_LEN = 40;

const DEADPAN_PRESET_IDS = new Set([
  "gta5_lester",
  "tf2_sniper",
  "tf2_spy",
  "mgs_otacon",
  "fo4_nick_valentine",
  "portal_glados",
]);

const EMOJI_ONLY_LINES = ["🙄", "😮‍💨", "🫠", "🌳"];

/**
 * Shown for the one round-trip between submit and the backend's woven opener arriving in the
 * `start_background_game_ai` response. Deliberately constant and pool-free: a placeholder giving
 * way to a specific line reads as progress, whereas one random opener replacing another read as
 * the line changing its mind. See docs/planning/06-thinking-blurbs-review.md § 2.1.
 */
export const THINKING_BLURB_PLACEHOLDER = "Thinking…";

const LAZY_THINKING_OPENER_RE =
  /^\s*(?:yeah\b[,!?.\s—–-]*|fine\b[.\s—–-]*|sure\b[.\s—–-]*|oh joy\b[,!\s—–-]*|right\b[.\s—–-]*)/i;

type ThinkingTone = "witty" | "deadpan";

type WeaveBits = {
  quote: string;
  gameBit: string;
  gameTitle: string;
};

export type ComposeThinkingBlurbOptions = {
  appName?: string;
  attachmentCount?: number;
  askMode?: AskModeId;
  requestId?: number;
  elapsedSeconds?: number;
  characterEnabled?: boolean;
  characterPresetId?: string | null;
};

function stableBucket(requestId: number): number {
  const rid = Math.max(0, requestId | 0);
  return (rid * 2654435761) & 0x7fffffff;
}

function pickTemplate(templates: string[], requestId: number): string {
  if (templates.length === 0) return "Working on your question…";
  const idx = stableBucket(requestId) % templates.length;
  return templates[idx]!;
}

function sanitizeAppName(appName: string): string {
  const raw = (appName || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace(/[\x00-\x1f\x7f]/g, "");
  if (cleaned.length > APP_NAME_MAX_LEN) {
    return `${cleaned.slice(0, APP_NAME_MAX_LEN - 1).trimEnd()}…`;
  }
  return cleaned;
}

export function extractQuestionSnippet(question: string, maxLen = SNIPPET_MAX_LEN): string {
  let raw = (question || "").trim().replace(/\s+/g, " ");
  if (!raw) return "";
  for (const sep of [". ", "? ", "! ", "; ", " — ", " - "]) {
    if (raw.includes(sep)) {
      raw = raw.split(sep, 1)[0]!.trim();
      break;
    }
  }
  if (raw.length > maxLen) {
    return `${raw.slice(0, maxLen - 1).trimEnd()}…`;
  }
  return raw;
}

function resolveThinkingTone(
  characterEnabled: boolean,
  characterPresetId: string | null | undefined,
): ThinkingTone {
  if (!characterEnabled) return "witty";
  const pid = (characterPresetId || "").trim();
  if (pid && DEADPAN_PRESET_IDS.has(pid)) return "deadpan";
  return "witty";
}

function weaveBits(question: string, appName: string): WeaveBits {
  const snippet = extractQuestionSnippet(question);
  const gameTitle = sanitizeAppName(appName);
  return {
    quote: snippet ? `"${snippet}"` : "your question",
    gameBit: gameTitle ? ` in ${gameTitle}` : "",
    gameTitle,
  };
}

function wittyGenericPool({ quote, gameBit, gameTitle }: WeaveBits): string[] {
  const pool = [
    `🔥🔥Another crisis 🔥🔥: ${quote}. Give me a moment${gameBit}.`,
    `On it — ${quote}${gameBit}…`,
    `"Fascinating" request: ${quote}. Processing anyway.`,
    `Great. ${quote}. Just what I needed${gameBit}.`,
    `Copy that. Wrestling with ${quote}${gameBit}…`,
    `Noted. ${quote}. I'll pretend this is exciting.`,
    `Standing by while I dig into ${quote}${gameBit}…`,
    `Ticket received: ${quote}. Filing it under "urgent to you."`,
    `Alright, alright — ${quote}${gameBit}…`,
    ...EMOJI_ONLY_LINES,
  ];
  if (gameTitle) {
    pool.push(
      `Still struggling with ${gameTitle}?`,
      `Back to wrestling with ${gameTitle}…`,
      `${gameTitle} again? Alright…`,
      `Having a moment with ${gameTitle}, I see.`,
    );
  }
  return pool;
}

function deadpanGenericPool({ quote, gameBit, gameTitle }: WeaveBits): string[] {
  const pool = [
    `${quote}. Acknowledged${gameBit}.`,
    `Processing ${quote}${gameBit}. No enthusiasm detected.`,
    `Working on ${quote}. Try not to interrupt.`,
    `${quote}${gameBit}. Inevitably.`,
    `Examining ${quote}. Results pending.`,
    `Request logged: ${quote}. Continuing.`,
    ...EMOJI_ONLY_LINES,
  ];
  if (gameTitle) {
    pool.push(
      `${gameTitle}. Again.`,
      `Still ${gameTitle}. Noted.`,
      `Resuming ${gameTitle}. Proceeding.`,
    );
  }
  return pool;
}

function wittyScreenshotPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Staring at your screenshot for ${quote}…`,
    `Squinting at pixels for ${quote}${gameBit}…`,
    `Let me decode this screenshot about ${quote}…`,
    `Your screenshot and ${quote} — delightful${gameBit}.`,
    `Comparing the capture to ${quote}${gameBit}…`,
    "🫠",
  ];
}

function deadpanScreenshotPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Screenshot received for ${quote}. Analyzing.`,
    `Visual input noted. Relating to ${quote}.`,
    `Image attached. Context: ${quote}${gameBit}.`,
    `Processing visual data for ${quote}.`,
    `Screenshot queued for ${quote}${gameBit}.`,
    "🌳",
  ];
}

function wittyTroubleshootingPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Log-diving for ${quote}${gameBit}. Try not to enjoy this.`,
    `Proton archaeology on ${quote} — my favorite hobby${gameBit}.`,
    `Cross-referencing crash vibes with ${quote}${gameBit}…`,
    `Someone said ${quote}? Time to read logs${gameBit}.`,
    `Tracing ${quote} through the wreckage${gameBit}…`,
    "😮‍💨",
  ];
}

function deadpanTroubleshootingPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Reading logs for ${quote}${gameBit}. Standard procedure.`,
    `Proton log scan: ${quote}. Proceeding.`,
    `Crash context for ${quote}${gameBit}. No commentary.`,
    `Host/latency check on ${quote}. As requested.`,
    `Diagnostic pass for ${quote}${gameBit}.`,
    "🙄",
  ];
}

function wittyPowerPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Watts, frames, regrets — ${quote}${gameBit}…`,
    `TDP theater for ${quote}. Curtain up${gameBit}.`,
    `Benchmarking my patience with ${quote}${gameBit}…`,
    `Power math on ${quote}. Hold the applause${gameBit}.`,
    `Thermal feelings about ${quote}${gameBit}…`,
    "🙄",
  ];
}

function deadpanPowerPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `TDP read for ${quote}${gameBit}. Expect numbers.`,
    `Power context: ${quote}. Collecting.`,
    `Performance data for ${quote}${gameBit}.`,
    `Wattage inquiry noted: ${quote}.`,
    `Sysfs peek for ${quote}${gameBit}.`,
    "🌳",
  ];
}

function wittyResolutionPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Resolution roulette for ${quote}${gameBit}…`,
    `FPS fantasies vs ${quote} — let's see${gameBit}.`,
    `Graphics settings guilt trip: ${quote}${gameBit}.`,
    `Balancing pixels and battery on ${quote}…`,
    `FSR prayer circle for ${quote}${gameBit}.`,
    "🫠",
  ];
}

function deadpanResolutionPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Graphics settings review: ${quote}${gameBit}.`,
    `FPS/resolution analysis for ${quote}.`,
    `Display tradeoffs on ${quote}${gameBit}.`,
    `Settings pass: ${quote}.`,
    `Frame pacing review: ${quote}${gameBit}.`,
    "😮‍💨",
  ];
}

function wittyStrategyPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Strategy mode: ${quote}${gameBit} — spoilers locked.`,
    `Scouting ${quote} without ruining the surprise${gameBit}…`,
    `Puzzle patrol on ${quote}. Minimal hints${gameBit}.`,
    `Map in my head for ${quote}${gameBit}…`,
    `Boss? What boss? Just ${quote}${gameBit}.`,
    "🌳",
  ];
}

function deadpanStrategyPool(bits: WeaveBits): string[] {
  const { quote, gameBit } = bits;
  return [
    `Strategy notes for ${quote}${gameBit}. Spoiler-safe.`,
    `Guide lookup: ${quote}. No plot leaks.`,
    `Tactical review of ${quote}${gameBit}.`,
    `Puzzle context: ${quote}. Restricted detail.`,
    `Spoiler-free pass on ${quote}${gameBit}.`,
    "🙄",
  ];
}

function questionMatchesTroubleshootingLogContext(question: string): boolean {
  const s = (question || "").toLowerCase();
  if (/\b(crash(?:es|ed|ing)?|stutter(?:ing)?|won't launch|proton)\b/.test(s)) return true;
  if (s.includes("troubleshoot") && s.includes("proton")) return true;
  if (/\bgame won'?t launch\b/.test(s) && s.includes("check")) return true;
  if (s.includes("proton issue")) return true;
  return false;
}

function userAsksOllamaBonsaiHostOrLatency(question: string): boolean {
  const s = (question || "").toLowerCase().trim();
  if (!s) return false;
  if (s.includes("ollama")) {
    const keys = ["slow", "timeout", "latency", "host", "connection", "11434", "bonsai", "setup", "install"];
    if (keys.some((k) => s.includes(k))) return true;
  }
  if (s.includes("bonsai") && (s.includes("slow") || s.includes("timeout"))) return true;
  return false;
}

function isCurrentTdpReadIntent(question: string): boolean {
  const t = (question || "").trim().toLowerCase();
  if (!t) return false;
  if (!t.includes("tdp") && !t.includes("thermal design power")) return false;
  const excl = [
    "recommend",
    "suggest",
    "set tdp",
    "set my tdp",
    "change ",
    "increase",
    "decrease",
    "lower my",
    "raise my",
    "cap at",
    "best tdp",
    "optimal tdp",
    "should i",
    "should i use",
    "optimize for",
  ];
  if (excl.some((s) => t.includes(s))) return false;
  if (/\b(what|how much)\b.{0,40}\b(tdp|watts?)\b/.test(t) && t.includes("current")) return true;
  if (/\b(what|how much)\b.{0,20}\b(current|the)\b.{0,20}\b(tdp|watts?)\b/.test(t)) return true;
  return false;
}

function userWantsPowerOrPerformanceTopic(question: string): boolean {
  const q = (question || "").toLowerCase();
  return /\b(tdp|watts?|fps|frame\s*rate|frametime|frame\s*pacing|performance|gpu\s*clock|\bmhz\b|\bgpu\b|thermal|overclock|underclock|\bapu\b|battery(\s+life|\s+drain|\s+saving)?|power\s*(limit|cap|saving|profile|draw)|stutter|stuttering|boost\s*mode|efficiency|sweet\s*spot)\b/i.test(
    q,
  );
}

function userAsksResolutionRelevantPerformance(question: string): boolean {
  const s = (question || "").toLowerCase();
  if (/best settings for \d+\s*fps/.test(s)) return true;
  if (/\bhow do i balance fps and battery\b/.test(s)) return true;
  if (s.includes("gpu clock")) return true;
  if (/\bfsr\b/.test(s)) return true;
  if (/\brecommended tdp\b/.test(s) && s.includes("this game")) return true;
  return false;
}

type ComposeIntent =
  | "troubleshooting"
  | "power"
  | "resolution"
  | "strategy"
  | "screenshot"
  | "generic";

function resolveComposeIntent(
  question: string,
  askMode: AskModeId,
  hasShot: boolean,
): ComposeIntent {
  if (questionMatchesTroubleshootingLogContext(question) || userAsksOllamaBonsaiHostOrLatency(question)) {
    return "troubleshooting";
  }
  if (isCurrentTdpReadIntent(question) || userWantsPowerOrPerformanceTopic(question)) {
    return "power";
  }
  if (userAsksResolutionRelevantPerformance(question)) {
    return "resolution";
  }
  if (askMode === "strategy") {
    return "strategy";
  }
  if (hasShot) {
    return "screenshot";
  }
  return "generic";
}

function intentPool(intent: ComposeIntent, tone: ThinkingTone, bits: WeaveBits): string[] {
  if (tone === "deadpan") {
    switch (intent) {
      case "troubleshooting":
        return deadpanTroubleshootingPool(bits);
      case "power":
        return deadpanPowerPool(bits);
      case "resolution":
        return deadpanResolutionPool(bits);
      case "strategy":
        return deadpanStrategyPool(bits);
      case "screenshot":
        return deadpanScreenshotPool(bits);
      default:
        return deadpanGenericPool(bits);
    }
  }
  switch (intent) {
    case "troubleshooting":
      return wittyTroubleshootingPool(bits);
    case "power":
      return wittyPowerPool(bits);
    case "resolution":
      return wittyResolutionPool(bits);
    case "strategy":
      return wittyStrategyPool(bits);
    case "screenshot":
      return wittyScreenshotPool(bits);
    default:
      return wittyGenericPool(bits);
  }
}

export function sanitizeThinkingSummary(text: string): string {
  const raw = (text || "").trim();
  if (!raw) return raw;
  let cleaned = raw;
  for (let i = 0; i < 3; i += 1) {
    const next = cleaned.replace(LAZY_THINKING_OPENER_RE, "").trim();
    if (next === cleaned) break;
    cleaned = next;
  }
  /*
   * Mirrors `sanitize_thinking_summary`'s `return cleaned if cleaned else raw`
   * (bonsai_stream_tags.py). A summary that is *entirely* a lazy opener — the model emitting
   * `<bonsai-status>Sure.</bonsai-status>`, which is exactly what the prompt warns against and
   * therefore exactly what happens — strips to "". Returning that blanked the thinking line
   * mid-Ask, because the render gate in MainTabChatTranscript is a truthiness check.
   * A lazy opener on screen beats no line at all.
   */
  return cleaned || raw;
}

export function composeThinkingBlurb(question: string, opts: ComposeThinkingBlurbOptions = {}): string {
  const {
    appName = "",
    attachmentCount = 0,
    askMode = "speed",
    requestId = 0,
    characterEnabled = false,
    characterPresetId = null,
  } = opts;

  const bits = weaveBits(question, appName);
  const hasShot = Math.max(0, attachmentCount | 0) > 0;
  const tone = resolveThinkingTone(characterEnabled, characterPresetId);
  const intent = resolveComposeIntent(question, askMode, hasShot);
  const pool = intentPool(intent, tone, bits);
  return sanitizeThinkingSummary(pickTemplate(pool, requestId).slice(0, PHASE_MAX_LEN));
}
