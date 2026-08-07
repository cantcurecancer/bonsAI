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
]);

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
  if (title.includes("state of emergency")) return "low_narrative";
  return "unknown";
}

export function titleProfileIsLowNarrative(appId?: string | null, appName?: string): boolean {
  return resolveTitleSpoilerProfile(appId, appName) === "low_narrative";
}
