/**
 * Title: DRG glossary term chip
 * Purpose: Render one curated DRG Survivor jargon term as a tappable inline element with a floating
 *          peek/full definition tooltip and an "explain further" action.
 * Used for: MainTabBonsaiAiMarkdownChunk, wherever it inlines a matched glossary term into reply prose.
 * Solves: "kiting" (roadmap: DRG Survivor glossary) reads undefined in the game's own KB card text;
 *         this lets a player look it up without the reply stopping to explain itself.
 * Does not: Decide which terms exist (data/drgGlossaryTerms.ts) or find them in text
 *           (drgGlossaryTermMatch.ts) — this only renders one already-matched term.
 */
import { useEffect, useRef, useState } from "react";
import { Focusable } from "@decky/ui";

import type { DrgGlossaryTerm } from "../data/drgGlossaryTerms";
import {
  isCancelDeckButtonEvent,
  isDeckDirectionDownEvent,
  isDeckDirectionLeftEvent,
  isDeckDirectionRightEvent,
  isDeckDirectionUpEvent,
  isOkDeckButtonEvent,
} from "../utils/focusNavigation";
import { registerDrgGlossaryTermChip } from "../utils/drgGlossaryTermRegistry";

/** Per-mount counter for chip ids; only needs to be unique among mounted chips. */
let termChipSeq = 0;

export type DrgGlossaryTermChipProps = {
  term: DrgGlossaryTerm;
  /** The exact substring matched in the reply (may differ in case/tense from `term.term`). */
  matchedText: string;
  onExplainFurther?: (term: DrgGlossaryTerm) => void;
};

type ChipState = "idle" | "peek" | "full";

function isAnyDirectionEvent(evt: unknown): boolean {
  return (
    isDeckDirectionUpEvent(evt) ||
    isDeckDirectionDownEvent(evt) ||
    isDeckDirectionLeftEvent(evt) ||
    isDeckDirectionRightEvent(evt)
  );
}

export function DrgGlossaryTermChip(props: DrgGlossaryTermChipProps) {
  const { term, matchedText, onExplainFurther } = props;
  const [state, setState] = useState<ChipState>("idle");

  // Stable per-mount id so this chip can be registered and de-registered without a DOM lookup.
  const idRef = useRef<string>("");
  if (!idRef.current) {
    termChipSeq += 1;
    idRef.current = `drg-glossary-${termChipSeq}`;
  }
  useEffect(() => () => registerDrgGlossaryTermChip(idRef.current, null), []);

  /*
   * A opens the full definition; a second A (from full) triggers explain-further and closes.
   * Mirrors BonsaiSpoilerFence's single-Focusable A/direction split: a real button is click-only,
   * the Focusable owns A and D-pad (`.cursor/rules/decky-focus-graph.mdc`).
   */
  const activate = () => {
    if (state === "full") {
      onExplainFurther?.(term);
      setState("idle");
    } else {
      setState("full");
    }
  };

  const explainFurther = () => {
    onExplainFurther?.(term);
    setState("idle");
  };

  return (
    <Focusable
      className={`bonsai-drg-glossary-term${state !== "idle" ? " bonsai-drg-glossary-term--open" : ""}`}
      ref={(el: HTMLElement | null) => registerDrgGlossaryTermChip(idRef.current, el)}
      onFocus={() => setState((s) => (s === "idle" ? "peek" : s))}
      onBlur={() => setState("idle")}
      onActivate={activate}
      onButtonDown={(evt: unknown) => {
        if (isOkDeckButtonEvent(evt)) {
          activate();
          return true;
        }
        /*
         * Dismiss via B or any D-pad direction (roadmap requirement). B is fully consumed — the
         * ring stays on the term, idle. A direction only closes the popup and then falls through
         * (`return false`) so the press still does its normal job of moving focus on, the same
         * "let non-A propagate" shape the spoiler fence uses for the same reason.
         */
        if (isCancelDeckButtonEvent(evt)) {
          setState("idle");
          return true;
        }
        if (isAnyDirectionEvent(evt)) {
          setState("idle");
          return false;
        }
        return false;
      }}
      style={{ position: "relative", display: "inline-block" }}
    >
      <span
        className="bonsai-drg-glossary-term-text"
        onClick={activate}
        style={{
          textDecoration: "underline dotted rgba(156, 231, 255, 0.75)",
          textUnderlineOffset: 2,
          cursor: "pointer",
        }}
      >
        {matchedText}
      </span>
      {state !== "idle" && (
        <span
          className="bonsai-drg-glossary-tooltip"
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            marginBottom: 6,
            zIndex: 5,
            maxWidth: 220,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(150, 187, 223, 0.45)",
            background: "rgba(24, 40, 58, 0.95)",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.45)",
            fontSize: 11,
            lineHeight: 1.4,
            color: "rgba(220, 232, 245, 0.92)",
            whiteSpace: "normal",
          }}
        >
          {state === "peek" ? (
            term.peek
          ) : (
            <>
              <div>{term.full}</div>
              <button
                type="button"
                className="bonsai-drg-glossary-explain-further"
                onClick={(e) => {
                  e.stopPropagation();
                  explainFurther();
                }}
                style={{
                  marginTop: 8,
                  background: "none",
                  border: "1px solid rgba(150, 187, 223, 0.45)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  color: "rgba(156, 231, 255, 0.95)",
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                Explain further
              </button>
            </>
          )}
        </span>
      )}
    </Focusable>
  );
}
