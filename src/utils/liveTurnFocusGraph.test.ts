import { describe, expect, it } from "vitest";

import {
  focusDeckOwner,
  focusDownFromLiveAnswerBubble,
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
    mountLiveTurn(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header bonsai-chat-turn-row-header--live"></div>
        <div class="bonsai-chat-reply-actions">
          <div class="Panel Focusable" tabindex="-1" id="stop-helpful">
            <button class="bonsai-chat-secondary-btn">Helpful</button>
          </div>
          <div class="Panel Focusable" tabindex="-1" id="stop-not-really">
            <button class="bonsai-chat-secondary-btn">Not really</button>
          </div>
          <div class="bonsai-chat-reply-actions-row--utility">
            <div class="Panel Focusable" tabindex="-1" id="stop-retry">
              <button class="bonsai-chat-secondary-btn">Retry</button>
            </div>
            <div class="Panel Focusable" tabindex="-1" id="stop-show-details">
              <button class="bonsai-chat-secondary-btn">Show details</button>
            </div>
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
});
