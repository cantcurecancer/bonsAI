import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChatSlots } from "./useChatSlots";

vi.mock("../utils/chatSlotsApi", () => ({
  listChatSlots: vi.fn(async () => []),
  getChatSlot: vi.fn(async () => null),
  createChatSlot: vi.fn(async () => ({
    id: "new-slot",
    label: "New chat",
    created_at: 0,
    updated_at: 0,
    turns: [],
  })),
  deleteChatSlot: vi.fn(async () => true),
  renameChatSlot: vi.fn(async () => null),
}));

import * as chatSlotsApi from "../utils/chatSlotsApi";

describe("useChatSlots", () => {
  it("writes activeSlotIdRef synchronously in setActiveSlot", async () => {
    const activeSlotIdRef = { current: null as string | null };
    const { result } = renderHook(() =>
      useChatSlots({
        activeSlotIdRef,
        setAskThreadCollapsed: vi.fn(),
        setAskThreadDisplayQuestion: vi.fn(),
        setExpandedTurnKey: vi.fn(),
      }),
    );

    await act(async () => {
      result.current.setActiveSlot("slot-a");
    });

    expect(activeSlotIdRef.current).toBe("slot-a");
    expect(result.current.activeSlotId).toBe("slot-a");
  });

  it("concurrent create calls each see the ref the setter wrote", async () => {
    const activeSlotIdRef = { current: null as string | null };
    const createSpy = vi.mocked(chatSlotsApi.createChatSlot);
    createSpy
      .mockResolvedValueOnce({
        id: "slot-1",
        label: "One",
        created_at: 0,
        updated_at: 0,
        turns: [],
      })
      .mockResolvedValueOnce({
        id: "slot-2",
        label: "Two",
        created_at: 0,
        updated_at: 0,
        turns: [],
      });

    const { result } = renderHook(() =>
      useChatSlots({
        activeSlotIdRef,
        setAskThreadCollapsed: vi.fn(),
        setAskThreadDisplayQuestion: vi.fn(),
        setExpandedTurnKey: vi.fn(),
      }),
    );

    await act(async () => {
      await Promise.all([result.current.ensureActiveSlotForAsk("q1"), result.current.ensureActiveSlotForAsk("q2")]);
    });

    expect(createSpy).toHaveBeenCalledTimes(2);
    expect(activeSlotIdRef.current).toBe("slot-2");
  });
});
