/**
 * Title: Collapsing tab bar — rest state and the hiding rule
 * Purpose: Pin what the thin bar shows for a given tab list and active tab, and that Steam's header
 *          is hidden by a rule scoped to our own markup with no build-hashed class in it.
 * Used for: plan 30 W3 (docs/planning/30-collapsing-tab-bar.md § 5).
 * Solves: The two ways this can rot silently — a dash count that stops following the mounted tabs,
 *         and a hiding selector that quietly grows a Steam hash and stops matching after a client
 *         update (docs/audit/decky-tab-strip-classes.md is the prior art for that failure).
 * Does not: Measure heights or where the ring lands; jsdom has no layout and no gamepad. Those are
 *           the on-device rows TAB-BAR-01 … -06.
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TabIndicatorBar } from "./TabIndicatorBar";
import { ALL_BONSAI_TAB_IDS, type BonsaiTabId } from "./tabTitles";
import { buildBonsaiScopeStylesheet } from "../../styles/bonsaiScopeStylesheet";

const SIX = ALL_BONSAI_TAB_IDS;
const FIVE: readonly BonsaiTabId[] = SIX.filter((id) => id !== "developer");

/** `[selector, declarations]` for every rule in a stylesheet, comments stripped. */
function rulesOf(css: string): Array<[string, string]> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Array<[string, string]> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(withoutComments)) !== null) {
    out.push([m[1].trim(), m[2].trim()]);
  }
  return out;
}

/** A Steam CSS-module hash: a long alphanumeric run mixing cases and digits, e.g. _3IBLc81yyL08OJ7rfKtF00. */
function hasHashedToken(selector: string): boolean {
  const runs = selector.match(/[A-Za-z0-9]{10,}/g) ?? [];
  return runs.some((run) => /\d/.test(run) && /[a-z]/.test(run) && /[A-Z]/.test(run));
}

describe("TabIndicatorBar at rest", () => {
  it("draws one dash per mounted tab, so the count follows the tab list rather than a constant", () => {
    const six = render(<TabIndicatorBar tabIds={SIX} currentTab="main" />);
    expect(six.container.querySelectorAll(".bonsai-tab-bar__dash")).toHaveLength(6);
    six.unmount();
    const five = render(<TabIndicatorBar tabIds={FIVE} currentTab="main" />);
    expect(five.container.querySelectorAll(".bonsai-tab-bar__dash")).toHaveLength(5);
  });

  it("lights the active tab's dash and names it", () => {
    const { container } = render(<TabIndicatorBar tabIds={SIX} currentTab="settings" />);
    const lit = container.querySelectorAll(".bonsai-tab-bar__dash--active");
    expect(lit).toHaveLength(1);
    expect(lit[0].getAttribute("data-bonsai-tab")).toBe("settings");
    expect(container.querySelector(".bonsai-tab-bar__name")?.textContent).toBe("Settings");
  });

  it("follows currentTab when it changes, which is what a shoulder press does", () => {
    const { container, rerender } = render(<TabIndicatorBar tabIds={SIX} currentTab="main" />);
    expect(container.querySelector(".bonsai-tab-bar__name")?.textContent).toBe("Main");
    rerender(<TabIndicatorBar tabIds={SIX} currentTab="about" />);
    expect(container.querySelector(".bonsai-tab-bar__dash--active")?.getAttribute("data-bonsai-tab")).toBe("about");
    expect(container.querySelector(".bonsai-tab-bar__name")?.textContent).toBe("About");
  });

  it("lights nothing and names nothing for a tab that is not mounted, so a stale id never claims a tab", () => {
    const { container } = render(<TabIndicatorBar tabIds={FIVE} currentTab="developer" />);
    expect(container.querySelectorAll(".bonsai-tab-bar__dash--active")).toHaveLength(0);
    expect(container.querySelector(".bonsai-tab-bar__name")?.textContent).toBe("");
  });

  it("carries the LB and RB marks, present in the markup whether or not they are visible", () => {
    const { container } = render(<TabIndicatorBar tabIds={SIX} currentTab="main" />);
    const marks = Array.from(container.querySelectorAll(".bonsai-tab-bar__shoulder")).map((el) => el.textContent);
    expect(marks).toEqual(["LB", "RB"]);
  });
});

describe("the rule that hides Steam's tab header", () => {
  const rules = rulesOf(buildBonsaiScopeStylesheet());
  const hiding = rules.filter(
    ([selector, decls]) => selector.includes(".bonsai-tab-title-leaf") && /display:\s*none/.test(decls),
  );

  it("exists exactly once", () => {
    expect(hiding).toHaveLength(1);
  });

  it("is scoped under the tabs root and addresses Steam's row by our own markup, never by a hash", () => {
    const [selector] = hiding[0];
    expect(selector.startsWith(".bonsai-scope .bonsai-decky-tabs-root")).toBe(true);
    expect(selector).toContain(":has(.bonsai-tab-title-leaf)");
    expect(hasHashedToken(selector)).toBe(false);
  });

  it("hides the bar's LB/RB marks while the chat-slot row holds the ring, without moving anything", () => {
    const marksRule = rules.find(
      ([selector]) =>
        selector.includes(".bonsai-tab-bar__shoulder") && selector.includes(":has(.bonsai-chat-slot-row--focused)"),
    );
    expect(marksRule).toBeDefined();
    expect(marksRule?.[1]).toMatch(/visibility:\s*hidden/);
    expect(marksRule?.[1]).not.toMatch(/display:\s*none/);
  });
});
