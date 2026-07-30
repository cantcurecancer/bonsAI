/**
 * Title: UI scale scope bridge
 * Purpose: Publish active UI scale CSS variables for Decky modals rendered outside the QAM React tree.
 * Used for: useUiScaleProfile and BonsaiModalScope portal wrappers.
 * Solves: Modal typography matches in-panel scale after showModal() portals.
 * Does not: Measure viewport or compute profiles — see useUiScaleProfile.
 */
import type React from "react";

let publishedUiScaleScopeStyle: React.CSSProperties = {};

/** showModal() portals sit outside the QAM React tree — publish scale vars for BonsaiModalScope. */
export function publishUiScaleScopeStyle(style: React.CSSProperties): void {
  publishedUiScaleScopeStyle = style;
}

export function readPublishedUiScaleScopeStyle(): React.CSSProperties {
  return publishedUiScaleScopeStyle;
}
