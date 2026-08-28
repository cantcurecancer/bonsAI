/**
 * Title: Clipboard write
 * Purpose: Copy text to the host clipboard from the reply Copy action.
 * Used for: ReplyCopyButton.
 * Solves: navigator.clipboard.writeText is the primary path (see
 *   docs/audit/clipboard-spike-2026-08-28.md for why write is likelier to work here than the
 *   read path, which needed a host RPC); execCommand('copy') and a host RPC (wl-copy / xclip)
 *   cover the cases where it is unavailable or rejects.
 * Does not: Decide what text to copy — see answerCopyText.ts. Does not retry — one attempt per
 *   press, caller (ReplyCopyButton) shows the result and lets the user press again.
 */
import { callDeckyWithTimeout } from "./deckyCall";

type HostClipboardWriteRpcResult = { success?: boolean; error?: string };

/** Pre-Clipboard-API fallback: synchronous, no permission model, works wherever Chromium does. */
function writeViaExecCommand(text: string): boolean {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") return false;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  ta.style.left = "-1000px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    ta.setSelectionRange(0, text.length);
  } catch {
    /* some engines reject setSelectionRange on a detached-style node; select() above still ran */
  }
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(ta);
  }
  return ok;
}

/** Last resort: host script (wl-copy, then xclip) via RPC. See the spike doc for what is unverified. */
async function writeViaHostRpc(text: string): Promise<boolean> {
  try {
    const out = await callDeckyWithTimeout<[string], HostClipboardWriteRpcResult>(
      "write_host_clipboard_text",
      [text],
      8000
    );
    return out?.success === true;
  } catch {
    return false;
  }
}

/** Copy `text` to the host clipboard. Throws only if every path fails — caller shows the failure state. */
export async function writeClipboardText(text: string): Promise<void> {
  const value = text ?? "";
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // fall through to execCommand, then the host RPC
    }
  }
  if (writeViaExecCommand(value)) return;
  if (await writeViaHostRpc(value)) return;
  throw new Error("Clipboard write failed.");
}
