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

export function bonsaiTabIconTitle(classSuffix: BonsaiTabId, children: React.ReactNode): React.ReactElement {
  return (
    <div className="bonsai-tab-title-leaf">
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
