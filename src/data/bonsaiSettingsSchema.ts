import {
  DEFAULT_AI_CHARACTER_ACCENT_INTENSITY,
  type AiCharacterAccentIntensityId,
} from "./aiCharacterAccentIntensity";
import type { AskModeId } from "./askMode";
import { DEFAULT_OLLAMA_KEEP_ALIVE, type OllamaKeepAliveDuration } from "./ollamaKeepAlive";
import { DEFAULT_REPLY_VERBOSITY, type ReplyVerbosityId } from "./replyVerbosity";
import { type ReplyLanguageId } from "./replyLanguage";

export { DEFAULT_REPLY_LANGUAGE, type ReplyLanguageId } from "./replyLanguage";
import {
  DEFAULT_MODEL_POLICY_TIER,
  type ModelPolicyTierId,
} from "./modelPolicy";
import { type UiScaleProfileId } from "./uiScaleProfile";

export type { UiScaleProfileId };
export type { AskModeId };
export type { OllamaKeepAliveDuration };
export type { ReplyVerbosityId };
export type { ModelPolicyTierId };
export { DEFAULT_OLLAMA_KEEP_ALIVE };
export { DEFAULT_REPLY_VERBOSITY };
export { DEFAULT_MODEL_POLICY_TIER };

export type UnifiedInputPersistenceMode = "persist_all" | "persist_search_only" | "no_persist";
export type DesktopAppLogLevel = "off" | "default" | "verbose";
export type PresetChipAnimation = "fade" | "carousel" | "static";
/** Legacy; migration maps to ScreenshotAttachmentPreset. */
export type ScreenshotMaxDimension = 1280 | 1920 | 3160;
export type ScreenshotAttachmentPreset = "low" | "mid" | "max";

/** High-impact capability toggles; keep keys aligned with backend `capabilities` and Permission Center UI. */
export type BonsaiCapabilities = {
  filesystem_write: boolean;
  hardware_control: boolean;
  media_library_access: boolean;
  steam_logs_read: boolean;
  external_navigation: boolean;
  /** Outbound Steam Web API (GetPlayerBans) for ``bonsai:vac-check``; key stored in settings. */
  steam_web_api: boolean;
  /** Local microphone capture for speech-to-text in the Ask bar. */
  microphone_access: boolean;
};

export type VoiceSttModelId = "tiny.en" | "base.en";

export type NamedOllamaHost = {
  label: string;
  host: string;
};

