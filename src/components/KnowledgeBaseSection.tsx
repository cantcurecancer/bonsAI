import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, ConfirmModal, Focusable, PanelSection, PanelSectionRow, ToggleField, showModal } from "@decky/ui";
import { toaster } from "@decky/api";
import { callDeckyWithTimeout, DECKY_RPC_TIMEOUT_MS, formatDeckyRpcError } from "../utils/deckyCall";
import { tryMoveUpWithPanelScroll } from "../utils/settingsPanelScroll";
import { SETTINGS_GLASS_BTN, SETTINGS_GLASS_BTN_DANGER } from "../styles/settingsGlassButton";

export type RagStorageOption = {
  id?: string;
  label?: string;
  install_path?: string;
  mount?: string;
  free_bytes?: number;
};

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
  embeddings_populated?: boolean;
  embed_model_available?: boolean;
  log_tail?: string[];
  storage_options?: {
    internal?: RagStorageOption;
    sd_card?: RagStorageOption | null;
  };
};

type Props = {
  useLocalKnowledgeBase: boolean;
  setUseLocalKnowledgeBase: (v: boolean) => void;
  ragCorpusVersion: string;
  ollamaIp: string;
  onBeforeDeckyModal: () => void;
  onCompleteDeckyModalClose: (close: () => void) => void;
  toggleHostRef?: React.RefObject<HTMLDivElement | null>;
  downloadBtnRef?: React.RefObject<HTMLButtonElement | null>;
  removeBtnRef?: React.RefObject<HTMLButtonElement | null>;
  onMoveUpToConnection?: () => boolean;
  onMoveDownFromRemove?: () => boolean;
};

const KB_UNAVAILABLE_SESSION_KEY = "bonsai_kb_unavailable_warned";
const KB_FAILURE_TOAST_KEY = "bonsai_kb_failure_toast";
const KB_NOMIC_HINT_SESSION_KEY = "bonsai_kb_nomic_hint_warned";

const deckNav = (handlers: Record<string, () => boolean | void>) =>
  handlers as unknown as Record<string, unknown>;

const formatFreeGb = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "unknown free space";
  return `~${Math.round(bytes / (1024 * 1024 * 1024))} GB free`;
};

type StoragePickerModalProps = {
  internal: RagStorageOption;
  sdCard: RagStorageOption | null | undefined;
  onPick: (installPath: string, storage: string) => void;
  onClose: () => void;
};

const RagCorpusStoragePickerModal: React.FC<StoragePickerModalProps> = ({
  internal,
  sdCard,
  onPick,
  onClose,
}) => (
  <ConfirmModal
    strTitle="Choose download location"
    strDescription={
      <div className="bonsai-prose" style={{ fontSize: 12, lineHeight: 1.45, color: "#cdd9e6", textAlign: "left" }}>
        <div style={{ marginBottom: 10 }}>
          Wiki-derived strategy cards and compat notes (~5 GB). No Ask text is uploaded.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="bonsai-settings-focus-btn-host" style={{ width: "100%" }}>
            <Focusable onOKButton={() => onPick(internal.install_path ?? "~/.bonsai/rag", "internal")}>
              <Button
                className="bonsai-settings-focus-btn"
                onClick={() => onPick(internal.install_path ?? "~/.bonsai/rag", "internal")}
                style={{ ...SETTINGS_GLASS_BTN, width: "100%" }}
              >
                Internal storage ({formatFreeGb(internal.free_bytes)})
              </Button>
            </Focusable>
          </div>
          {sdCard?.install_path ? (
            <div className="bonsai-settings-focus-btn-host" style={{ width: "100%" }}>
              <Focusable onOKButton={() => onPick(sdCard.install_path!, "sd_card")}>
                <Button
                  className="bonsai-settings-focus-btn"
                  onClick={() => onPick(sdCard.install_path!, "sd_card")}
                  style={{ ...SETTINGS_GLASS_BTN, width: "100%" }}
                >
                  SD card ({formatFreeGb(sdCard.free_bytes)})
                </Button>
              </Focusable>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "#9fb7d5", lineHeight: 1.35 }}>
              No SD card detected. Insert a microSD formatted for Steam Deck storage, then try again.
            </div>
          )}
        </div>
      </div>
    }
    bAlertDialog={true}
    strOKButtonText="Close"
    onOK={onClose}
  />
);

