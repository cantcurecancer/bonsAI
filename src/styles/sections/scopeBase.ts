import { BONSAI_PLUGIN_SIDE_PAD_PX } from "../../features/unified-input/constants";
import { uiScalePx } from "./uiScalePx";

export function buildScopebaseSection(): string {
  return `
/* ==========================================================================
        /* Keep plugin subtree shrinkable inside QAM flex layout (avoids horizontal spill). */
        /*
          Do not set overflow-x on .bonsai-scope: if overflow-x is not visible, CSS forces overflow-y
          away from visible, which clipped tab content below the icon strip. Horizontal containment
          stays on TabContentsScroll + width/min-width fixes on bleed/ask rows.
        */
        .bonsai-scope {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .bonsai-scope .bonsai-settings-connection-row {
          min-width: 0;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-settings-connection-host input {
          min-width: 0 !important;
          max-width: 100%;
        }

        /* Non-main tabs: clip horizontal paint overflow without touching Main full-bleed (shell only). */
        .bonsai-scope .bonsai-tab-panel-shell--tight {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* Flushes row content with PanelSection title (counters default row inset). */
        .bonsai-scope .bonsai-settings-bleed {
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          margin-left: calc(-1 * (${uiScalePx(BONSAI_PLUGIN_SIDE_PAD_PX)}));
          margin-right: calc(-1 * (${uiScalePx(BONSAI_PLUGIN_SIDE_PAD_PX)}));
          padding-left: ${uiScalePx(BONSAI_PLUGIN_SIDE_PAD_PX)};
          padding-right: ${uiScalePx(BONSAI_PLUGIN_SIDE_PAD_PX)};
        }

        .bonsai-scope .bonsai-settings-section-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-size: ${uiScalePx(14)} !important;
          line-height: 1.4 !important;
        }

        /*
          Explicit prose hooks: Deck CEF often ignored inherited overflow-wrap on PanelSection subtrees
          (class names do not always match our [class*="PanelSection"] patterns). H6 fix.
        */
        .bonsai-scope .bonsai-prose-host {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-prose {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          font-size: ${uiScalePx(12)} !important;
          line-height: 1.4 !important;
        }

        `;
}
