/**
 * Title: Hidden tab header trap
 * Purpose: Pin that a ring landing on a hidden Steam tab button is handed to the tab bar, and that
 *          nothing else in the tabs root triggers the handover.
 * Used for: plan 30 W4 (TAB-BAR-05 is the on-device half).
 * Solves: The trap is a MutationObserver, which is easy to leave watching the wrong thing.
 * Does not: Prove Steam accepts the handover; jsdom has no gamepad tree.
 */
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHiddenTabHeaderTrap } from "./useHiddenTabHeaderTrap";
import { registerNavFocus, resetNavFocusRegistry } from "../../utils/navFocusRegistry";
import { rememberUiDocument, resetUiDocument } from "../../utils/uiDocument";

function Host() {
  useHiddenTabHeaderTrap();
  return null;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("useHiddenTabHeaderTrap", () => {
  let root: HTMLElement;
  let hiddenButton: HTMLElement;
  let bodyButton: HTMLElement;
  let takeFocus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="bonsai-scope">
        <div class="bonsai-decky-tabs-root">
          <div class="Panel Focusable">
            <div class="header" style="display:none">
              <div class="Panel Focusable" data-test="hidden-tab"><div class="bonsai-tab-title-leaf"></div></div>
            </div>
            <div class="body"><button class="Focusable" data-test="body">x</button></div>
          </div>
        </div>
      </div>`;
    root = document.querySelector(".bonsai-decky-tabs-root") as HTMLElement;
    hiddenButton = document.querySelector('[data-test="hidden-tab"]') as HTMLElement;
    bodyButton = document.querySelector('[data-test="body"]') as HTMLElement;
    rememberUiDocument(root);
    resetNavFocusRegistry();
    takeFocus = vi.fn(() => true);
    registerNavFocus("tab-bar", { current: { TakeFocus: takeFocus } });
  });

  afterEach(() => {
    resetNavFocusRegistry();
    resetUiDocument();
    document.body.innerHTML = "";
  });

  it("hands the ring to the bar when a hidden tab button gains gpfocus", async () => {
    render(<Host />);
    hiddenButton.classList.add("gpfocus");
    await tick();
    expect(takeFocus).toHaveBeenCalledWith(true);
  });

  it("ignores the ring landing on a real control in the body", async () => {
    render(<Host />);
    bodyButton.classList.add("gpfocus");
    await tick();
    expect(takeFocus).not.toHaveBeenCalled();
  });

  it("stops watching when the bar unmounts", async () => {
    const { unmount } = render(<Host />);
    unmount();
    hiddenButton.classList.add("gpfocus");
    await tick();
    expect(takeFocus).not.toHaveBeenCalled();
  });

  it("bounces a hidden tab button that already holds gpfocus the moment the trap attaches", async () => {
    // A remount (the Clear cache confirmation closing) can hand the ring to the hidden button
    // before this effect ever runs, so there is no later mutation for the observer to see.
    hiddenButton.classList.add("gpfocus");
    render(<Host />);
    await tick();
    expect(takeFocus).toHaveBeenCalledWith(true);
  });

  it("does not bounce on attach when gpfocus sits on a real body control", async () => {
    bodyButton.classList.add("gpfocus");
    render(<Host />);
    await tick();
    expect(takeFocus).not.toHaveBeenCalled();
  });

  it("bounces when a fresh hidden tab button is inserted already holding gpfocus", async () => {
    // A QAM chord close/reopen does not remount this component (TabIndicatorBar and the tabs root
    // share one fragment key that only changes on a UI-scale Apply), so the effect stays attached
    // the whole time -- but Steam's own header can still rebuild its child nodes, and a node born
    // with `gpfocus` already set produces a childList record, never an attributes one.
    render(<Host />);
    const header = document.querySelector(".header") as HTMLElement;
    const fresh = document.createElement("div");
    fresh.className = "Panel Focusable gpfocus";
    fresh.setAttribute("data-test", "fresh-hidden-tab");
    const leaf = document.createElement("div");
    leaf.className = "bonsai-tab-title-leaf";
    fresh.appendChild(leaf);
    header.appendChild(fresh);
    await tick();
    expect(takeFocus).toHaveBeenCalledWith(true);
  });
});
