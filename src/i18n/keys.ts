/** Typed UI string keys for bounded v1 localization. */

export type UiStringKey =
  | "ask.starting"
  | "ask.working"
  | "toast.permissionRequired.title"
  | "toast.permissionRequired.body"
  | "toast.voiceInputError.title"
  | "toast.sessionCleared.title"
  | "toast.sessionCleared.body"
  | "toast.clearFailed.title"
  | "about.replyLanguage.sectionTitle"
  | "about.replyLanguage.dropdownLabel"
  | "about.replyLanguage.hint"
  | "about.replyLanguage.systemDetected";

export const UI_STRING_KEYS: readonly UiStringKey[] = [
  "ask.starting",
  "ask.working",
  "toast.permissionRequired.title",
  "toast.permissionRequired.body",
  "toast.voiceInputError.title",
  "toast.sessionCleared.title",
  "toast.sessionCleared.body",
  "toast.clearFailed.title",
  "about.replyLanguage.sectionTitle",
  "about.replyLanguage.dropdownLabel",
  "about.replyLanguage.hint",
  "about.replyLanguage.systemDetected",
] as const;
