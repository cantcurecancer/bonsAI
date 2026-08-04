/**
 * Title: Answer bubble navigation
 * Purpose: D-pad up/down scroll and focus moves between answer markdown chunks within a bubble.
 * Used for: buildAnswerBubbleElement Focusable onMove handlers and liveTurnFocusGraph.
 * Solves: Chunk-level navigation with panel scroll geometry when content exceeds viewport.
 * Does not: Hop between reply action buttons — see buildReplyActionsElement and replyStopRegistry.
 */
import {
  chunkHasContentAboveViewport,
  chunkHasContentBelowViewport,
  findScrollablePanel,
  panelScrollMax,
  scrollTabContentsByStep,
  tryGeometryPanelScroll,
} from "./chatPanelScroll";
import { resetAnswerBubbleChunkIndex } from "./answerBubbleNavRegistry";
import {
  getRegisteredAnswerBubble,
  registerAnswerBubbleEl,
  resolveFocusedAnswerBubble,
} from "./answerBubbleElRegistry";
import { elementHasFocus, getUiDocument } from "./uiDocument";

import {
  findUnvisitedSpoilerFenceInView,
  focusSpoilerFence,
} from "./spoilerFenceRegistry";

/** True when `el` overlaps the visible band of its scroll container. */
export function elementIsWithinViewportOf(el: HTMLElement, scroll: HTMLElement): boolean {
  const elRect = el.getBoundingClientRect();
  const scrollRect = scroll.getBoundingClientRect();
  return elRect.bottom > scrollRect.top && elRect.top < scrollRect.bottom;
}

/** Walk turn slots. Must query the UI document, not SharedJSContext's shell — see uiDocument.ts. */
export function findAnswerBubbleByKey(answerKey: string): HTMLElement | null {
  const registered = getRegisteredAnswerBubble(answerKey);
  if (registered) return registered;

  const focused = resolveFocusedAnswerBubble();
  if (focused) {
    const key = focused.querySelector(`[data-bonsai-answer-key="${answerKey}"]`);
    if (key) return focused;
  }

  for (const slot of getUiDocument().querySelectorAll(".bonsai-chat-turn-slot")) {
    const isLive = answerKey === "live";
    const hasLiveHeader = Boolean(slot.querySelector(".bonsai-chat-turn-row-header--live"));
    const hasTurnMarker = Boolean(slot.querySelector(`[data-bonsai-turn-id="${answerKey}"]`));
    if (isLive ? hasLiveHeader : hasTurnMarker) {
      const bubble = slot.querySelector(".bonsai-chat-ai-bubble") as HTMLElement | null;
      if (bubble) return bubble;
    }
  }
  return null;
}

/**
 * Focus the `.Panel.Focusable` Decky navigates by, and report whether focus actually landed.
 *
 * `elementHasFocus` asks the element's own document; the previous `contains(document.activeElement)`
 * asked SharedJSContext's shell and so returned false on every successful move (uiDocument.ts).
 * An existing `tabindex` is left alone — overwriting Decky's `0` with `-1` drops the node out of
 * Steam's navigation graph for subsequent presses.
 */
function focusPanelEl(el: HTMLElement): boolean {
  const panel = (
    el.matches(".Panel.Focusable") ? el : el.closest(".Panel.Focusable")
  ) as HTMLElement | null;
  const target = panel ?? el;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  if (elementHasFocus(target)) return true;
  el.focus({ preventScroll: true });
  return elementHasFocus(el);
}

export function focusFirstAnswerChunk(answerKey: string): boolean {
  const el =
    resolveFocusedAnswerBubble() ??
    getRegisteredAnswerBubble(answerKey) ??
    findAnswerBubbleByKey(answerKey);
  if (!el) return false;
  registerAnswerBubbleEl(answerKey, el);
  const spoiler = el.querySelector<HTMLElement>(".bonsai-spoiler-reveal-target");
  if (spoiler && focusPanelEl(spoiler)) return true;
  return focusPanelEl(el);
}

export function resolveAnswerBubbleEl(
  answerKey?: string,
  hint?: HTMLElement | null
): HTMLElement | null {
  if (hint) return hint;
  const fromFocused = resolveFocusedAnswerBubble();
  if (fromFocused) return fromFocused;
  if (answerKey) {
    const registered = getRegisteredAnswerBubble(answerKey);
    if (registered) return registered;
    return findAnswerBubbleByKey(answerKey);
  }
  return null;
}

/** Focus the answer bubble immediately after a turn header (Decky graph may skip it). */
export function focusAnswerBubbleAfterHeader(
  headerEl: HTMLElement | null,
  turnId?: string
): boolean {
  if (headerEl) {
    const turnSlot = headerEl.closest(".bonsai-chat-turn-slot");
    const bubble = turnSlot?.querySelector(".bonsai-chat-ai-bubble") as HTMLElement | null;
    if (bubble) {
      registerAnswerBubbleEl(turnId ?? "", bubble);
      resetAnswerBubbleChunkIndex();
      return focusPanelEl(bubble);
    }
  }
  if (turnId) return focusFirstAnswerChunk(turnId);
  return false;
}

