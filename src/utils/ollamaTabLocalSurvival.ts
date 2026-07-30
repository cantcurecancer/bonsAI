/**
 * Title: Ollama tab local survival
 * Purpose: Register and restore Ollama tab UI snapshot across Decky modal unmount cycles.
 * Used for: OllamaTab connection status, mDNS hosts, and local install menu open state.
 * Solves: Preserve in-progress connection UI when a modal closes and reopens the QAM panel.
 * Does not: Save Ollama host/IP — see usePluginSettings and persistOllamaIp.
 */
import type { DeveloperConnectionStatus } from "../components/DeveloperTab";
import { createTabLocalSurvival } from "./createTabLocalSurvival";

export type OllamaTabLocalSnapshot = {
  connectionStatus: DeveloperConnectionStatus | null;
  mdnsHosts: Array<{ label: string; host: string; port: number; verified?: boolean }>;
  mdnsDiscoveryMessage: string | null;
  localInstallMenuOpen: boolean;
};

const survival = createTabLocalSurvival<OllamaTabLocalSnapshot>();

export function registerOllamaTabLocalGetter(fn: () => OllamaTabLocalSnapshot): void {
  survival.registerGetter(fn);
}

export function unregisterOllamaTabLocalGetter(): void {
  survival.unregisterGetter();
}

export function captureOllamaTabLocalSnapshot(): OllamaTabLocalSnapshot | null {
  return survival.captureSnapshot();
}

export function peekOllamaTabLocalPending(): OllamaTabLocalSnapshot | null {
  return survival.peekPending();
}

export function consumeOllamaTabLocalPending(): OllamaTabLocalSnapshot | null {
  return survival.consumePending();
}

export function clearOllamaTabLocalSurvival(): void {
  survival.clear();
}
