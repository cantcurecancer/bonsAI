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
import { StreamFenceWaitChip } from "../components/StreamFenceWaitChip";
import { registerAnswerBubbleNav } from "./answerBubbleNavRegistry";
import {
  getRegisteredAnswerBubble,
  registerAnswerBubbleEl,
  resolveFocusedAnswerBubble,
} from "./answerBubbleElRegistry";
import {
  focusFirstAnswerChunk,
  handleAnswerBubbleMoveDown,
  handleAnswerBubbleMoveUp,
} from "./answerBubbleNavigation";
import { registerAnswerStop } from "./answerStopRegistry";
import { uiActiveElement } from "./uiDocument";
import {
  isDeckDirectionDownEvent,
  isDeckDirectionUpEvent,
} from "./focusNavigation";
import { prepareStreamMarkdown } from "./streamMarkdownPrepare";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";
import { stripAssistantDisplayTags } from "./stripAssistantDisplayTags";
import { unwrapAskedEntitySpoilerFences } from "./unwrapAskedEntitySpoilerFences";

export type BuildAnswerBubbleElementArgs = {
  body: string;
  streaming: boolean;
  spoilerMaskingEnabled: boolean;
  spoilerDefaultExpanded?: boolean;
  maxWidthCss: string;
  answerKey: string;
  /** Live Ask question — used to unwrap false-positive spoilers for the named entity. */
  askQuestion?: string;
  /** Active game AppID — used with low-spoiler-risk unwrap. */
  appId?: string | null;
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
 * `onButtonDown` is the sole direction handler here, which is why it uses the event-aware predicates
 * rather than the string ones the bubble pairs with its `onMoveDown`. Two reasons, in order:
 * `onButtonDown` fires on every Decky component for every button, where `onMoveUp`/`onMoveDown` are
 * `Focusable`-only — and whether Steam routes a press to a *nested* Focusable's `onMove*` is the one
 * thing about this design that is unproven on device. Wiring both would risk firing twice for one
 * press, which is exactly what the string predicates exist to prevent.
 *
 * There is deliberately no `onActivate` behaviour beyond claiming the press: the wait chips are
 * status, not controls, and a press that early-revealed a spoiler mask from its holding chip would
 * defeat the point of masking it (STREAM-03).
 */
export function stopNavProps(
  moveDown: () => boolean,
  moveUp: () => boolean
): Record<string, unknown> {
  return {
    onActivate: () => {},
    onButtonDown: (button: unknown) => {
      if (isDeckDirectionDownEvent(button)) return moveDown();
      if (isDeckDirectionUpEvent(button)) return moveUp();
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
  stopNav: Record<string, unknown>
): React.ReactNode {
  const prepared = prepareStreamMarkdown(body);
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
  } = args;
  let displayBody = stripAssistantDisplayTags(body);
  if (spoilerMaskingEnabled && (askQuestion.trim() || appId)) {
    displayBody = unwrapAskedEntitySpoilerFences(displayBody, { question: askQuestion, appId });
  }
  if (!displayBody.trim()) return null;

  const prepared = streaming ? prepareStreamMarkdown(displayBody) : null;
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
    if (uiActiveElement()?.closest(".bonsai-spoiler-reveal-target, .bonsai-spoiler-collapse-target")) {
      return focusFirstAnswerChunk(answerKey);
    }
    if (handleAnswerBubbleMoveUp(bubble, noopChunkRef, chunkTotal, answerKey)) return true;
    /* Yield to turn header (previous sibling in turn-slot). */
    return false;
  };

  const stopNav = stopNavProps(moveDown, moveUp);

  const navHandlers = {
    onFocus: () => {
      captureBubble(answerKey);
      registerAnswerBubbleNav({ moveDown, moveUp, resetChunkIndex: () => {} });
    },
    onActivate: () => {
      captureBubble(answerKey);
    },
    onButtonDown: (button: unknown) => {
      if (isDeckDirectionDownEvent(button)) return moveDown();
      if (isDeckDirectionUpEvent(button)) return moveUp();
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
        className="bonsai-chat-ai-bubble-inner"
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
                stopNav
              )
            : /* Same stop treatment as the streaming stack, so navigating a turn feels the same
                 whether or not it streamed — and so a turn does not change shape under the user at
                 T3, when the layout switches from stream sections to these chunks. */
              displayChunks.map((chunk, i) => (
                <Focusable
                  key={`${answerKey}-chunk-${i}`}
                  className={STOP_CLASS}
                  ref={(el: HTMLElement | null) => registerAnswerStop(answerKey, i, el)}
                  {...stopAttrs(stopNav, i)}
                >
                  <MainTabBonsaiAiMarkdownChunk
                    source={chunk}
                    spoilerMaskingEnabled={spoilerMaskingEnabled}
                    spoilerDefaultExpanded={spoilerDefaultExpanded}
                  />
                </Focusable>
              ))}
        </div>
      </div>
    </Focusable>
  );
}
