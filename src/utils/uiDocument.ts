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
 */
export function rememberUiDocument(el: Node | null | undefined): void {
  const doc = el?.ownerDocument ?? null;
  if (doc) uiDocument = doc;
}

/** The document the UI lives in; the global one until the first element mounts. */
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

/** Test-only reset. */
export function resetUiDocument(): void {
  uiDocument = null;
}
