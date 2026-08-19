/**
 * Title: Preset prompt catalog
 * Purpose: Suggested Ask composer prompts, category heuristics, and carousel sampling helpers.
 * Used for: MainTabPresetRow chips, contextual carousel seeds, and QA frozen-carousel testing.
 * Solves: Isolates conversational UX tuning data from view-layer components.
 * Does not: Submit asks or join running-game titles — see joinPresetWithRunningGame util.
 */
import type { AskModeId } from "./askMode";

export type PresetPrompt = {
  text: string;
  category: string;
  beta?: boolean;
  /** When set, tapping this chip also switches Ask mode (e.g. Strategy Guide). */
  preferAskMode?: AskModeId;
  /**
   * Phase 4 V4: this chip names something from the corpus for the running game, so it carries a
   * **Tip** badge. Game RAG chips only — shared Proton/Deck troubleshooting chips do not get one,
   * because the badge is a claim about *this game* being covered, and a generic Deck tip is not.
   */
  ragTip?: boolean;
};

/**
 * **Prompt-testing helper (default off):** When `true`, the main-tab preset carousel uses the
 * fixed strings in `TEMP_CAROUSEL_FROZEN_TEXTS` (order preserved) instead of random or
 * contextual sampling — stable chips for repeatable Deck / model checks. Shipped builds keep
 * this `false`; set to `true` locally while working through matrices in `docs/testing.md`.
 *
 * Freezing also suppresses session-RAG mixing (`composePresetSeedsWithSessionRag`), so a suite
 * that asserts a RAG chip appears cannot pass while this is on — guard those cases on the flag
 * the way `presets.test.ts` does rather than leaving them to fail.
 */
export const TEMP_PRESET_CAROUSEL_FROZEN = false;

/**
 * Frozen chip texts in order. The carousel has three slots, so the first three fill it and
 * rotation walks the rest in order — list more than three to stage a whole QA batch in one
 * deploy. Each entry must match a `text` in `PRESET_PROMPTS`; an entry that matches nothing is
 * skipped, and if fewer than three resolve the freeze falls back to random sampling.
 */
export const TEMP_CAROUSEL_FROZEN_TEXTS: readonly string[] = [
  "What are the best settings for 60fps?",
  "How do I fix stuttering?",
  "When should I use Expert mode instead of Speed?",
] as const;

/** Static seed nudging users to turn on the KB; excluded from sampling when the setting is on. */
export const LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT =
  "Enable local knowledge base for better game tips";

export type PresetSamplerOptions = {
  /**
   * When true, KB-advice static seeds are excluded. Gates on `use_local_knowledge_base`
   * only — corpus installed state is not visible on this path.
   */
  useLocalKnowledgeBase?: boolean;
};

function samplerPool(options?: PresetSamplerOptions): PresetPrompt[] {
  if (!options?.useLocalKnowledgeBase) return PRESET_PROMPTS;
  return PRESET_PROMPTS.filter((p) => p.text !== LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT);
}

