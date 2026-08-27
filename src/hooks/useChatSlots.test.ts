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

  /*
   * Clear cache detaches the slot rather than deleting it (D32), and detaching only works because
   * of what this describes: with the pointer null, the post-Ask reload must blank the thread
   * instead of reading the slot back off disk. Before the fix the pointer survived the reset, and
   * `reloadActiveSlotTranscript` — which runs after every completed Ask — refilled the transcript
   * the user had just cleared.
   */
  describe("a detached slot pointer", () => {
    it("makes reloadActiveSlotTranscript clear the thread instead of restoring one", async () => {
      const activeSlotIdRef = { current: "slot-a" as string | null };
      const setAskThreadCollapsed = vi.fn();
      const setAskThreadDisplayQuestion = vi.fn();
      const setExpandedTurnKey = vi.fn();
      const getSpy = vi.mocked(chatSlotsApi.getChatSlot);
      getSpy.mockClear();

      const { result } = renderHook(() =>
        useChatSlots({
          activeSlotIdRef,
          setAskThreadCollapsed,
          setAskThreadDisplayQuestion,
          setExpandedTurnKey,
        }),
      );

      await act(async () => {
        result.current.setActiveSlot(null);
      });
      expect(activeSlotIdRef.current).toBeNull();
      expect(result.current.activeSlotId).toBeNull();

      await act(async () => {
        await result.current.reloadActiveSlotTranscript();
      });

      // The slot is never even read, so nothing on disk can come back.
      expect(getSpy).not.toHaveBeenCalled();
      expect(setAskThreadCollapsed).toHaveBeenLastCalledWith([]);
      expect(setAskThreadDisplayQuestion).toHaveBeenLastCalledWith("");
      expect(setExpandedTurnKey).toHaveBeenLastCalledWith("live");
    });

    it("still reads the slot back while a pointer is set, so only the reset path is affected", async () => {
      const activeSlotIdRef = { current: "slot-a" as string | null };
      const setAskThreadCollapsed = vi.fn();
      const getSpy = vi.mocked(chatSlotsApi.getChatSlot);
      getSpy.mockClear();
      getSpy.mockResolvedValueOnce({
        id: "slot-a",
        label: "A",
        created_at: 0,
        updated_at: 0,
        turns: [
          { role: "user", text: "q" },
          { role: "assistant", text: "a" },
        ],
      } as never);

      const { result } = renderHook(() =>
        useChatSlots({
          activeSlotIdRef,
          setAskThreadCollapsed,
          setAskThreadDisplayQuestion: vi.fn(),
          setExpandedTurnKey: vi.fn(),
        }),
      );

      await act(async () => {
        await result.current.reloadActiveSlotTranscript();
      });

      expect(getSpy).toHaveBeenCalledWith("slot-a");
      expect(setAskThreadCollapsed).toHaveBeenCalled();
      expect(setAskThreadCollapsed.mock.calls.at(-1)?.[0]).not.toEqual([]);
    });
  });
});
