import { describe, expect, it } from "vitest";

import {
  focusAnyContextChipLadder,
  focusDeckOwner,
  focusDownFromLiveAnswerBubble,
  focusLastSessionContextRow,
  focusReplyHelpful,
  focusReplyNotReally,
  focusReplyRetry,
  focusReplyShowDetails,
  focusUpFromReplyActions,
  queryLiveTurnSlot,
} from "./liveTurnFocusGraph";
import { registerReplyStop } from "./replyStopRegistry";

function mountLiveTurn(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

describe("liveTurnFocusGraph", () => {
  it("queryLiveTurnSlot finds the live turn container", () => {
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header bonsai-chat-turn-row-header--live"></div>
      </div>
    `);
    expect(queryLiveTurnSlot(document.body)?.classList.contains("bonsai-chat-turn-slot")).toBe(true);
  });

  it("focusDeckOwner prefers Panel.Focusable wrapper", () => {
    mountLiveTurn(`
      <div class="Panel Focusable" tabindex="-1">
        <button type="button">Inner</button>
      </div>
    `);
    const btn = document.querySelector("button");
    expect(focusDeckOwner(btn)).toBe(true);
    expect((document.activeElement as HTMLElement)?.classList.contains("Focusable")).toBe(true);
  });

  it("focusDownFromLiveAnswerBubble prefers branch buttons over thumbs", () => {
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header bonsai-chat-turn-row-header--live"></div>
        <div class="bonsai-chat-ai-bubble Panel Focusable" tabindex="-1"></div>
        <div class="bonsai-strategy-branch-picker">
          <div class="Panel Focusable" tabindex="-1"><button type="button">A</button></div>
          <div class="Panel Focusable" tabindex="-1"><button type="button">B</button></div>
        </div>
        <div class="bonsai-chat-reply-actions">
          <div class="Panel Focusable" tabindex="-1">
            <button class="bonsai-chat-secondary-btn" aria-label="Mark reply helpful">Helpful</button>
          </div>
        </div>
      </div>
    `);
    const slot = queryLiveTurnSlot(document.body);
    expect(focusDownFromLiveAnswerBubble(slot)).toBe(true);
    expect(document.activeElement?.textContent).toContain("A");
  });

  it("focusUpFromReplyActions prefers checklist then branch over bubble", () => {
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header bonsai-chat-turn-row-header--live"></div>
        <div class="bonsai-chat-ai-bubble Panel Focusable" tabindex="-1">Answer</div>
        <div class="bonsai-strategy-branch-picker">
          <div class="Panel Focusable" tabindex="-1"><button type="button">Branch</button></div>
        </div>
        <div class="bonsai-strategy-checklist-panel">
          <div class="Panel Focusable" tabindex="-1"><button type="button">Check</button></div>
        </div>
        <div class="bonsai-chat-reply-actions">
          <div class="Panel Focusable" tabindex="-1">
            <button class="bonsai-chat-secondary-btn" aria-label="Mark reply helpful">Helpful</button>
          </div>
        </div>
      </div>
    `);
    const slot = queryLiveTurnSlot(document.body);
    expect(focusUpFromReplyActions(slot)).toBe(true);
    expect(document.activeElement?.textContent).toContain("Check");
  });

  it("column helpers focus Not really / Show details / Retry / Helpful", () => {
    /*
     * The shape Decky actually renders, verified on device: a Decky `Button` is a single
     * `<button class="… Focusable">` and the registered stop IS that button — there is no
     * `.Panel.Focusable` wrapper per stop, only the row. The previous fixture wrapped each button
     * in one, which made the row the first focus candidate and hid the fact that a wrapper-first
     * ladder lands focus on the whole row instead of the button.
     */
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header bonsai-chat-turn-row-header--live"></div>
        <div class="bonsai-chat-reply-actions Panel Focusable">
          <div class="bonsai-chat-reply-actions-row Panel Focusable">
            <button class="bonsai-chat-secondary-btn Focusable" id="stop-helpful">Helpful</button>
            <button class="bonsai-chat-secondary-btn Focusable" id="stop-not-really">Not really</button>
          </div>
          <div class="bonsai-chat-reply-actions-row--utility Panel Focusable">
            <button class="bonsai-chat-secondary-btn Focusable" id="stop-retry">Retry</button>
            <button class="bonsai-chat-secondary-btn Focusable" id="stop-show-details">Show details</button>
          </div>
        </div>
      </div>
    `);
    registerReplyStop("helpful", document.getElementById("stop-helpful"));
    registerReplyStop("not-really", document.getElementById("stop-not-really"));
    registerReplyStop("retry", document.getElementById("stop-retry"));
    registerReplyStop("show-details", document.getElementById("stop-show-details"));
    const slot = queryLiveTurnSlot(document.body);
    expect(focusReplyNotReally(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("stop-not-really");
    expect(focusReplyShowDetails(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("stop-show-details");
    expect(focusReplyRetry(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("stop-retry");
    expect(focusReplyHelpful(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("stop-helpful");
  });

  /*
   * The focus trap recorded on device 2026-08-23 (DeckRecord_20260823_170847_game.mkv). With
   * *Show details* collapsed there is no inline ladder, so a plain first-match query found the
   * session context strip's own ladder and the strip header's Up handler fed the ring straight
   * back into the strip it was trying to leave.
   */
  it("focusAnyContextChipLadder ignores the session context strip's own ladder", () => {
    mountLiveTurn(`
      <div class="bonsai-session-context-strip">
        <div class="bonsai-chip-ladder Focusable" tabindex="-1" id="strip-ladder"></div>
      </div>
    `);
    expect(focusAnyContextChipLadder()).toBe(false);
    expect(document.activeElement?.id).not.toBe("strip-ladder");
  });

  it("focusAnyContextChipLadder still finds the transcript ladder when both are mounted", () => {
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chip-ladder Focusable" tabindex="-1" id="inline-ladder"></div>
      </div>
      <div class="bonsai-session-context-strip">
        <div class="bonsai-chip-ladder Focusable" tabindex="-1" id="strip-ladder"></div>
      </div>
    `);
    expect(focusAnyContextChipLadder()).toBe(true);
    expect(document.activeElement?.id).toBe("inline-ladder");
  });

  it("focusLastSessionContextRow targets the row list above the strip's ladder", () => {
    mountLiveTurn(`
      <div class="bonsai-session-context-strip">
        <div class="bonsai-session-context-row Focusable" tabindex="-1" id="row-1"></div>
        <div class="bonsai-session-context-row Focusable" tabindex="-1" id="row-2"></div>
        <div class="bonsai-chip-ladder Focusable" tabindex="-1" id="strip-ladder"></div>
      </div>
    `);
    expect(focusLastSessionContextRow()).toBe(true);
    expect(document.activeElement?.id).toBe("row-2");
  });

  it("focusLastSessionContextRow reports failure when the strip is collapsed", () => {
    mountLiveTurn(`<div class="bonsai-session-context-strip"></div>`);
    expect(focusLastSessionContextRow()).toBe(false);
  });
});
