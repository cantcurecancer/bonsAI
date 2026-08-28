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

/**
 * Steam's navigation node for each bubble, captured via the Focusable `navRef` prop.
 *
 * Exists for one caller: the reply-actions row handing the ring *into* the bubble (Up onto a
 * glossary chip). The bubble is a different navigation container, and a DOM `focus()` across that
 * boundary moves `activeElement` while Steam's ring stays put — `TakeFocus` first is the sanctioned
 * transfer, same shape as `utilityNavRef` in buildReplyActionsElement and the preset carousel's
 * navFocusRegistry entry.
 */
type BubbleNavHolder = { current: { TakeFocus?: (gamepad?: boolean) => unknown } | null };
const bubbleNavByKey = new Map<string, BubbleNavHolder>();

/** Called during buildAnswerBubbleElement's render; the holder fills in when Decky mounts it. */
export function registerAnswerBubbleNav(answerKey: string, holder: BubbleNavHolder): void {
  if (!answerKey) return;
  bubbleNavByKey.set(answerKey, holder);
}

/**
 * Hand Steam's gamepad focus to this bubble's navigation container. Best-effort by design: the
 * caller must still land focus on a concrete element afterwards and verify with `elementHasFocus`
 * — that verification, not this call, is what reports success.
 */
export function takeAnswerBubbleNavFocus(answerKey: string): void {
  try {
    bubbleNavByKey.get(answerKey)?.current?.TakeFocus?.(true);
  } catch {
    /* fall through — the caller's focus + verify decides the outcome */
  }
}

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
