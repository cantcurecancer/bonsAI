/**
 * Title: Thinking summary text helpers
 * Purpose: Sanitize backend-authored thinking copy and supply the pre-response placeholder.
 * Used for: useBonsaiAskOrchestration — the live Ask thinking line.
 * Solves: Lazy model openers reaching the UI, and an empty line during the submit round trip.
 * Does not: Compose blurb copy. Python owns every word — see bonsai_stream_tags.py.
 *
 * This file used to mirror `compose_thinking_blurb`: six intent pools in two tones, four
 * hand-copied intent predicates, and a template picker. All of it is gone. Two composers keyed on
 * two different request-id spaces meant the opening line rewrote itself within the first poll, and
 * the hand-mirrored predicates had already drifted — `Why does Elden Ring crash on launch?`
 * classified as troubleshooting here and generic in Python, so the line could change intent pool
 * as well as template. The backend now returns the composed opener in the
 * `start_background_game_ai` response and the client renders it.
 * See docs/planning/06-thinking-blurbs-review.md § 2.1, § 2.2.
 */

/**
 * Shown for the one round-trip between submit and the backend's woven opener arriving in the
 * `start_background_game_ai` response. Deliberately constant and pool-free: a placeholder giving
 * way to a specific line reads as progress, whereas one random opener replacing another read as
 * the line changing its mind.
 */
export const THINKING_BLURB_PLACEHOLDER = "Thinking…";

const LAZY_THINKING_OPENER_RE =
  /^\s*(?:yeah\b[,!?.\s—–-]*|fine\b[.\s—–-]*|sure\b[.\s—–-]*|oh joy\b[,!\s—–-]*|right\b[.\s—–-]*)/i;

/**
 * Mirror of `sanitize_thinking_summary` in `bonsai_stream_tags.py`. Still needed on this side
 * because the model-emitted `<bonsai-status>` tag reaches the UI as free-form text; the two run in
 * series on the same string, so they must agree exactly.
 */
export function sanitizeThinkingSummary(text: string): string {
  const raw = (text || "").trim();
  if (!raw) return raw;
  let cleaned = raw;
  for (let i = 0; i < 3; i += 1) {
    const next = cleaned.replace(LAZY_THINKING_OPENER_RE, "").trim();
    if (next === cleaned) break;
    cleaned = next;
  }
  /*
   * Mirrors Python's `return cleaned if cleaned else raw`. A summary that is *entirely* a lazy
   * opener — the model emitting `<bonsai-status>Sure.</bonsai-status>`, which is exactly what the
   * prompt warns against and therefore exactly what happens — strips to "". Returning that blanked
   * the thinking line mid-Ask, because the render gate in MainTabChatTranscript is a truthiness
   * check. A lazy opener on screen beats no line at all.
   */
  return cleaned || raw;
}
