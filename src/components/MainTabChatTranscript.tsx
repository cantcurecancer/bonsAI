import React, { useEffect, useRef, useState } from "react";
import { PanelSectionRow, Button, Focusable } from "@decky/ui";
import {
  BONSAI_CHAT_AI_BUBBLE_MAX_FRAC,
} from "../features/unified-input/constants";
import {
  invokeAnswerBubbleMoveDown,
  invokeAnswerBubbleMoveUp,
} from "../utils/answerBubbleNavRegistry";
import { focusAnswerBubbleAfterHeader } from "../utils/answerBubbleNavigation";
import {
  isDownNavigationEvent,
  isUpNavigationEvent,
} from "../utils/focusNavigation";
import { formatAppliedTuningBannerText } from "../utils/settingsAndResponse";
import type { ModelPolicyDisclosurePayload } from "../data/modelPolicy";
import { StrategyChecklistPanel } from "./StrategyChecklistPanel";
import { isPendingPlaceholderResponse } from "../utils/askThinkingPhases";
import { BonsaiChatSecondaryButton } from "./BonsaiChatSecondaryButton";
import { buildReplyActionsElement } from "../utils/buildReplyActionsElement";
import { buildAnswerBubbleElement } from "../utils/buildAnswerBubbleElement";
import { buildTurnHeaderElement } from "../utils/buildTurnHeaderElement";
import { buildCollapsedTurnTitle } from "../utils/chatTurnTitle";
import { ContextChipLadder } from "./ContextChipLadder";
import { SessionContextStrip } from "./SessionContextStrip";
import { chipsFromSnapshot } from "../utils/contextChipsFromSnapshot";
import type {
  AppliedResult,
  AskThreadCollapsedTurn,
  AskThreadExpandedTurnKey,
  OllamaContextUi,
  StrategyGuideBranchesPayload,
  StrategyChecklistState,
} from "../types/bonsaiUi";
import { ThinkingSpinnerIcon } from "./icons";
import type { TransparencySnapshot } from "../utils/inputTransparency";
import { useStreamScrollPin } from "../hooks/useStreamScrollPin";
import type { AskModeId } from "../data/askMode";
import type { LastExchangeSnapshot } from "../types/backgroundAsk";
import type { ReplyMicroActionId } from "../data/replyMicroActions";

const BONSAI_CHAT_AI_MAX_WIDTH_CSS = `min(${Math.round(BONSAI_CHAT_AI_BUBBLE_MAX_FRAC * 100)}%, 100%)`;

export type MainTabChatTranscriptProps = {
  fullBleedRowStyle: React.CSSProperties;
  isAsking: boolean;
  selectedAttachment: import("../types/bonsaiUi").AskAttachment | null;
  ollamaContext: OllamaContextUi;
  unifiedInput: string;
  showSlowWarning: boolean;
  latencyWarningSeconds: number;
  ollamaResponse: string;
  elapsedSeconds: number | null;
  lastApplied: AppliedResult | null;
  canSaveDesktopNote: boolean;
  onOpenDesktopNoteSave: () => void;
  desktopNoteSaveEnabled?: boolean;
  transparencySnapshot?: TransparencySnapshot | null;
  onRunOriginalAsk?: (rawQuestion: string) => void;
  strategyGuideBranches?: StrategyGuideBranchesPayload | null;
  onStrategyBranchPick?: (opt: { id: string; label: string }) => void;
  strategyChecklist?: StrategyChecklistState | null;
  onStrategyChecklistToggle?: (itemId: string, checked: boolean) => void;
  askThreadCollapsed?: AskThreadCollapsedTurn[];
  askThreadDisplayQuestion?: string;
  expandedTurnKey?: AskThreadExpandedTurnKey;
  onTurnActivate?: (key: string | "live") => void;
  modelPolicyDisclosure?: ModelPolicyDisclosurePayload | null;
  onOpenModelPolicyReadme?: () => void;
  shortcutSetupVariant?: "deck" | "stadia" | null;
  onOpenControllerSettings?: () => void;
  strategySpoilerMaskingEnabled?: boolean;
  isStreamingPreview?: boolean;
  streamDisplayText?: string;
  thinkingSummary?: string | null;
  desktopAskVerboseLogging?: boolean;
  lastRequestId?: number | null;
  lastExchange?: LastExchangeSnapshot | null;
  onRetryLastResponse?: () => void;
  liveReplyFeedbackRating?: "up" | "down" | null;
  onReplyFeedback?: (rating: "up" | "down") => void;
  onReplyMicroAction?: (chipId: ReplyMicroActionId) => void;
  liveReplyChipUsed?: boolean;
  liveReplyChipError?: string | null;
  askMode: AskModeId;
};

