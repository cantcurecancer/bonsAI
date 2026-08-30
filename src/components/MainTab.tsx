/**
 * Title: Main tab shell
 * Purpose: Compose preset row, unified Ask bar, screenshot browser, and chat transcript on the Main tab.
 * Used for: index.tsx Main tab panel — receives orchestration props from useBonsaiAskOrchestration.
 * Solves: Keeps Main-tab layout thin; Ask logic stays in hooks and child components.
 * Does not: Submit Asks, poll RPC, or own focus graphs — see MainTabUnifiedAskBar and MainTabChatTranscript.
 */
import React, { useRef, useState } from "react";
import { PanelSection, PanelSectionRow, Button } from "@decky/ui";
import type { PresetPrompt } from "../data/presets";
import type {
  AppliedResult,
  AskAttachment,
  AskThreadCollapsedTurn,
  OllamaContextUi,
  ScreenshotItem,
  StrategyGuideBranchesPayload,
  StrategyChecklistState,
} from "../types/bonsaiUi";
import type { TransparencySnapshot } from "../utils/inputTransparency";
import type { AskModeId } from "../data/askMode";
import type { ModelPolicyDisclosurePayload } from "../data/modelPolicy";
import type { AskThreadExpandedTurnKey } from "../types/bonsaiUi";
import type { LastExchangeSnapshot } from "../types/backgroundAsk";
import type { ReplyMicroActionId } from "../data/replyMicroActions";
import { MainTabPresetRow } from "./MainTabPresetRow";
import { MainTabUnifiedAskBar } from "./MainTabUnifiedAskBar";
import { MainTabScreenshotBrowser } from "./MainTabScreenshotBrowser";
import { MainTabChatTranscript } from "./MainTabChatTranscript";
import { PermissionDenyAction } from "./PermissionDenyAction";
import { ChatSlotRow } from "../features/chat-slots/ChatSlotRow";
import type { ChatSlotSummary } from "../utils/chatSlotsApi";
import type { BonsaiCapabilityKey } from "../utils/permissionDeepLink";

