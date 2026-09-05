/**
 * Title: Context chip ladder
 * Purpose: Expandable ladder of transparency chips summarizing what context reached the model.
 * Used for: SessionContextStrip and live-turn debugging when input transparency is enabled.
 * Solves: Tier-colored chips with path bullets and optional dev JSON for audit workflows.
 * Does not: Build TransparencySnapshot objects — see inputTransparency utils and orchestration hooks.
 */
import { useCallback, useState } from "react";
import { Focusable } from "@decky/ui";
import type {
  AskDiagnosticsSnapshot,
  ChatSlotTurnTransparency,
  ContextChip,
  TransparencySnapshot,
} from "../utils/inputTransparency";
import {
  ATTRIBUTION_ACCENT,
  ATTRIBUTION_ACCENT_SOFT,
  chipAttribution,
  chipBodyBullets,
  chipBodyPaths,
  chipBodyTitle,
  chipDevJson,
  chipsFromSnapshot,
  CONTEXT_CHIP_SHOW_ALL_MAX,
  windowRange,
} from "../utils/contextChipsFromSnapshot";
import { isOkDeckButtonEvent } from "../utils/focusNavigation";
import { DECK_HIGHLIGHT_CYAN } from "../features/unified-input/constants";

const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

// The ladder is one Focusable, so Steam's own ring lands on the whole row, never on a single
// chip (roadmap: "The active chip in Show details is hard to spot") -- Left/Right just move
// `activeIndex` within it. This is a manual "which one is showing below" cue, not the hardware
// D-pad ring, so it deliberately does not reuse the reserved-for-real-focus white ring from
// design-tokens.md; it uses DECK_HIGHLIGHT_CYAN, the token already meant for "active controls".
//
// One colour on the row, chosen by the maintainer 2026-09-05 after seeing it on device: the first
// version of this cue added a cyan glow *on top of* borders that were already green, orange, red or
// tan (model licence tier, and whether the chip carries a credit), so six colours could share one
// row and the white D-pad ring had to compete with all of them -- "went from ambiguous focus to too
// much noise". Now every chip carries the same flat border and only the active one is filled. The
// glow is gone with the rest: a 2px cyan ring around a chip read as a focus ring, which is exactly
// the confusion the change is meant to remove. Tier and credit are still shown, in words, in the
// panel that opens below the row (see ChipExpandedBody) -- they were never row-only information.
const ACTIVE_CHIP_FILL = "rgba(156, 231, 255, 0.22)";
const ACTIVE_CHIP_BORDER = DECK_HIGHLIGHT_CYAN;
const CHIP_BORDER = "rgba(96, 118, 144, 0.55)";

export type ContextChipLadderProps = {
  snapshot: TransparencySnapshot | ChatSlotTurnTransparency | null | undefined;
  /** When true, show compact hint only until expanded. */
  collapsedHint?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  /** D-pad Down from collapsed hint → session context strip (skips Save chat). */
  onMoveDownFromHint?: () => boolean;
  /** D-pad Up from ladder (first chip) → Retry / Show details utility row. */
  onMoveUpFromLadder?: () => boolean;
  /** D-pad Down from ladder (last chip) → session context strip. */
  onMoveDownFromLadder?: () => boolean;
  /**
   * Full `ask_diagnostics` payload, shown inside the "Developer details" chip's body when that
   * chip is active. Folded in here 2026-08-22/28 (roadmap: "Fold Show diagnostics into Show
   * details") so Show details is the single disclosure entry point instead of two adjacent
   * buttons. The caller is responsible for the gate — pass `null`/`undefined` unless desktop
   * verbose logging is on, matching the standalone "Show diagnostics" button's old gating exactly.
   */
  devDiagnostics?: AskDiagnosticsSnapshot | null;
};

