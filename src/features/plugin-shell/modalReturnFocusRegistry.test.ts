import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearModalReturnFocus,
  peekModalReturnFocus,
  registerModalReturnFocusOwner,
  rememberModalReturnFocus,
  resetModalReturnFocusRegistry,
  restoreModalReturnFocus,
} from "./modalReturnFocusRegistry";

function mountButton(): HTMLElement {
  const el = document.createElement("button");
  document.body.appendChild(el);
  return el;
}

describe("modal return-focus registry", () => {
  beforeEach(() => {
    resetModalReturnFocusRegistry();
    document.body.innerHTML = "";
  });

  it("does nothing when no modal was opened", () => {
    expect(restoreModalReturnFocus()).toBe(false);
  });

  it("focuses the control that opened the modal", () => {
    const el = mountButton();
    const focus = vi.spyOn(el, "focus");
    registerModalReturnFocusOwner("plugin-help", el);
    rememberModalReturnFocus("plugin-help");

    expect(restoreModalReturnFocus()).toBe(true);
    expect(focus).toHaveBeenCalled();
  });

  it("leaves focus alone when the opener unmounted while the modal was open", () => {
    const el = mountButton();
    registerModalReturnFocusOwner("plugin-help", el);
    rememberModalReturnFocus("plugin-help");
    registerModalReturnFocusOwner("plugin-help", null); // unmount

    // False, not a throw and not a guess at some other element: focus stays where Decky put it.
    expect(restoreModalReturnFocus()).toBe(false);
  });

  it("consumes the pending id even when it cannot restore", () => {
    rememberModalReturnFocus("ollama-models-hub");
    expect(restoreModalReturnFocus()).toBe(false);
    expect(peekModalReturnFocus()).toBeNull();
  });

  it("does not re-focus on a later unrelated modal close", () => {
    const el = mountButton();
    const focus = vi.spyOn(el, "focus");
    registerModalReturnFocusOwner("plugin-help", el);
    rememberModalReturnFocus("plugin-help");

    restoreModalReturnFocus();
    focus.mockClear();

    // A second close with nothing armed must not resurrect the previous target.
    expect(restoreModalReturnFocus()).toBe(false);
    expect(focus).not.toHaveBeenCalled();
  });

  it("restores the control that was actually used, not the last one registered", () => {
    const help = mountButton();
    const hub = mountButton();
    const helpFocus = vi.spyOn(help, "focus");
    const hubFocus = vi.spyOn(hub, "focus");
    registerModalReturnFocusOwner("plugin-help", help);
    registerModalReturnFocusOwner("ollama-models-hub", hub);

    rememberModalReturnFocus("plugin-help");
    restoreModalReturnFocus();

    expect(helpFocus).toHaveBeenCalled();
    expect(hubFocus).not.toHaveBeenCalled();
  });

  it("clearModalReturnFocus disarms a pending restore", () => {
    const el = mountButton();
    const focus = vi.spyOn(el, "focus");
    registerModalReturnFocusOwner("desktop-note-save", el);
    rememberModalReturnFocus("desktop-note-save");

    clearModalReturnFocus();

    expect(restoreModalReturnFocus()).toBe(false);
    expect(focus).not.toHaveBeenCalled();
  });

  it("prefers the Decky focusable Panel wrapper when the control has one", () => {
    const panel = document.createElement("div");
    panel.className = "Panel Focusable";
    const inner = document.createElement("button");
    panel.appendChild(inner);
    document.body.appendChild(panel);
    const panelFocus = vi.spyOn(panel, "focus");

    registerModalReturnFocusOwner("character-picker-settings", inner);
    rememberModalReturnFocus("character-picker-settings");
    restoreModalReturnFocus();

    // Decky navigates Panels, not raw buttons; focusing only the <button> misses on Deck.
    expect(panelFocus).toHaveBeenCalled();
  });

  it("survives an element whose focus() throws", () => {
    const el = mountButton();
    vi.spyOn(el, "focus").mockImplementation(() => {
      throw new Error("detached");
    });
    registerModalReturnFocusOwner("plugin-help", el);
    rememberModalReturnFocus("plugin-help");

    expect(() => restoreModalReturnFocus()).not.toThrow();
  });

  it("re-registering after a remount replaces the stale element", () => {
    const first = mountButton();
    registerModalReturnFocusOwner("plugin-help", first);
    registerModalReturnFocusOwner("plugin-help", null);

    const second = mountButton();
    const secondFocus = vi.spyOn(second, "focus");
    const firstFocus = vi.spyOn(first, "focus");
    registerModalReturnFocusOwner("plugin-help", second);

    rememberModalReturnFocus("plugin-help");
    restoreModalReturnFocus();

    expect(secondFocus).toHaveBeenCalled();
    expect(firstFocus).not.toHaveBeenCalled();
  });
});
