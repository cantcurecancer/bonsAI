/**
 * Characterization tests for the Ask lifecycle — written before the entry-point
 * split so a behavior-preserving refactor can be shown to preserve behavior.
 *
 * These assert what a user gets: which RPC is sent, what the answer text
 * becomes, whether the spinner is up. They deliberately do not assert internal
 * shape (which useState holds what, call ordering within a branch), because
 * that is exactly what the refactor is allowed to change.
 */
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toaster } from "@decky/api";
import { useBonsaiAskOrchestration, type UseBonsaiAskOrchestrationArgs } from "./useBonsaiAskOrchestration";
import { getRpcCallLog, resetFakeDeckyRpc, setRpcHandler } from "../test-harness/fakeDeckyRpc";
import { idleBackgroundStatusFixture } from "../test-harness/rpcFixtures";

function makeArgs(overrides: Partial<UseBonsaiAskOrchestrationArgs> = {}): UseBonsaiAskOrchestrationArgs {
  return {
    desktopDebugNoteAutoSave: false,
    filesystemWrite: false,
    strategySpoilerMaskingEnabled: false,
    askMode: "speed",
    unifiedInput: "",
    setUnifiedInput: vi.fn(),
    unifiedInputPersistenceMode: "off",
    effectiveOllamaPcIp: "127.0.0.1:11434",
    selectedAttachment: null,
    setSelectedAttachment: vi.fn(),
    syncSettingsFromDisk: vi.fn(async () => undefined),
    unifiedInputFieldLayerRef: { current: null },
    unifiedInputHostRef: { current: null },
    setSelectedIndex: vi.fn(),
    setNavigationMessage: vi.fn(),
    saveIp: vi.fn(),
    persistSearchQuery: vi.fn(),
    useLocalKnowledgeBase: false,
    ...overrides,
  };
}

function startCalls() {
  return getRpcCallLog().filter((c) => c.method === "start_background_game_ai");
}

function startPayload(index = 0) {
  return startCalls()[index]?.args[0] as Record<string, unknown> | undefined;
}

/**
 * Keep an accepted request in flight. Needed because polling starts with an
 * immediate `pollOnce()` rather than after a delay, so the default idle fixture
 * would contradict a `pending` start and drop the spinner on the first poll.
 */
function keepRequestPending(requestId: number, question = "q") {
  setRpcHandler("start_background_game_ai", () => ({
    accepted: true,
    status: "pending",
    request_id: requestId,
  }));
  setRpcHandler("get_background_game_ai_status", () => ({
    ...idleBackgroundStatusFixture(),
    status: "pending",
    question,
    request_id: requestId,
  }));
}

