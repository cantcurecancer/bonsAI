/**
 * Title: Permission jump hook
 * Purpose: Navigate from a capability denial to the matching Permissions toggle with return-tab support.
 * Used for: index.tsx — replaces bare setCurrentTab("permissions") at deny sites.
 * Solves: Return-tab memory and focus targeting that coexist with modal tab-restore locks.
 * Does not: Render deny UI — see PermissionDenyAction and per-site wiring.
 */
import { useCallback, useState } from "react";

import type { BonsaiCapabilityKey } from "../utils/permissionDeepLink";
import { resolvePermissionFocusTarget } from "../utils/permissionDeepLink";
import { armPermissionJump, consumePermissionJumpReturnTab } from "../utils/permissionJumpRegistry";

export type UsePermissionJumpArgs = {
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
};

export function usePermissionJump({ currentTab, setCurrentTab }: UsePermissionJumpArgs) {
  const [permissionJumpReturnTab, setPermissionJumpReturnTab] = useState<string | null>(null);

  const jumpToPermission = useCallback(
    (capability: BonsaiCapabilityKey) => {
      const focusTarget = resolvePermissionFocusTarget(capability);
      armPermissionJump(currentTab, focusTarget);
      setPermissionJumpReturnTab(currentTab);
      setCurrentTab("permissions");
    },
    [currentTab, setCurrentTab],
  );

  const returnFromPermissionJump = useCallback(() => {
    const back = consumePermissionJumpReturnTab();
    setPermissionJumpReturnTab(null);
    if (back) setCurrentTab(back);
  }, [setCurrentTab]);

  return {
    jumpToPermission,
    returnFromPermissionJump,
    permissionJumpReturnTab,
  };
}
