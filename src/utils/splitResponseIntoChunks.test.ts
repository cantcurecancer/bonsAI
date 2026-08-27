/**
 * Chunk splitter contract for terminal replies. Mid-stream live markdown uses
 * prepareStreamMarkdown (R2) until T3 handoff; see buildAnswerBubbleElement.tsx.
 */
import { describe, expect, it } from "vitest";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";

describe("splitResponseIntoChunks", () => {
  it("splits prose at blank lines but keeps a fenced block intact", () => {
    const t = "Intro line.\n\n```json\n{\"tdp_watts\": 8}\n```\n\nMore text after.";
    const c = splitResponseIntoChunks(t);
    expect(c).toHaveLength(3);
    expect(c[0]).toContain("Intro");
    expect(c[1]).toMatch(/```json/);
    expect(c[1]).toContain("tdp_watts");
    expect(c[2]).toContain("More text");
  });

  it("does not split inside a code fence when a blank line appears inside the fence", () => {
    const t = "Start\n\n```\nline1\n\nline2\n```\n\nEnd";
    const c = splitResponseIntoChunks(t);
    expect(c.length).toBeGreaterThanOrEqual(1);
    const withFence = c.find((x) => x.includes("line1") && x.includes("line2"));
    expect(withFence).toBeDefined();
    expect(withFence).toMatch(/```/);
  });

  it("returns a single chunk for short fenced-only content", () => {
    const t = "```json\n{\"a\":1}\n```";
    const c = splitResponseIntoChunks(t);
    expect(c).toEqual([t.trim()]);
  });

  it("keeps bonsai-spoiler fence intact across internal blank lines", () => {
    const t = "Hint here.\n\n```bonsai-spoiler\nBoss: Ganon\n\nPhase 2: ...\n```\n\nAfter.";
    const c = splitResponseIntoChunks(t);
    expect(c.length).toBeGreaterThanOrEqual(1);
    const spoilerChunk = c.find((x) => x.includes("bonsai-spoiler") && x.includes("Phase 2"));
    expect(spoilerChunk).toBeDefined();
  });

  describe("long single-paragraph text — sentence-boundary cuts", () => {
    /*
     * A ~160-char filler with no blank line, so the whole thing stays one paragraph and one line —
     * only `splitLongRespectingFences`'s density split (maxLen 300) can produce a second chunk here.
     * Long enough to push the shout sentence past the "prefer a nearby '. '" floor (start + 80) but
     * still inside the 300-char cut window, so `findSafeCutInRange` picks the period this test cares
     * about rather than a later or earlier one.
     */
    const FILLER =
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut " +
      "labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation. ";
    const TAIL =
      " and never let them corner you, because that is when things go from bad to worse for " +
      "everyone involved and nobody in the squad wants that outcome at all, trust me on this one.";

    it.each(["BOOM", "KABOOM", "RUN"])(
      /* Regression guard for "a rendered reply breaks a line mid-sentence": the model wrote one
         unbroken sentence ("...go BOOM. The trick is...") and the display layer introduced the
         break, landing the period at the start of the next chunk instead of the end of this one. */
      'keeps "%s." on the same chunk as the sentence it ends, not orphaned onto the next one',
      (shoutWord) => {
        const text = `${FILLER}they walk right into ya and go ${shoutWord}. The trick is to keep your distance${TAIL}`;
        const chunks = splitResponseIntoChunks(text);

        expect(chunks.length).toBeGreaterThan(1);
        for (const chunk of chunks) {
          expect(chunk.trimStart().startsWith(".")).toBe(false);
        }
        const shoutChunk = chunks.find((c) => c.includes(shoutWord));
        expect(shoutChunk).toBeDefined();
        expect(shoutChunk).toContain(`${shoutWord}.`);
      }
    );
  });
});
