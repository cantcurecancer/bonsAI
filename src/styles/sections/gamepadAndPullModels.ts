import {
  ASK_READY_STATE_TRANSITION_MS,
} from "../../features/unified-input/constants";

export function buildGamepadFocusRingStylesheet(): string {
  const ring = `
          outline: 2px solid var(--bonsai-ui-tab-focus-1, rgba(255, 255, 255, 0.9)) !important;
          outline-offset: 2px !important;
          box-shadow:
            0 0 0 2px var(--bonsai-ui-tab-focus-1, rgba(255, 255, 255, 0.92)),
            0 0 0 5px var(--bonsai-ui-tab-focus-2, rgba(255, 255, 255, 0.2)) !important;
  `;
  const ringInset = `
          outline: 2px solid rgba(255, 255, 255, 0.85) !important;
          outline-offset: -2px !important;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55) !important;
  `;
  return `
        /* ==========================================================================
           GAMEPAD FOCUS RINGS (.gpfocus)
           ========================================================================== */
        .bonsai-scope .bonsai-attach-menu-surface .bonsai-attach-menu-item.gpfocus,
        .bonsai-scope .bonsai-attach-menu-surface .bonsai-attach-menu-item:focus-visible,
        .bonsai-scope .bonsai-ask-mode-menu-surface .bonsai-ask-mode-menu-item.gpfocus,
        .bonsai-scope .bonsai-ask-mode-menu-surface .bonsai-ask-mode-menu-item:focus-visible {
          ${ringInset}
        }
        .bonsai-scope .bonsai-unified-input-host .bonsai-ask-mode-menu-floater button.bonsai-ask-mode-menu-item-btn.gpfocus,
        .bonsai-scope .bonsai-unified-input-host .bonsai-ask-mode-menu-floater button.bonsai-ask-mode-menu-item-btn:focus-visible,
        .bonsai-scope .bonsai-unified-input-host .bonsai-attach-menu-floater button.bonsai-attach-menu-item-btn.gpfocus,
        .bonsai-scope .bonsai-unified-input-host .bonsai-attach-menu-floater button.bonsai-attach-menu-item-btn:focus-visible {
          ${ringInset}
        }
        .bonsai-scope button.bonsai-chat-secondary-btn.gpfocus,
        .bonsai-scope button.bonsai-chat-secondary-btn:focus-visible,
        .bonsai-scope button.bonsai-preset-glass.gpfocus,
        .bonsai-scope button.bonsai-preset-glass:focus-visible,
        .bonsai-scope button.bonsai-preset-help-chip.gpfocus,
        .bonsai-scope button.bonsai-preset-help-chip:focus-visible,
        .bonsai-scope .bonsai-askbar-merged .bonsai-ask-primary.gpfocus,
        .bonsai-scope .bonsai-askbar-merged .bonsai-ask-primary:focus-visible,
        .bonsai-scope .bonsai-askbar-target.gpfocus,
        .bonsai-scope .bonsai-askbar-target:focus-visible,
        .bonsai-scope .bonsai-attachment-preview-target.gpfocus,
        .bonsai-scope .bonsai-attachment-preview-target:focus-visible,
        .bonsai-scope .bonsai-attachment-remove-target.gpfocus,
        .bonsai-scope .bonsai-attachment-remove-target:focus-visible,
        .bonsai-scope button.bonsai-model-policy-tier-btn.gpfocus,
        .bonsai-scope button.bonsai-model-policy-tier-btn:focus-visible,
        .bonsai-scope button.bonsai-models-hub-chip.gpfocus,
        .bonsai-scope button.bonsai-models-hub-chip:focus-visible,
        .bonsai-scope button.bonsai-pullmodels-chip.gpfocus,
        .bonsai-scope button.bonsai-pullmodels-chip:focus-visible,
        .bonsai-scope button.bonsai-pullmodels-slot.gpfocus,
        .bonsai-scope button.bonsai-pullmodels-slot:focus-visible,
        .bonsai-scope button.bonsai-pullmodels-delete-btn.gpfocus,
        .bonsai-scope button.bonsai-pullmodels-delete-btn:focus-visible,
        .bonsai-scope button.bonsai-pullmodels-refresh-btn.gpfocus,
        .bonsai-scope button.bonsai-pullmodels-refresh-btn:focus-visible {
          ${ring}
        }
        .bonsai-scope .bonsai-preset-carousel-vertical .bonsai-preset-carousel-slot--focus .bonsai-preset-glass,
        .bonsai-scope button.bonsai-preset-glass.gpfocus {
          border-color: rgba(56, 189, 248, 0.72) !important;
        }
  `;
}

/** Modal portal CSS (showModal outside QAM tree): gamepad rings + pull models table. */
export function buildModalPortalStylesheet(): string {
  return `${buildGamepadFocusRingStylesheet()}${buildPullModelsStylesheet()}`;
}


