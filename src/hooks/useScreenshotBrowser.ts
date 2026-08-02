/**
 * Title: Screenshot browser hook
 * Purpose: List, capture, dedupe, and attach recent game screenshots for Ask with session survival.
 * Used for: MainTab media attach flow and screenshot browser modal.
 * Solves: Screenshot picker state across Decky modal unmount with permission-aware RPC.
 * Does not: Upload or analyze images — backend list_recent_screenshots and Ask attachment pipeline.
 */
import { useCallback, useRef, useState } from "react";
import { toaster } from "@decky/api";
import { Navigation, Router } from "@decky/ui";
import type { AskAttachment, ScreenshotItem } from "../types/bonsaiUi";
import { callDeckyWithTimeout, formatDeckyRpcError } from "../utils/deckyCall";
import { peekBonsaiSessionPendingRestore } from "../utils/bonsaiSessionSurvival";

type RecentScreenshotsResponse = {
  success: boolean;
  items: ScreenshotItem[];
  error?: string;
};

/** De-duplicate screenshot rows: prefer Steam folder entries over plugin capture mirrors. */
function dedupeScreenshotItems(items: ScreenshotItem[]): ScreenshotItem[] {
  const captureTimestampKey = (item: ScreenshotItem): string => {
    const fromName = /(\d{8}-\d{6})/.exec(item.name)?.[1];
    if (fromName) return fromName;
    const fromPath = /(\d{8}-\d{6})/.exec(item.path)?.[1];
    return fromPath ?? `${item.path}|${item.mtime}|${item.size_bytes ?? 0}`;
  };
  const byKey = new Map<string, ScreenshotItem>();
  const order: string[] = [];
  for (const item of items) {
    const key = captureTimestampKey(item);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      order.push(key);
      continue;
    }
    const preferNew =
      (existing.source !== "steam_recent" && item.source === "steam_recent") ||
      (existing.name.startsWith("bonsai-game-") && !item.name.startsWith("bonsai-game-"));
    if (preferNew) {
      byKey.set(key, item);
    }
  }
  return order.map((key) => byKey.get(key)!);
}

export type UseScreenshotBrowserOptions = {
  getIsAsking: () => boolean;
  mediaLibraryAccess: boolean;
  filesystemWrite: boolean;
};

