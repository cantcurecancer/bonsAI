/**
 * Client-side mirror of backend `compose_thinking_blurb` for instant Ask openers.
 * Keep selection logic aligned with `py_modules/backend/services/bonsai_stream_tags.py`.
 */
import type { AskModeId } from "./settingsAndResponse";

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

type ThinkingTone = "witty" | "deadpan";

export type ComposeThinkingBlurbOptions = {
  appName?: string;
  attachmentCount?: number;
  askMode?: AskModeId;
  requestId?: number;
  elapsedSeconds?: number;
  characterEnabled?: boolean;
  characterPresetId?: string | null;
};

function stableBucket(requestId: number, elapsedSeconds = 0, period = 4): number {
  const rid = Math.max(0, requestId | 0);
  const bucket = Math.floor(Math.max(0, elapsedSeconds) / Math.max(1, period));
  return (rid * 2654435761 + bucket * 97) & 0x7fffffff;
}

function pickTemplate(templates: string[], requestId: number, elapsedSeconds = 0): string {
  if (templates.length === 0) return "Working on your question…";
  const idx = stableBucket(requestId, elapsedSeconds) % templates.length;
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

function applySarcasticPoolVariants(
  pool: string[],
  quote: string,
  gameBit: string,
  tone: ThinkingTone,
): string[] {
  if (tone === "deadpan") {
    return [...pool.map((t) => `Fine. ${t}`), `Sure. ${quote}. Working${gameBit}.`];
  }
  const wittyPool = [
    `Oh joy — ${quote}${gameBit}. One sec.`,
    `Another crisis: ${quote}. Give me a moment${gameBit}.`,
  ];
  for (const t of pool) {
    wittyPool.push(`Yeah, ${t}`);
  }
  return wittyPool;
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

export function composeThinkingBlurb(question: string, opts: ComposeThinkingBlurbOptions = {}): string {
  const {
    appName = "",
    attachmentCount = 0,
    askMode = "speed",
    requestId = 0,
    elapsedSeconds = 0,
    characterEnabled = false,
    characterPresetId = null,
  } = opts;

  const snippet = extractQuestionSnippet(question);
  const game = sanitizeAppName(appName);
  const quote = snippet ? `"${snippet}"` : "your question";
  const gameBit = game ? ` in ${game}` : "";
  const hasShot = Math.max(0, attachmentCount | 0) > 0;
  const tone = resolveThinkingTone(characterEnabled, characterPresetId);

  let pool: string[];

  if (questionMatchesTroubleshootingLogContext(question) || userAsksOllamaBonsaiHostOrLatency(question)) {
    pool = [`Digging into ${quote}${gameBit}…`, `Checking logs and context for ${quote}…`];
  } else if (isCurrentTdpReadIntent(question) || userWantsPowerOrPerformanceTopic(question)) {
    pool = [`Pulling power context for ${quote}…`, `Checking TDP and performance angles on ${quote}…`];
  } else if (userAsksResolutionRelevantPerformance(question)) {
    pool = [
      `Thinking about resolution and FPS for ${quote}…`,
      `Sizing up graphics settings around ${quote}…`,
    ];
  } else if (askMode === "strategy") {
    pool = [
      `Mapping a strategy take on ${quote}${gameBit}…`,
      `Scouting the puzzle without spoiling ${quote}…`,
    ];
  } else if (hasShot) {
    pool = [
      `Reviewing your screenshot alongside ${quote}…`,
      `Pairing the capture with ${quote}${gameBit}…`,
    ];
  } else {
    pool = [
      `Looking at ${quote}${gameBit}…`,
      `Getting context for ${quote}…`,
      `On it — ${quote}${gameBit}…`,
    ];
  }

  pool = applySarcasticPoolVariants(pool, quote, gameBit, tone);
  return pickTemplate(pool, requestId, elapsedSeconds).slice(0, PHASE_MAX_LEN);
}
