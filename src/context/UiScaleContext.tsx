import React, { createContext, useContext } from "react";
import type { UiScaleProfileId } from "../data/uiScaleProfile";

export type UiScaleContextValue = {
  profileId: UiScaleProfileId;
  scopeStyle: React.CSSProperties;
  generation: number;
  requestApply: () => void;
};

const UiScaleContext = createContext<UiScaleContextValue | null>(null);

export function UiScaleProvider({
  value,
  children,
}: {
  value: UiScaleContextValue;
  children: React.ReactNode;
}) {
  return <UiScaleContext.Provider value={value}>{children}</UiScaleContext.Provider>;
}

export function useUiScaleContext(): UiScaleContextValue | null {
  return useContext(UiScaleContext);
}

/** Modal roots must read scale vars — showModal() is outside the QAM tree. */
export function useUiScaleScopeStyle(): React.CSSProperties {
  return useUiScaleContext()?.scopeStyle ?? {};
}
