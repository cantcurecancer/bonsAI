/**
 * Title: Plugin help modal
 * Purpose: ConfirmModal wrapper showing quick-start instructions for new bonsAI users.
 * Used for: Main tab preset row “How to use bonsAI” chip via showModal() only.
 * Solves: Keeps help copy out of the QAM tree while reusing PluginQuickStartInstructionsBody.
 * Does not: Persist dismissal state — parent tracks plugin-help-dismissed localStorage key.
 */
import { ConfirmModal } from "@decky/ui";
import { PluginQuickStartInstructionsBody } from "../data/pluginQuickStartInstructions";

export type PluginHelpModalProps = {
  onClose: () => void;
};

/**
 * Pass only to `showModal()` — parent must not render this in the QAM tree.
 */
export function PluginHelpModal(props: PluginHelpModalProps) {
  const { onClose } = props;
  return (
    <ConfirmModal
      strTitle="Using bonsAI"
      strDescription={
        <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
          <PluginQuickStartInstructionsBody />
        </div>
      }
      strOKButtonText="Got it"
      strCancelButtonText="Cancel"
      onOK={onClose}
      onCancel={onClose}
    />
  );
}
