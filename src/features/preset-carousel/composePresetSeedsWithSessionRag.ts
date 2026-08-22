/**
 * Title: Preset seeds with session RAG
 * Purpose: Compose preset carousel seeds with session RAG unless frozen QA triple is active.
 * Used for: MainTab preset carousel initialization hook.
 * Solves: Gate RAG mixing behind a frozen QA batch (settings-driven or the compile-time
 *         constant) so a deterministic run is not reseeded out from under the tester.
 * Does not: Advance carousel focus — see carouselState and MainTab carousel UI.
 */
import { TEMP_PRESET_CAROUSEL_FROZEN, frozenTestChipsActive } from "../../data/presets";
import type { PresetPrompt } from "../../data/presets";
import { composeSessionPresets, type SessionRagChipCandidate } from "./sessionRagComposer";

export type ComposePresetSeedsWithSessionRagArgs = {
  staticSeeds: PresetPrompt[];
  ragCandidates: SessionRagChipCandidate[];
  ragProbability?: number;
  random?: () => number;
};

/** Apply Session RAG mix unless a frozen QA batch is active. */
export function composePresetSeedsWithSessionRag(args: ComposePresetSeedsWithSessionRagArgs): PresetPrompt[] {
  // A frozen batch means the tester chose these exact chips. Mixing a RAG chip in would replace
  // one of them and end the run without saying so, which is the failure this gate exists for.
  if ((TEMP_PRESET_CAROUSEL_FROZEN || frozenTestChipsActive()) && args.staticSeeds.length >= 3) {
    return [...args.staticSeeds];
  }
  return composeSessionPresets(args);
}
