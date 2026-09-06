/**
 * Title: Reply layout report
 * Purpose: Describe the newest reply's block — stop count, and the rectangle of each control.
 * Used for: The preview suite's getReplyLayoutJson hook, so a scenario can assert on layout.
 * Solves: Scenarios could see text but never where anything sat, so a control drifting outside
 *   its bubble or off the 300px column went unnoticed until someone looked at the device.
 * Does not: Read any answer text, or run outside preview — see previewTestHooks.ts.
 */
import type { ReplyLayoutRect, ReplyLayoutReport } from "./previewTestHooks";
import { getUiDocument } from "../utils/uiDocument";

/*
 * Rounded to whole pixels. Steam renders at a fractional scale, so an unrounded rectangle differs
 * in the third decimal place between runs and a scenario asserting equality would flap.
 */
function rectOf(el: Element | null): ReplyLayoutRect | null {
  if (!el) return null;
  const r = (el as HTMLElement).getBoundingClientRect();
  return {
    x: Math.round(r.left),
    y: Math.round(r.top),
    w: Math.round(r.width),
    h: Math.round(r.height),
  };
}

/**
 * Feature: automated checks on the block under a finished answer.
 * Input: nothing — reads the live page.
 * Output: counts and rectangles for the LAST turn slot on screen, which is the newest reply.
 *
 * The last slot rather than the first: a transcript with history has several, and every one of
 * these controls belongs to the newest.
 */
export function buildReplyLayoutReport(): ReplyLayoutReport {
  const doc = getUiDocument();
  const slots = doc.querySelectorAll(".bonsai-chat-turn-slot");
  const slot = (slots.length ? slots[slots.length - 1] : null) as HTMLElement | null;
  if (!slot) {
    return {
      answerStops: 0,
      answerBubble: null,
      questionBubble: null,
      detailsDivider: null,
      copyIcon: null,
      retryIcon: null,
      utilityRow: null,
      detailsOpen: false,
    };
  }
  return {
    answerStops: slot.querySelectorAll(".bonsai-answer-stop").length,
    answerBubble: rectOf(slot.querySelector(".bonsai-chat-ai-bubble")),
    questionBubble: rectOf(slot.querySelector(".bonsai-chat-turn-row-header")),
    detailsDivider: rectOf(slot.querySelector(".bonsai-chat-details-divider")),
    copyIcon: rectOf(slot.querySelector(".bonsai-reply-copy-corner")),
    retryIcon: rectOf(slot.querySelector(".bonsai-turn-retry-corner")),
    utilityRow: rectOf(slot.querySelector(".bonsai-chat-reply-actions-row--utility")),
    detailsOpen: Boolean(slot.querySelector(".bonsai-chip-ladder")),
  };
}
