/**
 * Title: Plugin shell wrapper
 * Purpose: Root layout container that injects scoped bonsAI stylesheet and hosts the plugin subtree.
 * Used for: index.tsx as the outermost Deck/QAM wrapper around all tab panels.
 * Solves: Centralizes scope ref, CSS variables, and global bonsai-scope rules in one place.
 * Does not: Own tab routing, settings persistence, or focus graphs — see useBonsaiPluginShell.
 */
import React from "react";

import { buildBonsaiScopeStylesheet } from "../styles/bonsaiScopeStylesheet";
import { rememberUiDocument } from "../utils/uiDocument";

export type BonsaiPluginShellProps = {
  scopeRef: React.RefObject<HTMLDivElement | null>;
  scopeStyle: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * Root layout wrapper: scoped Deck/QAM stylesheet + plugin subtree.
 *
 * The ref callback also teaches `uiDocument` which document the UI renders into. This node is the
 * outermost element the plugin owns, so it mounts before any tab body — which is the point. The
 * three registries that also call `rememberUiDocument` (answer bubble, answer stop, spoiler fence)
 * only run once an *answer* exists, so before the first reply every `getUiDocument()` caller was
 * still falling back to SharedJSContext's shell document — including the blur-on-submit in
 * `useBonsaiAskOrchestration`, which is on the first-Ask path by definition.
 */
export const BonsaiPluginShell: React.FC<BonsaiPluginShellProps> = ({ scopeRef, scopeStyle, children }) => (
  <div
    ref={(el: HTMLDivElement | null) => {
      (scopeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      rememberUiDocument(el);
    }}
    className="bonsai-scope"
    style={scopeStyle}
  >
    <style>{buildBonsaiScopeStylesheet()}</style>
    {children}
  </div>
);
