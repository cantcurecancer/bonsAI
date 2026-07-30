/**
 * Title: Settings tab local survival
 * Purpose: Register and restore Settings tab UI snapshot across Decky modal unmount cycles.
 * Used for: SettingsTab accent intensity menu open state.
 * Solves: Preserve dropdown/menu state when a modal closes and reopens the QAM panel.
 * Does not: Persist settings values — see usePluginSettings RPC save path.
 */
import { createTabLocalSurvival } from "./createTabLocalSurvival";

export type SettingsTabLocalSnapshot = {
  accentIntensityMenuOpen: boolean;
};

const survival = createTabLocalSurvival<SettingsTabLocalSnapshot>();

export function registerSettingsTabLocalGetter(fn: () => SettingsTabLocalSnapshot): void {
  survival.registerGetter(fn);
}

export function unregisterSettingsTabLocalGetter(): void {
  survival.unregisterGetter();
}

export function captureSettingsTabLocalSnapshot(): SettingsTabLocalSnapshot | null {
  return survival.captureSnapshot();
}

export function peekSettingsTabLocalPending(): SettingsTabLocalSnapshot | null {
  return survival.peekPending();
}

export function consumeSettingsTabLocalPending(): SettingsTabLocalSnapshot | null {
  return survival.consumePending();
}

export function clearSettingsTabLocalSurvival(): void {
  survival.clear();
}
