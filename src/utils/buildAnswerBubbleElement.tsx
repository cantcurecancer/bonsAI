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

export type BuildAnswerBubbleElementArgs = {
  body: string;
  streaming: boolean;
  spoilerMaskingEnabled: boolean;
  maxWidthCss: string;
  answerKey: string;
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
function focusSpoilerControlInBubble(bubble: HTMLElement | null, selector: string): boolean {
  if (!bubble) return false;
  const el = bubble.querySelector<HTMLElement>(selector);
  if (!el) return false;
  el.focus({ preventScroll: true });
  return el.contains(document.activeElement);
}

export function buildAnswerBubbleElement(
  args: BuildAnswerBubbleElementArgs
): React.ReactElement | null {
  const { body, streaming, spoilerMaskingEnabled, maxWidthCss, answerKey } = args;
  const displayBody = stripAssistantDisplayTags(body);
  if (!displayBody.trim()) return null;

  const prepared = streaming ? prepareStreamMarkdown(displayBody) : null;
  const displayChunks = streaming ? [] : splitResponseIntoChunks(displayBody);
  const chunkTotal = streaming ? 1 : displayChunks.length;
  const fenceWaitActive = prepared?.waitChip?.kind === "fence";

  const moveDown = () => {
    const bubble = captureBubble(answerKey);
    if (
      focusSpoilerControlInBubble(
        bubble,
        ".bonsai-spoiler-reveal-target:not(:focus-within), .bonsai-spoiler-reveal-target"
      )
    ) {
      return true;
    }
    return handleAnswerBubbleMoveDown(bubble, noopChunkRef, chunkTotal, answerKey);
  };

  const moveUp = () => {
    const bubble = captureBubble(answerKey);
    if (document.activeElement?.closest(".bonsai-spoiler-reveal-target, .bonsai-spoiler-collapse-target")) {
      return focusFirstAnswerChunk(answerKey);
    }
    return handleAnswerBubbleMoveUp(bubble, noopChunkRef, chunkTotal, answerKey);
  };

  const navHandlers = {
    onFocus: () => {
      captureBubble(answerKey);
      registerAnswerBubbleNav({ moveDown, moveUp, resetChunkIndex: () => {} });
    },
    onMoveDown: () => {
      const bubble = captureBubble(answerKey);
      return handleAnswerBubbleMoveDown(bubble, noopChunkRef, chunkTotal, answerKey);
    },
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
            ? renderStreamMarkdownStack(displayBody, spoilerMaskingEnabled, answerKey)
            : displayChunks.map((chunk, i) => (
                <div
                  key={`${answerKey}-chunk-${i}`}
                  className="bonsai-ai-response-chunk bonsai-ai-response-chunk--in-bubble"
                  data-bonsai-chunk-index={String(i)}
                >
                  <MainTabBonsaiAiMarkdownChunk
                    source={chunk}
                    spoilerMaskingEnabled={spoilerMaskingEnabled}
                  />
                </div>
              ))}
        </div>
      </div>
    </Focusable>
  );
}
