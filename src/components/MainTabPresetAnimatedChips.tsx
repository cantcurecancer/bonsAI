/**
 * Title: Preset animated chips
 * Purpose: Fade, carousel, static or decode ONE preset prompt chip with running-game contextual seeding.
 * Used for: MainTabPresetRow when presetChipAnimation is fade, carousel, static, or decode.
 * Solves: Timed slot swaps, carousel track motion, and Deck-focusable chip buttons in one module,
 *         on a single row — the block used to be three rows and was the largest piece of the
 *         bottom dock (118px of 245px, measured 2026-08-31); the difference now goes to the transcript.
 * Does not: Persist selected presets or submit asks — parent setUnifiedInput handles composer text.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Focusable } from "@decky/ui";
import type { AskModeId } from "../data/askMode";
import {
  getRandomPresetExcluding,
  getRandomPresets,
  holdMsForPresetText,
  type PresetPrompt,
  type PresetSamplerOptions,
} from "../data/presets";
import {
  advanceCarouselFocus,
  buildInitialCarouselState,
  CAROUSEL_MANUAL_PAUSE_MS,
  CAROUSEL_SLIDE_MS,
  CAROUSEL_STEP_MS,
  carouselTrackOffsetPx,
  mergeContextualSeeds,
  seedsKeyFrom,
  visibleWindowTexts,
} from "../features/preset-carousel/carouselState";
import { pickCarouselChipWithSessionRag } from "../features/preset-carousel/composePresetSeedsWithSessionRag";
import {
  nextSingleSlotPreset,
  startSingleSlotRotation,
  type SingleSlotRotation,
} from "../features/preset-carousel/singleSlotRotation";
import { BONSAI_FOREST_GREEN } from "../features/unified-input/constants";
import { joinPresetWithRunningGame } from "../utils/joinPresetWithRunningGame";
import { registerNavFocus, type NavRefHolder } from "../utils/navFocusRegistry";
import { elementHasFocus } from "../utils/uiDocument";

/*
 * Re-timed for one row (2026-08-31). With three chips, a 2s fade-out and 1s fade-in on one of
 * them cost nothing — the other two were still there. With one chip the same timings left the row
 * blank for three seconds per cycle, so both halves are short and symmetric now.
 */
/** Fade-in duration (ms); must match the slot wrapper transition when opacity increases. */
export const PRESET_CAROUSEL_FADE_IN_MS = 500;
/** Fade-out duration (ms); must match the slot wrapper transition when opacity decreases. */
export const PRESET_CAROUSEL_FADE_OUT_MS = 500;
/** Carousel schedules new preset cycles for this long after mount/re-seed; in-flight fades still complete, then no more swaps until remount. */
export const PRESET_CAROUSEL_ACTIVE_MS = 60_000;
/** Delay before the first prompt appears after mount / re-seed, so the row settles before it moves. */
const PRESET_SLOT_FIRST_DELAY_MS = 750;

/** Milliseconds between locked characters in decode mode (must feel close to live answer streaming). */
export const PRESET_DECODE_CHAR_MS = 42;
/**
 * How often the still-churning glyphs reshuffle, ms. Throttled well below frame rate on purpose:
 * the reveal loop runs one `requestAnimationFrame` per tick but only writes to the DOM on this
 * cadence (or on a lock advance / caret blink) so a churning chip does not repaint every 16ms
 * frame on Deck hardware.
 */
const PRESET_DECODE_CHURN_REFRESH_MS = 55;
/** Caret blink period, ms. */
const PRESET_DECODE_CARET_BLINK_MS = 450;
/** Block caret glyph, drawn inline at the lock boundary rather than as a separate CSS ::after. */
export const PRESET_DECODE_CARET_CHAR = "▋";

/**
 * Churn glyph pool for the still-scrambling tail: printable ASCII plus half-width katakana
 * (U+FF66-U+FF9D). Both render half-width. Full-width CJK would not — the chip label reserves
 * its width from frame 0 at the prompt's final character count, so a double-width churn glyph
 * would push a long prompt into the ellipsis mid-animation and undo the whole point of the rewrite.
 */
const PRESET_DECODE_GLYPH_POOL: string = (() => {
  let pool = "";
  for (let code = 0x21; code <= 0x7e; code += 1) pool += String.fromCharCode(code);
  for (let code = 0xff66; code <= 0xff9d; code += 1) pool += String.fromCharCode(code);
  return pool;
})();