export function ContextChipLadder({
  snapshot,
  collapsedHint = false,
  onExpandChange,
  onMoveDownFromHint,
  onMoveUpFromLadder,
  onMoveDownFromLadder,
  devDiagnostics = null,
}: ContextChipLadderProps) {
  const chips = chipsFromSnapshot(snapshot);
  const [expanded, setExpanded] = useState(!collapsedHint);
  const [activeIndex, setActiveIndex] = useState(0);

  const setExpandedBoth = useCallback(
    (v: boolean) => {
      setExpanded(v);
      onExpandChange?.(v);
    },
    [onExpandChange],
  );

  if (!chips.length) {
    return (
      <div style={{ fontSize: 11, color: "#8fa6bd", marginTop: 8, fontStyle: "italic" }}>
        No context chips for this Ask.
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, chips.length - 1);
  const active = chips[safeIndex];
  const showAllChips = chips.length <= CONTEXT_CHIP_SHOW_ALL_MAX;
  const { start, end } = showAllChips
    ? { start: 0, end: chips.length - 1 }
    : windowRange(safeIndex, chips.length);

  if (!expanded) {
    return (
      <Focusable
        className="bonsai-context-hint"
        onActivate={() => setExpandedBoth(true)}
        onButtonDown={(evt) => {
          if (!isOkDeckButtonEvent(evt)) return false;
          setExpandedBoth(true);
          return true;
        }}
        {...deckNav({
          ...(onMoveDownFromHint ? { onMoveDown: () => onMoveDownFromHint() ?? false } : {}),
        })}
        style={{ marginTop: 8, width: "100%", maxWidth: "100%" }}
      >
        <button
          type="button"
          onClick={() => setExpandedBoth(true)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#7dd3fc",
            fontSize: 11,
            textDecoration: "underline",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          Context used · tap for details
        </button>
      </Focusable>
    );
  }

  const stepChip = (delta: number) => {
    setActiveIndex((i) => Math.max(0, Math.min(chips.length - 1, i + delta)));
  };

  const moveLeft = () => {
    if (safeIndex <= 0) return false;
    stepChip(-1);
    return true;
  };

  const moveRight = () => {
    if (safeIndex >= chips.length - 1) {
      if (onMoveDownFromLadder?.()) return true;
      return false;
    }
    stepChip(1);
    return true;
  };

  const moveUp = () => {
    if (safeIndex <= 0) {
      if (onMoveUpFromLadder?.()) return true;
      return false;
    }
    stepChip(-1);
    return true;
  };

  const moveDown = () => {
    if (safeIndex >= chips.length - 1) {
      if (onMoveDownFromLadder?.()) return true;
      return false;
    }
    stepChip(1);
    return true;
  };

  return (
    <Focusable
      className="bonsai-chip-ladder"
      style={{ marginTop: 8, width: "100%", maxWidth: "100%", minWidth: 0 }}
      {...deckNav({
        onMoveLeft: moveLeft,
        onMoveRight: moveRight,
        onMoveUp: moveUp,
        onMoveDown: moveDown,
      })}
      onButtonDown={(e) => {
        if (e.detail.button === 2 || e.detail.button === 3) {
          setExpandedBoth(false);
          return true;
        }
        return false;
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          // Grey, not cyan: the counter is a caption, and the only thing on this row allowed to be
          // coloured is the chip you are on.
          color: "rgba(159, 183, 213, 0.9)",
          letterSpacing: "0.03em",
          marginBottom: 6,
        }}
      >
        Chip {safeIndex + 1} of {chips.length}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 8,
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        {chips.map((chip, idx) => {
          if (idx < start || idx > end) return null;
          const isActive = idx === safeIndex;
          const truncated = !isActive && !showAllChips;
          const far = truncated && Math.abs(idx - safeIndex) >= 2;
          return (
            <span
              key={chip.id}
              className={
                isActive
                  ? "bonsai-chip-ladder-chip bonsai-chip-ladder-chip--active"
                  : "bonsai-chip-ladder-chip"
              }
              style={{
                display: "inline-block",
                boxSizing: "border-box",
                width: "fit-content",
                maxWidth: "100%",
                flex: "0 0 auto",
                fontSize: isActive ? 11 : 10,
                fontWeight: isActive ? 600 : 400,
                padding: "4px 10px",
                borderRadius: 999,
                border: `1px solid ${isActive ? ACTIVE_CHIP_BORDER : CHIP_BORDER}`,
                background: isActive ? ACTIVE_CHIP_FILL : "rgba(26, 34, 44, 0.88)",
                color: "#e2e8f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                opacity: truncated ? (far ? 0.38 : 0.55) : 1,
              }}
            >
              {chip.label}
            </span>
          );
        })}
      </div>
      <ChipExpandedBody
        chip={active}
        devDiagnostics={active.id === "developer" ? devDiagnostics : null}
      />
    </Focusable>
  );
}

function ChipExpandedBody({
  chip,
  devDiagnostics,
}: {
  chip: ContextChip;
  devDiagnostics?: AskDiagnosticsSnapshot | null;
}) {
  const bullets = chipBodyBullets(chip);
  const paths = chipBodyPaths(chip);
  const attribution = chipAttribution(chip);
  const devJson = chipDevJson(chip);
  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid rgba(100, 140, 180, 0.28)",
        background: "rgba(14, 22, 32, 0.55)",
        fontSize: 11,
        color: "#dce8f4",
        lineHeight: 1.45,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{chipBodyTitle(chip)}</div>
      {attribution.length > 0 ? (
        <div
          style={{
            marginBottom: 8,
            padding: "6px 8px",
            borderRadius: 6,
            borderLeft: `3px solid ${ATTRIBUTION_ACCENT}`,
            background: ATTRIBUTION_ACCENT_SOFT,
          }}
        >
          {attribution.map((entry) => (
            <div key={`${entry.source}|${entry.license}`} style={{ marginBottom: 2 }}>
              <span style={{ fontWeight: 700, color: ATTRIBUTION_ACCENT }}>{entry.source}</span>
              {entry.license ? (
                <span style={{ fontSize: 10, color: "#c9b892" }}> · {entry.license}</span>
              ) : null}
              {entry.captured ? (
                <span style={{ fontSize: 10, color: "#c9b892" }}> · as of {entry.captured}</span>
              ) : null}
              {entry.cards.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 3 }}>
                  {entry.cards.map((card) => (
                    <span
                      key={card}
                      title={card}
                      style={{
                        display: "inline-block",
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 999,
                        border: "1px solid rgba(214, 174, 116, 0.4)",
                        color: "#9fb7d5",
                      }}
                    >
                      {card}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {paths.map((p) => (
        <div key={p} style={{ fontSize: 10, color: "#9fb7d5", wordBreak: "break-all", marginBottom: 4 }}>
          {p}
        </div>
      ))}
      {bullets.length > 0 ? (
        <ul style={{ margin: "4px 0 0", paddingLeft: "1.1em" }}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
      {devJson != null ? (
        <pre
          style={{
            marginTop: 8,
            fontSize: 9,
            maxHeight: 200,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "rgba(0,0,0,0.25)",
            padding: 6,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(devJson, null, 2)}
        </pre>
      ) : null}
      {devDiagnostics != null ? (
        <>
          {/* Formerly a separate "Show diagnostics" button next to Show details (roadmap: "Fold
              Show diagnostics into Show details") — same raw ask_diagnostics dump, same gate on
              desktop verbose logging, now reached by opening this chip instead of a second button. */}
          <div style={{ fontWeight: 700, marginTop: 10, marginBottom: 6 }}>Ask diagnostics</div>
          <pre
            style={{
              fontSize: 9,
              maxHeight: 200,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "rgba(0,0,0,0.25)",
              padding: 6,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(devDiagnostics, null, 2)}
          </pre>
        </>
      ) : null}
    </div>
  );
}
