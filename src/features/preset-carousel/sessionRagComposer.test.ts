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
