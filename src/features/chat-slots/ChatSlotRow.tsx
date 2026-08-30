/**
 * Title: Chat slot row
 * Purpose: Always-visible LB/RB slot carousel under the tab strip on Main.
 * Used for: MainTab above preset row.
 * Solves: Named slot switching without a modal picker; explicit focus graph for D-pad.
 * Does not: Submit Asks — orchestration hook owns the Ask path.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  /**
   * Fires when the carousel enters or leaves the `[+]` create position. Cycling there does not
   * change the active slot, so this is the only signal the rest of the tab gets.
   */
  onCreatePositionChange?: (atCreate: boolean) => void;
  /** Slot the backend is generating for right now, or null. */
  generatingSlotId?: string | null;
  /** Slots that finished an answer while the user was looking at a different slot. */
  unreadSlotIds?: ReadonlySet<string>;
};

type RowFocusStop = "title" | "delete";

const MAX_DOTS = 8;
/** What the create position shows, both as the centre label and as the ghost to a slot's left. */
const CREATE_LABEL = "[+]";

export function ChatSlotRow({
  summaries,
  activeSlotId,
  onCreateSlot,
  onSelectSlot,
  onRenameSlot,
  onDeleteSlot,
  onBeforeNestedDeckyModal,
  onCompleteNestedDeckyModalClose,
  onCreatePositionChange,
  generatingSlotId = null,
  unreadSlotIds,
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
  /* Position 0 is the create slot, so the first real slot's left neighbour IS "new chat". Without
     this the leftmost slot looked like the end of the carousel with nothing to its left. */
  const prevIsCreatePosition = carouselIndex === 1;
  const nextSlot =
    !isCreatePosition && carouselIndex < orderedSlots.length ? orderedSlots[carouselIndex] : null;
  const showGhosts = orderedSlots.length > 1;

  useEffect(() => {
    onCreatePositionChange?.(isCreatePosition);
  }, [isCreatePosition, onCreatePositionChange]);

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
          bDestructiveWarning
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

  /* Pending wins over unread: a slot cannot be both, but a stale unread entry must not
     outrank the ring the user is watching fill. */
  const slotStateClass = (slotId: string): string => {
    if (slotId === generatingSlotId) return " bonsai-chat-slot-dot--pending";
    if (unreadSlotIds?.has(slotId)) return " bonsai-chat-slot-dot--unread";
    return "";
  };

  const centerLabel = isCreatePosition ? CREATE_LABEL : (activeSlot?.label ?? "New chat");

  // CSS cannot detect overflow, and `text-overflow: ellipsis` clips the text so a plain
  // transform would only slide the ellipsized fragment. So measure here, publish the
  // distance as a CSS var, and let the stylesheet attach the sweep only when it is needed.
  // Known accepted edge: this re-runs on [focused, centerLabel] only, so a resize with both
  // unchanged (a UI-scale change, or a ghost mounting from a summaries refresh) can leave a
  // stale distance until the next focus change. No ResizeObserver unless device QA shows it.
  const titleWindowRef = useRef<HTMLSpanElement | null>(null);
  const titleInnerRef = useRef<HTMLSpanElement | null>(null);
  const [titleOverflows, setTitleOverflows] = useState(false);

  useLayoutEffect(() => {
    const win = titleWindowRef.current;
    const inner = titleInnerRef.current;
    if (!focused || !win || !inner) {
      setTitleOverflows(false);
      return;
    }
    const overflow = inner.scrollWidth - win.clientWidth;
    if (overflow > 1) {
      win.style.setProperty("--bonsai-slot-title-overflow", `${overflow}px`);
      setTitleOverflows(true);
    } else {
      setTitleOverflows(false);
    }
  }, [focused, centerLabel]);

  return (
    <div className={`bonsai-chat-slot-row${focused ? " bonsai-chat-slot-row--focused" : ""}`}>
      <Focusable
        /*
          The return-focus registry must be handed THIS element, not the wrapper above it.
          `focusOwnerById` resolves its target with
          `el.matches(".Panel.Focusable") ? el : el.closest(".Panel.Focusable")` — from the plain
          wrapper that walks UP to an ancestor container, so closing the rename modal put the ring
          on the tab strip instead of the row. Measured on device 2026-08-30. This element is the
          row's own `Panel Focusable`, so the ladder's first target hits it directly.
        */
        ref={(el: HTMLElement | null) => {
          rowFocusElRef.current = el;
          registerModalReturnFocusOwner("chat-slot-rename", el);
        }}
        {...({
          navRef,
          /*
            Steam treats a `Focusable` as a CONTAINER unless something marks it as a stop, and a
            container with no focusable children is skipped entirely. This row's children are all
            plain spans, and its A handling lives on `onButtonDown` rather than `onActivate` — so
            it rendered correctly and was unreachable by D-pad in both directions.

            Measured on device 2026-08-30 (deck_runSequence, six presses each way): Down went tab
            strip -> preset chips and Up went preset chips -> tab strip, never landing on the row;
            the row's div carried no `tabindex` while every working Focusable div in the panel
            (e.g. `.bonsai-ai-character-avatar`) carried `tabindex="0"`.

            `focusable` marks the stop without adding a second activation path, so `onButtonDown`
            stays the single owner of A / LB / RB and its create-vs-rename-vs-delete branching is
            untouched.
          */
          focusable: true,
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
          {focused ? (
            <span
              className={`bonsai-chat-slot-bumper-pill${carouselIndex === 0 ? " bonsai-chat-slot-bumper-pill--dead" : ""}`}
            >
              LB
            </span>
          ) : null}
          <div className="bonsai-chat-slot-center">
            {/*
              Always rendered, empty or not. Slots saved before the name was kept have nothing to
              show, and a line that appears on some rows and not others is the row-height bug the
              min-height below was added to settle - so the band is reserved either way.
            */}
            <div className="bonsai-chat-slot-game">{isCreatePosition ? "" : (activeSlot?.origin_app_name ?? "")}</div>
            <div className="bonsai-chat-slot-title-row">
              {showGhosts && prevSlot && (prevSlot.id === generatingSlotId || unreadSlotIds?.has(prevSlot.id)) ? (
                <span
                  className={`bonsai-chat-slot-ghost-spark${prevSlot.id === generatingSlotId ? " bonsai-chat-slot-ghost-spark--pending" : " bonsai-chat-slot-ghost-spark--unread"}`}
                  aria-hidden
                />
              ) : null}
              {showGhosts && prevIsCreatePosition ? (
                <span className="bonsai-chat-slot-ghost bonsai-chat-slot-ghost--prev bonsai-chat-slot-ghost--create">
                  {CREATE_LABEL}
                </span>
              ) : null}
              {showGhosts && prevSlot ? (
                <span className="bonsai-chat-slot-ghost bonsai-chat-slot-ghost--prev">{prevSlot.label}</span>
              ) : null}
              <span
                ref={titleWindowRef}
                className={`bonsai-chat-slot-title${focusStop === "title" ? " bonsai-chat-slot-title--active-stop" : ""}${isCreatePosition ? " bonsai-chat-slot-title--create" : ""}${titleOverflows ? " bonsai-chat-slot-title--overflowing" : ""}`}
              >
                <span ref={titleInnerRef} className="bonsai-chat-slot-title-inner">
                  {centerLabel}
                </span>
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
              {showGhosts && nextSlot && (nextSlot.id === generatingSlotId || unreadSlotIds?.has(nextSlot.id)) ? (
                <span
                  className={`bonsai-chat-slot-ghost-spark${nextSlot.id === generatingSlotId ? " bonsai-chat-slot-ghost-spark--pending" : " bonsai-chat-slot-ghost-spark--unread"}`}
                  aria-hidden
                />
              ) : null}
            </div>
            {orderedSlots.length > 0 ? (
              <div className="bonsai-chat-slot-dots" aria-hidden>
                <span
                  className={`bonsai-chat-slot-dot bonsai-chat-slot-dot--create${isCreatePosition ? " bonsai-chat-slot-dot--active" : ""}`}
                >
                  +
                </span>
                {/*
                  Marked by CAROUSEL POSITION, not by the stored active slot id. Cycling onto [+]
                  deliberately leaves the active slot alone, so keying off the id lit a slot dot at
                  the create position on top of the +, saying two places were current at once.
                  carouselIndex is what is on screen, so it is what the strip reports.
                */}
                {orderedSlots.slice(0, MAX_DOTS).map((slot, i) => (
                  <span
                    key={slot.id}
                    className={`bonsai-chat-slot-dot${i + 1 === carouselIndex ? " bonsai-chat-slot-dot--active" : ""}${slotStateClass(slot.id)}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {focused ? (
            <span
              className={`bonsai-chat-slot-bumper-pill${carouselIndex >= positionCount - 1 ? " bonsai-chat-slot-bumper-pill--dead" : ""}`}
            >
              RB
            </span>
          ) : null}
        </div>
      </Focusable>
    </div>
  );
}
