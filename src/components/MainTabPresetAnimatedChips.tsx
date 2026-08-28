/**
 * Title: Preset animated chips
 * Purpose: Fade or carousel preset prompt chips with running-game contextual seeding.
 * Used for: MainTabPresetRow when presetChipAnimation is fade, carousel, static, or decode.
 * Solves: Timed slot fades, carousel track motion, and Deck-focusable chip buttons in one module.
 * Does not: Persist selected presets or submit asks — parent setUnifiedInput handles composer text.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "../features/preset-carousel/carouselState";
import { BONSAI_FOREST_GREEN } from "../features/unified-input/constants";
import { joinPresetWithRunningGame } from "../utils/joinPresetWithRunningGame";
import { elementHasFocus } from "../utils/uiDocument";

/** Fade-in duration (ms); must match the slot wrapper transition when opacity increases. */
export const PRESET_CAROUSEL_FADE_IN_MS = 1000;
/** Fade-out duration (ms); must match the slot wrapper transition when opacity decreases. */
export const PRESET_CAROUSEL_FADE_OUT_MS = 2000;
/** Carousel schedules new preset cycles for this long after mount/re-seed; in-flight fades still complete, then no more swaps until remount. */
export const PRESET_CAROUSEL_ACTIVE_MS = 60_000;

/** Milliseconds between locked characters in decode mode (must feel close to live answer streaming). */
export const PRESET_DECODE_CHAR_MS = 42;
/**
 * How often the still-churning glyphs reshuffle, ms. Throttled well below frame rate on purpose:
 * the reveal loop runs one shared `requestAnimationFrame` per tick across all three slots, but
 * only writes to the DOM on this cadence (or on a lock advance / caret blink) so a churning chip
 * does not repaint three times per 16ms frame on Deck hardware.
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

/** Per-slot decode animation state, owned by the reveal effect's closure — never React state, so a
 *  lock advance or churn refresh never triggers a re-render. See `MainTabPresetDecodeSlots`. */
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

const initialSlotFade = (): [SlotFade, SlotFade, SlotFade] => [
  { opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_IN_MS },
  { opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_IN_MS },
  { opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_IN_MS },
];

