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
          opacity: 0.45;
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
          /* Same cap as the answer bubble below it, so the two are mirrored rather than merely
             both indented. At 88% a long question stopped 35px short of the left edge while the
             answer stopped 23px short of the right, and the mismatch is what read as lopsided
             (measured on the Deck 2026-09-05, reported by the maintainer). 92% of the 290px row
             is 267px, which is exactly the answer bubble's width. */
          max-width: min(92%, 280px) !important;
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
        /*
         * D60: an OPEN turn shows the whole question, wrapped, capped at five lines, with the
         * last line fading out — instead of the single-line ellipsis rule above. Scoped off the
         * header's own --expanded modifier (set by buildTurnHeaderElement.tsx) rather than a
         * class on the title span itself, so the two files stay decoupled.
         *
         * The fade is a plain overflow cue, not the focus-driven cut-question cue from the same
         * decision (that one is a separate Features entry, still unbuilt). It fades a fixed
         * one-line-tall band at the bottom via calc(100% - 1.3em) rather than a fixed percentage,
         * so the fade always covers the LAST line actually shown — 1 through 5 — rather than a
         * fraction of a box whose height changes with how much text there is.
         */
        .bonsai-scope .bonsai-chat-turn-row-header--expanded .bonsai-chat-turn-row-title {
          white-space: normal !important;
          overflow: hidden !important;
          overflow-wrap: anywhere !important;
          text-overflow: clip !important;
          max-height: 6.5em !important;
          -webkit-mask-image: linear-gradient(
            to bottom,
            #000 0%,
            #000 calc(100% - 1.3em),
            transparent 100%
          ) !important;
          mask-image: linear-gradient(
            to bottom,
            #000 0%,
            #000 calc(100% - 1.3em),
            transparent 100%
          ) !important;
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
          background:
            linear-gradient(
              0deg,
              var(--bonsai-chat-ai-bubble-wash, rgba(130, 183, 152, 0.11)),
              var(--bonsai-chat-ai-bubble-wash, rgba(130, 183, 152, 0.11))
            ),
            linear-gradient(
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
        /* Streaming keeps the accent border: it reads as the cyan glow plus the caret, not as a
           border swap (item 12). The fence-wait sub-state drops its swap for the same reason. */
        .bonsai-scope .bonsai-chat-ai-bubble--stream-preview.bonsai-glass-panel {
          animation: bonsai-stream-preview-pulse var(--bonsai-stream-pulse-ms, 2000ms) ease-in-out infinite;
        }
        @keyframes bonsai-stream-preview-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.12);
          }
          50% {
            box-shadow: 0 0 8px 1px rgba(56, 189, 248, 0.28);
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

        /*
          Main tab bottom dock. The column stretches to the scroll viewport's bottom edge
          (min-height measured by useMainTabColumnFill — the offset to the viewport crosses
          hashed Steam wrappers, so it cannot be a CSS constant) and the dock's margin-top: auto
          pins presets + Ask bar + context line to the bottom. With a long transcript the column
          outgrows the min-height and the dock scrolls in flow, exactly as before.
        */
        .bonsai-scope .bonsai-main-tab-column {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          min-height: var(--bonsai-main-column-min-height, auto);
        }
        /*
          Sticky, not merely bottom-aligned. margin-top: auto parks the dock at the bottom while
          the transcript is short, but a long one simply pushed it past the fold — measured
          2026-08-30 with a single answer on screen, scrollHeight 957 against a 667 viewport, so
          the Ask bar and the context line were both off screen. Sticking it to the scrollport's
          bottom edge keeps the input reachable no matter how long the thread grows, which is what
          the mocks draw.

          It needs its own surface because nothing above it is opaque: the scroll container, the
          scope and the QAM pane all compute to rgba(0,0,0,0) and the panel's colour comes from
          Steam's chrome further up, so without this the transcript would scroll through the dock.
        */
        .bonsai-scope .bonsai-main-tab-dock {
          display: flex;
          flex-direction: column;
          margin-top: auto;
          position: sticky;
          bottom: 0;
          z-index: 2;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          background: rgba(18, 26, 34, 0.92);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        /*
          A short fade above the dock, so a reply that continues below it visibly passes UNDER the
          chips instead of being sliced off at a hard edge. The dock covers 245px of a 616px pane
          (measured 2026-08-30), which is a large share of the reading area to hide behind an edge
          that looks like the end of the text. The fade says "there is more, keep scrolling"
          without costing a row. The real cure is a shorter dock - see the vertical-space lane.

          Absolute against the dock, which is positioned (sticky), and bottom: 100% puts it just
          above the dock's own top edge rather than over its first row.
        */
        .bonsai-scope .bonsai-main-tab-dock::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 100%;
          height: ${uiScalePx(18)};
          pointer-events: none;
          background: linear-gradient(180deg, rgba(18, 26, 34, 0) 0%, rgba(18, 26, 34, 0.85) 100%);
        }

        /*
          Steam's scroll container carries padding-bottom: 40px (measured on device 2026-08-30).
          Sticky pins to a scrollport's CONTENT box, not its padding box, so bottom: 0 parked the
          dock 40px short of the panel's bottom edge - leaving exactly the dead strip at the bottom
          that the dock was added to remove. Zeroing it costs no height (box-sizing is border-box,
          and the element's height is pinned by --bonsai-tab-body-height either way); the 40px moves
          from padding into the content box, so the transcript gets it.

          Scoped by :has to the one tab that deliberately owns its bottom edge. Every other tab
          keeps Steam's breathing room, because nothing has measured what removing it does there.
          Lifting it panel-wide belongs to the vertical-space goal as its own measured change, not
          as a side effect of this one.
        */
        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"]:has(.bonsai-main-tab-dock) {
          padding-bottom: 0 !important;
        }
        /*
          Decky's PanelSection reserves 24px under itself. On a slot whose content overflows this
          is invisible - the dock is sticky and pins to the scrollport edge regardless. On the [+]
          slot, whose transcript is one line of placeholder, nothing overflows, so the dock sits at
          its flow position and that 24px showed as dead space under the context line: a gap that
          appeared on the new-chat screen and on no other. Measured on device 2026-08-30, 24px.
          Same treatment and same scope as the padding above - Main only, by way of the dock.
        */
        .bonsai-scope .bonsai-decky-tabs-root [class*="TabContentsScroll"] div:has(> .bonsai-main-tab-column) {
          margin-bottom: 0 !important;
        }

        /* Collapsed history: one "N earlier" pill standing in for the older archived turns. */
        .bonsai-scope .bonsai-chat-earlier-pill-row {
          display: flex;
          align-items: center;
          gap: ${uiScalePx(8)};
          opacity: 0.55;
          margin: ${uiScalePx(2)} 0 ${uiScalePx(6)};
        }
        .bonsai-scope .bonsai-chat-earlier-pill {
          font-size: ${uiScalePx(10)};
          font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(200, 214, 230, 0.85);
          padding: ${uiScalePx(3)} ${uiScalePx(10)};
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(18, 26, 34, 0.5);
          white-space: nowrap;
        }
        .bonsai-scope .bonsai-chat-earlier-rule {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.09);
        }

        /* Empty slot / create-position preview, directly under the slot row. */
        .bonsai-scope .bonsai-chat-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: ${uiScalePx(8)};
          padding: ${uiScalePx(14)} 0 ${uiScalePx(6)};
        }
        .bonsai-scope .bonsai-chat-empty-logo {
          width: ${uiScalePx(52)};
          height: ${uiScalePx(52)};
          opacity: 0.16;
          filter: grayscale(1) brightness(1.7);
        }
        .bonsai-scope .bonsai-chat-empty-caption {
          font-style: italic;
          font-size: ${uiScalePx(13)};
          line-height: 1.55;
          max-width: ${uiScalePx(210)};
          text-align: center;
          color: rgba(143, 168, 196, 0.5);
        }

        /*
          While the slot row has focus the bumpers cycle SLOTS, not tabs — so Steam's own L1/R1
          hints in the tab strip are telling the user something untrue, and the row's own LB/RB
          pills put a second pair of shoulder glyphs on screen at the same time.

          Matched by container rather than by wording. The wrapper classes are hashed
          (design-language Rule 5) AND the aria-label is not stable either: the same two images
          read L1 Button / R1 Button in one measurement and Left Shoulder / Right Shoulder in the
          next, because Steam re-labels them for the active controller. What IS stable, in every
          measurement on 2026-08-30, is that the tab strip's shoulder hints are the only
          aria-labelled images anywhere inside .bonsai-decky-tabs-root. :has() is verified
          supported on this CEF (Rule 5), and visibility rather than display keeps the strip's
          layout from shifting when they go.
        */
        .bonsai-scope .bonsai-decky-tabs-root:has(.bonsai-chat-slot-row--focused) img[aria-label] {
          visibility: hidden;
        }
        /* The same idea for the collapsing tab bar's own LB/RB marks (plan 30 § 4.1): the bar sits
           above the tabs root, so the container that sees both is the scope. visibility keeps the
           bar's layout exactly where it was when the marks go. */
        .bonsai-scope:has(.bonsai-chat-slot-row--focused) .bonsai-tab-bar__shoulder {
          visibility: hidden;
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
          /* Trimmed from 8 to 5 to pay for the game line above the title - see -slot-game. */
          padding: ${uiScalePx(5)} ${uiScalePx(8)};
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-row-inner {
          /* Trimmed from 12 to 7 for the same reason as the resting padding above. */
          padding: ${uiScalePx(7)} ${uiScalePx(8)};
          background: linear-gradient(180deg, rgba(28, 36, 44, 0.92), rgba(18, 26, 34, 0.55));
          border-top-color: rgba(156, 231, 255, 0.22);
          border-bottom-color: rgba(156, 231, 255, 0.22);
        }
        .bonsai-scope .bonsai-chat-slot-bumper-pill {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: ${uiScalePx(34)};
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
        /* Carousel boundary: the pill for a direction that cannot move dims out. */
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-bumper-pill--dead {
          border-color: rgba(168, 182, 198, 0.28);
          color: rgba(168, 182, 198, 0.4);
          background: transparent;
          box-shadow: none;
        }
        .bonsai-scope .bonsai-chat-slot-center {
          flex: 1 1 auto;
          min-width: 0;
          text-align: center;
        }
        /*
          The game a chat belongs to, in the band above the title the maintainer pointed at on
          2026-08-30. Quiet on purpose: it is context, not the name of the thing. Always occupies
          its line even when empty - slots saved before the name was kept have nothing to show, and
          a line that comes and goes is the same row-height complaint in another form.

          The row's vertical padding pays for it rather than the row growing: it was 12px top and
          bottom while focused, and that padding IS the whitespace the band was drawn on.
        */
        .bonsai-scope .bonsai-chat-slot-game {
          min-height: ${uiScalePx(11)};
          font-size: ${uiScalePx(9)};
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          line-height: 1.2;
          color: rgba(200, 214, 230, 0.32);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-game {
          color: rgba(156, 231, 255, 0.45);
        }
        .bonsai-scope .bonsai-chat-slot-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${uiScalePx(6)};
          min-width: 0;
          /*
            Reserved to the delete box's height. Without it the row was two different heights: on a
            slot the 22px x sets the line, at [+] there is no x so the line collapses to the title's
            own 14px and the whole bar shrank by about nine pixels as you cycled onto the create
            position. Measured on device 2026-08-30 - title row 23.56 with the x, 14.39 without.
          */
          min-height: ${uiScalePx(22)};
        }
        /*
          Sized for READING THE NAME, not for hierarchy. The 300px column leaves the focused row
          about 188px of centre once the two 34px bumper pills and their gaps are paid for, and the
          delete box takes 22 of that. At the reviewed 14px with a 55% cap the title window measured
          104px on device — roughly three words — which the maintainer rejected on 2026-08-30.
          12px plus a 72% cap roughly doubles the characters that fit. Deliberate deviation from
          decision D-B (700 14px focused / 13px quiet); focus emphasis now rests on colour and the
          glow, which the focused rule still carries.
        */
        .bonsai-scope .bonsai-chat-slot-title {
          font-weight: 700;
          font-size: ${uiScalePx(12)};
          line-height: 1.2;
          color: rgba(200, 214, 230, 0.72);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 88%;
        }
        /*
          Ghost neighbours stand down while the row is focused, and the title takes their room.
          Measured 2026-08-30: focused, the centre block is ~196px of the 300px column once the
          two pills and their gaps are paid, and the delete box takes 22 more. With both ghosts
          present the title window was 88px whatever the font size — shrinking the type alone
          bought nothing, because the ghosts simply absorbed what the cap gave up. Hidden, the
          window is ~168px, which is what actually turns three words into a readable name.
          They return the moment focus leaves, which is where they do their job: reading the
          neighbours at a glance without cycling. Deliberate narrowing of decision D-D, which
          kept ghosts at 300px but did not anticipate the focused row's pill cost.
        */
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-ghost {
          display: none;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-title {
          font-size: ${uiScalePx(12)};
          color: #f2f7fc;
          text-shadow: 0 0 16px rgba(156, 231, 255, 0.3);
        }
        /*
          The create position keeps one quiet size whether the row is focused or not.

          Both selectors are needed. The --focused .bonsai-chat-slot-title rule above is three
          classes (0-3-0); a lone .bonsai-chat-slot-title--create is two (0-2-0), so it loses on
          specificity no matter where it sits in the file — source order only breaks ties.
          Measured on device 2026-08-30: the focused create position computed 14px / #f2f7fc,
          the focused title's values, instead of this rule's. The second selector matches the
          focused rule's specificity and wins on order. Same trap the dot rules below guard.
        */
        .bonsai-scope .bonsai-chat-slot-title--create,
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-title--create {
          font-weight: 700;
          font-size: ${uiScalePx(13)};
          color: rgba(200, 214, 230, 0.45);
          text-shadow: none;
        }
        .bonsai-scope .bonsai-chat-slot-title-inner {
          display: inline-block;
          white-space: nowrap;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-title--overflowing {
          text-overflow: clip;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-title--overflowing .bonsai-chat-slot-title-inner {
          animation: bonsai-slot-title-scrub 6s ease-in-out infinite;
        }
        @keyframes bonsai-slot-title-scrub {
          0% { transform: translateX(0); }
          75% { transform: translateX(calc(-1 * var(--bonsai-slot-title-overflow, 0px))); }
          83% { transform: translateX(calc(-1 * var(--bonsai-slot-title-overflow, 0px))); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bonsai-scope .bonsai-chat-slot-title-inner {
            animation: none !important;
          }
        }
        /* The quiet state carries the same 22x22 box and 1px transparent border as the
           active stop, so activating the stop colours it in without nudging the row. */
        .bonsai-scope .bonsai-chat-slot-delete {
          flex: 0 0 auto;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: ${uiScalePx(22)};
          height: ${uiScalePx(22)};
          border-radius: ${uiScalePx(6)};
          border: 1px solid transparent;
          font-size: ${uiScalePx(15)};
          font-weight: 700;
          line-height: 1;
          color: rgba(168, 182, 198, 0.55);
          opacity: 0.85;
        }
        .bonsai-scope .bonsai-chat-slot-delete--active-stop {
          color: #f16a5a;
          border-color: rgba(224, 74, 58, 0.8);
          background: rgba(26, 14, 12, 0.55);
          box-shadow: 0 0 10px 1px rgba(224, 74, 58, 0.25);
          opacity: 1;
        }
        .bonsai-scope .bonsai-chat-slot-ghost {
          /* 0 1 auto + a cap, not 1 1 0: an equal split handed the ghosts every pixel the
             title's max-width left behind, which is the other half of why so little name fit. */
          flex: 0 1 auto;
          max-width: 15%;
          min-width: 0;
          font-size: ${uiScalePx(11)};
          color: rgba(200, 214, 230, 0.28);
          filter: blur(0.7px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          pointer-events: none;
        }
        /* Slightly brighter and unblurred-looking than a name ghost: it is a destination, not a
           neighbouring title, and at 15% of the row it has to stay legible at two words. */
        .bonsai-scope .bonsai-chat-slot-ghost--create {
          /* Sizes to its content and does not shrink. Under the 15% cap the other ghosts share it
             measured 28px on device, which ellipsized the old "+ New chat" wording down to
             "+ N..." - noise rather than an indicator. A name ghost may truncate, because a
             partial name still hints at which neighbour it is; this one means nothing unless it
             is readable. It carries the same [+] token the create position shows as its centre
             label, so cycling left onto it is one glyph growing rather than one label swapping
             for another. */
          flex: 0 0 auto;
          max-width: none;
          font-size: ${uiScalePx(11)};
          color: rgba(156, 231, 255, 0.42);
          font-weight: 700;
          letter-spacing: 0.02em;
          /* Clear of the title. The row gap alone (6px) read as a prefix ON the title rather
             than as the neighbour to its left. */
          margin-right: ${uiScalePx(8)};
        }
        /* No directional fade on the create ghost: the prev mask hides everything left of 55%
           of the span, which on a three-character token eats the opening bracket. A name ghost
           wants the fade because it is a fragment; this one is whole. */
        .bonsai-scope .bonsai-chat-slot-ghost--prev.bonsai-chat-slot-ghost--create {
          -webkit-mask-image: none;
          mask-image: none;
        }
        .bonsai-scope .bonsai-chat-slot-ghost--prev {
          margin-left: ${uiScalePx(4)};
          text-align: left;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 55%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 55%);
        }
        .bonsai-scope .bonsai-chat-slot-ghost--next {
          margin-right: ${uiScalePx(4)};
          text-align: right;
          -webkit-mask-image: linear-gradient(90deg, #000 45%, transparent 100%);
          mask-image: linear-gradient(90deg, #000 45%, transparent 100%);
        }
        .bonsai-scope .bonsai-chat-slot-dots {
          display: flex;
          /* Centre, not the default stretch. The dots carry an explicit 3px height and the +
             marker is a glyph box roughly twice that, so under stretch they aligned on their
             TOP edges and the + sat off the line the dots make. */
          align-items: center;
          justify-content: center;
          gap: ${uiScalePx(6)};
          gap: round(${uiScalePx(6)}, 1px);
          margin-top: ${uiScalePx(6)};
        }
        .bonsai-scope .bonsai-chat-slot-dot {
          /*
            Every marker in the strip is the SAME box, always. State is carried by fill and colour
            only - never by size. Sizing by state (3px quiet, 4px active, 6px ring) made the strip
            read as unevenly spaced even though the gap is constant, because a flex gap sits between
            boxes: a 3px dot beside a 6px one leaves more visible air around the small one.

            No border here, deliberately. A transparent 1.5px border reserved for the pending ring
            gave every dot TWO edge sets for the rasteriser to snap - the border box and the padding
            box - and at this device pixel ratio (1.28 measured 2026-08-30) each dot lands on a
            different sub-pixel phase, so the two snapped independently per dot and some circles came
            out visibly oval. The ring is an inset box-shadow instead, which paints inside one box.

            round() keeps the box and the gap on whole pixels at any UI scale, so the stride stays
            integral rather than drifting a hundredth of a pixel per dot. The unrounded declaration
            above it is the fallback for an engine without round(); Deck CEF has it (verified).
          */
          flex: 0 0 auto;
          box-sizing: border-box;
          width: ${uiScalePx(4)};
          height: ${uiScalePx(4)};
          width: round(${uiScalePx(4)}, 1px);
          height: round(${uiScalePx(4)}, 1px);
          border-radius: 50%;
          background: rgba(143, 168, 196, 0.3);
        }
        .bonsai-scope .bonsai-chat-slot-dot--active {
          background: rgba(200, 214, 230, 0.5);
        }
        /*
          The far-left marker is the create position, drawn as a + rather than a dot so the strip
          says where "new chat" lives instead of only counting existing slots. It is why the strip
          now renders at the create position too — W3 hid it there when the strip described only
          slots, which left that position with no indicator at all.
        */
        .bonsai-scope .bonsai-chat-slot-dot--create {
          /* Same box as every other marker, so the strip's rhythm is uniform; the glyph is centred
             inside it and sized to fit rather than the box being sized to the glyph. */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: ${uiScalePx(4)};
          height: ${uiScalePx(4)};
          width: round(${uiScalePx(4)}, 1px);
          height: round(${uiScalePx(4)}, 1px);
          border-radius: 0;
          background: transparent;
          color: rgba(143, 168, 196, 0.5);
          /* The glyph may overrun its 4px box, symmetrically, because the BOX is what the strip's
             spacing is measured from - sizing the box to the glyph is what put the + off the line
             in the first place. */
          font-size: ${uiScalePx(8)};
          font-weight: 700;
          line-height: 1;
        }
        .bonsai-scope .bonsai-chat-slot-dot--create.bonsai-chat-slot-dot--active {
          background: transparent;
          color: #9ce7ff;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-dot--create.bonsai-chat-slot-dot--active {
          background: transparent;
          color: #9ce7ff;
        }
        .bonsai-scope .bonsai-chat-slot-dot--pending {
          background: transparent;
          box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.9), 0 0 5px rgba(56, 189, 248, 0.55);
        }
        .bonsai-scope .bonsai-chat-slot-dot--unread {
          background: #4ade80;
          box-shadow: 0 0 5px rgba(74, 222, 128, 0.65);
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-dot--active {
          background: #9ce7ff;
        }
        /* Active + generating is the common case right after cycling, and the focused-row
           --active rule above (specificity 0-3-0) would otherwise fill the ring solid cyan
           exactly when the user is looking at it. */
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-dot--pending {
          background: transparent;
        }
        .bonsai-scope .bonsai-chat-slot-row--focused .bonsai-chat-slot-dot--unread {
          background: #4ade80;
        }
        /* Sits outside the ghost span so the ghost's mask and blur cannot eat it. */
        .bonsai-scope .bonsai-chat-slot-ghost-spark {
          flex: 0 0 auto;
          width: ${uiScalePx(6)};
          height: ${uiScalePx(6)};
          border-radius: 50%;
          align-self: center;
        }
        .bonsai-scope .bonsai-chat-slot-ghost-spark--pending {
          background: transparent;
          border: 1.5px solid rgba(56, 189, 248, 0.9);
          box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
        }
        .bonsai-scope .bonsai-chat-slot-ghost-spark--unread {
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.6);
        }

        `;
}
