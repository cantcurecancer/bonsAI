/**
 * Title: Steam languages re-export barrel
 * Purpose: Re-export reply-language and Steam locale metadata for About tab and i18n consumers.
 * Used for: AboutReplyLanguageSection and modules that need dropdown options without deep imports.
 * Solves: Stable import path for language codes, labels, and effective-lang helpers.
 * Does not: Define new language entries — canonical list lives in replyLanguage.ts.
 */
export {
  REPLY_LANGUAGE_ALWAYS_ENGLISH,
  REPLY_LANGUAGE_FOLLOW_SYSTEM,
  STEAM_LANGUAGE_CODES,
  STEAM_LANGUAGE_LABELS,
  buildReplyLanguageDropdownOptions,
  effectiveLangCatalogKey,
  replyLanguageLabel,
  type ReplyLanguageDropdownOption,
  type ReplyLanguageId,
  type SteamLanguageCode,
} from "./replyLanguage";
