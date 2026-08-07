/**
 * Title: Context chip ladder
 * Purpose: Expandable ladder of transparency chips summarizing what context reached the model.
 * Used for: SessionContextStrip and live-turn debugging when input transparency is enabled.
 * Solves: Tier-colored chips with path bullets and optional dev JSON for audit workflows.
 * Does not: Build TransparencySnapshot objects — see inputTransparency utils and orchestration hooks.
 */
import { useCallback, useState } from "react";
import { Focusable } from "@decky/ui";
import type { ContextChip, TransparencySnapshot } from "../utils/inputTransparency";
import {
  chipBodyBullets,
  chipBodyPaths,
  chipBodyTitle,
  chipDevJson,
  chipsFromSnapshot,
  CONTEXT_CHIP_SHOW_ALL_MAX,
  tierBackground,
  tierBorderColor,
  windowRange,
} from "../utils/contextChipsFromSnapshot";
import { isOkDeckButtonEvent } from "../utils/focusNavigation";

const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

export type ContextChipLadderProps = {
  snapshot: TransparencySnapshot | null | undefined;
  /** When true, show compact hint only until expanded. */
  collapsedHint?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  /** D-pad Down from collapsed hint → session context strip (skips Save chat). */
  onMoveDownFromHint?: () => boolean;
  /** D-pad Up from ladder (first chip) → Retry / Show details utility row. */
  onMoveUpFromLadder?: () => boolean;
  /** D-pad Down from ladder (last chip) → session context strip. */
  onMoveDownFromLadder?: () => boolean;
};

export function ContextChipLadder({
  snapshot,
  collapsedHint = false,
  onExpandChange,
  onMoveDownFromHint,
  onMoveUpFromLadder,
  onMoveDownFromLadder,
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
      <div style={{ fontSize: 10, color: "#8fa6bd", marginBottom: 6 }}>
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
              style={{
                display: "inline-block",
                boxSizing: "border-box",
                width: "fit-content",
                maxWidth: "100%",
                flex: "0 0 auto",
                fontSize: isActive ? 11 : 10,
                padding: "4px 10px",
                borderRadius: 999,
                border: `1px solid ${tierBorderColor(chip.tier_class)}`,
                background: isActive ? tierBackground(chip.tier_class) : "rgba(26, 34, 44, 0.88)",
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
      <ChipExpandedBody chip={active} />
    </Focusable>
  );
}

function ChipExpandedBody({ chip }: { chip: ContextChip }) {
  const bullets = chipBodyBullets(chip);
  const paths = chipBodyPaths(chip);
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
    </div>
  );
}
