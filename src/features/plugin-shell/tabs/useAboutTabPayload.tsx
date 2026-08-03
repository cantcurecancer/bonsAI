/**
 * Title: About tab payload
 * Purpose: Build the memoized About tab element, including the three fixed project links it shows.
 * Used for: index.tsx — the always-present "About" tab row.
 * Solves: Keeps link constants and reply-language wiring out of the composition root.
 * Does not: Own the reply language — the caller supplies the value and its setter.
 */
import React, { useMemo } from "react";

import { AboutTab } from "../../../components/AboutTab";
import { GITHUB_ISSUES_URL, OLLAMA_UPSTREAM_REPO_URL } from "../../../data/storageKeys";

const GITHUB_REPO_URL = GITHUB_ISSUES_URL.replace(/\/issues$/, "");

type AboutTabProps = React.ComponentProps<typeof AboutTab>;

export type UseAboutTabPayloadArgs = Omit<
  AboutTabProps,
  "githubRepoUrl" | "ollamaRepoUrl" | "githubIssuesUrl"
>;

export function useAboutTabPayload({
  replyLanguage,
  onReplyLanguageChange,
  effectiveLang,
  steamClientLanguageLabel,
  t,
}: UseAboutTabPayloadArgs): React.ReactElement {
  return useMemo(
    () => (
      <AboutTab
        githubRepoUrl={GITHUB_REPO_URL}
        ollamaRepoUrl={OLLAMA_UPSTREAM_REPO_URL}
        githubIssuesUrl={GITHUB_ISSUES_URL}
        replyLanguage={replyLanguage}
        onReplyLanguageChange={onReplyLanguageChange}
        effectiveLang={effectiveLang}
        steamClientLanguageLabel={steamClientLanguageLabel}
        t={t}
      />
    ),
    [replyLanguage, onReplyLanguageChange, effectiveLang, steamClientLanguageLabel, t]
  );
}
