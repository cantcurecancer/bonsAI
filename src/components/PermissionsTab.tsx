/**
 * Title: Permissions tab
 * Purpose: Capability toggles (filesystem, game context, Steam Web API, microphone).
 * Used for: index.tsx Permissions tab — gates privileged RPC paths on the Python side.
 * Solves: User-consent surface for sensitive operations before Ask or settings use them.
 * Does not: Enforce capabilities server-side — main.py capabilities service is authoritative.
 */
import React from "react";
import { PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import type { BonsaiCapabilities } from "../data/bonsaiSettingsSchema";
type Props = {
  capabilities: BonsaiCapabilities;
  setCapabilities: React.Dispatch<React.SetStateAction<BonsaiCapabilities>>;
};

const ROWS: {
  key: keyof BonsaiCapabilities;
  title: string;
  description: string;
}[] = [
  {
    key: "filesystem_write",
    title: "Save files to Desktop",
    description: "Notes, logs, and exports under Desktop/bonsAI_logs. Off blocks those writes.",
  },
  {
    key: "steam_web_api",
    title: "Steam ban lookup",
    description: "For the bonsai:vac-check command. API key lives in Developer → Integrations.",
  },
  {
    key: "microphone_access",
    title: "Voice input (microphone)",
    description:
      "Record from this device's microphone for local speech-to-text in the Ask bar. Audio stays on-device and is never saved.",
  },
];

function gameContextReadEnabled(caps: BonsaiCapabilities): boolean {
  return caps.media_library_access && caps.steam_logs_read;
}

/**
 * Central place for capability toggles. Uses Decky `ToggleField` for Steam QAM-style switches.
 * Defaults for new installs are off; legacy settings without this block are grandfathered on the backend until saved here.
 */
export const PermissionsTab: React.FC<Props> = ({ capabilities, setCapabilities }) => (
  <>
    <PanelSection title="Permissions">
      <PanelSectionRow>
        <div className="bonsai-settings-bleed" style={{ fontSize: 12, color: "#9fb7d5", lineHeight: 1.45, marginBottom: 4 }}>
          High-impact actions stay off until you enable them here. AI requests on your home network are not
          gated by these toggles. Model policy and routing live on the <strong>Ollama</strong> tab. Docs,
          GitHub, and Steam settings links always open when you tap them.
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div className="bonsai-settings-bleed" style={{ width: "100%" }}>
          <ToggleField
            label="Read game & screenshot context"
            description="Lets bonsAI attach Steam screenshots and, on troubleshooting Asks, auto-attach local game/Proton log excerpts. One permission for screenshots and logs."
            checked={gameContextReadEnabled(capabilities)}
            onChange={(checked) => {
              setCapabilities((prev) => ({
                ...prev,
                media_library_access: checked,
                steam_logs_read: checked,
              }));
            }}
          />
        </div>
      </PanelSectionRow>
      {ROWS.map((row) => (
        <PanelSectionRow key={row.key}>
          <div className="bonsai-settings-bleed" style={{ width: "100%" }}>
            <ToggleField
              label={row.title}
              description={row.description}
              checked={capabilities[row.key]}
              onChange={(checked) => setCapabilities((prev) => ({ ...prev, [row.key]: checked }))}
            />
          </div>
        </PanelSectionRow>
      ))}
    </PanelSection>
  </>
);
