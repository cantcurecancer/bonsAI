const BONSAI_STORAGE_PREFIX = "bonsai:";

/** Remove all plugin keys from localStorage and sessionStorage (bonsai:*). */
export function clearBonsaiBrowserStorage(): void {
  try {
    const lsKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(BONSAI_STORAGE_PREFIX)) lsKeys.push(key);
    }
    for (const key of lsKeys) window.localStorage.removeItem(key);

    const ssKeys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith(BONSAI_STORAGE_PREFIX)) ssKeys.push(key);
    }
    for (const key of ssKeys) window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
