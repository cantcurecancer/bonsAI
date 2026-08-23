import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { MainTabBonsaiAiMarkdownChunk } from "./MainTabBonsaiAiMarkdownChunk";

/*
 * `@decky/ui`'s `Focusable` has to render as a real DOM node with a working `ref`, or this suite
 * would pass for the wrong reason — see src/test-harness/fakeDeckyUi.tsx.
 */
vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

const SPOILER_SOURCE =
  "Opening line.\n\n```bonsai-spoiler\nSecret content here.\n```\n\nHere's the lowdown: more text.";

describe("MainTabBonsaiAiMarkdownChunk spoiler fence DOM shape", () => {
  /*
   * Regression guard for the D-pad-unreachable masked spoiler (roadmap: "D-pad cannot reach the
   * spoiler reveal — recurring, and the recurrence is itself the bug").
   *
   * react-markdown wraps every fenced code block's `code` output in `pre` regardless of what `code`
   * renders, so the masked fence's own `Focusable` — a real button, not monospace text — ended up
   * nested inside `<pre class="bonsai-md-fenced-pre">`. That box declares `overflow-x: auto`, which
   * gives the fence a scroll/formatting-context ancestor its own styles never asked for, and is
   * exactly the kind of coupling between the `pre:` and `code:` renderers in this one file that a
   * per-file review of `spoilerFenceRegistry.ts` — which owns none of this markup — would never see.
   * This test would have failed before the `pre:` renderer was taught to skip the wrapper for a
   * masked spoiler fence.
   */
  it("does not nest the masked fence's Focusable inside a <pre>", () => {
    const { container } = render(
      <MainTabBonsaiAiMarkdownChunk source={SPOILER_SOURCE} spoilerMaskingEnabled={true} />
    );
    const fence = container.querySelector(".bonsai-spoiler-reveal-target");
    expect(fence).toBeTruthy();
    expect(fence?.closest("pre")).toBeNull();
  });

  it("still masks the fence body until revealed", () => {
    const { container } = render(
      <MainTabBonsaiAiMarkdownChunk source={SPOILER_SOURCE} spoilerMaskingEnabled={true} />
    );
    expect(container.textContent).not.toContain("Secret content here.");
    expect(container.textContent).toContain("Spoiler — tap to show");
  });

  it("renders spoiler content inline, unwrapped, when masking is off", () => {
    const { container } = render(
      <MainTabBonsaiAiMarkdownChunk source={SPOILER_SOURCE} spoilerMaskingEnabled={false} />
    );
    expect(container.querySelector(".bonsai-spoiler-reveal-target")).toBeNull();
    expect(container.textContent).toContain("Secret content here.");
  });

  it("does not disturb an ordinary (non-spoiler) fenced code block", () => {
    const source = "Before.\n\n```json\n{\"a\": 1}\n```\n\nAfter.";
    const { container } = render(
      <MainTabBonsaiAiMarkdownChunk source={source} spoilerMaskingEnabled={true} />
    );
    const pre = container.querySelector("pre.bonsai-md-fenced-pre");
    expect(pre).toBeTruthy();
    expect(pre?.textContent).toContain('{"a": 1}');
  });
});
