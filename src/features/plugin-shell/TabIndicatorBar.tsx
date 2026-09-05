/**
 * Title: Collapsing tab bar
 * Purpose: The thin bar that replaces Steam's tab strip — one dash per mounted tab with the active
 *          one lit, the active tab's name beside the dashes, LB / RB marks at the two ends — and the
 *          full strip of icons and names that floats over the panel while the bar holds the ring.
 * Used for: index.tsx, mounted above `.bonsai-decky-tabs-root` while Steam's own header row is
 *           hidden by section-1.ts (plan 30, decisions D44 and D55).
 * Solves: Steam's strip cost 80.66px of the 701px column (measured 2026-09-02) and its icons never
 *         showed a name; this is 20px and always names the tab. With the strip hidden its buttons
 *         stayed in Steam's gamepad tree as invisible stops, so this bar takes the ring instead:
 *         Left/Right and LB/RB switch tabs, Down hands the ring to the current body, Up goes to
 *         Decky's Back button, and a trap bounces any landing on a hidden button back here.
 * Does not: Switch tabs through Steam — `selectTab` from the shell owns the switch, and Steam's
 *           `Tabs` keeps owning LB / RB inside the bodies. Nor does it hold the strip open on a
 *           timer: it is open exactly while the bar has the ring, or while a tap opened it.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Focusable } from "@decky/ui";

import { registerNavFocus, type NavRefHolder } from "../../utils/navFocusRegistry";
import { getUiDocument } from "../../utils/uiDocument";
import { registerModalReturnFocusOwner } from "./modalReturnFocusRegistry";
import { buildTabBarNavHandlers } from "./tabBarNav";
import {
  BONSAI_TAB_SHORT_NAMES,
  bonsaiTabStripIcon,
  bonsaiTabStripLabel,
  type BonsaiTabId,
} from "./tabTitles";
import { isElementLike, useHiddenTabHeaderTrap } from "./useHiddenTabHeaderTrap";

/**
 * Is `target` inside `root`? Exported so its own test can construct both nodes directly rather than
 * through a render: `root` and `target` both come from the QuickAccess popup document in production,
 * a different realm than this module's own (SharedJSContext), and a normal jsdom render cannot
 * reproduce that split -- React needs `root` and its descendants in the same document to begin with,
 * which is exactly what makes them the same realm there. Duck-typed the same way as
 * `useHiddenTabHeaderTrap.ts`'s `isElementLike`, and for the same reason: `instanceof Node` is false
 * for a node born in a different realm than the one asking.
 */
export function isPointerInsideTabBar(root: HTMLElement | null, target: EventTarget | null): boolean {
  return !!root && isElementLike(target) && root.contains(target);
}

export type TabIndicatorBarProps = {
  /** The mounted tabs in strip order — five without Developer, six with. */
  tabIds: readonly BonsaiTabId[];
  /** `currentTab` from the plugin shell. An id that is not mounted lights nothing. */
  currentTab: string;
  /** The shell's `selectTab`: sets the tab and clears the post-picker lock. */
  selectTab: (id: string) => void;
  /** Hand the ring to the current tab's first stop; true when it moved. */
  exitDown: () => boolean;
};

