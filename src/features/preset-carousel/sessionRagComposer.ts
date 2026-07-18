import type { AskModeId } from "../../data/askMode";
import type { PresetPrompt } from "../../data/presets";

/** Default per-slot probability of substituting a RAG candidate when available. */
export const SESSION_RAG_CHIP_PROBABILITY = 0.3;

export type SessionRagChipCandidate = {
  text: string;
  category: string;
  preferAskMode?: AskModeId;
  domain?: string;
};

export type ComposeSessionPresetsArgs = {
  staticSeeds: PresetPrompt[];
  ragCandidates: SessionRagChipCandidate[];
  ragProbability?: number;
  /** Injectable RNG for tests (returns [0, 1)). */
  random?: () => number;
};

function toPresetPrompt(candidate: SessionRagChipCandidate): PresetPrompt {
  return {
    text: candidate.text,
    category: candidate.category,
    ...(candidate.preferAskMode ? { preferAskMode: candidate.preferAskMode } : {}),
  };
}

/**
 * For each static seed slot, independently roll for a RAG substitute (~30% default).
 * Dedupes chip texts; never invents RAG when the candidate pool is empty.
 */
export function composeSessionPresets({
  staticSeeds,
  ragCandidates,
  ragProbability = SESSION_RAG_CHIP_PROBABILITY,
  random = Math.random,
}: ComposeSessionPresetsArgs): PresetPrompt[] {
  if (staticSeeds.length === 0) {
    return [];
  }
  if (ragCandidates.length === 0) {
    return [...staticSeeds];
  }

  const usedTexts = new Set<string>();
  const ragPool = [...ragCandidates];
  let ragIndex = 0;

  const pickRag = (): PresetPrompt | null => {
    for (let i = 0; i < ragPool.length; i++) {
      const idx = (ragIndex + i) % ragPool.length;
      const candidate = ragPool[idx]!;
      if (usedTexts.has(candidate.text)) {
        continue;
      }
      ragIndex = (idx + 1) % ragPool.length;
      usedTexts.add(candidate.text);
      return toPresetPrompt(candidate);
    }
    return null;
  };

  const out: PresetPrompt[] = [];
  for (const seed of staticSeeds) {
    const rollRag = random() < ragProbability;
    if (rollRag) {
      const rag = pickRag();
      if (rag) {
        out.push(rag);
        continue;
      }
    }
    if (!usedTexts.has(seed.text)) {
      usedTexts.add(seed.text);
      out.push(seed);
      continue;
    }
    const fallbackRag = pickRag();
    out.push(fallbackRag ?? seed);
  }

  return out;
}
