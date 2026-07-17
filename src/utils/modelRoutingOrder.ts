import type { PullModelEntry, PullModelLicenseClass } from "../data/pullModelCatalog";
import type { ModelPolicyTierId } from "../data/modelPolicy";

/** Keep aligned with ``ollama_routing.py`` essentials chains. */
export const DEFAULT_TEXT_ROUTING_SEED: readonly string[] = [
  "qwen2.5vl:3b",
  "qwen2.5:3b",
  "gemma4:e2b-it-qat",
  "gemma4:e2b",
  "gemma4:latest",
];

export const DEFAULT_VISION_ROUTING_SEED: readonly string[] = [
  "qwen2.5vl:3b",
  "qwen3.5:4b",
  "llava:7b",
  "gemma4:e2b-it-qat",
  "gemma4:e2b",
  "gemma3:4b",
];

export const HIGH_VRAM_SIZE_GB_THRESHOLD = 15;
export const MAX_MODEL_ROUTING_ORDER_LEN = 16;

const KNOWN_HIGH_VRAM_TAGS = new Set([
  "qwen2.5:32b",
  "qwen3.5:32b",
  "gemma4:31b",
  "gemma3:27b",
  "internvl3.5:38b",
  "internvl2.5:38b",
  "qwen3-vl",
  "qwen3-vl:30b-a3b",
]);

export function isVisionCapableTag(tag: string, catalogEntry?: PullModelEntry): boolean {
  if (catalogEntry?.tags.includes("vision")) return true;
  const t = tag.trim().toLowerCase();
  if (!t) return false;
  if (DEFAULT_VISION_ROUTING_SEED.some((s) => s === t || t.startsWith(`${s.split(":")[0]}:`))) return true;
  return /llava|vision|vl|internvl|moondream|bakllava/.test(t);
}

export function isHighVramTag(tag: string, sizeGb?: number): boolean {
  const t = tag.trim();
  if (KNOWN_HIGH_VRAM_TAGS.has(t)) return true;
  return typeof sizeGb === "number" && sizeGb >= HIGH_VRAM_SIZE_GB_THRESHOLD;
}

export function licenseClassAllowed(
  licenseClass: PullModelLicenseClass | undefined,
  tier: ModelPolicyTierId,
  nonFossUnlocked: boolean,
): boolean {
  const cls = licenseClass ?? "unknown";
  if (tier === "open_source_only") return cls === "foss";
  if (tier === "open_weight") return cls === "foss" || cls === "open_weight";
  if (nonFossUnlocked) return true;
  return cls === "foss" || cls === "open_weight" || cls === "non_foss";
}

export function buildPickerOrder(
  kind: "text" | "vision",
  installedTags: string[],
  savedOrder: string[],
): string[] {
  const installed = installedTags.map((t) => t.trim()).filter(Boolean);
  const instSet = new Set(installed);
  if (savedOrder.length > 0) {
    const inSaved = savedOrder.filter((t) => instSet.has(t));
    const rest = installed.filter((t) => !inSaved.includes(t));
    const merged = [...inSaved, ...rest];
    return kind === "vision" ? merged.filter((t) => isVisionCapableTag(t)) : merged;
  }
  const seed = kind === "vision" ? DEFAULT_VISION_ROUTING_SEED : DEFAULT_TEXT_ROUTING_SEED;
  const head = seed.filter((t) => instSet.has(t));
  let tail = installed.filter((t) => !head.includes(t));
  if (kind === "vision") tail = tail.filter((t) => isVisionCapableTag(t));
  return [...head, ...tail].slice(0, MAX_MODEL_ROUTING_ORDER_LEN);
}

export function mergePulledTag(
  order: string[],
  tag: string,
  highVramEnabled: boolean,
  sizeGb?: number,
): string[] {
  const t = tag.trim();
  if (!t) return [...order];
  const base = order.filter((x) => x !== t);
  const merged =
    highVramEnabled && isHighVramTag(t, sizeGb) ? [t, ...base] : [...base, t];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of merged) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
    if (out.length >= MAX_MODEL_ROUTING_ORDER_LEN) break;
  }
  return out;
}
