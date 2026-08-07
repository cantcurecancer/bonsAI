/**
 * Title: Main tab payload
 * Purpose: Build the memoized Main tab element, including the AI-character avatar values it displays.
 * Used for: index.tsx — the default "Ask" tab row.
 * Solves: Keeps the shell's largest element, its 50-entry memo dependency list and two layout constants out of the composition root.
 * Does not: Own Ask state, input state or screenshots — every value comes from the caller's hooks.
 */
import React, { useMemo } from "react";

import { MainTab } from "../../../components/MainTab";
import {
  formatAiCharacterSelectionLine,
  resolveMainTabAvatarBadgeLetter,
  resolveMainTabAvatarPresetId,
} from "../../../data/characterCatalog";
import { isQamSetting } from "../../../data/steamSettingsNavigation";
import type { AiCharacterAccentIntensityId } from "../../../data/aiCharacterAccentIntensity";

const FULL_BLEED_ROW_STYLE: React.CSSProperties = {
  width: "100%",
  marginLeft: 0,
  marginRight: 0,
  boxSizing: "border-box",
};

const PRESET_BUTTON_SURFACE: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#93a3b0",
};

type MainTabProps = React.ComponentProps<typeof MainTab>;

/**
 * Everything the Main tab renders, except the two layout constants and `isQamSetting`
 * (owned here) and the AI-character presentation, which is derived from the raw settings below.
 */
export type UseMainTabPayloadArgs = Omit<
  MainTabProps,
  | "fullBleedRowStyle"
  | "presetButtonSurface"
  | "isQamSetting"
  | "aiCharacterPadClass"
  | "aiCharacterAvatarPresetId"
  | "aiCharacterAvatarBadgeLetter"
  | "aiCharacterDebugLine"
  | "onOpenCharacterPicker"
> & {
  aiCharacterEnabled: boolean;
  aiCharacterRandom: boolean;
  aiCharacterPresetId: string;
  aiCharacterCustomText: string;
  aiCharacterAccentIntensity: AiCharacterAccentIntensityId;
  /** Offered to the tab only while the character feature is on. */
  openCharacterPickerModal: () => void;
};

