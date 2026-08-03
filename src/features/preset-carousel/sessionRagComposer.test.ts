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

  it("keeps all static when rolls never hit RAG threshold", () => {
    const staticSeeds = [staticSeed("a"), staticSeed("b"), staticSeed("c")];
    const rolls = [0.99, 0.99, 0.99];
    const composed = composeSessionPresets({
      staticSeeds,
      ragCandidates: [rag("RAG-1"), rag("RAG-2"), rag("RAG-3")],
      random: () => rolls.shift() ?? 0.99,
    });
    expect(composed.map((p) => p.text)).toEqual(["a", "b", "c"]);
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

  it("at the default probability a losing roll keeps the static seeds", () => {
    const out = composeSessionPresets({
      staticSeeds: seeds,
      ragCandidates: candidates,
      random: () => 0.99,
    });
    expect(out.map((p) => p.text)).toEqual(seeds.map((s) => s.text));
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
