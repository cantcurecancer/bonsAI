/**
 * Title: Steam nav focus registry
 * Purpose: Move gamepad focus between separate navigation containers using Steam's own API.
 * Used for: liveTurnFocusGraph hops that leave the reply row (session context strip, chat-slot row,
 *           the permission-hint rows below the transcript).
 * Solves: A DOM `.focus()` does NOT transfer Steam's gamepad focus ownership across containers.
 *         Measured on device 2026-08-04: focusing the session context strip from the reply row set
 *         `document.activeElement` to the strip, left `gpfocus` on Retry, and a moment later cleared
 *         the ring entirely — so Steam went on routing every D-pad press to the reply row, which the
 *         probe log confirmed (three presses, all delivered to the utility row, each reporting a
 *         successful "move"). Steam's own transfer is `navRef.current.TakeFocus()`, which calls
 *         `BTakeFocus` on the nav node.
 *         Recurred 2026-09-04 (build 49241e7, PERM-JUMP-01): the vac-check deny row's own
 *         `focusChatPermissionHintRow` used a plain `focusDeckOwner` instead of this registry — same
 *         failure (ring did not follow) plus a second one it introduced: Steam's real Focusables
 *         carry no `tabindex` attribute on device at all (Retry, Copy and Open Permissions every one
 *         read `null`), so `focusDeckOwner`'s "stamp `tabindex="-1"` when none is present" guard
 *         never actually protects anything — it stamped the wrapping `.Panel.Focusable` and removed
 *         the whole row from Steam's nav graph. `focusDeckOwner` and any other plain `focus()` are
 *         therefore off the table for that hop; this registry is the only sanctioned way in.
 * Does not: Replace plain `focus()` for hops *within* one container. Those work — the spoiler fence
 *           is focused that way and Steam's ring follows it — and this registry is not needed there.
 */

export type NavFocusId = "session-context-strip" | "chat-slot-row" | "preset-carousel" | "unified-input"
  | "tab-bar"
  /** The troubleshooting Ask hint and vac-check deny rows below the transcript — see
   *  MainTabChatTranscript.tsx's `focusChatPermissionHintRow`. Two ids, not one, because both rows
   *  can in principle be mounted at once and a single shared id would let the later-mounted row's
   *  registration silently clobber the other's. */
  | "chat-perm-hint-troubleshoot" | "chat-perm-hint-deny"
  /** One per Permissions-tab capability row — see permissionJumpRegistry.ts's `focusOwnerById`.
   *  Recurred 2026-09-05 (build 4/517804a, PERM-JUMP-01 step 3): the jump landed on "Back to Main"
   *  instead of the armed toggle, because `focusOwnerById` climbed to a registered element and
   *  called a plain `.focus()` on it — the same cross-container failure this whole file exists
   *  for, just in a file neither chat fix had touched yet. */
  | "permissions-row-game-context-read" | "permissions-row-filesystem-write"
  | "permissions-row-steam-web-api" | "permissions-row-microphone-access"
  /** One per tab body except Main (TabBodyFocusRoot): the collapsing bar's Down hands the ring here. */
  | `tab-body:${string}`;

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

/** Test-only reset. */
export function resetNavFocusRegistry(): void {
  navRefs.clear();
}
