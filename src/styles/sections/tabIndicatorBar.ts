/**
 * Title: Collapsing tab bar stylesheet
 * Purpose: The CSS for `TabIndicatorBar` — the 20px bar at rest (dashes, name, LB/RB marks).
 * Used for: bonsaiScopeStylesheet.ts, one section among the others under `.bonsai-scope`.
 * Solves: Plan 30 § 4.1 — the bar spans the column edge to edge (design-language Rule 1) with the
 *         slot row's 8px inner edges (Rule 3), and every size goes through `uiScalePx()`.
 * Does not: Hide Steam's header (section-1.ts) or hide the marks while the slot row is focused
 *           (section-6.ts, beside the rule that hides Steam's own hints). The open strip is W5.
 */
import {
  TAB_BAR_DASH_ACTIVE_EXTRA_H_PX,
  TAB_BAR_DASH_GAP_PX,
  TAB_BAR_DASH_H_PX,
  TAB_BAR_DASH_W_PX,
  TAB_BAR_NAME_PX,
  TAB_BAR_REST_HEIGHT_PX,
  TAB_BAR_SHOULDER_MARK_PX,
} from "../../features/unified-input/constants";
import { uiScalePx } from "./uiScalePx";

/** The slot-row pill colour (section-6.ts), reused so the marks read as the same family of hint. */
const MARK_COLOR = "rgba(168, 182, 198, 0.62)";
const DASH_COLOR = "rgba(168, 182, 198, 0.35)";
/** The same character accent the active icon used to take; the fallback is the forest green default. */
const ACCENT = "var(--bonsai-ui-tab-focus-1, rgba(82, 216, 138, 0.92))";

export function buildTabIndicatorBarSection(): string {
  const activeDashH = TAB_BAR_DASH_H_PX + TAB_BAR_DASH_ACTIVE_EXTRA_H_PX;
  return `
/* ==========================================================================
           10. COLLAPSING TAB BAR (plan 30). Sits above .bonsai-decky-tabs-root in the scope's
           column; Steam's own header underneath is display:none (section 1). The wrapper is 20px in
           every state so the two height hooks never see it change — the open strip (W5) floats.
           ========================================================================== */
        .bonsai-scope .bonsai-tab-bar {
          position: relative;
          flex: 0 0 auto;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          height: ${uiScalePx(TAB_BAR_REST_HEIGHT_PX)};
          padding: 0 ${uiScalePx(8)};
          display: flex;
          align-items: center;
          gap: ${uiScalePx(10)};
          overflow: visible;
          user-select: none;
        }
        .bonsai-scope .bonsai-tab-bar__shoulder {
          flex: 0 0 auto;
          font-size: ${uiScalePx(TAB_BAR_SHOULDER_MARK_PX)};
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: ${MARK_COLOR};
        }
        .bonsai-scope .bonsai-tab-bar__shoulder--r {
          margin-left: auto;
        }
        .bonsai-scope .bonsai-tab-bar__dashes {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: ${uiScalePx(TAB_BAR_DASH_GAP_PX)};
          height: ${uiScalePx(activeDashH)};
        }
        .bonsai-scope .bonsai-tab-bar__dash {
          display: inline-block;
          width: ${uiScalePx(TAB_BAR_DASH_W_PX)};
          height: ${uiScalePx(TAB_BAR_DASH_H_PX)};
          border-radius: ${uiScalePx(2)};
          background: ${DASH_COLOR};
        }
        .bonsai-scope .bonsai-tab-bar__dash--active {
          height: ${uiScalePx(activeDashH)};
          background: ${ACCENT};
        }
        /* Caps at the size the slot-row bumper pills use; readable at rest is the whole requirement. */
        .bonsai-scope .bonsai-tab-bar__name {
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: ${uiScalePx(TAB_BAR_NAME_PX)};
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${ACCENT};
        }
`;
}
