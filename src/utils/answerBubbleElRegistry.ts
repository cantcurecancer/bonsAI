/**
 * Title: Answer bubble element registry
 * Purpose: Register mounted answer bubble DOM nodes by answer key for focus graph navigation.
 * Used for: buildAnswerBubbleElement, answerBubbleNavigation, and liveTurnFocusGraph.
 * Solves: Focus hops without asking the global `document`, which under Decky is the wrong
 *         document entirely — see uiDocument.ts.
 * Does not: Own the walk between stops — see answerBubbleNavigation.
 */
import { rememberUiDocument, uiGamepadFocusElement } from "./uiDocument";

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

/**
 * The answer bubble the gamepad ring is currently inside, or null when it is elsewhere.
 *
 * Reads the ring rather than `activeElement`, and the difference is not cosmetic. This is the FIRST
 * thing `captureBubble` and `resolveAnswerBubbleEl` try, and both use `??` to fall back — a guard
 * that only catches a *null* answer. `activeElement` on device does not come back null; it comes
 * back stale, often pointing into a previous turn's bubble. That returns a real, wrong element, the
 * fallback never fires, and `captureBubble` then re-registers the wrong bubble under this answer's
 * key. Everything downstream inherits it: `bubble.contains(fence)` is false for a fence that is on
 * screen and focusable, so the masked-spoiler diversion in `handleAnswerBubbleMoveDown` finds
 * nothing and Down walks straight past to the reply actions.
 *
 * That is the shape measured on device 2026-08-26 (`runs/SPOILER-REVEAL-reachability.json`): a
 * 10-step walk went bubble -> Helpful -> Retry -> ... and never reached a fence whose own
 * preconditions — Focusable, tabindex 0, inViewport, inScroller — all held.
 *
 * Same defect as MICRO-04, one file further up the chain than the roadmap's lead guessed.
 */
export function resolveFocusedAnswerBubble(): HTMLElement | null {
  const active = uiGamepadFocusElement();
  if (!active) return null;
  if (active.classList.contains("bonsai-chat-ai-bubble")) return active;
  return active.closest(".bonsai-chat-ai-bubble") as HTMLElement | null;
}
