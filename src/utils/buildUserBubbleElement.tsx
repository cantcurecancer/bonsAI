import React from "react";
import { Focusable } from "@decky/ui";

export type BuildUserBubbleElementArgs = {
  question: string;
  turnKey: string;
  variant?: "history" | "latest";
};

export function buildUserBubbleElement(args: BuildUserBubbleElementArgs): React.ReactElement {
  const { question, turnKey, variant = "history" } = args;
  const className =
    variant === "latest"
      ? "bonsai-chat-user-bubble bonsai-chat-user-bubble--latest"
      : "bonsai-chat-user-bubble bonsai-chat-user-bubble--history";

  return (
    <Focusable key={`user-${turnKey}`} className="bonsai-chat-user-bubble-row" tabIndex={0}>
      <button type="button" className={className} tabIndex={-1}>
        <span className="bonsai-chat-user-bubble-inner">{question}</span>
      </button>
    </Focusable>
  );
}
