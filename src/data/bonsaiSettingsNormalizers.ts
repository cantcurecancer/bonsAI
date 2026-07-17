import {
  AI_CHARACTER_ACCENT_INTENSITY_IDS,
  DEFAULT_AI_CHARACTER_ACCENT_INTENSITY,
  type AiCharacterAccentIntensityId,
} from "./aiCharacterAccentIntensity";
import { ASK_MODE_IDS, type AskModeId } from "./askMode";
import {
  DEFAULT_REPLY_VERBOSITY,
  isReplyVerbosityId,
  type ReplyVerbosityId,
} from "./replyVerbosity";
import {
  DEFAULT_OLLAMA_KEEP_ALIVE,
  isOllamaKeepAliveDuration,
  type OllamaKeepAliveDuration,
} from "./ollamaKeepAlive";
import { AI_CHARACTER_CUSTOM_TEXT_MAX, isValidPresetId } from "./characterCatalog";
import {
  normalizeModelPolicyNonFossUnlocked,
  normalizeModelPolicyTier,
  type ModelPolicyTierId,
} from "./modelPolicy";
import { normalizeUiScaleProfileId } from "./uiScaleProfile";
import {
  DEFAULT_AI_CHARACTER_CUSTOM_TEXT,
  DEFAULT_AI_CHARACTER_PRESET_ID,
  DEFAULT_AI_CHARACTER_RANDOM,
  DEFAULT_ASK_MODE,
  DEFAULT_DESKTOP_APP_LOG_LEVEL,
  DEFAULT_LATENCY_WARNING_SECONDS,
  DEFAULT_OLLAMA_LOCAL_ON_DECK,
  DEFAULT_PRESET_CHIP_ANIMATION,
  DEFAULT_PRESET_CHIP_FADE_ANIMATION_ENABLED,
  DEFAULT_REQUEST_TIMEOUT_SECONDS,
  DEFAULT_RESPONSE_VERIFY_MODEL,
  DEFAULT_SCREENSHOT_ATTACHMENT_PRESET,
  DEFAULT_SCREENSHOT_MAX_DIMENSION,
  DEFAULT_STRATEGY_SPOILER_MASKING_ENABLED,
  DEFAULT_UNIFIED_INPUT_PERSISTENCE_MODE,
  DEFAULT_VOICE_STT_MODEL,
  LATENCY_WARNING_STEP_SECONDS,
  MAX_LATENCY_WARNING_SECONDS,
  MAX_NAMED_OLLAMA_HOSTS,
  MAX_REQUEST_TIMEOUT_SECONDS,
  MIN_LATENCY_WARNING_SECONDS,
  MIN_REQUEST_TIMEOUT_SECONDS,
  PRESET_CHIP_ANIMATION_OPTIONS,
  REQUEST_TIMEOUT_STEP_SECONDS,
  RESPONSE_VERIFY_MODEL_MAX_LEN,
  STEAM_WEB_API_KEY_MAX_LEN,
  VOICE_STT_MODEL_OPTIONS,
  type BonsaiCapabilities,
  type BonsaiSettings,
  type DesktopAppLogLevel,
  type NamedOllamaHost,
  type PresetChipAnimation,
  type ScreenshotAttachmentPreset,
  type ScreenshotMaxDimension,
  type UnifiedInputPersistenceMode,
  type VoiceSttModelId,
} from "./bonsaiSettingsSchema";

/** Tier ``non_foss`` without explicit unlock collapses to ``open_weight`` so we never persist an illegal pair. */
function reconcileModelPolicySettings(
  tierRaw: unknown,
  unlockRaw: unknown,
): { model_policy_tier: ModelPolicyTierId; model_policy_non_foss_unlocked: boolean } {
  const tier = normalizeModelPolicyTier(tierRaw);
  const unlock = normalizeModelPolicyNonFossUnlocked(unlockRaw);
  if (tier !== "non_foss") {
    return { model_policy_tier: tier, model_policy_non_foss_unlocked: false };
  }
  if (!unlock) {
    return { model_policy_tier: "open_weight", model_policy_non_foss_unlocked: false };
  }
  return { model_policy_tier: "non_foss", model_policy_non_foss_unlocked: true };
}

function clampNumber(value: unknown, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.max(minimum, Math.min(maximum, rounded));
}

