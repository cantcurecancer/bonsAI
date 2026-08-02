/**
 * Title: Applied tuning text
 * Purpose: Format the main-tab banner and answer suffix describing tuning an Ask reported as applied.
 * Used for: MainTabChatTranscript banner and useBonsaiAskOrchestration terminal answer text.
 * Solves: Keeps assistant-facing wording about TDP / GPU clock out of the settings payload builder.
 * Does not: Apply anything — bonsAI stopped writing sysfs on 2026-07-30, so this only renders
 *   `applied` metadata that a reply still carries.
 */
import { type AppliedResultLike } from "../data/bonsaiSettingsSchema";

/** QAM Performance verification line — sysfs is source of truth; QAM can lag. */
const QAM_VERIFY_SLIDER_LINE =
  "If QAM Performance sliders look stale, close and reopen the QAM Performance tab to verify values match the applied cap.";

/**
 * One short banner for the main tab when last Ask included tuning `applied` metadata.
 * TDP (sysfs) is distinguished from GPU MHz (advisory; not written by this plugin yet).
 * Apply path is obsolete — banner retained for any residual applied metadata from older sessions.
 */
export function formatAppliedTuningBannerText(applied: AppliedResultLike | null | undefined): string | null {
  if (!applied) return null;
  const tdp = applied.tdp_watts;
  const gpu = applied.gpu_clock_mhz;
  if (tdp == null && gpu == null) return null;

  const errList = applied.errors?.length ? applied.errors : [];
  if (tdp != null) {
    let s = `TDP ${tdp}W was applied. ${QAM_VERIFY_SLIDER_LINE}`;
    if (gpu != null) {
      s += ` GPU ${gpu} MHz is a recommendation; this plugin does not write GPU clock to hardware yet.`;
    }
    return s;
  }

  if (gpu != null) {
    const pre = errList.length > 0 ? `TDP was not applied (${errList[0]}). ` : "";
    return `${pre}GPU ${gpu} MHz is from the model; this plugin does not write GPU clock to hardware yet.`;
  }

  return null;
}

export function buildResponseText(responseText: string, applied?: AppliedResultLike | null): string {
  let text = responseText || "No response text.";
  if (!applied) return text;
  const parts: string[] = [];
  if (applied.tdp_watts != null) parts.push(`TDP: ${applied.tdp_watts}W`);
  if (applied.gpu_clock_mhz != null) parts.push(`GPU: ${applied.gpu_clock_mhz} MHz`);
  if (parts.length > 0) text += `\n\n[Applied: ${parts.join(", ")}]`;
  if (applied.errors?.length) text += `\n[Errors: ${applied.errors.join("; ")}]`;
  else if (parts.length > 0) {
    text += `\n\nNote: If Steam's QAM Performance sliders look stale, close and reopen that tab to verify values match what was applied.`;
  }
  return text;
}
