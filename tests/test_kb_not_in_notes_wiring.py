"""Tests that run_game_ai_request actually appends the "not in my notes" attribution line to
the reply the user (and transparency) sees -- not just that the decision function works in
isolation. See tests/test_kb_not_in_notes_notice.py for the module's own unit tests.
"""

import asyncio
import sys
import types
import unittest
from unittest.mock import patch

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
from backend.services.knowledge_base_service import KbCoverageSummary, KnowledgeRetrievalResult

_NOT_IN_NOTES_TEXT = "Not in my notes — this answer is from the model's own knowledge."


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


def _run(plugin: _FakePlugin, ask_mode: str, question: str = "How do I beat the third boss?"):
    return asyncio.run(
        run_game_ai_request(
            plugin,
            question,
            "127.0.0.1:11434",
            app_id="570",
            app_name="Dota 2",
            ask_mode=ask_mode,
        )
    )


def _base_settings() -> dict:
    return {
        "latency_timeouts_custom_enabled": False,
        "input_sanitizer_user_disabled": False,
        "capabilities": {},
        "use_local_knowledge_base": True,
    }


class NotInNotesWiringTests(unittest.TestCase):
    # Coverage says the corpus has sections for the running game, but retrieval found nothing
    # worth attaching -- this is the "covered game, no match" case the notice exists for.
    @patch(
        "backend.services.game_ai_request.summarize_kb_coverage",
        return_value=KbCoverageSummary(status="sections", section_count=4),
    )
    @patch(
        "backend.services.game_ai_request.retrieve_knowledge_context",
        return_value=KnowledgeRetrievalResult(attached=False, unavailable_reason="no_match"),
    )
    def test_covered_game_no_match_appends_the_notice(self, _retrieve, _coverage):
        plugin = _FakePlugin(_base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": "Focus down the adds first, then burst the boss.",
            "model": "test-model",
        }

        result = _run(plugin, ask_mode="strategy")

        self.assertIn(_NOT_IN_NOTES_TEXT, result.get("response", ""))
        # Reaches the transparency snapshot Show Details reads, same as the model text does.
        self.assertEqual(len(plugin.persisted_snapshots), 1)
        self.assertIn(
            _NOT_IN_NOTES_TEXT, plugin.persisted_snapshots[0].get("final_response", "")
        )

    # Same coverage, but this time a note actually attached -- no notice.
    @patch(
        "backend.services.game_ai_request.summarize_kb_coverage",
        return_value=KbCoverageSummary(status="sections", section_count=4),
    )
    @patch(
        "backend.services.game_ai_request.retrieve_knowledge_context",
        return_value=KnowledgeRetrievalResult(
            attached=True,
            text_block="Boss note: focus the adds first.",
            trust_tier="wiki",
            sources=[{"title": "Wiki"}],
        ),
    )
    def test_covered_game_with_match_shows_no_notice(self, _retrieve, _coverage):
        plugin = _FakePlugin(_base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": "Focus down the adds first, then burst the boss.",
            "model": "test-model",
        }

        result = _run(plugin, ask_mode="strategy")

        self.assertNotIn(_NOT_IN_NOTES_TEXT, result.get("response", ""))

    # Speed never shows the line, even with the two other signals qualifying.
    @patch(
        "backend.services.game_ai_request.summarize_kb_coverage",
        return_value=KbCoverageSummary(status="sections", section_count=4),
    )
    @patch(
        "backend.services.game_ai_request.retrieve_knowledge_context",
        return_value=KnowledgeRetrievalResult(attached=False, unavailable_reason="no_match"),
    )
    def test_speed_mode_shows_no_notice(self, _retrieve, _coverage):
        plugin = _FakePlugin(_base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": "Focus down the adds first, then burst the boss.",
            "model": "test-model",
        }

        result = _run(plugin, ask_mode="speed")

        self.assertNotIn(_NOT_IN_NOTES_TEXT, result.get("response", ""))

    # Library off: summarize_kb_coverage's real behaviour (no patch needed) is kb_off before it
    # ever touches the corpus, and should_retrieve_knowledge skips retrieval outright.
    def test_library_off_shows_no_notice(self):
        settings = _base_settings()
        settings["use_local_knowledge_base"] = False
        plugin = _FakePlugin(settings)
        plugin._ollama_result = {
            "success": True,
            "response": "Focus down the adds first, then burst the boss.",
            "model": "test-model",
        }

        result = _run(plugin, ask_mode="strategy")

        self.assertNotIn(_NOT_IN_NOTES_TEXT, result.get("response", ""))

    # Uncovered game: no corpus configured, so summarize_kb_coverage's real behaviour returns
    # corpus_missing (never "sections") without needing a patch.
    def test_uncovered_game_shows_no_notice(self):
        plugin = _FakePlugin(_base_settings())
        plugin._ollama_result = {
            "success": True,
            "response": "Focus down the adds first, then burst the boss.",
            "model": "test-model",
        }

        result = _run(plugin, ask_mode="strategy")

        self.assertNotIn(_NOT_IN_NOTES_TEXT, result.get("response", ""))


if __name__ == "__main__":
    unittest.main()
