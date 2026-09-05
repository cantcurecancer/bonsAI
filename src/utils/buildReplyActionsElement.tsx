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
import { ReplyCopyButton } from "../components/ReplyCopyButton";
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
import { elementHasGamepadFocus } from "./uiDocument";
import { isDeckDirectionDownEvent, isDeckDirectionUpEvent } from "./focusNavigation";
import {
  getRegisteredAnswerBubble,
  takeAnswerBubbleNavFocus,
} from "./answerBubbleElRegistry";
import { elementIsWithinViewportOf, focusLastAnswerChunk } from "./answerBubbleNavigation";
import {
  findNextDrgGlossaryTermChipInView,
  focusDrgGlossaryTermChip,
} from "./drgGlossaryTermRegistry";
import { findScrollablePanel } from "./chatPanelScroll";

const CHIP_ROW_REFINE: ReplyMicroActionId[] = [
  "bad_information",
  "misidentified_game",
  "unfenced_spoiler",
];
const CHIP_ROW_LENGTH: ReplyMicroActionId[] = ["too_long", "too_short"];

export type BuildReplyActionsElementArgs = {
  replyKey: string;
  rating: "up" | "down" | null;
  onRate: (rating: "up" | "down") => void;
  showFeedback: boolean;
  /**
   * The reply is not a finished answer — today that means Stop was pressed and only part of it was
   * kept. Helpful / Not really are shown but greyed out; Retry stays live, because it is the button
   * a person actually wants after stopping something. Rating a half-written answer says nothing
   * about the reply and the rating is saved, so it would quietly spoil the feedback that gets read
   * later. Maintainer's call, 2026-09-05.
   */
  ratingUnavailable?: boolean;
  onRetry?: () => void;
  transparencyOpen?: boolean;
  onToggleTransparency?: () => void;
  chipsDisabled?: boolean;
  chipUsed?: boolean;
  chipError?: string | null;
  onChip?: (chipId: ReplyMicroActionId) => void;
  askInFlight?: boolean;
  /** When set and non-blank, the utility row gains a Copy button that copies this text. */
  getAnswerCopyText?: () => string;
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
    ratingUnavailable = false,
    onRetry,
    transparencyOpen,
    onToggleTransparency,
    chipsDisabled = false,
    chipUsed = false,
    chipError = null,
    onChip,
    askInFlight = false,
    getAnswerCopyText,
    onMoveUpFromReply,
    onMoveUpFromChips,
    onMoveDownFromUtility,
  } = args;

  const showChipRows = Boolean(onChip) && rating === "down";
  const showUtilityRow =
    Boolean(onRetry) || Boolean(onToggleTransparency) || Boolean(getAnswerCopyText);
  const feedbackDisabled = askInFlight || ratingUnavailable;
  const chipsInactive = chipsDisabled || chipUsed || askInFlight;
  const thumbsLocked = rating !== null;

  const liveSlot = () => queryLiveTurnSlot();
  /*
   * Up from the thumbs row (Helpful / Not really) — the outer reply-actions container's own
   * `onMoveUp` falls back to the same handler. Measured on device 2026-09-04 (build f9a4c17,
   * CHAT-REPLY-ENTRY-01): this used to be a bare `() => false`, unconditionally yielding to Steam,
   * whose own geometry move landed on the bare answer bubble — never its last section — because
   * every ordinary reply has a thumbs row and this was the only path Up from it ever took. The
   * utility row (Retry / Show details) already had a last-resort chain
   * (`upFromRetry`/`upFromShowDetails` below); this gives the thumbs row the same one, minus the
   * hop to the utility row itself, since thumbs sits above it, not below.
   * `onMoveUpFromReply` is declared but has never had a supplier anywhere in this repo (checked
   * 2026-09-04) — kept rather than dropped, since the type already promises "focuses strategy
   * chrome before the answer bubble" and a caller that wants that ahead of the glossary chip and
   * the bubble fallback can still supply it without another signature change.
   */
  const moveUpFromReply = () => {
    if (onMoveUpFromReply?.()) return true;
    if (upIntoGlossaryChip()) return true;
    return focusLastAnswerChunk(replyKey);
  };
  const downFromUtility = () => {
    if (onMoveDownFromUtility?.()) return true;
    return focusDownFromReplyUtilityRow(liveSlot());
  };

  /*
   * Which reply stop currently holds focus (thumbs: 2, utility row: up to 3 with Copy).
   *
   * The row handlers below need this because `onMove*` has to sit on the row `Focusable`, not on the
   * individual buttons — see the comment on the utility row — so a single handler serves every
   * column and has to work out which one it was called for. Copy does not get its own up/down
   * mapping below (it falls back to the Retry column's) — Left/Right within the row is Steam's own
   * `flow-children="horizontal"` navigation, unaffected by which column owns the vertical hop.
   */
  const focusedStop = (): ReplyStopId | null => {
    for (const id of REPLY_STOP_ORDER) {
      const el = getReplyStop(id);
      // Gamepad ring, not activeElement — see elementHasGamepadFocus. Using the
      // DOM's notion here made both column handlers below dead code.
      if (el && elementHasGamepadFocus(el)) return id;
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
    // Same reason as focusedStop: on Deck the row owns the gamepad ring while
    // activeElement can be somewhere else entirely, and this guard then refuses
    // a press that genuinely belongs to this row.
    if (el && !elementHasGamepadFocus(el)) return false;
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
  /*
   * Last fallback on the way up: hand the ring straight to a glossary chip inside this turn's
   * answer bubble. Measured on-Deck 2026-08-28 (runs/DRG-GLOSSARY-02-dpad-chip-ladder.json step 3):
   * on a turn with no thumbs row, Up from Show details yielded to Steam, which landed on the
   * bubble — reaching the chip took Up-then-Down. This runs only after every existing fallback
   * declined, so a thumbs row or refinement chips still win when they exist, and turns with no
   * chip in view are unchanged.
   *
   * The bubble is a different navigation container, hence `takeAnswerBubbleNavFocus` before the
   * DOM focus — a bare `focus()` across that boundary moves `activeElement` while Steam's ring
   * stays put, and `focusDrgGlossaryTermChip`'s elementHasFocus check is what reports the truth.
   * `replyKey` and the bubble's answerKey are the same value per turn (`turn.id`, or "live").
   */
  const upIntoGlossaryChip = () => {
    const bubble = getRegisteredAnswerBubble(replyKey);
    if (!bubble) return false;
    const scroll = findScrollablePanel(bubble);
    if (!scroll) return false;
    const chip = findNextDrgGlossaryTermChipInView(
      bubble,
      (el) => elementIsWithinViewportOf(el, scroll),
      "up",
    );
    if (!chip) return false;
    takeAnswerBubbleNavFocus(replyKey);
    return focusDrgGlossaryTermChip(chip);
  };
  /*
   * Last of all: the answer bubble's own last section, when nothing above claimed the press
   * (typically no thumbs row and no glossary chip in view). Same double-landing shape as Down from
   * the turn header — filed 2026-09-02, "Down from the chat slot lands on the whole reply before
   * its first section" — approached from underneath: without this, Up yielded to Steam and landed
   * on the bare bubble, and only a second Up walked into its last `.bonsai-answer-stop`.
   */
  const upFromRetry = () => {
    const slot = liveSlot();
    if (showChipRows && focusLastReplyChip(slot)) return true;
    if (focusReplyHelpful(slot)) return true;
    if (upIntoGlossaryChip()) return true;
    return focusLastAnswerChunk(replyKey);
  };
  const upFromShowDetails = () => {
    const slot = liveSlot();
    if (showChipRows && focusLastReplyChip(slot)) return true;
    if (focusReplyNotReally(slot)) return true;
    if (upIntoGlossaryChip()) return true;
    return focusLastAnswerChunk(replyKey);
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
          {getAnswerCopyText ? (
            <ReplyCopyButton getCopyText={getAnswerCopyText} disabled={askInFlight} />
          ) : null}
        </Focusable>
      ) : null}
    </Focusable>
  );
}
