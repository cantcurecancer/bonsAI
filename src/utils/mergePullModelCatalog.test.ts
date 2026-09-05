import { describe, expect, it } from "vitest";
import { PULL_MODEL_CATALOG } from "../data/pullModelCatalog";
import { isPlausibleOllamaPullTag, mergePullModelCatalog } from "./mergePullModelCatalog";

describe("mergePullModelCatalog", () => {
  it("returns bundled catalog when overlay is empty", () => {
    const merged = mergePullModelCatalog(PULL_MODEL_CATALOG, null);
    expect(merged.length).toBe(PULL_MODEL_CATALOG.length);
    expect(merged[0]?.tag).toBe(PULL_MODEL_CATALOG[0]?.tag);
  });

  it("adds overlay-only entries", () => {
    const merged = mergePullModelCatalog(PULL_MODEL_CATALOG, {
      entries: [
        {
          tag: "qwen3:2b",
          params: "2B",
          sizeGb: 1.6,
          releasedYm: "2025-04",
          license: "Apache 2.0",
          licenseClass: "foss",
          group: "smallest",
          tags: ["chat", "strategy"],
          rating: 5,
          blurb: "Overlay-only model.",
        },
      ],
      removed_tags: [],
      overrides: {},
    });
    expect(merged.some((e) => e.tag === "qwen3:2b")).toBe(true);
    expect(merged.length).toBe(PULL_MODEL_CATALOG.length + 1);
  });

  it("removes tags listed in removed_tags", () => {
    const merged = mergePullModelCatalog(PULL_MODEL_CATALOG, {
      entries: [],
      removed_tags: ["qwen2.5:1.5b"],
      overrides: {},
    });
    expect(merged.some((e) => e.tag === "qwen2.5:1.5b")).toBe(false);
    expect(merged.length).toBe(PULL_MODEL_CATALOG.length - 1);
  });

  it("applies partial overrides on bundled entries", () => {
    const merged = mergePullModelCatalog(PULL_MODEL_CATALOG, {
      entries: [],
      removed_tags: [],
      overrides: {
        "gemma4:latest": { rating: 5, blurb: "Patched blurb for tests." },
      },
    });
    const gemma = merged.find((e) => e.tag === "gemma4:latest");
    expect(gemma?.rating).toBe(5);
    expect(gemma?.blurb).toBe("Patched blurb for tests.");
  });

  it("rejects invalid overlay entries", () => {
    const merged = mergePullModelCatalog(PULL_MODEL_CATALOG, {
      entries: [
        {
          tag: "NOT VALID TAG",
          params: "1B",
          sizeGb: 1,
          releasedYm: "2025-01",
          license: "MIT",
          licenseClass: "foss",
          group: "smallest",
          tags: ["chat"],
          rating: 3,
          blurb: "bad",
        } as never,
      ],
      removed_tags: [],
      overrides: {},
    });
    expect(merged.length).toBe(PULL_MODEL_CATALOG.length);
  });
});

describe("isPlausibleOllamaPullTag", () => {
  it("accepts a plain model name with no variant", () => {
    expect(isPlausibleOllamaPullTag("llama3.2")).toBe(true);
  });

  it("accepts a model name with a size/variant tag", () => {
    expect(isPlausibleOllamaPullTag("llama3.2:3b")).toBe(true);
  });

  it("trims surrounding whitespace before checking", () => {
    expect(isPlausibleOllamaPullTag("  qwen2.5vl:3b  ")).toBe(true);
  });

  it("rejects an empty or whitespace-only string", () => {
    expect(isPlausibleOllamaPullTag("")).toBe(false);
    expect(isPlausibleOllamaPullTag("   ")).toBe(false);
  });

  it("rejects uppercase letters and spaces, matching the backend's registry rule", () => {
    expect(isPlausibleOllamaPullTag("NOT VALID TAG")).toBe(false);
    expect(isPlausibleOllamaPullTag("Llama3.2")).toBe(false);
  });

  it("rejects a tag over 96 characters, same cap as is_valid_ollama_pull_tag", () => {
    expect(isPlausibleOllamaPullTag("a".repeat(97))).toBe(false);
    expect(isPlausibleOllamaPullTag("a".repeat(64))).toBe(true);
  });

  it("rejects a variant longer than 32 characters", () => {
    expect(isPlausibleOllamaPullTag(`llama3.2:${"b".repeat(33)}`)).toBe(false);
    expect(isPlausibleOllamaPullTag(`llama3.2:${"b".repeat(32)}`)).toBe(true);
  });
});
