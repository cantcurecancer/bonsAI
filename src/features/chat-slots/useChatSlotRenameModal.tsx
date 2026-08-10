/**
 * Title: Chat slot rename modal hook
 * Purpose: Open rename modal with session survival and return-focus registration.
 * Used for: ChatSlotRow title activation.
 * Solves: Nested modal pattern matching useCharacterPickerModal survival hooks.
 * Does not: Own slot list state — caller refreshes summaries after rename.
 */
import { useCallback } from "react";
import { showModal } from "@decky/ui";

import { ChatSlotRenameModal } from "./ChatSlotRenameModal";
import {
  rememberModalReturnFocus,
  registerModalReturnFocusOwner,
} from "../plugin-shell/modalReturnFocusRegistry";

export type UseChatSlotRenameModalArgs = {
  onBeforeNestedDeckyModal?: () => void;
  onCompleteNestedDeckyModalClose?: (close: () => void) => void;
  onRename: (slotId: string, label: string) => Promise<boolean>;
};

export function useChatSlotRenameModal({
  onBeforeNestedDeckyModal,
  onCompleteNestedDeckyModalClose,
  onRename,
}: UseChatSlotRenameModalArgs) {
  const openRenameModal = useCallback(
    (slotId: string, currentLabel: string, returnFocusEl: HTMLElement | null) => {
      onBeforeNestedDeckyModal?.();
      rememberModalReturnFocus("chat-slot-rename");
      if (returnFocusEl) registerModalReturnFocusOwner("chat-slot-rename", returnFocusEl);

      const handle = showModal(
        <ChatSlotRenameModal
          initialLabel={currentLabel}
          onCancel={() => {
            onCompleteNestedDeckyModalClose?.(() => handle.Close());
          }}
          onConfirm={async (label) => {
            if (label) await onRename(slotId, label);
            onCompleteNestedDeckyModalClose?.(() => handle.Close());
          }}
        />,
      );
    },
    [onBeforeNestedDeckyModal, onCompleteNestedDeckyModalClose, onRename],
  );

  return { openRenameModal };
}