export type MainTabProps = {
  fullBleedRowStyle: React.CSSProperties;
  presetButtonSurface: React.CSSProperties;
  suggestedPrompts: PresetPrompt[];
  showPluginHelpChip: boolean;
  useLocalKnowledgeBase?: boolean;
  onOpenPluginHelp: () => void;
  presetChipFadeAnimationEnabled?: boolean;
  presetChipAnimation?: "fade" | "carousel" | "static" | "decode";
  onRetryLastResponse?: () => void;
  liveReplyFeedbackRating?: "up" | "down" | null;
  onReplyFeedback?: (rating: "up" | "down") => void;
  onReplyMicroAction?: (chipId: ReplyMicroActionId) => void;
  liveReplyChipUsed?: boolean;
  liveReplyChipError?: string | null;
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  unifiedInputHostRef: React.Ref<HTMLDivElement>;
  unifiedInputFieldLayerRef: React.Ref<HTMLDivElement>;
  unifiedInputMeasureRef: React.Ref<HTMLDivElement>;
  attachActionHostRef: React.Ref<HTMLDivElement>;
  askBarHostRef: React.Ref<HTMLDivElement>;
  screenshotBrowserHostRef: React.Ref<HTMLDivElement>;
  unifiedInputSurfacePx: number;
  unifiedInput: string;
  usesNativeMultilineField: boolean;
  setIsUnifiedInputFocused: (v: boolean) => void;
  isUnifiedInputFocused: boolean;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  filteredSettings: string[];
  selectedIndex: number;
  onSettingClick: (settingPath: string, index?: number) => void;
  isAsking: boolean;
  ollamaIp: string;
  onAskOllama: (overrideQuestion?: string, opts?: { threadQuestionDisplay?: string }) => void | Promise<void>;
  onOpenScreenshotBrowser: () => void | Promise<void>;
  onTakeScreenshot: () => void | Promise<void>;
  onCancelAsk: () => void;
  onMicInput: () => void;
  voiceRecording?: boolean;
  selectedAttachment: AskAttachment | null;
  setSelectedAttachment: React.Dispatch<React.SetStateAction<AskAttachment | null>>;
  clearUnifiedInput: () => void;
  showSearchClearButton: boolean;
  isScreenshotBrowserOpen: boolean;
  onCloseScreenshotBrowser: () => void;
  loadRecentScreenshots: (limit?: number) => Promise<void>;
  mediaError: string;
  isCapturingScreenshot?: boolean;
  recentScreenshots: ScreenshotItem[];
  isLoadingRecentScreenshots: boolean;
  onSelectRecentScreenshot: (item: ScreenshotItem) => void;
  navigationMessage: string;
  isQamSetting: (settingPath: string) => boolean;
  showSlowWarning: boolean;
  latencyWarningSeconds: number;
  ollamaResponse: string;
  elapsedSeconds: number | null;
  lastApplied: AppliedResult | null;
  ollamaContext: OllamaContextUi;
  canSaveDesktopNote: boolean;
  onOpenDesktopNoteSave: () => void;
  mediaLibraryEnabled?: boolean;
  desktopNoteSaveEnabled?: boolean;
  aiCharacterPadClass?: boolean;
  aiCharacterAvatarPresetId?: string | null;
  aiCharacterAvatarBadgeLetter?: string | null;
  onOpenCharacterPicker?: () => void;
  aiCharacterDebugLine?: string | null;
  transparencySnapshot?: TransparencySnapshot | null;
  onRunOriginalAsk?: (rawQuestion: string) => void;
  askMode: AskModeId;
  onAskModeChange: (mode: AskModeId) => void;
  strategyGuideBranches?: StrategyGuideBranchesPayload | null;
  onStrategyBranchPick?: (opt: { id: string; label: string }) => void;
  strategyChecklist?: StrategyChecklistState | null;
  onStrategyChecklistToggle?: (itemId: string, checked: boolean) => void;
  onPresetPreferAskMode?: (mode: AskModeId) => void;
  askThreadCollapsed?: AskThreadCollapsedTurn[];
  askThreadDisplayQuestion?: string;
  expandedTurnKey?: AskThreadExpandedTurnKey;
  onTurnActivate?: (key: string | "live") => void;
  modelPolicyDisclosure?: ModelPolicyDisclosurePayload | null;
  onOpenModelPolicyReadme?: () => void;
  shortcutSetupVariant?: "deck" | "stadia" | null;
  onOpenControllerSettings?: () => void;
  strategySpoilerMaskingEnabled?: boolean;
  strategySpoilerAutoRevealAfterConsent?: boolean;
  presetCarouselInject?: { text: string } | null;
  isStreamingPreview?: boolean;
  streamDisplayText?: string;
  /** Stop was pressed on this turn: show the Stopped notice beside whatever text was kept. */
  askStopped?: boolean;
  /** A pending Ask belongs to another chat slot: the ask bar shows busy, the transcript does not. */
  isForeignPendingAsk?: boolean;
  thinkingSummary?: string | null;
  desktopAskVerboseLogging?: boolean;
  lastRequestId?: number | null;
  lastExchange?: LastExchangeSnapshot | null;
  gameContextReadEnabled?: boolean;
  onNavigateToPermissions?: (capability: BonsaiCapabilityKey) => void;
  micPermissionDenied?: boolean;
  onDismissMicPermissionDeny?: () => void;
  chatSlotSummaries?: ChatSlotSummary[];
  activeChatSlotId?: string | null;
  onChatSlotCreate?: () => Promise<unknown>;
  onChatSlotSelect?: (slotId: string | null) => Promise<void>;
  onChatSlotRename?: (slotId: string, label: string) => Promise<boolean>;
  onChatSlotDelete?: (slotId: string) => Promise<boolean>;
  onBeforeNestedDeckyModal?: () => void;
  onCompleteNestedDeckyModalClose?: (close: () => void) => void;
  /** Slot the backend is generating for, or null. Drives the hollow cyan ring in the slot row. */
  generatingSlotId?: string | null;
  /** Slots that finished an answer while the user was elsewhere. Drives the solid green dot. */
  unreadSlotIds?: ReadonlySet<string>;
};

