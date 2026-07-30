/**
 * Title: QAM panel height guard
 * Purpose: Pin Steam QAM tab pane height and flex column chain to prevent gamescope panel sag on hover.
 * Used for: index.tsx `.bonsai-scope` alongside useTabStripBodyOffset.
 * Solves: Shrinking or jumping QAM content area when pointer enters the plugin panel.
 * Does not: Measure tab strip reserve — see useTabStripBodyOffset and tabBodyViewport.
 */
import { useLayoutEffect, useRef } from "react";
import { syncTabBodyViewportHeight } from "../utils/tabBodyViewport";

const QAM_HOST_MIN_PX = 320;
const QAM_HOST_MAX_PX = 1200;
const CRUSHED_SCOPE_MAX_PX = 160;
const LOCK_SAG_TOLERANCE_PX = 8;

function isTabPaneHost(el: HTMLElement): boolean {
  return (el.className?.toString() ?? "").includes("tab_");
}

/** Walk up from scope and return the Steam QAM tab pane (tab_*), not outer Panel wrappers. */
export function findQamTabHost(scope: HTMLElement): HTMLElement | null {
  let panelFallback: HTMLElement | null = null;
  let el: HTMLElement | null = scope.parentElement;
  while (el && el !== document.documentElement) {
    const h = el.clientHeight;
    if (h >= QAM_HOST_MIN_PX && h <= QAM_HOST_MAX_PX) {
      if (isTabPaneHost(el)) {
        return el;
      }
      if (!panelFallback && el.classList.contains("Panel")) {
        panelFallback = el;
      }
    }
    el = el.parentElement;
  }
  return panelFallback;
}

function pinElementHeight(el: HTMLElement, px: string): void {
  el.style.height = px;
  el.style.minHeight = px;
  el.style.maxHeight = px;
  el.style.overflow = "hidden";
  el.style.boxSizing = "border-box";
}

function pinFlexColumn(el: HTMLElement, px: string): void {
  pinElementHeight(el, px);
  el.style.display = "flex";
  el.style.flexDirection = "column";
}

function pinScopeChain(scope: HTMLElement, host: HTMLElement | null, px: string): void {
  scope.style.setProperty("--bonsai-qam-lock-height", px);
  scope.classList.add("bonsai-qam-height-locked");

  const qamHost = scope.parentElement;
  if (qamHost?.classList.contains("decky-qam-scope")) {
    pinFlexColumn(qamHost, px);
  }

  let walker: HTMLElement | null = scope.parentElement;
  while (walker && walker !== host) {
    if (walker.classList.contains("decky-qam-scope") || walker.classList.contains("Panel")) {
      pinFlexColumn(walker, px);
    } else {
      pinElementHeight(walker, px);
    }
    walker = walker.parentElement;
  }
}

/**
 * Bazzite / gamescope QAM can collapse `.bonsai-scope` to ~80px on pointer entry.
 * Lock scope to the stable QAM tab host height (~936px); never size from scroll content.
 */
export function useQamPanelHeightGuard(scopeRef: React.RefObject<HTMLDivElement | null>): void {
  const lockedHeightRef = useRef(0);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const applyLock = () => {
      const scopeH = scope.getBoundingClientRect().height;
      const host = findQamTabHost(scope);
      const hostH = host?.clientHeight ?? 0;
      const hostIsTab = host ? isTabPaneHost(host) : false;

      if (hostH >= QAM_HOST_MIN_PX && hostH <= QAM_HOST_MAX_PX && hostIsTab) {
        lockedHeightRef.current = hostH;
      } else if (
        !lockedHeightRef.current &&
        hostH >= QAM_HOST_MIN_PX &&
        hostH <= QAM_HOST_MAX_PX
      ) {
        lockedHeightRef.current = hostH;
      }

      const lockPx = lockedHeightRef.current;
      const crushed = scopeH < CRUSHED_SCOPE_MAX_PX && lockPx >= QAM_HOST_MIN_PX;
      const sagged = lockPx >= QAM_HOST_MIN_PX && scopeH < lockPx - LOCK_SAG_TOLERANCE_PX;
      const needsLock = crushed || sagged;
      const layoutStable = scopeH >= CRUSHED_SCOPE_MAX_PX;

      if (lockPx >= QAM_HOST_MIN_PX && (needsLock || layoutStable)) {
        pinScopeChain(scope, host, `${lockPx}px`);
      }
      syncTabBodyViewportHeight(scope);
    };

    let raf = 0;
    let settleRaf = 0;

    const scheduleSettle = () => {
      cancelAnimationFrame(settleRaf);
      settleRaf = requestAnimationFrame(() => {
        settleRaf = requestAnimationFrame(() => applyLock());
      });
    };

    applyLock();
    scheduleSettle();

    const ro = new ResizeObserver(() => {
      syncTabBodyViewportHeight(scope);
    });
    ro.observe(scope);
    const tabContents = scope.querySelector('[class*="TabContentsScroll"]');
    if (tabContents) ro.observe(tabContents);

    const onPointer = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => applyLock());
    };
    scope.addEventListener("pointerenter", onPointer);
    scope.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(settleRaf);
      ro.disconnect();
      scope.removeEventListener("pointerenter", onPointer);
      scope.removeEventListener("pointermove", onPointer);
    };
  }, [scopeRef]);
}
