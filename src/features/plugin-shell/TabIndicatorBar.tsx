/**
 * Title: Collapsing tab bar
 * Purpose: The thin bar that replaces Steam's tab strip — one dash per mounted tab with the active
 *          one lit, the active tab's name beside the dashes, and LB / RB marks at the two ends —
 *          and the one focus stop that stands in for the strip.
 * Used for: index.tsx, mounted above `.bonsai-decky-tabs-root` while Steam's own header row is
 *           hidden by section-1.ts (plan 30, decisions D44 and D55).
 * Solves: Steam's strip cost 80.66px of the 701px column (measured 2026-09-02) and its icons never
 *         showed a name; this is 20px and always names the tab. With the strip hidden its buttons
 *         stayed in Steam's gamepad tree as invisible stops, so this bar takes the ring instead:
 *         Left/Right and LB/RB switch tabs, Down hands the ring to the current body, Up goes to
 *         Decky's Back button, and a trap bounces any landing on a hidden button back here.
 * Does not: Open into the full strip yet (W5), or switch tabs through Steam — `selectTab` from the
 *           shell owns the switch, and Steam's `Tabs` keeps owning LB / RB inside the bodies.
 */
import React, { useEffect, useRef, useState } from "react";
import { Focusable } from "@decky/ui";

import { registerNavFocus, type NavRefHolder } from "../../utils/navFocusRegistry";
import { registerModalReturnFocusOwner } from "./modalReturnFocusRegistry";
import { buildTabBarNavHandlers } from "./tabBarNav";
import { BONSAI_TAB_SHORT_NAMES, type BonsaiTabId } from "./tabTitles";
import { useHiddenTabHeaderTrap } from "./useHiddenTabHeaderTrap";

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

  /*
    `open` is true exactly while the bar's Focusable has the ring (plan 30 § 4.3: focus opens it,
    anything that takes the ring away closes it, no timer). Steam sets DOM focus on a `focusable`
    Focusable, which is what makes onFocus/onBlur fire here — the chat-slot row relies on the same
    pair for its `--focused` class, measured on device 2026-09-02 (the bar's marks hid on cue).
  */
  const [open, setOpen] = useState(false);

  const navRef = useRef<NavRefHolder["current"]>(null);
  useEffect(() => {
    registerNavFocus("tab-bar", navRef);
    return () => registerNavFocus("tab-bar", null);
  }, []);

  useHiddenTabHeaderTrap();

  const handlers = buildTabBarNavHandlers({ tabIds, currentTab, selectTab, exitDown });

  return (
    <Focusable
      /*
        The return-focus registry is handed this element itself, not a wrapper: `focusOwnerById`
        walks up to the nearest `.Panel.Focusable`, and this is the bar's own (the trap ChatSlotRow
        documents at its ref).
      */
      ref={(el: HTMLElement | null) => registerModalReturnFocusOwner("tab-bar", el)}
      className={`bonsai-tab-bar${open ? " bonsai-tab-bar--open" : ""}`}
      data-bonsai-tab-bar-state={open ? "open" : "rest"}
      data-bonsai-tab-bar-tab={current ?? ""}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
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
    </Focusable>
  );
}
