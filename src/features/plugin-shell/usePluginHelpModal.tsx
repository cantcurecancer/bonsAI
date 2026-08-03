/**
 * Title: Plugin help modal
 * Purpose: Own the plugin-help chip's dismissed state and the modal that opening it shows.
 * Used for: index.tsx — the Main tab help chip and the Clear-all-plugin-data reset path.
 * Solves: Keeps the dismissal's three storage layers (React state, module global, localStorage)
 *         in one place instead of spread across the shell component.
 * Does not: Render the chip — MainTab owns that; this only opens the modal and tracks dismissal.
 */
import { useCallback, useEffect, useState } from "react";
import { showModal } from "@decky/ui";

import { PluginHelpModal } from "../../components/PluginHelpModal";
import { markPluginHelpDismissedPersist, pluginHelpDismissedFromStorage } from "./pluginStorage";
import { peekBonsaiSessionPendingRestore } from "../../utils/bonsaiSessionSurvival";

/**
 * Survives Decky remounting `Content` while `showModal` is open — the same lifecycle problem
 * `useBonsaiPluginShell` solves for the active tab. React state is lost across that remount,
 * localStorage only records a permanent dismissal, so this holds the in-between.
 */
let moduleDismissed = false;

export type UsePluginHelpModalArgs = {
  /** Active tab, restored after the modal closes. */
  currentTab: string;
  /** Snapshot session state before Decky tears down `Content` to show the modal. */
  captureSessionBeforeModal: () => void;
  /** Close the modal and return focus to the tab that opened it. */
  finalizeShowModalAndRestoreActiveTab: (close: () => void) => void;
  /** Shared "tab to return to" ref owned by `useBonsaiPluginShell`. */
  returnTabRef: React.MutableRefObject<string>;
};

export type PluginHelpModalController = {
  /** True once the user has opened help, so the chip stops offering itself. */
  pluginHelpDismissed: boolean;
  /** Open the modal. Dismisses the chip first — opening help is the dismissal. */
  openPluginHelpModal: () => void;
  /** Restore dismissal from a session-survival snapshot. */
  restorePluginHelpDismissed: (dismissed: boolean) => void;
  /** Clear dismissal so the chip reappears, for Clear all plugin data. */
  resetPluginHelpDismissed: () => void;
};

export function usePluginHelpModal({
  currentTab,
  captureSessionBeforeModal,
  finalizeShowModalAndRestoreActiveTab,
  returnTabRef,
}: UsePluginHelpModalArgs): PluginHelpModalController {
  const [pluginHelpDismissed, setPluginHelpDismissed] = useState(() => {
    const snapshot = peekBonsaiSessionPendingRestore();
    if (snapshot?.pluginHelpDismissed != null) {
      moduleDismissed = snapshot.pluginHelpDismissed;
      return snapshot.pluginHelpDismissed;
    }
    if (pluginHelpDismissedFromStorage()) {
      moduleDismissed = true;
      return true;
    }
    return moduleDismissed;
  });

  useEffect(() => {
    moduleDismissed = pluginHelpDismissed;
  }, [pluginHelpDismissed]);

  const openPluginHelpModal = useCallback(() => {
    captureSessionBeforeModal();
    markPluginHelpDismissedPersist();
    moduleDismissed = true;
    setPluginHelpDismissed(true);
    returnTabRef.current = currentTab;
    const handle = showModal(
      <PluginHelpModal onClose={() => finalizeShowModalAndRestoreActiveTab(() => handle.Close())} />
    );
  }, [currentTab, captureSessionBeforeModal, finalizeShowModalAndRestoreActiveTab, returnTabRef]);

  const restorePluginHelpDismissed = useCallback((dismissed: boolean) => {
    setPluginHelpDismissed(dismissed);
    moduleDismissed = dismissed;
  }, []);

  const resetPluginHelpDismissed = useCallback(() => {
    moduleDismissed = false;
    setPluginHelpDismissed(false);
  }, []);

  return {
    pluginHelpDismissed,
    openPluginHelpModal,
    restorePluginHelpDismissed,
    resetPluginHelpDismissed,
  };
}
