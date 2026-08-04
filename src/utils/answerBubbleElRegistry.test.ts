import { beforeEach, describe, expect, it } from "vitest";

import {
  getRegisteredAnswerBubble,
  registerAnswerBubbleEl,
  resolveFocusedAnswerBubble,
} from "./answerBubbleElRegistry";
import { resetUiDocument } from "./uiDocument";

/** Stand-in for the QAM popup document — see uiDocument.ts for why it is not `document`. */
function makeUiDocument(): Document {
  return document.implementation.createHTMLDocument("qam");
}

function makeBubble(doc: Document): HTMLElement {
  const bubble = doc.createElement("div");
  bubble.className = "bonsai-chat-ai-bubble bonsai-glass-panel Panel Focusable";
  doc.body.appendChild(bubble);
  return bubble;
}

function setActiveElement(doc: Document, el: Element | null): void {
  Object.defineProperty(doc, "activeElement", { value: el, configurable: true });
}

describe("answer bubble element registry", () => {
  beforeEach(() => {
    resetUiDocument();
    registerAnswerBubbleEl("live", null);
    document.body.innerHTML = "";
  });

  /*
   * The bug this file exists for. The guard used to be `document.contains(el)`, and on device the
   * bubble lives in a different document than the one plugin code holds — so nothing was ever
   * stored, every lookup missed, and the D-pad handlers that depend on this registry returned early
   * without doing anything. Two shipped attempts at spoiler navigation died here.
   */
  it("registers a bubble that lives in the UI document, not the global one", () => {
    const doc = makeUiDocument();
    const bubble = makeBubble(doc);

    expect(document.contains(bubble)).toBe(false);
    expect(bubble.isConnected).toBe(true);

    registerAnswerBubbleEl("live", bubble);
    expect(getRegisteredAnswerBubble("live")).toBe(bubble);
  });

  it("drops a bubble once it leaves the tree", () => {
    const doc = makeUiDocument();
    const bubble = makeBubble(doc);
    registerAnswerBubbleEl("live", bubble);

    bubble.remove();

    expect(getRegisteredAnswerBubble("live")).toBeNull();
  });

  it("treats a null ref as unmount", () => {
    const doc = makeUiDocument();
    registerAnswerBubbleEl("live", makeBubble(doc));
    registerAnswerBubbleEl("live", null);
    expect(getRegisteredAnswerBubble("live")).toBeNull();
  });

  it("ignores an empty answer key", () => {
    const doc = makeUiDocument();
    registerAnswerBubbleEl("", makeBubble(doc));
    expect(getRegisteredAnswerBubble("")).toBeNull();
  });

  describe("resolveFocusedAnswerBubble", () => {
    it("finds the bubble when the bubble itself holds focus", () => {
      const doc = makeUiDocument();
      const bubble = makeBubble(doc);
      registerAnswerBubbleEl("live", bubble); // teaches the module which document to ask
      setActiveElement(doc, bubble);

      expect(resolveFocusedAnswerBubble()).toBe(bubble);
    });

    it("finds the bubble when a descendant holds focus", () => {
      const doc = makeUiDocument();
      const bubble = makeBubble(doc);
      const fence = doc.createElement("div");
      fence.className = "bonsai-spoiler-reveal-target Panel Focusable";
      bubble.appendChild(fence);
      registerAnswerBubbleEl("live", bubble);
      setActiveElement(doc, fence);

      expect(resolveFocusedAnswerBubble()).toBe(bubble);
    });

    it("returns null when focus is outside any bubble", () => {
      const doc = makeUiDocument();
      const bubble = makeBubble(doc);
      registerAnswerBubbleEl("live", bubble);
      setActiveElement(doc, doc.body);

      expect(resolveFocusedAnswerBubble()).toBeNull();
    });
  });
});
