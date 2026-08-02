"""Tests for bonsai-status stream instruction tone."""

import unittest

from backend.services.ollama_prompts import build_bonsai_status_stream_instruction


# The exact tone adjective gets rewritten whenever the blurb copy is refreshed
# (ff6547f swapped "sarcastic" for "disgruntled or dry-deadpan"). Assert the
# durable intent -- a wry, non-neutral tone is requested and sarcasm is not
# forbidden -- instead of pinning one word.
WRY_TONE_MARKERS = ("sarcas", "deadpan", "dry wit", "disgruntled", "wry")


class BonsaiStatusStreamInstructionTests(unittest.TestCase):
    def test_character_off_requests_wry_tone(self):
        text = build_bonsai_status_stream_instruction(
            app_name="Elden Ring",
            question_snippet="fps drop",
            character_roleplay_on=False,
        ).lower()
        self.assertNotIn("no sarcasm", text)
        self.assertTrue(
            any(marker in text for marker in WRY_TONE_MARKERS),
            f"expected a wry-tone directive in the character-off status line; got: {text}",
        )

    def test_strategy_spoiler_guardrail_preserved(self):
        text = build_bonsai_status_stream_instruction(
            ask_mode="strategy",
            character_roleplay_on=False,
        )
        self.assertIn("NEVER spoil", text)


if __name__ == "__main__":
    unittest.main()