export function MainTab(props: MainTabProps) {
  const presetCarouselHostRef = useRef<HTMLDivElement | null>(null);
  const [focusUnifiedTextField, setFocusUnifiedTextField] = useState(() => () => false);
  const [slotRowAtCreate, setSlotRowAtCreate] = useState(false);

  return (
    <>
      <PanelSection>
        {props.onChatSlotCreate && props.onChatSlotSelect && props.onChatSlotRename && props.onChatSlotDelete ? (
          <PanelSectionRow>
            <ChatSlotRow
              summaries={props.chatSlotSummaries ?? []}
              activeSlotId={props.activeChatSlotId ?? null}
              onCreateSlot={props.onChatSlotCreate}
              onSelectSlot={props.onChatSlotSelect}
              onRenameSlot={props.onChatSlotRename}
              onDeleteSlot={props.onChatSlotDelete}
              onBeforeNestedDeckyModal={props.onBeforeNestedDeckyModal}
              onCompleteNestedDeckyModalClose={props.onCompleteNestedDeckyModalClose}
              onCreatePositionChange={setSlotRowAtCreate}
              generatingSlotId={props.generatingSlotId}
              unreadSlotIds={props.unreadSlotIds}
            />
          </PanelSectionRow>
        ) : null}
        <MainTabChatTranscript {...props} showEmptySlotPreview={slotRowAtCreate} />
        <PanelSectionRow>
          <MainTabPresetRow
            suggestedPrompts={props.suggestedPrompts}
            showPluginHelpChip={props.showPluginHelpChip}
            useLocalKnowledgeBase={props.useLocalKnowledgeBase}
            onOpenPluginHelp={props.onOpenPluginHelp}
            presetChipFadeAnimationEnabled={props.presetChipFadeAnimationEnabled}
            presetChipAnimation={props.presetChipAnimation}
            setUnifiedInput={props.setUnifiedInput}
            onPresetPreferAskMode={props.onPresetPreferAskMode}
            presetCarouselInject={props.presetCarouselInject}
            isAsking={props.isAsking}
            focusUnifiedTextField={focusUnifiedTextField}
            presetCarouselHostRef={presetCarouselHostRef}
          />
        </PanelSectionRow>

        <MainTabUnifiedAskBar
          {...props}
          presetCarouselHostRef={presetCarouselHostRef}
          onFocusHandlersReady={({ focusUnifiedTextField: fn }) => {
            setFocusUnifiedTextField(() => fn);
          }}
        />

        {props.micPermissionDenied && props.onNavigateToPermissions ? (
          <PanelSectionRow>
            <div className="bonsai-full-bleed-row" style={props.fullBleedRowStyle}>
              <PermissionDenyAction
                capability="microphone_access"
                onJump={props.onNavigateToPermissions}
                compact
              />
              {props.onDismissMicPermissionDeny ? (
                <Button
                  onClick={props.onDismissMicPermissionDeny}
                  style={{ marginTop: 6, fontSize: 11, padding: "4px 10px", minHeight: 34 }}
                >
                  Dismiss
                </Button>
              ) : null}
            </div>
          </PanelSectionRow>
        ) : null}

        {props.isScreenshotBrowserOpen && (
          <PanelSectionRow>
            <MainTabScreenshotBrowser
              fullBleedRowStyle={props.fullBleedRowStyle}
              presetButtonSurface={props.presetButtonSurface}
              screenshotBrowserHostRef={props.screenshotBrowserHostRef}
              onCloseScreenshotBrowser={props.onCloseScreenshotBrowser}
              loadRecentScreenshots={props.loadRecentScreenshots}
              mediaError={props.mediaError}
              mediaLibraryEnabled={props.mediaLibraryEnabled}
              recentScreenshots={props.recentScreenshots}
              isLoadingRecentScreenshots={props.isLoadingRecentScreenshots}
              onSelectRecentScreenshot={props.onSelectRecentScreenshot}
              setUnifiedInput={props.setUnifiedInput}
              onNavigateToPermissions={props.onNavigateToPermissions}
            />
          </PanelSectionRow>
        )}

        {props.navigationMessage && (
          <PanelSectionRow>
            <div style={{ color: "#81c784", fontSize: 13 }}>{props.navigationMessage}</div>
          </PanelSectionRow>
        )}
        {props.ollamaContext && (
          <PanelSectionRow>
            <div
              className="bonsai-context-footnote"
              style={{
                fontSize: 10,
                color: "#8fa8c4",
                lineHeight: 1.35,
                fontStyle: "italic",
              }}
            >
              {props.ollamaContext.app_context === "active" && props.ollamaContext.app_id
                ? `Context: active game AppID ${props.ollamaContext.app_id}`
                : "Context: no active game detected"}
            </div>
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
}
