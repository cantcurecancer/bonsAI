/**
 * Title: UI scale settings section
 * Purpose: Auto/manual UI scale profile controls with Focusable bridge for the manual slider thumb.
 * Used for: SettingsTab; canonical reference for Deck focus-graph Pattern B (slider bridge).
 * Solves: Wires toggle → slider bridge → Apply button with verified vertical D-pad hops.
 * Does not: Measure viewport or apply CSS variables — see uiScaleProfile and UiScaleContext.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Focusable, PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import type { UiScaleProfileId } from "../data/uiScaleProfile";
import {
  indexOfManualUiScaleProfile,
  manualUiScaleProfileAtIndex,
  profileScaleMultiplier,
  UI_SCALE_PROFILE_LABEL,
} from "../data/uiScaleProfile";
import { SettingsTabUiScaleSlider } from "./SettingsTabUiScaleSlider";

export type SettingsTabUiScaleSectionProps = {
  uiScaleAutoEnabled: boolean;
  uiScaleManualProfile: UiScaleProfileId;
  appliedProfileId: UiScaleProfileId;
  onApply: (autoEnabled: boolean, manualProfile: UiScaleProfileId) => void | Promise<void>;
  /** Parent ref for D-pad up from the section below (e.g. screenshot quality row). */
  applyButtonRef?: React.Ref<HTMLButtonElement>;
  /** D-pad down from Apply — e.g. focus screenshot quality presets. */
  onMoveDownFromApply?: () => boolean;
};

function focusInHost(host: HTMLElement | null): boolean {
  const target = host?.querySelector<HTMLElement>("[tabindex], button:not([disabled])");
  if (!target) return false;
  target.focus();
  return true;
}

export type UiScaleBridgeNavDeps = {
  stepManualProfile: (delta: number) => boolean;
  toggleBridgeSliderEditing: () => void;
  focusAutoToggle: () => boolean;
  focusResetButton: () => boolean;
  focusApplyButton: () => boolean;
};

/**
 * Left/Right claim the move on onMoveLeft/onMoveRight themselves, the same fix as
 * buildDeckThumbNavHandlers (DeckFocusSlider.tsx): stepping from inside onButtonDown left the press
 * unconsumed, so Steam's own navigation carried on left/right past the bridge after the value had
 * already stepped once (ONBUTTONDOWN-AUDIT-01, measured 2026-09-03). `stepManualProfile` always
 * returns true, so both handlers always claim the move. Pulled out as its own function, the same way
 * `buildDeckThumbNavHandlers` is, so it can be unit-tested directly -- Steam nav props like
 * `onMoveLeft` never reach the DOM through the test harness's Focusable stub, so a render-based test
 * cannot call them.
 */
export function buildUiScaleBridgeNav(deps: UiScaleBridgeNavDeps): Record<string, unknown> {
  const { stepManualProfile, toggleBridgeSliderEditing, focusAutoToggle, focusResetButton, focusApplyButton } = deps;
  return {
    onMoveLeft: () => stepManualProfile(-1),
    onMoveRight: () => stepManualProfile(1),
    onActivate: () => {
      toggleBridgeSliderEditing();
      return true;
    },
    onMoveUp: () => focusAutoToggle(),
    onMoveDown: () => focusResetButton() || focusApplyButton(),
  };
}

