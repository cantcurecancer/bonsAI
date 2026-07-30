/**
 * Title: UI string translator
 * Purpose: Resolve localized UI strings for the effective Ask reply language with English fallback.
 * Used for: useReplyLanguage t() helper and askThinkingPhases display copy.
 * Solves: Thin wrapper over i18n/catalog lookup keyed by effectiveLangCatalogKey.
 * Does not: Own string tables — see i18n/keys and i18n/catalog.
 */
import { effectiveLangCatalogKey } from "../data/replyLanguage";
import { lookupUiString, type UiStringVars } from "../i18n/catalog";
import type { UiStringKey } from "../i18n/keys";

/** Resolve a UI string for the effective Ask reply language (English per-key fallback). */
export function t(key: UiStringKey, effectiveLangCode: string, vars?: UiStringVars): string {
  return lookupUiString(key, effectiveLangCatalogKey(effectiveLangCode), vars);
}
