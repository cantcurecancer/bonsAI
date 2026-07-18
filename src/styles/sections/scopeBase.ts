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
          /* Fill QAM column height so Decky Tabs body is not crushed into the ~80px strip row. */
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;
          align-self: stretch;
          overflow: hidden;
        }

        /* Durable QAM height lock (inline height on scope is wiped by React/Decky re-renders). */
        .bonsai-scope.bonsai-qam-height-locked {
          height: var(--bonsai-qam-lock-height) !important;
          min-height: var(--bonsai-qam-lock-height) !important;
          max-height: var(--bonsai-qam-lock-height) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        /*
          Decky wraps plugin content in .decky-qam-scope. On Bazzite gamescope, pointer entry can
          collapse that host to tab-strip height (~80px); stretch it with the plugin column.
        */
        .decky-qam-scope:has(> .bonsai-scope) {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          align-self: stretch !important;
          width: 100% !important;
          box-sizing: border-box !important;
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

        /* Settings action buttons: shrink Focusable host so gpfocus ring hugs the button. */
        .bonsai-scope .bonsai-settings-focus-btn-host {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .bonsai-scope .bonsai-settings-focus-btn-host > .Panel.Focusable,
        .bonsai-scope .bonsai-settings-focus-btn-host > .Focusable {
          width: auto !important;
          max-width: 100% !important;
          flex: 0 0 auto !important;
        }
        .bonsai-scope button.bonsai-settings-focus-btn.gpfocus,
        .bonsai-scope button.bonsai-settings-focus-btn:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.88) !important;
          outline-offset: 2px !important;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45) !important;
        }
        .bonsai-scope .bonsai-settings-focus-btn-host > .Panel.Focusable.gpfocus,
        .bonsai-scope .bonsai-settings-focus-btn-host > .Panel.Focusable:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        `;
}
