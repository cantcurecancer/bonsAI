import { afterEach, describe, expect, it, vi } from "vitest";

import { liftAboveDock } from "./useDockClearanceOnFocus";

/*
 * jsdom has no layout, so the three rects the lift reads are stubbed: a 0–616 scroll pane, a dock
 * whose top is at 370 (covering the bottom 246px, the on-device number), and a focused element
 * placed by each test. What matters is the decision — lift or leave — and the two outputs: the
 * scroll-margin carrying the covered strip, and the scrollIntoView call itself.
 */
function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function makePane(opts: { dockTop?: number } = {}) {
  const scroll = document.createElement("div");
  scroll.className = "TabContentsScroll";
  scroll.getBoundingClientRect = () => rect(0, 616);

  const dock = document.createElement("div");
  dock.className = "bonsai-main-tab-dock";
  dock.getBoundingClientRect = () => rect(opts.dockTop ?? 370, 616);
  scroll.appendChild(dock);
  document.body.appendChild(scroll);

  const focusEl = (top: number, bottom: number, parent: HTMLElement = scroll) => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => rect(top, bottom);
    el.scrollIntoView = vi.fn();
    parent.appendChild(el);
    return el;
  };

  return { scroll, dock, focusEl };
}

describe("liftAboveDock", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("lifts an element sitting behind the dock, with the covered strip as its margin", () => {
    const t = makePane();
    const el = t.focusEl(400, 428); // fully inside the dock's overlay

    expect(liftAboveDock(el)).toBe(true);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: "end", behavior: "auto" });
    // 616 - 370 = 246 covered, plus the breathing pad.
    expect(el.style.scrollMarginBottom).toBe("252px");
  });

  it("lifts an element straddling the dock's top edge", () => {
    const t = makePane();
    const el = t.focusEl(350, 390);

    expect(liftAboveDock(el)).toBe(true);
  });

  it("leaves an element already clear of the dock alone", () => {
    const t = makePane();
    const el = t.focusEl(200, 240);

    expect(liftAboveDock(el)).toBe(false);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  /* The dock's own controls are always visible by construction — lifting one would scroll the
     transcript underneath it for no reason. */
  it("never lifts a control inside the dock itself", () => {
    const t = makePane();
    const chip = t.focusEl(500, 530, t.dock);

    expect(liftAboveDock(chip)).toBe(false);
  });

  /* At max scroll the dock is back in normal flow below the content: nothing is covered. */
  it("does nothing when the dock is not covering the pane", () => {
    const t = makePane({ dockTop: 616 });
    const el = t.focusEl(590, 615);

    expect(liftAboveDock(el)).toBe(false);
  });

  it("does nothing outside a scroll pane", () => {
    const orphan = document.createElement("div");
    orphan.scrollIntoView = vi.fn();
    document.body.appendChild(orphan);

    expect(liftAboveDock(orphan)).toBe(false);
  });
});
