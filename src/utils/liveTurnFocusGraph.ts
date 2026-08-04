/**
 * Title: Live turn focus graph
 * Purpose: D-pad focus helpers for the live Ask turn (answer bubble → strategy branches → checklist → reply actions).
 * Used for: Main-tab chat transcript focus graph on Steam Deck.
 * Solves: Decky focus lives on `.Panel.Focusable`; inner button focus and querySelector hops fail on device.
 * Does not: Register reply stop DOM nodes (see replyStopRegistry) or render turn UI.
 */

import { focusRegisteredReplyStop } from "./replyStopRegistry";
import { elementHasFocus, getUiDocument } from "./uiDocument";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function deckNavHandlers(handlers: Record<string, () => boolean | void>): Record<string, unknown> {
  return handlers as unknown as Record<string, unknown>;
}

/**
 * Deck gamepad focus lives on `.Panel.Focusable`, not the inner native `<button>`.
 * Focusing the inner node often "succeeds" for activeElement checks while Decky still
 * treats the previous Focusable as the owner — then the next D-pad hop skips siblings.
 */
export function focusDeckOwner(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  const panel = (
    el.matches(".Panel.Focusable") ? el : el.closest(".Panel.Focusable")
  ) as HTMLElement | null;
  const target = panel ?? el;
  // Keep Decky's own tabindex; replacing "0" with "-1" removes the node from Steam's nav graph.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  // Asked of the element's own document: the global one belongs to SharedJSContext (uiDocument.ts),
  // so the old `contains(document.activeElement)` check reported failure on every successful move.
  if (elementHasFocus(target)) return true;
  el.focus({ preventScroll: true });
  return elementHasFocus(el);
}

export function queryLiveTurnSlot(root?: HTMLElement | Document | null): HTMLElement | null {
  // Note the fallbacks resolve to the UI document, not the global one — see uiDocument.ts.
  const scope = root ?? getUiDocument();
  const header =
    scope.querySelector?.(".bonsai-chat-turn-row-header--live") ??
    getUiDocument().querySelector(".bonsai-chat-turn-row-header--live");
  return (header?.closest(".bonsai-chat-turn-slot") as HTMLElement | null) ?? null;
}

function focusablesIn(container: ParentNode): HTMLElement[] {
  const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const visible = all.filter((el) => el.getClientRects().length > 0);
  return visible.length > 0 ? visible : all;
}

function branchButtons(liveSlot: HTMLElement | null): HTMLElement[] {
  const branch = liveSlot?.querySelector(".bonsai-strategy-branch-picker");
  if (!branch) return [];
  const preferred = Array.from(
    branch.querySelectorAll<HTMLElement>("button.bonsai-strategy-branch-btn, button.bonsai-chat-secondary-btn")
  ).filter((b) => !(b as HTMLButtonElement).disabled);
  if (preferred.length) return preferred;
  return Array.from(branch.querySelectorAll<HTMLElement>("button")).filter(
    (b) => !(b as HTMLButtonElement).disabled
  );
}

export function focusLiveAnswerBubble(liveSlot: HTMLElement | null): boolean {
  const bubble = liveSlot?.querySelector<HTMLElement>(".bonsai-chat-ai-bubble");
  return focusDeckOwner(bubble);
}

export function focusStrategyBranchButton(
  liveSlot: HTMLElement | null,
  which: "first" | "last" | number
): boolean {
  const buttons = branchButtons(liveSlot);
  if (!buttons.length) return false;
  const target =
    typeof which === "number"
      ? buttons[which]
      : which === "first"
        ? buttons[0]
        : buttons[buttons.length - 1];
  return focusDeckOwner(target);
}

export function focusStrategyChecklistToggle(liveSlot: HTMLElement | null, which: "first" | "last"): boolean {
  const panel = liveSlot?.querySelector(".bonsai-strategy-checklist-panel");
  if (!panel) return false;
  const toggles = focusablesIn(panel);
  const target = which === "first" ? toggles[0] : toggles[toggles.length - 1];
  return focusDeckOwner(target);
}

export function focusReplyThumbsRow(liveSlot: HTMLElement | null): boolean {
  return focusReplyHelpful(liveSlot);
}

/**
 * Focus a reply-actions 2x2 cell via the mount-time ref registry.
 * `document.querySelector` returns null on Deck for these nodes (proven ok/found:false);
 * registered Button refs are the reliable focus targets.
 */
export function focusReplyStop(
  _liveSlot: HTMLElement | null,
  stop: "helpful" | "not-really" | "retry" | "show-details",
): boolean {
  return focusRegisteredReplyStop(stop);
}

