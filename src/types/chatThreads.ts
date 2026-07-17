import type { StrategyChecklistState } from "./bonsaiUi";

export type ChatThreadTurnRole = "user" | "assistant";

export type ChatThreadTurn = {
  id: string;
  role: ChatThreadTurnRole;
  text: string;
  request_id?: number | null;
  attachment_refs?: { path: string; name: string; source: string }[];
  created_at?: number;
};

export type ChatThreadSummary = {
  id: string;
  label: string;
  created_at: number;
  updated_at: number;
  origin_app_id: string;
  turn_count: number;
};

export type ChatThread = {
  id: string;
  label: string;
  created_at: number;
  updated_at: number;
  origin_app_id: string;
  turns: ChatThreadTurn[];
  pending_request_id?: number | null;
  strategy_checklist?: StrategyChecklistState | null;
};

export type ChatThreadDesktopSizeRow = {
  id: string;
  size_bytes: number;
  size_label: string;
};

export type ChatIdleTimeoutMinutes = 5 | 15 | 30 | 60;

export const CHAT_IDLE_TIMEOUT_OPTIONS: ChatIdleTimeoutMinutes[] = [5, 15, 30, 60];
/** Alias used by settings schema / Settings tab. */
export const CHAT_IDLE_TIMEOUT_MINUTE_OPTIONS = CHAT_IDLE_TIMEOUT_OPTIONS;
export const DEFAULT_CHAT_IDLE_TIMEOUT_MINUTES: ChatIdleTimeoutMinutes = 15;
