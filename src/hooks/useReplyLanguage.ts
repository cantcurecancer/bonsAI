/**
 * Title: Reply language hook
 * Purpose: Load effective Ask reply language snapshot from backend and expose localized t() helper.
 * Used for: index.tsx and About/Settings reply-language rows.
 * Solves: UI strings follow user language preference with English per-key fallback.
 * Does not: Translate model system prompts — backend owns reply-language routing.
 */
import { useCallback, useEffect, useState } from "react";
import { callDeckyWithTimeout } from "../utils/deckyCall";
import {
  REPLY_LANGUAGE_FOLLOW_SYSTEM,
  type ReplyLanguageId,
} from "../data/replyLanguage";
import { t as translate } from "../utils/i18n";
import type { UiStringKey } from "../i18n/keys";
import type { UiStringVars } from "../i18n/catalog";

export type ReplyLanguageSnapshot = {
  override: ReplyLanguageId;
  steam_client_language: string;
  effective: string;
  display_name: string;
};

const DEFAULT_SNAPSHOT: ReplyLanguageSnapshot = {
  override: REPLY_LANGUAGE_FOLLOW_SYSTEM,
  steam_client_language: "english",
  effective: "english",
  display_name: "English",
};

/** Effective Ask reply language + ``t()`` helper (backend snapshot is authoritative). */
export function useReplyLanguage(replyLanguage: ReplyLanguageId) {
  const [snapshot, setSnapshot] = useState<ReplyLanguageSnapshot>(DEFAULT_SNAPSHOT);

  const refresh = useCallback(async () => {
    try {
      const snap = await callDeckyWithTimeout<[], ReplyLanguageSnapshot>(
        "get_reply_language_snapshot",
        []
      );
      if (snap && typeof snap.effective === "string") {
        setSnapshot(snap);
      }
    } catch {
      /* keep prior snapshot */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [replyLanguage, refresh]);

  const effectiveLang = snapshot.effective || "english";

  const t = useCallback(
    (key: UiStringKey, vars?: UiStringVars) => translate(key, effectiveLang, vars),
    [effectiveLang],
  );

  return {
    snapshot,
    effectiveLang,
    steamClientLanguage: snapshot.steam_client_language,
    steamClientLanguageLabel: snapshot.display_name,
    refresh,
    t,
  };
}
