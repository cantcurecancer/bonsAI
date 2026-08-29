import { afterEach, describe, expect, it } from "vitest";
import {
  composePresetSeedsWithSessionRag,
  pickCarouselChipWithSessionRag,
  setSessionRagCarouselCandidates,
} from "./composePresetSeedsWithSessionRag";
import { setFrozenTestChips } from "../../data/presets";
import type { PresetPrompt } from "../../data/presets";
import {
  composeSessionPresets,
  pickNextCarouselChip,
  SESSION_RAG_CHIP_PROBABILITY,
  type SessionRagChipCandidate,
} from "./sessionRagComposer";

function staticSeed(text: string): PresetPrompt {
  return { text, category: "general" };
}

function rag(text: string, category = "strategy"): SessionRagChipCandidate {
  return {
    text,
    category,
    preferAskMode: category === "strategy" ? "strategy" : undefined,
    domain: category === "strategy" ? "strategy" : "compat",
  };
}

describe("sessionRagComposer", () => {
  it("returns static seeds unchanged when RAG pool is empty", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    expect(
      composeSessionPresets({
        staticSeeds,
        ragCandidates: [],
      }),
    ).toEqual(staticSeeds);
  });

  it("guarantees one RAG chip even when every roll loses (Phase 4 V1)", () => {
    // Before Phase 4 this returned three static chips. Rolling per slot at ~30% meant a player
    // with a covered game saw no sign the corpus existed about a third of the time (0.7^3), which
    // is what the on-Deck discovery found. The last slot is the one converted, so a contextual
    // first chip keeps its place.
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const rolls = [0.99, 0.99, 0.99];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [rag("RAG-1"), rag("RAG-2"), rag("RAG-3")],
      random: () => rolls.shift() ?? 0.99,
    });
    expect(composed.map((p) => p.text)).toEqual(["a", "b", "RAG-1"]);
  });

  it("still returns all static chips when there is nothing in the corpus to offer", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [],
      random: () => 0.99,
    });
    expect(composed.map((p) => p.text)).toEqual(["a", "b", "c"]);
  });

  it("prefers a game chip over a shared Deck tip for the guaranteed slot (G2)", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [
        { text: "Proton help", category: "troubleshooting", domain: "compat" },
        { text: "How do I beat Glyphid Dreadnought?", category: "strategy", domain: "strategy" },
      ],
      random: () => 0.99,
    });
    expect(composed[2]!.text).toBe("How do I beat Glyphid Dreadnought?");
  });

  it("badges game chips and leaves shared Deck tips unbadged (V4)", () => {
    const composed = composeSessionPresets({
      staticSeeds: [staticSeed("a"), staticSeed("b")],
      ragCandidates: [
        { text: "How do I beat Glyphid Dreadnought?", category: "strategy", domain: "strategy" },
        { text: "Proton help", category: "troubleshooting", domain: "compat" },
      ],
      ragProbability: 1,
      random: () => 0,
    });
    expect(composed[0]!.ragTip).toBe(true);
    expect(composed[1]!.ragTip).toBeUndefined();
  });

  it("substitutes ~one RAG chip when one roll hits", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const rolls = [0.1, 0.99, 0.99];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [rag("How do I beat Margit?"), rag("Proton help")],
      random: () => rolls.shift() ?? 0.99,
    });
    expect(composed).toHaveLength(3);
    expect(composed.filter((p) => p.text.startsWith("How do I beat")).length).toBe(1);
    expect(composed.filter((p) => ["a", "b", "c"].includes(p.text)).length).toBe(2);
  });

  it("allows streak of three RAG when all rolls hit", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [
        rag("RAG-1"),
        rag("RAG-2"),
        rag("RAG-3"),
        rag("RAG-4"),
      ],
      random: () => 0.0,
    });
    expect(composed.map((p) => p.text)).toEqual(["RAG-1", "RAG-2", "RAG-3"]);
  });

  it("dedupes RAG texts across slots", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [rag("Same tip"), rag("Other tip")],
      random: () => 0.0,
    });
    const texts = composed.map((p) => p.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("exports default probability constant", () => {
    expect(SESSION_RAG_CHIP_PROBABILITY).toBe(0.3);
  });
});

