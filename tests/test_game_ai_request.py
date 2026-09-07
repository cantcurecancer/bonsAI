"""Tests for the raw TDP JSON block being stripped from a reply before it reaches a person.

Bug: a reply could end with the literal line the model used to signal a power suggestion,
e.g. ``{"tdp_watts": 5, "gpu_clock_mhz": 1200}``, sitting in the words a person reads. The
stripping itself is unit-tested directly against ``strip_tdp_recommendation_block``; the
wiring tests below confirm ``run_game_ai_request`` actually applies it to the reply a person
sees while the power suggestion feature that reads the same block keeps working.
"""

import asyncio
import sys
import types
import unittest

from backend.tdp_intent import strip_tdp_recommendation_block

if "decky" not in sys.modules:
    _decky = types.ModuleType("decky")
    _decky.DECKY_PLUGIN_SETTINGS_DIR = "/tmp"
    _decky.logger = types.SimpleNamespace(
        info=lambda *a, **k: None,
        warning=lambda *a, **k: None,
        error=lambda *a, **k: None,
        exception=lambda *a, **k: None,
    )
    sys.modules["decky"] = _decky

from backend.services.game_ai_request import run_game_ai_request


class StripTdpRecommendationBlockTests(unittest.TestCase):
    def test_removes_the_block_and_keeps_the_surrounding_words(self):
        text = (
            "Try dropping your TDP a bit for this game.\n"
            '{"tdp_watts": 5, "gpu_clock_mhz": 1200}'
        )
        result = strip_tdp_recommendation_block(text)
        self.assertNotIn("tdp_watts", result)
        self.assertIn("Try dropping your TDP a bit for this game.", result)

    def test_reply_with_no_block_is_byte_identical(self):
        text = "This game runs fine at the default power settings."
        self.assertEqual(strip_tdp_recommendation_block(text), text)

    def test_fenced_code_sample_the_person_asked_for_is_left_alone(self):
        text = (
            "Here is the JSON shape the assistant uses internally:\n\n"
            '```json\n{"tdp_watts": 10, "gpu_clock_mhz": 1000}\n```\n'
        )
        self.assertEqual(strip_tdp_recommendation_block(text), text)

    def test_empty_text_is_returned_unchanged(self):
        self.assertEqual(strip_tdp_recommendation_block(""), "")


class _FakePlugin:
    DEFAULT_REQUEST_TIMEOUT_SECONDS = 45

    def __init__(self, settings: dict):
        self._settings = settings
        self._ollama_result: dict = {}
        self.persisted_snapshots: list = []

    async def load_settings(self):
        return self._settings

    async def _try_handle_sanitizer_keyword_command(self, question, app_id):
        return None

    async def ask_ollama(self, *args, **kwargs):
        return self._ollama_result

    async def _persist_input_transparency(self, payload):
        self.persisted_snapshots.append(payload)


def _run(plugin: _FakePlugin, question: str = "How do I get better performance in this game?"):
    return asyncio.run(
        run_game_ai_request(
            plugin,
            question,
            "127.0.0.1:11434",
        )
    )


class TdpBlockWiringTests(unittest.TestCase):
    def _base_settings(self) -> dict:
        return {
            "latency_timeouts_custom_enabled": False,
            "input_sanitizer_user_disabled": False,
            "capabilities": {},
        }

    def test_raw_block_is_stripped_from_the_reply_a_person_sees(self):
        plugin = _FakePlugin(self._base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": (
                "Dropping your power draw should help with fan noise.\n"
                '{"tdp_watts": 5, "gpu_clock_mhz": 1200}'
            ),
            "model": "test-model",
        }

        result = _run(plugin)

        self.assertTrue(result.get("success"))
        self.assertNotIn("tdp_watts", result.get("response", ""))
        self.assertIn("help with fan noise", result.get("response", ""))

    def test_power_suggestion_still_reaches_the_caller(self):
        plugin = _FakePlugin(self._base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": (
                "Dropping your power draw should help with fan noise.\n"
                '{"tdp_watts": 5, "gpu_clock_mhz": 1200}'
            ),
            "model": "test-model",
        }

        result = _run(plugin)

        applied = result.get("applied") or {}
        suggestion = applied.get("suggestion") or {}
        self.assertEqual(suggestion.get("tdp_watts"), 5)
        self.assertEqual(suggestion.get("gpu_clock_mhz"), 1200)

    def test_reply_with_no_block_is_byte_identical(self):
        plugin = _FakePlugin(self._base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": "This game runs fine at the default power settings.",
            "model": "test-model",
        }

        result = _run(plugin)

        self.assertEqual(
            result.get("response"), "This game runs fine at the default power settings."
        )


if __name__ == "__main__":
    unittest.main()