export function focusReplyHelpful(liveSlot: HTMLElement | null): boolean {
  return focusReplyStop(liveSlot, "helpful");
}

export function focusReplyNotReally(liveSlot: HTMLElement | null): boolean {
  return focusReplyStop(liveSlot, "not-really");
}

export function focusReplyRetry(liveSlot: HTMLElement | null): boolean {
  return focusReplyStop(liveSlot, "retry");
}

export function focusReplyShowDetails(liveSlot: HTMLElement | null): boolean {
  return focusReplyStop(liveSlot, "show-details");
}

export function focusReplyUtilityRow(liveSlot: HTMLElement | null): boolean {
  if (focusReplyRetry(liveSlot)) return true;
  return focusReplyShowDetails(liveSlot);
}

export function focusLastReplyChip(liveSlot: HTMLElement | null): boolean {
  const reply = liveSlot?.querySelector(".bonsai-chat-reply-actions");
  if (!reply) return false;
  const chips = reply.querySelectorAll<HTMLElement>(
    ".bonsai-chat-reply-actions-row--chips button.bonsai-chat-secondary-btn"
  );
  const last = chips[chips.length - 1];
  return focusDeckOwner(last);
}

/** After answer bubble scroll is exhausted: branch → checklist → thumbs. */
export function focusDownFromLiveAnswerBubble(liveSlot: HTMLElement | null): boolean {
  if (focusStrategyBranchButton(liveSlot, "first")) return true;
  if (focusStrategyChecklistToggle(liveSlot, "first")) return true;
  if (focusReplyThumbsRow(liveSlot)) return true;
  return focusReplyUtilityRow(liveSlot);
}

/** Up from thumbs / reply chrome: checklist → branch → answer bubble. */
export function focusUpFromReplyActions(liveSlot: HTMLElement | null): boolean {
  if (focusStrategyChecklistToggle(liveSlot, "last")) return true;
  if (focusStrategyBranchButton(liveSlot, "last")) return true;
  return focusLiveAnswerBubble(liveSlot);
}

/** Down from last branch option: checklist → thumbs. */
export function focusDownFromStrategyBranch(liveSlot: HTMLElement | null): boolean {
  if (focusStrategyChecklistToggle(liveSlot, "first")) return true;
  return focusReplyThumbsRow(liveSlot);
}

/** Up from first checklist row: last branch → answer bubble. */
export function focusUpFromStrategyChecklist(liveSlot: HTMLElement | null): boolean {
  if (focusStrategyBranchButton(liveSlot, "last")) return true;
  return focusLiveAnswerBubble(liveSlot);
}

/** Up from first branch option: answer bubble. */
export function focusUpFromStrategyBranch(liveSlot: HTMLElement | null): boolean {
  return focusLiveAnswerBubble(liveSlot);
}

/** Up from utility row (Retry): last chip → thumbs → strategy stack. */
export function focusUpFromReplyUtilityRow(liveSlot: HTMLElement | null): boolean {
  if (focusLastReplyChip(liveSlot)) return true;
  return focusUpFromReplyActions(liveSlot);
}

export function focusContextChipLadder(liveSlot: HTMLElement | null): boolean {
  const ladder = liveSlot?.querySelector<HTMLElement>(".bonsai-chip-ladder");
  return focusDeckOwner(ladder);
}

export function focusContextHint(liveSlot: HTMLElement | null): boolean {
  const hint =
    liveSlot?.querySelector<HTMLElement>(".bonsai-context-hint") ??
    liveSlot?.querySelector<HTMLElement>(".bonsai-context-hint button");
  return focusDeckOwner(hint);
}

export function focusSessionContextStrip(): boolean {
  const doc = getUiDocument();
  const strip =
    doc.querySelector<HTMLElement>(".bonsai-session-context-strip") ??
    doc.querySelector<HTMLElement>(".bonsai-session-context-strip button");
  return focusDeckOwner(strip);
}

/** Down from utility row (Retry / Show details): inline ladder → collapsed hint → session strip. */
export function focusDownFromReplyUtilityRow(liveSlot: HTMLElement | null): boolean {
  if (focusContextChipLadder(liveSlot)) return true;
  if (focusContextHint(liveSlot)) return true;
  return focusSessionContextStrip();
}

/*
 * `focusSpoilerRevealIn` was removed 2026-08-04. It focused the first masked fence in a bubble on
 * every Down press regardless of where that fence was, and the answer-bubble Down handler already
 * diverts to fences that are actually on screen — see handleAnswerBubbleMoveDown and
 * spoilerFenceRegistry.
 */