export function useMainTabPayload({
  aiCharacterEnabled,
  aiCharacterRandom,
  aiCharacterPresetId,
  aiCharacterCustomText,
  aiCharacterAccentIntensity,
  openCharacterPickerModal,
  ...props
}: UseMainTabPayloadArgs): React.ReactElement {
  const mainTabAvatarPresetId = aiCharacterEnabled
    ? resolveMainTabAvatarPresetId({
        enabled: aiCharacterEnabled,
        random: aiCharacterRandom,
        presetId: aiCharacterPresetId,
        customText: aiCharacterCustomText,
      })
    : null;

  const mainTabAvatarBadgeLetter = resolveMainTabAvatarBadgeLetter({
    enabled: aiCharacterEnabled,
    random: aiCharacterRandom,
    presetId: aiCharacterPresetId,
    customText: aiCharacterCustomText,
  });

  const aiCharacterDebugLineForMainTab =
    typeof window !== "undefined" &&
    (window as unknown as { __BONSAI_DEBUG_AI_CHARACTER__?: boolean }).__BONSAI_DEBUG_AI_CHARACTER__
      ? [
          `avatar=${mainTabAvatarPresetId ?? "null"}`,
          `presetId="${aiCharacterPresetId}"`,
          `random=${String(aiCharacterRandom)}`,
          `line=${formatAiCharacterSelectionLine({
            random: aiCharacterRandom,
            presetId: aiCharacterPresetId,
            customText: aiCharacterCustomText,
          })}`,
          `accent=${aiCharacterAccentIntensity}`,
        ].join(" | ")
      : null;

  const {
    suggestedPrompts,
    showPluginHelpChip,
    onOpenPluginHelp,
    presetChipFadeAnimationEnabled,
    presetChipAnimation,
    onRetryLastResponse,
    liveReplyFeedbackRating,
    onReplyFeedback,
    onReplyMicroAction,
    liveReplyChipUsed,
    liveReplyChipError,
    setUnifiedInput,
    unifiedInputHostRef,
    unifiedInputFieldLayerRef,
    unifiedInputMeasureRef,
    attachActionHostRef,
    askBarHostRef,
    screenshotBrowserHostRef,
    unifiedInputSurfacePx,
    unifiedInput,
    usesNativeMultilineField,
    setIsUnifiedInputFocused,
    isUnifiedInputFocused,
    setSelectedIndex,
    filteredSettings,
    selectedIndex,
    onSettingClick,
    isAsking,
    ollamaIp,
    onAskOllama,
    onOpenScreenshotBrowser,
    onTakeScreenshot,
    onCancelAsk,
    onMicInput,
    voiceRecording,
    selectedAttachment,
    setSelectedAttachment,
    clearUnifiedInput,
    showSearchClearButton,
    isScreenshotBrowserOpen,
    onCloseScreenshotBrowser,
    loadRecentScreenshots,
    mediaError,
    isCapturingScreenshot,
    recentScreenshots,
    isLoadingRecentScreenshots,
    onSelectRecentScreenshot,
    navigationMessage,
    showSlowWarning,
    latencyWarningSeconds,
    ollamaResponse,
    elapsedSeconds,
    lastApplied,
    ollamaContext,
    canSaveDesktopNote,
    onOpenDesktopNoteSave,
    mediaLibraryEnabled,
    gameContextReadEnabled,
    onNavigateToPermissions,
    desktopNoteSaveEnabled,
    transparencySnapshot,
    onRunOriginalAsk,
    askMode,
    onAskModeChange,
    strategyGuideBranches,
    strategyChecklist,
    onStrategyChecklistToggle,
    onStrategyBranchPick,
    onPresetPreferAskMode,
    askThreadCollapsed,
    askThreadDisplayQuestion,
    expandedTurnKey,
    onTurnActivate,
    modelPolicyDisclosure,
    onOpenModelPolicyReadme,
    shortcutSetupVariant,
    onOpenControllerSettings,
    strategySpoilerMaskingEnabled,
    strategySpoilerAutoRevealAfterConsent,
    presetCarouselInject,
    isStreamingPreview,
    streamDisplayText,
    thinkingSummary,
    desktopAskVerboseLogging,
    lastRequestId,
    lastExchange,
  } = props;

  // Dependency list preserved from index.tsx, with the names it depended on translated to the
  // prop that derives from them (`pluginHelpDismissed` -> `showPluginHelpChip`,
  // `effectiveOllamaPcIp` -> `ollamaIp`, the two capability flags -> the two booleans built from
  // them). The two style constants it also listed are module constants here and cannot change,
  // so they are dropped rather than threaded through.
  return useMemo(
    () => (
      <MainTab
        key="bonsai-main-tab"
        fullBleedRowStyle={FULL_BLEED_ROW_STYLE}
        presetButtonSurface={PRESET_BUTTON_SURFACE}
        suggestedPrompts={suggestedPrompts}
        showPluginHelpChip={showPluginHelpChip}
        onOpenPluginHelp={onOpenPluginHelp}
        presetChipFadeAnimationEnabled={presetChipFadeAnimationEnabled}
        presetChipAnimation={presetChipAnimation}
        onRetryLastResponse={onRetryLastResponse}
        liveReplyFeedbackRating={liveReplyFeedbackRating}
        onReplyFeedback={onReplyFeedback}
        onReplyMicroAction={onReplyMicroAction}
        liveReplyChipUsed={liveReplyChipUsed}
        liveReplyChipError={liveReplyChipError}
        setUnifiedInput={setUnifiedInput}
        unifiedInputHostRef={unifiedInputHostRef}
        unifiedInputFieldLayerRef={unifiedInputFieldLayerRef}
        unifiedInputMeasureRef={unifiedInputMeasureRef}
        attachActionHostRef={attachActionHostRef}
        askBarHostRef={askBarHostRef}
        screenshotBrowserHostRef={screenshotBrowserHostRef}
        unifiedInputSurfacePx={unifiedInputSurfacePx}
        unifiedInput={unifiedInput}
        usesNativeMultilineField={usesNativeMultilineField}
        setIsUnifiedInputFocused={setIsUnifiedInputFocused}
        isUnifiedInputFocused={isUnifiedInputFocused}
        setSelectedIndex={setSelectedIndex}
        filteredSettings={filteredSettings}
        selectedIndex={selectedIndex}
        onSettingClick={onSettingClick}
        isAsking={isAsking}
        ollamaIp={ollamaIp}
        onAskOllama={onAskOllama}
        onOpenScreenshotBrowser={onOpenScreenshotBrowser}
        onTakeScreenshot={onTakeScreenshot}
        onCancelAsk={onCancelAsk}
        onMicInput={onMicInput}
        voiceRecording={voiceRecording}
        selectedAttachment={selectedAttachment}
        setSelectedAttachment={setSelectedAttachment}
        clearUnifiedInput={clearUnifiedInput}
        showSearchClearButton={showSearchClearButton}
        isScreenshotBrowserOpen={isScreenshotBrowserOpen}
        onCloseScreenshotBrowser={onCloseScreenshotBrowser}
        loadRecentScreenshots={loadRecentScreenshots}
        mediaError={mediaError}
        isCapturingScreenshot={isCapturingScreenshot}
        recentScreenshots={recentScreenshots}
        isLoadingRecentScreenshots={isLoadingRecentScreenshots}
        onSelectRecentScreenshot={onSelectRecentScreenshot}
        navigationMessage={navigationMessage}
        isQamSetting={isQamSetting}
        showSlowWarning={showSlowWarning}
        latencyWarningSeconds={latencyWarningSeconds}
        ollamaResponse={ollamaResponse}
        elapsedSeconds={elapsedSeconds}
        lastApplied={lastApplied}
        ollamaContext={ollamaContext}
        canSaveDesktopNote={canSaveDesktopNote}
        onOpenDesktopNoteSave={onOpenDesktopNoteSave}
        mediaLibraryEnabled={mediaLibraryEnabled}
        gameContextReadEnabled={gameContextReadEnabled}
        onNavigateToPermissions={onNavigateToPermissions}
        desktopNoteSaveEnabled={desktopNoteSaveEnabled}
        aiCharacterPadClass={aiCharacterEnabled}
        aiCharacterAvatarPresetId={mainTabAvatarPresetId}
        aiCharacterAvatarBadgeLetter={mainTabAvatarBadgeLetter}
        onOpenCharacterPicker={aiCharacterEnabled ? openCharacterPickerModal : undefined}
        aiCharacterDebugLine={aiCharacterDebugLineForMainTab}
        transparencySnapshot={transparencySnapshot}
        onRunOriginalAsk={onRunOriginalAsk}
        askMode={askMode}
        onAskModeChange={onAskModeChange}
        strategyGuideBranches={strategyGuideBranches}
        strategyChecklist={strategyChecklist}
        onStrategyChecklistToggle={onStrategyChecklistToggle}
        onStrategyBranchPick={onStrategyBranchPick}
        onPresetPreferAskMode={onPresetPreferAskMode}
        askThreadCollapsed={askThreadCollapsed}
        askThreadDisplayQuestion={askThreadDisplayQuestion}
        expandedTurnKey={expandedTurnKey}
        onTurnActivate={onTurnActivate}
        modelPolicyDisclosure={modelPolicyDisclosure}
        onOpenModelPolicyReadme={onOpenModelPolicyReadme}
        shortcutSetupVariant={shortcutSetupVariant}
        onOpenControllerSettings={onOpenControllerSettings}
        strategySpoilerMaskingEnabled={strategySpoilerMaskingEnabled}
        strategySpoilerAutoRevealAfterConsent={strategySpoilerAutoRevealAfterConsent}
        presetCarouselInject={presetCarouselInject}
        isStreamingPreview={isStreamingPreview}
        streamDisplayText={streamDisplayText}
        thinkingSummary={thinkingSummary}
        desktopAskVerboseLogging={desktopAskVerboseLogging}
        lastRequestId={lastRequestId}
        lastExchange={lastExchange}
      />
    ),
    // ANY NEW PROP MUST BE ADDED TO THIS LIST. It is hand-maintained and nothing
    // checks it against the JSX above: a prop left out does not fail `tsc` or any
    // test, the memoized element just goes stale and the feature silently does
    // nothing on device. Its twin is `presetChipsPropsEqual` in
    // `components/MainTabPresetAnimatedChips.tsx` — a change threaded to the preset
    // chips has to clear both gates.
    [
      suggestedPrompts,
      showPluginHelpChip,
      presetChipFadeAnimationEnabled,
      presetChipAnimation,
      unifiedInput,
      unifiedInputSurfacePx,
      usesNativeMultilineField,
      isUnifiedInputFocused,
      filteredSettings,
      selectedIndex,
      isAsking,
      ollamaIp,
      selectedAttachment,
      showSearchClearButton,
      isScreenshotBrowserOpen,
      mediaError,
      isCapturingScreenshot,
      recentScreenshots,
      isLoadingRecentScreenshots,
      navigationMessage,
      showSlowWarning,
      latencyWarningSeconds,
      ollamaResponse,
      elapsedSeconds,
      lastApplied,
      ollamaContext,
      lastExchange,
      mediaLibraryEnabled,
      gameContextReadEnabled,
      onNavigateToPermissions,
      aiCharacterEnabled,
      mainTabAvatarPresetId,
      mainTabAvatarBadgeLetter,
      aiCharacterDebugLineForMainTab,
      transparencySnapshot,
      askMode,
      strategyGuideBranches,
      strategyChecklist,
      askThreadCollapsed,
      askThreadDisplayQuestion,
      expandedTurnKey,
      modelPolicyDisclosure,
      shortcutSetupVariant,
      strategySpoilerMaskingEnabled,
      presetCarouselInject,
      onRetryLastResponse,
      onReplyFeedback,
      onReplyMicroAction,
      liveReplyFeedbackRating,
      liveReplyChipUsed,
      liveReplyChipError,
      voiceRecording,
      onMicInput,
      onOpenScreenshotBrowser,
      onTakeScreenshot,
    ]
  );
}
