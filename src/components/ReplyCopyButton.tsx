/**
 * Title: Reply copy button
 * Purpose: Copy a reply's visible answer text to the host clipboard, as a labelled button or a corner icon.
 * Used for: the answer bubble's bottom-right corner (D77); the reply utility row before that.
 * Solves: Self-contained press -> clipboard -> feedback state, so buildReplyActionsElement stays
 *   a plain function (no hooks available there — see its own header comment).
 * Does not: Decide what text is "visible" — see answerCopyText.ts. Does not write the clipboard
 *   itself — see clipboardWrite.ts.
 */
import React, { useEffect, useRef, useState } from "react";
import { BonsaiChatSecondaryButton } from "./BonsaiChatSecondaryButton";
import { CopyDoneIcon, CopyFailedIcon, CopyGlyphIcon } from "./icons";
import { writeClipboardText } from "../utils/clipboardWrite";

export type ReplyCopyButtonProps = {
  /** Read at press time so a still-streaming answer copies whatever is current, not a stale snapshot. */
  getCopyText: () => string;
  disabled?: boolean;
  deckNav?: Record<string, () => boolean | void>;
  /**
   * Draw as a small faded icon for the answer bubble's corner instead of a labelled button (D77).
   * "Copied" and "Copy failed" have no room there, so the result is a tick or a cross and the
   * words stay in the spoken label, which is unchanged.
   */
  corner?: boolean;
};

type CopyStatus = "idle" | "copying" | "copied" | "error";

/** Long enough to read, short enough not to strand the row in a stale state. */
const RESET_DELAY_MS = 2000;

const LABEL: Record<CopyStatus, string> = {
  idle: "Copy",
  copying: "Copy",
  copied: "Copied",
  error: "Copy failed",
};

const ARIA_LABEL: Record<CopyStatus, string> = {
  idle: "Copy reply text",
  copying: "Copy reply text",
  copied: "Reply copied to clipboard",
  error: "Copy reply failed, press to try again",
};

const CORNER_ICON: Record<CopyStatus, React.FC<{ size?: number }>> = {
  idle: CopyGlyphIcon,
  copying: CopyGlyphIcon,
  copied: CopyDoneIcon,
  error: CopyFailedIcon,
};

export function ReplyCopyButton(props: ReplyCopyButtonProps) {
  const { getCopyText, disabled = false, deckNav, corner = false } = props;
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timerRef = useRef<number | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    },
    []
  );

  const scheduleReset = () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current) setStatus("idle");
    }, RESET_DELAY_MS);
  };

  const handleClick = () => {
    if (status === "copying") return;
    const text = getCopyText();
    if (!text.trim()) {
      setStatus("error");
      scheduleReset();
      return;
    }
    setStatus("copying");
    writeClipboardText(text).then(
      () => {
        if (!mountedRef.current) return;
        setStatus("copied");
        scheduleReset();
      },
      () => {
        if (!mountedRef.current) return;
        setStatus("error");
        scheduleReset();
      }
    );
  };

  if (corner) {
    const Icon = CORNER_ICON[status];
    return (
      <BonsaiChatSecondaryButton
        disabled={disabled}
        onClick={handleClick}
        aria-label={ARIA_LABEL[status]}
        replyStop="copy"
        deckNav={deckNav}
        className={`bonsai-reply-copy-corner bonsai-reply-copy-corner--${status}`}
      >
        <Icon size={14} />
      </BonsaiChatSecondaryButton>
    );
  }

  return (
    <BonsaiChatSecondaryButton
      disabled={disabled}
      onClick={handleClick}
      aria-label={ARIA_LABEL[status]}
      replyStop="copy"
      deckNav={deckNav}
    >
      {LABEL[status]}
    </BonsaiChatSecondaryButton>
  );
}
