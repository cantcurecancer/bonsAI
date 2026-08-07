/**
 * Title: Permissions tab payload
 * Purpose: Build the memoized Permissions tab element for the shell's tab list.
 * Used for: index.tsx — the always-present "Permissions" tab row.
 * Solves: Keeps the tab section of the composition root a uniform list of payload hooks.
 * Does not: Own or persist capabilities — both come from usePluginSettings via the caller.
 */
import React, { useMemo } from "react";

import { PermissionsTab } from "../../../components/PermissionsTab";

export type UsePermissionsTabPayloadArgs = React.ComponentProps<typeof PermissionsTab>;

export function usePermissionsTabPayload({
  capabilities,
  setCapabilities,
  permissionJumpReturnTab,
  onReturnFromPermissionJump,
}: UsePermissionsTabPayloadArgs): React.ReactElement {
  return useMemo(
    () => (
      <PermissionsTab
        capabilities={capabilities}
        setCapabilities={setCapabilities}
        permissionJumpReturnTab={permissionJumpReturnTab}
        onReturnFromPermissionJump={onReturnFromPermissionJump}
      />
    ),
    [capabilities, setCapabilities, permissionJumpReturnTab, onReturnFromPermissionJump],
  );
}