export type BonsaiSettings = {
  latency_warning_seconds: number;
  request_timeout_seconds: number;
  /** When true, stored warning/timeout apply; when false, defaults (60s / 180s) for Ask + Ollama. */
  latency_timeouts_custom_enabled: boolean;
  unified_input_persistence_mode: UnifiedInputPersistenceMode;
  /** Vision attachment downscale and JPEG quality preset. */
  screenshot_attachment_preset: ScreenshotAttachmentPreset;
  /** When true, append Ask and AI response lines to daily chat files under Desktop/bonsAI_logs (requires filesystem_write). */
  desktop_debug_note_auto_save: boolean;
  /** When true, append full Ask/Ollama transparency blocks to Desktop trace files (requires filesystem_write). */
  desktop_ask_verbose_logging: boolean;
  /** App activity log level written to Desktop/bonsAI_logs/bonsai-app-YYYY-MM-DD.log (requires filesystem_write). */
  desktop_app_log_level: DesktopAppLogLevel;
  /** When true (with Permissions → Steam/Proton log read), troubleshooting-style Asks attach bounded local log excerpts. */
  attach_proton_logs_when_troubleshooting: boolean;
  /** When true, troubleshooting Asks inject the per-game Proton experiment journal block. */
  include_proton_experiment_journal_when_troubleshooting: boolean;
  /** When true, fire-and-forget tiny-model thinking blurbs (Developer opt-in; default off). */
  thinking_status_tiny_model_enabled: boolean;
  /** @deprecated Prefer `preset_chip_animation`; kept for migration from older settings.json. */
  preset_chip_fade_animation_enabled: boolean;
  /** Main-tab preset chips: crossfade cycle, vertical carousel, or static rotation without opacity animation. */
  preset_chip_animation: PresetChipAnimation;
  /** When true, Ask input sanitizer lane is off (set via README magic phrases, not the Settings UI). */
  input_sanitizer_user_disabled: boolean;
  capabilities: BonsaiCapabilities;
  /** Opt-in character tone for model replies (system prompt augmentation on the backend). */
  ai_character_enabled: boolean;
  ai_character_random: boolean;
  /** Known catalog id when not using random/custom. */
  ai_character_preset_id: string;
  ai_character_custom_text: string;
  /** How strongly to lean into accent/dialect for character replies (backend system prompt). */
  ai_character_accent_intensity: AiCharacterAccentIntensityId;
  /** Main-tab Ask inference mode (ordered Ollama model fallbacks on the backend). */
  ask_mode: AskModeId;
  /** Ollama `keep_alive` for each Ask (how long the model stays in VRAM on the host after the request). */
  ollama_keep_alive: OllamaKeepAliveDuration;
  /** Global reply prose style (Short / Balanced / Detailed); Balanced = no verbosity inject. */
  reply_verbosity: ReplyVerbosityId;
  /** Ask reply language: follow Steam client, always English, or a fixed Steam language code. */
  reply_language: ReplyLanguageId;
  /** When true, show the Developer tab in the LB/RB strip (default off for typical users). */
  show_developer_tab: boolean;
  /** Which Ollama model families the backend may try (see README model policy). */
  model_policy_tier: ModelPolicyTierId;
  /** Tier 3 requires explicit acknowledgment for non-FOSS and unclassified tags. */
  model_policy_non_foss_unlocked: boolean;
  /** When true, append large-model tags to fallback chains (may exceed ~16GB VRAM). */
  model_allow_high_vram_fallbacks: boolean;
  /** User-ordered text model try order (empty = shipped defaults intersect installed). */
  text_model_routing_order: string[];
  /** User-ordered vision model try order (empty = shipped defaults intersect installed). */
  vision_model_routing_order: string[];
  /** When true, route Ollama to this device only (fixed 127.0.0.1:11434); LAN PC IP field ignored for Ask/Test. */
  ollama_local_on_deck: boolean;
  /** When false, Strategy ```bonsai-spoiler``` blocks render as visible text (no tap-to-reveal). Default on. */
  strategy_spoiler_masking_enabled: boolean;
  /** When true, spoiler blocks start expanded after the user consented on that Ask (still collapsible). */
  strategy_spoiler_auto_reveal_after_consent: boolean;
  /** Steam Web API key for GetPlayerBans (VAC check command); stored on device with plugin settings. */
  steam_web_api_key: string;
  /** When true, Main tab shows progressive Ollama token streaming (Developer tab opt-in). */
  bonsai_token_streaming_enabled: boolean;
  /** When true, show the translucent on-screen ingest debug HUD (Developer tab opt-in). */
  show_onscreen_debug_hud: boolean;
  /** Rule-based post-check on Ollama replies (Developer / advanced). */
  response_verify_enabled: boolean;
  /** Optional second-model verifier (default off). */
  response_verify_second_pass: boolean;
  /** Ollama tag for verifier second pass (empty disables the model call). */
  response_verify_model: string;
  /** Labeled ``host:port`` presets for quick Connection switching (max 4). */
  named_ollama_hosts: NamedOllamaHost[];
  /** Local whisper.cpp model for voice Ask (tiny.en default for Deck real-time). */
  voice_stt_model: VoiceSttModelId;
  /** When true, UI scale profile is chosen automatically from QAM viewport + display heuristics. */
  ui_scale_auto_enabled: boolean;
  /** Manual snap profile when ``ui_scale_auto_enabled`` is false. */
  ui_scale_manual_profile: UiScaleProfileId;
  /** When true, inject retrieved offline strategy/compat cards into Strategy/troubleshooting Asks. */
  use_local_knowledge_base: boolean;
  /** Absolute path to installed corpus directory (contains corpus.db). */
  rag_corpus_path: string;
  /** Installed corpus manifest version string. */
  rag_corpus_version: string;
};

