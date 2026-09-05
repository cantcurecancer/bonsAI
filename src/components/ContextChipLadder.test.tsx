/**
 * Title: Context chip ladder tests
 * Purpose: Pin the active chip's visual state (roadmap: "The active chip in Show details is
 *          hard to spot").
 * Used for: ContextChipLadder.
 * Solves: The active/inactive split was only a couple of subtle inline-style differences that
 *         nothing asserted on; this pins it as a class so a future style pass can't drop it
 *         silently.
 * Does not: Drive the D-pad. The ladder is one Focusable and Steam's ring lands on the row, not
 *           on a chip -- that focus graph is unchanged here, by design (see roadmap entry).
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextChipLadder } from "./ContextChipLadder";
import type { ContextChip, TransparencySnapshot } from "../utils/inputTransparency";

function chip(overrides: Partial<ContextChip> = {}): ContextChip {
  return {
    id: "kb",
    rank: 1,
    label: "Keyword + meaning",
    attached: true,
    tier_class: "",
    body: { title: "Local knowledge base", paths: [], bullets: [] },
    ...overrides,
  };
}

function snapshotWith(chips: ContextChip[]): TransparencySnapshot {
  return { context_chips: chips } as unknown as TransparencySnapshot;
}

describe("ContextChipLadder active chip", () => {
  it("carries the active class on the active chip and no others", () => {
    const snapshot = snapshotWith([
      chip({ id: "kb", rank: 1, label: "Keyword + meaning" }),
      chip({ id: "routing", rank: 2, label: "Routed gemma3" }),
      chip({ id: "reply_style", rank: 3, label: "Reply style: balanced" }),
    ]);
    const { container } = render(<ContextChipLadder snapshot={snapshot} />);

    const allChips = container.querySelectorAll(".bonsai-chip-ladder-chip");
    expect(allChips).toHaveLength(3);

    const active = container.querySelectorAll(".bonsai-chip-ladder-chip--active");
    expect(active).toHaveLength(1);
    // Index 0 (rank 1) is the default `activeIndex` before any Left/Right press.
    expect(active[0].textContent).toBe("Keyword + meaning");

    const inactive = Array.from(allChips).filter((el) => el !== active[0]);
    expect(inactive).toHaveLength(2);
    for (const el of inactive) {
      expect(el.classList.contains("bonsai-chip-ladder-chip--active")).toBe(false);
    }
  });

  it("gives the active chip a visible border-and-fill highlight distinct from the rest", () => {
    const snapshot = snapshotWith([
      chip({ id: "kb", rank: 1, label: "Keyword + meaning" }),
      chip({ id: "routing", rank: 2, label: "Routed gemma3" }),
    ]);
    const { container } = render(<ContextChipLadder snapshot={snapshot} />);

    const active = container.querySelector(".bonsai-chip-ladder-chip--active") as HTMLElement;
    const inactive = container.querySelector(
      ".bonsai-chip-ladder-chip:not(.bonsai-chip-ladder-chip--active)",
    ) as HTMLElement;

    // The fill and the border both mark the active chip; the inactive one gets neither.
    expect(active.style.background).not.toBe(inactive.style.background);
    expect(active.style.border).not.toBe(inactive.style.border);
  });

  /*
   * One colour on the row (maintainer, 2026-09-05, after seeing it on device). The active cue used
   * to be a cyan box-shadow layered over borders that were already green / orange / red (model
   * licence tier) or tan (the chip carries a credit) -- six colours on one row, with the white
   * D-pad ring competing against all of them. These two cases pin the new rule: nothing on the row
   * is coloured except the chip you are on, and no chip carries a ring.
   */
  it("paints no ring on any chip, so nothing on the row imitates the D-pad highlight", () => {
    const snapshot = snapshotWith([
      chip({ id: "kb", rank: 1, label: "Keyword + meaning" }),
      chip({ id: "routing", rank: 2, label: "Routed gemma3" }),
    ]);
    const { container } = render(<ContextChipLadder snapshot={snapshot} />);

    for (const el of container.querySelectorAll<HTMLElement>(".bonsai-chip-ladder-chip")) {
      expect(el.style.boxShadow).toBe("");
    }
  });

  it("gives every chip but the active one the same border, whatever its tier or credit", () => {
    const snapshot = snapshotWith([
      chip({ id: "kb", rank: 1, label: "Keyword + meaning" }),
      chip({ id: "routing", rank: 2, label: "Routed gemma3", tier_class: "open_weight" }),
      chip({ id: "policy", rank: 3, label: "Model policy", tier_class: "non_foss" }),
      chip({
        id: "corpus",
        rank: 4,
        label: "Knowledge cards",
        body: {
          title: "Knowledge cards",
          paths: [],
          bullets: [],
          attribution: [{ source: "combineoverwiki.net", license: "CC-BY-SA-4.0", cards: [] }],
        } as unknown as ContextChip["body"],
      }),
    ]);
    const { container } = render(<ContextChipLadder snapshot={snapshot} />);

    const borders = new Set(
      [
        ...container.querySelectorAll<HTMLElement>(
          ".bonsai-chip-ladder-chip:not(.bonsai-chip-ladder-chip--active)",
        ),
      ].map((el) => el.style.border),
    );
    expect(borders.size).toBe(1);
    const only = [...borders][0]!;
    // Not green, orange, red or tan: the tier and credit colours are gone from the row.
    expect(only).not.toMatch(/74, 222, 128|251, 146, 60|248, 113, 113|214, 174, 116/);
  });
});
