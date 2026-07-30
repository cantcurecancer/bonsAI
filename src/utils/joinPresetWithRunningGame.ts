/**
 * Title: Preset running-game joiner
 * Purpose: Substitute "this game" in preset chip text with the running title or append game name.
 * Used for: Preset carousel and unified input preset injection on MainTab.
 * Solves: Contextual preset lines without duplicate "for" phrasing when game is appended.
 * Does not: Detect running game — callers pass Router.MainRunningApp display name.
 */
/**
 * Fills a preset that ends in "this game" with the running title.
 * For other presets, appends the game with an em dash (avoids a second "for"
 * when the line already says e.g. "for 60fps").
 */
export function joinPresetWithRunningGame(presetText: string, gameName: string): string {
  const g = gameName.trim();
  if (!g) {
    return presetText;
  }
  const t = presetText.trim();
  let out: string;
  if (/\bthis game\?$/i.test(t)) {
    out = t.replace(/\bthis game\?$/i, `${g}?`);
  } else if (/\bthis game$/i.test(t)) {
    out = t.replace(/\bthis game$/i, g);
  } else {
    out = `${t} \u2014 ${g}`;
  }
  return out;
}
