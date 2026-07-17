import { call } from "@decky/api";

import type {
  ChatThread,
  ChatThreadDesktopSizeRow,
  ChatThreadSummary,
} from "../types/chatThreads";
import type { StrategyChecklistState } from "../types/bonsaiUi";
import { strategyChecklistToSavePayload } from "./strategyChecklist";

type ListThreadsRpc = { threads: ChatThreadSummary[] };
type GetThreadRpc = { ok: boolean; thread?: ChatThread; error?: string };
type CreateThreadRpc = { ok: boolean; thread?: ChatThread };
type DeleteThreadRpc = { ok: boolean };
type DesktopSizesRpc = {
  ok: boolean;
  threads: ChatThreadDesktopSizeRow[];
  total_bytes: number;
  total_label: string;
};

export async function listChatThreadSummaries(): Promise<ChatThreadSummary[]> {
  const res = (await call("list_chat_threads")) as ListThreadsRpc;
  return Array.isArray(res?.threads) ? res.threads : [];
}

export async function fetchChatThread(threadId: string): Promise<ChatThread | null> {
  const res = await call<[string], GetThreadRpc>("get_chat_thread", threadId);
  if (!res?.ok || !res.thread) return null;
  return res.thread;
}

export async function createChatThreadRpc(args: {
  originAppId?: string;
  appName?: string;
  firstQuestion?: string;
  label?: string;
}): Promise<ChatThread | null> {
  const res = await call<[Record<string, string>], CreateThreadRpc>("create_chat_thread", {
    origin_app_id: args.originAppId ?? "",
    app_name: args.appName ?? "",
    first_question: args.firstQuestion ?? "",
    label: args.label ?? "",
  });
  return res?.thread ?? null;
}

export async function deleteChatThreadRpc(threadId: string): Promise<boolean> {
  const res = await call<[string], DeleteThreadRpc>("delete_chat_thread", threadId);
  return res?.ok === true;
}

export async function saveChatThreadStrategyChecklist(
  threadId: string,
  state: StrategyChecklistState,
): Promise<void> {
  await call("save_chat_thread_strategy_checklist", {
    thread_id: threadId,
    ...strategyChecklistToSavePayload(state),
  });
}

export async function fetchChatThreadsDesktopSizes(): Promise<DesktopSizesRpc> {
  return (await call("get_chat_threads_desktop_sizes")) as DesktopSizesRpc;
}

export function turnsToCollapsedPairs(
  turns: ChatThread["turns"],
): { id: string; question: string; answer: string }[] {
  const pairs: { id: string; question: string; answer: string }[] = [];
  let pendingQ: { id: string; text: string } | null = null;
  for (const turn of turns) {
    if (turn.role === "user") {
      pendingQ = { id: turn.id, text: turn.text };
    } else if (turn.role === "assistant" && pendingQ) {
      pairs.push({ id: pendingQ.id, question: pendingQ.text, answer: turn.text });
      pendingQ = null;
    }
  }
  return pairs;
}
