/**
 * Title: Kids master lock hook
 * Purpose: Map Steam parental `locked` onto session UI/backend capability deny.
 * Used for: index.tsx effectiveCapabilities + Permissions tab banner; pushes RPC.
 * Solves: Fail-open UNKNOWN, latch once locked until explicit unlock, mid-session unlock.
 * Does not: Persist lock in settings.json; filter AI output; decode parental protobuf.
 */
import { useEffect, useRef, useState } from "react";

import type { BonsaiCapabilities } from "../data/bonsaiSettingsSchema";
import { callDeckyWithTimeout } from "../utils/deckyCall";
import { subscribeSteamParental } from "../utils/steamParental";

const DENIED_CAPABILITIES: BonsaiCapabilities = {
  filesystem_write: false,
  media_library_access: false,
  steam_logs_read: false,
  steam_web_api: false,
  microphone_access: false,
};

/** Stored caps when unlocked; all-deny when Kids lock is active (does not mutate storage). */
export function effectiveCapabilities(
  stored: BonsaiCapabilities,
  kidsLockActive: boolean
): BonsaiCapabilities {
  return kidsLockActive ? DENIED_CAPABILITIES : stored;
}

async function pushKidsLockState(active: boolean): Promise<void> {
  try {
    await callDeckyWithTimeout<[boolean], { ok?: boolean }>("set_kids_lock_state", [active]);
  } catch {
    try {
      await callDeckyWithTimeout<[boolean], { ok?: boolean }>("set_kids_lock_state", [active]);
    } catch (e) {
      if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error("[bonsAI] set_kids_lock_state failed", e);
      }
    }
  }
}

/**
 * Feature: Long-lived Steam parental subscription with fail-open latch.
 * Input: none. Output: whether Kids lock is active this session.
 *
 * Latch rules: UNKNOWN → unlocked (unless already latched); once `locked: true` is seen,
 * only an explicit `locked: false` clears — never timeout/error/unregister.
 */
export function useKidsLock(): boolean {
  const [active, setActive] = useState(false);
  const latchedRef = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const apply = (next: boolean) => {
      if (cancelled) return;
      if (activeRef.current === next) return;
      activeRef.current = next;
      setActive(next);
      void pushKidsLockState(next);
    };

    const unsub = subscribeSteamParental((snapshot) => {
      if (cancelled) return;

      if (snapshot === undefined) {
        // UNKNOWN: fail open only when not latched (timeout after true must not clear).
        if (!latchedRef.current) {
          apply(false);
        }
        return;
      }

      if (snapshot.locked) {
        latchedRef.current = true;
        apply(true);
        return;
      }

      latchedRef.current = false;
      apply(false);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return active;
}
