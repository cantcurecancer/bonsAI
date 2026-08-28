/**
 * Title: Decky tab titles
 * Purpose: Build the icon-only title element Decky renders for each bonsAI tab.
 * Used for: index.tsx tab assembly — one entry per tab id.
 * Solves: Keeps the shared title/icon wrapper markup in one place instead of per tab.
 * Does not: Decide which tabs exist or which is active — that is the shell's job.
 */
import React from "react";

import {
  AboutTabTitleIcon,
  BonsaiTreeTabIcon,
  BugIcon,
  GearIcon,
  LockIcon,
  OllamaTabIcon,
} from "../../components/icons";
import {
  TAB_TITLE_DEBUG_TAB_ICON_PX,
  TAB_TITLE_ICON_PX,
  TAB_TITLE_MAIN_TAB_ICON_PX,
} from "../unified-input/constants";

export type BonsaiTabId = "main" | "ollama" | "settings" | "permissions" | "developer" | "about";

/**
 * Every tab id, including ones not always mounted (Developer).
 * The scoped stylesheet emits one active-marker rule per id, so a new tab that is missing here
 * renders correctly but never shows the marker.
 */
export const ALL_BONSAI_TAB_IDS: readonly BonsaiTabId[] = [
  "main",
  "ollama",
  "settings",
  "permissions",
  "developer",
  "about",
];

/**
 * What each tab is called out loud. The titles are icons with no text, so without this a tab has no
 * accessible name of its own and anything reading labels falls back to the nearest text it can find
 * — which, on device 2026-08-28, was *the whole tab's contents*: a probe sitting on the Main tab
 * icon reported the chip carousel's text, so a chip looked focused when the D-pad was on the strip
 * above it. Screen readers hit the same wall. Short names, the way the tab is spoken about in the
 * UI, not sentences.
 */
export const BONSAI_TAB_ACCESSIBLE_NAMES: Readonly<Record<BonsaiTabId, string>> = {
  main: "Ask bonsAI",
  ollama: "Where AI runs",
  settings: "Settings",
  permissions: "Permissions",
  developer: "Developer",
  about: "About bonsAI",
};

export function bonsaiTabIconTitle(classSuffix: BonsaiTabId, children: React.ReactNode): React.ReactElement {
  return (
    <div className="bonsai-tab-title-leaf" aria-label={BONSAI_TAB_ACCESSIBLE_NAMES[classSuffix]}>
      <div className={`bonsai-tab-title-shell bonsai-tab-title-shell--${classSuffix}`}>
        <span className={`bonsai-tab-title-icon bonsai-tab-title-icon--${classSuffix}`}>{children}</span>
      </div>
    </div>
  );
}

export const DECKY_TAB_TITLES = {
  main: bonsaiTabIconTitle("main", <BonsaiTreeTabIcon size={TAB_TITLE_MAIN_TAB_ICON_PX} />),
  ollama: bonsaiTabIconTitle("ollama", <OllamaTabIcon size={TAB_TITLE_ICON_PX} />),
  settings: bonsaiTabIconTitle("settings", <GearIcon size={TAB_TITLE_ICON_PX} />),
  permissions: bonsaiTabIconTitle("permissions", <LockIcon size={TAB_TITLE_ICON_PX} />),
  developer: bonsaiTabIconTitle("developer", <BugIcon size={TAB_TITLE_DEBUG_TAB_ICON_PX} />),
  about: bonsaiTabIconTitle("about", <AboutTabTitleIcon size={TAB_TITLE_ICON_PX} />),
} as const;
