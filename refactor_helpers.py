"""Backward-compatible re-exports for tests and legacy imports.

Prefer ``backend.ollama_urls``, ``backend.ollama_routing``, and ``backend.tdp_intent`` in new code.
"""

from backend.constants import DEFAULT_OLLAMA_HOST, DEFAULT_OLLAMA_PORT
from backend.ollama_routing import (  # noqa: F401
    BLOCKED_PULL_CATALOG_TAGS,
    DEPRIORITIZED_OLLAMA_TAGS,
    TIER1_ESSENTIALS_PULL_TAGS,
    TIER2_MULTIMODAL_PULL_FALLBACK_TAG,
    TIER2_MULTIMODAL_PULL_TAGS,
    TEXT_MODELS_BY_MODE,
    VISION_MODELS_BY_MODE,
    build_effective_models_to_try,
    build_host_fallback_tail,
    build_initial_routing_order,
    default_text_routing_seed,
    default_vision_routing_seed,
    filter_models_to_installed,
    is_high_vram_tag,
    is_ollama_model_missing_error,
    is_valid_setup_pull_profile,
    is_vision_capable_tag,
    merge_pulled_tag,
    no_installed_routing_models_message,
    ollama_tag_is_deprioritized,
    remove_tag_from_routing_orders,
    resolve_routing_order,
    select_ollama_models,
    setup_recommended_pull_tags,
    sort_models_deprioritized_last,
    tier1_foss_recommended_pull_tags,
)
from backend.ollama_urls import build_ollama_chat_url, normalize_ollama_base
from backend.tdp_intent import is_current_tdp_read_intent, parse_tdp_recommendation

__all__ = [
    "DEFAULT_OLLAMA_HOST",
    "DEFAULT_OLLAMA_PORT",
    "BLOCKED_PULL_CATALOG_TAGS",
    "DEPRIORITIZED_OLLAMA_TAGS",
    "TIER1_ESSENTIALS_PULL_TAGS",
    "TIER2_MULTIMODAL_PULL_FALLBACK_TAG",
    "TIER2_MULTIMODAL_PULL_TAGS",
    "TEXT_MODELS_BY_MODE",
    "VISION_MODELS_BY_MODE",
    "build_effective_models_to_try",
    "build_ollama_chat_url",
    "filter_models_to_installed",
    "is_current_tdp_read_intent",
    "is_ollama_model_missing_error",
    "is_valid_setup_pull_profile",
    "no_installed_routing_models_message",
    "normalize_ollama_base",
    "ollama_tag_is_deprioritized",
    "parse_tdp_recommendation",
    "select_ollama_models",
    "setup_recommended_pull_tags",
    "sort_models_deprioritized_last",
    "tier1_foss_recommended_pull_tags",
]
