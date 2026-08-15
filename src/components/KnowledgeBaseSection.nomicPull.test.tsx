/**
 * Behavior tests for the nomic-embed-text pull button.
 *
 * The hint telling a user to "install nomic-embed-text" used to be text only — no
 * button, no link, nothing to press. These assert the fix: a button appears exactly
 * when the hint would have shown, and pressing it calls the same pull_ollama_models
 * RPC the Pull Models modal already uses, with the model tag it exists to install.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { KnowledgeBaseSection } from "./KnowledgeBaseSection";
import { getRpcCallLog, ragCorpusStatusFixture, resetFakeDeckyRpc, setRpcHandler } from "../test-harness/fakeDeckyRpc";

function renderInstalled(overrides: Record<string, unknown> = {}) {
  setRpcHandler("get_rag_corpus_status", () =>
    ragCorpusStatusFixture({
      installed: true,
      corpus_version: "1.0.0",
      embeddings_populated: true,
      embed_model_available: false,
      ...overrides,
    }),
  );
  return render(
    <KnowledgeBaseSection
      useLocalKnowledgeBase={true}
      setUseLocalKnowledgeBase={() => {}}
      ragCorpusVersion="1.0.0"
      ollamaIp="127.0.0.1"
      onBeforeDeckyModal={() => {}}
      onCompleteDeckyModalClose={(close) => close()}
    />,
  );
}

const pullCalls = () => getRpcCallLog().filter((c) => c.method === "pull_ollama_models");

describe("KnowledgeBaseSection nomic-embed-text pull", () => {
  beforeEach(() => {
    resetFakeDeckyRpc();
  });

  it("shows a Pull button when hybrid vectors exist but the embed model is unavailable", async () => {
    renderInstalled();
    expect(await screen.findByText("Pull nomic-embed-text")).toBeTruthy();
  });

  it("does not show the button once the embed model is available", async () => {
    renderInstalled({ embed_model_available: true });
    await screen.findByText("Installed");
    expect(screen.queryByText("Pull nomic-embed-text")).toBeNull();
  });

  it("does not show the button when the corpus has no baked vectors at all", async () => {
    renderInstalled({ embeddings_populated: false, embed_model_available: false });
    await screen.findByText("Installed");
    expect(screen.queryByText("Pull nomic-embed-text")).toBeNull();
  });

  it("calls pull_ollama_models with the nomic-embed-text tag when pressed", async () => {
    renderInstalled();
    const button = await screen.findByText("Pull nomic-embed-text");

    fireEvent.click(button);

    await screen.findByText("Starting…");
    expect(pullCalls()).toHaveLength(1);
    expect(pullCalls()[0].args).toEqual([["nomic-embed-text"]]);
  });

  it("re-enables the button after the pull request resolves", async () => {
    renderInstalled();
    const button = await screen.findByText("Pull nomic-embed-text");

    fireEvent.click(button);
    await screen.findByText("Starting…");

    await screen.findByText("Pull nomic-embed-text");
  });
});
