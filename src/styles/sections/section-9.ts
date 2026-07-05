import {
  ASK_LABEL_COLOR,
  ASK_LABEL_READY_COLOR,
  ASK_READY_STATE_TRANSITION_MS,
  BONSAI_PLUGIN_SIDE_PAD_PX,
  BONSAI_CHAT_INPUT_TO_TRANSCRIPT_GAP_PX,
  BONSAI_CHAT_RESPONSE_STACK_MARGIN_TOP_PX,
  TAB_TITLE_DEBUG_TAB_ICON_PX,
  TAB_TITLE_ICON_PX,
  TAB_TITLE_MAIN_ICON_SHIFT_X_PX,
  TAB_TITLE_MAIN_TAB_ICON_PX,
  TAB_TITLE_TAB_CELL_PX,
  TAB_TITLE_TAB_GAP_PX,
  TAB_STRIP_BODY_GAP_PX,
  UNIFIED_INPUT_ICON_STRIP_PAD_X_PX,
  UNIFIED_TEXT_FONT_PX,
  UNIFIED_TEXT_INSET_BOTTOM_PX,
  UNIFIED_TEXT_INSET_LEFT_PX,
  UNIFIED_TEXT_INSET_RIGHT_PX,
  UNIFIED_TEXT_INSET_TOP_PX,
  UNIFIED_TEXT_LINE_HEIGHT,
} from "../../features/unified-input/constants";

/** Multiply base px tokens by `--bonsai-ui-scale` on `.bonsai-scope`. */
export function uiScalePx(px: number): string {
  return `calc(${px}px * var(--bonsai-ui-scale, 1))`;
}

export function buildSection9Section(): string {
  return `
/* ==========================================================================
           9. MISC FIXES (SLIDERS, ETC)
           ========================================================================== */
        .bonsai-scope .bonsai-preset-carousel-slot { width: 100%; min-width: 0; box-sizing: border-box; }
        .bonsai-scope [class*="SliderControlPanelGroup"],
        .bonsai-scope [class*="SliderControlAndNotches"] { width: 100% !important; min-width: 0 !important; max-width: 100% !important; }
        .bonsai-scope [class*="SliderControlPanelGroup"] > div,
        .bonsai-scope [class*="SliderControlAndNotches"] > div { min-width: 0 !important; }`;
}
