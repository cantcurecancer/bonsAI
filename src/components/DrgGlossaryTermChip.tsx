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

/*
 * A tap-opened popup dismisses itself; a gamepad-opened one does not. Touch has no B button and no
 * blur to lean on (tapping empty QAM space moves no focus), so without a timer a tapped popup
 * could sit over the reply forever. The peek is one short sentence — 4s covers reading it twice;
 * the full definition gets long enough to read it and still reach the Explain further button.
 */
export const TAP_PEEK_DISMISS_MS = 4000;
export const TAP_FULL_DISMISS_MS = 10000;

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

  const dismissTimerRef = useRef<number | null>(null);
  const clearDismissTimer = () => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };
  useEffect(() => clearDismissTimer, []);

  /** Every state change funnels through here so no path can leave a stale auto-dismiss pending. */
  const setChipState = (next: ChipState, autoDismissMs?: number) => {
    clearDismissTimer();
    setState(next);
    if (autoDismissMs && next !== "idle") {
      dismissTimerRef.current = window.setTimeout(() => {
        dismissTimerRef.current = null;
        setState("idle");
      }, autoDismissMs);
    }
  };

  /*
   * A opens the full definition; a second A (from full) triggers explain-further and closes.
   * Mirrors BonsaiSpoilerFence's single-Focusable A/direction split: a real button is click-only,
   * the Focusable owns A and D-pad (`.cursor/rules/decky-focus-graph.mdc`).
   */
  const activate = () => {
    if (state === "full") {
      onExplainFurther?.(term);
      setChipState("idle");
    } else {
      setChipState("full");
    }
  };

  const explainFurther = () => {
    onExplainFurther?.(term);
    setChipState("idle");
  };

  /*
   * The touch path, distinct from `activate` on purpose. A tap wants the short plain-language
   * peek first (maintainer request 2026-08-28), self-dismissing; a second tap while it shows
   * escalates to the full definition. A third tap dismisses rather than firing explain-further —
   * on a touchscreen an accidental triple-tap must not cost an Ask, so only the explicit
   * Explain further button sends one from this path.
   *
   * `tapStateRef` snapshots the state at pointerdown because on the Deck the tap itself moves
   * gamepad focus, so onFocus fires (idle → peek) *before* onClick — deciding from the live state
   * would make every first tap read "peek" and jump straight to full.
   */
  const tapStateRef = useRef<ChipState | null>(null);
  const onTermTap = () => {
    const from = tapStateRef.current ?? state;
    tapStateRef.current = null;
    if (from === "idle") setChipState("peek", TAP_PEEK_DISMISS_MS);
    else if (from === "peek") setChipState("full", TAP_FULL_DISMISS_MS);
    else setChipState("idle");
  };

  return (
    <Focusable
      className={`bonsai-drg-glossary-term${state !== "idle" ? " bonsai-drg-glossary-term--open" : ""}`}
      ref={(el: HTMLElement | null) => registerDrgGlossaryTermChip(idRef.current, el)}
      onFocus={() => {
        // Gamepad arrival takes over any tap-opened popup: kill its timer, keep what is showing.
        clearDismissTimer();
        setState((s) => (s === "idle" ? "peek" : s));
      }}
      onBlur={() => setChipState("idle")}
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
          setChipState("idle");
          return true;
        }
        if (isAnyDirectionEvent(evt)) {
          setChipState("idle");
          return false;
        }
        return false;
      }}
      style={{ position: "relative", display: "inline-block" }}
    >
      <span
        className="bonsai-drg-glossary-term-text"
        onPointerDown={() => {
          tapStateRef.current = state;
        }}
        onClick={onTermTap}
        style={{
          textDecoration: "underline dotted rgba(156, 231, 255, 0.75)",
          textUnderlineOffset: 2,
          /*
           * Chrome's default skip-ink breaks the underline around descenders, and in "kiting" the
           * g's descender eats the whole last letter — on device the underline visibly stopped at
           * the n (maintainer screenshot 2026-08-28). Underline every letter instead.
           */
          textDecorationSkipInk: "none",
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
