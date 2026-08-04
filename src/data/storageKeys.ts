/**
 * Title: Storage key constants
 * Purpose: localStorage keys and shared external URLs for plugin shell persistence.
 * Used for: index.tsx hydration, disclaimer/help dismissal flags, and default PC IP placeholder.
 * Solves: Prevents scattered magic strings for client-side persistence and support links.
 * Does not: Read or write storage — consumers own get/set and migration logic.
 */
export const UNIFIED_INPUT_STORAGE_KEY = "bonsai:last-query";
export const IP_STORAGE_KEY = "bonsai:pc-ip";
export const IP_DEFAULT = "192.168.1.";
export const DISCLAIMER_STORAGE_KEY = "bonsai:disclaimer-accepted";
export const PLUGIN_HELP_DISMISSED_STORAGE_KEY = "bonsai:plugin-help-dismissed";
/** Last tab the user was on, so reopening the plugin resumes there instead of Main (D15 option B). */
export const LAST_TAB_STORAGE_KEY = "bonsai:last-tab";
/** Epoch ms the last tab was recorded at; only D15 option C (`resume_recent`) reads it. */
export const LAST_TAB_AT_STORAGE_KEY = "bonsai:last-tab-at";
/**
 * Synchronous mirror of the `tab_resume_mode` setting. `settings.json` is the source of truth;
 * the opening tab is picked on the first render, before `load_settings` can answer.
 */
export const TAB_RESUME_MODE_STORAGE_KEY = "bonsai:tab-resume-mode";
export const LOCAL_RUNTIME_BETA_DISMISSED_STORAGE_KEY = "bonsai:local-runtime-beta-dismissed-v1";

export const GITHUB_ISSUES_URL = "https://github.com/cantcurecancer/bonsAI/issues";
export const OLLAMA_UPSTREAM_REPO_URL = "https://github.com/ollama/ollama";
