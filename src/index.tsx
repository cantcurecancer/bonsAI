/**
 * Title: Plugin root
 * Purpose: Decky plugin entry — tabs, scoped CSS, settings load/save, and hook wiring into Main/Settings/Ollama.
 * Used for: definePlugin export; mounts BonsaiPluginShell and useBonsaiAskOrchestration.
 * Solves: Single composition root for QAM UI without embedding Ask logic inline.
 * Does not: Implement Ask orchestration or RPC handlers — see useBonsaiAskOrchestration and main.py.
 */
import React, { useCallback, useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { definePlugin, toaster, call, useQuickAccessVisible } from "@decky/api";
import { Navigation, Router, Tabs } from "@decky/ui";

import { PLUGIN_VERSION } from "./pluginVersion";
import { DEFAULT_LATENCY_WARNING_SECONDS, type BonsaiSettings } from "./data/bonsaiSettingsSchema";
import { toBonsaiSettingsPayload } from "./utils/settingsPayload";
import { BonsaiPluginShell } from "./components/BonsaiPluginShell";
import { BonsaiDebugOverlay } from "./components/BonsaiDebugOverlay";
import { PULL_MODEL_CATALOG } from "./data/pullModelCatalog";
import { getSteamInputLexiconEntry } from "./data/steam-input-lexicon";
import { jumpToSteamInputEntry } from "./utils/steamInputJump";
import { buildBonsaiScopeAccentInlineStyle, resolveUiAccentFromCharacterSettings } from "./data/characterUiAccent";
import { appendAppDesktopLogWithPrefs } from "./utils/appDesktopLog";
import {
  acknowledgePluginDataClearHandled,
  clearBonsaiSessionSurvival,
  consumeBonsaiSessionAfterRemount,
  finalizeSessionRestoreAfterRemount,
  getPluginDataClearedGeneration,
  markPluginDataCleared,
  peekBonsaiSessionPendingRestore,
  shouldIgnoreRestoredSettingsSnapshot,
  type BonsaiSessionSurvivalSnapshot,
} from "./utils/bonsaiSessionSurvival";
import { consumePendingFocusMainTab, setReplySurfaceVisible } from "./utils/bonsaiReplySurface";
import { clearBonsaiBrowserStorage } from "./utils/clearBonsaiBrowserStorage";
import { bonsaiDebugLog } from "./utils/bonsaiDebugIngest";
import { clearOllamaTabLocalSurvival } from "./utils/ollamaTabLocalSurvival";
import { clearSettingsTabLocalSurvival } from "./utils/settingsTabLocalSurvival";
import { shouldClearUnifiedInputForPersistenceMode } from "./utils/unifiedInputPersistenceMode";
import {
  BonsaiSvgIcon,
} from "./components/icons";
import { MODEL_POLICY_README_URL } from "./data/modelPolicy";
import {
  ASK_LABEL_COLOR_50,
  BONSAI_FOREST_GREEN,
} from "./features/unified-input/constants";
import { useUnifiedInputSurface } from "./features/unified-input/useUnifiedInputSurface";
import { PluginErrorBoundary } from "./features/plugin-shell/PluginErrorBoundary";
import { DECKY_TAB_TITLES } from "./features/plugin-shell/tabTitles";
import { loadSavedSearchQuery, persistSearchQuery } from "./features/plugin-shell/pluginStorage";
import { useOllamaConnectionState } from "./features/plugin-shell/useOllamaConnectionState";
import { useDeveloperTabPayload } from "./features/plugin-shell/tabs/useDeveloperTabPayload";
import { useAboutTabPayload } from "./features/plugin-shell/tabs/useAboutTabPayload";
import { usePermissionsTabPayload } from "./features/plugin-shell/tabs/usePermissionsTabPayload";
import { useSettingsTabPayload } from "./features/plugin-shell/tabs/useSettingsTabPayload";
import { useOllamaTabPayload } from "./features/plugin-shell/tabs/useOllamaTabPayload";
import { useMainTabPayload } from "./features/plugin-shell/tabs/useMainTabPayload";
import { useUiScaleProfile } from "./hooks/useUiScaleProfile";
import { useQamPanelHeightGuard } from "./hooks/useQamPanelHeightGuard";
import { useTabStripBodyOffset } from "./hooks/useTabStripBodyOffset";
import { UiScaleProvider } from "./context/UiScaleContext";
import { publishUiScaleScopeStyle } from "./utils/uiScaleScopeBridge";
import { normalizeUiScaleProfileId, type UiScaleProfileId } from "./data/uiScaleProfile";
import { formatDeckyRpcError, callDeckyWithTimeout } from "./utils/deckyCall";
import { SEED_KB_SOURCE_DIR } from "./data/knowledgeBaseDev";
import { usePluginSettings } from "./hooks/usePluginSettings";
import { useReplyLanguage } from "./hooks/useReplyLanguage";
import { useIntentPacks } from "./hooks/useIntentPacks";
import { useScreenshotBrowser } from "./hooks/useScreenshotBrowser";
import { useSteamSettingsSearch } from "./hooks/useSteamSettingsSearch";
import { useBonsaiPluginShell } from "./hooks/useBonsaiPluginShell";
import { usePermissionJump } from "./hooks/usePermissionJump";
import { useVoiceAskInput } from "./features/voice/useVoiceAskInput";
import { useRoutingOrderModal } from "./features/model-routing/useRoutingOrderModal";
import { useOllamaModelsHubModal } from "./features/plugin-shell/useOllamaModelsHubModal";
import { useCharacterPickerModal } from "./features/plugin-shell/useCharacterPickerModal";
import { useDesktopNoteSaveModal } from "./features/plugin-shell/useDesktopNoteSaveModal";
import { usePluginHelpModal } from "./features/plugin-shell/usePluginHelpModal";
import { useBonsaiAskOrchestration } from "./hooks/useBonsaiAskOrchestration";
import { useDisclaimerAndLocalRuntimeGates } from "./hooks/useDisclaimerAndLocalRuntimeGates";
import { useCapturedFrontendErrors } from "./hooks/useCapturedFrontendErrors";
import { getSteamSettingsUrl } from "./data/steamSettingsNavigation";
import { registerPreviewTestHooks, isDeckyPreviewRuntime } from "./preview/previewTestHooks";
import { IP_DEFAULT } from "./data/storageKeys";

type SteamUrlApi = {
  ExecuteSteamURL(url: string): void;
};

/**
 * Primary plugin shell: tabs plus Ask/settings wiring. Heavy logic lives in hooks under `src/hooks/`
 * (`usePluginSettings`, `useBackgroundGameAi`, `useDisclaimerAndLocalRuntimeGates`, `useBonsaiAskOrchestration`,
 * `useCapturedFrontendErrors`) and feature modules under `src/features/` so this file stays a composer.
 */
const Content: React.FC = () => {
  const sessionSnapshotRef = useRef<() => BonsaiSessionSurvivalSnapshot>(() => {
    return {
      currentTab: "main",
      unifiedInput: "",
      selectedIndex: -1,
      navigationMessage: "",
      selectedAttachment: null,
      isScreenshotBrowserOpen: false,
      mediaError: "",
      recentScreenshots: [],
      isLoadingRecentScreenshots: false,
      pluginHelpDismissed: false,
      ollamaIp: IP_DEFAULT,
      settingsSnapshot: {},
      ollamaResponse: "",
      ollamaContext: { app_context: "inactive", app_id: "" },
      lastExchange: null,
      askThreadCollapsed: [],
      askThreadDisplayQuestion: "",
      expandedTurnKey: "live",
      suggestedPrompts: [],
      lastTransparency: null,
      modelPolicyDisclosure: null,
      strategyGuideBranches: null,
      strategyChecklist: null,
      elapsedSeconds: null,
      lastApplied: null,
      shortcutSetupVariant: null,
      presetCarouselInject: null,
      showSlowWarning: false,
      lastRequestId: null,
      thinkingSummary: null,
    } as unknown as BonsaiSessionSurvivalSnapshot;
  });

  const {
    currentTab,
    setCurrentTab,
    characterPickerReturnTabRef,
    finalizeShowModalAndRestoreActiveTab,
    onCompleteDeckyModalClose,
    captureSessionBeforeModal,
    onTabsShowTab,
  } = useBonsaiPluginShell({
    getSessionSnapshot: () => sessionSnapshotRef.current(),
  });

  const quickAccessVisible = useQuickAccessVisible();

  useLayoutEffect(() => {
    setReplySurfaceVisible(quickAccessVisible && currentTab === "main");
  }, [quickAccessVisible, currentTab]);

  useLayoutEffect(() => {
    if (consumePendingFocusMainTab()) {
      setCurrentTab("main");
    }
  }, [setCurrentTab]);

  const pendingSessionRestoreFinalizeRef = useRef(false);
  const pluginDataClearSeenRef = useRef(getPluginDataClearedGeneration());

  // --- Unified input/search state ---
  const [unifiedInput, setUnifiedInput] = useState(() => {
    const snap = peekBonsaiSessionPendingRestore();
    if (snap?.unifiedInput != null) return snap.unifiedInput;
    return loadSavedSearchQuery();
  });
  const [selectedIndex, setSelectedIndex] = useState(() => peekBonsaiSessionPendingRestore()?.selectedIndex ?? -1);
  const [isUnifiedInputFocused, setIsUnifiedInputFocused] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState(
    () => peekBonsaiSessionPendingRestore()?.navigationMessage ?? ""
  );
  const {
    bonsaiScopeRef,
    unifiedInputHostRef,
    unifiedInputFieldLayerRef,
    unifiedInputMeasureRef,
    askBarHostRef,
    unifiedInputSurfacePx,
    usesNativeMultilineField,
    remeasureUnifiedInputSurface,
  } = useUnifiedInputSurface(currentTab, unifiedInput);

  const {
    pluginHelpDismissed,
    openPluginHelpModal,
    restorePluginHelpDismissed,
    resetPluginHelpDismissed,
  } = usePluginHelpModal({
    currentTab,
    captureSessionBeforeModal,
    finalizeShowModalAndRestoreActiveTab,
    returnTabRef: characterPickerReturnTabRef,
  });

  const attachActionHostRef = useRef<HTMLDivElement>(null);

  const {
    latencyWarningSeconds,
    requestTimeoutSeconds,
    latencyTimeoutsCustomEnabled,
    unifiedInputPersistenceMode,
    screenshotAttachmentPreset,
    desktopDebugNoteAutoSave,
    desktopAskVerboseLogging,
    inputSanitizerUserDisabled,
    capabilities,
    setCapabilities,
    aiCharacterEnabled,
    aiCharacterRandom,
    aiCharacterPresetId,
    aiCharacterCustomText,
    aiCharacterAccentIntensity,
    setAiCharacterEnabled,
    setAiCharacterRandom,
    setAiCharacterPresetId,
    setAiCharacterCustomText,
    setAiCharacterAccentIntensity,
    setLatencyWarningSeconds,
    setRequestTimeoutSeconds,
    setLatencyTimeoutsCustomEnabled,
    setUnifiedInputPersistenceMode,
    setScreenshotAttachmentPreset,
    setDesktopDebugNoteAutoSave,
    setDesktopAskVerboseLogging,
    desktopAppLogLevel,
    setDesktopAppLogLevel,
    presetChipFadeAnimationEnabled,
    presetChipAnimation,
    setPresetChipAnimation,
    setPresetChipFadeAnimationEnabled,
    askMode,
    setAskMode,
    ollamaKeepAlive,
    setOllamaKeepAlive,
    replyVerbosity,
    setReplyVerbosity,
    replyLanguage,
    setReplyLanguage,
    showDeveloperTab,
    setShowDeveloperTab,
    modelPolicyTier,
    setModelPolicyTier,
    modelPolicyNonFossUnlocked,
    setModelPolicyNonFossUnlocked,
    modelAllowHighVramFallbacks,
    setModelAllowHighVramFallbacks,
    textModelRoutingOrder,
    setTextModelRoutingOrder,
    visionModelRoutingOrder,
    setVisionModelRoutingOrder,
    ollamaLocalOnDeck,
    setOllamaLocalOnDeck,
    strategySpoilerMaskingEnabled,
    setStrategySpoilerMaskingEnabled,
    strategySpoilerAutoRevealAfterConsent,
    steamWebApiKey,
    setSteamWebApiKey,
    bonsaiTokenStreamingEnabled,
    setBonsaiTokenStreamingEnabled,
    showOnscreenDebugHud,
    devForceSessionRagChips,
    setShowOnscreenDebugHud,
    setDevForceSessionRagChips,
    tabResumeMode,
    setTabResumeMode,
    namedOllamaHosts,
    setNamedOllamaHosts,
    voiceSttModel,
    setVoiceSttModel,
    uiScaleAutoEnabled,
    setUiScaleAutoEnabled,
    uiScaleManualProfile,
    setUiScaleManualProfile,
    useLocalKnowledgeBase,
    setUseLocalKnowledgeBase,
    ragHybridRetrievalEnabled,
    setRagHybridRetrievalEnabled,
    ragCorpusPath,
    ragCorpusVersion,
    settingsLoaded,
    hydrateFromSettings,
    pauseDebouncedSettingsSave,
    syncSettingsFromDisk,
  } = usePluginSettings();

  const { effectiveLang, steamClientLanguageLabel, t: uiT } = useReplyLanguage(replyLanguage);

  const isAskingRef = useRef(false);
  const {
    screenshotBrowserHostRef,
    isScreenshotBrowserOpen,
    mediaError,
    recentScreenshots,
    isLoadingRecentScreenshots,
    isCapturingScreenshot,
    selectedAttachment,
    setSelectedAttachment,
    loadRecentScreenshots,
    onTakeScreenshot,
    onOpenScreenshotBrowser,
    onCloseScreenshotBrowser,
    onSelectRecentScreenshot,
    restoreScreenshotBrowserSnapshot,
  } = useScreenshotBrowser({
    getIsAsking: () => isAskingRef.current,
    mediaLibraryAccess: capabilities.media_library_access,
    filesystemWrite: capabilities.filesystem_write,
  });

  const [uiScaleApplyToken, setUiScaleApplyToken] = useState(0);
  const uiScale = useUiScaleProfile({
    scopeRef: bonsaiScopeRef,
    autoEnabled: uiScaleAutoEnabled,
    manualProfile: uiScaleManualProfile,
    settingsLoaded,
    applyToken: uiScaleApplyToken,
    onRemeasure: remeasureUnifiedInputSurface,
  });

  useQamPanelHeightGuard(bonsaiScopeRef);
  useTabStripBodyOffset(bonsaiScopeRef);

  const intentPacks = useIntentPacks();

  const { filteredSettings, onSettingClick } = useSteamSettingsSearch({
    unifiedInput,
    intentPackIndex: intentPacks.index,
    setSelectedIndex,
    setNavigationMessage,
  });

  const appLogPrefs = useMemo(
    () => ({
      desktopAppLogLevel,
      capabilities: { filesystem_write: capabilities.filesystem_write },
    }),
    [desktopAppLogLevel, capabilities.filesystem_write]
  );
  const [capturedErrors, setCapturedErrors] = useCapturedFrontendErrors(appLogPrefs);

  useEffect(() => {
    if (!settingsLoaded) return;
    if (currentTab !== "developer" && currentTab !== "settings") return;
    appendAppDesktopLogWithPrefs(appLogPrefs, "verbose", "ui.tab", `opened ${currentTab} tab`);
  }, [currentTab, settingsLoaded, appLogPrefs]);

  // --- Connection / host state (Ask + poll state: ``useBonsaiAskOrchestration``) ---
  const {
    ollamaIp,
    setOllamaIp,
    effectiveOllamaPcIp,
    persistOllamaIpIfRoutingToLan,
    lastConnectionStatus,
    setLastConnectionStatus,
    ollamaTabResetKey,
    resetOllamaTab,
  } = useOllamaConnectionState({ ollamaLocalOnDeck });

  const {
    ollamaResponse,
    ollamaContext,
    lastExchange,
    strategyGuideBranches,
    strategyChecklist,
    modelPolicyDisclosure,
    presetCarouselInject,
    shortcutSetupVariant,
    suggestedPrompts,
    showSlowWarning,
    setShowSlowWarning,
    elapsedSeconds,
    lastTransparency,
    thinkingSummary,
    lastRequestId,
    askThreadCollapsed,
    expandedTurnKey,
    onTurnActivate,
    askThreadDisplayQuestion,
    isAsking,
    askStopped,
    isStreamingPreview,
    isStreamSettling,
    streamDisplayText,
    lastApplied,
    clearUnifiedInput,
    onCancelAsk,
    onAskOllama,
    onRetryLastResponse,
    onReplyFeedback,
    onReplyMicroAction,
    liveReplyFeedbackRating,
    liveReplyChipUsed,
    liveReplyChipError,
    onStrategyBranchPick,
    onStrategyChecklistToggle,
    resetAskSessionSlice,
    setStrategyGuideBranches,
    reseedSuggestedPrompts,
    restoreSessionSnapshot,
  } = useBonsaiAskOrchestration({
    desktopDebugNoteAutoSave,
    filesystemWrite: capabilities.filesystem_write,
    strategySpoilerMaskingEnabled,
    askMode,
    unifiedInput,
    setUnifiedInput,
    unifiedInputPersistenceMode,
    effectiveOllamaPcIp,
    selectedAttachment,
    setSelectedAttachment,
    syncSettingsFromDisk,
    unifiedInputFieldLayerRef,
    unifiedInputHostRef,
    setSelectedIndex,
    setNavigationMessage,
    saveIp: persistOllamaIpIfRoutingToLan,
    persistSearchQuery,
    onExternalFailure: (source, message, detail) => {
      appendAppDesktopLogWithPrefs(appLogPrefs, "verbose", "external.failure", message, {
        source,
        ...detail,
      });
    },
    aiCharacterEnabled,
    aiCharacterPresetId,
    useLocalKnowledgeBase,
    settingsLoaded,
    devForceSessionRagChips,
  });

  isAskingRef.current = isAsking;

  useLayoutEffect(() => {
    if (shouldIgnoreRestoredSettingsSnapshot(pluginDataClearSeenRef.current)) {
      clearBonsaiSessionSurvival();
      return;
    }
    const survived = consumeBonsaiSessionAfterRemount();
    bonsaiDebugLog("index.tsx:consume", survived ? "restored snapshot" : "no snapshot", "H1", {
      tab: survived?.currentTab,
      inputLen: survived?.unifiedInput?.length ?? 0,
      hasExchange: !!survived?.lastExchange,
    });
    if (!survived) return;
    if (consumePendingFocusMainTab()) {
      setCurrentTab("main");
    } else if (survived.currentTab) {
      setCurrentTab(survived.currentTab);
    }
    setUnifiedInput(survived.unifiedInput);
    setSelectedIndex(survived.selectedIndex);
    setNavigationMessage(survived.navigationMessage);
    restoreScreenshotBrowserSnapshot({
      selectedAttachment: survived.selectedAttachment,
      isScreenshotBrowserOpen: survived.isScreenshotBrowserOpen,
      mediaError: survived.mediaError,
      recentScreenshots: survived.recentScreenshots,
      isLoadingRecentScreenshots: survived.isLoadingRecentScreenshots,
    });
    restorePluginHelpDismissed(survived.pluginHelpDismissed);
    setOllamaIp(survived.ollamaIp);
    hydrateFromSettings(toBonsaiSettingsPayload(survived.settingsSnapshot));
    restoreSessionSnapshot(survived);
    pendingSessionRestoreFinalizeRef.current = true;
  }, [restoreSessionSnapshot, hydrateFromSettings]);

  useEffect(() => {
    if (!pendingSessionRestoreFinalizeRef.current) return;
    pendingSessionRestoreFinalizeRef.current = false;
    finalizeSessionRestoreAfterRemount();
    bonsaiDebugLog("index.tsx:finalizeRestore", "cleared pending snapshot", "H1", {});
  }, []);

  const effectiveLatencyWarningSeconds = useMemo(
    () => (latencyTimeoutsCustomEnabled ? latencyWarningSeconds : DEFAULT_LATENCY_WARNING_SECONDS),
    [latencyTimeoutsCustomEnabled, latencyWarningSeconds]
  );

  const uiAccent = useMemo(
    () =>
      resolveUiAccentFromCharacterSettings({
        ai_character_enabled: aiCharacterEnabled,
        ai_character_random: aiCharacterRandom,
        ai_character_preset_id: aiCharacterPresetId,
        ai_character_custom_text: aiCharacterCustomText,
      }),
    [aiCharacterEnabled, aiCharacterRandom, aiCharacterPresetId, aiCharacterCustomText]
  );
  const bonsaiScopeAccentStyle = useMemo(() => buildBonsaiScopeAccentInlineStyle(uiAccent), [uiAccent]);
  const bonsaiScopeStyle = useMemo(
    () => ({ ...bonsaiScopeAccentStyle, ...uiScale.scopeStyle }),
    [bonsaiScopeAccentStyle, uiScale.scopeStyle],
  );

  useEffect(() => {
    publishUiScaleScopeStyle(bonsaiScopeStyle);
  }, [bonsaiScopeStyle]);

  useEffect(() => {
    if (!settingsLoaded) return;
    if (!showDeveloperTab && currentTab === "developer") {
      setCurrentTab("main");
      toaster.toast({ title: "Developer tab hidden", body: "Switched to Main.", duration: 2800 });
    }
  }, [showDeveloperTab, currentTab, settingsLoaded]);

  useEffect(() => {
    if (askMode !== "strategy") {
      setStrategyGuideBranches(null);
    }
  }, [askMode, setStrategyGuideBranches]);

  const { jumpToPermission, returnFromPermissionJump, permissionJumpReturnTab } = usePermissionJump({
    currentTab,
    setCurrentTab,
  });

  const goToOllamaTab = useCallback(() => {
    setCurrentTab("ollama");
  }, []);

  const settingsSnapshotForSave = useMemo(
    () => ({
      latencyWarningSeconds,
      requestTimeoutSeconds,
      latencyTimeoutsCustomEnabled,
      unifiedInputPersistenceMode,
      screenshotAttachmentPreset,
      desktopDebugNoteAutoSave,
      desktopAskVerboseLogging,
      desktopAppLogLevel,
      presetChipFadeAnimationEnabled,
      presetChipAnimation,
      inputSanitizerUserDisabled,
      capabilities,
      aiCharacterEnabled,
      aiCharacterRandom,
      aiCharacterPresetId,
      aiCharacterCustomText,
      aiCharacterAccentIntensity,
      askMode,
      ollamaKeepAlive,
      replyVerbosity,
      replyLanguage,
      showDeveloperTab,
      modelPolicyTier,
      modelPolicyNonFossUnlocked,
      modelAllowHighVramFallbacks,
      textModelRoutingOrder,
      visionModelRoutingOrder,
      ollamaLocalOnDeck,
      strategySpoilerMaskingEnabled,
      strategySpoilerAutoRevealAfterConsent,
      steamWebApiKey,
      bonsaiTokenStreamingEnabled,
      showOnscreenDebugHud,
      devForceSessionRagChips,
      tabResumeMode,
      namedOllamaHosts,
      voiceSttModel,
      uiScaleAutoEnabled,
      uiScaleManualProfile,
      useLocalKnowledgeBase,
      ragHybridRetrievalEnabled,
      ragCorpusPath,
      ragCorpusVersion,
    }),
    [
      latencyWarningSeconds,
      requestTimeoutSeconds,
      latencyTimeoutsCustomEnabled,
      unifiedInputPersistenceMode,
      screenshotAttachmentPreset,
      desktopDebugNoteAutoSave,
      desktopAskVerboseLogging,
      desktopAppLogLevel,
      presetChipFadeAnimationEnabled,
      presetChipAnimation,
      inputSanitizerUserDisabled,
      capabilities,
      aiCharacterEnabled,
      aiCharacterRandom,
      aiCharacterPresetId,
      aiCharacterCustomText,
      aiCharacterAccentIntensity,
      askMode,
      ollamaKeepAlive,
      replyVerbosity,
      replyLanguage,
      showDeveloperTab,
      modelPolicyTier,
      modelPolicyNonFossUnlocked,
      modelAllowHighVramFallbacks,
      textModelRoutingOrder,
      visionModelRoutingOrder,
      ollamaLocalOnDeck,
      strategySpoilerMaskingEnabled,
      strategySpoilerAutoRevealAfterConsent,
      steamWebApiKey,
      bonsaiTokenStreamingEnabled,
      showOnscreenDebugHud,
      devForceSessionRagChips,
      tabResumeMode,
      namedOllamaHosts,
      voiceSttModel,
      uiScaleAutoEnabled,
      uiScaleManualProfile,
      useLocalKnowledgeBase,
      ragHybridRetrievalEnabled,
      ragCorpusPath,
      ragCorpusVersion,
    ]
  );

  const onApplyUiScale = useCallback(
    async (autoEnabled: boolean, manualProfile: UiScaleProfileId) => {
      const normalized = normalizeUiScaleProfileId(manualProfile);
      setUiScaleAutoEnabled(autoEnabled);
      setUiScaleManualProfile(normalized);
      await pauseDebouncedSettingsSave();
      const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>("save_settings", [
        toBonsaiSettingsPayload(settingsSnapshotForSave, {
          ui_scale_auto_enabled: autoEnabled,
          ui_scale_manual_profile: normalized,
        }),
      ]);
      hydrateFromSettings(saved);
      setUiScaleApplyToken((t) => t + 1);
      toaster.toast({ title: "UI scale applied", body: "Plugin layout updated.", duration: 2800 });
    },
    [
      hydrateFromSettings,
      pauseDebouncedSettingsSave,
      settingsSnapshotForSave,
      setUiScaleAutoEnabled,
      setUiScaleManualProfile,
    ],
  );

  const buildSettingsPayload = useCallback(
    (patch?: Partial<BonsaiSettings>) => toBonsaiSettingsPayload(settingsSnapshotForSave, patch),
    [settingsSnapshotForSave]
  );

  sessionSnapshotRef.current = () => ({
    currentTab,
    unifiedInput,
    selectedIndex,
    navigationMessage,
    selectedAttachment,
    isScreenshotBrowserOpen,
    mediaError,
    recentScreenshots,
    isLoadingRecentScreenshots,
    pluginHelpDismissed,
    ollamaIp,
    settingsSnapshot: settingsSnapshotForSave,
    ollamaResponse,
    ollamaContext,
    lastExchange,
    askThreadCollapsed,
    askThreadDisplayQuestion,
    expandedTurnKey,
    suggestedPrompts,
    lastTransparency,
    modelPolicyDisclosure,
    strategyGuideBranches,
    strategyChecklist,
    elapsedSeconds,
    lastApplied,
    shortcutSetupVariant,
    presetCarouselInject,
    showSlowWarning,
    lastRequestId,
    thinkingSummary,
  });

  const {
    showDisclaimerModalAgain,
    ollamaLocalOnDeckPrevRef,
    localRuntimeBetaPromptIssuedRef,
  } = useDisclaimerAndLocalRuntimeGates(settingsLoaded, ollamaLocalOnDeck, {
    onBeforeDeckyModal: captureSessionBeforeModal,
    onCompleteDeckyModalClose,
  });

  useEffect(() => {
    if (!isDeckyPreviewRuntime()) return;
    registerPreviewTestHooks({
      getState: () => ({
        currentTab,
        unifiedInput,
        askMode,
        isAsking,
        ollamaResponseLen: ollamaResponse.length,
        hasLastExchange: !!lastExchange,
        capabilities,
      }),
      setGame: (title: string, appId?: string) => {
        const app = { display_name: title, appid: Number(appId) || 0 };
        (Router as { setMainRunningApp?: (a: typeof app | null) => void }).setMainRunningApp?.(app);
      },
      triggerAsk: async (text: string) => {
        setUnifiedInput(text);
        await onAskOllama(text);
      },
      attachScreenshot: (base64: string, name = "preview.png") => {
        setSelectedAttachment({
          path: name,
          name,
          source: "picker",
          preview_data_uri: base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`,
        });
      },
      getTransparencyJson: () => lastTransparency,
      // bonsAI stopped writing sysfs on 2026-07-30 and the sandbox write log was
      // removed with it, so there is nothing left to report. Kept as a stable
      // empty contract because DPS preview scenarios live outside this repo and
      // may still call it.
      getSysfsWrites: async () => [],
      setTab: (tabId: string) => setCurrentTab(tabId),
      resetDisclaimer: () => {
        try {
          window.localStorage.removeItem("bonsai:disclaimer-accepted");
        } catch {
          /* ignore */
        }
        showDisclaimerModalAgain();
      },
    });
  }, [
    currentTab,
    unifiedInput,
    askMode,
    isAsking,
    ollamaResponse,
    lastExchange,
    capabilities,
    lastTransparency,
    onAskOllama,
    setUnifiedInput,
    setSelectedAttachment,
    setCurrentTab,
    showDisclaimerModalAgain,
  ]);

  const openModelPolicyReadme = useCallback(() => {
    try {
      Navigation.NavigateToExternalWeb(MODEL_POLICY_README_URL);
    } catch {
      toaster.toast({ title: "README", body: MODEL_POLICY_README_URL, duration: 4000 });
    }
  }, []);

  const onOpenControllerSettingsForShortcut = useCallback(() => {
    try {
      const steamUrlApi = SteamClient.URL as unknown as SteamUrlApi;
      steamUrlApi.ExecuteSteamURL(getSteamSettingsUrl("Settings > Controller"));
      toaster.toast({ title: "Opening settings", body: "Controller", duration: 2000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toaster.toast({ title: "Navigation failed", body: message, duration: 3000 });
    }
  }, []);

  // --- Slow-response warning timer (suppress once token streaming begins) ---
  useEffect(() => {
    if (!isAsking) {
      setShowSlowWarning(false);
      return;
    }
    if (isStreamingPreview) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), effectiveLatencyWarningSeconds * 1000);
    return () => clearTimeout(timer);
  }, [isAsking, isStreamingPreview, effectiveLatencyWarningSeconds]);

  useEffect(() => {
    if (unifiedInputPersistenceMode === "persist_all") {
      persistSearchQuery(unifiedInput);
      return;
    }
    if (unifiedInputPersistenceMode === "persist_search_only") {
      if (filteredSettings.length > 0) {
        persistSearchQuery(unifiedInput);
      } else {
        persistSearchQuery("");
      }
      return;
    }
    persistSearchQuery("");
  }, [unifiedInput, unifiedInputPersistenceMode, filteredSettings.length]);

  const unifiedInputPersistenceModePrevRef = useRef<typeof unifiedInputPersistenceMode | null>(null);
  useEffect(() => {
    const prev = unifiedInputPersistenceModePrevRef.current;
    unifiedInputPersistenceModePrevRef.current = unifiedInputPersistenceMode;
    if (shouldClearUnifiedInputForPersistenceMode(prev, unifiedInputPersistenceMode)) {
      setUnifiedInput("");
    }
  }, [unifiedInputPersistenceMode]);


  const resetPluginSession = useCallback(() => {
    resetAskSessionSlice();
    persistSearchQuery("");
    setUnifiedInput("");
    setSelectedIndex(-1);
    setNavigationMessage("");
    setSelectedAttachment(null);
    void reseedSuggestedPrompts("random", undefined, true);
    toaster.toast({
      title: uiT("toast.sessionCleared.title"),
      body: uiT("toast.sessionCleared.body"),
      duration: 3800,
    });
  }, [resetAskSessionSlice, reseedSuggestedPrompts, uiT]);

  const onClearAllPluginData = useCallback(async () => {
    try {
      markPluginDataCleared();
      clearSettingsTabLocalSurvival();
      clearOllamaTabLocalSurvival();
      setLastConnectionStatus(null);
      resetOllamaTab();
      await pauseDebouncedSettingsSave();
      // Deliberately unwrapped: clear_plugin_data tears down local Ollama models
      // (ollama rm plus multi-GB rmtree), which can far exceed any UI deadline.
      await call("clear_plugin_data");
      clearBonsaiBrowserStorage();
      await syncSettingsFromDisk();
      acknowledgePluginDataClearHandled();
      setOllamaIp(IP_DEFAULT);
      localRuntimeBetaPromptIssuedRef.current = false;
      ollamaLocalOnDeckPrevRef.current = null;
      resetPluginHelpDismissed();
      resetPluginSession();
      await intentPacks.refresh();
      showDisclaimerModalAgain();
      toaster.toast({
        title: "Plugin data cleared",
        body: "Settings and local plugin storage were reset. Re-enter your Ollama host and permissions as needed.",
        duration: 4500,
      });
    } catch (e: unknown) {
      toaster.toast({
        title: uiT("toast.clearFailed.title"),
        body: formatDeckyRpcError(e),
        duration: 5000,
      });
    }
  }, [
    syncSettingsFromDisk,
    pauseDebouncedSettingsSave,
    resetPluginSession,
    showDisclaimerModalAgain,
    intentPacks.refresh,
    uiT,
  ]);

  const { voiceRecording, onMicInput, micPermissionDenied, dismissMicPermissionDeny } = useVoiceAskInput({
    setUnifiedInput,
    unifiedInput,
    microphoneAccess: capabilities.microphone_access,
    isAsking,
    uiT,
  });

  const showSearchClearButton = Boolean(unifiedInput.trim());

  const openDesktopNoteSaveModal = useDesktopNoteSaveModal({
    filesystemWrite: capabilities.filesystem_write,
    lastExchange,
    jumpToPermission,
    currentTab,
    finalizeShowModalAndRestoreActiveTab,
    returnTabRef: characterPickerReturnTabRef,
  });

  const openCharacterPickerModal = useCharacterPickerModal({
    aiCharacterRandom,
    aiCharacterPresetId,
    aiCharacterCustomText,
    setAiCharacterRandom,
    setAiCharacterPresetId,
    setAiCharacterCustomText,
    buildSettingsPayload,
    hydrateFromSettings,
    captureSessionBeforeModal,
    finalizeShowModalAndRestoreActiveTab,
  });

  const { openOllamaModelsHub, onApplyTier2MultimodalPolicy } = useOllamaModelsHubModal({
    modelPolicyTier,
    modelPolicyNonFossUnlocked,
    modelAllowHighVramFallbacks,
    setModelPolicyTier,
    setModelPolicyNonFossUnlocked,
    setModelAllowHighVramFallbacks,
    activeRoutingTag: modelPolicyDisclosure?.model ?? null,
    buildSettingsPayload,
    hydrateFromSettings,
    pauseDebouncedSettingsSave,
    goToOllamaTab,
    openModelPolicyReadme,
    captureSessionBeforeModal,
    finalizeShowModalAndRestoreActiveTab,
  });

  const catalogByTag = useMemo(() => {
    const m = new Map<string, (typeof PULL_MODEL_CATALOG)[number]>();
    for (const e of PULL_MODEL_CATALOG) m.set(e.tag, e);
    return m;
  }, []);

  const openRoutingOrderModal = useRoutingOrderModal({
    ollamaLocalOnDeck,
    ollamaIp,
    textModelRoutingOrder,
    visionModelRoutingOrder,
    setTextModelRoutingOrder,
    setVisionModelRoutingOrder,
    catalogByTag,
    modelPolicyTier,
    modelPolicyNonFossUnlocked,
    modelAllowHighVramFallbacks,
    setLastConnectionStatus,
    captureSessionBeforeModal,
    finalizeShowModalAndRestoreActiveTab,
    pauseDebouncedSettingsSave,
    buildSettingsPayload,
    hydrateFromSettings,
  });

  // =====================================================================
  // TAB CONTENT
  // =====================================================================

  const mainTab = useMainTabPayload({
    suggestedPrompts,
    showPluginHelpChip: !pluginHelpDismissed,
    useLocalKnowledgeBase,
    onOpenPluginHelp: openPluginHelpModal,
    presetChipFadeAnimationEnabled,
    presetChipAnimation,
    onRetryLastResponse,
    liveReplyFeedbackRating,
    onReplyFeedback,
    onReplyMicroAction,
    liveReplyChipUsed,
    liveReplyChipError,
    setUnifiedInput,
    unifiedInputHostRef: unifiedInputHostRef as React.Ref<HTMLDivElement>,
    unifiedInputFieldLayerRef: unifiedInputFieldLayerRef as React.Ref<HTMLDivElement>,
    unifiedInputMeasureRef: unifiedInputMeasureRef as React.Ref<HTMLDivElement>,
    attachActionHostRef: attachActionHostRef as React.Ref<HTMLDivElement>,
    askBarHostRef: askBarHostRef as React.Ref<HTMLDivElement>,
    screenshotBrowserHostRef: screenshotBrowserHostRef as React.Ref<HTMLDivElement>,
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
    ollamaIp: effectiveOllamaPcIp,
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
    latencyWarningSeconds: effectiveLatencyWarningSeconds,
    ollamaResponse,
    elapsedSeconds,
    lastApplied,
    ollamaContext,
    canSaveDesktopNote: Boolean(lastExchange),
    onOpenDesktopNoteSave: openDesktopNoteSaveModal,
    mediaLibraryEnabled: capabilities.media_library_access,
    gameContextReadEnabled: capabilities.media_library_access && capabilities.steam_logs_read,
    onNavigateToPermissions: jumpToPermission,
    micPermissionDenied,
    onDismissMicPermissionDeny: dismissMicPermissionDeny,
    desktopNoteSaveEnabled: capabilities.filesystem_write,
    aiCharacterEnabled,
    aiCharacterRandom,
    aiCharacterPresetId,
    aiCharacterCustomText,
    aiCharacterAccentIntensity,
    openCharacterPickerModal,
    transparencySnapshot: lastTransparency,
    onRunOriginalAsk: (text) => {
      setUnifiedInput(text);
      if (unifiedInputPersistenceMode === "persist_all") {
        persistSearchQuery(text);
      }
    },
    askMode,
    onAskModeChange: setAskMode,
    strategyGuideBranches,
    strategyChecklist,
    onStrategyChecklistToggle,
    onStrategyBranchPick,
    onPresetPreferAskMode: setAskMode,
    askThreadCollapsed,
    askThreadDisplayQuestion,
    expandedTurnKey,
    onTurnActivate,
    modelPolicyDisclosure,
    onOpenModelPolicyReadme: openModelPolicyReadme,
    shortcutSetupVariant,
    onOpenControllerSettings: onOpenControllerSettingsForShortcut,
    strategySpoilerMaskingEnabled,
    strategySpoilerAutoRevealAfterConsent,
    presetCarouselInject,
    isStreamingPreview: isStreamingPreview || isStreamSettling,
    streamDisplayText,
    askStopped,
    thinkingSummary,
    desktopAskVerboseLogging,
    lastRequestId,
    lastExchange,
  });


  const settingsTab = useSettingsTabPayload({
    screenshotAttachmentPreset,
    setScreenshotAttachmentPreset,
    unifiedInputPersistenceMode,
    setUnifiedInputPersistenceMode,
    aiCharacterEnabled,
    setAiCharacterEnabled,
    aiCharacterRandom,
    aiCharacterPresetId,
    aiCharacterCustomText,
    aiCharacterAccentIntensity,
    setAiCharacterAccentIntensity,
    showDeveloperTab,
    setShowDeveloperTab,
    strategySpoilerMaskingEnabled,
    setStrategySpoilerMaskingEnabled,
    voiceSttModel,
    setVoiceSttModel,
    microphoneAccessEnabled: capabilities.microphone_access,
    onJumpToPermission: jumpToPermission,
    uiScaleAutoEnabled,
    uiScaleManualProfile,
    appliedUiScaleProfileId: uiScale.appliedProfileId,
    onApplyUiScale,
    onOpenCharacterPicker: openCharacterPickerModal,
    onBeforeDeckyModal: captureSessionBeforeModal,
    onCompleteDeckyModalClose: finalizeShowModalAndRestoreActiveTab,
    onResetSession: resetPluginSession,
    onClearAllPluginData,
  });

  const ollamaTab = useOllamaTabPayload({
    ollamaTabResetKey,
    ollamaIp,
    onOllamaIpChange: setOllamaIp,
    ollamaLocalOnDeck,
    setOllamaLocalOnDeck,
    onLastConnectionStatus: setLastConnectionStatus,
    lastConnectionStatus,
    namedOllamaHosts,
    setNamedOllamaHosts,
    onBeforeDeckyModal: captureSessionBeforeModal,
    onCompleteDeckyModalClose: finalizeShowModalAndRestoreActiveTab,
    onOpenOllamaModelsHub: openOllamaModelsHub,
    onOpenRoutingOrderModal: openRoutingOrderModal,
    latencyWarningSeconds,
    requestTimeoutSeconds,
    latencyTimeoutsCustomEnabled,
    setLatencyTimeoutsCustomEnabled,
    setLatencyWarningSeconds,
    setRequestTimeoutSeconds,
    ollamaKeepAlive,
    setOllamaKeepAlive,
    replyVerbosity,
    setReplyVerbosity,
    modelPolicyTier,
    onApplyTier2MultimodalPolicy,
    useLocalKnowledgeBase,
    setUseLocalKnowledgeBase,
    ragCorpusVersion,
  });

  const permissionsTab = usePermissionsTabPayload({
    capabilities,
    setCapabilities,
    permissionJumpReturnTab,
    onReturnFromPermissionJump: returnFromPermissionJump,
  });

  const onSteamInputPhase1Jump = useCallback(() => {
    const entry = getSteamInputLexiconEntry("phase1_per_game_controller_config");
    if (!entry) {
      toaster.toast({ title: "Steam Input", body: "Lexicon entry missing.", duration: 3500 });
      return;
    }
    const result = jumpToSteamInputEntry(entry);
    if (result.ok) {
      toaster.toast({
        title: "Steam Input jump",
        body: `${result.confidenceLabel}: ${result.method} → ${result.detail}`,
        duration: 4000,
      });
    } else {
      const hint = entry.breadcrumb.length ? ` ${entry.breadcrumb[0]}` : "";
      toaster.toast({ title: "Steam Input jump", body: `${result.reason}${hint}`, duration: 6000 });
    }
  }, []);

  const installSeedKnowledgeBase = useCallback(async () => {
    // Deliberately unwrapped: installing a corpus copies the whole seed knowledge
    // base to disk, which can outrun any UI deadline on Deck storage.
    const out = await call<
      [{ source_dir: string }],
      { ok?: boolean; error?: string; install_path?: string; version?: string }
    >("install_rag_corpus_local", { source_dir: SEED_KB_SOURCE_DIR });
    if (!out?.ok) {
      toaster.toast({
        title: "Seed KB install failed",
        body: out?.error ?? "Could not install seed knowledge base.",
        duration: 10000,
      });
      return;
    }
    await syncSettingsFromDisk();
    toaster.toast({
      title: "Seed knowledge base installed",
      body: `${out.version ?? "seed"} → ${out.install_path ?? "~/.bonsai/rag"}`,
      duration: 6000,
    });
  }, [syncSettingsFromDisk]);

  const developerTab = useDeveloperTabPayload({
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
    filesystemWrite: capabilities.filesystem_write,
    onJumpToPermission: jumpToPermission,
    presetChipFadeAnimationEnabled,
    setPresetChipFadeAnimationEnabled,
    presetChipAnimation,
    setPresetChipAnimation,
    steamWebApiKey,
    setSteamWebApiKey,
    bonsaiTokenStreamingEnabled,
    setBonsaiTokenStreamingEnabled,
    showOnscreenDebugHud,
    setShowOnscreenDebugHud,
    devForceSessionRagChips,
    setDevForceSessionRagChips,
    ragHybridRetrievalEnabled,
    setRagHybridRetrievalEnabled,
    tabResumeMode,
    setTabResumeMode,
    installSeedKnowledgeBase,
    showDeveloperTab,
  });

  const aboutTab = useAboutTabPayload({
    replyLanguage,
    onReplyLanguageChange: setReplyLanguage,
    effectiveLang,
    steamClientLanguageLabel,
    t: uiT,
  });

  const deckyTabs = useMemo(
    () => {
      const rows: Array<{ id: string; title: React.ReactElement; content: React.ReactNode }> = [
        {
          id: "main",
          title: DECKY_TAB_TITLES.main,
          // `display: contents` rather than the panel shell the other tabs use. Main lays out
          // with `bonsai-full-bleed-row` and negative margins, and the `--tight` modifier sets
          // `overflow-x: hidden` (styles/sections/scopeBase.ts), which would clip it. A
          // contents box generates no box at all, so this is queryable with provably zero
          // layout effect — it exists only so `snapshotDom` can scope to this panel.
          content: (
            <div data-bonsai-tab-panel="main" style={{ display: "contents" }}>
              {mainTab}
            </div>
          ),
        },
        {
          id: "ollama",
          title: DECKY_TAB_TITLES.ollama,
          content: ollamaTab,
        },
        {
          id: "settings",
          title: DECKY_TAB_TITLES.settings,
          content: settingsTab,
        },
        {
          id: "permissions",
          title: DECKY_TAB_TITLES.permissions,
          content: (
            <div
              className="bonsai-tab-panel-shell bonsai-tab-panel-shell--tight bonsai-settings-section-stack"
              data-bonsai-tab-panel="permissions"
            >
              {permissionsTab}
            </div>
          ),
        },
      ];
      if (showDeveloperTab) {
        rows.push({
          id: "developer",
          title: DECKY_TAB_TITLES.developer,
          content: developerTab,
        });
      }
      rows.push({
        id: "about",
        title: DECKY_TAB_TITLES.about,
        content: (
          <div
            className="bonsai-tab-panel-shell bonsai-tab-panel-shell--tight"
            data-bonsai-tab-panel="about"
          >
            {aboutTab}
          </div>
        ),
      });
      return rows;
    },
    [showDeveloperTab, mainTab, ollamaTab, settingsTab, permissionsTab, developerTab, aboutTab]
  );

  return (
    <BonsaiPluginShell scopeRef={bonsaiScopeRef} scopeStyle={bonsaiScopeStyle}>
      <UiScaleProvider
        value={{
          profileId: uiScale.appliedProfileId,
          scopeStyle: uiScale.scopeStyle,
          generation: uiScale.generation,
          requestApply: () => setUiScaleApplyToken((t) => t + 1),
        }}
      >
        <BonsaiDebugOverlay enabled={showOnscreenDebugHud} />
        {/*
          data-bonsai-active-tab drives the persistent active-tab marker in section-1.ts.
          Measured on device 2026-08-04: SteamOS does not put `.Active` on these tab buttons, it
          uses a build-hashed class, so the marker cannot be keyed on Steam's own classes. This
          attribute is the only thing that changes on a tab switch — DECKY_TAB_TITLES stays
          referentially identical, so the strip itself does not re-render.
        */}
        <div
          key={`bonsai-tabs-gen-${uiScale.generation}`}
          className="bonsai-decky-tabs-root"
          data-bonsai-active-tab={currentTab}
        >
          <Tabs
            activeTab={currentTab}
            onShowTab={onTabsShowTab}
            tabs={deckyTabs}
            {...({ autoFocusContents: false } as Record<string, unknown>)}
          />
        </div>
      </UiScaleProvider>
    </BonsaiPluginShell>
  );
};

// Mount the content tree inside an error boundary to keep plugin recovery user-accessible.
const Root: React.FC = () => (
  <PluginErrorBoundary>
    <Content />
  </PluginErrorBoundary>
);

export default definePlugin(() => {
  return {
    name: "bonsAI",
    titleView: (
      <span
        title={`bonsAI v${PLUGIN_VERSION}`}
        style={{
          fontVariant: "small-caps",
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "rgba(236, 240, 245, 0.96)",
          WebkitTextStroke: `1.25px ${BONSAI_FOREST_GREEN}`,
          paintOrder: "stroke fill",
        }}
      >
        bonsAI
        <sub
          style={{
            fontVariant: "normal",
            fontSize: "0.46em",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: ASK_LABEL_COLOR_50,
            marginLeft: "0.38em",
            lineHeight: 1,
            verticalAlign: "baseline",
            position: "relative",
            bottom: "-0.2em",
            WebkitTextStroke: "0 transparent",
            paintOrder: "normal",
          }}
        >
          v{PLUGIN_VERSION}
        </sub>
      </span>
    ),
    content: <Root />,
    icon: (
      <span style={{ display: "inline-flex", transform: "translateX(-5px)" }}>
        <BonsaiSvgIcon size={26} />
      </span>
    ),
    onDismount() {},
  };
});
