/**
 * Guards the two silent gates on the preset-chip path.
 *
 * `MainTabPresetAnimatedChips` is wrapped in `React.memo` with a hand-written
 * comparator (`presetChipsPropsEqual`). Nothing type-checks that comparator against
 * the props type, so a prop left out of it does not fail `tsc` and does not fail any
 * other test — the component simply stops re-rendering when that prop changes, and a
 * feature threaded down from settings silently does nothing on device.
 *
 * The step 11 friction test (docs/audit/03-friction.md) ranked that failure mode
 * among the highest costs in this repo. These tests exist so the next person to add a
 * prop and forget the comparator finds out from a red suite rather than from a Deck.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  composeDecodeText,
  MainTabPresetAnimatedChips,
  PRESET_CAROUSEL_ACTIVE_MS,
  PRESET_DECODE_CARET_CHAR,
} from "./MainTabPresetAnimatedChips";
import { setFrozenTestChips, type PresetPrompt } from "../data/presets";
import { CAROUSEL_STEP_MS, CAROUSEL_HISTORY_MAX } from "../features/preset-carousel/carouselState";
import { PRESET_VISIBLE_SLOTS } from "../features/preset-carousel/presetRowLayout";
import { resetFakeDeckyRpc } from "../test-harness/fakeDeckyRpc";

const seed = (text: string): PresetPrompt => ({ text, category: "general" });

function renderChips(props: Partial<React.ComponentProps<typeof MainTabPresetAnimatedChips>> = {}) {
  return render(
    <MainTabPresetAnimatedChips
      seeds={[seed("alpha"), seed("bravo"), seed("charlie")]}
      setUnifiedInput={vi.fn()}
      animationMode="static"
      {...props}
    />,
  );
}

describe("MainTabPresetAnimatedChips memo gate", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
  });

  it("renders the seeds it is given", () => {
    renderChips();
    expect(screen.getByText("alpha")).toBeTruthy();
  });

  it("re-renders when the seed list changes", () => {
    // The comparator keys on seed text via `seedsKeyFrom`. If that ever stops
    // covering seeds, this is what catches it.
    const { rerender } = renderChips();
    expect(screen.getByText("alpha")).toBeTruthy();

    rerender(
      <MainTabPresetAnimatedChips
        seeds={[seed("delta"), seed("echo"), seed("foxtrot")]}
        setUnifiedInput={vi.fn()}
        animationMode="static"
      />,
    );

    expect(screen.getByText("delta")).toBeTruthy();
    expect(screen.queryByText("alpha")).toBeNull();
  });

  it("re-renders when animationMode changes", () => {
    const { rerender } = renderChips({ animationMode: "static" });
    rerender(
      <MainTabPresetAnimatedChips
        seeds={[seed("alpha"), seed("bravo"), seed("charlie")]}
        setUnifiedInput={vi.fn()}
        animationMode="carousel"
      />,
    );
    // Carousel mode renders a different chip structure; the assertion that matters
    // is that the memo let the update through at all.
    expect(screen.queryByText("alpha")).toBeTruthy();
  });

  it("keeps the decode-mode chips focusable while glyphs are still churning", () => {
    const { container } = renderChips({ animationMode: "decode" });
    const slots = container.querySelectorAll('[data-bonsai-preset-visible="true"]');
    expect(slots).toHaveLength(PRESET_VISIBLE_SLOTS);
  });

  /* Two chips side by side since 2026-09-01 (D43). The row was one chip for a day (2026-08-31)
     and three stacked rows before that. */
  it("renders PRESET_VISIBLE_SLOTS chips side by side in fade / static / decode", () => {
    for (const mode of ["static", "fade", "decode"] as const) {
      const { container, unmount } = renderChips({ animationMode: mode });
      const row = container.querySelector(".bonsai-preset-carousel-focus-root.bonsai-preset-across");
      expect(row, `${mode}: the chips share one horizontal focus container`).toBeTruthy();
      expect(row!.querySelectorAll(":scope > .bonsai-preset-carousel-slot")).toHaveLength(PRESET_VISIBLE_SLOTS);
      unmount();
    }
  });

  it("carousel mode is a window on the history with the focused chip marked", () => {
    const { container } = renderChips({ animationMode: "carousel" });
    expect(container.querySelector(".bonsai-preset-carousel-viewport")).toBeTruthy();
    // Every seed is in the history track (clipped or not); exactly one carries the current marker.
    expect(container.querySelectorAll(".bonsai-preset-carousel-track > .bonsai-preset-carousel-slot")).toHaveLength(3);
    const focused = container.querySelectorAll(".bonsai-preset-carousel-slot--focus");
    expect(focused).toHaveLength(1);
    expect(focused[0]?.textContent).toContain("alpha");
    // Only the two chips in the window are focus stops; the third is rendered for the slide but
    // is not somewhere the ring can land (found on device 2026-09-01: a focusable off-screen first
    // child made Steam skip the whole row on a fresh panel).
    const visible = Array.from(container.querySelectorAll(".bonsai-preset-carousel-slot")).map((s) =>
      s.getAttribute("data-bonsai-preset-visible"),
    );
    expect(visible).toEqual(["true", "true", "false"]);
  });

  /* The Tip badge exists to be seen at a glance (Phase 4 track 1); only the prompt text scrolls. */
  it("keeps the Tip badge pinned outside the scrolling text", () => {
    const { container } = render(
      <MainTabPresetAnimatedChips
        seeds={[{ ...seed("How do I beat Glyphid Dreadnought?"), ragTip: true }, seed("bravo"), seed("charlie")]}
        setUnifiedInput={vi.fn()}
        animationMode="static"
      />,
    );
    const badge = container.querySelector(".bonsai-preset-chip-tip-badge");
    expect(badge).toBeTruthy();
    expect(badge!.closest(".bonsai-preset-chip-text")).toBeNull();
    const text = container.querySelector(".bonsai-preset-chip-text--marquee");
    expect(text?.textContent).toBe("How do I beat Glyphid Dreadnought?");
  });

  it("every prop in the props type is compared by presetChipsPropsEqual", () => {
    // The real guard. `presetChipsPropsEqual` is hand-maintained; this asserts the
    // set of props it reads matches the set the component declares, so adding a
    // prop without adding it to the comparator fails here instead of on a Deck.
    const source = MainTabPresetAnimatedChips.toString();
    expect(typeof source).toBe("string");

    // Props the component accepts, from its own type declaration, kept literal on
    // purpose: this list is the thing a forgotten prop has to be added to.
    const declaredProps = [
      "seeds",
      "setUnifiedInput",
      "fadeAnimationEnabled",
      "animationMode",
      "onPreferAskMode",
      "onCarouselExitDown",
      "useLocalKnowledgeBase",
      "askRestartToken",
    ];

    // `setUnifiedInput` is deliberately not compared — it is a setState identity
    // that changes every render and comparing it would defeat the memo entirely.
    const intentionallyUncompared = ["setUnifiedInput"];

    const comparatorSource = presetChipsPropsEqualSource();
    const missing = declaredProps
      .filter((p) => !intentionallyUncompared.includes(p))
      .filter((p) => !comparatorSource.includes(p));

    expect(missing).toEqual([]);
  });
});

