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

export function buildSection4Section(): string {
  return `
/* ==========================================================================
           4. FULL-BLEED & ASKBAR WRAPPERS
           Forces specific containers to break out of standard bounds for edge-to-edge UI.
           ========================================================================== */
        /*
          Row width tracks the tab scroll area; side inset lives on TabContentsScroll (BONSAI_PLUGIN_SIDE_PAD_PX).
          Do not use negative margins here — they cancel the scroll inset and hug the QAM edge.
        */
        .bonsai-scope .bonsai-full-bleed-row,
        .bonsai-scope .bonsai-ask-bleed-wrap.bonsai-full-bleed-row {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          box-sizing: border-box !important;
        }

        /* Main unified search + Ask row: stay within tab scroll width (no calc bleed spill). */
        .bonsai-scope .bonsai-unified-input-host.bonsai-full-bleed-row,
        .bonsai-scope .bonsai-preset-row-host.bonsai-full-bleed-row {
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .bonsai-scope .bonsai-unified-input-host.bonsai-full-bleed-row {
          margin-bottom: 2px !important;
        }

        .bonsai-scope .bonsai-preset-row-host {
          min-width: 0 !important;
          overflow: hidden !important;
        }

        .bonsai-scope button.bonsai-preset-glass {
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
        .bonsai-scope button.bonsai-preset-glass > div,
        .bonsai-scope button.bonsai-preset-glass .bonsai-preset-chip-label {
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .bonsai-scope .bonsai-chat-response-stack {
          margin-top: ${uiScalePx(BONSAI_CHAT_RESPONSE_STACK_MARGIN_TOP_PX)} !important;
        }

        .bonsai-scope .bonsai-preset-carousel-focus-root {
          width: 100% !important;
          min-width: 0 !important;
        }
        .bonsai-scope .bonsai-preset-carousel-vertical {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          min-width: 0 !important;
          max-height: 118px !important;
          overflow: hidden !important;
        }
        .bonsai-scope .bonsai-preset-carousel-track {
          display: flex !important;
          flex-direction: column !important;
          gap: 5px !important;
          width: 100% !important;
          min-width: 0 !important;
          will-change: transform !important;
        }
        .bonsai-scope .bonsai-preset-carousel-vertical .bonsai-preset-carousel-slot--focus .bonsai-preset-glass {
          border-color: rgba(56, 189, 248, 0.45) !important;
        }

        /* Settings search hits — same horizontal track as unified host so results line up under the textarea. */
        .bonsai-scope .bonsai-main-search-results-pane {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }

        /* Re-map width for specific askbar rows using CSS Variables with fallbacks */
        .bonsai-scope .bonsai-ask-bleed-wrap.bonsai-full-bleed-row {
          width: var(--bonsai-askbar-outer-width, var(--bonsai-search-host-width, 100%)) !important;
          min-width: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        /*
          H1 fix: never tie min-width to --bonsai-search-host-width (measured px); that inflates tab
          min-content and causes QAM horizontal spill. Ask inner width uses --bonsai-askbar-outer-width
          (host + small extra) so the glass matches the unified field spill; max-width stays none so % parents do not clip it.
        */
        .bonsai-scope .bonsai-askbar-row-host,
        .bonsai-scope .bonsai-ask-bleed-wrap .bonsai-askbar-merged {
          width: var(--bonsai-askbar-outer-width, var(--bonsai-search-host-width, 100%)) !important;
          min-width: 0 !important;
          max-width: none !important;
          /* Left-edge correction (ASK bar shell starts inset from the unified input host).
           * Applied via CSS var set in useUnifiedInputSurface; ref-set inline styles on the
           * ask element get wiped by React re-renders, but scope-level vars persist. */
          margin-left: var(--bonsai-ask-margin-left, 0px) !important;
        }

        .bonsai-scope .bonsai-askbar-merged .bonsai-ask-primary.DialogButton,
        .bonsai-scope .bonsai-ask-bleed-wrap .Panel.Focusable {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
        }

        .bonsai-scope .bonsai-ask-bleed-wrap,
        .bonsai-scope .bonsai-ask-bleed-wrap .bonsai-askbar-merged {
          flex: 1 1 auto !important;
          align-self: stretch !important;
        }

        `;
}
