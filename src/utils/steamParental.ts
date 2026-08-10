/**
 * Title: Steam parental settings probe
 * Purpose: Long-lived subscription over `SteamClient.Parental` for Kids master lock.
 * Used for: useKidsLock — session lock/unlock without persisting to settings.json.
 * Solves: Sync-fire register, missing API, throw-after-fire, and never-fire → UNKNOWN.
 * Does not: Decode the parental protobuf blob; treat UNKNOWN as locked (callers fail open).
 *
 * `undefined` delivered to the callback means UNKNOWN — never "unlocked". Callers that
 * want fail-open map UNKNOWN → unlocked themselves (see useKidsLock).
 */

export type SteamParentalSnapshot = {
  everEnabled: boolean;
  locked: boolean;
};

type ParentalSettingsPayload = {
  ever_enabled?: boolean;
  locked?: boolean;
  settings?: ArrayBuffer;
  strPlaintextPassword?: string;
};

type ParentalUnregisterable = {
  unregister: () => void;
};

type ParentalApi = {
  RegisterForParentalSettingsChanges: (
    cb: (payload: ParentalSettingsPayload) => void
  ) => ParentalUnregisterable;
};

/** Default wait for first callback when Steam is silent. Spike KML-0.1 default until measured. */
export const STEAM_PARENTAL_INITIAL_TIMEOUT_MS = 2000;

function getParentalApi(): ParentalApi | undefined {
  const steam = (globalThis as { SteamClient?: { Parental?: ParentalApi } }).SteamClient;
  const parental = steam?.Parental;
  if (!parental || typeof parental.RegisterForParentalSettingsChanges !== "function") {
    return undefined;
  }
  return parental;
}

function toSnapshot(payload: ParentalSettingsPayload): SteamParentalSnapshot {
  return {
    everEnabled: payload.ever_enabled === true,
    locked: payload.locked === true,
  };
}

/**
 * Feature: Subscribe to Steam parental lock changes for the plugin lifetime.
 * Input: change callback + optional first-fire timeout. Output: unsubscribe function.
 *
 * Survives: API absent → immediate UNKNOWN; sync fire inside register(); register() throws
 * after firing (no unregister handle); never fires → UNKNOWN after timeout. Unsubscribe
 * always clears the timeout and never throws.
 */
export function subscribeSteamParental(
  onChange: (snapshot: SteamParentalSnapshot | undefined) => void,
  options?: { initialTimeoutMs?: number }
): () => void {
  const timeoutMs = options?.initialTimeoutMs ?? STEAM_PARENTAL_INITIAL_TIMEOUT_MS;
  const parental = getParentalApi();
  if (!parental) {
    onChange(undefined);
    return () => {};
  }

  let closed = false;
  let sawFirst = false;
  let reg: ParentalUnregisterable | undefined;
  let timeoutId: number | undefined;

  const deliver = (snapshot: SteamParentalSnapshot | undefined) => {
    if (closed) return;
    onChange(snapshot);
  };

  const clearInitialTimeout = () => {
    if (typeof timeoutId === "number") {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  const onParental = (payload: ParentalSettingsPayload) => {
    if (closed) return;
    sawFirst = true;
    clearInitialTimeout();
    deliver(toSnapshot(payload));
  };

  try {
    reg = parental.RegisterForParentalSettingsChanges(onParental);
  } catch {
    // Callback may have already run synchronously; if not, treat as UNKNOWN.
    if (!sawFirst) {
      deliver(undefined);
    }
    return () => {
      closed = true;
      clearInitialTimeout();
    };
  }

  if (!sawFirst) {
    timeoutId = window.setTimeout(() => {
      timeoutId = undefined;
      if (!sawFirst && !closed) {
        deliver(undefined);
      }
    }, timeoutMs);
  }

  return () => {
    closed = true;
    clearInitialTimeout();
    try {
      reg?.unregister();
    } catch {
      /* ignore */
    }
    reg = undefined;
  };
}
