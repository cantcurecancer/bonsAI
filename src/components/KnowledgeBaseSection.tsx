import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, ConfirmModal, PanelSection, PanelSectionRow, ToggleField, showModal } from "@decky/ui";
import { toaster } from "@decky/api";
import { callDeckyWithTimeout, DECKY_RPC_TIMEOUT_MS, formatDeckyRpcError } from "../utils/deckyCall";

export type RagCorpusStatus = {
  phase?: string;
  stage?: string;
  progress_pct?: number;
  bytes_downloaded?: number;
  bytes_total?: number;
  error?: string;
  done?: boolean;
  installed?: boolean;
  corpus_path?: string;
  corpus_version?: string;
  use_local_knowledge_base?: boolean;
  log_tail?: string[];
};

type Props = {
  useLocalKnowledgeBase: boolean;
  setUseLocalKnowledgeBase: (v: boolean) => void;
  ragCorpusVersion: string;
  onBeforeDeckyModal: () => void;
  onCompleteDeckyModalClose: (close: () => void) => void;
  toggleHostRef?: React.RefObject<HTMLDivElement | null>;
  downloadBtnRef?: React.RefObject<HTMLButtonElement | null>;
  onMoveUpToConnection?: () => boolean;
  onMoveDownFromRemove?: () => boolean;
};

const KB_UNAVAILABLE_SESSION_KEY = "bonsai_kb_unavailable_warned";
const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

