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
