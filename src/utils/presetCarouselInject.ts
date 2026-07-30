/**
 * Title: Preset carousel inject normalizer
 * Purpose: Coerce RPC preset_carousel_inject payloads into typed inject chip text or null.
 * Used for: useBackgroundGameAi terminal status and preset carousel inject flow.
 * Solves: Safe parsing when backend returns empty or malformed inject hints.
 * Does not: Compose carousel seeds — see composePresetSeedsWithSessionRag.
 */
import type { PresetCarouselInjectPayload } from "../types/backgroundAsk";

export function normalizePresetCarouselInject(value: unknown): PresetCarouselInjectPayload | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as { text?: unknown }).text;
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text) return null;
  return { text };
}