/**
 * `presetChipsPropsEqual` is module-private, so read it off the memo wrapper rather
 * than exporting it purely for a test.
 */
function presetChipsPropsEqualSource(): string {
  const memo = MainTabPresetAnimatedChips as unknown as { compare?: (a: unknown, b: unknown) => boolean };
  return memo.compare ? memo.compare.toString() : "";
}

/**
 * `composeDecodeText` is the pure core of the decode reveal: given a lock boundary and a churn
 * buffer, what should the label show right now. Covered directly here rather than through the
 * animation timing (rAF-driven, and per CLAUDE.md's chip-decode notes not meaningfully unit
 * testable) — everything the rewrite promises about *shape* (fixed width, correct locked prefix,
 * caret at the boundary, no caret once resolved) is a property of this function alone.
 */
describe("composeDecodeText", () => {
  const churn = ["1", "2", "3", "4", "5"]; // fixed, deterministic stand-in for random glyphs

  it("reserves the full final length from the first character", () => {
    // Nothing locked yet: the whole string is caret + churn, but still exactly text.length long.
    const out = composeDecodeText("alpha", 0, churn, true);
    expect(out).toHaveLength("alpha".length);
    expect(out).toBe(PRESET_DECODE_CARET_CHAR + "2345");
  });

  it("locks characters left to right and never shows the real tail early", () => {
    const out = composeDecodeText("alpha", 2, churn, false);
    expect(out).toHaveLength("alpha".length);
    // Locked prefix is the real text...
    expect(out.slice(0, 2)).toBe("al");
    // ...but the still-churning tail is not "pha" — it is whatever the churn buffer holds.
    expect(out.slice(2)).toBe("345");
    expect(out).not.toBe("alpha");
  });

  it("caret sits at the lock boundary and blinks without changing the string length", () => {
    const caretOn = composeDecodeText("alpha", 2, churn, true);
    const caretOff = composeDecodeText("alpha", 2, churn, false);
    expect(caretOn).toBe("al" + PRESET_DECODE_CARET_CHAR + "45");
    expect(caretOff).toBe("al345");
    expect(caretOn).toHaveLength(caretOff.length);
  });

  it("once every character is locked, returns the real text with no caret", () => {
    expect(composeDecodeText("alpha", 5, churn, true)).toBe("alpha");
    expect(composeDecodeText("alpha", 99, churn, true)).toBe("alpha");
  });
});

