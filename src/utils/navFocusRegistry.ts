/**
 * Title: Steam nav focus registry
 * Purpose: Move gamepad focus between separate navigation containers using Steam's own API.
 * Used for: liveTurnFocusGraph hops that leave the reply row (session context strip, Ask diagnostics).
 * Solves: A DOM `.focus()` does NOT transfer Steam's gamepad focus ownership across containers.
 *         Measured on device 2026-08-04: focusing the session context strip from the reply row set
 *         `document.activeElement` to the strip, left `gpfocus` on Retry, and a moment later cleared
 *         the ring entirely — so Steam went on routing every D-pad press to the reply row, which the
 *         probe log confirmed (three presses, all delivered to the utility row, each reporting a
 *         successful "move"). Steam's own transfer is `navRef.current.TakeFocus()`, which calls
 *         `BTakeFocus` on the nav node.
 * Does not: Replace plain `focus()` for hops *within* one container. Those work — the spoiler fence
 *           is focused that way and Steam's ring follows it — and this registry is not needed there.
 */

export type NavFocusId = "session-context-strip" | "ask-diagnostics";

/** The object Steam assigns to a `navRef`: a thin wrapper over the nav node. */
type SteamNavNode = { TakeFocus?: (gamepad?: boolean) => unknown };

/** What a caller passes in — a React ref object Steam populates. */
export type NavRefHolder = { current: SteamNavNode | null | undefined };

const navRefs = new Map<NavFocusId, NavRefHolder>();

/**
 * Register a `navRef` holder for a focus target.
 *
 * Pass the same object to the component's `navRef` prop. Steam fills in `.current` once the node is
 * mounted and navigable; until then `takeNavFocus` simply reports false and the caller falls back.
 */
export function registerNavFocus(id: NavFocusId, holder: NavRefHolder | null): void {
  if (holder) navRefs.set(id, holder);
  else navRefs.delete(id);
}

/**
 * Hand gamepad focus to a registered target. Returns false when the target is not mounted, when
 * Decky did not populate the ref, or when Steam declines the move — in every one of those cases the
 * caller should fall through to its next option rather than treat the press as handled.
 */
export function takeNavFocus(id: NavFocusId): boolean {
  const node = navRefs.get(id)?.current;
  if (!node || typeof node.TakeFocus !== "function") return false;
  try {
    // `true` marks this as a gamepad-sourced move, which is what a D-pad press is.
    return node.TakeFocus(true) !== false;
  } catch {
    return false;
  }
}

/** Whether a target is registered and ready — useful for ordering a focus ladder. */
export function hasNavFocusTarget(id: NavFocusId): boolean {
  const node = navRefs.get(id)?.current;
  return Boolean(node && typeof node.TakeFocus === "function");
}

/** Test-only reset. */
export function resetNavFocusRegistry(): void {
  navRefs.clear();
}
