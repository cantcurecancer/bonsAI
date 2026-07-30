/**
 * Title: Settings and response barrel
 * Purpose: Re-export barrel for settings schema, normalizers, and payload builder utilities.
 * Used for: Hooks and tabs importing BonsaiSettings types and toBonsaiSettingsPayload.
 * Solves: Stable import path for settings contracts without deep data/ paths in consumers.
 * Does not: Add logic — see bonsaiSettingsSchema, bonsaiSettingsNormalizers, settingsPayload.
 */
/**
 * Backward-compatible re-export barrel for settings normalization and response formatting.
 * @see ../data/bonsaiSettingsSchema.ts
 * @see ../data/bonsaiSettingsNormalizers.ts
 * @see ./settingsPayload.ts
 */
export * from "../data/bonsaiSettingsSchema";
export * from "../data/bonsaiSettingsNormalizers";
export * from "./settingsPayload";
