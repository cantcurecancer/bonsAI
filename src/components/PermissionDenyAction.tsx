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
        {/*
         * `focusable` makes this a genuine D-pad stop. Without it, Steam treats the row as a
         * pass-through container rather than a Focusable leaf, so Down/Up jump straight past it —
         * measured 2026-09-03 (runs/PERM-JUMP-01-a-find-open-permissions.json): Down from Retry or
         * Copy landed on the session context strip and Right from Copy did not move at all. Same
         * shape as the chat-slot row's 2026-08-30 bug (ChatSlotRow.tsx).
         *
         * No ref forwarded from here on purpose. A caller that needs to hand Steam's ring to this
         * button from another container (the chat transcript's reply-row Down/Up chain, for one)
         * cannot do it with an element ref anyway — measured on device 2026-09-04 (build 49241e7):
         * a plain DOM `.focus()` moves `activeElement` but not the gamepad ring across containers,
         * and stamping a synthetic `tabindex` to make that focus "stick" corrupted the wrapping
         * Focusable instead (Steam's own Focusables carry no `tabindex` attribute at all on device,
         * so the "only stamp when absent" guard never held back). The sanctioned transfer is a
         * `navRef` on the caller's own wrapping Focusable and `takeNavFocus` — see
         * navFocusRegistry.ts — which does not need anything from this component.
         */}
        <Button
          focusable
          onClick={() => onJump(capability)}
          style={{ fontSize: 11, padding: compact ? "4px 10px" : "6px 12px", minHeight: 34 }}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
