import type { ChatIdleTimeoutMinutes } from "../types/chatThreads";

const STORAGE_KEY = "bonsai:chat-session-activity-at";

export function readChatSessionActivityAt(): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function touchChatSessionActivity(nowMs: number = Date.now()): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(nowMs));
  } catch {
    /* ignore */
  }
}

export function clearChatSessionActivity(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isChatSessionIdleExpired(
  timeoutMinutes: ChatIdleTimeoutMinutes,
  nowMs: number = Date.now(),
): boolean {
  const last = readChatSessionActivityAt();
  if (last == null) return false;
  const ttlMs = timeoutMinutes * 60_000;
  return nowMs - last >= ttlMs;
}