function snapToStep(value: number, minimum: number, maximum: number, step: number): number {
  const clamped = Math.max(minimum, Math.min(maximum, value));
  const offset = clamped - minimum;
  const snapped = minimum + Math.round(offset / step) * step;
  return Math.max(minimum, Math.min(maximum, snapped));
}

export function normalizeLatencyWarningSeconds(
  value: unknown,
  fallback: number = DEFAULT_LATENCY_WARNING_SECONDS,
): number {
  const clamped = clampNumber(value, fallback, MIN_LATENCY_WARNING_SECONDS, MAX_LATENCY_WARNING_SECONDS);
  return snapToStep(clamped, MIN_LATENCY_WARNING_SECONDS, MAX_LATENCY_WARNING_SECONDS, LATENCY_WARNING_STEP_SECONDS);
}

export function normalizeRequestTimeoutSeconds(
  value: unknown,
  fallback: number = DEFAULT_REQUEST_TIMEOUT_SECONDS,
): number {
  const clamped = clampNumber(value, fallback, MIN_REQUEST_TIMEOUT_SECONDS, MAX_REQUEST_TIMEOUT_SECONDS);
  return snapToStep(clamped, MIN_REQUEST_TIMEOUT_SECONDS, MAX_REQUEST_TIMEOUT_SECONDS, REQUEST_TIMEOUT_STEP_SECONDS);
}

/**
 * Normalize warning + timeout independently, then enforce strict ordering (warning &lt; timeout).
 * Prefers raising the timeout on conflicts; if that hits max, lowers the warning instead.
 */
export function reconcileLatencyWarningAndTimeout(
  warningRaw: unknown,
  timeoutRaw: unknown,
): { latency_warning_seconds: number; request_timeout_seconds: number } {
  let warning = normalizeLatencyWarningSeconds(warningRaw, DEFAULT_LATENCY_WARNING_SECONDS);
  let timeout = normalizeRequestTimeoutSeconds(timeoutRaw, DEFAULT_REQUEST_TIMEOUT_SECONDS);

  if (warning < timeout) {
    return { latency_warning_seconds: warning, request_timeout_seconds: timeout };
  }

  let t = timeout;
  while (warning >= t && t < MAX_REQUEST_TIMEOUT_SECONDS) {
    t += REQUEST_TIMEOUT_STEP_SECONDS;
  }
  t = Math.min(t, MAX_REQUEST_TIMEOUT_SECONDS);
  t = normalizeRequestTimeoutSeconds(t, timeout);
  if (warning < t) {
    return { latency_warning_seconds: warning, request_timeout_seconds: t };
  }

  let w = warning;
  while (w >= t && w > MIN_LATENCY_WARNING_SECONDS) {
    w -= LATENCY_WARNING_STEP_SECONDS;
  }
  w = normalizeLatencyWarningSeconds(w, warning);
  if (w >= t) {
    w = Math.max(
      MIN_LATENCY_WARNING_SECONDS,
      Math.min(MAX_LATENCY_WARNING_SECONDS, t - LATENCY_WARNING_STEP_SECONDS),
    );
    w = snapToStep(w, MIN_LATENCY_WARNING_SECONDS, MAX_LATENCY_WARNING_SECONDS, LATENCY_WARNING_STEP_SECONDS);
  }
  return { latency_warning_seconds: w, request_timeout_seconds: t };
}

export function normalizeUnifiedInputPersistenceMode(value: unknown): UnifiedInputPersistenceMode {
  if (value === "persist_all" || value === "persist_search_only" || value === "no_persist") {
    return value;
  }
  return DEFAULT_UNIFIED_INPUT_PERSISTENCE_MODE;
}

export function normalizeScreenshotMaxDimension(value: unknown): ScreenshotMaxDimension {
  if (value === 1920 || value === 3160) {
    return value;
  }
  return DEFAULT_SCREENSHOT_MAX_DIMENSION;
}

export function normalizeScreenshotAttachmentPreset(
  data: Record<string, unknown> | null | undefined,
): ScreenshotAttachmentPreset {
  if (!data) {
    return DEFAULT_SCREENSHOT_ATTACHMENT_PRESET;
  }
  const direct = data.screenshot_attachment_preset;
  if (direct === "low" || direct === "mid" || direct === "max") {
    return direct;
  }
  const leg = data.screenshot_max_dimension;
  if (leg === 1920 || leg === "1920") return "mid";
  if (leg === 3160 || leg === "3160") return "max";
  return DEFAULT_SCREENSHOT_ATTACHMENT_PRESET;
}

