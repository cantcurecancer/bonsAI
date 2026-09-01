/**
 * Title: Single-slot preset rotation
 * Purpose: Choose the next prompt for the one-chip row: frozen batch round-robin, then contextual
 *          seeds not yet shown, then the sampled pool.
 * Used for: MainTabPresetAnimatedChips fade / static / decode modes.
 * Solves: With one chip on screen (2026-08-31), "swap in a random prompt" showed one of the three
 *         contextual seeds and lost the other two — including the game-specific corpus chips —
 *         and a frozen QA batch ping-ponged between its first two entries because the picker
 *         excluded only what was on screen.
 * Does not: Drive carousel mode, which keeps a history — see carouselState and sessionRagComposer.
 */
import {
  getRandomPresetExcluding,
  nextFrozenPresetAfter,
  type PresetPrompt,
  type PresetSamplerOptions,
} from "../../data/presets";

/** How many just-shown prompts stay out of the random draw, so a short pool does not stutter. */
export const SINGLE_SLOT_RECENT_MAX = 3;

export type SingleSlotRotation = {
  /** Contextual seeds not yet shown since the last seeding, in the order they were given. */
  queue: readonly PresetPrompt[];
  /** Texts shown most recently, oldest first. */
  recent: readonly string[];
};

/** The row's first prompt and the rotation state that follows it. */
export function startSingleSlotRotation(
  seeds: readonly PresetPrompt[],
): { first: PresetPrompt | null; rotation: SingleSlotRotation } {
  const [first = null, ...rest] = seeds;
  return { first, rotation: { queue: rest, recent: [] } };
}

/**
 * The prompt to show after `current`.
 *
 * Priority: a frozen QA batch walks in order regardless of anything else; otherwise contextual
 * seeds the user has not seen yet come before the random pool, so a seeding of three prompts is
 * shown in full even though the row holds one. The random draw excludes what is showing and what
 * just showed.
 */
export function nextSingleSlotPreset(
  current: PresetPrompt,
  rotation: SingleSlotRotation,
  options?: PresetSamplerOptions,
): { next: PresetPrompt; rotation: SingleSlotRotation } {
  const recent = [...rotation.recent, current.text].slice(-SINGLE_SLOT_RECENT_MAX);
  const frozen = nextFrozenPresetAfter(current.text);
  if (frozen) {
    return { next: frozen, rotation: { queue: rotation.queue, recent } };
  }

  const queue = rotation.queue.filter((p) => p.text !== current.text && !recent.includes(p.text));
  const [queued, ...remaining] = queue;
  if (queued) {
    return { next: queued, rotation: { queue: remaining, recent } };
  }

  const next = getRandomPresetExcluding(new Set(recent), options);
  return { next, rotation: { queue: [], recent } };
}
