/**
 * Title: UI document
 * Purpose: Resolve the `Document` the plugin's own UI is actually rendered into.
 * Used for: Focus and navigation helpers that need `activeElement` or a document-wide query.
 * Solves: Decky runs plugin JS in SteamOS's **SharedJSContext**, whose `document` is a 14-element
 *         shell (`#root` plus a hidden modal overlay). The QAM UI is rendered into a *separate*
 *         popup document (CEF target `QuickAccess_uid2`, ~373 elements, no React globals of its
 *         own). So inside plugin code the global `document` describes a page that contains none of
 *         our markup: `document.querySelector(".bonsai-…")` is always null, `document.activeElement`
 *         is always that shell's `<body>`, and `document.contains(ourElement)` is always false.
 *         Measured on device 2026-08-04 over CEF remote debugging; see docs/audit/decky-realms.md.
 * Does not: Hold element references — see answerBubbleElRegistry, spoilerFenceRegistry,
 *           replyStopRegistry. Refs from React are still the most reliable way to reach a node;
 *           this module only covers the cases where there is no ref to start from.
 */

let uiDocument: Document | null = null;

/**
 * Learn the UI document from any mounted element.
 *
 * Ref callbacks are the reliable source: the node they hand back belongs to the popup document,
 * so `ownerDocument` is the one every later `activeElement` / query has to be asked about.
 *
 * Seeded from `BonsaiPluginShell`'s root ref, which is the earliest node the plugin owns. The
 * answer-bubble, answer-stop and spoiler-fence registries call this too, but each only runs once a
 * reply has rendered — relying on those alone left every caller below on the shell document for
 * the whole pre-first-answer session. A null element is ignored, so unmount does not clear it.
 */
export function rememberUiDocument(el: Node | null | undefined): void {
  const doc = el?.ownerDocument ?? null;
  if (doc) uiDocument = doc;
}

/** The document the UI lives in; the global one until the shell mounts. */
export function getUiDocument(): Document {
  return uiDocument ?? document;
}

/**
 * `activeElement` from the UI document rather than SharedJSContext's empty shell.
 *
 * Note the cast: `instanceof HTMLElement` is false for popup-document nodes, because that realm has
 * its own `HTMLElement` constructor. Never brand-check a node that crossed a realm boundary.
 */
export function uiActiveElement(): HTMLElement | null {
  return (getUiDocument().activeElement as HTMLElement | null) ?? null;
}

/**
 * True when `el` holds focus, asked of `el`'s own document.
 *
 * This is the check every "did my focus() land?" test needs. `el.contains(document.activeElement)`
 * — the shape this repo used in four places — compares against the wrong document and so answers
 * false even when focus moved correctly.
 */
export function elementHasFocus(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  const active = el.ownerDocument?.activeElement ?? null;
  return Boolean(active && (el === active || el.contains(active)));
}

/**
 * Does Steam's gamepad ring sit on `el`, or inside it?
 *
 * `elementHasFocus` answers the DOM's question — where is `activeElement`? On a
 * Steam Deck that is a *different question* from "where is the gamepad ring",
 * and the two routinely disagree: Steam moves `.gpfocus` without moving
 * `activeElement`.
 *
 * Measured on device 2026-08-26 (MICRO-04). `focusedStop()` in
 * buildReplyActionsElement asked which of the four reply stops had focus using
 * `elementHasFocus`, could not tell the columns apart, and fell through to the
 * left column every time — so Down from *Not really* landed on *Retry* instead
 * of *Show details*, and Up from *Show details* landed on *Helpful* instead of
 * *Not really*. The right column was unreachable vertically.
 *
 * No ring in the document means desktop, jsdom, or a moment where nothing owns
 * gamepad focus; `activeElement` is the best answer available there, so fall
 * back rather than reporting a confident "no".
 *
 * Containment is deliberately one-way. `el.contains(ring)` covers a registered
 * wrapper whose inner node holds the ring. The reverse — `ring.contains(el)` —
 * is NOT checked: when the ring sits on a container, every stop inside it would
 * match and the first entry in REPLY_STOP_ORDER would win, which is the same
 * left-column bug wearing a different hat.
 */
export function elementHasGamepadFocus(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  // Reading Steam's ring marker is not a focus-target lookup: the class is stamped
  // on whichever element Steam picks, so there is nothing to register at creation
  // time and this query IS the measurement.
  // focus-patterns-allow: observing the gamepad ring, not searching for a target.
  const ring = el.ownerDocument?.querySelector<HTMLElement>(".gpfocus") ?? null;
  if (!ring) return elementHasFocus(el);
  return el === ring || el.contains(ring);
}

/** Test-only reset. */
export function resetUiDocument(): void {
  uiDocument = null;
}
