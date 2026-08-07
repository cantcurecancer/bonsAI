import {
  UNIFIED_TEXT_FONT_PX,
  UNIFIED_TEXT_INSET_BOTTOM_PX,
  UNIFIED_TEXT_INSET_LEFT_PX,
  UNIFIED_TEXT_INSET_RIGHT_PX,
  UNIFIED_TEXT_INSET_TOP_PX,
  UNIFIED_TEXT_LINE_HEIGHT,
} from "../../features/unified-input/constants";
import { uiScalePx } from "./uiScalePx";

export function buildSection5Section(): string {
  return `
/* ==========================================================================
           5. UNIFIED INPUT FIELD & TEXT AREA STYLING
           Aggressively strips native styling from inputs so we can draw custom carets/overlays.
           ========================================================================== */
        .bonsai-scope .bonsai-unified-input-host input,
        .bonsai-scope .bonsai-unified-input-host textarea {
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          margin: 0 !important;
          padding: ${uiScalePx(UNIFIED_TEXT_INSET_TOP_PX)} ${uiScalePx(UNIFIED_TEXT_INSET_RIGHT_PX)} ${uiScalePx(UNIFIED_TEXT_INSET_BOTTOM_PX)} ${uiScalePx(UNIFIED_TEXT_INSET_LEFT_PX)} !important;
          text-indent: 0 !important;
          box-sizing: border-box !important;
          font-size: ${uiScalePx(UNIFIED_TEXT_FONT_PX)} !important;
          line-height: ${UNIFIED_TEXT_LINE_HEIGHT} !important;
          vertical-align: top !important;
        }

        .bonsai-scope .bonsai-unified-input-host .bonsai-unified-input-measure,
        .bonsai-scope .bonsai-unified-input-host .bonsai-unified-input-text-overlay {
          padding: ${uiScalePx(UNIFIED_TEXT_INSET_TOP_PX)} ${uiScalePx(UNIFIED_TEXT_INSET_RIGHT_PX)} ${uiScalePx(UNIFIED_TEXT_INSET_BOTTOM_PX)} ${uiScalePx(UNIFIED_TEXT_INSET_LEFT_PX)} !important;
          box-sizing: border-box !important;
        }

        .bonsai-scope .bonsai-unified-input-host.bonsai-unified-input--ai-character {
          overflow: hidden !important;
        }

        /* Avatar sits in a flex column beside the text box — not inside the field — so the native caret aligns with typed text. */
        .bonsai-scope .bonsai-unified-input-text-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
        }
        .bonsai-scope .bonsai-ai-character-avatar-slot {
          position: relative;
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          margin: 2px 4px 0 2px;
          z-index: 6;
        }
        .bonsai-scope .bonsai-unified-input-text-box {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .bonsai-scope .bonsai-ai-character-avatar {
          outline: none;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          opacity: 0.85 !important;
          overflow: hidden !important;
        }

        .bonsai-scope .bonsai-unified-input-host input::placeholder,
        .bonsai-scope .bonsai-unified-input-host textarea::placeholder {
          font-size: ${uiScalePx(UNIFIED_TEXT_FONT_PX)} !important;
        }

        /* Hide standard field labels to allow custom overlays */
        .bonsai-scope .bonsai-unified-input-host [class*="FieldLabel"],
        .bonsai-scope .bonsai-unified-input-host [class*="fieldlabel"] {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        /* Position the fake text overlay to perfectly cover the invisible actual input */
        .bonsai-scope .bonsai-unified-input-text-overlay {
          margin: 0 !important;
          box-sizing: border-box !important;
          left: var(--bonsai-unified-field-left, 0px) !important;
          top: var(--bonsai-unified-field-top, 0px) !important;
          right: auto !important;
          width: var(--bonsai-unified-field-width, 100%) !important;
        }

        /* Fake Caret Animation */
        .bonsai-scope .bonsai-unified-input-fake-caret {
          display: inline-block;
          margin-left: 1px;
          opacity: 0.9;
          transform: translateY(1px);
          animation: bonsai-caret-blink 1s step-end infinite;
        }

        /* Strategy empty placeholder: overlay caret so placeholder text does not reflow on focus */
        .bonsai-scope .bonsai-unified-input-fake-caret--overlay {
          position: absolute;
          left: 0;
          top: 0;
          margin-left: 0;
        }
        @keyframes bonsai-caret-blink {
          0%, 45% { opacity: 0.9; }
          50%, 100% { opacity: 0; }
        }

        `;
}