export const KnowledgeBaseSection: React.FC<Props> = ({
  useLocalKnowledgeBase,
  setUseLocalKnowledgeBase,
  ragCorpusVersion,
  onBeforeDeckyModal,
  onCompleteDeckyModalClose,
  toggleHostRef,
  downloadBtnRef: downloadBtnRefProp,
  onMoveUpToConnection,
  onMoveDownFromRemove,
}) => {
  const [status, setStatus] = useState<RagCorpusStatus | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const downloadBtnRefLocal = useRef<HTMLButtonElement | null>(null);
  const updateBtnRef = useRef<HTMLButtonElement | null>(null);
  const removeBtnRef = useRef<HTMLButtonElement | null>(null);
  const toggleHostRefLocal = useRef<HTMLDivElement | null>(null);
  const toggleHost = toggleHostRef ?? toggleHostRefLocal;

  const focusDownloadBtn = useCallback(() => {
    downloadBtnRefProp?.current?.focus();
    downloadBtnRefLocal.current?.focus();
    return true;
  }, [downloadBtnRefProp]);

  const refreshStatus = useCallback(async () => {
    try {
      const st = await callDeckyWithTimeout<[], RagCorpusStatus>(
        "get_rag_corpus_status",
        [],
        DECKY_RPC_TIMEOUT_MS,
      );
      setStatus(st);
      if (
        useLocalKnowledgeBase &&
        st &&
        !st.installed &&
        !sessionStorage.getItem(KB_UNAVAILABLE_SESSION_KEY)
      ) {
        sessionStorage.setItem(KB_UNAVAILABLE_SESSION_KEY, "1");
        toaster.toast({
          title: "Knowledge base unavailable",
          body: "Strategy cards are off until you download the corpus or turn off Use local knowledge base.",
          duration: 6000,
        });
      }
      return st;
    } catch {
      setStatus(null);
      return null;
    }
  }, [useLocalKnowledgeBase]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus, ragCorpusVersion]);

  useEffect(() => {
    if (!downloadBusy) return;
    const id = window.setInterval(() => {
      void callDeckyWithTimeout<[], RagCorpusStatus>("get_rag_corpus_status", [], DECKY_RPC_TIMEOUT_MS)
        .then((st) => {
          setStatus(st);
          if (st?.done || st?.phase === "failed" || st?.phase === "done" || st?.phase === "cancelled") {
            setDownloadBusy(false);
            void refreshStatus();
          }
        })
        .catch(() => setDownloadBusy(false));
    }, 1500);
    return () => window.clearInterval(id);
  }, [downloadBusy, refreshStatus]);

  const startDownload = async (installPath: string) => {
    setDownloadBusy(true);
    try {
      const out = await callDeckyWithTimeout<[{ install_path: string }], { accepted?: boolean; reason?: string }>(
        "start_rag_corpus_download",
        [{ install_path: installPath }],
        15000,
      );
      if (!out?.accepted) {
        setDownloadBusy(false);
        toaster.toast({
          title: "Download not started",
          body: out?.reason ?? "Could not start knowledge base download.",
          duration: 6000,
        });
        return;
      }
      toaster.toast({
        title: "Downloading knowledge base",
        body: "Large offline corpus (~5 GB). Stay on Wi‑Fi until finished.",
        duration: 6000,
      });
    } catch (e: unknown) {
      setDownloadBusy(false);
      toaster.toast({
        title: "Download failed",
        body: formatDeckyRpcError(e),
        duration: 6000,
      });
    }
  };

  const onDownloadClick = () => {
    onBeforeDeckyModal();
    const handle = showModal(
      <ConfirmModal
        strTitle="Download strategy knowledge base?"
        strDescription={
          <div className="bonsai-prose" style={{ fontSize: 12, lineHeight: 1.45, color: "#cdd9e6", textAlign: "left" }}>
            Downloads wiki-derived strategy cards and compat notes from Hugging Face (GitHub mirror fallback).
            No Ask text is uploaded. Requires ~5 GB free space on internal storage.
          </div>
        }
        strOKButtonText="Download to internal storage"
        strCancelButtonText="Cancel"
        onOK={() => {
          onCompleteDeckyModalClose(() => handle.Close());
          void startDownload("~/.bonsai/rag");
        }}
        onCancel={() => onCompleteDeckyModalClose(() => handle.Close())}
      />,
    );
  };

  const installed = status?.installed === true;
  const progress =
    downloadBusy && status?.bytes_total
      ? `${status.progress_pct ?? 0}% (${Math.round((status.bytes_downloaded ?? 0) / (1024 * 1024))} / ${Math.round(
          (status.bytes_total ?? 0) / (1024 * 1024),
        )} MB)`
      : null;

  return (
    <PanelSection title="Knowledge base (offline)">
      <PanelSectionRow>
        <div ref={toggleHost} className="bonsai-settings-bleed" style={{ width: "100%" }}>
          <ToggleField
            label="Use local knowledge base"
            description="Ground Strategy and troubleshooting Asks with downloaded offline cards (FTS5 search on Deck)."
            checked={useLocalKnowledgeBase}
            onChange={(checked) => setUseLocalKnowledgeBase(checked)}
            {...deckNav({
              onMoveUp: () => onMoveUpToConnection?.() ?? false,
              onMoveDown: () => focusDownloadBtn(),
            })}
          />
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div className="bonsai-prose bonsai-settings-bleed" style={{ fontSize: 11, color: "#9fb7d5", lineHeight: 1.4 }}>
          {installed ? (
            <>
              <span style={{ color: "#7dcea0", fontWeight: 600 }}>Installed</span>
              {ragCorpusVersion ? ` — version ${ragCorpusVersion}` : null}
              {status?.corpus_path ? (
                <span style={{ display: "block", marginTop: 4, color: "#8fa0b4" }}>{status.corpus_path}</span>
              ) : null}
            </>
          ) : (
            <span style={{ color: "#ffd299" }}>Not installed — download to enable grounded strategy help.</span>
          )}
          {progress ? <span style={{ display: "block", marginTop: 6 }}>{progress}</span> : null}
          {(status?.error ?? "").trim() ? (
            <span style={{ display: "block", marginTop: 6, color: "#ff9b9b" }}>{status?.error}</span>
          ) : null}
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <Button
          ref={(el) => {
            const btn = el as HTMLButtonElement | null;
            if (downloadBtnRefProp) downloadBtnRefProp.current = btn;
            downloadBtnRefLocal.current = btn;
          }}
          onClick={onDownloadClick}
          disabled={downloadBusy}
          style={{ width: "100%", minHeight: 36 }}
          {...deckNav({
            onMoveUp: () => {
              const host = toggleHost.current;
              const target = host?.querySelector<HTMLElement>("[tabindex], button, input");
              if (target) {
                target.focus();
                return true;
              }
              return false;
            },
            onMoveDown: () => {
              updateBtnRef.current?.focus();
              return true;
            },
          })}
        >
          {installed ? "Re-download knowledge base" : "Download knowledge base"}
        </Button>
      </PanelSectionRow>
      <PanelSectionRow>
        <Button
          ref={(el) => {
            updateBtnRef.current = el as HTMLButtonElement | null;
          }}
          onClick={() => {
            void callDeckyWithTimeout<[], { ok?: boolean; error?: string }>(
              "update_rag_corpus",
              [],
              DECKY_RPC_TIMEOUT_MS,
            )
              .then((out) => {
                if (out?.ok) {
                  toaster.toast({ title: "Update check", body: "Download started or already current.", duration: 4000 });
                  setDownloadBusy(true);
                } else {
                  toaster.toast({ title: "Update failed", body: out?.error ?? "Unknown error", duration: 5000 });
                }
              })
              .catch((e) =>
                toaster.toast({ title: "Update failed", body: formatDeckyRpcError(e), duration: 5000 }),
              );
          }}
          disabled={downloadBusy || !installed}
          style={{ width: "100%", minHeight: 36 }}
          {...deckNav({
            onMoveUp: () => {
              downloadBtnRefProp?.current?.focus();
              downloadBtnRefLocal.current?.focus();
              return true;
            },
            onMoveDown: () => {
              removeBtnRef.current?.focus();
              return true;
            },
          })}
        >
          Update knowledge
        </Button>
      </PanelSectionRow>
      <PanelSectionRow>
        <Button
          ref={(el) => {
            removeBtnRef.current = el as HTMLButtonElement | null;
          }}
          onClick={() => {
            void callDeckyWithTimeout<[], { ok?: boolean }>("remove_rag_corpus", [], DECKY_RPC_TIMEOUT_MS)
              .then(() => {
                setUseLocalKnowledgeBase(false);
                void refreshStatus();
                toaster.toast({ title: "Knowledge base removed", body: "Corpus deleted from disk.", duration: 3000 });
              })
              .catch((e) =>
                toaster.toast({ title: "Remove failed", body: formatDeckyRpcError(e), duration: 5000 }),
              );
          }}
          disabled={downloadBusy || !installed}
          style={{ width: "100%", minHeight: 36 }}
          {...deckNav({
            onMoveUp: () => {
              updateBtnRef.current?.focus();
              return true;
            },
            onMoveDown: () => onMoveDownFromRemove?.() ?? false,
          })}
        >
          Remove knowledge base
        </Button>
      </PanelSectionRow>
    </PanelSection>
  );
};
