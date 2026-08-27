/**
 * Title: Turn header element builder
 * Purpose: Build Focusable collapsed/expanded Ask turn header rows for chat transcript slots.
 * Used for: MainTabChatTranscript history and live turn slot rendering.
 * Solves: Consistent header focus behavior and expand/collapse activation on Deck.
 * Does not: Render answer body — see buildAnswerBubbleElement.
 */
import React from "react";
import { Focusable } from "@decky/ui";
import { focusFirstAnswerChunk } from "./answerBubbleNavigation";
import { isDownDeckButtonEvent } from "./focusNavigation";

export type BuildTurnHeaderElementArgs = {
  turnId: string;
  title: string;
  expanded: boolean;
  variant?: "history" | "live";
  isStreaming?: boolean;
  onActivate: () => void;
};

/** Plain function — header Focusable is a child of the turn-slot Focusable group. */
export function buildTurnHeaderElement(args: BuildTurnHeaderElementArgs): React.ReactElement {
  const {
    turnId,
    title,
    expanded,
    variant = "history",
    isStreaming = false,
    onActivate,
  } = args;

  const headerClass = [
    "bonsai-chat-turn-row-header",
    variant === "live" ? "bonsai-chat-turn-row-header--live" : "bonsai-chat-turn-row-header--history",
    expanded ? "bonsai-chat-turn-row-header--expanded" : "bonsai-chat-turn-row-header--collapsed",
    isStreaming ? "bonsai-chat-turn-row-header--streaming" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const focusAnswer = () => {
    if (!expanded) return false;
    return focusFirstAnswerChunk(turnId);
  };

  /*
   * `onMoveDown` is the handler Steam actually invokes for a D-pad press on device. Measured
   * 2026-08-27: with the ring on this header, a real DOWN press dispatched no DOM keyboard event
   * and never entered the bubble through the previous `onButtonDown`-only wiring — the ring
   * skipped straight past the answer to the utility row. `onMoveDown`'s return value is honored
   * (true suppresses Steam's own move; ContextChipLadder's on-device runs prove both halves).
   * The `onButtonDown` twin stays for the string-shaped presses tests and desktop keyboards
   * deliver, with the string-only predicate so one press can never fire both — the pairing rule
   * documented in focusNavigation.ts.
   */
  const headerNavHandlers = {
    onMoveDown: () => focusAnswer(),
    onButtonDown: (button: unknown) =>
      isDownDeckButtonEvent(button) ? focusAnswer() : false,
  } as Record<string, unknown>;

  return (
    <Focusable
      key={`turn-header-${turnId}`}
      className={headerClass}
      onActivate={onActivate}
      aria-expanded={expanded}
      data-bonsai-turn-id={turnId}
      {...headerNavHandlers}
    >
      <span className="bonsai-chat-turn-row-title" data-bonsai-turn-id={turnId}>
        {title || "…"}
      </span>
    </Focusable>
  );
}
