import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildBonsaiUiScaleInlineStyle,
  classifyUiScaleProfile,
  normalizeUiScaleProfileId,
  type UiScaleProfileId,
} from "../data/uiScaleProfile";

const VIEWPORT_DEBOUNCE_MS = 150;

export type UseUiScaleProfileOptions = {
  scopeRef: React.RefObject<HTMLDivElement | null>;
  autoEnabled: boolean;
  manualProfile: UiScaleProfileId;
  settingsLoaded: boolean;
  /** Increment from Settings Apply to soft-reload panels. */
  applyToken: number;
  onRemeasure?: () => void;
};

export type UseUiScaleProfileResult = {
  activeProfileId: UiScaleProfileId;
  appliedProfileId: UiScaleProfileId;
  scopeStyle: React.CSSProperties;
  generation: number;
  viewportWidthPx: number;
};

/**
 * Measures QAM viewport, classifies UI scale profile, and exposes scope CSS vars.
 * Auto mode updates live on resize; manual mode updates on Apply (applyToken).
 */
export function useUiScaleProfile(options: UseUiScaleProfileOptions): UseUiScaleProfileResult {
  const { scopeRef, autoEnabled, manualProfile, settingsLoaded, applyToken, onRemeasure } = options;
  const [viewportWidthPx, setViewportWidthPx] = useState(0);
  const [appliedProfileId, setAppliedProfileId] = useState<UiScaleProfileId>("handheld");
  const [generation, setGeneration] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRemeasureRef = useRef(onRemeasure);
  onRemeasureRef.current = onRemeasure;

  const activeProfileId = useMemo(
    () =>
      classifyUiScaleProfile({
        autoEnabled,
        manualProfile,
        viewportWidthPx,
        screenWidthPx: typeof window !== "undefined" ? window.screen?.width : 0,
        screenHeightPx: typeof window !== "undefined" ? window.screen?.height : 0,
      }),
    [autoEnabled, manualProfile, viewportWidthPx],
  );

  const measureViewport = useCallback(() => {
    const el = scopeRef.current;
    if (!el?.isConnected) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) {
      setViewportWidthPx(Math.round(w * 100) / 100);
    }
  }, [scopeRef]);

  useEffect(() => {
    const el = scopeRef.current;
    if (!el) return;
    measureViewport();
    const ro = new ResizeObserver(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        measureViewport();
      }, VIEWPORT_DEBOUNCE_MS);
    });
    ro.observe(el);
    const onWinResize = () => measureViewport();
    window.addEventListener("resize", onWinResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [scopeRef, measureViewport]);

  useEffect(() => {
    if (!settingsLoaded) return;
    const initial = autoEnabled ? activeProfileId : normalizeUiScaleProfileId(manualProfile);
    setAppliedProfileId(initial);
  }, [settingsLoaded, autoEnabled, manualProfile, activeProfileId]);

  useEffect(() => {
    if (!settingsLoaded || !autoEnabled) return;
    setAppliedProfileId(activeProfileId);
    requestAnimationFrame(() => onRemeasureRef.current?.());
  }, [settingsLoaded, autoEnabled, activeProfileId]);

  useEffect(() => {
    if (applyToken === 0) return;
    setAppliedProfileId(activeProfileId);
    setGeneration((g) => g + 1);
    requestAnimationFrame(() => onRemeasureRef.current?.());
  }, [applyToken, activeProfileId]);

  const scopeStyle = useMemo(
    () => buildBonsaiUiScaleInlineStyle(appliedProfileId),
    [appliedProfileId],
  );

  return {
    activeProfileId,
    appliedProfileId,
    scopeStyle,
    generation,
    viewportWidthPx,
  };
}
