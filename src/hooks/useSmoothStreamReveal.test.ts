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
