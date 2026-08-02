/**
 * Title: Plugin root
 * Purpose: Decky plugin entry — tabs, scoped CSS, settings load/save, and hook wiring into Main/Settings/Ollama.
 * Used for: definePlugin export; mounts BonsaiPluginShell and useBonsaiAskOrchestration.
 * Solves: Single composition root for QAM UI without embedding Ask logic inline.
 * Does not: Implement Ask orchestration or RPC handlers — see useBonsaiAskOrchestration and main.py.
 */
import React, { useCallback, useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { definePlugin, toaster, call, useQuickAccessVisible } from "@decky/api";
import { Navigation, Router, showModal, Tabs } from "@decky/ui";

import { PLUGIN_VERSION } from "./pluginVersion";
import {
  DEFAULT_LATENCY_WARNING_SECONDS,
  OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP,
  normalizeAiCharacterCustomText,
  normalizeAiCharacterPresetId,
  toBonsaiSettingsPayload,
  type BonsaiSettings,
} from "./utils/settingsAndResponse";
import { AboutTab } from "./components/AboutTab";
import { BonsaiPluginShell } from "./components/BonsaiPluginShell";
import { BonsaiDebugOverlay } from "./components/BonsaiDebugOverlay";
import { CharacterPickerModal } from "./components/CharacterPickerModal";
import { DesktopNoteSaveModal } from "./components/DesktopNoteSaveModal";
import { DeveloperTab, type DeveloperConnectionStatus } from "./components/DeveloperTab";
import { MainTab } from "./components/MainTab";
import { PluginHelpModal } from "./components/PluginHelpModal";
import { OllamaModelsHubModal, type OllamaModelsHubSection } from "./components/OllamaModelsHubModal";
import { ModelRoutingOrderModal, type ModelRoutingOrderKind } from "./components/ModelRoutingOrderModal";
import { PULL_MODEL_CATALOG } from "./data/pullModelCatalog";
import { OllamaTab } from "./components/OllamaTab";
import { PermissionsTab } from "./components/PermissionsTab";
import { SettingsTab } from "./components/SettingsTab";
import { getSteamInputLexiconEntry } from "./data/steam-input-lexicon";
import { jumpToSteamInputEntry } from "./utils/steamInputJump";
import {
  formatAiCharacterSelectionLine,
  resolveMainTabAvatarBadgeLetter,
  resolveMainTabAvatarPresetId,
} from "./data/characterCatalog";
import { buildBonsaiScopeAccentInlineStyle, resolveUiAccentFromCharacterSettings } from "./data/characterUiAccent";
import { appendAppDesktopLogWithPrefs } from "./utils/appDesktopLog";
import {
  acknowledgePluginDataClearHandled,
  clearBonsaiSessionSurvival,
  consumeBonsaiSessionAfterRemount,
  finalizeSessionRestoreAfterRemount,
  getPluginDataClearedGeneration,
  markPluginDataCleared,
  patchPendingSessionSettingsSnapshot,
  peekBonsaiSessionPendingRestore,
  shouldIgnoreRestoredSettingsSnapshot,
  type BonsaiSessionSurvivalSnapshot,
} from "./utils/bonsaiSessionSurvival";
import { consumePendingFocusMainTab, setReplySurfaceVisible } from "./utils/bonsaiReplySurface";
import { clearBonsaiBrowserStorage } from "./utils/clearBonsaiBrowserStorage";
import { bonsaiDebugLog } from "./utils/bonsaiDebugIngest";
import { persistOllamaIpIfRoutingToLan as persistOllamaIpIfRoutingToLanUtil } from "./utils/persistOllamaIp";
import { clearOllamaTabLocalSurvival } from "./utils/ollamaTabLocalSurvival";
import { clearSettingsTabLocalSurvival } from "./utils/settingsTabLocalSurvival";
import { shouldClearUnifiedInputForPersistenceMode } from "./utils/unifiedInputPersistenceMode";
import {
  AboutTabTitleIcon,
  BonsaiTreeTabIcon,
  BonsaiSvgIcon,
  BugIcon,
  GearIcon,
  LockIcon,
  OllamaTabIcon,
} from "./components/icons";
import { MODEL_POLICY_README_URL, type ModelPolicyTierId } from "./data/modelPolicy";
import {
  ASK_LABEL_COLOR_50,
  BONSAI_FOREST_GREEN,
  TAB_TITLE_DEBUG_TAB_ICON_PX,
  TAB_TITLE_ICON_PX,
  TAB_TITLE_MAIN_TAB_ICON_PX,
} from "./features/unified-input/constants";
import { useUnifiedInputSurface } from "./features/unified-input/useUnifiedInputSurface";
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
import { useVoiceTranscription } from "./hooks/useVoiceTranscription";
import { useBonsaiAskOrchestration } from "./hooks/useBonsaiAskOrchestration";
import { useDisclaimerAndLocalRuntimeGates } from "./hooks/useDisclaimerAndLocalRuntimeGates";
import { useCapturedFrontendErrors } from "./hooks/useCapturedFrontendErrors";
import { getSteamSettingsUrl, isQamSetting } from "./data/steamSettingsNavigation";
import { registerPreviewTestHooks, isDeckyPreviewRuntime } from "./preview/previewTestHooks";
import {
  GITHUB_ISSUES_URL,
  IP_DEFAULT,
  IP_STORAGE_KEY,
  OLLAMA_UPSTREAM_REPO_URL,
  PLUGIN_HELP_DISMISSED_STORAGE_KEY,
  UNIFIED_INPUT_STORAGE_KEY,
} from "./data/storageKeys";

/**
 * Preserves “plugin help chip dismissed” across Decky remounting `Content` when `showModal`
 * opens/closes (same lifecycle issue as tab restore in `useBonsaiPluginShell`).
 */
let __bonsaiPluginHelpDismissed = false;

/**
 * This boundary protects the plugin UI from render-time failures so Decky can keep the panel alive.
 * It captures component errors, logs diagnostics, and shows a recoverable fallback with reset controls.
 */
class ErrorBoundary extends React.Component<any, { error: any; info?: any }> {
  /** Initialize boundary state with no captured error. */
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  /** Capture runtime render errors and persist debug details for the fallback panel. */
  componentDidCatch(error: any, info: any) {
    this.setState({ error, info });
    try {
      console.error("React render error", error, info);
    } catch (e) {}
  }

  /** Render either the fallback UI or the child tree based on current boundary state. */
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: "white" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Plugin error</div>
          <div style={{ color: "tomato", whiteSpace: "pre-wrap" }}>{String(this.state.error)}</div>
          <pre style={{ color: "gray", whiteSpace: "pre-wrap" }}>{this.state.info?.componentStack ?? ""}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

type SteamUrlApi = {
  ExecuteSteamURL(url: string): void;
};

type AppendDesktopNoteResult = {
  success: boolean;
  path?: string;
  error?: string;
};

// Load persisted unified input text based on the selected persistence mode.
function loadSavedSearchQuery(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(UNIFIED_INPUT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

// Persist or clear unified input text according to current persistence preference.
function persistSearchQuery(unifiedInputText: string): void {
  if (typeof window === "undefined") return;
  try {
    if (unifiedInputText) {
      window.localStorage.setItem(UNIFIED_INPUT_STORAGE_KEY, unifiedInputText);
    } else {
      window.localStorage.removeItem(UNIFIED_INPUT_STORAGE_KEY);
    }
  } catch {}
}

// Load saved Ollama host/IP for convenience between plugin sessions.
function loadSavedIp(): string {
  if (typeof window === "undefined") return IP_DEFAULT;
  try {
    return window.localStorage.getItem(IP_STORAGE_KEY) || IP_DEFAULT;
  } catch { return IP_DEFAULT; }
}

// Persist Ollama host/IP updates from the connection field.
function saveIp(ip: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(IP_STORAGE_KEY, ip); } catch {}
}

const GITHUB_REPO_URL = GITHUB_ISSUES_URL.replace(/\/issues$/, "");

function pluginHelpDismissedFromStorage(): boolean {
  try {
    return window.localStorage.getItem(PLUGIN_HELP_DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markPluginHelpDismissedPersist(): void {
  try {
    window.localStorage.setItem(PLUGIN_HELP_DISMISSED_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function bonsaiTabIconTitle(
  classSuffix: "main" | "ollama" | "settings" | "permissions" | "developer" | "about",
  children: React.ReactNode,
): React.ReactElement {
  return (
    <div className="bonsai-tab-title-leaf">
      <div className={`bonsai-tab-title-shell bonsai-tab-title-shell--${classSuffix}`}>
        <span className={`bonsai-tab-title-icon bonsai-tab-title-icon--${classSuffix}`}>{children}</span>
      </div>
    </div>
  );
}

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

const DECKY_TAB_TITLES = {
  main: bonsaiTabIconTitle("main", <BonsaiTreeTabIcon size={TAB_TITLE_MAIN_TAB_ICON_PX} />),
  ollama: bonsaiTabIconTitle("ollama", <OllamaTabIcon size={TAB_TITLE_ICON_PX} />),
  settings: bonsaiTabIconTitle("settings", <GearIcon size={TAB_TITLE_ICON_PX} />),
  permissions: bonsaiTabIconTitle("permissions", <LockIcon size={TAB_TITLE_ICON_PX} />),
  developer: bonsaiTabIconTitle("developer", <BugIcon size={TAB_TITLE_DEBUG_TAB_ICON_PX} />),
  about: bonsaiTabIconTitle("about", <AboutTabTitleIcon size={TAB_TITLE_ICON_PX} />),
} as const;

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
  const [lastConnectionStatus, setLastConnectionStatus] = useState<DeveloperConnectionStatus | null>(null);
  const [ollamaTabResetKey, setOllamaTabResetKey] = useState(0);

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

  // --- Connection / misc shell state (Ask + poll state: ``useBonsaiAskOrchestration``) ---
  const [ollamaIp, setOllamaIp] = useState(
    () => peekBonsaiSessionPendingRestore()?.ollamaIp ?? loadSavedIp()
  );
  const [pluginHelpDismissed, setPluginHelpDismissed] = useState(() => {
    const snap = peekBonsaiSessionPendingRestore();
    if (snap?.pluginHelpDismissed != null) {
      __bonsaiPluginHelpDismissed = snap.pluginHelpDismissed;
      return snap.pluginHelpDismissed;
    }
    if (pluginHelpDismissedFromStorage()) {
      __bonsaiPluginHelpDismissed = true;
      return true;
    }
    return __bonsaiPluginHelpDismissed;
  });
  useEffect(() => {
    __bonsaiPluginHelpDismissed = pluginHelpDismissed;
  }, [pluginHelpDismissed]);

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
    setShowOnscreenDebugHud,
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

  const [voiceRecording, setVoiceRecording] = useState(false);

  const onVoiceError = useCallback((e: unknown) => {
    setVoiceRecording(false);
    toaster.toast({
      title: uiT("toast.voiceInputError.title"),
      body: formatDeckyRpcError(e),
      duration: 5000,
    });
  }, [uiT]);

  const {
    startVoiceTranscription,
    stopVoiceTranscription,
    invalidateVoice,
  } = useVoiceTranscription(setUnifiedInput, onVoiceError);

  useEffect(() => {
    if (!capabilities.microphone_access && voiceRecording) {
      void stopVoiceTranscription();
      invalidateVoice();
      setVoiceRecording(false);
    }
  }, [capabilities.microphone_access, voiceRecording, stopVoiceTranscription, invalidateVoice]);

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
    bonsaiTokenStreamingEnabled,
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
    setPluginHelpDismissed(survived.pluginHelpDismissed);
    __bonsaiPluginHelpDismissed = survived.pluginHelpDismissed;
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

  const goToPermissionsTab = useCallback(() => {
    setCurrentTab("permissions");
  }, []);

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
      namedOllamaHosts,
      voiceSttModel,
      uiScaleAutoEnabled,
      uiScaleManualProfile,
      useLocalKnowledgeBase,
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
      namedOllamaHosts,
      voiceSttModel,
      uiScaleAutoEnabled,
      uiScaleManualProfile,
      useLocalKnowledgeBase,
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
      getSysfsWrites: async () => {
        try {
          const res = (await callDeckyWithTimeout("get_input_transparency", [])) as {
            sysfs_writes?: unknown;
          };
          return res?.sysfs_writes ?? [];
        } catch {
          return [];
        }
      },
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
      setOllamaTabResetKey((k) => k + 1);
      await pauseDebouncedSettingsSave();
      // Deliberately unwrapped: clear_plugin_data tears down local Ollama models
      // (ollama rm plus multi-GB rmtree), which can far exceed any UI deadline.
      await call("clear_plugin_data");
      clearBonsaiBrowserStorage();
      await syncSettingsFromDisk();
      acknowledgePluginDataClearHandled();
      setOllamaIp(IP_DEFAULT);
      __bonsaiPluginHelpDismissed = false;
      localRuntimeBetaPromptIssuedRef.current = false;
      ollamaLocalOnDeckPrevRef.current = null;
      setPluginHelpDismissed(false);
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

  const onMicInput = useCallback(() => {
    if (isAsking) return;
    if (voiceRecording) {
      setVoiceRecording(false);
      void stopVoiceTranscription();
      return;
    }
    if (!capabilities.microphone_access) {
      toaster.toast({
        title: "Permission required",
        body: "Enable Voice input (microphone) in the Permissions tab to use speech-to-text.",
        duration: 4500,
      });
      goToPermissionsTab();
      return;
    }
    void startVoiceTranscription(unifiedInput)
      .then(() => setVoiceRecording(true))
      .catch((e: unknown) => {
        setVoiceRecording(false);
        toaster.toast({
          title: "Voice input unavailable",
          body: e instanceof Error ? e.message : formatDeckyRpcError(e),
          duration: 5500,
        });
      });
  }, [
    isAsking,
    voiceRecording,
    capabilities.microphone_access,
    goToPermissionsTab,
    startVoiceTranscription,
    stopVoiceTranscription,
    unifiedInput,
  ]);

  const showSearchClearButton = Boolean(unifiedInput.trim());

  const openPluginHelpModal = useCallback(() => {
    captureSessionBeforeModal();
    markPluginHelpDismissedPersist();
    __bonsaiPluginHelpDismissed = true;
    setPluginHelpDismissed(true);
    characterPickerReturnTabRef.current = currentTab;
    const handle = showModal(
      <PluginHelpModal onClose={() => finalizeShowModalAndRestoreActiveTab(() => handle.Close())} />
    );
  }, [currentTab, captureSessionBeforeModal, finalizeShowModalAndRestoreActiveTab]);

  const openDesktopNoteSaveModal = useCallback(() => {
    if (!capabilities.filesystem_write) {
      toaster.toast({
        title: "Permission required",
        body: "Enable Filesystem writes in the Permissions tab to save notes to Desktop.",
        duration: 4500,
      });
      goToPermissionsTab();
      return;
    }
    if (!lastExchange) {
      return;
    }
    const ex = lastExchange;
    characterPickerReturnTabRef.current = currentTab;
    const handle = showModal(
      <DesktopNoteSaveModal
        strDescriptionPrefix={
          "This appends to a file on your Steam Deck Desktop (not the PC running Ollama).\n\n" +
          "Folder: Desktop/bonsAI_logs/\n" +
          "Existing notes are never replaced; new entries are appended with a timestamp.\n\n" +
          "Proceed only if you want this question and answer saved there."
        }
        defaultStem="bonsai-debug"
        onCancel={() => finalizeShowModalAndRestoreActiveTab(() => handle.Close())}
        onConfirm={async (stem) => {
          if (!stem) {
            toaster.toast({ title: "Note name required", body: "Enter a name for the note file.", duration: 3200 });
            return;
          }
          try {
            const result = await callDeckyWithTimeout<
              [{ stem: string; question: string; response: string }],
              AppendDesktopNoteResult
            >("append_desktop_debug_note", [{ stem, question: ex.question, response: ex.answer }]);
            if (result.success) {
              toaster.toast({ title: "Note saved", body: result.path ?? "Saved.", duration: 3800 });
              finalizeShowModalAndRestoreActiveTab(() => handle.Close());
            } else {
              toaster.toast({ title: "Save failed", body: result.error ?? "Unknown error.", duration: 5000 });
            }
          } catch (e: unknown) {
            toaster.toast({ title: "Save failed", body: formatDeckyRpcError(e), duration: 5000 });
          }
        }}
      />
    );
  }, [lastExchange, capabilities.filesystem_write, goToPermissionsTab, currentTab, finalizeShowModalAndRestoreActiveTab]);

  const openCharacterPickerModal = useCallback(() => {
    captureSessionBeforeModal();
    const handle = showModal(
      <CharacterPickerModal
        initialDraft={{
          random: aiCharacterRandom,
          presetId: aiCharacterPresetId,
          customText: aiCharacterCustomText,
        }}
        onCancel={() => {
          finalizeShowModalAndRestoreActiveTab(() => handle.Close());
        }}
        onOK={async (next) => {
          const pid = normalizeAiCharacterPresetId(next.presetId);
          const ctxt = normalizeAiCharacterCustomText(next.customText);
          setAiCharacterRandom(next.random);
          setAiCharacterPresetId(pid);
          setAiCharacterCustomText(ctxt);
          try {
            const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>(
              "save_settings",
              [
                buildSettingsPayload({
                  ai_character_random: next.random,
                  ai_character_preset_id: pid,
                  ai_character_custom_text: ctxt,
                }),
              ]
            );
            hydrateFromSettings(saved);
            finalizeShowModalAndRestoreActiveTab(() => handle.Close());
          } catch (err: unknown) {
            console.error("save_settings failed (character picker OK)", err);
            toaster.toast({
              title: "Character not saved",
              body: formatDeckyRpcError(err),
              duration: 5000,
            });
          }
        }}
      />
    );
  }, [
    currentTab,
    aiCharacterRandom,
    aiCharacterPresetId,
    aiCharacterCustomText,
    aiCharacterAccentIntensity,
    aiCharacterEnabled,
    latencyWarningSeconds,
    requestTimeoutSeconds,
    latencyTimeoutsCustomEnabled,
    unifiedInputPersistenceMode,
    screenshotAttachmentPreset,
    desktopDebugNoteAutoSave,
    desktopAskVerboseLogging,
    desktopAppLogLevel,
    presetChipFadeAnimationEnabled,
    inputSanitizerUserDisabled,
    capabilities,
    setAiCharacterRandom,
    setAiCharacterPresetId,
    setAiCharacterCustomText,
    buildSettingsPayload,
    hydrateFromSettings,
    finalizeShowModalAndRestoreActiveTab,
    askMode,
    ollamaKeepAlive,
    showDeveloperTab,
    modelPolicyTier,
    modelPolicyNonFossUnlocked,
    modelAllowHighVramFallbacks,
    ollamaLocalOnDeck,
    strategySpoilerMaskingEnabled,
  ]);

  const onCommitOllamaModelsHub = useCallback(
    async (patch: {
      modelPolicyTier: ModelPolicyTierId;
      modelPolicyNonFossUnlocked: boolean;
      modelAllowHighVramFallbacks: boolean;
    }) => {
      if (patch.modelPolicyTier === "non_foss" && !patch.modelPolicyNonFossUnlocked) {
        toaster.toast({
          title: "Unlock required",
          body: "Turn on Tier 3 unlock under Advanced before Any installed model.",
          duration: 5000,
        });
        goToOllamaTab();
        return;
      }
      setModelPolicyTier(patch.modelPolicyTier);
      setModelPolicyNonFossUnlocked(patch.modelPolicyNonFossUnlocked);
      setModelAllowHighVramFallbacks(patch.modelAllowHighVramFallbacks);
      await pauseDebouncedSettingsSave();
      const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>("save_settings", [
        buildSettingsPayload({
          model_policy_tier: patch.modelPolicyTier,
          model_policy_non_foss_unlocked: patch.modelPolicyNonFossUnlocked,
          model_allow_high_vram_fallbacks: patch.modelAllowHighVramFallbacks,
        }),
      ]);
      hydrateFromSettings(saved);
      patchPendingSessionSettingsSnapshot({
        modelPolicyTier: patch.modelPolicyTier,
        modelPolicyNonFossUnlocked: patch.modelPolicyNonFossUnlocked,
        modelAllowHighVramFallbacks: patch.modelAllowHighVramFallbacks,
      });
    },
    [buildSettingsPayload, hydrateFromSettings, setModelPolicyTier, setModelPolicyNonFossUnlocked, setModelAllowHighVramFallbacks, goToOllamaTab, pauseDebouncedSettingsSave]
  );

  const onApplyTier2MultimodalPolicy = useCallback(async () => {
    await pauseDebouncedSettingsSave();
    setModelPolicyTier("open_weight");
    const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>("save_settings", [
      buildSettingsPayload({ model_policy_tier: "open_weight" }),
    ]);
    hydrateFromSettings(saved);
    patchPendingSessionSettingsSnapshot({ modelPolicyTier: "open_weight" });
  }, [buildSettingsPayload, hydrateFromSettings, setModelPolicyTier, pauseDebouncedSettingsSave]);

  const openOllamaModelsHub = useCallback(
    (opts?: { initialSection?: OllamaModelsHubSection }) => {
      captureSessionBeforeModal();
      const handle = showModal(
        <OllamaModelsHubModal
          initialSection={opts?.initialSection}
          activeRoutingTag={modelPolicyDisclosure?.model ?? null}
          modelPolicyTier={modelPolicyTier}
          modelPolicyNonFossUnlocked={modelPolicyNonFossUnlocked}
          modelAllowHighVramFallbacks={modelAllowHighVramFallbacks}
          onCommitOllamaModelsHub={onCommitOllamaModelsHub}
          onReadModelPolicy={openModelPolicyReadme}
          onApplyTier2MultimodalPolicy={onApplyTier2MultimodalPolicy}
          onBeforeNestedDeckyModal={captureSessionBeforeModal}
          onCompleteNestedDeckyModalClose={finalizeShowModalAndRestoreActiveTab}
          onClose={() => {
            finalizeShowModalAndRestoreActiveTab(() => handle.Close());
          }}
        />
      );
    },
    [
      modelPolicyDisclosure?.model,
      modelPolicyTier,
      modelPolicyNonFossUnlocked,
      modelAllowHighVramFallbacks,
      onCommitOllamaModelsHub,
      openModelPolicyReadme,
      onApplyTier2MultimodalPolicy,
    ]
  );

  const catalogByTag = useMemo(() => {
    const m = new Map<string, (typeof PULL_MODEL_CATALOG)[number]>();
    for (const e of PULL_MODEL_CATALOG) m.set(e.tag, e);
    return m;
  }, []);

  const openRoutingOrderModal = useCallback(
    async (kind: ModelRoutingOrderKind) => {
      const target = ollamaLocalOnDeck ? OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP : ollamaIp.trim();
      if (!target) {
        toaster.toast({
          title: "No Ollama host",
          body: ollamaLocalOnDeck
            ? "Enable Run AI on this Deck or set a PC address first."
            : "Enter a PC address on the Ollama tab first.",
          duration: 5000,
        });
        return;
      }

      const loopbackLikelyProbe =
        ollamaLocalOnDeck ||
        /^\s*127\.0\.0\.1\s*(:\s*\d+)?\s*$/i.test(target) ||
        /^\s*localhost\s*(:\s*\d+)?\s*$/i.test(target);
      const testTimeoutSec = 10;
      const rpcDeadlineMs = testTimeoutSec * 1000 + (loopbackLikelyProbe ? 42000 : 3000);

      let installed: string[] = [];
      try {
        const result = await callDeckyWithTimeout<[string, number], DeveloperConnectionStatus>(
          "test_ollama_connection",
          [target, testTimeoutSec],
          rpcDeadlineMs
        );
        setLastConnectionStatus(result);
        if (result.reachable && Array.isArray(result.models)) {
          installed = result.models.filter(Boolean);
        }
      } catch (e: unknown) {
        toaster.toast({
          title: "Could not list models",
          body: formatDeckyRpcError(e),
          duration: 5000,
        });
        return;
      }

      if (installed.length === 0) {
        toaster.toast({
          title: "No installed models",
          body: "Pull a model on the Ollama tab (Browse models or Install options), then try again.",
          duration: 5000,
        });
        return;
      }

      captureSessionBeforeModal();
      const savedOrder = kind === "vision" ? visionModelRoutingOrder : textModelRoutingOrder;
      const handle = showModal(
        <ModelRoutingOrderModal
          kind={kind}
          installedTags={installed}
          catalogByTag={catalogByTag}
          modelPolicyTier={modelPolicyTier}
          modelPolicyNonFossUnlocked={modelPolicyNonFossUnlocked}
          modelAllowHighVramFallbacks={modelAllowHighVramFallbacks}
          savedOrder={savedOrder}
          onSave={async (order) => {
            if (kind === "vision") {
              setVisionModelRoutingOrder(order);
            } else {
              setTextModelRoutingOrder(order);
            }
            await pauseDebouncedSettingsSave();
            const patch =
              kind === "vision"
                ? { vision_model_routing_order: order }
                : { text_model_routing_order: order };
            const saved = await callDeckyWithTimeout<[BonsaiSettings], BonsaiSettings>(
              "save_settings",
              [buildSettingsPayload(patch)]
            );
            hydrateFromSettings(saved);
          }}
          onClose={() => {
            finalizeShowModalAndRestoreActiveTab(() => handle.Close());
          }}
        />
      );
    },
    [
      ollamaLocalOnDeck,
      ollamaIp,
      visionModelRoutingOrder,
      textModelRoutingOrder,
      catalogByTag,
      modelPolicyTier,
      modelPolicyNonFossUnlocked,
      modelAllowHighVramFallbacks,
      captureSessionBeforeModal,
      finalizeShowModalAndRestoreActiveTab,
      setVisionModelRoutingOrder,
      setTextModelRoutingOrder,
      pauseDebouncedSettingsSave,
      buildSettingsPayload,
      hydrateFromSettings,
    ]
  );

  const fullBleedRowStyle = FULL_BLEED_ROW_STYLE;
  const presetButtonSurface = PRESET_BUTTON_SURFACE;
  const mainTabAiCharacterPad = aiCharacterEnabled;
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

  // =====================================================================
  // TAB CONTENT
  // =====================================================================

  const mainTab = useMemo(
    () => (
    <MainTab
      key="bonsai-main-tab"
      fullBleedRowStyle={fullBleedRowStyle}
      presetButtonSurface={presetButtonSurface}
      suggestedPrompts={suggestedPrompts}
      showPluginHelpChip={!pluginHelpDismissed}
      onOpenPluginHelp={openPluginHelpModal}
      presetChipFadeAnimationEnabled={presetChipFadeAnimationEnabled}
      presetChipAnimation={presetChipAnimation}
      onRetryLastResponse={onRetryLastResponse}
      liveReplyFeedbackRating={liveReplyFeedbackRating}
      onReplyFeedback={onReplyFeedback}
      onReplyMicroAction={onReplyMicroAction}
      liveReplyChipUsed={liveReplyChipUsed}
      liveReplyChipError={liveReplyChipError}
      setUnifiedInput={setUnifiedInput}
      unifiedInputHostRef={unifiedInputHostRef as React.Ref<HTMLDivElement>}
      unifiedInputFieldLayerRef={unifiedInputFieldLayerRef as React.Ref<HTMLDivElement>}
      unifiedInputMeasureRef={unifiedInputMeasureRef as React.Ref<HTMLDivElement>}
      attachActionHostRef={attachActionHostRef as React.Ref<HTMLDivElement>}
      askBarHostRef={askBarHostRef as React.Ref<HTMLDivElement>}
      screenshotBrowserHostRef={screenshotBrowserHostRef as React.Ref<HTMLDivElement>}
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
      ollamaIp={effectiveOllamaPcIp}
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
      latencyWarningSeconds={effectiveLatencyWarningSeconds}
      ollamaResponse={ollamaResponse}
      elapsedSeconds={elapsedSeconds}
      lastApplied={lastApplied}
      ollamaContext={ollamaContext}
      canSaveDesktopNote={Boolean(lastExchange)}
      onOpenDesktopNoteSave={openDesktopNoteSaveModal}
      mediaLibraryEnabled={capabilities.media_library_access}
      gameContextReadEnabled={
        capabilities.media_library_access && capabilities.steam_logs_read
      }
      onNavigateToPermissions={goToPermissionsTab}
      desktopNoteSaveEnabled={capabilities.filesystem_write}
      aiCharacterPadClass={mainTabAiCharacterPad}
      aiCharacterAvatarPresetId={mainTabAvatarPresetId}
      aiCharacterAvatarBadgeLetter={mainTabAvatarBadgeLetter}
      onOpenCharacterPicker={aiCharacterEnabled ? openCharacterPickerModal : undefined}
      aiCharacterDebugLine={aiCharacterDebugLineForMainTab}
      transparencySnapshot={lastTransparency}
      onRunOriginalAsk={(text) => {
        setUnifiedInput(text);
        if (unifiedInputPersistenceMode === "persist_all") {
          persistSearchQuery(text);
        }
      }}
      askMode={askMode}
      onAskModeChange={setAskMode}
      strategyGuideBranches={strategyGuideBranches}
      strategyChecklist={strategyChecklist}
      onStrategyChecklistToggle={onStrategyChecklistToggle}
      onStrategyBranchPick={onStrategyBranchPick}
      onPresetPreferAskMode={setAskMode}
      askThreadCollapsed={askThreadCollapsed}
      askThreadDisplayQuestion={askThreadDisplayQuestion}
      expandedTurnKey={expandedTurnKey}
      onTurnActivate={onTurnActivate}
      modelPolicyDisclosure={modelPolicyDisclosure}
      onOpenModelPolicyReadme={openModelPolicyReadme}
      shortcutSetupVariant={shortcutSetupVariant}
      onOpenControllerSettings={onOpenControllerSettingsForShortcut}
      strategySpoilerMaskingEnabled={strategySpoilerMaskingEnabled}
      strategySpoilerAutoRevealAfterConsent={strategySpoilerAutoRevealAfterConsent}
      presetCarouselInject={presetCarouselInject}
      isStreamingPreview={isStreamingPreview || isStreamSettling}
      streamDisplayText={streamDisplayText}
      thinkingSummary={thinkingSummary}
      desktopAskVerboseLogging={desktopAskVerboseLogging}
      lastRequestId={lastRequestId}
      lastExchange={lastExchange}
    />
  ),
    [
      fullBleedRowStyle,
      presetButtonSurface,
      suggestedPrompts,
      pluginHelpDismissed,
      presetChipFadeAnimationEnabled,
      presetChipAnimation,
      unifiedInput,
      unifiedInputSurfacePx,
      usesNativeMultilineField,
      isUnifiedInputFocused,
      filteredSettings,
      selectedIndex,
      isAsking,
      effectiveOllamaPcIp,
      selectedAttachment,
      showSearchClearButton,
      isScreenshotBrowserOpen,
      mediaError,
      isCapturingScreenshot,
      recentScreenshots,
      isLoadingRecentScreenshots,
      navigationMessage,
      showSlowWarning,
      effectiveLatencyWarningSeconds,
      ollamaResponse,
      elapsedSeconds,
      lastApplied,
      ollamaContext,
      lastExchange,
      capabilities.media_library_access,
      capabilities.steam_logs_read,
      goToPermissionsTab,
      aiCharacterEnabled,
      mainTabAvatarPresetId,
      mainTabAvatarBadgeLetter,
      aiCharacterDebugLineForMainTab,
      lastTransparency,
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

  const settingsTab = useMemo(
    () => (
    <SettingsTab
      screenshotAttachmentPreset={screenshotAttachmentPreset}
      setScreenshotAttachmentPreset={setScreenshotAttachmentPreset}
      unifiedInputPersistenceMode={unifiedInputPersistenceMode}
      setUnifiedInputPersistenceMode={setUnifiedInputPersistenceMode}
      aiCharacterEnabled={aiCharacterEnabled}
      setAiCharacterEnabled={setAiCharacterEnabled}
      aiCharacterRandom={aiCharacterRandom}
      aiCharacterPresetId={aiCharacterPresetId}
      aiCharacterCustomText={aiCharacterCustomText}
      aiCharacterAccentIntensity={aiCharacterAccentIntensity}
      setAiCharacterAccentIntensity={setAiCharacterAccentIntensity}
      showDeveloperTab={showDeveloperTab}
      setShowDeveloperTab={setShowDeveloperTab}
      strategySpoilerMaskingEnabled={strategySpoilerMaskingEnabled}
      setStrategySpoilerMaskingEnabled={setStrategySpoilerMaskingEnabled}
      voiceSttModel={voiceSttModel}
      setVoiceSttModel={setVoiceSttModel}
      microphoneAccessEnabled={capabilities.microphone_access}
      uiScaleAutoEnabled={uiScaleAutoEnabled}
      uiScaleManualProfile={uiScaleManualProfile}
      appliedUiScaleProfileId={uiScale.appliedProfileId}
      onApplyUiScale={onApplyUiScale}
      onOpenCharacterPicker={openCharacterPickerModal}
      onBeforeDeckyModal={captureSessionBeforeModal}
      onCompleteDeckyModalClose={finalizeShowModalAndRestoreActiveTab}
      onResetSession={resetPluginSession}
      onClearAllPluginData={onClearAllPluginData}
    />
  ),
    [
      screenshotAttachmentPreset,
      unifiedInputPersistenceMode,
      aiCharacterEnabled,
      aiCharacterRandom,
      aiCharacterPresetId,
      aiCharacterCustomText,
      aiCharacterAccentIntensity,
      showDeveloperTab,
      strategySpoilerMaskingEnabled,
      voiceSttModel,
      uiScaleAutoEnabled,
      uiScaleManualProfile,
      uiScale.appliedProfileId,
      onApplyUiScale,
      capabilities.microphone_access,
      captureSessionBeforeModal,
      finalizeShowModalAndRestoreActiveTab,
      openCharacterPickerModal,
      resetPluginSession,
      onClearAllPluginData,
    ]
  );

  const ollamaTab = useMemo(
    () => (
      <OllamaTab
        key={`ollama-tab-${ollamaTabResetKey}`}
        ollamaIp={ollamaIp}
        onOllamaIpChange={setOllamaIp}
        onPersistOllamaIp={saveIp}
        ollamaLocalOnDeck={ollamaLocalOnDeck}
        setOllamaLocalOnDeck={setOllamaLocalOnDeck}
        onLastConnectionStatus={setLastConnectionStatus}
        lastConnectionStatus={lastConnectionStatus}
        namedOllamaHosts={namedOllamaHosts}
        setNamedOllamaHosts={setNamedOllamaHosts}
        onBeforeDeckyModal={captureSessionBeforeModal}
        onCompleteDeckyModalClose={finalizeShowModalAndRestoreActiveTab}
        onOpenOllamaModelsHub={openOllamaModelsHub}
        onOpenRoutingOrderModal={openRoutingOrderModal}
        latencyWarningSeconds={latencyWarningSeconds}
        requestTimeoutSeconds={requestTimeoutSeconds}
        latencyTimeoutsCustomEnabled={latencyTimeoutsCustomEnabled}
        setLatencyTimeoutsCustomEnabled={setLatencyTimeoutsCustomEnabled}
        setLatencyWarningSeconds={setLatencyWarningSeconds}
        setRequestTimeoutSeconds={setRequestTimeoutSeconds}
        ollamaKeepAlive={ollamaKeepAlive}
        setOllamaKeepAlive={setOllamaKeepAlive}
        replyVerbosity={replyVerbosity}
        setReplyVerbosity={setReplyVerbosity}
        modelPolicyTier={modelPolicyTier}
        onApplyTier2MultimodalPolicy={onApplyTier2MultimodalPolicy}
        useLocalKnowledgeBase={useLocalKnowledgeBase}
        setUseLocalKnowledgeBase={setUseLocalKnowledgeBase}
        ragCorpusVersion={ragCorpusVersion}
        pauseDebouncedSettingsSave={pauseDebouncedSettingsSave}
        syncSettingsFromDisk={syncSettingsFromDisk}
      />
    ),
    [
      ollamaIp,
      ollamaLocalOnDeck,
      ollamaTabResetKey,
      lastConnectionStatus,
      namedOllamaHosts,
      latencyWarningSeconds,
      requestTimeoutSeconds,
      latencyTimeoutsCustomEnabled,
      ollamaKeepAlive,
      replyVerbosity,
      modelPolicyTier,
      onApplyTier2MultimodalPolicy,
      useLocalKnowledgeBase,
      ragCorpusVersion,
      captureSessionBeforeModal,
      finalizeShowModalAndRestoreActiveTab,
      openOllamaModelsHub,
      openRoutingOrderModal,
      pauseDebouncedSettingsSave,
      syncSettingsFromDisk,
    ]
  );

  const permissionsTab = useMemo(
    () => (
      <PermissionsTab
        capabilities={capabilities}
        setCapabilities={setCapabilities}
      />
    ),
    [capabilities, setCapabilities]
  );

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

  const developerTab = useMemo(
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
      filesystemWrite={capabilities.filesystem_write}
      presetChipFadeAnimationEnabled={presetChipFadeAnimationEnabled}
      setPresetChipFadeAnimationEnabled={setPresetChipFadeAnimationEnabled}
      presetChipAnimation={presetChipAnimation}
      setPresetChipAnimation={setPresetChipAnimation}
      steamWebApiKey={steamWebApiKey}
      setSteamWebApiKey={setSteamWebApiKey}
      bonsaiTokenStreamingEnabled={bonsaiTokenStreamingEnabled}
      setBonsaiTokenStreamingEnabled={setBonsaiTokenStreamingEnabled}
      showOnscreenDebugHud={showOnscreenDebugHud}
      setShowOnscreenDebugHud={setShowOnscreenDebugHud}
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
      capabilities.filesystem_write,
      presetChipFadeAnimationEnabled,
      presetChipAnimation,
      steamWebApiKey,
      bonsaiTokenStreamingEnabled,
      showOnscreenDebugHud,
      installSeedKnowledgeBase,
      showDeveloperTab,
    ]
  );

  const aboutTab = useMemo(
    () => (
      <AboutTab
        githubRepoUrl={GITHUB_REPO_URL}
        ollamaRepoUrl={OLLAMA_UPSTREAM_REPO_URL}
        githubIssuesUrl={GITHUB_ISSUES_URL}
        replyLanguage={replyLanguage}
        onReplyLanguageChange={setReplyLanguage}
        effectiveLang={effectiveLang}
        steamClientLanguageLabel={steamClientLanguageLabel}
        t={uiT}
      />
    ),
    [
      replyLanguage,
      setReplyLanguage,
      effectiveLang,
      steamClientLanguageLabel,
      uiT,
    ]
  );

  const deckyTabs = useMemo(
    () => {
      const rows: Array<{ id: string; title: React.ReactElement; content: React.ReactNode }> = [
        {
          id: "main",
          title: DECKY_TAB_TITLES.main,
          content: mainTab,
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
            <div className="bonsai-tab-panel-shell bonsai-tab-panel-shell--tight bonsai-settings-section-stack">
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
        content: <div className="bonsai-tab-panel-shell bonsai-tab-panel-shell--tight">{aboutTab}</div>,
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
        <div key={`bonsai-tabs-gen-${uiScale.generation}`} className="bonsai-decky-tabs-root">
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
  <ErrorBoundary>
    <Content />
  </ErrorBoundary>
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
