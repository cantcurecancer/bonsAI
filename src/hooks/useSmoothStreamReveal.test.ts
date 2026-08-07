import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSmoothStreamReveal, FENCE_BURST_RATE_MULTIPLIER } from "./useSmoothStreamReveal";

describe("useSmoothStreamReveal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("snaps to full target when done (T3 settle)", () => {
    const { result, rerender } = renderHook(
      ({ target, enabled, done }) => useSmoothStreamReveal({ targetText: target, enabled, done }),
      { initialProps: { target: "Hello", enabled: true, done: false } }
    );
    rerender({ target: "Hello world", enabled: true, done: true });
    expect(result.current).toBe("Hello world");
  });

  it("does not shrink display when target grows", () => {
    let rafCb: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb;
      return 1;
    });
    const { result, rerender } = renderHook(
      ({ target, enabled, done }) => useSmoothStreamReveal({ targetText: target, enabled, done }),
      { initialProps: { target: "ab", enabled: true, done: false } }
    );
    act(() => {
      rafCb?.(16);
    });
    const lenAfterFirst = result.current.length;
    rerender({ target: "abcdef", enabled: true, done: false });
    act(() => {
      rafCb?.(32);
    });
    expect(result.current.length).toBeGreaterThanOrEqual(lenAfterFirst);
  });

  it("restarts reveal after display catches up and target grows again", () => {
    let rafId = 0;
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      callbacks.push(cb);
      return ++rafId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const { result, rerender } = renderHook(
      ({ target, enabled, done }) => useSmoothStreamReveal({ targetText: target, enabled, done }),
      { initialProps: { target: "Hi", enabled: true, done: false } }
    );
    // Drain until caught up
    for (let i = 0; i < 20 && result.current.length < 2; i++) {
      const cb = callbacks.pop();
      if (!cb) break;
      act(() => {
        cb(16 * (i + 1));
      });
    }
    expect(result.current.length).toBe(2);
    // New partial arrives after catch-up — RAF must restart
    rerender({ target: "Hi there friend", enabled: true, done: false });
    const before = result.current.length;
    const cb = callbacks.pop();
    expect(cb).toBeTruthy();
    act(() => {
      cb?.(1000);
    });
    expect(result.current.length).toBeGreaterThan(before);
  });

  /**
   * The old fixed 160 chars/s ceiling sat below real generation speed, so a fast host left the
   * reveal permanently behind and T3 dumped the remainder in one frame.
   */
  it("drains a large backlog in about one poll interval instead of at a fixed cap", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const long = "x".repeat(1000);
    const { result } = renderHook(() =>
      useSmoothStreamReveal({ targetText: long, enabled: true, done: false })
    );

    act(() => {
      callbacks.pop()?.(0);
    });
    act(() => {
      callbacks.pop()?.(180);
    });

    // At the old cap this frame could only move ~28 characters.
    expect(result.current.length).toBe(1000);
  });

  it("keeps the frame loop alive after catching up so the next partial starts immediately", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSmoothStreamReveal({ targetText: "ab", enabled: true, done: false })
    );

    for (let i = 0; i < 5; i++) {
      act(() => {
        callbacks.pop()?.(16 * (i + 1));
      });
    }
    expect(result.current).toBe("ab");
    // Caught up, but still scheduled: an idle frame must not tear the loop down.
    expect(callbacks.length).toBeGreaterThan(0);
  });

  it("returns target immediately when disabled", () => {
    const { result } = renderHook(() =>
      useSmoothStreamReveal({ targetText: "full text", enabled: false, done: false })
    );
    expect(result.current).toBe("full text");
  });

  it("exports fence burst multiplier at 3×", () => {
    expect(FENCE_BURST_RATE_MULTIPLIER).toBe(3);
  });
});
