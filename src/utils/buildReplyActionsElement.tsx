/**
 * Title: Reply actions element builder
 * Purpose: Build Helpful/Retry/Show details and refinement chip Focusable rows for a reply turn.
 * Used for: MainTabChatTranscript reply micro-actions and liveTurnFocusGraph sibling hops.
 * Solves: Registered Deck focus owners for D-pad navigation between reply action buttons.
 * Does not: Submit follow-up Ask — see useBonsaiAskOrchestration reply chip handlers.
 */
import React from "react";
import { Focusable } from "@decky/ui";
import { call } from "@decky/api";
import { BonsaiChatSecondaryButton } from "../components/BonsaiChatSecondaryButton";
import {
  RefreshArrowIcon,
  ThumbDownOutlineIcon,
  ThumbUpOutlineIcon,
} from "../components/icons";
import type { ReplyMicroActionId } from "../data/replyMicroActions";
import { replyMicroActionById } from "../data/replyMicroActions";
import {
  focusDownFromReplyUtilityRow,
  focusLastReplyChip,
  focusReplyHelpful,
  focusReplyNotReally,
  focusReplyRetry,
  focusReplyShowDetails,
  queryLiveTurnSlot,
} from "./liveTurnFocusGraph";
import { getReplyStop, REPLY_STOP_ORDER, type ReplyStopId } from "./replyStopRegistry";
import { elementHasFocus } from "./uiDocument";
import { isDeckDirectionDownEvent, isDeckDirectionUpEvent } from "./focusNavigation";
import { hasNavFocusTarget } from "./navFocusRegistry";

/*
 * TEMPORARY instrumentation (2026-08-04) — remove once REPLY-DOWN-01 passes.
 *
 * Two structural fixes for this row changed nothing on device, and the open question is which
 * handler Decky actually delivers for a D-pad press here. This answers it from the Deck log
 * (`~/homebrew/logs/bonsAI/`) instead of another guess. Raw `call` on purpose: fire-and-forget debug
 * logging with no UI consequence, so the `callDeckyWithTimeout` deadline would only add noise.
 */
function probe(where: string, data: Record<string, unknown>): void {
  void call("dbg_fe_log", "reply-nav", { where, ...data }).catch(() => {});
}

/** The raw button id as delivered, for the probe — tells us if the event shape is what we assume. */
function rawButtonId(evt: unknown): unknown {
  const detail = (evt as { detail?: { button?: unknown } } | null | undefined)?.detail;
  if (detail && "button" in detail) return detail.button;
  return typeof evt === "number" ? evt : String(evt ?? "").slice(0, 24);
}

const CHIP_ROW_REFINE: ReplyMicroActionId[] = ["bad_information", "misidentified_game"];
const CHIP_ROW_LENGTH: ReplyMicroActionId[] = ["too_long", "too_short"];

export type BuildReplyActionsElementArgs = {
  replyKey: string;
  rating: "up" | "down" | null;
  onRate: (rating: "up" | "down") => void;
  showFeedback: boolean;
  onRetry?: () => void;
  transparencyOpen?: boolean;
  onToggleTransparency?: () => void;
  chipsDisabled?: boolean;
  chipUsed?: boolean;
  chipError?: string | null;
  onChip?: (chipId: ReplyMicroActionId) => void;
  askInFlight?: boolean;
  /** When set, D-pad Up from reply actions focuses strategy chrome before the answer bubble. */
  onMoveUpFromReply?: () => boolean;
  /** D-pad Up from utility row (Retry / Show details) when no chip rows are visible. */
  onMoveUpFromUtility?: () => boolean;
  /** D-pad Up from the first refinement chip → thumbs row. */
  onMoveUpFromChips?: () => boolean;
  /** D-pad Down from thumbs → utility row (Retry). */
  onMoveDownFromThumbs?: () => boolean;
  /** D-pad Down from utility row (Retry / Show details) → context hint / session strip. */
  onMoveDownFromUtility?: () => boolean;
};

function renderChipRow(
  chipIds: ReplyMicroActionId[],
  args: {
    chipsDisabled: boolean;
    onChip?: (chipId: ReplyMicroActionId) => void;
    rowClassName: string;
    onMoveUpFirst?: () => boolean;
  }
): React.ReactElement | null {
  const { chipsDisabled, onChip, rowClassName, onMoveUpFirst } = args;
  if (!onChip) return null;
  const defs = chipIds.map((id) => replyMicroActionById(id)).filter(Boolean);
  if (!defs.length) return null;
  return (
    <Focusable className={rowClassName} flow-children="horizontal">
      {defs.map((def) => (
        <BonsaiChatSecondaryButton
          key={def!.id}
          disabled={chipsDisabled}
          onClick={() => onChip(def!.id)}
          aria-label={def!.label}
          deckNav={
            onMoveUpFirst && def!.id === chipIds[0]
              ? { onMoveUp: () => onMoveUpFirst() ?? false }
              : undefined
          }
        >
          {def!.label}
        </BonsaiChatSecondaryButton>
      ))}
    </Focusable>
  );
}

