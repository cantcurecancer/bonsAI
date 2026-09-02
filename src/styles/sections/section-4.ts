import { BONSAI_CHAT_RESPONSE_STACK_MARGIN_TOP_PX, BONSAI_FOREST_GREEN } from "../../features/unified-input/constants";
import {
  PRESET_CHIP_GAP_PX,
  PRESET_CHIP_HEIGHT_PX,
  PRESET_CHIP_SIDE_PADDING_PX,
  PRESET_VISIBLE_SLOTS,
} from "../../features/preset-carousel/presetRowLayout";
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

          Matches the row wrapper holding a full-bleed row, and the section holding that
          wrapper. :has() is verified supported on the Deck's CEF in the same run. Keyed on
          .bonsai-full-bleed-row so only rows that asked for edge-to-edge are affected — other
          tabs do not use that class.

          The .bonsai-main-tab-column line: the Main tab wraps its rows in a fill column + bottom
          dock (useMainTabColumnFill), which puts the PanelSection two divs further from its
          full-bleed rows — out of range of both :has() patterns below. Without this line the
          section's 16px side padding comes back on Main only, which is exactly the original bug.
        */
        .bonsai-scope div:has(> .bonsai-full-bleed-row),
        .bonsai-scope div:has(> div > .bonsai-full-bleed-row),
        .bonsai-scope div:has(> .bonsai-main-tab-column) {
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

        /*
          One chip. Height and side padding are set here on purpose, not left to Steam's DialogButton
          default: with two chips across a 300px column (D43, 2026-09-01) the label room is what
          decides whether a prompt reads at a glance, and a width that comes from CSS can be reasoned
          about (design-language rule 4) where Steam's padding could only be measured after the fact.
          The drawing (major-redesign.md § 2.3) says 30px tall, radius 4.
        */
        .bonsai-scope button.bonsai-preset-glass {
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          min-height: ${PRESET_CHIP_HEIGHT_PX}px !important;
          height: ${PRESET_CHIP_HEIGHT_PX}px !important;
          padding: 0 ${PRESET_CHIP_SIDE_PADDING_PX}px !important;
          border-radius: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          line-height: 1.2 !important;
        }
        .bonsai-scope button.bonsai-preset-glass > div {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
        }
        /*
          The label is a row: badges pinned at the left, then the prompt text. The text either
          scrolls (Steam's Marquee, which brings its own overflow handling and edge fade) or, when
          the Marquee is unavailable or motion is reduced, is cut off with an ellipsis. The ellipsis
          fallback is display:block on purpose — on the old display:inline span \`overflow\` did not
          apply, the ellipsis could never fire, and a 59-character label simply ran 86px past the
          column edge (measured on device 2026-08-29).
        */
        .bonsai-scope button.bonsai-preset-glass .bonsai-preset-chip-label {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
          white-space: nowrap !important;
          text-align: left !important;
        }
        .bonsai-scope button.bonsai-preset-glass .bonsai-preset-chip-test-badge,
        .bonsai-scope button.bonsai-preset-glass .bonsai-preset-chip-tip-badge {
          flex: 0 0 auto !important;
        }
        .bonsai-scope button.bonsai-preset-glass .bonsai-preset-chip-text {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }
        .bonsai-scope button.bonsai-preset-glass .bonsai-preset-chip-text:not(.bonsai-preset-chip-text--marquee) {
          display: block !important;
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
        /*
          Chips side by side: PRESET_VISIBLE_SLOTS across one row, equal shares, a small gap. Two
          rather than the drawing's three by decision D43 (2026-09-01): on the 300px column three
          left ~12 characters per chip and two leave ~20. The row keeps the one-row height that the
          2026-08-31 change bought (the block used to be three stacked rows, 118px of a 245px dock).
          Width comes from flex, never from a measurement (design-language rule 4).
        */
        .bonsai-scope .bonsai-preset-across {
          display: flex !important;
          flex-direction: row !important;
          gap: ${PRESET_CHIP_GAP_PX}px !important;
          width: 100% !important;
          min-width: 0 !important;
        }
        .bonsai-scope .bonsai-preset-across > .bonsai-preset-carousel-slot {
          flex: 1 1 0 !important;
          min-width: 0 !important;
        }
        /*
          Sideways carousel. The track holds the whole history (up to five chips) as a flex row and
          the viewport clips it to one row's width; the chips outside the window are simply clipped
          and still focusable, so a D-pad step onto one slides it into view. Each chip is an equal
          share of the viewport, and the slide is a calc on the window-start index the component
          writes to --bonsai-preset-window-start: one step is (100% + gap) / N, which is exactly one
          chip plus one gap for any N. No pixel is ever measured.
        */
        .bonsai-scope .bonsai-preset-carousel-viewport {
          width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
        .bonsai-scope .bonsai-preset-carousel-track {
          display: flex !important;
          flex-direction: row !important;
          gap: ${PRESET_CHIP_GAP_PX}px !important;
          width: 100% !important;
          min-width: 0 !important;
          will-change: transform !important;
          transform: translateX(
            calc(-1 * var(--bonsai-preset-window-start, 0) * (100% + ${PRESET_CHIP_GAP_PX}px) / ${PRESET_VISIBLE_SLOTS})
          ) !important;
        }
        .bonsai-scope .bonsai-preset-carousel-track > .bonsai-preset-carousel-slot {
          flex: 0 0 calc((100% - ${PRESET_CHIP_GAP_PX * (PRESET_VISIBLE_SLOTS - 1)}px) / ${PRESET_VISIBLE_SLOTS}) !important;
          min-width: 0 !important;
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
        :root:not(:has(.gpfocus)) .bonsai-scope .bonsai-preset-carousel-slot--focus .bonsai-preset-glass {
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
