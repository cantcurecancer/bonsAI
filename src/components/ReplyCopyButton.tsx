/**
 * Title: Reply copy button
 * Purpose: Copy a reply's visible answer text to the host clipboard from the reply utility row.
 * Used for: buildReplyActionsElement utility row, alongside Retry / Show details.
 * Solves: Self-contained press -> clipboard -> feedback state, so buildReplyActionsElement stays
 *   a plain function (no hooks available there — see its own header comment).
 * Does not: Decide what text is "visible" — see answerCopyText.ts. Does not write the clipboard
 *   itself — see clipboardWrite.ts.
 */
import { useEffect, useRef, useState } from "react";
import { BonsaiChatSecondaryButton } from "./BonsaiChatSecondaryButton";
import { writeClipboardText } from "../utils/clipboardWrite";

export type ReplyCopyButtonProps = {
  /** Read at press time so a still-streaming answer copies whatever is current, not a stale snapshot. */
  getCopyText: () => string;
  disabled?: boolean;
  deckNav?: Record<string, () => boolean | void>;
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

export function ReplyCopyButton(props: ReplyCopyButtonProps) {
  const { getCopyText, disabled = false, deckNav } = props;
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