export function normalizeLatencyTimeoutsCustomEnabled(value: unknown): boolean {
  return value === true;
}

export function normalizeDesktopDebugNoteAutoSave(value: unknown): boolean {
  return value === true;
}

export function normalizeDesktopAskVerboseLogging(value: unknown): boolean {
  return value === true;
}

export function normalizeBonsaiTokenStreamingEnabled(value: unknown): boolean {
  return value === true;
}

export function normalizeShowOnscreenDebugHud(value: unknown): boolean {
  return value === true;
}

export function normalizeResponseVerifyEnabled(value: unknown): boolean {
  return value === true;
}

export function normalizeResponseVerifySecondPass(value: unknown): boolean {
  return value === true;
}

const RESPONSE_VERIFY_MODEL_RE = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,63}$/;

export function normalizeResponseVerifyModel(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_RESPONSE_VERIFY_MODEL;
  const tag = value.trim().slice(0, RESPONSE_VERIFY_MODEL_MAX_LEN);
  if (!tag || !RESPONSE_VERIFY_MODEL_RE.test(tag)) return DEFAULT_RESPONSE_VERIFY_MODEL;
  return tag;
}

export function normalizeNamedOllamaHosts(value: unknown): NamedOllamaHost[] {
  if (!Array.isArray(value)) return [];
  const out: NamedOllamaHost[] = [];
  for (const item of value) {
    if (out.length >= MAX_NAMED_OLLAMA_HOSTS) break;
    if (!item || typeof item !== "object") continue;
    const rec = item as { label?: unknown; host?: unknown };
    if (typeof rec.label !== "string" || typeof rec.host !== "string") continue;
    const label = rec.label.trim().slice(0, 32);
    const host = rec.host.trim().slice(0, 128);
    if (!label || !host) continue;
    out.push({ label, host });
  }
  return out;
}

export function normalizeDesktopAppLogLevel(value: unknown): DesktopAppLogLevel {
  if (value === "off" || value === "default" || value === "verbose") {
    return value;
  }
  return DEFAULT_DESKTOP_APP_LOG_LEVEL;
}

export function normalizeAttachProtonLogsWhenTroubleshooting(value: unknown): boolean {
  return value === true;
}

export function normalizeIncludeProtonExperimentJournalWhenTroubleshooting(value: unknown): boolean {
  return value === true;
}

export function normalizeThinkingStatusTinyModelEnabled(value: unknown): boolean {
  return value === true;
}

export function normalizePresetChipFadeAnimationEnabled(value: unknown): boolean {
  if (value === false) return false;
  return DEFAULT_PRESET_CHIP_FADE_ANIMATION_ENABLED;
}

export function normalizePresetChipAnimation(
  value: unknown,
  legacyFadeEnabled: unknown,
): PresetChipAnimation {
  if (typeof value === "string") {
    const t = value.trim() as PresetChipAnimation;
    if (PRESET_CHIP_ANIMATION_OPTIONS.includes(t)) return t;
  }
  if (legacyFadeEnabled === false) return "static";
  return DEFAULT_PRESET_CHIP_ANIMATION;
}

export function normalizeInputSanitizerUserDisabled(value: unknown): boolean {
  return value === true;
}

export function normalizeShowDeveloperTab(value: unknown, legacyShowDebugTab?: unknown): boolean {
  if (value === true) return true;
  if (legacyShowDebugTab === true) return true;
  return false;
}

export function normalizeModelAllowHighVramFallbacks(value: unknown): boolean {
  return value === true;
}

export function normalizeOllamaLocalOnDeck(value: unknown): boolean {
  if (value === undefined || value === null) {
    return DEFAULT_OLLAMA_LOCAL_ON_DECK;
  }
  return value === true;
}

export function normalizeStrategySpoilerMaskingEnabled(value: unknown): boolean {
  if (value === false) return false;
  return DEFAULT_STRATEGY_SPOILER_MASKING_ENABLED;
}

export function normalizeStrategySpoilerAutoRevealAfterConsent(value: unknown): boolean {
  return value === true;
}

export function normalizeSteamWebApiKey(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, STEAM_WEB_API_KEY_MAX_LEN);
}

const _askModeSet = new Set<string>(ASK_MODE_IDS);

