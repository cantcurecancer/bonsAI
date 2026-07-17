import { describe, expect, it } from "vitest";
import { composeThinkingBlurb, extractQuestionSnippet } from "./composeThinkingBlurb";

const BANNED_PREFIXES = [/^yeah,/i, /^fine\./i, /^sure\./i, /^oh joy/i, /^right\./i];

function assertNoBannedPrefixes(text: string) {
  for (const re of BANNED_PREFIXES) {
    expect(text).not.toMatch(re);
  }
  expect(text).not.toContain("🙄🔥");
}

describe("composeThinkingBlurb", () => {
  it("weaves question snippet without banned lazy prefixes", () => {
    const out = composeThinkingBlurb("why is my fps low in elden ring", {
      appName: "Elden Ring",
      requestId: 7,
    });
    expect(out.toLowerCase()).toContain("fps");
    expect(out.length).toBeLessThanOrEqual(240);
    assertNoBannedPrefixes(out);
  });

  it("extractQuestionSnippet matches backend clause split", () => {
    expect(extractQuestionSnippet("stuck on the shrine puzzle? help")).toContain("shrine");
    expect(extractQuestionSnippet("")).toBe("");
  });

  it("stable pick matches backend for same request id", () => {
    const a = composeThinkingBlurb("help with stuttering", { requestId: 11 });
    const b = composeThinkingBlurb("help with stuttering", { requestId: 11 });
    expect(a).toBe(b);
  });

  it("does not rotate copy on elapsed alone", () => {
    const a = composeThinkingBlurb("help with stuttering", { requestId: 11, elapsedSeconds: 0 });
    const b = composeThinkingBlurb("help with stuttering", { requestId: 11, elapsedSeconds: 12 });
    expect(a).toBe(b);
  });

  it("omits game-title-only lines when no running game", () => {
    const out = composeThinkingBlurb("generic question here", { requestId: 1 });
    expect(out).not.toMatch(/again\? alright/i);
    expect(out).not.toMatch(/still struggling with/i);
  });

  it("includes game-title lines when app name is set", () => {
    const samples = Array.from({ length: 20 }, (_, i) =>
      composeThinkingBlurb("generic question here", { appName: "Elden Ring", requestId: i }),
    );
    const hasGameTitleLine = samples.some(
      (s) =>
        s.includes("Elden Ring again?") ||
        s.includes("Still struggling with Elden Ring") ||
        s.includes("Back to wrestling with Elden Ring"),
    );
    expect(hasGameTitleLine).toBe(true);
  });

  it("uses deadpan pools for deadpan character presets", () => {
    const samples = Array.from({ length: 12 }, (_, i) =>
      composeThinkingBlurb("how do I beat this shrine puzzle", {
        requestId: i,
        characterEnabled: true,
        characterPresetId: "portal_glados",
      }),
    );
    for (const out of samples) assertNoBannedPrefixes(out);
    const hasDeadpanLine = samples.some((s) =>
      /acknowledged|no enthusiasm|inevitably|results pending|logged/i.test(s),
    );
    const hasEmojiOnly = samples.some((s) => ["🙄", "😮‍💨", "🫠", "🌳"].includes(s));
    expect(hasDeadpanLine || hasEmojiOnly).toBe(true);
  });

  it("uses witty screenshot pool when attachment present", () => {
    const samples = Array.from({ length: 12 }, (_, i) =>
      composeThinkingBlurb("what is this UI element", {
        requestId: i,
        attachmentCount: 1,
      }),
    );
    for (const out of samples) assertNoBannedPrefixes(out);
    const hasScreenshotLine = samples.some((s) => /screenshot|pixels|capture|decode/i.test(s));
    const hasEmojiOnly = samples.some((s) => ["🙄", "😮‍💨", "🫠", "🌳"].includes(s));
    expect(hasScreenshotLine || hasEmojiOnly).toBe(true);
  });

  it("uses troubleshooting pool for proton crash questions", () => {
    const samples = Array.from({ length: 12 }, (_, i) =>
      composeThinkingBlurb("game crashes on launch with proton", { requestId: i }),
    );
    for (const out of samples) assertNoBannedPrefixes(out);
    const hasTroubleshootLine = samples.some((s) => /log|proton|crash|wreckage/i.test(s));
    const hasEmojiOnly = samples.some((s) => ["🙄", "😮‍💨", "🫠", "🌳"].includes(s));
    expect(hasTroubleshootLine || hasEmojiOnly).toBe(true);
  });
});