function randomDecodeGlyph(): string {
  return PRESET_DECODE_GLYPH_POOL[Math.floor(Math.random() * PRESET_DECODE_GLYPH_POOL.length)]!;
}

function makeDecodeChurn(length: number): string[] {
  return Array.from({ length }, randomDecodeGlyph);
}

/**
 * Composes what the label should show right now: locked (real) characters up to `revealedCount`,
 * then a boundary position that alternates between the caret glyph and the churning glyph beneath
 * it (never an *extra* character — that would grow the string past the reserved width), then the
 * rest of the still-churning tail. Once `revealedCount` reaches the prompt length the caller
 * should just render `text` directly; this always returns a string of exactly `text.length`.
 */
export function composeDecodeText(
  text: string,
  revealedCount: number,
  churn: readonly string[],
  caretOn: boolean,
): string {
  if (revealedCount >= text.length) return text;
  const prefix = text.slice(0, revealedCount);
  const boundaryChar = caretOn ? PRESET_DECODE_CARET_CHAR : (churn[revealedCount] ?? " ");
  const tail = churn.slice(revealedCount + 1).join("");
  return prefix + boundaryChar + tail;
}

/** Decode animation state, owned by the reveal effect's closure — never React state, so a lock
 *  advance or churn refresh never triggers a re-render. See `MainTabPresetDecodeSlot`. */
type DecodeSlotAnim = {
  prompt: PresetPrompt;
  /** `performance.now()` when this prompt's reveal began. */
  startAt: number;
  churn: string[];
  /** Avoids redundant DOM writes: skip repainting when neither the lock boundary, a churn
   *  refresh, nor the caret blink changed anything since the last tick. */
  lastRevealedCount: number;
  resolved: boolean;
  /** Valid once `resolved`: when to start the next prompt's reveal. */
  holdEndAt: number;
};

type SlotFade = { opacity: number; transitionMs: number };

/**
 * Three contextual seeds still arrive from upstream (and a frozen QA batch is applied at count
 * 3), even though one chip shows at a time — the single-slot rotation queues the rest.
 */
function normalizeThreeSeeds(
  seeds: PresetPrompt[],
  samplerOptions?: PresetSamplerOptions,
): [PresetPrompt, PresetPrompt, PresetPrompt] {
  const fallback = getRandomPresets(3, samplerOptions);
  return [
    seeds[0] ?? fallback[0]!,
    seeds[1] ?? fallback[1]!,
    seeds[2] ?? fallback[2]!,
  ];
}

export type PresetChipAnimationMode = "fade" | "carousel" | "static" | "decode";

export type MainTabPresetAnimatedChipsProps = {
  /** When upstream presets change (e.g. after ask), carousel re-seeds from this list. */
  seeds: PresetPrompt[];
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  /** When false, the chip stays fully opaque and prompts rotate after hold without opacity transitions. */
  fadeAnimationEnabled?: boolean;
  /** fade = opacity crossfade; carousel = vertical stack with one visible row; static = no opacity animation; decode = Ghost in the Shell scramble-to-resolve reveal. */
  animationMode?: PresetChipAnimationMode;
  /** If a preset declares `preferAskMode`, apply it when the chip is chosen. */
  onPreferAskMode?: (mode: AskModeId) => void;
  /** Carousel mode: D-pad Down at end of history moves focus to the Ask field. */
  onCarouselExitDown?: () => void;
  /** When true, KB-advice static seeds are excluded from timer-driven re-samples. */
  useLocalKnowledgeBase?: boolean;
};

function PresetChipLabel({ p }: { p: PresetPrompt }) {
  return (
    <span className="bonsai-preset-chip-label">
      {p.testChip ? (
        <span
          className="bonsai-preset-chip-test-badge"
          style={{
            marginRight: 6,
            fontSize: 9,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
            // Deliberately not the accent colour the Tip badge uses. A frozen batch is a QA
            // state, and it has to be obvious at a glance that the carousel is not showing what
            // the plugin would have chosen.
            color: "#f0b232",
          }}
        >
          Test
        </span>
      ) : null}
      {p.ragTip ? (
        <span
          className="bonsai-preset-chip-tip-badge"
          style={{
            marginRight: 6,
            fontSize: 9,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: `var(--bonsai-ui-accent-main, ${BONSAI_FOREST_GREEN})`,
          }}
        >
          Tip
        </span>
      ) : null}
      {p.text}
      {p.beta ? (
        <span
          style={{
            marginLeft: 6,
            fontSize: 10,
            fontStyle: "italic",
            color: `var(--bonsai-ui-accent-main, ${BONSAI_FOREST_GREEN})`,
            fontWeight: 600,
          }}
        >
          [beta]
        </span>
      ) : null}
    </span>
  );
}

