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

/**
 * If Decky unmounts plugin `Content` when `showModal` closes, React state resets to defaults; this
 * outlives the component so `useLayoutEffect` can restore the tab on the next mount.
 */
let __bonsaiTabRestoreAfterModal: string | null = null;

function resolveInitialTab(): string {
  const snap = peekBonsaiSessionPendingRestore();
  if (snap?.currentTab) return snap.currentTab;
  if (__bonsaiTabRestoreAfterModal != null) return __bonsaiTabRestoreAfterModal;
  return "main";
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
