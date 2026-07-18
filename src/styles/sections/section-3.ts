import { BONSAI_PLUGIN_SIDE_PAD_PX } from "../../features/unified-input/constants";
import { uiScalePx } from "./uiScalePx";

export function buildSection3Section(): string {
  return `
/* ==========================================================================
           3. GENERAL SPACING & WIDTH RESETS
           Groups and removes Steam's default padding/margins on scroll areas and panels
           to allow true full-bleed layouts across the entire plugin.
           ========================================================================== */
        .bonsai-scope [class*="TabContentsScroll"],
        .bonsai-scope [class*="TabContentsScroll"] > div,
        .bonsai-scope [class*="PanelSection"] {
          margin-top: 0 !important;
          padding-top: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          min-width: 0 !important;
        }

        /* After the global TabContentsScroll reset: gap under LB/RB strip + kill stray horizontal inset
           (Deck screenshots: SETTINGS body looked right-shifted vs panel edge). */
        .bonsai-scope.bonsai-qam-height-locked .bonsai-decky-tabs-root [class*="TabContentsScroll"] {
          height: var(--bonsai-tab-body-height, auto) !important;
          max-height: var(--bonsai-tab-body-height, 100%) !important;
          flex: 0 0 auto !important;
          overflow-y: auto !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"] {
          margin-top: var(--bonsai-tab-strip-reserve, 0px) !important;
          padding-top: 0 !important;
          position: relative !important;
          top: auto !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: ${uiScalePx(BONSAI_PLUGIN_SIDE_PAD_PX)} !important;
          padding-right: ${uiScalePx(BONSAI_PLUGIN_SIDE_PAD_PX)} !important;
          box-sizing: border-box !important;
          flex: 1 1 0% !important;
          min-height: 0 !important;
          max-height: 100% !important;
          overflow-y: auto !important;
          align-self: stretch !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"] > div {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          align-self: stretch !important;
          /* H5: Deck sometimes makes this a flex column with align-items:flex-end — whole body hugs the right. */
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"] > div [class*="PanelSection"] {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          align-self: stretch !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        /*
          LB/RB bumper tab switches use Steam's native carousel and can flash when tab content
          hosts animate. Keep icon-strip transitions; suppress only the content pane motion.
        */
        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"],
        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"] > div {
          transition: none !important;
          animation: none !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root [class*="PanelSectionRow"] {
          justify-content: flex-start !important;
          align-self: stretch !important;
          width: 100% !important;
        }

        /*
          Panel copy was still painting past the QAM edge (Deck screenshot): long lines need explicit
          wrapping + shrink in nested flex; overflow-wrap:anywhere breaks tokens if needed.
        */
        .bonsai-scope [class*="PanelSection"],
        .bonsai-scope [class*="PanelSectionRow"],
        .bonsai-scope [class*="PanelSectionRow"] > div {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow-wrap: anywhere !important;
          word-wrap: break-word !important;
        }

        .bonsai-scope [class*="PanelSectionRow"] {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          overflow: visible !important;
          align-self: stretch !important;
        }
        
        .bonsai-scope .Panel.Focusable { height: auto !important; }
        .bonsai-scope .Panel.Focusable > div { position: relative !important; top: 0 !important; }

        `;
}
