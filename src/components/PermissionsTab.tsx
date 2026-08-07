/**
 * Title: Permissions tab
 * Purpose: Capability toggles (filesystem, game context, Steam Web API, microphone).
 * Used for: index.tsx Permissions tab — gates privileged RPC paths on the Python side.
 * Solves: User-consent surface for sensitive operations before Ask or settings use them.
 * Does not: Enforce capabilities server-side — main.py capabilities service is authoritative.
 */
import React, { useEffect } from "react";
import { PanelSection, PanelSectionRow, ToggleField, Button } from "@decky/ui";
import type { BonsaiCapabilities } from "../data/bonsaiSettingsSchema";
import type { PermissionFocusTargetId } from "../utils/permissionDeepLink";
import { permissionJumpReturnTabLabel } from "../utils/permissionDeepLink";
import {
  registerPermissionFocusOwner,
  restorePermissionJumpFocusWithRetry,
} from "../utils/permissionJumpRegistry";

type Props = {
  capabilities: BonsaiCapabilities;
  setCapabilities: React.Dispatch<React.SetStateAction<BonsaiCapabilities>>;
  /** When set, show a Back control that returns to the tab the user jumped from. */
  permissionJumpReturnTab?: string | null;
  onReturnFromPermissionJump?: () => void;
};

const ROWS: {
  key: keyof BonsaiCapabilities;
  focusId: PermissionFocusTargetId;
  title: string;
  description: string;
}[] = [
  {
    key: "filesystem_write",
    focusId: "filesystem_write",
    title: "Save files to Desktop",
    description: "Notes, logs, and exports under Desktop/bonsAI_logs. Off blocks those writes.",
  },
  {
    key: "steam_web_api",
    focusId: "steam_web_api",
    title: "Steam ban lookup",
    description: "For the bonsai:vac-check command. API key lives in Developer → Integrations.",
  },
  {
    key: "microphone_access",
    focusId: "microphone_access",
    title: "Voice input (microphone)",
    description:
      "Record from this device's microphone for local speech-to-text in the Ask bar. Audio stays on-device and is never saved.",
  },
];

function gameContextReadEnabled(caps: BonsaiCapabilities): boolean {
  return caps.media_library_access && caps.steam_logs_read;
}

function PermissionToggleHost({
  focusId,
  children,
}: {
  focusId: PermissionFocusTargetId;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={(el) => registerPermissionFocusOwner(focusId, el)}
      className="bonsai-settings-bleed"
      style={{ width: "100%" }}
      data-bonsai-permission-focus={focusId}
    >
      {children}
    </div>
  );
}

/**
 * Central place for capability toggles. Uses Decky `ToggleField` for Steam QAM-style switches.
 * Defaults for new installs are off; legacy settings without this block are grandfathered on the backend until saved here.
 */
export const PermissionsTab: React.FC<Props> = ({
  capabilities,
  setCapabilities,
  permissionJumpReturnTab,
  onReturnFromPermissionJump,
}) => {
  useEffect(() => {
    restorePermissionJumpFocusWithRetry();
  }, []);

  const showBack = Boolean(permissionJumpReturnTab && onReturnFromPermissionJump);
  const backLabel = permissionJumpReturnTab
    ? permissionJumpReturnTabLabel(permissionJumpReturnTab)
    : "";

  return (
    <>
      <PanelSection title="Permissions">
        {showBack ? (
          <PanelSectionRow>
            <Button
              onClick={() => onReturnFromPermissionJump?.()}
              style={{ minHeight: 34, fontSize: 12, padding: "6px 12px" }}
            >
              Back to {backLabel}
            </Button>
          </PanelSectionRow>
        ) : null}
        <PanelSectionRow>
          <div className="bonsai-settings-bleed" style={{ fontSize: 12, color: "#9fb7d5", lineHeight: 1.45, marginBottom: 4 }}>
            High-impact actions stay off until you enable them here. AI requests on your home network are not
            gated by these toggles. Model policy and routing live on the <strong>Ollama</strong> tab. Docs,
            GitHub, and Steam settings links always open when you tap them.
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <PermissionToggleHost focusId="game_context_read">
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
          </PermissionToggleHost>
        </PanelSectionRow>
        {ROWS.map((row) => (
          <PanelSectionRow key={row.key}>
            <PermissionToggleHost focusId={row.focusId}>
              <ToggleField
                label={row.title}
                description={row.description}
                checked={capabilities[row.key]}
                onChange={(checked) => setCapabilities((prev) => ({ ...prev, [row.key]: checked }))}
              />
            </PermissionToggleHost>
          </PanelSectionRow>
        ))}
      </PanelSection>
    </>
  );
};
