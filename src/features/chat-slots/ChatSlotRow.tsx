/**
 * Title: Chat slot row
 * Purpose: Always-visible LB/RB slot carousel under the tab strip on Main.
 * Used for: MainTab above preset row.
 * Solves: Named slot switching without a modal picker; explicit focus graph for D-pad.
 * Does not: Submit Asks — orchestration hook owns the Ask path.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmModal, Focusable, showModal } from "@decky/ui";

import type { ChatSlotSummary } from "../../utils/chatSlotsApi";
import {
  isBumperLeftDeckEvent,
  isBumperRightDeckEvent,
  isOkDeckButtonEvent,
} from "../../utils/focusNavigation";
import { registerNavFocus, type NavRefHolder } from "../../utils/navFocusRegistry";
import {
  rememberModalReturnFocus,
  registerModalReturnFocusOwner,
} from "../plugin-shell/modalReturnFocusRegistry";
import { useChatSlotBumpers } from "./useChatSlotBumpers";
import { useChatSlotRenameModal } from "./useChatSlotRenameModal";

export type ChatSlotRowProps = {
  summaries: ChatSlotSummary[];
  activeSlotId: string | null;
  onCreateSlot: () => Promise<unknown>;
  onSelectSlot: (slotId: string | null) => Promise<void>;
  onRenameSlot: (slotId: string, label: string) => Promise<boolean>;
  onDeleteSlot: (slotId: string) => Promise<boolean>;
  onBeforeNestedDeckyModal?: () => void;
  onCompleteNestedDeckyModalClose?: (close: () => void) => void;
};

type RowFocusStop = "title" | "delete";

const MAX_DOTS = 5;

export function ChatSlotRow({
  summaries,
  activeSlotId,
  onCreateSlot,
  onSelectSlot,
  onRenameSlot,
  onDeleteSlot,
  onBeforeNestedDeckyModal,
  onCompleteNestedDeckyModalClose,
}: ChatSlotRowProps) {
  const orderedSlots = useMemo(() => [...summaries].reverse(), [summaries]);
  const positionCount = 1 + orderedSlots.length;

  const slotIndexFromId = useCallback(
    (id: string | null) => {
      if (!id) return 0;
      const idx = orderedSlots.findIndex((s) => s.id === id);
      return idx >= 0 ? idx + 1 : 0;
    },
    [orderedSlots],
  );

  const [carouselIndex, setCarouselIndex] = useState(() => slotIndexFromId(activeSlotId));
  const [focused, setFocused] = useState(false);
  const [focusStop, setFocusStop] = useState<RowFocusStop>("title");
  const navRef = useRef<NavRefHolder["current"]>(null);
  const rowFocusElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerNavFocus("chat-slot-row", navRef);
    return () => registerNavFocus("chat-slot-row", null);
  }, []);

  useEffect(() => {
    setCarouselIndex(slotIndexFromId(activeSlotId));
  }, [activeSlotId, slotIndexFromId]);

  const isCreatePosition = carouselIndex === 0;
  const activeSlot = isCreatePosition ? null : orderedSlots[carouselIndex - 1] ?? null;
  const prevSlot = carouselIndex > 1 ? orderedSlots[carouselIndex - 2] : null;
  const nextSlot =
    !isCreatePosition && carouselIndex < orderedSlots.length ? orderedSlots[carouselIndex] : null;
  const showGhosts = orderedSlots.length > 1;

  const selectCarouselIndex = useCallback(
    async (index: number) => {
      const clamped = Math.max(0, Math.min(index, positionCount - 1));
      setCarouselIndex(clamped);
      if (clamped === 0) return;
      const slot = orderedSlots[clamped - 1];
      if (slot) await onSelectSlot(slot.id);
    },
    [onSelectSlot, orderedSlots, positionCount],
  );

  const { handleBumperButtonDown } = useChatSlotBumpers({
    onBumperLeft: () => {
      void selectCarouselIndex(carouselIndex - 1);
    },
    onBumperRight: () => {
      void selectCarouselIndex(carouselIndex + 1);
    },
  });

  const { openRenameModal } = useChatSlotRenameModal({
    onBeforeNestedDeckyModal,
    onCompleteNestedDeckyModalClose,
    onRename: onRenameSlot,
  });

  const openDeleteConfirm = useCallback(
    (slotId: string, label: string) => {
      onBeforeNestedDeckyModal?.();
      rememberModalReturnFocus("chat-slot-rename");
      if (rowFocusElRef.current) {
        registerModalReturnFocusOwner("chat-slot-rename", rowFocusElRef.current);
      }
      const handle = showModal(
        <ConfirmModal
          strTitle="Delete chat slot?"
          strDescription={`Delete "${label}" and its transcript? This cannot be undone.`}
          strOKButtonText="Delete"
          strCancelButtonText="Cancel"
          onOK={() => {
            void onDeleteSlot(slotId);
            onCompleteNestedDeckyModalClose?.(() => handle.Close());
          }}
          onCancel={() => {
            onCompleteNestedDeckyModalClose?.(() => handle.Close());
          }}
        />,
      );
    },
    [onBeforeNestedDeckyModal, onCompleteNestedDeckyModalClose, onDeleteSlot],
  );

  const centerLabel = isCreatePosition ? "[+]" : (activeSlot?.label ?? "New chat");

  return (
    <div
      className={`bonsai-chat-slot-row${focused ? " bonsai-chat-slot-row--focused" : ""}`}
      ref={(el) => {
        rowFocusElRef.current = el;
        registerModalReturnFocusOwner("chat-slot-rename", el);
      }}
    >
      <Focusable
        {...({
          navRef,
          onMoveLeft: () => {
            if (focusStop === "delete") {
              setFocusStop("title");
              return true;
            }
            return false;
          },
          onMoveRight: () => {
            if (focusStop === "title" && !isCreatePosition) {
              setFocusStop("delete");
              return true;
            }
            return false;
          },
          // Layout is slot row -> transcript -> presets -> ask bar (D-A). Returning false
          // lets Steam's spatial navigation descend into whatever is directly below,
          // which is the transcript when it has content and the preset row when it does not.
          onMoveDown: () => false,
        } as Record<string, unknown>)}
        className="bonsai-chat-slot-row-focus"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onButtonDown={(evt) => {
          if (handleBumperButtonDown(evt)) return true;
          if (isBumperLeftDeckEvent(evt) || isBumperRightDeckEvent(evt)) return true;
          if (!isOkDeckButtonEvent(evt)) return false;
          if (isCreatePosition) {
            void onCreateSlot();
            return true;
          }
          if (focusStop === "delete" && activeSlot) {
            openDeleteConfirm(activeSlot.id, activeSlot.label);
            return true;
          }
          if (activeSlot) {
            openRenameModal(activeSlot.id, activeSlot.label, rowFocusElRef.current);
            return true;
          }
          return false;
        }}
      >
        <div className="bonsai-chat-slot-row-inner">
          {focused ? <span className="bonsai-chat-slot-bumper-pill">LB</span> : null}
          <div className="bonsai-chat-slot-center">
            <div className="bonsai-chat-slot-title-row">
              {showGhosts && prevSlot ? (
                <span className="bonsai-chat-slot-ghost bonsai-chat-slot-ghost--prev">{prevSlot.label}</span>
              ) : null}
              <span
                className={`bonsai-chat-slot-title${focusStop === "title" ? " bonsai-chat-slot-title--active-stop" : ""}${isCreatePosition ? " bonsai-chat-slot-title--create" : ""}`}
              >
                {centerLabel}
              </span>
              {!isCreatePosition ? (
                <span
                  className={`bonsai-chat-slot-delete${focusStop === "delete" ? " bonsai-chat-slot-delete--active-stop" : ""}`}
                  aria-hidden
                >
                  ×
                </span>
              ) : null}
              {showGhosts && nextSlot ? (
                <span className="bonsai-chat-slot-ghost bonsai-chat-slot-ghost--next">{nextSlot.label}</span>
              ) : null}
            </div>
            {orderedSlots.length > 0 && !isCreatePosition ? (
              <div className="bonsai-chat-slot-dots" aria-hidden>
                {orderedSlots.slice(0, MAX_DOTS).map((slot) => (
                  <span
                    key={slot.id}
                    className={`bonsai-chat-slot-dot${slot.id === activeSlotId ? " bonsai-chat-slot-dot--active" : ""}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {focused ? <span className="bonsai-chat-slot-bumper-pill">RB</span> : null}
        </div>
      </Focusable>
    </div>
  );
}
