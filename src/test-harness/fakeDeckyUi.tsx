import React from "react";
import { vi } from "vitest";

type StubProps = Record<string, unknown> & { children?: React.ReactNode };

function stub(name: string) {
  return function DeckyUiStub({ children, ...rest }: StubProps) {
    return (
      <div data-decky-ui={name} {...rest}>
        {children}
      </div>
    );
  };
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
    <div data-decky-ui="Tabs" data-active-tab={activeTab} {...(rest as StubProps)}>
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
