import { beforeEach, describe, expect, it } from "vitest";

import {
  focusRegisteredReplyStop,
  getReplyStop,
  registerReplyStop,
  REPLY_STOP_ORDER,
} from "./replyStopRegistry";

/** The shape Decky renders for a `Button`: one `<button>` carrying the Focusable class. */
function mountReplyRow(): { row: HTMLElement; retry: HTMLElement; details: HTMLElement } {
  document.body.innerHTML = `
    <div class="bonsai-chat-reply-actions-row--utility Panel Focusable">
      <button class="bonsai-chat-secondary-btn Focusable" id="retry">Retry</button>
      <button class="bonsai-chat-secondary-btn Focusable" id="details">Show details</button>
    </div>
  `;
  return {
    row: document.querySelector(".bonsai-chat-reply-actions-row--utility") as HTMLElement,
    retry: document.getElementById("retry") as HTMLElement,
    details: document.getElementById("details") as HTMLElement,
  };
}

describe("reply stop registry", () => {
  beforeEach(() => {
    for (const id of REPLY_STOP_ORDER) registerReplyStop(id, null);
    document.body.innerHTML = "";
  });

  it("focuses the registered button itself, not the row around it", () => {
    const { retry } = mountReplyRow();
    registerReplyStop("retry", retry);

    expect(focusRegisteredReplyStop("retry")).toBe(true);
    expect(document.activeElement).toBe(retry);
  });

  /*
   * The regression this file exists for. The old helper stamped tabindex="-1" on every target it
   * touched — the button *and* its `.Panel.Focusable` row — which takes those nodes out of Steam's
   * navigation graph. Navigating into Retry was therefore what stopped Retry responding to a D-pad
   * press, and nothing below the reply row could be reached. Measured on device 2026-08-04.
   */
  it("does not stamp tabindex on the button or its row", () => {
    const { row, retry } = mountReplyRow();
    registerReplyStop("retry", retry);

    focusRegisteredReplyStop("retry");

    expect(retry.hasAttribute("tabindex")).toBe(false);
    expect(row.hasAttribute("tabindex")).toBe(false);
  });

  it("leaves an existing tabindex untouched", () => {
    const { retry } = mountReplyRow();
    retry.setAttribute("tabindex", "0");
    registerReplyStop("retry", retry);

    focusRegisteredReplyStop("retry");

    expect(retry.getAttribute("tabindex")).toBe("0");
  });

  it("makes a non-native focus owner focusable when it has no tabindex", () => {
    document.body.innerHTML = `<div class="Panel Focusable" id="stop"><span>Retry</span></div>`;
    const stop = document.getElementById("stop") as HTMLElement;
    registerReplyStop("retry", stop);

    expect(focusRegisteredReplyStop("retry")).toBe(true);
    expect(stop.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(stop);
  });

  it("reports false for a stop that is not mounted", () => {
    expect(focusRegisteredReplyStop("show-details")).toBe(false);
  });

  it("forgets a stop when its ref is cleared", () => {
    const { retry } = mountReplyRow();
    registerReplyStop("retry", retry);
    expect(getReplyStop("retry")).toBe(retry);

    registerReplyStop("retry", null);

    expect(getReplyStop("retry")).toBeNull();
    expect(focusRegisteredReplyStop("retry")).toBe(false);
  });
});
