/**
 * Title: Chat slot rename modal
 * Purpose: Rename modal for a chat slot title (A on focused title).
 * Used for: useChatSlotRenameModal from ChatSlotRow.
 * Solves: Text entry with ConfirmModal shell matching other bonsAI modals.
 * Does not: Persist — parent calls renameChatSlot RPC on confirm.
 */
import React, { useState } from "react";
import { ConfirmModal, TextField } from "@decky/ui";
import { BonsaiModalScope } from "../../components/BonsaiModalScope";

export type ChatSlotRenameModalProps = {
  initialLabel: string;
  onCancel: () => void;
  onConfirm: (label: string) => void | Promise<void>;
};

export function ChatSlotRenameModal({ initialLabel, onCancel, onConfirm }: ChatSlotRenameModalProps) {
  const [label, setLabel] = useState(initialLabel);

  return (
    <ConfirmModal
      strTitle="Rename chat slot"
      strDescription={
        <BonsaiModalScope>
          <div className="bonsai-chat-slot-modal-label">SLOT NAME</div>
          <div className="bonsai-chat-slot-modal-field">
            <TextField
              value={label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
              focusOnMount
            />
          </div>
        </BonsaiModalScope>
      }
      bOKDisabled={!label.trim()}
      strOKButtonText="Save"
      strCancelButtonText="Cancel"
      onOK={() => {
        void onConfirm(label.trim());
      }}
      onCancel={onCancel}
    />
  );
}
