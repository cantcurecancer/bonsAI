/**
 * Title: Plugin shell wrapper
 * Purpose: Root layout container that injects scoped bonsAI stylesheet and hosts the plugin subtree.
 * Used for: index.tsx as the outermost Deck/QAM wrapper around all tab panels.
 * Solves: Centralizes scope ref, CSS variables, and global bonsai-scope rules in one place.
 * Does not: Own tab routing, settings persistence, or focus graphs — see useBonsaiPluginShell.
 */
import React from "react";

import { buildBonsaiScopeStylesheet } from "../styles/bonsaiScopeStylesheet";

export type BonsaiPluginShellProps = {
  scopeRef: React.RefObject<HTMLDivElement | null>;
  scopeStyle: React.CSSProperties;
  children: React.ReactNode;
};

/** Root layout wrapper: scoped Deck/QAM stylesheet + plugin subtree. */
export const BonsaiPluginShell: React.FC<BonsaiPluginShellProps> = ({ scopeRef, scopeStyle, children }) => (
  <div ref={scopeRef} className="bonsai-scope" style={scopeStyle}>
    <style>{buildBonsaiScopeStylesheet()}</style>
    {children}
  </div>
);
