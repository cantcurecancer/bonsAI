/**
 * Title: bonsAI browser storage clearer
 * Purpose: Remove every bonsai* key from localStorage and sessionStorage (both the
 *          `bonsai:` and `bonsai_` spellings).
 * Used for: Settings clear plugin data and disclaimer replay flows.
 * Solves: Complete client-side plugin state wipe without touching unrelated site storage.
 * Does not: Clear backend plugin data or Ollama models — see clear_plugin_data RPC.
 */
/**
 * Every key the plugin has ever written starts with "bonsai", but not all of them use the colon.
 *
 * Three knowledge-base "already warned you" flags use an underscore instead —
 * `bonsai_kb_failure_toast`, `bonsai_kb_nomic_hint_warned` and `bonsai_kb_unavailable_warned` —
 * so a sweep matching only "bonsai:" left them behind and *Clear all plugin data* did not clear
 * all plugin data. The visible cost: after a wipe the plugin still believed it had already
 * warned about a knowledge-base problem, and stayed quiet when it should have spoken up. Found
 * 2026-09-05 when the maintainer asked for the wipe to be best-effort.
 *
 * Matching the bare word covers both spellings, and clears the old keys off devices that already
 * have them, which renaming them would not.
 */
const BONSAI_STORAGE_PREFIX = "bonsai";

/** Remove all plugin keys from localStorage and sessionStorage (bonsai:* and bonsai_*). */
export function clearBonsaiBrowserStorage(): void {
  try {
    const lsKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(BONSAI_STORAGE_PREFIX)) lsKeys.push(key);
    }
    for (const key of lsKeys) window.localStorage.removeItem(key);

    const ssKeys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith(BONSAI_STORAGE_PREFIX)) ssKeys.push(key);
    }
    for (const key of ssKeys) window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
