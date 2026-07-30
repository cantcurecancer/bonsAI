/**
 * Title: Settings payload builder
 * Purpose: Map frontend settings snapshot input into the backend BonsaiSettings RPC payload shape.
 * Used for: usePluginSettings save path and immediate patch saves (character picker, permissions).
 * Solves: One canonical object for set_settings without duplicating field mapping in callers.
 * Does not: Validate or normalize raw RPC responses — see bonsaiSettingsNormalizers.
 */
import {
  STEAM_WEB_API_KEY_MAX_LEN,
  type AppliedResultLike,
  type BonsaiSettings,
  type BonsaiSettingsSnapshotInput,
} from "../data/bonsaiSettingsSchema";

/** Build the backend `BonsaiSettings` object; optional `patch` for immediate saves (character picker, permissions). */
export function toBonsaiSettingsPayload(
  input: BonsaiSettingsSnapshotInput,
  patch?: Partial<BonsaiSettings>,
): BonsaiSettings {
  const base: BonsaiSettings = {
    latency_warning_seconds: input.latencyWarningSeconds,
    request_timeout_seconds: input.requestTimeoutSeconds,
    latency_timeouts_custom_enabled: input.latencyTimeoutsCustomEnabled,
    unified_input_persistence_mode: input.unifiedInputPersistenceMode,
    screenshot_attachment_preset: input.screenshotAttachmentPreset,
    desktop_debug_note_auto_save: input.desktopDebugNoteAutoSave,
    desktop_ask_verbose_logging: input.desktopAskVerboseLogging,
    desktop_app_log_level: input.desktopAppLogLevel,
    attach_proton_logs_when_troubleshooting: input.attachProtonLogsWhenTroubleshooting,
    include_proton_experiment_journal_when_troubleshooting:
      input.includeProtonExperimentJournalWhenTroubleshooting,
    thinking_status_tiny_model_enabled: input.thinkingStatusTinyModelEnabled,
    preset_chip_fade_animation_enabled: input.presetChipAnimation === "fade",
    preset_chip_animation: input.presetChipAnimation,
    input_sanitizer_user_disabled: input.inputSanitizerUserDisabled,
    capabilities: input.capabilities,
    ai_character_enabled: input.aiCharacterEnabled,
    ai_character_random: input.aiCharacterRandom,
    ai_character_preset_id: input.aiCharacterPresetId,
    ai_character_custom_text: input.aiCharacterCustomText,
    ai_character_accent_intensity: input.aiCharacterAccentIntensity,
    ask_mode: input.askMode,
    ollama_keep_alive: input.ollamaKeepAlive,
    reply_verbosity: input.replyVerbosity,
    reply_language: input.replyLanguage,
    show_developer_tab: input.showDeveloperTab,
    model_policy_tier: input.modelPolicyTier,
    model_policy_non_foss_unlocked: input.modelPolicyNonFossUnlocked,
    model_allow_high_vram_fallbacks: input.modelAllowHighVramFallbacks,
    text_model_routing_order: input.textModelRoutingOrder,
    vision_model_routing_order: input.visionModelRoutingOrder,
    ollama_local_on_deck: input.ollamaLocalOnDeck,
    strategy_spoiler_masking_enabled: input.strategySpoilerMaskingEnabled,
    strategy_spoiler_auto_reveal_after_consent: input.strategySpoilerAutoRevealAfterConsent,
    steam_web_api_key: input.steamWebApiKey.trim().slice(0, STEAM_WEB_API_KEY_MAX_LEN),
    bonsai_token_streaming_enabled: input.bonsaiTokenStreamingEnabled,
    show_onscreen_debug_hud: input.showOnscreenDebugHud,
    response_verify_enabled: input.responseVerifyEnabled,
    response_verify_second_pass: input.responseVerifySecondPass,
    response_verify_model: input.responseVerifyModel.trim().slice(0, 64),
    named_ollama_hosts: input.namedOllamaHosts,
    voice_stt_model: input.voiceSttModel,
    ui_scale_auto_enabled: input.uiScaleAutoEnabled,
    ui_scale_manual_profile: input.uiScaleManualProfile,
    use_local_knowledge_base: input.useLocalKnowledgeBase,
    rag_corpus_path: input.ragCorpusPath,
    rag_corpus_version: input.ragCorpusVersion,
  };
  return patch ? { ...base, ...patch } : base;
}

/** QAM Performance verification line — sysfs is source of truth; QAM can lag. */
const QAM_VERIFY_SLIDER_LINE =
  "If QAM Performance sliders look stale, close and reopen the QAM Performance tab to verify values match the applied cap.";

/**
 * One short banner for the main tab when last Ask included tuning `applied` metadata.
 * TDP (sysfs) is distinguished from GPU MHz (advisory; not written by this plugin yet).
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
