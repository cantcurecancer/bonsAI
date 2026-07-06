import { describe, expect, it, beforeEach } from "vitest";
import { clearBonsaiBrowserStorage } from "./clearBonsaiBrowserStorage";

describe("clearBonsaiBrowserStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("removes all bonsai: keys from localStorage and sessionStorage", () => {
    window.localStorage.setItem("bonsai:pc-ip", "192.168.1.2");
    window.localStorage.setItem("bonsai:disclaimer-accepted", "1");
    window.localStorage.setItem("other:key", "keep");
    window.sessionStorage.setItem("bonsai:auto-desktop-chat-response-ids", "[]");

    clearBonsaiBrowserStorage();

    expect(window.localStorage.getItem("bonsai:pc-ip")).toBeNull();
    expect(window.localStorage.getItem("bonsai:disclaimer-accepted")).toBeNull();
    expect(window.localStorage.getItem("other:key")).toBe("keep");
    expect(window.sessionStorage.getItem("bonsai:auto-desktop-chat-response-ids")).toBeNull();
  });
});
