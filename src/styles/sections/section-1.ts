import { ALL_BONSAI_TAB_IDS } from "../../features/plugin-shell/tabTitles";
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

        /* Tab host: column flex so tab body grows below the strip (Bazzite gamescope kept host ≈80px).
           Do not flex-grow the carousel strip row itself — only TabContentsScroll (section 3). */
        .bonsai-scope .bonsai-decky-tabs-root {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          box-sizing: border-box !important;
          overflow-x: clip !important;
          overflow-y: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          flex: 1 1 0% !important;
          align-self: stretch !important;
        }

        /* Decky Tabs host between strip and TabContentsScroll must shrink, not grow with content. */
        .bonsai-scope .bonsai-decky-tabs-root > .Panel,
        .bonsai-scope .bonsai-decky-tabs-root > div {
          flex: 1 1 0% !important;
          min-height: 0 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          align-self: stretch !important;
        }

        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"] {
          position: relative !important;
          z-index: 1 !important;
          flex: 1 1 0% !important;
          min-height: 0 !important;
          max-height: 100% !important;
          overflow-y: auto !important;
        }

        /* Chip margin only — do not fix DialogButton width (stacks carousel vertically on Bazzite mount). */
        .bonsai-scope.bonsai-qam-strip-stable .bonsai-decky-tabs-root .bonsai-tab-title-leaf {
          margin-left: 0 !important;
          margin-right: 0 !important;
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

        /*
          Persistent active-tab marker.

          Keyed on our own [data-bonsai-active-tab] on the tabs root, NOT on .Active. Measured
          over CEF on device 2026-08-04 (docs/audit/decky-tab-strip-classes.md): SteamOS never puts
          .Active on these tab buttons — it marks the active one with a build-hashed class that
          changes with every Steam client build. Every .Active rule above is therefore dead, which
          is why the strip showed no active tab at all and why a first attempt keyed on .Active
          also did nothing. Do not key anything here on .Active without re-measuring first.

          Colour only, no box, so leaf geometry cannot change and the strip cannot leave the 48-56px
          stable window useTabStripBodyOffset measures. The attribute is the only thing that changes
          on a tab switch, so the strip does not re-render on a shoulder press.

          Specificity is 8, deliberately above the .gpfocuswithin:not(.Active) white rule (7) that
          currently paints every glyph #fcfcfc; it walks the real leaf > shell > icon nesting from
          bonsaiTabIconTitle rather than padding the selector.

          Follows the AI character accent like the strip rings above, and unlike the gamepad focus
          rings, which are deliberately white literals (see gamepadAndPullModels.ts).
        */
        ${ALL_BONSAI_TAB_IDS.map(
          (id) =>
            `.bonsai-scope .bonsai-decky-tabs-root[data-bonsai-active-tab="${id}"] .bonsai-tab-title-leaf .bonsai-tab-title-shell.bonsai-tab-title-shell--${id} .bonsai-tab-title-icon.bonsai-tab-title-icon--${id}`
        ).join(",\n        ")} {
          color: var(--bonsai-ui-tab-active-icon, rgba(82, 216, 138, 0.98)) !important;
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