function PresetChipButton(props: {
  preset: PresetPrompt;
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  onPreferAskMode?: (mode: AskModeId) => void;
  dimmed?: boolean;
  focusable?: boolean;
}) {
  const { preset: p, setUnifiedInput, onPreferAskMode, dimmed, focusable = true } = props;
  return (
    <Button
      className="bonsai-preset-glass"
      focusable={focusable}
      onClick={() => {
        setUnifiedInput(joinPresetWithRunningGame(p.text));
        if (p.preferAskMode && onPreferAskMode) {
          onPreferAskMode(p.preferAskMode);
        }
      }}
      style={{
        width: "100%",
        minHeight: 34,
        fontSize: 12,
        color: dimmed ? "#8fa3b8" : "#c4d3e2",
        opacity: dimmed ? 0.55 : 1,
        transform: dimmed ? "scale(0.96)" : "scale(1)",
        transition: "opacity 420ms ease, transform 420ms ease, color 420ms ease",
      }}
    >
      <PresetChipLabel p={p} />
    </Button>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The label's text is owned by the reveal effect below, written straight to this span's
 * `textContent` via `setLabelRef` — never through React state. The JSX child here is only what
 * paints during the first delay, before the first `begin` call; every frame after that (the
 * initial scramble included, since `begin` also writes on start) bypasses React entirely, which
 * is the point of the rewrite (see the module header comment on frame cost).
 */
function DecodePresetChipButton(props: {
  preset: PresetPrompt;
  setLabelRef: (el: HTMLSpanElement | null) => void;
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
  onPreferAskMode?: (mode: AskModeId) => void;
}) {
  const { preset: p, setLabelRef, setUnifiedInput, onPreferAskMode } = props;
  return (
    <Button
      className="bonsai-preset-glass bonsai-preset-glass--decode"
      focusable
      onClick={() => {
        // Always the real prompt, never whatever is mid-churn on screen — the text is known from
        // frame 0, so there is no "partial" to accidentally submit.
        setUnifiedInput(joinPresetWithRunningGame(p.text));
        if (p.preferAskMode && onPreferAskMode) {
          onPreferAskMode(p.preferAskMode);
        }
      }}
      style={{
        width: "100%",
        minHeight: 34,
        fontSize: 12,
      }}
    >
      <span className="bonsai-preset-chip-label">
        <span ref={setLabelRef}>{" "}</span>
        {p.beta ? (
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              fontStyle: "italic",
              color: `var(--bonsai-ui-accent-main, ${BONSAI_FOREST_GREEN})`,
              fontWeight: 600,
            }}
          >
            [beta]
          </span>
        ) : null}
      </span>
    </Button>
  );
}

/**
 * Ghost in the Shell title-sequence reveal: the chip arrives as a full-width block of scrambled
 * glyphs (reserving the prompt's final character width from frame 0, so the chip never reflows)
 * that lock into the real prompt left to right behind a blinking block caret, then hold and move
 * to the next prompt.
 *
 * Animation state lives in a plain object inside the effect closure (`DecodeSlotAnim`), not React
 * state, and a `requestAnimationFrame` loop writes straight to the label's `textContent` through
 * a ref. `slot` React state still exists, but only changes once per prompt cycle (when a new
 * prompt begins) — that's the frequency a Button's onClick closure and beta badge need, not
 * per-frame.
 */
