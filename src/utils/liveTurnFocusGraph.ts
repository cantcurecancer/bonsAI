/** D-pad focus helpers for the live Ask turn (answer → strategy → feedback). */

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
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  if (target.contains(document.activeElement)) return true;
  el.focus({ preventScroll: true });
  return el.contains(document.activeElement);
}

export function queryLiveTurnSlot(root?: HTMLElement | Document | null): HTMLElement | null {
  const scope = root ?? document;
  const header =
    scope instanceof HTMLElement
      ? scope.querySelector(".bonsai-chat-turn-row-header--live")
      : scope.querySelector?.(".bonsai-chat-turn-row-header--live") ??
        document.querySelector(".bonsai-chat-turn-row-header--live");
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
  const reply = liveSlot?.querySelector(".bonsai-chat-reply-actions");
  if (!reply) return false;
  const helpful =
    reply.querySelector<HTMLElement>('button[aria-label="Mark reply helpful"]') ??
    reply.querySelector<HTMLElement>("button.bonsai-chat-secondary-btn");
  return focusDeckOwner(helpful);
}

export function focusReplyUtilityRow(liveSlot: HTMLElement | null): boolean {
  const reply = liveSlot?.querySelector(".bonsai-chat-reply-actions");
  if (!reply) return false;
  const utility =
    reply.querySelector<HTMLElement>(".bonsai-chat-reply-actions-row--utility button") ??
    reply.querySelector<HTMLElement>('button[aria-label="Retry same prompt"]');
  return focusDeckOwner(utility);
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

export function focusContextHint(liveSlot: HTMLElement | null): boolean {
  const hint =
    liveSlot?.querySelector<HTMLElement>(".bonsai-context-hint") ??
    liveSlot?.querySelector<HTMLElement>(".bonsai-context-hint button");
  return focusDeckOwner(hint);
}

export function focusSessionContextStrip(): boolean {
  const strip =
    document.querySelector<HTMLElement>(".bonsai-session-context-strip") ??
    document.querySelector<HTMLElement>(".bonsai-session-context-strip button");
  return focusDeckOwner(strip);
}

/** Down from utility row (Retry / Show details): inline context hint → session strip. */
export function focusDownFromReplyUtilityRow(liveSlot: HTMLElement | null): boolean {
  if (focusContextHint(liveSlot)) return true;
  return focusSessionContextStrip();
}

export function focusSpoilerRevealIn(root: HTMLElement | null): boolean {
  if (!root) return false;
  const spoiler = root.querySelector<HTMLElement>(".bonsai-spoiler-reveal-target");
  return focusDeckOwner(spoiler);
}
