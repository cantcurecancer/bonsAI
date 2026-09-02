import { afterEach, describe, expect, it } from "vitest";

import { setFrozenTestChips, type PresetPrompt } from "../../data/presets";
import { nextSlotPreset, startSlotRotation } from "./presetSlotRotation";

const p = (text: string): PresetPrompt => ({ text, category: "test" });

describe("preset slot rotation", () => {
  afterEach(() => {
    setFrozenTestChips([]);
  });

  it("fills the row with the first seeds and queues the rest", () => {
    const { first, rotation } = startSlotRotation([p("a"), p("b"), p("c")], 2);
    expect(first.map((s) => s.text)).toEqual(["a", "b"]);
    expect(rotation.queue.map((s) => s.text)).toEqual(["c"]);
    expect(rotation.lastIntroduced).toBe("b");
  });

  /* The whole point of the helper: a seeding of three must be shown in full through two chips. */
  it("shows the third seed before drawing from the pool", () => {
    const { first, rotation } = startSlotRotation([p("a"), p("b"), p("c")], 2);
    const s1 = nextSlotPreset(first[0]!, new Set(["a", "b"]), rotation);
    expect(s1.next.text).toBe("c");
    expect(s1.rotation.queue).toEqual([]);
  });

  it("never hands a slot what the other slot is showing", () => {
    const other = "How do I fix stuttering?"; // a real pool entry, so the random draw could pick it
    const { first, rotation } = startSlotRotation([p("only"), p(other)], 2);
    let state = { next: first[0]!, rotation };
    for (let i = 0; i < 12; i++) {
      state = nextSlotPreset(state.next, new Set([state.next.text, other]), state.rotation);
      expect(state.next.text).not.toBe(other);
    }
  });

  it("never repeats what just showed once it is on the pool", () => {
    const { first, rotation } = startSlotRotation([p("only")], 1);
    const s1 = nextSlotPreset(first[0]!, new Set(["only"]), rotation);
    expect(s1.next.text).not.toBe("only");
    const s2 = nextSlotPreset(s1.next, new Set([s1.next.text]), s1.rotation);
    expect(s2.next.text).not.toBe(s1.next.text);
    expect(s2.next.text).not.toBe("only");
  });

  /* "First frozen entry not on screen" walked a batch only because three chips were on screen.
     With fewer it ping-ponged. Round-robin from the last entry the ROW introduced — not per slot —
     walks the whole batch in order across both chips, and never shows one entry twice at once. */
  it("walks a pinned QA batch in order across two slots, past its third entry, and wraps", () => {
    setFrozenTestChips(["q1", "q2", "q3", "q4"]);
    const { first, rotation } = startSlotRotation([p("q1"), p("q2"), p("q3")], 2);
    const slots = [first[0]!, first[1]!];
    let rot = rotation;
    const introduced: string[] = [];
    for (let i = 0; i < 6; i++) {
      const slot = i % 2;
      const visible = new Set(slots.map((s) => s.text));
      const step = nextSlotPreset(slots[slot]!, visible, rot);
      rot = step.rotation;
      slots[slot] = step.next;
      introduced.push(step.next.text);
      expect(new Set(slots.map((s) => s.text)).size).toBe(2);
    }
    expect(introduced).toEqual(["q3", "q4", "q1", "q2", "q3", "q4"]);
  });
});
