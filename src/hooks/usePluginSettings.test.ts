import { readFile } from "node:fs/promises";

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { call } from "@decky/api";
import { usePluginSettings } from "./usePluginSettings";
import { defaultSettingsFixture } from "../test-harness/rpcFixtures";
import { dispatchFakeRpc, getRpcCallLog, resetFakeDeckyRpc, setRpcHandler } from "../test-harness/fakeDeckyRpc";
import { DEFAULT_LATENCY_WARNING_SECONDS } from "../data/bonsaiSettingsSchema";
describe("usePluginSettings", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
    vi.mocked(call).mockImplementation((method: string, ...args: unknown[]) =>
      dispatchFakeRpc(method, args) as ReturnType<typeof call>
    );
  });

  it("loads settings on mount via load_settings RPC", async () => {
    const custom = defaultSettingsFixture();
    custom.latency_warning_seconds = 55;
    setRpcHandler("load_settings", () => custom);

    const { result } = renderHook(() => usePluginSettings());

    await waitFor(() => expect(result.current.settingsLoaded).toBe(true));
    expect(result.current.latencyWarningSeconds).toBe(55);
    expect(getRpcCallLog().some((c) => c.method === "load_settings")).toBe(true);
  });

  it("debounces save_settings after state change", async () => {
    const { result } = renderHook(() => usePluginSettings());
    await waitFor(() => expect(result.current.settingsLoaded).toBe(true));

    const savesBefore = getRpcCallLog().filter((c) => c.method === "save_settings").length;

    act(() => {
      result.current.setLatencyWarningSeconds(99);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });
    expect(getRpcCallLog().filter((c) => c.method === "save_settings").length).toBeGreaterThan(savesBefore);
  });

  it("falls back to defaults when load_settings fails", async () => {
    setRpcHandler("load_settings", async () => {
      throw new Error("disk read failed");
    });

    const { result } = renderHook(() => usePluginSettings());
    await waitFor(() => expect(result.current.settingsLoaded).toBe(true));
    expect(result.current.latencyWarningSeconds).toBe(DEFAULT_LATENCY_WARNING_SECONDS);
  });

  it("does not save_settings after load_settings fails", async () => {
    setRpcHandler("load_settings", async () => {
      throw new Error("disk read failed");
    });

    renderHook(() => usePluginSettings());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });
    expect(getRpcCallLog().filter((c) => c.method === "save_settings")).toHaveLength(0);
  });

  it("pauseDebouncedSettingsSave cancels a pending debounced save", async () => {
    const { result } = renderHook(() => usePluginSettings());
    await waitFor(() => expect(result.current.settingsLoaded).toBe(true));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });
    const savesBefore = getRpcCallLog().filter((c) => c.method === "save_settings").length;

    act(() => {
      result.current.setLatencyWarningSeconds(77);
    });
    await act(async () => {
      await result.current.pauseDebouncedSettingsSave();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 450));
    });

    const newSaves = getRpcCallLog().filter((c) => c.method === "save_settings").slice(savesBefore);
    const latencies = newSaves.map(
      (entry) => (entry.args[0] as { latency_warning_seconds?: number }).latency_warning_seconds
    );
    expect(latencies).not.toContain(77);
  });

  /*
   * D18, option A, locked 2026-08-27: a failed read shows defaults — all of them, no exceptions.
   *
   * This reads the source rather than driving the hook, and that is deliberate. The reset only runs
   * from the mount effect, whose deps are `[hydrateFromSettings]` and which is a `useCallback` with
   * an empty dep list — so by the time the reset can fire, state is *already* sitting at its
   * defaults and no behavioural assertion can tell a complete list from an incomplete one. The
   * defect D18 named is not a wrong value, it is a **list that drifted**: four fields were missing
   * from one of six hand-maintained copies of the same field list in this file.
   *
   * So the invariant is checked directly. Anything the hydrate path sets, the failure path must
   * reset. When D14 collapses that duplication this test should be deleted along with it — a
   * source-shape assertion earns its place only while the shape is the thing that can break.
   */
  it("resets every field the successful-load path sets, so the two lists cannot drift", async () => {
    // Not `import.meta.url` — under vitest's jsdom environment that is an http: URL, which
    // `readFile` rejects. The suite always runs from the repo root.
    const source = await readFile("src/hooks/usePluginSettings.ts", "utf8");

    const hydrateStart = source.indexOf("const hydrateFromSettings");
    expect(hydrateStart).toBeGreaterThan(-1);
    const hydrateBody = source.slice(hydrateStart, source.indexOf("\n  }, []);", hydrateStart));

    const catchStart = source.indexOf("      .catch(() => {");
    expect(catchStart).toBeGreaterThan(-1);
    const catchBody = source.slice(catchStart, source.indexOf("\n      .finally(", catchStart));

    const settersIn = (body: string) =>
      new Set([...body.matchAll(/\bset([A-Z]\w*)\(/g)].map((m) => m[1]));

    const hydrated = settersIn(hydrateBody);
    const reset = settersIn(catchBody);
    expect(hydrated.size).toBeGreaterThan(30);

    const missingFromReset = [...hydrated].filter((name) => !reset.has(name)).sort();
    expect(missingFromReset).toEqual([]);
  });

  it("flushSettingsSnapshotNow persists the latest hydrated snapshot", async () => {
    const { result } = renderHook(() => usePluginSettings());
    await waitFor(() => expect(result.current.settingsLoaded).toBe(true));

    let saved: { latency_warning_seconds?: number } | undefined;
    await act(async () => {
      result.current.hydrateFromSettings({
        ...defaultSettingsFixture(),
        latency_warning_seconds: 60,
      });
      saved = await result.current.flushSettingsSnapshotNow();
    });

    expect(saved?.latency_warning_seconds).toBe(60);
  });
});
