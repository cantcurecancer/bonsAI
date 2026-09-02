/**
 * Title: Decky tab title names
 * Purpose: Pin that every icon-only tab carries an accessible name of its own.
 * Used for: The tab strip at the top of the QAM panel.
 * Solves: Half of the fake-focus-ring confusion found on device 2026-08-28 — with no name on the
 *         icon, anything reading labels fell through to the whole tab's contents, so a probe (and a
 *         screen reader) sitting on the Main tab reported the chip carousel's text.
 * Does not: Assert the wording of any one name; that is a copy decision, not a contract.
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ALL_BONSAI_TAB_IDS,
  BONSAI_TAB_ACCESSIBLE_NAMES,
  BONSAI_TAB_SHORT_NAMES,
  BONSAI_TAB_STRIP_LABELS,
  BONSAI_TAB_STRIP_SHORT_LABELS,
  DECKY_TAB_TITLES,
  bonsaiTabIconTitle,
  bonsaiTabStripLabel,
} from "./tabTitles";

describe("decky tab titles", () => {
  it("names every tab, including ones that are not always mounted", () => {
    for (const id of ALL_BONSAI_TAB_IDS) {
      expect(BONSAI_TAB_ACCESSIBLE_NAMES[id]?.trim()).toBeTruthy();
    }
  });

  it("puts the name on the title element itself, not on an ancestor", () => {
    for (const id of ALL_BONSAI_TAB_IDS) {
      const { container, unmount } = render(DECKY_TAB_TITLES[id]);
      const leaf = container.querySelector(".bonsai-tab-title-leaf");
      expect(leaf?.getAttribute("aria-label")).toBe(BONSAI_TAB_ACCESSIBLE_NAMES[id]);
      unmount();
    }
  });

  it("keeps the name when the icon renders text of its own", () => {
    const { container } = render(bonsaiTabIconTitle("settings", <span>ignored</span>));
    const leaf = container.querySelector(".bonsai-tab-title-leaf");
    expect(leaf?.getAttribute("aria-label")).toBe(BONSAI_TAB_ACCESSIBLE_NAMES.settings);
  });
});

describe("collapsed tab bar names (plan 30)", () => {
  it("gives every tab a short name and a strip label, including ones not always mounted", () => {
    for (const id of ALL_BONSAI_TAB_IDS) {
      expect(BONSAI_TAB_SHORT_NAMES[id]?.trim()).toBeTruthy();
      expect(BONSAI_TAB_STRIP_LABELS[id]?.trim()).toBeTruthy();
    }
  });

  it("says the same word on the thin bar and under the icon, so switching states never renames a tab", () => {
    for (const id of ALL_BONSAI_TAB_IDS) {
      expect(BONSAI_TAB_STRIP_LABELS[id]).toBe(BONSAI_TAB_SHORT_NAMES[id].toUpperCase());
    }
  });

  it("has short forms only for the two names that decide whether six cells fit", () => {
    expect(Object.keys(BONSAI_TAB_STRIP_SHORT_LABELS).sort()).toEqual(["developer", "permissions"]);
    for (const [id, short] of Object.entries(BONSAI_TAB_STRIP_SHORT_LABELS)) {
      expect(short.length).toBeLessThan(BONSAI_TAB_STRIP_LABELS[id as keyof typeof BONSAI_TAB_STRIP_LABELS].length);
    }
  });

  it("applies the short forms only when asked, and only where one exists", () => {
    expect(bonsaiTabStripLabel("permissions", true)).toBe("PERMS");
    expect(bonsaiTabStripLabel("developer", true)).toBe("DEV");
    expect(bonsaiTabStripLabel("permissions", false)).toBe("PERMISSIONS");
    expect(bonsaiTabStripLabel("main", true)).toBe("MAIN");
  });
});
