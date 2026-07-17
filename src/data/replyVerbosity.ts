/** Global Ask reply prose style (system-prompt inject on backend). */
export type ReplyVerbosityId = "short" | "balanced" | "detailed";

export const REPLY_VERBOSITY_ORDER: readonly ReplyVerbosityId[] = ["short", "balanced", "detailed"] as const;

export const DEFAULT_REPLY_VERBOSITY: ReplyVerbosityId = "balanced";

const _set = new Set<string>(REPLY_VERBOSITY_ORDER);

export const REPLY_VERBOSITY_LABELS: Record<ReplyVerbosityId, string> = {
  short: "Short",
  balanced: "Balanced",
  detailed: "Detailed",
};

export function isReplyVerbosityId(value: string): value is ReplyVerbosityId {
  return _set.has(value);
}

const _defaultIdx = REPLY_VERBOSITY_ORDER.indexOf(DEFAULT_REPLY_VERBOSITY);

export function indexOfReplyVerbosity(v: ReplyVerbosityId): number {
  const i = REPLY_VERBOSITY_ORDER.indexOf(v);
  return i >= 0 ? i : _defaultIdx >= 0 ? _defaultIdx : 1;
}

export function replyVerbosityAtIndex(index: number): ReplyVerbosityId {
  const n = REPLY_VERBOSITY_ORDER.length;
  if (n <= 0) return DEFAULT_REPLY_VERBOSITY;
  const clamped = Math.max(0, Math.min(n - 1, Math.round(index)));
  return REPLY_VERBOSITY_ORDER[clamped];
}
