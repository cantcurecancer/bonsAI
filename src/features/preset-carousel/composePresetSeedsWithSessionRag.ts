/**
 * Title: Preset seeds with session RAG
 * Purpose: Compose preset carousel seeds with session RAG unless frozen QA triple is active.
 * Used for: MainTab preset carousel initialization hook.
 * Solves: Gate RAG mixing behind TEMP_PRESET_CAROUSEL_FROZEN for deterministic QA runs.
 * Does not: Advance carousel focus — see carouselState and MainTab carousel UI.
 */
import { TEMP_PRESET_CAROUSEL_FROZEN } from "../../data/presets";
import type { PresetPrompt } from "../../data/presets";
import { composeSessionPresets, type SessionRagChipCandidate } from "./sessionRagComposer";

export type ComposePresetSeedsWithSessionRagArgs = {
  staticSeeds: PresetPrompt[];
  ragCandidates: SessionRagChipCandidate[];
  ragProbability?: number;
  random?: () => number;
};

/** Apply Session RAG mix unless the frozen QA triple is active. */
export function composePresetSeedsWithSessionRag(args: ComposePresetSeedsWithSessionRagArgs): PresetPrompt[] {
  if (TEMP_PRESET_CAROUSEL_FROZEN && args.staticSeeds.length >= 3) {
    return [...args.staticSeeds];
  }
  return composeSessionPresets(args);
}
