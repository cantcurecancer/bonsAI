import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { call } from "@decky/api";
import {
  callDeckyWithTimeout,
  DECKY_ASK_START_RPC_TIMEOUT_MS,
  DECKY_RPC_TIMEOUT_MS,
  formatDeckyRpcError,
} from "./deckyCall";
import { dispatchFakeRpc, resetFakeDeckyRpc, setRpcHandler } from "../test-harness/fakeDeckyRpc";

describe("deckyCall", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
    vi.mocked(call).mockImplementation((method: string, ...args: unknown[]) =>
      dispatchFakeRpc(method, args) as ReturnType<typeof call>
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves when RPC completes before timeout", async () => {
    setRpcHandler("get_deck_ip", () => "10.0.0.5");
    const ip = await callDeckyWithTimeout<[], string>("get_deck_ip", [], 5000);
    expect(ip).toBe("10.0.0.5");
  });

  it(
    "rejects when RPC exceeds timeout",
    async () => {
      setRpcHandler("get_deck_ip", () => new Promise<string>(() => {}));
      await expect(callDeckyWithTimeout<[], string>("get_deck_ip", [], 80)).rejects.toThrow(
        /RPC timeout after 80ms: get_deck_ip/
      );
    },
    200
  );

  it("formatDeckyRpcError returns message for Error", () => {
    expect(formatDeckyRpcError(new Error("boom"))).toBe("boom");
  });

  it("formatDeckyRpcError does not surface traceback in UI string", () => {
    const err = new Error("rpc failed") as Error & { traceback?: string };
    err.traceback = "Traceback (most recent call last):\n  File main.py";
    expect(formatDeckyRpcError(err)).toBe("rpc failed");
  });

  it("exports default RPC timeout constant", () => {
    expect(DECKY_RPC_TIMEOUT_MS).toBe(15_000);
  });

  it("Ask start timeout exceeds default and Steam VAC HTTP deadline", () => {
    expect(DECKY_ASK_START_RPC_TIMEOUT_MS).toBeGreaterThan(DECKY_RPC_TIMEOUT_MS);
    expect(DECKY_ASK_START_RPC_TIMEOUT_MS).toBeGreaterThanOrEqual(30_000);
  });
});
