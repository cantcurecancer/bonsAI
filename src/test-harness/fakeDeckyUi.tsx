import React from "react";
import { vi } from "vitest";

type StubProps = Record<string, unknown> & { children?: React.ReactNode };

/**
 * Steam navigation props the real components consume themselves. The stub has to drop them rather
 * than spread them: React does not recognise them as event handlers, so every one reaching a plain
 * `div` prints a warning, and the answer bubble alone now carries a set of them per section.
 */
const STEAM_NAV_PROPS = new Set([
  "onActivate",
  "onButtonDown",
  "onButtonUp",
  "onCancel",
  "onGamepadBlur",
  "onGamepadDirection",
  "onGamepadFocus",
  "onMoveDown",
  "onMoveLeft",
  "onMoveRight",
  "onMoveUp",
  "onOKActionDescription",
  "onOKButton",
  "onOptionsActionDescription",
  "onOptionsButton",
  "onSecondaryActionDescription",
  "onSecondaryButton",
  "onShowTab",
  "navRef",
]);

function withoutSteamNavProps(props: StubProps): StubProps {
  const out: StubProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (!STEAM_NAV_PROPS.has(key)) out[key] = value;
  }
  return out;
}

/**
 * Ref-forwarding, because the real components do and plugin code depends on it: the answer bubble
 * and every section stop inside it reach their registries through a `ref` callback on a `Focusable`.
 * A plain function component silently hands those callbacks null, so anything ref-driven would test
 * as broken here while working on device.
 */
function stub(name: string) {
  return React.forwardRef<HTMLDivElement, StubProps>(function DeckyUiStub(
    { children, ...rest },
    ref
  ) {
    /* `forwardRef` runs StubProps through `Omit`, which collapses the declared `children` into the
       index signature and leaves it `unknown`; the cast restores what it always was. */
    return (
      <div ref={ref} data-decky-ui={name} {...withoutSteamNavProps(rest)}>
        {children as React.ReactNode}
      </div>
    );
  });
}

export const PanelSection = stub("PanelSection");
export const PanelSectionRow = stub("PanelSectionRow");
export const TextField = stub("TextField");
export const ToggleField = stub("ToggleField");
export const Button = stub("Button");
export const Focusable = stub("Focusable");
export const Navigation = {
  OpenQuickAccessMenu: vi.fn(),
};

export const QuickAccessTab = {
  Decky: 999,
};
/**
 * Real `Tabs` renders each tab's title and the active tab's content. The generic
 * stub spread `tabs` onto a div as `[object Object]`, which made every tab-level
 * assertion impossible, so this one models the contract instead.
 */
type FakeTab = { id: string; title?: React.ReactNode; content?: React.ReactNode };
export function Tabs({
  tabs,
  activeTab,
  ...rest
}: { tabs?: FakeTab[]; activeTab?: string } & Record<string, unknown>) {
  const rows = Array.isArray(tabs) ? tabs : [];
  const active = rows.find((t) => t.id === activeTab) ?? rows[0];
  return (
    <div
      data-decky-ui="Tabs"
      data-active-tab={activeTab}
      {...(withoutSteamNavProps(rest) as StubProps)}
    >
      <div data-decky-ui="TabTitles">
        {rows.map((t) => (
          <div key={t.id} data-tab-id={t.id}>
            {t.title}
          </div>
        ))}
      </div>
      <div data-decky-ui="TabContent">{active?.content}</div>
    </div>
  );
}
export const SliderField = stub("SliderField");
export const Dropdown = stub("Dropdown");
export const DropdownOption = stub("DropdownOption");
export const ModalRoot = stub("ModalRoot");
export const ProgressBar = stub("ProgressBar");
export const Spinner = stub("Spinner");
export const Marquee = stub("Marquee");

export const Router = {
  MainRunningApp: { appid: 570, display_name: "Dota 2" },
};

export const showModal = (content: React.ReactNode) => content;
export const ConfirmModal = stub("ConfirmModal");
