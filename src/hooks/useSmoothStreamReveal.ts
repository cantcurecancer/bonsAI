/**
 * Title: Smooth stream reveal hook
 * Purpose: Reveal streamed assistant tokens at a capped prose rate with fence burst after close.
 * Used for: MainTab live answer bubble while background Ask polls partial_response.
 * Solves: Blocky token jumps during streaming without delaying final settle (T3 snap on done).
 * Does not: Parse markdown fences — see streamMarkdownPrepare and splitResponseIntoChunks.
 */
import { useEffect, useRef, useState } from "react";
import { didNonSpoilerFenceJustClose } from "../utils/streamMarkdownPrepare";

type UseSmoothStreamRevealArgs = {
  targetText: string;
  enabled: boolean;
  done: boolean;
};

/** Prose chars/sec caps for RAF smooth reveal (may tune). */
const PROSE_RATE_MIN = 40;
const PROSE_RATE_MAX = 160;
/** After a non-spoiler fence closes, reveal backlog at this multiple (C2; may change). */
const FENCE_BURST_RATE_MULTIPLIER = 3;

function proseRevealRate(backlog: number): number {
  // Catch up faster on large poll chunks so streaming feels continuous, not blocky.
  return Math.min(PROSE_RATE_MAX, Math.max(PROSE_RATE_MIN, backlog * 3));
}

/**
 * Reveals streamed assistant text at a steady rate so polls feel continuous (Claude-style).
 * Snaps to full target when streaming ends (T3 settle). Fence body bursts at ~3× after close.
 */
export function useSmoothStreamReveal({
  targetText,
  enabled,
  done,
}: UseSmoothStreamRevealArgs): string {
  const [displayText, setDisplayText] = useState("");
  const displayRef = useRef("");
  const targetRef = useRef(targetText);
  const prevTargetRef = useRef(targetText);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const burstTicksRef = useRef(0);

  const ensureRaf = () => {
    if (!enabled || done) return;
    if (rafRef.current != null) return;
    if (targetRef.current.length <= displayRef.current.length) return;
    lastTsRef.current = null;
    const tick = (ts: number) => {
      const prev = lastTsRef.current ?? ts;
      lastTsRef.current = ts;
      const dt = Math.max(0, (ts - prev) / 1000);
      const target = targetRef.current;
      const cur = displayRef.current;
      const backlog = target.length - cur.length;
      if (backlog <= 0) {
        rafRef.current = null;
        return;
      }
      const baseRate = proseRevealRate(backlog);
      const bursting = burstTicksRef.current > 0;
      const rate = bursting ? baseRate * FENCE_BURST_RATE_MULTIPLIER : baseRate;
      const step = Math.max(1, Math.floor(rate * dt) || 1);
      const next = target.slice(cur.length, cur.length + step);
      const merged = cur + next;
      displayRef.current = merged;
      setDisplayText(merged);
      if (bursting) burstTicksRef.current -= 1;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const prev = prevTargetRef.current;
    if (didNonSpoilerFenceJustClose(prev, targetText)) {
      burstTicksRef.current = 45;
    }
    prevTargetRef.current = targetText;
    targetRef.current = targetText;

    if (!enabled) {
      displayRef.current = targetText;
      setDisplayText(targetText);
      return;
    }
    if (done) {
      displayRef.current = targetText;
      setDisplayText(targetText);
      burstTicksRef.current = 0;
      return;
    }
    if (!targetText) {
      displayRef.current = "";
      setDisplayText("");
      return;
    }
    // Critical: restart RAF when new partials arrive after display caught up.
    ensureRaf();
  }, [targetText, enabled, done]);

  useEffect(() => {
    if (!enabled || done) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
      return;
    }
    ensureRaf();
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
    };
  }, [enabled, done]);

  if (!enabled) return targetText;
  if (done) return targetText;
  return displayText;
}

export { FENCE_BURST_RATE_MULTIPLIER, proseRevealRate };