export const SettingsTabUiScaleSection: React.FC<SettingsTabUiScaleSectionProps> = ({
  uiScaleAutoEnabled,
  uiScaleManualProfile,
  appliedProfileId,
  onApply,
  applyButtonRef,
  onMoveDownFromApply,
}) => {
  const [pendingAuto, setPendingAuto] = useState(uiScaleAutoEnabled);
  const [pendingManual, setPendingManual] = useState<UiScaleProfileId>(uiScaleManualProfile);
  const [applying, setApplying] = useState(false);
  const [bridgeSliderActive, setBridgeSliderActive] = useState(false);
  const [bridgeSliderEditing, setBridgeSliderEditing] = useState(false);
  const sliderThumbRef = useRef<HTMLDivElement>(null);
  const sliderBridgeRef = useRef<HTMLDivElement>(null);
  const autoToggleHostRef = useRef<HTMLDivElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const applyButtonLocalRef = useRef<HTMLButtonElement>(null);

  const focusSliderBridge = useCallback((): boolean => {
    return focusInHost(sliderBridgeRef.current);
  }, []);

  const focusAutoToggle = useCallback((): boolean => {
    return focusInHost(autoToggleHostRef.current);
  }, []);

  const focusResetButton = useCallback((): boolean => {
    const btn = resetButtonRef.current;
    if (!btn || btn.disabled) return false;
    btn.focus();
    return true;
  }, []);

  const focusApplyButton = useCallback((): boolean => {
    const btn = applyButtonLocalRef.current;
    if (!btn || btn.disabled) return false;
    btn.focus();
    return true;
  }, []);

  const setApplyButtonRef = useCallback(
    (el: HTMLButtonElement | null) => {
      applyButtonLocalRef.current = el;
      if (!applyButtonRef) return;
      if (typeof applyButtonRef === "function") applyButtonRef(el);
      else if (typeof applyButtonRef === "object" && "current" in applyButtonRef) {
        (applyButtonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      }
    },
    [applyButtonRef],
  );

  useEffect(() => {
    setPendingAuto(uiScaleAutoEnabled);
    setPendingManual(uiScaleManualProfile);
  }, [uiScaleAutoEnabled, uiScaleManualProfile]);

  const handleApply = useCallback(async () => {
    setApplying(true);
    try {
      await onApply(pendingAuto, pendingManual);
    } finally {
      setApplying(false);
    }
  }, [onApply, pendingAuto, pendingManual]);

  const handleResetAutomatic = useCallback(() => {
    setPendingAuto(true);
  }, []);

  const stepManualProfile = useCallback(
    (delta: number): boolean => {
      const idx = indexOfManualUiScaleProfile(pendingManual);
      setPendingManual(manualUiScaleProfileAtIndex(idx + delta));
      return true;
    },
    [pendingManual],
  );

  const bridgeSliderNav = useMemo(
    () =>
      buildUiScaleBridgeNav({
        stepManualProfile,
        toggleBridgeSliderEditing: () => setBridgeSliderEditing((prev) => !prev),
        focusAutoToggle,
        focusResetButton,
        focusApplyButton,
      }),
    [focusApplyButton, focusAutoToggle, focusResetButton, stepManualProfile],
  );

  return (
    <PanelSection title="UI scale">
      <PanelSectionRow>
        <div className="bonsai-prose-host bonsai-settings-bleed" style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
          <div style={{ color: "#d9d9d9", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>UI scale</div>
          <div className="bonsai-prose" style={{ fontSize: 11, color: "#9fb7d5", marginBottom: 8, lineHeight: 1.35 }}>
            Adapts bonsAI to your screen — handheld, desk monitor, or TV. Active:{" "}
            <span style={{ color: "#9ce7ff", fontWeight: 600 }}>
              {UI_SCALE_PROFILE_LABEL[appliedProfileId]} ({profileScaleMultiplier(appliedProfileId).toFixed(2)}×)
            </span>
            . Handheld and Desktop share the same scale (1.00×); Couch is larger for TV distance. Also check Steam
            Settings → Accessibility → UI Scale.
          </div>
          <div ref={autoToggleHostRef}>
            <ToggleField
              label="Adjust UI automatically"
              description="Pick the best profile from your display and QAM size."
              checked={pendingAuto}
              onChange={setPendingAuto}
              {...({
                onMoveDown: () => {
                  if (!pendingAuto && focusSliderBridge()) return true;
                  return focusApplyButton();
                },
              } as unknown as Record<string, unknown>)}
            />
          </div>
          {!pendingAuto ? (
            <div style={{ marginTop: 10 }}>
              <div ref={sliderBridgeRef}>
                <Focusable
                  className="bonsai-ui-scale-slider-focus-bridge"
                  flow-children="vertical"
                  style={{ width: "100%", minWidth: 0 }}
                  onFocus={() => setBridgeSliderActive(true)}
                  onBlur={() => {
                    setBridgeSliderActive(false);
                    setBridgeSliderEditing(false);
                  }}
                  {...bridgeSliderNav}
                >
                  <SettingsTabUiScaleSlider
                    value={pendingManual}
                    onChange={setPendingManual}
                    thumbHostRef={sliderThumbRef}
                    thumbFocusedExternal={bridgeSliderActive}
                    thumbEditingExternal={bridgeSliderEditing}
                    onMoveUp={() => focusAutoToggle()}
                    onMoveDown={() => focusResetButton() || focusApplyButton()}
                  />
                </Focusable>
              </div>
              <Button
                ref={(el) => {
                  resetButtonRef.current = el as HTMLButtonElement | null;
                }}
                onClick={handleResetAutomatic}
                {...({
                  onMoveUp: () => focusSliderBridge(),
                  onMoveDown: () => focusApplyButton(),
                } as unknown as Record<string, unknown>)}
                style={{
                  marginTop: 8,
                  minHeight: 32,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                }}
              >
                Reset to automatic
              </Button>
            </div>
          ) : null}
          <Button
            ref={(el) => {
              setApplyButtonRef(el as HTMLButtonElement | null);
            }}
            onClick={handleApply}
            disabled={applying}
            {...({
              onMoveUp: () => {
                if (!pendingAuto) {
                  if (focusResetButton()) return true;
                  if (focusSliderBridge()) return true;
                }
                return focusAutoToggle();
              },
              onMoveDown: () => onMoveDownFromApply?.() ?? false,
            } as unknown as Record<string, unknown>)}
            style={{
              marginTop: 12,
              minHeight: 36,
              fontSize: 12,
              fontWeight: 600,
              width: "100%",
            }}
          >
            {applying ? "Applying…" : "Apply UI scale"}
          </Button>
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};
