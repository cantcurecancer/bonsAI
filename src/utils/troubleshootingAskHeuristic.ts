/**
 * Title: Troubleshooting Ask permission heuristic (client)
 * Purpose: Mirror backend troubleshooting phrase gate for the dismissible game-context permission hint.
 * Used for: MainTabChatTranscript when Ask text looks like Proton/compat troubleshooting.
 * Solves: Hint users to enable Read game & screenshot context without auto-enabling it.
 * Does not: Replace backend `question_matches_troubleshooting_log_context` — keep phrases aligned.
 */
export function questionLooksLikeTroubleshootingAsk(question: string): boolean {
  const s = (question || "").toLowerCase();
  if (s.includes("what settings should i use")) return true;
  if (s.includes("any known issues") && s.includes("deck")) return true;
  if (s.includes("how well does this game run") && s.includes("deck")) return true;
  if (s.includes("why is my game crashing")) return true;
  if (/\b(how do i fix stuttering|fix stuttering)\b/.test(s)) return true;
  if (s.includes("troubleshoot") && s.includes("proton")) return true;
  if (/\bgame won'?t launch\b/.test(s) && s.includes("check")) return true;
  if (s.includes("proton issue")) return true;
  if (
    s.includes("proton") &&
    ["deck", "sleep", "resume", "black screen", "crash", "launch", "stutter", "shader", "wine", "steamos", "compat"].some(
      (kw) => s.includes(kw),
    )
  ) {
    return true;
  }
  if (
    s.includes("deck") &&
    [
      "sleep",
      "resume",
      "black screen",
      "crash",
      "proton",
      "steamos",
      "sd card",
      "storage",
      "update",
      "gamescope",
      "steam input",
    ].some((kw) => s.includes(kw))
  ) {
    return true;
  }
  return false;
}
