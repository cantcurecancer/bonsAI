import { beforeEach, describe, expect, it } from "vitest";

import {
  elementHasFocus,
  getUiDocument,
  rememberUiDocument,
  resetUiDocument,
  uiActiveElement,
} from "./uiDocument";

/**
 * Stand-in for the QAM popup document. On device the plugin's own UI is rendered into a document
 * that is not the one plugin code sees as `document` — that is the whole reason this module exists.
 */
function makeUiDocument(): Document {
  return document.implementation.createHTMLDocument("qam");
}

function setActiveElement(doc: Document, el: Element | null): void {
  Object.defineProperty(doc, "activeElement", { value: el, configurable: true });
}

describe("uiDocument", () => {
  beforeEach(() => {
    resetUiDocument();
  });

  it("falls back to the global document before anything has mounted", () => {
    expect(getUiDocument()).toBe(document);
  });

  it("learns the UI document from a mounted element", () => {
    const doc = makeUiDocument();
    const el = doc.createElement("div");
    doc.body.appendChild(el);

    rememberUiDocument(el);

    expect(getUiDocument()).toBe(doc);
    expect(getUiDocument()).not.toBe(document);
  });

  it("ignores a null ref, so unmount does not forget the document", () => {
    const doc = makeUiDocument();
    rememberUiDocument(doc.body);
    rememberUiDocument(null);
    expect(getUiDocument()).toBe(doc);
  });

  it("reads activeElement from the UI document, not the global one", () => {
    const doc = makeUiDocument();
    const focused = doc.createElement("button");
    doc.body.appendChild(focused);
    setActiveElement(doc, focused);
    rememberUiDocument(focused);

    // The global document's activeElement is its own <body> and knows nothing about `focused`.
    expect(document.activeElement).not.toBe(focused);
    expect(uiActiveElement()).toBe(focused);
  });

  describe("elementHasFocus", () => {
    it("is true for the focused element", () => {
      const doc = makeUiDocument();
      const el = doc.createElement("div");
      doc.body.appendChild(el);
      setActiveElement(doc, el);

      expect(elementHasFocus(el)).toBe(true);
    });

    it("is true for an ancestor of the focused element", () => {
      const doc = makeUiDocument();
      const panel = doc.createElement("div");
      const inner = doc.createElement("button");
      panel.appendChild(inner);
      doc.body.appendChild(panel);
      setActiveElement(doc, inner);

      expect(elementHasFocus(panel)).toBe(true);
    });

    it("is false when focus sits elsewhere", () => {
      const doc = makeUiDocument();
      const el = doc.createElement("div");
      const other = doc.createElement("div");
      doc.body.append(el, other);
      setActiveElement(doc, other);

      expect(elementHasFocus(el)).toBe(false);
    });

    it("is false for null", () => {
      expect(elementHasFocus(null)).toBe(false);
    });

    /*
     * The regression this module was written for: the old check was
     * `el.contains(document.activeElement)`, which compares against the *global* document. On device
     * that document is SharedJSContext's shell, so the answer was false for every element we had
     * just successfully focused, and every caller treated a working focus move as a failure.
     */
    it("does not consult the global document", () => {
      const doc = makeUiDocument();
      const el = doc.createElement("div");
      doc.body.appendChild(el);
      setActiveElement(doc, el);
      setActiveElement(document, document.body);

      expect(el.contains(document.activeElement)).toBe(false);
      expect(elementHasFocus(el)).toBe(true);
    });
  });
});
