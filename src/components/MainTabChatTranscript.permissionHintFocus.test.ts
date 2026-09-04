/**
 * Title: Chat transcript permission-hint focus tests
 * Purpose: Cover the D-pad Down/Up chain between the reply utility row, the troubleshooting Ask
 *          hint / vac-check deny action rows, and the session context strip.
 * Used for: MainTabChatTranscript.tsx focus-graph regression coverage.
 * Solves: Neither permission-hint row was in the Down chain before this fix — Down from Retry or
 *         Copy jumped straight to the session context strip and skipped both (filed 2026-09-03,
 *         roadmap: "The Open Permissions button under a blocked reply is not a D-pad stop";
 *         runs/PERM-JUMP-01-a-find-open-permissions.json). Mirrors liveTurnFocusGraph.test.ts's
 *         style for the ladder/strip cases — a hand-built DOM fixture plus a direct function call —
 *         and replyStopRegistry's `registerReplyStop` style for the two permission-hint buttons,
 *         which are looked up through a registered handle rather than a page query (the
 *         focus-pattern linter's page-search rule).
 * Does not: Prove the fix on-device. The Deck check this owes is PERM-JUMP-01 / SMOKE-C.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@decky/ui", async () => import("../test-harness/fakeDeckyUi"));

import {
  focusChatPermissionHintRow,
  focusDownFromReplyUtilityRowOrPermHint,
  registerChatPermissionHintButton,
} from "./MainTabChatTranscript";

function mount(html: string): void {
  document.body.innerHTML = html;
}

function makeButton(label: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  document.body.appendChild(btn);
  return btn;
}

afterEach(() => {
  document.body.innerHTML = "";
  // Clear the module-level registration between tests — it otherwise survives, unlike a real
  // mount/unmount cycle, and would leak one test's button into the next.
  registerChatPermissionHintButton("troubleshooting", null);
  registerChatPermissionHintButton("deny-action", null);
});

describe("focusChatPermissionHintRow", () => {
  it("returns false when neither permission-hint row is registered", () => {
    expect(focusChatPermissionHintRow()).toBe(false);
  });

  it("focuses the vac-check deny action's button when only it is registered", () => {
    const denyBtn = makeButton("Open Permissions");
    registerChatPermissionHintButton("deny-action", denyBtn);
    expect(focusChatPermissionHintRow()).toBe(true);
    expect(document.activeElement).toBe(denyBtn);
  });

  it("focuses the troubleshooting hint's button when only it is registered", () => {
    const hintBtn = makeButton("Open Permissions");
    registerChatPermissionHintButton("troubleshooting", hintBtn);
    expect(focusChatPermissionHintRow()).toBe(true);
    expect(document.activeElement).toBe(hintBtn);
  });

  it("prefers the troubleshooting hint over the deny action when both are registered", () => {
    const hintBtn = makeButton("Troubleshoot Open Permissions");
    const denyBtn = makeButton("Deny Open Permissions");
    registerChatPermissionHintButton("troubleshooting", hintBtn);
    registerChatPermissionHintButton("deny-action", denyBtn);
    expect(focusChatPermissionHintRow()).toBe(true);
    expect(document.activeElement).toBe(hintBtn);
  });

  it("falls through to the deny action once the troubleshooting hint unregisters (unmounts)", () => {
    const denyBtn = makeButton("Open Permissions");
    registerChatPermissionHintButton("troubleshooting", makeButton("gone"));
    registerChatPermissionHintButton("deny-action", denyBtn);
    // A real unmount calls the ref callback with null — Dismiss, or the hint's own conditions
    // going false, does exactly this.
    registerChatPermissionHintButton("troubleshooting", null);
    expect(focusChatPermissionHintRow()).toBe(true);
    expect(document.activeElement).toBe(denyBtn);
  });
});

describe("focusDownFromReplyUtilityRowOrPermHint", () => {
  it("still prefers this turn's own chip ladder over the permission-hint rows", () => {
    mount(`
      <div class="bonsai-chat-turn-slot">
        <div class="bonsai-chip-ladder"><button type="button">Ladder</button></div>
      </div>
    `);
    registerChatPermissionHintButton("deny-action", makeButton("Open Permissions"));
    const slot = document.querySelector<HTMLElement>(".bonsai-chat-turn-slot");
    expect(focusDownFromReplyUtilityRowOrPermHint(slot)).toBe(true);
    expect(document.activeElement?.textContent).toBe("Ladder");
  });

  it("lands on the deny action's button when no ladder or hint is mounted in this turn", () => {
    mount(`<div class="bonsai-chat-turn-slot"></div>`);
    const denyBtn = makeButton("Open Permissions");
    registerChatPermissionHintButton("deny-action", denyBtn);
    const slot = document.querySelector<HTMLElement>(".bonsai-chat-turn-slot");
    expect(focusDownFromReplyUtilityRowOrPermHint(slot)).toBe(true);
    expect(document.activeElement).toBe(denyBtn);
  });

  it("falls back to the session context strip when no permission-hint row is registered either", () => {
    mount(`
      <div class="bonsai-chat-turn-slot"></div>
      <div class="bonsai-session-context-strip"></div>
    `);
    const slot = document.querySelector<HTMLElement>(".bonsai-chat-turn-slot");
    expect(focusDownFromReplyUtilityRowOrPermHint(slot)).toBe(true);
    expect(document.activeElement?.classList.contains("bonsai-session-context-strip")).toBe(true);
  });
});