describe("QA probability override", () => {
  const seeds = [
    { text: "seed a", category: "general" },
    { text: "seed b", category: "general" },
    { text: "seed c", category: "general" },
  ];
  const candidates = [
    { text: "How do I beat Glyphid Dreadnought?", category: "strategy" },
    { text: "Tips for Hollow Bough in this game?", category: "strategy" },
    { text: "Any known Proton issues for this game?", category: "troubleshooting" },
  ];

  it("at probability 1 every slot takes a RAG candidate", () => {
    // The Developer-tab override exists because the default 0.3 roll makes
    // SESSION-RAG-CHIPS-01 luck-based: with three slots, P(no RAG chip) is 0.7^3 ~= 34%.
    const out = composeSessionPresets({
      staticSeeds: seeds,
      ragCandidates: candidates,
      ragProbability: 1,
      random: () => 0,
    });
    expect(out.map((p) => p.text)).toEqual(candidates.map((c) => c.text));
  });

  it("at the default probability a losing roll still leaves one RAG chip (V1)", () => {
    const out = composeSessionPresets({
      staticSeeds: seeds,
      ragCandidates: candidates,
      random: () => 0.99,
    });
    expect(out.slice(0, 2).map((p) => p.text)).toEqual(seeds.slice(0, 2).map((s) => s.text));
    expect(candidates.map((c) => c.text)).toContain(out[2]!.text);
  });

  it("at probability 1 with fewer candidates than slots, remaining slots fall back to seeds", () => {
    const out = composeSessionPresets({
      staticSeeds: seeds,
      ragCandidates: [candidates[0]!],
      ragProbability: 1,
      random: () => 0,
    });
    expect(out[0]!.text).toBe(candidates[0]!.text);
    expect(out).toHaveLength(3);
    expect(new Set(out.map((p) => p.text)).size).toBe(3);
  });
});

describe("frozen test chips suppress RAG mixing", () => {
  afterEach(() => setFrozenTestChips([]));

  const seeds = [
    { text: "pinned one", category: "testing", testChip: true },
    { text: "pinned two", category: "testing", testChip: true },
    { text: "pinned three", category: "testing", testChip: true },
  ];
  const candidates = [
    { text: "How do I beat Glyphid Dreadnought?", category: "strategy", domain: "strategy" },
  ];

  it("returns the pinned batch untouched, even though a corpus candidate is available", () => {
    // Without this gate the guarantee in composeSessionPresets would overwrite the last pinned
    // chip with a RAG chip, silently ending a QA run that still looks set up.
    setFrozenTestChips(seeds.map((s) => s.text));
    const out = composePresetSeedsWithSessionRag({
      staticSeeds: seeds,
      ragCandidates: candidates,
      ragProbability: 1,
      random: () => 0,
    });
    expect(out.map((p) => p.text)).toEqual(["pinned one", "pinned two", "pinned three"]);
  });

  it("resumes normal RAG mixing once the batch is cleared", () => {
    setFrozenTestChips([]);
    const out = composePresetSeedsWithSessionRag({
      staticSeeds: seeds,
      ragCandidates: candidates,
      ragProbability: 1,
      random: () => 0,
    });
    expect(out.some((p) => p.text === "How do I beat Glyphid Dreadnought?")).toBe(true);
  });
});