export function useScreenshotBrowser({
  getIsAsking,
  mediaLibraryAccess,
  filesystemWrite,
}: UseScreenshotBrowserOptions) {
  const [isScreenshotBrowserOpen, setIsScreenshotBrowserOpen] = useState(
    () => peekBonsaiSessionPendingRestore()?.isScreenshotBrowserOpen ?? false,
  );
  const [mediaError, setMediaError] = useState(
    () => peekBonsaiSessionPendingRestore()?.mediaError ?? "",
  );
  const [recentScreenshots, setRecentScreenshots] = useState<ScreenshotItem[]>(
    () => peekBonsaiSessionPendingRestore()?.recentScreenshots ?? [],
  );
  const [isLoadingRecentScreenshots, setIsLoadingRecentScreenshots] = useState(
    () => peekBonsaiSessionPendingRestore()?.isLoadingRecentScreenshots ?? false,
  );
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<AskAttachment | null>(
    () => peekBonsaiSessionPendingRestore()?.selectedAttachment ?? null,
  );
  const screenshotBrowserHostRef = useRef<HTMLDivElement>(null);

  const loadRecentScreenshots = useCallback(async (limit: number = 24) => {
    const runningApp = Router.MainRunningApp;
    const appId = runningApp?.appid?.toString() ?? "";
    setIsLoadingRecentScreenshots(true);
    setMediaError("");
    try {
      const response = await callDeckyWithTimeout<[string, number], RecentScreenshotsResponse>(
        "list_recent_screenshots",
        [appId, limit],
      );
      if (response.success) {
        const rawItems = response.items ?? [];
        setRecentScreenshots(dedupeScreenshotItems(rawItems));
      } else {
        setRecentScreenshots([]);
        setMediaError(response.error ?? "Failed to list recent screenshots.");
      }
    } catch (e: unknown) {
      setRecentScreenshots([]);
      setMediaError(formatDeckyRpcError(e));
    } finally {
      setIsLoadingRecentScreenshots(false);
    }
  }, []);

  const onTakeScreenshot = useCallback(async () => {
    if (getIsAsking() || isCapturingScreenshot) return;
    setMediaError("");
    if (!mediaLibraryAccess && !filesystemWrite) {
      const permissionMsg =
        "Enable Read game & screenshot context in Permissions to save game screenshots.";
      setMediaError(permissionMsg);
      toaster.toast({ title: "Screenshot not saved", body: permissionMsg, duration: 4500 });
      return;
    }
    const runningApp = Router.MainRunningApp;
    const appId = runningApp?.appid?.toString() ?? "";
    setIsCapturingScreenshot(true);
    try {
      const rpcPromise = callDeckyWithTimeout<
        [string],
        { success?: boolean; item?: ScreenshotItem; error?: string }
      >("take_steam_screenshot", [appId]);
      Navigation.CloseSideMenus();
      const response = await rpcPromise;
      if (!response?.success || !response.item?.path) {
        const failMsg = response?.error ?? "Could not save a game screenshot.";
        setMediaError(failMsg);
        toaster.toast({
          title: "Screenshot not saved",
          body: failMsg,
          duration: 5500,
        });
        return;
      }
      setMediaError("");
      toaster.toast({
        title: "Screenshot saved",
        body: "Find it under Attach → Attach recent screenshot.",
        duration: 3200,
      });
      await loadRecentScreenshots(24);
    } catch (e: unknown) {
      const errMsg = formatDeckyRpcError(e);
      setMediaError(errMsg);
      toaster.toast({
        title: "Screenshot not saved",
        body: errMsg,
        duration: 5500,
      });
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [getIsAsking, isCapturingScreenshot, mediaLibraryAccess, filesystemWrite, loadRecentScreenshots]);

  const onOpenScreenshotBrowser = useCallback(async () => {
    if (getIsAsking()) return;
    setIsScreenshotBrowserOpen(true);
    setMediaError("");
    if (!mediaLibraryAccess) {
      setMediaError("Enable Media library access in Permissions to attach screenshots.");
      return;
    }
    await loadRecentScreenshots(24);
  }, [getIsAsking, mediaLibraryAccess, loadRecentScreenshots]);

  const onCloseScreenshotBrowser = useCallback(() => {
    setIsScreenshotBrowserOpen(false);
    setMediaError("");
  }, []);

  const onSelectRecentScreenshot = useCallback((item: ScreenshotItem) => {
    setSelectedAttachment({
      path: item.path,
      name: item.name,
      source: "recent",
      preview_data_uri: item.preview_data_uri,
      size_bytes: item.size_bytes,
      app_id: item.app_id,
    });
    setIsScreenshotBrowserOpen(false);
    setMediaError("");
    toaster.toast({
      title: "Screenshot attached",
      body: "Recent screenshot ready for your next Ask.",
      duration: 2800,
    });
  }, []);

  const restoreScreenshotBrowserSnapshot = useCallback(
    (snap: {
      selectedAttachment: AskAttachment | null;
      isScreenshotBrowserOpen: boolean;
      mediaError: string;
      recentScreenshots: ScreenshotItem[];
      isLoadingRecentScreenshots: boolean;
    }) => {
      setSelectedAttachment(snap.selectedAttachment);
      setIsScreenshotBrowserOpen(snap.isScreenshotBrowserOpen);
      setMediaError(snap.mediaError);
      setRecentScreenshots(snap.recentScreenshots);
      setIsLoadingRecentScreenshots(snap.isLoadingRecentScreenshots);
    },
    [],
  );

  return {
    screenshotBrowserHostRef,
    isScreenshotBrowserOpen,
    mediaError,
    recentScreenshots,
    isLoadingRecentScreenshots,
    isCapturingScreenshot,
    selectedAttachment,
    setSelectedAttachment,
    setMediaError,
    loadRecentScreenshots,
    onTakeScreenshot,
    onOpenScreenshotBrowser,
    onCloseScreenshotBrowser,
    onSelectRecentScreenshot,
    restoreScreenshotBrowserSnapshot,
  };
}
