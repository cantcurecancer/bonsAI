import { describe, expect, it } from "vitest";

import {
  findDrgGlossaryTermMatches,
  isDrgSurvivorAppId,
  splitTextForDrgGlossaryTerms,
} from "./drgGlossaryTermMatch";
import { DRG_SURVIVOR_APP_ID } from "../data/drgGlossaryTerms";

describe("isDrgSurvivorAppId", () => {
  it("matches the DRG Survivor AppID", () => {
    expect(isDrgSurvivorAppId(DRG_SURVIVOR_APP_ID)).toBe(true);
  });

  it("does not match another game's AppID", () => {
    expect(isDrgSurvivorAppId("570")).toBe(false);
  });

  it("does not match null/undefined/empty", () => {
    expect(isDrgSurvivorAppId(null)).toBe(false);
    expect(isDrgSurvivorAppId(undefined)).toBe(false);
    expect(isDrgSurvivorAppId("")).toBe(false);
  });
});

describe("findDrgGlossaryTermMatches", () => {
  it("finds 'kiting' straight from the shipped DRG Survivor card text", () => {
    // data/kb/strategy_seed.json:164 — the roadmap's anchor sentence.
    const text =
      "Mining is not a side activity — it is where the resources for upgrades come from, so a " +
      "run spent only kiting is a run that ends underpowered.";
    const matches = findDrgGlossaryTermMatches(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].term.id).toBe("kiting");
    expect(matches[0].matchedText).toBe("kiting");
  });

  it("matches curated alt forms (kite) case-insensitively", () => {
    const matches = findDrgGlossaryTermMatches("Kite between waves; focus weak-point armor plates.");
    expect(matches).toHaveLength(1);
    expect(matches[0].term.id).toBe("kiting");
    expect(matches[0].matchedText).toBe("Kite");
  });

  it("matches 'overclock' without truncating the plural 'overclocks'", () => {
    const matches = findDrgGlossaryTermMatches("Overclocks change what a weapon is for.");
    expect(matches).toHaveLength(1);
    expect(matches[0].matchedText).toBe("Overclocks");
    expect(matches[0].term.id).toBe("overclock");
  });

  it("respects word boundaries: 'clockwork' does not fire the 'overclock' term", () => {
    expect(findDrgGlossaryTermMatches("The clockwork enemy approaches.")).toHaveLength(0);
  });

  it("matches when the term is flush against punctuation", () => {
    const matches = findDrgGlossaryTermMatches("(kiting), then mine.");
    expect(matches).toHaveLength(1);
    expect(matches[0].matchedText).toBe("kiting");
  });

  it("finds multiple distinct terms in one string, in order", () => {
    const matches = findDrgGlossaryTermMatches(
      "Save overclock for the fight, and kite between waves."
    );
    expect(matches.map((m) => m.term.id)).toEqual(["overclock", "kiting"]);
  });

  it("returns nothing for text with no curated term", () => {
    expect(findDrgGlossaryTermMatches("Mine nitra and gold, then buy upgrades.")).toHaveLength(0);
  });

  it("returns nothing for empty text", () => {
    expect(findDrgGlossaryTermMatches("")).toHaveLength(0);
  });
});

describe("splitTextForDrgGlossaryTerms", () => {
  it("returns a single text segment when there is no match", () => {
    const segments = splitTextForDrgGlossaryTerms("Mine nitra and gold.");
    expect(segments).toEqual([{ kind: "text", value: "Mine nitra and gold." }]);
  });

  it("splits around a single term, preserving surrounding text verbatim", () => {
    const segments = splitTextForDrgGlossaryTerms("a run spent only kiting is a run");
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ kind: "text", value: "a run spent only " });
    expect(segments[1]).toMatchObject({ kind: "term", value: "kiting" });
    expect((segments[1] as { term: { id: string } }).term.id).toBe("kiting");
    expect(segments[2]).toEqual({ kind: "text", value: " is a run" });
  });

  it("rejoins to the original string", () => {
    const original = "Save overclock for the fight, and kite between waves.";
    const segments = splitTextForDrgGlossaryTerms(original);
    const rejoined = segments.map((s) => s.value).join("");
    expect(rejoined).toBe(original);
  });

  it("handles a term at the very start and end of the string", () => {
    const segments = splitTextForDrgGlossaryTerms("kiting");
    expect(segments).toEqual([
      expect.objectContaining({ kind: "term", value: "kiting" }),
    ]);
  });
});