export function normalizeAskMode(value: unknown): AskModeId {
  if (value === "deep") {
    return "expert";
  }
  if (typeof value === "string" && _askModeSet.has(value)) {
    return value as AskModeId;
  }
  return DEFAULT_ASK_MODE;
}

export function normalizeOllamaKeepAlive(value: unknown): OllamaKeepAliveDuration {
  if (typeof value === "string" && isOllamaKeepAliveDuration(value)) {
    return value;
  }
  return DEFAULT_OLLAMA_KEEP_ALIVE;
}

export function normalizeReplyVerbosity(value: unknown): ReplyVerbosityId {
  if (typeof value === "string" && isReplyVerbosityId(value)) {
    return value;
  }
  return DEFAULT_REPLY_VERBOSITY;
}

export function normalizeAiCharacterEnabled(value: unknown): boolean {
  return value === true;
}

export function normalizeAiCharacterRandom(value: unknown): boolean {
  if (value === false) return false;
  if (value === true) return true;
  return DEFAULT_AI_CHARACTER_RANDOM;
}

export function normalizeAiCharacterPresetId(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_AI_CHARACTER_PRESET_ID;
  const t = value.trim();
  if (!t || !isValidPresetId(t)) return DEFAULT_AI_CHARACTER_PRESET_ID;
  return t;
}

export function normalizeAiCharacterCustomText(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_AI_CHARACTER_CUSTOM_TEXT;
  let s = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!s) return DEFAULT_AI_CHARACTER_CUSTOM_TEXT;
  if (s.length > AI_CHARACTER_CUSTOM_TEXT_MAX) s = s.slice(0, AI_CHARACTER_CUSTOM_TEXT_MAX);
  return s;
}

const _accentIntensitySet = new Set<string>(AI_CHARACTER_ACCENT_INTENSITY_IDS);

export function normalizeAiCharacterAccentIntensity(value: unknown): AiCharacterAccentIntensityId {
  if (typeof value !== "string") return DEFAULT_AI_CHARACTER_ACCENT_INTENSITY;
  const t = value.trim();
  if (_accentIntensitySet.has(t)) return t as AiCharacterAccentIntensityId;
  return DEFAULT_AI_CHARACTER_ACCENT_INTENSITY;
}

export function normalizeCapabilities(value: unknown): BonsaiCapabilities {
  const raw =
    typeof value === "object" && value !== null ? (value as Partial<BonsaiCapabilities>) : {};
  return {
    filesystem_write: raw.filesystem_write === true,
    hardware_control: raw.hardware_control === true,
    media_library_access: raw.media_library_access === true,
    steam_logs_read: raw.steam_logs_read === true,
    external_navigation: raw.external_navigation === true,
    steam_web_api: raw.steam_web_api === true,
    microphone_access: raw.microphone_access === true,
  };
}

export function normalizeVoiceSttModel(value: unknown): VoiceSttModelId {
  if (typeof value === "string" && (VOICE_STT_MODEL_OPTIONS as string[]).includes(value.trim())) {
    return value.trim() as VoiceSttModelId;
  }
  return DEFAULT_VOICE_STT_MODEL;
}

export function normalizeUiScaleAutoEnabled(value: unknown): boolean {
  return value !== false;
}