describe("useBonsaiAskOrchestration", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
  });

  describe("submit guards", () => {
    it("refuses an empty question and sends nothing", async () => {
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs({ unifiedInput: "   " })));

      await act(async () => {
        await result.current.onAskOllama();
      });

      expect(startCalls()).toHaveLength(0);
      expect(toaster.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Question required" }),
      );
      expect(result.current.isAsking).toBe(false);
    });

    it("refuses to ask with no host configured", async () => {
      const { result } = renderHook(() =>
        useBonsaiAskOrchestration(makeArgs({ effectiveOllamaPcIp: "" })),
      );

      await act(async () => {
        await result.current.onAskOllama("how do I beat this boss");
      });

      expect(startCalls()).toHaveLength(0);
      expect(toaster.toast).toHaveBeenCalledWith(expect.objectContaining({ title: "PC IP required" }));
    });

    it("allows local-only commands through with no host configured", async () => {
      const { result } = renderHook(() =>
        useBonsaiAskOrchestration(makeArgs({ effectiveOllamaPcIp: "" })),
      );

      await act(async () => {
        await result.current.onAskOllama("bonsai:vac-check 76561198000000000");
      });

      expect(startCalls()).toHaveLength(1);
    });
  });

  describe("submit", () => {
    it("sends the question with the running game and ask mode, and shows the spinner", async () => {
      keepRequestPending(1, "where is the key");
      const setUnifiedInput = vi.fn();
      const saveIp = vi.fn();
      const { result } = renderHook(() =>
        useBonsaiAskOrchestration(
          makeArgs({ askMode: "strategy", setUnifiedInput, saveIp, unifiedInput: "where is the key" }),
        ),
      );

      await act(async () => {
        await result.current.onAskOllama();
      });

      const payload = startPayload();
      expect(payload).toMatchObject({
        question: "where is the key",
        PcIp: "127.0.0.1:11434",
        appId: "570",
        appName: "Dota 2",
        ask_mode: "strategy",
      });
      expect(result.current.isAsking).toBe(true);
      expect(setUnifiedInput).toHaveBeenCalledWith("");
      expect(saveIp).toHaveBeenCalledWith("127.0.0.1:11434");
    });

    it("sends the selected screenshot as an attachment", async () => {
      const { result } = renderHook(() =>
        useBonsaiAskOrchestration(
          makeArgs({
            selectedAttachment: {
              path: "/home/deck/shot.png",
              name: "shot.png",
              source: "steam_recent",
              app_id: "570",
            },
          }),
        ),
      );

      await act(async () => {
        await result.current.onAskOllama("what is this");
      });

      expect(startPayload()?.attachments).toEqual([
        { path: "/home/deck/shot.png", name: "shot.png", source: "steam_recent", app_id: "570" },
      ]);
    });
  });

  describe("terminal responses", () => {
    it("shows an answer that the start call already completed", async () => {
      setRpcHandler("start_background_game_ai", () => ({
        accepted: true,
        status: "completed",
        success: true,
        response: "Head north past the bridge.",
        request_id: 7,
      }));

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("where do I go");
      });

      // No timers advanced: the answer must already be on screen. (Status polling
      // still happens here — startAskCompletionWatch runs before this branch —
      // so "no polling" is not the property to assert.)
      expect(result.current.ollamaResponse).toContain("Head north past the bridge.");
      expect(result.current.isAsking).toBe(false);
    });

    it("surfaces a blocked question and does not leave the spinner up", async () => {
      setRpcHandler("start_background_game_ai", () => ({
        accepted: false,
        status: "blocked",
        response: "That input was not sent.",
      }));

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("something blocked");
      });

      expect(result.current.ollamaResponse).toBe("That input was not sent.");
      expect(result.current.isAsking).toBe(false);
      expect(toaster.toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Input not sent" }));
    });

    it("surfaces an invalid request and does not leave the spinner up", async () => {
      setRpcHandler("start_background_game_ai", () => ({
        accepted: false,
        status: "invalid",
        response: "Request is invalid.",
      }));

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("bad request");
      });

      expect(result.current.ollamaResponse).toBe("Request is invalid.");
      expect(result.current.isAsking).toBe(false);
    });

    it("reports a failed RPC as an error answer and clears the spinner", async () => {
      const onExternalFailure = vi.fn();
      setRpcHandler("start_background_game_ai", () => {
        throw new Error("backend unreachable");
      });

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs({ onExternalFailure })));

      await act(async () => {
        await result.current.onAskOllama("anything");
      });

      expect(result.current.ollamaResponse).toMatch(/^Error: /);
      expect(result.current.isAsking).toBe(false);
      expect(onExternalFailure).toHaveBeenCalledWith("ask_ollama", expect.any(String));
    });
  });

  describe("polling", () => {
    it("renders the answer that arrives from a later poll", async () => {
      vi.useFakeTimers();
      setRpcHandler("start_background_game_ai", () => ({ accepted: true, status: "pending", request_id: 3 }));
      let polls = 0;
      setRpcHandler("get_background_game_ai_status", () => {
        polls += 1;
        if (polls < 2) {
          return { ...idleBackgroundStatusFixture(), status: "pending", question: "q", request_id: 3 };
        }
        return {
          ...idleBackgroundStatusFixture(),
          status: "completed",
          question: "q",
          request_id: 3,
          success: true,
          response: "Use the grappling hook.",
        };
      });

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      let pending: Promise<void> | undefined;
      act(() => {
        pending = result.current.onAskOllama("q");
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      await act(async () => {
        await pending;
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(result.current.ollamaResponse).toContain("Use the grappling hook.");
      expect(result.current.isAsking).toBe(false);
      vi.useRealTimers();
    });
  });

  describe("cancel", () => {
    it("aborts the backend request and reports the cancellation", async () => {
      keepRequestPending(4, "long question");
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("long question");
      });
      expect(result.current.isAsking).toBe(true);

      act(() => {
        result.current.onCancelAsk();
      });

      expect(getRpcCallLog().some((c) => c.method === "abort_background_game_ai")).toBe(true);
      expect(result.current.ollamaResponse).toBe("Request cancelled.");
      expect(result.current.isAsking).toBe(false);
    });

    it("stops applying poll results after cancelling", async () => {
      vi.useFakeTimers();
      setRpcHandler("start_background_game_ai", () => ({ accepted: true, status: "pending", request_id: 5 }));
      setRpcHandler("get_background_game_ai_status", () => ({
        ...idleBackgroundStatusFixture(),
        status: "completed",
        question: "q",
        request_id: 5,
        success: true,
        response: "answer that arrived too late",
      }));

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      let pending: Promise<void> | undefined;
      act(() => {
        pending = result.current.onAskOllama("q");
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      await act(async () => {
        await pending;
      });

      act(() => {
        result.current.onCancelAsk();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(result.current.ollamaResponse).toBe("Request cancelled.");
      vi.useRealTimers();
    });
  });

  describe("thread history", () => {
    it("moves the previous exchange into the thread when the next question is asked", async () => {
      setRpcHandler("start_background_game_ai", () => ({
        accepted: true,
        status: "completed",
        success: true,
        response: "First answer.",
        request_id: 8,
      }));

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("first question");
      });
      expect(result.current.askThreadCollapsed).toHaveLength(0);

      await act(async () => {
        await result.current.onAskOllama("second question");
      });

      expect(result.current.askThreadCollapsed).toHaveLength(1);
      expect(result.current.askThreadCollapsed[0]).toMatchObject({
        question: "first question",
        answer: expect.stringContaining("First answer."),
      });
      expect(result.current.askThreadDisplayQuestion).toBe("second question");
    });
  });
});