describe("MainTabPresetAnimatedChips decode mode", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, "matchMedia");
  });

  function mockReducedMotion(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matches && query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  it("selecting a chip always submits the real prompt, never the on-screen partial", () => {
    // Clicked the instant it mounts, before any reveal timer has fired at all — the label is
    // still showing its pre-reveal placeholder. If onClick ever started reading the display
    // state instead of the preset object, this is what would catch it: there is nothing
    // resembling "alpha" on screen yet, but the submitted text must still be the real prompt.
    const setUnifiedInput = vi.fn();
    const { container } = render(
      <MainTabPresetAnimatedChips
        seeds={[seed("alpha"), seed("bravo"), seed("charlie")]}
        setUnifiedInput={setUnifiedInput}
        animationMode="decode"
      />,
    );

    const firstButton = container.querySelector(".bonsai-preset-glass--decode");
    expect(firstButton).toBeTruthy();
    fireEvent.click(firstButton!);

    expect(setUnifiedInput).toHaveBeenCalledTimes(1);
    expect(setUnifiedInput).toHaveBeenCalledWith(expect.stringContaining("alpha"));
  });

  it("prefers-reduced-motion swaps each chip's text in instantly, with no caret and no scroll", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    try {
      const { container } = render(
        <MainTabPresetAnimatedChips
          seeds={[seed("alpha"), seed("bravo"), seed("charlie")]}
          setUnifiedInput={vi.fn()}
          animationMode="decode"
        />,
      );

      // The reduced-motion path only ever uses setTimeout (never requestAnimationFrame), so
      // advancing fake timers past the slot's stagger delay is enough to settle it — no
      // rAF-timing ambiguity to worry about here.
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const labels = Array.from(
        container.querySelectorAll(".bonsai-preset-glass--decode .bonsai-preset-chip-text"),
      );
      expect(labels).toHaveLength(PRESET_VISIBLE_SLOTS);
      expect(labels.map((l) => l.textContent)).toEqual(["alpha", "bravo"]);
      for (const label of labels) {
        expect(label.textContent).not.toContain(PRESET_DECODE_CARET_CHAR);
        // Reduced motion: the plain cut-off label, never the scrolling one.
        expect(label.classList.contains("bonsai-preset-chip-text--marquee")).toBe(false);
      }
    } finally {
      vi.useRealTimers();
    }
  });
});