function MainTabPresetDecodeSlot(
  props: Omit<MainTabPresetAnimatedChipsProps, "fadeAnimationEnabled" | "animationMode">,
) {
  const { seeds, setUnifiedInput, onPreferAskMode, useLocalKnowledgeBase = false } = props;
  const samplerOptions = { useLocalKnowledgeBase };
  const seedsKey = seedsKeyFrom(seeds);
  const reducedMotion = prefersReducedMotion();

  const [slot, setSlot] = useState<PresetPrompt>(() => normalizeThreeSeeds(seeds, samplerOptions)[0]);

  const labelRef = useRef<HTMLSpanElement | null>(null);
  const setLabelRef = useCallback((el: HTMLSpanElement | null) => {
    labelRef.current = el;
  }, []);

  useEffect(() => {
    const initial = normalizeThreeSeeds(seeds, samplerOptions);
    const started = startSingleSlotRotation(initial);
    let rotation: SingleSlotRotation = started.rotation;
    const first = started.first ?? initial[0];
    setSlot(first);

    const sessionEnd = performance.now() + PRESET_CAROUSEL_ACTIVE_MS;
    let cancelled = false;
    const mayStartNextCycle = (): boolean => !cancelled && performance.now() < sessionEnd;

    const pickNext = (current: PresetPrompt): PresetPrompt => {
      const step = nextSingleSlotPreset(current, rotation, samplerOptions);
      rotation = step.rotation;
      return step.next;
    };

    const timeouts: number[] = [];
    const pushTimeout = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (cancelled) return;
        fn();
      }, ms);
      timeouts.push(id);
    };

    // prefers-reduced-motion: reduce — swap the text in instantly, no churn, no caret blink.
    if (reducedMotion) {
      const runReduced = (prompt: PresetPrompt, firstDelay: number) => {
        pushTimeout(() => {
          setSlot(prompt);
          if (labelRef.current) labelRef.current.textContent = prompt.text;
          pushTimeout(() => {
            if (!mayStartNextCycle()) return;
            runReduced(pickNext(prompt), 0);
          }, holdMsForPresetText(prompt.text));
        }, firstDelay);
      };
      runReduced(first, PRESET_SLOT_FIRST_DELAY_MS);
      return () => {
        cancelled = true;
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    // Full decode path. DOM writes are throttled to a lock advance, a churn refresh, or a caret
    // blink — not every frame. See the module header.
    let anim: DecodeSlotAnim | null = null;
    let rafId = 0;
    let lastChurnRefresh = 0;
    let lastBlinkToggle = 0;
    let caretOn = true;

    const begin = (prompt: PresetPrompt, now: number) => {
      const churn = makeDecodeChurn(prompt.text.length);
      anim = { prompt, startAt: now, churn, lastRevealedCount: -1, resolved: false, holdEndAt: 0 };
      setSlot(prompt);
      // Frame 0: the label is already mounted (the chip renders at t=0; only its first `begin`
      // call is delayed), so paint the full-length scramble immediately rather than waiting for
      // the next rAF tick.
      if (labelRef.current) labelRef.current.textContent = composeDecodeText(prompt.text, 0, churn, true);
    };

    const process = (now: number, churnDue: boolean, blinkDue: boolean) => {
      if (!anim) return;

      if (anim.resolved) {
        if (now >= anim.holdEndAt && mayStartNextCycle()) {
          begin(pickNext(anim.prompt), now);
        }
        return;
      }

      const text = anim.prompt.text;
      const elapsed = now - anim.startAt;
      const revealedCount = Math.min(text.length, Math.floor(elapsed / PRESET_DECODE_CHAR_MS));

      if (revealedCount >= text.length) {
        anim.resolved = true;
        anim.holdEndAt = now + holdMsForPresetText(text);
        if (labelRef.current) labelRef.current.textContent = text;
        return;
      }

      if (churnDue) {
        anim.churn = makeDecodeChurn(text.length);
      }
      if (revealedCount !== anim.lastRevealedCount || churnDue || blinkDue) {
        anim.lastRevealedCount = revealedCount;
        if (labelRef.current) {
          labelRef.current.textContent = composeDecodeText(text, revealedCount, anim.churn, caretOn);
        }
      }
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const churnDue = now - lastChurnRefresh >= PRESET_DECODE_CHURN_REFRESH_MS;
      const blinkDue = now - lastBlinkToggle >= PRESET_DECODE_CARET_BLINK_MS;
      if (blinkDue) {
        caretOn = !caretOn;
        lastBlinkToggle = now;
      }
      process(now, churnDue, blinkDue);
      if (churnDue) lastChurnRefresh = now;
      rafId = window.requestAnimationFrame(tick);
    };

    pushTimeout(() => begin(first, performance.now()), PRESET_SLOT_FIRST_DELAY_MS);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [seedsKey, seeds, reducedMotion, useLocalKnowledgeBase]);

  return (
    <div className="bonsai-preset-carousel-slot" data-bonsai-preset-visible="true">
      <DecodePresetChipButton
        preset={slot}
        setLabelRef={setLabelRef}
        setUnifiedInput={setUnifiedInput}
        onPreferAskMode={onPreferAskMode}
      />
    </div>
  );
}

