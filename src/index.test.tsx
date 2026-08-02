/**
 * Smoke and wiring tests for the plugin root.
 *
 * index.tsx is the highest-churn file in the repo and no automated test
 * executed it, nor any of the 44 component files it mounts — `npm test` would
 * have passed with the entire UI deleted. These do not assert layout; they
 * assert that the plugin still satisfies Decky's contract, that the tree
 * mounts at all, and that it reads saved settings on open.
 */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { PLUGIN_VERSION } from "./pluginVersion";
import { getRpcCallLog, resetFakeDeckyRpc, setRpcHandler } from "./test-harness/fakeDeckyRpc";
import { defaultSettingsFixture } from "./test-harness/rpcFixtures";

type DeckyPlugin = {
  name?: string;
  titleView?: unknown;
  content?: unknown;
  icon?: unknown;
  onDismount?: () => void;
};

/**
 * Load a fresh plugin instance. Required, not tidiness: bonsaiSessionSurvival.ts
 * keeps module-level state so settings survive Decky remounting the panel when a
 * modal opens. Reusing one import means the second mount in a file restores the
 * previous test's snapshot instead of what load_settings returned.
 */
async function freshPlugin(): Promise<DeckyPlugin> {
  vi.resetModules();
  return (await import("./index")).default as DeckyPlugin;
}

/**
 * For tests that never mount the tree, so module state cannot matter. Importing
 * index.tsx pulls in the whole component graph, which is slow enough that doing
 * it once per test pushes the file past the default timeout under full-suite load.
 */
let shared: Promise<DeckyPlugin> | null = null;
function sharedPlugin(): Promise<DeckyPlugin> {
  if (!shared) shared = import("./index").then((m) => m.default as DeckyPlugin);
  return shared;
}

describe("plugin root", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
  });

  describe("Decky contract", () => {
    it("exposes the fields Decky needs to show the plugin in the QAM", async () => {
      const plugin = await sharedPlugin();
      expect(plugin.name).toBe("bonsAI");
      expect(plugin.titleView).toBeTruthy();
      expect(plugin.content).toBeTruthy();
      expect(plugin.icon).toBeTruthy();
      expect(typeof plugin.onDismount).toBe("function");
    });

    it("unmounts without throwing", async () => {
      const plugin = await sharedPlugin();
      expect(() => plugin.onDismount?.()).not.toThrow();
    });

    it("shows the build version in the title", async () => {
      const plugin = await sharedPlugin();
      render(plugin.titleView as ReactElement);
      expect(screen.getByText(`v${PLUGIN_VERSION}`)).toBeTruthy();
    });
  });

  describe("mount", () => {
    it("renders the real UI, not the error fallback", async () => {
      const plugin = await freshPlugin();
      // "does not throw" is not enough on its own: the root wraps everything in
      // an ErrorBoundary, so a tree that fails to mount still renders quietly.
      render(plugin.content as ReactElement);
      expect(screen.queryByText("Plugin error")).toBeNull();
    });

    it("reads saved settings when opened", async () => {
      const plugin = await freshPlugin();
      render(plugin.content as ReactElement);

      await waitFor(() => {
        expect(getRpcCallLog().some((c) => c.method === "load_settings")).toBe(true);
      });
    });

    it("still mounts when the settings load fails", async () => {
      setRpcHandler("load_settings", () => {
        throw new Error("backend down");
      });

      const plugin = await freshPlugin();
      expect(() => render(plugin.content as ReactElement)).not.toThrow();
      await waitFor(() => {
        expect(getRpcCallLog().some((c) => c.method === "load_settings")).toBe(true);
      });
    });

    it("shows the expected tabs", async () => {
      const plugin = await freshPlugin();
      const { container } = render(plugin.content as ReactElement);

      await waitFor(() => {
        expect(container.querySelectorAll("[data-tab-id]").length).toBeGreaterThan(0);
      });
      const ids = Array.from(container.querySelectorAll("[data-tab-id]")).map((el) =>
        el.getAttribute("data-tab-id"),
      );
      expect(ids).toEqual(expect.arrayContaining(["main", "ollama", "settings", "permissions"]));
      expect(ids).not.toContain("developer");
    });

    it("applies a saved setting rather than always using defaults", async () => {
      setRpcHandler("load_settings", () => ({
        ...defaultSettingsFixture(),
        show_developer_tab: true,
      }));
      const plugin = await freshPlugin();

      const { container } = render(plugin.content as ReactElement);

      await waitFor(() => {
        expect(getRpcCallLog().some((c) => c.method === "load_settings")).toBe(true);
      });
      // Developer tab is off by default; with it saved on, the tree must show it.
      await waitFor(
        () => {
          const ids = Array.from(container.querySelectorAll("[data-tab-id]")).map((el) =>
            el.getAttribute("data-tab-id"),
          );
          expect(ids).toContain("developer");
        },
        { timeout: 3000 },
      );
    });
  });

  describe("error containment", () => {
    it("shows a recoverable error panel instead of blanking the QAM", async () => {
      const plugin = await freshPlugin();
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      // Break something the tree needs at mount, the way a real render fault
      // would, and confirm the boundary turns it into a visible panel.
      const original = globalThis.ResizeObserver;
      // @ts-expect-error deliberately removing a global the tree depends on
      delete globalThis.ResizeObserver;

      try {
        expect(() => render(plugin.content as ReactElement)).not.toThrow();
        expect(screen.getByText("Plugin error")).toBeTruthy();
      } finally {
        globalThis.ResizeObserver = original;
        consoleError.mockRestore();
      }
    });
  });
});
