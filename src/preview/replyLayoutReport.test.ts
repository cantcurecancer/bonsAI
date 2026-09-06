/**
 * The report the preview suite asserts against. jsdom reports every rect as 0x0, so these cover
 * what is found and counted, not geometry — geometry is what the preview run and the device add.
 */
import { afterEach, describe, expect, it } from "vitest";
import { buildReplyLayoutReport } from "./replyLayoutReport";
import { resetUiDocument } from "../utils/uiDocument";

function paint(html: string) {
  document.body.innerHTML = html;
}

afterEach(() => {
  document.body.innerHTML = "";
  resetUiDocument();
});

describe("buildReplyLayoutReport", () => {
  it("reports nothing when no turn is on screen", () => {
    paint("<div>empty</div>");
    const r = buildReplyLayoutReport();
    expect(r.answerStops).toBe(0);
    expect(r.answerBubble).toBeNull();
    expect(r.detailsOpen).toBe(false);
  });

  it("counts the newest turn's stops, not an older turn's", () => {
    paint(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-answer-stop"></div>
        <div class="bonsai-answer-stop"></div>
        <div class="bonsai-answer-stop"></div>
      </div>
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-turn-row-header"></div>
        <div class="bonsai-chat-ai-bubble">
          <div class="bonsai-answer-stop"></div>
        </div>
      </div>
    `);
    const r = buildReplyLayoutReport();
    expect(r.answerStops).toBe(1);
    expect(r.answerBubble).not.toBeNull();
    expect(r.questionBubble).not.toBeNull();
  });

  it("says which of the reply controls are present", () => {
    paint(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chat-reply-actions-row--utility"></div>
      </div>
    `);
    const r = buildReplyLayoutReport();
    expect(r.utilityRow).not.toBeNull();
    expect(r.detailsDivider).toBeNull();
    expect(r.copyIcon).toBeNull();
    expect(r.retryIcon).toBeNull();
  });

  it("reports the details chips as open when the chip ladder is showing", () => {
    paint(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chip-ladder"></div>
      </div>
    `);
    expect(buildReplyLayoutReport().detailsOpen).toBe(true);
  });
});
