/**
 * Title: Ask thinking phase copy
 * Purpose: Localized display strings and pending-placeholder detection for in-flight Ask status.
 * Used for: MainTab thinking indicator and useSmoothStreamReveal gating.
 * Solves: Consistent starting/working labels per reply language before backend phase arrives.
 * Does not: Poll thinking_summary — backend status poll remains authoritative after first update.
 */
/** Display-only thinking phase copy; backend remains source of truth after first poll. */
import { englishUiString } from "../i18n/catalog";
import { t } from "./i18n";

export const ASK_THINKING_STARTING_DISPLAY = englishUiString("ask.starting");

/** Localized starting label for the effective reply language. */
export function askThinkingStartingDisplay(effectiveLang = "english"): string {
  return t("ask.starting", effectiveLang);
}

const PENDING_PLACEHOLDER_RE = /^thinking\.{0,3}$/i;

/** True when assistant text is a non-displayable pending placeholder. */
export function isPendingPlaceholderResponse(text: string): boolean {
  const raw = (text || "").trim();
  if (!raw) return true;
  return PENDING_PLACEHOLDER_RE.test(raw);
}
