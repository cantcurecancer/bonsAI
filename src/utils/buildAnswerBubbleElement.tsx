import React from "react";
import { Focusable } from "@decky/ui";
import { MainTabBonsaiAiMarkdownChunk } from "../components/MainTabBonsaiAiMarkdownChunk";
import { StreamFenceWaitChip } from "../components/StreamFenceWaitChip";
import { registerAnswerBubbleNav } from "./answerBubbleNavRegistry";
import {
  registerAnswerBubbleEl,
  resolveFocusedAnswerBubble,
} from "./answerBubbleElRegistry";
import {
  focusFirstAnswerChunk,
  handleAnswerBubbleMoveDown,
  handleAnswerBubbleMoveUp,
} from "./answerBubbleNavigation";
import {
  isDownDeckButtonEvent,
  isUpDeckButtonEvent,
} from "./focusNavigation";
import { prepareStreamMarkdown } from "./streamMarkdownPrepare";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";
import { stripAssistantDisplayTags } from "./stripAssistantDisplayTags";
import { unwrapAskedEntitySpoilerFences } from "./unwrapAskedEntitySpoilerFences";
import { focusSpoilerRevealIn } from "./liveTurnFocusGraph";

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

function captureBubble(answerKey: string): HTMLElement | null {
  const bubble = resolveFocusedAnswerBubble();
  if (bubble) registerAnswerBubbleEl(answerKey, bubble);
  return bubble;
}

function renderStreamMarkdownStack(
  body: string,
  spoilerMaskingEnabled: boolean,
  spoilerDefaultExpanded: boolean,
  answerKey: string
): React.ReactNode {
  const prepared = prepareStreamMarkdown(body);
  const nodes: React.ReactNode[] = [];

  prepared.closedBlocks.forEach((block, i) => {
    nodes.push(
      <div
        key={`${answerKey}-closed-${i}`}
        className="bonsai-ai-response-chunk bonsai-ai-response-chunk--in-bubble bonsai-ai-response-chunk--stream-closed"
        data-bonsai-chunk-index={String(i)}
      >
        <MainTabBonsaiAiMarkdownChunk
          source={block}
          spoilerMaskingEnabled={spoilerMaskingEnabled}
          spoilerDefaultExpanded={spoilerDefaultExpanded}
        />
      </div>
    );
  });

  if (prepared.waitChip) {
    nodes.push(
      <div
        key={`${answerKey}-wait`}
        className="bonsai-ai-response-chunk bonsai-ai-response-chunk--in-bubble bonsai-ai-response-chunk--stream-wait"
      >
        <StreamFenceWaitChip label={prepared.waitChip.label} kind={prepared.waitChip.kind} />
      </div>
    );
  }

  if (prepared.liveTail) {
    const tailIndex = prepared.closedBlocks.length + (prepared.waitChip ? 1 : 0);
    nodes.push(
      <div
        key={`${answerKey}-tail`}
        className="bonsai-ai-response-chunk bonsai-ai-response-chunk--in-bubble"
        data-bonsai-chunk-index={String(tailIndex)}
        data-bonsai-stream-preview="true"
      >
        <MainTabBonsaiAiMarkdownChunk
          source={prepared.liveTail}
          spoilerMaskingEnabled={spoilerMaskingEnabled}
          spoilerDefaultExpanded={spoilerDefaultExpanded}
        />
      </div>
    );
  }

  return nodes;
}

/**
 * One Focusable answer bubble per turn (display chunks are non-focusable divs inside).
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
    const spoilerOk = focusSpoilerRevealIn(bubble);
    if (spoilerOk) return true;
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
    if (document.activeElement?.closest(".bonsai-spoiler-reveal-target, .bonsai-spoiler-collapse-target")) {
      return focusFirstAnswerChunk(answerKey);
    }
    if (handleAnswerBubbleMoveUp(bubble, noopChunkRef, chunkTotal, answerKey)) return true;
    /* Yield to turn header (previous sibling in turn-slot). */
    return false;
  };

  const navHandlers = {
    onFocus: () => {
      captureBubble(answerKey);
      registerAnswerBubbleNav({ moveDown, moveUp, resetChunkIndex: () => {} });
    },
    onMoveDown: () => moveDown(),
    onMoveUp: () => moveUp(),
    onActivate: () => {
      captureBubble(answerKey);
    },
    onButtonDown: (button: unknown) => {
      if (isDownDeckButtonEvent(button)) return moveDown();
      if (isUpDeckButtonEvent(button)) return moveUp();
      return false;
    },
  } as Record<string, unknown>;

  return (
    <Focusable
      key={`answer-bubble-${answerKey}`}
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
                answerKey
              )
            : displayChunks.map((chunk, i) => (
                <div
                  key={`${answerKey}-chunk-${i}`}
                  className="bonsai-ai-response-chunk bonsai-ai-response-chunk--in-bubble"
                  data-bonsai-chunk-index={String(i)}
                >
                  <MainTabBonsaiAiMarkdownChunk
                    source={chunk}
                    spoilerMaskingEnabled={spoilerMaskingEnabled}
                    spoilerDefaultExpanded={spoilerDefaultExpanded}
                  />
                </div>
              ))}
        </div>
      </div>
    </Focusable>
  );
}