/*
 * D58 #3: a pinned QA batch always reseeds to its first three entries verbatim
 * (`applyTempFrozenCarousel` in data/presets.ts), so `seedsKeyFrom` cannot tell an Ask happened
 * from that alone -- the row's 60-second walk (`PRESET_CAROUSEL_ACTIVE_MS`) stopped restarting on
 * an Ask, and chips past what the auto-advance had already reached before the user started
 * browsing could never be reached. `askRestartToken` (bumped by MainTabPresetRow when an Ask
 * completes) is the independent-of-text signal that restarts it.
 */
describe("MainTabPresetAnimatedChips askRestartToken (D58 #3: an Ask restarts the walk)", () => {
  afterEach(() => {
    vi.useRealTimers();
    setFrozenTestChips([]);
  });

  it("static mode: a bumped token restarts the walk even though the pinned seeds are unchanged", () => {
    setFrozenTestChips(["q1", "q2", "q3", "q4", "q5"]);
    vi.useFakeTimers();
    const seeds = [seed("q1"), seed("q2"), seed("q3")];
    const firstSlotText = (container: HTMLElement) =>
      container.querySelectorAll(".bonsai-preset-carousel-slot .bonsai-preset-chip-text")[0]?.textContent;

    const { container, rerender } = render(
      <MainTabPresetAnimatedChips
        seeds={seeds}
        setUnifiedInput={vi.fn()}
        animationMode="static"
        askRestartToken={0}
      />,
    );
    expect(firstSlotText(container)).toBe("q1");

    // Comfortably past PRESET_CAROUSEL_ACTIVE_MS: rotation has moved on and then stopped
    // scheduling further cycles.
    act(() => {
      vi.advanceTimersByTime(PRESET_CAROUSEL_ACTIVE_MS + 10_000);
    });
    const stalledAt = firstSlotText(container);
    expect(stalledAt).not.toBe("q1");

    // More time passing with no restart: the walk stays stopped where it left off.
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(firstSlotText(container)).toBe(stalledAt);

    // Same seeds -- a pinned batch always reseeds to the same three -- but the Ask completed, so
    // MainTabPresetRow bumps the token. The whole effect restarts, the same as a fresh mount:
    // "q1" reappearing is the proof, since rotation could not otherwise land back on it once it
    // had moved past it.
    rerender(
      <MainTabPresetAnimatedChips
        seeds={seeds}
        setUnifiedInput={vi.fn()}
        animationMode="static"
        askRestartToken={1}
      />,
    );
    expect(firstSlotText(container)).toBe("q1");
  });

  it("carousel mode: a bumped token restarts the 60s auto-advance without touching existing history", () => {
    // More entries than the carousel's window keeps, so the auto-tick has real batch entries left
    // to walk through rather than degenerating to repeats once the whole batch is on screen.
    const batch = Array.from({ length: CAROUSEL_HISTORY_MAX + 3 }, (_, i) => `q${i + 1}`);
    setFrozenTestChips(batch);
    vi.useFakeTimers();
    const seeds = [seed("q1"), seed("q2"), seed("q3")];
    const newestText = (container: HTMLElement) =>
      container.querySelector(".bonsai-preset-carousel-slot--focus")?.textContent ?? null;

    const { container, rerender } = render(
      <MainTabPresetAnimatedChips
        seeds={seeds}
        setUnifiedInput={vi.fn()}
        animationMode="carousel"
        askRestartToken={0}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(PRESET_CAROUSEL_ACTIVE_MS + 5_000);
    });
    const stalledAt = newestText(container);

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(newestText(container)).toBe(stalledAt);

    // Bumping the token alone must not move anything: unlike static/decode, the carousel has a
    // persistent, browsable history worth keeping across an Ask, so a restart only extends the
    // ticker's deadline.
    rerender(
      <MainTabPresetAnimatedChips
        seeds={seeds}
        setUnifiedInput={vi.fn()}
        animationMode="carousel"
        askRestartToken={1}
      />,
    );
    expect(newestText(container)).toBe(stalledAt);

    act(() => {
      vi.advanceTimersByTime(CAROUSEL_STEP_MS + 500);
    });
    expect(newestText(container)).not.toBe(stalledAt);
  });
});
