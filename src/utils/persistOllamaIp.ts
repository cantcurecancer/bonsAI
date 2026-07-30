/**
 * Title: Ollama IP persist guard
 * Purpose: Save LAN Ollama host to localStorage only when routing Ask to a remote PC.
 * Used for: OllamaTab and settings save when ollamaLocalOnDeck is false.
 * Solves: Avoid overwriting remembered LAN host when user switches to on-Deck inference.
 * Does not: Validate reachability — connection probe RPC owns health checks.
 */
/** Persist LAN Ollama host to localStorage only when routing Ask to a remote PC (not local-on-Deck). */
export function persistOllamaIpIfRoutingToLan(
  ollamaLocalOnDeck: boolean,
  saveIp: (ip: string) => void,
  ip: string
): void {
  if (ollamaLocalOnDeck) return;
  saveIp(ip);
}
