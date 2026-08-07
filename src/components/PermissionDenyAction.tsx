/**
 * Title: Permission deny action
 * Purpose: Inline deny copy plus a focusable Open Permissions control for capability blocks.
 * Used for: Screenshot browser, chat hints, mic banner, Developer tab, and similar deny surfaces.
 * Solves: One reusable jump affordance instead of toast-only dead ends.
 * Does not: Navigate by itself — parent supplies jumpToPermission from usePermissionJump.
 */
import { Button } from "@decky/ui";

import type { BonsaiCapabilityKey } from "../utils/permissionDeepLink";
import { PERMISSION_DENY_MESSAGES } from "../utils/permissionDeepLink";

export type PermissionDenyActionProps = {
  capability: BonsaiCapabilityKey;
  message?: string;
  onJump: (capability: BonsaiCapabilityKey) => void;
  /** Tighter layout for screenshot browser and chat rows. */
  compact?: boolean;
  buttonLabel?: string;
};

export function PermissionDenyAction({
  capability,
  message,
  onJump,
  compact = false,
  buttonLabel = "Open Permissions",
}: PermissionDenyActionProps) {
  const text = message ?? PERMISSION_DENY_MESSAGES[capability];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: compact ? "column" : "column",
        gap: compact ? 6 : 8,
        color: compact ? "#f09a8d" : "#c8d8ea",
        fontSize: compact ? 11 : 12,
        lineHeight: 1.4,
      }}
    >
      <div>{text}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          onClick={() => onJump(capability)}
          style={{ fontSize: 11, padding: compact ? "4px 10px" : "6px 12px", minHeight: 34 }}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
