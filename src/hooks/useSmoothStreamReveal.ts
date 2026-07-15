import { useEffect, useRef, useState } from "react";
import { didNonSpoilerFenceJustClose } from "../utils/streamMarkdownPrepare";

type UseSmoothStreamRevealArgs = {
  targetText: string;
  enabled: boolean;
  done: boolean;
};

/** Prose chars/sec caps for RAF smooth reveal (may tune). */
const PROSE_RATE_MIN = 24;
const PROSE_RATE_MAX = 80;
/** After a non-spoiler fence closes, reveal backlog at this multiple (C2; may change). */
const FENCE_BURST_RATE_MULTIPLIER = 3;

function proseRevealRate(backlog: number): number {
  return Math.min(PROSE_RATE_MAX, Math.max(PROSE_RATE_MIN, backlog * 2));
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
    }
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
      const step = Math.max(1, Math.floor(rate * dt));
      const next = target.slice(cur.length, cur.length + step);
      const merged = cur + next;
      displayRef.current = merged;
      setDisplayText(merged);
      if (bursting) burstTicksRef.current -= 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
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