function MainTabPresetVerticalCarousel(
  props: Omit<MainTabPresetAnimatedChipsProps, "fadeAnimationEnabled" | "animationMode">,
) {
  const { seeds, setUnifiedInput, onPreferAskMode, useLocalKnowledgeBase = false } = props;
  const samplerOptions = { useLocalKnowledgeBase };
  const seedsKey = seedsKeyFrom(seeds);
  const contextualRef = useRef(normalizeThreeSeeds(seeds, samplerOptions));
  contextualRef.current = normalizeThreeSeeds(seeds, samplerOptions);

  const [{ history, focusIndex }, setCarousel] = useState(() =>
    buildInitialCarouselState(normalizeThreeSeeds(seeds, samplerOptions)),
  );

  const autoPausedUntilRef = useRef(0);
  const verticalRef = useRef<HTMLDivElement | null>(null);

  /*
   * The carousel is its own Focusable, so it is a separate navigation container from the Ask bar
   * below it. Steam populates this with the container's nav node, which is the only supported way
   * to hand the gamepad ring across that boundary — a plain `focus()` moves `activeElement` and
   * leaves the ring where it was (navFocusRegistry, measured 2026-08-04). That split is what put a
   * ring on a chip while the D-pad was really on the tab strip, found on device 2026-08-28.
   */
  const navRef = useRef<NavRefHolder["current"]>(null);
  useEffect(() => {
    registerNavFocus("preset-carousel", navRef);
    return () => registerNavFocus("preset-carousel", null);
  }, []);

  const pauseAuto = useCallback(() => {
    autoPausedUntilRef.current = performance.now() + CAROUSEL_MANUAL_PAUSE_MS;
  }, []);

  useEffect(() => {
    setCarousel((prev) => mergeContextualSeeds(prev.history, contextualRef.current, prev.focusIndex));
  }, [seedsKey]);

  useEffect(() => {
    const sessionEnd = performance.now() + PRESET_CAROUSEL_ACTIVE_MS;
    let cancelled = false;
    let timeoutId = 0;

    const tick = () => {
      if (cancelled || performance.now() >= sessionEnd) return;
      if (performance.now() < autoPausedUntilRef.current) {
        timeoutId = window.setTimeout(tick, CAROUSEL_STEP_MS);
        return;
      }
      /* Never auto-advance while the user is browsing the carousel: focusIndex follows DOM
         focus, so moving it under the user would desync the white Steam ring from the blue row. */
      if (elementHasFocus(verticalRef.current)) {
        timeoutId = window.setTimeout(tick, CAROUSEL_STEP_MS);
        return;
      }

      setCarousel((prev) => {
        const texts = new Set(prev.history.map((s) => s.text));
        // Rotation has to be able to draw corpus chips, not only static presets: the session-RAG
        // mix is applied when the carousel is seeded, so replenishing from the static pool alone
        // carried every corpus chip out of the window within about four ticks, permanently.
        const nextPreset = pickCarouselChipWithSessionRag({
          historyTexts: texts,
          visibleTexts: visibleWindowTexts(prev.history, prev.focusIndex),
          staticFallback: () => getRandomPresetExcluding(texts, samplerOptions),
        });
        const advanced = advanceCarouselFocus(prev.history, prev.focusIndex, nextPreset);
        return advanced;
      });

      timeoutId = window.setTimeout(tick, CAROUSEL_STEP_MS);
    };

    timeoutId = window.setTimeout(tick, CAROUSEL_STEP_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [seedsKey, useLocalKnowledgeBase]);

  /**
   * Focus model: the Steam DOM focus (white ring) is the single source of truth. Every chip is
   * focusable; D-pad moves between them natively, and each chip's onFocus syncs `focusIndex`
   * (blue highlight + track position) to itself. The previous design moved `focusIndex` via
   * parent onMoveUp/onMoveDown without moving DOM focus, which left the white ring one row
   * behind the blue row — the "two outlines, the white one actually selects" confusion.
   *
   * With one visible row (2026-08-31) the rows above and below are clipped but still focusable,
   * so a D-pad step lands on a hidden chip and the track slides it into the window.
   */
  const onChipFocus = useCallback(
    (i: number) => {
      pauseAuto();
      setCarousel((prev) => (prev.focusIndex === i ? prev : { ...prev, focusIndex: i }));
    },
    [pauseAuto],
  );

  const trackOffset = carouselTrackOffsetPx(focusIndex);

  return (
    <Focusable
      /* `navRef` is a real Steam Focusable prop that Decky's types omit — same gap as `onMoveDown`,
         so it goes through the cast the repo already uses for those (SessionContextStrip). */
      {...({ navRef } as Record<string, unknown>)}
      className="bonsai-preset-carousel-focus-root"
    >
      <div className="bonsai-preset-carousel-vertical" ref={verticalRef}>
        <div
          className="bonsai-preset-carousel-track"
          style={{
            transform: `translateY(-${trackOffset}px)`,
            transition: `transform ${CAROUSEL_SLIDE_MS}ms ease-in-out`,
          }}
        >
          {history.map((preset, i) => {
            const isFocus = i === focusIndex;
            const dimmed = !isFocus;
            return (
              <div
                key={`${i}-${preset.text}`}
                className={
                  "bonsai-preset-carousel-slot" +
                  (isFocus ? " bonsai-preset-carousel-slot--focus" : "")
                }
                data-bonsai-preset-visible="true"
                /* React onFocus delegates focusin (bubbles): fires when the inner chip Button
                   gains Steam focus. @decky/ui Button doesn't expose onFocus itself. */
                onFocus={() => onChipFocus(i)}
              >
                <PresetChipButton
                  preset={preset}
                  setUnifiedInput={setUnifiedInput}
                  onPreferAskMode={onPreferAskMode}
                  dimmed={dimmed}
                  focusable
                />
              </div>
            );
          })}
        </div>
      </div>
    </Focusable>
  );
}

/**
 * One preset suggestion chip that fades out, swaps and fades back in — or, in static mode, just
 * swaps. Hold time after each appearance scales with prompt length; fade durations are fixed.
 * After `PRESET_CAROUSEL_ACTIVE_MS` no new cycles start; any fade already in progress runs to
 * completion, then the chip rests until remount.
 */
function MainTabPresetAnimatedChipsInner(props: MainTabPresetAnimatedChipsProps) {
  const {
    seeds,
    setUnifiedInput,
    fadeAnimationEnabled = true,
    animationMode = "fade",
    onPreferAskMode,
    onCarouselExitDown,
    useLocalKnowledgeBase = false,
  } = props;
  const samplerOptions = { useLocalKnowledgeBase };
  if (animationMode === "carousel") {
    return (
      <MainTabPresetVerticalCarousel
        seeds={seeds}
        setUnifiedInput={setUnifiedInput}
        onPreferAskMode={onPreferAskMode}
        onCarouselExitDown={onCarouselExitDown}
        useLocalKnowledgeBase={useLocalKnowledgeBase}
      />
    );
  }
  if (animationMode === "decode") {
    return (
      <MainTabPresetDecodeSlot
        seeds={seeds}
        setUnifiedInput={setUnifiedInput}
        onPreferAskMode={onPreferAskMode}
        onCarouselExitDown={onCarouselExitDown}
        useLocalKnowledgeBase={useLocalKnowledgeBase}
      />
    );
  }
  const staticMode = animationMode === "static" || !fadeAnimationEnabled;
  const seedsKey = seedsKeyFrom(seeds);

  const [slot, setSlot] = useState<PresetPrompt>(() => normalizeThreeSeeds(seeds, samplerOptions)[0]);
  const [slotFade, setSlotFade] = useState<SlotFade>(() =>
    staticMode ? { opacity: 1, transitionMs: 0 } : { opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_IN_MS },
  );

  useEffect(() => {
    const initial = normalizeThreeSeeds(seeds, samplerOptions);
    const started = startSingleSlotRotation(initial);
    let rotation: SingleSlotRotation = started.rotation;
    const first = started.first ?? initial[0];
    setSlot(first);

    const sessionEnd = performance.now() + PRESET_CAROUSEL_ACTIVE_MS;
    const timeouts: number[] = [];
    let cancelled = false;

    /** Only gate starting a *new* cycle after a full fade-out; never abort mid fade/hold. */
    const mayStartNextCycle = (): boolean => !cancelled && performance.now() < sessionEnd;

    const pushTimeout = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (cancelled) return;
        fn();
      }, ms);
      timeouts.push(id);
    };

    const pickNext = (current: PresetPrompt): PresetPrompt => {
      const step = nextSingleSlotPreset(current, rotation, samplerOptions);
      rotation = step.rotation;
      return step.next;
    };

    if (staticMode) {
      setSlotFade({ opacity: 1, transitionMs: 0 });
      const loop = (prompt: PresetPrompt) => {
        pushTimeout(() => {
          if (!mayStartNextCycle()) return;
          const next = pickNext(prompt);
          setSlot(next);
          loop(next);
        }, holdMsForPresetText(prompt.text));
      };
      loop(first);
      return () => {
        cancelled = true;
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    const loop = (prompt: PresetPrompt, firstDelay: number) => {
      setSlot(prompt);
      setSlotFade({ opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_OUT_MS });

      pushTimeout(() => {
        setSlotFade({ opacity: 1, transitionMs: PRESET_CAROUSEL_FADE_IN_MS });

        pushTimeout(() => {
          pushTimeout(() => {
            setSlotFade({ opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_OUT_MS });

            pushTimeout(() => {
              if (!mayStartNextCycle()) return;
              loop(pickNext(prompt), 0);
            }, PRESET_CAROUSEL_FADE_OUT_MS);
          }, holdMsForPresetText(prompt.text));
        }, PRESET_CAROUSEL_FADE_IN_MS);
      }, firstDelay);
    };

    loop(first, PRESET_SLOT_FIRST_DELAY_MS);

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [seedsKey, seeds, staticMode, useLocalKnowledgeBase]);

  const presetInteractive = staticMode || slotFade.opacity > 0;
  return (
    <div
      className="bonsai-preset-carousel-slot"
      data-bonsai-preset-visible={presetInteractive ? "true" : "false"}
      style={{
        opacity: slotFade.opacity,
        transition: `opacity ${slotFade.transitionMs}ms ease-in-out`,
      }}
    >
      <Button
        key={slot.text}
        className="bonsai-preset-glass"
        focusable={presetInteractive}
        onClick={() => {
          setUnifiedInput(joinPresetWithRunningGame(slot.text));
          if (slot.preferAskMode && onPreferAskMode) {
            onPreferAskMode(slot.preferAskMode);
          }
        }}
        style={{
          width: "100%",
          minHeight: 34,
          fontSize: 12,
          color: "#c4d3e2",
        }}
      >
        <PresetChipLabel p={slot} />
      </Button>
    </div>
  );
}

/**
 * ANY NEW PROP MUST BE ADDED HERE, and to the `useMemo` deps in
 * `features/plugin-shell/tabs/useMainTabPayload.tsx`.
 *
 * This list is hand-maintained and nothing type-checks it against the props type.
 * A prop missing here does not fail `tsc` and does not fail a test — the component
 * simply never re-renders when that prop changes, so a feature threaded down from
 * settings appears to do nothing on device with no error anywhere. The step 11
 * friction test ranked this among the highest costs in the repo for exactly that
 * reason: the failure is silent and the gate is invisible from the call site.
 */
function presetChipsPropsEqual(
  prev: MainTabPresetAnimatedChipsProps,
  next: MainTabPresetAnimatedChipsProps,
): boolean {
  return (
    seedsKeyFrom(prev.seeds) === seedsKeyFrom(next.seeds) &&
    prev.animationMode === next.animationMode &&
    prev.fadeAnimationEnabled === next.fadeAnimationEnabled &&
    prev.onPreferAskMode === next.onPreferAskMode &&
    prev.onCarouselExitDown === next.onCarouselExitDown &&
    prev.useLocalKnowledgeBase === next.useLocalKnowledgeBase
  );
}

export const MainTabPresetAnimatedChips = React.memo(MainTabPresetAnimatedChipsInner, presetChipsPropsEqual);