export const KnowledgeBaseSection: React.FC<Props> = ({
  useLocalKnowledgeBase,
  setUseLocalKnowledgeBase,
  ragCorpusVersion,
  ollamaIp,
  onBeforeDeckyModal,
  onCompleteDeckyModalClose,
  toggleHostRef,
  downloadBtnRef: downloadBtnRefProp,
  removeBtnRef: removeBtnRefProp,
  onMoveUpToConnection,
  onMoveDownFromRemove,
}) => {
  const [status, setStatus] = useState<RagCorpusStatus | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const primaryBtnRefLocal = useRef<HTMLButtonElement | null>(null);
  const removeBtnRef = useRef<HTMLButtonElement | null>(null);
  const toggleHostRefLocal = useRef<HTMLDivElement | null>(null);
  const toggleHost = toggleHostRef ?? toggleHostRefLocal;

  const focusPrimaryBtn = useCallback(() => {
    downloadBtnRefProp?.current?.focus();
    primaryBtnRefLocal.current?.focus();
    return true;
  }, [downloadBtnRefProp]);

  const focusKbToggle = useCallback((): boolean => {
    const host = toggleHost.current;
    const target = host?.querySelector<HTMLElement>("[tabindex], button, input");
    if (!target) return false;
    target.focus();
    return true;
  }, [toggleHost]);

  const focusRemoveBtn = useCallback((): boolean => {
    removeBtnRef.current?.focus();
    return Boolean(removeBtnRef.current);
  }, []);

  const handleMoveUpFromToggle = useCallback((): boolean => {
    return tryMoveUpWithPanelScroll(toggleHost.current, () => onMoveUpToConnection?.() ?? false);
  }, [onMoveUpToConnection, toggleHost]);

  const refreshStatus = useCallback(async () => {
    try {
      const st = await callDeckyWithTimeout<
        [{ pc_ip: string }],
        RagCorpusStatus
      >(
        "get_rag_corpus_status",
        [{ pc_ip: ollamaIp.trim() }],
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
      if (
        useLocalKnowledgeBase &&
        st?.installed &&
        st.embeddings_populated &&
        st.embed_model_available === false &&
        !sessionStorage.getItem(KB_NOMIC_HINT_SESSION_KEY)
      ) {
        sessionStorage.setItem(KB_NOMIC_HINT_SESSION_KEY, "1");
        toaster.toast({
          title: "Keyword + meaning search",
          body: "Install nomic-embed-text in Ollama for better strategy retrieval.",
          duration: 8000,
        });
      }
      return st;
    } catch {
      setStatus(null);
      return null;
    }
  }, [useLocalKnowledgeBase, ollamaIp]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus, ragCorpusVersion]);

  useEffect(() => {
    if (!downloadBusy) return;
    const id = window.setInterval(() => {
      void callDeckyWithTimeout<[{ pc_ip: string }], RagCorpusStatus>(
        "get_rag_corpus_status",
        [{ pc_ip: ollamaIp.trim() }],
        DECKY_RPC_TIMEOUT_MS,
      )
        .then((st) => {
          setStatus(st);
          if (st?.phase === "failed" && (st.error ?? "").trim()) {
            const errKey = `${st.error}|${st.stage ?? ""}`;
            if (sessionStorage.getItem(KB_FAILURE_TOAST_KEY) !== errKey) {
              sessionStorage.setItem(KB_FAILURE_TOAST_KEY, errKey);
              toaster.toast({
                title: "Knowledge base download failed",
                body: st.error,
                duration: 12000,
              });
            }
          }
          if (st?.done || st?.phase === "failed" || st?.phase === "done" || st?.phase === "cancelled") {
            setDownloadBusy(false);
            void refreshStatus();
          }
        })
        .catch(() => setDownloadBusy(false));
    }, 1500);
    return () => window.clearInterval(id);
  }, [downloadBusy, refreshStatus, ollamaIp]);

  const startDownload = async (installPath: string, storage: string) => {
    setDownloadBusy(true);
    try {
      const out = await callDeckyWithTimeout<
        [{ install_path: string; storage: string }],
        { accepted?: boolean; reason?: string }
      >("start_rag_corpus_download", [{ install_path: installPath, storage }], 15000);
      if (!out?.accepted) {
        setDownloadBusy(false);
        toaster.toast({
          title: "Download not started",
          body: out?.reason ?? "Could not start knowledge base download.",
          duration: 8000,
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
      const msg = formatDeckyRpcError(e);
      toaster.toast({ title: "Download failed", body: msg, duration: 8000 });
    }
  };

  const openStoragePicker = () => {
    onBeforeDeckyModal();
    const internal = status?.storage_options?.internal ?? { install_path: "~/.bonsai/rag" };
    const sdCard = status?.storage_options?.sd_card;
    const handle = showModal(
      <RagCorpusStoragePickerModal
        internal={internal}
        sdCard={sdCard}
        onPick={(installPath, storage) => {
          onCompleteDeckyModalClose(() => handle.Close());
          void startDownload(installPath, storage);
        }}
        onClose={() => onCompleteDeckyModalClose(() => handle.Close())}
      />,
    );
  };

  const runUpdate = () => {
    void callDeckyWithTimeout<[], { ok?: boolean; error?: string }>("update_rag_corpus", [], DECKY_RPC_TIMEOUT_MS)
      .then((out) => {
        if (out?.ok) {
          toaster.toast({
            title: "Update check",
            body: "Download started or already current.",
            duration: 4000,
          });
          setDownloadBusy(true);
        } else {
          toaster.toast({ title: "Update failed", body: out?.error ?? "Unknown error", duration: 8000 });
        }
      })
      .catch((e) => toaster.toast({ title: "Update failed", body: formatDeckyRpcError(e), duration: 8000 }));
  };

  const confirmRemove = () => {
    onBeforeDeckyModal();
    const handle = showModal(
      <ConfirmModal
        strTitle="Remove knowledge base?"
        strDescription={
          <div className="bonsai-prose" style={{ fontSize: 12, lineHeight: 1.45, color: "#cdd9e6", textAlign: "left" }}>
            Deletes the offline corpus from disk and turns off <strong>Use local knowledge base</strong>. Strategy
            cards will stop grounding until you download again.
          </div>
        }
        strOKButtonText="Remove"
        strCancelButtonText="Cancel"
        onOK={() => {
          onCompleteDeckyModalClose(() => handle.Close());
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
  const showNomicHint =
    useLocalKnowledgeBase &&
    installed &&
    status?.embeddings_populated === true &&
    status?.embed_model_available === false;

  const onPrimaryClick = installed ? runUpdate : openStoragePicker;

  return (
    <PanelSection title="Knowledge base (offline)">
      <PanelSectionRow>
        <div ref={toggleHost} className="bonsai-settings-bleed" style={{ width: "100%" }}>
          <ToggleField
            label="Use local knowledge base"
            description="Ground Strategy and troubleshooting Asks with downloaded offline cards (keyword or Keyword + meaning search)."
            checked={useLocalKnowledgeBase}
            onChange={(checked) => setUseLocalKnowledgeBase(checked)}
            {...deckNav({
              onMoveUp: () => handleMoveUpFromToggle(),
              onMoveDown: () => focusPrimaryBtn(),
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
            <>
              <span style={{ color: "#ffd299" }}>Not installed — download to enable grounded strategy help.</span>
              <span style={{ display: "block", marginTop: 6, color: "#9fb7d5" }}>
                Public download is not live yet. For Phase 1 QA: run <strong>build.ps1</strong> (deploys a seed
                corpus), enable <strong>Developer</strong> tab in Settings, then Developer →{" "}
                <strong>Install seed knowledge base</strong>.
              </span>
            </>
          )}
          {showNomicHint ? (
            <span style={{ display: "block", marginTop: 6, color: "#ffd299" }}>
              Install <strong>nomic-embed-text</strong> in Ollama for Keyword + meaning search.
            </span>
          ) : null}
          {progress ? <span style={{ display: "block", marginTop: 6 }}>{progress}</span> : null}
          {(status?.error ?? "").trim() ? (
            <span style={{ display: "block", marginTop: 6, color: "#ff9b9b" }}>{status?.error}</span>
          ) : null}
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <Focusable
          flow-children="horizontal"
          className="bonsai-settings-bleed"
          style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: 8, width: "100%" }}
        >
          <div className="bonsai-settings-focus-btn-host" style={{ flex: "1 1 auto", minWidth: 0 }}>
            <Focusable onOKButton={onPrimaryClick}>
              <Button
                ref={(el) => {
                  const btn = el as HTMLButtonElement | null;
                  if (downloadBtnRefProp) downloadBtnRefProp.current = btn;
                  primaryBtnRefLocal.current = btn;
                }}
                className="bonsai-settings-focus-btn"
                onClick={onPrimaryClick}
                disabled={downloadBusy}
                style={{ ...SETTINGS_GLASS_BTN, width: "100%" }}
                {...deckNav({
                  onMoveUp: () => focusKbToggle(),
                  onMoveDown: () => (installed ? focusRemoveBtn() : onMoveDownFromRemove?.() ?? false),
                  onMoveRight: () => (installed ? focusRemoveBtn() : false),
                })}
              >
                {downloadBusy
                  ? "Downloading…"
                  : installed
                    ? "Update knowledge base"
                    : "Download knowledge base"}
              </Button>
            </Focusable>
          </div>
          {installed ? (
            <div className="bonsai-settings-focus-btn-host">
              <Focusable onOKButton={confirmRemove}>
                <Button
                  ref={(el) => {
                    const btn = el as HTMLButtonElement | null;
                    removeBtnRef.current = btn;
                    if (removeBtnRefProp) {
                      removeBtnRefProp.current = btn;
                    }
                  }}
                  className="bonsai-settings-focus-btn"
                  onClick={confirmRemove}
                  disabled={downloadBusy}
                  style={SETTINGS_GLASS_BTN_DANGER}
                  {...deckNav({
                    onMoveUp: () => focusPrimaryBtn(),
                    onMoveLeft: () => focusPrimaryBtn(),
                    onMoveDown: () => onMoveDownFromRemove?.() ?? false,
                  })}
                >
                  Remove
                </Button>
              </Focusable>
            </div>
          ) : null}
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  );
};
