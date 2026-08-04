/**
 * Title: Plugin shell local storage
 * Purpose: Read and write the browser-storage values the plugin shell keeps between sessions.
 * Used for: index.tsx — unified input text, Ollama host, and the plugin-help chip dismissal.
 * Solves: Keeps localStorage access and its try/catch guards out of the shell component.
 * Does not: Touch Decky settings — persisted plugin settings go through usePluginSettings and RPC.
 */
import {
  IP_DEFAULT,
  IP_STORAGE_KEY,
  LAST_TAB_STORAGE_KEY,
  PLUGIN_HELP_DISMISSED_STORAGE_KEY,
  UNIFIED_INPUT_STORAGE_KEY,
} from "../../data/storageKeys";

/** Load persisted unified input text based on the selected persistence mode. */
export function loadSavedSearchQuery(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(UNIFIED_INPUT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Persist or clear unified input text according to current persistence preference. */
export function persistSearchQuery(unifiedInputText: string): void {
  if (typeof window === "undefined") return;
  try {
    if (unifiedInputText) {
      window.localStorage.setItem(UNIFIED_INPUT_STORAGE_KEY, unifiedInputText);
    } else {
      window.localStorage.removeItem(UNIFIED_INPUT_STORAGE_KEY);
    }
  } catch {}
}

/** Load saved Ollama host/IP for convenience between plugin sessions. */
export function loadSavedIp(): string {
  if (typeof window === "undefined") return IP_DEFAULT;
  try {
    return window.localStorage.getItem(IP_STORAGE_KEY) || IP_DEFAULT;
  } catch {
    return IP_DEFAULT;
  }
}

/** Persist Ollama host/IP updates from the connection field. */
export function saveIp(ip: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(IP_STORAGE_KEY, ip);
  } catch {}
}

/**
 * Load the tab to open on, per D15 option B — reopening resumes where you left off.
 * Returns null when nothing is stored, so the caller keeps its own default.
 */
export function loadLastTab(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_TAB_STORAGE_KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

/** Remember the active tab so the next open resumes there. Called on every tab change. */
export function saveLastTab(tabId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (tabId && tabId.trim()) {
      window.localStorage.setItem(LAST_TAB_STORAGE_KEY, tabId.trim());
    } else {
      window.localStorage.removeItem(LAST_TAB_STORAGE_KEY);
    }
  } catch {}
}

export function pluginHelpDismissedFromStorage(): boolean {
  try {
    return window.localStorage.getItem(PLUGIN_HELP_DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPluginHelpDismissedPersist(): void {
  try {
    window.localStorage.setItem(PLUGIN_HELP_DISMISSED_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}
