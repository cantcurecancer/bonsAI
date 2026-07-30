/**
 * Title: Settings glass button tokens
 * Purpose: Shared React.CSSProperties for SteamOS-style glass row buttons in Settings/Ollama tabs.
 * Used for: Test connection, Browse models, KB actions, and other secondary controls.
 * Solves: One visual spec instead of duplicating gradient/border styles per component.
 * Does not: Own focus graphs or click handlers — consumers apply these style objects to Button.
 */
import type React from "react";

/** SteamOS glass row button — matches Test connection / Browse models (no tint fill). */
export const SETTINGS_GLASS_BTN: React.CSSProperties = {
  minHeight: 36,
  minWidth: 0,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)",
  color: "#e8eef5",
  textAlign: "left",
  justifyContent: "flex-start",
};

/** Compact destructive glass — red border/text only. */
export const SETTINGS_GLASS_BTN_DANGER: React.CSSProperties = {
  ...SETTINGS_GLASS_BTN,
  padding: "6px 12px",
  border: "1px solid rgba(248,113,113,0.5)",
  color: "#fecaca",
};
