/**
 * Title: Session RAG preset composer
 * Purpose: Probabilistically mix static preset seeds with session RAG chip candidates.
 * Used for: composePresetSeedsWithSessionRag and MainTab preset carousel seed list.
 * Solves: Contextual preset variety without replacing the full static carousel each render.
 * Does not: Call backend for candidates — see sessionRagChipCandidates RPC helper.
 */
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

/** A chip drawn from the corpus for the running game, as opposed to a shared Deck tip. */
function isGameCandidate(candidate: SessionRagChipCandidate): boolean {
  return (candidate.domain || "").toLowerCase() === "strategy";
}

function toPresetPrompt(candidate: SessionRagChipCandidate): PresetPrompt {
  return {
    text: candidate.text,
    category: candidate.category,
    ...(candidate.preferAskMode ? { preferAskMode: candidate.preferAskMode } : {}),
    // V4: badge game chips only. A shared Proton tip is not evidence this game is covered.
    ...(isGameCandidate(candidate) ? { ragTip: true } : {}),
  };
}

/**
 * G2: a chip naming something from *this game's* corpus is the one worth guaranteeing, so game
 * candidates are tried before shared compat ones. Order within each group is preserved — the
 * backend already ranks them.
 */
function orderCandidates(candidates: SessionRagChipCandidate[]): SessionRagChipCandidate[] {
  return [...candidates.filter(isGameCandidate), ...candidates.filter((c) => !isGameCandidate(c))];
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
  const ragPool = orderCandidates(ragCandidates);
  const ragTexts = new Set(ragPool.map((c) => c.text));
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

  // V1, the guarantee. Rolling per slot at ~30% means three static chips come up about a third
  // of the time (0.7^3 = 34%), so a player with a covered game could open the plugin and see no
  // sign the corpus exists -- which is what Phase 4's discovery found on Deck. When candidates
  // exist, at least one slot is a RAG chip.
  //
  // The *last* slot is the one converted, not the first: the first chip is the one a contextual
  // reseed has deliberately chosen for the category the user just used, and overwriting that
  // would trade one kind of relevance for another.
  if (!out.some((prompt) => ragTexts.has(prompt.text))) {
    const forced = pickRag();
    if (forced) {
      out[out.length - 1] = forced;
    }
  }

  return out;
}

export type PickNextCarouselChipArgs = {
  /** Every text in carousel history. A chip already here is never picked again. */
  historyTexts: ReadonlySet<string>;
  /** The text(s) on screen right now — see carouselState.visibleWindowTexts. */
  visibleTexts: ReadonlySet<string>;
  ragCandidates: SessionRagChipCandidate[];
  /** What to show when no RAG chip is chosen; the caller binds this to getRandomPresetExcluding. */
  staticFallback: () => PresetPrompt;
  ragProbability?: number;
  /** Injectable RNG for tests (returns [0, 1)). */
  random?: () => number;
};

/**
 * The chip the auto-advance tick should append next.
 *
 * `composeSessionPresets` above runs **once**, when the carousel is seeded. Rotation then
 * replenished itself straight from the static preset pool, so every corpus chip was carried out of
 * the window within about four ticks and none could ever come back — measured on device
 * 2026-08-29 as "present to 21s, gone from 24s, never again", with the backend supplying eight
 * candidates the whole time. The guarantee was real but applied at one instant; this is the same
 * guarantee applied to the tick.
 *
 * The two text sets are not interchangeable. Dedupe reads `historyTexts` so a chip is not repeated
 * while it is still remembered; the guarantee reads `visibleTexts`, because a corpus chip sitting
 * in history off screen is exactly the state the user complains about.
 */
export function pickNextCarouselChip({
  historyTexts,
  visibleTexts,
  ragCandidates,
  staticFallback,
  ragProbability = SESSION_RAG_CHIP_PROBABILITY,
  random = Math.random,
}: PickNextCarouselChipArgs): PresetPrompt {
  if (ragCandidates.length === 0) {
    return staticFallback();
  }
  const available = orderCandidates(ragCandidates).filter((c) => !historyTexts.has(c.text));
  if (available.length === 0) {
    return staticFallback();
  }
  // The guarantee, at rotation time: nothing on screen is from the corpus, so the next chip is.
  const corpusOnScreen = ragCandidates.some((c) => visibleTexts.has(c.text));
  if (!corpusOnScreen) {
    return toPresetPrompt(available[0]!);
  }
  return random() < ragProbability ? toPresetPrompt(available[0]!) : staticFallback();
}
