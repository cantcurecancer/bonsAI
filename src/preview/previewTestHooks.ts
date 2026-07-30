/**
 * Title: Preview test hooks
 * Purpose: Expose window.__bonsaiTestHooks for Decky Plugin Studio automated preview scenarios.
 * Used for: scripts/run-preview-suite.mjs and tier QA when DECKY_PREVIEW is active.
 * Solves: Programmatic Ask/game/screenshot triggers without manual D-pad in CI preview.
 * Does not: Ship in production Deck builds — preview harness only.
 */
export type BonsaiPreviewTestHooks = {
  getState: () => Record<string, unknown>;
  setGame: (title: string, appId?: string) => void;
  triggerAsk: (text: string) => Promise<void>;
  attachScreenshot: (base64: string, name?: string) => void;
  getTransparencyJson: () => unknown;
  getSysfsWrites: () => Promise<unknown>;
  setTab: (tabId: string) => void;
  /** Clear disclaimer acceptance and reopen the first-run beta modal (preview QA). */
  resetDisclaimer: () => void;
};

let registered: BonsaiPreviewTestHooks | null = null;

export function isDeckyPreviewRuntime(): boolean {
  if (typeof window === "undefined") return false;
  if ((window as Window & { __DECKY_PREVIEW__?: boolean }).__DECKY_PREVIEW__) return true;
  try {
    const env = (import.meta as ImportMeta & { env?: { DECKY_PREVIEW?: boolean | string } }).env;
    return env?.DECKY_PREVIEW === true || env?.DECKY_PREVIEW === "true";
  } catch {
    return false;
  }
}

export function registerPreviewTestHooks(hooks: BonsaiPreviewTestHooks): void {
  if (!isDeckyPreviewRuntime()) return;
  registered = hooks;
  (window as Window & { __bonsaiTestHooks?: BonsaiPreviewTestHooks }).__bonsaiTestHooks = hooks;
}

export function getPreviewTestHooks(): BonsaiPreviewTestHooks | null {
  return registered;
}
