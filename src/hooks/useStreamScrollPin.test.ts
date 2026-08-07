import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";

import { useStreamScrollPin } from "./useStreamScrollPin";

const VIEWPORT_BOTTOM = 250;

/**
 * jsdom has no layout, so the parts the hook reads are modelled by hand: a scroll container with a
 * settable scrollTop and a fixed 0–250 viewport, and an anchor whose on-screen rect moves as the
 * container scrolls, the way a real one does.
 */
function makeTranscript(opts: { contentBottom: number; scrollHeight?: number }) {
  const scroll = document.createElement("div");
  scroll.className = "TabContentsScroll";

  let scrollTop = 0;
  let contentBottom = opts.contentBottom;

  Object.defineProperty(scroll, "scrollTop", {
    configurable: true,
    get: () => scrollTop,
    set: (next: number) => {
      scrollTop = next;
      scroll.dispatchEvent(new Event("scroll"));
    },
  });
  Object.defineProperty(scroll, "scrollHeight", {
    configurable: true,
    get: () => opts.scrollHeight ?? 2000,
  });
  Object.defineProperty(scroll, "clientHeight", {
    configurable: true,
    get: () => VIEWPORT_BOTTOM,
  });
  scroll.getBoundingClientRect = () => rect(0, VIEWPORT_BOTTOM);

  const anchor = document.createElement("div");
  anchor.className = "bonsai-chat-main-column";
  /* Document-space bottom minus how far we have scrolled — i.e. where it actually appears. */
  anchor.getBoundingClientRect = () => rect(0 - scrollTop, contentBottom - scrollTop);
  anchor.scrollIntoView = () => {};
  scroll.appendChild(anchor);
  document.body.appendChild(scroll);

  return {
    anchorRef: { current: anchor },
    scroll,
    /** More tokens arrived: the transcript got taller. */
    grow: (by: number) => {
      contentBottom += by;
    },
    /** A swipe or a D-pad panel step. */
    userScrollTo: (top: number) => {
      scroll.scrollTop = top;
    },
    get scrollTop() {
      return scrollTop;
    },
  };
}

function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function mount(t: ReturnType<typeof makeTranscript>, enabled = true) {
  return renderHook(
    ({ text }: { text: string }) => useStreamScrollPin(t.anchorRef, text, enabled),
    { initialProps: { text: "" } }
  );
}

describe("stream scroll follow", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("brings newly arrived text into view", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);

    act(() => rerender({ text: "first tokens" }));

    // 150px of transcript was below the fold; the tail now sits on the bottom edge.
    expect(t.scrollTop).toBe(150);
  });

  it("keeps following as the answer grows", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);

    act(() => rerender({ text: "first" }));
    t.grow(120);
    act(() => rerender({ text: "first second" }));

    expect(t.scrollTop).toBe(270);
  });

  it("does nothing while the whole transcript still fits", () => {
    const t = makeTranscript({ contentBottom: 200 });
    const { rerender } = mount(t);

    act(() => rerender({ text: "short" }));

    expect(t.scrollTop).toBe(0);
  });

  /*
   * The behaviour this hook was originally written for. Scrolling up to re-read something must not
   * be undone by the next partial.
   */
  it("holds position once the user scrolls up", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);
    act(() => rerender({ text: "first" }));

    act(() => t.userScrollTo(20));
    t.grow(120);
    act(() => rerender({ text: "first second" }));

    expect(t.scrollTop).toBe(20);
  });

  /*
   * 48px of slack, so nudging the view slightly off the bottom — or a D-pad step that lands just
   * short of it — still counts as watching the answer rather than reading back.
   */
  it("treats a small gap from the bottom as still watching", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);
    act(() => rerender({ text: "first" }));

    act(() => t.userScrollTo(120)); // tail sits 30px below the fold, inside the slack
    t.grow(100);
    act(() => rerender({ text: "first second" }));

    expect(t.scrollTop).toBe(250);
  });

  it("resumes following when the user scrolls back down", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);
    act(() => rerender({ text: "first" }));
    act(() => t.userScrollTo(0));

    act(() => t.userScrollTo(150));
    t.grow(100);
    act(() => rerender({ text: "first second" }));

    expect(t.scrollTop).toBe(250);
  });

  it("stays out of the way when streaming is off", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t, false);

    act(() => rerender({ text: "first" }));

    expect(t.scrollTop).toBe(0);
  });

  it("is a no-op without a scroll container", () => {
    const orphan = document.createElement("div");
    document.body.appendChild(orphan);
    const anchorRef = { current: orphan };

    expect(() =>
      renderHook(({ text }: { text: string }) => useStreamScrollPin(anchorRef, text, true), {
        initialProps: { text: "tokens" },
      })
    ).not.toThrow();
  });
});