export function TabIndicatorBar({ tabIds, currentTab, selectTab, exitDown }: TabIndicatorBarProps): React.ReactElement {
  const current = tabIds.find((id) => id === currentTab);
  const name = current ? BONSAI_TAB_SHORT_NAMES[current] : "";
  /* The static rule of plan 30 § 4.2: with Developer mounted, the two long names use their short forms. */
  const useShortForms = tabIds.includes("developer");

  /*
    Two ways to be open, no timer (plan 30 § 4.3). `focusOpen` is true exactly while the bar's
    Focusable has the ring: Steam sets DOM focus on a `focusable` Focusable, which is what makes
    onFocus/onBlur fire — the chat-slot row relies on the same pair, measured 2026-09-02.
    `touchOpen` is a tap on the thin bar; a tap on a cell or anywhere else closes it, and taking
    the ring closes it too, because the ring is then the truth.
  */
  const [focusOpen, setFocusOpen] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const open = focusOpen || touchOpen;

  const rootRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<NavRefHolder["current"]>(null);
  useEffect(() => {
    registerNavFocus("tab-bar", navRef);
    return () => registerNavFocus("tab-bar", null);
  }, []);

  useHiddenTabHeaderTrap();

  /*
    One `pointerdown` listener on the UI document while a tap holds the strip open, removed the
    moment it closes. Capture phase, so a tap on something that stops propagation still closes it.

    `evt.target` is a node from the QuickAccess popup document, and this module runs in
    SharedJSContext -- two different realms, each with its own `Node` constructor -- so
    `evt.target instanceof Node` was always false and every pointerdown closed the strip
    immediately, including one landing inside it. Same bug as useHiddenTabHeaderTrap.ts
    (runs/TAB-BAR-11-a-after-suspend-resume-hidden-button.json), same fix: duck-type instead
    (isPointerInsideTabBar above).
  */
  useEffect(() => {
    if (!touchOpen) return;
    const doc = getUiDocument();
    const onPointerDown = (evt: Event) => {
      if (isPointerInsideTabBar(rootRef.current, evt.target)) return;
      setTouchOpen(false);
    };
    doc.addEventListener("pointerdown", onPointerDown, true);
    return () => doc.removeEventListener("pointerdown", onPointerDown, true);
  }, [touchOpen]);

  const handlers = buildTabBarNavHandlers({ tabIds, currentTab, selectTab, exitDown });

  const onRootClick = useCallback(() => {
    // A tap on the thin bar opens it. While the ring is on the bar it is open already, and A is
    // deliberately a no-op there (Left/Right did the switching), so the click changes nothing.
    if (!focusOpen) setTouchOpen(true);
  }, [focusOpen]);

  const onCellClick = useCallback(
    (id: BonsaiTabId) => (evt: React.MouseEvent) => {
      evt.stopPropagation();
      selectTab(id);
      setTouchOpen(false);
    },
    [selectTab],
  );

  return (
    <Focusable
      /*
        The return-focus registry is handed this element itself, not a wrapper: `focusOwnerById`
        walks up to the nearest `.Panel.Focusable`, and this is the bar's own (the trap ChatSlotRow
        documents at its ref).
      */
      ref={(el: HTMLElement | null) => {
        rootRef.current = el;
        registerModalReturnFocusOwner("tab-bar", el);
      }}
      className={`bonsai-tab-bar${open ? " bonsai-tab-bar--open" : ""}`}
      aria-label={name ? `${name} tab` : "Tabs"}
      data-bonsai-tab-bar-state={open ? "open" : "rest"}
      data-bonsai-tab-bar-tab={current ?? ""}
      onFocus={() => {
        setFocusOpen(true);
        setTouchOpen(false);
      }}
      onBlur={() => setFocusOpen(false)}
      onClick={onRootClick}
      {...({
        navRef,
        /*
          Steam treats a Focusable with no focusable children as a container and skips it; the
          bar's children are plain spans, so this marks it as a stop (ChatSlotRow.tsx, measured
          2026-08-30).
        */
        focusable: true,
        onMoveLeft: handlers.onMoveLeft,
        onMoveRight: handlers.onMoveRight,
        onMoveUp: handlers.onMoveUp,
        onMoveDown: handlers.onMoveDown,
        onButtonDown: handlers.onButtonDown,
      } as Record<string, unknown>)}
    >
      {/*
        The marks are the one on-screen reminder that the shoulder buttons switch tabs. They hide
        (visibility, never display, so nothing shifts) while the chat-slot row holds the ring,
        because there the bumpers cycle slots instead — section-6.ts, same rule as Steam's hints.
      */}
      <span className="bonsai-tab-bar__shoulder bonsai-tab-bar__shoulder--l" aria-hidden="true">
        LB
      </span>
      <span className="bonsai-tab-bar__dashes" aria-hidden="true">
        {tabIds.map((id) => (
          <span
            key={id}
            className={`bonsai-tab-bar__dash${id === current ? " bonsai-tab-bar__dash--active" : ""}`}
            data-bonsai-tab={id}
          />
        ))}
      </span>
      <span className="bonsai-tab-bar__name">{name}</span>
      <span className="bonsai-tab-bar__shoulder bonsai-tab-bar__shoulder--r" aria-hidden="true">
        RB
      </span>
      {/*
        The open strip: absolutely positioned over the panel, so nothing below moves (plan 30
        § 4.2). Always in the markup so opening and closing are a fade, never a mount; visibility
        keeps a closed strip out of hit-testing. The cells are not focus stops — the bar is the
        one stop and the lit cell is state — so they are plain elements for touch only.
      */}
      <div
        className={`bonsai-tab-bar__strip${open ? " bonsai-tab-bar__strip--open" : ""}`}
        aria-hidden={!open}
      >
        <span className="bonsai-tab-bar__shoulder bonsai-tab-bar__shoulder--l" aria-hidden="true">
          LB
        </span>
        {tabIds.map((id) => (
          <div
            key={id}
            role="button"
            tabIndex={-1}
            className={`bonsai-tab-bar__cell${id === current ? " bonsai-tab-bar__cell--active" : ""}`}
            data-bonsai-tab={id}
            onClick={onCellClick(id)}
          >
            <span className="bonsai-tab-bar__cell-icon" aria-hidden="true">
              {bonsaiTabStripIcon(id)}
            </span>
            <span className="bonsai-tab-bar__cell-label">{bonsaiTabStripLabel(id, useShortForms)}</span>
          </div>
        ))}
        <span className="bonsai-tab-bar__shoulder bonsai-tab-bar__shoulder--r" aria-hidden="true">
          RB
        </span>
      </div>
    </Focusable>
  );
}