/** Stagger first fade-in start per slot so chips animate at different times. */
const PRESET_SLOT_STAGGER_MS: readonly [number, number, number] = [750, 1300, 1700];

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
  /** When false, chips stay fully opaque and prompts rotate after hold without opacity transitions. */
  fadeAnimationEnabled?: boolean;
  /** fade = opacity crossfade; carousel = vertical stack with middle focus; static = no opacity animation; decode = Ghost in the Shell scramble-to-resolve reveal. */
  animationMode?: PresetChipAnimationMode;
  /** If a preset declares `preferAskMode`, apply it when the chip is chosen. */
  onPreferAskMode?: (mode: AskModeId) => void;
  /** Carousel mode: D-pad Down at end of history moves focus to the Ask field. */
  onCarouselExitDown?: () => void;
  /** When true, KB-advice static seeds are excluded from timer-driven re-samples. */
  useLocalKnowledgeBase?: boolean;
};

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
    </Button>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The label's text is owned by the reveal effect below, written straight to this span's
 * `textContent` via `setLabelRef` \u2014 never through React state. The JSX child here is only what
 * paints during a slot's stagger delay, before its first `beginSlot` call; every frame after that
 * (the initial scramble included, since `beginSlot` also writes on start) bypasses React entirely,
 * which is the point of the rewrite (see the module header comment on frame cost).
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
        // Always the real prompt, never whatever is mid-churn on screen \u2014 the text is known from
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
        <span ref={setLabelRef}>{"\u00a0"}</span>
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
 * Ghost in the Shell title-sequence reveal: each chip arrives as a full-width block of scrambled
 * glyphs (reserving the prompt's final character width from frame 0, so the chip never reflows)
 * that lock into the real prompt left to right behind a blinking block caret, then hold and move
 * to the next prompt. Replaces the old per-character typewriter (`stream` mode) \u2014 see the module
 * header on `PresetChipAnimationMode` and CLAUDE.md's chip-decode notes for why this is a rewrite
 * of this one function rather than new plumbing.
 *
 * Per-slot animation state lives in a plain object inside the effect closure (`DecodeSlotAnim`),
 * not React state, and a single shared `requestAnimationFrame` loop drives all three slots,
 * writing straight to each label's `textContent` through a ref. `slots` React state still exists,
 * but only changes once per prompt cycle (when a new prompt begins) \u2014 that's the frequency a
 * Button's onClick closure and beta badge need, not per-frame.
 */
function MainTabPresetDecodeSlots(
  props: Omit<MainTabPresetAnimatedChipsProps, "fadeAnimationEnabled" | "animationMode">,
) {
  const { seeds, setUnifiedInput, onPreferAskMode, useLocalKnowledgeBase = false } = props;
  const samplerOptions = { useLocalKnowledgeBase };
  const seedsKey = seedsKeyFrom(seeds);
  const reducedMotion = prefersReducedMotion();

  const [slots, setSlots] = useState<[PresetPrompt, PresetPrompt, PresetPrompt]>(() =>
    normalizeThreeSeeds(seeds, samplerOptions),
  );
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const labelRefs = useRef<[HTMLSpanElement | null, HTMLSpanElement | null, HTMLSpanElement | null]>([
    null,
    null,
    null,
  ]);
  /** Stable per-slot ref callbacks \u2014 an inline arrow per render would churn ref identity and
   *  briefly null the target between renders for no reason (`slots` only updates once a cycle). */
  const labelRefSetters = useMemo(
    () =>
      [
        (el: HTMLSpanElement | null) => {
          labelRefs.current[0] = el;
        },
        (el: HTMLSpanElement | null) => {
          labelRefs.current[1] = el;
        },
        (el: HTMLSpanElement | null) => {
          labelRefs.current[2] = el;
        },
      ] as const,
    [],
  );

  useEffect(() => {
    const initial = normalizeThreeSeeds(seeds, samplerOptions);
    setSlots(initial);
    slotsRef.current = initial;

    const sessionEnd = performance.now() + PRESET_CAROUSEL_ACTIVE_MS;
    let cancelled = false;
    const mayStartNextCycle = (): boolean => !cancelled && performance.now() < sessionEnd;

    const pickNextForSlot = (slotIndex: number, current: PresetPrompt): PresetPrompt => {
      const otherTexts = slotsRef.current.filter((_, j) => j !== slotIndex).map((s) => s.text);
      return getRandomPresetExcluding(new Set([...otherTexts, current.text]), samplerOptions);
    };

    const timeouts: number[] = [];
    const pushTimeout = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (cancelled) return;
        fn();
      }, ms);
      timeouts.push(id);
    };

    // prefers-reduced-motion: reduce \u2014 swap the text in instantly, no churn, no caret blink.
    // Each slot still keeps its own stagger before its first appearance (flavor shared with every
    // other mode, not part of the "churn" the rule is about); every swap after that is instant.
    if (reducedMotion) {
      const beginReducedSlot = (slotIndex: 0 | 1 | 2, prompt: PresetPrompt) => {
        slotsRef.current = [...slotsRef.current];
        slotsRef.current[slotIndex] = prompt;
        setSlots([slotsRef.current[0]!, slotsRef.current[1]!, slotsRef.current[2]!]);
        const el = labelRefs.current[slotIndex];
        if (el) el.textContent = prompt.text;
      };

      const runReducedSlot = (slotIndex: 0 | 1 | 2, prompt: PresetPrompt, firstDelay: number) => {
        pushTimeout(() => {
          beginReducedSlot(slotIndex, prompt);
          pushTimeout(() => {
            if (!mayStartNextCycle()) return;
            const nextPrompt = pickNextForSlot(slotIndex, prompt);
            runReducedSlot(slotIndex, nextPrompt, 0);
          }, holdMsForPresetText(prompt.text));
        }, firstDelay);
      };

      runReducedSlot(0, initial[0]!, PRESET_SLOT_STAGGER_MS[0]);
      runReducedSlot(1, initial[1]!, PRESET_SLOT_STAGGER_MS[1]);
      runReducedSlot(2, initial[2]!, PRESET_SLOT_STAGGER_MS[2]);

      return () => {
        cancelled = true;
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    // Full decode path. One shared rAF loop drives all three slots; DOM writes are throttled to
    // a lock advance, a churn refresh, or a caret blink \u2014 not every frame. See the module header.
    const state: [DecodeSlotAnim | null, DecodeSlotAnim | null, DecodeSlotAnim | null] = [null, null, null];
    let rafId = 0;
    let lastChurnRefresh = 0;
    let lastBlinkToggle = 0;
    let caretOn = true;

    const beginSlot = (slotIndex: 0 | 1 | 2, prompt: PresetPrompt, now: number) => {
      const churn = makeDecodeChurn(prompt.text.length);
      state[slotIndex] = {
        prompt,
        startAt: now,
        churn,
        lastRevealedCount: -1,
        resolved: false,
        holdEndAt: 0,
      };
      slotsRef.current = [...slotsRef.current];
      slotsRef.current[slotIndex] = prompt;
      setSlots([slotsRef.current[0]!, slotsRef.current[1]!, slotsRef.current[2]!]);
      // Frame 0: the label is already mounted (every chip renders at t=0; only its first
      // `beginSlot` call is staggered), so paint the full-length scramble immediately rather than
      // waiting for the next rAF tick.
      const el = labelRefs.current[slotIndex];
      if (el) el.textContent = composeDecodeText(prompt.text, 0, churn, true);
    };

    const processSlot = (slotIndex: 0 | 1 | 2, now: number, churnDue: boolean, blinkDue: boolean) => {
      const anim = state[slotIndex];
      if (!anim) return;

      if (anim.resolved) {
        if (now >= anim.holdEndAt && mayStartNextCycle()) {
          const nextPrompt = pickNextForSlot(slotIndex, anim.prompt);
          beginSlot(slotIndex, nextPrompt, now);
        }
        return;
      }

      const text = anim.prompt.text;
      const elapsed = now - anim.startAt;
      const revealedCount = Math.min(text.length, Math.floor(elapsed / PRESET_DECODE_CHAR_MS));

      if (revealedCount >= text.length) {
        anim.resolved = true;
        anim.holdEndAt = now + holdMsForPresetText(text);
        const el = labelRefs.current[slotIndex];
        if (el) el.textContent = text;
        return;
      }

      if (churnDue) {
        anim.churn = makeDecodeChurn(text.length);
      }
      if (revealedCount !== anim.lastRevealedCount || churnDue || blinkDue) {
        anim.lastRevealedCount = revealedCount;
        const el = labelRefs.current[slotIndex];
        if (el) el.textContent = composeDecodeText(text, revealedCount, anim.churn, caretOn);
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
      processSlot(0, now, churnDue, blinkDue);
      processSlot(1, now, churnDue, blinkDue);
      processSlot(2, now, churnDue, blinkDue);
      if (churnDue) lastChurnRefresh = now;
      rafId = window.requestAnimationFrame(tick);
    };

    pushTimeout(() => beginSlot(0, initial[0]!, performance.now()), PRESET_SLOT_STAGGER_MS[0]);
    pushTimeout(() => beginSlot(1, initial[1]!, performance.now()), PRESET_SLOT_STAGGER_MS[1]);
    pushTimeout(() => beginSlot(2, initial[2]!, performance.now()), PRESET_SLOT_STAGGER_MS[2]);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [seedsKey, seeds, reducedMotion, useLocalKnowledgeBase]);

  return (
    <>
      {slots.map((p, i) => (
        <div
          key={`preset-decode-slot-${i}`}
          className="bonsai-preset-carousel-slot"
          data-bonsai-preset-visible="true"
        >
          <DecodePresetChipButton
            preset={p}
            setLabelRef={labelRefSetters[i]!}
            setUnifiedInput={setUnifiedInput}
            onPreferAskMode={onPreferAskMode}
          />
        </div>
      ))}
    </>
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
        const nextPreset = getRandomPresetExcluding(texts, samplerOptions);
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
   * (blue highlight + track centering) to itself. The previous design moved `focusIndex` via
   * parent onMoveUp/onMoveDown without moving DOM focus, which left the white ring one row
   * behind the blue row — the "two outlines, the white one actually selects" confusion.
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
    <Focusable className="bonsai-preset-carousel-focus-root">
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
 * Three preset suggestion chips with independent fade in/out cycles.
 * Hold time after each fade-in scales with prompt length; fade durations are fixed.
 * After `PRESET_CAROUSEL_ACTIVE_MS` no new cycles start; any fade already in progress runs to completion, then the carousel rests until remount.
 */
const staticSlotFade = (): [SlotFade, SlotFade, SlotFade] => [
  { opacity: 1, transitionMs: 0 },
  { opacity: 1, transitionMs: 0 },
  { opacity: 1, transitionMs: 0 },
];

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
      <MainTabPresetDecodeSlots
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

  const [slots, setSlots] = useState<[PresetPrompt, PresetPrompt, PresetPrompt]>(() =>
    normalizeThreeSeeds(seeds, samplerOptions),
  );
  const [slotFade, setSlotFade] = useState<[SlotFade, SlotFade, SlotFade]>(initialSlotFade);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  useEffect(() => {
    const initial = normalizeThreeSeeds(seeds, samplerOptions);
    setSlots(initial);
    slotsRef.current = initial;

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

    const pickNextForSlot = (slotIndex: number, current: PresetPrompt): PresetPrompt => {
      const otherTexts = slotsRef.current.filter((_, j) => j !== slotIndex).map((s) => s.text);
      return getRandomPresetExcluding(new Set([...otherTexts, current.text]), samplerOptions);
    };

    if (staticMode) {
      setSlotFade(staticSlotFade());
      const runSlotStatic = (slotIndex: 0 | 1 | 2) => {
        const loop = (prompt: PresetPrompt) => {
          const hold = holdMsForPresetText(prompt.text);
          pushTimeout(() => {
            if (!mayStartNextCycle()) return;
            const nextPrompt = pickNextForSlot(slotIndex, prompt);
            slotsRef.current = [...slotsRef.current];
            slotsRef.current[slotIndex] = nextPrompt;
            setSlots([slotsRef.current[0]!, slotsRef.current[1]!, slotsRef.current[2]!]);
            loop(nextPrompt);
          }, hold);
        };
        loop(initial[slotIndex]!);
      };
      runSlotStatic(0);
      runSlotStatic(1);
      runSlotStatic(2);
      return () => {
        cancelled = true;
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    setSlotFade(initialSlotFade());

    const runSlot = (slotIndex: 0 | 1 | 2) => {
      const stagger = PRESET_SLOT_STAGGER_MS[slotIndex];

      const loop = (prompt: PresetPrompt, firstStagger: number) => {
        slotsRef.current = [...slotsRef.current];
        slotsRef.current[slotIndex] = prompt;
        setSlots([slotsRef.current[0]!, slotsRef.current[1]!, slotsRef.current[2]!]);

        setSlotFade((prev) => {
          const next = [...prev] as [SlotFade, SlotFade, SlotFade];
          next[slotIndex] = { opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_OUT_MS };
          return next;
        });

        pushTimeout(() => {
          setSlotFade((prev) => {
            const next = [...prev] as [SlotFade, SlotFade, SlotFade];
            next[slotIndex] = { opacity: 1, transitionMs: PRESET_CAROUSEL_FADE_IN_MS };
            return next;
          });

          pushTimeout(() => {
            const hold = holdMsForPresetText(prompt.text);

            pushTimeout(() => {
              setSlotFade((prev) => {
                const next = [...prev] as [SlotFade, SlotFade, SlotFade];
                next[slotIndex] = { opacity: 0, transitionMs: PRESET_CAROUSEL_FADE_OUT_MS };
                return next;
              });

              pushTimeout(() => {
                if (!mayStartNextCycle()) return;
                const nextPrompt = pickNextForSlot(slotIndex, prompt);
                loop(nextPrompt, 0);
              }, PRESET_CAROUSEL_FADE_OUT_MS);
            }, hold);
          }, PRESET_CAROUSEL_FADE_IN_MS);
        }, firstStagger);
      };

      loop(initial[slotIndex]!, stagger);
    };

    runSlot(0);
    runSlot(1);
    runSlot(2);

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [seedsKey, seeds, staticMode, useLocalKnowledgeBase]);

  return (
    <>
      {slots.map((p, i) => {
        const slotOpacity = slotFade[i]?.opacity ?? 0;
        const presetInteractive = staticMode || slotOpacity > 0;
        return (
          <div
            key={`preset-slot-${i}`}
            className="bonsai-preset-carousel-slot"
            data-bonsai-preset-visible={presetInteractive ? "true" : "false"}
            style={{
              opacity: slotOpacity,
              transition: `opacity ${slotFade[i]?.transitionMs ?? PRESET_CAROUSEL_FADE_IN_MS}ms ease-in-out`,
            }}
          >
            <Button
              key={`${i}-${p.text}`}
              className="bonsai-preset-glass"
              focusable={presetInteractive}
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
                color: "#c4d3e2",
              }}
            >
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
                {p.beta && (
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
                )}
              </span>
            </Button>
          </div>
        );
      })}
    </>
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