/** Fields mirrored from React state / hook before `save_settings` RPC. */
export type BonsaiSettingsSnapshotInput = {
  latencyWarningSeconds: number;
  requestTimeoutSeconds: number;
  latencyTimeoutsCustomEnabled: boolean;
  unifiedInputPersistenceMode: UnifiedInputPersistenceMode;
  screenshotAttachmentPreset: ScreenshotAttachmentPreset;
  desktopDebugNoteAutoSave: boolean;
  desktopAskVerboseLogging: boolean;
  desktopAppLogLevel: DesktopAppLogLevel;
  attachProtonLogsWhenTroubleshooting: boolean;
  includeProtonExperimentJournalWhenTroubleshooting: boolean;
  thinkingStatusTinyModelEnabled: boolean;
  presetChipFadeAnimationEnabled: boolean;
  presetChipAnimation: PresetChipAnimation;
  inputSanitizerUserDisabled: boolean;
  capabilities: BonsaiCapabilities;
  aiCharacterEnabled: boolean;
  aiCharacterRandom: boolean;
  aiCharacterPresetId: string;
  aiCharacterCustomText: string;
  aiCharacterAccentIntensity: AiCharacterAccentIntensityId;
  askMode: AskModeId;
  ollamaKeepAlive: OllamaKeepAliveDuration;
  replyVerbosity: ReplyVerbosityId;
  replyLanguage: ReplyLanguageId;
  showDeveloperTab: boolean;
  modelPolicyTier: ModelPolicyTierId;
  modelPolicyNonFossUnlocked: boolean;
  modelAllowHighVramFallbacks: boolean;
  textModelRoutingOrder: string[];
  visionModelRoutingOrder: string[];
  ollamaLocalOnDeck: boolean;
  strategySpoilerMaskingEnabled: boolean;
  strategySpoilerAutoRevealAfterConsent: boolean;
  steamWebApiKey: string;
  bonsaiTokenStreamingEnabled: boolean;
  showOnscreenDebugHud: boolean;
  responseVerifyEnabled: boolean;
  responseVerifySecondPass: boolean;
  responseVerifyModel: string;
  namedOllamaHosts: NamedOllamaHost[];
  voiceSttModel: VoiceSttModelId;
  uiScaleAutoEnabled: boolean;
  uiScaleManualProfile: UiScaleProfileId;
  useLocalKnowledgeBase: boolean;
  ragCorpusPath: string;
  ragCorpusVersion: string;
};

export type AppliedResultLike = {
  tdp_watts: number | null;
  gpu_clock_mhz: number | null;
  errors: string[];
};

