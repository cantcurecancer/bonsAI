/**
 * Title: Modal scope wrapper
 * Purpose: Inject bonsai-scope CSS and UI-scale bridge styles for Decky showModal() portals.
 * Used for: PullModelsModal, OllamaModelsHubModal, and other modals rendered outside QAM .bonsai-scope.
 * Solves: Keeps modal typography and glass rules consistent when content escapes the main plugin tree.
 * Does not: Own modal focus graphs or RPC — children define interaction and data loading.
 */
import React from "react";

import { buildModalPortalStylesheet } from "../styles/bonsaiScopeStylesheet";
import { useUiScaleScopeStyle } from "../context/UiScaleContext";
import { readPublishedUiScaleScopeStyle } from "../utils/uiScaleScopeBridge";

export type BonsaiModalScopeProps = {
  children: React.ReactNode;
  className?: string;
  shellRef?: React.RefObject<HTMLDivElement | null>;
};

/** Injects scoped Pull Models CSS for content rendered via Decky `showModal()` (outside QAM `.bonsai-scope`). */
export function BonsaiModalScope({ children, className, shellRef }: BonsaiModalScopeProps) {
  const contextStyle = useUiScaleScopeStyle();
  const bridgeStyle = readPublishedUiScaleScopeStyle();
  const mergedClass = ["bonsai-scope", className].filter(Boolean).join(" ");
  return (
    <div ref={shellRef} className={mergedClass} style={{ ...bridgeStyle, ...contextStyle }}>
      <style>{buildModalPortalStylesheet()}</style>
      {children}
    </div>
  );
}
