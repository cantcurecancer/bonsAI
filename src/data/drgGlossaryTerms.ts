/**
 * Title: DRG Survivor glossary terms
 * Purpose: Curated jargon definitions for Deep Rock Galactic: Survivor, tap-to-define inline in replies.
 * Used for: drgGlossaryTermMatch (detection) and DrgGlossaryTermChip (rendering).
 * Solves: "kiting" appears undefined in the game's own KB card (data/kb/strategy_seed.json:164);
 *         lets a player look a term up without derailing the reply that used it.
 * Does not: Cover any other game. DRG Survivor only, on purpose — see the roadmap entry; this stays
 *           a small curated list, not a generic cross-game jargon framework.
 */

export type DrgGlossaryTerm = {
  /** Stable id, also used as the React key / registry key root. */
  id: string;
  /** Canonical display form, matched case-insensitively on a word boundary. */
  term: string;
  /** Extra surface forms matched the same way, in addition to `term` (e.g. plurals, tenses). */
  altForms?: string[];
  /**
   * Shown on focus alone, before any button is pressed — kept to a handful of words on purpose
   * (hand-written, not a truncation of `full`, so it never trails off mid-clause).
   */
  peek: string;
  /** Shown once the term is activated (A / tap). */
  full: string;
};

/** Deep Rock Galactic: Survivor's Steam AppID — matches the game row at data/kb/strategy_seed.json:4. */
export const DRG_SURVIVOR_APP_ID = "2321470";

/**
 * Genuinely used, undefined-in-place DRG Survivor jargon — not an invented dictionary.
 *
 * "kiting" is the roadmap's anchor term (data/kb/strategy_seed.json:164, :50, :168). "overclock" is
 * the other term that recurs across cards (:50, :166) without ever being spelled out at the point of
 * use. Both are read straight off the shipped DRG Survivor cards; nothing here is invented.
 */
export const DRG_SURVIVOR_GLOSSARY_TERMS: DrgGlossaryTerm[] = [
  {
    id: "kiting",
    term: "kiting",
    altForms: ["kite", "kited", "kites"],
    peek: "Backing away while you keep shooting.",
    full:
      "Kiting means backing away from an enemy while you keep shooting it, using your movement " +
      "speed to stay just out of melee range instead of tanking hits. It buys survival time, but a " +
      "run spent only kiting mines nothing — kite between waves, not instead of mining.",
  },
  {
    id: "overclock",
    term: "overclock",
    altForms: ["overclocks", "overclocked"],
    peek: "A weapon mod that changes what it does, not just its numbers.",
    full:
      "An overclock is a weapon mod that changes what a weapon is for rather than simply making it " +
      "bigger — read what it removes as well as what it adds before slotting one. Save your best " +
      "overclock, or a nuke, for an armor-break window on a boss like the Dreadnought.",
  },
];
