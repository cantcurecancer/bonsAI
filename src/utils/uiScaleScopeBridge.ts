import type React from "react";

let publishedUiScaleScopeStyle: React.CSSProperties = {};

/** showModal() portals sit outside the QAM React tree — publish scale vars for BonsaiModalScope. */
export function publishUiScaleScopeStyle(style: React.CSSProperties): void {
  publishedUiScaleScopeStyle = style;
}

export function readPublishedUiScaleScopeStyle(): React.CSSProperties {
  return publishedUiScaleScopeStyle;
}
