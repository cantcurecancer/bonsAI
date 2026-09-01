import { afterEach, describe, expect, it } from "vitest";

import { setFrozenTestChips, type PresetPrompt } from "../../data/presets";
import { nextSingleSlotPreset, startSingleSlotRotation } from "./singleSlotRotation";

const p = (text: string): PresetPrompt => ({ text, category: "test" });

describe("single-slot preset rotation", () => {
  afterEach(() => {
    setFrozenTestChips([]);
  });

  it("opens on the first contextual seed and queues the rest", () => {
    const { first, rotation } = startSingleSlotRotation([p("a"), p("b"), p("c")]);
    expect(first?.text).toBe("a");
    expect(rotation.queue.map((s) => s.text)).toEqual(["b", "c"]);
  });

  /* The whole point of the helper: a seeding of three must be shown in full through one chip. */
  it("shows every contextual seed before drawing from the pool", () => {
    const { first, rotation: r0 } = startSingleSlotRotation([p("a"), p("b"), p("c")]);
    const s1 = nextSingleSlotPreset(first!, r0);
    const s2 = nextSingleSlotPreset(s1.next, s1.rotation);
    expect([s1.next.text, s2.next.text]).toEqual(["b", "c"]);
    expect(s2.rotation.queue).toEqual([]);
  });

  it("never repeats what just showed once it is on the pool", () => {
    const { first, rotation } = startSingleSlotRotation([p("only")]);
    const s1 = nextSingleSlotPreset(first!, rotation);
    expect(s1.next.text).not.toBe("only");
    const s2 = nextSingleSlotPreset(s1.next, s1.rotation);
    expect(s2.next.text).not.toBe(s1.next.text);
    expect(s2.next.text).not.toBe("only");
  });

  /* "First frozen entry not on screen" walked a batch only because three chips were on screen.
     With one, it bounced between the first two entries — round-robin is the fix. */
  it("walks a frozen QA batch in order and wraps", () => {
    setFrozenTestChips(["q1", "q2", "q3", "q4"]);
    const { first, rotation } = startSingleSlotRotation([p("q1"), p("q2"), p("q3")]);
    const seen = [first!.text];
    let state = { next: first!, rotation };
    for (let i = 0; i < 4; i++) {
      state = nextSingleSlotPreset(state.next, state.rotation);
      seen.push(state.next.text);
    }
    expect(seen).toEqual(["q1", "q2", "q3", "q4", "q1"]);
  });
});
