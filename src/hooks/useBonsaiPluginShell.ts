/**
 * Title: Plugin shell hook
 * Purpose: Survive Decky Content remounts — restore active tab and capture session snapshots for modals.
 * Used for: index.tsx via BonsaiPluginShell when showModal unmounts the plugin tree.
 * Solves: Tab and partial UI state reset when modals close on Steam Deck.
 * Does not: Own Ask transcript state — see bonsaiSessionSurvival and useBonsaiAskOrchestration.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  captureBonsaiSessionForModal,
  peekBonsaiSessionPendingRestore,
  type BonsaiSessionSurvivalSnapshot,
} from "../utils/bonsaiSessionSurvival";
import { bonsaiDebugLog, bumpContentMountCount } from "../utils/bonsaiDebugIngest";
import {
  captureSettingsTabLocalSnapshot,
} from "../utils/settingsTabLocalSurvival";
import {
  captureOllamaTabLocalSnapshot,
} from "../utils/ollamaTabLocalSurvival";
import { resolveResumeTab, saveLastTab } from "../features/plugin-shell/pluginStorage";
import { restoreModalReturnFocusWithRetry } from "../features/plugin-shell/modalReturnFocusRegistry";

/**
 * If Decky unmounts plugin `Content` when `showModal` closes, React state resets to defaults; this
 * outlives the component so `useLayoutEffect` can restore the tab on the next mount.
 */
let __bonsaiTabRestoreAfterModal: string | null = null;

function resolveInitialTab(): string {
  const snap = peekBonsaiSessionPendingRestore();
  if (snap?.currentTab) return snap.currentTab;
  if (__bonsaiTabRestoreAfterModal != null) return __bonsaiTabRestoreAfterModal;
  // The two sources above are modal round-trip machinery and are empty on a normal open, which is
  // why every reopen used to land on Main. What happens instead is the user's D15 choice —
  // `resolveResumeTab` reads it from the synchronous mirror and falls back to Main.
  return resolveResumeTab("main");
}

export type UseBonsaiPluginShellOptions = {
  /** Builds the full session snapshot for modal survival capture. */
  getSessionSnapshot: () => BonsaiSessionSurvivalSnapshot;
};

export function useBonsaiPluginShell({ getSessionSnapshot }: UseBonsaiPluginShellOptions) {
  useLayoutEffect(() => {
    const mount = bumpContentMountCount();
    bonsaiDebugLog("index.tsx:Content", "content mounted", "H1", {
      mount,
      pendingPeek: !!peekBonsaiSessionPendingRestore(),
      tab: resolveInitialTab(),
    });
  }, []);

  const [currentTab, setCurrentTab] = useState(resolveInitialTab);
  const characterPickerReturnTabRef = useRef<string>("main");
  const postPickerTabLockRef = useRef<{ until: number; tab: string } | null>(null);
  const finalizeModalCloseRef = useRef<(close: () => void) => void>((close) => close());

  useLayoutEffect(() => {
    const pending = __bonsaiTabRestoreAfterModal;
    if (pending != null) {
      __bonsaiTabRestoreAfterModal = null;
      setCurrentTab(pending);
    }
  }, []);

  // Written on every change rather than on close: Decky gives the plugin no reliable "closing"
  // hook, so there is no later moment guaranteed to run. Written in every mode, including
  // `always_main` — what the mode selects is whether the *next open* reads this, and recording it
  // unconditionally means switching back to a resuming mode works immediately.
  useEffect(() => {
    saveLastTab(currentTab);
  }, [currentTab]);

  const armPostPickerTabLock = useCallback((back: string) => {
    if (back === "main") {
      postPickerTabLockRef.current = null;
      return;
    }
    postPickerTabLockRef.current = { until: Date.now() + 750, tab: back };
  }, []);

  const finalizeShowModalAndRestoreActiveTab = useCallback(
    (close: () => void) => {
      const back = characterPickerReturnTabRef.current;
      bonsaiDebugLog("index.tsx:finalizeModal", "modal close", "H4", { backTab: back });
      __bonsaiTabRestoreAfterModal = back;
      armPostPickerTabLock(back);
      setCurrentTab(back);
      close();
      window.setTimeout(() => {
        setCurrentTab(back);
        __bonsaiTabRestoreAfterModal = null;
        // Focus last: the tab has to be active and its controls mounted before the opener can be
        // focused, and after a Content remount the ref callbacks only re-register on that mount.
        // A miss is a no-op, which is exactly the behavior this had before.
        window.requestAnimationFrame(() => {
          restoreModalReturnFocusWithRetry();
        });
      }, 80);
    },
    [armPostPickerTabLock],
  );

  useEffect(() => {
    finalizeModalCloseRef.current = finalizeShowModalAndRestoreActiveTab;
  }, [finalizeShowModalAndRestoreActiveTab]);

  const onCompleteDeckyModalClose = useCallback(
    (close: () => void) => finalizeModalCloseRef.current(close),
    [],
  );

  const captureSessionBeforeModal = useCallback(() => {
    characterPickerReturnTabRef.current = currentTab;
    const settingsLocal = captureSettingsTabLocalSnapshot();
    const ollamaLocal = captureOllamaTabLocalSnapshot();
    const snapshot = getSessionSnapshot();
    captureBonsaiSessionForModal(snapshot);
    bonsaiDebugLog("index.tsx:captureSessionBeforeModal", "captured", "H4", {
      tab: currentTab,
      inputLen: snapshot.unifiedInput.length,
      hasExchange: !!snapshot.lastExchange,
      settingsLocal: !!settingsLocal,
      ollamaLocal: !!ollamaLocal,
    });
  }, [currentTab, getSessionSnapshot]);

  const onTabsShowTab = useCallback((tabID: string) => {
    bonsaiDebugLog("index.tsx:onTabsShowTab", "bumper tab", "H3", { to: tabID });
    const lock = postPickerTabLockRef.current;
    const now = Date.now();
    if (lock && now < lock.until && tabID === "main" && lock.tab !== "main") {
      setCurrentTab(lock.tab);
      return;
    }
    if (lock && now < lock.until) {
      if (tabID === lock.tab) {
        postPickerTabLockRef.current = null;
      } else if (tabID !== "main") {
        postPickerTabLockRef.current = null;
      }
    }
    if (lock && now >= lock.until) {
      postPickerTabLockRef.current = null;
    }
    setCurrentTab(tabID);
  }, []);

  const prepareModalWithReturnTab = useCallback(
    (returnTab?: string) => {
      captureSessionBeforeModal();
      characterPickerReturnTabRef.current = returnTab ?? currentTab;
    },
    [captureSessionBeforeModal, currentTab],
  );

  return {
    currentTab,
    setCurrentTab,
    characterPickerReturnTabRef,
    finalizeShowModalAndRestoreActiveTab,
    onCompleteDeckyModalClose,
    captureSessionBeforeModal,
    prepareModalWithReturnTab,
    onTabsShowTab,
  };
}
