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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toaster } from "@decky/api";
import { useBonsaiAskOrchestration, type UseBonsaiAskOrchestrationArgs } from "./useBonsaiAskOrchestration";
import { getRpcCallLog, resetFakeDeckyRpc, setRpcHandler } from "../test-harness/fakeDeckyRpc";
import { idleBackgroundStatusFixture } from "../test-harness/rpcFixtures";
import { THINKING_BLURB_PLACEHOLDER } from "../utils/thinkingSummaryText";

function makeArgs(overrides: Partial<UseBonsaiAskOrchestrationArgs> = {}): UseBonsaiAskOrchestrationArgs {
  return {
    desktopDebugNoteAutoSave: false,
    filesystemWrite: false,
    strategySpoilerMaskingEnabled: false,
    askMode: "speed",
    unifiedInput: "",
    setUnifiedInput: vi.fn(),
    unifiedInputPersistenceMode: "no_persist",
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

  /*
   * Fake timers are restored here, not only at the end of each test that installs them: a test that
   * fails before its own `useRealTimers()` used to leave them installed, and the next test to await
   * a real `setTimeout` then hung until the 20s vitest timeout — one assertion failure reported as
   * two, with the second pointing at innocent code.
   */
  afterEach(() => {
    vi.useRealTimers();
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
              source: "recent",
              app_id: "570",
            },
          }),
        ),
      );

      await act(async () => {
        await result.current.onAskOllama("what is this");
      });

      expect(startPayload()?.attachments).toEqual([
        { path: "/home/deck/shot.png", name: "shot.png", source: "recent", app_id: "570" },
      ]);
    });

    /*
     * Python is the only writer of thinking copy. These four pin that the client renders what it
     * is given and never invents a replacement -- the failure they guard against is not a wrong
     * string, it is the line changing on its own within the first second of an Ask.
     */
    it("renders the opener the backend returned, not one of its own", async () => {
      setRpcHandler("start_background_game_ai", () => ({
        accepted: true,
        status: "pending",
        request_id: 1,
        thinking_summary: "Log spelunking for why crash on launch. Glamorous.",
      }));
      setRpcHandler("get_background_game_ai_status", () => ({
        ...idleBackgroundStatusFixture(),
        status: "pending",
        question: "why crash on launch",
        request_id: 1,
      }));
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("why crash on launch");
      });

      expect(result.current.thinkingSummary).toBe(
        "Log spelunking for why crash on launch. Glamorous.",
      );
    });

    /*
     * Real timers on purpose. onAskOllama waits 50ms for the field blur to settle before it
     * touches any state, so under fake timers the blur wait and the RPC resolve in the same flush
     * and the intermediate frame is unobservable. Gating the RPC is the only way to see the state
     * the user actually sees during the round trip, which is the cost decision 4(a) accepted.
     */
    it("shows the placeholder until the backend opener arrives, then swaps it", async () => {
      let releaseStart = () => {};
      const gate = new Promise<void>((resolve) => {
        releaseStart = resolve;
      });
      keepRequestPending(1, "why crash on launch");
      setRpcHandler("start_background_game_ai", async () => {
        await gate;
        return { accepted: true, status: "pending", request_id: 1, thinking_summary: "Woven line." };
      });
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      let pending: Promise<void> | undefined;
      act(() => {
        pending = result.current.onAskOllama("why crash on launch");
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 80));
      });
      expect(result.current.thinkingSummary).toBe(THINKING_BLURB_PLACEHOLDER);

      await act(async () => {
        releaseStart();
        await pending;
      });
      expect(result.current.thinkingSummary).toBe("Woven line.");
    });

    it("falls back to the placeholder when the backend returns no opener", async () => {
      keepRequestPending(1, "why crash on launch");
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("why crash on launch");
      });

      expect(result.current.thinkingSummary).toBe(THINKING_BLURB_PLACEHOLDER);
    });

    it("keeps the current line when a poll carries no summary", async () => {
      vi.useFakeTimers();
      setRpcHandler("start_background_game_ai", () => ({
        accepted: true,
        status: "pending",
        request_id: 1,
        thinking_summary: "Reading crash tea leaves.",
      }));
      setRpcHandler("get_background_game_ai_status", () => ({
        ...idleBackgroundStatusFixture(),
        status: "pending",
        question: "why crash on launch",
        request_id: 1,
        thinking_summary: null,
      }));
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      let pending: Promise<void> | undefined;
      act(() => {
        pending = result.current.onAskOllama("why crash on launch");
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      await act(async () => {
        await pending;
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      expect(result.current.thinkingSummary).toBe("Reading crash tea leaves.");
    });

    it("keeps a lazy-opener summary visible rather than blanking the line", async () => {
      setRpcHandler("start_background_game_ai", () => ({
        accepted: true,
        status: "pending",
        request_id: 1,
        thinking_summary: "Sure.",
      }));
      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("why crash on launch");
      });

      expect(result.current.thinkingSummary).toBe("Sure.");
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
    it("aborts the backend request and clears the spinner without a cancel literal", async () => {
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
      expect(result.current.isAsking).toBe(false);
      // Nothing readable had streamed, so the body stays empty and the Stopped notice carries it.
      expect(result.current.ollamaResponse).toBe("");
      expect(result.current.askStopped).toBe(true);
    });

    /**
     * STREAM-04. Stop used to overwrite the body with "Request cancelled." and tear the poll down,
     * so the text the user was reading vanished on the press meant to keep it.
     */
    it("keeps the streamed partial when Stop lands mid-answer", async () => {
      vi.useFakeTimers();
      setRpcHandler("start_background_game_ai", () => ({ accepted: true, status: "pending", request_id: 6 }));
      let stopped = false;
      setRpcHandler("get_background_game_ai_status", () =>
        stopped
          ? {
              ...idleBackgroundStatusFixture(),
              status: "cancelled",
              question: "q",
              request_id: 6,
              cancelled: true,
              // What Plugin._cancelled_response_text kept.
              response: "Half an answer about the boss",
            }
          : {
              ...idleBackgroundStatusFixture(),
              status: "pending",
              question: "q",
              request_id: 6,
              streaming: true,
              partial_response: "Half an answer about the boss",
            }
      );
      setRpcHandler("abort_background_game_ai", () => {
        stopped = true;
        return { ok: true };
      });

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      let pending: Promise<void> | undefined;
      act(() => {
        pending = result.current.onAskOllama("q");
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
      await act(async () => {
        await pending;
      });
      expect(result.current.ollamaResponse).toBe("Half an answer about the boss");

      act(() => {
        result.current.onCancelAsk();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current.isAsking).toBe(false);
      expect(result.current.askStopped).toBe(true);
      expect(result.current.ollamaResponse).toBe("Half an answer about the boss");
      vi.useRealTimers();
    });

    it("stops applying poll results after cancelling", async () => {
      vi.useFakeTimers();
      setRpcHandler("start_background_game_ai", () => ({ accepted: true, status: "pending", request_id: 5 }));
      // Completes only *after* Stop, which is the case this guards: a terminal result already in
      // flight when the user pressed Stop must not land on the turn they ended.
      let stopped = false;
      setRpcHandler("get_background_game_ai_status", () =>
        stopped
          ? {
              ...idleBackgroundStatusFixture(),
              status: "completed",
              question: "q",
              request_id: 5,
              success: true,
              response: "answer that arrived too late",
            }
          : { ...idleBackgroundStatusFixture(), status: "pending", question: "q", request_id: 5 }
      );
      setRpcHandler("abort_background_game_ai", () => {
        stopped = true;
        return { ok: true };
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

      act(() => {
        result.current.onCancelAsk();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      // A completed result already in flight must not resurrect the answer the user stopped.
      expect(result.current.ollamaResponse).not.toContain("arrived too late");
      expect(result.current.askStopped).toBe(true);
      vi.useRealTimers();
    });
  });

  describe("session RAG preset chips", () => {
    const DREADNOUGHT = "How do I beat Glyphid Dreadnought?";

    function serveOneRagCandidate() {
      setRpcHandler("get_session_rag_chip_candidates", () => ({
        ok: true,
        candidates: [
          {
            text: DREADNOUGHT,
            category: "strategy",
            prefer_ask_mode: "strategy",
            domain: "strategy",
          },
        ],
      }));
    }

    /**
     * The mount reseed is one-shot, and both KB flags are at their UI defaults until
     * ``load_settings`` resolves. Spending the reseed on that pre-hydration render left
     * the carousel on static seeds for the whole session — no reopen could recover it,
     * because a reopen just re-ran the same race.
     *
     * ``devForceSessionRagChips`` is true from the first render on purpose: it pins the
     * roll at 1.0 without ever changing value, so the separate override effect never
     * fires and the mount reseed is the only thing that can produce this chip.
     */
    it("draws a RAG chip when the knowledge base arrives with the settings load", async () => {
      serveOneRagCandidate();

      const { result, rerender } = renderHook(
        (props: { settingsLoaded: boolean; useLocalKnowledgeBase: boolean }) =>
          useBonsaiAskOrchestration(makeArgs({ ...props, devForceSessionRagChips: true })),
        { initialProps: { settingsLoaded: false, useLocalKnowledgeBase: false } },
      );

      expect(
        getRpcCallLog().some((c) => c.method === "get_session_rag_chip_candidates"),
      ).toBe(false);

      await act(async () => {
        rerender({ settingsLoaded: true, useLocalKnowledgeBase: true });
      });

      expect(result.current.suggestedPrompts.map((p) => p.text)).toContain(DREADNOUGHT);
    });

    it("keeps static seeds when the knowledge base is off after settings load", async () => {
      serveOneRagCandidate();

      const { result } = renderHook(() =>
        useBonsaiAskOrchestration(
          makeArgs({
            settingsLoaded: true,
            useLocalKnowledgeBase: false,
            devForceSessionRagChips: true,
          }),
        ),
      );

      await act(async () => {});

      expect(result.current.suggestedPrompts.map((p) => p.text)).not.toContain(DREADNOUGHT);
      expect(
        getRpcCallLog().some((c) => c.method === "get_session_rag_chip_candidates"),
      ).toBe(false);
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

    it("stamps the archived turn with the AppID it was asked against", async () => {
      /*
       * The display-time spoiler unwrap reads this back off the turn. Without it, a history turn
       * has no AppID and re-fences boss tactics the user named — STRAT-SPOIL-DRG-01.
       */
      setRpcHandler("start_background_game_ai", () => ({
        accepted: true,
        status: "completed",
        success: true,
        response: "Focus the weak points.",
        request_id: 9,
        app_id: "2321470",
      }));

      const { result } = renderHook(() => useBonsaiAskOrchestration(makeArgs()));

      await act(async () => {
        await result.current.onAskOllama("How do I beat Glyphid Dreadnought?");
      });
      await act(async () => {
        await result.current.onAskOllama("second question");
      });

      expect(result.current.askThreadCollapsed[0]).toMatchObject({
        question: "How do I beat Glyphid Dreadnought?",
        appId: "2321470",
      });
    });
  });
});
