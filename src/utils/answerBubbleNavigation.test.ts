import { beforeEach, describe, expect, it } from "vitest";
import { splitResponseIntoChunks } from "./splitResponseIntoChunks";
import {
  handleAnswerBubbleMoveDown,
  handleAnswerBubbleMoveUp,
} from "./answerBubbleNavigation";
import { registerAnswerStop, resetAnswerStopRegistry } from "./answerStopRegistry";
import { registerAnswerBubbleEl } from "./answerBubbleElRegistry";
import { registerSpoilerFence, resetSpoilerFenceRegistry } from "./spoilerFenceRegistry";
import {
  findNextDrgGlossaryTermChipInView,
  registerDrgGlossaryTermChip,
  resetDrgGlossaryTermRegistry,
} from "./drgGlossaryTermRegistry";
import { resetUiDocument } from "./uiDocument";

describe("streaming answer sections", () => {
  it("splits streaming body into multiple sections when paragraphs exist", () => {
    const body = "First paragraph.\n\nSecond paragraph.\n\nThird still typing";
    const chunks = splitResponseIntoChunks(body);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("returns one section for short streaming line", () => {
    const chunks = splitResponseIntoChunks("Short stream");
    expect(chunks).toHaveLength(1);
  });
});

/*
 * jsdom reports every rect as 0×0 and never scrolls, so the geometry the navigation reads has to be
 * supplied. `top`/`bottom` are the only fields the helpers consult (elementIsWithinViewportOf and
 * chunkHasContent{Above,Below}Viewport).
 */
function stubRect(el: HTMLElement, top: number, bottom: number): void {
  el.getBoundingClientRect = () =>
    ({
      top,
      bottom,
      left: 0,
      right: 0,
      width: 0,
      height: bottom - top,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
}

const ANSWER_KEY = "live";

type StopLayout = { top: number; bottom: number };

/** Scroll viewport is 0–250; a stop outside that band is off screen. */
function buildBubble(layout: StopLayout[]): { bubble: HTMLElement; stops: HTMLElement[] } {
  const scroll = document.createElement("div");
  scroll.className = "TabContentsScroll";
  stubRect(scroll, 0, 250);
  document.body.appendChild(scroll);

  const bubble = document.createElement("div");
  bubble.className = "bonsai-chat-ai-bubble Panel Focusable";
  bubble.setAttribute("tabindex", "0");
  stubRect(bubble, 0, 300);
  /* jsdom ships no scrollIntoView; the geometry-nudge fallback calls it once the walk runs out. */
  bubble.scrollIntoView = () => {};
  scroll.appendChild(bubble);
  registerAnswerBubbleEl(ANSWER_KEY, bubble);

  const stops = layout.map((geo, i) => {
    const stop = document.createElement("div");
    stop.className = "bonsai-answer-stop Panel Focusable";
    stubRect(stop, geo.top, geo.bottom);
    bubble.appendChild(stop);
    registerAnswerStop(ANSWER_KEY, i, stop);
    return stop;
  });

  return { bubble, stops };
}

const noopChunkRef = { current: 0 };

const moveDown = (bubble: HTMLElement) =>
  handleAnswerBubbleMoveDown(bubble, noopChunkRef, 1, ANSWER_KEY);
const moveUp = (bubble: HTMLElement) =>
  handleAnswerBubbleMoveUp(bubble, noopChunkRef, 1, ANSWER_KEY);

/** Three sections, the last one scrolled below the fold. */
function threeSections() {
  return buildBubble([
    { top: 0, bottom: 100 },
    { top: 100, bottom: 200 },
    { top: 300, bottom: 400 },
  ]);
}

describe("walking answer sections with the D-pad", () => {
  beforeEach(() => {
    resetAnswerStopRegistry();
    resetSpoilerFenceRegistry();
    resetDrgGlossaryTermRegistry();
    resetUiDocument();
    registerAnswerBubbleEl(ANSWER_KEY, null);
    document.body.innerHTML = "";
  });

  it("Down from the bubble enters the first section", () => {
    const { bubble, stops } = threeSections();
    bubble.focus();

    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(stops[0]);
  });

  it("Down steps one section at a time", () => {
    const { bubble, stops } = threeSections();
    bubble.focus();

    moveDown(bubble);
    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(stops[1]);
  });

  /*
   * The next section is below the fold, so this press scrolls instead. Chasing it with focus would
   * skip the text between here and there — the same mistake the unconditional spoiler jump made.
   */
  it("does not jump to a section that is still off screen", () => {
    const { bubble, stops } = threeSections();
    bubble.focus();
    moveDown(bubble);
    moveDown(bubble);

    moveDown(bubble);

    expect(document.activeElement).toBe(stops[1]);
    expect(document.activeElement).not.toBe(stops[2]);
  });

  /*
   * After the user has scrolled, section 0 is above the fold and can never come back into view by
   * pressing Down. Entering at stops[0] regardless would make the whole chain unreachable.
   */
  it("Down enters at the first section actually on screen", () => {
    const { bubble, stops } = buildBubble([
      { top: -200, bottom: -100 },
      { top: 0, bottom: 100 },
    ]);
    bubble.focus();

    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(stops[1]);
  });

  it("Up steps back one section", () => {
    const { bubble, stops } = threeSections();
    bubble.focus();
    moveDown(bubble);
    moveDown(bubble);

    expect(moveUp(bubble)).toBe(true);
    expect(document.activeElement).toBe(stops[0]);
  });

  /* From the first section Up has to yield, which is what hands focus back to the turn header. */
  it("Up from the first section yields instead of trapping", () => {
    const { bubble, stops } = threeSections();
    bubble.focus();
    moveDown(bubble);

    expect(moveUp(bubble)).toBe(false);
    expect(document.activeElement).toBe(stops[0]);
  });

  /*
   * Deliberate asymmetry with Down: arriving at the bubble on the way up means the user is leaving,
   * so diving into the last visible section would trap them one press short of the header.
   */
  it("Up from the bubble does not dive into the sections", () => {
    const { bubble } = threeSections();
    bubble.focus();

    expect(moveUp(bubble)).toBe(false);
    expect(document.activeElement).toBe(bubble);
  });

  /*
   * The masked-spoiler diversion still runs first. A section that hides a spoiler must offer the
   * reveal before the walk carries on past it (STREAM-03).
   */
  it("parks on a masked spoiler before continuing the walk", () => {
    const { bubble, stops } = threeSections();
    const fence = document.createElement("div");
    stubRect(fence, 100, 150);
    stops[1]!.appendChild(fence);
    registerSpoilerFence("s1", fence);
    bubble.focus();

    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(fence);
  });

  it("resumes the walk from the section holding the revealed spoiler", () => {
    const { bubble, stops } = buildBubble([
      { top: 0, bottom: 100 },
      { top: 100, bottom: 200 },
    ]);
    const fence = document.createElement("div");
    stubRect(fence, 0, 50);
    stops[0]!.appendChild(fence);
    registerSpoilerFence("s1", fence);
    bubble.focus();

    moveDown(bubble);
    expect(document.activeElement).toBe(fence);

    // Focus sits inside section 0, so the next press continues to section 1 rather than restarting.
    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(stops[1]);
  });

  /*
   * DRG Survivor glossary term chip (roadmap: tap-to-define jargon). Same diversion shape as the
   * masked-spoiler one above, since a term chip is likewise a nested Focusable inside plain reply
   * prose rather than a stop of its own — but geometric rather than visited-once: only chips after
   * the ring (Down) or before it (Up) are offered, so every pass can land on the chip and no pass
   * can be trapped by it ("consistently dpad focusable", maintainer 2026-08-28). See
   * drgGlossaryTermRegistry.ts.
   */
  it("parks on a glossary term chip before continuing the walk", () => {
    const { bubble, stops } = threeSections();
    const chip = document.createElement("div");
    stubRect(chip, 100, 150);
    stops[1]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);
    bubble.focus();

    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(chip);
  });

  it("resumes the walk from the section holding the parked-on term chip", () => {
    const { bubble, stops } = buildBubble([
      { top: 0, bottom: 100 },
      { top: 100, bottom: 200 },
    ]);
    const chip = document.createElement("div");
    stubRect(chip, 0, 50);
    stops[0]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);
    bubble.focus();

    moveDown(bubble);
    expect(document.activeElement).toBe(chip);

    // Focus sits inside section 0, so the next press continues to section 1 rather than re-parking.
    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(stops[1]);
  });

  it("Down never jumps back to a chip above the ring", () => {
    const { bubble, stops } = threeSections();
    const chip = document.createElement("div");
    stubRect(chip, 0, 50);
    stops[0]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);
    stops[1]!.setAttribute("tabindex", "-1");
    stops[1]!.focus();

    moveDown(bubble);
    expect(document.activeElement).not.toBe(chip);
  });

  it("Up parks back on a chip that was walked past", () => {
    const { bubble, stops } = buildBubble([
      { top: 0, bottom: 100 },
      { top: 100, bottom: 200 },
    ]);
    const chip = document.createElement("div");
    stubRect(chip, 0, 50);
    stops[0]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);
    bubble.focus();

    moveDown(bubble); // chip
    moveDown(bubble); // section 1
    expect(document.activeElement).toBe(stops[1]);

    expect(moveUp(bubble)).toBe(true);
    expect(document.activeElement).toBe(chip);
  });

  it("Up from the chip yields toward the header instead of trapping", () => {
    const { bubble, stops } = buildBubble([
      { top: 0, bottom: 100 },
      { top: 100, bottom: 200 },
    ]);
    const chip = document.createElement("div");
    stubRect(chip, 0, 50);
    stops[0]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);
    bubble.focus();

    moveDown(bubble);
    expect(document.activeElement).toBe(chip);

    expect(moveUp(bubble)).toBe(false);
  });

  it("a second pass down the same reply lands on the chip again", () => {
    // The old visited-once flag made this exact walk skip the chip forever after the first pass.
    const { bubble, stops } = buildBubble([
      { top: 0, bottom: 100 },
      { top: 100, bottom: 200 },
    ]);
    const chip = document.createElement("div");
    stubRect(chip, 0, 50);
    stops[0]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);
    bubble.focus();

    moveDown(bubble); // chip
    moveDown(bubble); // section 1

    bubble.focus(); // re-entering the reply from the header
    expect(moveDown(bubble)).toBe(true);
    expect(document.activeElement).toBe(chip);
  });

  it("offers a chip going up to a ring below the bubble (the reply-actions row)", () => {
    // The reply-actions row sits under the bubble in a different navigation container; its Up
    // handler asks this registry directly. A ring outside the bubble uses plain reading-order
    // geometry, so every chip above it is eligible.
    const { bubble, stops } = threeSections();
    const chip = document.createElement("div");
    stubRect(chip, 100, 150);
    stops[1]!.appendChild(chip);
    registerDrgGlossaryTermChip("kiting-1", chip);

    const showDetails = document.createElement("button");
    stubRect(showDetails, 420, 450);
    showDetails.setAttribute("tabindex", "-1");
    document.body.appendChild(showDetails);
    showDetails.focus();

    const found = findNextDrgGlossaryTermChipInView(bubble, () => true, "up");
    expect(found).toBe(chip);
  });

  it("does nothing for an answer with no sections registered", () => {
    const { bubble } = buildBubble([]);
    bubble.focus();

    expect(moveDown(bubble)).toBe(false);
    expect(document.activeElement).toBe(bubble);
  });
});
