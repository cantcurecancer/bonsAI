/**
 * Title: Answer bubble element builder
 * Purpose: Build the Focusable answer bubble React tree with chunks, streaming prep, and nav registration.
 * Used for: MainTabChatTranscript live and history turn rendering.
 * Solves: Unified markdown chunk layout, spoiler unwrap, and D-pad bubble navigation hooks.
 * Does not: Poll Ask status — see useBackgroundGameAi and buildTurnHeaderElement.
 */
import React from "react";
import { Focusable } from "@decky/ui";
import { MainTabBonsaiAiMarkdownChunk } from "../components/MainTabBonsaiAiMarkdownChunk";
import type { DrgGlossaryTerm } from "../data/drgGlossaryTerms";
import { StreamFenceWaitChip } from "../components/StreamFenceWaitChip";
import { ReplyCopyButton } from "../components/ReplyCopyButton";
import {
  getRegisteredAnswerBubble,
  registerAnswerBubbleEl,
  registerAnswerBubbleNav,
  resolveFocusedAnswerBubble,
} from "./answerBubbleElRegistry";
import {
  focusFirstAnswerChunk,
  focusLastAnswerChunk,
  handleAnswerBubbleMoveDown,
  handleAnswerBubbleMoveUp,
} from "./answerBubbleNavigation";
import { registerAnswerStop } from "./answerStopRegistry";
import { uiGamepadFocusElement } from "./uiDocument";
import {
  isDeckDirectionLeftEvent,
  isDeckDirectionRightEvent,
  isDownDeckButtonEvent,
  isUpDeckButtonEvent,
} from "./focusNavigation";
import { focusRegisteredReplyStop } from "./replyStopRegistry";
import { prepareStreamMarkdown } from "./streamMarkdownPrepare";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";
import { stripAssistantDisplayTags } from "./stripAssistantDisplayTags";
import {
  shouldUnwrapSpoilerFence,
  unwrapAskedEntitySpoilerFences,
} from "./unwrapAskedEntitySpoilerFences";

export type BuildAnswerBubbleElementArgs = {
  body: string;
  streaming: boolean;
  spoilerMaskingEnabled: boolean;
  spoilerDefaultExpanded?: boolean;
  maxWidthCss: string;
  answerKey: string;
  /** Live Ask question — used to unwrap false-positive spoilers for the named entity. */
  askQuestion?: string;
  /** Active game AppID — used with title spoiler profile for unwrap. */
  appId?: string | null;
  /** When true, unwrap every spoiler fence for this turn (explicit consent). */
  spoilerConsentEffective?: boolean;
  /** DRG Survivor glossary "explain further" chip — starts a new Ask turn about the tapped term. */
  onDrgGlossaryExplainFurther?: (term: DrgGlossaryTerm) => void;
  /**
   * When set, the bubble's bottom-right corner gains a small faded Copy icon (D77).
   *
   * Only on a finished answer: a still-arriving one has no bottom to pin it to, and the text it
   * would copy changes under the press.
   */
  getAnswerCopyText?: () => string;
};

const noopChunkRef = { current: 0 };

/**
 * The bubble this handler belongs to.
 *
 * Falls back to the mount-time ref registration, because focus-derived lookup is the fragile half:
 * it depends on `activeElement`, and every navigation helper below is a no-op when it comes back
 * null. That is exactly what happened on device — the D-pad diversion for masked spoilers never
 * ran once, in either shipped attempt.
 */
function captureBubble(answerKey: string): HTMLElement | null {
  const bubble = resolveFocusedAnswerBubble() ?? getRegisteredAnswerBubble(answerKey);
  if (bubble) registerAnswerBubbleEl(answerKey, bubble);
  return bubble;
}

const STOP_CLASS = "bonsai-ai-response-chunk bonsai-ai-response-chunk--in-bubble bonsai-answer-stop";

