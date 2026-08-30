import { BONSAI_CHAT_INPUT_TO_TRANSCRIPT_GAP_PX, BONSAI_CHAT_TRANSCRIPT_TO_SAVE_GAP_PX } from "../../features/unified-input/constants";
import { uiScalePx } from "./uiScalePx";

export function buildSection6Section(): string {
  return `
/* ==========================================================================
           6. GLASS PANELS & UI THEMING
           Applies frosted glass effects and borders to standard panels.
           ========================================================================== */
        .bonsai-scope .bonsai-glass-panel,
        .bonsai-scope .bonsai-preset-glass {
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          box-sizing: border-box;
        }

        .bonsai-scope .bonsai-glass-panel {
          background: rgba(18, 26, 34, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.07) !important;
        }

        @keyframes bonsai-ask-input-breathe {
          0%, 100% {
            border-color: var(--bonsai-ask-breathe-low, rgba(74, 222, 128, 0.28));
            box-shadow: 0 0 0 0 var(--bonsai-ask-glow-low, rgba(74, 222, 128, 0.05));
          }
          50% {
            border-color: var(--bonsai-ask-breathe-high, rgba(74, 222, 128, 0.72));
            box-shadow: 0 0 10px 2px var(--bonsai-ask-glow-high, rgba(74, 222, 128, 0.16));
          }
        }
        .bonsai-scope .bonsai-unified-input-host.bonsai-unified-input--asking.bonsai-glass-panel,
        .bonsai-scope .bonsai-unified-input-host.bonsai-unified-input--capturing.bonsai-glass-panel {
          animation: bonsai-ask-input-breathe 3.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bonsai-scope .bonsai-unified-input-host.bonsai-unified-input--asking.bonsai-glass-panel,
          .bonsai-scope .bonsai-unified-input-host.bonsai-unified-input--capturing.bonsai-glass-panel {
            animation: none;
            border-color: var(--bonsai-ask-breathe-high, var(--bonsai-ask-mode-accent, #4ade80)) !important;
            box-shadow: 0 0 0 1px var(--bonsai-ask-glow-high, rgba(74, 222, 128, 0.2));
          }
        }

        .bonsai-scope .bonsai-preset-glass {
          background: rgba(18, 26, 34, 0.22) !important;
          border: 1px solid rgba(255, 255, 255, 0.07) !important;
          box-shadow: none !important;
        }

        .bonsai-scope button.bonsai-preset-help-chip.bonsai-preset-glass {
          background: linear-gradient(
            180deg,
            rgba(46, 135, 83, 0.28) 0%,
            rgba(18, 52, 34, 0.48) 100%
          ) !important;
          border: 1px solid var(--bonsai-ui-accent-main, rgba(46, 135, 83, 0.65)) !important;
          color: #dff5ea !important;
        }

        .bonsai-scope button.bonsai-preset-glass.bonsai-pyro-inject-chip {
          border: 2px solid rgba(255, 107, 53, 0.92) !important;
          box-shadow:
            0 0 0 1px rgba(160, 45, 28, 0.5),
            0 0 12px rgba(255, 85, 40, 0.38) !important;
          background: rgba(38, 22, 18, 0.38) !important;
          color: #f0ddd6 !important;
        }

        .bonsai-scope .bonsai-unified-input-strategy-placeholder {
          font-style: italic;
          font-size: 10px;
          opacity: 0.4;
        }

        .bonsai-scope .bonsai-ai-response-stack {
          display: flex;
          flex-direction: column;
          background: rgba(18, 26, 34, 0.28) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #dadde3;
          border-radius: 4px;
          overflow: hidden;
        }

        .bonsai-scope .bonsai-ai-response-stack .bonsai-ai-response-chunk {
          background: transparent !important;
          border: none !important;
          border-radius: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .bonsai-scope .bonsai-ai-response-stack .bonsai-ai-response-chunk:last-child {
          border-bottom: none;
        }

        .bonsai-scope .bonsai-ai-response-chunk {
          background: rgba(18, 26, 34, 0.28) !important;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #dadde3;
          padding: 8px;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: anywhere;
          font-size: 12px;
          line-height: 1.4;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-p {
          margin: 0 0 0.5em 0;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-p:last-child {
          margin-bottom: 0;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-ul,
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-ol {
          margin: 0.35em 0 0.5em 1.1em;
          padding: 0;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-li {
          margin: 0.2em 0;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-blockquote {
          margin: 0.4em 0;
          padding-left: 0.6em;
          border-left: 2px solid rgba(255, 255, 255, 0.2);
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-a {
          color: #7eb8ff;
          text-decoration: underline;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-inline-code {
          font-family: ui-monospace, "Cascadia Code", "Consolas", monospace;
          background: rgba(0, 0, 0, 0.28);
          padding: 0.05em 0.3em;
          border-radius: 3px;
          font-size: 0.95em;
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-fenced-pre {
          margin: 0.5em 0;
          padding: 8px 10px;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-x: auto;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .bonsai-scope .bonsai-ai-response-chunk .bonsai-md-fenced-code {
          font-family: ui-monospace, "Cascadia Code", "Consolas", monospace;
          font-size: 11px;
          line-height: 1.35;
          display: block;
        }

        /*
          Main-tab AIM-style transcript: column shell + bubbles. Overrides broad PanelSectionRow
          child width where needed so player bubbles stay right-aligned (fit-content) without QAM bleed.
        */
        .bonsai-scope .bonsai-chat-main-column {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          margin-top: ${uiScalePx(BONSAI_CHAT_INPUT_TO_TRANSCRIPT_GAP_PX)} !important;
        }
        .bonsai-scope .bonsai-chat-status-line {
          margin-top: 8px !important;
          margin-bottom: 4px !important;
        }
        .bonsai-scope .bonsai-chat-transcript {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 8px !important;
          min-width: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          padding: 0 6px 0 4px !important;
        }
        .bonsai-scope .bonsai-chat-turn-row {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 6px !important;
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-chat-turn-row-header {
          display: block !important;
          width: fit-content !important;
          max-width: min(88%, 280px) !important;
          min-width: 0 !important;
          margin-left: auto !important;
          margin-right: 0 !important;
          align-self: flex-end !important;
          box-sizing: border-box !important;
          text-align: right !important;
          padding: 6px 10px !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          outline: none !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          background: linear-gradient(
            180deg,
            rgba(22, 34, 48, 0.78) 0%,
            rgba(14, 22, 34, 0.82) 100%
          ) !important;
          color: #8fa8c4 !important;
        }
        .bonsai-scope .bonsai-chat-turn-row-header--live {
          border: 1px solid rgba(100, 145, 205, 0.48) !important;
          background: linear-gradient(
            180deg,
            rgba(32, 52, 78, 0.8) 0%,
            rgba(20, 34, 54, 0.85) 100%
          ) !important;
          color: #dce6f2 !important;
        }
        .bonsai-scope .bonsai-chat-turn-row-header--expanded {
          border: 1px solid rgba(120, 155, 198, 0.42) !important;
          background: linear-gradient(
            180deg,
            rgba(36, 52, 72, 0.82) 0%,
            rgba(24, 36, 52, 0.85) 100%
          ) !important;
          color: #e8eef4 !important;
        }
        .bonsai-scope .bonsai-chat-turn-row-title {
          display: block !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .bonsai-scope .bonsai-chat-turn-row--expanded .bonsai-chat-ai-bubble {
          margin-bottom: 8px !important;
        }
        .bonsai-scope .bonsai-chat-turn-slot {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 6px !important;
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble.Panel.Focusable,
        .bonsai-scope .bonsai-chat-ai-bubble.Panel.Focusable > div {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        .bonsai-scope .bonsai-ai-response-plain-stream {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          color: inherit !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-ai-response-chunk--in-bubble {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble-inner {
          padding: 8px 10px !important;
          box-sizing: border-box !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-ai-response-stack--in-bubble,
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-ai-response-chunk--in-bubble {
          background: transparent !important;
          border: none !important;
          border-bottom: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          outline: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /* Each answer section is its own D-pad stop. The reset directly above strips both of the
           properties Steam draws its ring with (outline and box-shadow, each !important), so a stop
           has to draw its own marker or the user cannot see where they are. Comes after that reset
           deliberately: same specificity, so source order decides. The transparent border is always
           present, otherwise focusing a section would shift the text sideways. */
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-answer-stop {
          border-left: 2px solid transparent !important;
          padding-left: 6px !important;
          border-radius: 4px !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-answer-stop.gpfocus,
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-answer-stop:focus {
          border-left-color: rgba(150, 187, 223, 0.9) !important;
          background: rgba(64, 93, 124, 0.22) !important;
        }
        .bonsai-scope .bonsai-spoiler-reveal-target {
          background: #0a0a0a !important;
          border-color: rgba(80, 80, 80, 0.55) !important;
          user-select: none !important;
        }
        .bonsai-scope .bonsai-spoiler-reveal-target > div:first-child {
          color: rgba(160, 160, 160, 0.85) !important;
        }
        .bonsai-scope .bonsai-chat-next-message-row {
          align-items: flex-end !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble.bonsai-glass-panel {
          border-radius: 10px !important;
          border: 1px solid var(--bonsai-chat-ai-bubble-border, rgba(46, 135, 83, 0.48)) !important;
          background: linear-gradient(
            180deg,
            var(--bonsai-chat-ai-bubble-bg-top, rgba(46, 135, 83, 0.12)) 0%,
            var(--bonsai-chat-ai-bubble-bg-bottom, rgba(18, 52, 34, 0.55)) 100%
          ) !important;
          color: var(--bonsai-chat-ai-bubble-text, #d4dde6) !important;
          overflow: hidden !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble .bonsai-ai-response-stack {
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble-inner--faded {
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%) !important;
          mask-image: linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%) !important;
        }
        .bonsai-scope .bonsai-chat-ai-bubble--stream-preview.bonsai-glass-panel {
          border-color: var(--bonsai-stream-preview-border, rgba(56, 189, 248, 0.55)) !important;
          animation: bonsai-stream-preview-pulse var(--bonsai-stream-pulse-ms, 2000ms) ease-in-out infinite;
        }
        .bonsai-scope .bonsai-chat-ai-bubble--fence-wait.bonsai-glass-panel {
          border-color: var(--bonsai-stream-preview-border, rgba(56, 189, 248, 0.55)) !important;
        }
        @keyframes bonsai-stream-preview-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.12);
          }
          50% {
            box-shadow: 0 0 8px 1px rgba(56, 189, 248, 0.32);
          }
        }
        .bonsai-scope .bonsai-stream-fence-wait {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin: 8px 0 !important;
          padding: 8px 10px !important;
          border-radius: 8px !important;
          border: 1px dashed rgba(56, 189, 248, 0.55) !important;
          color: #38bdf8 !important;
          font-size: 12px !important;
          line-height: 1.35 !important;
        }
        .bonsai-scope .bonsai-stream-fence-wait--code {
          animation: bonsai-stream-fence-wait-pulse var(--bonsai-stream-pulse-ms, 2000ms) ease-in-out infinite;
        }
        .bonsai-scope .bonsai-stream-fence-wait--spoiler {
          border-color: rgba(150, 187, 223, 0.45) !important;
          color: rgba(190, 205, 220, 0.9) !important;
          background: rgba(24, 40, 58, 0.45) !important;
        }
        @keyframes bonsai-stream-fence-wait-pulse {
          50% {
            opacity: 0.55;
          }
        }
        .bonsai-scope .bonsai-stream-fence-wait-spin {
          width: 12px !important;
          height: 12px !important;
          border: 2px solid rgba(56, 189, 248, 0.25) !important;
          border-top-color: #38bdf8 !important;
          border-radius: 50% !important;
          flex: 0 0 auto !important;
          animation: bonsai-stream-fence-wait-spin var(--bonsai-stream-spin-ms, 2000ms) linear infinite;
        }
        @keyframes bonsai-stream-fence-wait-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .bonsai-scope [data-bonsai-stream-preview="true"] .bonsai-ai-response-chunk::after {
          content: "▋";
          display: inline;
          margin-left: 2px;
          opacity: 0.85;
          animation: bonsai-stream-caret-blink 0.9s step-end infinite;
        }
        @keyframes bonsai-stream-caret-blink {
          50% {
            opacity: 0.15;
          }
        }
        .bonsai-scope button.bonsai-chat-next-message {
          display: block !important;
          width: fit-content !important;
          max-width: min(88%, 260px) !important;
          margin-left: auto !important;
          align-self: flex-end !important;
          padding: 6px 12px !important;
          border-radius: 10px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          border: 1px solid rgba(110, 150, 200, 0.38) !important;
          background: linear-gradient(
            180deg,
            rgba(26, 42, 62, 0.82) 0%,
            rgba(18, 28, 42, 0.88) 100%
          ) !important;
          color: #c8daf0 !important;
        }
        .bonsai-scope button.bonsai-chat-secondary-btn,
        .bonsai-scope button.bonsai-chat-secondary-btn.DialogButton {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: fit-content !important;
          min-height: 32px !important;
          padding: 6px 12px !important;
          border-radius: 8px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          border: 1px solid rgba(110, 150, 200, 0.38) !important;
          background: linear-gradient(
            180deg,
            rgba(26, 42, 62, 0.82) 0%,
            rgba(18, 28, 42, 0.88) 100%
          ) !important;
          color: #c8daf0 !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
        }
        .bonsai-scope button.bonsai-chat-secondary-btn > div,
        .bonsai-scope button.bonsai-chat-secondary-btn > span {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          border: none !important;
          background: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          min-height: auto !important;
          width: auto !important;
          border-radius: 0 !important;
          font: inherit !important;
          color: inherit !important;
        }
        .bonsai-scope button.bonsai-chat-secondary-btn:disabled {
          opacity: 0.45 !important;
          cursor: default !important;
        }
        .bonsai-scope button.bonsai-chat-secondary-btn--selected {
          border-color: var(--bonsai-chat-ai-bubble-border, rgba(46, 135, 83, 0.55)) !important;
          color: #dce8f4 !important;
        }
        .bonsai-scope .bonsai-chat-reply-actions {
          margin-top: 10px !important;
          max-width: min(88%, 100%) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 8px !important;
        }
        .bonsai-scope .bonsai-chat-reply-actions-row {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          align-items: flex-start !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .bonsai-scope .bonsai-chat-reply-actions-row--chips {
          flex-wrap: wrap;
          gap: 8px;
        }
        .bonsai-scope .bonsai-chat-reply-actions-row--utility {
          flex-wrap: nowrap !important;
        }
        .bonsai-scope .bonsai-chat-reply-actions-row--utility button.bonsai-chat-secondary-btn {
          flex: 0 1 auto !important;
          white-space: nowrap !important;
          max-width: none !important;
        }
        .bonsai-scope .bonsai-save-chat-desktop-row {
          margin-top: ${uiScalePx(BONSAI_CHAT_TRANSCRIPT_TO_SAVE_GAP_PX)} !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        @keyframes bonsai-thinking-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .bonsai-scope .bonsai-thinking-spinner {
          animation: bonsai-thinking-spin 0.9s linear infinite !important;
          transform-origin: center center !important;
        }
        .bonsai-scope .bonsai-context-footnote {
          margin-top: 4px !important;
        }
        .bonsai-scope .bonsai-chat-feedback-row__label {
          font-size: 11px !important;
          color: #9fb7d5 !important;
          line-height: 1.35 !important;
        }
        .bonsai-scope .bonsai-chat-feedback-row--rated {
          color: #8fa6bd !important;
          font-style: italic !important;
        }

        /* Named chat slots row (Main tab, under tab strip) */
        .bonsai-scope .bonsai-chat-slot-row {
          width: 100%;
          box-sizing: border-box;
        }
        .bonsai-scope .bonsai-chat-slot-row-focus {
          width: 100%;
        }
        .bonsai-scope .bonsai-chat-slot-row-inner {
          display: flex;
          align-items: center;
          gap: ${uiScalePx(8)};
          padding: ${uiScalePx(8)};
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-row-inner {
          padding: ${uiScalePx(12)} ${uiScalePx(8)};
          background: linear-gradient(180deg, rgba(28, 36, 44, 0.92), rgba(18, 26, 34, 0.55));
          border-top-color: rgba(156, 231, 255, 0.22);
          border-bottom-color: rgba(156, 231, 255, 0.22);
        }
        .bonsai-scope .bonsai-chat-slot-bumper-pill {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: ${uiScalePx(38)};
          height: ${uiScalePx(26)};
          border-radius: ${uiScalePx(8)};
          border: 1px solid rgba(168, 182, 198, 0.3);
          color: rgba(168, 182, 198, 0.62);
          font-size: ${uiScalePx(11)};
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-bumper-pill {
          border-color: rgba(156, 231, 255, 0.75);
          color: #9ce7ff;
          background: rgba(18, 26, 34, 0.55);
          box-shadow: 0 0 12px 1px rgba(156, 231, 255, 0.25);
        }
        .bonsai-scope .bonsai-chat-slot-center {
          flex: 1 1 auto;
          min-width: 0;
          text-align: center;
        }
        .bonsai-scope .bonsai-chat-slot-eyebrow {
          font-size: ${uiScalePx(9)};
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #9ce7ff;
          margin-bottom: ${uiScalePx(4)};
        }
        .bonsai-scope .bonsai-chat-slot-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${uiScalePx(6)};
          min-width: 0;
        }
        .bonsai-scope .bonsai-chat-slot-title {
          font-weight: 700;
          font-size: ${uiScalePx(12)};
          line-height: 1.2;
          color: rgba(200, 214, 230, 0.72);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 55%;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-title {
          font-size: ${uiScalePx(19)};
          color: #f2f7fc;
          text-shadow: 0 0 16px rgba(156, 231, 255, 0.3);
        }
        .bonsai-scope .bonsai-chat-slot-delete {
          flex: 0 0 auto;
          font-size: ${uiScalePx(14)};
          line-height: 1;
          color: rgba(168, 182, 198, 0.55);
          opacity: 0.85;
        }
        .bonsai-scope .bonsai-chat-slot-delete--active-stop {
          color: #9ce7ff;
        }
        .bonsai-scope .bonsai-chat-slot-ghost {
          flex: 0 1 auto;
          font-size: ${uiScalePx(11)};
          color: rgba(200, 214, 230, 0.18);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 22%;
          pointer-events: none;
        }
        .bonsai-scope .bonsai-chat-slot-dots {
          display: flex;
          justify-content: center;
          gap: ${uiScalePx(6)};
          margin-top: ${uiScalePx(6)};
        }
        .bonsai-scope .bonsai-chat-slot-dot {
          width: ${uiScalePx(3)};
          height: ${uiScalePx(3)};
          border-radius: 50%;
          background: rgba(143, 168, 196, 0.3);
        }
        .bonsai-scope .bonsai-chat-slot-dot--active {
          width: ${uiScalePx(4)};
          height: ${uiScalePx(4)};
          background: rgba(200, 214, 230, 0.5);
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-dot--active {
          background: #9ce7ff;
        }

        `;
}
