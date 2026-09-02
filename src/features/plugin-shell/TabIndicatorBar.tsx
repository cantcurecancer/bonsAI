/**
 * Title: Collapsing tab bar
 * Purpose: The thin bar that replaces Steam's tab strip — one dash per mounted tab with the active
 *          one lit, the active tab's name beside the dashes, and LB / RB marks at the two ends.
 * Used for: index.tsx, mounted above `.bonsai-decky-tabs-root` while Steam's own header row is
 *           hidden by section-1.ts (plan 30, decision D44).
 * Solves: Steam's strip cost 80.66px of the 701px column (measured 2026-09-02) and its icons never
 *         showed a name; this is 20px and always names the tab.
 * Does not: Take the ring, open into the full strip, or switch tabs — W4 makes it a focus stop, W5
 *           adds the open state, and Steam's `Tabs` keeps owning LB / RB underneath.
 */
import React from "react";

import { BONSAI_TAB_SHORT_NAMES, type BonsaiTabId } from "./tabTitles";

export type TabIndicatorBarProps = {
  /** The mounted tabs in strip order — five without Developer, six with. */
  tabIds: readonly BonsaiTabId[];
  /** `currentTab` from the plugin shell. An id that is not mounted lights nothing. */
  currentTab: string;
};

export function TabIndicatorBar({ tabIds, currentTab }: TabIndicatorBarProps): React.ReactElement {
  const current = tabIds.find((id) => id === currentTab);
  const name = current ? BONSAI_TAB_SHORT_NAMES[current] : "";
  return (
    <div
      className="bonsai-tab-bar"
      data-bonsai-tab-bar-state="rest"
      data-bonsai-tab-bar-tab={current ?? ""}
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
    </div>
  );
}
