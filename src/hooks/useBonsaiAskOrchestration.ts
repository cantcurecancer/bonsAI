/**
 * Title: Ask orchestration hook
 * Purpose: Own Main-tab Ask lifecycle — submit, background poll bridge, thread/archive, stream reveal, session restore.
 * Used for: index.tsx wires this into MainTab (onAskOllama, transcript state, reply actions).
 * Solves: One orchestration owner between UI and Decky RPC; pairs with useBackgroundGameAi polling.
 * Does not: Render Ask UI, define RPC handlers, or run Ollama — see MainTab* and game_ai_request.
 * Caution: Reordering hooks risks stale poll callbacks after unmount.
 */
import { useCallback, useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { toaster } from "@decky/api";
import { Router } from "@decky/ui";

import type { AskAttachment } from "../types/bonsaiUi";
import { type AskModeId, type UnifiedInputPersistenceMode } from "../data/bonsaiSettingsSchema";
import { buildResponseText } from "../utils/appliedTuningText";
import { detectPromptCategory, getContextualPresets, getRandomPresets, type PresetPrompt } from "../data/presets";
import { composePresetSeedsWithSessionRag } from "../features/preset-carousel/composePresetSeedsWithSessionRag";
import type { SessionRagChipCandidate } from "../features/preset-carousel/sessionRagComposer";
import {
  CUSTOM_RESOLUTION_INPUT_PREFIX,
  isStrategyCustomResolutionBranch,
  STRATEGY_FOLLOWUP_PREFIX,
} from "../data/strategyGuideFollowup";
import { normalizeStrategyGuideBranches } from "../utils/strategyGuideBranches";
import {
  mergeStrategyChecklistState,
  normalizeStrategyChecklist,
  strategyChecklistToAskPayload,
} from "../utils/strategyChecklist";
import {
  clearStrategyChecklistSession,
  scheduleStrategyChecklistSessionSave,
} from "../utils/strategyChecklistPersistence";
import { callDeckyWithTimeout, DECKY_RPC_TIMEOUT_MS, formatDeckyRpcError } from "../utils/deckyCall";
import { useBackgroundGameAi } from "./useBackgroundGameAi";
import type {
  AppendDesktopChatEventPayload,
  AppendDesktopNoteResult,
  AskAttachmentSnapshot,
  BackgroundRequestStatus,
  BackgroundStartResponse,
  LastExchangeSnapshot,
  PresetCarouselInjectPayload,
  ReplyFollowUpPending,
} from "../types/backgroundAsk";
import type { ModelPolicyDisclosurePayload } from "../data/modelPolicy";
import type {
  OllamaContextUi,
  AppliedResult,
  StrategyGuideBranchesPayload,
  StrategyChecklistState,
  AskThreadCollapsedTurn,
  AskThreadExpandedTurnKey,
} from "../types/bonsaiUi";
import { hasResponseAutosaved, markResponseAutosaved } from "../utils/desktopChatAutosave";
import { questionBypassesOllamaPcIpRequirement } from "../utils/localOnlyAskCommands";
import { normalizePresetCarouselInject } from "../utils/presetCarouselInject";
import type { InputTransparencyRpcResult, TransparencySnapshot } from "../utils/inputTransparency";
import { composeThinkingBlurb, sanitizeThinkingSummary } from "../utils/composeThinkingBlurb";
import { isPendingPlaceholderResponse } from "../utils/askThinkingPhases";
import { useSmoothStreamReveal } from "./useSmoothStreamReveal";
import {
  peekBonsaiSessionPendingRestore,
  type BonsaiSessionSurvivalSnapshot,
} from "../utils/bonsaiSessionSurvival";
import {
  composeChipAutofillPrefix,
  replyMicroActionById,
  type ReplyMicroActionId,
} from "../data/replyMicroActions";
import { startAskCompletionWatch, stopAskCompletionWatch } from "../utils/bonsaiAskCompletionWatch";
import { fetchSessionRagChipCandidates } from "../utils/sessionRagChipCandidates";
import { useStrategyChecklistSession } from "./useStrategyChecklistSession";

export type { AskThreadExpandedTurnKey } from "../types/bonsaiUi";

function initialExpandedTurnKeyFromSurvival(): AskThreadExpandedTurnKey {
  const peek = peekBonsaiSessionPendingRestore();
  if (!peek) return "live";
  if (peek.expandedTurnKey !== undefined) {
    return peek.expandedTurnKey;
  }
  const legacyIdx = peek.askThreadViewIndex;
  if (legacyIdx != null && legacyIdx >= 0 && legacyIdx < peek.askThreadCollapsed.length) {
    return peek.askThreadCollapsed[legacyIdx]?.id ?? "live";
  }
  return "live";
}

/** Maps RPC poll payloads into Main-tab AI presentation state (pending vs terminal branches differ sharply). */
export type UseBonsaiAskOrchestrationArgs = {
  desktopDebugNoteAutoSave: boolean;
  filesystemWrite: boolean;
  strategySpoilerMaskingEnabled: boolean;
  askMode: AskModeId;
  unifiedInput: string;
  setUnifiedInput: Dispatch<SetStateAction<string>>;
  unifiedInputPersistenceMode: UnifiedInputPersistenceMode;
  effectiveOllamaPcIp: string;
  selectedAttachment: AskAttachment | null;
  setSelectedAttachment: Dispatch<SetStateAction<AskAttachment | null>>;
  /** Reload settings from disk after server-side persistence (e.g. sanitizer keywords). */
  syncSettingsFromDisk: () => Promise<unknown>;
  unifiedInputFieldLayerRef: RefObject<HTMLDivElement | null>;
  unifiedInputHostRef: RefObject<HTMLDivElement | null>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  setNavigationMessage: Dispatch<SetStateAction<string>>;
  saveIp: (ip: string) => void;
  persistSearchQuery: (unifiedInputText: string) => void;
  /** When app log level is verbose, copy external/RPC failures into Desktop bonsAI_logs. */
  onExternalFailure?: (source: string, message: string, detail?: Record<string, unknown>) => void;
  aiCharacterEnabled?: boolean;
  aiCharacterPresetId?: string | null;
  useLocalKnowledgeBase?: boolean;
  bonsaiTokenStreamingEnabled?: boolean;
};

export function useBonsaiAskOrchestration(a: UseBonsaiAskOrchestrationArgs) {
  const survivalPeek = peekBonsaiSessionPendingRestore();

  // --- Strategy checklist session (per-game disk sync) ---
  const {
    strategyChecklist,
    setStrategyChecklist,
    strategyChecklistRef,
    hydrateStrategyChecklistFromDisk,
    trackedRunningAppId,
  } = useStrategyChecklistSession(a.askMode);

  // --- Presentation state (survival restore on mount) ---
  const [ollamaResponse, setOllamaResponse] = useState(() => survivalPeek?.ollamaResponse ?? "");
  const [ollamaContext, setOllamaContext] = useState<OllamaContextUi>(
    () => survivalPeek?.ollamaContext ?? null
  );
  const [lastExchange, setLastExchange] = useState<LastExchangeSnapshot | null>(
    () => survivalPeek?.lastExchange ?? null
  );
  const [strategyGuideBranches, setStrategyGuideBranches] = useState<StrategyGuideBranchesPayload | null>(
    () => survivalPeek?.strategyGuideBranches ?? null
  );

  const [modelPolicyDisclosure, setModelPolicyDisclosure] = useState<ModelPolicyDisclosurePayload | null>(
    () => survivalPeek?.modelPolicyDisclosure ?? null
  );
  const [presetCarouselInject, setPresetCarouselInject] = useState<PresetCarouselInjectPayload | null>(
    () => survivalPeek?.presetCarouselInject ?? null
  );
  const [shortcutSetupVariant, setShortcutSetupVariant] = useState<NonNullable<
    BackgroundRequestStatus["shortcut_setup"]
  > | null>(() => survivalPeek?.shortcutSetupVariant ?? null);
  const lastStrategyAskQuestionRef = useRef<string>("");
  const pendingReplyFollowUpRef = useRef<ReplyFollowUpPending | null>(null);
  const lastAskContextRef = useRef<{
    attachments: AskAttachmentSnapshot[];
    askMode: AskModeId;
    rawQuestion: string;
  }>({ attachments: [], askMode: "speed", rawQuestion: "" });

  const [liveReplyFeedbackRating, setLiveReplyFeedbackRating] = useState<"up" | "down" | null>(null);
  const [liveReplyChipUsed, setLiveReplyChipUsed] = useState(false);
  const [liveReplyChipError, setLiveReplyChipError] = useState<string | null>(null);

  useEffect(() => {
    setLiveReplyFeedbackRating(null);
    setLiveReplyChipUsed(false);
    setLiveReplyChipError(null);
  }, [lastExchange?.question, lastExchange?.answer]);

  // --- Ask thread archive refs ---
  const pendingArchiveTurnRef = useRef<{
    question: string;
    answer: string;
    transparency?: TransparencySnapshot | null;
  } | null>(null);
  const pendingThreadQuestionDisplayRef = useRef<string | null>(null);
  /** Last request_id whose completion already re-seeded suggested prompts (reseed is randomized). */
  const promptsReseededForRequestRef = useRef<number | null>(null);
  const lastFlushedExchangeQuestionRef = useRef<string>("");
  const [askThreadCollapsed, setAskThreadCollapsed] = useState<AskThreadCollapsedTurn[]>(
    () => survivalPeek?.askThreadCollapsed ?? []
  );
  const askThreadCollapsedRef = useRef(askThreadCollapsed);
  useEffect(() => {
    askThreadCollapsedRef.current = askThreadCollapsed;
  }, [askThreadCollapsed]);
  const [expandedTurnKey, setExpandedTurnKey] = useState<AskThreadExpandedTurnKey>(
    () => initialExpandedTurnKeyFromSurvival()
  );
  const [askThreadDisplayQuestion, setAskThreadDisplayQuestion] = useState(
    () => survivalPeek?.askThreadDisplayQuestion ?? ""
  );
  const [isAsking, setIsAsking] = useState(false);

  // --- Running game context (Ollama app_id chip) ---
  const syncOllamaContextFromRunningApp = useCallback(() => {
    const appId =
      trackedRunningAppId.trim() ||
      (Router.MainRunningApp?.appid?.toString() ?? "").trim();
    const next: NonNullable<OllamaContextUi> = {
      app_id: appId,
      app_context: appId ? "active" : "none",
    };
    setOllamaContext((prev) => {
      if (prev?.app_id === next.app_id && prev?.app_context === next.app_context) {
        return prev;
      }
      return next;
    });
  }, [trackedRunningAppId]);

  /** Keep Main-tab game context in sync with Steam before/after Asks (not only mid-Ask). */
  useEffect(() => {
    if (isAsking) return;
    syncOllamaContextFromRunningApp();
  }, [trackedRunningAppId, isAsking, syncOllamaContextFromRunningApp]);

  // --- Preset carousel + session RAG chips ---
  const [lastApplied, setLastApplied] = useState<AppliedResult | null>(
    () => survivalPeek?.lastApplied ?? null
  );
  const [suggestedPrompts, setSuggestedPrompts] = useState<PresetPrompt[]>(
    () => survivalPeek?.suggestedPrompts ?? getRandomPresets(3)
  );
  const ragCandidatesCacheRef = useRef<{ appId: string; candidates: SessionRagChipCandidate[] }>({
    appId: "",
    candidates: [],
  });
  const prevAppIdForPresetReseedRef = useRef<string | undefined>(undefined);
  const coldMountPresetReseedDoneRef = useRef(!!survivalPeek?.suggestedPrompts?.length);

  const loadSessionRagCandidates = useCallback(
    async (
      appId: string,
      appName: string,
      forceRefresh = false,
    ): Promise<SessionRagChipCandidate[]> => {
      if (!a.useLocalKnowledgeBase) {
        ragCandidatesCacheRef.current = { appId, candidates: [] };
        return [];
      }
      if (
        !forceRefresh &&
        ragCandidatesCacheRef.current.appId === appId &&
        ragCandidatesCacheRef.current.candidates.length > 0
      ) {
        return ragCandidatesCacheRef.current.candidates;
      }
      const candidates = await fetchSessionRagChipCandidates({
        appId,
        appName,
      });
      ragCandidatesCacheRef.current = { appId, candidates };
      return candidates;
    },
    [a.useLocalKnowledgeBase],
  );

  const applyComposedSuggestedPrompts = useCallback(
    (staticSeeds: PresetPrompt[], candidates: SessionRagChipCandidate[]) => {
      setSuggestedPrompts(
        composePresetSeedsWithSessionRag({
          staticSeeds,
          ragCandidates: candidates,
        }),
      );
    },
    [],
  );

  const reseedSuggestedPrompts = useCallback(
    async (mode: "random" | "contextual", category?: string, forceRefresh = false) => {
      const appId = Router.MainRunningApp?.appid?.toString() ?? "";
      const appName = Router.MainRunningApp?.display_name ?? "";
      const staticSeeds =
        mode === "contextual" && category
          ? getContextualPresets(category, 3)
          : getRandomPresets(3);
      if (!a.useLocalKnowledgeBase) {
        setSuggestedPrompts(staticSeeds);
        return;
      }
      const candidates = await loadSessionRagCandidates(appId, appName, forceRefresh);
      applyComposedSuggestedPrompts(staticSeeds, candidates);
    },
    [a.useLocalKnowledgeBase, applyComposedSuggestedPrompts, loadSessionRagCandidates],
  );

  useEffect(() => {
    if (coldMountPresetReseedDoneRef.current) {
      return;
    }
    coldMountPresetReseedDoneRef.current = true;
    void reseedSuggestedPrompts("random");
  }, [reseedSuggestedPrompts]);

  useEffect(() => {
    const prev = prevAppIdForPresetReseedRef.current;
    prevAppIdForPresetReseedRef.current = trackedRunningAppId;
    if (prev === undefined) {
      return;
    }
    if (prev === trackedRunningAppId) {
      return;
    }
    void reseedSuggestedPrompts("random");
  }, [reseedSuggestedPrompts, trackedRunningAppId]);

  // --- Stream reveal + slow-warning timers ---
  const [showSlowWarning, setShowSlowWarning] = useState(() => survivalPeek?.showSlowWarning ?? false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(
    () => survivalPeek?.elapsedSeconds ?? null
  );
  const [lastTransparency, setLastTransparency] = useState<TransparencySnapshot | null>(
    () => survivalPeek?.lastTransparency ?? null
  );
  const [thinkingSummary, setThinkingSummary] = useState<string | null>(
    () => survivalPeek?.thinkingSummary ?? null
  );
  const [lastRequestId, setLastRequestId] = useState<number | null>(
    () => survivalPeek?.lastRequestId ?? null
  );
  const [isStreamingPreview, setIsStreamingPreview] = useState(false);
  const [isStreamSettling, setIsStreamSettling] = useState(false);

  const streamRevealActive = isStreamingPreview || isStreamSettling;
  const streamPreviewActiveRef = useRef(false);
  const tokenStreamingEnabledRef = useRef(a.bonsaiTokenStreamingEnabled === true);
  tokenStreamingEnabledRef.current = a.bonsaiTokenStreamingEnabled === true;
  useEffect(() => {
    streamPreviewActiveRef.current = streamRevealActive;
  }, [streamRevealActive]);

  useEffect(() => {
    if (!isStreamSettling) return;
    const id = requestAnimationFrame(() => {
      setIsStreamSettling(false);
      setIsStreamingPreview(false);
      setThinkingSummary(null);
    });
    return () => cancelAnimationFrame(id);
  }, [isStreamSettling]);

  const streamDisplayText = useSmoothStreamReveal({
    targetText: ollamaResponse,
    enabled: streamRevealActive,
    done: !isAsking && !isStreamSettling,
  });

  const desktopAutoSavePrefsRef = useRef({
    autoSave: a.desktopDebugNoteAutoSave,
    fsWrite: a.filesystemWrite,
  });
  useEffect(() => {
    desktopAutoSavePrefsRef.current = {
      autoSave: a.desktopDebugNoteAutoSave,
      fsWrite: a.filesystemWrite,
    };
  }, [a.desktopDebugNoteAutoSave, a.filesystemWrite]);

  useEffect(() => {
    if (!lastExchange?.question?.trim()) return;
    const qn = lastExchange.question.trim();
    if (lastFlushedExchangeQuestionRef.current === qn) return;
    pendingArchiveTurnRef.current = { question: lastExchange.question, answer: lastExchange.answer };
  }, [lastExchange]);

  // --- Input transparency (Show details chip) ---
  const refreshInputTransparency = useCallback(async () => {
    try {
      const r = await callDeckyWithTimeout<[], InputTransparencyRpcResult>(
        "get_input_transparency",
        [],
        DECKY_RPC_TIMEOUT_MS,
      );
      if (r.available && "snapshot" in r) {
        setLastTransparency(r.snapshot);
        if (pendingArchiveTurnRef.current) {
          pendingArchiveTurnRef.current = {
            ...pendingArchiveTurnRef.current,
            transparency: r.snapshot,
          };
        }
      } else {
        setLastTransparency(null);
      }
    } catch {
      setLastTransparency(null);
    }
  }, []);

  // --- Poll bridge: map get_background_game_ai_status → UI state ---
  const applyBackgroundStatusToUi = useCallback(
    (status: BackgroundRequestStatus, fallbackQuestion: string = "") => {
      const appId = status.app_id ?? "";
      const appContext = status.app_context === "active" ? "active" : "none";

      if (status.status === "pending") {
        setOllamaContext({ app_id: appId, app_context: appContext });
        setIsAsking(true);
        const pendingQuestion = (status.question || fallbackQuestion || "").trim();
        const runningName = Router.MainRunningApp?.display_name ?? "";
        const rawThinking =
          typeof status.thinking_summary === "string" && status.thinking_summary.trim()
            ? status.thinking_summary.trim()
            : pendingQuestion
              ? composeThinkingBlurb(pendingQuestion, {
                  appName: runningName,
                  attachmentCount: a.selectedAttachment ? 1 : 0,
                  askMode: a.askMode,
                  requestId: typeof status.request_id === "number" ? status.request_id : 0,
                  characterEnabled: a.aiCharacterEnabled === true,
                  characterPresetId: a.aiCharacterPresetId ?? null,
                })
              : composeThinkingBlurb("your question", { requestId: status.request_id ?? 0 });
        const thinking = sanitizeThinkingSummary(rawThinking);
        setThinkingSummary(thinking);
        const partialRaw =
          typeof status.partial_response === "string" ? status.partial_response : "";
        const streamingActive = status.streaming === true;
        if (streamingActive || partialRaw.trim()) {
          setOllamaResponse(partialRaw);
          setIsStreamingPreview(streamingActive);
          setIsStreamSettling(false);
        } else {
          const raw = status.response?.trim() ? status.response : "";
          setOllamaResponse(isPendingPlaceholderResponse(raw) ? "" : raw);
          setIsStreamingPreview(false);
        }
        setLastApplied(null);
        setElapsedSeconds(null);
        setStrategyGuideBranches(null);
        setModelPolicyDisclosure(null);
        setPresetCarouselInject(null);
        return;
      }

      if (status.status === "cancelled") {
        setThinkingSummary(null);
        const partialKeep =
          typeof status.partial_response === "string" && status.partial_response.trim()
            ? status.partial_response.trim()
            : "";
        const cancelledBody =
          partialKeep && !isPendingPlaceholderResponse(partialKeep)
            ? partialKeep
            : status.response?.trim()
              ? status.response.trim()
              : "Stopped.";
        setIsStreamSettling(false);
        setIsStreamingPreview(false);
        setOllamaContext({ app_id: appId, app_context: appContext });
        setIsAsking(false);
        setShortcutSetupVariant(null);
        setOllamaResponse(cancelledBody);
        setLastApplied(null);
        setElapsedSeconds(Number.isFinite(status.elapsed_seconds) ? status.elapsed_seconds : null);
        setLastExchange(null);
        setStrategyGuideBranches(null);
        setModelPolicyDisclosure(null);
        setPresetCarouselInject(null);
        pendingArchiveTurnRef.current = null;
        pendingThreadQuestionDisplayRef.current = null;
        void refreshInputTransparency();
        return;
      }

      if (status.status === "completed" || status.status === "failed") {
        const applied = status.applied ?? null;
        const terminalText = buildResponseText(status.response ?? "No response text.", applied);
        setOllamaContext({ app_id: appId, app_context: appContext });
        setIsAsking(false);
        setShortcutSetupVariant(
          status.status === "completed" && status.success ? status.shortcut_setup ?? null : null,
        );
        setOllamaResponse(terminalText);
        setLastApplied(applied);
        setElapsedSeconds(Number.isFinite(status.elapsed_seconds) ? status.elapsed_seconds : null);

        if (streamPreviewActiveRef.current) {
          // T3: snap smooth reveal to full text in stream bubble, then swap to terminal layout (may change later).
          setIsStreamSettling(true);
        } else {
          setThinkingSummary(null);
          setIsStreamingPreview(false);
          setIsStreamSettling(false);
        }

        setLastRequestId(typeof status.request_id === "number" ? status.request_id : null);
        if (status.status === "completed" && status.success) {
          const q = (status.question || fallbackQuestion || "").trim();
          const answer = buildResponseText(status.response ?? "No response text.", applied);
          const disc = status.model_policy_disclosure;
          setModelPolicyDisclosure(
            disc && typeof disc === "object" && typeof (disc as ModelPolicyDisclosurePayload).model === "string"
              ? (disc as ModelPolicyDisclosurePayload)
              : null,
          );
          setPresetCarouselInject(normalizePresetCarouselInject(status.preset_carousel_inject));
          if (q) {
            const category = detectPromptCategory(q);
            /*
             * Re-seed suggested prompts at most once per completed request: the same terminal
             * status can be applied more than once (restore + poll), and getContextualPresets
             * is randomized — repeated calls churned seedsKey and made the carousel twitch.
             */
            const reseedRid = typeof status.request_id === "number" ? status.request_id : null;
            if (reseedRid === null || promptsReseededForRequestRef.current !== reseedRid) {
              promptsReseededForRequestRef.current = reseedRid;
              void reseedSuggestedPrompts("contextual", category, true);
            }
            const displayQ = (pendingThreadQuestionDisplayRef.current?.trim() || q).trim();
            pendingThreadQuestionDisplayRef.current = null;
            setLastExchange({
              question: displayQ,
              answer,
              originalQuestion: q,
              model:
                disc && typeof disc === "object" && typeof (disc as ModelPolicyDisclosurePayload).model === "string"
                  ? (disc as ModelPolicyDisclosurePayload).model
                  : null,
              attachments: lastAskContextRef.current.attachments,
              spoilerConsentEffective: status.strategy_spoiler_consent_effective ?? false,
              askMode: lastAskContextRef.current.askMode,
            });
            lastStrategyAskQuestionRef.current = q;
            setStrategyGuideBranches(normalizeStrategyGuideBranches(status.strategy_guide_branches));
            const checklistPayload = normalizeStrategyChecklist(status.strategy_checklist);
            if (checklistPayload && a.askMode === "strategy") {
              const appId = status.app_id ?? "";
              const merged = mergeStrategyChecklistState(strategyChecklistRef.current, checklistPayload, {
                appId,
                appName: Router.MainRunningApp?.display_name ?? "",
              });
              setStrategyChecklist(merged);
              scheduleStrategyChecklistSessionSave(merged);
            }

            const { autoSave, fsWrite } = desktopAutoSavePrefsRef.current;
            const rid = status.request_id;
            if (autoSave && fsWrite && rid != null && typeof rid === "number" && !hasResponseAutosaved(rid)) {
              void callDeckyWithTimeout<[AppendDesktopChatEventPayload], AppendDesktopNoteResult>(
                "append_desktop_chat_event",
                [{ event: "response", response_text: answer, question: q }],
                DECKY_RPC_TIMEOUT_MS,
              )
                .then((result) => {
                  if (result.success) markResponseAutosaved(rid);
                })
                .catch(() => {});
            }
          } else {
            setLastExchange(null);
            setStrategyGuideBranches(null);
            pendingArchiveTurnRef.current = null;
            pendingThreadQuestionDisplayRef.current = null;
          }
        } else {
          setLastExchange(null);
          setStrategyGuideBranches(null);
          setModelPolicyDisclosure(null);
          setPresetCarouselInject(null);
          pendingArchiveTurnRef.current = null;
          pendingThreadQuestionDisplayRef.current = null;
        }
      void refreshInputTransparency();
      return;
    }

    setIsStreamingPreview(false);
    syncOllamaContextFromRunningApp();
    setIsAsking(false);
    setPresetCarouselInject(null);
  },
    [refreshInputTransparency, syncOllamaContextFromRunningApp],
  );

  const onTurnActivate = useCallback((key: string | "live") => {
    setExpandedTurnKey((prev) => (prev === key ? null : key));
  }, []);

  const onBackgroundPollError = useCallback((e: unknown) => {
    const msg = formatDeckyRpcError(e);
    a.onExternalFailure?.("background_poll", msg);
    setIsAsking(false);
    setThinkingSummary(null);
    setIsStreamingPreview(false);
    setIsStreamSettling(false);
    setOllamaResponse(`Error: ${msg}`);
    setLastApplied(null);
    syncOllamaContextFromRunningApp();
    setLastExchange(null);
    setStrategyGuideBranches(null);
    setModelPolicyDisclosure(null);
    setPresetCarouselInject(null);
    setShortcutSetupVariant(null);
    pendingArchiveTurnRef.current = null;
    pendingThreadQuestionDisplayRef.current = null;
  }, [a, syncOllamaContextFromRunningApp]);

  // --- Background status polling (useBackgroundGameAi) ---
  const {
    startNextRequest,
    invalidateRequests,
    startBackgroundStatusPolling,
    isRequestActive,
  } = useBackgroundGameAi(applyBackgroundStatusToUi, onBackgroundPollError, {
    tokenStreamingEnabledRef,
  });

  // --- Mount restore: resume pending Ask after plugin remount ---
  /**
   * Mount-only restore. Must NOT re-run on dependency identity churn: callback deps change every
   * render (hook args object), so depending on them re-fired this effect each render → status RPC
   * → "completed" re-applied → setSuggestedPrompts(random) → render → loop (~15ms, proven by
   * 19k dbg log entries). Latest callbacks are read through a ref instead.
   */
  const restoreFnsRef = useRef({ applyBackgroundStatusToUi, isRequestActive, startBackgroundStatusPolling, startNextRequest });
  restoreFnsRef.current = { applyBackgroundStatusToUi, isRequestActive, startBackgroundStatusPolling, startNextRequest };
  useEffect(() => {
    const fns = restoreFnsRef.current;
    const seq = fns.startNextRequest();

    callDeckyWithTimeout<[], BackgroundRequestStatus>("get_background_game_ai_status", [])
      .then((status) => {
        const f = restoreFnsRef.current;
        if (!f.isRequestActive(seq)) return;
        f.applyBackgroundStatusToUi(status);
        if (status.status === "pending") {
          f.startBackgroundStatusPolling(seq, status.question ?? "");
          startAskCompletionWatch();
        }
      })
      .catch(() => {
        // Best-effort restore only; keep startup quiet if backend status isn't available.
      });
  }, []);

  // --- Submit, cancel, clear Ask field ---
  const clearUnifiedInput = useCallback(() => {
    if (isAsking) {
      /* Ask-bar ✕ while a request is in flight: abort the backend too (it only reset UI state
         before, so Ollama kept generating — the "x doesn't stop it" regression). */
      void callDeckyWithTimeout<[], { ok?: boolean }>("abort_background_game_ai", []).catch(() => {
        /* best-effort RPC */
      });
      invalidateRequests();
      stopAskCompletionWatch();
      setIsAsking(false);
    }
    a.setUnifiedInput("");
    a.setSelectedIndex(-1);
    a.setNavigationMessage("");
    setOllamaResponse("");
    syncOllamaContextFromRunningApp();
    setLastApplied(null);
    setLastExchange(null);
    setStrategyGuideBranches(null);
    setModelPolicyDisclosure(null);
    setPresetCarouselInject(null);
    setShortcutSetupVariant(null);
    a.setSelectedAttachment(null);
    pendingReplyFollowUpRef.current = null;
    setLiveReplyChipError(null);
    setElapsedSeconds(null);
    setShowSlowWarning(false);
    setIsStreamingPreview(false);
    setThinkingSummary(null);
  }, [a, invalidateRequests, isAsking, syncOllamaContextFromRunningApp]);

  const onCancelAsk = useCallback(() => {
    void callDeckyWithTimeout<[], { ok?: boolean }>("abort_background_game_ai", []).catch(() => {
      /* best-effort RPC */
    });
    invalidateRequests();
    stopAskCompletionWatch();
    setIsAsking(false);
    setThinkingSummary(null);
    setIsStreamingPreview(false);
    setOllamaResponse("Request cancelled.");
    syncOllamaContextFromRunningApp();
    setLastApplied(null);
    setElapsedSeconds(null);
    setShowSlowWarning(false);
    setStrategyGuideBranches(null);
    setModelPolicyDisclosure(null);
    setPresetCarouselInject(null);
    setShortcutSetupVariant(null);
  }, [invalidateRequests, syncOllamaContextFromRunningApp]);

  const onAskOllama = useCallback(
    async (overrideQuestion?: string, opts?: { threadQuestionDisplay?: string }) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await new Promise((r) => setTimeout(r, 50));

      if (overrideQuestion !== undefined) {
        pendingReplyFollowUpRef.current = null;
      }

      const followUpPending = pendingReplyFollowUpRef.current;
      const q = (overrideQuestion ?? a.unifiedInput).trim();
      const ip = a.effectiveOllamaPcIp;
      if (!q) {
        toaster.toast({
          title: "Question required",
          body: "Type a question in the ask field first.",
          duration: 3500,
        });
        return;
      }
      if (!ip && !questionBypassesOllamaPcIpRequirement(q)) {
        toaster.toast({ title: "PC IP required", body: "Set your Ollama PC IP before asking.", duration: 4000 });
        return;
      }

      const arch = pendingArchiveTurnRef.current;
      if (arch && arch.question.trim() && arch.answer.trim()) {
        setAskThreadCollapsed((prev) => [
          ...prev,
          {
            id: `turn-${Date.now()}-${prev.length}`,
            question: arch.question,
            answer: arch.answer,
            transparency: arch.transparency ?? null,
          },
        ]);
        lastFlushedExchangeQuestionRef.current = arch.question.trim();
      }
      pendingArchiveTurnRef.current = null;
      setExpandedTurnKey("live");
      pendingThreadQuestionDisplayRef.current = opts?.threadQuestionDisplay?.trim() || null;
      setAskThreadDisplayQuestion(pendingThreadQuestionDisplayRef.current ?? q);

      const attachments: AskAttachmentSnapshot[] = followUpPending?.attachments?.length
        ? followUpPending.attachments
        : a.selectedAttachment
          ? [
              {
                path: a.selectedAttachment.path,
                name: a.selectedAttachment.name,
                source: a.selectedAttachment.source,
                app_id: a.selectedAttachment.app_id ?? "",
              },
            ]
          : [];

      const askModeForRequest = followUpPending?.askMode ?? a.askMode;
      const spoilerConsentForRequest = followUpPending?.spoilerConsentEffective ?? false;

      lastAskContextRef.current = {
        attachments: [...attachments],
        askMode: askModeForRequest,
        rawQuestion: q,
      };

      if (followUpPending) {
        pendingReplyFollowUpRef.current = null;
      }

      const seq = startNextRequest();

      const runningApp = Router.MainRunningApp;
      const appId = runningApp?.appid?.toString() ?? "";
      const appName = runningApp?.display_name ?? "";

      const isStrategyFirstTurn =
        askModeForRequest === "strategy" && !q.trim().startsWith(STRATEGY_FOLLOWUP_PREFIX);
      if (isStrategyFirstTurn) {
        setStrategyChecklist(null);
        strategyChecklistRef.current = null;
        void clearStrategyChecklistSession(appId).catch(() => {});
      }

      setIsAsking(true);
      setThinkingSummary(
        composeThinkingBlurb(q, {
          appName,
          attachmentCount: attachments.length,
          askMode: askModeForRequest,
          requestId: seq,
          characterEnabled: a.aiCharacterEnabled === true,
          characterPresetId: a.aiCharacterPresetId ?? null,
        }),
      );
      setPresetCarouselInject(null);
      setStrategyGuideBranches(null);
      setModelPolicyDisclosure(null);
      setShortcutSetupVariant(null);
      setLastTransparency(null);
    setIsStreamingPreview(false);
    setIsStreamSettling(false);
    setOllamaResponse("");
      setLastApplied(null);
      setElapsedSeconds(null);
      setOllamaContext({
        app_id: appId,
        app_context: appId ? "active" : "none",
      });
      try {
        const data = await callDeckyWithTimeout<
          [
            {
              question: string;
              PcIp: string;
              appId: string;
              appName: string;
              attachments: AskAttachment[];
              ask_mode: AskModeId;
              spoiler_consent: boolean;
              strategy_checklist_state?: ReturnType<typeof strategyChecklistToAskPayload>;
              reply_followup?: {
                chip_id: ReplyMicroActionId;
                parent_question: string;
                parent_answer: string;
                preferred_model: string | null;
              };
            },
          ],
          BackgroundStartResponse
        >("start_background_game_ai", [
          {
            question: q,
            PcIp: ip,
            appId,
            appName,
            attachments: attachments as AskAttachment[],
            ask_mode: askModeForRequest,
            spoiler_consent: spoilerConsentForRequest,
            ...(followUpPending
              ? {
                  reply_followup: {
                    chip_id: followUpPending.chipId,
                    parent_question: followUpPending.parentQuestion,
                    parent_answer: followUpPending.parentAnswer,
                    preferred_model: followUpPending.preferredModel,
                  },
                }
              : {}),
            ...(askModeForRequest === "strategy" && !isStrategyFirstTurn && strategyChecklistRef.current
              ? { strategy_checklist_state: strategyChecklistToAskPayload(strategyChecklistRef.current) }
              : {}),
          },
        ]);

        if (!isRequestActive(seq)) return;

        if (data.status === "invalid") {
          setIsAsking(false);
          setOllamaResponse(data.response ?? "Request is invalid.");
          setLastApplied(null);
          setElapsedSeconds(null);
          pendingThreadQuestionDisplayRef.current = null;
          return;
        }

        if (data.status === "blocked") {
          setIsAsking(false);
          setOllamaResponse(data.response ?? "That input was not sent.");
          setLastApplied(null);
          setElapsedSeconds(null);
          setOllamaContext({ app_id: appId, app_context: appId ? "active" : "none" });
          void refreshInputTransparency();
          pendingThreadQuestionDisplayRef.current = null;
          toaster.toast({
            title: "Input not sent",
            body: data.response ?? "Blocked by input checks.",
            duration: 5000,
          });
          return;
        }

        startAskCompletionWatch();

        a.setUnifiedInput("");
        a.setSelectedAttachment(null);

        if (data.status === "completed" && data.success) {
          if (!isRequestActive(seq)) return;
          const now = Date.now() / 1000;
          const terminal: BackgroundRequestStatus = {
            status: "completed",
            request_id: data.request_id ?? null,
            question: q,
            app_id: data.app_id ?? appId,
            app_context: (appId ? "active" : "none") as "active" | "none",
            success: true,
            response: data.response ?? "",
            applied: data.applied ?? null,
            elapsed_seconds: Number.isFinite(data.elapsed_seconds) ? Number(data.elapsed_seconds) : 0,
            error: null,
            started_at: now,
            completed_at: now,
            strategy_guide_branches: null,
            model_policy_disclosure: null,
            strategy_spoiler_consent_effective: false,
            shortcut_setup: data.shortcut_setup ?? null,
          };
          applyBackgroundStatusToUi(terminal, "");
          if (ip.trim().length > 0) {
            a.saveIp(ip);
          }
          if (a.unifiedInputPersistenceMode === "persist_search_only") {
            a.persistSearchQuery("");
          }
          if (data.meta === "shortcut_setup") {
            toaster.toast({
              title: "Quick-launch help",
              body: "In-app guide only; tune the chord in Controller settings. See full recipe in docs.",
              duration: 5000,
            });
          }
          if (data.meta === "sanitizer_keyword") {
            void a.syncSettingsFromDisk().catch((err) => {
              console.error("syncSettingsFromDisk failed (sanitizer keyword)", err);
            });
            toaster.toast({
              title: "Sanitizer",
              body: "Mode saved. See README for commands.",
              duration: 4000,
            });
          }
          if (data.meta === "vac_check") {
            toaster.toast({
              title: "Steam ban lookup",
              body: "Account-level GetPlayerBans only — not proof someone was your opponent.",
              duration: 6000,
            });
          }
          return;
        }

        if (data.status === "busy") {
          setIsAsking(true);
          setOllamaResponse(data.response ?? "A request is already in progress.");
        }

        if (data.status === "pending" && a.desktopDebugNoteAutoSave && a.filesystemWrite) {
          const screenshotPaths = attachments.map((at) => at.path).filter((p) => p.trim().length > 0);
          void callDeckyWithTimeout<[AppendDesktopChatEventPayload], AppendDesktopNoteResult>(
            "append_desktop_chat_event",
            [{ event: "ask", question: q, screenshot_paths: screenshotPaths }],
            DECKY_RPC_TIMEOUT_MS,
          ).catch(() => {});
        }

        if (ip.trim().length > 0) {
          a.saveIp(ip);
        }
        if (a.unifiedInputPersistenceMode === "persist_search_only") {
          a.persistSearchQuery("");
        }
        startBackgroundStatusPolling(seq, q);
      } catch (e: unknown) {
        if (!isRequestActive(seq)) return;
        const msg = formatDeckyRpcError(e);
        a.onExternalFailure?.("ask_ollama", msg);
        setIsAsking(false);
        setOllamaResponse(`Error: ${msg}`);
        setLastApplied(null);
        syncOllamaContextFromRunningApp();
        setStrategyGuideBranches(null);
        pendingThreadQuestionDisplayRef.current = null;
      }
    },
    [
      a,
      applyBackgroundStatusToUi,
      isRequestActive,
      refreshInputTransparency,
      startBackgroundStatusPolling,
      startNextRequest,
      syncOllamaContextFromRunningApp,
    ],
  );

  // --- Strategy branches + checklist toggles ---
  const onStrategyBranchPick = useCallback(
    (opt: { id: string; label: string }) => {
      if (isStrategyCustomResolutionBranch(opt)) {
        setStrategyGuideBranches(null);
        a.setUnifiedInput(CUSTOM_RESOLUTION_INPUT_PREFIX);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const root = a.unifiedInputFieldLayerRef.current ?? a.unifiedInputHostRef.current;
            if (!root) return;
            const field = root.querySelector<HTMLTextAreaElement | HTMLInputElement>("textarea, input");
            if (!field) return;
            field.focus();
            const len = field.value.length;
            try {
              field.setSelectionRange(len, len);
            } catch {
              // decky field quirks
            }
          });
        });
        return;
      }
      if (lastExchange?.question?.trim() && lastExchange?.answer?.trim()) {
        const qn = lastExchange.question.trim();
        if (lastFlushedExchangeQuestionRef.current !== qn) {
          pendingArchiveTurnRef.current = {
            question: lastExchange.question,
            answer: lastExchange.answer,
          };
        }
      }
      const prior = lastStrategyAskQuestionRef.current.trim();
      const composed = [
        `${STRATEGY_FOLLOWUP_PREFIX} I'm at: ${opt.label}.`,
        prior ? `Earlier I asked: ${prior}` : "",
        "",
        "Give controller-friendly coaching for this exact point, then end with **If you want to cheat…** as instructed.",
      ]
        .filter((line) => line.length > 0)
        .join("\n");
      a.setUnifiedInput(composed);
      void onAskOllama(composed, { threadQuestionDisplay: `I'm at: ${opt.label}` });
    },
    [a, lastExchange, onAskOllama],
  );

  const onStrategyChecklistToggle = useCallback((itemId: string, checked: boolean) => {
    setStrategyChecklist((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.checkedIds);
      if (checked) set.add(itemId);
      else set.delete(itemId);
      const next: StrategyChecklistState = { ...prev, checkedIds: [...set] };
      scheduleStrategyChecklistSessionSave(next);
      return next;
    });
  }, []);

  // --- Reply feedback + micro-action chips ---
  const onRetryLastResponse = useCallback(() => {
    pendingReplyFollowUpRef.current = null;
    setLiveReplyChipError(null);
    const q = (lastExchange?.question || a.unifiedInput || askThreadDisplayQuestion).trim();
    if (!q) {
      toaster.toast({
        title: "Nothing to retry",
        body: "Complete an Ask first, or type a question in the field.",
        duration: 3500,
      });
      return;
    }
    void onAskOllama(q, { threadQuestionDisplay: q });
  }, [lastExchange?.question, a.unifiedInput, askThreadDisplayQuestion, onAskOllama]);

  const onReplyFeedback = useCallback(
    async (rating: "up" | "down") => {
      setLiveReplyFeedbackRating(rating);
      setLiveReplyChipError(null);
      try {
        await callDeckyWithTimeout<[string, number, number, boolean, string], { ok?: boolean }>(
          "save_ask_feedback",
          [rating, lastRequestId ?? 0, lastExchange?.question?.length ?? 0, true, ""],
          DECKY_RPC_TIMEOUT_MS
        );
        toaster.toast({
          title:
            rating === "up"
              ? "Feedback saved on this Deck"
              : "Feedback saved — use a chip to refine and resend",
          body: "",
          duration: 3000,
        });
      } catch (e: unknown) {
        toaster.toast({ title: "Feedback not saved", body: formatDeckyRpcError(e), duration: 4000 });
      }
    },
    [lastExchange?.question, lastRequestId]
  );

  const onReplyMicroAction = useCallback(
    async (chipId: ReplyMicroActionId) => {
      const action = replyMicroActionById(chipId);
      if (!action || !lastExchange?.answer?.trim()) return;
      const originalQ = (lastExchange.originalQuestion || lastExchange.question).trim();
      if (!originalQ) return;

      pendingReplyFollowUpRef.current = {
        chipId,
        parentQuestion: originalQ,
        parentAnswer: lastExchange.answer,
        preferredModel: lastExchange.model ?? null,
        attachments: lastExchange.attachments ?? [],
        spoilerConsentEffective: lastExchange.spoilerConsentEffective ?? false,
        askMode: lastExchange.askMode ?? a.askMode,
      };
      setLiveReplyChipUsed(true);
      setLiveReplyChipError(null);
      a.setUnifiedInput(composeChipAutofillPrefix(action, originalQ));

      try {
        await callDeckyWithTimeout<[string, number, number, boolean, string], { ok?: boolean }>(
          "save_ask_feedback",
          ["down", lastRequestId ?? 0, originalQ.length, true, chipId],
          DECKY_RPC_TIMEOUT_MS
        );
        toaster.toast({
          title: "Prompt updated — edit and send when ready",
          body: "",
          duration: 3500,
        });
      } catch (e: unknown) {
        setLiveReplyChipError(formatDeckyRpcError(e));
      }
    },
    [a, lastExchange, lastRequestId]
  );

  // --- Session survival snapshot restore / reset ---
  const restoreSessionSnapshot = useCallback((snap: BonsaiSessionSurvivalSnapshot) => {
    setOllamaResponse(snap.ollamaResponse);
    setOllamaContext(snap.ollamaContext);
    setLastExchange(snap.lastExchange);
    setAskThreadCollapsed(snap.askThreadCollapsed);
    setAskThreadDisplayQuestion(snap.askThreadDisplayQuestion);
    setExpandedTurnKey(snap.expandedTurnKey ?? "live");
    setSuggestedPrompts(snap.suggestedPrompts);
    setLastTransparency(snap.lastTransparency);
    setModelPolicyDisclosure(snap.modelPolicyDisclosure);
    setStrategyGuideBranches(snap.strategyGuideBranches);
    setStrategyChecklist(snap.strategyChecklist ?? null);
    setElapsedSeconds(snap.elapsedSeconds);
    setLastApplied(snap.lastApplied);
    setShortcutSetupVariant(snap.shortcutSetupVariant);
    setPresetCarouselInject(snap.presetCarouselInject);
    setShowSlowWarning(snap.showSlowWarning);
    setLastRequestId(snap.lastRequestId);
    setThinkingSummary(snap.thinkingSummary);
  }, []);

  const resetAskSessionSlice = useCallback(() => {
    if (isAsking) {
      invalidateRequests();
      stopAskCompletionWatch();
      setIsAsking(false);
    }
    setIsStreamingPreview(false);
    setIsStreamSettling(false);
    setThinkingSummary(null);
    setOllamaResponse("");
    syncOllamaContextFromRunningApp();
    setLastApplied(null);
    setLastExchange(null);
    setStrategyGuideBranches(null);
    setStrategyChecklist(null);
    setElapsedSeconds(null);
    setShowSlowWarning(false);
    setAskThreadCollapsed([]);
    setExpandedTurnKey("live");
    setAskThreadDisplayQuestion("");
    setLastTransparency(null);
    setModelPolicyDisclosure(null);
    setPresetCarouselInject(null);
    setShortcutSetupVariant(null);
    pendingArchiveTurnRef.current = null;
    pendingThreadQuestionDisplayRef.current = null;
    pendingReplyFollowUpRef.current = null;
    lastFlushedExchangeQuestionRef.current = "";
    setLiveReplyFeedbackRating(null);
    setLiveReplyChipUsed(false);
    setLiveReplyChipError(null);
  }, [invalidateRequests, isAsking, syncOllamaContextFromRunningApp]);

  return {
    ollamaResponse,
    ollamaContext,
    lastExchange,
    setLastExchange,
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
    setLastTransparency,
    thinkingSummary,
    lastRequestId,
    askThreadCollapsed,
    setAskThreadCollapsed,
    setAskThreadDisplayQuestion,
    setStrategyChecklist,
    expandedTurnKey,
    setExpandedTurnKey,
    onTurnActivate,
    askThreadDisplayQuestion,
    isAsking,
    isStreamingPreview,
    isStreamSettling,
    streamDisplayText,
    lastApplied,
    refreshInputTransparency,
    startNextRequest,
    invalidateRequests,
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
    hydrateStrategyChecklistFromDisk,
    restoreSessionSnapshot,
    resetAskSessionSlice,
    setStrategyGuideBranches,
    setSuggestedPrompts,
    reseedSuggestedPrompts,
  };
}
