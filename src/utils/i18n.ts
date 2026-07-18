import { effectiveLangCatalogKey } from "../data/replyLanguage";
import { lookupUiString, type UiStringVars } from "../i18n/catalog";
import type { UiStringKey } from "../i18n/keys";

/** Resolve a UI string for the effective Ask reply language (English per-key fallback). */
export function t(key: UiStringKey, effectiveLangCode: string, vars?: UiStringVars): string {
  return lookupUiString(key, effectiveLangCatalogKey(effectiveLangCode), vars);
}