describe("pickNextCarouselChip — the rotation half of the guarantee", () => {
  afterEach(() => setFrozenTestChips([]));

  const candidates = [rag("How do I beat Glyphid Dreadnought?"), rag("How do I use Red Sugar?")];
  const fallback = () => staticSeed("static-chip");

  it("forces a corpus chip when none is on screen, whatever the roll", () => {
    // The bug this closes, measured on device 2026-08-29: the seeded corpus chip was carried out
    // of the three-slot window within about four ticks and rotation could only ever replace it
    // with another static preset, so it never came back for the rest of the session.
    const picked = pickNextCarouselChip({
      historyTexts: new Set(["a", "b", "c"]),
      visibleTexts: new Set(["a", "b", "c"]),
      ragCandidates: candidates,
      staticFallback: fallback,
      random: () => 0.99,
    });
    expect(picked.text).toBe("How do I beat Glyphid Dreadnought?");
    expect(picked.ragTip).toBe(true);
  });

  it("rolls normally once a corpus chip is already on screen", () => {
    const onScreen = new Set(["a", "How do I beat Glyphid Dreadnought?", "c"]);
    const lost = pickNextCarouselChip({
      historyTexts: onScreen,
      visibleTexts: onScreen,
      ragCandidates: candidates,
      staticFallback: fallback,
      random: () => 0.99,
    });
    expect(lost.text).toBe("static-chip");

    const won = pickNextCarouselChip({
      historyTexts: onScreen,
      visibleTexts: onScreen,
      ragCandidates: candidates,
      staticFallback: fallback,
      random: () => 0,
    });
    expect(won.text).toBe("How do I use Red Sugar?");
  });

  it("reads the guarantee off the visible window, not all of history", () => {
    // A corpus chip still in history but scrolled off screen is precisely the reported state, so
    // scoring the guarantee against history would leave the bug in place.
    const picked = pickNextCarouselChip({
      historyTexts: new Set(["How do I beat Glyphid Dreadnought?", "a", "b", "c"]),
      visibleTexts: new Set(["a", "b", "c"]),
      ragCandidates: candidates,
      staticFallback: fallback,
      random: () => 0.99,
    });
    expect(picked.text).toBe("How do I use Red Sugar?");
  });

  it("never repeats a chip still in history, and falls back when all are spent", () => {
    const all = new Set(candidates.map((c) => c.text));
    expect(
      pickNextCarouselChip({
        historyTexts: all,
        visibleTexts: new Set(["a", "b", "c"]),
        ragCandidates: candidates,
        staticFallback: fallback,
        random: () => 0,
      }).text,
    ).toBe("static-chip");
  });

  it("stays static when there are no candidates at all", () => {
    expect(
      pickNextCarouselChip({
        historyTexts: new Set(),
        visibleTexts: new Set(),
        ragCandidates: [],
        staticFallback: fallback,
        random: () => 0,
      }).text,
    ).toBe("static-chip");
  });

  it("prefers a game chip over a shared Deck tip when forcing", () => {
    const picked = pickNextCarouselChip({
      historyTexts: new Set(),
      visibleTexts: new Set(),
      ragCandidates: [rag("Any known Proton issues?", "troubleshooting"), rag("How do I beat X?")],
      staticFallback: fallback,
      random: () => 0.99,
    });
    expect(picked.text).toBe("How do I beat X?");
  });

  it("stands down completely while a frozen QA batch is pinned", () => {
    // A pinned batch is a deterministic run; rotating a corpus chip in would end it silently.
    setFrozenTestChips(["pinned one", "pinned two", "pinned three"]);
    setSessionRagCarouselCandidates(candidates);
    expect(
      pickCarouselChipWithSessionRag({
        historyTexts: new Set(["a", "b", "c"]),
        visibleTexts: new Set(["a", "b", "c"]),
        staticFallback: fallback,
      }).text,
    ).toBe("static-chip");
    setSessionRagCarouselCandidates([]);
  });

  it("draws from the published candidate list when none is passed", () => {
    setSessionRagCarouselCandidates(candidates);
    expect(
      pickCarouselChipWithSessionRag({
        historyTexts: new Set(["a", "b", "c"]),
        visibleTexts: new Set(["a", "b", "c"]),
        staticFallback: fallback,
        random: () => 0.99,
      }).text,
    ).toBe("How do I beat Glyphid Dreadnought?");
    setSessionRagCarouselCandidates([]);
  });
});
