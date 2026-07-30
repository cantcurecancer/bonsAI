/**
 * Title: AI character accent intensity
 * Purpose: Accent intensity ids, labels, and option metadata for roleplay system-prompt modulation.
 * Used for: SettingsTab character row, accent intensity popover, and settings normalizers.
 * Solves: Typed frontend ids that must match backend VALID_ACCENT_INTENSITY_IDS allow-list.
 * Does not: Generate roleplay prompts — backend ai_character_service applies intensity rules.
 */
export type AiCharacterAccentIntensityId = "subtle" | "balanced" | "heavy" | "unleashed";

export const AI_CHARACTER_ACCENT_INTENSITY_IDS: readonly AiCharacterAccentIntensityId[] = [
  "subtle",
  "balanced",
  "heavy",
  "unleashed",
] as const;

export const DEFAULT_AI_CHARACTER_ACCENT_INTENSITY: AiCharacterAccentIntensityId = "balanced";

export type AiCharacterAccentIntensityOption = {
  id: AiCharacterAccentIntensityId;
  /** Short chip label (Doom-difficulty inspired tone). */
  shortLabel: string;
  /** One-line description for settings helper text. */
  description: string;
};

export const AI_CHARACTER_ACCENT_INTENSITY_OPTIONS: readonly AiCharacterAccentIntensityOption[] = [
  {
    id: "subtle",
    shortLabel: "Light",
    description: "Occasional personality; answers stay plain.",
  },
  {
    id: "balanced",
    shortLabel: "Default",
    description: "Balanced voice without burying facts.",
  },
  {
    id: "heavy",
    shortLabel: "Strong",
    description: "Strong dialect; brief tangents OK, then a clear answer.",
  },
  {
    id: "unleashed",
    shortLabel: "Wild",
    description: "Most expressive; ends with a short plain recap.",
  },
];
