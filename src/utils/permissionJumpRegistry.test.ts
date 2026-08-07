import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  armPermissionJump,
  consumePermissionJumpReturnTab,
  peekPermissionJumpFocusTarget,
  peekPermissionJumpReturnTab,
  registerPermissionFocusOwner,
  resetPermissionJumpRegistry,
  restorePermissionJumpFocusWithRetry,
} from "./permissionJumpRegistry";

describe("permissionJumpRegistry", () => {
  beforeEach(() => {
    resetPermissionJumpRegistry();
    vi.useRealTimers();
  });

  it("arms return tab and focus target together", () => {
    armPermissionJump("main", "microphone_access");
    expect(peekPermissionJumpReturnTab()).toBe("main");
    expect(peekPermissionJumpFocusTarget()).toBe("microphone_access");
  });

  it("consumes return tab once", () => {
    armPermissionJump("settings", "filesystem_write");
    expect(consumePermissionJumpReturnTab()).toBe("settings");
    expect(peekPermissionJumpReturnTab()).toBeNull();
  });

  it("restores focus when the owner is registered", async () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const button = document.createElement("button");
    el.appendChild(button);
    document.body.appendChild(el);
    registerPermissionFocusOwner("steam_web_api", el);
    armPermissionJump("main", "steam_web_api");

    let claimed = false;
    restorePermissionJumpFocusWithRetry((ok) => {
      claimed = ok;
    });
    await vi.runAllTimersAsync();
    expect(claimed).toBe(true);
    expect(peekPermissionJumpFocusTarget()).toBeNull();
    el.remove();
  });
});
