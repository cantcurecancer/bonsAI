import type { ReactNode } from "react";
import { Button } from "@decky/ui";
import { registerReplyStop, type ReplyStopId } from "../utils/replyStopRegistry";

type BonsaiChatSecondaryButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  className?: string;
  style?: React.CSSProperties;
  deckNav?: Record<string, () => boolean | void>;
  /** Registers this button in the reply 2x2 focus registry for column D-pad hops. */
  replyStop?: ReplyStopId;
};

/** Decky `Button` focus stop — native `<button>` inside `Focusable` is not D-pad navigable. */
export function BonsaiChatSecondaryButton(props: BonsaiChatSecondaryButtonProps) {
  const { children, onClick, disabled, className, style, deckNav, replyStop, ...rest } = props;
  const extra = className ? ` ${className}` : "";
  return (
    <Button
      className={`bonsai-chat-secondary-btn${extra}`}
      focusable
      disabled={disabled}
      onClick={onClick}
      style={style}
      ref={
        replyStop
          ? (el: HTMLElement | null) => {
              registerReplyStop(replyStop, el);
            }
          : undefined
      }
      {...(deckNav as Record<string, unknown> | undefined)}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Button>
  );
}