export function normalizeSettings(data: unknown): BonsaiSettings {
  const raw = typeof data === "object" && data !== null ? (data as Partial<BonsaiSettings>) : {};
  const latencyTimeout = reconcileLatencyWarningAndTimeout(
    raw.latency_warning_seconds ?? DEFAULT_LATENCY_WARNING_SECONDS,
    raw.request_timeout_seconds ?? DEFAULT_REQUEST_TIMEOUT_SECONDS,
  );
  const modelPolicy = reconcileModelPolicySettings(raw.model_policy_tier, raw.model_policy_non_foss_unlocked);
  const rawRecord =
    typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined;
  return {
    latency_warning_seconds: latencyTimeout.latency_warning_seconds,
    request_timeout_seconds: latencyTimeout.request_timeout_seconds,
    latency_timeouts_custom_enabled: normalizeLatencyTimeoutsCustomEnabled(raw.latency_timeouts_custom_enabled),
    unified_input_persistence_mode: normalizeUnifiedInputPersistenceMode(raw.unified_input_persistence_mode),
    screenshot_attachment_preset: normalizeScreenshotAttachmentPreset(rawRecord),
    desktop_debug_note_auto_save: normalizeDesktopDebugNoteAutoSave(raw.desktop_debug_note_auto_save),
    desktop_ask_verbose_logging: normalizeDesktopAskVerboseLogging(raw.desktop_ask_verbose_logging),
    desktop_app_log_level: normalizeDesktopAppLogLevel(raw.desktop_app_log_level),
    attach_proton_logs_when_troubleshooting: normalizeAttachProtonLogsWhenTroubleshooting(
      raw.attach_proton_logs_when_troubleshooting,
    ),
    include_proton_experiment_journal_when_troubleshooting:
      normalizeIncludeProtonExperimentJournalWhenTroubleshooting(
        raw.include_proton_experiment_journal_when_troubleshooting,
      ),
    thinking_status_tiny_model_enabled: normalizeThinkingStatusTinyModelEnabled(
      raw.thinking_status_tiny_model_enabled,
    ),
    preset_chip_animation: normalizePresetChipAnimation(
      raw.preset_chip_animation,
      raw.preset_chip_fade_animation_enabled,
    ),
    preset_chip_fade_animation_enabled:
      normalizePresetChipAnimation(raw.preset_chip_animation, raw.preset_chip_fade_animation_enabled) === "fade",
    input_sanitizer_user_disabled: normalizeInputSanitizerUserDisabled(raw.input_sanitizer_user_disabled),
    capabilities: normalizeCapabilities(raw.capabilities),
    ai_character_enabled: normalizeAiCharacterEnabled(raw.ai_character_enabled),
    ai_character_random: normalizeAiCharacterRandom(raw.ai_character_random),
    ai_character_preset_id: normalizeAiCharacterPresetId(raw.ai_character_preset_id),
    ai_character_custom_text: normalizeAiCharacterCustomText(raw.ai_character_custom_text),
    ai_character_accent_intensity: normalizeAiCharacterAccentIntensity(raw.ai_character_accent_intensity),
    ask_mode: normalizeAskMode(raw.ask_mode),
    ollama_keep_alive: normalizeOllamaKeepAlive(raw.ollama_keep_alive),
    reply_verbosity: normalizeReplyVerbosity(raw.reply_verbosity),
    show_developer_tab: normalizeShowDeveloperTab(raw.show_developer_tab, rawRecord?.show_debug_tab),
    model_policy_tier: modelPolicy.model_policy_tier,
    model_policy_non_foss_unlocked: modelPolicy.model_policy_non_foss_unlocked,
    model_allow_high_vram_fallbacks: normalizeModelAllowHighVramFallbacks(raw.model_allow_high_vram_fallbacks),
    ollama_local_on_deck: normalizeOllamaLocalOnDeck(raw.ollama_local_on_deck),
    strategy_spoiler_masking_enabled: normalizeStrategySpoilerMaskingEnabled(raw.strategy_spoiler_masking_enabled),
    strategy_spoiler_auto_reveal_after_consent: normalizeStrategySpoilerAutoRevealAfterConsent(
      raw.strategy_spoiler_auto_reveal_after_consent,
    ),
    steam_web_api_key: normalizeSteamWebApiKey(raw.steam_web_api_key),
    bonsai_token_streaming_enabled: normalizeBonsaiTokenStreamingEnabled(raw.bonsai_token_streaming_enabled),
    show_onscreen_debug_hud: normalizeShowOnscreenDebugHud(raw.show_onscreen_debug_hud),
    response_verify_enabled: normalizeResponseVerifyEnabled(raw.response_verify_enabled),
    response_verify_second_pass: normalizeResponseVerifySecondPass(raw.response_verify_second_pass),
    response_verify_model: normalizeResponseVerifyModel(raw.response_verify_model),
    named_ollama_hosts: normalizeNamedOllamaHosts(raw.named_ollama_hosts),
    voice_stt_model: normalizeVoiceSttModel(raw.voice_stt_model),
    ui_scale_auto_enabled: normalizeUiScaleAutoEnabled(raw.ui_scale_auto_enabled),
    ui_scale_manual_profile: normalizeUiScaleProfileId(raw.ui_scale_manual_profile),
    use_local_knowledge_base: raw.use_local_knowledge_base === true,
    rag_corpus_path: typeof raw.rag_corpus_path === "string" ? raw.rag_corpus_path.trim().slice(0, 512) : "",
    rag_corpus_version:
      typeof raw.rag_corpus_version === "string" ? raw.rag_corpus_version.trim().slice(0, 64) : "",
  };
}
