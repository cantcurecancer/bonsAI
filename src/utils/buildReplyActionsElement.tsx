import React from "react";
import { Focusable } from "@decky/ui";
import { findAnswerBubbleByKey, panelStepUp } from "./answerBubbleNavigation";
import { registerAnswerBubbleEl } from "./answerBubbleElRegistry";
import { BonsaiChatSecondaryButton } from "../components/BonsaiChatSecondaryButton";
import {
  RefreshArrowIcon,
  ThumbDownOutlineIcon,
  ThumbUpOutlineIcon,
} from "../components/icons";
import type { ReplyMicroActionId } from "../data/replyMicroActions";
import { replyMicroActionById } from "../data/replyMicroActions";

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
};

function renderChipRow(
  chipIds: ReplyMicroActionId[],
  args: {
    chipsDisabled: boolean;
    onChip?: (chipId: ReplyMicroActionId) => void;
    rowClassName: string;
  }
): React.ReactElement | null {
  const { chipsDisabled, onChip, rowClassName } = args;
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
  } = args;

  const showChipRows = Boolean(onChip) && showFeedback;
  const showUtilityRow = Boolean(onRetry) || Boolean(onToggleTransparency);
  const feedbackDisabled = askInFlight;
  const chipsInactive = chipsDisabled || chipUsed || askInFlight;

  if (!showFeedback && !showUtilityRow && !showChipRows && rating === null) {
    return null;
  }

  return (
    <Focusable
      key={`reply-actions-${replyKey}`}
      className="bonsai-chat-reply-actions"
      flow-children="vertical"
      {...({
        onMoveUp: () => {
          const bubble = findAnswerBubbleByKey(replyKey);
          if (bubble) registerAnswerBubbleEl(replyKey, bubble);
          if (bubble && panelStepUp(bubble)) return true;
          if (bubble) {
            bubble.setAttribute("tabindex", "-1");
            bubble.focus();
            const active = document.activeElement as HTMLElement | null;
            return Boolean(active && bubble.contains(active));
          }
          return false;
        },
      } as Record<string, unknown>)}
    >
      {showFeedback && rating !== null ? (
        <span className="bonsai-chat-feedback-row__label bonsai-chat-feedback-row--rated">
          Saved on this Deck
        </span>
      ) : null}
      {showFeedback && rating === null ? (
        <>
          <span className="bonsai-chat-feedback-row__label">Was this helpful?</span>
          <Focusable className="bonsai-chat-reply-actions-row" flow-children="horizontal">
            <BonsaiChatSecondaryButton
              disabled={feedbackDisabled}
              onClick={() => onRate("up")}
              aria-label="Mark reply helpful"
            >
              <ThumbUpOutlineIcon size={14} />
              Helpful
            </BonsaiChatSecondaryButton>
            <BonsaiChatSecondaryButton
              disabled={feedbackDisabled}
              onClick={() => onRate("down")}
              aria-label="Mark reply not helpful"
            >
              <ThumbDownOutlineIcon size={14} />
              Not really
            </BonsaiChatSecondaryButton>
          </Focusable>
        </>
      ) : null}
      {showChipRows
        ? renderChipRow(CHIP_ROW_REFINE, {
            chipsDisabled: chipsInactive,
            onChip,
            rowClassName: "bonsai-chat-reply-actions-row bonsai-chat-reply-actions-row--chips",
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
          style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: 8, alignItems: "center" }}
        >
          {onRetry ? (
            <BonsaiChatSecondaryButton disabled={askInFlight} onClick={onRetry} aria-label="Retry same prompt">
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
            >
              {transparencyOpen ? "Hide details" : "Show details"}
            </BonsaiChatSecondaryButton>
          ) : null}
        </Focusable>
      ) : null}
    </Focusable>
  );
}
