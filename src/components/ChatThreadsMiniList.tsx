import React, { type RefObject } from "react";
import { Focusable } from "@decky/ui";

import type { ChatThreadSummary } from "../types/chatThreads";

export type ChatThreadsMiniListProps = {
  summaries: ChatThreadSummary[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onOpenPicker: () => void;
  focusUpRef?: React.RefObject<HTMLElement | null>;
  focusDownRef?: React.RefObject<HTMLElement | null>;
};

export function ChatThreadsMiniList({
  summaries,
  activeThreadId,
  onSelectThread,
  onOpenPicker,
  focusUpRef,
  focusDownRef,
}: ChatThreadsMiniListProps) {
  const recent = summaries.slice(0, 5);

  return (
    <div className="bonsai-chat-threads-mini-list" style={{ marginBottom: 8 }}>
      <Focusable
        className="bonsai-chat-threads-mini-list-row"
        onActivate={onOpenPicker}
        onButtonDown={(e) => {
          if (e.detail.button === 2 || e.detail.button === 3) onOpenPicker();
        }}
        onMoveUp={() => {
          focusUpRef?.current?.focus();
        }}
        onMoveDown={() => {
          focusDownRef?.current?.focus();
        }}
      >
        <button
          type="button"
          className="bonsai-chat-threads-picker-btn"
          onClick={onOpenPicker}
          tabIndex={-1}
        >
          All chats…
        </button>
      </Focusable>
      {recent.map((row) => {
        const active = row.id === activeThreadId;
        return (
          <Focusable
            key={row.id}
            className="bonsai-chat-threads-mini-item"
            onActivate={() => onSelectThread(row.id)}
            onMoveUp={() => {
              focusUpRef?.current?.focus();
            }}
            onMoveDown={() => {
              focusDownRef?.current?.focus();
            }}
          >
            <button
              type="button"
              className={
                active
                  ? "bonsai-chat-threads-mini-chip bonsai-chat-threads-mini-chip--active"
                  : "bonsai-chat-threads-mini-chip"
              }
              onClick={() => onSelectThread(row.id)}
              tabIndex={-1}
            >
              {row.label || "Chat"}
            </button>
          </Focusable>
        );
      })}
    </div>
  );
}
