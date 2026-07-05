import React, { useCallback } from "react";
import { toaster } from "@decky/api";
import { Button, Focusable } from "@decky/ui";
import type { ScreenshotItem } from "../types/bonsaiUi";
import { formatBytes, formatScreenshotTimestamp, toFileUri } from "../utils/mediaFormat";
import { readClipboardText, sanitizeClipboardStashText } from "../utils/clipboardStash";
import { formatDeckyRpcError } from "../utils/deckyCall";
import { BackChevronIcon, RefreshArrowIcon } from "./icons";

export type MainTabScreenshotBrowserProps = {
  fullBleedRowStyle: React.CSSProperties;
  presetButtonSurface: React.CSSProperties;
  screenshotBrowserHostRef: React.Ref<HTMLDivElement>;
  onCloseScreenshotBrowser: () => void;
  loadRecentScreenshots: (limit?: number) => Promise<void>;
  mediaError: string;
  mediaLibraryEnabled?: boolean;
  recentScreenshots: ScreenshotItem[];
  isLoadingRecentScreenshots: boolean;
  onSelectRecentScreenshot: (item: ScreenshotItem) => void;
  setUnifiedInput: React.Dispatch<React.SetStateAction<string>>;
};

export function MainTabScreenshotBrowser({
  fullBleedRowStyle,
  presetButtonSurface,
  screenshotBrowserHostRef,
  onCloseScreenshotBrowser,
  loadRecentScreenshots,
  mediaError,
  mediaLibraryEnabled = true,
  recentScreenshots,
  isLoadingRecentScreenshots,
  onSelectRecentScreenshot,
  setUnifiedInput,
}: MainTabScreenshotBrowserProps) {
  const onPasteClipboardStash = useCallback(async () => {
    try {
      const raw = await readClipboardText();
      const piece = sanitizeClipboardStashText(raw);
      if (!piece) {
        toaster.toast({ title: "Clipboard empty", body: "", duration: 2500 });
        return;
      }
      setUnifiedInput((prev) => {
        const base = (prev || "").trim();
        return base ? `${base}\n\n${piece}` : piece;
      });
      onCloseScreenshotBrowser();
      toaster.toast({ title: "Pasted from clipboard", body: "", duration: 2200 });
    } catch (e: unknown) {
      toaster.toast({ title: "Clipboard unavailable", body: formatDeckyRpcError(e), duration: 4000 });
    }
  }, [setUnifiedInput, onCloseScreenshotBrowser]);

  return (
    <Focusable
      className="bonsai-full-bleed-row"
      flow-children="vertical"
      ref={screenshotBrowserHostRef}
      onKeyDown={(ev: React.KeyboardEvent<HTMLDivElement>) => {
        if (ev.key === "Escape" || ev.key === "Backspace") {
          onCloseScreenshotBrowser();
          ev.preventDefault();
        }
      }}
      style={{
        ...fullBleedRowStyle,
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 8,
        background: "rgba(12, 18, 25, 0.96)",
        padding: 10,
        display: "grid",
        gap: 8,
        minHeight: 320,
        position: "relative",
      }}
    >
      <Focusable flow-children="horizontal" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          onClick={onCloseScreenshotBrowser}
          aria-label="Back"
          style={{ minWidth: 52, width: 52, minHeight: 34, padding: 0, ...presetButtonSurface }}
        >
          <BackChevronIcon size={20} />
        </Button>
        <Button
          onClick={() => {
            void onPasteClipboardStash();
          }}
          aria-label="Paste from clipboard into Ask field"
          style={{ minHeight: 34, padding: "0 12px", fontSize: 12, ...presetButtonSurface }}
        >
          Paste clipboard
        </Button>
        <Button
          onClick={() => {
            void loadRecentScreenshots(24);
          }}
          disabled={isLoadingRecentScreenshots || !mediaLibraryEnabled}
          aria-label="Refresh screenshots"
          style={{ minWidth: 52, width: 52, minHeight: 34, padding: 0, ...presetButtonSurface }}
        >
          <RefreshArrowIcon size={20} />
        </Button>
      </Focusable>

      {mediaError && (
        <div style={{ color: "#f09a8d", fontSize: 11, lineHeight: 1.35 }}>{mediaError}</div>
      )}

      {recentScreenshots.length === 0 && !isLoadingRecentScreenshots ? (
        <div style={{ color: "#9cb0c6", fontSize: 12, lineHeight: 1.4 }}>
          {mediaLibraryEnabled
            ? "No recent screenshots found. Open Steam Media and take a screenshot, then refresh — or use Paste clipboard."
            : "Paste clipboard into Ask, or enable Media library access in Permissions to attach screenshots."}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            alignContent: "start",
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {recentScreenshots.map((item) => (
            <Button
              key={item.path}
              onClick={() => onSelectRecentScreenshot(item)}
              style={{
                minHeight: 144,
                ...presetButtonSurface,
                padding: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                gap: 4,
                textAlign: "left",
              }}
            >
              <img
                src={item.preview_data_uri || toFileUri(item.path)}
                alt={item.name}
                style={{
                  width: "100%",
                  height: 94,
                  objectFit: "cover",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                }}
              />
              <span style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.name}
              </span>
              <span style={{ fontSize: 9, color: "#8ea2b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formatScreenshotTimestamp(item.mtime)}
              </span>
              <span style={{ fontSize: 10, color: "#d9e6f4", fontWeight: 700 }}>
                Size: {formatBytes(item.size_bytes ?? 0)}
              </span>
            </Button>
          ))}
        </div>
      )}
    </Focusable>
  );
}