/**
 * Props every section stop carries.
 *
 * Once focus sits on a stop it is the stop, not the bubble, that receives the press, so each one has
 * to continue the walk. Both directions delegate to the bubble's own handlers rather than
 * reimplementing anything — the bubble stays the single owner of what Down and Up mean in an answer.
 *
 * `onMoveDown`/`onMoveUp` carry the directions. The previous design bet the other way — its comment
 * called nested-Focusable `onMove*` "the one thing about this design that is unproven on device"
 * and made `onButtonDown` the sole direction handler. Measured 2026-08-27, the bet lost: a real
 * D-pad press reaches neither a DOM keydown listener nor (on this path) a direction `onButtonDown`,
 * while `onMove*` on nested plugin Focusables is exactly what CONTEXT-LADDER-03's on-device runs
 * exercised. So `onMove*` is the wiring Steam honors, and `onButtonDown` stays only for the
 * string-shaped presses tests and desktop keyboards deliver — with the string-only predicates, so
 * one press can never fire both (the pairing rule documented in focusNavigation.ts).
 *
 * `onActivate` delegates to a revealed spoiler's collapse control when one is inside this stop —
 * that control (`.bonsai-spoiler-collapse-target`) is a healthy `Focusable` with its own
 * `onActivate`, but the D-pad walk parks on the stop, not on it, so it never takes the ring on its
 * own. A masked reveal target renders `.bonsai-spoiler-reveal-target` instead, and a wait chip
 * renders neither, so the query simply finds nothing there — the exclusion STREAM-03 needs (A must
 * not early-reveal a masked fence or act on a wait chip) falls out of the DOM shape rather than
 * needing its own check. Reads the ring, not `activeElement`, for the same reason `moveUp` below
 * does: Steam moves `.gpfocus` without moving `activeElement`.
 */
export function stopNavProps(
  moveDown: () => boolean,
  moveUp: () => boolean
): Record<string, unknown> {
  return {
    onActivate: () => {
      const stop = uiGamepadFocusElement();
      const collapseButton = stop?.querySelector<HTMLButtonElement>(
        ".bonsai-spoiler-collapse-target button"
      );
      collapseButton?.click();
    },
    onMoveDown: () => moveDown(),
    onMoveUp: () => moveUp(),
    onButtonDown: (button: unknown) => {
      if (isDownDeckButtonEvent(button)) return moveDown();
      if (isUpDeckButtonEvent(button)) return moveUp();
      return false;
    },
  };
}

/* Cast for the same reason `navHandlers` below is cast: `data-*` is only structurally typed on
   intrinsic elements, and Decky's Focusable props do not carry an index signature. */
function stopAttrs(
  stopNav: Record<string, unknown>,
  index: number,
  extra?: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...stopNav,
    ...extra,
    "data-bonsai-chunk-index": String(index),
  } as Record<string, unknown>;
}

