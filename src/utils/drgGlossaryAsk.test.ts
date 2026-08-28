import { describe, expect, it } from "vitest";

import {
  composeDrgGlossaryExplainFurtherQuestion,
  drgGlossaryExplainFurtherThreadDisplay,
} from "./drgGlossaryAsk";
import { DRG_SURVIVOR_GLOSSARY_TERMS } from "../data/drgGlossaryTerms";

const kitingTerm = DRG_SURVIVOR_GLOSSARY_TERMS.find((t) => t.id === "kiting")!;

describe("composeDrgGlossaryExplainFurtherQuestion", () => {
  it("names the term and the game so the model has enough to answer without re-asking", () => {
    const question = composeDrgGlossaryExplainFurtherQuestion(kitingTerm);
    expect(question).toContain('"kiting"');
    expect(question).toContain("Deep Rock Galactic: Survivor");
  });
});

describe("drgGlossaryExplainFurtherThreadDisplay", () => {
  it("is a short label naming the term", () => {
    expect(drgGlossaryExplainFurtherThreadDisplay(kitingTerm)).toBe("Explain: kiting");
  });
});
