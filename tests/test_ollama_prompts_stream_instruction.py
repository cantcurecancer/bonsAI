"""Tests for bonsai-status stream instruction tone."""

import unittest

from backend.services.ollama_prompts import build_bonsai_status_stream_instruction


class BonsaiStatusStreamInstructionTests(unittest.TestCase):
    def test_character_off_encourages_playful_sarcasm(self):
        text = build_bonsai_status_stream_instruction(
            app_name="Elden Ring",
            question_snippet="fps drop",
            character_roleplay_on=False,
        )
        self.assertNotIn("no sarcasm", text.lower())
        self.assertIn("sarcastic", text.lower())

    def test_strategy_spoiler_guardrail_preserved(self):
        text = build_bonsai_status_stream_instruction(
            ask_mode="strategy",
            character_roleplay_on=False,
        )
        self.assertIn("NEVER spoil", text)


if __name__ == "__main__":
    unittest.main()
