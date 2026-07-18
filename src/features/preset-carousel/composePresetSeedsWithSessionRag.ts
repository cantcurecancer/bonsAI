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