export const DEFAULT_LATENCY_WARNING_SECONDS = 60;
export const DEFAULT_REQUEST_TIMEOUT_SECONDS = 180;
export const MIN_LATENCY_WARNING_SECONDS = 5;
export const MAX_LATENCY_WARNING_SECONDS = 300;
export const MIN_REQUEST_TIMEOUT_SECONDS = 10;
export const MAX_REQUEST_TIMEOUT_SECONDS = 600;
export const LATENCY_WARNING_STEP_SECONDS = 5;
export const REQUEST_TIMEOUT_STEP_SECONDS = 10;
export const DEFAULT_UNIFIED_INPUT_PERSISTENCE_MODE: UnifiedInputPersistenceMode = "no_persist";
export const SCREENSHOT_ATTACHMENT_PRESET_OPTIONS: ScreenshotAttachmentPreset[] = ["low", "mid", "max"];
export const DEFAULT_SCREENSHOT_ATTACHMENT_PRESET: ScreenshotAttachmentPreset = "low";
/** @deprecated use DEFAULT_SCREENSHOT_ATTACHMENT_PRESET; kept for tests/migration. */
export const DEFAULT_SCREENSHOT_MAX_DIMENSION: ScreenshotMaxDimension = 1280;
export const DEFAULT_DESKTOP_DEBUG_NOTE_AUTO_SAVE = false;
export const DEFAULT_DESKTOP_ASK_VERBOSE_LOGGING = false;
export const DEFAULT_BONSAI_TOKEN_STREAMING_ENABLED = false;
export const DEFAULT_SHOW_ONSCREEN_DEBUG_HUD = false;
export const DEFAULT_RESPONSE_VERIFY_ENABLED = false;
export const DEFAULT_RESPONSE_VERIFY_SECOND_PASS = false;
export const DEFAULT_RESPONSE_VERIFY_MODEL = "";
export const RESPONSE_VERIFY_MODEL_MAX_LEN = 64;
export const MAX_NAMED_OLLAMA_HOSTS = 4;
export const DEFAULT_DESKTOP_APP_LOG_LEVEL: DesktopAppLogLevel = "off";
export const DESKTOP_APP_LOG_LEVEL_OPTIONS: DesktopAppLogLevel[] = ["off", "default", "verbose"];
export const DEFAULT_ATTACH_PROTON_LOGS_WHEN_TROUBLESHOOTING = false;
export const DEFAULT_INCLUDE_PROTON_EXPERIMENT_JOURNAL_WHEN_TROUBLESHOOTING = false;
export const DEFAULT_THINKING_STATUS_TINY_MODEL_ENABLED = false;
export const DEFAULT_PRESET_CHIP_FADE_ANIMATION_ENABLED = true;
export const DEFAULT_PRESET_CHIP_ANIMATION: PresetChipAnimation = "fade";
export const PRESET_CHIP_ANIMATION_OPTIONS: PresetChipAnimation[] = ["fade", "carousel", "static"];
export const DEFAULT_INPUT_SANITIZER_USER_DISABLED = false;
export const DEFAULT_SHOW_DEVELOPER_TAB = false;
/** Persisted routing: off = LAN PC IP text field applies; when on, Ask uses localhost Ollama on the Deck only. */
export const DEFAULT_OLLAMA_LOCAL_ON_DECK = false;
/** Fixed host:port for on-device Ollama (matches `refactor_helpers.DEFAULT_OLLAMA_*`). */
export const OLLAMA_LOCAL_ON_DECK_DEFAULT_PCIP = "127.0.0.1:11434";
export const DEFAULT_MODEL_POLICY_NON_FOSS_UNLOCKED = false;
export const DEFAULT_MODEL_ALLOW_HIGH_VRAM_FALLBACKS = false;
export const DEFAULT_ASK_MODE: AskModeId = "speed";
export const DEFAULT_STRATEGY_SPOILER_MASKING_ENABLED = true;
export const DEFAULT_STRATEGY_SPOILER_AUTO_REVEAL_AFTER_CONSENT = false;
/** Align with backend ``STEAM_WEB_API_KEY_MAX_LEN``. */
export const STEAM_WEB_API_KEY_MAX_LEN = 128;

export const DEFAULT_CAPABILITIES: BonsaiCapabilities = {
  filesystem_write: false,
  hardware_control: false,
  media_library_access: false,
  steam_logs_read: false,
  external_navigation: false,
  steam_web_api: false,
  microphone_access: false,
};

export const DEFAULT_VOICE_STT_MODEL: VoiceSttModelId = "tiny.en";
export const VOICE_STT_MODEL_OPTIONS: VoiceSttModelId[] = ["tiny.en", "base.en"];
export const DEFAULT_UI_SCALE_AUTO_ENABLED = true;
export const DEFAULT_UI_SCALE_MANUAL_PROFILE: UiScaleProfileId = "handheld";
export const DEFAULT_USE_LOCAL_KNOWLEDGE_BASE = false;
export const DEFAULT_RAG_CORPUS_PATH = "";
export const DEFAULT_RAG_CORPUS_VERSION = "";

export const DEFAULT_AI_CHARACTER_ENABLED = false;
export const DEFAULT_AI_CHARACTER_RANDOM = true;
export const DEFAULT_AI_CHARACTER_PRESET_ID = "";
export const DEFAULT_AI_CHARACTER_CUSTOM_TEXT = "";
export { DEFAULT_AI_CHARACTER_ACCENT_INTENSITY };