const PRESET_PROMPTS: PresetPrompt[] = [
  // Shipped — advice-first questions (TDP/GPU guidance); action only for strong shipped surfaces.
  { text: "How can I optimize for battery life?", category: "battery" },
  { text: "How do I balance FPS and battery?", category: "battery" },
  { text: "What TDP should I use for menus and idle?", category: "battery" },
  { text: "What's the efficiency sweet spot for this game?", category: "performance" },
  { text: "What are the best settings for 60fps?", category: "performance" },
  { text: "Recommended TDP for this game?", category: "performance" },
  { text: "What are the best FSR settings?", category: "performance" },
  { text: "Why is my Deck running hot?", category: "thermal" },
  { text: "Recommended controller layout?", category: "controls" },
  { text: "How can I reduce input lag?", category: "controls" },
  { text: "Open Steam Input config", category: "controls" },
  { text: "How do I fix Steam Input for this game?", category: "controls" },
  { text: "How do I bind a BonsAI quick-launch chord?", category: "controls" },
  { text: "Why is my game crashing?", category: "troubleshooting" },
  { text: "How do I fix stuttering?", category: "troubleshooting" },
  { text: "Help me troubleshoot a Proton issue", category: "troubleshooting" },
  { text: "Game won't launch, what should I check?", category: "troubleshooting" },
  { text: "bonsai:vac-check", category: "troubleshooting" },
  { text: "Diagnose a slow Ollama response", category: "ollama" },
  { text: "How do I find Ollama on my LAN?", category: "ollama" },
  { text: "How do I use Find LAN on the Ollama tab?", category: "ollama" },
  { text: "Why can't bonsAI reach my PC Ollama host?", category: "ollama" },
  { text: "What should I do if Ask times out?", category: "ollama" },
  { text: "What settings should I use?", category: "general" },
  { text: "Any known issues running this on Deck?", category: "general" },
  { text: "How well does this game run on Deck?", category: "general" },
  { text: "Describe what you see in this screenshot", category: "general" },
  { text: "What do the model policy tiers mean?", category: "general" },
  { text: "Which Ollama model fits my Deck setup?", category: "general" },
  { text: "Which Ollama essentials should I pull for this Deck?", category: "general" },
  { text: LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT, category: "general" },
  { text: "When should I use Expert mode instead of Speed?", category: "general", preferAskMode: "expert" },
  { text: "How do I set up voice input on the Deck?", category: "general" },
  { text: "How do I get past this part?", category: "strategy", preferAskMode: "strategy" },
  { text: "I'm stuck — what should I try next?", category: "strategy", preferAskMode: "strategy" },
  { text: "Help me beat this boss or encounter", category: "strategy", preferAskMode: "strategy" },
  { text: "How do I use strategy mode?", category: "strategy", preferAskMode: "strategy" },
  { text: "What's ahead (without spoilers)?", category: "strategy", preferAskMode: "strategy" },
  // Roadmap previews (honest beta; click only fills input).
  { text: "How do I enable token streaming?", category: "general", beta: true },
  { text: "What should I expect while answers stream in?", category: "general", beta: true },
  { text: "Can you set a quiet fan profile?", category: "thermal", beta: true },
  { text: "What does my Proton log say about the last crash?", category: "troubleshooting", beta: true },
  { text: "Are there issues with my Steam Input layout?", category: "controls", beta: true },
  { text: "Suggest mods or tweaks for this game", category: "general", beta: true },
];

const FOLLOW_UP_CATEGORIES: Record<string, string[]> = {
  performance: ["performance", "thermal", "battery"],
  battery: ["battery", "performance", "thermal"],
  thermal: ["thermal", "battery", "performance"],
  controls: ["controls", "troubleshooting", "general"],
  troubleshooting: ["troubleshooting", "performance", "general"],
  /** After Ollama/latency chips, prefer model policy and connection-adjacent prompts over TDP/FPS. */
  ollama: ["general", "general", "troubleshooting"],
  general: ["general", "performance", "battery"],
  strategy: ["strategy", "general", "troubleshooting"],
};

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["battery", ["battery", "power", "tdp", "watt", "charge", "idle"]],
  [
    "ollama",
    [
      "ollama",
      "ollama_host",
      "11434",
      "keep alive",
      "keep_alive",
      "inference latency",
      "model loads",
      "find lan",
      "mdns",
      "named host",
      "pc ollama",
      "connection",
      "timeout",
      "essentials",
      "pull model",
    ],
  ],
  ["performance", ["fps", "performance", "speed", "framerate", "frame rate", "fsr", "resolution"]],
  ["thermal", ["fan", "thermal", "temp", "heat", "cool", "noise", "long session"]],
  ["controls", ["controller", "layout", "input", "button", "joystick", "trackpad", "steam input", "chord", "quick-launch"]],
  ["troubleshooting", ["crash", "stutter", "fix", "error", "bug", "issue", "problem", "lag", "proton", "launch", "won't"]],
  ["general", ["compatibility", "verified", "run on deck", "voice input", "expert mode", "token streaming", "stream in"]],
  [
    "strategy",
    [
      "stuck",
      "beat",
      "boss",
      "puzzle",
      "level",
      "walkthrough",
      "how do i",
      "can't get",
      "progress",
      "temple",
      "dungeon",
    ],
  ],
];

