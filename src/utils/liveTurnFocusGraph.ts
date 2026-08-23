/**
 * Title: Live turn focus graph
 * Purpose: D-pad focus helpers for the live Ask turn (answer bubble → strategy branches → checklist → reply actions).
 * Used for: Main-tab chat transcript focus graph on Steam Deck.
 * Solves: Decky focus lives on `.Panel.Focusable`; inner button focus and querySelector hops fail on device.
 * Does not: Register reply stop DOM nodes (see replyStopRegistry) or render turn UI.
 */

import { focusRegisteredReplyStop } from "./replyStopRegistry";
import { elementHasFocus, getUiDocument } from "./uiDocument";
import { takeNavFocus } from "./navFocusRegistry";

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

/**
 * Slot for any turn by id — the archived-turn counterpart to `queryLiveTurnSlot`.
 *
 * Every helper below takes a slot and searches inside it, so they work on an archived turn as
 * soon as one can be resolved. Needed because a completed Ask is now archived and expanded rather
 * than left live (useChatSlots.applySlotTranscript), which put Show details and the chip ladder on
 * a slot that `queryLiveTurnSlot` cannot see. Without this the row renders with no move handlers
 * and D-pad Down escapes to whatever follows in document order.
 */
export function queryTurnSlot(
  turnId: string,
  root?: HTMLElement | Document | null
): HTMLElement | null {
  const scope = root ?? getUiDocument();
  const selector = `[data-bonsai-turn-id="${turnId}"]`;
  const header =
    scope.querySelector?.(selector) ?? getUiDocument().querySelector(selector);
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

/**
 * The session context strip lives outside the reply row's navigation container, so it needs Steam's
 * own transfer rather than a DOM focus — see navFocusRegistry for the measurement. The `focusDeckOwner`
 * fallback stays for the case where Decky has not populated the nav ref yet; it moves
 * `activeElement` even when it cannot move the gamepad ring, which is still better than nothing for
 * the mouse and touch paths.
 */
export function focusSessionContextStrip(): boolean {
  if (takeNavFocus("session-context-strip")) return true;
  const doc = getUiDocument();
  const strip =
    doc.querySelector<HTMLElement>(".bonsai-session-context-strip") ??
    doc.querySelector<HTMLElement>(".bonsai-session-context-strip button");
  return focusDeckOwner(strip);
}

/**
 * Last turn row inside the expanded session context strip.
 *
 * The strip's own chip ladder sits below those rows, and the ladder swallows Up at its first chip.
 * Without a target here the press had nowhere to go and the ring stayed in the ladder — the trap
 * recorded on device 2026-08-23. Rows are ordinary siblings, so once focus is on one, Steam's own
 * navigation carries it the rest of the way up to the header.
 */
export function focusLastSessionContextRow(): boolean {
  const rows = getUiDocument().querySelectorAll<HTMLElement>(".bonsai-session-context-row");
  return focusDeckOwner(rows.length ? rows[rows.length - 1] : null);
}

/**
 * Dev-only Ask diagnostics block — present only with desktop verbose logging on, so a miss here is
 * the normal case rather than a failure.
 */
export function focusAskDiagnostics(): boolean {
  if (takeNavFocus("ask-diagnostics")) return true;
  const host = getUiDocument().querySelector<HTMLElement>(".bonsai-ask-diagnostics");
  if (!host) return false;
  return focusDeckOwner(host.querySelector<HTMLElement>("button") ?? host);
}

/** Down from utility row: inline ladder → collapsed hint → Ask diagnostics → session strip. */
export function focusDownFromReplyUtilityRow(liveSlot: HTMLElement | null): boolean {
  if (focusContextChipLadder(liveSlot)) return true;
  if (focusContextHint(liveSlot)) return true;
  if (focusAskDiagnostics()) return true;
  return focusSessionContextStrip();
}

/**
 * Any currently-mounted inline chip ladder, regardless of which turn (live or archived) owns it.
 *
 * Only one turn is ever expanded at a time, so at most one `.bonsai-chip-ladder` sits in the
 * transcript — querying without a specific slot means the caller does not need to know which turn
 * it belongs to.
 *
 * The session context strip renders a ladder of its own with the same class, so the match has to
 * exclude anything inside the strip. Taking the first DOM match instead is what trapped the ring
 * on device 2026-08-23 (`DeckRecord_20260823_170847_game.mkv`): with *Show details* collapsed there
 * is no inline ladder at all, so the strip's own ladder was the only match, and the strip header's
 * Up handler — which routes through here — fed focus straight back down into the strip it was
 * trying to leave. Nothing above the strip was reachable until the panel was closed.
 */
export function focusAnyContextChipLadder(): boolean {
  const ladders = Array.from(
    getUiDocument().querySelectorAll<HTMLElement>(".bonsai-chip-ladder"),
  );
  const inlineLadder = ladders.find((el) => !el.closest(".bonsai-session-context-strip"));
  return focusDeckOwner(inlineLadder ?? null);
}

/**
 * Up from whatever sits below the ladder (Ask diagnostics / session context strip): ladder →
 * collapsed hint → utility row (Retry / Show details).
 *
 * This is the missing reverse of `focusDownFromReplyUtilityRow`. Without it, Up from Ask
 * diagnostics or the session context strip had no explicit handler and fell through to Steam's
 * default geometry navigation, which landed on Show/Hide details directly and skipped the ladder —
 * once a chip carousel scrolled past its last chip and exited downward, there was no way back in.
 */
export function focusUpFromBelowContextChipLadder(liveSlot: HTMLElement | null): boolean {
  if (focusAnyContextChipLadder()) return true;
  if (focusContextHint(liveSlot)) return true;
  return focusReplyUtilityRow(liveSlot);
}

/*
 * `focusSpoilerRevealIn` was removed 2026-08-04. It focused the first masked fence in a bubble on
 * every Down press regardless of where that fence was, and the answer-bubble Down handler already
 * diverts to fences that are actually on screen — see handleAnswerBubbleMoveDown and
 * spoilerFenceRegistry.
 */
