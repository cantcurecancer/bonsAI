/*
 * Found on device 2026-08-28 (row PICKER-REORDER-02): pressing A on a row's Up or Down button
 * reorders the list correctly, but the rows re-render keyed by tag and nothing owns the ring for the
 * next press -- the button the ring was on now belongs to a different row, and it takes an extra,
 * wasted-looking press to re-acquire on the moved model's own button. These pin the fix: after a
 * move, the ring goes back onto the moved row's own button -- the same direction pressed, or the
 * row's other button when that one is now disabled by having landed at an end.
 *
 * A plain `.focus()` is what the fix uses, which the focus-graph rule allows here specifically
 * because both buttons stay inside the one list `Focusable` the whole time -- the reorder only
 * changes a row's sibling position, never its container.
 */
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ModelRoutingOrderModal, type ModelRoutingOrderModalProps } from "./ModelRoutingOrderModal";
import { elementHasFocus } from "../utils/uiDocument";

function baseProps(overrides: Partial<ModelRoutingOrderModalProps> = {}): ModelRoutingOrderModalProps {
  const tags = ["model-a", "model-b", "model-c", "model-d"];
  return {
    kind: "text",
    installedTags: tags,
    catalogByTag: new Map(),
    modelPolicyTier: "non_foss",
    modelPolicyNonFossUnlocked: true,
    modelAllowHighVramFallbacks: true,
    savedOrder: tags,
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

function upButton(container: HTMLElement, tag: string): HTMLElement {
  const el = container.querySelector(`[aria-label="Move ${tag} up"]`);
  if (!el) throw new Error(`no Up button for ${tag}`);
  return el as HTMLElement;
}

function downButton(container: HTMLElement, tag: string): HTMLElement {
  const el = container.querySelector(`[aria-label="Move ${tag} down"]`);
  if (!el) throw new Error(`no Down button for ${tag}`);
  return el as HTMLElement;
}

/** DOM order of the rows, read off the Up buttons' own aria-labels rather than assuming layout. */
function tagOrder(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[aria-label^="Move "][aria-label$=" up"]')].map((el) => {
    const label = el.getAttribute("aria-label") ?? "";
    return label.replace(/^Move /, "").replace(/ up$/, "");
  });
}

describe("ModelRoutingOrderModal reorder keeps the highlight", () => {
  it("moves the row and puts the ring back on its own Up button when that button stays enabled", () => {
    const { container } = render(<ModelRoutingOrderModal {...baseProps()} />);

    // model-c: index 2 -> 1. Its Up button stays enabled at the new index 1 (not the top row).
    fireEvent.click(upButton(container, "model-c"));

    expect(tagOrder(container)).toEqual(["model-a", "model-c", "model-b", "model-d"]);
    const primary = upButton(container, "model-c");
    expect(elementHasFocus(primary)).toBe(true);
    expect(elementHasFocus(downButton(container, "model-c"))).toBe(false);
  });

  it("falls back to the row's other button when the same-direction one is now disabled", () => {
    const { container } = render(<ModelRoutingOrderModal {...baseProps()} />);

    // model-b: index 1 -> 0. Its Up button is now disabled (index 0 has no Up), so the ring must
    // land on its Down button instead of on a disabled control that cannot take it.
    fireEvent.click(upButton(container, "model-b"));

    expect(tagOrder(container)).toEqual(["model-b", "model-a", "model-c", "model-d"]);
    const disabledPrimary = upButton(container, "model-b");
    expect(disabledPrimary.hasAttribute("disabled")).toBe(true);
    expect(elementHasFocus(disabledPrimary)).toBe(false);
    expect(elementHasFocus(downButton(container, "model-b"))).toBe(true);
  });

  it("keeps the highlight through a second consecutive move on the same row", () => {
    const { container } = render(<ModelRoutingOrderModal {...baseProps()} />);

    fireEvent.click(downButton(container, "model-a")); // a: 0 -> 1
    expect(elementHasFocus(downButton(container, "model-a"))).toBe(true);

    fireEvent.click(downButton(container, "model-a")); // a: 1 -> 2
    expect(tagOrder(container)).toEqual(["model-b", "model-c", "model-a", "model-d"]);
    expect(elementHasFocus(downButton(container, "model-a"))).toBe(true);
  });
});
