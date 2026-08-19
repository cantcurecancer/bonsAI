import { describe, expect, it } from "vitest";
import type { PresetPrompt } from "../../data/presets";
import {
  composeSessionPresets,
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
