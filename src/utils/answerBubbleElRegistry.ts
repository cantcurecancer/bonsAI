/**
 * Title: Answer bubble element registry
 * Purpose: Register mounted answer bubble DOM nodes by answer key for focus graph navigation.
 * Used for: buildAnswerBubbleElement, answerBubbleNavigation, and liveTurnFocusGraph.
 * Solves: Focus hops without asking the global `document`, which under Decky is the wrong
 *         document entirely — see uiDocument.ts.
 * Does not: Track chunk index within a bubble — see answerBubbleNavRegistry.
 */
import { rememberUiDocument, uiActiveElement } from "./uiDocument";

const bubbleByKey = new Map<string, HTMLElement>();

export function registerAnswerBubbleEl(answerKey: string, el: HTMLElement | null): void {
  if (!answerKey) return;
  // `el.isConnected` asks the node about its own tree. The previous `document.contains(el)` asked
  // SharedJSContext's shell document, which never contains our nodes, so nothing was ever stored
  // and every registry lookup missed (measured on device 2026-08-04).
  if (el && el.isConnected) {
    rememberUiDocument(el);
    bubbleByKey.set(answerKey, el);
    return;
  }
  bubbleByKey.delete(answerKey);
}

export function getRegisteredAnswerBubble(answerKey: string): HTMLElement | null {
  const el = bubbleByKey.get(answerKey);
  if (!el) return null;
  if (!el.isConnected) {
    bubbleByKey.delete(answerKey);
    return null;
  }
  return el;
}

export function resolveFocusedAnswerBubble(): HTMLElement | null {
  const active = uiActiveElement();
  if (!active) return null;
  if (active.classList.contains("bonsai-chat-ai-bubble")) return active;
  return active.closest(".bonsai-chat-ai-bubble") as HTMLElement | null;
}
