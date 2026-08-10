/**
 * Title: Session survival snapshot
 * Purpose: Capture and restore Main-tab Ask state across Decky Content remounts (modals, tab switches).
 * Used for: index.tsx, useBonsaiPluginShell, useBonsaiAskOrchestration on mount restore.
 * Solves: showModal unmount wipes React state; module-level peek/restore keeps Ask thread alive.
 * Does not: Persist across plugin restarts — disk settings use separate storage keys.
 */
import type { ModelPolicyDisclosurePayload } from "../data/modelPolicy";
import type { PresetPrompt } from "../data/presets";
import type { PresetCarouselInjectPayload } from "../types/backgroundAsk";
import type {
  AppliedResult,
  AskAttachment,
  AskThreadCollapsedTurn,
  OllamaContextUi,
  ScreenshotItem,
  StrategyGuideBranchesPayload,
  StrategyChecklistState,
} from "../types/bonsaiUi";
import type { BonsaiSettingsSnapshotInput } from "../data/bonsaiSettingsSchema";
import type { TransparencySnapshot } from "./inputTransparency";
import type { LastExchangeSnapshot } from "../types/backgroundAsk";
import type { AskThreadExpandedTurnKey } from "../types/bonsaiUi";
import { createTabLocalSurvival } from "./createTabLocalSurvival";

export type BonsaiSessionSurvivalSnapshot = {
  currentTab: string;
  unifiedInput: string;
  selectedIndex: number;
  navigationMessage: string;
  selectedAttachment: AskAttachment | null;
  isScreenshotBrowserOpen: boolean;
  mediaError: string;
  recentScreenshots: ScreenshotItem[];
  isLoadingRecentScreenshots: boolean;
  pluginHelpDismissed: boolean;
  ollamaIp: string;
  /** In-memory settings so remount + load_settings does not revert pending debounced edits. */
  settingsSnapshot: BonsaiSettingsSnapshotInput;
  ollamaResponse: string;
  ollamaContext: OllamaContextUi;
  lastExchange: LastExchangeSnapshot | null;
  askThreadCollapsed: AskThreadCollapsedTurn[];
  askThreadDisplayQuestion: string;
  expandedTurnKey: AskThreadExpandedTurnKey;
  /** @deprecated Legacy modal survival field; used only when expandedTurnKey is absent on restore. */
  askThreadViewIndex?: number | null;
  suggestedPrompts: PresetPrompt[];
  lastTransparency: TransparencySnapshot | null;
  modelPolicyDisclosure: ModelPolicyDisclosurePayload | null;
  strategyGuideBranches: StrategyGuideBranchesPayload | null;
  strategyChecklist: StrategyChecklistState | null;
  elapsedSeconds: number | null;
  lastApplied: AppliedResult | null;
  shortcutSetupVariant: "deck" | "stadia" | null;
  presetCarouselInject: PresetCarouselInjectPayload | null;
  showSlowWarning: boolean;
  lastRequestId: number | null;
  thinkingSummary: string | null;
  /** Active chat slot id only — turns reload from disk. */
  activeSlotId: string | null;
};

const survival = createTabLocalSurvival<BonsaiSessionSurvivalSnapshot>({ consumeClears: false });

let restoredSettingsSnapshot: BonsaiSettingsSnapshotInput | null = null;

/** Bumped on Clear all data so remount + load_settings ignore stale modal survival. */
let pluginDataClearedGeneration = 0;

/** Stays true from clear until disk defaults are hydrated; blocks modal survival restore. */
let blockSessionSettingsRestore = false;

/** Peek without consuming — used for synchronous `useState` initializers on remount. */
export function peekBonsaiSessionPendingRestore(): BonsaiSessionSurvivalSnapshot | null {
  return survival.peekPending();
}

export function captureBonsaiSessionForModal(snapshot: BonsaiSessionSurvivalSnapshot): void {
  survival.captureDirect(snapshot);
}

/** Keep modal survival settings in sync when RPC saves run while a modal is open. */
export function patchPendingSessionSettingsSnapshot(
  patch: Partial<BonsaiSettingsSnapshotInput>
): void {
  const pending = survival.peekPending();
  if (!pending?.settingsSnapshot) return;
  const nextSettings = { ...pending.settingsSnapshot, ...patch };
  survival.captureDirect({ ...pending, settingsSnapshot: nextSettings });
  if (restoredSettingsSnapshot) {
    restoredSettingsSnapshot = { ...restoredSettingsSnapshot, ...patch };
  }
}

/** Patch top-level session fields (e.g. post-modal return tab) before Decky remount restore. */
export function patchPendingSessionSurvival(
  patch: Partial<Pick<BonsaiSessionSurvivalSnapshot, "currentTab">>
): void {
  const pending = survival.peekPending();
  if (!pending) return;
  survival.captureDirect({ ...pending, ...patch });
}

export function consumeBonsaiSessionAfterRemount(): BonsaiSessionSurvivalSnapshot | null {
  const snap = survival.consumePending();
  if (!snap) return null;
  if (snap.settingsSnapshot) {
    restoredSettingsSnapshot = snap.settingsSnapshot;
  }
  return snap;
}

/** Call after remount restore commits so a second Strict Mode mount can still peek the snapshot. */
export function finalizeSessionRestoreAfterRemount(): void {
  survival.finalize();
}

/** After modal remount, prefer in-memory settings over stale disk when load_settings completes. */
export function takeRestoredSettingsSnapshot(): BonsaiSettingsSnapshotInput | null {
  const snap = restoredSettingsSnapshot;
  restoredSettingsSnapshot = null;
  return snap;
}

/** Wipe modal survival cache (e.g. after Clear all data). */
export function clearBonsaiSessionSurvival(): void {
  survival.clear();
  restoredSettingsSnapshot = null;
}

/** Mark a full plugin data clear; clears survival and returns the new generation. */
export function markPluginDataCleared(): number {
  pluginDataClearedGeneration += 1;
  blockSessionSettingsRestore = true;
  clearBonsaiSessionSurvival();
  return pluginDataClearedGeneration;
}

/** Call after disk defaults are hydrated so modal survival may resume. */
export function acknowledgePluginDataClearHandled(): void {
  blockSessionSettingsRestore = false;
}

export function getPluginDataClearedGeneration(): number {
  return pluginDataClearedGeneration;
}

/** True while a clear-data reset is in flight — blocks stale modal survival. */
export function shouldIgnoreRestoredSettingsSnapshot(_seenAtMount?: number): boolean {
  return blockSessionSettingsRestore;
}