function renderStreamMarkdownStack(
  body: string,
  spoilerMaskingEnabled: boolean,
  spoilerDefaultExpanded: boolean,
  answerKey: string,
  stopNav: Record<string, unknown>,
  unwrapOpenSpoilerFence?: (openFenceText: string) => boolean,
  appId?: string | null,
  onDrgGlossaryExplainFurther?: (term: DrgGlossaryTerm) => void
): React.ReactNode {
  const prepared = prepareStreamMarkdown(body, { unwrapOpenSpoilerFence });
  const nodes: React.ReactNode[] = [];

  prepared.closedBlocks.forEach((block, i) => {
    nodes.push(
      <Focusable
        key={`${answerKey}-closed-${i}`}
        className={`${STOP_CLASS} bonsai-ai-response-chunk--stream-closed`}
        ref={(el: HTMLElement | null) => registerAnswerStop(answerKey, i, el)}
        {...stopAttrs(stopNav, i)}
      >
        <MainTabBonsaiAiMarkdownChunk
          source={block}
          spoilerMaskingEnabled={spoilerMaskingEnabled}
          spoilerDefaultExpanded={spoilerDefaultExpanded}
          appId={appId}
          onDrgGlossaryExplainFurther={onDrgGlossaryExplainFurther}
        />
      </Focusable>
    );
  });

  if (prepared.waitChip) {
    const waitIndex = prepared.closedBlocks.length;
    nodes.push(
      <Focusable
        key={`${answerKey}-wait`}
        className={`${STOP_CLASS} bonsai-ai-response-chunk--stream-wait`}
        ref={(el: HTMLElement | null) => registerAnswerStop(answerKey, waitIndex, el)}
        {...stopAttrs(stopNav, waitIndex)}
      >
        <StreamFenceWaitChip label={prepared.waitChip.label} kind={prepared.waitChip.kind} />
      </Focusable>
    );
  }

  if (prepared.liveTail) {
    /* prepareStreamMarkdown returns a tail or a chip, never both; the term is defensive so the
       indices stay contiguous if that ever changes. */
    const tailIndex = prepared.closedBlocks.length + (prepared.waitChip ? 1 : 0);
    nodes.push(
      <Focusable
        key={`${answerKey}-tail`}
        className={STOP_CLASS}
        ref={(el: HTMLElement | null) => registerAnswerStop(answerKey, tailIndex, el)}
        {...stopAttrs(stopNav, tailIndex, { "data-bonsai-stream-preview": "true" })}
      >
        <MainTabBonsaiAiMarkdownChunk
          source={prepared.liveTail}
          spoilerMaskingEnabled={spoilerMaskingEnabled}
          spoilerDefaultExpanded={spoilerDefaultExpanded}
          appId={appId}
          onDrgGlossaryExplainFurther={onDrgGlossaryExplainFurther}
        />
      </Focusable>
    );
  }

  return nodes;
}

/**
 * One Focusable answer bubble per turn, with each rendered section a nested Focusable stop inside it.
 * Parent turn-slot Focusable uses flow-children="vertical" for header → answer → reply.
 */
