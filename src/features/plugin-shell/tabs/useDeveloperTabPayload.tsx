/**
 * Title: Developer tab payload
 * Purpose: Build the memoized Developer tab element for the shell's tab list.
 * Used for: index.tsx — the "Debug" tab row, present only while showDeveloperTab is on.
 * Solves: Keeps a 25-prop element and its memo dependency list out of the composition root.
 * Does not: Own any of the state it passes — every value is supplied by the caller.
 */
import React, { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import { DeveloperTab } from "../../../components/DeveloperTab";

type DeveloperTabProps = React.ComponentProps<typeof DeveloperTab>;

export type UseDeveloperTabPayloadArgs = Omit<
  DeveloperTabProps,
  "onClearErrors" | "onInstallSeedKnowledgeBase"
> & {
  setCapturedErrors: Dispatch<SetStateAction<string[]>>;
  /** Gated on showDeveloperTab, matching the tab that hosts it. */
  installSeedKnowledgeBase: () => Promise<void>;
  showDeveloperTab: boolean;
};

export function useDeveloperTabPayload({
  capturedErrors,
  setCapturedErrors,
  onSteamInputPhase1Jump,
  lastConnectionStatus,
  desktopDebugNoteAutoSave,
  setDesktopDebugNoteAutoSave,
  desktopAskVerboseLogging,
  setDesktopAskVerboseLogging,
  desktopAppLogLevel,
  setDesktopAppLogLevel,
  filesystemWrite,
  presetChipFadeAnimationEnabled,
  setPresetChipFadeAnimationEnabled,
  presetChipAnimation,
  setPresetChipAnimation,
  steamWebApiKey,
  setSteamWebApiKey,
  showOnscreenDebugHud,
  setShowOnscreenDebugHud,
  devForceSessionRagChips,
  setDevForceSessionRagChips,
  devPreloadAskModel,
  setDevPreloadAskModel,
  devFrozenTestChips,
  setDevFrozenTestChips,
  ragHybridRetrievalEnabled,
  setRagHybridRetrievalEnabled,
  tabResumeMode,
  setTabResumeMode,
  installSeedKnowledgeBase,
  showDeveloperTab,
  onJumpToPermission,
}: UseDeveloperTabPayloadArgs): React.ReactElement {
  // Dependency list preserved verbatim from index.tsx: the settings setters are stable
  // identities from usePluginSettings and were deliberately left out.
  return useMemo(
    () => (
      <DeveloperTab
        capturedErrors={capturedErrors}
        onClearErrors={() => setCapturedErrors([])}
        onSteamInputPhase1Jump={onSteamInputPhase1Jump}
        lastConnectionStatus={lastConnectionStatus}
        desktopDebugNoteAutoSave={desktopDebugNoteAutoSave}
        setDesktopDebugNoteAutoSave={setDesktopDebugNoteAutoSave}
        desktopAskVerboseLogging={desktopAskVerboseLogging}
        setDesktopAskVerboseLogging={setDesktopAskVerboseLogging}
        desktopAppLogLevel={desktopAppLogLevel}
        setDesktopAppLogLevel={setDesktopAppLogLevel}
        filesystemWrite={filesystemWrite}
        onJumpToPermission={onJumpToPermission}
        presetChipFadeAnimationEnabled={presetChipFadeAnimationEnabled}
        setPresetChipFadeAnimationEnabled={setPresetChipFadeAnimationEnabled}
        presetChipAnimation={presetChipAnimation}
        setPresetChipAnimation={setPresetChipAnimation}
        steamWebApiKey={steamWebApiKey}
        setSteamWebApiKey={setSteamWebApiKey}
        showOnscreenDebugHud={showOnscreenDebugHud}
        setShowOnscreenDebugHud={setShowOnscreenDebugHud}
        devForceSessionRagChips={devForceSessionRagChips}
        setDevForceSessionRagChips={setDevForceSessionRagChips}
        devPreloadAskModel={devPreloadAskModel}
        setDevPreloadAskModel={setDevPreloadAskModel}
        devFrozenTestChips={devFrozenTestChips}
        setDevFrozenTestChips={setDevFrozenTestChips}
        ragHybridRetrievalEnabled={ragHybridRetrievalEnabled}
        setRagHybridRetrievalEnabled={setRagHybridRetrievalEnabled}
        tabResumeMode={tabResumeMode}
        setTabResumeMode={setTabResumeMode}
        onInstallSeedKnowledgeBase={showDeveloperTab ? installSeedKnowledgeBase : undefined}
      />
    ),
    [
      capturedErrors,
      onSteamInputPhase1Jump,
      lastConnectionStatus,
      desktopDebugNoteAutoSave,
      desktopAskVerboseLogging,
      desktopAppLogLevel,
      filesystemWrite,
      presetChipFadeAnimationEnabled,
      presetChipAnimation,
      steamWebApiKey,
      showOnscreenDebugHud,
      devForceSessionRagChips,
      devPreloadAskModel,
      devFrozenTestChips,
      ragHybridRetrievalEnabled,
      tabResumeMode,
      installSeedKnowledgeBase,
      showDeveloperTab,
      onJumpToPermission,
    ]
  );
}
