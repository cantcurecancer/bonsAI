/**
 * Title: QAM panel height guard
 * Purpose: Pin Steam QAM tab pane height and flex column chain to prevent gamescope panel sag on hover.
 * Used for: index.tsx `.bonsai-scope` alongside useTabStripBodyOffset.
 * Solves: Shrinking or jumping QAM content area when pointer enters the plugin panel. Also keeps
 *         the ResizeObserver pointed at the live TabContentsScroll, which Steam replaces on every
 *         tab switch.
 * Does not: Measure tab strip reserve — see useTabStripBodyOffset and tabBodyViewport.
 */
import { useLayoutEffect, useRef } from "react";
import { syncTabBodyViewportHeight } from "../utils/tabBodyViewport";

const QAM_HOST_MIN_PX = 320;
const QAM_HOST_MAX_PX = 1200;
const CRUSHED_SCOPE_MAX_PX = 160;
const LOCK_SAG_TOLERANCE_PX = 8;

const TAB_CONTENTS_SELECTOR = '.bonsai-decky-tabs-root [class*="TabContentsScroll"]';

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

    const ro = new ResizeObserver(() => {
      syncTabBodyViewportHeight(scope);
    });
    ro.observe(scope);

    /*
      Steam replaces the TabContentsScroll node on every tab switch — measured on device
      2026-08-07, node identity changed on all five captured transitions. Observing whatever
      node happened to exist at mount meant the ResizeObserver watched a detached element from
      the first switch onward, so `--bonsai-tab-body-height` stopped tracking content and
      section-3 pinned the pane to a stale pixel value. Re-resolve instead of assuming.
    */
    let observedContents: Element | null = null;
    const structureObserver = new MutationObserver(() => {
      // O(1) guard: the node is only re-resolved when the one we hold actually went away,
      // so ordinary DOM churn costs a boolean read.
      if (observedContents?.isConnected) return;
      resyncTabContents();
    });

    function resyncTabContents(): void {
      const next = scope!.querySelector(TAB_CONTENTS_SELECTOR);
      if (next !== observedContents) {
        if (observedContents) ro.unobserve(observedContents);
        observedContents = next;
        if (next) {
          ro.observe(next);
          syncTabBodyViewportHeight(scope!);
        }
      }

      /*
        Watch the ancestor chain for the replacement, childList only and deliberately WITHOUT
        subtree. The swap shows up as a childList mutation on whichever ancestor owns the
        replaced node, and every ancestor between the tabs root and the pane is covered — while
        nothing inside TabContentsScroll is, so a streaming transcript does not generate a
        mutation record per token just to keep this observer honest.
      */
      structureObserver.disconnect();
      const tabsRoot = scope!.querySelector(".bonsai-decky-tabs-root");
      if (!tabsRoot) return;
      structureObserver.observe(tabsRoot, { childList: true });
      let node: Element | null = observedContents;
      while (node && node !== tabsRoot) {
        const parent: Element | null = node.parentElement;
        if (!parent) break;
        structureObserver.observe(parent, { childList: true });
        node = parent;
      }
    }

    const scheduleSettle = () => {
      cancelAnimationFrame(settleRaf);
      settleRaf = requestAnimationFrame(() => {
        settleRaf = requestAnimationFrame(() => {
          applyLock();
          // The tabs subtree may not exist yet at mount; this is the catch-up pass.
          resyncTabContents();
        });
      });
    };

    applyLock();
    resyncTabContents();
    scheduleSettle();

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
      structureObserver.disconnect();
      scope.removeEventListener("pointerenter", onPointer);
      scope.removeEventListener("pointermove", onPointer);
    };
  }, [scopeRef]);
}
