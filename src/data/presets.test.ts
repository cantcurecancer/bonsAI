import { describe, expect, it } from "vitest";
import {
  LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT,
  TEMP_CAROUSEL_FROZEN_TEXTS,
  TEMP_PRESET_CAROUSEL_FROZEN,
  detectPromptCategory,
  getContextualPresets,
  getRandomPresetExcluding,
  getRandomPresets,
  holdMsForPresetText,
} from "./presets";

/** Regression tests for preset sampling and category detection heuristics. */
describe("presets", () => {
  it("returns requested number of random presets when possible", () => {
    const presets = getRandomPresets(3);
    expect(presets.length).toBe(3);
  });

  it("detects category from explicit preset text", () => {
    expect(detectPromptCategory("Please help with battery optimization")).toBe("battery");
    expect(detectPromptCategory("How do I fix stuttering?")).toBe("troubleshooting");
    expect(detectPromptCategory("Diagnose a slow Ollama response")).toBe("ollama");
    expect(detectPromptCategory("How do I find Ollama on my LAN?")).toBe("ollama");
    expect(detectPromptCategory("What should I do if Ask times out?")).toBe("ollama");
    expect(detectPromptCategory("How do I use Find LAN on the Ollama tab?")).toBe("ollama");
    expect(detectPromptCategory("How do I bind a BonsAI quick-launch chord?")).toBe("controls");
    expect(detectPromptCategory("How do I enable token streaming?")).toBe("general");
    expect(detectPromptCategory("What should I expect while answers stream in?")).toBe("general");
  });

  it("returns contextual presets with requested length", () => {
    const presets = getContextualPresets("performance", 3);
    expect(presets.length).toBe(3);
  });

  it("when TEMP_PRESET_CAROUSEL_FROZEN is on, random and contextual triples match TEMP_CAROUSEL_FROZEN_TEXTS", () => {
    if (!TEMP_PRESET_CAROUSEL_FROZEN) return;
    // The frozen list may be longer than the carousel's three slots (a whole QA batch staged in
    // one deploy); the first three fill it and rotation walks the rest.
    const want = [...TEMP_CAROUSEL_FROZEN_TEXTS].slice(0, 3);
    expect(getRandomPresets(3).map((p) => p.text)).toEqual(want);
    expect(getContextualPresets("performance", 3).map((p) => p.text)).toEqual(want);
  });

  it("when carousel is not frozen, preset sampling is not locked to the frozen testing triple", () => {
    if (TEMP_PRESET_CAROUSEL_FROZEN) return;
    const key = [...TEMP_CAROUSEL_FROZEN_TEXTS].join("\0");
    let sawOtherRandom = false;
    let sawOtherContextual = false;
    for (let i = 0; i < 40; i++) {
      if (getRandomPresets(3).map((p) => p.text).join("\0") !== key) sawOtherRandom = true;
      if (getContextualPresets("performance", 3).map((p) => p.text).join("\0") !== key) sawOtherContextual = true;
      if (sawOtherRandom && sawOtherContextual) break;
    }
    expect(sawOtherRandom).toBe(true);
    expect(sawOtherContextual).toBe(true);
  });

  it("holdMsForPresetText clamps by length", () => {
    expect(holdMsForPresetText("a")).toBe(8000);
    expect(holdMsForPresetText("x".repeat(200))).toBe(32000);
    expect(holdMsForPresetText("How do I fix stuttering?")).toBeGreaterThan(4000);
    expect(holdMsForPresetText("How do I fix stuttering?")).toBeLessThan(32000);
  });

  it("getRandomPresetExcluding avoids listed texts when possible", () => {
    const all = getRandomPresets(50).map((p) => p.text);
    const exclude = new Set(all.slice(0, all.length - 1));
    const one = getRandomPresetExcluding(exclude);
    expect(exclude.has(one.text)).toBe(false);
  });

  it("excludes KB-advice static seed when useLocalKnowledgeBase is on (all samplers)", () => {
    for (let i = 0; i < 40; i++) {
      const random = getRandomPresets(50, { useLocalKnowledgeBase: true });
      expect(random.some((p) => p.text === LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT)).toBe(false);
      const contextual = getContextualPresets("performance", 50, { useLocalKnowledgeBase: true });
      expect(contextual.some((p) => p.text === LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT)).toBe(false);
      const excluding = getRandomPresetExcluding(new Set(), { useLocalKnowledgeBase: true });
      expect(excluding.text).not.toBe(LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT);
    }
  });

  it("includes KB-advice static seed when useLocalKnowledgeBase is off", () => {
    const all = getRandomPresets(50, { useLocalKnowledgeBase: false });
    expect(all.some((p) => p.text === LOCAL_KNOWLEDGE_BASE_ADVICE_PRESET_TEXT)).toBe(true);
  });
});