export function MainTabChatTranscript(props: MainTabChatTranscriptProps) {
  const {
    fullBleedRowStyle,
    isAsking,
    selectedAttachment,
    ollamaContext,
    unifiedInput,
    showSlowWarning,
    latencyWarningSeconds,
    ollamaResponse,
    elapsedSeconds,
    lastApplied,
    canSaveDesktopNote,
    onOpenDesktopNoteSave,
    desktopNoteSaveEnabled = true,
    transparencySnapshot = null,
    strategyGuideBranches = null,
    onStrategyBranchPick,
    strategyChecklist = null,
    onStrategyChecklistToggle,
    askThreadCollapsed = [],
    askThreadDisplayQuestion = "",
    expandedTurnKey = "live",
    onTurnActivate,
    shortcutSetupVariant = null,
    onOpenControllerSettings,
    strategySpoilerMaskingEnabled = true,
    isStreamingPreview = false,
    streamDisplayText = "",
    thinkingSummary = null,
    desktopAskVerboseLogging = false,
    lastExchange = null,
    onRetryLastResponse,
    liveReplyFeedbackRating = null,
    onReplyFeedback,
    onReplyMicroAction,
    liveReplyChipUsed = false,
    liveReplyChipError = null,
    askMode,
  } = props;

  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [sessionHighlightTurnId, setSessionHighlightTurnId] = useState<string | null>(null);
  const [transparencyDetailsOpen, setTransparencyDetailsOpen] = useState(false);

  useEffect(() => {
    setDiagnosticsOpen(false);
    setSessionHighlightTurnId(null);
    setTransparencyDetailsOpen(false);
  }, [transparencySnapshot?.raw_question, transparencySnapshot?.final_response]);

  const noActiveGameContext =
    ollamaContext?.app_context !== "active" || !ollamaContext?.app_id?.trim();

  const onToggleTransparencyDetails = () => {
    setTransparencyDetailsOpen((open) => {
      const next = !open;
      setSessionHighlightTurnId(next ? "live" : null);
      return next;
    });
  };

  const liveQuestion = askThreadDisplayQuestion.trim();
  const liveResponseBody = isStreamingPreview ? streamDisplayText : ollamaResponse;
  const showLiveResponse =
    Boolean(liveResponseBody.trim()) &&
    !(isAsking && !isStreamingPreview && isPendingPlaceholderResponse(liveResponseBody));
  const showLiveTurn = Boolean(liveQuestion) || isAsking || showLiveResponse;
  const appliedTuningBannerText = formatAppliedTuningBannerText(lastApplied);

  const chatMainColumnRef = useRef<HTMLDivElement | null>(null);
  useStreamScrollPin(chatMainColumnRef, streamDisplayText, isStreamingPreview);

  useEffect(() => {
    if (!expandedTurnKey) return;
    window.requestAnimationFrame(() => {
      const header = document.querySelector(
        `[data-bonsai-turn-id="${expandedTurnKey}"]`
      ) as HTMLElement | null;
      header?.scrollIntoView?.({ block: "nearest", behavior: "auto" });
    });
  }, [expandedTurnKey]);

  useEffect(() => {
    const col = chatMainColumnRef.current;
    if (!col) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (!col.contains(document.activeElement)) return;
      const active = document.activeElement as HTMLElement | null;
      const onAnswer = Boolean(active?.closest(".bonsai-chat-ai-bubble"));
      const inHeader = Boolean(active?.closest(".bonsai-chat-turn-row-header"));
      if (isDownNavigationEvent(ev)) {
        if (inHeader) {
          const turnId = active
            ?.closest(".bonsai-chat-turn-row-header")
            ?.getAttribute("data-bonsai-turn-id");
          const handled = focusAnswerBubbleAfterHeader(
            active?.closest(".bonsai-chat-turn-row-header") as HTMLElement | null,
            turnId ?? undefined
          );
          if (handled) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          return;
        }
        if (!onAnswer) return;
        const handled = invokeAnswerBubbleMoveDown();
        if (handled) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      } else if (isUpNavigationEvent(ev)) {
        if (!onAnswer) return;
        const handled = invokeAnswerBubbleMoveUp();
        if (handled) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      }
    };
    col.addEventListener("keydown", onKeyDown, true);
    return () => col.removeEventListener("keydown", onKeyDown, true);
  }, [askThreadCollapsed.length, expandedTurnKey]);

  const renderAnswerBubble = (body: string, streaming: boolean, answerKey: string) =>
    buildAnswerBubbleElement({
      body,
      streaming,
      spoilerMaskingEnabled: strategySpoilerMaskingEnabled,
      maxWidthCss: BONSAI_CHAT_AI_MAX_WIDTH_CSS,
      answerKey,
    });

  return (
    <>
{(askThreadCollapsed.length > 0 || showLiveTurn) && (
  <PanelSectionRow>
    <div
      ref={chatMainColumnRef}
      className="bonsai-chat-main-column"
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div className="bonsai-chat-transcript">
        {askThreadCollapsed.map((turn) => (
          <Focusable
            key={turn.id}
            flow-children="vertical"
            className="bonsai-chat-turn-slot"
          >
            {buildTurnHeaderElement({
              turnId: turn.id,
              title: buildCollapsedTurnTitle(turn.question),
              expanded: expandedTurnKey === turn.id,
              onActivate: () => onTurnActivate?.(turn.id),
            })}
            {expandedTurnKey === turn.id ? (
              <>
                {renderAnswerBubble(turn.answer, false, turn.id)}
                {turn.transparency && chipsFromSnapshot(turn.transparency).length > 0 ? (
                  <Focusable
                    style={{ maxWidth: BONSAI_CHAT_AI_MAX_WIDTH_CSS, marginTop: 8 }}
                    onActivate={() => setSessionHighlightTurnId(turn.id)}
                    onButtonDown={() => {
                      setSessionHighlightTurnId(turn.id);
                      return true;
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSessionHighlightTurnId(turn.id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#7dd3fc",
                        fontSize: 11,
                        textDecoration: "underline",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      Context used · view in session context ↓
                    </button>
                  </Focusable>
                ) : null}
              </>
            ) : null}
          </Focusable>
        ))}
        {showLiveTurn ? (
          <Focusable key="live" flow-children="vertical" className="bonsai-chat-turn-slot">
            {buildTurnHeaderElement({
              turnId: "live",
              variant: "live",
              title: buildCollapsedTurnTitle(liveQuestion) || "…",
              expanded: expandedTurnKey === "live",
              isStreaming: isStreamingPreview,
              onActivate: () => onTurnActivate?.("live"),
            })}
            {expandedTurnKey === "live" && isAsking && thinkingSummary ? (
              <div
                className="bonsai-chat-status-line bonsai-chat-thinking-line"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#9fb7d5",
                  fontSize: 12,
                  lineHeight: 1.35,
                  fontStyle: "italic",
                  marginBottom: 8,
                }}
              >
                <ThinkingSpinnerIcon size={14} className="bonsai-thinking-spinner" />
                {thinkingSummary}
              </div>
            ) : null}
            {expandedTurnKey === "live" && showLiveResponse
              ? renderAnswerBubble(liveResponseBody, isStreamingPreview, "live")
              : null}
            {expandedTurnKey === "live" &&
            !isAsking &&
            (lastExchange?.answer?.trim() || onRetryLastResponse)
              ? buildReplyActionsElement({
                  replyKey: "live",
                  rating: liveReplyFeedbackRating,
                  onRate: (rating) => {
                    onReplyFeedback?.(rating);
                  },
                  showFeedback: Boolean(lastExchange?.answer?.trim()),
                  onRetry: onRetryLastResponse ?? undefined,
                  transparencyOpen: transparencyDetailsOpen,
                  onToggleTransparency:
                    transparencySnapshot && chipsFromSnapshot(transparencySnapshot).length > 0
                      ? onToggleTransparencyDetails
                      : undefined,
                  chipsDisabled: false,
                  chipUsed: liveReplyChipUsed,
                  chipError: liveReplyChipError,
                  onChip: onReplyMicroAction,
                  askInFlight: isAsking,
                })
              : null}
            {expandedTurnKey === "live" &&
            !isAsking &&
            transparencySnapshot &&
            chipsFromSnapshot(transparencySnapshot).length > 0 ? (
              <div style={{ maxWidth: BONSAI_CHAT_AI_MAX_WIDTH_CSS }}>
                <ContextChipLadder snapshot={transparencySnapshot} collapsedHint />
              </div>
            ) : null}
            {expandedTurnKey === "live" && shortcutSetupVariant && onOpenControllerSettings ? (
              <div
                style={{
                  marginTop: 10,
                  maxWidth: BONSAI_CHAT_AI_MAX_WIDTH_CSS,
                }}
              >
                <Button onClick={onOpenControllerSettings}>Open Controller settings</Button>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "rgba(200, 215, 230, 0.85)",
                    lineHeight: 1.4,
                  }}
                >
                  {shortcutSetupVariant === "deck"
                    ? "Then: Guide Button Chord Layout → your chord. Full macro steps: docs (§5 bonsai shortcut setup)."
                    : "Pick a spare button on your Stadia layout, then Guide Button Chord. Full steps: docs (§5)."}
                </div>
              </div>
            ) : null}
          </Focusable>
        ) : null}
      </div>
    </div>
  </PanelSectionRow>
)}
{!isAsking && !selectedAttachment && noActiveGameContext && unifiedInput.trim() ? (
  <PanelSectionRow>
    <div
      className="bonsai-full-bleed-row"
      style={{
        ...fullBleedRowStyle,
        fontSize: 10,
        color: "#8fa8c4",
        lineHeight: 1.35,
        fontStyle: "italic",
      }}
    >
      No game detected — capture & attach a screenshot or name the game for sharper answers.
    </div>
  </PanelSectionRow>
) : null}
{isAsking && showSlowWarning && !isStreamingPreview && (
  <PanelSectionRow>
    <div className="bonsai-chat-status-line" style={{ color: "#f2cf84", fontSize: 12, padding: "6px 0", lineHeight: 1.35 }}>
      Slow (&gt;{latencyWarningSeconds}s): ensure <strong>Ollama</strong> uses your <strong>GPU</strong>, not{" "}
      <strong>CPU</strong>.
    </div>
  </PanelSectionRow>
)}
{strategyGuideBranches &&
  strategyGuideBranches.options.length > 0 &&
  !isAsking &&
  expandedTurnKey === "live" &&
  onStrategyBranchPick && (
  <PanelSectionRow>
    <div
      className="bonsai-glass-panel bonsai-strategy-branch-picker"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 72,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid rgba(150, 187, 223, 0.45)",
        background: "linear-gradient(180deg, rgba(64, 93, 124, 0.42) 0%, rgba(48, 71, 95, 0.42) 100%)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 12, color: "#dce8f4", fontWeight: 600 }}>
        {strategyGuideBranches.question}
      </div>
      {strategyGuideBranches.options.map((opt, idx) => (
        <Button
          key={`sg-branch-${opt.id}-${idx}`}
          onClick={() => onStrategyBranchPick(opt)}
          style={{
            width: "100%",
            minHeight: 36,
            fontSize: 12,
            fontWeight: 600,
            color: "#e8eef4",
            justifyContent: "flex-start",
            textAlign: "left",
            borderRadius: 4,
            border: "1px solid rgba(150, 187, 223, 0.35)",
            background: "rgba(36, 52, 70, 0.75)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {`${String.fromCharCode(65 + idx)}. ${opt.label}`}
        </Button>
      ))}
    </div>
  </PanelSectionRow>
)}
{strategyChecklist &&
  strategyChecklist.items.length > 0 &&
  !isAsking &&
  expandedTurnKey === "live" &&
  askMode === "strategy" &&
  onStrategyChecklistToggle && (
  <PanelSectionRow>
    <StrategyChecklistPanel checklist={strategyChecklist} onToggle={onStrategyChecklistToggle} />
  </PanelSectionRow>
)}
{!isAsking && elapsedSeconds != null && elapsedSeconds > latencyWarningSeconds && (
  <PanelSectionRow>
    <div style={{ color: "#f2cf84", fontSize: 12, lineHeight: 1.35 }}>
      {elapsedSeconds}s (&gt;{latencyWarningSeconds}s): prefer <strong>GPU</strong> for <strong>Ollama</strong>, not{" "}
      <strong>CPU</strong>.
    </div>
  </PanelSectionRow>
)}
{appliedTuningBannerText && (
  <PanelSectionRow>
    <div style={{ color: "#f2cf84", fontSize: 12, lineHeight: 1.35 }}>{appliedTuningBannerText}</div>
  </PanelSectionRow>
)}
{canSaveDesktopNote && (
  <PanelSectionRow>
    <Button
      onClick={() => onOpenDesktopNoteSave()}
      style={{
        width: "100%",
        minHeight: 38,
        border: "1px solid rgba(150, 187, 223, 0.45)",
        background: "rgba(64, 93, 124, 0.35)",
        color: "#dce8f4",
        opacity: desktopNoteSaveEnabled ? 1 : 0.45,
      }}
    >
      Save chat to Desktop
    </Button>
  </PanelSectionRow>
)}
{desktopAskVerboseLogging && transparencySnapshot?.ask_diagnostics ? (
  <PanelSectionRow>
    <Focusable style={{ width: "100%" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#b8c9dc", marginBottom: 6 }}>
        Ask diagnostics
      </div>
      <BonsaiChatSecondaryButton
        onClick={() => setDiagnosticsOpen((o) => !o)}
        aria-expanded={diagnosticsOpen}
        aria-label={diagnosticsOpen ? "Hide diagnostics" : "Show diagnostics"}
      >
        {diagnosticsOpen ? "Hide diagnostics" : "Show diagnostics"}
      </BonsaiChatSecondaryButton>
      {diagnosticsOpen && (
        <pre
          style={{
            fontSize: 10,
            lineHeight: 1.35,
            color: "#dce8f4",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: 8,
            background: "rgba(0,0,0,0.22)",
            borderRadius: 4,
          }}
        >
          {JSON.stringify(transparencySnapshot.ask_diagnostics, null, 2)}
        </pre>
      )}
    </Focusable>
  </PanelSectionRow>
) : null}
<PanelSectionRow>
  <SessionContextStrip
    liveTurn={
      transparencySnapshot && chipsFromSnapshot(transparencySnapshot).length > 0
        ? {
            id: "live",
            label: (askThreadDisplayQuestion || lastExchange?.question || "Latest Ask").trim().slice(0, 48),
            snapshot: transparencySnapshot,
          }
        : null
    }
    archivedTurns={askThreadCollapsed}
    highlightTurnId={sessionHighlightTurnId ?? (transparencyDetailsOpen ? "live" : null)}
    onHighlightClear={() => setSessionHighlightTurnId(null)}
  />
</PanelSectionRow>
{ollamaContext && (
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
      {ollamaContext.app_context === "active" && ollamaContext.app_id
        ? `Context: active game AppID ${ollamaContext.app_id}`
        : "Context: no active game detected"}
    </div>
  </PanelSectionRow>
)}
    </>
  );
}