/** Pull Models modal table CSS — also injected under `.bonsai-scope` in `showModal()` portals. */
export function buildPullModelsStylesheet(): string {
  return `
        /* ==========================================================================
           10. PULL MODELS MODAL (table)
           ========================================================================== */
        .bonsai-scope {
          --bonsai-pullmodels-delete-fg: #f87171;
          --bonsai-pullmodels-row-bg: rgba(12, 20, 30, 0.55);
          --bonsai-pullmodels-row-border: rgba(72, 98, 124, 0.35);
          --bonsai-pullmodels-accent: #9ce7ff;
        }
        .bonsai-scope .bonsai-pullmodels-shell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          max-height: min(48vh, 400px);
          overflow: hidden;
          overflow-x: clip;
          text-align: left;
          box-sizing: border-box;
        }
        .bonsai-scope .bonsai-pullmodels-recommend {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bonsai-scope .bonsai-pullmodels-recommend-title {
          font-size: 10px;
          font-weight: 700;
          color: #9ce7ff;
          letter-spacing: 0.03em;
        }
        .bonsai-scope .bonsai-pullmodels-recommend-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .bonsai-scope .bonsai-pullmodels-header {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          font-size: 11px;
          color: #b8cce0;
          line-height: 1.35;
        }
        .bonsai-scope .bonsai-pullmodels-size-source {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .bonsai-scope .bonsai-pullmodels-refresh-btn {
          min-width: 28px !important;
          min-height: 24px !important;
          padding: 2px 6px !important;
          font-size: 10px !important;
          font-weight: 700 !important;
        }
        .bonsai-scope .bonsai-pullmodels-filters {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bonsai-scope .bonsai-pullmodels-filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .bonsai-scope .bonsai-pullmodels-chip {
          min-height: 24px !important;
          padding: 2px 8px !important;
          font-size: 9px !important;
          border-radius: 4px !important;
          border: 1px solid rgba(255,255,255,0.18) !important;
          background: rgba(255,255,255,0.06) !important;
          color: #dce8f4 !important;
        }
        .bonsai-scope .bonsai-pullmodels-chip--active {
          border-color: rgba(56,189,248,0.55) !important;
          background: rgba(56,189,248,0.18) !important;
          color: #e0f2fe !important;
        }
        .bonsai-scope .bonsai-pullmodels-chip--foss {
          border-color: rgba(74, 222, 128, 0.45) !important;
          color: #bbf7d0 !important;
        }
        .bonsai-scope .bonsai-pullmodels-license-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .bonsai-scope .bonsai-pullmodels-chip--foss-inline {
          align-self: flex-start;
          font-size: 9px !important;
          padding: 2px 6px !important;
          min-height: 17px !important;
          line-height: 1.2 !important;
        }
        .bonsai-scope .bonsai-pullmodels-toggles {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .bonsai-scope .bonsai-pullmodels-list {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 0;
          width: 100%;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-pullmodels-group-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #8fa8c4;
          margin: 4px 0 2px;
          text-transform: uppercase;
        }
        .bonsai-scope .bonsai-pullmodels-table {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-pullmodels-table-row {
          display: grid;
          grid-template-columns:
            28px
            minmax(5.5rem, 1.4fr)
            minmax(42px, 0.55fr)
            minmax(46px, 0.62fr)
            minmax(0, 1fr)
            minmax(52px, 0.72fr)
            28px;
          gap: 6px;
          align-items: center;
          padding: 5px 6px;
          border-bottom: 1px solid rgba(72, 98, 124, 0.22);
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-pullmodels-table-row--head {
          position: sticky;
          top: 0;
          z-index: 1;
          background: rgba(8, 14, 22, 0.96);
          border-bottom: 1px solid rgba(72, 98, 124, 0.45);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #8fa8c4;
          padding-top: 5px;
          padding-bottom: 7px;
        }
        .bonsai-scope .bonsai-pullmodels-table-row--data {
          background: var(--bonsai-pullmodels-row-bg);
        }
        .bonsai-scope .bonsai-pullmodels-table-row--data:nth-child(even) {
          background: rgba(12, 20, 30, 0.72);
        }
        .bonsai-scope .bonsai-pullmodels-table-row--stretch {
          border-left: 2px solid rgba(251, 146, 60, 0.55);
        }
        .bonsai-scope .bonsai-pullmodels-table-row--installed {
          border-left: 2px solid rgba(156, 231, 255, 0.45);
        }
        .bonsai-scope .bonsai-pullmodels-col {
          min-width: 0;
          max-width: 100%;
          font-size: 10px;
          color: #dce8f4;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bonsai-scope .bonsai-pullmodels-col--pull {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bonsai-scope .bonsai-pullmodels-col--del {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .bonsai-scope .bonsai-pullmodels-col--model {
          min-width: 0;
          overflow: hidden;
        }
        .bonsai-scope .bonsai-pullmodels-model-line {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 48px;
          align-items: center;
          gap: 4px;
          width: 100%;
          min-width: 0;
        }
        .bonsai-scope .bonsai-pullmodels-tag-name {
          min-width: 0;
          font-weight: 700;
          color: #f0f6fc;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bonsai-scope .bonsai-pullmodels-foss-slot {
          width: 48px;
          min-width: 48px;
          max-width: 48px;
          box-sizing: border-box;
          padding-right: 6px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
        }
        .bonsai-scope .bonsai-pullmodels-col--date {
          white-space: nowrap;
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bonsai-scope .bonsai-pullmodels-col--modes {
          white-space: nowrap;
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bonsai-scope .bonsai-pullmodels-table-row--head .bonsai-pullmodels-col--date,
        .bonsai-scope .bonsai-pullmodels-table-row--head .bonsai-pullmodels-col--modes {
          font-size: 9px;
        }
        .bonsai-scope .bonsai-pullmodels-col--rating {
          white-space: nowrap;
          font-size: 8px;
          line-height: 1.2;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bonsai-scope .bonsai-pullmodels-col--stars {
          color: #fcd34d;
          font-size: 8px;
          letter-spacing: 0;
          white-space: nowrap;
          text-align: center;
          overflow: hidden;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-pullmodels-col--muted {
          color: #9fb7d5;
        }
        .bonsai-scope .bonsai-pullmodels-chip--foss-inline {
          flex-shrink: 0;
          margin-right: 1px;
        }
        .bonsai-scope .bonsai-pullmodels-blurb {
          font-size: 8px;
          color: #8fa8c4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-pullmodels-table-row--data .bonsai-pullmodels-blurb {
          display: none;
        }
        .bonsai-scope .bonsai-pullmodels-installed-label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--bonsai-pullmodels-accent);
        }
        .bonsai-scope .bonsai-pullmodels-slot {
          width: 24px !important;
          min-width: 24px !important;
          min-height: 24px !important;
          padding: 0 !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          font-family: monospace !important;
          border: 1px solid rgba(255,255,255,0.22) !important;
          background: rgba(0,0,0,0.28) !important;
          color: #c5d4e3 !important;
          border-radius: 3px !important;
        }
        .bonsai-scope .bonsai-pullmodels-slot--selected {
          border-color: rgba(56,189,248,0.65) !important;
          background: rgba(56,189,248,0.22) !important;
          color: #e0f2fe !important;
        }
        .bonsai-scope .bonsai-pullmodels-slot--installed,
        .bonsai-scope .bonsai-pullmodels-slot--installed.DialogButton {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 24px !important;
          min-width: 24px !important;
          min-height: 24px !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: var(--bonsai-pullmodels-accent) !important;
          font-size: 14px !important;
          font-weight: 700 !important;
        }
        .bonsai-scope .bonsai-pullmodels-delete-btn {
          width: 24px !important;
          min-width: 24px !important;
          min-height: 24px !important;
          padding: 0 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: var(--bonsai-pullmodels-delete-fg) !important;
          border: 1px solid rgba(248, 113, 113, 0.45) !important;
          background: rgba(48, 24, 26, 0.65) !important;
          border-radius: 3px !important;
        }
        .bonsai-scope .bonsai-pullmodels-delete-btn[disabled] {
          opacity: 0.4 !important;
          pointer-events: none !important;
        }
        .bonsai-scope .bonsai-pullmodels-empty {
          font-size: 11px;
          color: #6b7c90;
          padding: 12px 0;
        }

        /* Opt-in ingest debug HUD (Developer → On-screen debug HUD). */
        .bonsai-scope .bonsai-debug-overlay {
          position: fixed !important;
          left: 4px !important;
          bottom: 4px !important;
          z-index: 99999 !important;
          max-width: min(96vw, 380px) !important;
          max-height: 28vh !important;
          overflow: hidden !important;
          pointer-events: none !important;
          font-family: monospace !important;
          font-size: 9px !important;
          line-height: 1.25 !important;
          color: rgba(167, 243, 208, 0.88) !important;
          background: rgba(0, 0, 0, 0.28) !important;
          border: 1px solid rgba(82, 216, 138, 0.22) !important;
          border-radius: 4px !important;
          padding: 4px 6px !important;
          white-space: pre-wrap !important;
          word-break: break-word !important;
          backdrop-filter: blur(2px) !important;
        }
        .bonsai-scope .bonsai-debug-overlay__header {
          color: rgba(110, 231, 183, 0.9) !important;
          margin-bottom: 2px !important;
        }
        .bonsai-scope .bonsai-debug-overlay__line {
          color: rgba(167, 243, 208, 0.82) !important;
        }
        .bonsai-scope .bonsai-debug-overlay__line--idle {
          color: rgba(148, 163, 184, 0.85) !important;
          font-style: italic !important;
        }`;
}
