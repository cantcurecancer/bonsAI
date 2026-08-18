import { describe, expect, it } from "vitest";
import { archivedTurnTransparency } from "./archivedTurnTransparency";
import type { TransparencySnapshot } from "./inputTransparency";

const snap = (route: string): TransparencySnapshot =>
  ({ route, context_chips: [{ label: "KB: 9 sections", rank: 1 }] }) as unknown as TransparencySnapshot;

describe("archivedTurnTransparency", () => {
  it("prefers the turn's own snapshot when it has one", () => {
    const own = snap("own");
    const got = archivedTurnTransparency({
      turn: { transparency: own },
      index: 0,
      total: 3,
      liveSnapshot: snap("live"),
    });
    expect(got).toBe(own);
  });

  /**
   * The regression this file exists for. A slot-restored turn has `transparency: null`, and after
   * a completed Ask that turn is the expanded one — so without the borrow there is no snapshot to
   * render and Show details disappears from the UI entirely.
   */
  it("lets the newest archived turn borrow the live snapshot", () => {
    const live = snap("live");
    const got = archivedTurnTransparency({
      turn: { transparency: null },
      index: 2,
      total: 3,
      liveSnapshot: live,
    });
    expect(got).toBe(live);
  });

  it("does not lend the live snapshot to an older turn", () => {
    expect(
      archivedTurnTransparency({
        turn: { transparency: null },
        index: 0,
        total: 3,
        liveSnapshot: snap("live"),
      })
    ).toBeNull();
  });

  it("returns null when there is no snapshot anywhere", () => {
    expect(
      archivedTurnTransparency({
        turn: { transparency: null },
        index: 0,
        total: 1,
        liveSnapshot: null,
      })
    ).toBeNull();
  });

  it("handles an empty archive without claiming index 0 is newest", () => {
    expect(
      archivedTurnTransparency({
        turn: { transparency: null },
        index: 0,
        total: 0,
        liveSnapshot: snap("live"),
      })
    ).toBeNull();
  });
});
