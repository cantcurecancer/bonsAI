import {
  TAB_TITLE_DEBUG_TAB_ICON_PX,
  TAB_TITLE_ICON_PX,
  TAB_TITLE_MAIN_ICON_SHIFT_X_PX,
  TAB_TITLE_MAIN_TAB_ICON_PX,
  TAB_TITLE_TAB_CELL_PX,
  TAB_TITLE_TAB_GAP_PX,
} from "../../features/unified-input/constants";

export function buildSection1Section(): string {
  return `
/* ==========================================================================
           1. DECKY TAB HOST (do not kill transitions — Steam's tab carousel uses them to slide).
           ========================================================================== */

        /* Tab host: width only — do not make this a flex column with flex-grow (Deck logs showed
           tab strip ancestors blowing past hostW ~300 with negative left; content vanished). */
        .bonsai-scope .bonsai-decky-tabs-root {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          box-sizing: border-box !important;
          overflow-x: clip !important;
        }

        /* Uniform tab glyph box. Icon components use an inner IconShell <span>; logo uses <img>. */
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell {
          width: ${TAB_TITLE_TAB_CELL_PX}px !important;
          height: ${TAB_TITLE_TAB_CELL_PX}px !important;
          min-width: ${TAB_TITLE_TAB_CELL_PX}px !important;
          min-height: ${TAB_TITLE_TAB_CELL_PX}px !important;
          max-width: ${TAB_TITLE_TAB_CELL_PX}px !important;
          max-height: ${TAB_TITLE_TAB_CELL_PX}px !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--main .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--main .bonsai-tab-title-icon > span,
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--main .bonsai-tab-title-icon svg {
          width: ${TAB_TITLE_MAIN_TAB_ICON_PX}px !important;
          height: ${TAB_TITLE_MAIN_TAB_ICON_PX}px !important;
          min-width: ${TAB_TITLE_MAIN_TAB_ICON_PX}px !important;
          min-height: ${TAB_TITLE_MAIN_TAB_ICON_PX}px !important;
          max-width: ${TAB_TITLE_MAIN_TAB_ICON_PX}px !important;
          max-height: ${TAB_TITLE_MAIN_TAB_ICON_PX}px !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--main .bonsai-tab-title-icon {
          transform: translateX(${TAB_TITLE_MAIN_ICON_SHIFT_X_PX}px) !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--developer .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--developer .bonsai-tab-title-icon > span,
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-shell--developer .bonsai-tab-title-icon svg {
          width: ${TAB_TITLE_DEBUG_TAB_ICON_PX}px !important;
          height: ${TAB_TITLE_DEBUG_TAB_ICON_PX}px !important;
          min-width: ${TAB_TITLE_DEBUG_TAB_ICON_PX}px !important;
          min-height: ${TAB_TITLE_DEBUG_TAB_ICON_PX}px !important;
          max-width: ${TAB_TITLE_DEBUG_TAB_ICON_PX}px !important;
          max-height: ${TAB_TITLE_DEBUG_TAB_ICON_PX}px !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-icon {
          width: ${TAB_TITLE_ICON_PX}px !important;
          height: ${TAB_TITLE_ICON_PX}px !important;
          min-width: ${TAB_TITLE_ICON_PX}px !important;
          min-height: ${TAB_TITLE_ICON_PX}px !important;
          max-width: ${TAB_TITLE_ICON_PX}px !important;
          max-height: ${TAB_TITLE_ICON_PX}px !important;
          box-sizing: border-box !important;
          color: rgba(168, 182, 198, 0.62) !important;
          opacity: 1 !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-icon > span {
          width: ${TAB_TITLE_ICON_PX}px !important;
          height: ${TAB_TITLE_ICON_PX}px !important;
          min-width: ${TAB_TITLE_ICON_PX}px !important;
          min-height: ${TAB_TITLE_ICON_PX}px !important;
          max-width: ${TAB_TITLE_ICON_PX}px !important;
          max-height: ${TAB_TITLE_ICON_PX}px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-icon svg {
          width: ${TAB_TITLE_ICON_PX}px !important;
          height: ${TAB_TITLE_ICON_PX}px !important;
          max-width: ${TAB_TITLE_ICON_PX}px !important;
          max-height: ${TAB_TITLE_ICON_PX}px !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-icon img {
          width: ${TAB_TITLE_ICON_PX}px !important;
          height: ${TAB_TITLE_ICON_PX}px !important;
          max-width: ${TAB_TITLE_ICON_PX}px !important;
          max-height: ${TAB_TITLE_ICON_PX}px !important;
          object-fit: contain !important;
          box-sizing: border-box !important;
        }

        /*
          Chip sizing lives on .bonsai-tab-title-leaf only (see bonsaiTabIconTitle).
          Prior :has(.bonsai-tab-title-shell) + width:40px matched intermediate carousel Panels (H2 depth-3),
          collapsing the strip so only one tab column peeked through.
        */
        .bonsai-scope .bonsai-decky-tabs-root .bonsai-tab-title-leaf {
          box-sizing: border-box !important;
          width: 40px !important;
          min-width: 40px !important;
          max-width: 40px !important;
          min-height: 44px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          margin-left: ${TAB_TITLE_TAB_GAP_PX}px !important;
          margin-right: ${TAB_TITLE_TAB_GAP_PX}px !important;
          padding: 2px !important;
          border-radius: 12px !important;
          outline: none !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable:has(.bonsai-tab-title-leaf),
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton:has(.bonsai-tab-title-leaf) {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        /*
          Current tab: very dim ring while focus is in the tab body (active strip control has no :focus-within).
          Bright ring when the strip control or its descendants hold focus / gamepad focus.
        */
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active:not(:focus-within) .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active:not(:focus-within) .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active:not(:focus-within) .bonsai-tab-title-leaf {
          box-shadow:
            0 0 0 1px var(--bonsai-ui-tab-dim-1, rgba(82, 216, 138, 0.2)),
            0 0 6px 1px var(--bonsai-ui-tab-dim-2, rgba(34, 100, 65, 0.12)) !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active:focus-within .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active:focus-visible .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active.gpfocus .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active:focus-within .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active:focus-visible .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active:focus-within .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active:focus-visible .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active.gpfocus .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active.gpfocus .bonsai-tab-title-leaf {
          box-shadow:
            0 0 0 2px var(--bonsai-ui-tab-bright-1, rgba(82, 216, 138, 0.95)),
            0 0 18px 6px var(--bonsai-ui-tab-bright-2, rgba(34, 100, 65, 0.55)),
            0 0 36px 12px var(--bonsai-ui-tab-bright-3, rgba(82, 216, 138, 0.32)) !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.gpfocus:has(.bonsai-tab-title-leaf),
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.gpfocus:has(.bonsai-tab-title-leaf),
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.gpfocuswithin:has(.bonsai-tab-title-leaf),
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.gpfocuswithin:has(.bonsai-tab-title-leaf) {
          border-radius: 12px !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable:focus-visible .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton:focus-visible .bonsai-tab-title-leaf {
          outline: none !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable:focus-visible:not(.Active) .bonsai-tab-title-leaf,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton:focus-visible:not(.Active):not(.active) .bonsai-tab-title-leaf {
          box-shadow:
            0 0 0 2px var(--bonsai-ui-tab-focus-1, rgba(82, 216, 138, 0.92)),
            0 0 0 5px var(--bonsai-ui-tab-focus-2, rgba(82, 216, 138, 0.18)) !important;
        }

        /* No green icon glow on non-active DialogButton tabs only. Avoid Panel.Focusable:not(.Active):
           Deck nests a non-Active Focusable inside the active tab DialogButton, which matched and cleared the active icon glow. */
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton:not(.Active):not(.active) .bonsai-tab-title-icon {
          filter: none !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable:focus-visible:not(.Active) .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton:focus-visible:not(.Active):not(.active) .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.gpfocuswithin:not(.Active) .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.gpfocuswithin:not(.Active):not(.active) .bonsai-tab-title-icon {
          color: rgba(252, 252, 252, 1) !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active:not(:focus-within) .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active:not(:focus-within) .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active:not(:focus-within) .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .Focusable.Active:not(:focus-within) .bonsai-tab-title-icon {
          color: rgba(252, 252, 252, 1) !important;
          filter:
            drop-shadow(0 0 2px var(--bonsai-ui-tab-icon-ds-1, rgba(82, 216, 138, 0.22)))
            drop-shadow(0 0 6px var(--bonsai-ui-tab-icon-ds-2, rgba(34, 100, 65, 0.16))) !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active:focus-within .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active:focus-visible .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .Panel.Focusable.Active.gpfocus .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active:focus-within .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active:focus-visible .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active:focus-within .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active:focus-visible .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.Active.gpfocus .bonsai-tab-title-icon,
        .bonsai-scope .bonsai-decky-tabs-root .DialogButton.active.gpfocus .bonsai-tab-title-icon {
          filter:
            drop-shadow(0 0 6px var(--bonsai-ui-tab-icon-ds-3, rgba(82, 216, 138, 0.95)))
            drop-shadow(0 0 14px var(--bonsai-ui-tab-icon-ds-4, rgba(34, 100, 65, 0.62)))
            drop-shadow(0 0 24px var(--bonsai-ui-tab-icon-ds-5, rgba(82, 216, 138, 0.45))) !important;
        }

        .bonsai-scope [class*="TabContentsScroll"] {
          scroll-behavior: auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }

        `;
}
