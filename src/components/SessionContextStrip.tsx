/**
 * Title: Session context strip
 * Purpose: Summarize live and archived turn context chips above the chat transcript.
 * Used for: MainTabChatTranscript to surface input-transparency snapshots per conversation turn.
 * Solves: Collapsed hint + expandable ladder so users can audit what context reached the model.
 * Does not: Build snapshots or fetch RPC data — receives turns from orchestration hooks.
 */
import { useEffect, useRef, useState } from "react";
import { Focusable } from "@decky/ui";
import type { AskThreadCollapsedTurn } from "../types/bonsaiUi";
import type { TransparencySnapshot } from "../utils/inputTransparency";
import { ContextChipLadder } from "./ContextChipLadder";
import { chipsFromSnapshot } from "../utils/contextChipsFromSnapshot";
import { registerNavFocus, type NavRefHolder } from "../utils/navFocusRegistry";
import { isOkDeckButtonEvent } from "../utils/focusNavigation";

export type SessionContextTurn = {
  id: string;
  label: string;
  snapshot: TransparencySnapshot | null;
};

export type SessionContextStripProps = {
  liveTurn?: SessionContextTurn | null;
  archivedTurns?: AskThreadCollapsedTurn[];
  highlightTurnId?: string | null;
  onHighlightClear?: () => void;
};

export function SessionContextStrip({
  liveTurn = null,
  archivedTurns = [],
  highlightTurnId = null,
  onHighlightClear,
}: SessionContextStripProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("live");

  /*
   * Steam populates this with the nav node for the strip. It is how D-pad Down out of the reply row
   * hands focus over: a plain `focus()` moves `activeElement` but leaves Steam's gamepad focus
   * behind, so presses keep going to the row you were trying to leave (measured 2026-08-04).
   */
  const navRef = useRef<NavRefHolder["current"]>(null);
  useEffect(() => {
    registerNavFocus("session-context-strip", navRef);
    return () => registerNavFocus("session-context-strip", null);
  }, []);

  const rows: SessionContextTurn[] = [
    ...archivedTurns
      .filter((t) => t.transparency && chipsFromSnapshot(t.transparency).length > 0)
      .map((t) => ({
        id: t.id,
        label: t.question.trim().slice(0, 48) || t.id,
        snapshot: t.transparency ?? null,
      })),
    ...(liveTurn && chipsFromSnapshot(liveTurn.snapshot).length > 0 ? [liveTurn] : []),
  ];

  if (!rows.length) return null;

  const effectiveActive = highlightTurnId && rows.some((r) => r.id === highlightTurnId)
    ? highlightTurnId
    : activeId;
  const activeRow = rows.find((r) => r.id === effectiveActive) ?? rows[rows.length - 1];

  return (
    <Focusable
      /* `navRef` is a real Steam Focusable prop that Decky's types omit — the same gap as
         `onMoveDown`, so it goes through the cast the repo already uses for those. */
      {...({ navRef } as Record<string, unknown>)}
      className="bonsai-session-context-strip"
      style={{
        marginTop: 12,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid rgba(100, 140, 180, 0.35)",
        background: "rgba(12, 18, 28, 0.65)",
        width: "100%",
        boxSizing: "border-box",
      }}
      onButtonDown={(e) => {
        if (e.detail.button === 2 || e.detail.button === 3) {
          setOpen((o) => !o);
          return true;
        }
        return false;
      }}
    >
      {/* Decky's gamepad navigation only visits `Focusable`s — a bare <button> is touch-only, which
          is what made this header unreachable from a D-pad (reported 2026-08-04). Same wrapper the
          turn rows below already use; the native button stays for click and keeps the styling. */}
      <Focusable
        onActivate={() => setOpen((o) => !o)}
        onButtonDown={(evt: unknown) => {
          /* A only. `onButtonDown` fires for every button, so toggling on all of them meant a
             D-pad press aimed at moving past this header collapsed or expanded it instead — the
             same bug the spoiler fence had. */
          if (!isOkDeckButtonEvent(evt)) return false;
          setOpen((o) => !o);
          return true;
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            color: "#b8cce0",
            fontSize: 12,
            fontWeight: 700,
            padding: 0,
            cursor: "pointer",
            font: "inherit",
          }}
        >
          Session context ({rows.length} turn{rows.length === 1 ? "" : "s"}) {open ? "▾" : "▸"}
        </button>
      </Focusable>
      {open ? (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((row) => (
            <Focusable
              key={row.id}
              onActivate={() => {
                setActiveId(row.id);
                onHighlightClear?.();
              }}
              onButtonDown={() => {
                setActiveId(row.id);
                onHighlightClear?.();
                return true;
              }}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border:
                  row.id === effectiveActive
                    ? "1px solid rgba(125, 211, 252, 0.55)"
                    : "1px solid rgba(255,255,255,0.08)",
                background: row.id === effectiveActive ? "rgba(56,189,248,0.12)" : "transparent",
                fontSize: 11,
                color: "#dce8f4",
              }}
            >
              {row.label}
            </Focusable>
          ))}
          {activeRow?.snapshot ? (
            <ContextChipLadder snapshot={activeRow.snapshot} collapsedHint={false} />
          ) : null}
        </div>
      ) : null}
    </Focusable>
  );
}
