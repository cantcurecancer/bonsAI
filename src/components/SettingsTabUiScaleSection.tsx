import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import type { UiScaleProfileId } from "../data/uiScaleProfile";
import { UI_SCALE_PROFILE_LABEL } from "../data/uiScaleProfile";
import { SettingsTabUiScaleSlider } from "./SettingsTabUiScaleSlider";

export type SettingsTabUiScaleSectionProps = {
  uiScaleAutoEnabled: boolean;
  uiScaleManualProfile: UiScaleProfileId;
  appliedProfileId: UiScaleProfileId;
  onApply: (autoEnabled: boolean, manualProfile: UiScaleProfileId) => void | Promise<void>;
};

export const SettingsTabUiScaleSection: React.FC<SettingsTabUiScaleSectionProps> = ({
  uiScaleAutoEnabled,
  uiScaleManualProfile,
  appliedProfileId,
  onApply,
}) => {
  const [pendingAuto, setPendingAuto] = useState(uiScaleAutoEnabled);
  const [pendingManual, setPendingManual] = useState<UiScaleProfileId>(uiScaleManualProfile);
  const [applying, setApplying] = useState(false);
  const sliderThumbRef = useRef<HTMLDivElement>(null);

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

  return (
    <PanelSection title="UI scale">
      <PanelSectionRow>
        <div className="bonsai-prose-host bonsai-settings-bleed" style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
          <div style={{ color: "#d9d9d9", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>UI scale</div>
          <div className="bonsai-prose" style={{ fontSize: 11, color: "#9fb7d5", marginBottom: 8, lineHeight: 1.35 }}>
            Adapts bonsAI to your screen — handheld, desk monitor, or TV. Active:{" "}
            <span style={{ color: "#9ce7ff", fontWeight: 600 }}>{UI_SCALE_PROFILE_LABEL[appliedProfileId]}</span>.
            If the UI looks too large or small, also check Steam Settings → Accessibility → UI Scale.
          </div>
          <ToggleField
            label="Adjust UI automatically"
            description="Pick the best profile from your display and QAM size."
            checked={pendingAuto}
            onChange={setPendingAuto}
          />
          {!pendingAuto ? (
            <div style={{ marginTop: 10 }}>
              <SettingsTabUiScaleSlider
                value={pendingManual}
                onChange={setPendingManual}
                thumbHostRef={sliderThumbRef}
              />
              <Button
                onClick={handleResetAutomatic}
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
            onClick={handleApply}
            disabled={applying}
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