/**
 * When `TEMP_PRESET_CAROUSEL_FROZEN` and `count === 3`, replace the triple with
 * `TEMP_CAROUSEL_FROZEN_TEXTS` in order. Shared by `getRandomPresets` and `getContextualPresets`.
 */
/**
 * Frozen texts resolved to prompts, in list order. Returns `[]` when fewer than three resolve,
 * which is the caller's signal to fall back to normal sampling rather than show a short carousel.
 */
function frozenPresets(): PresetPrompt[] {
  if (!TEMP_PRESET_CAROUSEL_FROZEN) return [];
  const resolved: PresetPrompt[] = [];
  for (const text of TEMP_CAROUSEL_FROZEN_TEXTS) {
    const p = PRESET_PROMPTS.find((x) => x.text === text);
    if (p) {
      resolved.push(p);
    }
  }
  return resolved.length >= 3 ? resolved : [];
}

function applyTempFrozenCarousel(picked: PresetPrompt[], count: number): PresetPrompt[] {
  if (!TEMP_PRESET_CAROUSEL_FROZEN || count < 3 || picked.length < 3) {
    return picked;
  }
  const resolved = frozenPresets();
  return resolved.length >= 3 ? resolved.slice(0, count) : picked;
}

export function getRandomPresets(count: number, options?: PresetSamplerOptions): PresetPrompt[] {
  /** Shuffle and return a bounded random subset of starter prompts. */
  const pool = [...samplerPool(options)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const sliced = pool.slice(0, count);
  if (count === 3) {
    return applyTempFrozenCarousel(sliced, count);
  }
  return sliced;
}

/** Milliseconds to keep a preset fully visible after fade-in; scales with text length (clamped). */
export function holdMsForPresetText(text: string): number {
  const msPerChar = 300;
  const minMs = 8000;
  const maxMs = 32000;
  const raw = text.length * msPerChar;
  return Math.min(maxMs, Math.max(minMs, raw));
}

/**
 * Pick a random preset whose `text` is not in `exclude`.
 * If every prompt is excluded (unlikely), falls back to a random prompt from the full list.
 */
export function getRandomPresetExcluding(
  exclude: Set<string>,
  options?: PresetSamplerOptions,
): PresetPrompt {
  // Rotation must honour the freeze or the carousel drifts back to random prompts a tick after
  // it is seeded, which silently ends a QA run that looks like it is still set up. Walking the
  // frozen list in order (first entry not already on screen) is what lets a batch longer than the
  // three slots be reached without a redeploy.
  const frozen = frozenPresets();
  if (frozen.length >= 3) {
    const next = frozen.find((p) => !exclude.has(p.text));
    return next ?? frozen[0]!;
  }
  const base = samplerPool(options);
  const candidates = base.filter((p) => !exclude.has(p.text));
  const pool = candidates.length > 0 ? candidates : base;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function getContextualPresets(
  lastCategory: string,
  count: number,
  options?: PresetSamplerOptions,
): PresetPrompt[] {
  /** Prioritize follow-up prompts related to the previous category, then backfill from remaining prompts. */
  const pool = samplerPool(options);
  const related = FOLLOW_UP_CATEGORIES[lastCategory] ?? Object.keys(FOLLOW_UP_CATEGORIES);
  const picked: PresetPrompt[] = [];
  const used = new Set<string>();

  for (const cat of related) {
    if (picked.length >= count) break;
    const candidates = pool.filter((p) => p.category === cat && !used.has(p.text));
    if (candidates.length === 0) continue;
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    picked.push(choice);
    used.add(choice.text);
  }

  while (picked.length < count) {
    const remaining = pool.filter((p) => !used.has(p.text));
    if (remaining.length === 0) break;
    const choice = remaining[Math.floor(Math.random() * remaining.length)];
    picked.push(choice);
    used.add(choice.text);
  }

  return count === 3 ? applyTempFrozenCarousel(picked, count) : picked;
}

export function detectPromptCategory(question: string): string {
  /** Detect question category by exact preset match first, then keyword heuristics with default fallback. */
  const lower = question.toLowerCase().replace(/\s+for\s+\S.*$/, "");
  const exact = PRESET_PROMPTS.find((p) => p.text.toLowerCase() === lower);
  if (exact) return exact.category;

  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "general";
}
