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

export function buildSection2Section(): string {
  return `
/* ==========================================================================
           2. TAB CAROUSEL LAYOUT (THE "GHOST NUDGE" FIX)
           ========================================================================== */
        .bonsai-scope .bonsai-tab-title-shell {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          height: auto !important;
          text-transform: none !important;
          
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .bonsai-scope .bonsai-tab-title-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 0;
          text-transform: none !important;
        }

        `;
}
