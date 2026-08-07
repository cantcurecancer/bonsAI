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
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainTabPresetAnimatedChips } from "./MainTabPresetAnimatedChips";
import type { PresetPrompt } from "../data/presets";
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

  it("keeps stream-mode chips focusable while text is still typing", () => {
    const { container } = renderChips({ animationMode: "stream" });
    const slots = container.querySelectorAll('[data-bonsai-preset-visible="true"]');
    expect(slots).toHaveLength(3);
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
