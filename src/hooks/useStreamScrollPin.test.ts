import { afterEach, describe, expect, it, vi } from "vitest";
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
  const scrollIntoView = vi.fn();
  anchor.scrollIntoView = scrollIntoView;
  scroll.appendChild(anchor);
  document.body.appendChild(scroll);

  return {
    anchorRef: { current: anchor },
    scroll,
    scrollIntoView,
    /* A scroll event delivered after the fact, carrying a position nobody moved to since. Real
       scroll events are asynchronous; this is what one looks like arriving late. */
    emitScroll: () => scroll.dispatchEvent(new Event("scroll")),
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

  /*
   * Reported on device 2026-08-07: following worked, then locked a paragraph short of the tail.
   *
   * `scroll` events are asynchronous, so one caused by the follow itself lands a frame or more
   * later — by which time the reveal has added text and the tail is below the fold again. Read as
   * "the user scrolled up", that pins the view at the position the follow just set, and nothing
   * moves for the rest of the answer.
   */
  it("does not mistake its own scroll for the user's when it arrives late", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);
    act(() => rerender({ text: "first" }));
    expect(t.scrollTop).toBe(150);

    t.grow(200);
    act(() => t.emitScroll());

    act(() => rerender({ text: "first second" }));
    expect(t.scrollTop).toBe(350);
  });

  /*
   * On device the answer ran past the bottom edge while the panel reported itself fully scrolled —
   * the QAM's scroll range does not always cover its own content. Assigning scrollTop cannot go
   * further, so the browser is asked to move whichever ancestor can.
   */
  it("hands off to the browser when the panel will not scroll far enough", () => {
    const t = makeTranscript({ contentBottom: 400, scrollHeight: 300 });
    const { rerender } = mount(t);

    act(() => rerender({ text: "first" }));

    expect(t.scrollTop).toBe(50); // clamped at the container's maximum
    expect(t.scrollIntoView).toHaveBeenCalledWith({ block: "end", behavior: "auto" });
  });

  it("does not hand off when the panel got there on its own", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = mount(t);

    act(() => rerender({ text: "first" }));

    expect(t.scrollIntoView).not.toHaveBeenCalled();
  });

  /* A pin taken during the previous answer, or by the scrollIntoView that fires as a turn opens,
     must not freeze the next one before a token has arrived. */
  it("starts each answer following again", () => {
    const t = makeTranscript({ contentBottom: 400 });
    const { rerender } = renderHook(
      ({ text, on }: { text: string; on: boolean }) => useStreamScrollPin(t.anchorRef, text, on),
      { initialProps: { text: "", on: true } }
    );
    act(() => t.userScrollTo(0));
    act(() => rerender({ text: "first", on: true }));
    expect(t.scrollTop).toBe(0); // pinned, as it should be

    act(() => rerender({ text: "first", on: false })); // the answer finished
    act(() => rerender({ text: "new answer", on: true })); // the next one starts

    expect(t.scrollTop).toBe(150);
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
