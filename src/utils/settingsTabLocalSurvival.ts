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
