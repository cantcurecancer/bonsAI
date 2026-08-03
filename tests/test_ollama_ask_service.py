"""Unit tests for ``ollama_ask_service`` (mocked; no live Ollama)."""

from __future__ import annotations

import sys
import types
import unittest
from typing import Any
from unittest.mock import patch

if "decky" not in sys.modules:
    _decky = types.ModuleType("decky")
    _decky.logger = types.SimpleNamespace(
        info=lambda *a, **k: None,
        warning=lambda *a, **k: None,
        error=lambda *a, **k: None,
        exception=lambda *a, **k: None,
    )
    sys.modules["decky"] = _decky

if "pwd" not in sys.modules:
    _pwd = types.ModuleType("pwd")
    _pwd.getpwuid = lambda _uid: types.SimpleNamespace(pw_dir="/tmp")
    sys.modules["pwd"] = _pwd

from backend.services.ollama_ask_service import run_ask_ollama


class _FakePlugin:
    DEFAULT_REQUEST_TIMEOUT_SECONDS = 180

    def __init__(self) -> None:
        self._background_state: dict[str, Any] = {"request_id": None, "status": "idle"}
        self._active_ollama_chat_pc_ip = None
        self._active_ollama_chat_model = None
        self._active_ollama_chat_http_response = None
        self._chat_resp_ready_evt = None
        self._settings = {
            "model_policy_tier": "open_source_only",
            "model_policy_non_foss_unlocked": False,
            "model_allow_high_vram_fallbacks": False,
            "screenshot_attachment_preset": "low",
            "ai_character_enabled": False,
            "bonsai_token_streaming_enabled": False,
            "ollama_keep_alive": "",
        }

    def _active_request_id(self) -> None:
        return None

    def _build_ollama_chat_url(self, pc_ip: str) -> str:
        return f"http://{pc_ip}/api/chat"

    async def load_settings(self) -> dict[str, Any]:
        return dict(self._settings)

    @staticmethod
    def _sanitize_attachments(raw: Any) -> list:
        return list(raw or [])

    def _build_system_prompt(self, *args: Any, **kwargs: Any) -> str:
        return "system prompt"

    async def _maybe_app_log(self, *args: Any, **kwargs: Any) -> None:
        return None

    def _abort_ollama_chat_check(self) -> bool:
        return False

    def _publish_thinking_phase_key(self, *args: Any, **kwargs: Any) -> None:
        return None

    def _update_partial_response(self, *args: Any, **kwargs: Any) -> None:
        return None


class OllamaAskServiceTests(unittest.IsolatedAsyncioTestCase):
    """Ask model fallback advances when the first tag is missing locally."""

    async def test_ask_model_fallback_skips_missing_model(self) -> None:
        plugin = _FakePlugin()
        call_models: list[str] = []

        def fake_post_ollama_chat(
            url: str,
            model_name: str,
            messages: list,
            request_timeout_seconds: int,
            *args: Any,
            **kwargs: Any,
        ) -> dict[str, Any]:
            call_models.append(model_name)
            if model_name == "qwen2.5vl:3b":
                return {
                    "success": False,
                    "status": 404,
                    "body": '{"error":"model not found"}',
                    "response": "model missing",
                }
            return {
                "success": True,
                "status": 200,
                "model": model_name,
                "response": "fallback ok",
                "assistant_raw": "fallback ok",
            }

        with (
            patch(
                "backend.services.ollama_ask_service.list_installed_ollama_tags",
                return_value=["qwen2.5vl:3b", "qwen2.5:3b"],
            ),
            patch(
                "backend.services.ollama_ask_service.probe_ollama_http_ok",
                return_value=True,
            ),
            patch(
                "backend.services.screenshot_media.prepare_attachment_images",
                return_value=([], [], []),
            ),
            patch(
                "backend.services.ollama_ask_service.post_ollama_chat",
                side_effect=fake_post_ollama_chat,
            ),
        ):
            out = await run_ask_ollama(
                plugin,
                "hello",
                "127.0.0.1:11434",
                "",
                "",
                request_timeout_seconds=30,
            )

        self.assertTrue(out.get("success"))
        self.assertEqual(out.get("model"), "qwen2.5:3b")
        self.assertEqual(call_models, ["qwen2.5vl:3b", "qwen2.5:3b"])
        diag = out.get("ask_diagnostics") or {}
        self.assertEqual(diag.get("model_succeeded"), "qwen2.5:3b")
        self.assertEqual(diag.get("routing_strategy"), "installed_in_policy_chain")


if __name__ == "__main__":
    unittest.main()
