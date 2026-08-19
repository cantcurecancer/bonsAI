/**
 * Title: Spoiler title profiles (constitution runtime)
 * Purpose: Built-in per-title spoiler sensitivity for display-time unwrap.
 * Used for: unwrapAskedEntitySpoilerFences before markdown render.
 * Solves: Title-level open vs protect without genre substring heuristics.
 * Does not: Prompt policy — see py_modules/backend/services/spoiler_title_profiles.py.
 */

export type SpoilerTitleProfile = "low_narrative" | "protect_progression" | "unknown";

/** Keep in sync with LOW_NARRATIVE_APP_IDS in spoiler_title_profiles.py */
export const LOW_NARRATIVE_APP_IDS = new Set([
  "2321470", // Deep Rock Galactic: Survivor
  "550", // Left 4 Dead 2
  "1222670", // The Sims 4
]);

/** Keep in sync with PROTECT_PROGRESSION_APP_IDS in spoiler_title_profiles.py */
export const PROTECT_PROGRESSION_APP_IDS = new Set([
  "413150", // Ocarina of Time
  "1086940", // Baldur's Gate 3
  "377160", // Fallout 4
  "1145360", // Hades
  "1091500", // Cyberpunk 2077
  "1547000", // GTA: San Andreas DE
  "1174180", // Red Dead Redemption 2
  "220", // Half-Life 2
  "620", // Portal 2 — puzzles spoil nothing, the late reveal does; see the Python table
]);

/**
 * Same two profiles, reachable by title name. Required by D19: a title recognised from the
 * question text has no AppID to look up. Keep in sync with _LOW_NARRATIVE_TITLES /
 * _PROTECT_PROGRESSION_TITLES in spoiler_title_profiles.py — tests/contracts/spoiler-title-profiles.json
 * asserts both languages against the same cases.
 */
export const LOW_NARRATIVE_TITLES = [
  "state of emergency",
  "deep rock galactic",
  "left 4 dead 2",
  "the sims 4",
];

export const PROTECT_PROGRESSION_TITLES = [
  "ocarina of time",
  "ship of harkinian",
  "baldur's gate 3",
  "baldurs gate 3",
  "fallout 4",
  "hades",
  "cyberpunk 2077",
  "san andreas",
  "red dead redemption 2",
  "half-life 2",
  "half life 2",
  "portal 2",
];

function normalizeTitle(name: string): string {
  return (name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveTitleSpoilerProfile(
  appId?: string | null,
  appName?: string
): SpoilerTitleProfile {
  const aid = String(appId || "").trim();
  if (aid && LOW_NARRATIVE_APP_IDS.has(aid)) return "low_narrative";
  if (aid && PROTECT_PROGRESSION_APP_IDS.has(aid)) return "protect_progression";
  const title = normalizeTitle(appName || "");
  if (!title) return "unknown";
  // Protect first: when a name matches both tables the conservative answer wins, because
  // over-fencing annoys and under-fencing cannot be taken back.
  if (PROTECT_PROGRESSION_TITLES.some((known) => title.includes(known))) {
    return "protect_progression";
  }
  if (LOW_NARRATIVE_TITLES.some((known) => title.includes(known))) return "low_narrative";
  return "unknown";
}

export function titleProfileIsLowNarrative(appId?: string | null, appName?: string): boolean {
  return resolveTitleSpoilerProfile(appId, appName) === "low_narrative";
}
