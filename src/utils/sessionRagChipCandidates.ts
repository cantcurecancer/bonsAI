/**
 * Title: Session RAG chip candidates RPC
 * Purpose: Fetch and normalize session-scoped RAG preset chip candidates from backend RPC.
 * Used for: Preset carousel session RAG composition on MainTab.
 * Solves: Typed candidate list for composeSessionPresets without duplicating RPC parsing.
 * Does not: Score or rank candidates — see sessionRagComposer probability mix.
 */
import { callDeckyWithTimeout, DECKY_RPC_TIMEOUT_MS, formatDeckyRpcError } from "./deckyCall";
import type { SessionRagChipCandidate } from "../features/preset-carousel/sessionRagComposer";

export type SessionRagChipCandidatesRpcResult = {
  ok?: boolean;
  reason?: string;
  candidates?: Array<{
    text?: string;
    category?: string;
    prefer_ask_mode?: string | null;
    domain?: string;
  }>;
};

function normalizeCandidate(raw: {
  text?: string;
  category?: string;
  prefer_ask_mode?: string | null;
  domain?: string;
}): SessionRagChipCandidate | null {
  const text = typeof raw?.text === "string" ? raw.text.trim() : "";
  const category = typeof raw?.category === "string" ? raw.category.trim() : "";
  if (!text || !category) {
    return null;
  }
  const prefer = raw?.prefer_ask_mode;
  const preferAskMode =
    prefer === "speed" || prefer === "strategy" || prefer === "expert" ? prefer : undefined;
  return {
    text,
    category,
    ...(preferAskMode ? { preferAskMode } : {}),
    ...(typeof raw?.domain === "string" && raw.domain ? { domain: raw.domain } : {}),
  };
}

export async function fetchSessionRagChipCandidates(args: {
  appId: string;
  appName: string;
  shortcutName?: string;
}): Promise<SessionRagChipCandidate[]> {
  try {
    const result = await callDeckyWithTimeout<
      [string, string, string],
      SessionRagChipCandidatesRpcResult
    >(
      "get_session_rag_chip_candidates",
      [args.appId, args.appName, args.shortcutName ?? ""],
      DECKY_RPC_TIMEOUT_MS,
    );
    if (!result?.ok || !Array.isArray(result.candidates)) {
      console.warn(
        "[bonsAI] get_session_rag_chip_candidates returned no usable candidates; falling back to static preset chips.",
        result?.reason ?? "no reason given"
      );
      return [];
    }
    const out: SessionRagChipCandidate[] = [];
    const seen = new Set<string>();
    for (const raw of result.candidates) {
      const normalized = normalizeCandidate(raw);
      if (!normalized || seen.has(normalized.text)) {
        continue;
      }
      seen.add(normalized.text);
      out.push(normalized);
    }
    return out;
  } catch (e) {
    // KNOWN BUG: get_session_rag_chip_candidates has no implementation in main.py,
    // so this always rejects and session RAG chips never appear -- the carousel
    // silently falls back to static seeds. See docs/roadmap.md "Known bugs".
    console.error(
      "[bonsAI] get_session_rag_chip_candidates failed; session RAG preset chips unavailable:",
      formatDeckyRpcError(e)
    );
    return [];
  }
}
