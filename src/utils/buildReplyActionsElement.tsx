/**
 * Title: Reply actions element builder
 * Purpose: Build Helpful/Retry/Show details and refinement chip Focusable rows for a reply turn.
 * Used for: MainTabChatTranscript reply micro-actions and liveTurnFocusGraph sibling hops.
 * Solves: Registered Deck focus owners for D-pad navigation between reply action buttons.
 * Does not: Submit follow-up Ask — see useBonsaiAskOrchestration reply chip handlers.
 */
import React from "react";
import { Focusable } from "@decky/ui";
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
   * Steam's nav node for the utility row. Thumbs and utility are separate navigation containers, so
   * a DOM `focus()` alone cannot carry gamepad focus between them — see navFocusRegistry. A local
   * holder rather than the id registry: the row is built here, and a per-render object in the
   * module map would leave stale entries behind.
   */
  const utilityNavRef: { current: { TakeFocus?: (gamepad?: boolean) => unknown } | null } = {
    current: null,
  };

  /*
   * D-pad handling goes through `onButtonDown`, which instrumentation confirmed is what Decky
   * delivers to these rows for a directional press (button 10 = DIR_DOWN).
   *
   * `onMoveDown` stays wired below because it is the documented mechanism and works elsewhere — the
   * answer bubble uses it — but it was never observed firing here. The focus guard makes the pair
   * safe rather than racy: whichever handler runs first moves focus off the row, and the second sees
   * that focus has left and yields instead of moving twice.
   *
   * What these handlers must NOT do is move focus with a DOM `focus()` when the destination is
   * outside this row's navigation container — that reports success without transferring Steam's
   * gamepad focus, which is what made three earlier fixes look correct. See navFocusRegistry.
   */
  const pressHandler = (
    rowEl: { current: HTMLElement | null },
    onDown: () => boolean,
    onUp: () => boolean
  ) => (evt: unknown): boolean => {
    const isDown = isDeckDirectionDownEvent(evt);
    const isUp = isDeckDirectionUpEvent(evt);
    if (!isDown && !isUp) return false;
    const el = rowEl.current;
    if (el && !elementHasFocus(el)) return false;
    return isDown ? onDown() : onUp();
  };

  /*
   * Column-preserving vertical hops when thumbs sit directly above utility
   * (no refinement chips): Helpful↔Retry, Not really↔Show details.
   * With chips between, yield (return false) so Decky advances to the chip row.
   */
  /*
   * Hand Steam's gamepad focus to the utility row *before* picking the column inside it.
   *
   * Without `TakeFocus`, the DOM `focus()` below sets `activeElement` while `gpfocus` stays on the
   * thumbs row, so Steam handles the press itself and lands on the utility row's first child —
   * Retry. That made "Not really → Down" go to Retry instead of Show details, and made
   * "Helpful → Down" look correct only because Retry is where Steam was going to land anyway.
   * Once focus is inside the row, a plain `focus()` moves between its two buttons (same container).
   */
  const enterUtilityRow = (stop: "retry" | "show-details") => {
    try {
      utilityNavRef.current?.TakeFocus?.(true);
    } catch {
      /* fall through — the DOM focus below still reports whether it landed */
    }
    const slot = liveSlot();
    return stop === "retry" ? focusReplyRetry(slot) : focusReplyShowDetails(slot);
  };
  const downFromHelpful = () => {
    if (showChipRows) return false;
    return enterUtilityRow("retry");
  };
  const downFromNotReally = () => {
    if (showChipRows) return false;
    return enterUtilityRow("show-details");
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
              onButtonDown: pressHandler(thumbsRowEl, downFromThumbsRow, moveUpFromReply),
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
            navRef: utilityNavRef,
            onMoveUp: upFromUtilityRow,
            onMoveDown: downFromUtility,
            onButtonDown: pressHandler(utilityRowEl, downFromUtility, upFromUtilityRow),
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
