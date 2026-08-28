import { describe, expect, it } from "vitest";

import {
  focusAnyContextChipLadder,
  focusDeckOwner,
  focusDownFromLiveAnswerBubble,
  focusDownFromReplyUtilityRow,
  focusLastSessionContextRow,
  focusReplyHelpful,
  focusReplyNotReally,
  focusReplyRetry,
  focusReplyShowDetails,
  focusUpFromBelowContextChipLadder,
  focusUpFromReplyActions,
  queryLiveTurnSlot,
} from "./liveTurnFocusGraph";
import { REPLY_STOP_ORDER, registerReplyStop } from "./replyStopRegistry";

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

  /*
   * The round trip the CONTEXT-LADDER row exists for.
   *
   * Measured on device 2026-08-26 by the Decky Plugin Studio sequence runner, with
   * nobody at the Deck. Down from the utility row enters the ladder at chip 1;
   * Right past chip 6 leaves it downward onto the session context strip; Up from
   * there comes back to the ladder at chip 6; Up again steps back down the chips
   * and escapes to Retry at chip 1. The ring is not trapped in either direction.
   *
   * Both halves of that trip -- focusDownFromReplyUtilityRow and
   * focusUpFromBelowContextChipLadder -- had NO test before this, which is why
   * the row sat unverified for three days after a fix had already shipped. The
   * fix was real; nothing pinned it. These pin it.
   */
  function resetReplyStops(): void {
    for (const id of REPLY_STOP_ORDER) registerReplyStop(id, null);
  }

  /** Utility row plus, optionally, an expanded transparency ladder. */
  function mountTurnWithUtilityRow(extra = ""): HTMLElement | null {
    resetReplyStops();
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header bonsai-chat-turn-row-header--live"></div>
        <div class="bonsai-chat-reply-actions Panel Focusable">
          <div class="bonsai-chat-reply-actions-row--utility Panel Focusable">
            <button class="bonsai-chat-secondary-btn Focusable" id="stop-retry">Retry</button>
            <button class="bonsai-chat-secondary-btn Focusable" id="stop-show-details">Show details</button>
          </div>
        </div>
        ${extra}
      </div>
    `);
    registerReplyStop("retry", document.getElementById("stop-retry"));
    registerReplyStop("show-details", document.getElementById("stop-show-details"));
    return queryLiveTurnSlot(document.body);
  }

  const INLINE_LADDER =
    '<div class="bonsai-chip-ladder Panel Focusable" tabindex="-1" id="inline-ladder"></div>';

  it("Down from the utility row enters the transparency ladder when details are open", () => {
    const slot = mountTurnWithUtilityRow(INLINE_LADDER);
    expect(focusDownFromReplyUtilityRow(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("inline-ladder");
  });

  it("Up from below returns to the ladder it just left", () => {
    // The one-way-carousel claim, in one assertion: leave the ladder downward,
    // press Up, and land back on the same element. Focus has to genuinely move
    // off the ladder first or this passes without testing anything, so the
    // fixture carries the collapsed session strip the ring exits onto -- which
    // is where it landed on device (Chip 6 -> "Session context (1 turn)").
    const slot = mountTurnWithUtilityRow(INLINE_LADDER);
    expect(focusDownFromReplyUtilityRow(slot)).toBe(true);
    const left = document.activeElement?.id;
    expect(left).toBe("inline-ladder");

    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="bonsai-session-context-strip Panel Focusable" tabindex="-1" id="strip"></div>',
    );
    expect(focusDeckOwner(document.getElementById("strip"))).toBe(true);
    expect(document.activeElement?.id).toBe("strip");

    expect(focusUpFromBelowContextChipLadder(slot)).toBe(true);
    expect(document.activeElement?.id).toBe(left);
  });

  it("Up from an expanded session strip climbs out to the utility row, not back into the strip", () => {
    /*
     * The 2026-08-23 trap, and the check that fails without its fix.
     *
     * With *Show details* collapsed there is no inline ladder, so the strip's own
     * `.bonsai-chip-ladder` is the only match in the document. If
     * focusAnyContextChipLadder takes it, the strip header's Up handler feeds the
     * ring straight back into the strip it is trying to leave, and Retry and
     * Show details become unreachable without closing the panel.
     *
     * Reproduced on device 2026-08-26 in exactly this state -- details collapsed,
     * strip expanded, one `.bonsai-chip-ladder` mounted and inside the strip --
     * and the ring climbed out to Retry, as it does here.
     */
    const slot = mountTurnWithUtilityRow();
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="bonsai-session-context-strip">
         <div class="bonsai-session-context-row Focusable" tabindex="-1" id="strip-row"></div>
         <div class="bonsai-chip-ladder Panel Focusable" tabindex="-1" id="strip-ladder"></div>
       </div>`,
    );
    expect(focusUpFromBelowContextChipLadder(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("stop-retry");
    expect(document.activeElement?.id).not.toBe("strip-ladder");
  });

  /*
   * The standalone "Ask diagnostics" block (and its own focus stop between Show details and the
   * session strip) was removed 2026-08-28 (roadmap: "Fold Show diagnostics into Show details") —
   * the same JSON now lives inside the chip ladder's "Developer details" chip, reached via
   * `focusContextChipLadder` above like any other chip content. With the ladder unmounted (details
   * collapsed) and no collapsed hint either, Down from the utility row now has nothing left between
   * it and the session strip.
   */
  it("Down from the utility row reaches the session strip directly when details are collapsed", () => {
    const slot = mountTurnWithUtilityRow();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="bonsai-session-context-strip Panel Focusable" tabindex="-1" id="strip"></div>',
    );
    expect(focusDownFromReplyUtilityRow(slot)).toBe(true);
    expect(document.activeElement?.id).toBe("strip");
  });
});