export function buildAnswerBubbleElement(
  args: BuildAnswerBubbleElementArgs
): React.ReactElement | null {
  const {
    body,
    streaming,
    spoilerMaskingEnabled,
    spoilerDefaultExpanded = false,
    maxWidthCss,
    answerKey,
    askQuestion = "",
    appId = null,
    spoilerConsentEffective = false,
    onDrgGlossaryExplainFurther,
    getAnswerCopyText,
  } = args;
  const spoilerUnwrapEligible =
    spoilerConsentEffective || (spoilerMaskingEnabled && (askQuestion.trim() || appId));
  const spoilerUnwrapOpts = { question: askQuestion, appId, spoilerConsentEffective };
  let displayBody = stripAssistantDisplayTags(body);
  if (spoilerUnwrapEligible) {
    displayBody = unwrapAskedEntitySpoilerFences(displayBody, spoilerUnwrapOpts);
  }
  if (!displayBody.trim()) return null;

  /* Same eligibility as the closed-fence unwrap above, so a turn that streams a spoiler fence
     never masks it only to unmask an identical fence once the stream closes. */
  const unwrapOpenSpoilerFence = spoilerUnwrapEligible
    ? (openFenceText: string) => shouldUnwrapSpoilerFence(openFenceText, spoilerUnwrapOpts)
    : undefined;

  const prepared = streaming ? prepareStreamMarkdown(displayBody, { unwrapOpenSpoilerFence }) : null;
  const displayChunks = streaming ? [] : splitResponseIntoChunks(displayBody);
  const chunkTotal = streaming ? 1 : displayChunks.length;
  const fenceWaitActive = prepared?.waitChip?.kind === "fence";

  const moveDown = () => {
    const bubble = captureBubble(answerKey);
    /*
     * Masked spoilers are handled inside handleAnswerBubbleMoveDown, which only diverts to a fence
     * that is already on screen and not yet offered. The unconditional `focusSpoilerRevealIn(bubble)`
     * that used to run first jumped to the first fence in the bubble however far below it was,
     * skipping the answer text between here and there.
     */
    if (handleAnswerBubbleMoveDown(bubble, noopChunkRef, chunkTotal, answerKey)) return true;
    /*
     * Yield to parent turn-slot flow-children so the next sibling Focusable
     * (branch picker / reply actions) receives focus. Do not programmatic-.focus()
     * — that path skipped peers and escaped to Save chat on Deck.
     */
    return false;
  };

  const moveUp = () => {
    const bubble = captureBubble(answerKey);
    /*
     * Parked on a fence? Then Up goes back to the top of the answer rather than stepping sections.
     *
     * Reads the ring, not `activeElement`: the fence is exactly where the two disagree. It is the
     * one stop the D-pad reaches by our own diversion rather than by Steam's graph, so on device
     * `activeElement` was still on the bubble here and this branch never ran — the same dead-code-
     * on-device shape as MICRO-04, in the feature the diversion exists to serve.
     */
    if (uiGamepadFocusElement()?.closest(".bonsai-spoiler-reveal-target, .bonsai-spoiler-collapse-target")) {
      return focusFirstAnswerChunk(answerKey);
    }
    if (handleAnswerBubbleMoveUp(bubble, noopChunkRef, chunkTotal, answerKey)) return true;
    /* Yield to turn header (previous sibling in turn-slot). */
    return false;
  };

  const stopNav = stopNavProps(moveDown, moveUp);

  /*
   * Copy in the bubble's bottom-right corner (D77), reached by Right from the last section.
   *
   * It is its own navigation container, like the reply row below, so a bare focus() from a section
   * would move activeElement while Steam's ring stayed on the section — the failure this repo has
   * lost three fixes to. TakeFocus first, then the registry focus reports whether it landed.
   */
  const copyNavRef: { current: { TakeFocus?: (gamepad?: boolean) => unknown } | null } = {
    current: null,
  };
  const copySlotEl: { current: HTMLElement | null } = { current: null };
  const showCornerCopy = Boolean(getAnswerCopyText) && !streaming;
  const rightIntoCopy = () => {
    if (!showCornerCopy) return false;
    try {
      copyNavRef.current?.TakeFocus?.(true);
    } catch {
      /* fall through — the registry focus below reports whether it landed */
    }
    return focusRegisteredReplyStop("copy");
  };
  const leftOutOfCopy = () => focusLastAnswerChunk(answerKey);

  /*
   * Steam's nav node for this bubble, so the reply-actions row below can hand the ring in (Up onto
   * a glossary chip). A plain per-render holder like buildReplyActionsElement's utilityNavRef —
   * this is a plain function, so there are no hooks to use; re-registering each render replaces the
   * previous holder under the same key, matching registerAnswerBubbleEl's semantics.
   */
  const bubbleNavRef: { current: { TakeFocus?: (gamepad?: boolean) => unknown } | null } = {
    current: null,
  };
  registerAnswerBubbleNav(answerKey, bubbleNavRef);

  /* Same direction wiring as stopNavProps, for the same measured reason. */
  const navHandlers = {
    onFocus: () => {
      captureBubble(answerKey);
    },
    onActivate: () => {
      captureBubble(answerKey);
    },
    onMoveDown: () => moveDown(),
    onMoveUp: () => moveUp(),
    onButtonDown: (button: unknown) => {
      if (isDownDeckButtonEvent(button)) return moveDown();
      if (isUpDeckButtonEvent(button)) return moveUp();
      return false;
    },
  } as Record<string, unknown>;

  return (
    <Focusable
      key={`answer-bubble-${answerKey}`}
      /* Mount-time registration. Without it the only route to this element was `activeElement`,
         which plugin code cannot read for its own UI — see uiDocument.ts. */
      ref={(el: HTMLElement | null) => registerAnswerBubbleEl(answerKey, el)}
      className={`bonsai-chat-ai-bubble bonsai-glass-panel${
        streaming ? " bonsai-chat-ai-bubble--stream-preview" : ""
      }${fenceWaitActive ? " bonsai-chat-ai-bubble--fence-wait" : ""}`}
      {...navHandlers}
      {...({ navRef: bubbleNavRef } as Record<string, unknown>)}
      style={{
        width: maxWidthCss,
        maxWidth: maxWidthCss,
        alignSelf: "flex-start",
        marginBottom: 8,
        boxSizing: "border-box",
        ...(streaming
          ? {
              ["--bonsai-stream-pulse-ms" as string]: "2000ms",
              ["--bonsai-stream-spin-ms" as string]: "2000ms",
            }
          : {}),
      }}
    >
      <div
        className={`bonsai-chat-ai-bubble-inner${
          showCornerCopy ? " bonsai-chat-ai-bubble-inner--with-copy" : ""
        }`}
        data-bonsai-answer-bubble="true"
        data-bonsai-answer-key={answerKey}
      >
        <div className="bonsai-ai-response-stack bonsai-ai-response-stack--in-bubble">
          {streaming
            ? renderStreamMarkdownStack(
                displayBody,
                spoilerMaskingEnabled,
                spoilerDefaultExpanded,
                answerKey,
                stopNav,
                unwrapOpenSpoilerFence,
                appId,
                onDrgGlossaryExplainFurther
              )
            : /* Same stop treatment as the streaming stack, so navigating a turn feels the same
                 whether or not it streamed — and so a turn does not change shape under the user at
                 T3, when the layout switches from stream sections to these chunks. */
              displayChunks.map((chunk, i) => (
                <Focusable
                  key={`${answerKey}-chunk-${i}`}
                  className={STOP_CLASS}
                  ref={(el: HTMLElement | null) => registerAnswerStop(answerKey, i, el)}
                  {...stopAttrs(
                    stopNav,
                    i,
                    /* Only the last section offers Right into the corner icon: it is pinned to the
                       bottom of the bubble, so anywhere else the ring would jump past text. */
                    showCornerCopy && i === displayChunks.length - 1
                      ? {
                          onMoveRight: () => rightIntoCopy(),
                          onButtonDown: (button: unknown) => {
                            if (isDeckDirectionRightEvent(button)) return rightIntoCopy();
                            if (isDownDeckButtonEvent(button)) return moveDown();
                            if (isUpDeckButtonEvent(button)) return moveUp();
                            return false;
                          },
                        }
                      : undefined
                  )}
                >
                  <MainTabBonsaiAiMarkdownChunk
                    source={chunk}
                    spoilerMaskingEnabled={spoilerMaskingEnabled}
                    spoilerDefaultExpanded={spoilerDefaultExpanded}
                    appId={appId}
                    onDrgGlossaryExplainFurther={onDrgGlossaryExplainFurther}
                  />
                </Focusable>
              ))}
        </div>
        {showCornerCopy ? (
          /*
           * The handlers sit on this Focusable, not on the button inside it: a Decky Button does
           * not forward onMove* to any Focusable — the measured reason recorded in
           * buildReplyActionsElement.tsx for the row below.
           */
          <Focusable
            className="bonsai-reply-copy-corner-slot"
            ref={(el: HTMLElement | null) => {
              copySlotEl.current = el;
            }}
            {...({
              navRef: copyNavRef,
              onMoveLeft: () => leftOutOfCopy(),
              onButtonDown: (button: unknown) =>
                isDeckDirectionLeftEvent(button) ? leftOutOfCopy() : false,
            } as Record<string, unknown>)}
          >
            <ReplyCopyButton corner getCopyText={getAnswerCopyText!} />
          </Focusable>
        ) : null}
      </div>
    </Focusable>
  );
}