/** Scroll QAM panel down; true only when scrollTop increases. */
export function panelStepDown(bubbleEl: HTMLElement): boolean {
  const scroll = findScrollablePanel(bubbleEl);
  if (!scroll) return false;
  const before = scroll.scrollTop;
  if (scrollTabContentsByStep(bubbleEl, "down")) {
    return scroll.scrollTop > before;
  }
  const max = panelScrollMax(scroll);
  if (max <= 0 && chunkHasContentBelowViewport(bubbleEl, scroll)) {
    return tryGeometryPanelScroll(bubbleEl, "down");
  }
  if (before >= max - 2) return false;
  const step = Math.max(80, Math.floor(scroll.clientHeight * 0.35));
  scroll.scrollTop = Math.min(max, before + step);
  return scroll.scrollTop > before;
}

/** Scroll QAM panel up; true only when scrollTop decreases. */
export function panelStepUp(bubbleEl: HTMLElement): boolean {
  const scroll = findScrollablePanel(bubbleEl);
  if (!scroll) return false;
  const before = scroll.scrollTop;
  const max = panelScrollMax(scroll);
  if (scroll.scrollTop <= 0) {
    if (max <= 0 && chunkHasContentAboveViewport(bubbleEl, scroll)) {
      return tryGeometryPanelScroll(bubbleEl, "up");
    }
    return false;
  }
  if (scrollTabContentsByStep(bubbleEl, "up")) {
    return scroll.scrollTop < before;
  }
  const step = Math.max(80, Math.floor(scroll.clientHeight * 0.35));
  scroll.scrollTop = Math.max(0, before - step);
  return scroll.scrollTop < before;
}

export function handleAnswerBubbleMoveDown(
  bubbleEl: HTMLElement | null,
  _focusedChunkRef: { current: number },
  chunkTotal: number,
  answerKey?: string
): boolean {
  const bubble = resolveAnswerBubbleEl(answerKey, bubbleEl);
  if (!bubble || chunkTotal <= 0) return false;
  if (answerKey) registerAnswerBubbleEl(answerKey, bubble);

  const scroll = findScrollablePanel(bubble);
  if (!scroll) return false;

  /*
   * Park on a masked spoiler before scrolling past it.
   *
   * The bubble is a single Focusable and the chunks inside are plain divs, so the fence's own
   * Focusable never received focus — masked strategy text was unreachable without a touchscreen
   * (reported 2026-08-04). Diverting here rather than restructuring the bubble keeps the scroll-step
   * logic intact, which the roadmap explicitly says not to disturb without on-Deck proof.
   *
   * Only fences already on screen are eligible, and each is offered once: press A to reveal, or
   * press Down again to scroll on. Without the visited flag a fence you chose not to open would
   * trap Down forever.
   *
   * The first two attempts at this diversion never ran at all: `bubble` could not resolve, because
   * both routes to it asked the global `document` (uiDocument.ts). Everything below this point was
   * dead code on device, which is why the instrumentation added for it logged nothing.
   */
  const fence = findUnvisitedSpoilerFenceInView(bubble, (el) =>
    elementIsWithinViewportOf(el, scroll),
  );
  if (fence && focusSpoilerFence(fence)) return true;

  /*
   * Only scroll while THIS bubble still extends below the viewport.
   * Previously we scrolled TabContentsScroll until max (past branches/thumbs to Save chat),
   * so D-pad Down never yielded to live-turn focus peers (MICRO-04).
   */
  if (!chunkHasContentBelowViewport(bubble, scroll)) {
    return false;
  }

  const max = panelScrollMax(scroll);
  if (max > 0 && panelStepDown(bubble)) {
    return true;
  }
  return tryGeometryPanelScroll(bubble, "down");
}

export function handleAnswerBubbleMoveUp(
  bubbleEl: HTMLElement | null,
  _focusedChunkRef: { current: number },
  chunkTotal: number,
  answerKey?: string
): boolean {
  const bubble = resolveAnswerBubbleEl(answerKey, bubbleEl);
  if (!bubble || chunkTotal <= 0) return false;

  const scroll = findScrollablePanel(bubble);
  if (!scroll) return false;

  /* Mirror down: only scroll while bubble content remains above the viewport. */
  if (!chunkHasContentAboveViewport(bubble, scroll)) {
    return false;
  }

  if (scroll.scrollTop <= 0) {
    return tryGeometryPanelScroll(bubble, "up");
  }
  return panelStepUp(bubble);
}
