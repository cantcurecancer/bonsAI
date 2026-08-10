/**
 * Title: Chat slots RPC client
 * Purpose: Thin wrappers for chat slot list/get/create/delete/rename RPCs.
 * Used for: useChatSlots and tests.
 * Solves: Typed Decky calls with timeout — no raw call() on the Ask path.
 * Does not: Map turns to UI transcript — see chatSlotTurns.ts.
 */
import { callDeckyWithTimeout } from "./deckyCall";

export type ChatSlotTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  request_id?: number | null;
  created_at?: number;
};

export type ChatSlotSummary = {
  id: string;
  label: string;
  created_at: number;
  updated_at: number;
  origin_app_id?: string;
  turn_count?: number;
};

export type ChatSlot = {
  id: string;
  label: string;
  created_at: number;
  updated_at: number;
  origin_app_id?: string;
  turns: ChatSlotTurn[];
};

type ListSlotsRpc = { slots: ChatSlotSummary[] };
type GetSlotRpc = { ok: boolean; slot?: ChatSlot; error?: string };
type CreateSlotRpc = { ok: boolean; slot?: ChatSlot };
type DeleteSlotRpc = { ok: boolean; error?: string };
type RenameSlotRpc = { ok: boolean; slot?: ChatSlot; error?: string };

export async function listChatSlots(): Promise<ChatSlotSummary[]> {
  const res = await callDeckyWithTimeout<[], ListSlotsRpc>("list_chat_slots", []);
  return Array.isArray(res?.slots) ? res.slots : [];
}

export async function getChatSlot(slotId: string): Promise<ChatSlot | null> {
  const res = await callDeckyWithTimeout<[string], GetSlotRpc>("get_chat_slot", [slotId]);
  if (!res?.ok || !res.slot) return null;
  return res.slot;
}

export async function createChatSlot(args: {
  originAppId?: string;
  appName?: string;
  firstQuestion?: string;
  label?: string;
}): Promise<ChatSlot | null> {
  const res = await callDeckyWithTimeout<[Record<string, string>], CreateSlotRpc>("create_chat_slot", [
    {
      origin_app_id: args.originAppId ?? "",
      app_name: args.appName ?? "",
      first_question: args.firstQuestion ?? "",
      label: args.label ?? "",
    },
  ]);
  return res?.slot ?? null;
}

export async function deleteChatSlot(slotId: string): Promise<boolean> {
  const res = await callDeckyWithTimeout<[string], DeleteSlotRpc>("delete_chat_slot", [slotId]);
  return res?.ok === true;
}

export async function renameChatSlot(slotId: string, label: string): Promise<ChatSlot | null> {
  const res = await callDeckyWithTimeout<[Record<string, string>], RenameSlotRpc>("rename_chat_slot", [
    { slot_id: slotId, label },
  ]);
  return res?.slot ?? null;
}
