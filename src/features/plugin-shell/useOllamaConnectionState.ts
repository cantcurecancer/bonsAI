/**
 * Title: Ollama connection state
 * Purpose: Own the shell's host/connection slice — entered IP, effective host, reachability result, tab reset key.
 * Used for: index.tsx — feeds the Ollama tab, the routing-order modal, and the Ask orchestration's host argument.
 * Solves: Keeps four related pieces of connection state out of the composition root as one named concern.
 * Does not: Talk to Ollama or persist settings — reachability lives in OllamaTab, persistence in pluginStorage.
 */
import { useCallback, useMemo, useState } from "react";

import { OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP } from "../../data/bonsaiSettingsSchema";
import type { DeveloperConnectionStatus } from "../../components/DeveloperTab";
import { peekBonsaiSessionPendingRestore } from "../../utils/bonsaiSessionSurvival";
import { persistOllamaIpIfRoutingToLan as persistOllamaIpIfRoutingToLanUtil } from "../../utils/persistOllamaIp";
import { loadSavedIp, saveIp } from "./pluginStorage";

export type UseOllamaConnectionStateArgs = {
  /** When true the plugin talks to the on-Deck runtime and the entered IP is ignored. */
  ollamaLocalOnDeck: boolean;
};

export type OllamaConnectionState = {
  /** The host the user typed, restored from a survived session or from local storage. */
  ollamaIp: string;
  setOllamaIp: React.Dispatch<React.SetStateAction<string>>;
  /** The host Ask actually uses: the local runtime address when on-Deck, else the trimmed entry. */
  effectiveOllamaPcIp: string;
  /** Writes the IP to local storage only when routing to LAN, so on-Deck use cannot clobber it. */
  persistOllamaIpIfRoutingToLan: (ip: string) => void;
  lastConnectionStatus: DeveloperConnectionStatus | null;
  setLastConnectionStatus: React.Dispatch<React.SetStateAction<DeveloperConnectionStatus | null>>;
  /** Bumped to remount the Ollama tab, discarding its internal state. */
  ollamaTabResetKey: number;
  resetOllamaTab: () => void;
};

export function useOllamaConnectionState({
  ollamaLocalOnDeck,
}: UseOllamaConnectionStateArgs): OllamaConnectionState {
  const [lastConnectionStatus, setLastConnectionStatus] = useState<DeveloperConnectionStatus | null>(null);
  const [ollamaTabResetKey, setOllamaTabResetKey] = useState(0);
  const [ollamaIp, setOllamaIp] = useState(
    () => peekBonsaiSessionPendingRestore()?.ollamaIp ?? loadSavedIp()
  );

  const effectiveOllamaPcIp = useMemo(
    () => (ollamaLocalOnDeck ? OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP : ollamaIp.trim()),
    [ollamaLocalOnDeck, ollamaIp]
  );

  const persistOllamaIpIfRoutingToLan = useCallback(
    (ip: string) => {
      persistOllamaIpIfRoutingToLanUtil(ollamaLocalOnDeck, saveIp, ip);
    },
    [ollamaLocalOnDeck]
  );

  const resetOllamaTab = useCallback(() => {
    setOllamaTabResetKey((k) => k + 1);
  }, []);

  return {
    ollamaIp,
    setOllamaIp,
    effectiveOllamaPcIp,
    persistOllamaIpIfRoutingToLan,
    lastConnectionStatus,
    setLastConnectionStatus,
    ollamaTabResetKey,
    resetOllamaTab,
  };
}
