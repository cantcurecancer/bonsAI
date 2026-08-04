import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useBonsaiPluginShell } from "./useBonsaiPluginShell";
import { LAST_TAB_STORAGE_KEY } from "../data/storageKeys";
import { loadLastTab, saveLastTab } from "../features/plugin-shell/pluginStorage";
import type { BonsaiSessionSurvivalSnapshot } from "../utils/bonsaiSessionSurvival";

const emptySnapshot = () => ({ currentTab: "main", unifiedInput: "" }) as unknown as BonsaiSessionSurvivalSnapshot;

const mount = () =>
  renderHook(() => useBonsaiPluginShell({ getSessionSnapshot: emptySnapshot }));

describe("last-tab persistence (D15 option B)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("storage helpers", () => {
    it("returns null when nothing was ever stored", () => {
      expect(loadLastTab()).toBeNull();
    });

    it("round-trips a tab id", () => {
      saveLastTab("ollama");
      expect(loadLastTab()).toBe("ollama");
    });

    it("trims stored whitespace rather than returning a tab id that matches nothing", () => {
      window.localStorage.setItem(LAST_TAB_STORAGE_KEY, "  settings  ");
      expect(loadLastTab()).toBe("settings");
    });

    it("treats a blank stored value as absent", () => {
      window.localStorage.setItem(LAST_TAB_STORAGE_KEY, "   ");
      expect(loadLastTab()).toBeNull();
    });

    it("clears the key when saving an empty tab id", () => {
      saveLastTab("about");
      saveLastTab("");
      expect(window.localStorage.getItem(LAST_TAB_STORAGE_KEY)).toBeNull();
    });

    it("uses a bonsai: prefixed key so Clear all plugin data wipes it", () => {
      // clearBonsaiBrowserStorage removes every bonsai:* key; a differently-named key would survive
      // a data clear and silently reopen the user on a tab from before the wipe.
      expect(LAST_TAB_STORAGE_KEY.startsWith("bonsai:")).toBe(true);
    });
  });

  describe("shell wiring", () => {
    it("opens on Main when nothing is stored", () => {
      const { result } = mount();
      expect(result.current.currentTab).toBe("main");
    });

    it("resumes the stored tab on mount", () => {
      saveLastTab("ollama");
      const { result } = mount();
      expect(result.current.currentTab).toBe("ollama");
    });

    it("persists the tab as soon as it changes", () => {
      const { result } = mount();
      act(() => result.current.setCurrentTab("settings"));
      expect(loadLastTab()).toBe("settings");
    });

    it("a tab change survives a remount, which is the whole point", () => {
      const first = mount();
      act(() => first.result.current.setCurrentTab("permissions"));
      first.unmount();

      const second = mount();
      expect(second.result.current.currentTab).toBe("permissions");
    });

    it("persists Main too, so returning to Main is remembered as a choice", () => {
      saveLastTab("about");
      const { result } = mount();
      act(() => result.current.setCurrentTab("main"));
      expect(loadLastTab()).toBe("main");
    });

    it("records the tab reached through the tab strip, not just direct setState", () => {
      const { result } = mount();
      act(() => result.current.onTabsShowTab("about"));
      expect(loadLastTab()).toBe("about");
    });
  });
});
