import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  findUnvisitedSpoilerFenceInView,
  focusSpoilerFence,
  markSpoilerFenceVisited,
  registerSpoilerFence,
  resetSpoilerFenceRegistry,
} from "./spoilerFenceRegistry";

const alwaysInView = () => true;
const neverInView = () => false;

function makeBubbleWith(...fences: HTMLElement[]): HTMLElement {
  const bubble = document.createElement("div");
  for (const f of fences) bubble.appendChild(f);
  document.body.appendChild(bubble);
  return bubble;
}

describe("spoiler fence registry", () => {
  beforeEach(() => {
    resetSpoilerFenceRegistry();
    document.body.innerHTML = "";
  });

  it("finds nothing when no fence is registered", () => {
    const bubble = makeBubbleWith();
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBeNull();
  });

  it("finds a masked fence inside the bubble", () => {
    const fence = document.createElement("div");
    const bubble = makeBubbleWith(fence);
    registerSpoilerFence("a", fence);
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBe(fence);
  });

  it("ignores a fence that belongs to a different reply", () => {
    const fence = document.createElement("div");
    const otherBubble = makeBubbleWith(fence);
    const bubble = makeBubbleWith();
    registerSpoilerFence("a", fence);
    expect(otherBubble.contains(fence)).toBe(true);
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBeNull();
  });

  it("ignores a fence that is scrolled out of view", () => {
    const fence = document.createElement("div");
    const bubble = makeBubbleWith(fence);
    registerSpoilerFence("a", fence);
    expect(findUnvisitedSpoilerFenceInView(bubble, neverInView)).toBeNull();
  });

  it("offers a fence once, then lets Down scroll past it", () => {
    const fence = document.createElement("div");
    const bubble = makeBubbleWith(fence);
    registerSpoilerFence("a", fence);

    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBe(fence);
    markSpoilerFenceVisited(fence);
    // Without this the fence would claim every Down press and trap the user in the bubble.
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBeNull();
  });

  it("focusSpoilerFence focuses and marks visited in one step", () => {
    const fence = document.createElement("div");
    const bubble = makeBubbleWith(fence);
    const focus = vi.spyOn(fence, "focus");
    registerSpoilerFence("a", fence);

    expect(focusSpoilerFence(fence)).toBe(true);
    expect(focus).toHaveBeenCalled();
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBeNull();
  });

  /*
   * Decky renders the fence with tabindex="0" and navigates by it. Replacing that with "-1" — which
   * the first version of this helper did to every element it touched — takes the fence back out of
   * Steam's navigation graph, so the press after the reveal has nowhere to go.
   */
  it("leaves Decky's own tabindex alone", () => {
    const fence = document.createElement("div");
    fence.setAttribute("tabindex", "0");
    makeBubbleWith(fence);
    registerSpoilerFence("a", fence);

    focusSpoilerFence(fence);

    expect(fence.getAttribute("tabindex")).toBe("0");
  });

  it("makes an untabbable fence focusable before focusing it", () => {
    const fence = document.createElement("div");
    makeBubbleWith(fence);
    registerSpoilerFence("a", fence);

    focusSpoilerFence(fence);

    expect(fence.getAttribute("tabindex")).toBe("-1");
  });

  /* The return value is a measurement, not an assumption: the previous version returned true
     unconditionally, so a diversion that moved no focus still reported success and swallowed the
     press. */
  it("reports false when focus does not land", () => {
    const fence = document.createElement("div");
    makeBubbleWith(fence);
    vi.spyOn(fence, "focus").mockImplementation(() => {
      /* focus refused, as a detached or hidden node would */
    });
    registerSpoilerFence("a", fence);

    expect(focusSpoilerFence(fence)).toBe(false);
  });

  it("focusSpoilerFence is a no-op for null", () => {
    expect(focusSpoilerFence(null)).toBe(false);
  });

  it("survives an element whose focus() throws", () => {
    const fence = document.createElement("div");
    makeBubbleWith(fence);
    vi.spyOn(fence, "focus").mockImplementation(() => {
      throw new Error("detached");
    });
    registerSpoilerFence("a", fence);
    expect(() => focusSpoilerFence(fence)).not.toThrow();
  });

  it("revealing a fence removes it from consideration", () => {
    const fence = document.createElement("div");
    const bubble = makeBubbleWith(fence);
    registerSpoilerFence("a", fence);
    // The fence de-registers itself when it opens.
    registerSpoilerFence("a", null);
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBeNull();
  });

  it("walks multiple fences one press at a time", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    const bubble = makeBubbleWith(first, second);
    registerSpoilerFence("a", first);
    registerSpoilerFence("b", second);

    const one = findUnvisitedSpoilerFenceInView(bubble, alwaysInView);
    expect(one).toBe(first);
    markSpoilerFenceVisited(one!);

    const two = findUnvisitedSpoilerFenceInView(bubble, alwaysInView);
    expect(two).toBe(second);
    markSpoilerFenceVisited(two!);

    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBeNull();
  });

  it("a remounted fence is offered again under its new element", () => {
    const old = document.createElement("div");
    const bubble = makeBubbleWith(old);
    registerSpoilerFence("a", old);
    markSpoilerFenceVisited(old);
    registerSpoilerFence("a", null);

    const fresh = document.createElement("div");
    bubble.appendChild(fresh);
    registerSpoilerFence("a", fresh);
    expect(findUnvisitedSpoilerFenceInView(bubble, alwaysInView)).toBe(fresh);
  });
});
