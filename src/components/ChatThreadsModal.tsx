import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ConfirmModal, Focusable, showModal } from "@decky/ui";

import type { ChatThreadDesktopSizeRow, ChatThreadSummary } from "../types/chatThreads";
import { fetchChatThreadsDesktopSizes } from "../utils/chatThreadsApi";
import { BonsaiModalScope } from "./BonsaiModalScope";

export type ChatThreadsModalProps = {
  summaries: ChatThreadSummary[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void | Promise<void>;
  onClose: () => void;
  onBeforeNestedDeckyModal?: () => void;
  onCompleteNestedDeckyModalClose?: (close: () => void) => void;
};

function formatRelativeTime(epochSec: number): string {
  const delta = Math.max(0, Math.floor(Date.now() / 1000 - epochSec));
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

export function ChatThreadsModal({
  summaries,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onClose,
  onBeforeNestedDeckyModal,
  onCompleteNestedDeckyModalClose,
}: ChatThreadsModalProps) {
  const [sizes, setSizes] = useState<ChatThreadDesktopSizeRow[]>([]);
  const [totalLabel, setTotalLabel] = useState("—");
  const okButtonRef = useRef<HTMLDivElement | null>(null);
  const newChatRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const deleteRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    void fetchChatThreadsDesktopSizes()
      .then((res) => {
        setSizes(Array.isArray(res.threads) ? res.threads : []);
        setTotalLabel(res.total_label ?? "—");
      })
      .catch(() => {
        setSizes([]);
        setTotalLabel("—");
      });
  }, [summaries.length]);

  const sizeById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of sizes) map.set(row.id, row.size_label || "—");
    return map;
  }, [sizes]);

  const focusRow = useCallback((threadId: string) => {
    rowRefs.current.get(threadId)?.focus();
  }, []);

  const focusDelete = useCallback((threadId: string) => {
    deleteRefs.current.get(threadId)?.focus();
  }, []);

  const rowNavHandlers = useCallback(
    (rowIndex: number, rowId: string) => ({
      onMoveUp: () => {
        if (rowIndex === 0) {
          newChatRef.current?.focus();
          return true;
        }
        const prevId = summaries[rowIndex - 1]?.id;
        if (prevId) focusRow(prevId);
        return true;
      },
      onMoveDown: () => {
        const nextId = summaries[rowIndex + 1]?.id;
        if (nextId) {
          focusRow(nextId);
          return true;
        }
        okButtonRef.current?.focus();
        return true;
      },
      onMoveRight: () => {
        focusDelete(rowId);
        return true;
      },
      onMoveLeft: () => {
        newChatRef.current?.focus();
        return true;
      },
    }),
    [focusDelete, focusRow, summaries],
  );

  const deleteNavHandlers = useCallback(
    (rowIndex: number, rowId: string) => ({
      onMoveUp: () => {
        if (rowIndex === 0) {
          newChatRef.current?.focus();
          return true;
        }
        focusRow(summaries[rowIndex - 1]?.id ?? rowId);
        return true;
      },
      onMoveDown: () => {
        const nextId = summaries[rowIndex + 1]?.id;
        if (nextId) {
          focusRow(nextId);
          return true;
        }
        okButtonRef.current?.focus();
        return true;
      },
      onMoveRight: () => {
        okButtonRef.current?.focus();
        return true;
      },
      onMoveLeft: () => {
        focusRow(rowId);
        return true;
      },
    }),
    [focusRow, summaries],
  );

  const confirmDelete = useCallback(
    (threadId: string, label: string) => {
      onBeforeNestedDeckyModal?.();
      const handle = showModal(
        <ConfirmModal
          strTitle="Delete this chat?"
          strDescription={`Remove "${label}" from saved chats and delete its Desktop folder if present.`}
          strOKButtonText="Delete"
          onOK={() => {
            void Promise.resolve(onDeleteThread(threadId)).finally(() => {
              onCompleteNestedDeckyModalClose?.(() => handle.Close());
            });
          }}
          onCancel={() => onCompleteNestedDeckyModalClose?.(() => handle.Close())}
        />,
      );
    },
    [onBeforeNestedDeckyModal, onCompleteNestedDeckyModalClose, onDeleteThread],
  );

  return (
    <BonsaiModalScope className="bonsai-chat-threads-modal">
      <div className="bonsai-chat-threads-modal-inner">
        <div className="bonsai-chat-threads-modal-title">Chats</div>
        <div className="bonsai-chat-threads-modal-total">Desktop total: {totalLabel}</div>
        <Focusable
          ref={newChatRef}
          onMoveDown={() => {
            const first = summaries[0]?.id;
            if (first) focusRow(first);
            else okButtonRef.current?.focus();
          }}
        >
          <Button
            onClick={() => {
              onNewChat();
              onClose();
            }}
          >
            New chat
          </Button>
        </Focusable>
        <div className="bonsai-chat-threads-modal-list">
          {summaries.map((row, rowIndex) => (
            <div key={row.id} className="bonsai-chat-threads-modal-row">
              <Focusable
                ref={(el) => {
                  if (el) rowRefs.current.set(row.id, el);
                  else rowRefs.current.delete(row.id);
                }}
                className="bonsai-chat-threads-modal-row-select"
                data-bonsai-thread-row-focus={row.id}
                onActivate={() => {
                  onSelectThread(row.id);
                  onClose();
                }}
                {...rowNavHandlers(rowIndex, row.id)}
              >
                <button
                  type="button"
                  className={
                    row.id === activeThreadId
                      ? "bonsai-chat-threads-modal-row-btn bonsai-chat-threads-modal-row-btn--active"
                      : "bonsai-chat-threads-modal-row-btn"
                  }
                  onClick={() => {
                    onSelectThread(row.id);
                    onClose();
                  }}
                  tabIndex={-1}
                >
                  <span className="bonsai-chat-threads-modal-row-label">{row.label}</span>
                  <span className="bonsai-chat-threads-modal-row-meta">
                    {formatRelativeTime(row.updated_at)} · {sizeById.get(row.id) ?? "—"}
                  </span>
                </button>
              </Focusable>
              <Focusable
                ref={(el) => {
                  if (el) deleteRefs.current.set(row.id, el);
                  else deleteRefs.current.delete(row.id);
                }}
                className="bonsai-chat-threads-modal-delete"
                data-bonsai-thread-delete={row.id}
                onActivate={() => confirmDelete(row.id, row.label)}
                {...deleteNavHandlers(rowIndex, row.id)}
              >
                <button
                  type="button"
                  className="bonsai-chat-threads-modal-delete-btn"
                  onClick={() => confirmDelete(row.id, row.label)}
                  tabIndex={-1}
                  aria-label="Delete chat"
                >
                  ×
                </button>
              </Focusable>
            </div>
          ))}
        </div>
        <Focusable
          ref={okButtonRef}
          onMoveUp={() => {
            const lastId = summaries[summaries.length - 1]?.id;
            if (lastId) focusDelete(lastId);
            else newChatRef.current?.focus();
          }}
          onMoveLeft={() => {
            const lastId = summaries[summaries.length - 1]?.id;
            if (lastId) focusRow(lastId);
            else newChatRef.current?.focus();
          }}
        >
          <Button onClick={onClose}>Close</Button>
        </Focusable>
      </div>
    </BonsaiModalScope>
  );
}