/** Plain function so reply row is a direct transcript focus-graph sibling. */
export function buildReplyActionsElement(
  args: BuildReplyActionsElementArgs
): React.ReactElement | null {
  const {
    replyKey,
    rating,
    onRate,
    showFeedback,
    onRetry,
    transparencyOpen,
    onToggleTransparency,
    chipsDisabled = false,
    chipUsed = false,
    chipError = null,
    onChip,
    askInFlight = false,
    onMoveUpFromChips,
    onMoveDownFromUtility,
  } = args;

  const showChipRows = Boolean(onChip) && rating === "down";
  const showUtilityRow = Boolean(onRetry) || Boolean(onToggleTransparency);
  const feedbackDisabled = askInFlight;
  const chipsInactive = chipsDisabled || chipUsed || askInFlight;
  const thumbsLocked = rating !== null;

  const liveSlot = () => queryLiveTurnSlot();
  const moveUpFromReply = () => false;
  const downFromUtility = () => {
    if (onMoveDownFromUtility?.()) return true;
    return focusDownFromReplyUtilityRow(liveSlot());
  };

  /*
   * Which of the four stops currently holds focus.
   *
   * The row handlers below need this because `onMove*` has to sit on the row `Focusable`, not on the
   * individual buttons — see the comment on the utility row — so a single handler serves both
   * columns and has to work out which one it was called for.
   */
  const focusedStop = (): ReplyStopId | null => {
    for (const id of REPLY_STOP_ORDER) {
      const el = getReplyStop(id);
      if (el && elementHasFocus(el)) return id;
    }
    return null;
  };

  const downFromThumbsRow = () =>
    focusedStop() === "not-really" ? downFromNotReally() : downFromHelpful();
  const upFromUtilityRow = () =>
    focusedStop() === "show-details" ? upFromShowDetails() : upFromRetry();

  /*
   * Row elements, captured at mount so a press handler can ask "is focus still mine?".
   *
   * `buildReplyActionsElement` is a plain function called during render, so a fresh holder per
   * render is the ref equivalent here — there are no hooks to use.
   */
  const thumbsRowEl: { current: HTMLElement | null } = { current: null };
  const utilityRowEl: { current: HTMLElement | null } = { current: null };

  /*
   * D-pad handling goes through `onButtonDown`, not `onMoveDown`.
   *
   * `onButtonDown` is in Decky's documented prop contract and is demonstrably delivered for
   * directional presses — it is what was revealing the masked spoiler fence on D-pad Down before
   * that handler learned to ignore directions. `onMoveDown` is left in place below but has never
   * been observed to fire for these rows, and moving it onto the row Focusable did not change the
   * behaviour on device.
   *
   * The focus guard makes the pair safe: whichever handler runs first moves focus off the row, and
   * the second one sees that focus has left and yields instead of moving again.
   */
  const pressHandler = (
    row: string,
    rowEl: { current: HTMLElement | null },
    onDown: () => boolean,
    onUp: () => boolean
  ) => (evt: unknown): boolean => {
    const isDown = isDeckDirectionDownEvent(evt);
    const isUp = isDeckDirectionUpEvent(evt);
    probe("buttonDown", { row, btn: rawButtonId(evt), isDown, isUp });
    if (!isDown && !isUp) return false;
    const el = rowEl.current;
    if (el && !elementHasFocus(el)) return false;
    const moved = isDown ? onDown() : onUp();
    probe("buttonDown:result", {
      row,
      dir: isDown ? "down" : "up",
      moved,
      // Which mechanism was available. A "move" that reports true while these are false was a DOM
      // focus that Steam ignored — the failure mode this round is meant to end.
      navStrip: hasNavFocusTarget("session-context-strip"),
      navDiag: hasNavFocusTarget("ask-diagnostics"),
    });
    return moved;
  };

  /*
   * Column-preserving vertical hops when thumbs sit directly above utility
   * (no refinement chips): Helpful↔Retry, Not really↔Show details.
   * With chips between, yield (return false) so Decky advances to the chip row.
   */
  const downFromHelpful = () => {
    if (showChipRows) return false;
    return focusReplyRetry(liveSlot());
  };
  const downFromNotReally = () => {
    if (showChipRows) return false;
    return focusReplyShowDetails(liveSlot());
  };
  const upFromRetry = () => {
    const slot = liveSlot();
    if (showChipRows && focusLastReplyChip(slot)) return true;
    return focusReplyHelpful(slot);
  };
  const upFromShowDetails = () => {
    const slot = liveSlot();
    if (showChipRows && focusLastReplyChip(slot)) return true;
    return focusReplyNotReally(slot);
  };

  if (!showFeedback && !showUtilityRow && !showChipRows && rating === null) {
    return null;
  }

  return (
    <Focusable
      key={`reply-actions-${replyKey}`}
      className="bonsai-chat-reply-actions"
      flow-children="vertical"
      {...({
        onMoveUp: moveUpFromReply,
      } as Record<string, unknown>)}
    >
      {showFeedback && rating === "up" ? (
        <span className="bonsai-chat-feedback-row__label bonsai-chat-feedback-row--rated">
          Saved on this Deck
        </span>
      ) : null}
      {showFeedback && (rating === null || rating === "down") ? (
        <>
          <span className="bonsai-chat-feedback-row__label">Was this helpful?</span>
          <Focusable
            className="bonsai-chat-reply-actions-row"
            flow-children="horizontal"
            ref={(el: HTMLElement | null) => {
              thumbsRowEl.current = el;
            }}
            {...({
              onMoveUp: moveUpFromReply,
              onMoveDown: downFromThumbsRow,
              onButtonDown: pressHandler("thumbs", thumbsRowEl, downFromThumbsRow, moveUpFromReply),
            } as Record<string, unknown>)}
          >
            <BonsaiChatSecondaryButton
              disabled={feedbackDisabled || thumbsLocked}
              onClick={() => onRate("up")}
              aria-label="Mark reply helpful"
              replyStop="helpful"
            >
              <ThumbUpOutlineIcon size={14} />
              Helpful
            </BonsaiChatSecondaryButton>
            <BonsaiChatSecondaryButton
              disabled={feedbackDisabled || thumbsLocked}
              onClick={() => onRate("down")}
              aria-label="Mark reply not helpful"
              replyStop="not-really"
            >
              <ThumbDownOutlineIcon size={14} />
              Not really
            </BonsaiChatSecondaryButton>
          </Focusable>
        </>
      ) : null}
      {showChipRows ? (
        <span className="bonsai-chat-feedback-row__label">What went wrong?</span>
      ) : null}
      {showChipRows
        ? renderChipRow(CHIP_ROW_REFINE, {
            chipsDisabled: chipsInactive,
            onChip,
            rowClassName: "bonsai-chat-reply-actions-row bonsai-chat-reply-actions-row--chips",
            onMoveUpFirst: onMoveUpFromChips,
          })
        : null}
      {showChipRows
        ? renderChipRow(CHIP_ROW_LENGTH, {
            chipsDisabled: chipsInactive,
            onChip,
            rowClassName: "bonsai-chat-reply-actions-row bonsai-chat-reply-actions-row--chips",
          })
        : null}
      {chipError ? (
        <div
          className="bonsai-chat-reply-chip-error"
          style={{ color: "#f2a0a0", fontSize: 11, lineHeight: 1.35, marginTop: 2 }}
          role="alert"
        >
          {chipError}
        </div>
      ) : null}
      {showUtilityRow ? (
        <Focusable
          className="bonsai-chat-reply-actions-row bonsai-chat-reply-actions-row--utility"
          flow-children="horizontal"
          /*
           * The move handlers belong here, on the row, not on the two buttons.
           *
           * `onMoveUp` / `onMoveDown` are SteamUI `Focusable` props. Passing them to a Decky
           * `Button` puts them on a `DialogButton`, which does not forward them to any Focusable —
           * verified on device by walking the fibers: the answer bubble's `Focusable` carries
           * `onMoveDown` on Steam's own component, while the Retry button's copy stops at the
           * DialogButton wrapper and never reaches one. So nothing below Retry / Show details was
           * reachable by D-pad: the handler that would have moved focus was never called.
           */
          ref={(el: HTMLElement | null) => {
            utilityRowEl.current = el;
          }}
          {...({
            onMoveUp: upFromUtilityRow,
            onMoveDown: downFromUtility,
            onButtonDown: pressHandler("utility", utilityRowEl, downFromUtility, upFromUtilityRow),
          } as Record<string, unknown>)}
          style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: 8, alignItems: "center" }}
        >
          {onRetry ? (
            <BonsaiChatSecondaryButton
              disabled={askInFlight}
              onClick={onRetry}
              aria-label="Retry same prompt"
              replyStop="retry"
            >
              <RefreshArrowIcon size={14} />
              Retry
            </BonsaiChatSecondaryButton>
          ) : null}
          {onToggleTransparency ? (
            <BonsaiChatSecondaryButton
              disabled={askInFlight}
              onClick={onToggleTransparency}
              aria-expanded={transparencyOpen}
              aria-label={transparencyOpen ? "Hide details" : "Show details"}
              replyStop="show-details"
            >
              {transparencyOpen ? "Hide details" : "Show details"}
            </BonsaiChatSecondaryButton>
          ) : null}
        </Focusable>
      ) : null}
    </Focusable>
  );
}
