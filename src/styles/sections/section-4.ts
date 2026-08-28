import { BONSAI_CHAT_RESPONSE_STACK_MARGIN_TOP_PX, BONSAI_FOREST_GREEN } from "../../features/unified-input/constants";
import { uiScalePx } from "./uiScalePx";

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

        /*
          Reach the PanelSection by structure, because its name cannot be matched on this build.

          Measured on device 2026-08-16 (scripts/probe_deck_ask_row_width.py): inside the QAM,
          \`[class*="PanelSection"]\` matches **0 elements** and \`.decky-qam-scope\` does not exist —
          Steam ships hashed class names here (the PanelSection wrapping our rows is
          \`_3gY0aBuNR8_NPTpXIYfkby\`), so every section-3 rule keyed on those names is inert. Only
          \`_TabContentsScroll\` survives as a literal, which is why that one reset does work.

          That PanelSection carries \`padding: 0 16px\`, and it was the entire remaining gutter —
          probe V1 reported 15.99px on each side, against a 300px QAM column. Rows opting into
          full bleed must not inherit it.

          Matches exactly two nodes: the row wrapper holding a full-bleed row, and the section
          holding that wrapper. :has() is verified supported on the Deck's CEF in the same run.
          Keyed on .bonsai-full-bleed-row so only rows that asked for edge-to-edge are affected —
          other tabs do not use that class.
        */
        .bonsai-scope div:has(> .bonsai-full-bleed-row),
        .bonsai-scope div:has(> div > .bonsai-full-bleed-row) {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .bonsai-scope .bonsai-preset-row-host {
          min-width: 0 !important;
          overflow: hidden !important;
          display: grid !important;
          gap: 8px !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
        }

        .bonsai-scope .bonsai-preset-row-host--fade-anim {
          gap: 3px !important;
          margin-bottom: 12px !important;
          margin-top: 0 !important;
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
        /*
          Decode mode (Ghost in the Shell chip decode -- replaces the old \`stream\` typewriter).
          The reveal loop in MainTabPresetAnimatedChips.tsx writes scrambled/resolving glyphs and
          the blinking block caret straight into the label's textContent from a single shared
          requestAnimationFrame loop, so there is no CSS keyframe to gate here -- reduced motion is
          enforced entirely in JS (instant swap to the final prompt, no churn, no caret).
        */
        .bonsai-scope button.bonsai-preset-glass--decode .bonsai-preset-chip-label {
          color: var(--bonsai-ui-accent-main, ${BONSAI_FOREST_GREEN}) !important;
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
        /*
          The blue border marks which chip the carousel considers current. It is NOT a focus ring
          and must never look like one: ungated, it sat on a chip permanently, so with the D-pad up
          on the tab strip the screen still showed a highlighted chip — the fake focus ring found on
          device 2026-08-28, which fooled the maintainer and the QA rig at the same time.

          Gate 1 and 2 say "the carousel owns Steam's ring": \`gpfocuswithin\` is what Steam stamps on
          the ancestor Focusable, and the \`:has(.gpfocus)\` arm covers it directly in case Steam
          stamps only the chip. Gate 3 keeps the marker on desktop, in the in-IDE preview and on
          touch, where nothing owns a ring at all — the same fallback rule
          \`elementHasGamepadFocus\` uses in uiDocument.ts.
        */
        .bonsai-scope .bonsai-preset-carousel-focus-root.gpfocuswithin .bonsai-preset-carousel-slot--focus .bonsai-preset-glass,
        .bonsai-scope .bonsai-preset-carousel-focus-root:has(.gpfocus) .bonsai-preset-carousel-slot--focus .bonsai-preset-glass,
        .bonsai-scope:not(:has(.gpfocus)) .bonsai-preset-carousel-slot--focus .bonsai-preset-glass {
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

        /*
          The Ask row is a sibling PanelSectionRow of the unified input host in the same column, so
          100% on both makes them the same width by construction.

          It used to be a measured pixel snapshot instead (--bonsai-askbar-outer-width, set from
          host width in useUnifiedInputSurface, plus a --bonsai-ask-margin-left correction). That
          made the Ask row the only row that could not follow the panel: a sample taken mid-carousel,
          at first paint, or before a padding change settled froze it narrower than its neighbours,
          which is the "Ask bar no longer spans QAM width" bug. Both vars are gone — do not
          reintroduce a px width here.
        */
        .bonsai-scope .bonsai-ask-bleed-wrap.bonsai-full-bleed-row {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        /* H1 fix: never set a px min-width here — it inflates tab min-content and spills the QAM
           horizontally. max-width stays none so a % parent cannot clip the glass. */
        .bonsai-scope .bonsai-askbar-row-host,
        .bonsai-scope .bonsai-ask-bleed-wrap .bonsai-askbar-merged {
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
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
